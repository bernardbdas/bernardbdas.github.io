import * as THREE from 'three';

/**
 * Procedural 3D Terrain Background Effect
 * Inspired by glennso.dev
 *
 * Full-screen Three.js WebGL scene with:
 * - Multi-octave fBm procedural elevation + domain warping
 * - Left column clearing: terrain elevation tapers to flat under the content column
 * - Architectural topographic rendering in light mode & phosphor neon in dark mode
 * - Anti-aliased world-aligned grid lines + elevation contour lines
 * - Dynamic burnt-orange (#F29559 / #d46522) traveling scan wave with soft trail
 * - Interactive click-to-pulse raycasting (radial ripple from click point)
 * - Subtle camera drift & depth fog
 * - Reduced motion & tab visibility awareness
 */

const SEED = 1337;

function hash2(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7 + SEED) * 43758.5453;
  return h - Math.floor(h);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = smoothstep(xf);
  const v = smoothstep(yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function fbm(x: number, y: number, octaves = 5): number {
  let total = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return total / norm;
}

export function initTerrainScene(): void {
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
  if (!canvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Scene & Fog
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07090a, 50, 220);

  // Camera - framed towards the right where the terrain rises in negative space
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
  camera.position.set(-24, 32, 70);
  camera.lookAt(20, -4, 0);

  // Terrain Geometry
  const SIZE = 260;
  const SEGS = 220;
  const geom = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  const HEIGHT_SCALE = 14;
  const NOISE_SCALE = 0.022;

  // Bake elevations with fBm & domain warping
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Domain warp
    const wx = x + fbm(x * 0.01 + 7.2, z * 0.01 - 3.1, 3) * 18;
    const wz = z + fbm(x * 0.01 - 4.7, z * 0.01 + 9.4, 3) * 18;

    // Multi-octave elevation
    const h = fbm(wx * NOISE_SCALE, wz * NOISE_SCALE, 6);
    const shaped = Math.pow(h, 1.4);

    // Island perimeter falloff
    const r = Math.sqrt(x * x + z * z) / (SIZE * 0.5);
    const falloff = Math.max(0, 1 - Math.pow(r, 2.2));

    // Smoothly flatten terrain under the left content column (x < 15)
    // so text is completely crisp and never obscured by mountain hills
    const leftClear = Math.max(0, Math.min(1, (x - 2) / 36));
    const leftFactor = leftClear * leftClear * (3 - 2 * leftClear);

    pos.setY(i, Math.max(0, shaped - 0.32) * HEIGHT_SCALE * falloff * leftFactor);
  }
  geom.computeVertexNormals();

  // Shader Uniforms
  const uniforms = {
    uTime: { value: 0 },
    uIsLight: { value: 0.0 },
    uPulseStart: { value: -1000 },
    uPulseSpeed: { value: 65.0 },
    uPulseWidth: { value: 5.0 },
    uMaxRadius: { value: 140.0 },
    uBaseColor: { value: new THREE.Color('#4a5a3d') },
    uScanColor: { value: new THREE.Color('#F29559') },
    uHighColor: { value: new THREE.Color('#c8d6a8') },
    uFogColor: { value: new THREE.Color('#07090a') },
    uPulseDir: { value: new THREE.Vector2(1.0, 1.0).normalize() },
    uPulseMin: { value: -140.0 },
    uPulseMax: { value: 140.0 },
    uPulseMode: { value: 0.0 },
    uPulseOrigin: { value: new THREE.Vector2(0, 0) },
  };

  const vertexShader = /* glsl */ `
    varying vec3 vWorldPos;
    varying vec3 vLocalPos;
    varying float vElevation;
    varying vec3 vNormal;
    void main() {
      vLocalPos = position;
      vElevation = position.y;
      vNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform float uIsLight;
    uniform float uPulseStart;
    uniform float uPulseSpeed;
    uniform float uPulseWidth;
    uniform float uMaxRadius;
    uniform float uPulseMin;
    uniform float uPulseMax;
    uniform vec2  uPulseDir;
    uniform float uPulseMode;
    uniform vec2  uPulseOrigin;
    uniform vec3  uBaseColor;
    uniform vec3  uScanColor;
    uniform vec3  uHighColor;
    uniform vec3  uFogColor;
    varying vec3  vWorldPos;
    varying vec3  vLocalPos;
    varying float vElevation;
    varying vec3  vNormal;

    // Anti-aliased grid lines
    float gridLine(vec2 coord, float spacing, float thickness) {
      vec2 g = abs(fract(coord / spacing - 0.5) - 0.5) / fwidth(coord / spacing);
      float line = min(g.x, g.y);
      return 1.0 - smoothstep(0.0, thickness, line);
    }

    // Elevation contour lines
    float contour(float h, float spacing, float thickness) {
      float c = abs(fract(h / spacing - 0.5) - 0.5) / fwidth(h / spacing);
      return 1.0 - smoothstep(0.0, thickness, c);
    }

    void main() {
      float t = uTime - uPulseStart;
      float totalLen = uPulseMax - uPulseMin;

      // Linear sweep vs radial ripple
      float proj, pulseFront, maxFront;
      if (uPulseMode < 0.5) {
        proj = dot(vWorldPos.xz, uPulseDir);
        pulseFront = uPulseMin + t * uPulseSpeed;
        maxFront = totalLen;
      } else {
        proj = length(vWorldPos.xz - uPulseOrigin);
        pulseFront = t * uPulseSpeed;
        maxFront = uMaxRadius;
      }

      // Scan band & glowing trail
      float band = 0.0;
      float lead = 0.0;
      if (t > 0.0 && pulseFront < maxFront + 25.0) {
        float d = proj - pulseFront;
        lead = 1.0 - smoothstep(0.0, uPulseWidth, abs(d));
        float trail = smoothstep(-28.0, 0.0, d) * step(d, 0.0) * 0.45;
        band = max(lead, trail);
      }
      float life = clamp(1.0 - (t * uPulseSpeed - maxFront) / 25.0, 0.0, 1.0);
      band *= life;
      lead *= life;

      // Grid lines: micro, minor, major
      float gMicro = gridLine(vWorldPos.xz, 1.5, 1.0);
      float gMinor = gridLine(vWorldPos.xz, 3.0, 1.2);
      float gMajor = gridLine(vWorldPos.xz, 15.0, 1.4);

      // Elevation contours
      float ctrMinor = contour(vElevation, 0.6, 1.0);
      float ctrMajor = contour(vElevation, 2.4, 1.4);

      // Shading from directional side-light
      vec3 lightDir = normalize(vec3(0.65, 0.55, 0.45));
      float lambert = max(dot(normalize(vNormal), lightDir), 0.0);
      float upFacing = clamp(vNormal.y, 0.0, 1.0);

      // Height normalized relative to floor (0 at flat ground)
      float hN = clamp(vElevation / 9.0, 0.0, 1.0);

      // High-detail line illumination components (identical structure in both themes)
      float lineDetail = (
          gMicro   * 0.55
        + gMinor   * 1.15
        + gMajor   * 2.10
        + ctrMinor * 0.65
        + ctrMajor * 1.50
      );
      // Grid intersection nodes pop
      float nodes = gMinor * ctrMinor * 1.2 + gMajor * ctrMajor * 2.0;
      lineDetail += nodes;

      vec3 col;
      if (uIsLight > 0.5) {
        // ── LIGHT MODE: Crisp architectural drafting on bone paper ──
        vec3 paperBase  = uFogColor; // #f4f5ee
        vec3 slopeColor = vec3(0.86, 0.90, 0.82);
        vec3 peakColor  = vec3(0.76, 0.82, 0.71);

        // Ground shading: perfectly blends with background when hN = 0
        vec3 base = mix(paperBase, slopeColor, smoothstep(0.05, 0.6, hN));
        base = mix(base, peakColor, smoothstep(0.6, 1.0, hN));
        base *= (0.93 + 0.12 * lambert);

        // Architectural drafting ink for unlit grid & contours
        vec3 fineInk = vec3(0.40, 0.45, 0.35);
        vec3 boldInk = vec3(0.22, 0.27, 0.18);

        float fineLines = gMicro * 0.05 + gMinor * 0.12 + ctrMinor * 0.08;
        float boldLines = gMajor * 0.22 + ctrMajor * 0.16;

        col = base;
        col = mix(col, fineInk, fineLines);
        col = mix(col, boldInk, boldLines);

        // ── DETAILED ILLUMINATION EFFECT ──
        // Subtle warm luminous lift on paper under pulse (clean, translucent)
        col = mix(col, vec3(0.99, 0.95, 0.90), band * 0.20);

        // Grid lines & contour rings ignite in rich burnt orange (#d65d1a)
        col = mix(col, uScanColor, clamp(band * lineDetail, 0.0, 1.0));

        // Crisp leading edge wavefront accent
        col = mix(col, uScanColor, lead * (gMinor * 0.4 + gMajor * 0.8 + ctrMajor * 0.6));
      } else {
        // ── DARK MODE: Phosphor green neon & dark terminal ──
        vec3 lowCol  = uBaseColor * 0.12;
        vec3 midCol  = uBaseColor;
        vec3 highCol = mix(uBaseColor, uHighColor, 0.8);
        vec3 base = mix(lowCol, midCol, smoothstep(0.05, 0.55, hN));
        base = mix(base, highCol, smoothstep(0.55, 1.0, hN));
        base *= (0.35 + 0.75 * lambert) * (0.7 + 0.3 * upFacing);

        col = base;
        col += uBaseColor * gMicro * 0.10;
        col += uHighColor * gMinor * 0.16;
        col += uHighColor * gMajor * 0.24;
        col += uHighColor * ctrMinor * 0.09;
        col += uHighColor * ctrMajor * 0.16;

        col += uScanColor * band * (0.45 + lineDetail);
        col += uScanColor * lead * (gMinor * 0.3 + gMajor * 0.7 + ctrMajor * 0.5);
      }

      // Edge perimeter fade: prevents any hard polygon mesh cutoff edges
      float radial = length(vWorldPos.xz);
      float edgeFade = 1.0 - smoothstep(65.0, 115.0, radial);
      col = mix(uFogColor, col, edgeFade);

      // Depth fog
      float depth = length(vWorldPos - cameraPosition);
      float fogF = smoothstep(55.0, 190.0, depth);
      col = mix(col, uFogColor, fogF);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    fog: false,
  });

  const terrain = new THREE.Mesh(geom, mat);
  scene.add(terrain);

  // Pulse scheduler
  const PULSE_INTERVAL = 4.0;
  uniforms.uPulseSpeed.value =
    (uniforms.uPulseMax.value - uniforms.uPulseMin.value) / (PULSE_INTERVAL * 0.75);

  let nextPulseAt = 1.0;

  function firePulse(now: number, opts?: { radial?: boolean; origin?: THREE.Vector2 }): void {
    uniforms.uPulseStart.value = now;
    uniforms.uPulseMode.value = opts?.radial ? 1.0 : 0.0;
    if (opts?.origin) {
      uniforms.uPulseOrigin.value.copy(opts.origin);
    }
    nextPulseAt = now + PULSE_INTERVAL;
  }

  // Window resize
  function resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Animation Loop
  const clock = new THREE.Clock();
  let animId: number | null = null;

  function tick(): void {
    const now = clock.getElapsedTime();
    uniforms.uTime.value = now;

    if (now >= nextPulseAt) {
      firePulse(now);
    }

    if (!reducedMotion) {
      // Gentle parallax camera drift focused on right negative space
      const r = 70;
      const a = now * 0.05;
      camera.position.x = -24 + Math.sin(a) * 6;
      camera.position.z = r + Math.cos(a) * 5;
      camera.position.y = 30 + Math.sin(now * 0.12) * 2.0;
      camera.lookAt(20, -4, 0);
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      animId = requestAnimationFrame(tick);
    }
  }

  // Theme management for terrain
  function applyTerrainTheme(theme: string): void {
    const isLight = theme === 'light';
    uniforms.uIsLight.value = isLight ? 1.0 : 0.0;
    renderer.setClearColor(isLight ? 0xf4f5ee : 0x07090a, 1);
    if (scene.fog) {
      scene.fog.color.set(isLight ? 0xf4f5ee : 0x07090a);
    }
    uniforms.uFogColor.value.set(isLight ? '#f4f5ee' : '#07090a');
    uniforms.uBaseColor.value.set(isLight ? '#d6ddcf' : '#4a5a3d');
    uniforms.uHighColor.value.set(isLight ? '#b0be9a' : '#c8d6a8');
    uniforms.uScanColor.value.set(isLight ? '#d65d1a' : '#F29559');
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTerrainTheme(initialTheme);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    tick();
  }

  // Interactive Click-to-Pulse
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function onPointerDown(e: MouseEvent | TouchEvent): void {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = canvas!.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(terrain);
    if (!hits.length) return;

    const p = hits[0].point;
    const origin = new THREE.Vector2(p.x, p.z);
    firePulse(clock.getElapsedTime(), { radial: true, origin });
  }

  window.addEventListener('click', onPointerDown);

  window.addEventListener('themechange', (e: Event) => {
    const custom = e as CustomEvent<{ theme: string }>;
    if (custom.detail?.theme) {
      applyTerrainTheme(custom.detail.theme);
      if (reducedMotion) {
        renderer.render(scene, camera);
      }
    }
  });

  // Tab visibility management to save GPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animId !== null) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    } else if (!reducedMotion && animId === null) {
      clock.start();
      tick();
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTerrainScene);
} else {
  initTerrainScene();
}
