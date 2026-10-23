/**
 * ambient-sound.ts — Theme-Designated Atmospheric Audio & Micro-Sounds Engine
 *
 * Theme-Specific Audio Mapping:
 * - Blue Theme: Dark atmospheric tracks (/audio/ambient/dark-loop.mp3 + dark interludes 1-6)
 *   and dark UI effects (darkmatter-1, darkmatter-2, subterranean rumble) exclusively.
 * - White Accent Theme: House music streams (Defected, Anjunadeep, Peggy Gou, Solomun, Rüfüs Du Sol)
 *   and snappy 808/club-riser UI sound synthesis.
 * - Violet Theme: Rock 'n' roll live streams & radio (Hard Rock, CCR, Rock Icons, The Doors)
 *   and overdriven guitar power chord / tube relay UI sound synthesis.
 * - Amber Theme (default): Peaceful piano and classical music (Peaceful Piano, Vivaldi, Halidon, Hearth)
 *   and warm acoustic felt hammer / resonant 528Hz glass chime UI sound synthesis.
 * - Emerald Theme: Nature flow & raindrops (Window Raindrops, Forest Stream, Lofi Study).
 * - Light Theme: Calming classical piano & window raindrops.
 *
 * Micro-Sounds Interaction Engine:
 * - 0ms Latency Web Audio API synthesis for all non-dark themes
 * - Netflix Dark assets preserved exclusively for the Blue theme
 * - No dark effect sounds played outside of the Blue theme
 *
 * Universal Media Cutoff:
 * - Cuts off ambient audio and UI FX when user plays radio stations or video media.
 * - Persists piped radio ambient audio across tab / window changes.
 */

export interface AmbientTrack {
  id: string;
  name: string;
  code: string;
  type: 'local' | 'stream';
  file?: string;
  ytId?: string;
  genre?: string;
}

export const THEME_AUDIO_MAP: Record<string, AmbientTrack[]> = {
  // BLUE THEME: Dark atmospheric tracks & subterranean void soundscapes exclusively
  blue: [
    {
      id: 'loop',
      name: 'SUBTERRANEAN LOOP',
      code: 'DARK-01',
      type: 'local',
      file: '/audio/ambient/dark-loop.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-1',
      name: 'CELLO PULSE',
      code: 'DARK-02',
      type: 'local',
      file: '/audio/ambient/dark-interlude-1.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-2',
      name: 'TEMPORAL TICKS',
      code: 'DARK-03',
      type: 'local',
      file: '/audio/ambient/dark-interlude-2.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-3',
      name: 'METALLIC RESONANCE',
      code: 'DARK-04',
      type: 'local',
      file: '/audio/ambient/dark-interlude-3.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-4',
      name: 'ACOUSTIC DECAY',
      code: 'DARK-05',
      type: 'local',
      file: '/audio/ambient/dark-interlude-4.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-5',
      name: 'HARMONIC VOID',
      code: 'DARK-06',
      type: 'local',
      file: '/audio/ambient/dark-interlude-5.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'interlude-6',
      name: 'CINEMATIC THUNDER',
      code: 'DARK-07',
      type: 'local',
      file: '/audio/ambient/dark-interlude-6.mp3',
      genre: 'Dark Ambient',
    },
    {
      id: 'space-ambient',
      name: 'DEEP COSMOS',
      code: 'COSMOS',
      type: 'stream',
      ytId: 'S_MOd40zlAg',
      genre: 'Dark Ambient',
    },
  ],

  // WHITE ACCENT THEME: House music & dynamic live club sets
  white: [
    {
      id: 'defected',
      name: 'DEFECTED RADIO',
      code: 'DEFECTED',
      type: 'stream',
      ytId: 'XL8V37LDmu0',
      genre: 'House Music',
    },
    {
      id: 'anjunadeep',
      name: 'ANJUNADEEP',
      code: 'ANJUNA',
      type: 'stream',
      ytId: 'DXFdM_Vkq6A',
      genre: 'Deep House',
    },
    {
      id: 'peggy-gou',
      name: 'PEGGY GOU LIVE',
      code: 'PEGGY',
      type: 'stream',
      ytId: 'nKHpbiYCtDQ',
      genre: 'House & Tech',
    },
    {
      id: 'solomun',
      name: 'SOLOMUN CERCLE',
      code: 'SOLOMUN',
      type: 'stream',
      ytId: 'QHDRRxKlimY',
      genre: 'Melodic House',
    },
    {
      id: 'rufus-du-sol',
      name: 'RÜFÜS DU SOL LIVE',
      code: 'RUFUS',
      type: 'stream',
      ytId: 'Zy4KtD98S2c',
      genre: 'Electronic House',
    },
    {
      id: 'carl-cox',
      name: 'CARL COX IBIZA',
      code: 'COX',
      type: 'stream',
      ytId: '-ZrYIhX-fso',
      genre: 'Ibiza House',
    },
  ],

  // VIOLET THEME: Rock 'n' roll tracks & live radio streams
  violet: [
    {
      id: 'hard-rock',
      name: 'HARD ROCK LIVE',
      code: 'ROCK',
      type: 'stream',
      ytId: 'wdIG7n13XWo',
      genre: 'Hard Rock',
    },
    {
      id: 'ccr-rock',
      name: 'CCR LIVE RADIO',
      code: 'CCR',
      type: 'stream',
      ytId: 'FtiM1Qtz700',
      genre: 'Classic Rock',
    },
    {
      id: 'rock-icons',
      name: 'ROCK ICONS LEGENDS',
      code: 'ICONS',
      type: 'stream',
      ytId: 'VD8wLAWqQ6w',
      genre: 'Rock Legends',
    },
    {
      id: 'the-doors',
      name: 'THE DOORS LIVE',
      code: 'DOORS',
      type: 'stream',
      ytId: '0YYkq8KS7bA',
      genre: 'Classic Rock',
    },
    {
      id: 'classic-rock',
      name: 'CLASSIC ROCK 70s-80s',
      code: 'CLASSIC',
      type: 'stream',
      ytId: 'iemujlJ3q_c',
      genre: 'Classic Rock',
    },
    {
      id: 'radiohead-tv',
      name: 'RADIOHEAD TV',
      code: 'RADIOHEAD',
      type: 'stream',
      ytId: 'd6gatp9XyGc',
      genre: 'Alternative Rock',
    },
  ],

  // AMBER THEME (id: 'dark'): Piano and classical music & cozy warmth
  dark: [
    {
      id: 'beethoven-best',
      name: 'BEETHOVEN MASTERPIECES',
      code: 'BEETHOVEN',
      type: 'stream',
      ytId: 'aoQ-Ld0iFHw',
      genre: 'Classical Masters',
    },
    {
      id: 'mozart-best',
      name: 'MOZART MASTERWORKS',
      code: 'MOZART',
      type: 'stream',
      ytId: 'AodoQjrSpUg',
      genre: 'Classical Masters',
    },
    {
      id: 'beethoven-moonlight',
      name: 'MOONLIGHT SONATA',
      code: 'MOONLIGHT',
      type: 'stream',
      ytId: '525j1yJ1c4Y',
      genre: 'Acoustic Piano',
    },
    {
      id: 'chopin-nocturnes',
      name: 'CHOPIN NOCTURNES',
      code: 'CHOPIN',
      type: 'stream',
      ytId: 'IVpuTD-2SEo',
      genre: 'Romantic Piano',
    },
    {
      id: 'lofi-piano',
      name: 'PEACEFUL PIANO',
      code: 'PIANO',
      type: 'stream',
      ytId: 'N0snMcR6aaA',
      genre: 'Acoustic Piano',
    },
    {
      id: 'classical-radio',
      name: 'VIVALDI CLASSICAL',
      code: 'VIVALDI',
      type: 'stream',
      ytId: '4Tr0pt2kLdQ',
      genre: 'Baroque Classical',
    },
    {
      id: 'halidon-classical',
      name: 'HALIDON SYMPHONY',
      code: 'HALIDON',
      type: 'stream',
      ytId: 'ZiN1iKklkJQ',
      genre: 'Symphony Masters',
    },
    {
      id: 'cabin-rain-fire',
      name: 'RAIN & FIREPLACE',
      code: 'HEARTH',
      type: 'stream',
      ytId: 'i38TNpJ6pDs',
      genre: 'Acoustic Flow',
    },
  ],

  // EMERALD THEME: Nature & acoustic flow
  emerald: [
    {
      id: 'rain-window',
      name: 'WINDOW RAINDROPS',
      code: 'RAIN',
      type: 'stream',
      ytId: 'mPZkdNFkNps',
      genre: 'Nature Flow',
    },
    {
      id: 'forest-stream',
      name: 'FOREST RIVER STREAM',
      code: 'FOREST',
      type: 'stream',
      ytId: 'E8fiyj1hNwk',
      genre: 'Nature Flow',
    },
    {
      id: 'lofi-girl',
      name: 'LOFI STUDY BEATS',
      code: 'LOFI',
      type: 'stream',
      ytId: '5qap5aO4i9A',
      genre: 'Lo-Fi Focus',
    },
  ],

  // LIGHT THEME: Calming classical piano & window raindrops
  light: [
    {
      id: 'beethoven-best',
      name: 'BEETHOVEN MASTERPIECES',
      code: 'BEETHOVEN',
      type: 'stream',
      ytId: 'aoQ-Ld0iFHw',
      genre: 'Classical Masters',
    },
    {
      id: 'mozart-best',
      name: 'MOZART MASTERWORKS',
      code: 'MOZART',
      type: 'stream',
      ytId: 'AodoQjrSpUg',
      genre: 'Classical Masters',
    },
    {
      id: 'lofi-piano',
      name: 'PEACEFUL PIANO',
      code: 'PIANO',
      type: 'stream',
      ytId: 'N0snMcR6aaA',
      genre: 'Acoustic Piano',
    },
    {
      id: 'classical-radio',
      name: 'VIVALDI CLASSICAL',
      code: 'VIVALDI',
      type: 'stream',
      ytId: '4Tr0pt2kLdQ',
      genre: 'Baroque Classical',
    },
    {
      id: 'rain-window',
      name: 'WINDOW RAINDROPS',
      code: 'RAIN',
      type: 'stream',
      ytId: 'mPZkdNFkNps',
      genre: 'Nature Flow',
    },
  ],
};

