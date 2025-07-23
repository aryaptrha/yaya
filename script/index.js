document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
  document.body.classList.remove('fade-out');

  // Initialize GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // Name animation with GSAP
  const nameChars = "ARYAPUTRA";
  const nameElement = document.getElementById('name-animation');
  if (!nameElement) {
    console.error("Element with ID 'name-animation' not found.");
    return;
  }
  nameElement.innerHTML = ''; // Clear any existing content

  // Create spans for each letter
  const chars = [];
  
  // Create spans for each letter with consistent styling
  for (let i = 0; i < nameChars.length; i++) {
    const span = document.createElement('span');
    span.textContent = nameChars[i];
    span.classList.add('name-hover');
    span.style.fontSize = "1em";
    span.style.display = "inline-block";
    span.style.opacity = "0";
    nameElement.appendChild(span);
    chars.push(span);
  }

  // GSAP animation for name
  gsap.set(nameElement, { opacity: 1 });
  
  // Animate all letters of the name simultaneously
  gsap.to(chars, {
    opacity: 1,
    stagger: 0.1,
    duration: 0.5,
    onComplete: () => {
      // Animate nav links after name animation completes
      gsap.to('#nav-links', { 
        opacity: 1, 
        duration: 0.8,
        delay: 0.2
      });
    }
  });

  // Scroll progress bar
  gsap.to('.progress-bar', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3
    }
  });

  // Animate branding section
  gsap.to('#branding-title', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '#branding-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    }
  });

  // Animate skill cards
  gsap.utils.toArray('.skill-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: 0.2 * i,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Animate contact CTA
  gsap.to('#contact-cta', {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: '#contact-cta',
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  });

  // Scene setup code with Three.js
  const scene = new THREE.Scene();
  const canvas = document.getElementById('threejs-background');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const geometries = [];
  const colors = [0x00ff88, 0x00ffff, 0xff00ff, 0x9900ff];

  function createGeometry() {
    // Randomly choose between IcosahedronGeometry for varied polyhedron shapes
    const geometryTypes = [
      new THREE.IcosahedronGeometry(Math.random() * 0.7 + 0.4),
      new THREE.OctahedronGeometry(Math.random() * 0.7 + 0.4)
    ];
    
    const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
    
    // Create a wireframe material with neon colors
    const color = colors[Math.floor(Math.random() * colors.length)];
    const material = new THREE.MeshBasicMaterial({
      color: color,
      wireframe: true,
      transparent: true,
      opacity: 0.9
    });
    
    const mesh = new THREE.Mesh(geometry, material);

    // Position meshes more spread out
    mesh.position.set(
      Math.random() * 30 - 15,
      Math.random() * 30 - 15,
      Math.random() * -15
    );

    // Set random rotation speeds (slower than before)
    mesh.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.01
    };
    
    // Add a custom scale for pulsing effect
    mesh.pulseFactor = Math.random() * 0.1;
    mesh.pulseSpeed = 0.005 + Math.random() * 0.01;
    mesh.pulseOffset = Math.random() * Math.PI * 2;
    mesh.baseScale = 0.8 + Math.random() * 0.4;
    
    scene.add(mesh);
    geometries.push(mesh);
  }

  for (let i = 0; i < 15; i++) {
    createGeometry();
  }

  const mouse = new THREE.Vector2();
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    
    const time = performance.now() * 0.001; // Current time in seconds

    geometries.forEach(geo => {
      // Regular rotation
      geo.rotation.x += geo.rotationSpeed.x;
      geo.rotation.y += geo.rotationSpeed.y;
      geo.rotation.z += geo.rotationSpeed.z;

      // Pulse effect
      const pulse = Math.sin(time * geo.pulseSpeed + geo.pulseOffset) * geo.pulseFactor + 1;
      geo.scale.set(
        geo.baseScale * pulse,
        geo.baseScale * pulse,
        geo.baseScale * pulse
      );

      // Slight movement based on mouse position
      geo.position.x += mouse.x * 0.005;
      geo.position.y += mouse.y * 0.005;
      
      // Bring back shapes that drift too far
      if (Math.abs(geo.position.x) > 10) geo.position.x *= 0.99;
      if (Math.abs(geo.position.y) > 10) geo.position.y *= 0.99;
    });

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();

  // Smooth scroll functionality
  document.getElementById('scroll-indicator').addEventListener('click', () => {
    gsap.to(window, {
      duration: 1,
      scrollTo: '#branding-section',
      ease: 'power2.inOut'
    });
  });

  // Add event listeners to navigation links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location.href = link.href;
      }, 500);
    });
  });

  async function setRandomMemeFavicon() {
    try {
      // Example: Fetch a random meme from an API or use a static URL
      const memeUrl = "https://i.imgflip.com/30b1gx.jpg"; // Replace with a dynamic meme API if needed

      // Create or update the favicon link
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = memeUrl;
    } catch (error) {
      console.error("Failed to set random meme favicon:", error);
    }
  }

  // Call the function on page load
  setRandomMemeFavicon();
});

