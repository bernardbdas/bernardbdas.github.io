/**
 * weather-dashboard.ts — Atmospheric Weather Telemetry Engine (Overlay Modal)
 *
 * Capabilities:
 * - Overlay Modal Controller: Opens via WEATHER HUD footer button, closes via ESC, backdrop, or close button.
 * - Dynamic Liquid Glass Lighting: Real-time cursor tracking and ambient specular sheen on cards.
 * - Hyper-Realistic Animated ASCII Doppler Radar: Live 60 FPS ASCII atmospheric fluid visualizer with
 *   colorful thermal heat waves, precipitation reflectivity radar, and aerodynamic wind streamline vectors.
 * - Drag and Drop Reordering: Re-arrange cards in grid with live swap and persistent order caching.
 * - Pin/Unpin Modules: Keep priority telemetry pinned at top.
 * - Live Atmospheric Telemetry: Open-Meteo API integration with client geolocation.
 * - High-Contrast Neo-Brutalist Layout: Ample font sizes (12px–15px body, 52px hero temp) for effortless readability.
 * - Zero Emoji Policy: Pure SVG vector icons.
 */

export interface HourlyForecastItem {
  time: string;
  temp: number;
  icon: string;
  precipPct: number;
  windSpeed: number;
}

export interface DailyForecastItem {
  day: string;
  icon: string;
  min: number;
  max: number;
  precipPct?: number;
}

export interface WeatherTelemetryState {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  feelsLike: number;
  windSpeed: number;
  windDirection: number;
  windDirText: string;
  windGusts: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  uvIndex: number;
  uvCategory: string;
  aqi: number;
  aqiCategory: string;
  sunrise: string;
  sunset: string;
  moonIllum: number;
  moonPhase: string;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

const DEFAULT_WEATHER_STATE: WeatherTelemetryState = {
  city: 'Bengaluru',
  temp: 25,
  condition: 'Partly Cloudy',
  high: 29,
  low: 19,
  feelsLike: 25,
  windSpeed: 7,
  windDirection: 207,
  windDirText: '207° SSW',
  windGusts: 14,
  humidity: 48,
  dewPoint: 13,
  pressure: 758,
  uvIndex: 8,
  uvCategory: 'VERY HIGH',
  aqi: 136,
  aqiCategory: 'MODERATE',
  sunrise: '06:12',
  sunset: '17:53',
  moonIllum: 85,
  moonPhase: 'Waning Gibbous',
  hourly: [
    { time: 'Now', temp: 25, icon: 'partly-cloudy', precipPct: 0, windSpeed: 7 },
    { time: '19', temp: 24, icon: 'clear-night', precipPct: 0, windSpeed: 6 },
    { time: '20', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 6 },
    { time: '21', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 7 },
    { time: '22', temp: 23, icon: 'clear-night', precipPct: 0, windSpeed: 7 },
    { time: '23', temp: 22, icon: 'clear-night', precipPct: 5, windSpeed: 8 },
    { time: '00', temp: 21, icon: 'clear-night', precipPct: 5, windSpeed: 8 },
    { time: '01', temp: 20, icon: 'clear-night', precipPct: 5, windSpeed: 7 },
    { time: '02', temp: 19, icon: 'clear-night', precipPct: 10, windSpeed: 6 },
    { time: '03', temp: 19, icon: 'cloudy', precipPct: 10, windSpeed: 6 },
    { time: '04', temp: 18, icon: 'cloudy', precipPct: 10, windSpeed: 5 },
    { time: '05', temp: 18, icon: 'cloudy', precipPct: 10, windSpeed: 5 },
  ],
  daily: [
    { day: 'Today', icon: 'partly-cloudy', min: 19, max: 29, precipPct: 10 },
    { day: 'Fri', icon: 'cloudy', min: 17, max: 29, precipPct: 15 },
    { day: 'Sat', icon: 'sunny', min: 18, max: 30, precipPct: 0 },
    { day: 'Sun', icon: 'rain', min: 20, max: 29, precipPct: 40 },
    { day: 'Mon', icon: 'rain', min: 19, max: 28, precipPct: 60 },
    { day: 'Tue', icon: 'rain', min: 20, max: 27, precipPct: 65 },
    { day: 'Wed', icon: 'rain', min: 19, max: 27, precipPct: 60 },
  ],
};

interface WindParticle {
  x: number;
  y: number;
  speed: number;
  len: number;
  hue: number;
}

interface GameBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  symbol: string;
  damage: number;
  colorType: 'col-bullet-1' | 'col-bullet-2' | 'col-bullet-3';
}

export type GameDifficulty = 'CADET' | 'VETERAN' | 'APEX';

export interface DifficultySettings {
  name: GameDifficulty;
  label: string;
  speedMultiplier: number;
  spawnRate: number;
  maxObstacles: number;
  scoreMultiplier: number;
  damageMultiplier: number;
  healDropChance: number;
  upgradeDropChance: number;
}

export const DIFFICULTY_CONFIG: Record<GameDifficulty, DifficultySettings> = {
  CADET: {
    name: 'CADET',
    label: 'CADET [1.0x]',
    speedMultiplier: 1.0,
    spawnRate: 0.045,
    maxObstacles: 5,
    scoreMultiplier: 1.0,
    damageMultiplier: 1.0,
    healDropChance: 0.012,
    upgradeDropChance: 0.018,
  },
  VETERAN: {
    name: 'VETERAN',
    label: 'VETERAN [2.0x]',
    speedMultiplier: 1.35,
    spawnRate: 0.068,
    maxObstacles: 7,
    scoreMultiplier: 2.0,
    damageMultiplier: 1.25,
    healDropChance: 0.007,
    upgradeDropChance: 0.013,
  },
  APEX: {
    name: 'APEX',
    label: 'APEX [3.5x]',
    speedMultiplier: 1.75,
    spawnRate: 0.095,
    maxObstacles: 10,
    scoreMultiplier: 3.5,
    damageMultiplier: 1.5,
    healDropChance: 0.003,
    upgradeDropChance: 0.009,
  },
};

interface GameObstacle {
  x: number;
  y: number;
  symbol: string;
  width: number;
  damage: number;
  hp: number;
  colorType:
    | 'col-hazard-meteor'
    | 'col-hazard-flare'
    | 'col-hazard-plasma'
    | 'col-hazard-mine'
    | 'col-hazard-interceptor'
    | 'col-hazard-dreadnought'
    | 'col-upgrade';
  type?: 'meteor' | 'interceptor' | 'flare' | 'mine' | 'dreadnought';
}

interface GameCollectible {
  x: number;
  y: number;
  symbol: string;
  width: number;
  type: 'points' | 'weapon' | 'health';
  points: number;
  heal: number;
  colorType: 'col-collect' | 'col-upgrade' | 'col-heal';
}

interface WindStreamer {
  x: number;
  y: number;
  char: string;
  speed: number;
}

interface AsciiCell {
  char: string;
  color: string;
}

/**
 * AsciiAudioSynthesizer — Retro 8-bit / Sci-Fi Audio Synthesizer
 * Uses Web Audio API to produce zero-latency hardware synth audio effects.
 */
class AsciiAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playLaser(level: number): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const baseFreq = level === 1 ? 880 : level === 2 ? 1100 : 1320;
      osc.type = level === 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.09);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // AudioContext policy suppression fallback
    }
  }

  public playHit(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  public playCollect(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.07, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.1);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.1);
      });
    } catch {}
  }

  public playUpgrade(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.09, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.12);
      });
    } catch {}
  }

  public playHeal(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.09, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.16);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.16);
      });
    } catch {}
  }

  public playDamage(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.22);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playPulse(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playGameOver(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [329.63, 293.66, 261.63, 196.0].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.09, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.18);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.18);
      });
    } catch {}
  }

  public playDifficulty(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.05); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }
}

/**
 * AsciiAtmosphericGame — Multi-Color Atmospheric Sensor Probe Escort Game
 * Features full CRT rendering, upgradeable 1-to-3 bullet blasters, sparse hull repairs,
 * fullscreen mode, audio synthesizers, and tactical flight manual.
 */
export class AsciiAtmosphericGame {
  private screenEl: HTMLElement | null = null;
  private altEl: HTMLElement | null = null;
  private scoreEl: HTMLElement | null = null;
  private bestEl: HTMLElement | null = null;
  private shieldEl: HTMLElement | null = null;
  private empEl: HTMLElement | null = null;
  private wepEl: HTMLElement | null = null;
  private pauseLabelEl: HTMLElement | null = null;
  private fsLabelEl: HTMLElement | null = null;
  private audioLabelEl: HTMLElement | null = null;
  private rulesOverlayEl: HTMLElement | null = null;
  private diffHudEl: HTMLElement | null = null;
  private diffBtns: NodeListOf<HTMLButtonElement> | null = null;

  // Active Difficulty
  private difficulty: GameDifficulty = 'CADET';

  private mode: 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' = 'START';
  private frameId: number | null = null;
  private lastTime: number = 0;
  private animTick: number = 0;

  private readonly cols = 52;
  private readonly rows = 21;

  private probeX = 26;
  private shield = 100;
  private score = 0;
  private altitude = 10000;
  private highScore = 0;
  private empCooldown = 0;
  private pulseActive = false;
  private pulseY = 0;

  // Weapon systems & bullet arsenal
  private weaponLevel = 1; // 1: Single Pulse, 2: Dual Blaster, 3: Triple Plasma Spread
  private bullets: GameBullet[] = [];
  private fireCooldown = 0;

  // Audio synthesizer
  private audio = new AsciiAudioSynthesizer();

  private obstacles: GameObstacle[] = [];
  private collectibles: GameCollectible[] = [];
  private streamers: WindStreamer[] = [];

  private statusMessage = '';
  private statusTimer = 0;

  private isFullscreen = false;
  private isRulesOpen = false;

  private keys = { left: false, right: false, space: false };
  private isBound = false;

  constructor() {
    try {
      this.highScore = parseInt(localStorage.getItem('weather_ascii_game_highscore') || '0', 10);
      const savedDiff = localStorage.getItem('stratos_game_difficulty') as GameDifficulty;
      if (savedDiff && DIFFICULTY_CONFIG[savedDiff]) {
        this.difficulty = savedDiff;
      }
    } catch {
      this.highScore = 0;
    }
    this.initDOM();
    this.initStreamers();
  }

  public initDOM(): void {
    this.screenEl = document.getElementById('asciiGameScreen');
    this.altEl = document.getElementById('asciiHudAltitude');
    this.scoreEl = document.getElementById('asciiHudScore');
    this.bestEl = document.getElementById('asciiHudBest');
    this.shieldEl = document.getElementById('asciiHudShield');
    this.empEl = document.getElementById('asciiHudEmp');
    this.wepEl = document.getElementById('asciiHudWeapon');
    this.pauseLabelEl = document.getElementById('asciiPauseLabel');
    this.fsLabelEl = document.getElementById('asciiFullscreenLabel');
    this.audioLabelEl = document.getElementById('asciiAudioLabel');
    this.rulesOverlayEl = document.getElementById('asciiRulesOverlay');
    this.diffHudEl = document.getElementById('asciiHudDifficulty');
    this.diffBtns = document.querySelectorAll('.ascii-diff-btn');

    this.syncDifficultyUI();
    this.bindControls();
    this.render();
  }

  public setDifficulty(diff: GameDifficulty): void {
    if (!DIFFICULTY_CONFIG[diff]) return;
    this.difficulty = diff;
    try {
      localStorage.setItem('stratos_game_difficulty', diff);
    } catch {}
    this.syncDifficultyUI();
    this.audio.playDifficulty();
    this.statusMessage = `DIFFICULTY ENGAGED: ${diff} (${DIFFICULTY_CONFIG[diff].scoreMultiplier}x SCORE MULTIPLIER)`;
    this.statusTimer = 2200;
    this.render();
  }

  private syncDifficultyUI(): void {
    if (this.diffBtns) {
      this.diffBtns.forEach((btn) => {
        const d = btn.getAttribute('data-diff');
        btn.classList.toggle('is-active', d === this.difficulty);
      });
    }
    if (this.diffHudEl) {
      const cfg = DIFFICULTY_CONFIG[this.difficulty];
      this.diffHudEl.textContent = cfg.label;
      this.diffHudEl.className =
        'hud-val ' +
        (this.difficulty === 'CADET'
          ? 'diff-cadet'
          : this.difficulty === 'VETERAN'
            ? 'diff-veteran'
            : 'diff-apex');
    }
  }

  private initStreamers(): void {
    this.streamers = [];
    const chars = ['·', '.', "'", ':', '|', '`'];
    for (let i = 0; i < 24; i++) {
      this.streamers.push({
        x: Math.floor(Math.random() * (this.cols - 4)) + 2,
        y: Math.floor(Math.random() * (this.rows - 2)) + 1,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: 0.25 + Math.random() * 0.45,
      });
    }
  }

