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
  renderer.setClearColor(0x080822, 1);
  renderer.autoClear = false;

  // ── 90s SYNTHWAVE AURORA BACKGROUND SKY (Variant Reference Shader) ──
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bgGeom = new THREE.PlaneGeometry(2, 2);

  const bgVertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const bgFragmentShader = /* glsl */ `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_theme;
    uniform vec3 u_bg;
    uniform vec3 u_c1;
    uniform vec3 u_c2;
    uniform vec3 u_c3;
    varying vec2 vUv;

    // Simplex 3D Noise function (Ashima Arts)
    vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
      i = mod(i, 289.0);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 1.0 / 7.0;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
    }

    // Pseudo-random function for grain
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 st = uv;
      st.x *= u_resolution.x / u_resolution.y;

      // Slow organic celestial drift
      float t = u_time * 0.04;

      // Layered subtle noise for gaseous wisps and filaments
      float n1 = snoise(vec3(st * 1.6, t));
      float n2 = snoise(vec3(st * 2.8 - n1 * 0.35, t * 1.1));
      float n3 = snoise(vec3(st * 1.1 + n2 * 0.25, t * 0.7));

      // ── MULTIPLE SPARSELY DISTRIBUTED FADED GAS CLOUD REGIONS ──
      // Cloud 1: Warm amber / sunset gas cloud (horizon-left)
      vec2 p1 = vec2(0.24 + 0.05 * sin(t * 0.7), 0.65 + 0.04 * cos(t * 0.5));
      float d1 = length((st - p1) * vec2(1.2, 0.85));
      float cloud1 = smoothstep(0.42, 0.03, d1 + n1 * 0.14);

      // Cloud 2: Deep cosmic violet / magenta gas cloud (upper-right)
      vec2 p2 = vec2(0.82 + 0.05 * cos(t * 0.6), 0.75 + 0.04 * sin(t * 0.4));
      float d2 = length((st - p2) * vec2(0.95, 1.25));
      float cloud2 = smoothstep(0.40, 0.03, d2 + n2 * 0.13);

      // Cloud 3: Ethereal cyan / teal nebula dust (center-right)
      vec2 p3 = vec2(0.58 + 0.06 * sin(t * 0.5 + 1.8), 0.42 + 0.03 * cos(t * 0.8));
      float d3 = length((st - p3) * vec2(1.3, 0.95));
      float cloud3 = smoothstep(0.36, 0.04, d3 + n3 * 0.12);

      // Cloud 4: Deep atmospheric blue pocket (far upper-left)
      vec2 p4 = vec2(0.14 + 0.04 * cos(t * 0.4 + 2.2), 0.86 + 0.03 * sin(t * 0.6));
      float d4 = length((st - p4) * vec2(1.1, 1.1));
      float cloud4 = smoothstep(0.35, 0.05, d4 + (n1 + n2) * 0.10);

      vec3 finalColor = u_bg;
      if (u_theme < 0.5) {
        // DARK MODE: Sparse faded gas clouds against deep space void
        finalColor += u_c2 * cloud1 * 0.28; // Amber/warm cloud
        finalColor += u_c3 * cloud2 * 0.24; // Violet/magenta cloud
        finalColor += u_c1 * cloud3 * 0.20; // Teal/cyan dust cloud
        finalColor += mix(u_c1, u_c3, 0.5) * cloud4 * 0.16; // Indigo pocket
      } else {
        // LIGHT MODE: Subtle delicate watercolor washes
        finalColor = mix(finalColor, u_c2, cloud1 * 0.09);
        finalColor = mix(finalColor, u_c3, cloud2 * 0.07);
        finalColor = mix(finalColor, u_c1, cloud3 * 0.07);
      }

      // High-frequency subtle film grain
      float grain = random(uv * 23.17 + fract(u_time * 0.08)) - 0.5;
      float grainIntensity = mix(0.035, 0.015, u_theme);
      finalColor += grain * grainIntensity;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const bgUniforms = {
    u_time: { value: 0.0 },
    u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    u_theme: { value: 0.0 },
    u_bg: { value: new THREE.Color(0.08, 0.08, 0.22) },
    u_c1: { value: new THREE.Color(0.16, 0.18, 0.48) },
    u_c2: { value: new THREE.Color(1.0, 0.42, 0.21) },
    u_c3: { value: new THREE.Color(0.8, 0.2, 0.33) },
  };

  const bgMat = new THREE.ShaderMaterial({
    vertexShader: bgVertexShader,
    fragmentShader: bgFragmentShader,
    uniforms: bgUniforms,
    depthWrite: false,
    depthTest: false,
  });

  const bgMesh = new THREE.Mesh(bgGeom, bgMat);
  bgScene.add(bgMesh);

  // Scene & Fog (exact glennso)
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x080822, 60, 220);

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

    // Rectangular edge falloff preserving the sharp rectangular geometry of the terrain plate
    const halfPlate = SIZE * 0.48;
    const nx = Math.min(1, Math.abs(x) / halfPlate);
    const nz = Math.min(1, Math.abs(z) / halfPlate);
    const edgeX = Math.max(0, 1 - Math.pow(nx, 10.0));
    const edgeZ = Math.max(0, 1 - Math.pow(nz, 10.0));
    const rectFalloff = edgeX * edgeZ;

    pos.setY(i, (shaped - 0.35) * HEIGHT_SCALE * rectFalloff);
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
      float alpha = 1.0;
      if (uIsLight > 0.5) {
        // ── LIGHT MODE: Crisp gallery porcelain landscape rendered as architectural drafting ──
        vec3 paperBase  = uFogColor; // #f6f8fb
        vec3 slopeColor = vec3(0.88, 0.92, 0.97);
        vec3 peakColor  = vec3(0.80, 0.86, 0.94);
        vec3 base = mix(paperBase, slopeColor, smoothstep(0.0, 0.55, hN));
        base = mix(base, peakColor, smoothstep(0.55, 1.0, hN));
        base *= (0.88 + 0.18 * lambert);

        // Grid & contour lines as crisp architectural drafting ink
        vec3 lineInk = vec3(0.25, 0.33, 0.45);
        vec3 majorLineInk = vec3(0.12, 0.18, 0.28);
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
        col = mix(col, vec3(1.0, 0.92, 0.84), band * 0.30);
        col = mix(col, uScanColor, clamp(band * lineDetail, 0.0, 1.0));

        // Crisp rectangular plate border clipping
        float halfW = 125.0;
        float edgeX = 1.0 - smoothstep(halfW - 2.0, halfW, abs(vLocalPos.x));
        float edgeZ = 1.0 - smoothstep(halfW - 2.0, halfW, abs(vLocalPos.z));
        float depth = length(vWorldPos - cameraPosition);
        float fogF = smoothstep(85.0, 230.0, depth);
        col = mix(col, uFogColor, fogF * 0.50);
        alpha = clamp(edgeX * edgeZ, 0.0, 1.0);
      } else {
        // ── DARK MODE: TACTICAL CARTOGRAPHY OVER FADED CELESTIAL AMBIENCE ──
        vec3 lowCol  = uBaseColor * 0.22;
        vec3 midCol  = uBaseColor * 0.85;
        vec3 highCol = mix(uBaseColor, uHighColor, 0.88);
        vec3 base = mix(lowCol, midCol, smoothstep(0.0, 0.50, hN));
        base = mix(base, highCol, smoothstep(0.50, 1.0, hN));
        // Lambert: peaks lit, slopes shaded, valleys darker still
        base *= (0.38 + 0.72 * lambert) * (0.75 + 0.25 * upFacing);

        // Calibrated subtle chromatic ramp (Terracotta -> Amber -> Cyan -> Teal)
        float normX = clamp(vWorldPos.x / 130.0 * 0.5 + 0.5, 0.0, 1.0);
        vec3 synthwaveWarm = mix(vec3(0.85, 0.35, 0.08), vec3(0.88, 0.65, 0.30), smoothstep(0.0, 0.45, normX));
        vec3 synthwaveCool = mix(vec3(0.18, 0.60, 0.78), vec3(0.14, 0.48, 0.45), smoothstep(0.45, 1.0, normX));
        vec3 synthwaveChroma = mix(synthwaveWarm, synthwaveCool, smoothstep(0.35, 0.65, normX));

        // Soft distant horizon glow only in far-field background
        float horizonGlow = smoothstep(-45.0, -115.0, vWorldPos.z) * smoothstep(-2.0, 10.0, vElevation);
        base += synthwaveChroma * horizonGlow * 0.15;

        // Tactical Cartography Grid: muted, elegant phosphor luminance (never blinding)
        col = base;
        col += mix(uBaseColor, synthwaveChroma, 0.25) * gMicro * 0.05;
        col += mix(uHighColor, synthwaveChroma, 0.35) * gMinor * 0.12;
        col += mix(uHighColor, synthwaveChroma, 0.50) * gMajor * 0.22;
        col += uHighColor * ctrMinor * 0.06;
        col += mix(uHighColor, synthwaveChroma, 0.45) * ctrMajor * 0.16;

        // Controlled, elegant scan pulse illumination (prevents washed-out foreground glare)
        float scanBoost = band;
        col += uScanColor * scanBoost * (
          0.02
          + gMicro   * 0.10
          + gMinor   * 0.22
          + gMajor   * 0.38
          + ctrMinor * 0.10
          + ctrMajor * 0.24
        );

        // Foreground text-contrast buffer: gently deepens terrain in camera near-field
        // where hero text sits (vWorldPos.z > -15.0) ensuring pristine white text contrast
        float fgDepth = smoothstep(-25.0, 35.0, vWorldPos.z);
        col = mix(col, col * 0.70, fgDepth * 0.40);

        // Distance fog subtly blending base into horizon
        float depth = length(vWorldPos - cameraPosition);
        float fogF = smoothstep(85.0, 230.0, depth);
        vec3 fogSynthwave = mix(
          uFogColor,
          synthwaveChroma * 0.25,
          smoothstep(90.0, 210.0, depth) * (0.35 + 0.65 * clamp((vElevation + 2.0) / 14.0, 0.0, 1.0))
        );
        col = mix(col, fogSynthwave, fogF * 0.45);

        // Sharp rectangular plate border clipping
        float halfW = 125.0;
        float edgeX = 1.0 - smoothstep(halfW - 2.0, halfW, abs(vLocalPos.x));
        float edgeZ = 1.0 - smoothstep(halfW - 2.0, halfW, abs(vLocalPos.z));
        alpha = clamp(edgeX * edgeZ, 0.0, 1.0);
      }

      gl_FragColor = vec4(col, alpha);
    }
  `;

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: true,
    depthTest: true,
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
    bgUniforms.u_resolution.value.set(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  // Helper to render both background sky and terrain in clean passes
  function renderScene(): void {
    renderer.clear();
    renderer.render(bgScene, bgCamera);
    renderer.render(scene, camera);
  }

  // Animation Loop
  const clock = new THREE.Clock();
  let animId: number | null = null;
  let isRecalibrating = false;
  let recalibrateStartTime = 0;

  function triggerCartographyRecalibration(): void {
    isRecalibrating = true;
    const now = clock.getElapsedTime();
    recalibrateStartTime = now;

    // Reset pulse to center (0, 0) and trigger wide, fast radial cartography wave
    uniforms.uPulseOrigin.value.set(0, 0);
    uniforms.uPulseMode.value = 1.0;
    uniforms.uPulseSpeed.value = 240.0;
    uniforms.uPulseWidth.value = 18.0;
    uniforms.uMaxRadius.value = 320.0;
    uniforms.uPulseStart.value = now;
    nextPulseAt = now + 4.0;

    // Trigger audio effect
    try {
      window.dispatchEvent(new CustomEvent('terrain-wave'));
    } catch {}

    if (reducedMotion) {
      renderScene();
    }
  }

  window.addEventListener('cartography-recalibrate', triggerCartographyRecalibration);

  function tick(): void {
    const now = clock.getElapsedTime();
    uniforms.uTime.value = now;
    bgUniforms.u_time.value = now;

    if (now >= nextPulseAt && !isRecalibrating) {
      firePulse(now);
    }

    if (isRecalibrating) {
      const elapsed = now - recalibrateStartTime;
      const progress = Math.min(1.0, elapsed / 0.7);
      // Topographic cartography elevation lift & orbital sweep
      const lift = Math.sin(progress * Math.PI) * 18.0;
      camera.position.x = Math.sin(now * 0.05) * 14 * (1 - progress * 0.7);
      camera.position.z = 70 + Math.cos(now * 0.05) * 6 * (1 - progress * 0.7);
      camera.position.y = 30 + lift;
      camera.lookAt(0, -3 + lift * 0.25, 0);
    } else if (!reducedMotion) {
      // Slow camera drift for parallax — visible but unhurried (exact glennso)
      const r = 70;
      const a = now * 0.05;
      camera.position.x = Math.sin(a) * 14;
      camera.position.z = r + Math.cos(a) * 6;
      camera.position.y = 30 + Math.sin(now * 0.12) * 2.0;
      camera.lookAt(0, -3, 0);
    }

    renderScene();

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
    skyBg: THREE.Color;
    skyC1: THREE.Color;
    skyC2: THREE.Color;
    skyC3: THREE.Color;
    isLight: boolean;
  }

  const TERRAIN_PALETTES: Record<string, TerrainPalette> = {
    dark: {
      clearColor: 0x05060a,
      fogColor: '#05060a',
      baseColor: '#3a4a30',
      highColor: '#a0b482',
      scanColor: '#e08240',
      skyBg: new THREE.Color(0.02, 0.022, 0.038),
      skyC1: new THREE.Color(0.12, 0.55, 0.65),
      skyC2: new THREE.Color(0.85, 0.38, 0.14),
      skyC3: new THREE.Color(0.55, 0.15, 0.5),
      isLight: false,
    },
    white: {
      clearColor: 0x090a0c,
      fogColor: '#090a0c',
      baseColor: '#20242c',
      highColor: '#ffffff',
      scanColor: '#ff2a4b',
      skyBg: new THREE.Color(0.06, 0.07, 0.09),
      skyC1: new THREE.Color(0.14, 0.16, 0.22),
      skyC2: new THREE.Color(1.0, 0.25, 0.35),
      skyC3: new THREE.Color(0.75, 0.8, 0.9),
      isLight: false,
    },
    blue: {
      clearColor: 0x060c18,
      fogColor: '#060c18',
      baseColor: '#163152',
      highColor: '#7dd3fc',
      scanColor: '#38bdf8',
      skyBg: new THREE.Color(0.03, 0.06, 0.14),
      skyC1: new THREE.Color(0.08, 0.2, 0.45),
      skyC2: new THREE.Color(0.22, 0.74, 0.98),
      skyC3: new THREE.Color(0.4, 0.3, 0.88),
      isLight: false,
    },
    emerald: {
      clearColor: 0x050e09,
      fogColor: '#050e09',
      baseColor: '#0f3d26',
      highColor: '#6ee7b7',
      scanColor: '#10b981',
      skyBg: new THREE.Color(0.02, 0.08, 0.05),
      skyC1: new THREE.Color(0.06, 0.26, 0.16),
      skyC2: new THREE.Color(0.25, 0.88, 0.58),
      skyC3: new THREE.Color(0.15, 0.65, 0.72),
      isLight: false,
    },
    violet: {
      clearColor: 0x0c0716,
      fogColor: '#0c0716',
      baseColor: '#301552',
      highColor: '#d8b4fe',
      scanColor: '#c084fc',
      skyBg: new THREE.Color(0.08, 0.04, 0.15),
      skyC1: new THREE.Color(0.24, 0.12, 0.42),
      skyC2: new THREE.Color(0.92, 0.4, 0.85),
      skyC3: new THREE.Color(0.6, 0.22, 0.9),
      isLight: false,
    },
    light: {
      clearColor: 0xf5f2e9,
      fogColor: '#f5f2e9',
      baseColor: '#e8e2d4',
      highColor: '#ddd5c3',
      scanColor: '#0284c7',
      skyBg: new THREE.Color(0.95, 0.92, 0.9),
      skyC1: new THREE.Color(0.85, 0.88, 0.98),
      skyC2: new THREE.Color(1.0, 0.82, 0.7),
      skyC3: new THREE.Color(0.9, 0.7, 0.8),
      isLight: true,
    },
  };

  function applyTerrainTheme(theme: string): void {
    const p = TERRAIN_PALETTES[theme] || TERRAIN_PALETTES.dark;
    uniforms.uIsLight.value = p.isLight ? 1.0 : 0.0;
    bgUniforms.u_theme.value = p.isLight ? 1.0 : 0.0;
    bgUniforms.u_bg.value.copy(p.skyBg);
    bgUniforms.u_c1.value.copy(p.skyC1);
    bgUniforms.u_c2.value.copy(p.skyC2);
    bgUniforms.u_c3.value.copy(p.skyC3);
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
    renderScene();
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
        renderScene();
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