function trulyMaskUrl(targetPath) {
  // Prevent any navigation
  window.onbeforeunload = null;
  
  // Create fullscreen overlay that looks like a new page
  const overlay = document.createElement('div');
  overlay.id = 'masked-page-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #000;
    z-index: 999999;
    opacity: 0;
    transition: opacity 0.5s ease;
  `;

  // Create fake browser UI
  const fakeBrowser = document.createElement('div');
  fakeBrowser.style.cssText = `
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  `;

  // Fake address bar
  const fakeAddressBar = document.createElement('div');
  fakeAddressBar.style.cssText = `
    background: #1a1a1a;
    padding: 8px 15px;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Fake URL with lock icon
  const fakeUrl = document.createElement('div');
  fakeUrl.style.cssText = `
    background: #2d2d2d;
    padding: 6px 12px;
    border-radius: 20px;
    color: #fff;
    font-size: 14px;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  const maskedUrls = [
    '🔒 https://secure-portal.enterprise.com/dashboard/analytics',
    '🔒 https://internal-systems.corp/executive/reports', 
    '🔒 https://classified.gov.site/level-5/documents',
    '🔒 https://top-secret.military.net/operation-files',
    '🔒 https://crypto-vault.blockchain.io/private-keys'
  ];

  fakeUrl.innerHTML = maskedUrls[Math.floor(Math.random() * maskedUrls.length)];

  // Browser controls
  const controls = document.createElement('div');
  controls.style.cssText = `
    display: flex;
    gap: 10px;
    align-items: center;
  `;

  // Back button that actually works
  const backBtn = document.createElement('button');
  backBtn.innerHTML = '←';
  backBtn.style.cssText = `
    background: #444;
    border: none;
    color: #fff;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  `;
  backBtn.onclick = () => {
    overlay.remove();
    // Reset URL if needed
    window.history.pushState({}, '', '/yaya/');
  };

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    background: #ff4444;
    border: none;
    color: #fff;
    padding: 5px 8px;
    border-radius: 3px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => overlay.remove();

  controls.appendChild(backBtn);
  controls.appendChild(closeBtn);

  fakeAddressBar.appendChild(fakeUrl);
  fakeAddressBar.appendChild(controls);

  // Content iframe
  const iframe = document.createElement('iframe');
  iframe.src = targetPath;
  iframe.style.cssText = `
    flex: 1;
    border: none;
    background: #000;
  `;

  // Prevent iframe from changing parent URL
  iframe.onload = () => {
    try {
      // Additional security to prevent URL changes
      iframe.contentWindow.history.pushState = () => {};
      iframe.contentWindow.history.replaceState = () => {};
    } catch (e) {
      // Cross-origin restrictions, which is actually good for security
    }
  };

  fakeBrowser.appendChild(fakeAddressBar);
  fakeBrowser.appendChild(iframe);
  overlay.appendChild(fakeBrowser);
  document.body.appendChild(overlay);

  // Animate in
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 50);

  // Change the actual page URL to something generic
  setTimeout(() => {
    window.history.pushState({}, '', '/yaya/dashboard');
  }, 100);
}