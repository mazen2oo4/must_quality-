/* ===================================================
   adminDashboard.js — Admin Dashboard & Management
   Using Backend API
   =================================================== */

/* Access level constants (stored in user.permissions.reportAccess) */
const ACCESS_LEVELS = {
  QUALITY_STANDARDS_ONLY: "qualityStandardsOnly",
  COURSE_REPORTS_ONLY: "courseReportsOnly",
  COURSE_AND_QUALITY: "courseAndQuality",
};

/** Full user list from API (إدارة الوصول); البحث يُصفّي عرض الجدول فقط */
let adminUsersListCache = [];

/** Server-backed course rows for admin UI (dropdown, search, edit-by-code). */
let adminCoursesCache = null;

/* ============================================
   COURSE MANAGEMENT (API-based)
============================================ */
async function loadCoursesFromAPI() {
  try {
    const response = await fetch("/api/courses", { credentials: "include" });
    if (!response.ok) {
      adminCoursesCache = [];
      renderCoursesTable([]);
      if (typeof buildAdminCourseCodeDropdown === "function")
        buildAdminCourseCodeDropdown();
      throw new Error("Failed to load courses");
    }
    const data = await response.json();
    adminCoursesCache = data.courses || [];
    renderCoursesTable(adminCoursesCache);
    if (typeof buildAdminCourseCodeDropdown === "function")
      buildAdminCourseCodeDropdown();
  } catch (err) {
    console.error("Error loading courses:", err);
    showToast("فشل في تحميل المقررات", "error");
  }
}

function renderCoursesTable(courses) {
  const tbody = document.getElementById("admin-courses-body");
  if (!tbody) return;

  if (!courses.length) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align:center;color:var(--gray);padding:2rem">لا توجد مقررات</td></tr>';
    return;
  }

  tbody.innerHTML = courses
    .map(
      (course, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(course.code) : course.code}</strong></td>
      <td>${course.name}</td>
      <td>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap">
          <button class="btn-sm btn-edit" onclick="showEditCourseModal(${course.id}, '${course.code}', '${course.name}')">✏️ تعديل</button>
          <button class="btn-sm btn-danger" onclick="deleteCourse(${course.id})">🗑️ حذف</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

async function addNewCourse() {
  const codeInput = document.getElementById("admin-course-code");
  const nameInput = document.getElementById("admin-course-name");

  if (!codeInput || !nameInput) return;

  const code = codeInput.value.trim().toUpperCase();
  const name = nameInput.value.trim();

  if (!code || !name) {
    showToast("يرجى إدخال كود واسم المقرر", "error");
    return;
  }

  try {
    const response = await fetch("/api/courses", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في إضافة المقرر", "error");
      return;
    }

    // Clear inputs
    codeInput.value = "";
    nameInput.value = "";

    // Reload courses
    await loadCoursesFromAPI();

    // Also rebuild the course file dropdown
    if (typeof buildCourseCodeDropdown === "function") {
      buildCourseCodeDropdown();
    }

    showToast("تم إضافة المقرر بنجاح ✅", "success");
  } catch (err) {
    console.error("Error adding course:", err);
    showToast("فشل في إضافة المقرر", "error");
  }
}

function showEditCourseModal(id, code, name) {
  const newName = prompt(`تعديل اسم المقرر ${code}:`, name);
  if (!newName || newName.trim() === name) return;

  editCourseAPI(id, code, newName.trim());
}

async function editCourseAPI(id, code, newName) {
  try {
    const response = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name: newName }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في تعديل المقرر", "error");
      return;
    }

    await loadCoursesFromAPI();

    if (typeof buildCourseCodeDropdown === "function") {
      buildCourseCodeDropdown();
    }

    showToast("تم تعديل المقرر بنجاح ✅", "success");
  } catch (err) {
    console.error("Error editing course:", err);
    showToast("فشل في تعديل المقرر", "error");
  }
}

