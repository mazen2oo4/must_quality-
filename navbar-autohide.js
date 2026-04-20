// Auto-hide navbar on scroll down, show on scroll up
(function () {
  var navbar = document.querySelector('.big-navbar');
  if (!navbar) return;
  var lastScrollY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      // Scroll down: hide navbar
      navbar.style.transform = 'translateY(-100%)';
      navbar.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)';
    } else {
      // Scroll up: show navbar
      navbar.style.transform = 'translateY(0)';
      navbar.style.transition = 'transform 0.3s cubic-bezier(.4,0,.2,1)';
    }
    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
})();