  private bindControls(): void {
    if (this.isBound || typeof window === 'undefined') return;
    this.isBound = true;

    window.addEventListener('keydown', (e) => {
      const bay = document.getElementById('weatherAsciiGameBay');
      if (!bay || bay.style.display === 'none') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = true;
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = true;
        e.preventDefault();
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.keys.space = true;
        if (this.mode === 'START' || this.mode === 'GAMEOVER') {
          this.startMission();
        } else if (this.mode === 'PLAYING') {
          this.fireBullets();
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        if (this.mode === 'PLAYING') {
          this.triggerRadarPulse();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        this.toggleRules();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        this.toggleAudio();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        this.togglePause();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.startMission();
      } else if (e.key === '1') {
        e.preventDefault();
        this.setDifficulty('CADET');
      } else if (e.key === '2') {
        e.preventDefault();
        this.setDifficulty('VETERAN');
      } else if (e.key === '3') {
        e.preventDefault();
        this.setDifficulty('APEX');
      } else if (e.key === 'Escape') {
        if (this.isRulesOpen) {
          this.toggleRules();
        } else if (this.isFullscreen) {
          this.toggleFullscreen();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.keys.right = false;
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        this.keys.space = false;
      }
    });

    // Button controls
    const btnLeft = document.getElementById('asciiBtnLeft');
    const btnRight = document.getElementById('asciiBtnRight');
    const btnFire = document.getElementById('asciiBtnFire');
    const btnPulse = document.getElementById('asciiBtnPulse');
    const btnRestart = document.getElementById('asciiBtnRestart');
    const btnPause = document.getElementById('asciiBtnPause');
    const btnRulesTop = document.getElementById('asciiBtnRulesTop');
    const btnRulesBottom = document.getElementById('asciiBtnRulesBottom');
    const btnRulesClose = document.getElementById('asciiRulesCloseBtn');
    const btnRulesDismiss = document.getElementById('asciiRulesDismissBtn');
    const btnFullscreen = document.getElementById('asciiBtnFullscreen');
    const btnAudio = document.getElementById('asciiBtnAudio');
    const screen = this.screenEl;

    const bindTouch = (el: HTMLElement | null, onDown: () => void, onUp: () => void) => {
      if (!el) return;
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onDown();
      });
      el.addEventListener('mouseup', (e) => {
        e.preventDefault();
        onUp();
      });
      el.addEventListener('mouseleave', (e) => {
        e.preventDefault();
        onUp();
      });
      el.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          onDown();
        },
        { passive: false },
      );
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        onUp();
      });
    };

    bindTouch(
      btnLeft,
      () => {
        this.keys.left = true;
      },
      () => {
        this.keys.left = false;
      },
    );
    bindTouch(
      btnRight,
      () => {
        this.keys.right = true;
      },
      () => {
        this.keys.right = false;
      },
    );

    btnFire?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.mode === 'START' || this.mode === 'GAMEOVER') {
        this.startMission();
      } else {
        this.fireBullets();
      }
    });

    btnPulse?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.mode === 'START' || this.mode === 'GAMEOVER') {
        this.startMission();
      } else {
        this.triggerRadarPulse();
      }
    });

    btnRestart?.addEventListener('click', (e) => {
      e.preventDefault();
      this.startMission();
    });

    btnPause?.addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePause();
    });

    btnRulesTop?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleRules();
    });
    btnRulesBottom?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleRules();
    });
    btnRulesClose?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleRules();
    });
    btnRulesDismiss?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleRules();
    });

    btnFullscreen?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleFullscreen();
    });

    btnAudio?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleAudio();
    });

    document.querySelectorAll<HTMLButtonElement>('.ascii-diff-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const diff = btn.getAttribute('data-diff') as GameDifficulty;
        if (diff) this.setDifficulty(diff);
      });
    });

    screen?.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.mode === 'START' || this.mode === 'GAMEOVER') {
        this.startMission();
      } else if (this.mode === 'PLAYING') {
        this.fireBullets();
      }
    });

    // Listen for OS fullscreen change to synchronize button state
    document.addEventListener('fullscreenchange', () => {
      const bay = document.getElementById('weatherAsciiGameBay');
      const modal = document.getElementById('weatherDashboardModal');
      const card = document.getElementById('weatherModalCard');
      const isDocFs = !!document.fullscreenElement;
      if (!isDocFs && this.isFullscreen) {
        this.isFullscreen = false;
        bay?.classList.remove('is-ascii-fullscreen');
        modal?.classList.remove('has-ascii-fullscreen');
        card?.classList.remove('has-ascii-fullscreen');
        if (this.fsLabelEl) this.fsLabelEl.textContent = 'FULLSCREEN [F]';
      }
    });
  }

  public toggleFullscreen(): void {
    const bay = document.getElementById('weatherAsciiGameBay');
    const modal = document.getElementById('weatherDashboardModal');
    const card = document.getElementById('weatherModalCard');
    if (!bay) return;
    this.isFullscreen = !this.isFullscreen;

    bay.classList.toggle('is-ascii-fullscreen', this.isFullscreen);
    modal?.classList.toggle('has-ascii-fullscreen', this.isFullscreen);
    card?.classList.toggle('has-ascii-fullscreen', this.isFullscreen);

    if (this.isFullscreen) {
      if (this.fsLabelEl) this.fsLabelEl.textContent = 'EXIT FULLSCREEN [F]';
      if (bay.requestFullscreen) {
        bay.requestFullscreen().catch(() => {});
      }
    } else {
      if (this.fsLabelEl) this.fsLabelEl.textContent = 'FULLSCREEN [F]';
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  public toggleRules(): void {
    this.isRulesOpen = !this.isRulesOpen;
    if (this.rulesOverlayEl) {
      this.rulesOverlayEl.style.display = this.isRulesOpen ? 'flex' : 'none';
    }
    if (this.isRulesOpen && this.mode === 'PLAYING') {
      this.pause();
    }
  }

  public toggleAudio(): void {
    const isMuted = this.audio.toggleMute();
    if (this.audioLabelEl) {
      this.audioLabelEl.textContent = isMuted ? 'AUDIO: OFF [M]' : 'AUDIO: ON [M]';
    }
  }

  public start(): void {
    if (this.frameId) return;
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(time - this.lastTime, 100);
      this.lastTime = time;
      this.update(dt);
      this.render();
      this.frameId = requestAnimationFrame(loop);
    };
    this.frameId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  public pause(): void {
    if (this.mode === 'PLAYING') {
      this.mode = 'PAUSED';
      if (this.pauseLabelEl) this.pauseLabelEl.textContent = 'RESUME';
      this.render();
    }
  }

  public resume(): void {
    if (this.mode === 'PAUSED') {
      this.mode = 'PLAYING';
      if (this.pauseLabelEl) this.pauseLabelEl.textContent = 'PAUSE';
    }
    this.start();
  }

  public togglePause(): void {
    if (this.mode === 'PLAYING') {
      this.pause();
    } else if (this.mode === 'PAUSED') {
      this.resume();
    }
  }

  public startMission(): void {
    this.mode = 'PLAYING';
    this.shield = 100;
    this.score = 0;
    this.altitude = 10000;
    this.empCooldown = 0;
    this.pulseActive = false;
    this.weaponLevel = 1;
    this.bullets = [];
    this.obstacles = [];
    this.collectibles = [];
    this.probeX = 26;
    this.statusMessage = 'ATMOSPHERIC SENSOR PROBE DEPLOYED';
    this.statusTimer = 2200;
    if (this.pauseLabelEl) this.pauseLabelEl.textContent = 'PAUSE';
    if (this.rulesOverlayEl) this.rulesOverlayEl.style.display = 'none';
    this.isRulesOpen = false;
    this.audio.playLaser(1);
    this.start();
  }

  public fireBullets(): void {
    if (this.mode !== 'PLAYING' || this.fireCooldown > 0) return;
    this.fireCooldown = 180; // milliseconds between rapid shots

    this.audio.playLaser(this.weaponLevel);

    const px = Math.round(this.probeX);
    if (this.weaponLevel === 1) {
      // Level 1: 1 forward kinetic tracer
      this.bullets.push({
        x: px,
        y: 15,
        vx: 0,
        vy: -0.9,
        symbol: '^',
        damage: 30,
        colorType: 'col-bullet-1',
      });
    } else if (this.weaponLevel === 2) {
      // Level 2: 2 parallel dual blasters
      this.bullets.push(
        {
          x: px - 1.5,
          y: 15,
          vx: 0,
          vy: -0.92,
          symbol: '^',
          damage: 30,
          colorType: 'col-bullet-2',
        },
        {
          x: px + 1.5,
          y: 15,
          vx: 0,
          vy: -0.92,
          symbol: '^',
          damage: 30,
          colorType: 'col-bullet-2',
        },
      );
    } else {
      // Level 3: 3-way triple plasma spread
      this.bullets.push(
        {
          x: px,
          y: 15,
          vx: 0,
          vy: -0.95,
          symbol: '|',
          damage: 35,
          colorType: 'col-bullet-3',
        },
        {
          x: px - 1.5,
          y: 15,
          vx: -0.25,
          vy: -0.85,
          symbol: '\\',
          damage: 30,
          colorType: 'col-bullet-3',
        },
        {
          x: px + 1.5,
          y: 15,
          vx: 0.25,
          vy: -0.85,
          symbol: '/',
          damage: 30,
          colorType: 'col-bullet-3',
        },
      );
    }
  }

  public triggerRadarPulse(): void {
    if (this.empCooldown > 0 || this.mode !== 'PLAYING') return;
    this.pulseActive = true;
    this.pulseY = 17;
    this.empCooldown = 4500;

    this.audio.playPulse();

    let vaporizedCount = 0;
    this.obstacles = this.obstacles.filter((obs) => {
      if (obs.y < 18) {
        vaporizedCount++;
        return false;
      }
      return true;
    });

    const bonus = vaporizedCount * 60;
    this.score += bonus;
    this.statusMessage =
      bonus > 0
        ? `RADAR EMP: ${vaporizedCount} HAZARDS NEUTRALIZED (+${bonus} PTS)`
        : 'RADAR EMP SHOCKWAVE DISCHARGED';
    this.statusTimer = 2200;
  }

  private update(dt: number): void {
    this.animTick++;

    if (this.statusTimer > 0) {
      this.statusTimer -= dt;
      if (this.statusTimer <= 0) this.statusMessage = '';
    }

    if (this.empCooldown > 0) {
      this.empCooldown = Math.max(0, this.empCooldown - dt);
    }

    if (this.fireCooldown > 0) {
      this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    }

    // Background wind streamers update
    for (const st of this.streamers) {
      st.y += st.speed;
      if (st.y >= this.rows - 1) {
        st.y = 1;
        st.x = Math.floor(Math.random() * (this.cols - 4)) + 2;
      }
    }

    if (this.mode !== 'PLAYING') return;

    // Progression scaled by active difficulty
    const cfg = DIFFICULTY_CONFIG[this.difficulty];
    this.altitude += Math.round(12 * cfg.speedMultiplier);
    this.score += Math.max(1, Math.round(1 * cfg.scoreMultiplier));
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('weather_ascii_game_highscore', this.highScore.toString());
      } catch {
        // ignore storage errors
      }
    }

    // Steer probe
    if (this.keys.left) this.probeX -= 0.65;
    if (this.keys.right) this.probeX += 0.65;
    this.probeX = Math.max(4, Math.min(this.cols - 5, this.probeX));

    // Continuous fire if space is held
    if (this.keys.space && this.fireCooldown <= 0) {
      this.fireBullets();
    }

    // Pulse wave movement
    if (this.pulseActive) {
      this.pulseY -= 0.75;
      if (this.pulseY <= 1) {
        this.pulseActive = false;
      }
    }

    // Advance bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.y <= 1 || b.x <= 1 || b.x >= this.cols - 2) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check collision with obstacles
      let hit = false;
      for (let j = this.obstacles.length - 1; j >= 0; j--) {
        const obs = this.obstacles[j];
        if (Math.abs(b.y - obs.y) < 1.2 && b.x >= obs.x - 0.5 && b.x <= obs.x + obs.width + 0.5) {
          obs.hp -= b.damage;
          this.audio.playHit();
          hit = true;

          if (obs.hp <= 0) {
            const reward =
              obs.type === 'dreadnought'
                ? Math.round(800 * cfg.scoreMultiplier)
                : Math.round(obs.damage * 4 * cfg.scoreMultiplier);
            this.score += reward;
            this.statusMessage =
              obs.type === 'dreadnought'
                ? `DREADNOUGHT VAPORIZED (+${reward} PTS)!`
                : `HAZARD DESTROYED (+${reward} PTS)`;
            this.statusTimer = 1600;
            this.obstacles.splice(j, 1);
          }
          break;
        }
      }

      if (hit) {
        this.bullets.splice(i, 1);
      }
    }

    // Spawn hazards dynamically based on difficulty
    if (this.obstacles.length < cfg.maxObstacles && Math.random() < cfg.spawnRate) {
      const types = [
        {
          symbol: '[###]',
          width: 5,
          damage: Math.round(25 * cfg.damageMultiplier),
          hp: 50,
          colorType: 'col-hazard-meteor' as const,
          type: 'meteor' as const,
        },
        {
          symbol: '>==>',
          width: 4,
          damage: Math.round(22 * cfg.damageMultiplier),
          hp: 35,
          colorType: 'col-hazard-meteor' as const,
          type: 'interceptor' as const,
        },
        {
          symbol: '/\\/\\',
          width: 4,
          damage: Math.round(20 * cfg.damageMultiplier),
          hp: 30,
          colorType: 'col-hazard-flare' as const,
          type: 'flare' as const,
        },
        {
          symbol: '~~~~~',
          width: 5,
          damage: Math.round(25 * cfg.damageMultiplier),
          hp: 40,
          colorType: 'col-hazard-plasma' as const,
          type: 'flare' as const,
        },
        {
          symbol: '(@*)',
          width: 4,
          damage: Math.round(35 * cfg.damageMultiplier),
          hp: 25,
          colorType: 'col-hazard-mine' as const,
          type: 'mine' as const,
        },
      ];

      // Add Dreadnought Boss at high altitudes or on APEX mode
      const hasDreadnought = this.obstacles.some((o) => o.type === 'dreadnought');
      if (
        !hasDreadnought &&
        this.altitude >= 13500 &&
        Math.random() < (this.difficulty === 'APEX' ? 0.35 : 0.15)
      ) {
        types.push({
          symbol: '[==#==]',
          width: 7,
          damage: Math.round(45 * cfg.damageMultiplier),
          hp: 120,
          colorType: 'col-upgrade' as const,
          type: 'dreadnought' as const,
        });
      }

      const pick = types[Math.floor(Math.random() * types.length)];
      const x = Math.floor(Math.random() * (this.cols - pick.width - 4)) + 2;
      this.obstacles.push({
        x,
        y: 1,
        symbol: pick.symbol,
        width: pick.width,
        damage: pick.damage,
        hp: pick.hp,
        colorType: pick.colorType,
        type: pick.type,
      });
    }

    // Spawn non-hazardous collectibles & upgrades
    if (this.collectibles.length < 3) {
      const hasUpgrade = this.collectibles.some((c) => c.type === 'weapon');
      const hasHealth = this.collectibles.some((c) => c.type === 'health');

      // 1. Weapon Upgrade drop (Gold): upgrade bullets from 1 -> 2 -> 3
      if (!hasUpgrade && Math.random() < cfg.upgradeDropChance) {
        const x = Math.floor(Math.random() * (this.cols - 11)) + 2;
        this.collectibles.push({
          x,
          y: 1,
          symbol: '[^UPG^]',
          width: 7,
          type: 'weapon',
          points: 300,
          heal: 0,
          colorType: 'col-upgrade',
        });
      }
      // 2. Sparse Health drops (Emerald Green): restore +25% hull integrity
      else if (
        !hasHealth &&
        Math.random() < (this.shield < 40 ? cfg.healDropChance * 2 : cfg.healDropChance)
      ) {
        const x = Math.floor(Math.random() * (this.cols - 10)) + 2;
        this.collectibles.push({
          x,
          y: 1,
          symbol: '[HULL+]',
          width: 6,
          type: 'health',
          points: 150,
          heal: 25,
          colorType: 'col-heal',
        });
      }
      // 3. Regular telemetry packets (Cyan)
      else if (Math.random() < 0.024) {
        const types = [
          { symbol: '(+)', width: 3, points: 100, heal: 3 },
          { symbol: '[o]', width: 3, points: 250, heal: 5 },
          { symbol: '<*>', width: 3, points: 500, heal: 8 },
        ];
        const pick = types[Math.floor(Math.random() * types.length)];
        const x = Math.floor(Math.random() * (this.cols - pick.width - 4)) + 2;
        this.collectibles.push({
          x,
          y: 1,
          symbol: pick.symbol,
          width: pick.width,
          type: 'points',
          points: pick.points,
          heal: pick.heal,
          colorType: 'col-collect',
        });
      }
    }

    const currentSpeed =
      (0.3 + Math.min((this.altitude - 10000) / 75000, 0.45)) * cfg.speedMultiplier;

    // Update obstacles with AI behaviors
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.y += currentSpeed;

      // Enemy AI behaviors based on hazard type
      if (obs.type === 'interceptor') {
        const px = this.probeX;
        if (obs.x < px - 1) obs.x += 0.22 * cfg.speedMultiplier;
        else if (obs.x > px + 1) obs.x -= 0.22 * cfg.speedMultiplier;
      } else if (obs.type === 'flare') {
        obs.x += Math.sin(this.animTick * 0.2 + obs.y) * 0.4 * cfg.speedMultiplier;
      }
      obs.x = Math.max(2, Math.min(this.cols - obs.width - 2, obs.x));

      // Pulse wave collision
      if (this.pulseActive && Math.abs(obs.y - this.pulseY) < 1.5) {
        this.score += Math.round(60 * cfg.scoreMultiplier);
        this.obstacles.splice(i, 1);
        continue;
      }

      // Player collision (probe rows 16..18)
      if (obs.y >= 16 && obs.y <= 18.5) {
        const probeCenter = Math.round(this.probeX);
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        if (obsRight >= probeCenter - 2 && obsLeft <= probeCenter + 2) {
          this.shield = Math.max(0, this.shield - obs.damage);
          this.statusMessage = `! HULL IMPACT: -${obs.damage}% SHIELD !`;
          this.statusTimer = 1800;
          this.audio.playDamage();
          if (this.screenEl) {
            this.screenEl.classList.remove('crt-shake');
            void this.screenEl.offsetWidth;
            this.screenEl.classList.add('crt-shake');
          }
          this.obstacles.splice(i, 1);

          if (this.shield <= 0) {
            this.mode = 'GAMEOVER';
            this.statusMessage = 'STRATOS PROBE HULL SEVERED';
            if (this.pauseLabelEl) this.pauseLabelEl.textContent = 'PAUSE';
            this.audio.playGameOver();
          }
          continue;
        }
      }

      if (obs.y >= this.rows - 1) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.y += currentSpeed * 0.9;

      // Player collision
      if (col.y >= 16 && col.y <= 18.5) {
        const probeCenter = Math.round(this.probeX);
        const colLeft = col.x;
        const colRight = col.x + col.width;
        if (colRight >= probeCenter - 2 && colLeft <= probeCenter + 2) {
          if (col.type === 'weapon') {
            if (this.weaponLevel < 3) {
              this.weaponLevel++;
              const label = this.weaponLevel === 2 ? 'DUAL ION BLASTERS' : 'TRIPLE PLASMA SPREAD';
              this.statusMessage = `WEAPON UPGRADED // LEVEL ${this.weaponLevel}: ${label}!`;
            } else {
              this.score += Math.round(500 * cfg.scoreMultiplier);
              this.statusMessage = 'WEAPON CORE MAXED // OVERCHARGE (+500 PTS)';
            }
            this.audio.playUpgrade();
          } else if (col.type === 'health') {
            this.shield = Math.min(100, this.shield + col.heal);
            this.statusMessage = `HULL INTEGRITY RESTORED (+${col.heal}%)`;
            this.audio.playHeal();
          } else {
            const pts = Math.round(col.points * cfg.scoreMultiplier);
            this.score += pts;
            this.shield = Math.min(100, this.shield + col.heal);
            this.statusMessage = `+${pts} TELEMETRY PACKET ARCHIVED`;
            this.audio.playCollect();
          }

          this.statusTimer = 2000;
          this.collectibles.splice(i, 1);
          continue;
        }
      }

      if (col.y >= this.rows - 1) {
        this.collectibles.splice(i, 1);
      }
    }
  }

  private render(): void {
    if (!this.screenEl) return;

    const grid: AsciiCell[][] = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({ char: ' ', color: '' })),
    );

    const setStr = (y: number, x: number, str: string, color: string = '') => {
      if (y < 0 || y >= this.rows) return;
      for (let i = 0; i < str.length; i++) {
        const cx = x + i;
        if (cx >= 0 && cx < this.cols) {
          grid[y][cx] = { char: str[i], color };
        }
      }
    };

    const centerStr = (y: number, str: string, color: string = '') => {
      const x = Math.max(1, Math.floor((this.cols - str.length) / 2));
      setStr(y, x, str, color);
    };

    // Draw frame borders
    for (let x = 0; x < this.cols; x++) {
      grid[0][x] = { char: '-', color: 'col-border' };
      grid[this.rows - 1][x] = { char: '-', color: 'col-border' };
    }
    for (let y = 0; y < this.rows; y++) {
      grid[y][0] = { char: '|', color: 'col-border' };
      grid[y][this.cols - 1] = { char: '|', color: 'col-border' };
    }
    grid[0][0] = { char: '+', color: 'col-border' };
    grid[0][this.cols - 1] = { char: '+', color: 'col-border' };
    grid[this.rows - 1][0] = { char: '+', color: 'col-border' };
    grid[this.rows - 1][this.cols - 1] = { char: '+', color: 'col-border' };

    const cfg = DIFFICULTY_CONFIG[this.difficulty];

    if (this.mode === 'START') {
      centerStr(1, '=== ATMOSPHERIC SENSOR ESCORT // PROJECT STRATOS ===', 'col-title');
      centerStr(3, '  ____ _____ ____      _  _____ ___  ____  ', 'col-title');
      centerStr(4, ' / ___|_   _|  _ \\    / \\|_   _/ _ \\/ ___| ', 'col-title');
      centerStr(5, ' \\___ \\ | | | |_) |  / _ \\ | || | | \\___ \\ ', 'col-title');
      centerStr(6, '  ___) || | |  _ <  / ___ \\| || |_| |___) |', 'col-title');
      centerStr(7, ' |____/ |_| |_| \\_\\/_/   \\_\\_| \\___/|____/ ', 'col-title');
      centerStr(8, '      [ HIGH-ALTITUDE STRATOSPHERE DEFENSE ]       ', 'col-title');

      centerStr(10, '>> GPS SATELLITE FIX: OFFLINE // NO BEACON <<', 'col-hazard-meteor');
      centerStr(11, 'ESCORT THE WEATHER PROBE THROUGH THE IONOSPHERE');

      const diffColor =
        this.difficulty === 'APEX'
          ? 'col-hazard-meteor'
          : this.difficulty === 'VETERAN'
            ? 'col-upgrade'
            : 'col-bullet-2';
      centerStr(
        13,
        `DIFFICULTY: [1] CADET  [2] VETERAN  [3] APEX  (${this.difficulty})`,
        diffColor,
      );
      centerStr(14, '[A] / [D] / ARROWS : STEER  |  [SPACE] : FIRE CANNONS');
      centerStr(15, '[E] : RADAR EMP  |  [F] : FULLSCREEN  |  [H] : FLIGHT RULES');

      centerStr(
        17,
        'HAZARDS: [###] >==> /\\/\\ (@*) [==#==]  |  REPAIR: [HULL+]',
        'col-hazard-mine',
      );
      centerStr(18, '>>> PRESS SPACE OR CLICK TO LAUNCH STRATOS PROBE <<<', 'col-upgrade');
    } else if (this.mode === 'GAMEOVER') {
      centerStr(1, '=== STRATOS IONOSPHERIC LINK SEVERED ===', 'col-hazard-meteor');
      centerStr(3, ' ___   _   __  __ ___    _____   _____ ___  ', 'col-hazard-meteor');
      centerStr(4, '/ __| /_\\ |  \\/  | __|  / _ \\ \\ / / __| _ \\ ', 'col-hazard-meteor');
      centerStr(5, '| (_ |/ _ \\| |\\/| | _|  | (_) \\ V /| _||   / ', 'col-hazard-meteor');
      centerStr(6, ' \\___/_/ \\_\\_|  |_|___|  \\___/ \\_/ |___|_|_\\ ', 'col-hazard-meteor');

      centerStr(8, '// HULL COMPROMISED: ATMOSPHERIC BURNOUT //', 'col-hazard-flare');
      centerStr(
        10,
        `DIFFICULTY TIER     : ${this.difficulty} (${cfg.scoreMultiplier}x SCORE)`,
        'col-upgrade',
      );
      centerStr(
        11,
        `TELEMETRY COLLECTED : ${this.score.toString().padStart(5, '0')} PTS`,
        'col-collect',
      );
      centerStr(12, `MAXIMUM ALTITUDE    : ${this.altitude.toLocaleString()} METERS`);
      centerStr(
        13,
        `RECORD ARCHIVE      : ${this.highScore.toString().padStart(5, '0')} PTS`,
        'col-upgrade',
      );

      centerStr(15, '>> DE-ORBIT HAZARDS LOGGED IN FLIGHT RECORDER <<', 'col-hazard-plasma');
      centerStr(17, '[ PRESS SPACE OR CLICK TO RE-DEPLOY STRATOS PROBE ]', 'col-upgrade');
      centerStr(18, '[ PRESS 1/2/3 TO CHANGE DIFFICULTY // H FOR RULES ]');
    } else {
      setStr(0, 3, '[ RADAR PROBE: IONOSPHERE SECTOR ]', 'col-border');

      const px = Math.round(this.probeX);

      // Draw background streamers
      for (const st of this.streamers) {
        const sy = Math.floor(st.y);
        if (sy >= 1 && sy < this.rows - 1 && grid[sy][st.x].char === ' ') {
          if (sy >= 16 && Math.abs(st.x - px) <= 4) continue;
          grid[sy][st.x] = { char: st.char, color: 'col-streamer' };
        }
      }

      // Draw pulse wave
      if (this.pulseActive) {
        const py = Math.floor(this.pulseY);
        if (py >= 1 && py < this.rows - 1) {
          centerStr(py, '((( ( ( ( RADAR EMP SHOCKWAVE ) ) ) )))', 'col-pulse');
        }
      }

      // Draw bullets
      for (const b of this.bullets) {
        const bx = Math.round(b.x);
        const by = Math.round(b.y);
        if (by >= 1 && by < this.rows - 1 && bx >= 1 && bx < this.cols - 1) {
          grid[by][bx] = { char: b.symbol, color: b.colorType };
        }
      }

      // Draw collectibles (Telemetry packets, weapon upgrades, health nanites)
      for (const col of this.collectibles) {
        const cy = Math.floor(col.y);
        if (cy >= 1 && cy < this.rows - 1) {
          setStr(cy, col.x, col.symbol, col.colorType);
        }
      }

      // Draw obstacles (Hazards in red, orange, pink)
      for (const obs of this.obstacles) {
        const oy = Math.floor(obs.y);
        if (oy >= 1 && oy < this.rows - 1) {
          setStr(oy, obs.x, obs.symbol, obs.colorType);
        }
      }

      // Clear probe area and draw sharp probe silhouette
      for (let r = 16; r <= 19; r++) {
        for (let c = px - 4; c <= px + 4; c++) {
          if (c >= 1 && c < this.cols - 1) grid[r][c] = { char: ' ', color: '' };
        }
      }

      setStr(16, px - 1, ' ▲ ', 'col-probe');
      setStr(17, px - 2, '/=#=\\', 'col-probe');
      setStr(18, px - 3, '<-o-o->', 'col-probe');
      const flame = this.animTick % 4 < 2 ? ' : : ' : ' ! ! ';
      setStr(19, px - 2, flame, 'col-flame');

      if (this.statusMessage) {
        centerStr(2, `[ ${this.statusMessage} ]`, 'col-upgrade');
      }

      if (this.mode === 'PAUSED') {
        centerStr(9, '+---------------------------------------+', 'col-upgrade');
        centerStr(10, '|   MISSION PAUSED // PRESS P TO RESUME |', 'col-upgrade');
        centerStr(11, '+---------------------------------------+', 'col-upgrade');
      }
    }

    // Convert grid to rich multi-color CRT HTML
    const escapeHtml = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const htmlRows = grid.map((row) => {
      let rowHtml = '';
      let curColor = '';
      let curRun = '';

      for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (cell.color === curColor) {
          curRun += cell.char;
        } else {
          if (curRun) {
            rowHtml += curColor
              ? `<span class="${curColor}">${escapeHtml(curRun)}</span>`
              : escapeHtml(curRun);
          }
          curColor = cell.color;
          curRun = cell.char;
        }
      }
      if (curRun) {
        rowHtml += curColor
          ? `<span class="${curColor}">${escapeHtml(curRun)}</span>`
          : escapeHtml(curRun);
      }
      return rowHtml;
    });

    this.screenEl.innerHTML = htmlRows.join('\n');

    // Update Telemetry Bar
    if (this.altEl) this.altEl.textContent = `${this.altitude.toLocaleString()} M`;
    if (this.scoreEl) this.scoreEl.textContent = this.score.toString().padStart(5, '0');
    if (this.bestEl) this.bestEl.textContent = this.highScore.toString().padStart(5, '0');

    if (this.wepEl) {
      if (this.weaponLevel === 1) {
        this.wepEl.textContent = 'LVL 1 [1x PULSE]';
        this.wepEl.className = 'hud-val hud-weap-lvl weap-lvl-1';
      } else if (this.weaponLevel === 2) {
        this.wepEl.textContent = 'LVL 2 [2x DUAL]';
        this.wepEl.className = 'hud-val hud-weap-lvl weap-lvl-2';
      } else {
        this.wepEl.textContent = 'LVL 3 [3x SPREAD]';
        this.wepEl.className = 'hud-val hud-weap-lvl weap-lvl-3';
      }
    }

    if (this.shieldEl) {
      const pips = Math.ceil(this.shield / 10);
      this.shieldEl.textContent = `[${'|'.repeat(pips).padEnd(10, '.')}] ${this.shield}%`;
      this.shieldEl.style.color =
        this.shield > 50 ? '#22c55e' : this.shield > 25 ? '#f59e0b' : '#ef4444';
    }
    if (this.empEl) {
      if (this.empCooldown <= 0) {
        this.empEl.textContent = 'READY [E]';
        this.empEl.className = 'hud-val hud-emp-ready';
      } else {
        this.empEl.textContent = `CHARGING [${(this.empCooldown / 1000).toFixed(1)}s]`;
        this.empEl.className = 'hud-val';
      }
    }
  }
}