async function deleteCourse(id) {
  if (!confirm("هل أنت متأكد من حذف هذا المقرر؟")) return;

  try {
    const response = await fetch(`/api/courses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      showToast(data.error || "فشل في حذف المقرر", "error");
      return;
    }

    await loadCoursesFromAPI();

    if (typeof buildCourseCodeDropdown === "function") {
      buildCourseCodeDropdown();
    }

    showToast("تم حذف المقرر بنجاح ✅", "success");
  } catch (err) {
    console.error("Error deleting course:", err);
    showToast("فشل في حذف المقرر", "error");
  }
}

/* ============================================
   PDF FORM MANAGEMENT (API-based)
============================================ */
async function loadFormsFromAPI() {
  try {
    const response = await fetch("/api/forms", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load forms");
    const data = await response.json();
    renderFormsTable(data.forms || []);
  } catch (err) {
    console.error("Error loading forms:", err);
  }
}

function renderFormsTable(forms) {
  // عرض النماذج ككروت
  const cardsContainer = document.getElementById("forms-cards-container");
  if (!cardsContainer) return;

  if (!forms.length) {
    cardsContainer.innerHTML =
      '<div style="color:var(--gray);padding:2rem;text-align:center;width:100%">لا توجد نماذج مرفوعة</div>';
    return;
  }

  cardsContainer.innerHTML = forms
    .map((form) => {
      const fileName = form.filePath ? form.filePath.split(/[\\/]/).pop() : "";
      const ext = fileName.split(".").pop().toLowerCase();
      const isWord = ext === "doc" || ext === "docx";
      const isPDF = ext === "pdf";
      const icon = isWord ? "📄" : isPDF ? "📄" : "📁";
      const downloadLabel = isWord
        ? "Download Word"
        : isPDF
          ? "Download PDF"
          : "Download";
      const size = form.sizeKB ? `${form.sizeKB} KB` : "";
      const updated = form.created_at
        ? `last updated: ${new Date(form.created_at).toISOString().replace("T", " ").slice(0, 19)}`
        : "";
      return `
      <div class="form-card">
        <div class="form-card-icon">${icon}</div>
        <div class="form-card-title">${form.name || fileName}</div>
        <div class="form-card-meta">${size}${size && updated ? " | " : ""}${updated}</div>
        <a class="form-card-download" href="/uploads/forms/${fileName}" download>
          ${downloadLabel}
        </a>
        <button class="btn-sm btn-danger" style="margin-top:0.7rem" onclick="deleteForm(${form.id})">🗑️ حذف</button>
      </div>
    `;
    })
    .join("");
}

async function addNewModelPDF() {
  const nameInput = document.getElementById("admin-model-name");
  const fileInput = document.getElementById("admin-model-file");

  if (!nameInput || !fileInput) return;

  const name = nameInput.value.trim();
  const file = fileInput.files[0];

  if (!name || !file) {
    showToast("يرجى إدخال اسم النموذج واختيار ملف PDF", "error");
    return;
  }

  if (file.type !== "application/pdf") {
    showToast("يرجى اختيار ملف PDF فقط", "error");
    return;
  }

  const formData = new FormData();
  formData.append("name", name);
  formData.append("file", file);

  try {
    const response = await fetch("/api/forms/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في رفع النموذج", "error");
      return;
    }

    // Clear inputs
    nameInput.value = "";
    fileInput.value = "";

    // Reload forms
    await loadFormsFromAPI();

    showToast("تم رفع النموذج بنجاح ✅", "success");
  } catch (err) {
    console.error("Error uploading form:", err);
    showToast("فشل في رفع النموذج", "error");
  }
}

async function deleteForm(id) {
  if (!confirm("هل أنت متأكد من حذف هذا النموذج؟")) return;

  try {
    const response = await fetch(`/api/forms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      showToast(data.error || "فشل في حذف النموذج", "error");
      return;
    }

    await loadFormsFromAPI();
    showToast("تم حذف النموذج بنجاح ✅", "success");
  } catch (err) {
    console.error("Error deleting form:", err);
    showToast("فشل في حذف النموذج", "error");
  }
}

/* ============================================
   USER ACCESS MANAGEMENT (API-based)
============================================ */
async function loadUsersFromAPI() {
  try {
    const response = await fetch("/api/auth/users", { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load users");
    const data = await response.json();
    adminUsersListCache = data.users || [];
    filterAdminUsersTable();
  } catch (err) {
    console.error("Error loading users:", err);
    const users = getUsers();
    adminUsersListCache = (users || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: true,
      permissions: u.permissions || {},
    }));
    filterAdminUsersTable();
  }
}

function filterAdminUsersTable() {
  const input = document.getElementById("admin-users-search");
  const q = (input && input.value ? input.value : "").trim().toLowerCase();
  if (!q) {
    renderUsersTable(adminUsersListCache);
    return;
  }
  const filtered = adminUsersListCache.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });
  renderUsersTable(filtered);
}

