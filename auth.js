/* ===================================================
   auth.js — Auth with Login (localStorage-backed)
   =================================================== */

let currentUser = null;

/* ---- Helpers ---- */
const STORAGE_KEYS = {
  users: "must_quality_users",
  currentUser: "must_quality_current_user",
  courseReports: "must_quality_course_reports",
  qualityReports: "must_quality_quality_reports",
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  let users = loadFromStorage(STORAGE_KEYS.users, []);
  // If not an array or empty, create defaults
  if (!Array.isArray(users) || users.length === 0) {
    users = [
      {
        id: Date.now(),
        name: "Admin",
        email: "admin@must.edu",
        password: "admin1234",
        role: "admin",
      },
      {
        id: Date.now() + 1,
        name: "Viewer",
        email: "viewer@must.edu",
        password: "viewer1234",
        role: "viewer",
      },
    ];
    saveToStorage(STORAGE_KEYS.users, users);
  }
  return users;
}

async function loadAllReports() {
  if (!currentUser) {
    courseFileReports = [];
    qualityStandardsReports = [];
    updateStatCount();
    return;
  }
  try {
    const [cfRes, qsRes] = await Promise.all([
      fetch("/api/course-file", { credentials: "include" }),
      fetch("/api/quality-standards", { credentials: "include" }),
    ]);
    if (cfRes.ok) {
      courseFileReports = await cfRes.json();
    } else if (cfRes.status === 403) {
      courseFileReports = [];
    } else {
      courseFileReports = loadFromStorage(STORAGE_KEYS.courseReports, []);
    }
    if (qsRes.ok) {
      qualityStandardsReports = await qsRes.json();
    } else if (qsRes.status === 403) {
      qualityStandardsReports = [];
    } else {
      qualityStandardsReports = loadFromStorage(STORAGE_KEYS.qualityReports, []);
    }
    if (typeof saveToStorage === "function") {
      saveToStorage(STORAGE_KEYS.courseReports, courseFileReports);
      saveToStorage(STORAGE_KEYS.qualityReports, qualityStandardsReports);
    }
  } catch (err) {
    console.error("loadAllReports:", err);
    courseFileReports = loadFromStorage(STORAGE_KEYS.courseReports, []);
    qualityStandardsReports = loadFromStorage(STORAGE_KEYS.qualityReports, []);
  }
  updateStatCount();
}

/* ---- Auth Modal ---- */
function openAuthModal(tab) {
  document.getElementById("auth-overlay").classList.add("open");
  switchAuthTab(tab || "login");
}

function closeAuthModal(e) {
  if (!e || e.target === document.getElementById("auth-overlay")) {
    document.getElementById("auth-overlay").classList.remove("open");
    resetAuthFormsAndPendingSignup();
  }
}

