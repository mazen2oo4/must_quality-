/* releasesForms.js - Releases & Forms Page with Pagination & Admin */

const ITEMS_PER_PAGE = 3;

// Default mock data
const defaultFiles = [
  {
    id: 1,
    name: "2026_Graduation_Project_Proposal_Template",
    size: "55.09 KB",
    lastUpdated: "2025-04-14",
    downloadUrl: "#",
  },
  {
    id: 2,
    name: "Grad. Projects Template 2025-2026 V1",
    size: "337.09 KB",
    lastUpdated: "2024-04-14",
    downloadUrl: "#",
  },
  {
    id: 3,
    name: "Poster Template",
    size: "90.26 KB",
    lastUpdated: "2024-04-14",
    downloadUrl: "#",
  },
  {
    id: 4,
    name: "Course File Review Form 2024",
    size: "125.50 KB",
    lastUpdated: "2024-03-20",
    downloadUrl: "#",
  },
  {
    id: 5,
    name: "Quality Standards Assessment Template",
    size: "210.75 KB",
    lastUpdated: "2024-02-15",
    downloadUrl: "#",
  },
  {
    id: 6,
    name: "Strategic Plan Form 2024-2025",
    size: "78.30 KB",
    lastUpdated: "2024-01-10",
    downloadUrl: "#",
  },
  {
    id: 7,
    name: "Self-Review Report Template",
    size: "156.20 KB",
    lastUpdated: "2023-12-05",
    downloadUrl: "#",
  },
  {
    id: 8,
    name: "Annual Report Template",
    size: "89.45 KB",
    lastUpdated: "2023-11-20",
    downloadUrl: "#",
  },
  {
    id: 9,
    name: "Accreditation Checklist",
    size: "45.80 KB",
    lastUpdated: "2023-10-15",
    downloadUrl: "#",
  },
];

// Storage key
const STORAGE_KEY = "must_releases_forms_data";

// Get files from localStorage or use defaults
function getFiles() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFiles));
  return defaultFiles;
}

// Save files to localStorage
function saveFiles(files) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

// Current state
let currentPage = 1;
let displayedFiles = [];

// Check if user is admin
function originalIsUserAdmin() {
  return (
    typeof currentUser !== "undefined" &&
    currentUser &&
    currentUser.role === "admin"
  );
}

// Render files with pagination
function renderFiles(page = 1, append = false) {
  const files = getFiles();
  const container = document.getElementById("files-list-container");
  const viewMoreBtn = document.getElementById("view-more-btn");
  const paginationContainer = document.getElementById("pagination-container");

  if (!container) return;

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageFiles = files.slice(startIndex, endIndex);

  if (!append) {
    container.innerHTML = "";
    displayedFiles = [];
  }

  // Add files to displayed list
  pageFiles.forEach((file) => {
    displayedFiles.push(file);
    const fileCard = createFileCard(file);
    container.appendChild(fileCard);
  });

  // Show/hide View More button
  const hasMore = endIndex < files.length;
  if (viewMoreBtn) {
    viewMoreBtn.style.display = hasMore ? "inline-block" : "none";
    viewMoreBtn.textContent = hasMore ? "View More" : "No more";
  }

  // Render pagination
  renderPagination(files.length, page);

  // Update admin controls visibility
  updateAdminControls();
}

// Create file card HTML
function createFileCard(file) {
  const isAdmin = isUserAdmin();
  const card = document.createElement("div");
  card.className = "file-card";
  card.dataset.id = file.id;

  card.innerHTML = `
    <div class="file-icon">📄</div>
    <div class="file-details">
      <h3 class="file-name">${file.name}</h3>
      <p class="file-meta">
        <span class="file-size">${file.size}</span>
        <span class="file-separator">|</span>
        <span class="file-date">Updated: ${file.lastUpdated}</span>
      </p>
    </div>
    <div class="file-actions">
      <a href="${file.downloadUrl}" class="btn-download" download>📥 Download Word</a>
      ${
        isAdmin
          ? `
        <button class="btn-edit-file" onclick="editFile(${file.id})">✏️ Edit</button>
        <button class="btn-delete-file" onclick="deleteFile(${file.id})">🗑️ Delete</button>
      `
          : ""
      }
    </div>
  `;

  return card;
}

