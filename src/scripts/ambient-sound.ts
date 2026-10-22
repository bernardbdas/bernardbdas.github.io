/**
 * ambient-sound.ts — Multi-Track Atmospheric Audio & Interactive Micro-Sounds Engine
 * Extracted from https://dark.netflix.io/en
 *
 * Capabilities:
 * - 7 Ambient Soundscapes: 1 Subterranean Loop + 6 Atmospheric Interludes
 * - Continuous Playback across page transitions (via Astro ViewTransitions & persistent audio)
 * - Single-click: Play / Pause toggle with smooth volume fade
 * - Double-click: Cycle to next ambient soundscape with surge effect
 * - Micro-Sounds Interaction Engine:
 *   • Tactical Click on buttons, chips, links
 *   • Acoustic Ripple on card & nav hover (rate-throttled)
 *   • Modal Open chime on Resume overlay trigger
 *   • Modal Close / Deck Transition chord
 *   • Slider / Knob dial ticks
 *   • Mode & Category tab switch chimes
 *   • Theme cycle energy pulses
 * - Browser Autoplay Compliance:
 *   • Defaults to enabled on first visit
 *   • Attempts instant autoplay on load
 *   • Falls back to seamless trigger on first user gesture across document
 * - LocalStorage state persistence ('ambient_sound', 'ambient_track_index')
 * - SessionStorage position tracking ('ambient_audio_time', 'ambient_audio_timestamp')
 * - Page Visibility & SDR Radio automatic pause/resume coordination
 */

interface AmbientTrack {
  id: string;
  name: string;
  code: string;
  file: string;
}

const AMBIENT_TRACKS: AmbientTrack[] = [
  { id: 'loop', name: 'SUBTERRANEAN LOOP', code: 'T01', file: '/audio/ambient/dark-loop.mp3' },
  {
    id: 'interlude-1',
    name: 'CELLO PULSE',
    code: 'T02',
    file: '/audio/ambient/dark-interlude-1.mp3',
  },
  {
    id: 'interlude-2',
    name: 'TEMPORAL TICKS',
    code: 'T03',
    file: '/audio/ambient/dark-interlude-2.mp3',
  },
  {
    id: 'interlude-3',
    name: 'METALLIC RESONANCE',
    code: 'T04',
    file: '/audio/ambient/dark-interlude-3.mp3',
  },
  {
    id: 'interlude-4',
    name: 'ACOUSTIC DECAY',
    code: 'T05',
    file: '/audio/ambient/dark-interlude-4.mp3',
  },
  {
    id: 'interlude-5',
    name: 'HARMONIC VOID',
    code: 'T06',
    file: '/audio/ambient/dark-interlude-5.mp3',
  },
  {
    id: 'interlude-6',
    name: 'CINEMATIC THUNDER',
    code: 'T07',
    file: '/audio/ambient/dark-interlude-6.mp3',
  },
];

declare global {
  interface Window {
    __ambientSoundController?: AmbientSoundController;
  }
}

/**
 * MicroSoundsEngine — High-performance Web Audio API engine for tactile UI sounds
 *
 * Architecture:
 * - Uses AudioContext and pre-decoded in-memory AudioBuffers for instant (0ms latency) playback.
 * - Zero thread-blocking or disk-streaming stalls when clicking or hovering.
 * - Graceful fallback to HTML5 Audio elements if AudioContext is unavailable or restricted.
 */
class MicroSoundsEngine {
  private enabled = true;
  private lastHoverTime = 0;
  private readonly hoverThrottleMs = 90;

  private audioCtx: AudioContext | null = null;
  private bufferMap: Partial<Record<keyof typeof this.fxSources, AudioBuffer>> = {};
  private isPreloading = false;
  private fallbackPool: Record<string, HTMLAudioElement[]> = {};

  private readonly fxSources = {
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
  } as const;