function renderUsersTable(users) {
  const tbody = document.getElementById("admin-users-body");
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:2rem">' +
      (adminUsersListCache.length
        ? "لا توجد نتائج مطابقة للبحث"
        : "لا توجد مستخدمين") +
      "</td></tr>";
    return;
  }

  tbody.innerHTML = users
    .map((user) => {
      const roleLabel =
        user.role === "main_admin"
          ? "مدير عام"
          : user.role === "admin"
            ? "مدير"
            : "مشاهد";
      const permissions = user.permissions || {};
      const raw = permissions.reportAccess;
      const currentLevel =
        raw === ACCESS_LEVELS.QUALITY_STANDARDS_ONLY
          ? ACCESS_LEVELS.QUALITY_STANDARDS_ONLY
          : raw === ACCESS_LEVELS.COURSE_REPORTS_ONLY
            ? ACCESS_LEVELS.COURSE_REPORTS_ONLY
            : ACCESS_LEVELS.COURSE_AND_QUALITY;
      const isActive = user.isActive !== false;
      const accessSelectDisabled =
        user.role === "main_admin" || user.role === "admin"
          ? "disabled title='المديرون يرون كل التقارير دائماً'"
          : "";

      return `
      <tr>
        <td><strong>${user.name}</strong><br><small style="color:var(--gray)">${user.email}</small></td>
        <td><span class="role-badge role-${user.role}">${roleLabel}</span></td>
        <td>
          <span style="color: ${isActive ? "#16a34a" : "#dc2626"}">
            ${isActive ? "✅ نشط" : "❌ معطل"}
          </span>
        </td>
        <td>
          <select id="access-${user.id}" ${accessSelectDisabled} style="padding:0.5rem; border:1px solid var(--border-light); border-radius:8px; font-size:0.85rem; font-family:'Cairo',sans-serif; cursor:pointer; max-width:100%" onchange="updateUserPermissions(${user.id})">
            <option value="${ACCESS_LEVELS.QUALITY_STANDARDS_ONLY}" ${currentLevel === ACCESS_LEVELS.QUALITY_STANDARDS_ONLY ? "selected" : ""}>
              🏛️ تقارير معايير الجودة فقط
            </option>
            <option value="${ACCESS_LEVELS.COURSE_REPORTS_ONLY}" ${currentLevel === ACCESS_LEVELS.COURSE_REPORTS_ONLY ? "selected" : ""}>
              📄 تقارير ملفات المقررات الدراسية فقط
            </option>
            <option value="${ACCESS_LEVELS.COURSE_AND_QUALITY}" ${currentLevel === ACCESS_LEVELS.COURSE_AND_QUALITY ? "selected" : ""}>
              📊 معايير الجودة + ملفات المقررات الدراسية
            </option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:0.3rem; flex-wrap:wrap">
            <button class="btn-sm" style="background:${isActive ? "#fee2e2" : "#dcfce7"};color:${isActive ? "#dc2626" : "#16a34a"}" onclick="toggleUserActive(${user.id}, ${!isActive})">
              ${isActive ? "❌ تعطيل" : "✅ تفعيل"}
            </button>
            ${
              user.role !== "main_admin"
                ? `
            <button class="btn-sm btn-edit" onclick="changeUserRole(${user.id})">👤 تغيير الدور</button>
            `
                : ""
            }
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

async function updateUserPermissions(userId) {
  const selectEl = document.getElementById(`access-${userId}`);
  if (!selectEl || selectEl.disabled) return;
  const reportAccess = selectEl.value;

  try {
    const response = await fetch(`/api/auth/users/${userId}/permissions`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        permissions: { reportAccess },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في تحديث الصلاحيات", "error");
      return;
    }

    if (
      typeof currentUser !== "undefined" &&
      currentUser &&
      Number(userId) === currentUser.id &&
      data.user &&
      data.user.permissions
    ) {
      currentUser.permissions = data.user.permissions;
      if (typeof applyNavbarReportAccessVisibility === "function")
        applyNavbarReportAccessVisibility();
      if (typeof applyViewReportsTabsForPermissions === "function")
        applyViewReportsTabsForPermissions();
    }

    if (data.user && data.user.permissions) {
      const idx = adminUsersListCache.findIndex((u) => u.id === Number(userId));
      if (idx !== -1)
        adminUsersListCache[idx].permissions = data.user.permissions;
      filterAdminUsersTable();
    }

    showToast("تم تحديث الصلاحيات بنجاح ✅", "success");
  } catch (err) {
    console.error("Error updating permissions:", err);
    showToast("فشل في تحديث الصلاحيات", "error");
  }
}

async function toggleUserActive(userId, isActive) {
  try {
    const response = await fetch(`/api/auth/users/${userId}/active`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في تغيير حالة الحساب", "error");
      return;
    }

    await loadUsersFromAPI();
    showToast(data.message, "success");
  } catch (err) {
    console.error("Error toggling user active:", err);
    showToast("فشل في تغيير حالة الحساب", "error");
  }
}

async function changeUserRole(userId) {
  const newRole = prompt("أدخل الدور الجديد (admin/viewer/main_admin):");
  if (!newRole || !["admin", "viewer", "main_admin"].includes(newRole)) {
    showToast("دور غير صالح", "error");
    return;
  }

  try {
    const response = await fetch(`/api/auth/users/${userId}/role`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      showToast(data.error || "فشل في تغيير الدور", "error");
      return;
    }

    await loadUsersFromAPI();
    showToast("تم تغيير الدور بنجاح ✅", "success");
  } catch (err) {
    console.error("Error changing role:", err);
    showToast("فشل في تغيير الدور", "error");
  }
}

/* ============================================
   GETTER FOR COURSE LIST (dropdowns / search)
   Prefers server-backed cache; falls back to legacy storage / static catalog.
============================================ */
function getStoredCourseCodes() {
  if (Array.isArray(adminCoursesCache)) return adminCoursesCache;
  const stored = loadFromStorage(ADMIN_STORAGE_KEYS.courseCodes, null);
  if (stored && Array.isArray(stored) && stored.length) return stored;
  if (typeof COURSE_CODES !== "undefined" && Array.isArray(COURSE_CODES))
    return [...COURSE_CODES];
  return [];
}

/* ============================================
   COURSE SEARCH/FILTER (NEW INTERFACE)
============================================ */

/* Track the currently selected course code in search interface */
let selectedCourseCodeInSearch = null;

function buildAdminCourseCodeDropdown() {
  const sel = document.getElementById("admin-course-search");
  if (!sel) return;

  const courses = getStoredCourseCodes();
  // Clear existing options except the first
  while (sel.options.length > 1) {
    sel.remove(1);
  }
  courses.forEach((course) => {
    const opt = document.createElement("option");
    opt.value = course.code;
    opt.textContent = `${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(course.code) : course.code} — ${course.name}`;
    opt.dataset.name = course.name;
    sel.appendChild(opt);
  });
}

function onCourseSelect() {
  const sel = document.getElementById("admin-course-search");
  if (!sel) return;

  const selectedOption = sel.options[sel.selectedIndex];
  if (!selectedOption || !selectedOption.value) {
    const courseDetailsDiv = document.getElementById("admin-course-details");
    if (courseDetailsDiv) courseDetailsDiv.style.display = "none";
    selectedCourseCodeInSearch = null;
    return;
  }

  const code = selectedOption.value;
  const name =
    selectedOption.dataset.name ||
    selectedOption.textContent.split(":").slice(1).join(":").trim();
  selectCourseFromSearch(code, name);
}

function filterCoursesList() {
  const searchInput = document.getElementById("admin-course-search");
  const suggestionsDiv = document.getElementById("admin-courses-suggestions");
  const courseDetailsDiv = document.getElementById("admin-course-details");

  if (!searchInput || !suggestionsDiv) return;

  const searchTerm = searchInput.value.trim().toLowerCase();

  // If search is empty, hide suggestions and details
  if (!searchTerm) {
    suggestionsDiv.style.display = "none";
    if (courseDetailsDiv) courseDetailsDiv.style.display = "none";
    selectedCourseCodeInSearch = null;
    return;
  }

  const courses = getStoredCourseCodes();

  // Filter courses by code or name
  const filtered = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm) ||
      course.name.toLowerCase().includes(searchTerm),
  );

  // Show or hide suggestions based on results
  if (filtered.length === 0) {
    suggestionsDiv.innerHTML =
      '<div style="padding:1rem; color:var(--gray); text-align:center;">لا توجد نتائج</div>';
    suggestionsDiv.style.display = "block";
    if (courseDetailsDiv) courseDetailsDiv.style.display = "none";
    return;
  }

  // Build suggestions list
  suggestionsDiv.innerHTML = filtered
    .map(
      (course) =>
        `<div class="suggestion-item" onclick="selectCourseFromSearch('${course.code}', '${course.name.replace(/'/g, "&#39;")}')">
      <strong>${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(course.code) : course.code}</strong> — ${course.name}
    </div>`,
    )
    .join("");

  suggestionsDiv.style.display = "block";
}

function selectCourseFromSearch(code, name) {
  selectedCourseCodeInSearch = code;

  // Update search input to show selected course
  const searchInput = document.getElementById("admin-course-search");
  if (searchInput) {
    searchInput.value = `${code}: ${name}`;
  }

  // Hide suggestions dropdown
  const suggestionsDiv = document.getElementById("admin-courses-suggestions");
  if (suggestionsDiv) {
    suggestionsDiv.style.display = "none";
  }

  // Show and populate course details
  const courseDetailsDiv = document.getElementById("admin-course-details");
  const codeDisplay = document.getElementById("selected-course-code");
  const nameDisplay = document.getElementById("selected-course-name");
  const editInput = document.getElementById("admin-course-edit-name");

  if (courseDetailsDiv && codeDisplay && nameDisplay) {
    codeDisplay.textContent = `كود المقرر: ${code}`;
    nameDisplay.textContent = `اسم المقرر: ${name}`;
    if (editInput) {
      editInput.value = name;
    }
    courseDetailsDiv.style.display = "block";
  }
}

function saveSelectedCourseEdit() {
  if (!selectedCourseCodeInSearch) {
    showToast("يرجى اختيار مقرر أولاً", "error");
    return;
  }

  const editInput = document.getElementById("admin-course-edit-name");
  if (!editInput) return;

  const newName = editInput.value.trim();
  if (!newName) {
    showToast("يرجى إدخال اسم المقرر الجديد", "error");
    return;
  }

  const course = (adminCoursesCache || []).find(
    (c) => c.code === selectedCourseCodeInSearch,
  );
  if (!course) {
    showToast("المقرر غير موجود", "error");
    return;
  }
  editCourseAPI(course.id, course.code, newName);

  // Update selected course details and clear edit input
  const selectedName = document.getElementById("selected-course-name");
  if (selectedName) selectedName.textContent = newName;
  editInput.value = "";
  document.getElementById("admin-course-search").value = "";
  document.getElementById("admin-courses-suggestions").style.display = "none";
  selectedCourseCodeInSearch = null;
  document.getElementById("admin-course-details").style.display = "none";
}

async function deleteSelectedCourse() {
  if (!selectedCourseCodeInSearch) {
    showToast("يرجى اختيار مقرر أولاً", "error");
    return;
  }

  const course = (adminCoursesCache || []).find(
    (c) => c.code === selectedCourseCodeInSearch,
  );
  if (!course) {
    showToast("المقرر غير موجود", "error");
    return;
  }

  await deleteCourse(course.id);

  // Clear search interface after delete
  setTimeout(() => {
    const searchEl = document.getElementById("admin-course-search");
    if (searchEl) searchEl.value = "";
    const detailsEl = document.getElementById("admin-course-details");
    if (detailsEl) detailsEl.style.display = "none";
    const suggEl = document.getElementById("admin-courses-suggestions");
    if (suggEl) suggEl.style.display = "none";
    selectedCourseCodeInSearch = null;
    if (typeof buildCourseCodeDropdown === "function")
      buildCourseCodeDropdown();
    if (typeof buildAdminCourseCodeDropdown === "function")
      buildAdminCourseCodeDropdown();
  }, 500);
}

/* ============================================
   INITIALIZATION & PAGE RENDERING
============================================ */
window.initAdminDashboard = async function initAdminDashboard() {
  await loadCoursesFromAPI();
  await loadFormsFromAPI();
  const canManageUsers =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "main_admin");
  if (canManageUsers) await loadUsersFromAPI();
  if (typeof buildAdminCourseCodeDropdown === "function")
    buildAdminCourseCodeDropdown();
  if (typeof buildCourseCodeDropdown === "function") buildCourseCodeDropdown();
};

/* Initialize when page loads */
document.addEventListener("DOMContentLoaded", () => {
  // Will be called when admin dashboard is first viewed
  setTimeout(() => {
    if (document.querySelector("#admin-courses-body")) {
      initAdminDashboard();
    }
  }, 100);
});

/* Also add a hook to reinitialize when navigating to the page */
const originalShowPage = window.showPage;
window.showPage = function (id) {
  originalShowPage(id);
  if (id === "admin-dashboard") {
    setTimeout(() => initAdminDashboard(), 100);
  }
};