// Default playlist for backward compatibility
export const AMBIENT_TRACKS: AmbientTrack[] = THEME_AUDIO_MAP.dark;

declare global {
  interface Window {
    __ambientSoundController?: AmbientSoundController;
  }
}

export type MicroSoundName =
  | 'click'
  | 'hover'
  | 'drawer'
  | 'modalOpen'
  | 'modalClose'
  | 'tab'
  | 'slider'
  | 'surge'
  | 'theme'
  | 'wave';

/**
 * MicroSoundsEngine — High-performance theme-adaptive sound engine
 *
 * Architecture:
 * - Blue Theme: Plays Netflix Dark matter sound samples (darkmatter-1, darkmatter-2, click).
 * - White Theme: Synthesizes snappy 808 rimshots, digital sync pings, club filter sweeps.
 * - Violet Theme: Synthesizes overdriven electric guitar power chords, tube-amp relays, pick scrapes.
 * - Amber Theme: Synthesizes warm acoustic piano felt hammer taps, 528Hz crystal chimes, soundboard swells.
 * - Emerald/Light: Synthesizes organic wood clicks, clean resonant bell chimes.
 */
class MicroSoundsEngine {
  private enabled = true;
  private currentTheme = 'dark';
  private lastHoverTime = 0;
  private readonly hoverThrottleMs = 90;

  private audioCtx: AudioContext | null = null;
  private bufferMap: Partial<Record<MicroSoundName, AudioBuffer>> = {};
  private isPreloading = false;
  private fallbackPool: Partial<Record<MicroSoundName, HTMLAudioElement[]>> = {};
  private distortionCurve: Float32Array | null = null;

  // Blue theme dark Netflix assets
  private readonly darkFxSources: Record<MicroSoundName, string> = {
    click: '/audio/fx/click.mp3',
    hover: '/audio/fx/ripple-1.mp3',
    drawer: '/audio/fx/ripple-2.mp3',
    modalOpen: '/audio/fx/portrait.mp3',
    modalClose: '/audio/fx/continue.mp3',
    tab: '/audio/fx/tab-select.mp3',
    slider: '/audio/fx/slider.mp3',
    surge: '/audio/fx/darkmatter-1.mp3',
    theme: '/audio/fx/darkmatter-2.mp3',
    wave: '/audio/fx/darkmatter-2.mp3',
  };

  private readonly darkVolumes: Record<MicroSoundName, number> = {
    click: 0.22,
    hover: 0.1,
    drawer: 0.26,
    modalOpen: 0.28,
    modalClose: 0.26,
    tab: 0.24,
    slider: 0.22,
    surge: 0.32,
    theme: 0.28,
    wave: 0.32,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentTheme =
        document.documentElement.getAttribute('data-theme') ||
        localStorage.getItem('theme') ||
        'dark';

      window.addEventListener('themechange', ((e: CustomEvent) => {
        if (e.detail?.theme) {
          this.setTheme(e.detail.theme);
        }
      }) as EventListener);
    }

