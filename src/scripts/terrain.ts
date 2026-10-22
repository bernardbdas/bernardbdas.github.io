import * as THREE from 'three';

/**
 * Procedural 3D Terrain Background Effect
 * Identical landscape to https://glennso.dev/
 *
 * Full-screen Three.js WebGL scene with:
 * - Multi-octave fBm procedural elevation + domain warping (exact glennso landscape)
 * - Identical camera framing (42 deg, position 0, 32, 70, lookAt 0, -4, 0)
 * - Identical parallax drift (sin(a)*14, cos(a)*6, sin(0.12)*2, lookAt 0, -3, 0)
 * - Exact glennso shader & lighting in dark mode
 * - Clean architectural topographic rendering in light mode
 * - Anti-aliased world-aligned grid lines + elevation contour lines
 * - Dynamic burnt-orange (#F29559) traveling scan wave with soft trail
 * - Interactive click-to-pulse raycasting (radial ripple from click point)
 */

const SEED = 1337;

function hash2(x: number, y: number): number {
  // deterministic pseudo-random in [0,1)
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
  if (canvas.dataset.terrainInitialized === 'true') return;
  canvas.dataset.terrainInitialized = 'true';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x07090a, 1);

  // Scene & Fog (exact glennso)
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07090a, 60, 220);

  // Camera - exact glennso setup
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
  camera.position.set(0, 32, 70);
  camera.lookAt(0, -4, 0);

  // Terrain Geometry - exact glennso landscape
  const SIZE = 260;
  const SEGS = 220;
  const geom = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
  geom.rotateX(-Math.PI / 2);

  const pos = geom.attributes.position;
  const HEIGHT_SCALE = 14;
  const NOISE_SCALE = 0.022;

  // Bake elevations - exact glennso landscape formula
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);

    // Domain warp the lookup so the terrain isn't axis-aligned
    const wx = x + fbm(x * 0.01 + 7.2, z * 0.01 - 3.1, 3) * 18;
    const wz = z + fbm(x * 0.01 - 4.7, z * 0.01 + 9.4, 3) * 18;

    // Straightforward fBm — high values = peaks, low values = valleys
    const h = fbm(wx * NOISE_SCALE, wz * NOISE_SCALE, 6);

    // Gentle power curve to lift peaks above the average
    const shaped = Math.pow(h, 1.4);

    // Edge falloff so the plate feels like an island
    const r = Math.sqrt(x * x + z * z) / (SIZE * 0.5);
    const falloff = Math.max(0, 1 - Math.pow(r, 2.2));

    pos.setY(i, (shaped - 0.35) * HEIGHT_SCALE * falloff);
  }
  geom.computeVertexNormals();

  // Shader Uniforms - exact glennso uniforms
  const uniforms = {
    uTime: { value: 0 },
    uIsLight: { value: 0.0 },
    uPulseStart: { value: -1000 },
    uPulseSpeed: { value: 70.0 },
    uPulseWidth: { value: 6.0 },
    uMaxRadius: { value: 200.0 },
    uBaseColor: { value: new THREE.Color('#4a5a3d') },
    uScanColor: { value: new THREE.Color('#F29559') },
    uHighColor: { value: new THREE.Color('#c8d6a8') },
    uFogColor: { value: new THREE.Color('#07090a') },
    uPulseDir: { value: new THREE.Vector2(1.0, 1.0).normalize() },
    uPulseMin: { value: -180.0 },
    uPulseMax: { value: 180.0 },
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

    // Anti-aliased grid lines — returns 1 on line, 0 between
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
      // Time since the last pulse fired
      float t = uTime - uPulseStart;
      float totalLen = uPulseMax - uPulseMin;

      // Linear (default): wave travels along uPulseDir from uPulseMin -> uPulseMax
      // Radial (click): wave expands from uPulseOrigin outward (proj is radius)
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

      // Band: 1.0 at wave-front, with soft trail behind it
      float band = 0.0;
      if (t > 0.0 && pulseFront < maxFront + 30.0) {
        float d = proj - pulseFront;
        // Sharp leading edge
        float lead = 1.0 - smoothstep(0.0, uPulseWidth, abs(d));
        // Soft trail behind the front (d < 0 means already swept)
        float trail = smoothstep(-55.0, 0.0, d) * step(d, 0.0) * 0.45;
        band = max(lead, trail);
      }
      // Overall pulse intensity decays once the front has reached the far edge
      float life = clamp(1.0 - (t * uPulseSpeed - maxFront) / 30.0, 0.0, 1.0);
      band *= life;

      // Grid lines on terrain (world-aligned) — denser for richer texture
      float gMicro = gridLine(vWorldPos.xz, 1.5, 1.0);
      float gMinor = gridLine(vWorldPos.xz, 3.0, 1.2);
      float gMajor = gridLine(vWorldPos.xz, 15.0, 1.4);

      // Elevation contour lines — tighter spacing
      float ctrMinor = contour(vElevation, 0.6, 1.0);
      float ctrMajor = contour(vElevation, 2.4, 1.4);

      // Base shading from normal — strong side-light so slopes shade clearly
      vec3 lightDir = normalize(vec3(0.65, 0.55, 0.45));
      float lambert = max(dot(normalize(vNormal), lightDir), 0.0);
      // Touch of ambient occlusion from up-facing component
      float upFacing = clamp(vNormal.y, 0.0, 1.0);

      // Height ramp: low areas darker, high areas brighter
      float hN = clamp((vElevation + 5.0) / 12.0, 0.0, 1.0);

      vec3 col;
      if (uIsLight > 0.5) {
        // ── LIGHT MODE: Exact same glennso landscape rendered as architectural drafting ──
        vec3 paperBase  = uFogColor; // #f4f5ee
        vec3 slopeColor = vec3(0.85, 0.89, 0.81);
        vec3 peakColor  = vec3(0.74, 0.80, 0.68);
        vec3 base = mix(paperBase, slopeColor, smoothstep(0.0, 0.55, hN));
        base = mix(base, peakColor, smoothstep(0.55, 1.0, hN));
        base *= (0.88 + 0.18 * lambert);

        // Grid & contour lines as crisp architectural drafting ink
        vec3 lineInk = vec3(0.36, 0.40, 0.32);
        vec3 majorLineInk = vec3(0.20, 0.24, 0.16);
        col = base;
        col = mix(col, lineInk, gMicro * 0.06 + gMinor * 0.14 + ctrMinor * 0.09);
        col = mix(col, majorLineInk, gMajor * 0.24 + ctrMajor * 0.18);

        // Detailed line illumination under scan wave (identical detail to dark mode)
        float lineDetail = (
            gMicro   * 0.5
          + gMinor   * 0.9
          + gMajor   * 1.4
          + ctrMinor * 0.5
          + ctrMajor * 0.9
        );
        col = mix(col, vec3(1.0, 0.96, 0.90), band * 0.25);
        col = mix(col, uScanColor, clamp(band * lineDetail, 0.0, 1.0));

        // Distance falloff (from world origin) so far edges melt into the background
        float radial = length(vWorldPos.xz);
        float falloff = 1.0 - smoothstep(uMaxRadius * 0.55, uMaxRadius, radial);
        col = mix(uFogColor, col, falloff);

        // Fog
        float depth = length(vWorldPos - cameraPosition);
        float fogF = smoothstep(60.0, 220.0, depth);
        col = mix(col, uFogColor, fogF);
      } else {
        // ── DARK MODE: EXACT 100% UNMODIFIED GLENNSO.DEV SHADER ──
        vec3 lowCol  = uBaseColor * 0.18;
        vec3 midCol  = uBaseColor;
        vec3 highCol = mix(uBaseColor, uHighColor, 0.8);
        vec3 base = mix(lowCol, midCol, smoothstep(0.0, 0.55, hN));
        base = mix(base, highCol, smoothstep(0.55, 1.0, hN));
        // Lambert: peaks lit, slopes shaded, valleys darker still
        base *= (0.35 + 0.75 * lambert) * (0.7 + 0.3 * upFacing);

        // Add grid + contours as faint emissive overlay
        col = base;
        col += uBaseColor * gMicro * 0.10;
        col += uHighColor * gMinor * 0.16;
        col += uHighColor * gMajor * 0.22;
        col += uHighColor * ctrMinor * 0.08;
        col += uHighColor * ctrMajor * 0.14;

        // Scan highlight — boost grid + base where wave is
        float scanBoost = band;
        col += uScanColor * scanBoost * (
          0.55
          + gMicro   * 0.5
          + gMinor   * 0.9
          + gMajor   * 1.4
          + ctrMinor * 0.5
          + ctrMajor * 0.9
        );

        // Distance falloff (from world origin) so far edges melt into background
        float radial = length(vWorldPos.xz);
        float falloff = 1.0 - smoothstep(uMaxRadius * 0.55, uMaxRadius, radial);
        col *= falloff;

        // Fog
        float depth = length(vWorldPos - cameraPosition);
        float fogF = smoothstep(60.0, 220.0, depth);
        col = mix(col, uFogColor, fogF);
      }

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

  // Pulse scheduler — fire every 4 seconds (exact glennso)
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
      // Slow camera drift for parallax — visible but unhurried (exact glennso)
      const r = 70;
      const a = now * 0.05;
      camera.position.x = Math.sin(a) * 14;
      camera.position.z = r + Math.cos(a) * 6;
      camera.position.y = 30 + Math.sin(now * 0.12) * 2.0;
      camera.lookAt(0, -3, 0);
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      animId = requestAnimationFrame(tick);
    }
  }

  // Theme management for terrain
  interface TerrainPalette {
    clearColor: number;
    fogColor: string;
    baseColor: string;
    highColor: string;
    scanColor: string;
    isLight: boolean;
  }

  const TERRAIN_PALETTES: Record<string, TerrainPalette> = {
    dark: {
      clearColor: 0x07090a,
      fogColor: '#07090a',
      baseColor: '#4a5a3d',
      highColor: '#c8d6a8',
      scanColor: '#F29559',
      isLight: false,
    },
    white: {
      clearColor: 0x090a0c,
      fogColor: '#090a0c',
      baseColor: '#20242c',
      highColor: '#ffffff',
      scanColor: '#ffffff',
      isLight: false,
    },
    blue: {
      clearColor: 0x060c18,
      fogColor: '#060c18',
      baseColor: '#163152',
      highColor: '#7dd3fc',
      scanColor: '#38bdf8',
      isLight: false,
    },
    emerald: {
      clearColor: 0x050e09,
      fogColor: '#050e09',
      baseColor: '#0f3d26',
      highColor: '#6ee7b7',
      scanColor: '#10b981',
      isLight: false,
    },
    violet: {
      clearColor: 0x0c0716,
      fogColor: '#0c0716',
      baseColor: '#301552',
      highColor: '#d8b4fe',
      scanColor: '#c084fc',
      isLight: false,
    },
    light: {
      clearColor: 0xf4f5ee,
      fogColor: '#f4f5ee',
      baseColor: '#d6ddcf',
      highColor: '#b0be9a',
      scanColor: '#d65d1a',
      isLight: true,
    },
  };

  function applyTerrainTheme(theme: string): void {
    const p = TERRAIN_PALETTES[theme] || TERRAIN_PALETTES.dark;
    uniforms.uIsLight.value = p.isLight ? 1.0 : 0.0;
    renderer.setClearColor(p.clearColor, 1);
    if (scene.fog) {
      scene.fog.color.set(p.clearColor);
    }
    uniforms.uFogColor.value.set(p.fogColor);
    uniforms.uBaseColor.value.set(p.baseColor);
    uniforms.uHighColor.value.set(p.highColor);
    uniforms.uScanColor.value.set(p.scanColor);
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTerrainTheme(initialTheme);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    tick();
  }

  // Interactive Click-to-Pulse (exact glennso)
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function onPointerDown(e: MouseEvent | TouchEvent): void {
    const target = e.target as HTMLElement | null;
    // Disregard clicks on interactive components (buttons, links, inputs, chips, tabs, modal close, etc.)
    if (
      target?.closest(
        'button, a, input, select, textarea, [role="button"], [role="menuitem"], .theme-toggle, .mobile-nav-item, .sound-toggle, .ott-filter-chip, .media-mode-tab',
      )
    ) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = canvas!.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(ndc, camera);
    let hitPoint: THREE.Vector3 | null = null;
    const hits = raycaster.intersectObject(terrain);
    if (hits.length) {
      hitPoint = hits[0].point;
    } else {
      // Intersect with ground plane so clicks across the background area trigger the wave
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const targetPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, targetPoint)) {
        hitPoint = targetPoint;
      }
    }

    if (!hitPoint) return;

    uniforms.uPulseOrigin.value.set(hitPoint.x, hitPoint.z);
    firePulse(clock.getElapsedTime(), { radial: true });

    // Cue darkmatter-2.mp3 on click on background area wave effect
    window.dispatchEvent(new CustomEvent('terrain-wave'));
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

document.addEventListener('astro:page-load', initTerrainScene);