// Render pagination numbers
function renderPagination(totalItems, currentPage) {
  const container = document.getElementById("pagination-container");
  if (!container) return;

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    html += `<button class="page-num ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
  }

  container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
  currentPage = page;
  renderFiles(page, false);
}

// View More button handler
function viewMore() {
  currentPage++;
  renderFiles(currentPage, true);
}

// Show admin controls only for admin
function updateAdminControls() {
  const isAdmin = isUserAdmin();
  const adminSection = document.getElementById("admin-add-form");
  const editButtons = document.querySelectorAll(
    ".btn-edit-file, .btn-delete-file",
  );

  if (adminSection) {
    adminSection.style.display = isAdmin ? "block" : "none";
  }

  editButtons.forEach((btn) => {
    btn.style.display = isAdmin ? "inline-block" : "none";
  });
}

// Add new file (admin only)
function addNewFile() {
  const name = document.getElementById("new-file-name").value.trim();
  const size = document.getElementById("new-file-size").value.trim();
  const date = document.getElementById("new-file-date").value.trim();
  const url = document.getElementById("new-file-url").value.trim() || "#";

  if (!name || !size || !date) {
    showToast("Please fill in all required fields", "error");
    return;
  }

  const files = getFiles();
  const newFile = {
    id: Date.now(),
    name: name,
    size: size,
    lastUpdated: date,
    downloadUrl: url,
  };

  files.unshift(newFile); // Add to beginning
  saveFiles(files);

  // Clear form
  document.getElementById("new-file-name").value = "";
  document.getElementById("new-file-size").value = "";
  document.getElementById("new-file-date").value = "";
  document.getElementById("new-file-url").value = "";

  showToast("File added successfully!", "success");

  // Re-render
  currentPage = 1;
  renderFiles(1, false);
}

// Edit file (admin only)
function editFile(id) {
  const files = getFiles();
  const file = files.find((f) => f.id === id);
  if (!file) return;

  const newName = prompt("Enter new name:", file.name);
  if (newName === null) return;

  const newSize = prompt("Enter new size (e.g., 55.09 KB):", file.size);
  if (newSize === null) return;

  const newDate = prompt("Enter new date (YYYY-MM-DD):", file.lastUpdated);
  if (newDate === null) return;

  file.name = newName || file.name;
  file.size = newSize || file.size;
  file.lastUpdated = newDate || file.lastUpdated;

  saveFiles(files);
  showToast("File updated successfully!", "success");
  renderFiles(currentPage, false);
}

// Delete file (admin only)
function deleteFile(id) {
  if (!confirm("Are you sure you want to delete this file?")) return;

  let files = getFiles();
  files = files.filter((f) => f.id !== id);
  saveFiles(files);

  showToast("File deleted successfully!", "success");

  // Adjust current page if needed
  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  if (currentPage > totalPages && currentPage > 1) {
    currentPage = totalPages;
  }

  renderFiles(currentPage, false);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the releases-forms page
  const releasesPage = document.getElementById("page-releases-forms");
  if (releasesPage) {
    currentPage = 1;
    renderFiles(1, false);
    initAdminToggle();
  }
});

// Admin testing toggle
let isTestAdmin = false;

function initAdminToggle() {
  // Create toggle button if not exists
  let toggleBtn = document.getElementById("admin-toggle-btn");
  if (!toggleBtn) {
    const container = document.querySelector(".form-container");
    if (container) {
      const toggleWrapper = document.createElement("div");
      toggleWrapper.className = "admin-toggle-wrapper";
      toggleWrapper.innerHTML = `
        <button id="admin-toggle-btn" class="btn-admin-toggle" onclick="toggleAdminMode()">
          🔧 Login as Admin (Test)
        </button>
      `;
      container.insertBefore(toggleWrapper, container.firstChild);
    }
  }
  updateToggleButton();
}

function toggleAdminMode() {
  isTestAdmin = !isTestAdmin;
  updateToggleButton();
  updateAdminControls();
  renderFiles(currentPage, false);
  showToast(
    isTestAdmin ? "Admin mode enabled" : "Admin mode disabled",
    "success",
  );
}

function updateToggleButton() {
  const btn = document.getElementById("admin-toggle-btn");
  if (btn) {
    btn.textContent = isTestAdmin
      ? "🔧 Logout Admin (Test)"
      : "🔧 Login as Admin (Test)";
    btn.classList.toggle("active", isTestAdmin);
  }
}

// Override isUserAdmin to include test mode

function isUserAdmin() {
  return  isTestAdmin|| originalIsUserAdmin();
}

// Expose functions globally
window.goToPage = goToPage;
window.viewMore = viewMore;
window.addNewFile = addNewFile;
window.editFile = editFile;
window.deleteFile = deleteFile;