    this.initAudioContext();
    this.attachGlobalInteractions();
  }

  public setTheme(theme: string): void {
    this.currentTheme = theme;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  private initAudioContext(): void {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    } catch {
      this.audioCtx = null;
    }

    const primeAudio = () => {
      this.resumeContext();
      this.preloadBuffers();
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => this.preloadBuffers(), { timeout: 2000 });
    } else {
      setTimeout(() => this.preloadBuffers(), 500);
    }

    window.addEventListener('click', primeAudio, { once: true, passive: true });
    window.addEventListener('keydown', primeAudio, { once: true, passive: true });
    window.addEventListener('touchstart', primeAudio, { once: true, passive: true });
  }

  private async resumeContext(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch {
        // Ignored
      }
    }
  }

  private async preloadBuffers(): Promise<void> {
    if (this.isPreloading) return;
    this.isPreloading = true;

    if (!this.audioCtx) {
      this.initFallbackPools();
      return;
    }

    const loadEntries = Object.entries(this.darkFxSources) as [MicroSoundName, string][];

    await Promise.allSettled(
      loadEntries.map(async ([key, url]) => {
        try {
          const res = await fetch(url, { cache: 'force-cache' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arrayBuf = await res.arrayBuffer();
          if (this.audioCtx) {
            const audioBuf = await this.audioCtx.decodeAudioData(arrayBuf);
            this.bufferMap[key] = audioBuf;
          }
        } catch {
          this.ensureFallback(key);
        }
      }),
    );
  }

  private initFallbackPools(): void {
    for (const key of Object.keys(this.darkFxSources) as MicroSoundName[]) {
      this.ensureFallback(key);
    }
  }

  private ensureFallback(name: MicroSoundName): void {
    if (this.fallbackPool[name]) return;
    const src = this.darkFxSources[name];
    const poolSize = name === 'wave' ? 3 : 2;
    this.fallbackPool[name] = Array.from({ length: poolSize }, () => {
      const a = new Audio(src);
      a.preload = 'auto';
      a.volume = this.darkVolumes[name] ?? 0.2;
      return a;
    });
  }

  /**
   * Main sound dispatcher. Routes to Blue dark-matter samples or theme-specific synthesis.
   */
  public play(name: MicroSoundName): void {
    if (!this.enabled) return;

    // BLUE THEME: Exclusively plays dark matter Netflix soundscapes
    if (this.currentTheme === 'blue') {
      this.playBlueThemeSample(name);
      return;
    }

    // ALL OTHER THEMES: Never play dark effect sounds. Synthesize bespoke theme acoustics.
    if (this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      try {
        if (this.currentTheme === 'white') {
          this.synthesizeWhiteThemeSound(name);
          return;
        }
        if (this.currentTheme === 'violet') {
          this.synthesizeVioletThemeSound(name);
          return;
        }
        if (this.currentTheme === 'emerald') {
          this.synthesizeEmeraldThemeSound(name);
          return;
        }
        if (this.currentTheme === 'light') {
          this.synthesizeLightThemeSound(name);
          return;
        }
        // Amber theme (id: 'dark') default: Felt piano & 528Hz crystal chime acoustics
        this.synthesizeAmberThemeSound(name);
        return;
      } catch {
        // Fall back gracefully below
      }
    }

    // Safe fallback for browsers without Web Audio: avoid darkmatter rumbles on non-blue themes
    if (name !== 'surge' && name !== 'theme' && name !== 'wave') {
      this.playFallbackSample(name);
    }
  }

  public playHover(): void {
    const now = Date.now();
    if (now - this.lastHoverTime < this.hoverThrottleMs) return;
    this.lastHoverTime = now;
    this.play('hover');
  }

  private playBlueThemeSample(name: MicroSoundName): void {
    if (this.audioCtx && this.bufferMap[name]) {
      try {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.bufferMap[name]!;
        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = this.darkVolumes[name] ?? 0.25;
        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        source.start(0);
        return;
      } catch {
        // Fall through
      }
    }
    this.playFallbackSample(name);
  }

  private playFallbackSample(name: MicroSoundName): void {
    this.ensureFallback(name);
    const pool = this.fallbackPool[name];
    if (pool && pool.length > 0) {
      const available = pool.find((a) => a.paused || a.ended) || pool[0];
      try {
        available.currentTime = 0;
        available.play().catch(() => {});
      } catch {
        // Ignored
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // THEME SOUND SYNTHESIZERS (0ms latency Web Audio API)
  // ─────────────────────────────────────────────────────────────

  private getTubeDistortion(): Float32Array {
    if (this.distortionCurve) return this.distortionCurve;
    const k = 28;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    this.distortionCurve = curve;
    return curve;
  }

  /**
   * Amber Theme: Acoustic Felt Piano Hammer, Warm Wood, 528Hz Solfeggio Chimes
   */
  private synthesizeAmberThemeSound(name: MicroSoundName): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (name) {
      case 'click': {
        // Felt hammer piano key tap (440Hz + 660Hz damped)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'hover': {
        // Soft acoustic wood soundboard tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(780, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.02);
        break;
      }
      case 'tab':
      case 'slider': {
        // Warm piano hammer key mechanism
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'modalOpen': {
        // Classical ascending piano triad: C4 (261.6) -> E4 (329.6) -> G4 (392.0)
        [261.63, 329.63, 392.0].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.035;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        break;
      }
      case 'modalClose': {
        // Classical downward resolution: G4 (392.0) -> C4 (261.6)
        [392.0, 261.63].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.045;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.11, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        });
        break;
      }
      case 'theme': {
        // Resonant 528Hz Solfeggio + 792Hz crystal glass chime chord
        [528, 792].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx === 0 ? 0.2 : 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.58);
        });
        break;
      }
      case 'surge': {
        // Grand piano harmonic chord swell: C3 (130.8) + G3 (196.0) + E4 (329.6) + 528Hz
        [130.81, 196.0, 329.63, 528].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.14 / (idx * 0.5 + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.78);
        });
        break;
      }
      case 'wave': {
        // Grand piano acoustic soundboard resonance (warm 130.8Hz fundamental bloom)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130.81, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(640, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.65);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
      default:
        break;
    }
  }

  /**
   * White Theme: Snappy 808 Rimshot, High-Tech Club Filter Riser, Electronic Sync
   */
  private synthesizeWhiteThemeSound(name: MicroSoundName): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (name) {
      case 'click': {
        // Snappy 808 electronic rimshot click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.022);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.028);
        break;
      }
      case 'hover': {
        // Crisp 2200Hz digital micro-tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }
      case 'tab':
      case 'slider': {
        // High-tech house filter pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.035);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'modalOpen': {
        // Ascending futuristic club arpeggio: 440 -> 660 -> 880 -> 1100
        [440, 660, 880, 1100].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.025;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.24);
        });
        break;
      }
      case 'modalClose': {
        // Quick descending electro filter blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(990, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'theme': {
        // Dual-tone digital sync beep (880Hz + 1320Hz crisp ping)
        [880, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.18);
        });
        break;
      }
      case 'surge': {
        // House club filter sweep down with punchy sub kick
        const oscSub = ctx.createOscillator();
        const gainSub = ctx.createGain();
        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(120, now);
        oscSub.frequency.exponentialRampToValueAtTime(55, now + 0.25);
        gainSub.gain.setValueAtTime(0.24, now);
        gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        oscSub.connect(gainSub);
        gainSub.connect(ctx.destination);
        oscSub.start(now);
        oscSub.stop(now + 0.35);

        // Filter sweep
        const oscSweep = ctx.createOscillator();
        const gainSweep = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        oscSweep.type = 'sawtooth';
        oscSweep.frequency.setValueAtTime(220, now);
        filter.type = 'bandpass';
        filter.Q.value = 4.5;
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.35);
        gainSweep.gain.setValueAtTime(0.14, now);
        gainSweep.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        oscSweep.connect(filter);
        filter.connect(gainSweep);
        gainSweep.connect(ctx.destination);
        oscSweep.start(now);
        oscSweep.stop(now + 0.38);
        break;
      }
      case 'wave': {
        // Pumping electro house sidechain filter sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(65, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(1800, now + 0.18);
        filter.frequency.exponentialRampToValueAtTime(250, now + 0.45);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Violet Theme: Overdriven Electric Guitar Chords, Tube-Amp Relay Snaps, Pick Harmonics
   */
  private synthesizeVioletThemeSound(name: MicroSoundName): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const distortion = this.getTubeDistortion();

    switch (name) {
      case 'click': {
        // Analog tube amplifier relay snap click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.024);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, now);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.032);
        break;
      }
      case 'hover': {
        // Subtle guitar pick tick
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }
      case 'tab':
      case 'slider': {
        // Tube overdrive potentiometer click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'modalOpen': {
        // Electric guitar power chord fifth strum: A3 (220Hz) + E4 (330Hz)
        [220, 330].forEach((freq) => {
          const osc = ctx.createOscillator();
          const shaper = ctx.createWaveShaper();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          shaper.curve = distortion as unknown as Float32Array<ArrayBuffer>;
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2800, now);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.connect(shaper);
          shaper.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        });
        break;
      }
      case 'modalClose': {
        // Palm-muted guitar chunk (110Hz with steep decay)
        const osc = ctx.createOscillator();
        const shaper = ctx.createWaveShaper();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, now);
        shaper.curve = distortion as unknown as Float32Array<ArrayBuffer>;
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(shaper);
        shaper.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case 'theme': {
        // Electric guitar pinch harmonic chime: A5 (880Hz) with tube overtone
        const osc = ctx.createOscillator();
        const shaper = ctx.createWaveShaper();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        shaper.curve = distortion as unknown as Float32Array<ArrayBuffer>;
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(shaper);
        shaper.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'surge': {
        // Roaring power chord pluck: A2 (110Hz) + E3 (164.8Hz) + A3 (220Hz)
        [110, 164.81, 220].forEach((freq) => {
          const osc = ctx.createOscillator();
          const shaper = ctx.createWaveShaper();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          shaper.curve = distortion as unknown as Float32Array<ArrayBuffer>;
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(2200, now);
          gain.gain.setValueAtTime(0.14, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
          osc.connect(shaper);
          shaper.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.68);
        });
        break;
      }
      case 'wave': {
        // Deep tube amp cabinet speaker rumble
        const osc = ctx.createOscillator();
        const shaper = ctx.createWaveShaper();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(82.41, now); // Low E
        shaper.curve = distortion as unknown as Float32Array<ArrayBuffer>;
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        osc.connect(shaper);
        shaper.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
      }
      default:
        break;
    }
  }

  /**
   * Emerald Theme: Clean Organic Woodblock & Nature Chimes
   */
  private synthesizeEmeraldThemeSound(name: MicroSoundName): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (name) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
      case 'hover': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.015);
        break;
      }
      case 'theme':
      case 'surge': {
        [660, 990].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx === 0 ? 0.18 : 0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.48);
        });
        break;
      }
      case 'wave': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.48);
        break;
      }
      default:
        this.synthesizeAmberThemeSound(name);
        break;
    }
  }

  /**
   * Light Theme: Crisp Crystalline Bell & Clean Tones
   */
  private synthesizeLightThemeSound(name: MicroSoundName): void {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (name) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
        break;
      }
      case 'theme':
      case 'surge': {
        [880, 1320].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx === 0 ? 0.16 : 0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        });
        break;
      }
      default:
        this.synthesizeAmberThemeSound(name);
        break;
    }
  }

  private attachGlobalInteractions(): void {
    document.addEventListener(
      'click',
      (e) => {
        const target = (e.target as HTMLElement).closest<HTMLElement>(
          'button, a, input, select, textarea, ' +
            '.age-counter, .local-clock, .clock-badge, .age-badge, ' +
            '.ott-filter-chip, .sdr-genre-pill, .sdr-preset-btn, .sdr-station-card, .sdr-deck-btn, ' +
            '.telemetry-pill, .theme-toggle, .palette-item, .palette-btn, [data-set-theme], ' +
            '.view-resume-trigger, [data-open-resume-overlay], .modal-close-btn, .media-mode-tab, ' +
            '.project-demo-btn, [data-open-project-demo], .demo-tab-btn, .video-hud-btn, .terminal-rerun-btn, ' +
            '.tag, .skill-pill, .skill-item, .media-item-card, .contact-link-item, [role="button"]',
        );
        if (!target) return;

        // Sound toggles handled by AmbientSoundController
        if (
          target.matches(
            '#soundToggle, #mobileSoundToggle, #fxToggle, #mobileFxToggle, #persistToggle, #mobilePersistToggle, .sound-toggle, .mobile-sound-toggle',
          )
        ) {
          return;
        }

        // Theme controls
        if (
          target.matches(
            '.theme-toggle, .palette-item, .palette-btn, .mobile-theme-toggle, [data-set-theme]',
          )
        ) {
          this.play('theme');
          return;
        }

        // Modal Open triggers (Resume & Project Demo)
        if (
          target.matches(
            '#viewResumeBtn, .view-resume-trigger, [data-open-resume], [data-open-resume-overlay], ' +
              '.project-demo-btn, [data-open-project-demo]',
          )
        ) {
          this.play('modalOpen');
          return;
        }

        // Modal Close triggers
        if (
          target.matches(
            '#resumeModalClose, .resume-modal-close, #resumeModalBackdrop, ' +
              '#demoModalClose, .demo-modal-close, .demo-modal-backdrop',
          )
        ) {
          this.play('modalClose');
          return;
        }

        // Terminal Re-run benchmark
        if (target.matches('#terminalRerunBtn, .terminal-rerun-btn')) {
          this.play('surge');
          return;
        }

        // Tabs, OTT chips, and Navigation mode switchers
        if (target.matches('.media-mode-tab, .ott-filter-chip, .sdr-genre-pill, .demo-tab-btn')) {
          this.play('tab');
          return;
        }

        // Mobile drawer toggle
        if (target.matches('#mobileNavToggle, #mobileNavClose')) {
          this.play('drawer');
          return;
        }

        // Age Counter & Clock tactile switch
        if (target.matches('.age-counter, .age-counter *, .local-clock, .local-clock *')) {
          this.play('click');
          return;
        }

        this.play('click');
      },
      true,
    );

    document.addEventListener(
      'mouseover',
      (e) => {
        const target = (e.target as HTMLElement).closest(
          '.nav-link-item, .mobile-nav-item, .ott-filter-chip, .media-mode-tab, .theme-toggle, .palette-btn, ' +
            '.project-row, .project-demo-btn, .project-github-link, .media-item-card, .sdr-station-card, ' +
            '.sdr-preset-btn, .view-resume-trigger, .sound-toggle, .reload-toggle, .footer-reload-btn, .age-counter, .local-clock, .tag, ' +
            '.skill-pill, .skill-item, .contact-link-item, .demo-tab-btn',
        );
        if (!target) return;
        this.playHover();
      },
      true,
    );

    document.addEventListener(
      'input',
      (e) => {
        const target = e.target as HTMLElement;
        if (target && target.matches('input[type="range"]')) {
          this.play('slider');
        }
      },
      true,
    );

    window.addEventListener('terrain-wave', () => {
      this.play('wave');
    });
  }
}

