import * as THREE from 'three';

/**
 * seasonal-effects.ts — Hyper-Realistic 3D Seasonal Visual Effects Engine
 *
 * Automated Annual Scheduling (decided dates every year):
 * - Christmas Season: December 15 (00:00) through December 26 (23:59)
 *   Hyper-realistic 3D crystalline snowfall with macro dendritic crystal flakes,
 *   feathery fern ice stars, prismatic hexagonal plates, 3D tumbling physics,
 *   and depth-of-field volumetric bokeh.
 * - New Year Season: December 27 (00:00) through January 5 (23:59)
 *   Cinematic 3D cybernetic fireworks bursts, gravity spark physics,
 *   ambient celebration stardust, and interactive cursor explosions.
 *
 * Manual Overrides & Previews:
 * - URL parameter: ?season=christmas | ?season=newyear | ?season=off | ?season=auto
 * - LocalStorage: 'seasonal_override' = 'auto' | 'christmas' | 'newyear' | 'off'
 * - Footer telemetry pill: click to cycle modes with instant preview and chime feedback.
 *
 * Performance:
 * - GPU-accelerated WebGL with Three.js.
 * - Pre-allocated sprite pools, zero-GC frame updates, 60+ FPS on Apple Silicon M1.
 * - Auto-pauses on background tabs (Page Visibility API) and respects prefers-reduced-motion.
 * - Persisted across Astro View Transitions.
 */

export type SeasonalMode = 'christmas' | 'newyear' | 'none';
export type SeasonalOverride = 'auto' | 'christmas' | 'newyear' | 'off';

export function isHolidaySeason(): boolean {
  // Seasonal visual effects completely disabled
  return false;
}

interface SnowFlake {
  sprite: THREE.Sprite;
  baseScaleX: number;
  baseScaleY: number;
  speedY: number;
  swayAmplitude: number;
  swaySpeed: number;
  swayPhase: number;
  tumbleSpeed: number;
  tumblePhase: number;
  rotSpeed: number;
  windDrift: number;
  baseOpacity: number;
  type: number;
}

interface SparkParticle {
  sprite: THREE.Sprite;
  vx: number;
  vy: number;
  vz: number;
  drag: number;
  gravity: number;
  alpha: number;
  decay: number;
  baseScale: number;
  color: THREE.Color;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface FireworkBurst {
  sparks: SparkParticle[];
  shockwave?: {
    sprite: THREE.Sprite;
    scale: number;
    maxScale: number;
    alpha: number;
    decay: number;
  };
  group: THREE.Group;
}

interface AmbientSpark {
  sprite: THREE.Sprite;
  baseScale: number;
  speedY: number;
  speedX: number;
  speedZ: number;
  phase: number;
  twinkleSpeed: number;
  baseOpacity: number;
}

export class SeasonalEffectsEngine {
  private canvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;

  private animFrameId: number | null = null;
  private isRunning = false;
  private isEnabled = true;
  private currentMode: SeasonalMode = 'none';
  private currentOverride: SeasonalOverride = 'auto';

  // Texture Cache
  private snowTextures: THREE.CanvasTexture[] = [];
  private sparkTexture: THREE.CanvasTexture | null = null;
  private shockwaveTexture: THREE.CanvasTexture | null = null;

  // Particle Groups
  private snowFlakes: SnowFlake[] = [];
  private snowGroup: THREE.Group | null = null;

  private fireworkBursts: FireworkBurst[] = [];
  private fireworksGroup: THREE.Group | null = null;

  private ambientSparks: AmbientSpark[] = [];
  private ambientGroup: THREE.Group | null = null;

  private nextBurstTime = 0;

  // Interactive Parallax
  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;

  // Screen Dimensions
  private width = 0;
  private height = 0;

  private checkInterval: number | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    this.isEnabled = false;
    this.currentMode = 'none';
    this.currentOverride = 'off';
    this.init();
  }

  private readStoredOverride(): void {
    this.isEnabled = false;
    this.currentOverride = 'off';
  }

  private readQueryOverride(): void {
    this.isEnabled = false;
    this.currentOverride = 'off';
  }

  public evaluateSeason(_now: Date = new Date()): SeasonalMode {
    return 'none';
  }

  public getTargetNewYear(now: Date = new Date()): number {
    const month = now.getMonth();
    const year = now.getFullYear();
    return month === 11 ? year + 1 : year;
  }

