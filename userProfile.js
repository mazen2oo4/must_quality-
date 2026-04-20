/* ===================================================
   userProfile.js — User Profile & Report Management
   =================================================== */

let selectedUserReportId = null;

/* ============================================
   PROFILE INITIALIZATION
============================================ */
function initUserProfile() {
  if (!currentUser) return;

  // Display user info
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");

  if (profileName) profileName.textContent = currentUser.name;
  if (profileEmail) profileEmail.textContent = currentUser.email;

  // Load and display user reports
  loadUserReports();
  populateUserReportsDropdown();
}

/* ============================================
   USER REPORTS MANAGEMENT
============================================ */
function getUserReports() {
  if (!currentUser) return [];

  // Get all reports (both course and quality reports)
  const courseReports = loadFromStorage(STORAGE_KEYS.courseReports, []);
  const qualityReports = loadFromStorage(STORAGE_KEYS.qualityReports, []);

  // Filter to only current user's reports
  const userCourseReports = courseReports
    .filter((r) => r.userId === currentUser.id)
    .map((r) => ({
      ...r,
      type: "course",
      typeLabel: "تقرير ملف مقرر",
    }));

  const userQualityReports = qualityReports
    .filter((r) => r.userId === currentUser.id)
    .map((r) => ({
      ...r,
      type: "quality",
      typeLabel: "تقرير معايير جودة",
    }));

  // Combine and sort by date (newest first)
  const allReports = [...userCourseReports, ...userQualityReports].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  return allReports;
}

