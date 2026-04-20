/* ===================================================
   social-scroll.js — Social Media Fixed Scroll Behavior
   =================================================== */

(function () {
  const socialContainer = document.querySelector(".social-fixed");
  if (!socialContainer) return;

  let lastScrollY = 0;
  let ticking = false;
  let visible = true;

  function updateSocialPosition() {
    const currentScrollY = window.scrollY;

    // Show when scrolling down, hide when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down - hide the social icons
      if (visible) {
        socialContainer.style.transform = "translateY(-100%)";
        socialContainer.style.opacity = "0";
        visible = false;
      }
    } else {
      // Scrolling up - show the social icons
      if (!visible) {
        socialContainer.style.transform = "translateY(0)";
        socialContainer.style.opacity = "1";
        visible = true;
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateSocialPosition);
        ticking = true;
      }
    },
    { passive: true },
  );

  // Initialize position
  socialContainer.style.transition = "transform 0.3s ease, opacity 0.3s ease";
})();