  public init(): void {
    this.isEnabled = false;
    this.currentMode = 'none';
    this.currentOverride = 'off';
    this.canvas = document.getElementById('seasonal-canvas') as HTMLCanvasElement | null;
    if (this.canvas) {
      this.canvas.style.display = 'none';
      this.canvas.classList.remove('is-active');
    }
    const root = document.documentElement;
    root.classList.remove('season-christmas', 'season-newyear');
    root.removeAttribute('data-season');
    const toggle = document.getElementById('seasonalFxToggle');
    if (toggle) {
      toggle.style.display = 'none';
    }
  }

  public onPageLoad(): void {
    this.isEnabled = false;
    this.currentMode = 'none';
    this.currentOverride = 'off';
    this.canvas = document.getElementById('seasonal-canvas') as HTMLCanvasElement | null;
    if (this.canvas) {
      this.canvas.style.display = 'none';
      this.canvas.classList.remove('is-active');
    }
    const root = document.documentElement;
    root.classList.remove('season-christmas', 'season-newyear');
    root.removeAttribute('data-season');
    const toggle = document.getElementById('seasonalFxToggle');
    if (toggle) {
      toggle.style.display = 'none';
    }
  }

  private initThree(): void {
    if (!this.canvas) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // WebGL Renderer with full alpha transparency
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.scene = new THREE.Scene();

    // 3D Perspective Camera (Fov 60, optimal for natural macro depth)
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    // Create particle groups
    this.snowGroup = new THREE.Group();
    this.fireworksGroup = new THREE.Group();
    this.ambientGroup = new THREE.Group();

    this.scene.add(this.snowGroup);
    this.scene.add(this.fireworksGroup);
    this.scene.add(this.ambientGroup);

    // Generate procedural high-definition textures
    this.generateTextures();
  }

  /**
   * Generates procedural neo-brutalist CAD blueprint and vector textures.
   */
  private generateTextures(): void {
    if (this.snowTextures.length > 0) return;

    // Tactical Texture 0: CAD Blueprint Dendrite (Hex Crystal)
    this.snowTextures.push(this.createTacticalDendriteTexture());

    // Tactical Texture 1: Coordinate Reticle Star & Guide Ring
    this.snowTextures.push(this.createTacticalReticleTexture());

    // Tactical Texture 2: Concentric Faceted Hex Lattice Prism
    this.snowTextures.push(this.createTacticalHexLatticeTexture());

    // Tactical Texture 3: Monospace Cryo Data Badge
    this.snowTextures.push(this.createTacticalDataBadgeTexture());

    // Tactical Vector Tracer Beam for Cyber Detonations
    this.sparkTexture = this.createTacticalTracerTexture();

    // Tactical Polygonal Shockwave Wavefront
    this.shockwaveTexture = this.createTacticalShockwaveTexture();
  }

  private createTacticalDendriteTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Ultra-crisp vector lines, no soft blurry glow
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    // Central tactical hex core with corner crosshairs
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const x = cx + Math.cos(angle) * 18;
      const y = cy + Math.sin(angle) * 18;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Center coordinate dot
    ctx.fillRect(cx - 2, cy - 2, 4, 4);

    // 6 Symmetrical CAD Vector Arms
    const armLength = 108;
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Main spine line
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(cx + cosA * 18, cy + sinA * 18);
      ctx.lineTo(cx + cosA * armLength, cy + sinA * armLength);
      ctx.stroke();

