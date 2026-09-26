// 3D intro scene: refractory bricks fly in and lock into a kiln arch, glowing hot as they land and
// cooling as the fire settles, with embers rising through the opening. Loaded on demand by intro.tsx.
import * as THREE from "three";

type Brick = { mesh: THREE.Mesh; material: THREE.MeshStandardMaterial; from: THREE.Vector3; to: THREE.Vector3; fromRot: THREE.Euler; toRot: THREE.Euler; start: number };

const FLY = 0.95; // seconds per brick flight
const COOL = 1.4; // seconds for a landed brick to cool
const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

export function createKilnScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0a1420");
  scene.fog = new THREE.Fog("#0a1420", 12, 30);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  scene.add(new THREE.AmbientLight("#8aa4c8", 0.35));
  const rim = new THREE.DirectionalLight("#2f86cf", 1.6);
  rim.position.set(-6, 5, -4);
  scene.add(rim);
  const key = new THREE.DirectionalLight("#fff1dc", 0.9);
  key.position.set(4, 6, 8);
  scene.add(key);
  const fire = new THREE.PointLight("#ff7a1a", 0, 14, 1.6);
  fire.position.set(0, -1.2, 0.6);
  scene.add(fire);

  // Brick layout: floor course, two pillars, then the arch with the keystone last.
  const bricks: Brick[] = [];
  const base = new THREE.Color("#d8c3a0");
  const add = (geometry: THREE.BoxGeometry, to: THREE.Vector3, rotZ: number, order: number) => {
    const material = new THREE.MeshStandardMaterial({ color: base.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.08), roughness: 0.85, metalness: 0.05, emissive: new THREE.Color("#ff4000"), emissiveIntensity: 0 });
    const mesh = new THREE.Mesh(geometry, material);
    const dir = new THREE.Vector3().randomDirection();
    const from = to.clone().add(dir.multiplyScalar(10 + Math.random() * 8)).add(new THREE.Vector3(0, 0, 6));
    const fromRot = new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    mesh.position.copy(from);
    mesh.rotation.copy(fromRot);
    scene.add(mesh);
    bricks.push({ mesh, material, from, to, fromRot, toRot: new THREE.Euler(0, 0, rotZ), start: 0.15 + order * 0.055 });
  };
  const floorBrick = new THREE.BoxGeometry(1.18, 0.5, 1.6);
  const pillarBrick = new THREE.BoxGeometry(0.9, 0.58, 1.6);
  const archBrick = new THREE.BoxGeometry(0.62, 0.95, 1.6);
  let order = 0;
  for (let i = -3; i <= 3; i++) add(floorBrick, new THREE.Vector3(i * 1.22, -3.05, 0), 0, order++);
  for (let row = 0; row < 5; row++) for (const side of [-1, 1]) add(pillarBrick, new THREE.Vector3(side * 3.25, -2.5 + row * 0.62, 0), 0, order++);
  const R = 3.25;
  const archCount = 13;
  const archOrder: number[] = [];
  for (let i = 0; i < Math.ceil(archCount / 2); i++) { archOrder.push(i); if (archCount - 1 - i !== i) archOrder.push(archCount - 1 - i); }
  archOrder.forEach(i => {
    const angle = (i / (archCount - 1)) * Math.PI;
    add(archBrick, new THREE.Vector3(Math.cos(angle) * R, 0.55 + Math.sin(angle) * R, 0), angle - Math.PI / 2, order++);
  });
  const keystone = bricks[bricks.length - 1];
  keystone.start += 0.12;

  // Fire glow inside the arch: additive sprites with a radial gradient texture.
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const g = glowCanvas.getContext("2d")!;
  const gradient = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,196,110,1)");
  gradient.addColorStop(0.25, "rgba(255,120,30,0.8)");
  gradient.addColorStop(0.6, "rgba(230,70,20,0.3)");
  gradient.addColorStop(1, "rgba(230,70,20,0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 });
  const glow = new THREE.Sprite(glowMaterial);
  glow.position.set(0, -1.4, -0.9);
  glow.scale.set(6.5, 5, 1);
  scene.add(glow);
  const core = new THREE.Sprite(glowMaterial.clone());
  core.position.set(0, -2.3, -0.4);
  core.scale.set(2.6, 2.2, 1);
  scene.add(core);

  // Embers rising through the arch.
  const EMBERS = 220;
  const positions = new Float32Array(EMBERS * 3);
  const speeds = new Float32Array(EMBERS);
  const reset = (i: number, y = -3 + Math.random() * 0.6) => {
    positions[i * 3] = (Math.random() - 0.5) * 3.6;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.6 + 0.4;
    speeds[i] = 0.6 + Math.random() * 1.6;
  };
  for (let i = 0; i < EMBERS; i++) reset(i, -3 + Math.random() * 7);
  const emberGeometry = new THREE.BufferGeometry();
  emberGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const emberMaterial = new THREE.PointsMaterial({ color: "#ffb347", size: 0.07, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  scene.add(new THREE.Points(emberGeometry, emberMaterial));

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull back until the arch (about 4.8 units either side of centre) fits the width.
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    camera.userData.distance = Math.max(10, 4.8 / (Math.tan(halfFov) * camera.aspect));
    const fog = scene.fog as THREE.Fog;
    fog.near = camera.userData.distance + 2;
    fog.far = camera.userData.distance + 22;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let frame = 0;
  let startTime = 0;
  let last = 0;
  const tick = (now: number) => {
    if (!startTime) startTime = last = now;
    const t = (now - startTime) / 1000;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    for (const b of bricks) {
      const p = easeOut((t - b.start) / FLY);
      b.mesh.position.lerpVectors(b.from, b.to, p);
      b.mesh.rotation.set(
        THREE.MathUtils.lerp(b.fromRot.x, b.toRot.x, p),
        THREE.MathUtils.lerp(b.fromRot.y, b.toRot.y, p),
        THREE.MathUtils.lerp(b.fromRot.z, b.toRot.z, p),
      );
      const landed = t - (b.start + FLY * 0.7);
      b.material.emissiveIntensity = p <= 0 ? 0 : landed < 0 ? 2.4 * p : 0.08 + 2.3 * Math.pow(Math.max(0, 1 - landed / COOL), 1.5);
    }

    const keystoneLand = keystone.start + FLY * 0.7;
    const flash = Math.max(0, 1 - Math.abs(t - keystoneLand) / 0.35);
    const flicker = Math.sin(t * 17) * 0.25 + Math.sin(t * 7.3) * 0.35;
    fire.intensity = Math.min(t / 1.2, 1) * (38 + flicker * 8) + flash * 60;
    emberMaterial.opacity = Math.min(Math.max((t - 0.6) / 0.8, 0), 0.9);
    const fireLevel = Math.min(Math.max((t - 0.3) / 1.2, 0), 1);
    glowMaterial.opacity = fireLevel * (0.55 + flicker * 0.12) + flash * 0.4;
    (core.material as THREE.SpriteMaterial).opacity = fireLevel * (0.8 + flicker * 0.2);
    core.scale.set(2.6 + flicker * 0.3, 2.2 + Math.sin(t * 11) * 0.25, 1);
    for (let i = 0; i < EMBERS; i++) {
      positions[i * 3 + 1] += speeds[i] * dt;
      positions[i * 3] += Math.sin(t * 2 + i) * 0.004;
      if (positions[i * 3 + 1] > 4.2) reset(i);
    }
    emberGeometry.attributes.position.needsUpdate = true;

    // Camera: sweeping dolly-in that settles facing the arch.
    const settle = easeOut(t / 3.2);
    const distance = camera.userData.distance as number;
    const angle = (1 - settle) * 0.9;
    camera.position.set(Math.sin(angle) * (distance + 6 * (1 - settle)), 0.4 + 2.2 * (1 - settle), Math.cos(angle) * (distance + 6 * (1 - settle)));
    camera.lookAt(0, 0.2, 0);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };

  return {
    start() { frame = requestAnimationFrame(tick); },
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose());
        }
      });
      glowTexture.dispose();
      [glowMaterial, core.material as THREE.SpriteMaterial].forEach(m => m.dispose());
      renderer.dispose();
    },
  };
}
