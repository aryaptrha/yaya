/* ==========================================================================
   About page behaviour.

   Previously this file drove GSAP + ScrollTrigger and Bootstrap's carousel.
   Both are gone: reveals now use one IntersectionObserver and the gallery is a
   CSS scroll-snap strip, which removes ~380KB of JS/CSS from a mobile page and
   fixes two real bugs — GSAP parked off-screen items at x:±100 (creating
   horizontal page overflow) and left them invisible whenever ScrollTrigger
   never fired.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initScrollAffordances();
    initReveals();
    initTerms();
    initEasterEgg();
    initGallery();
    initMusic();
    initCursor();
    initCardTilt();
    initParticles();

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------ theme */

  function initTheme() {
    var btn = document.getElementById('themeToggleBtn');
    var icon = document.getElementById('themeIcon');
    var meta = document.getElementById('themeColorMeta');
    if (!btn) return;

    // The inline head script already applied the stored/preferred theme; this
    // only keeps the control's label and icon in sync with it.
    sync(document.documentElement.getAttribute('data-theme') === 'dark');

    btn.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') !== 'dark';
      document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      try {
        localStorage.setItem('theme', dark ? 'dark' : 'light');
      } catch (e) {
        /* storage unavailable — the theme still applies for this page view */
      }
      sync(dark);
    });

    function sync(dark) {
      if (icon) icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      if (meta) meta.setAttribute('content', dark ? '#0a0a0c' : '#f4f3f9');
    }
  }

  /* ------------------------------------------------------------ navigation */

  function initScrollAffordances() {
    var bar = document.getElementById('scrollProgress');
    var toTop = document.getElementById('toTopBtn');
    var ticking = false;

    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      if (bar) bar.style.transform = 'scaleX(' + ratio + ')';
      if (toTop) toTop.hidden = doc.scrollTop < 600;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ----------------------------------------------------------------- reveals */

  function initReveals() {
    var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

    function show(el) {
      el.classList.add('is-visible');
      el.querySelectorAll('.meter__fill').forEach(function (fill) {
        fill.style.width = fill.getAttribute('data-value') + '%';
      });
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(show);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------- tooltips */

  function initTerms() {
    var terms = Array.prototype.slice.call(document.querySelectorAll('.term[aria-expanded]'));
    if (!terms.length) return;

    function closeAll(except) {
      terms.forEach(function (term) {
        if (term !== except) term.setAttribute('aria-expanded', 'false');
      });
    }

    terms.forEach(function (term) {
      term.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = term.getAttribute('aria-expanded') === 'true';
        closeAll(term);
        term.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (!open) keepInViewport(term.nextElementSibling);
      });
    });

    document.addEventListener('click', function () {
      closeAll(null);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeAll(null);
    });
  }

  // Nudge a popup back inside the viewport when it would spill off an edge —
  // the old fixed-width tooltips ran off the screen on narrow phones.
  function keepInViewport(pop) {
    if (!pop) return;
    pop.style.transform = '';
    var rect = pop.getBoundingClientRect();
    var margin = 8;
    var shift = 0;
    if (rect.left < margin) shift = margin - rect.left;
    else if (rect.right > window.innerWidth - margin) shift = window.innerWidth - margin - rect.right;
    if (shift) pop.style.transform = 'translate(calc(-50% + ' + Math.round(shift) + 'px), 0)';
  }

  /* ------------------------------------------------------------ easter egg */

  function initEasterEgg() {
    var trigger = document.getElementById('bandungText');
    if (!trigger) return;

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      spawnConfetti();

      var message = document.createElement('div');
      message.className = 'egg-toast';
      message.setAttribute('role', 'status');
      message.textContent = '💖 Bandung! 💖';
      document.body.appendChild(message);
      window.setTimeout(function () {
        message.remove();
      }, 2000);
    });
  }

  function spawnConfetti() {
    // Skip the burst of animated nodes for anyone who asked for less motion;
    // the message above still shows.
    if (reduceMotion) return;

    var colors = ['#ff2e97', '#00f3ff', '#b537f2', '#f9f002'];
    var count = window.innerWidth < 700 ? 40 : 90;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = piece.style.height = Math.random() * 8 + 5 + 'px';
      piece.style.animationDuration = Math.random() * 2 + 2.5 + 's';
      frag.appendChild(piece);
    }
    document.body.appendChild(frag);

    window.setTimeout(function () {
      document.querySelectorAll('.confetti').forEach(function (piece) {
        piece.remove();
      });
    }, 5000);
  }

  /* ----------------------------------------------------------------- gallery */

  function initGallery() {
    var viewport = document.getElementById('galleryViewport');
    var dotsWrap = document.getElementById('galleryDots');
    var prev = document.getElementById('galleryPrev');
    var next = document.getElementById('galleryNext');
    var play = document.getElementById('galleryPlay');
    var playIcon = document.getElementById('galleryPlayIcon');
    var count = document.getElementById('galleryCount');
    if (!viewport) return;

    var slides = Array.prototype.slice.call(viewport.querySelectorAll('.slide'));
    if (!slides.length) return;

    var index = 0;
    var timer = null;
    // Autoplay is opt-out, but never starts under reduced motion.
    var autoplay = !reduceMotion;

    var dots = slides.map(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery__dot';
      dot.setAttribute('aria-label', 'Photo ' + (i + 1));
      dot.addEventListener('click', function () {
        stopAutoplay();
        goTo(i);
      });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i, instant) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      viewport.scrollTo({
        left: index * viewport.clientWidth,
        behavior: instant || reduceMotion ? 'auto' : 'smooth'
      });
      render();
    }

    function render() {
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (count) count.textContent = index + 1 + ' / ' + slides.length;
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === slides.length - 1;
    }

    function startAutoplay() {
      stopTimer();
      autoplay = true;
      timer = window.setInterval(function () {
        // Jump straight back to the first photo at the end rather than smooth
        // scrolling all the way back through the strip.
        if (index >= slides.length - 1) goTo(0, true);
        else goTo(index + 1);
      }, 5000);
      syncPlayButton();
    }

    function stopAutoplay() {
      autoplay = false;
      stopTimer();
      syncPlayButton();
    }

    function stopTimer() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function syncPlayButton() {
      if (!play) return;
      play.setAttribute('aria-label', autoplay ? 'Pause slideshow' : 'Play slideshow');
      if (playIcon) playIcon.className = autoplay ? 'fas fa-pause' : 'fas fa-play';
    }

    if (prev) {
      prev.addEventListener('click', function () {
        stopAutoplay();
        goTo(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        stopAutoplay();
        goTo(index + 1);
      });
    }
    if (play) {
      play.addEventListener('click', function () {
        if (autoplay) stopAutoplay();
        else startAutoplay();
      });
    }

    // Arrow keys move a whole slide instead of nudging the scroll container.
    viewport.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      stopAutoplay();
      goTo(index + (event.key === 'ArrowRight' ? 1 : -1));
    });

    // Keep state in sync with swipes and any other native scrolling.
    var ticking = false;
    viewport.addEventListener(
      'scroll',
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          var width = viewport.clientWidth;
          if (!width) return;
          var current = Math.round(viewport.scrollLeft / width);
          if (current !== index) {
            index = current;
            render();
          }
        });
      },
      { passive: true }
    );

    viewport.addEventListener('pointerdown', stopAutoplay);

    if (finePointer) {
      viewport.addEventListener('mouseenter', stopTimer);
      viewport.addEventListener('mouseleave', function () {
        if (autoplay) startAutoplay();
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopTimer();
      else if (autoplay) startAutoplay();
    });

    // Slide width changes with the viewport, so realign after a resize.
    window.addEventListener('resize', function () {
      goTo(index, true);
    });

    render();
    syncPlayButton();
    if (autoplay) startAutoplay();
  }

  /* ------------------------------------------------------------------- music */

  function initMusic() {
    var toggle = document.getElementById('musicToggle');
    var audio = document.getElementById('backgroundMusic');
    if (!toggle || !audio) return;

    toggle.addEventListener('click', function () {
      if (!audio.paused) {
        audio.pause();
        return;
      }
      audio.play().catch(function () {
        // Autoplay policy or a missing file rejected playback.
        sync();
      });
    });

    function sync() {
      var playing = !audio.paused;
      toggle.classList.toggle('is-playing', playing);
      toggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    }

    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    sync();
  }

  /* ------------------------------------------------------------ desktop fx */

  function initCursor() {
    var dot = document.querySelector('.cursor-dot');
    var outline = document.querySelector('.cursor-outline');
    if (!dot || !outline) return;

    // Desktop decoration only. CSS hides both elements below 880px, so skip the
    // per-frame work entirely on touch devices and under reduced motion.
    if (reduceMotion || !finePointer || !window.matchMedia('(min-width: 880px)').matches) return;

    var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var trail = { x: pointer.x, y: pointer.y };
    var scale = 1;

    document.addEventListener(
      'mousemove',
      function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      },
      { passive: true }
    );

    (function follow() {
      trail.x += (pointer.x - trail.x) * 0.2;
      trail.y += (pointer.y - trail.y) * 0.2;
      dot.style.transform = 'translate(' + pointer.x + 'px,' + pointer.y + 'px) translate(-50%,-50%)';
      outline.style.transform =
        'translate(' + trail.x + 'px,' + trail.y + 'px) translate(-50%,-50%) scale(' + scale + ')';
      window.requestAnimationFrame(follow);
    })();

    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        scale = 1.5;
      });
      el.addEventListener('mouseleave', function () {
        scale = 1;
      });
    });
  }

  function initCardTilt() {
    if (reduceMotion || !finePointer) return;

    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (event) {
        var rect = card.getBoundingClientRect();
        var tiltX = (rect.height / 2 - (event.clientY - rect.top)) / 14;
        var tiltY = ((event.clientX - rect.left) - rect.width / 2) / 14;
        // The lift is included here because an inline transform overrides the
        // `.card:hover` rule — previously the two fought and the lift was lost.
        card.style.transform =
          'perspective(900px) translateY(-4px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  function initParticles() {
    var container = document.getElementById('particles-js');
    if (!container || typeof window.particlesJS === 'undefined') return;

    // Purely decorative, and expensive: skip it under reduced motion, on small
    // screens (the CSS grid already carries the look) and on metered data.
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData || window.innerWidth < 700) return;

    window.particlesJS('particles-js', {
      particles: {
        number: { value: 48, density: { enable: true, value_area: 900 } },
        color: { value: '#b537f2' },
        shape: { type: 'circle' },
        opacity: { value: 0.45 },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#b537f2', opacity: 0.35, width: 1 },
        move: { enable: true, speed: 2.2, direction: 'none', out_mode: 'out' }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: false },
          resize: true
        },
        modes: { repulse: { distance: 140, duration: 0.4 } }
      },
      retina_detect: true
    });
  }
})();
