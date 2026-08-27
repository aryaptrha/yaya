document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
  document.body.classList.remove('fade-out');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initNameAnimation(reduceMotion);
  initScrollAnimations(reduceMotion);
  initBackground(reduceMotion);
  initScrollIndicator(reduceMotion);
  initPageTransitions(reduceMotion);
});

// A page restored from the back/forward cache keeps its previous classes and
// timers, so always restore the visible state when it becomes active again.
window.addEventListener('pageshow', () => {
  document.body.classList.add('fade-in');
  document.body.classList.remove('fade-out');
});

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function initNameAnimation(reduceMotion) {
  const NAME = 'ARYAPUTRA';
  const nameElement = document.getElementById('name-animation');
  const navLinks = document.getElementById('nav-links');
  if (!nameElement) return;

  nameElement.textContent = '';

  const chars = Array.from(NAME, (letter) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.classList.add('name-hover');
    span.style.opacity = '0';
    // The container's aria-label already exposes the full name, so hide these
    // one-letter-at-a-time spans from assistive tech to avoid double reads.
    span.setAttribute('aria-hidden', 'true');
    nameElement.appendChild(span);
    return span;
  });

  // Screen readers get the whole name, not nine separate letters.
  nameElement.setAttribute('aria-label', NAME);

  if (reduceMotion || typeof gsap === 'undefined') {
    nameElement.style.opacity = '1';
    chars.forEach((span) => { span.style.opacity = '1'; });
    if (navLinks) navLinks.style.opacity = '1';
    return;
  }

  gsap.set(nameElement, { opacity: 1 });
  gsap.to(chars, {
    opacity: 1,
    stagger: 0.1,
    duration: 0.5,
    onComplete: () => {
      if (navLinks) gsap.to(navLinks, { opacity: 1, duration: 0.8, delay: 0.2 });
    },
  });
}

function initScrollAnimations(reduceMotion) {
  const revealed = ['#branding-title', '#contact-cta', '.skill-card', '#scroll-indicator'];

  // No scroll-triggered fades: show everything up front and skip the progress bar.
  if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    revealed.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.progress-bar', {
    width: '100%',
    ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

  gsap.to('#branding-title', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: { trigger: '#branding-section', start: 'top 80%', toggleActions: 'play none none none' },
  });

  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.2 * i,
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  gsap.to('#contact-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: { trigger: '#contact-cta', start: 'top 85%', toggleActions: 'play none none none' },
  });

  gsap.to('#scroll-indicator', { opacity: 1, duration: 0.8, delay: 1.5 });
}

// ---------------------------------------------------------------------------
// Three.js background
// ---------------------------------------------------------------------------

function initBackground(reduceMotion) {
  const canvas = document.getElementById('threejs-background');
  if (!canvas) return;

  // The canvas is pure decoration, so skip the WebGL context entirely when
  // reduced motion is requested or the library failed to load.
  if (reduceMotion || typeof THREE === 'undefined') {
    canvas.style.display = 'none';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  } catch (err) {
    console.warn('WebGL unavailable, skipping background:', err);
    canvas.style.display = 'none';
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // An uncapped devicePixelRatio means 3-4x the pixels on a modern phone for a
  // background nobody looks at directly.
  const MAX_PIXEL_RATIO = 1.5;
  function sizeRenderer() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  sizeRenderer();

  const COLORS = [0x00ff88, 0x00ffff, 0xff00ff, 0x9900ff];
  const shapes = [];

  for (let i = 0; i < 15; i++) {
    const radius = Math.random() * 0.7 + 0.4;
    const geometry = Math.random() < 0.5
      ? new THREE.IcosahedronGeometry(radius)
      : new THREE.OctahedronGeometry(radius);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    }));

    mesh.position.set(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * -15);
    mesh.userData = {
      home: mesh.position.clone(),
      spin: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      },
      pulseAmount: Math.random() * 0.1,
      pulseSpeed: 0.5 + Math.random(),
      pulseOffset: Math.random() * Math.PI * 2,
      baseScale: 0.8 + Math.random() * 0.4,
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  const parallax = { x: 0, y: 0 };
  window.addEventListener('mousemove', (event) => {
    parallax.x = (event.clientX / window.innerWidth) * 2 - 1;
    parallax.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // Coalesce bursts of resize events (window-edge dragging, mobile rotation)
  // into one recompute per animation frame instead of one per event.
  let resizeQueued = false;
  window.addEventListener('resize', () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      sizeRenderer();
    });
  });

  function render() {
    const time = performance.now() * 0.001;

    shapes.forEach((mesh) => {
      const data = mesh.userData;

      mesh.rotation.x += data.spin.x;
      mesh.rotation.y += data.spin.y;
      mesh.rotation.z += data.spin.z;

      const pulse = Math.sin(time * data.pulseSpeed + data.pulseOffset) * data.pulseAmount + 1;
      mesh.scale.setScalar(data.baseScale * pulse);

      // Offset from a fixed home position instead of adding to the current one
      // every frame, which used to let the shapes drift permanently off-screen.
      mesh.position.x = data.home.x + parallax.x * 0.6;
      mesh.position.y = data.home.y + parallax.y * 0.6;
    });

    renderer.render(scene, camera);
  }

  // setAnimationLoop already parks itself when the tab is hidden; the explicit
  // handler covers browsers that keep rAF ticking in background tabs.
  renderer.setAnimationLoop(render);
  document.addEventListener('visibilitychange', () => {
    renderer.setAnimationLoop(document.hidden ? null : render);
  });
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function initScrollIndicator(reduceMotion) {
  const indicator = document.getElementById('scroll-indicator');
  const target = document.getElementById('branding-section');
  if (!indicator || !target) return;

  const scrollToTarget = () => target.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });

  // Native smooth scrolling. The old code called gsap.to(window, {scrollTo})
  // without ever loading ScrollToPlugin, so clicking this did nothing at all.
  indicator.addEventListener('click', scrollToTarget);

  // It's a decorative <div> (tabindex/role are set in the markup), not a real
  // <button>, so it needs its own Enter/Space handling to be keyboard-operable.
  indicator.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    scrollToTarget();
  });
}

function initPageTransitions(reduceMotion) {
  // Must match the `.fade-out` transition duration in index.html, so the fade
  // finishes before we hand off to the next page instead of jump-cutting it.
  const FADE_OUT_MS = 500;
  let navigationTimer = null;

  document.querySelectorAll('nav a, a.nav-link').forEach((link) => {
    link.addEventListener('click', (event) => {
      // Leave anything that is not a plain left click to the browser:
      // new-tab, new-window, download and middle-click all still work.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      // Off-site links leave immediately; no point fading out a page we are
      // about to lose control of anyway.
      if (link.origin !== window.location.origin) return;

      if (reduceMotion) return;

      event.preventDefault();
      document.body.classList.add('fade-out');
      clearTimeout(navigationTimer);
      navigationTimer = setTimeout(() => { window.location.href = link.href; }, FADE_OUT_MS);
    });
  });
}
