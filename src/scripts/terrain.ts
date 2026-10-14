import * as THREE from 'three';

/**
 * Neural Latent Field & Synaptic Flow
 *
 * An interactive 3D WebGL latent space visualization:
 * - High-dimensional neural embedding manifold with semantic clusters
 * - Dynamic synaptic attention lines with distance-weighted attention weights
 * - Propagating attention query waves (automatic + interactive click/tap)
 * - Multi-octave harmonic continuous latent drift
 * - Full light & dark mode architectural styling
 * - Reduced motion & tab visibility power-saving
 */

interface LatentNode {
  base: THREE.Vector3;
  pos: THREE.Vector3;
  cluster: number;
  driftFreq: THREE.Vector3;
  driftAmp: THREE.Vector3;
  driftPhase: THREE.Vector3;
  activation: number;
}

interface SynapseEdge {
  a: number;
  b: number;
  baseWeight: number;
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
  const fog = new THREE.FogExp2(0x07090a, 0.0075);
  scene.fog = fog;

  // Camera - framed towards the right negative space with dimensional depth
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 800);
  camera.position.set(22, 14, 110);
  camera.lookAt(32, 0, 0);

  // ─────────────────────────────────────────────────────────────────────────
  // Generate Neural Latent Manifold (Semantic Clusters + Bridging Pathways)
  // ─────────────────────────────────────────────────────────────────────────
  const NODE_COUNT = 360;
  const nodes: LatentNode[] = [];

  // Cluster centers in latent space
  const clusterCenters = [
    new THREE.Vector3(48, 14, -8), // Systems & Distributed Architecture
    new THREE.Vector3(64, -14, 16), // Deep Learning & MLOps Infrastructure
    new THREE.Vector3(18, -10, -6), // Agentic Reasoning & Vector RAG
    new THREE.Vector3(-18, 6, -18), // Input Embedding Gateway (subtle left trail)
  ];

  // Pseudo-random deterministic generator
  let seed = 42;
  function rand(): number {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  function randRange(min: number, max: number): number {
    return min + rand() * (max - min);
  }

  for (let i = 0; i < NODE_COUNT; i++) {
    const clusterIdx = Math.floor(rand() * clusterCenters.length);
    const center = clusterCenters[clusterIdx];

    // Spread nodes with Gaussian-like clustering around centers
    const u = rand();
    const v = rand();
    const r = Math.sqrt(-2.0 * Math.log(Math.max(1e-5, u))) * (14.0 + clusterIdx * 3.0);
    const theta = v * Math.PI * 2.0;
    const phi = (rand() - 0.5) * Math.PI;

    const x = center.x + r * Math.cos(theta) * Math.cos(phi);
    const y = center.y + r * Math.sin(phi) * 0.75;
    const z = center.z + r * Math.sin(theta) * Math.cos(phi);

    nodes.push({
      base: new THREE.Vector3(x, y, z),
      pos: new THREE.Vector3(x, y, z),
      cluster: clusterIdx,
      driftFreq: new THREE.Vector3(
        randRange(0.2, 0.5),
        randRange(0.25, 0.55),
        randRange(0.18, 0.45),
      ),
      driftAmp: new THREE.Vector3(randRange(1.2, 2.8), randRange(1.0, 2.2), randRange(1.2, 2.6)),
      driftPhase: new THREE.Vector3(
        rand() * Math.PI * 2,
        rand() * Math.PI * 2,
        rand() * Math.PI * 2,
      ),
      activation: 0.0,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Synaptic Attention Edges (Graph Connections)
  // ─────────────────────────────────────────────────────────────────────────
  const ATTENTION_RADIUS = 21.0;
  const synapses: SynapseEdge[] = [];
  const maxEdgesPerNode = 5;
  const nodeEdgeCounts = new Uint8Array(NODE_COUNT);

  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      if (nodeEdgeCounts[i] >= maxEdgesPerNode && nodeEdgeCounts[j] >= maxEdgesPerNode) {
        continue;
      }
      const dist = nodes[i].base.distanceTo(nodes[j].base);
      if (dist < ATTENTION_RADIUS) {
        const weight = 1.0 - dist / ATTENTION_RADIUS;
        synapses.push({ a: i, b: j, baseWeight: weight });
        nodeEdgeCounts[i]++;
        nodeEdgeCounts[j]++;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GPU Buffer Geometries
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Nodes (Points)
  const nodeGeo = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeActivations = new Float32Array(NODE_COUNT);
  const nodeClusterTypes = new Float32Array(NODE_COUNT);

  for (let i = 0; i < NODE_COUNT; i++) {
    nodePositions[i * 3 + 0] = nodes[i].pos.x;
    nodePositions[i * 3 + 1] = nodes[i].pos.y;
    nodePositions[i * 3 + 2] = nodes[i].pos.z;
    nodeActivations[i] = 0.0;
    nodeClusterTypes[i] = nodes[i].cluster;
  }

  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeo.setAttribute('aActivation', new THREE.BufferAttribute(nodeActivations, 1));
  nodeGeo.setAttribute('aCluster', new THREE.BufferAttribute(nodeClusterTypes, 1));

  // 2. Synapses (Line Segments)
  const lineCount = synapses.length;
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(lineCount * 2 * 3);
  const lineWeights = new Float32Array(lineCount * 2);
  const lineActivations = new Float32Array(lineCount * 2);

  for (let i = 0; i < lineCount; i++) {
    const edge = synapses[i];
    const na = nodes[edge.a];
    const nb = nodes[edge.b];

    const idx = i * 6;
    linePositions[idx + 0] = na.pos.x;
    linePositions[idx + 1] = na.pos.y;
    linePositions[idx + 2] = na.pos.z;

    linePositions[idx + 3] = nb.pos.x;
    linePositions[idx + 4] = nb.pos.y;
    linePositions[idx + 5] = nb.pos.z;

    lineWeights[i * 2 + 0] = edge.baseWeight;
    lineWeights[i * 2 + 1] = edge.baseWeight;
    lineActivations[i * 2 + 0] = 0.0;
    lineActivations[i * 2 + 1] = 0.0;
  }

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('aWeight', new THREE.BufferAttribute(lineWeights, 1));
  lineGeo.setAttribute('aActivation', new THREE.BufferAttribute(lineActivations, 1));

  // ─────────────────────────────────────────────────────────────────────────
  // Custom Shader Materials for Nodes and Synapses
  // ─────────────────────────────────────────────────────────────────────────
  const commonUniforms = {
    uTime: { value: 0 },
    uIsLight: { value: 0.0 },
    uBaseColor: { value: new THREE.Color('#c8d6a8') },
    uLineColor: { value: new THREE.Color('#eef0e6') },
    uActiveColor: { value: new THREE.Color('#F29559') },
    uFogColor: { value: new THREE.Color('#07090a') },
  };

  // Node Shader
  const nodeMaterial = new THREE.ShaderMaterial({
    uniforms: commonUniforms,
    vertexShader: /* glsl */ `
      attribute float aActivation;
      attribute float aCluster;
      varying float vActivation;
      varying float vCluster;
      varying vec3 vWorldPos;

      void main() {
        vActivation = aActivation;
        vCluster = aCluster;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;

        // Size attenuation based on distance and activation pulse
        float baseSize = 4.2 + (aCluster == 0.0 ? 1.0 : (aCluster == 1.0 ? 0.6 : 0.0));
        float pSize = (baseSize + aActivation * 7.5) * (180.0 / -mvPosition.z);
        gl_PointSize = clamp(pSize, 1.5, 48.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uIsLight;
      uniform vec3 uBaseColor;
      uniform vec3 uActiveColor;
      uniform vec3 uFogColor;
      varying float vActivation;
      varying float vCluster;
      varying vec3 vWorldPos;

      void main() {
        // Soft anti-aliased circular point disk with glowing core
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        float core = 1.0 - smoothstep(0.0, 0.22, dist);
        float halo = 1.0 - smoothstep(0.18, 0.5, dist);

        vec3 restingCol;
        if (uIsLight > 0.5) {
          // Architectural graphite/slate
          restingCol = mix(vec3(0.24, 0.29, 0.22), vec3(0.42, 0.48, 0.38), vCluster * 0.33);
        } else {
          // Phosphor bone & chartreuse
          restingCol = mix(uBaseColor, vec3(0.93, 0.94, 0.90), vCluster * 0.25);
        }

        vec3 col = mix(restingCol, uActiveColor, clamp(vActivation * 1.3, 0.0, 1.0));
        float alpha = halo * (0.65 + vActivation * 0.35) + core * 0.35;

        // Depth fog attenuation
        float depth = length(vWorldPos - cameraPosition);
        float fogFactor = clamp((depth - 40.0) / 180.0, 0.0, 1.0);
        col = mix(col, uFogColor, fogFactor * 0.85);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  // Synapse Lines Shader
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms: commonUniforms,
    vertexShader: /* glsl */ `
      attribute float aWeight;
      attribute float aActivation;
      varying float vWeight;
      varying float vActivation;
      varying vec3 vWorldPos;

      void main() {
        vWeight = aWeight;
        vActivation = aActivation;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uIsLight;
      uniform vec3 uLineColor;
      uniform vec3 uActiveColor;
      uniform vec3 uFogColor;
      varying float vWeight;
      varying float vActivation;
      varying vec3 vWorldPos;

      void main() {
        vec3 restingCol;
        float baseAlpha;

        if (uIsLight > 0.5) {
          restingCol = vec3(0.32, 0.38, 0.28);
          baseAlpha = vWeight * 0.22;
        } else {
          restingCol = uLineColor;
          baseAlpha = vWeight * 0.16;
        }

        vec3 col = mix(restingCol, uActiveColor, clamp(vActivation * 1.5, 0.0, 1.0));
        float alpha = clamp(baseAlpha + vActivation * 0.70, 0.0, 0.95);

        // Distance fog
        float depth = length(vWorldPos - cameraPosition);
        float fogFactor = clamp((depth - 40.0) / 180.0, 0.0, 1.0);
        col = mix(col, uFogColor, fogFactor * 0.85);
        alpha *= (1.0 - fogFactor * 0.9);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  const nodeMesh = new THREE.Points(nodeGeo, nodeMaterial);
  const lineMesh = new THREE.LineSegments(lineGeo, lineMaterial);

  scene.add(lineMesh);
  scene.add(nodeMesh);

  // ─────────────────────────────────────────────────────────────────────────
  // Attention Query Waves (Propagation Physics)
  // ─────────────────────────────────────────────────────────────────────────
  interface QueryWave {
    origin: THREE.Vector3;
    startTime: number;
    speed: number;
    maxRadius: number;
  }

  const waves: QueryWave[] = [];
  const WAVE_INTERVAL = 4.2;
  let nextAutoWave = 1.0;
  let autoClusterIdx = 0;

  function triggerWave(origin: THREE.Vector3, now: number): void {
    waves.push({
      origin: origin.clone(),
      startTime: now,
      speed: 55.0,
      maxRadius: 160.0,
    });
    if (waves.length > 5) waves.shift();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mouse & Parallax Interaction
  // ─────────────────────────────────────────────────────────────────────────
  const targetCam = new THREE.Vector3(22, 14, 110);
  const mouseNdc = new THREE.Vector2(0, 0);

  function onPointerMove(e: MouseEvent): void {
    mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  window.addEventListener('mousemove', onPointerMove, { passive: true });

  const raycaster = new THREE.Raycaster();
  const clickNdc = new THREE.Vector2();

  function onPointerDown(e: MouseEvent | TouchEvent): void {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    clickNdc.x = (clientX / window.innerWidth) * 2 - 1;
    clickNdc.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(clickNdc, camera);

    // Raycast against a virtual latent focal plane at z = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hitPoint = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, hitPoint);

    const now = clock.getElapsedTime();
    if (hit) {
      triggerWave(hitPoint, now);
    } else {
      triggerWave(clusterCenters[0], now);
    }
  }

  window.addEventListener('click', onPointerDown);

  // ─────────────────────────────────────────────────────────────────────────
  // Window Resize
  // ─────────────────────────────────────────────────────────────────────────
  function resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ─────────────────────────────────────────────────────────────────────────
  // Animation Render Loop
  // ─────────────────────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let animId: number | null = null;

  function tick(): void {
    const now = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.1);
    commonUniforms.uTime.value = now;

    // Automatic periodic inference wave from alternating clusters
    if (now >= nextAutoWave) {
      triggerWave(clusterCenters[autoClusterIdx], now);
      autoClusterIdx = (autoClusterIdx + 1) % clusterCenters.length;
      nextAutoWave = now + WAVE_INTERVAL;
    }

    // 1. Update Node Positions with Harmonic Latent Drift
    const nodePosAttr = nodeGeo.attributes.position as THREE.BufferAttribute;
    const nodeActAttr = nodeGeo.attributes.aActivation as THREE.BufferAttribute;

    for (let i = 0; i < NODE_COUNT; i++) {
      const node = nodes[i];

      if (!reducedMotion) {
        node.pos.x =
          node.base.x + Math.sin(now * node.driftFreq.x + node.driftPhase.x) * node.driftAmp.x;
        node.pos.y =
          node.base.y + Math.cos(now * node.driftFreq.y + node.driftPhase.y) * node.driftAmp.y;
        node.pos.z =
          node.base.z + Math.sin(now * node.driftFreq.z + node.driftPhase.z) * node.driftAmp.z;

        nodePosAttr.setXYZ(i, node.pos.x, node.pos.y, node.pos.z);
      }

      // 2. Wave Propagation & Node Activation
      let maxWaveAct = 0.0;
      for (let w = 0; w < waves.length; w++) {
        const wave = waves[w];
        const elapsed = now - wave.startTime;
        const currentRadius = elapsed * wave.speed;
        if (currentRadius > wave.maxRadius + 10.0) continue;

        const distToOrigin = node.pos.distanceTo(wave.origin);
        const delta = Math.abs(distToOrigin - currentRadius);

        if (delta < 7.0) {
          const proximity = 1.0 - delta / 7.0;
          const life = Math.max(0, 1.0 - currentRadius / wave.maxRadius);
          const act = proximity * life;
          if (act > maxWaveAct) maxWaveAct = act;
        }
      }

      node.activation = Math.max(node.activation * Math.exp(-3.5 * dt), maxWaveAct);
      nodeActAttr.setX(i, node.activation);
    }

    nodePosAttr.needsUpdate = true;
    nodeActAttr.needsUpdate = true;

    // 3. Update Synapse Line Segment Vertices & Activations
    const linePosAttr = lineGeo.attributes.position as THREE.BufferAttribute;
    const lineActAttr = lineGeo.attributes.aActivation as THREE.BufferAttribute;

    for (let i = 0; i < lineCount; i++) {
      const edge = synapses[i];
      const na = nodes[edge.a];
      const nb = nodes[edge.b];

      if (!reducedMotion) {
        const idx = i * 6;
        linePosAttr.setXYZ(idx, na.pos.x, na.pos.y, na.pos.z);
        linePosAttr.setXYZ(idx + 3, nb.pos.x, nb.pos.y, nb.pos.z);
      }

      const edgeAct = Math.max(na.activation, nb.activation);
      lineActAttr.setX(i * 2, edgeAct);
      lineActAttr.setX(i * 2 + 1, edgeAct);
    }

    if (!reducedMotion) linePosAttr.needsUpdate = true;
    lineActAttr.needsUpdate = true;

    // 4. Smooth Parallax Camera Motion
    if (!reducedMotion) {
      targetCam.x = 22 + Math.sin(now * 0.08) * 8.0 + mouseNdc.x * 7.0;
      targetCam.y = 14 + Math.cos(now * 0.06) * 5.0 + mouseNdc.y * 6.0;
      targetCam.z = 110 + Math.sin(now * 0.04) * 6.0;

      camera.position.lerp(targetCam, 0.04);
      camera.lookAt(32, 0, 0);
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      animId = requestAnimationFrame(tick);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Theme Switching
  // ─────────────────────────────────────────────────────────────────────────
  function applyTheme(theme: string): void {
    const isLight = theme === 'light';
    commonUniforms.uIsLight.value = isLight ? 1.0 : 0.0;

    const bgHex = isLight ? 0xf4f5ee : 0x07090a;
    renderer.setClearColor(bgHex, 1);
    fog.color.set(bgHex);
    commonUniforms.uFogColor.value.set(isLight ? '#f4f5ee' : '#07090a');

    if (isLight) {
      commonUniforms.uBaseColor.value.set('#3a4435');
      commonUniforms.uLineColor.value.set('#424c3d');
      commonUniforms.uActiveColor.value.set('#d65d1a');
    } else {
      commonUniforms.uBaseColor.value.set('#c8d6a8');
      commonUniforms.uLineColor.value.set('#eef0e6');
      commonUniforms.uActiveColor.value.set('#F29559');
    }
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(initialTheme);

  if (reducedMotion) {
    renderer.render(scene, camera);
  } else {
    tick();
  }

  window.addEventListener('themechange', (e: Event) => {
    const custom = e as CustomEvent<{ theme: string }>;
    if (custom.detail?.theme) {
      applyTheme(custom.detail.theme);
      if (reducedMotion) renderer.render(scene, camera);
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