  private readonly volumes: Record<keyof typeof this.fxSources, number> = {
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
    this.initAudioContext();
    this.attachGlobalInteractions();
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

    // Lazy load the sound buffers on first user interaction or idle callback
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

    const loadEntries = Object.entries(this.fxSources) as [keyof typeof this.fxSources, string][];

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
          // If fetch/decode fails, ensure fallback element exists
          this.ensureFallback(key);
        }
      }),
    );
  }

  private initFallbackPools(): void {
    for (const key of Object.keys(this.fxSources) as (keyof typeof this.fxSources)[]) {
      this.ensureFallback(key);
    }
  }

  private ensureFallback(name: keyof typeof this.fxSources): void {
    if (this.fallbackPool[name]) return;
    const src = this.fxSources[name];
    const poolSize = name === 'wave' ? 3 : 2;
    this.fallbackPool[name] = Array.from({ length: poolSize }, () => {
      const a = new Audio(src);
      a.preload = 'auto';
      a.volume = this.volumes[name] ?? 0.2;
      return a;
    });
  }

  public play(name: keyof typeof this.fxSources): void {
    if (!this.enabled) return;

    // Fast path: Web Audio API AudioBufferSourceNode (Zero main-thread blocking)
    if (this.audioCtx && this.bufferMap[name]) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      try {
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.bufferMap[name]!;

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.value = this.volumes[name] ?? 0.25;

        source.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);
        source.start(0);
        return;
      } catch {
        // Fall through to HTML5 fallback
      }
    }

    // Fallback path: HTML5 Audio pool
    this.ensureFallback(name);
    const pool = this.fallbackPool[name];
    if (pool && pool.length > 0) {
      const available = pool.find((a) => a.paused || a.ended) || pool[0];
      try {
        available.currentTime = 0;
        available.play().catch(() => {});
      } catch {
        // Ignored for autoplay policy
      }
    }
  }

  public playHover(): void {
    const now = Date.now();
    if (now - this.lastHoverTime < this.hoverThrottleMs) return;
    this.lastHoverTime = now;
    this.play('hover');
  }

  private attachGlobalInteractions(): void {
    // Click delegation
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
            '#soundToggle, #mobileSoundToggle, #fxToggle, #mobileFxToggle, .sound-toggle, .mobile-sound-toggle',
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

        // Terminal Re-run benchmark & System Hard Reload Purge
        if (
          target.matches(
            '#terminalRerunBtn, .terminal-rerun-btn, #hardReloadBtn, #mobileHardReloadBtn, #footerReloadBtn, [data-action="hard-reload"]',
          )
        ) {
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

        // General button or link click
        this.play('click');
      },
      true,
    );

    // Hover delegation
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

    // Range slider inputs
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

    // Background area wave event from 3D terrain
    window.addEventListener('terrain-wave', () => {
      this.play('wave');
    });
  }
}

/**
 * AmbientSoundController — Manages multi-track background ambient soundscape
 */
export class AmbientSoundController {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private fadeInterval: number | null = null;
  private readonly targetVolume = 0.32;
  private toggleButtons: HTMLElement[] = [];
  private labelElements: HTMLElement[] = [];
  private fxToggleButtons: HTMLElement[] = [];
  private fxLabelElements: HTMLElement[] = [];
  private isFxEnabled = true;
  private hasInteracted = false;
  private wasPlayingBeforeModal = false;
  private lastTrackChangeTime = 0;
  private microSounds: MicroSoundsEngine;

  constructor() {
    this.microSounds = new MicroSoundsEngine();
    if (typeof window === 'undefined') return;
    this.init();
  }

  public playFx(
    name:
      | 'click'
      | 'hover'
      | 'drawer'
      | 'modalOpen'
      | 'modalClose'
      | 'tab'
      | 'slider'
      | 'surge'
      | 'theme'
      | 'wave',
  ): void {
    this.microSounds.play(name);
  }

