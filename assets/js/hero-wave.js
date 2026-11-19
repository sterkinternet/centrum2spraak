/**
 * Centrum 2spraak - Spraakgolf in de homepage-hero
 * Lijnen in de merkkleuren die bewegen als een stem (lettergrepen en pauzes)
 * en groter worden als de muis in de buurt komt.
 * Pauzeert buiten beeld; staat stil bij prefers-reduced-motion.
 */
(function () {
  'use strict';

  var hero = document.querySelector('.hero-wave');
  var canvas = hero && hero.querySelector('.hero-wave-canvas');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var lines = [
    { color: 'rgba(255, 255, 255, 0.95)', width: 3, freq: 0.011, phase: 0, amp: 1 },
    { color: 'rgba(232, 50, 124, 0.95)', width: 3.5, freq: 0.008, phase: 1.4, amp: 0.85 },
    { color: 'rgba(0, 170, 213, 0.95)', width: 3, freq: 0.014, phase: 2.6, amp: 0.75 },
    { color: 'rgba(255, 255, 255, 0.5)', width: 1.5, freq: 0.019, phase: 3.3, amp: 0.55 },
    { color: 'rgba(110, 55, 127, 0.85)', width: 2.5, freq: 0.006, phase: 4.1, amp: 0.9 }
  ];

  var width = 0;
  var height = 0;
  var time = 0;
  var pointer = { x: -1e4, y: -1e4 };
  var inView = true;

  function resize() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (reduceMotion) draw();
  }

  // Spraakritme: korte uitbarstingen (lettergrepen) binnen zinnen, met pauzes ertussen
  function speech(s) {
    var syllable = Math.pow(Math.max(0, Math.sin(s * 6.2)), 1.5);
    var phrase = Math.min(1, Math.max(0, Math.sin(s * 0.9) + 0.35));
    return syllable * phrase;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    var mid = height * 0.9;
    var base = Math.min(height * 0.09, 46);
    ctx.lineCap = 'round';

    lines.forEach(function (line) {
      ctx.beginPath();
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.width;
      for (var x = 0; x <= width; x += 4) {
        var near = Math.max(0, 1 - Math.hypot(x - pointer.x, mid - pointer.y) / 280);
        var taper = Math.pow(Math.sin(Math.PI * x / width), 0.7);
        var envelope = (0.15 + speech(time - x / 520 + line.phase * 0.05) * 0.85 + near) * taper;
        var y = mid +
          Math.sin(x * line.freq + time * 3.2 + line.phase) *
          Math.sin(x * line.freq * 0.37 - time * 1.1 + line.phase) *
          base * envelope * line.amp * 1.7;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  function loop() {
    if (inView && !document.hidden) {
      time += 1 / 60;
      draw();
    }
    window.requestAnimationFrame(loop);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(resize).observe(hero);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  if (reduceMotion) {
    time = 2;
    draw();
    return;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
    }).observe(hero);
  }

  hero.addEventListener('pointermove', function (e) {
    var rect = hero.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  hero.addEventListener('pointerleave', function () {
    pointer.x = pointer.y = -1e4;
  });

  loop();
})();