function clearAuthForms() {
  [
    "login-email",
    "login-pass",
    "login-role",
    "signup-name",
    "signup-email",
    "signup-pass",
    "signup-pass2",
    "signup-otp",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/** Clears login/signup inputs and resets the signup OTP step (pending email, UI). */
function resetAuthFormsAndPendingSignup() {
  clearAuthForms();
  const otpSec = document.getElementById("signup-otp-section");
  const submitBtn = document.getElementById("signup-submit-btn");
  const emailEl = document.getElementById("signup-email");
  if (otpSec) otpSec.style.display = "none";
  if (submitBtn) submitBtn.style.display = "";
  if (emailEl) emailEl.readOnly = false;
  delete window.pendingSignupEmail;
}

function switchAuthTab(tab) {
  document
    .querySelectorAll(".auth-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".auth-panel")
    .forEach((p) => p.classList.remove("active"));
  const tabEl = document.getElementById("tab-" + tab);
  const panelEl = document.getElementById("panel-" + tab);
  if (tabEl) tabEl.classList.add("active");
  if (panelEl) panelEl.classList.add("active");
}

/* ---- Login ---- */
async function doLogin() {
  const username = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;

  if (!username || !pass) {
    showToast("يرجى إدخال جميع البيانات", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password: pass }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "بيانات تسجيل الدخول غير صحيحة", "error");
      return;
    }

    currentUser = data.user;
    saveToStorage(STORAGE_KEYS.currentUser, currentUser);
    closeAuthModal(null);
    updateNavAuth();
    updateNavLinks();
    updateHomeSections();
    await loadAllReports();
    showToast("مرحباً بك " + currentUser.name + " 👋", "success");
  } catch (err) {
    console.error("Login error:", err);
    showToast("حدث خطأ في الاتصال بالخادم", "error");
  }
}

/* ---- Signup ---- */
async function doSignup() {
  const nameEl = document.getElementById("signup-name");
  const emailEl = document.getElementById("signup-email");
  const passEl = document.getElementById("signup-pass");
  const pass2El = document.getElementById("signup-pass2");
  if (!nameEl || !emailEl || !passEl || !pass2El) {
    showToast("نموذج إنشاء الحساب غير متاح", "error");
    return;
  }

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const pass = passEl.value;
  const pass2 = pass2El.value;

  if (!name || !email || !pass || !pass2) {
    showToast("يرجى ملء جميع الحقول", "error");
    return;
  }
  if (pass.length < 8) {
    showToast("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error");
    return;
  }
  if (pass !== pass2) {
    showToast("كلمتا المرور غير متطابقتين", "error");
    return;
  }

  try {
    // Request OTP (role is auto-detected on backend)
    const response = await fetch("/api/auth/signup/request-otp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pass }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "حدث خطأ", "error");
      return;
    }

    // Show OTP section
    document.getElementById("signup-submit-btn").style.display = "none";
    document.getElementById("signup-otp-section").style.display = "block";
    document.getElementById("signup-email").readOnly = true;

    // Store email for verification
    window.pendingSignupEmail = email;

    if (data.previewUrl) {
      showToast(
        (data.message || "تم إنشاء رسالة التحقق (تطوير)") +
          "\n" +
          data.previewUrl +
          "\n" +
          (data.roleMessage || ""),
        "success",
      );
      try {
        window.open(data.previewUrl, "_blank", "noopener,noreferrer");
      } catch (_) {}
    } else if (data.devOtp) {
      showToast(
        "تعذر إرسال البريد (لا إعداد Gmail ولا خدمة الاختبار). كود التجربة: " +
          data.devOtp +
          "\nللإرسال الحقيقي إلى Gmail: أنشئ backend/.env مع GMAIL_USER وGMAIL_APP_PASSWORD" +
          (data.roleMessage ? "\n" + data.roleMessage : ""),
        "error",
      );
    } else {
      showToast(
        (data.message || "تم إرسال كود التحقق إلى بريدك الإلكتروني") +
          "\n" +
          (data.roleMessage || ""),
        "success",
      );
    }
  } catch (err) {
    console.error("Signup error:", err);
    showToast("حدث خطأ في الاتصال بالخادم", "error");
  }
}

// Verify OTP and complete registration
async function verifySignupOTP() {
  const otpEl = document.getElementById("signup-otp");
  const email = window.pendingSignupEmail;

  if (!otpEl || !email) {
    showToast("يرجى إدخال كود التحقق", "error");
    return;
  }

  const otp = otpEl.value.replace(/\D/g, "").trim();

  if (!otp || otp.length !== 5) {
    showToast("يرجى إدخال كود التحقق المكون من 5 أرقام", "error");
    return;
  }

  otpEl.value = otp;

  try {
    const response = await fetch("/api/auth/signup/verify", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "كود التحقق غير صحيح", "error");
      return;
    }

    // Set current user
    currentUser = data.user;
    saveToStorage(STORAGE_KEYS.currentUser, currentUser);

    closeAuthModal(null);
    updateNavAuth();
    updateNavLinks();
    updateHomeSections();
    await loadAllReports();
    showToast(
      "تم إنشاء الحساب بنجاح! أهلاً بك " + data.user.name + " 🎉",
      "success",
    );
  } catch (err) {
    console.error("Verify OTP error:", err);
    showToast("حدث خطأ في الاتصال بالخادم", "error");
  }
}

// Resend OTP
async function resendSignupOTP() {
  const email = window.pendingSignupEmail;

  if (!email) {
    showToast("لا توجد عملية تسجيل معلقة", "error");
    return;
  }

  try {
    const response = await fetch("/api/auth/signup/resend", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في إعادة إرسال الكود", "error");
      return;
    }

    if (data.previewUrl) {
      showToast(
        (data.message || "تمت إعادة الإرسال (تطوير)") + "\n" + data.previewUrl,
        "success",
      );
      try {
        window.open(data.previewUrl, "_blank", "noopener,noreferrer");
      } catch (_) {}
    } else if (data.devOtp) {
      showToast(
        "تعذر الإرسال. كود التجربة: " +
          data.devOtp +
          "\nأضف GMAIL_USER وGMAIL_APP_PASSWORD في backend/.env",
        "error",
      );
    } else {
      showToast(data.message || "تم إعادة إرسال كود التحقق", "success");
    }
  } catch (err) {
    console.error("Resend OTP error:", err);
    showToast("حدث خطأ في الاتصال بالخادم", "error");
  }
}

