document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initParticles(reduceMotion);
  initCustomCursor(reduceMotion);
  initThemeToggle();
  initBandungEasterEgg(reduceMotion);
  initMusicPlayer();
  initSigmaHover();
  initSigmaAmbientMotion(reduceMotion);
  initSmoothAnchorLinks(reduceMotion);
  initScrollReveals(reduceMotion);
  initCardTilt(reduceMotion);
});

// ---------------------------------------------------------------------------
// Background & cursor
// ---------------------------------------------------------------------------

function initParticles(reduceMotion) {
  const container = document.getElementById('particles-js');
  if (!container) return;

  // Decorative background only: skip the animated particle network entirely
  // when reduced motion is requested or the CDN script failed to load.
  if (reduceMotion || typeof particlesJS === 'undefined') return;

  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#b537f2' },
      shape: { type: 'circle', stroke: { width: 0, color: '#000000' }, polygon: { nb_sides: 5 } },
      opacity: { value: 0.5, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
      line_linked: { enable: true, distance: 150, color: '#b537f2', opacity: 0.4, width: 1 },
      move: {
        enable: true,
        speed: 6,
        direction: 'none',
        random: false,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 1200 },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'repulse' },
        onclick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        grab: { distance: 400, line_linked: { opacity: 1 } },
        bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
        repulse: { distance: 200, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 },
      },
    },
    retina_detect: true,
  });
}

function initCustomCursor(reduceMotion) {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  if (!cursorDot || !cursorOutline) return;

  // Desktop-only decoration; also skip it under reduced motion since it is a
  // perpetual per-frame effect and the native cursor is already visible
  // (about.css never hides it with `cursor: none`).
  if (reduceMotion || !window.matchMedia('(min-width: 768px)').matches) return;

  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const outline = { x: pointer.x, y: pointer.y };

  document.addEventListener('mousemove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    cursorDot.style.left = `${pointer.x}px`;
    cursorDot.style.top = `${pointer.y}px`;
  }, { passive: true });

  // The outline eases toward the pointer every frame instead of snapping to
  // a position captured 80ms ago, which used to make it visibly lag/stutter.
  function followPointer() {
    outline.x += (pointer.x - outline.x) * 0.2;
    outline.y += (pointer.y - outline.y) * 0.2;
    cursorOutline.style.left = `${outline.x}px`;
    cursorOutline.style.top = `${outline.y}px`;
    requestAnimationFrame(followPointer);
  }
  requestAnimationFrame(followPointer);

  function setCursorScale(scale) {
    cursorDot.style.transform = `translate(-50%, -50%) scale(${scale})`;
    cursorOutline.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  document.addEventListener('mousedown', () => setCursorScale(0.7));
  document.addEventListener('mouseup', () => setCursorScale(1));

  document.querySelectorAll('a, button, .interactive-element').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      setCursorScale(1.5);
      cursorOutline.style.borderColor = currentAccentColor();
    });
    element.addEventListener('mouseleave', () => {
      setCursorScale(1);
      cursorOutline.style.borderColor = currentAccentColor();
    });
  });
}

function currentAccentColor() {
  return document.body.classList.contains('dark-mode') ? '#ff2e97' : '#b537f2';
}

// ---------------------------------------------------------------------------
// Theme & page interactions
// ---------------------------------------------------------------------------

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    toggleBtn.textContent = isDark ? '🌞' : '🌜';

    const accent = currentAccentColor();
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    if (cursorDot) cursorDot.style.backgroundColor = accent;
    if (cursorOutline) cursorOutline.style.borderColor = accent;

    const gradient = isDark
      ? 'linear-gradient(to right, var(--neon-pink), var(--neon-purple))'
      : 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))';
    document.querySelectorAll('.progress-bar').forEach((bar) => {
      bar.style.background = gradient;
    });
  });
}

function initBandungEasterEgg(reduceMotion) {
  const trigger = document.getElementById('bandungText');
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    spawnConfetti(reduceMotion);

    const message = document.createElement('div');
    message.textContent = '💖 Bandung! 💖';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.padding = '20px';
    message.style.background = document.body.classList.contains('dark-mode')
      ? 'rgba(255, 46, 151, 0.8)'
      : 'rgba(181, 55, 242, 0.8)';
    message.style.color = 'white';
    message.style.borderRadius = '10px';
    message.style.zIndex = '1000';
    message.style.fontWeight = 'bold';
    message.style.fontSize = '2rem';
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 2000);
  });
}

function spawnConfetti(reduceMotion) {
  // Skip the burst of 100 animated nodes for anyone who asked for less
  // motion; the Easter egg message above still shows.
  if (reduceMotion) return;

  const colors = ['#ff2e97', '#00f3ff', '#b537f2', '#f9f002'];
  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * window.innerWidth}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 10 + 5}px`;
    piece.style.height = `${Math.random() * 10 + 5}px`;
    piece.style.opacity = String(Math.random() + 0.5);
    piece.style.animationDuration = `${Math.random() * 3 + 2}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