  private init(): void {
    // Restore saved track index
    const savedTrack = localStorage.getItem('ambient_track_index');
    if (savedTrack !== null) {
      const parsed = parseInt(savedTrack, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < AMBIENT_TRACKS.length) {
        this.currentTrackIndex = parsed;
      }
    }

    // Connect to persistent audio element if available, or create one
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

    // Restore play/mute preference (defaults to enabled for new visitors)
    const stored = localStorage.getItem('ambient_sound');
    const isExplicitlyDisabled = stored === 'disabled';

    // Restore FX preference independently
    const fxStored = localStorage.getItem('ui_fx_sound');
    this.isFxEnabled = fxStored !== 'disabled';
    this.microSounds.setEnabled(this.isFxEnabled);

    // If audio is already actively playing (e.g. from prior client router page), keep playing
    if (!this.audio.paused && this.audio.currentTime > 0) {
      this.isPlaying = true;
    } else {
      // Audio not yet playing: load current track source
      this.loadCurrentTrack();
      this.audio.volume = 0;
      this.restoreSavedPlaybackPosition();
    }

    // Attach tracking listeners on audio element
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

    // Autoplay attempt / First interaction fallback if not already playing
    if (!isExplicitlyDisabled && !this.isPlaying) {
      const startPromise = this.audio.play();
      if (startPromise !== undefined) {
        startPromise
          .then(() => {
            this.isPlaying = true;
            this.updateUI(true);
            this.fadeTo(this.targetVolume, 1200);
          })
          .catch(() => {
            // Autoplay blocked by browser policy without prior interaction
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
            window.addEventListener('pointerdown', onFirstInteraction, {
              once: true,
              passive: true,
            });
            window.addEventListener('keydown', onFirstInteraction, { once: true, passive: true });
            window.addEventListener('touchstart', onFirstInteraction, {
              once: true,
              passive: true,
            });
            window.addEventListener('scroll', onFirstInteraction, { once: true, passive: true });
          });
      }
    }

    // Page visibility handling
    document.addEventListener('visibilitychange', () => {
      if (!this.audio) return;
      if (document.hidden) {
        if (this.isPlaying) {
          this.fadeTo(0, 800, () => {
            this.audio?.pause();
          });
        }
      } else {
        const currentPref = localStorage.getItem('ambient_sound');
        if (currentPref !== 'disabled' && this.isPlaying) {
          this.audio
            .play()
            .then(() => {
              this.fadeTo(this.targetVolume, 1200);
            })
            .catch(() => {});
        }
      }
    });

    // SDR Radio Coordination
    window.addEventListener('sdr-radio-play', () => {
      if (this.isPlaying && this.audio) {
        this.fadeTo(0, 600, () => {
          this.audio?.pause();
        });
      }
    });

    window.addEventListener('sdr-radio-stop', () => {
      const currentPref = localStorage.getItem('ambient_sound');
      if (currentPref !== 'disabled' && this.isPlaying && this.audio) {
        this.audio
          .play()
          .then(() => {
            this.fadeTo(this.targetVolume, 1000);
          })
          .catch(() => {});
      }
    });

    // Auto-duck / pause ambient sound when a demo modal opens
    window.addEventListener('modalopen', () => {
      if (this.isPlaying && this.audio) {
        this.wasPlayingBeforeModal = true;
        this.fadeTo(0, 400, () => {
          this.audio?.pause();
        });
      }
    });

    // Auto-restore ambient sound when demo modal closes
    window.addEventListener('modalclose', () => {
      if (this.wasPlayingBeforeModal && this.audio) {
        this.wasPlayingBeforeModal = false;
        this.audio
          .play()
          .then(() => {
            this.fadeTo(this.targetVolume, 800);
          })
          .catch(() => {});
      }
    });
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
    const track = AMBIENT_TRACKS[this.currentTrackIndex];
    if (
      this.audio.src !== window.location.origin + track.file &&
      !this.audio.src.endsWith(track.file)
    ) {
      this.audio.src = track.file;
    }
  }

  /**
   * Called on every page change (e.g. astro:page-load) to rebind UI controls
   * WITHOUT interrupting or restarting the currently playing audio.
   */
  public onPageLoad(): void {
    // If the audio element was preserved by ClientRouter, re-verify its presence
    const audioEl = document.getElementById('ambient-audio-element') as HTMLAudioElement | null;
    if (audioEl && this.audio !== audioEl) {
      this.audio = audioEl;
    }

    if (this.audio && !this.audio.paused) {
      this.isPlaying = true;
    }

    this.bindUI();
    this.updateUI(this.isPlaying);
    this.updateFxUI();
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
            this.togglePlayPause();
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

    this.updateUI(this.isPlaying);
    this.updateFxUI();
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

  public nextTrack(): void {
    const now = Date.now();
    if (now - this.lastTrackChangeTime < 300) return;
    this.lastTrackChangeTime = now;

    this.microSounds.play('surge');

    this.currentTrackIndex = (this.currentTrackIndex + 1) % AMBIENT_TRACKS.length;
    localStorage.setItem('ambient_track_index', String(this.currentTrackIndex));

    const wasPlaying = this.isPlaying;
    const track = AMBIENT_TRACKS[this.currentTrackIndex];

    if (this.audio) {
      if (wasPlaying) {
        this.fadeTo(0, 300, () => {
          if (!this.audio) return;
          this.audio.src = track.file;
          this.audio
            .play()
            .then(() => {
              this.fadeTo(this.targetVolume, 800);
            })
            .catch(() => {});
        });
      } else {
        this.audio.src = track.file;
        this.play();
      }
    }

    localStorage.setItem('ambient_sound', 'enabled');
    this.isPlaying = true;
    this.updateUI(true);
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
    if (!this.audio) return;
    this.isPlaying = true;
    this.updateUI(true);

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

  public pause(): void {
    if (!this.audio) return;
    this.isPlaying = false;
    this.updateUI(false);
    this.fadeTo(0, 800, () => {
      this.audio?.pause();
    });
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

  private updateUI(playing: boolean): void {
    const track = AMBIENT_TRACKS[this.currentTrackIndex];

    this.toggleButtons.forEach((btn) => {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute(
        'title',
        playing
          ? `Atmospheric Ambient Sound: ${track.code} — ${track.name} [Active] (Click to Pause, Double-Click to Switch Track)`
          : `Atmospheric Ambient Sound: ${track.code} — ${track.name} [Muted] (Click to Play, Double-Click to Switch Track)`,
      );
    });

    this.labelElements.forEach((lbl) => {
      lbl.textContent = playing ? `AMB // ${track.code}` : 'AMB // OFF';
    });

    this.updateFxUI();
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