/* ---- Logout ---- */
async function doLogout() {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
  } catch (_) {}
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  currentUser = null;
  courseFileReports = [];
  qualityStandardsReports = [];
  updateStatCount();
  showPage("home");
  updateNavAuth();
  updateNavLinks();
  updateHomeSections();
  showToast("تم تسجيل الخروج بنجاح");
}

/* ---- Update navbar auth area ---- */
function updateNavAuth() {
  const nav = document.getElementById("siteAuthNav");
  const sub = document.getElementById("subnav-user");
  const subnav = document.getElementById("app-subnav");
  const subBar = document.getElementById("subnav-user-bar");
  const adminDashboardLink = document.getElementById("adminDashboardLink");
  const adminMenuDashboardItem = document.getElementById(
    "adminMenuDashboardItem",
  );

  if (currentUser) {
    closeAuthModal(null);
    // Always treat admin@must.edu.eg as main_admin
    let effectiveRole = currentUser.role;
    if (currentUser.email === "admin@must.edu.eg") effectiveRole = "main_admin";
    const roleLabel =
      effectiveRole === "main_admin"
        ? "مدير عام"
        : effectiveRole === "admin"
          ? "مدير"
          : "مشاهد";
    const isAdmin = effectiveRole === "admin" || effectiveRole === "main_admin";

    // Show/hide admin dashboard link based on role
    if (adminDashboardLink) {
      adminDashboardLink.style.display = isAdmin ? "inline-flex" : "none";
    }
    if (adminMenuDashboardItem) {
      adminMenuDashboardItem.classList.toggle("hidden", !isAdmin);
    }

    if (nav) {
      nav.style.display = "flex";
      nav.setAttribute("aria-hidden", "false");
      nav.innerHTML = `
        <a href="#page-admin-dashboard" class="auth-dashboard-link" id="adminDashboardLink" style="display:${isAdmin ? "inline-flex" : "none"}">Dashboard</a>
        <a href="#page-user-profile" class="auth-profile-link" id="userProfileLink">Profile</a>
        <div class="auth-user-chip">
          <span class="auth-user-name">${currentUser.name}</span>
          <span class="role-chip role-${effectiveRole}">${roleLabel}</span>
        </div>
        <button class="auth-logout-btn" id="siteLogoutBtn" type="button" onclick="doLogout()">Logout</button>
      `;
    }
    if (sub) {
      sub.style.display = "flex";
      sub.innerHTML = `
        <span class="subnav-user-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity:.7"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>
          ${currentUser.name}
          <span class="role-chip role-${effectiveRole}">${roleLabel}</span>
        </span>
        <button class="subnav-logout" onclick="doLogout()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          خروج
        </button>`;
    }
    if (subnav) subnav.style.display = "";
    if (subBar)
      subBar.innerHTML = `
      <span class="subnav-user-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="opacity:.7"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/></svg>
        ${currentUser.name}
        <span class="role-chip role-${effectiveRole}">${roleLabel}</span>
      </span>`;
  } else {
    if (nav) {
      nav.style.display = "flex";
      nav.removeAttribute("aria-hidden");
      nav.innerHTML = `
        <a href="#page-admin-dashboard" class="auth-dashboard-link" id="adminDashboardLink" style="display:none">Dashboard</a>
        <a href="#page-user-profile" class="auth-profile-link" id="userProfileLink" style="display:none">Profile</a>
        <div class="auth-links">
          <a href="#" class="auth-btn" id="openAuthModalBtn" onclick="openAuthModal('login')">Login</a>
          <a href="#" class="auth-btn auth-btn-primary" id="openRegisterModalBtn" onclick="openAuthModal('signup')">Register</a>
        </div>
        <button class="auth-logout-btn" id="siteLogoutBtn" type="button" style="display:none">Logout</button>
      `;
    }
    if (sub) {
      sub.style.display = "none";
      sub.innerHTML = "";
    }
    if (subnav) subnav.style.display = "none";
    if (subBar) subBar.innerHTML = "";
  }
}