function initMusicPlayer() {
  const musicToggle = document.getElementById('musicToggle');
  const backgroundMusic = document.getElementById('backgroundMusic');
  if (!musicToggle || !backgroundMusic) return;

  musicToggle.addEventListener('click', async () => {
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
      musicToggle.classList.remove('music-playing');
      return;
    }

    try {
      await backgroundMusic.play();
      musicToggle.classList.add('music-playing');
    } catch {
      // Autoplay policies or an unavailable audio file can reject playback.
      musicToggle.classList.remove('music-playing');
    }
  });
}

function initSigmaHover() {
  const sigmaText = document.getElementById('sigmaText');
  if (!sigmaText) return;

  sigmaText.addEventListener('mouseover', () => {
    sigmaText.style.transition = 'transform 0.3s ease';
    sigmaText.style.transform = 'scale(1.2) rotate(5deg)';
  });

  sigmaText.addEventListener('mouseout', () => {
    sigmaText.style.transform = 'scale(1) rotate(0deg)';
  });
}

// ---------------------------------------------------------------------------
// Scroll-driven motion
// ---------------------------------------------------------------------------

function initSmoothAnchorLinks(reduceMotion) {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      // Native smooth scrolling. The old code called gsap.to(window, {scrollTo})
      // without ever loading ScrollToPlugin, so this did nothing at all.
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

function initScrollReveals(reduceMotion) {
  // No GSAP/ScrollTrigger, or reduced motion requested: show every
  // scroll-revealed element up front instead of leaving it invisible. This is
  // also the single source of truth for these reveals now — they used to be
  // triggered redundantly by baked-in animate.css classes, a duplicate
  // IntersectionObserver, and GSAP all at once, which caused a visible
  // double-fade/flicker.
  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    document.querySelectorAll('.timeline-item, .section-title, .normal-card, p').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.progress-bar').forEach((bar) => {
      bar.style.width = bar.getAttribute('data-width');
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.timeline-item.left', {
    scrollTrigger: { trigger: '.timeline', start: 'top 80%', toggleActions: 'play none none none' },
    x: -100,
    opacity: 0,
    duration: 1,
    stagger: 0.3,
    ease: 'back.out(1.7)',
  });

  gsap.from('.timeline-item.right', {
    scrollTrigger: { trigger: '.timeline', start: 'top 80%', toggleActions: 'play none none none' },
    x: 100,
    opacity: 0,
    duration: 1,
    stagger: 0.3,
    ease: 'back.out(1.7)',
  });

  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.from(title, {
      scrollTrigger: { trigger: title, start: 'top 80%', toggleActions: 'play none none none' },
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  gsap.utils.toArray('.normal-card').forEach((card) => {
    if (card.closest('.timeline-item')) return; // covered by the timeline tweens above
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  });

  gsap.utils.toArray('p').forEach((paragraph) => {
    if (paragraph.closest('.timeline-item') || paragraph.closest('.carousel-caption')) return;
    gsap.from(paragraph, {
      scrollTrigger: { trigger: paragraph, start: 'top 85%', toggleActions: 'play none none none' },
      opacity: 0,
      y: 20,
      duration: 1,
      ease: 'power2.out',
    });
  });

  gsap.utils.toArray('.progress-bar').forEach((bar) => {
    gsap.to(bar, {
      scrollTrigger: { trigger: bar, start: 'top 90%', toggleActions: 'play none none none' },
      width: bar.getAttribute('data-width'),
      duration: 1.5,
      ease: 'power2.out',
    });
  });
}

function initSigmaAmbientMotion(reduceMotion) {
  const sigmaText = document.getElementById('sigmaText');
  if (!sigmaText) return;

  // Perpetual ambient loop, not essential motion: skip it entirely rather
  // than just shortening it, same treatment as the other continuous effects.
  if (reduceMotion || typeof gsap === 'undefined') return;

  gsap.to(sigmaText, {
    scale: 1.1,
    rotation: 5,
    duration: 1.5,
    ease: 'elastic.out(1, 0.3)',
    repeat: -1,
    yoyo: true,
  });
}

function initCardTilt(reduceMotion) {
  if (reduceMotion || typeof gsap === 'undefined') return;

  document.querySelectorAll('.hover-lift').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const tiltX = (rect.height / 2 - y) / 10;
      const tiltY = (x - rect.width / 2) / 10;

      gsap.to(card, {
        duration: 0.5,
        rotationX: tiltX,
        rotationY: tiltY,
        transformPerspective: 1000,
        ease: 'power1.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { duration: 0.5, rotationX: 0, rotationY: 0, ease: 'power3.out' });
    });
  });
}