export class WeatherDashboardController {
  private modal: HTMLElement | null = null;
  private modalCard: HTMLElement | null = null;
  private rail: HTMLElement | null = null;
  private state: WeatherTelemetryState = { ...DEFAULT_WEATHER_STATE };
  private isOpen: boolean = false;
  private activeHourlyMode: 'temp' | 'rain' | 'wind' = 'temp';

  // Geolocation & Fallback ASCII Game state
  private currentLat: number = 12.9716;
  private currentLon: number = 77.5946;
  private isLocationDetermined: boolean = false;
  private isAsciiBayActive: boolean = false;
  private asciiGame: AsciiAtmosphericGame | null = null;

  // Persistence caches
  private pinnedCards: Set<string> = new Set();
  private cardOrder: string[] = [];

  // Dynamic Liquid Glass Lighting state
  private shineFrameId: number | null = null;
  private lightX = 0;
  private lightY = 0;
  private targetLightX = 0;
  private targetLightY = 0;
  private isPointerInside = false;
  private orbitAngle = 0;

  // Hyper-Realistic Animated ASCII Doppler Radar state
  private asciiCanvas: HTMLCanvasElement | null = null;
  private asciiCtx: CanvasRenderingContext2D | null = null;
  private asciiFrameId: number | null = null;
  private radarSweepAngle: number = 0;
  private readonly radarSweepSpeed: number = 0.024;
  private radarMouseX: number = -100;
  private radarMouseY: number = -100;
  private windStreamlines: WindParticle[] = [];
  private lastFpsTime: number = 0;
  private frameCount: number = 0;
  private currentFps: number = 60;

