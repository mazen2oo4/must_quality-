/* ===================================================
   slider.js — Hero Image Slider
   =================================================== */

(function () {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('slider-dots');
  let currentSlide = 0;
  let sliderTimer;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'الانتقال إلى الشريحة ' + (i + 1));
    d.onclick = () => { goSlide(i); resetTimer(); };
    dotsContainer.appendChild(d);
  });

  function goSlide(n) {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.dot')[currentSlide].classList.add('active');
  }

  function resetTimer() {
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => goSlide(currentSlide + 1), 4500);
  }

  // Expose changeSlide globally for the prev/next buttons
  window.changeSlide = function (dir) {
    goSlide(currentSlide + dir);
    resetTimer();
  };

  resetTimer();
})();
