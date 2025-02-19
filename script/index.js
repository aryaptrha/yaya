document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('fade-in');
  document.body.classList.remove('fade-out');

  const name = "Aryaputra";
  const nameElement = document.getElementById('name-animation');

  // Split name into characters with hover effect
  const characters = name.split('').map(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add('name-hover');
    return span;
  });

  // Append characters to name element
  characters.forEach(char => nameElement.appendChild(char));

  // Scene setup code from previous artifact
  const scene = new THREE.Scene();
  const canvas = document.getElementById('threejs-background');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const geometries = [];
  const colors = [0x00ff88, 0x00ffff, 0xff00ff];

  function createGeometry() {
    const geometry = new THREE.IcosahedronGeometry(Math.random() * 0.5 + 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      wireframe: true
    });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
      Math.random() * 10 - 5,
      Math.random() * 10 - 5,
      Math.random() * -10
    );

    mesh.rotationSpeed = {
      x: Math.random() * 0.02,
      y: Math.random() * 0.02,
      z: Math.random() * 0.02
    };

    scene.add(mesh);
    geometries.push(mesh);
  }

  for (let i = 0; i < 20; i++) {
    createGeometry();
  }

  const mouse = new THREE.Vector2();
  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);

    geometries.forEach(geo => {
      geo.rotation.x += geo.rotationSpeed.x;
      geo.rotation.y += geo.rotationSpeed.y;
      geo.rotation.z += geo.rotationSpeed.z;

      geo.position.x += mouse.x * 0.01;
      geo.position.y += mouse.y * 0.01;
    });

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();

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
});