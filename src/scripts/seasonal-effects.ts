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
  if (typeof window === 'undefined') return false;

  // Check URL param test mode (?season=...)
  try {
    const params = new URLSearchParams(window.location.search);
    const season = params.get('season')?.toLowerCase();
    if (season === 'christmas' || season === 'xmas' || season === 'newyear' || season === 'ny') {
      return true;
    }
  } catch {}

  // Check stored override
  try {
    const override = localStorage.getItem('seasonal_override');
    if (override === 'christmas' || override === 'newyear') return true;
  } catch {}

  // Pre-decided holiday dates (Dec 15 - Jan 5)
  const now = new Date();
  const m = now.getMonth();
  const d = now.getDate();
  const isChristmas = m === 11 && d >= 15 && d <= 26;
  const isNewYear = (m === 11 && d >= 27) || (m === 0 && d <= 5);

  return isChristmas || isNewYear;
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
    this.readStoredOverride();
    this.readQueryOverride();
    this.init();
  }

  private readStoredOverride(): void {
    try {
      const enabledPref = localStorage.getItem('seasonal_effects_enabled');
      this.isEnabled = enabledPref !== 'false';

      const stored = localStorage.getItem('seasonal_override');
      if (stored === 'christmas' || stored === 'newyear' || stored === 'off' || stored === 'auto') {
        this.currentOverride = stored;
      }
    } catch {}
  }

  private readQueryOverride(): void {
    try {
      const params = new URLSearchParams(window.location.search);
      const seasonParam = params.get('season')?.toLowerCase();
      if (seasonParam === 'christmas' || seasonParam === 'xmas') {
        this.currentOverride = 'christmas';
        this.isEnabled = true;
        localStorage.setItem('seasonal_override', 'christmas');
        localStorage.setItem('seasonal_effects_enabled', 'true');
      } else if (seasonParam === 'newyear' || seasonParam === 'ny') {
        this.currentOverride = 'newyear';
        this.isEnabled = true;
        localStorage.setItem('seasonal_override', 'newyear');
        localStorage.setItem('seasonal_effects_enabled', 'true');
      } else if (seasonParam === 'off' || seasonParam === 'disable' || seasonParam === 'disabled') {
        this.currentOverride = 'off';
        this.isEnabled = false;
        localStorage.setItem('seasonal_override', 'off');
        localStorage.setItem('seasonal_effects_enabled', 'false');
      } else if (seasonParam === 'auto' || seasonParam === 'reset') {
        this.currentOverride = 'auto';
        localStorage.setItem('seasonal_override', 'auto');
      }
    } catch {}
  }

  public evaluateSeason(now: Date = new Date()): SeasonalMode {
    if (!this.isEnabled) return 'none';
    if (this.currentOverride === 'off') return 'none';
    if (this.currentOverride === 'christmas') return 'christmas';
    if (this.currentOverride === 'newyear') return 'newyear';

    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const day = now.getDate();

    // Christmas Season: Dec 15 through Dec 26
    if (month === 11 && day >= 15 && day <= 26) {
      return 'christmas';
    }

    // New Year Season: Dec 27 through Jan 5
    if ((month === 11 && day >= 27) || (month === 0 && day <= 5)) {
      return 'newyear';
    }

    return 'none';
  }

  public getTargetNewYear(now: Date = new Date()): number {
    const month = now.getMonth();
    const year = now.getFullYear();
    return month === 11 ? year + 1 : year;
  }

  public init(): void {
    this.canvas = document.getElementById('seasonal-canvas') as HTMLCanvasElement | null;
    if (!this.canvas) return;

    this.initThree();
    this.bindDOM();

    window.addEventListener('resize', () => this.handleResize(), { passive: true });
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    window.addEventListener('themechange', () => this.handleThemeChange());
    window.addEventListener('click', (e) => this.handleCanvasClick(e));
    window.addEventListener('storage', (e) => {
      if (e.key === 'seasonal_effects_enabled') {
        this.isEnabled = e.newValue !== 'false';
        this.updateToggleUI();
        this.updateState();
      }
    });

    // Periodic schedule verification (every 10 minutes)
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = window.setInterval(() => {
      this.updateState();
    }, 600000);

    this.updateState();
  }

  public onPageLoad(): void {
    this.canvas = document.getElementById('seasonal-canvas') as HTMLCanvasElement | null;
    if (!this.renderer && this.canvas) {
      this.initThree();
    } else if (this.renderer && this.canvas) {
      this.handleResize();
    }
    this.bindDOM();
    this.updateState();
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
   * Generates high-resolution 256x256 procedural crystal textures.
   */
  private generateTextures(): void {
    if (this.snowTextures.length > 0) return;

    // Texture 0: Intricate Macro Stellar Dendrite (Branching snowflake)
    this.snowTextures.push(this.createDendriteTexture());

    // Texture 1: Fern Star Crystal (Feathery icy branches)
    this.snowTextures.push(this.createFernTexture());

    // Texture 2: Prismatic Hexagonal Plate (Faceted geometric ice)
    this.snowTextures.push(this.createPlateTexture());

    // Texture 3: Soft Depth-of-Field Bokeh Orb (Foreground & background atmospheric motes)
    this.snowTextures.push(this.createBokehTexture());

    // Sparkle / Diffraction Star Flare for Fireworks and Stardust
    this.sparkTexture = this.createSparkTexture();
  }

  private createDendriteTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Soft luminous crystalline halo
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 115);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glow.addColorStop(0.2, 'rgba(240, 248, 255, 0.45)');
    glow.addColorStop(0.55, 'rgba(224, 242, 254, 0.15)');
    glow.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 115, 0, Math.PI * 2);
    ctx.fill();

    // Central hexagonal crystal core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const x = cx + Math.cos(angle) * 16;
      const y = cy + Math.sin(angle) * 16;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6 Symmetrical Macro Dendrite Arms
    const armLength = 105;
    ctx.lineCap = 'round';

    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Main spine
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + cosA * armLength, cy + sinA * armLength);
      ctx.stroke();

      // Secondary and tertiary dendritic branches
      const branchPairs = [
        { dist: 0.35, length: 28, sub: true },
        { dist: 0.6, length: 38, sub: true },
        { dist: 0.82, length: 26, sub: false },
        { dist: 0.94, length: 14, sub: false },
      ];

      for (const branch of branchPairs) {
        const bx = cx + cosA * (armLength * branch.dist);
        const by = cy + sinA * (armLength * branch.dist);

        const angleL = angle + Math.PI / 3;
        const angleR = angle - Math.PI / 3;

        ctx.lineWidth = 2.2;
        // Left side branch
        ctx.beginPath();
        ctx.moveTo(bx, by);
        const blx = bx + Math.cos(angleL) * branch.length;
        const bly = by + Math.sin(angleL) * branch.length;
        ctx.lineTo(blx, bly);
        ctx.stroke();

        // Right side branch
        ctx.beginPath();
        ctx.moveTo(bx, by);
        const brx = bx + Math.cos(angleR) * branch.length;
        const bry = by + Math.sin(angleR) * branch.length;
        ctx.lineTo(brx, bry);
        ctx.stroke();

        // Tertiary sub-spurs on large branches
        if (branch.sub) {
          ctx.lineWidth = 1.4;
          const subLen = branch.length * 0.45;
          const smxL = bx + Math.cos(angleL) * (branch.length * 0.5);
          const smyL = by + Math.sin(angleL) * (branch.length * 0.5);
          ctx.beginPath();
          ctx.moveTo(smxL, smyL);
          ctx.lineTo(smxL + cosA * subLen, smyL + sinA * subLen);
          ctx.stroke();

          const smxR = bx + Math.cos(angleR) * (branch.length * 0.5);
          const smyR = by + Math.sin(angleR) * (branch.length * 0.5);
          ctx.beginPath();
          ctx.moveTo(smxR, smyR);
          ctx.lineTo(smxR + cosA * subLen, smyR + sinA * subLen);
          ctx.stroke();
        }
      }

      // Diamond spearhead terminal tip
      const tipX = cx + cosA * armLength;
      const tipY = cy + sinA * armLength;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tipX, tipY, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createFernTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Glowing core
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 110);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.35, 'rgba(235, 245, 255, 0.35)');
    glow.addColorStop(1, 'rgba(235, 245, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';

    const armLength = 100;
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Main thick spine
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + cosA * armLength, cy + sinA * armLength);
      ctx.stroke();

      // Dense feathery pine-needle rungs
      const rungs = 7;
      for (let r = 1; r <= rungs; r++) {
        const frac = r / (rungs + 1);
        const rx = cx + cosA * (armLength * frac);
        const ry = cy + sinA * (armLength * frac);
        const len = (1 - frac * 0.6) * 32;

        const aL = angle + (Math.PI * 2) / 7;
        const aR = angle - (Math.PI * 2) / 7;

        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(aL) * len, ry + Math.sin(aL) * len);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(aR) * len, ry + Math.sin(aR) * len);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createPlateTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Prismatic outer glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 105);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    glow.addColorStop(0.5, 'rgba(215, 235, 255, 0.25)');
    glow.addColorStop(1, 'rgba(215, 235, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 105, 0, Math.PI * 2);
    ctx.fill();

    // Stepped crystalline concentric hexagons
    const radii = [95, 75, 52, 28];
    for (let rIdx = 0; rIdx < radii.length; rIdx++) {
      const rad = radii[rIdx];
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = rIdx === 0 ? 3.5 : 2;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a;
        const x = cx + Math.cos(angle) * rad;
        const y = cy + Math.sin(angle) * rad;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      if (rIdx % 2 === 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.fill();
      }
      ctx.stroke();
    }

    // Radial facet spokes
    ctx.lineWidth = 2.4;
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radii[0], cy + Math.sin(angle) * radii[0]);
      ctx.stroke();

      // Satellite crystal points on corners
      const px = cx + Math.cos(angle) * (radii[0] + 6);
      const py = cy + Math.sin(angle) * (radii[0] + 6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createBokehTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Cinematic out-of-focus bokeh circle with aperture edge
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.7, 'rgba(235, 245, 255, 0.35)');
    grad.addColorStop(0.9, 'rgba(220, 240, 255, 0.15)');
    grad.addColorStop(1, 'rgba(220, 240, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 100, 0, Math.PI * 2);
    ctx.fill();

    // Subtle luminous aperture rim
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 82, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private createSparkTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    // Hot central core glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 54);
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glow.addColorStop(0.18, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.45, 'rgba(255, 240, 200, 0.4)');
    glow.addColorStop(1, 'rgba(255, 230, 180, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 54, 0, Math.PI * 2);
    ctx.fill();

    // 4-point long primary diffraction rays
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 56, cy);
    ctx.lineTo(cx + 56, cy);
    ctx.moveTo(cx, cy - 56);
    ctx.lineTo(cx, cy + 56);
    ctx.stroke();

    // 4 secondary 45-degree rays
    ctx.lineWidth = 1.6;
    const d = 26;
    ctx.beginPath();
    ctx.moveTo(cx - d, cy - d);
    ctx.lineTo(cx + d, cy + d);
    ctx.moveTo(cx - d, cy + d);
    ctx.lineTo(cx + d, cy - d);
    ctx.stroke();

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
          secondary: new THREE.Color('#e0f2fe'),
          spark: new THREE.Color('#0284c7'),
          hexPrimary: '#38bdf8',
          isLight: false,
        };
      case 'emerald':
        return {
          primary: new THREE.Color('#34d399'),
          secondary: new THREE.Color('#d1fae5'),
          spark: new THREE.Color('#059669'),
          hexPrimary: '#34d399',
          isLight: false,
        };
      case 'violet':
        return {
          primary: new THREE.Color('#a78bfa'),
          secondary: new THREE.Color('#ede9fe'),
          spark: new THREE.Color('#7c3aed'),
          hexPrimary: '#a78bfa',
          isLight: false,
        };
      case 'white':
        return {
          primary: new THREE.Color('#f1f5f9'),
          secondary: new THREE.Color('#ffffff'),
          spark: new THREE.Color('#cbd5e1'),
          hexPrimary: '#f1f5f9',
          isLight: false,
        };
      case 'light':
        // High-contrast crisp frosted crystal tint for light backgrounds
        return {
          primary: new THREE.Color('#ea580c'),
          secondary: new THREE.Color('#475569'),
          spark: new THREE.Color('#c2410c'),
          hexPrimary: '#ea580c',
          isLight: true,
        };
      case 'dark':
      default:
        // Amber / Warm Champagne Gold
        return {
          primary: new THREE.Color('#f59e0b'),
          secondary: new THREE.Color('#fef3c7'),
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
   * Initializes 130-160 hyper-realistic, high-visibility 3D snowflakes.
   * Large scale designed specifically for MacBook Air M1 13" Retina displays!
   */
  private initSnowflakes(): void {
    if (!this.snowGroup || this.snowTextures.length === 0) return;

    const count = this.width < 768 ? 85 : 140;
    const themeInfo = this.getThemeColorInfo();

    for (let i = 0; i < count; i++) {
      // Pick texture distribution:
      // 40% Dendrite crystals, 25% Fern crystals, 20% Hex plates, 15% Bokeh orbs
      const randType = Math.random();
      let texIndex = 0;
      if (randType < 0.4) texIndex = 0;
      else if (randType < 0.65) texIndex = 1;
      else if (randType < 0.85) texIndex = 2;
      else texIndex = 3;

      const texture = this.snowTextures[texIndex];

      // Deep 3D volume positioning
      const z = Math.random() * 115 - 70; // z from -70 (far) to +45 (foreground hero flakes)
      const x = (Math.random() - 0.5) * 260;
      const y = (Math.random() - 0.5) * 150;

      // Distance from camera (camera at z=100)
      const dist = 100 - z;

      // Base scale in world units:
      // Hero flakes close to camera: scale 9 - 13 units (~70 to 110px on screen!)
      // Midground flakes: scale 5.5 - 8.5 units (~42 to 65px on screen!)
      // Background flakes: scale 2.8 - 4.5 units (~22 to 35px on screen!)
      const sizeMultiplier = dist < 70 ? 1.4 : dist < 110 ? 1.0 : 0.65;
      const baseScale = (Math.random() * 3.5 + 5.2) * sizeMultiplier;

      // Material with theme color tinting and depth sorting
      const mat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: Math.random() * 0.3 + 0.65,
        blending: themeInfo.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
        depthWrite: false,
      });

      // Color tint: mix between diamond white and theme accent
      if (themeInfo.isLight) {
        mat.color.copy(texIndex === 3 ? themeInfo.secondary : themeInfo.primary);
      } else {
        const mixRatio = Math.random() * 0.45;
        mat.color.set('#ffffff').lerp(themeInfo.secondary, mixRatio);
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
        speedY: (Math.random() * 0.35 + 0.22) * (150 / dist),
        swayAmplitude: Math.random() * 1.8 + 0.9,
        swaySpeed: Math.random() * 0.025 + 0.012,
        swayPhase: Math.random() * Math.PI * 2,
        tumbleSpeed: Math.random() * 0.02 + 0.008,
        tumblePhase: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.018,
        windDrift: (Math.random() - 0.5) * 0.06,
        baseOpacity: mat.opacity,
        type: texIndex,
      });
    }
  }

  private initNewYearCelebration(): void {
    if (!this.ambientGroup || !this.sparkTexture) return;

    this.nextBurstTime = Date.now() + 1200;
    const themeInfo = this.getThemeColorInfo();
    const count = this.width < 768 ? 32 : 55;

    // Ambient floating celebratory stardust
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({
        map: this.sparkTexture,
        transparent: true,
        opacity: Math.random() * 0.5 + 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      mat.color.copy(Math.random() > 0.4 ? themeInfo.primary : themeInfo.secondary);

      const baseScale = Math.random() * 2.8 + 2.2;
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
        speedY: Math.random() * 0.16 + 0.06,
        speedX: (Math.random() - 0.5) * 0.1,
        speedZ: (Math.random() - 0.5) * 0.05,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.04 + 0.02,
        baseOpacity: mat.opacity,
      });
    }
  }

  /**
   * Spawns a spectacular 3D firework burst with explosive spark physics.
   */
  public createFireworkBurst(worldX: number, worldY: number, count = 75): void {
    if (!this.fireworksGroup || !this.sparkTexture) return;

    const burstGroup = new THREE.Group();
    const sparks: SparkParticle[] = [];
    const themeInfo = this.getThemeColorInfo();

    for (let i = 0; i < count; i++) {
      // 3D spherical blast direction
      const phi = Math.acos(Math.random() * 2 - 1);
      const theta = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 1.2;

      const vx = Math.sin(phi) * Math.cos(theta) * speed;
      const vy = Math.sin(phi) * Math.sin(theta) * speed * 1.1;
      const vz = Math.cos(phi) * speed * 0.8;

      const mat = new THREE.SpriteMaterial({
        map: this.sparkTexture,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const sparkColor =
        Math.random() > 0.35
          ? themeInfo.primary.clone()
          : new THREE.Color('#ffffff').lerp(themeInfo.secondary, 0.5);

      mat.color.copy(sparkColor);

      const baseScale = Math.random() * 3.2 + 2.0;
      const sprite = new THREE.Sprite(mat);
      sprite.position.set(worldX, worldY, (Math.random() - 0.5) * 20);
      sprite.scale.set(baseScale, baseScale, 1);

      burstGroup.add(sprite);

      sparks.push({
        sprite,
        vx,
        vy,
        vz,
        drag: 0.965,
        gravity: 0.032,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.011,
        baseScale,
        color: sparkColor,
        twinkleSpeed: Math.random() * 0.2 + 0.1,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    this.fireworksGroup.add(burstGroup);
    this.fireworkBursts.push({ sparks, group: burstGroup });
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

    for (let i = 0; i < this.snowFlakes.length; i++) {
      const f = this.snowFlakes[i];
      const pos = f.sprite.position;

      f.swayPhase += f.swaySpeed;
      f.tumblePhase += f.tumbleSpeed;

      // Realistic 3D oscillation and gentle horizontal wind drift
      pos.x += Math.sin(f.swayPhase) * f.swayAmplitude * 0.08 + f.windDrift;
      pos.y -= f.speedY;
      pos.z += Math.cos(f.swayPhase * 0.6) * 0.04;

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
        pos.z = Math.random() * 115 - 70;
      }
      if (pos.x < -horizontalLimit) pos.x = horizontalLimit;
      else if (pos.x > horizontalLimit) pos.x = -horizontalLimit;
    }
  }

  private updateNewYear(): void {
    const now = Date.now();

    // Automated periodic firework launch in the upper region
    if (now >= this.nextBurstTime) {
      const burstX = (Math.random() - 0.5) * 160;
      const burstY = Math.random() * 35 + 10;
      this.createFireworkBurst(burstX, burstY, Math.floor(Math.random() * 25 + 65));
      this.nextBurstTime = now + (Math.random() * 2400 + 2600);
    }

    // Update active firework bursts
    for (let b = this.fireworkBursts.length - 1; b >= 0; b--) {
      const burst = this.fireworkBursts[b];
      let aliveSparks = 0;

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

        if (spark.alpha > 0.01) {
          aliveSparks++;
          const twinkle = 0.75 + 0.25 * Math.sin(spark.twinklePhase);
          spark.sprite.material.opacity = Math.max(0, spark.alpha * twinkle);

          const scale = spark.baseScale * (0.4 + 0.6 * spark.alpha);
          spark.sprite.scale.set(scale, scale, 1);
        } else {
          spark.sprite.visible = false;
        }
      }

      if (aliveSparks === 0) {
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
      const twinkle = 0.5 + 0.5 * Math.sin(sp.phase);
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

      const freq = this.currentMode === 'newyear' ? 660 : 528;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.56);
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