/**
 * AmbientSoundController — Theme-Aware Background Ambient Soundscape
 */
export class AmbientSoundController {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTheme = 'dark';
  private currentTrackIndex = 0;
  private customStreamTrack: AmbientTrack | null = null;
  private isPipedFromRadio = false;
  private fadeInterval: number | null = null;
  private readonly targetVolume = 0.32;
  private toggleButtons: HTMLElement[] = [];
  private labelElements: HTMLElement[] = [];
  private fxToggleButtons: HTMLElement[] = [];
  private fxLabelElements: HTMLElement[] = [];
  private persistToggleButtons: HTMLElement[] = [];
  private persistLabelElements: HTMLElement[] = [];
  private isFxEnabled = true;
  private isPersistenceEnabled = true;
  private hasInteracted = false;
  private wasPlayingBeforeMedia = false;
  private isMediaPlaying = false;
  private lastTrackChangeTime = 0;
  private microSounds: MicroSoundsEngine;
  private ytPlayer: any = null;
  private isYtReady = false;
  private isYtInitializing = false;

  constructor() {
    this.microSounds = new MicroSoundsEngine();
    if (typeof window === 'undefined') return;
    this.init();
  }

  public playFx(name: MicroSoundName): void {
    this.microSounds.play(name);
  }

  public getActiveThemeTracks(): AmbientTrack[] {
    return THEME_AUDIO_MAP[this.currentTheme] || THEME_AUDIO_MAP['dark'];
  }

