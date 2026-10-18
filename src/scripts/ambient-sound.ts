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
 * MicroSoundsEngine — High-performance audio pool for tactile UI sounds
 */
class MicroSoundsEngine {
  private enabled = true;
  private lastHoverTime = 0;
  private readonly hoverThrottleMs = 110;

  private fxPool: Record<string, HTMLAudioElement[]> = {};
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

  constructor() {
    this.initPools();
    this.attachGlobalInteractions();
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  private initPools(): void {
    for (const [key, src] of Object.entries(this.fxSources)) {
      const poolSize = key === 'wave' ? 4 : 2;
      this.fxPool[key] = Array.from({ length: poolSize }, () => new Audio(src));
      this.fxPool[key].forEach((a) => {
        a.preload = 'auto';
        a.volume = key === 'hover' ? 0.12 : key === 'click' ? 0.22 : key === 'wave' ? 0.35 : 0.28;
      });
    }
  }

  public play(name: keyof typeof this.fxSources): void {
    if (!this.enabled) return;
    const pool = this.fxPool[name];
    if (!pool) return;

    const available = pool.find((a) => a.paused || a.ended) || pool[0];
    try {
      available.currentTime = 0;
      available.play().catch(() => {});
    } catch {
      // Ignored for autoplay policy
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
          'button, a, input[type="search"], .ott-filter-chip, .sdr-genre-pill, .telemetry-pill, .theme-toggle, .palette-item, .view-resume-trigger, .modal-close-btn, .media-mode-tab',
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
          target.matches('.theme-toggle, .palette-item, .mobile-theme-toggle, [data-set-theme]')
        ) {
          this.play('theme');
          return;
        }

        // Resume Modal triggers
        if (target.matches('#viewResumeBtn, .view-resume-trigger, [data-open-resume]')) {
          this.play('modalOpen');
          return;
        }

        // Modal close
        if (target.matches('#resumeModalClose, .resume-modal-close, #resumeModalBackdrop')) {
          this.play('modalClose');
          return;
        }

        // Tabs & OTT platform chips
        if (target.matches('.media-mode-tab, .ott-filter-chip, .sdr-genre-pill')) {
          this.play('tab');
          return;
        }

        // Mobile drawer toggle
        if (target.matches('#mobileNavToggle, #mobileNavClose')) {
          this.play('drawer');
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
          '.nav-link-item, .ott-filter-chip, .media-mode-tab, .theme-toggle, .mobile-nav-item, .project-card, .media-item-card, .sdr-station-card, .view-resume-trigger, .sound-toggle',
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
        this.nextTrack();
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
