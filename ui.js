// Navbar auth modal triggers
document.addEventListener("DOMContentLoaded", function () {
  const loginBtn = document.getElementById("openAuthModalBtn");
  const registerBtn = document.getElementById("openRegisterModalBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof openAuthModal === "function") openAuthModal("login");
    });
  }
  if (registerBtn) {
    registerBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof openAuthModal === "function") openAuthModal("signup");
    });
  }
});
/* ui.js — Shared UI Utilities */

function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + type;
  setTimeout(() => t.classList.remove("show"), 3200);
}

function showPage(id) {
  // Protect access to pages that require login
  const protectedPages = [
    "course-file",
    "quality-standards",
    "view-reports",
    "user-profile",
    "admin-dashboard",
  ];
  if (protectedPages.includes(id) && !currentUser) {
    showToast("يرجى تسجيل الدخول للوصول إلى هذه الصفحة", "error");
    openAuthModal("login");
    return;
  }

  if (
    id === "course-file" &&
    typeof canAccessCourseReportsForNav === "function" &&
    !canAccessCourseReportsForNav()
  ) {
    showToast("لا تملك صلاحية الوصول إلى تقارير ملفات المقررات", "error");
    return;
  }
  if (
    id === "quality-standards" &&
    typeof canAccessQualityReportsForNav === "function" &&
    !canAccessQualityReportsForNav()
  ) {
    showToast("لا تملك صلاحية الوصول إلى تقارير معايير الجودة", "error");
    return;
  }

  if (typeof closeAuthModal === "function") closeAuthModal(null);

  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const target = document.getElementById("page-" + id);
  if (target) target.classList.add("active");
  window.scrollTo(0, 0);
  if (id === "view-reports") {
    if (typeof applyViewReportsTabsForPermissions === "function")
      applyViewReportsTabsForPermissions();
    if (typeof updateCourseViewMode === "function") updateCourseViewMode();
    if (typeof updateQSViewMode === "function") updateQSViewMode();
    if (typeof applySavedQSViewState === "function") applySavedQSViewState();
    if (typeof renderCFTable === "function") renderCFTable();
    if (typeof renderQSTable === "function") renderQSTable();
  }
}

// Hash-based navigation for navbar links
function handleHashNavigation() {
  const hash = window.location.hash;
  if (hash && hash.startsWith("#page-")) {
    const pageId = hash.replace("#page-", "");
    // Map page IDs to the format used by showPage
    const pageMap = {
      home: "home",
      "admin-dashboard": "admin-dashboard",
      "course-file": "course-file",
      "quality-standards": "quality-standards",
      "view-reports": "view-reports",
      "user-profile": "user-profile",
      "releases-forms": "releases-forms",
    };
    if (pageMap[pageId]) {
      showPage(pageMap[pageId]);
    }
  }
}

// Hash navigation: initial run happens in auth.js after /api/auth/me (so permissions apply).
window.addEventListener("hashchange", handleHashNavigation);

function setActive(el) {
  document
    .querySelectorAll(".app-nav-btn")
    .forEach((l) => l.classList.remove("active"));
  if (el) el.classList.add("active");
}

function setActiveById(id) {
  document
    .querySelectorAll(".app-nav-btn")
    .forEach((l) => l.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function switchTab(id, el) {
  if (
    id === "tab-course" &&
    typeof canAccessCourseReportsForNav === "function" &&
    !canAccessCourseReportsForNav()
  ) {
    showToast("لا تملك صلاحية عرض تقارير ملفات المقررات", "error");
    return;
  }
  if (
    id === "tab-quality" &&
    typeof canAccessQualityReportsForNav === "function" &&
    !canAccessQualityReportsForNav()
  ) {
    showToast("لا تملك صلاحية عرض تقارير معايير الجودة", "error");
    return;
  }
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  el.classList.add("active");
  // إذا تم فتح تبويب إدارة الوصول، حمّل المستخدمين
  if (id === "admin-access-tab" && typeof loadUsersFromAPI === "function") {
    loadUsersFromAPI();
  }
}

function openViewReportsTab(tabName = "course") {
  if (
    tabName === "course" &&
    typeof canAccessCourseReportsForNav === "function" &&
    !canAccessCourseReportsForNav()
  ) {
    showToast("لا تملك صلاحية عرض تقارير ملفات المقررات", "error");
    return;
  }
  if (
    tabName === "quality" &&
    typeof canAccessQualityReportsForNav === "function" &&
    !canAccessQualityReportsForNav()
  ) {
    showToast("لا تملك صلاحية عرض تقارير المعايير", "error");
    return;
  }
  showPage("view-reports");
  setActiveById("nav-view-reports");
  const targetTabId = tabName === "quality" ? "tab-quality" : "tab-course";
  const targetBtn = Array.from(document.querySelectorAll("#page-view-reports .tab-btn")).find((btn) =>
    btn.getAttribute("onclick")?.includes(targetTabId),
  );
  if (targetBtn) switchTab(targetTabId, targetBtn);
  if (tabName === "quality") {
    if (typeof applySavedQSViewState === "function") applySavedQSViewState();
    if (typeof updateQSViewMode === "function") updateQSViewMode();
    if (typeof renderQSTable === "function") renderQSTable();
  } else {
    if (typeof updateCourseViewMode === "function") updateCourseViewMode();
    if (typeof renderCFTable === "function") renderCFTable();
  }
  window.location.hash = "#page-view-reports";
}

function updateStatCount() {
  const el = document.getElementById("stat-reports");
  if (el)
    el.textContent = courseFileReports.length + qualityStandardsReports.length;
  if (typeof refreshDashboardMetaStats === "function")
    refreshDashboardMetaStats();
}

/**
 * Print HTML as PDF (browser print dialog). Uses a hidden iframe so popup
 * blockers cannot block window.open('about:blank'), which otherwise breaks PDF.
 */
function printHtmlForPdf(html) {
  const win = window.open('', '_blank');
  if (!win) {
    if (typeof showToast === "function") {
      showToast("تعذر فتح نافذة جديدة", "error");
    }
    return;
  }
  const doc = win.document;
  doc.open();
  doc.write(html);
  doc.close();
  // Optionally, trigger print after a delay
  setTimeout(() => {
    win.focus();
    win.print();
  }, 500);
}