  public getCurrentTrack(): AmbientTrack {
    if (this.customStreamTrack) return this.customStreamTrack;
    const tracks = this.getActiveThemeTracks();
    return tracks[this.currentTrackIndex] || tracks[0];
  }

  private init(): void {
    // Current theme
    this.currentTheme =
      document.documentElement.getAttribute('data-theme') ||
      localStorage.getItem('theme') ||
      'dark';
    this.microSounds.setTheme(this.currentTheme);

    // Restore saved custom stream track (e.g. piped from radio)
    const savedCustom = localStorage.getItem('ambient_custom_track');
    if (savedCustom) {
      try {
        this.customStreamTrack = JSON.parse(savedCustom);
        if (localStorage.getItem('ambient_piped_from_radio') === 'true') {
          this.isPipedFromRadio = true;
        }
      } catch {
        this.customStreamTrack = null;
        this.isPipedFromRadio = false;
      }
    }

    // Restore saved track index
    const savedTrack = localStorage.getItem('ambient_track_index');
    if (savedTrack !== null) {
      const parsed = parseInt(savedTrack, 10);
      const tracks = this.getActiveThemeTracks();
      if (!isNaN(parsed) && parsed >= 0 && parsed < tracks.length) {
        this.currentTrackIndex = parsed;
      }
    }

    // Connect to persistent audio element
    let audioEl = document.getElementById('ambient-audio-element') as HTMLAudioElement | null;
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.id = 'ambient-audio-element';
      audioEl.loop = true;
      audioEl.preload = 'auto';
      document.body.appendChild(audioEl);
    }
    this.audio = audioEl;
    this.audio.loop = true;
    this.audio.preload = 'auto';

    // Play/mute preference
    const stored = localStorage.getItem('ambient_sound');
    const isExplicitlyDisabled = stored === 'disabled';

    // FX preference
    const fxStored = localStorage.getItem('ui_fx_sound');
    this.isFxEnabled = fxStored !== 'disabled';
    this.microSounds.setEnabled(this.isFxEnabled);

    // Master background stream persistence preference (defaults to enabled)
    const persistStored = localStorage.getItem('ambient_persistence');
    this.isPersistenceEnabled = persistStored !== 'disabled';

    const track = this.getCurrentTrack();

