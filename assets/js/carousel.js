/**
 * Centrum 2spraak - Carousel
 * Horizontal scroll-snap carousel with prev/next buttons and optional autoplay.
 * Markup: [data-carousel] > .carousel-prev, .carousel-track > .carousel-slide, .carousel-next
 * Autoplay interval (ms) via data-autoplay; disabled for prefers-reduced-motion.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initCarousel(carousel) {
    var track = carousel.querySelector('.carousel-track');
    var prev = carousel.querySelector('.carousel-prev');
    var next = carousel.querySelector('.carousel-next');
    var interval = Number(carousel.getAttribute('data-autoplay')) || 0;
    var timer = null;
    var paused = false;

    if (!track || !track.children.length) {
      return;
    }

    function stepSize() {
      var slide = track.children[0];
      var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return track.scrollWidth - track.clientWidth;
    }

    function go(direction) {
      var max = maxScroll();

      if (direction > 0 && track.scrollLeft >= max - 4) {
        track.scrollTo({ left: 0 });
      } else if (direction < 0 && track.scrollLeft <= 4) {
        track.scrollTo({ left: max });
      } else {
        track.scrollBy({ left: direction * stepSize() });
      }
    }

    function updateStatic() {
      carousel.classList.toggle('is-static', maxScroll() <= 4);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (interval > 0 && !reduceMotion && !paused && !document.hidden && maxScroll() > 4) {
        timer = window.setInterval(function () {
          go(1);
        }, interval);
      }
    }

    function pause() {
      paused = true;
      stop();
    }

    function resume() {
      paused = false;
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', function (event) {
      if (!carousel.contains(event.relatedTarget)) {
        resume();
      }
    });
    track.addEventListener('touchstart', pause, { passive: true });

    document.addEventListener('visibilitychange', start);
    window.addEventListener('resize', function () {
      updateStatic();
      start();
    }, { passive: true });

    updateStatic();
    start();
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
})();