function loadUserReports() {
  const reports = getUserReports();
  const listContainer = document.getElementById("user-reports-list");

  if (!listContainer) return;

  if (reports.length === 0) {
    listContainer.innerHTML =
      '<div style="text-align: center; padding: 2rem; color: var(--gray)">لا توجد تقارير مُدخلة بعد</div>';
    return;
  }

  listContainer.innerHTML = reports
    .map(
      (report, index) => `
    <div
      style="
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        hover: transform translateY(-2px);
      "
      onclick="selectUserReportCard(${report.id})"
    >
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem">
        <div>
          <strong style="color: var(--navy)">${report.typeLabel}</strong>
          <div style="font-size: 0.9rem; color: var(--gray); margin-top: 0.3rem">
            ${
              report.type === "course"
                ? `<strong>${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(report.code) : report.code}</strong> — ${report.name}`
                : `${report.accreditationType || "مؤسسي"} — المعيار # ${report.standardNumber || "-"}`
            }
          </div>
        </div>
        <div
          style="
            background: ${report.type === "course" ? "#dbeafe" : "#d1e7dd"};
            color: ${report.type === "course" ? "#1e40af" : "#155724"};
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
          "
        >
          ${report.typeLabel === "تقرير ملف مقرر" ? "📋" : "🏛️"}
        </div>
      </div>
      <div style="font-size: 0.85rem; color: var(--gray-light); display: flex; gap: 1rem">
        <span>📅 ${report.date || "-"}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function populateUserReportsDropdown() {
  const reports = getUserReports();
  const dropdown = document.getElementById("user-reports-dropdown");

  if (!dropdown) return;

  const options = reports
    .map(
      (report, index) => `
    <option value="${report.id}">
      ${report.date} — ${
        report.type === "course"
          ? `${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(report.code) : report.code}: ${report.name}`
          : `مستوى الجودة - ${report.standardNumber}`
      }
    </option>
  `,
    )
    .join("");

  dropdown.innerHTML = '<option value="">-- اختر تقرير --</option>' + options;
}

function selectUserReportCard(reportId) {
  selectedUserReportId = reportId;
  const dropdown = document.getElementById("user-reports-dropdown");
  if (dropdown) {
    dropdown.value = reportId;
  }
  displayReportDetails(reportId);
}

function selectUserReport() {
  const dropdown = document.getElementById("user-reports-dropdown");
  if (!dropdown) return;

  const reportId = parseInt(dropdown.value);
  if (!reportId) {
    document.getElementById("selected-report-details").style.display = "none";
    return;
  }

  selectedUserReportId = reportId;
  displayReportDetails(reportId);
}

function displayReportDetails(reportId) {
  const reports = getUserReports();
  const report = reports.find((r) => r.id === reportId);

  if (!report) return;

  const detailsPanel = document.getElementById("selected-report-details");
  const detailsContent = document.getElementById("report-details-content");

  if (!detailsPanel || !detailsContent) return;

  // Build details HTML
  let detailsHTML = `
    <div>
      <label style="color: var(--gray); font-size: 0.85rem">نوع التقرير</label>
      <p style="color: var(--navy); font-weight: 600">${report.typeLabel}</p>
    </div>
    <div>
      <label style="color: var(--gray); font-size: 0.85rem">تاريخ التقرير</label>
      <p style="color: var(--navy); font-weight: 600">${report.date}</p>
    </div>
  `;

  if (report.type === "course") {
    detailsHTML += `
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">كود المقرر</label>
        <p style="color: var(--navy); font-weight: 600">${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(report.code) : report.code}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">اسم المقرر</label>
        <p style="color: var(--navy); font-weight: 600">${report.name}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">أستاذ المقرر</label>
        <p style="color: var(--navy); font-weight: 600">${report.prof || "-"}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">الفصل الدراسي</label>
        <p style="color: var(--navy); font-weight: 600">${report.semester || "-"}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">عدد الطلاب</label>
        <p style="color: var(--navy); font-weight: 600">${report.students}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">الحاضرون</label>
        <p style="color: var(--navy); font-weight: 600">${report.attend}</p>
      </div>
    `;
  } else {
    detailsHTML += `
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">نوع الاعتماد</label>
        <p style="color: var(--navy); font-weight: 600">${report.accreditationType === "institutional" ? "مؤسسي" : "برامجي"}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">رقم المعيار</label>
        <p style="color: var(--navy); font-weight: 600">${report.standardNumber}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">البرنامج</label>
        <p style="color: var(--navy); font-weight: 600">${report.program || "-"}</p>
      </div>
      <div>
        <label style="color: var(--gray); font-size: 0.85rem">الحالة</label>
        <p style="color: var(--navy); font-weight: 600">${report.status || "-"}</p>
      </div>
    `;
  }

  detailsContent.innerHTML = detailsHTML;
  detailsPanel.style.display = "block";
}

function filterUserReports() {
  const dateSearch = document.getElementById("user-report-date-search");
  if (!dateSearch) return;

  const selectedDate = dateSearch.value;
  const reports = getUserReports();

  if (!selectedDate) {
    loadUserReports();
    return;
  }

  const filtered = reports.filter((r) => r.date === selectedDate);

  const listContainer = document.getElementById("user-reports-list");
  if (!listContainer) return;

  if (filtered.length === 0) {
    listContainer.innerHTML =
      '<div style="text-align: center; padding: 2rem; color: var(--gray)">لا توجد تقارير في هذا التاريخ</div>';
    return;
  }

  listContainer.innerHTML = filtered
    .map(
      (report) => `
    <div
      style="
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
      "
      onclick="selectUserReportCard(${report.id})"
    >
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem">
        <div>
          <strong style="color: var(--navy)">${report.typeLabel}</strong>
          <div style="font-size: 0.9rem; color: var(--gray); margin-top: 0.3rem">
            ${
              report.type === "course"
                ? `<strong>${typeof formatCourseCodeForDisplay === "function" ? formatCourseCodeForDisplay(report.code) : report.code}</strong> — ${report.name}`
                : `${report.accreditationType || "مؤسسي"}`
            }
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

async function deleteUserReport() {
  if (!selectedUserReportId) {
    showToast("يرجى اختيار تقرير أولاً", "error");
    return;
  }

  if (!confirm("هل أنت متأكد من حذف هذا التقرير؟")) {
    return;
  }

  const reports = getUserReports();
  const reportToDelete = reports.find((r) => r.id === selectedUserReportId);

  if (!reportToDelete) {
    showToast("التقرير غير موجود", "error");
    return;
  }

  const apiPath =
    reportToDelete.type === "course"
      ? `/api/course-file/${reportToDelete.id}`
      : `/api/quality-standards/${reportToDelete.id}`;

  try {
    const res = await fetch(apiPath, { method: "DELETE", credentials: "include" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      showToast(j.error || "فشل حذف التقرير من الخادم", "error");
      return;
    }
  } catch (e) {
    console.error(e);
    showToast("حدث خطأ في الاتصال بالخادم", "error");
    return;
  }

  if (reportToDelete.type === "course") {
    courseFileReports = (courseFileReports || []).filter(
      (r) => r.id !== selectedUserReportId,
    );
    if (typeof saveToStorage === "function" && typeof STORAGE_KEYS !== "undefined") {
      saveToStorage(STORAGE_KEYS.courseReports, courseFileReports);
    }
  } else {
    qualityStandardsReports = (qualityStandardsReports || []).filter(
      (r) => r.id !== selectedUserReportId,
    );
    if (typeof saveToStorage === "function" && typeof STORAGE_KEYS !== "undefined") {
      saveToStorage(STORAGE_KEYS.qualityReports, qualityStandardsReports);
    }
  }

  selectedUserReportId = null;
  document.getElementById("selected-report-details").style.display = "none";
  document.getElementById("user-reports-dropdown").value = "";
  document.getElementById("user-report-date-search").value = "";
  loadUserReports();
  populateUserReportsDropdown();
  updateStatCount();
  showToast("تم حذف التقرير بنجاح ✅", "success");
}

function exportUserReportPDF() {
  if (!selectedUserReportId) {
    showToast("يرجى اختيار تقرير أولاً", "error");
    return;
  }
  showToast("سيتم تطوير خاصية تصدير PDF قريباً", "info");
}

function exportUserReportExcel() {
  if (!selectedUserReportId) {
    showToast("يرجى اختيار تقرير أولاً", "error");
    return;
  }
  showToast("سيتم تطوير خاصية تصدير Excel قريباً", "info");
}

/* ============================================
   INITIALIZATION
============================================ */
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (document.querySelector("#profile-name")) {
      initUserProfile();
    }
  }, 100);
});

/* Add hook to reinitialize when navigating to the page */
const originalShowPageProfile = window.showPage;
window.showPage = function (id) {
  originalShowPageProfile(id);
  if (id === "user-profile") {
    setTimeout(() => initUserProfile(), 100);
  }
};