      // Sharp orthogonal vector rungs & tick marks
      ctx.lineWidth = 1.5;
      const notches = [0.38, 0.62, 0.84];
      const notchLengths = [24, 34, 18];
      for (let i = 0; i < notches.length; i++) {
        const bx = cx + cosA * (armLength * notches[i]);
        const by = cy + sinA * (armLength * notches[i]);
        const len = notchLengths[i];

        const aL = angle + Math.PI / 3;
        const aR = angle - Math.PI / 3;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(aL) * len, by + Math.sin(aL) * len);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(aR) * len, by + Math.sin(aR) * len);
        ctx.stroke();

        // Sharp 90-degree vector sub-ticks on middle rung
        if (i === 1) {
          const mxL = bx + Math.cos(aL) * (len * 0.55);
          const myL = by + Math.sin(aL) * (len * 0.55);
          ctx.beginPath();
          ctx.moveTo(mxL, myL);
          ctx.lineTo(mxL + cosA * 12, myL + sinA * 12);
          ctx.stroke();

          const mxR = bx + Math.cos(aR) * (len * 0.55);
          const myR = by + Math.sin(aR) * (len * 0.55);
          ctx.beginPath();
          ctx.moveTo(mxR, myR);
          ctx.lineTo(mxR + cosA * 12, myR + sinA * 12);
          ctx.stroke();
        }
      }

      // Terminal diamond vertex node
      const tipX = cx + cosA * armLength;
      const tipY = cy + sinA * armLength;
      ctx.beginPath();
      ctx.moveTo(tipX + cosA * 6, tipY + sinA * 6);
      ctx.lineTo(tipX - sinA * 4, tipY + cosA * 4);
      ctx.lineTo(tipX - cosA * 4, tipY - sinA * 4);
      ctx.lineTo(tipX + sinA * 4, tipY - cosA * 4);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createTacticalReticleTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'square';

    // Segmented outer targeting ring with 4 gap cuts
    const rOuter = 88;
    ctx.setLineDash([18, 12]);
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner precision circle
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.stroke();

    // 6 Primary Vector Spikes with calibration notches
    const armLen = 110;
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(cx + cosA * 12, cy + sinA * 12);
      ctx.lineTo(cx + cosA * armLen, cy + sinA * armLen);
      ctx.stroke();

      // Calibration tick marks
      ctx.lineWidth = 1.4;
      for (let step = 42; step < armLen - 10; step += 18) {
        const px = cx + cosA * step;
        const py = cy + sinA * step;
        ctx.beginPath();
        ctx.moveTo(px - sinA * 6, py + cosA * 6);
        ctx.lineTo(px + sinA * 6, py - cosA * 6);
        ctx.stroke();
      }

      // Outer cross tick
      ctx.fillRect(cx + cosA * (armLen + 4) - 2, cy + sinA * (armLen + 4) - 2, 4, 4);
    }

    // Center crosshair
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createTacticalHexLatticeTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'square';

    // 3 Concentric nested hexagons
    const rings = [96, 64, 32];
    rings.forEach((rad, idx) => {
      ctx.lineWidth = idx === 0 ? 2.2 : 1.4;
      if (idx === 1) ctx.setLineDash([8, 6]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Corner diagonal spokes connecting vertices
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 96, cy + Math.sin(angle) * 96);
      ctx.stroke();

      // Corner bracket ticks on outer hexagon vertices
      const vx = cx + Math.cos(angle) * 96;
      const vy = cy + Math.sin(angle) * 96;
      ctx.fillRect(vx - 2.5, vy - 2.5, 5, 5);
    }

    // 12-o'clock index marker
    ctx.fillRect(cx - 3, cy - 108, 6, 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createTacticalDataBadgeTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2.0;

    // Neo-brutalist corner brackets [  ]
    const bSize = 64;
    const bArm = 18;
    const x0 = cx - bSize;
    const x1 = cx + bSize;
    const y0 = cy - bSize;
    const y1 = cy + bSize;

    // Top-left bracket
    ctx.beginPath();
    ctx.moveTo(x0, y0 + bArm);
    ctx.lineTo(x0, y0);
    ctx.lineTo(x0 + bArm, y0);
    // Top-right bracket
    ctx.moveTo(x1 - bArm, y0);
    ctx.lineTo(x1, y0);
    ctx.lineTo(x1, y0 + bArm);
    // Bottom-right bracket
    ctx.moveTo(x1, y1 - bArm);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - bArm, y1);
    // Bottom-left bracket
    ctx.moveTo(x0 + bArm, y1);
    ctx.lineTo(x0, y1);
    ctx.lineTo(x0, y1 - bArm);
    ctx.stroke();

    // Central tactical crosshair & sub-zero diamond
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx + 24, cy);
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx + 24, cy);
    ctx.stroke();

    // Center diamond
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx, cy + 14);
    ctx.lineTo(cx - 14, cy);
    ctx.closePath();
    ctx.stroke();

    // Monospace micro-coordinates
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CRYO // -18C', cx, y1 + 18);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createTacticalTracerTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineCap = 'square';

    // Sharp linear vector tracer needle with terminal crosshair
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy);
    ctx.lineTo(cx + 48, cy);
    ctx.stroke();

    // Terminal crosshair notch at head
    ctx.fillRect(cx + 44, cy - 4, 3, 9);
    // Center point
    ctx.fillRect(cx - 2, cy - 2, 4, 4);

    // Orthogonal tick marks
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 6);
    ctx.lineTo(cx - 20, cy + 6);
    ctx.moveTo(cx + 16, cy - 6);
    ctx.lineTo(cx + 16, cy + 6);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createTacticalShockwaveTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2.0;

    // Segmented 12-sided polygon shockwave ring
    const rad = 108;
    ctx.setLineDash([16, 10]);
    ctx.beginPath();
    for (let a = 0; a < 12; a++) {
      const angle = (Math.PI / 6) * a;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // 4 Cardinal tick brackets
    const bDist = rad + 8;
    ctx.fillRect(cx - 8, cy - bDist - 2, 16, 3);
    ctx.fillRect(cx - 8, cy + bDist - 1, 16, 3);
    ctx.fillRect(cx - bDist - 2, cy - 8, 3, 16);
    ctx.fillRect(cx + bDist - 1, cy - 8, 3, 16);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private getThemeColorInfo(): {
    primary: THREE.Color;
    secondary: THREE.Color;
    spark: THREE.Color;
    hexPrimary: string;
    isLight: boolean;
  } {
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';

    switch (theme) {
      case 'blue':
        return {
          primary: new THREE.Color('#38bdf8'),
          secondary: new THREE.Color('#93c5fd'),
          spark: new THREE.Color('#0284c7'),
          hexPrimary: '#38bdf8',
          isLight: false,
        };
      case 'emerald':
        return {
          primary: new THREE.Color('#34d399'),
          secondary: new THREE.Color('#a7f3d0'),
          spark: new THREE.Color('#059669'),
          hexPrimary: '#34d399',
          isLight: false,
        };
      case 'violet':
        return {
          primary: new THREE.Color('#a78bfa'),
          secondary: new THREE.Color('#c4b5fd'),
          spark: new THREE.Color('#7c3aed'),
          hexPrimary: '#a78bfa',
          isLight: false,
        };
      case 'white':
        return {
          primary: new THREE.Color('#e2e8f0'),
          secondary: new THREE.Color('#94a3b8'),
          spark: new THREE.Color('#f8fafc'),
          hexPrimary: '#e2e8f0',
          isLight: false,
        };
      case 'light':
        // High-contrast stark tactical blueprint colors for pale backgrounds
        return {
          primary: new THREE.Color('#0f172a'),
          secondary: new THREE.Color('#0284c7'),
          spark: new THREE.Color('#ea580c'),
          hexPrimary: '#0f172a',
          isLight: true,
        };
      case 'dark':
      default:
        // Amber CRT Phosphor
        return {
          primary: new THREE.Color('#f59e0b'),
          secondary: new THREE.Color('#fde68a'),
          spark: new THREE.Color('#d97706'),
          hexPrimary: '#f59e0b',
          isLight: false,
        };
    }
  }

  private resetParticles(): void {
    if (!this.snowGroup || !this.fireworksGroup || !this.ambientGroup) return;

    // Clear existing snow flakes
    while (this.snowGroup.children.length > 0) {
      const obj = this.snowGroup.children[0];
      this.snowGroup.remove(obj);
    }
    this.snowFlakes = [];

    // Clear existing fireworks
    while (this.fireworksGroup.children.length > 0) {
      const obj = this.fireworksGroup.children[0];
      this.fireworksGroup.remove(obj);
    }
    this.fireworkBursts = [];

    // Clear existing ambient sparks
    while (this.ambientGroup.children.length > 0) {
      const obj = this.ambientGroup.children[0];
      this.ambientGroup.remove(obj);
    }
    this.ambientSparks = [];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (this.currentMode === 'christmas') {
      this.initSnowflakes();
    } else if (this.currentMode === 'newyear') {
      this.initNewYearCelebration();
    }
  }

  /**
   * Initializes neo-brutalist 3D CAD blueprint crystals and vector telemetry particles.
   */
  private initSnowflakes(): void {
    if (!this.snowGroup || this.snowTextures.length === 0) return;

    const count = this.width < 768 ? 48 : 88;
    const themeInfo = this.getThemeColorInfo();

    for (let i = 0; i < count; i++) {
      // Pick tactical blueprint texture:
      // 35% Dendrite Blueprint, 30% Coordinate Reticle, 20% Hex Lattice, 15% Data Badge
      const randType = Math.random();
      let texIndex = 0;
      if (randType < 0.35) texIndex = 0;
      else if (randType < 0.65) texIndex = 1;
      else if (randType < 0.85) texIndex = 2;
      else texIndex = 3;

      const texture = this.snowTextures[texIndex];

      // Deep 3D volume positioning
      const z = Math.random() * 110 - 65; // z from -65 (far) to +45 (foreground CAD crystals)
      const x = (Math.random() - 0.5) * 260;
      const y = (Math.random() - 0.5) * 150;

      // Distance from camera (camera at z=100)
      const dist = 100 - z;

      // Base scale in world units
      const sizeMultiplier = dist < 70 ? 1.3 : dist < 110 ? 1.0 : 0.7;
      const baseScale = (Math.random() * 3.2 + 4.8) * sizeMultiplier;

      // Material with tactical contrast and depth sorting
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: themeInfo.isLight ? Math.random() * 0.25 + 0.45 : Math.random() * 0.3 + 0.55,
        blending: themeInfo.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Color tint: crisp CAD blueprint lines
      if (themeInfo.isLight) {
        mat.color.copy(texIndex === 3 ? themeInfo.secondary : themeInfo.primary);
      } else {
        const mixRatio = Math.random() * 0.45;
        mat.color.set('#ffffff').lerp(themeInfo.primary, mixRatio);
      }

      const sprite = new THREE.Sprite(mat);
      sprite.position.set(x, y, z);
      sprite.scale.set(baseScale, baseScale, 1);
      mat.rotation = Math.random() * Math.PI * 2;

      this.snowGroup.add(sprite);

      this.snowFlakes.push({
        sprite,
        baseScaleX: baseScale,
        baseScaleY: baseScale,
        speedY: (Math.random() * 0.28 + 0.18) * (150 / dist),
        swayAmplitude: Math.random() * 1.5 + 0.7,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayPhase: Math.random() * Math.PI * 2,
        tumbleSpeed: Math.random() * 0.018 + 0.006,
        tumblePhase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.014,
        windDrift: (Math.random() - 0.5) * 0.04,
        baseOpacity: mat.opacity,
        type: texIndex,
      });
    }
  }

  private initNewYearCelebration(): void {
    if (!this.ambientGroup || !this.sparkTexture) return;

    this.nextBurstTime = Date.now() + 1000;
    const themeInfo = this.getThemeColorInfo();
    const count = this.width < 768 ? 24 : 45;

    // Ambient floating tactical coordinate points
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.sparkTexture,
        transparent: true,
        opacity: themeInfo.isLight ? 0.6 : 0.75,
        blending: themeInfo.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });

      mat.color.copy(Math.random() > 0.4 ? themeInfo.primary : themeInfo.secondary);

      const baseScale = Math.random() * 2.2 + 1.8;
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(
        (Math.random() - 0.5) * 240,
        (Math.random() - 0.5) * 140,
        Math.random() * 80 - 40,
      );
      sprite.scale.set(baseScale, baseScale, 1);

      this.ambientGroup.add(sprite);

      this.ambientSparks.push({
        sprite,
        baseScale,
        speedY: Math.random() * 0.15 + 0.06,
        speedX: (Math.random() - 0.5) * 0.08,
        speedZ: (Math.random() - 0.5) * 0.04,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.02,
        baseOpacity: mat.opacity,
      });
    }
  }

  /**
   * Spawns a cybernetic vector detonation with expanding polygonal radar shockwave and hypersonic tracer needles.
   */
  public createFireworkBurst(worldX: number, worldY: number, count = 55): void {
    if (!this.fireworksGroup || !this.sparkTexture) return;

    const burstGroup = new THREE.Group();
    const sparks: SparkParticle[] = [];
    const themeInfo = this.getThemeColorInfo();

    // 1. Expanding Polygonal Radar Shockwave Wavefront
    let shockwaveObj: FireworkBurst['shockwave'] = undefined;
    if (this.shockwaveTexture) {
      const swMat = new THREE.SpriteMaterial({
        map: this.shockwaveTexture,
        transparent: true,
        opacity: 0.95,
        blending: themeInfo.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });
      swMat.color.copy(themeInfo.primary);

      const swSprite = new THREE.Sprite(swMat);
      swSprite.position.set(worldX, worldY, 0);
      swSprite.scale.set(2, 2, 1);
      burstGroup.add(swSprite);

      shockwaveObj = {
        sprite: swSprite,
        scale: 2,
        maxScale: Math.random() * 12 + 28,
        alpha: 0.95,
        decay: 0.022,
      };
    }

    // 2. Hypersonic Directional Linear Vector Tracers
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(Math.random() * 2 - 1);
      const theta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.6 + 1.4;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed * 1.05;
      const vz = Math.cos(phi) * speed * 0.6;

      const mat = new THREE.SpriteMaterial({
        map: this.sparkTexture,
        transparent: true,
        opacity: 1,
        blending: themeInfo.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Align sprite rotation along velocity trajectory
      mat.rotation = Math.atan2(vy, vx);

      const sparkColor =
        Math.random() > 0.4
          ? themeInfo.primary.clone()
          : new THREE.Color('#ffffff').lerp(themeInfo.secondary, 0.4);

      mat.color.copy(sparkColor);

      const baseScale = Math.random() * 2.8 + 2.0;
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(worldX, worldY, (Math.random() - 0.5) * 15);
      sprite.scale.set(baseScale * 1.8, baseScale * 0.7, 1);

      burstGroup.add(sprite);

      sparks.push({
        sprite,
        vx,
        vy,
        vz,
        drag: 0.958,
        gravity: 0.024,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        baseScale,
        color: sparkColor,
        twinkleSpeed: Math.random() * 0.18 + 0.08,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    this.fireworksGroup.add(burstGroup);
    this.fireworkBursts.push({ sparks, shockwave: shockwaveObj, group: burstGroup });
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = () => {
      if (!this.isRunning) return;
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private render(): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    // Smooth inertia mouse parallax
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    this.camera.position.x = this.mouseX * 14;
    this.camera.position.y = -this.mouseY * 9;
    this.camera.lookAt(0, 0, 0);

    if (this.currentMode === 'christmas') {
      this.updateSnowflakes();
    } else if (this.currentMode === 'newyear') {
      this.updateNewYear();
    }

    this.renderer.render(this.scene, this.camera);
  }

  private updateSnowflakes(): void {
    const topLimit = 75;
    const bottomLimit = -75;
    const horizontalLimit = 135;

    // Cursor coordinates projected in world units for interactive deflection
    const mouseWorldX = this.mouseX * 120;
    const mouseWorldY = -this.mouseY * 65;

    for (let i = 0; i < this.snowFlakes.length; i++) {
      const f = this.snowFlakes[i];
      const pos = f.sprite.position;

      f.swayPhase += f.swaySpeed;
      f.tumblePhase += f.tumbleSpeed;

      // Realistic 3D oscillation and gentle horizontal wind drift
      pos.x += Math.sin(f.swayPhase) * f.swayAmplitude * 0.08 + f.windDrift;
      pos.y -= f.speedY;
      pos.z += Math.cos(f.swayPhase * 0.6) * 0.04;

      // Interactive mouse cursor deflection field
      const dx = pos.x - mouseWorldX;
      const dy = pos.y - mouseWorldY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      if (distToMouse < 24) {
        const force = (1 - distToMouse / 24) * 0.35;
        pos.x += (dx / distToMouse) * force;
        pos.y += (dy / distToMouse) * force;
      }

      // 3D Tumbling illusion: compress and expand aspect ratio as crystal tilts in space
      const tumbleFactor = 0.35 + 0.65 * Math.abs(Math.cos(f.tumblePhase));
      f.sprite.scale.x = f.baseScaleX * tumbleFactor;

      // Rotation around Z axis
      f.sprite.material.rotation += f.rotSpeed;

      // Smooth top/bottom opacity fade to eliminate pop-in
      const distFromBottom = pos.y - bottomLimit;
      const distFromTop = topLimit - pos.y;
      const edgeFade = Math.min(1, Math.max(0, distFromBottom / 14, distFromTop / 14));
      f.sprite.material.opacity = f.baseOpacity * edgeFade;

      // Wrap around seamlessly
      if (pos.y < bottomLimit) {
        pos.y = topLimit + Math.random() * 8;
        pos.x = (Math.random() - 0.5) * horizontalLimit * 2;
        pos.z = Math.random() * 110 - 65;
      }
      if (pos.x < -horizontalLimit) pos.x = horizontalLimit;
      else if (pos.x > horizontalLimit) pos.x = -horizontalLimit;
    }
  }

  private updateNewYear(): void {
    const now = Date.now();

    // Automated periodic cybernetic vector detonations
    if (now >= this.nextBurstTime) {
      const burstX = (Math.random() - 0.5) * 160;
      const burstY = Math.random() * 35 + 10;
      this.createFireworkBurst(burstX, burstY, Math.floor(Math.random() * 20 + 45));
      this.nextBurstTime = now + (Math.random() * 2400 + 2600);
    }

    // Update active detonations
    for (let b = this.fireworkBursts.length - 1; b >= 0; b--) {
      const burst = this.fireworkBursts[b];
      let aliveSparks = 0;

      // Animate expanding radar shockwave
      if (burst.shockwave && burst.shockwave.alpha > 0.01) {
        burst.shockwave.scale += (burst.shockwave.maxScale - burst.shockwave.scale) * 0.12 + 0.35;
        burst.shockwave.alpha -= burst.shockwave.decay;
        burst.shockwave.sprite.scale.set(burst.shockwave.scale, burst.shockwave.scale, 1);
        burst.shockwave.sprite.material.opacity = Math.max(0, burst.shockwave.alpha);
        if (burst.shockwave.alpha <= 0.01) {
          burst.shockwave.sprite.visible = false;
        }
      }

      for (let s = 0; s < burst.sparks.length; s++) {
        const spark = burst.sparks[s];
        if (spark.alpha <= 0.01) continue;

        spark.sprite.position.x += spark.vx;
        spark.sprite.position.y += spark.vy;
        spark.sprite.position.z += spark.vz;

        spark.vx *= spark.drag;
        spark.vy = spark.vy * spark.drag - spark.gravity;
        spark.vz *= spark.drag;

        spark.alpha -= spark.decay;
        spark.twinklePhase += spark.twinkleSpeed;

        // Keep tracer aligned along flight trajectory
        spark.sprite.material.rotation = Math.atan2(spark.vy, spark.vx);

        if (spark.alpha > 0.01) {
          aliveSparks++;
          const twinkle = 0.8 + 0.2 * Math.sin(spark.twinklePhase);
          spark.sprite.material.opacity = Math.max(0, spark.alpha * twinkle);

          const scale = spark.baseScale * (0.4 + 0.6 * spark.alpha);
          spark.sprite.scale.set(scale * 1.8, scale * 0.7, 1);
        } else {
          spark.sprite.visible = false;
        }
      }

      const shockwaveAlive = burst.shockwave && burst.shockwave.alpha > 0.01;
      if (aliveSparks === 0 && !shockwaveAlive) {
        if (this.fireworksGroup) {
          this.fireworksGroup.remove(burst.group);
        }
        this.fireworkBursts.splice(b, 1);
      }
    }

    // Update ambient celebratory stardust
    for (let i = 0; i < this.ambientSparks.length; i++) {
      const sp = this.ambientSparks[i];
      sp.sprite.position.y += sp.speedY;
      sp.sprite.position.x += sp.speedX;
      sp.sprite.position.z += sp.speedZ;

      sp.phase += sp.twinkleSpeed;
      const twinkle = 0.6 + 0.4 * Math.sin(sp.phase);
      sp.sprite.material.opacity = sp.baseOpacity * twinkle;

      if (sp.sprite.position.y > 75) {
        sp.sprite.position.y = -75;
        sp.sprite.position.x = (Math.random() - 0.5) * 240;
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  private handleCanvasClick(e: MouseEvent): void {
    if (this.currentMode !== 'newyear' || !this.camera) return;

    const target = e.target as HTMLElement;
    if (target && (target.closest('button') || target.closest('a') || target.closest('input'))) {
      return;
    }

    // Unproject 2D click coordinates into 3D world space at z = 0
    const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;

    const clickVec = new THREE.Vector3(ndcX, ndcY, 0.5);
    clickVec.unproject(this.camera);
    const dir = clickVec.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const worldPos = this.camera.position.clone().add(dir.multiplyScalar(distance));

    this.createFireworkBurst(worldPos.x, worldPos.y, 80);
  }

  private handleResize(): void {
    if (!this.canvas || !this.renderer || !this.camera) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stop();
    } else if (this.currentMode !== 'none') {
      this.start();
    }
  }

  private handleThemeChange(): void {
    if (this.currentMode === 'none') return;
    this.resetParticles();
  }

  public bindDOM(): void {
    const toggle = document.getElementById('seasonalFxToggle');

    const handleToggle = (e: Event) => {
      e.stopPropagation();
      this.toggleEnabled();
    };

    if (toggle && toggle.dataset.seasonalBound !== 'true') {
      toggle.dataset.seasonalBound = 'true';
      toggle.addEventListener('click', handleToggle);
    }

    this.updateToggleUI();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('seasonal_effects_enabled', enabled ? 'true' : 'false');
    this.playChime();
    this.updateToggleUI();
    this.updateState();
  }

  public toggleEnabled(): void {
    this.setEnabled(!this.isEnabled);
  }

  public shouldShowToggle(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Test URLs (?season=...)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('season')) return true;
    } catch {}

    // 2. Active or stored test mode override
    if (this.currentOverride === 'christmas' || this.currentOverride === 'newyear') {
      return true;
    }
    try {
      const stored = localStorage.getItem('seasonal_override');
      if (stored === 'christmas' || stored === 'newyear') return true;
    } catch {}

    // 3. Pre-decided holiday seasonal dates:
    // Christmas Season: December 15 (00:00) through December 26 (23:59)
    // New Year Season: December 27 (00:00) through January 5 (23:59)
    const now = new Date();
    const m = now.getMonth(); // 11 = December, 0 = January
    const d = now.getDate();
    const isChristmas = m === 11 && d >= 15 && d <= 26;
    const isNewYear = (m === 11 && d >= 27) || (m === 0 && d <= 5);

    return isChristmas || isNewYear;
  }

  public updateToggleUI(): void {
    const toggle = document.getElementById('seasonalFxToggle');
    const status = document.getElementById('seasonalFxStatus');

    const shouldShow = this.shouldShowToggle();
    if (toggle) {
      if (shouldShow) {
        toggle.style.display = 'inline-flex';
      } else {
        toggle.style.display = 'none';
      }
      toggle.classList.toggle('is-active', this.isEnabled);
      toggle.setAttribute('aria-checked', this.isEnabled ? 'true' : 'false');
    }
    if (status) status.textContent = this.isEnabled ? 'ON' : 'OFF';
  }

  public updateState(): void {
    const newMode = this.evaluateSeason();
    const modeChanged = newMode !== this.currentMode;
    this.currentMode = newMode;

    const root = document.documentElement;
    root.classList.toggle('season-christmas', this.currentMode === 'christmas');
    root.classList.toggle('season-newyear', this.currentMode === 'newyear');
    root.setAttribute('data-season', this.currentMode);

    window.dispatchEvent(new CustomEvent('seasonchange', { detail: { season: this.currentMode } }));

    if (this.canvas) {
      this.canvas.classList.toggle('is-active', this.currentMode !== 'none');
    }

    this.updateToggleUI();

    if (this.currentMode === 'none') {
      this.stop();
      if (this.renderer && this.scene && this.camera) {
        this.renderer.clear();
      }
    } else {
      if (modeChanged || !this.isRunning) {
        this.resetParticles();
        this.start();
      }
    }
  }

  private playChime(): void {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freq = this.currentMode === 'newyear' ? 880 : 1046.5;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }
}

// Global initialization & Astro View Transitions listener
declare global {
  interface Window {
    __seasonalEffectsEngine?: SeasonalEffectsEngine;
  }
}

if (typeof window !== 'undefined') {
  const initOrUpdate = () => {
    if (window.__seasonalEffectsEngine) {
      window.__seasonalEffectsEngine.onPageLoad();
    } else {
      window.__seasonalEffectsEngine = new SeasonalEffectsEngine();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrUpdate);
  } else {
    initOrUpdate();
  }

  document.addEventListener('astro:page-load', initOrUpdate);
}
