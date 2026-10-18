/**
 * ambient-sound.ts — Atmospheric Background Audio (Dark Ambient Soundscape)
 * Fetched directly from https://dark.netflix.io/en (Dark_loop_v301)
 *
 * Implements subtle, non-intrusive background ambient audio with:
 * - HTML5 audio element with seamless looping
 * - Smooth fade-in (1.2s) and fade-out (0.8s) volume curves
 * - Autoplay compliance: auto-starts on first user interaction if enabled
 * - User preference persistence via localStorage ('ambient_sound')
 * - Audio coordination with SDR Radio on /media (auto-pause on radio playback)
 * - Page Visibility handling (auto-pause on hidden tab, auto-resume on return)
 */

class AmbientSoundController {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isAudioReady = false;
  private fadeInterval: number | null = null;
  private readonly targetVolume = 0.32; // Low ambient atmospheric level
  private toggleButtons: HTMLElement[] = [];
  private labelElements: HTMLElement[] = [];
  private hasInteracted = false;

  constructor() {
    if (typeof window === 'undefined') return;
    this.init();
  }

  private init(): void {
    // Gather UI elements across desktop nav and mobile drawer
    this.toggleButtons = Array.from(
      document.querySelectorAll<HTMLElement>('#soundToggle, #mobileSoundToggle'),
    );
    this.labelElements = Array.from(
      document.querySelectorAll<HTMLElement>('#soundLabel, #mobileSoundLabel'),
    );

    // Build audio element with fallback formats
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.preload = 'auto';

    const sourceOgg = document.createElement('source');
    sourceOgg.src = '/audio/dark-ambient-loop.ogg';
    sourceOgg.type = 'audio/ogg';

    const sourceMp3 = document.createElement('source');
    sourceMp3.src = '/audio/dark-ambient-loop.mp3';
    sourceMp3.type = 'audio/mpeg';

    this.audio.appendChild(sourceOgg);
    this.audio.appendChild(sourceMp3);
    this.audio.volume = 0;

    this.audio.addEventListener('canplaythrough', () => {
      this.isAudioReady = true;
    });

    // Determine initial state based on localStorage
    const stored = localStorage.getItem('ambient_sound');
    const isExplicitlyDisabled = stored === 'disabled';

    this.updateUI(false);

    // Bind click events on sound toggle buttons
    this.toggleButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    });

    // If not explicitly disabled, start playing on the very first user interaction
    // (matches dark.netflix.io behavior adhering to browser autoplay policies)
    if (!isExplicitlyDisabled) {
      const onFirstInteraction = () => {
        if (this.hasInteracted) return;
        this.hasInteracted = true;
        this.play();
        cleanupListeners();
      };

      const cleanupListeners = () => {
        window.removeEventListener('click', onFirstInteraction);
        window.removeEventListener('keydown', onFirstInteraction);
        window.removeEventListener('touchstart', onFirstInteraction);
      };

      window.addEventListener('click', onFirstInteraction, { once: true, passive: true });
      window.addEventListener('keydown', onFirstInteraction, { once: true, passive: true });
      window.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });
    }

    // Visibility API: pause when user leaves tab, resume when user returns
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

    // SDR Radio Coordination on /media
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

  public toggle(): void {
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
          // Autoplay blocked by browser policy without prior interaction
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
    const steps = 30;
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
    this.toggleButtons.forEach((btn) => {
      btn.classList.toggle('is-playing', playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute(
        'title',
        playing
          ? 'Atmospheric Sound: Active (Click to mute)'
          : 'Atmospheric Sound: Muted (Click to enable)',
      );
    });

    this.labelElements.forEach((lbl) => {
      lbl.textContent = playing ? 'SOUND // ON' : 'SOUND // OFF';
    });
  }
}

// Initialize controller on DOM readiness
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AmbientSoundController());
  } else {
    new AmbientSoundController();
  }
}
