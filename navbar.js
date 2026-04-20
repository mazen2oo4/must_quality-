// ===== Highlight active main navbar button =====
var mainNavBtns = document.querySelectorAll(
  ".nav-reports-btn, .nav-simple-link, .auth-dashboard-link",
);
mainNavBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    mainNavBtns.forEach(function (b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
  });
});
document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // DOM elements
  var body = document.body;
  var menuBtn = document.querySelector(".custom-menu-btn");
  var menuCloseBtn = document.querySelector(".nav-menu-close");
  var navMenu = document.querySelector(".nav-menu");
  var menuBackdrop = document.querySelector(".menu-backdrop");
  var menuLinks = document.querySelectorAll(".nav-menu a");
  var submenuToggles = document.querySelectorAll(".submenu-toggle");

  // Open mobile menu
  function openMenu() {
    if (!menuBtn || !navMenu || !menuBackdrop) return;
    navMenu.classList.add("active");
    menuBackdrop.classList.add("active");
    menuBtn.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    navMenu.setAttribute("aria-hidden", "false");
    body.classList.add("menu-open");
  }

  // Close mobile menu
  function closeMenu() {
    if (!menuBtn || !navMenu || !menuBackdrop) return;
    navMenu.classList.remove("active");
    menuBackdrop.classList.remove("active");
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    navMenu.setAttribute("aria-hidden", "true");
    body.classList.remove("menu-open");
  }

  // Toggle mobile menu button
  if (menuBtn) {
    menuBtn.addEventListener("click", function (event) {
      event.preventDefault();
      if (navMenu.classList.contains("active")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Close button inside mobile menu
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeMenu);
  }

  // Backdrop click closes menu
  if (menuBackdrop) {
    menuBackdrop.addEventListener("click", closeMenu);
  }

  // Close menu on Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Submenu toggles inside mobile menu
  submenuToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var parent = toggle.closest(".has-submenu");
      var expanded = toggle.getAttribute("aria-expanded") === "true";

      // Close all other open submenus
      submenuToggles.forEach(function (otherToggle) {
        if (otherToggle !== toggle) {
          otherToggle.setAttribute("aria-expanded", "false");
          otherToggle.closest(".has-submenu").classList.remove("open");
        }
      });

      toggle.setAttribute("aria-expanded", String(!expanded));
      parent.classList.toggle("open", !expanded);
    });
  });

  // Close menu when any nav link is clicked
  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeMenu();
    });
  });
});
