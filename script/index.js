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