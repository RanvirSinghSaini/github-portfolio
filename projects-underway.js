(() => {
  "use strict";
  if (!window.THREE) return;

  const canvas = document.getElementById("status-world");
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (_) {
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070f, 0.028);
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 180);
  camera.position.set(0, 1.5, 14);

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x04070f, 1);

  scene.add(new THREE.AmbientLight(0x14304a, 1.4));
  const cyan = new THREE.PointLight(0x00e5ff, 1.7, 70);
  cyan.position.set(7, 8, 9);
  scene.add(cyan);
  const green = new THREE.PointLight(0x2dff9c, 1.1, 60);
  green.position.set(-8, -2, 4);
  scene.add(green);

  const world = new THREE.Group();
  scene.add(world);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.2, 1),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: 0.14 })
  );
  core.position.set(6.8, 1.5, -8);
  world.add(core);

  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.55, 0),
    new THREE.MeshPhongMaterial({ color: 0x07111f, emissive: 0x063844, wireframe: false, transparent: true, opacity: 0.72 })
  );
  core.add(inner);

  const rings = [];
  [4.1, 4.8, 5.5].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.018, 5, 130),
      new THREE.MeshBasicMaterial({ color: index === 1 ? 0x2dff9c : 0x00e5ff, transparent: true, opacity: 0.22 })
    );
    ring.rotation.set(Math.PI / 2 + index * 0.28, index * 0.42, index * 0.18);
    ring.position.copy(core.position);
    rings.push(ring);
    world.add(ring);
  });

  const monoliths = [];
  for (let i = 0; i < 11; i += 1) {
    const geometry = new THREE.BoxGeometry(0.8, 2.8, 0.8);
    const material = new THREE.MeshPhongMaterial({
      color: 0x07111f,
      emissive: i < 3 || i === 5 || i === 10 ? 0x063844 : 0x071524,
      transparent: true,
      opacity: 0.8,
    });
    const block = new THREE.Mesh(geometry, material);
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: i < 3 || i === 5 || i === 10 ? 0x2dff9c : 0x00e5ff, transparent: true, opacity: 0.42 })
    );
    block.add(edge);
    const angle = (i / 11) * Math.PI * 2;
    const radius = 12 + (i % 2) * 2.2;
    block.position.set(Math.cos(angle) * radius, (i % 3 - 1) * 2.8, -18 - Math.sin(angle) * 8);
    block.rotation.y = -angle;
    block.userData = { phase: i * 0.63, baseY: block.position.y };
    monoliths.push(block);
    world.add(block);
  }

  const starCount = innerWidth < 720 ? 350 : 850;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    starPositions[i * 3] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 70;
    starPositions[i * 3 + 2] = -Math.random() * 100 + 16;
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starsGeometry,
    new THREE.PointsMaterial({ color: 0x93a3bf, size: 0.055, transparent: true, opacity: 0.62 })
  );
  scene.add(stars);

  let mouseX = 0;
  let mouseY = 0;
  addEventListener("pointermove", (event) => {
    mouseX = event.clientX / innerWidth * 2 - 1;
    mouseY = event.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
  });

  const clock = new THREE.Clock();
  function frame() {
    const t = clock.getElapsedTime();
    const scroll = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);

    camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.025;
    camera.position.y += (-mouseY * 0.45 + 1.5 - camera.position.y) * 0.025;
    camera.position.z = 14 - scroll * 5;
    camera.lookAt(0, 0, -18);

    if (!reduced) {
      core.rotation.x = t * 0.1;
      core.rotation.y = t * 0.18;
      inner.rotation.x = -t * 0.24;
      inner.rotation.y = t * 0.32;
      rings.forEach((ring, index) => {
        ring.rotation.z = t * (index % 2 ? -0.08 : 0.1) + index;
      });
      monoliths.forEach((block) => {
        block.position.y = block.userData.baseY + Math.sin(t * 0.65 + block.userData.phase) * 0.28;
      });
      stars.rotation.y = t * 0.006;
    }

    world.position.y = scroll * 7;
    world.rotation.y = scroll * 0.35;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  frame();
})();