/* ---- Home section visibility ---- */
function updateHomeSections() {
  const loggedIn = !!currentUser;
  let effectiveRole =
    currentUser && currentUser.email === "admin@must.edu.eg"
      ? "main_admin"
      : currentUser
        ? currentUser.role
        : null;
  const isAdmin = effectiveRole === "admin" || effectiveRole === "main_admin";
  const isViewer = effectiveRole === "viewer";

  const membersEl = document.getElementById("home-members-section");
  const cardsEl = document.getElementById("home-cards-section");
  const guestEl = document.getElementById("home-guest-section");

  if (membersEl) membersEl.style.display = loggedIn ? "" : "none";
  if (cardsEl) cardsEl.style.display = loggedIn ? "" : "none";
  if (guestEl) guestEl.style.display = loggedIn ? "none" : "";

  if (cardsEl && isViewer) {
    const editCards = cardsEl.querySelectorAll('[data-role="admin"]');
    editCards.forEach((card) => {
      card.style.opacity = "0.5";
      card.style.pointerEvents = "none";
      card.title = "متاح للمديرين فقط";
      const badge = card.querySelector(".card-role-badge");
      if (!badge) {
        const b = document.createElement("div");
        b.className = "card-role-badge";
        b.textContent = "للمديرين فقط";
        card.appendChild(b);
      }
    });
  } else if (cardsEl && isAdmin) {
    const editCards = cardsEl.querySelectorAll('[data-role="admin"]');
    editCards.forEach((card) => {
      card.style.opacity = "";
      card.style.pointerEvents = "";
      card.title = "";
    });
  }
}

/* ---- Apply viewer-only mode to a page ---- */
function applyViewerMode(pageId) {
  const page = document.getElementById(pageId);
  if (!page) return;
  const isViewer = currentUser && currentUser.role === "viewer";
  const inputs = page.querySelectorAll(
    "input, select, textarea, button.btn-primary, button.btn-outline",
  );
  inputs.forEach((el) => {
    if (
      el.textContent.includes("PDF") ||
      el.textContent.includes("Excel") ||
      el.textContent.includes("تصدير")
    )
      return;
    el.disabled = isViewer;
    if (isViewer) el.style.opacity = "0.5";
    else {
      el.disabled = false;
      el.style.opacity = "";
    }
  });
  let notice = page.querySelector(".viewer-notice");
  if (isViewer && !notice) {
    notice = document.createElement("div");
    notice.className = "viewer-notice";
    notice.innerHTML = "وضع المشاهدة فقط — لا يمكنك تعديل أو حفظ البيانات";
    const header = page.querySelector(".page-header");
    if (header) header.insertAdjacentElement("afterend", notice);
  } else if (!isViewer && notice) {
    notice.remove();
  }
}

/* ---- Viewer report access (permissions.reportAccess) ---- */
function effectiveReportAccess() {
  if (!currentUser) return "courseAndQuality";
  const p = currentUser.permissions && currentUser.permissions.reportAccess;
  if (p === "qualityStandardsOnly") return "qualityStandardsOnly";
  if (p === "courseReportsOnly") return "courseReportsOnly";
  return "courseAndQuality";
}

function canAccessCourseReportsForNav() {
  if (!currentUser) return true;
  const r =
    currentUser.email === "admin@must.edu.eg" ? "main_admin" : currentUser.role;
  if (r === "admin" || r === "main_admin") return true;
  const a = effectiveReportAccess();
  return a === "courseAndQuality" || a === "courseReportsOnly";
}

function canAccessQualityReportsForNav() {
  if (!currentUser) return true;
  const r =
    currentUser.email === "admin@must.edu.eg" ? "main_admin" : currentUser.role;
  if (r === "admin" || r === "main_admin") return true;
  const a = effectiveReportAccess();
  if (a === "courseReportsOnly") return false;
  return true;
}

function applyNavbarReportAccessVisibility() {
  const qPage = document.getElementById("nav-dropdown-quality-page");
  const cPage = document.getElementById("nav-dropdown-course-page");
  const vQ = document.getElementById("nav-dropdown-view-quality");
  const vC = document.getElementById("nav-dropdown-view-course");
  const set = (el, visible) => {
    if (!el) return;
    el.style.display = visible ? "" : "none";
    el.setAttribute("aria-hidden", visible ? "false" : "true");
    el.setAttribute("tabindex", visible ? "0" : "-1");
  };
  set(qPage, canAccessQualityReportsForNav());
  set(cPage, canAccessCourseReportsForNav());
  set(vQ, canAccessQualityReportsForNav());
  set(vC, canAccessCourseReportsForNav());
}