  public isEasterEggUnlocked(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      return (
        document.documentElement.classList.contains('easter-egg-unlocked') ||
        sessionStorage.getItem('easter_egg_unlocked') === 'true'
      );
    } catch {
      return false;
    }
  }

  constructor() {
    this.loadCachedPreferences();
    this.initDOM();
    this.initDynamicLiquidGlass();
    this.initAsciiRadar();
    this.initAsciiGame();
    // Ask for location permission ONLY when easter egg is unlocked and NOT on initial visit
    if (this.isEasterEggUnlocked()) {
      this.locateUserAndFetch(false);
    } else {
      this.isLocationDetermined = false;
      this.showAsciiGameBay('// STRATOS SATELLITE BEACON: OFFLINE // LOCATION INDETERMINATE');
    }
  }

  private loadCachedPreferences(): void {
    try {
      const storedPinned = localStorage.getItem('weather_card_pinned');
      if (storedPinned) {
        this.pinnedCards = new Set(JSON.parse(storedPinned));
      }

      const storedOrder = localStorage.getItem('weather_card_order');
      if (storedOrder) {
        this.cardOrder = JSON.parse(storedOrder);
      }
    } catch {
      this.pinnedCards = new Set();
      this.cardOrder = [];
    }
  }

  public onPageLoad(): void {
    this.initDOM();
    this.initAsciiRadar();
    this.initAsciiGame();
    this.applyVisibility();
    this.applyCachedOrder();
    this.renderTelemetry();
    // Ask for location permission ONLY when easter egg is unlocked and NOT on initial visit
    if (this.isEasterEggUnlocked()) {
      this.locateUserAndFetch(false);
    } else {
      this.isLocationDetermined = false;
      this.showAsciiGameBay('// STRATOS SATELLITE BEACON: OFFLINE // LOCATION INDETERMINATE');
    }
  }

  public initAsciiGame(): void {
    if (!this.asciiGame) {
      this.asciiGame = new AsciiAtmosphericGame();
    } else {
      this.asciiGame.initDOM();
    }
  }

  public initDOM(): void {
    this.modal = document.getElementById('weatherDashboardModal');
    this.modalCard = document.getElementById('weatherModalCard');
    this.rail = document.getElementById('weatherCardsRail');
    this.bindDOM();
    this.applyVisibility();
  }

  private bindDOM(): void {
    this.updateMasterSwitchUI();

    // Bottom status bar master toggle
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const handleSwitch = (e: Event) => {
      e.stopPropagation();
      this.toggleModal();
    };

    if (toggleSwitch && toggleSwitch.dataset.weatherBound !== 'true') {
      toggleSwitch.dataset.weatherBound = 'true';
      toggleSwitch.addEventListener('click', handleSwitch);
    }

    // Modal Close Button
    const closeBtn = document.getElementById('weatherModalClose');
    if (closeBtn && closeBtn.dataset.closeBound !== 'true') {
      closeBtn.dataset.closeBound = 'true';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeModal();
      });
    }

    // Backdrop click to close (when clicking outside the modal card)
    if (this.modal && this.modal.dataset.backdropBound !== 'true') {
      this.modal.dataset.backdropBound = 'true';
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    // Keyboard ESC key listener
    if (typeof window !== 'undefined' && !window.__weatherEscBound) {
      window.__weatherEscBound = true;
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeModal();
        }
      });
    }

    // Reset Layout Button
    const resetBtn = document.getElementById('weatherResetLayoutBtn');
    if (resetBtn && resetBtn.dataset.resetBound !== 'true') {
      resetBtn.dataset.resetBound = 'true';
      resetBtn.addEventListener('click', () => this.resetLayout());
    }

    // Hourly tabs
    const condTabs = document.querySelectorAll<HTMLButtonElement>('.weather-cond-tab');
    condTabs.forEach((tab) => {
      if (tab.dataset.tabBound !== 'true') {
        tab.dataset.tabBound = 'true';
        tab.addEventListener('click', () => {
          const mode = tab.getAttribute('data-tab') as 'temp' | 'rain' | 'wind';
          if (mode) this.setHourlyMode(mode);
        });
      }
    });

    // Card Pin buttons
    const pinBtns = document.querySelectorAll<HTMLButtonElement>('.widget-pin-btn');
    pinBtns.forEach((btn) => {
      if (btn.dataset.pinBound !== 'true') {
        btn.dataset.pinBound = 'true';
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest<HTMLElement>('.weather-card');
          if (card && card.id) {
            this.togglePin(card.id);
          }
        });
      }
    });

    // ASCII Game Toggle Button
    const asciiToggleBtn = document.getElementById('weatherAsciiGameToggleBtn');
    if (asciiToggleBtn && asciiToggleBtn.dataset.bound !== 'true') {
      asciiToggleBtn.dataset.bound = 'true';
      asciiToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleAsciiGameMode();
      });
    }

    // Locate Button
    const locateBtn = document.getElementById('weatherLocateBtn');
    if (locateBtn && locateBtn.dataset.bound !== 'true') {
      locateBtn.dataset.bound = 'true';
      locateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.locateUserAndFetch(true);
      });
    }

    // Return to Telemetry Button inside ASCII bay
    const returnTelemetryBtn = document.getElementById('asciiReturnTelemetryBtn');
    if (returnTelemetryBtn && returnTelemetryBtn.dataset.bound !== 'true') {
      returnTelemetryBtn.dataset.bound = 'true';
      returnTelemetryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTelemetryBay();
      });
    }

    // Retry Location Button inside ASCII bay
    const retryLocBtn = document.getElementById('asciiRetryLocBtn');
    if (retryLocBtn && retryLocBtn.dataset.bound !== 'true') {
      retryLocBtn.dataset.bound = 'true';
      retryLocBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.locateUserAndFetch(true);
      });
    }

    // Reactively trigger location detection ONLY when easter-egg is unlocked
    if (typeof window !== 'undefined' && !(window as any).__weatherEggBound) {
      (window as any).__weatherEggBound = true;
      window.addEventListener('easter-egg:unlock', () => {
        this.locateUserAndFetch(true);
      });
      window.addEventListener('easter-egg:lock', () => {
        this.isLocationDetermined = false;
        this.showAsciiGameBay('// STRATOS SATELLITE BEACON: OFFLINE // LOCATION INDETERMINATE');
      });
    }

    this.bindDragAndDrop();
  }

  // ── Modal Visibility ──────────────────────────────────────────
  public openModal(): void {
    this.isOpen = true;
    this.applyVisibility();
    this.updateMasterSwitchUI();
    if (this.isAsciiBayActive) {
      this.asciiGame?.resume();
    } else {
      this.startAsciiRadar();
    }
  }

  public closeModal(): void {
    this.isOpen = false;
    this.applyVisibility();
    this.updateMasterSwitchUI();
    this.asciiGame?.pause();
    this.stopAsciiRadar();
  }

  public toggleModal(): void {
    if (this.isOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  public updateMasterSwitchUI(): void {
    const toggleSwitch = document.getElementById('weatherHudToggle');
    const status = document.getElementById('weatherHudStatus');

    if (toggleSwitch) {
      toggleSwitch.classList.toggle('is-active', this.isOpen);
      toggleSwitch.setAttribute('aria-checked', this.isOpen ? 'true' : 'false');
    }
    if (status) {
      status.textContent = this.isOpen ? 'OPEN' : 'OFF';
    }
  }

  private applyVisibility(): void {
    if (!this.modal) return;
    this.modal.classList.toggle('is-open', this.isOpen);
    this.modal.setAttribute('aria-hidden', this.isOpen ? 'false' : 'true');

    if (this.isOpen) {
      document.body.classList.add('weather-modal-open');
      this.startAsciiRadar();
    } else {
      document.body.classList.remove('weather-modal-open');
      this.stopAsciiRadar();
    }
  }

  // ── Drag & Drop Customization ──────────────────────────────────
  private bindDragAndDrop(): void {
    const cards = document.querySelectorAll<HTMLElement>('.weather-card');
    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('is-dragging');
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', card.id);
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('is-dragging');
        document.querySelectorAll('.weather-card').forEach((c) => {
          c.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        this.saveCardOrder();
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          card.classList.add('drag-over-top');
          card.classList.remove('drag-over-bottom');
        } else {
          card.classList.add('drag-over-bottom');
          card.classList.remove('drag-over-top');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drag-over-top', 'drag-over-bottom');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('drag-over-top', 'drag-over-bottom');
        const draggedId = e.dataTransfer?.getData('text/plain');
        if (!draggedId || draggedId === card.id) return;

        const draggedEl = document.getElementById(draggedId);
        const parent = card.parentElement;
        if (!draggedEl || !parent) return;

        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          parent.insertBefore(draggedEl, card);
        } else {
          parent.insertBefore(draggedEl, card.nextSibling);
        }

        this.saveCardOrder();
      });
    });
  }

  private saveCardOrder(): void {
    if (!this.rail) return;
    const cards = this.rail.querySelectorAll<HTMLElement>('.weather-card');
    this.cardOrder = Array.from(cards).map((c) => c.id);
    try {
      localStorage.setItem('weather_card_order', JSON.stringify(this.cardOrder));
    } catch {}
  }

  private applyCachedOrder(): void {
    if (!this.rail || this.cardOrder.length === 0) return;
    this.cardOrder.forEach((id) => {
      const card = document.getElementById(id);
      if (card && this.rail) {
        this.rail.appendChild(card);
      }
    });

    this.pinnedCards.forEach((id) => {
      const card = document.getElementById(id);
      if (card) {
        card.classList.add('is-pinned');
        const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
        if (pinBtn) pinBtn.classList.add('active');
      }
    });
  }

  private togglePin(cardId: string): void {
    const card = document.getElementById(cardId);
    if (!card) return;

    const isPinned = this.pinnedCards.has(cardId);
    if (isPinned) {
      this.pinnedCards.delete(cardId);
      card.classList.remove('is-pinned');
    } else {
      this.pinnedCards.add(cardId);
      card.classList.add('is-pinned');
      if (this.rail && this.rail.firstElementChild) {
        this.rail.insertBefore(card, this.rail.firstElementChild);
      }
    }

    const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
    if (pinBtn) pinBtn.classList.toggle('active', !isPinned);

    try {
      localStorage.setItem('weather_card_pinned', JSON.stringify(Array.from(this.pinnedCards)));
    } catch {}

    this.saveCardOrder();
  }

  public resetLayout(): void {
    try {
      localStorage.removeItem('weather_card_order');
      localStorage.removeItem('weather_card_pinned');
    } catch {}

    this.pinnedCards.clear();
    this.cardOrder = [];

    const defaultIds = [
      'card-current',
      'card-hourly',
      'card-forecast',
      'card-atmosphere',
      'card-solar-lunar',
      'card-air-uv',
    ];

    if (this.rail) {
      defaultIds.forEach((id) => {
        const card = document.getElementById(id);
        if (card) {
          card.classList.remove('is-pinned');
          const pinBtn = card.querySelector<HTMLElement>('.widget-pin-btn');
          if (pinBtn) pinBtn.classList.remove('active');
          this.rail?.appendChild(card);
        }
      });
    }
  }

  // ── Dynamic Liquid Glass Lighting Engine ──────────────────────
  private initDynamicLiquidGlass(): void {
    this.targetLightX = window.innerWidth * 0.5;
    this.targetLightY = window.innerHeight * 0.4;
    this.lightX = this.targetLightX;
    this.lightY = this.targetLightY;

    window.addEventListener(
      'pointermove',
      (e) => {
        this.targetLightX = e.clientX;
        this.targetLightY = e.clientY;
        this.isPointerInside = true;
      },
      { passive: true },
    );

    window.addEventListener('pointerleave', () => {
      this.isPointerInside = false;
    });

    const updateLights = () => {
      if (!this.isPointerInside) {
        // Dynamic ambient light source orbit
        this.orbitAngle += 0.016;
        const radius = 220;
        const cx = window.innerWidth * 0.5;
        const cy = window.innerHeight * 0.4;
        this.targetLightX = cx + Math.cos(this.orbitAngle) * radius;
        this.targetLightY = cy + Math.sin(this.orbitAngle * 0.8) * (radius * 0.7);
      }

      // Smooth dampening
      this.lightX += (this.targetLightX - this.lightX) * 0.12;
      this.lightY += (this.targetLightY - this.lightY) * 0.12;

      const cards = document.querySelectorAll<HTMLElement>('.weather-card');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardX = this.lightX - rect.left;
        const cardY = this.lightY - rect.top;

        card.style.setProperty('--light-x', `${cardX.toFixed(1)}px`);
        card.style.setProperty('--light-y', `${cardY.toFixed(1)}px`);
      });

      this.shineFrameId = requestAnimationFrame(updateLights);
    };

    if (this.shineFrameId === null) {
      this.shineFrameId = requestAnimationFrame(updateLights);
    }
  }

  // ── Hyper-Realistic Animated ASCII Doppler Radar Engine ──────
  private initAsciiRadar(): void {
    this.asciiCanvas = document.getElementById('asciiRadarCanvas') as HTMLCanvasElement | null;
    if (!this.asciiCanvas) return;

    this.asciiCtx = this.asciiCanvas.getContext('2d');

    // Generate streamline wind particles
    this.windStreamlines = [];
    for (let i = 0; i < 44; i++) {
      this.windStreamlines.push({
        x: Math.random() * 60,
        y: Math.random() * 14,
        speed: 0.35 + Math.random() * 0.55,
        len: 3 + Math.floor(Math.random() * 5),
        hue: Math.random(),
      });
    }

    const updateCanvasSize = () => {
      if (!this.asciiCanvas) return;
      const rect = this.asciiCanvas.getBoundingClientRect();
      if (rect.width > 40) {
        this.asciiCanvas.width = Math.floor(rect.width);
        this.asciiCanvas.height = Math.floor(rect.height || 135);
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    // Interactive cursor radar wave disturbance
    this.asciiCanvas.addEventListener('mousemove', (e) => {
      const rect = this.asciiCanvas!.getBoundingClientRect();
      this.radarMouseX = e.clientX - rect.left;
      this.radarMouseY = e.clientY - rect.top;
    });
    this.asciiCanvas.addEventListener('mouseleave', () => {
      this.radarMouseX = -100;
      this.radarMouseY = -100;
    });

    if (this.isOpen) {
      this.startAsciiRadar();
    }
  }

  private startAsciiRadar(): void {
    if (this.asciiFrameId !== null) return;
    const animate = (timestamp: number) => {
      this.renderAsciiRadar(timestamp);
      this.asciiFrameId = requestAnimationFrame(animate);
    };
    this.asciiFrameId = requestAnimationFrame(animate);
  }

  private stopAsciiRadar(): void {
    if (this.asciiFrameId !== null) {
      cancelAnimationFrame(this.asciiFrameId);
      this.asciiFrameId = null;
    }
  }

  private renderAsciiRadar(timestamp: number): void {
    if (!this.asciiCanvas || !this.asciiCtx) return;
    const ctx = this.asciiCtx;
    const canvas = this.asciiCanvas;

    // Track FPS
    this.frameCount++;
    if (timestamp - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = timestamp;
      const fpsEl = document.getElementById('asciiRadarFps');
      if (fpsEl) fpsEl.textContent = `${this.currentFps} FPS`;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Deep dark phosphor terminal background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, width, height);

    // Dynamic grid dimensions
    const charW = 8;
    const charH = 11;
    const cols = Math.floor(width / charW);
    const rows = Math.floor(height / charH);

    const centerX = cols / 2;
    const centerY = rows / 2;

    this.radarSweepAngle = (this.radarSweepAngle + this.radarSweepSpeed) % (Math.PI * 2);
    const azimuthDeg = Math.round((this.radarSweepAngle * 180) / Math.PI);
    const azimuthEl = document.getElementById('asciiRadarAzimuth');
    if (azimuthEl) {
      azimuthEl.textContent = `AZ: ${azimuthDeg.toString().padStart(3, '0')}°`;
    }

    ctx.font = '700 9.5px "JetBrains Mono", ui-monospace, Menlo, Monaco, monospace';
    ctx.textBaseline = 'top';

    const time = timestamp * 0.001;
    const GLYPHS = [' ', '·', ':', '+', 'x', '*', '#', '%', '@', '█'];

    if (this.activeHourlyMode === 'temp') {
      // ════════════════════════════════════════════════════════════
      // THERMAL FLUID SPECTRUM (Hyper-Realistic Neon Gradient)
      // ════════════════════════════════════════════════════════════
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c - centerX;
          const dy = (r - centerY) * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cellAngle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

          // Angle distance to sweep beam
          const angleDiff = (this.radarSweepAngle - cellAngle + Math.PI * 2) % (Math.PI * 2);
          const sweepGlow = Math.exp(-angleDiff * 3.6);

          // Multi-harmonic thermal fluid simulation
          const fluid =
            Math.sin(c * 0.12 + time * 1.8) * 0.32 +
            Math.cos(r * 0.22 - time * 1.3) * 0.26 +
            Math.sin((c + r) * 0.09 + time * 1.5) * 0.24 +
            Math.cos(dist * 0.16 - time * 2.1) * 0.18;

          let val = 0.5 + fluid * 0.5;

          // Interactive cursor heat disturbance
          if (this.radarMouseX >= 0) {
            const mdx = c * charW - this.radarMouseX;
            const mdy = r * charH - this.radarMouseY;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (mdist < 75) {
              val += (1 - mdist / 75) * 0.45 * Math.sin(mdist * 0.3 - time * 8);
            }
          }

          val = Math.min(Math.max(val + sweepGlow * 0.32, 0), 1);
          const glyphIdx = Math.floor(val * (GLYPHS.length - 1));
          const char = GLYPHS[glyphIdx];
          if (char === ' ') continue;

          // Hyper-Realistic Vivid Thermal Palette:
          // Cyan (#00f5ff) -> Electric Blue (#3b82f6) -> Bright Gold (#ffb700) -> Plasma Orange (#ff5500) -> Infrared Magenta (#ff007f)
          let col = '#00f5ff';
          if (val > 0.84) col = '#ff007f';
          else if (val > 0.68) col = '#ff4500';
          else if (val > 0.52) col = '#ffb700';
          else if (val > 0.35) col = '#38bdf8';
          else col = '#3b82f6';

          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = val > 0.7 ? 6 : 0;
          ctx.fillText(char, c * charW, r * charH);
        }
      }
    } else if (this.activeHourlyMode === 'rain') {
      // ════════════════════════════════════════════════════════════
      // DOPPLER PRECIPITATION REFLECTIVITY RADAR
      // ════════════════════════════════════════════════════════════
      const stormCells = [
        {
          x: centerX - 12 + Math.cos(time * 0.6) * 4,
          y: centerY - 2 + Math.sin(time * 0.5) * 3,
          intensity: 0.95,
        },
        {
          x: centerX + 14 + Math.sin(time * 0.4) * 5,
          y: centerY + 2 + Math.cos(time * 0.7) * 2,
          intensity: 0.75,
        },
        {
          x: centerX - 4 + Math.cos(time * 0.3) * 6,
          y: centerY + 4 + Math.sin(time * 0.8) * 3,
          intensity: 0.85,
        },
      ];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = c - centerX;
          const dy = (r - centerY) * 1.5;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const cellAngle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

          const angleDiff = (this.radarSweepAngle - cellAngle + Math.PI * 2) % (Math.PI * 2);
          const sweepGlow = Math.exp(-angleDiff * 4.2);

          let rainVal = 0;
          for (const cell of stormCells) {
            const cdx = c - cell.x;
            const cdy = r - cell.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < 14) {
              const falloff = 1 - cdist / 14;
              rainVal += falloff * falloff * cell.intensity;
            }
          }

          const noise =
            (Math.sin(c * 0.4 + r * 0.3 + time * 3) + Math.cos(c * 0.2 - r * 0.5 - time * 2)) *
            0.14;
          const val = Math.min(Math.max(rainVal + noise + sweepGlow * 0.38, 0), 1);

          // Range rings
          const isRing =
            Math.abs(dist - 10) < 0.6 || Math.abs(dist - 20) < 0.6 || Math.abs(dist - 30) < 0.6;
          if (isRing && val < 0.2) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.shadowBlur = 0;
            ctx.fillText('·', c * charW, r * charH);
            continue;
          }

          const glyphIdx = Math.floor(val * (GLYPHS.length - 1));
          const char = GLYPHS[glyphIdx];
          if (char === ' ') continue;

          // Doppler Precipitation Scale:
          // Cyan (#06b6d4) -> Emerald (#10b981) -> Yellow (#facc15) -> Crimson (#ef4444) -> Hail Purple (#d946ef)
          let col = '#10b981';
          if (val > 0.85) col = '#d946ef';
          else if (val > 0.68) col = '#ef4444';
          else if (val > 0.48) col = '#facc15';
          else if (val > 0.28) col = '#22c55e';
          else col = '#06b6d4';

          ctx.fillStyle = col;
          ctx.shadowColor = col;
          ctx.shadowBlur = val > 0.6 ? 5 : 0;
          ctx.fillText(char, c * charW, r * charH);
        }
      }
    } else {
      // ════════════════════════════════════════════════════════════
      // AERODYNAMIC VECTOR STREAMLINES (Wind Field)
      // ════════════════════════════════════════════════════════════
      for (const p of this.windStreamlines) {
        p.x += p.speed;
        if (p.x > cols) {
          p.x = 0;
          p.y = Math.random() * rows;
        }

        const waveY = p.y + Math.sin(p.x * 0.15 + time * 2) * 1.5;
        const c = Math.floor(p.x);
        const r = Math.floor(waveY);
        if (c >= 0 && c < cols && r >= 0 && r < rows) {
          for (let l = 0; l < p.len; l++) {
            const tc = c - l;
            if (tc >= 0 && tc < cols) {
              const col = l === 0 ? '#ffffff' : p.hue > 0.5 ? '#38bdf8' : '#4ade80';
              ctx.fillStyle = col;
              ctx.shadowColor = col;
              ctx.shadowBlur = l === 0 ? 8 : 2;
              const ch = l === 0 ? '>' : l === 1 ? '=' : '-';
              ctx.fillText(ch, tc * charW, r * charH);
            }
          }
        }
      }
    }

    ctx.shadowBlur = 0;
  }

  // ── Hourly Mode Switch ─────────────────────────────────────────
  public setHourlyMode(mode: 'temp' | 'rain' | 'wind'): void {
    this.activeHourlyMode = mode;
    const tabs = document.querySelectorAll<HTMLButtonElement>('.weather-cond-tab');
    tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-tab') === mode);
    });

    const modeLabel = document.getElementById('asciiRadarModeLabel');
    const metricRange = document.getElementById('asciiMetricRange');
    const metricReflectivity = document.getElementById('asciiMetricReflectivity');
    const metricTurbulence = document.getElementById('asciiMetricTurbulence');
    const metricCells = document.getElementById('asciiMetricCells');

    if (mode === 'temp') {
      if (modeLabel) modeLabel.textContent = 'ASCII RADAR // THERMAL FLUID SPECTRUM';
      if (metricRange) metricRange.textContent = 'RANGE: 160 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'SENSOR: INFRARED [IR]';
      if (metricTurbulence) metricTurbulence.textContent = 'TURBULENCE: NOMINAL';
      if (metricCells) metricCells.textContent = '4 THERMAL CELLS';
    } else if (mode === 'rain') {
      if (modeLabel) modeLabel.textContent = 'DOPPLER RADAR // PRECIPITATION REFLECTIVITY';
      if (metricRange) metricRange.textContent = 'RANGE: 120 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'REFLECTIVITY: 46 dBZ';
      if (metricTurbulence) metricTurbulence.textContent = 'VORTICITY: 0.12 s⁻¹';
      if (metricCells) metricCells.textContent = '6 RAIN CELLS ACTIVE';
    } else if (mode === 'wind') {
      if (modeLabel) modeLabel.textContent = 'AERODYNAMIC RADAR // VECTOR STREAMLINES';
      if (metricRange) metricRange.textContent = 'RANGE: 200 KM';
      if (metricReflectivity) metricReflectivity.textContent = 'VELOCITY: 18 m/s';
      if (metricTurbulence) metricTurbulence.textContent = 'SHEAR: 4.2 kts';
      if (metricCells) metricCells.textContent = 'VORTEX: STABLE';
    }

    this.renderHourlyRail();
  }

  // ── ASCII Game & Telemetry Bay Views ───────────────────────────
  public showAsciiGameBay(reason = 'LOCATION SIGNAL LOST'): void {
    this.isAsciiBayActive = true;
    if (this.rail) this.rail.style.display = 'none';
    const gameBay = document.getElementById('weatherAsciiGameBay');
    if (gameBay) gameBay.style.display = 'flex';

    const toggleText = document.getElementById('weatherAsciiToggleText');
    if (toggleText) toggleText.textContent = 'TELEMETRY';

    const headerTag = document.getElementById('weatherStationHeaderTag');
    if (headerTag) {
      headerTag.textContent = '// STATION MET-01 [STRATOS PROBE ESCORT PROTOCOL]';
    }

    const statusTag = document.getElementById('asciiGameStatusTag');
    if (statusTag) {
      statusTag.textContent = `// STRATOS BEACON: ${reason.toUpperCase()}`;
    }

    this.stopAsciiRadar();
    this.asciiGame?.start();
  }

  public showTelemetryBay(): void {
    this.isAsciiBayActive = false;
    if (this.rail) this.rail.style.display = 'grid';
    const gameBay = document.getElementById('weatherAsciiGameBay');
    if (gameBay) gameBay.style.display = 'none';

    const toggleText = document.getElementById('weatherAsciiToggleText');
    if (toggleText) toggleText.textContent = 'STRATOS';

    const headerTag = document.getElementById('weatherStationHeaderTag');
    if (headerTag) {
      headerTag.textContent = `// STATION MET-01 [${this.state.city.toUpperCase()}]`;
    }

    this.asciiGame?.pause();
    this.startAsciiRadar();
  }

  public toggleAsciiGameMode(): void {
    if (this.isAsciiBayActive) {
      this.showTelemetryBay();
    } else {
      this.showAsciiGameBay('MANUAL PROBE ESCORT INITIATED');
    }
  }

  // ── Client Location Auto-Detection & Geolocation Pipeline ──────
  public async locateUserAndFetch(force = false): Promise<void> {
    const headerTag = document.getElementById('weatherStationHeaderTag');
    if (headerTag) headerTag.textContent = '// STATION MET-01 [ACQUIRING GEOLOCATION...]';

    try {
      const loc = await this.detectUserLocation(force);
      if (loc) {
        this.currentLat = loc.lat;
        this.currentLon = loc.lon;
        this.isLocationDetermined = true;
        try {
          localStorage.setItem('client_geo_lat', loc.lat.toString());
          localStorage.setItem('client_geo_lon', loc.lon.toString());
          localStorage.setItem('client_geo_city', loc.city);
        } catch {
          // ignore storage errors
        }
        await this.fetchLiveTelemetry(loc.lat, loc.lon, loc.city);
        this.showTelemetryBay();
      } else {
        throw new Error('Location acquisition unresolved');
      }
    } catch {
      this.isLocationDetermined = false;
      this.showAsciiGameBay('// STRATOS SATELLITE BEACON: OFFLINE // LOCATION INDETERMINATE');
    }
  }

  private async detectUserLocation(
    force = false,
  ): Promise<{ lat: number; lon: number; city: string } | null> {
    // Only detect user location when easter egg is unlocked and NOT on initial visit
    if (!this.isEasterEggUnlocked()) {
      return null;
    }

    // 1. Try browser HTML5 geolocation first (prompts permission dialog if unlocked)
    const browserLoc = await this.tryBrowserGeolocation(6000);
    if (browserLoc) {
      const city = await this.reverseGeocode(browserLoc.lat, browserLoc.lon);
      return {
        lat: browserLoc.lat,
        lon: browserLoc.lon,
        city: city || 'LOCAL STATION',
      };
    }

    // 2. Try IP Geolocation fallback
    const ipLoc = await this.tryIpGeolocation(5000);
    if (ipLoc) {
      return ipLoc;
    }

    // 3. Fallback to cached client location if valid and not Bengaluru baseline
    if (!force) {
      try {
        const savedLat = parseFloat(localStorage.getItem('client_geo_lat') || '');
        const savedLon = parseFloat(localStorage.getItem('client_geo_lon') || '');
        const savedCity = localStorage.getItem('client_geo_city');
        if (
          !isNaN(savedLat) &&
          !isNaN(savedLon) &&
          savedCity &&
          savedCity.toLowerCase() !== 'bengaluru'
        ) {
          return { lat: savedLat, lon: savedLon, city: savedCity };
        }
      } catch {
        // ignore storage errors
      }
    }

    return null;
  }

  private tryBrowserGeolocation(timeoutMs = 6000): Promise<{ lat: number; lon: number } | null> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return Promise.resolve(null);
    }
    // Ask for location permission ONLY when easter egg is unlocked and NOT on initial visit
    if (!this.isEasterEggUnlocked()) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve(null);
        }
      }, timeoutMs);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            });
          }
        },
        () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve(null);
          }
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 },
      );
    });
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { signal: controller.signal },
      );
      clearTimeout(id);
      if (!res.ok) return null;
      const data = await res.json();
      return data.city || data.locality || data.principalSubdivision || null;
    } catch {
      return null;
    }
  }

  private async tryIpGeolocation(
    timeoutMs = 5000,
  ): Promise<{ lat: number; lon: number; city: string } | null> {
    // Attempt A: ipwho.is
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        if (
          data.success !== false &&
          typeof data.latitude === 'number' &&
          typeof data.longitude === 'number'
        ) {
          return {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city || data.region || data.country || 'LOCAL STATION',
          };
        }
      }
    } catch {
      // Continue to Attempt B
    }

    // Attempt B: geojs.io
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lon = parseFloat(data.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          return {
            lat,
            lon,
            city: data.city || data.country || 'LOCAL STATION',
          };
        }
      }
    } catch {
      // Unresolved
    }

    return null;
  }

  // ── Telemetry Fetch & Parsing ──────────────────────────────────
  private async fetchLiveTelemetry(
    customLat?: number,
    customLon?: number,
    customCity?: string,
  ): Promise<void> {
    try {
      const lat = customLat ?? this.currentLat;
      const lon = customLon ?? this.currentLon;
      const city = customCity ?? this.state.city;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      this.currentLat = lat;
      this.currentLon = lon;
      this.parseOpenMeteoData(city, data);
      this.renderTelemetry();
    } catch {
      if (!this.isLocationDetermined) {
        this.showAsciiGameBay('TELEMETRY OFFLINE // SATELLITE COMM TIMEOUT');
      } else {
        this.renderTelemetry();
      }
    }
  }

  private parseOpenMeteoData(city: string, data: any): void {
    const cur = data.current || {};
    const dly = data.daily || {};
    const hly = data.hourly || {};

    const code = cur.weather_code ?? 2;
    const condInfo = this.getWeatherInfoByCode(code);

    const temp = Math.round(cur.temperature_2m ?? 25);
    const feelsLike = Math.round(cur.apparent_temperature ?? temp);
    const high = Math.round(dly.temperature_2m_max?.[0] ?? temp + 4);
    const low = Math.round(dly.temperature_2m_min?.[0] ?? temp - 6);
    const windSpeed = Math.round(cur.wind_speed_10m ?? 7);
    const windDirection = Math.round(cur.wind_direction_10m ?? 207);
    const windGusts = Math.round(cur.wind_gusts_10m ?? 14);
    const humidity = Math.round(cur.relative_humidity_2m ?? 48);
    const pressure = Math.round((cur.surface_pressure ?? 1010) * 0.750062);
    const uv = Math.round(dly.uv_index_max?.[0] ?? 8);

    const dewPoint = Math.round(temp - (100 - humidity) / 5);

    const rawSunrise = dly.sunrise?.[0] ? dly.sunrise[0].split('T')[1]?.slice(0, 5) : '06:12';
    const rawSunset = dly.sunset?.[0] ? dly.sunset[0].split('T')[1]?.slice(0, 5) : '17:53';

    // Parse Hourly
    const hourly: HourlyForecastItem[] = [];
    const nowHour = new Date().getHours();
    const times = hly.time || [];
    const hTemps = hly.temperature_2m || [];
    const hCodes = hly.weather_code || [];
    const hPrecip = hly.precipitation_probability || [];
    const hWinds = hly.wind_speed_10m || [];

    for (let i = 0; i < times.length && hourly.length < 12; i++) {
      const date = new Date(times[i]);
      if (date.getHours() >= nowHour || i >= nowHour) {
        const isNow = hourly.length === 0;
        const timeStr = isNow ? 'Now' : date.getHours().toString().padStart(2, '0');
        const hCode = hCodes[i] ?? 0;
        const info = this.getWeatherInfoByCode(hCode, date.getHours());
        hourly.push({
          time: timeStr,
          temp: Math.round(hTemps[i] ?? temp),
          icon: info.icon,
          precipPct: Math.round(hPrecip[i] ?? 0),
          windSpeed: Math.round(hWinds[i] ?? windSpeed),
        });
      }
    }

    // Parse Daily
    const daily: DailyForecastItem[] = [];
    const dTimes = dly.time || [];
    const dCodes = dly.weather_code || [];
    const dMax = dly.temperature_2m_max || [];
    const dMin = dly.temperature_2m_min || [];
    const dPrecip = dly.precipitation_probability_max || [];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < Math.min(dTimes.length, 7); i++) {
      const date = new Date(dTimes[i]);
      const dayStr = i === 0 ? 'Today' : dayNames[date.getDay()];
      const dCode = dCodes[i] ?? 0;
      const info = this.getWeatherInfoByCode(dCode, 12);
      daily.push({
        day: dayStr,
        icon: info.icon,
        min: Math.round(dMin[i] ?? low),
        max: Math.round(dMax[i] ?? high),
        precipPct: Math.round(dPrecip[i] ?? 0),
      });
    }

    // Moon calculation
    const moon = this.calculateMoonPhase(new Date());

    this.state = {
      city,
      temp,
      condition: condInfo.label,
      high,
      low,
      feelsLike,
      windSpeed,
      windDirection,
      windDirText: `${windDirection}° ${this.getCardinalDirection(windDirection)}`,
      windGusts,
      humidity,
      dewPoint,
      pressure,
      uvIndex: uv,
      uvCategory: uv >= 8 ? 'VERY HIGH' : uv >= 6 ? 'HIGH' : uv >= 3 ? 'MODERATE' : 'LOW',
      aqi: 136,
      aqiCategory: 'MODERATE',
      sunrise: rawSunrise,
      sunset: rawSunset,
      moonIllum: moon.illumination,
      moonPhase: moon.phaseName,
      hourly: hourly.length > 0 ? hourly : DEFAULT_WEATHER_STATE.hourly,
      daily: daily.length > 0 ? daily : DEFAULT_WEATHER_STATE.daily,
    };
  }

  private getWeatherInfoByCode(code: number, hour = 12): { label: string; icon: string } {
    const isNight = hour < 6 || hour >= 18;
    switch (code) {
      case 0:
        return { label: 'Clear Sky', icon: isNight ? 'clear-night' : 'sunny' };
      case 1:
        return { label: 'Mainly Clear', icon: isNight ? 'clear-night' : 'sunny' };
      case 2:
        return { label: 'Partly Cloudy', icon: isNight ? 'partly-cloudy-night' : 'partly-cloudy' };
      case 3:
        return { label: 'Overcast', icon: 'cloudy' };
      case 45:
      case 48:
        return { label: 'Fog', icon: 'fog' };
      case 51:
      case 53:
      case 55:
        return { label: 'Drizzle', icon: 'rain' };
      case 61:
      case 63:
      case 65:
        return { label: 'Rain', icon: 'rain' };
      case 71:
      case 73:
      case 75:
        return { label: 'Snow', icon: 'snow' };
      case 80:
      case 81:
      case 82:
        return { label: 'Rain Showers', icon: 'rain' };
      case 95:
      case 96:
      case 99:
        return { label: 'Thunderstorm', icon: 'storm' };
      default:
        return { label: 'Fair', icon: isNight ? 'clear-night' : 'partly-cloudy' };
    }
  }

  private getCardinalDirection(deg: number): string {
    const val = Math.floor(deg / 22.5 + 0.5);
    const compass = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    return compass[val % 16];
  }

  private calculateMoonPhase(date: Date): {
    phaseName: string;
    illumination: number;
    phaseFraction: number;
    nextPhase: string;
    synodicDay: number;
  } {
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const synodicMonth = 29.53058867;
    const diffDays = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phaseFraction = (diffDays % synodicMonth) / synodicMonth;
    const normalized = (phaseFraction + 1) % 1;
    const synodicDay = Math.max(1, Math.round(normalized * synodicMonth));

    const illumination = Math.round(0.5 * (1 - Math.cos(2 * Math.PI * normalized)) * 100);

    let phaseName = 'New Moon';
    if (normalized < 0.03 || normalized > 0.97) phaseName = 'New Moon';
    else if (normalized < 0.22) phaseName = 'Waxing Crescent';
    else if (normalized < 0.28) phaseName = 'First Quarter';
    else if (normalized < 0.47) phaseName = 'Waxing Gibbous';
    else if (normalized < 0.53) phaseName = 'Full Moon';
    else if (normalized < 0.72) phaseName = 'Waning Gibbous';
    else if (normalized < 0.78) phaseName = 'Last Quarter';
    else phaseName = 'Waning Crescent';

    // Calculate countdown to next major phase milestone
    const milestones = [
      { name: 'First Quarter', target: 0.25 },
      { name: 'Full Moon', target: 0.5 },
      { name: 'Last Quarter', target: 0.75 },
      { name: 'New Moon', target: 1.0 },
    ];
    let nextMs = milestones.find((m) => m.target > normalized) || milestones[3];
    let daysToNext = Math.round((nextMs.target - normalized) * synodicMonth);
    if (daysToNext <= 0) daysToNext = 1;
    const nextPhase = `${nextMs.name.toUpperCase()} IN ${daysToNext}D`;

    return { phaseName, illumination, phaseFraction: normalized, nextPhase, synodicDay };
  }

  // ── Render High-Fidelity 3D Vector Moon Phase ──────────────────
  private renderMoonPhaseSphere(
    phaseFraction: number,
    illumination: number,
    phaseName: string,
  ): string {
    const cx = 27;
    const cy = 27;
    const R = 23;
    const p = phaseFraction;

    let litPath = '';
    if (illumination <= 2) {
      litPath = ''; // New moon: purely dark with earthshine
    } else if (illumination >= 98) {
      litPath = `M ${cx - R} ${cy} A ${R} ${R} 0 1 0 ${cx + R} ${cy} A ${R} ${R} 0 1 0 ${cx - R} ${cy}`;
    } else {
      const rx = Math.max(0.1, R * Math.abs(Math.cos(2 * Math.PI * p)));
      if (p < 0.25) {
        // Waxing Crescent: right outer arc, terminator curves right
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 0 ${cx} ${cy - R} Z`;
      } else if (p < 0.5) {
        // Waxing Gibbous: right outer arc, terminator bulges left
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 1 ${cx} ${cy - R} Z`;
      } else if (p < 0.75) {
        // Waning Gibbous: left outer arc, terminator bulges right
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 0 ${cx} ${cy - R} Z`;
      } else {
        // Waning Crescent: left outer arc, terminator curves left
        litPath = `M ${cx} ${cy - R} A ${R} ${R} 0 0 0 ${cx} ${cy + R} A ${rx.toFixed(2)} ${R} 0 0 1 ${cx} ${cy - R} Z`;
      }
    }

    return `<svg viewBox="0 0 54 54" width="52" height="52" class="moon-sphere-svg" role="img" aria-label="${phaseName}, ${illumination}% illuminated">
      <defs>
        <clipPath id="lunarSphereClip">
          <circle cx="${cx}" cy="${cy}" r="${R}" />
        </clipPath>
        <clipPath id="lunarLitClip">
          <path d="${litPath}" />
        </clipPath>
        <radialGradient id="darkMoonGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="65%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </radialGradient>
        <radialGradient id="litMoonGrad" cx="${p < 0.5 ? '65%' : '35%'}" cy="32%" r="72%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="40%" stop-color="#f8fafc" />
          <stop offset="75%" stop-color="#e2e8f0" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </radialGradient>
        <radialGradient id="sphereShadow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stop-color="transparent" />
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0.45)" />
        </radialGradient>
      </defs>

      <!-- Futuristic Orbital HUD Telemetry Rings -->
      <circle cx="${cx}" cy="${cy}" r="${R + 3.5}" fill="none" stroke="var(--accent)" stroke-width="0.75" stroke-dasharray="3 4" opacity="0.45" />
      <circle cx="${cx}" cy="${cy}" r="${R + 1.5}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2" />
      <line x1="${cx}" y1="${cy - R - 4}" x2="${cx}" y2="${cy - R - 1}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx}" y1="${cy + R + 1}" x2="${cx}" y2="${cy + R + 4}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx - R - 4}" y1="${cy}" x2="${cx - R - 1}" y2="${cy}" stroke="var(--accent)" stroke-width="1.2" />
      <line x1="${cx + R + 1}" y1="${cy}" x2="${cx + R + 4}" y2="${cy}" stroke="var(--accent)" stroke-width="1.2" />

      <!-- Soft Atmospheric Moonlight Glow -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />

      <!-- Base Dark Moon Sphere (Earthshine with Topography) -->
      <g clip-path="url(#lunarSphereClip)">
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#darkMoonGrad)" />

        <!-- Earthshine Maria (Basaltic Plains on unlit side) -->
        <ellipse cx="33" cy="23" rx="4.5" ry="3.8" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="31" cy="17" rx="4" ry="3.5" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="22" cy="16" rx="5" ry="4.5" fill="rgba(255, 255, 255, 0.06)" />
        <ellipse cx="39" cy="20" rx="2.5" ry="3" fill="rgba(255, 255, 255, 0.05)" />
        <circle cx="25" cy="37" r="1.2" fill="rgba(255, 255, 255, 0.1)" />

        <!-- Illuminated Sunlit Moon Portion (Clipped to Mathematical Terminator) -->
        ${
          litPath
            ? `
        <g clip-path="url(#lunarLitClip)">
          <!-- Lit lunar surface base -->
          <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#litMoonGrad)" />

          <!-- High-Contrast Lunar Maria on Lit Face -->
          <path d="M 30 22 Q 35 20 37 24 Q 35 28 31 26 Z" fill="#94a3b8" opacity="0.45" />
          <circle cx="32" cy="17" r="3.5" fill="#94a3b8" opacity="0.45" />
          <circle cx="22" cy="15" r="4.8" fill="#94a3b8" opacity="0.45" />
          <path d="M 15 19 Q 19 26 17 35 Q 13 31 14 20 Z" fill="#94a3b8" opacity="0.42" />
          <ellipse cx="41" cy="20" rx="2.2" ry="3.2" fill="#94a3b8" opacity="0.45" />
          <ellipse cx="23" cy="31" rx="3.2" ry="2.8" fill="#94a3b8" opacity="0.4" />

          <!-- Tycho Impact Crater & Ejecta Rays -->
          <circle cx="26" cy="39" r="1.2" fill="#ffffff" />
          <line x1="26" y1="39" x2="32" y2="45" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />
          <line x1="26" y1="39" x2="19" y2="43" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />
          <line x1="26" y1="39" x2="25" y2="32" stroke="#ffffff" stroke-width="0.5" opacity="0.5" />

          <!-- Copernicus Crater -->
          <circle cx="21" cy="23" r="1" fill="#ffffff" opacity="0.85" />
        </g>
        `
            : ''
        }

        <!-- 3D Spherical Edge Shadow Overlay -->
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#sphereShadow)" />
      </g>

      <!-- Outer Limb Ring -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.25" />
    </svg>`;
  }

  // ── Render Modern Minimalist SVG Weather Glyphs ───────────────
  private getIconGlyph(icon: string, size = 20): string {
    const s = size;
    switch (icon) {
      case 'sunny':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-sunny">
          <circle cx="12" cy="12" r="4.2" fill="rgba(245, 158, 11, 0.22)" stroke="#f59e0b" stroke-width="1.8"/>
          <path d="M12 2.5v2.2M12 19.3v2.2M3.7 12h2.2M18.1 12h2.2M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M5.5 18.5l1.6-1.6M16.9 7.1l1.6-1.6" stroke="#f59e0b"/>
        </svg>`;

      case 'clear-night':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-night">
          <path d="M20.5 13.05A8.5 8.5 0 1 1 11 3.5a6.5 6.5 0 0 0 9.5 9.55z" fill="rgba(96, 165, 250, 0.18)" stroke="#60a5fa"/>
          <path d="M18.5 4.5l.3.9.9.3-.9.3-.3.9-.3-.9-.9-.3.9-.3z" fill="#93c5fd" stroke="none"/>
        </svg>`;

      case 'partly-cloudy':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-partly-cloudy">
          <circle cx="15.5" cy="8.5" r="3.2" fill="rgba(245, 158, 11, 0.28)" stroke="#f59e0b" stroke-width="1.6"/>
          <path d="M15.5 3.5v1.2M20.5 8.5h-1.2M19 5l-.9.9M12 7l-.8.8" stroke="#f59e0b" stroke-width="1.5"/>
          <path d="M16 19.5H7.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 16 19.5z" fill="rgba(var(--bg-rgb), 0.85)" stroke="var(--ink)"/>
        </svg>`;

      case 'partly-cloudy-night':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-partly-night">
          <path d="M17.5 6.5A4.5 4.5 0 0 1 14 3.2a4.5 4.5 0 1 0 4.8 5.6c-.4.4-.8.6-1.3.7z" fill="rgba(96, 165, 250, 0.22)" stroke="#60a5fa" stroke-width="1.5"/>
          <path d="M16.5 19.5H8a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 16.5 19.5z" fill="rgba(var(--bg-rgb), 0.85)" stroke="var(--ink)"/>
        </svg>`;

      case 'cloudy':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-cloudy">
          <path d="M7.5 9.5a4 4 0 0 1 7.4-1.8 3.5 3.5 0 0 1 3.1 3.5c0 .3-.05.6-.13.88" stroke="var(--ink-dim)" opacity="0.5" stroke-dasharray="2 2"/>
          <path d="M17 19.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 19.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
        </svg>`;

      case 'rain':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-rain">
          <path d="M17 15.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 15.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M8.5 18l-1 3.5M12.5 18l-1 3.5M16.5 18l-1 3.5" stroke="#38bdf8" stroke-width="1.8"/>
        </svg>`;

      case 'snow':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-snow">
          <path d="M17 15H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 15z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M9 19h.01M12 18h.01M12 21h.01M15 19h.01" stroke="#93c5fd" stroke-width="2.5"/>
        </svg>`;

      case 'storm':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="w-glyph w-glyph-storm">
          <path d="M17 14.5H6.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.32-1.78A3.75 3.75 0 0 1 17 14.5z" fill="rgba(var(--bg-rgb), 0.75)" stroke="var(--ink)"/>
          <path d="M12.5 14l-2 4h3l-1.5 4.5 4.5-5.5h-3z" fill="#f59e0b" stroke="#f59e0b" stroke-width="0.8" stroke-linejoin="miter"/>
        </svg>`;

      case 'fog':
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="w-glyph w-glyph-fog">
          <path d="M4 11h16M6 14.5h12M4 18h16M8 7.5h8" stroke="var(--ink-dim)" opacity="0.8"/>
        </svg>`;

      default:
        return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7">
          <circle cx="12" cy="12" r="5" fill="var(--accent)"/>
        </svg>`;
    }
  }

  private getHeroIconGlyph(condition: string): string {
    const c = condition.toLowerCase();
    const isNight = new Date().getHours() < 6 || new Date().getHours() >= 18;
    let iconKey = 'sunny';
    if (c.includes('rain') || c.includes('drizzle')) iconKey = 'rain';
    else if (c.includes('thunder') || c.includes('storm')) iconKey = 'storm';
    else if (c.includes('snow')) iconKey = 'snow';
    else if (c.includes('fog') || c.includes('mist')) iconKey = 'fog';
    else if (c.includes('partly')) iconKey = isNight ? 'partly-cloudy-night' : 'partly-cloudy';
    else if (c.includes('cloud') || c.includes('overcast')) iconKey = 'cloudy';
    else if (isNight) iconKey = 'clear-night';

    return this.getIconGlyph(iconKey, 54);
  }

  // ── Render DOM Elements ───────────────────────────────────────
  public renderTelemetry(): void {
    const s = this.state;

    const el = (id: string) => document.getElementById(id);
    const setText = (id: string, text: string | number) => {
      const node = el(id);
      if (node) node.textContent = String(text);
    };

    setText('weatherCity', s.city.toUpperCase());
    setText('weatherStationHeaderTag', `// STATION MET-01 [${s.city.toUpperCase()}]`);
    const latStr =
      this.currentLat >= 0
        ? `${this.currentLat.toFixed(2)}°N`
        : `${Math.abs(this.currentLat).toFixed(2)}°S`;
    const lonStr =
      this.currentLon >= 0
        ? `${this.currentLon.toFixed(2)}°E`
        : `${Math.abs(this.currentLon).toFixed(2)}°W`;
    setText('weatherCoords', `[${latStr}, ${lonStr}]`);
    setText('weatherBigTemp', s.temp);
    setText('weatherCondition', `[ STATUS: ${s.condition.toUpperCase()} ]`);
    setText('weatherHigh', `HIGH ${s.high}°C`);
    setText('weatherLow', `LOW ${s.low}°C`);
    setText('weatherFeelsLike', `${s.feelsLike}°C`);
    setText('weatherWindSpeed', `${s.windSpeed} km/h`);
    setText('weatherWindSpeedCard', `${s.windSpeed} km/h`);
    setText('weatherWindDirText', s.windDirText);
    setText('weatherWindGusts', `GUSTS ${s.windGusts} km/h`);
    setText('weatherHumidity', `${s.humidity}%`);
    setText('weatherPressureVal', `${s.pressure} mmHg`);
    setText('weatherPressure', s.pressure);
    setText('weatherDewPointVal', `${s.dewPoint}°C`);
    setText('weatherSunrise', s.sunrise);
    setText('weatherSunset', s.sunset);
    setText('moonPhaseName', s.moonPhase.toUpperCase());
    setText('moonIllumPct', `${s.moonIllum}%`);
    setText('weatherAqiVal', s.aqi);
    setText('weatherAqiCategory', s.aqiCategory);
    setText('weatherUvVal', s.uvIndex);
    setText('weatherUvCategory', s.uvCategory);

    // Weather Condition Hero Glyph (Large Minimalist Icon)
    const glyphWrap = el('weatherConditionGlyph');
    if (glyphWrap) {
      glyphWrap.innerHTML = this.getHeroIconGlyph(s.condition);
    }

    // High-Fidelity Photorealistic Vector Moon Sphere
    const moonWrap = el('moonRenderWrap');
    const moon = this.calculateMoonPhase(new Date());
    if (moonWrap) {
      moonWrap.innerHTML = this.renderMoonPhaseSphere(
        moon.phaseFraction,
        moon.illumination,
        moon.phaseName,
      );
    }
    setText('moonNextPhase', moon.nextPhase);

    // Compass Needle Rotation (Center: 50 50)
    const needle = el('windNeedleGroup');
    if (needle) {
      needle.setAttribute('transform', `rotate(${s.windDirection} 50 50)`);
    }

    // Pressure Gauge Arc Fill
    const pressureArc = el('pressureArcFill');
    if (pressureArc) {
      const fillLen = Math.min(Math.max(((s.pressure - 700) / 100) * 190, 25), 190);
      pressureArc.setAttribute('stroke-dasharray', `${fillLen.toFixed(0)} 260`);
    }

    // Solar Arc Dot Position (ViewBox 0 0 140 56)
    const solarDot = el('solarDot');
    if (solarDot) {
      const now = new Date();
      const curHours = now.getHours() + now.getMinutes() / 60;
      const srParts = s.sunrise.split(':');
      const ssParts = s.sunset.split(':');
      const sr = parseInt(srParts[0], 10) + parseInt(srParts[1] || '0', 10) / 60;
      const ss = parseInt(ssParts[0], 10) + parseInt(ssParts[1] || '0', 10) / 60;

      let pct = 0.5;
      if (curHours >= sr && curHours <= ss) {
        pct = (curHours - sr) / (ss - sr);
      } else if (curHours > ss) {
        pct = 1;
      } else {
        pct = 0;
      }
      const x = 10 + pct * 120;
      const y = (1 - pct) * (1 - pct) * 44 + 2 * (1 - pct) * pct * 4 + pct * pct * 44;
      solarDot.setAttribute('cx', x.toFixed(1));
      solarDot.setAttribute('cy', y.toFixed(1));
    }

    // AQI Pip Position
    const aqiPip = el('weatherAqiPip');
    if (aqiPip) {
      const pct = Math.min(Math.max((s.aqi / 300) * 100, 4), 96);
      aqiPip.style.left = `${pct}%`;
    }

    // UV Pip Position
    const uvPip = el('weatherUvPip');
    if (uvPip) {
      const pct = Math.min(Math.max((s.uvIndex / 12) * 100, 4), 96);
      uvPip.style.left = `${pct}%`;
    }

    this.renderHourlyRail();
    this.renderForecastList();
  }

  private renderHourlyRail(): void {
    const slider = document.getElementById('hourlySlider');
    if (!slider) return;

    slider.innerHTML = '';
    this.state.hourly.forEach((item) => {
      const col = document.createElement('div');
      col.className = 'hourly-item';

      let readOut = `${item.temp}°`;
      if (this.activeHourlyMode === 'rain') {
        readOut = `${item.precipPct}%`;
      } else if (this.activeHourlyMode === 'wind') {
        readOut = `${item.windSpeed} km/h`;
      }

      col.innerHTML = `
        <span class="h-time">${item.time}</span>
        <span class="h-icon">${this.getIconGlyph(item.icon)}</span>
        <span class="h-val">${readOut}</span>
      `;
      slider.appendChild(col);
    });
  }

  private renderForecastList(): void {
    const list = document.getElementById('forecastList');
    if (!list) return;

    list.innerHTML = '';
    const minAll = Math.min(...this.state.daily.map((d) => d.min));
    const maxAll = Math.max(...this.state.daily.map((d) => d.max));
    const rangeAll = Math.max(maxAll - minAll, 1);

    this.state.daily.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'forecast-row';

      const leftPct = Math.round(((item.min - minAll) / rangeAll) * 100);
      const widthPct = Math.max(Math.round(((item.max - item.min) / rangeAll) * 100), 14);

      // Current temperature indicator dot on Today's bar
      const isToday = item.day.toLowerCase() === 'today';
      let currentPipHtml = '';
      if (isToday) {
        const curTempClamped = Math.max(item.min, Math.min(item.max, this.state.temp));
        const curPct = Math.round(
          ((curTempClamped - item.min) / Math.max(item.max - item.min, 1)) * 100,
        );
        currentPipHtml = `<div class="f-bar-cur-pip" style="left: ${curPct}%;" title="Current: ${this.state.temp}°C"></div>`;
      }

      row.innerHTML = `
        <span class="f-day">${item.day}</span>
        <span class="f-icon">${this.getIconGlyph(item.icon)}</span>
        <span class="f-min">${item.min}°</span>
        <div class="f-bar-track">
          <div class="f-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;">
            ${currentPipHtml}
          </div>
        </div>
        <span class="f-max">${item.max}°</span>
      `;
      list.appendChild(row);
    });
  }
}

// Global window declarations
declare global {
  interface Window {
    __weatherDashboardController?: WeatherDashboardController;
    __weatherEscBound?: boolean;
  }
}

if (typeof window !== 'undefined') {
  const initOrUpdate = () => {
    if (window.__weatherDashboardController) {
      window.__weatherDashboardController.onPageLoad();
    } else {
      window.__weatherDashboardController = new WeatherDashboardController();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrUpdate);
  } else {
    initOrUpdate();
  }

  document.addEventListener('astro:page-load', initOrUpdate);

  window.addEventListener('easter-egg:unlock', () => {
    initOrUpdate();
  });
}
