/**
 * Fondo WebGL.
 *
 * Se importa dinámicamente desde main.ts, así que este archivo entero
 * (y todo three.js con él) vive en un chunk aparte que solo se descarga
 * en equipos que lo van a aprovechar.
 *
 * Importamos clase por clase en vez de `import * as THREE`: así Rollup
 * puede podar de verdad y no arrastramos el motor completo.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  WebGLRenderer,
  WireframeGeometry,
  FogExp2,
} from 'three';

const CYAN = 0x00f0ff;
const MAGENTA = 0xff2fd6;
const VIOLET = 0x8b5cf6;
const INK = 0x04010f;

/** Textura de resplandor generada en canvas: un archivo menos que servir. */
function createGlowTexture(): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deliberadamente apagado. Con el blanco a tope el resplandor se comía
    // el texto del hero y de "Sobre mí": el fondo tiene que ser fondo.
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(190,240,255,0.55)');
    gradient.addColorStop(0.35, 'rgba(0,240,255,0.22)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  return new CanvasTexture(canvas);
}

export function mountScene(selector: string): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>(selector);
  if (!canvas) return () => {};

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    // Sin WebGL (driver bloqueado, navegador antiguo) el degradado CSS
    // de fondo ya es un fondo perfectamente digno.
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  const scene = new Scene();
  scene.fog = new FogExp2(INK, 0.026);

  const camera = new PerspectiveCamera(
    62,
    window.innerWidth / window.innerHeight,
    0.1,
    120,
  );
  camera.position.set(0, 0, 9);

  /* ── Núcleo ── */
  const core = new Group();
  scene.add(core);

  const glowTexture = createGlowTexture();
  const glow = new Sprite(
    new SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.scale.set(7, 7, 1);
  core.add(glow);

  const outerGeo = new IcosahedronGeometry(2.4, 1);
  const outerWire = new WireframeGeometry(outerGeo);
  const outerShell = new LineSegments(
    outerWire,
    new LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.34 }),
  );

  const innerGeo = new IcosahedronGeometry(1.4, 0);
  const innerWire = new WireframeGeometry(innerGeo);
  const innerShell = new LineSegments(
    innerWire,
    new LineBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.5 }),
  );

  core.add(outerShell, innerShell);

  /* ── Anillos ── */
  const ringGeoA = new TorusGeometry(3.4, 0.014, 8, 110);
  const ringA = new Mesh(
    ringGeoA,
    new MeshBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.45 }),
  );
  ringA.rotation.x = 1.2;

  const ringGeoB = new TorusGeometry(4.25, 0.01, 8, 110);
  const ringB = new Mesh(
    ringGeoB,
    new MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.28 }),
  );
  ringB.rotation.set(-0.9, 0.5, 0);

  scene.add(ringA, ringB);

  /* ── Campo de partículas ── */
  const COUNT = 780;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const radius = 14 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const starGeo = new BufferGeometry();
  starGeo.setAttribute('position', new BufferAttribute(positions, 3));
  const stars = new Points(
    starGeo,
    new PointsMaterial({
      color: 0x7dd3fc,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  scene.add(stars);

  /* ── Entrada ── */
  const pointer = { x: 0, y: 0 };
  let smoothScroll = 0;
  let running = true;
  let frame = 0;

  const onPointerMove = (e: PointerEvent) => {
    pointer.x = e.clientX / window.innerWidth - 0.5;
    pointer.y = e.clientY / window.innerHeight - 0.5;
  };

  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  // Una pestaña en segundo plano no debe seguir quemando GPU.
  const onVisibility = () => {
    running = document.visibilityState === 'visible';
    if (running) {
      frame = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(frame);
    }
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  onResize();

  /* ── Bucle ── */
  // three.Clock quedó deprecado en 0.185; el reloj propio es una resta.
  const startedAt = performance.now();

  function loop() {
    if (!running) return;
    frame = requestAnimationFrame(loop);

    const t = (performance.now() - startedAt) / 1000;
    smoothScroll += (window.scrollY - smoothScroll) * 0.055;
    const s = smoothScroll * 0.001;

    core.rotation.y = t * 0.2 + s * 1.1;
    core.rotation.x = Math.sin(t * 0.28) * 0.17 + s * 0.4;
    innerShell.rotation.y = -t * 0.55;
    innerShell.rotation.z = t * 0.38;

    ringA.rotation.z = t * 0.24;
    ringB.rotation.z = -t * 0.17;
    stars.rotation.y = t * 0.02 + s * 0.3;

    camera.position.x += (pointer.x * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * 1.2 - camera.position.y) * 0.04;
    camera.position.z = 9 + Math.sin(s * 0.9) * 1.4;
    camera.lookAt(0, 0, 0);

    const pulse = 1 + Math.sin(t * 2.1) * 0.075;
    glow.scale.set(7 * pulse, 7 * pulse, 1);

    renderer.render(scene, camera);
  }

  frame = requestAnimationFrame(loop);

  /* ── Limpieza ── */
  return function dispose() {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);

    for (const geo of [
      outerGeo,
      outerWire,
      innerGeo,
      innerWire,
      ringGeoA,
      ringGeoB,
      starGeo,
    ]) {
      geo.dispose();
    }
    for (const obj of [outerShell, innerShell, ringA, ringB, stars, glow]) {
      const material = obj.material;
      if (Array.isArray(material)) {
        for (const m of material) m.dispose();
      } else {
        material.dispose();
      }
    }
    glowTexture.dispose();
    renderer.dispose();
  };
}