/** Hide course tab inside «عرض التقارير» when viewer has معايير فقط */
function applyViewReportsTabsForPermissions() {
  const courseBtn = document.getElementById("view-reports-tab-course");
  const qualityBtn = document.getElementById("view-reports-tab-quality");
  const tabCourse = document.getElementById("tab-course");
  const tabQuality = document.getElementById("tab-quality");
  if (!courseBtn || !qualityBtn || !tabCourse || !tabQuality) return;

  const courseOk =
    typeof canAccessCourseReportsForNav === "function"
      ? canAccessCourseReportsForNav()
      : true;
  const qualityOk =
    typeof canAccessQualityReportsForNav === "function"
      ? canAccessQualityReportsForNav()
      : true;

  courseBtn.style.display = courseOk ? "" : "none";
  qualityBtn.style.display = qualityOk ? "" : "none";

  tabCourse.classList.remove("active");
  tabQuality.classList.remove("active");
  courseBtn.classList.remove("active");
  qualityBtn.classList.remove("active");

  if (!courseOk && qualityOk) {
    tabQuality.classList.add("active");
    qualityBtn.classList.add("active");
  } else if (courseOk && !qualityOk) {
    tabCourse.classList.add("active");
    courseBtn.classList.add("active");
  } else if (courseOk && qualityOk) {
    tabCourse.classList.add("active");
    courseBtn.classList.add("active");
  }
}

/* ---- Role-based nav link visibility ---- */
function updateNavLinks() {
  let role = currentUser
    ? currentUser.email === "admin@must.edu.eg"
      ? "main_admin"
      : currentUser.role
    : "guest";
  const adminItem = document.getElementById("nav-admin-dashboard");
  const courseItem = document.getElementById("nav-course");
  const qualityItem = document.getElementById("nav-quality");
  const reportsItem = document.getElementById("nav-view-reports");

  const show = (el) => {
    if (el) el.style.display = "";
  };
  const hide = (el) => {
    if (el) el.style.display = "none";
  };

  if (role === "admin") {
    show(adminItem);
    show(courseItem);
    show(qualityItem);
    show(reportsItem);
  } else if (role === "viewer") {
    hide(adminItem);
    hide(courseItem);
    hide(qualityItem);
    show(reportsItem);
  } else {
    hide(adminItem);
    hide(courseItem);
    hide(qualityItem);
    hide(reportsItem);
  }

  applyNavbarReportAccessVisibility();
  applyViewReportsTabsForPermissions();
}

/* ---- Active nav button ---- */
function setActiveNavBtn(el) {
  document
    .querySelectorAll(".ext-nav-link")
    .forEach((b) => b.classList.remove("active"));
  if (el) el.classList.add("active");
}

/* ---- Guard ---- */
function guardedNav(page, el, requiredRole) {
  let role = currentUser
    ? currentUser.email === "admin@must.edu.eg"
      ? "main_admin"
      : currentUser.role
    : "guest";
  const h = { guest: 0, viewer: 1, admin: 2 };
  if (h[role] < h[requiredRole]) {
    showToast("يرجى تسجيل الدخول للوصول إلى هذه الصفحة", "error");
    openAuthModal("login");
    return;
  }
  showPage(page);
  document
    .querySelectorAll(".app-nav-btn")
    .forEach((b) => b.classList.remove("active"));
  if (el && el.classList.contains("app-nav-btn")) el.classList.add("active");
  setTimeout(() => {
    if (page === "course-file") applyViewerMode("page-course-file");
    if (page === "quality-standards") applyViewerMode("page-quality-standards");
    if (page === "admin-dashboard" && window.initAdminDashboard)
      window.initAdminDashboard();
  }, 50);

  // Hide access tab for non-admin users
  if (page === "admin-dashboard") {
    const accessTab = document.querySelector(
      'button[onclick*="admin-access-tab"]',
    );
    if (accessTab) {
      accessTab.style.display =
        role === "admin" || role === "main_admin" ? "" : "none";
    }
  }
}

/* ---- Mobile nav toggle ---- */
function toggleMobileNav() {
  document.getElementById("mobile-nav").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("open");
}

/* ---- Sticky header shadow on scroll ---- */
window.addEventListener("scroll", () => {
  const header = document.getElementById("site-header");
  if (header) header.classList.toggle("scrolled", window.scrollY > 10);
});

/* ---- Init: restore session from localStorage ---- */
document.addEventListener("DOMContentLoaded", async () => {
  getUsers();
  try {
    const meRes = await fetch("/api/auth/me", { credentials: "include" });
    if (meRes.ok) {
      const me = await meRes.json();
      if (me.user) {
        currentUser = me.user;
        saveToStorage(STORAGE_KEYS.currentUser, currentUser);
      } else {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.currentUser);
      }
    } else {
      currentUser = loadFromStorage(STORAGE_KEYS.currentUser, null);
    }
  } catch (_) {
    currentUser = loadFromStorage(STORAGE_KEYS.currentUser, null);
  }
  if (currentUser) await loadAllReports();

  updateNavLinks();
  updateHomeSections();
  updateNavAuth();
  if (typeof handleHashNavigation === "function") handleHashNavigation();

  window.addEventListener("beforeprint", () => {
    if (typeof updateStatCount === "function") updateStatCount();
  });
});