    if (track.type === 'local' && this.audio && !this.audio.paused && this.audio.currentTime > 0) {
      this.isPlaying = true;
    } else {
      if (track.type === 'local') {
        this.loadCurrentTrack();
        this.audio.volume = 0;
        this.restoreSavedPlaybackPosition();
      } else {
        this.initYtPlayer();
      }
    }

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio && !this.audio.paused) {
        sessionStorage.setItem('ambient_audio_time', String(this.audio.currentTime));
        sessionStorage.setItem('ambient_audio_timestamp', String(Date.now()));
      }
    });

    const saveCurrentPosition = () => {
      if (this.audio && !this.audio.paused) {
        sessionStorage.setItem('ambient_audio_time', String(this.audio.currentTime));
        sessionStorage.setItem('ambient_audio_timestamp', String(Date.now()));
      }
    };
    window.addEventListener('beforeunload', saveCurrentPosition);
    window.addEventListener('pagehide', saveCurrentPosition);
    document.addEventListener('astro:before-swap', saveCurrentPosition);

    this.bindUI();

    // Autoplay attempt / gesture fallback
    if (!isExplicitlyDisabled && !this.isPlaying) {
      if (track.type === 'local') {
        const startPromise = this.audio.play();
        if (startPromise !== undefined) {
          startPromise
            .then(() => {
              this.isPlaying = true;
              this.updateUI(true);
              this.fadeTo(this.targetVolume, 1200);
            })
            .catch(() => {
              this.setupFirstInteractionListener();
            });
        }
      } else {
        this.setupFirstInteractionListener();
      }
    }

    // Page visibility handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Master persistence: keep audio stream playing across tab/window switches if enabled
        if ((this.isPersistenceEnabled || this.isPipedFromRadio) && this.isPlaying) {
          return;
        }
        if (this.isPlaying) {
          if (this.audio && !this.audio.paused) {
            this.fadeTo(0, 800, () => this.audio?.pause());
          }
          if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
            try {
              this.ytPlayer.pauseVideo();
            } catch {}
          }
        }
      } else {
        const currentPref = localStorage.getItem('ambient_sound');
        if (currentPref !== 'disabled' && this.isPlaying && !this.isMediaPlaying) {
          this.play();
        }
      }
    });

    // Universal media cutoff coordination
    window.addEventListener('sdr-radio-play', () => this.handleMediaCutoff(true));
    window.addEventListener('sdr-radio-stop', () => this.handleMediaCutoff(false));
    window.addEventListener('modalopen', () => this.handleMediaCutoff(true));
    window.addEventListener('modalclose', () => this.handleMediaCutoff(false));

    document.addEventListener(
      'play',
      (e) => {
        const el = e.target as HTMLElement;
        if (el && el.id !== 'ambient-audio-element' && el.id !== 'ambient-yt-player') {
          this.handleMediaCutoff(true);
        }
      },
      true,
    );

    const checkMediaEnded = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el && el.id !== 'ambient-audio-element' && el.id !== 'ambient-yt-player') {
        setTimeout(() => {
          const anyMedia = Array.from(
            document.querySelectorAll<HTMLMediaElement>('video, audio'),
          ).some((m) => m.id !== 'ambient-audio-element' && !m.paused && !m.ended);
          const isRadioActive = Boolean(document.querySelector('.sdr-power-btn.is-active'));
          if (!anyMedia && !isRadioActive) {
            this.handleMediaCutoff(false);
          }
        }, 120);
      }
    };
    document.addEventListener('pause', checkMediaEnded, true);
    document.addEventListener('ended', checkMediaEnded, true);

    // Event listener to dynamically route music/stations to ambient sound
    window.addEventListener('set-ambient-sound', ((e: CustomEvent) => {
      const detail = e.detail;
      if (detail) {
        this.setAmbientTrack(detail);
      }
    }) as EventListener);

    // Dynamic Theme Switching: seamlessly switch soundscapes and UI sound profiles
    window.addEventListener('themechange', ((e: CustomEvent) => {
      const newTheme = e.detail?.theme;
      if (newTheme && newTheme !== this.currentTheme) {
        this.applyThemeAudio(newTheme);
      }
    }) as EventListener);
  }

  /**
   * Switches background audio to match the newly active color theme.
   */
  public applyThemeAudio(themeId: string): void {
    this.currentTheme = themeId;
    this.microSounds.setTheme(themeId);

    // If audio is piped from radio, keep playing the piped stream across themes without shutting down!
    if (this.isPipedFromRadio && this.customStreamTrack) {
      this.updateUI(this.isPlaying);
      return;
    }

    // Default to the first track of the chosen theme if not piped
    this.customStreamTrack = null;
    this.isPipedFromRadio = false;
    localStorage.removeItem('ambient_custom_track');
    localStorage.removeItem('ambient_piped_from_radio');

    this.currentTrackIndex = 0;
    localStorage.setItem('ambient_track_index', '0');

    if (this.isPlaying) {
      this.play();
    } else {
      this.updateUI(false);
    }
  }

  private setupFirstInteractionListener(): void {
    const onFirstInteraction = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      this.play();
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      window.removeEventListener('touchstart', onFirstInteraction);
      window.removeEventListener('scroll', onFirstInteraction);
    };

    window.addEventListener('click', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('keydown', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });
    window.addEventListener('scroll', onFirstInteraction, { once: true, passive: true });
  }

  public handleMediaCutoff(active: boolean): void {
    if (active) {
      this.isMediaPlaying = true;
      if (this.isPlaying) {
        this.wasPlayingBeforeMedia = true;
        this.isPlaying = false;
        this.updateUI(false);
        if (this.audio && !this.audio.paused) {
          this.audio.volume = 0;
          this.audio.pause();
        }
        if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
          try {
            this.ytPlayer.pauseVideo();
          } catch {}
        }
      }
      this.microSounds.setEnabled(false);
    } else {
      this.isMediaPlaying = false;
      if (this.isFxEnabled) {
        this.microSounds.setEnabled(true);
      }
      const currentPref = localStorage.getItem('ambient_sound');
      if (currentPref !== 'disabled' && this.wasPlayingBeforeMedia) {
        this.wasPlayingBeforeMedia = false;
        this.play();
      }
    }
  }

  private initYtPlayer(): void {
    if (this.ytPlayer || this.isYtInitializing) return;
    this.isYtInitializing = true;

    const setupPlayer = () => {
      try {
        if (!window.YT || !window.YT.Player) return;
        const targetEl = document.getElementById('ambient-yt-player');
        if (!targetEl) return;

        const currentTrack = this.getCurrentTrack();
        const initialYtId = currentTrack.ytId || 'N0snMcR6aaA';

        this.ytPlayer = new window.YT.Player('ambient-yt-player', {
          height: '100',
          width: '100',
          videoId: initialYtId,
          playerVars: {
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            autoplay: 1,
            loop: 1,
            fs: 0,
          },
          events: {
            onReady: () => {
              this.isYtReady = true;
              this.isYtInitializing = false;
              if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
                this.ytPlayer.setVolume(Math.round(this.targetVolume * 100));
              }
              const track = this.getCurrentTrack();
              if (this.isPlaying && track.type === 'stream' && !this.isMediaPlaying) {
                this.ytPlayer.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (event.data === 0 && this.isPlaying && this.getCurrentTrack().type === 'stream') {
                this.ytPlayer?.playVideo();
              }
            },
          },
        });
      } catch {
        this.isYtInitializing = false;
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const first = document.getElementsByTagName('script')[0];
        first?.parentNode?.insertBefore(tag, first);
      }
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') prevCallback();
        setupPlayer();
      };
    }
  }

  private restoreSavedPlaybackPosition(): void {
    if (!this.audio) return;
    const savedTime = parseFloat(sessionStorage.getItem('ambient_audio_time') || '0');
    const savedTimestamp = parseInt(sessionStorage.getItem('ambient_audio_timestamp') || '0', 10);
    if (savedTime && savedTimestamp) {
      const elapsed = (Date.now() - savedTimestamp) / 1000;
      if (elapsed < 45) {
        const applyTime = () => {
          if (this.audio && this.audio.duration && !isNaN(this.audio.duration)) {
            this.audio.currentTime = (savedTime + elapsed) % this.audio.duration;
          } else if (this.audio) {
            this.audio.currentTime = savedTime;
          }
        };

        if (this.audio.readyState >= 1) {
          applyTime();
        } else {
          this.audio.addEventListener('loadedmetadata', applyTime, { once: true });
        }
      }
    }
  }

  private loadCurrentTrack(): void {
    if (!this.audio) return;
    const track = this.getCurrentTrack();
    if (track.type === 'local' && track.file) {
      if (
        this.audio.src !== window.location.origin + track.file &&
        !this.audio.src.endsWith(track.file)
      ) {
        this.audio.src = track.file;
      }
    }
  }

  public onPageLoad(): void {
    this.currentTheme =
      document.documentElement.getAttribute('data-theme') ||
      localStorage.getItem('theme') ||
      'dark';
    this.microSounds.setTheme(this.currentTheme);

    const audioEl = document.getElementById('ambient-audio-element') as HTMLAudioElement | null;
    if (audioEl && this.audio !== audioEl) {
      this.audio = audioEl;
    }

    const track = this.getCurrentTrack();
    if (track.type === 'local' && this.audio && !this.audio.paused) {
      this.isPlaying = true;
    }

    this.bindUI();
    this.updateUI(this.isPlaying);
    this.updateFxUI();
    this.updatePersistUI();
  }

  private bindUI(): void {
    this.toggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>('#soundToggle, #mobileSoundToggle'),
    );
    this.labelElements = Array.from(
      document.querySelectorAll<HTMLElement>('#soundLabel, #mobileSoundLabel'),
    );

    let clickTimeout: number | null = null;
    this.toggleButtons.forEach((btn) => {
      if (btn.dataset.soundBound === 'true') return;
      btn.dataset.soundBound = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (clickTimeout !== null) {
          window.clearTimeout(clickTimeout);
          clickTimeout = null;
          this.nextTrack();
        } else {
          clickTimeout = window.setTimeout(() => {
            clickTimeout = null;
            this.handleAmbientButtonClick();
          }, 260);
        }
      });

      btn.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (clickTimeout !== null) {
          window.clearTimeout(clickTimeout);
          clickTimeout = null;
        }
      });
    });

    // FX Toggles
    this.fxToggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>('#fxToggle, #mobileFxToggle'),
    );
    this.fxLabelElements = Array.from(
      document.querySelectorAll<HTMLElement>('#fxLabel, #mobileFxLabel'),
    );

    this.fxToggleButtons.forEach((btn) => {
      if (btn.dataset.fxBound === 'true') return;
      btn.dataset.fxBound = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFx();
      });
    });

    // Master Persistence (Flow) Toggles
    this.persistToggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>('#persistToggle, #mobilePersistToggle'),
    );
    this.persistLabelElements = Array.from(
      document.querySelectorAll<HTMLElement>('#persistLabel, #mobilePersistLabel'),
    );

    this.persistToggleButtons.forEach((btn) => {
      if (btn.dataset.persistBound === 'true') return;
      btn.dataset.persistBound = 'true';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePersistence();
      });
    });

    this.updateUI(this.isPlaying);
    this.updateFxUI();
    this.updatePersistUI();
  }

  public togglePersistence(): void {
    this.isPersistenceEnabled = !this.isPersistenceEnabled;
    try {
      localStorage.setItem(
        'ambient_persistence',
        this.isPersistenceEnabled ? 'enabled' : 'disabled',
      );
    } catch {
      // Ignore storage errors
    }
    this.updatePersistUI();
    this.microSounds.play('click');
  }

  private updatePersistUI(): void {
    this.persistToggleButtons.forEach((btn) => {
      btn.classList.toggle('is-active', this.isPersistenceEnabled);
      btn.setAttribute('aria-pressed', this.isPersistenceEnabled ? 'true' : 'false');
      btn.setAttribute(
        'title',
        this.isPersistenceEnabled
          ? 'Background Audio Persistence: FLOW [Active] (Audio streams continuously across tabs & windows. Click to pause on tab switch)'
          : 'Background Audio Persistence: FLOW [Paused on Inactive Tab] (Click to enable continuous playback across tabs & windows)',
      );
    });

    this.persistLabelElements.forEach((lbl) => {
      lbl.textContent = this.isPersistenceEnabled ? '// ON' : '// OFF';
    });
  }

  public toggleFx(): void {
    this.isFxEnabled = !this.isFxEnabled;
    try {
      localStorage.setItem('ui_fx_sound', this.isFxEnabled ? 'enabled' : 'disabled');
    } catch {
      // Ignore storage errors
    }
    this.microSounds.setEnabled(this.isFxEnabled);
    this.updateFxUI();
    if (this.isFxEnabled) {
      this.microSounds.play('click');
    }
  }

  private updateFxUI(): void {
    this.fxToggleButtons.forEach((btn) => {
      btn.classList.toggle('is-active', this.isFxEnabled);
      btn.setAttribute('aria-pressed', this.isFxEnabled ? 'true' : 'false');
      btn.setAttribute(
        'title',
        this.isFxEnabled
          ? 'Sound Effects: FX [Active] (Click to turn off)'
          : 'Sound Effects: FX [Muted] (Click to turn on)',
      );
    });

    this.fxLabelElements.forEach((lbl) => {
      lbl.textContent = this.isFxEnabled ? '// ON' : '// OFF';
    });
  }

  public handleAmbientButtonClick(): void {
    if (this.isPipedFromRadio) {
      // User clicked the ambient button while a piped radio stream is playing.
      // Transition from the piped radio stream to the current theme's track sequence!
      this.isPipedFromRadio = false;
      this.customStreamTrack = null;
      localStorage.removeItem('ambient_custom_track');
      localStorage.removeItem('ambient_piped_from_radio');

      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }

      // Default to track 0 of current theme and start playing
      this.currentTrackIndex = 0;
      localStorage.setItem('ambient_track_index', '0');
      localStorage.setItem('ambient_sound', 'enabled');

      this.microSounds.play('theme');
      this.play();
      return;
    }

    // Normal mode: toggle play / pause
    this.togglePlayPause();
  }

  public nextTrack(): void {
    const now = Date.now();
    if (now - this.lastTrackChangeTime < 300) return;
    this.lastTrackChangeTime = now;

    this.microSounds.play('surge');

    this.customStreamTrack = null;
    this.isPipedFromRadio = false;
    localStorage.removeItem('ambient_custom_track');
    localStorage.removeItem('ambient_piped_from_radio');

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    }

    const tracks = this.getActiveThemeTracks();
    this.currentTrackIndex = (this.currentTrackIndex + 1) % tracks.length;
    localStorage.setItem('ambient_track_index', String(this.currentTrackIndex));

    localStorage.setItem('ambient_sound', 'enabled');
    this.play();
  }

  public setAmbientTrack(detail: {
    id?: string;
    name?: string;
    ytId?: string;
    code?: string;
    file?: string;
    isPipedFromRadio?: boolean;
  }): void {
    this.microSounds.play('surge');

    if (detail.isPipedFromRadio) {
      this.isPipedFromRadio = true;
      localStorage.setItem('ambient_piped_from_radio', 'true');
      this.customStreamTrack = {
        id: detail.id || (detail.ytId ? `stream-${detail.ytId}` : 'piped-track'),
        name: detail.name || 'RADIO STREAM',
        code: detail.code || 'SDR',
        type: detail.ytId ? 'stream' : detail.file ? 'local' : 'stream',
        ytId: detail.ytId,
        file: detail.file,
      };
      try {
        localStorage.setItem('ambient_custom_track', JSON.stringify(this.customStreamTrack));
      } catch {}
      localStorage.setItem('ambient_sound', 'enabled');
      this.play();
      return;
    }

    this.isPipedFromRadio = false;
    localStorage.removeItem('ambient_piped_from_radio');

    if (detail.id) {
      const tracks = this.getActiveThemeTracks();
      const foundIdx = tracks.findIndex((t) => t.id === detail.id);
      if (foundIdx !== -1) {
        this.customStreamTrack = null;
        this.currentTrackIndex = foundIdx;
        localStorage.setItem('ambient_track_index', String(foundIdx));
        localStorage.removeItem('ambient_custom_track');
        localStorage.setItem('ambient_sound', 'enabled');
        this.play();
        return;
      }
    }

    if (detail.ytId) {
      this.customStreamTrack = {
        id: detail.id || `stream-${detail.ytId}`,
        name: detail.name || 'RADIO STREAM',
        code: detail.code || 'SDR',
        type: 'stream',
        ytId: detail.ytId,
      };
      try {
        localStorage.setItem('ambient_custom_track', JSON.stringify(this.customStreamTrack));
      } catch {}
      localStorage.setItem('ambient_sound', 'enabled');
      this.play();
      return;
    }

    if (detail.file) {
      this.customStreamTrack = {
        id: detail.id || `file-${detail.code || 'CUSTOM'}`,
        name: detail.name || 'CUSTOM AUDIO',
        code: detail.code || 'AMB',
        type: 'local',
        file: detail.file,
      };
      try {
        localStorage.setItem('ambient_custom_track', JSON.stringify(this.customStreamTrack));
      } catch {}
      localStorage.setItem('ambient_sound', 'enabled');
      this.play();
      return;
    }
  }

  public togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
      localStorage.setItem('ambient_sound', 'disabled');
    } else {
      this.play();
      localStorage.setItem('ambient_sound', 'enabled');
    }
  }

  public play(): void {
    if (this.isMediaPlaying) return;
    this.isPlaying = true;
    this.updateUI(true);

    const track = this.getCurrentTrack();

    if (track.type === 'stream') {
      if (this.audio && !this.audio.paused) {
        this.fadeTo(0, 300, () => this.audio?.pause());
      }

      this.initYtPlayer();
      if (this.isYtReady && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
        const currentVideoUrl = this.ytPlayer.getVideoUrl?.() || '';
        if (track.ytId && !currentVideoUrl.includes(track.ytId)) {
          this.ytPlayer.loadVideoById(track.ytId);
        } else {
          this.ytPlayer.playVideo();
        }
        this.ytPlayer.setVolume(Math.round(this.targetVolume * 100));
      }
    } else {
      if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
        try {
          this.ytPlayer.pauseVideo();
        } catch {}
      }

      if (!this.audio) return;
      this.loadCurrentTrack();
      const promise = this.audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            this.fadeTo(this.targetVolume, 1200);
          })
          .catch(() => {
            this.isPlaying = false;
            this.updateUI(false);
          });
      }
    }

    this.dispatchChangedEvent();
  }

  public pause(): void {
    this.isPlaying = false;
    this.updateUI(false);

    if (this.audio) {
      this.fadeTo(0, 800, () => {
        this.audio?.pause();
      });
    }

    if (this.ytPlayer && typeof this.ytPlayer.pauseVideo === 'function') {
      try {
        this.ytPlayer.pauseVideo();
      } catch {}
    }

    this.dispatchChangedEvent();
  }

  private fadeTo(target: number, durationMs: number, onComplete?: () => void): void {
    if (!this.audio) return;
    if (this.fadeInterval !== null) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }

    const startVol = this.audio.volume;
    const diff = target - startVol;
    const steps = 25;
    const stepDuration = durationMs / steps;
    let step = 0;

    this.fadeInterval = window.setInterval(() => {
      step++;
      const progress = step / steps;
      if (this.audio) {
        this.audio.volume = Math.max(0, Math.min(1, startVol + diff * progress));
      }

      if (step >= steps) {
        if (this.fadeInterval !== null) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
        if (this.audio) {
          this.audio.volume = target;
        }
        if (onComplete) onComplete();
      }
    }, stepDuration);
  }

  private dispatchChangedEvent(): void {
    window.dispatchEvent(
      new CustomEvent('ambient-sound-changed', {
        detail: {
          track: this.getCurrentTrack(),
          isPlaying: this.isPlaying,
        },
      }),
    );
  }

  private updateUI(playing: boolean): void {
    const track = this.getCurrentTrack();

    this.toggleButtons.forEach((btn) => {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute(
        'title',
        playing
          ? `Atmospheric Ambient Sound: [${track.genre || this.currentTheme.toUpperCase()}] ${track.code} — ${track.name} [Active] (Click to Pause, Double-Click to Switch Track)`
          : `Atmospheric Ambient Sound: [${track.genre || this.currentTheme.toUpperCase()}] ${track.code} — ${track.name} [Muted] (Click to Play, Double-Click to Switch Track)`,
      );
    });

    this.labelElements.forEach((lbl) => {
      lbl.textContent = playing ? `AMB // ${track.code}` : 'AMB // OFF';
    });

    this.updateFxUI();
    this.dispatchChangedEvent();
  }
}

// Global initialization & Astro View Transitions listener
if (typeof window !== 'undefined') {
  const initOrUpdate = () => {
    if (window.__ambientSoundController) {
      window.__ambientSoundController.onPageLoad();
    } else {
      window.__ambientSoundController = new AmbientSoundController();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrUpdate);
  } else {
    initOrUpdate();
  }

  document.addEventListener('astro:page-load', initOrUpdate);
}
