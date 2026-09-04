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
  const tagline = document.getElementById('hero-tagline');
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
    if (tagline) { tagline.style.opacity = '1'; tagline.style.transform = 'none'; }
    if (navLinks) { navLinks.style.opacity = '1'; }
    return;
  }

  gsap.set(nameElement, { opacity: 1 });
  gsap.to(chars, {
    opacity: 1,
    stagger: 0.08,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      if (tagline) gsap.to(tagline, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
      if (navLinks) gsap.to(navLinks, { opacity: 1, duration: 0.8, delay: 0.15, ease: 'power2.out' });
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
    ease: 'power2.out',
    scrollTrigger: { trigger: '#branding-section', start: 'top 80%', toggleActions: 'play none none none' },
  });

  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.12 * i,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
      onComplete: () => {
        gsap.set(card, { clearProps: 'transform' });
      },
    });
  });

  gsap.to('#contact-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '#contact-cta', start: 'top 88%', toggleActions: 'play none none none' },
  });

  gsap.to('#scroll-indicator', { opacity: 1, duration: 0.8, delay: 1.2, ease: 'power2.out' });
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

  // Vibrant neon space palette
  const COLORS = [0x00ff88, 0x00f3ff, 0xff00ff, 0x9900ff, 0xffffff, 0xffe066];

  // Helper: Construct extruded 3D star geometry with bevels
  function create3DStarGeometry(points, outerRadius, innerRadius, depth) {
    const shape = new THREE.Shape();
    const step = Math.PI / points;
    for (let i = 0; i < 2 * points; i++) {
      const r = (i % 2 === 0) ? outerRadius : innerRadius;
      const angle = i * step - Math.PI / 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: outerRadius * 0.08,
      bevelThickness: depth * 0.35,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
  }

  // 1. Distant starry galaxy particle field
  const starCount = 280;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 55;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 55;
    starPositions[i * 3 + 2] = Math.random() * -30 - 2;

    const col = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
    starColors[i * 3] = col.r;
    starColors[i * 3 + 1] = col.g;
    starColors[i * 3 + 2] = col.b;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
  });

  const starField = new THREE.Points(starGeometry, starMaterial);
  scene.add(starField);

  // 2. Floating 3D holographic stars matching existing object size (radius 0.45 - 1.1)
  const shapes = [];
  const STAR_TYPES = [
    { points: 5, innerRatio: 0.42, depthRatio: 0.28 }, // Classic 5-pointed star
    { points: 4, innerRatio: 0.22, depthRatio: 0.25 }, // 4-pointed celestial sparkle star
    { points: 6, innerRatio: 0.48, depthRatio: 0.26 }, // 6-pointed cosmic hexagram star
  ];

  for (let i = 0; i < 18; i++) {
    const type = STAR_TYPES[i % STAR_TYPES.length];
    // Match the existing design size (radius: ~0.45 - 1.1)
    const radius = Math.random() * 0.65 + 0.45;
    const innerRadius = radius * type.innerRatio;
    const depth = radius * type.depthRatio;

    const geometry = create3DStarGeometry(type.points, radius, innerRadius, depth);
    const starColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // Outer neon wireframe facets
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: starColor,
      wireframe: true,
      transparent: true,
      opacity: 0.88,
    }));

    // Inner translucent holographic core for depth
    const core = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }));
    mesh.add(core);

    // Distribution matching existing 3D scene bounds
    mesh.position.set(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * -15);
    mesh.userData = {
      home: mesh.position.clone(),
      spin: {
        x: (Math.random() - 0.5) * 0.012,
        y: (Math.random() - 0.5) * 0.012,
        z: (Math.random() - 0.5) * 0.012,
      },
      pulseAmount: Math.random() * 0.12 + 0.05,
      pulseSpeed: 0.6 + Math.random() * 0.8,
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

    if (starField) {
      starField.rotation.y = time * 0.012;
      starField.position.x = parallax.x * 0.25;
      starField.position.y = parallax.y * 0.25;
    }

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

  // Softly fade out the indicator when the visitor scrolls down past the hero section
  let isHidden = false;
  window.addEventListener('scroll', () => {
    const shouldHide = window.scrollY > 60;
    if (shouldHide !== isHidden) {
      isHidden = shouldHide;
      if (typeof gsap !== 'undefined') {
        gsap.to(indicator, {
          opacity: shouldHide ? 0 : 1,
          duration: 0.35,
          overwrite: 'auto',
        });
      } else {
        indicator.style.opacity = shouldHide ? '0' : '1';
      }
      indicator.style.pointerEvents = shouldHide ? 'none' : 'auto';
    }
  }, { passive: true });

  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
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
