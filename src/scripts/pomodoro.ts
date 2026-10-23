/**
 * Pomodoro Flow Instrument & Telemetry Engine
 *
 * Minimal HUD counter with:
 * - Animated sliding segmented toggle: FLOW vs BREAK
 * - Clickable timer number that cycles duration presets
 * - Immersive 3, 2, 1 start sequence with audio cues & big screen text
 * - Web Audio API synthesized completion chimes
 * - Detailed view with GitHub-style productivity commit graph & lifetime metrics
 */

export interface FlowSession {
  id: string;
  timestamp: number;
  type: 'work' | 'break';
  durationSeconds: number;
  completed: boolean;
}

export interface PomodoroTelemetry {
  sessions: FlowSession[];
}

export type FlowMode = 'work' | 'break';
export type FlowStatus = 'idle' | 'running' | 'paused' | 'countdown';

const WORK_PRESETS = [25 * 60, 50 * 60, 90 * 60];
const BREAK_PRESETS = [5 * 60, 10 * 60, 15 * 60];

const STORAGE_KEY_TELEMETRY = 'pomodoro_flow_telemetry_v1';
const STORAGE_KEY_MODE = 'pomo_mode';
const STORAGE_KEY_STATUS = 'pomo_status';
const STORAGE_KEY_WORK_DUR = 'pomo_work_duration';
const STORAGE_KEY_BREAK_DUR = 'pomo_break_duration';
const STORAGE_KEY_REMAINING = 'pomo_remaining';
const STORAGE_KEY_END_TIME = 'pomo_end_time';
const STORAGE_KEY_CHIME = 'pomo_chime';

export class ChimeSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playCountdownTick(step: 3 | 2 | 1 | 0): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (step === 3) {
      // Step 3: Low-mid focus resonance
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.52);
    } else if (step === 2) {
      // Step 2: Mid-high harmonic step
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(554.37, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.52);
    } else if (step === 1) {
      // Step 1: High crisp readiness cue
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.35);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.52);
    } else if (step === 0) {
      // GO / COMMENCE: Warm expansive resonant chord
      const freqs = [528, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const noteStart = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        g.gain.setValueAtTime(0.0001, noteStart);
        g.gain.linearRampToValueAtTime(0.2, noteStart + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.4);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 1.5);
      });
    }
  }

  public play(tune: 'zen' | 'synth' | 'radar' | 'beep'): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (tune === 'zen') {
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.3, now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      master.connect(ctx.destination);

      const harmonics = [528, 528 * 1.5, 528 * 2.76, 528 * 5.4];
      const gains = [0.55, 0.28, 0.12, 0.05];

      harmonics.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(gains[idx], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (2.7 - idx * 0.4));
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + 2.8);
      });
    } else if (tune === 'synth') {
      const notes = [622.25, 783.99, 932.33, 1046.5];
      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.11;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);
        g.gain.setValueAtTime(0.0001, noteStart);
        g.gain.linearRampToValueAtTime(0.25, noteStart + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.2);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 1.3);
      });
    } else if (tune === 'radar') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1150, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
      g.gain.setValueAtTime(0.32, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } else if (tune === 'beep') {
      [0, 0.13].forEach((delay) => {
        const t = now + delay;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1180, t);
        g.gain.setValueAtTime(0.14, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      });
    }
  }
}

export class PomodoroEngine {
  private static instance: PomodoroEngine | null = null;
  public chimeSynth: ChimeSynthesizer;

  public mode: FlowMode = 'work';
  public status: FlowStatus = 'idle';
  public workDuration = 25 * 60;
  public breakDuration = 5 * 60;
  public remainingSeconds = 25 * 60;
  public endTimestamp: number | null = null;
  public chime: 'zen' | 'synth' | 'radar' | 'beep' = 'zen';

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private countdownTimeout: ReturnType<typeof setTimeout> | null = null;
  private telemetry: PomodoroTelemetry = { sessions: [] };

  constructor() {
    this.chimeSynth = new ChimeSynthesizer();
    this.loadState();
    this.loadTelemetry();
    this.initInterval();

    if (this.status === 'running' && this.endTimestamp) {
      const now = Date.now();
      if (now >= this.endTimestamp) {
        this.completeSession();
      } else {
        this.remainingSeconds = Math.max(1, Math.ceil((this.endTimestamp - now) / 1000));
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.status === 'running' && this.endTimestamp) {
          const now = Date.now();
          if (now >= this.endTimestamp) {
            this.completeSession();
          } else {
            this.remainingSeconds = Math.max(1, Math.ceil((this.endTimestamp - now) / 1000));
            this.updateUI();
          }
        }
      });
    }
  }

  public static getInstance(): PomodoroEngine {
    if (!PomodoroEngine.instance) {
      PomodoroEngine.instance = new PomodoroEngine();
    }
    return PomodoroEngine.instance;
  }

  private loadState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as FlowMode;
      if (savedMode === 'work' || savedMode === 'break') {
        this.mode = savedMode;
      }
      const savedWork = localStorage.getItem(STORAGE_KEY_WORK_DUR);
      if (savedWork && !Number.isNaN(Number(savedWork))) {
        this.workDuration = parseInt(savedWork, 10);
      }
      const savedBreak = localStorage.getItem(STORAGE_KEY_BREAK_DUR);
      if (savedBreak && !Number.isNaN(Number(savedBreak))) {
        this.breakDuration = parseInt(savedBreak, 10);
      }
      const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS) as FlowStatus;
      if (savedStatus === 'running' || savedStatus === 'paused') {
        this.status = savedStatus;
      } else {
        this.status = 'idle';
      }
      const savedRemaining = localStorage.getItem(STORAGE_KEY_REMAINING);
      if (savedRemaining && !Number.isNaN(Number(savedRemaining))) {
        this.remainingSeconds = Math.max(0, parseInt(savedRemaining, 10));
      } else {
        this.remainingSeconds = this.mode === 'work' ? this.workDuration : this.breakDuration;
      }
      const savedEndTime = localStorage.getItem(STORAGE_KEY_END_TIME);
      if (savedEndTime && !Number.isNaN(Number(savedEndTime))) {
        this.endTimestamp = parseInt(savedEndTime, 10);
      }
      const savedChime = localStorage.getItem(STORAGE_KEY_CHIME) as 'zen';
      if (['zen', 'synth', 'radar', 'beep'].includes(savedChime)) {
        this.chime = savedChime;
      }
    } catch {
      // Storage fallback
    }
  }

  private saveState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_MODE, this.mode);
      localStorage.setItem(STORAGE_KEY_STATUS, this.status);
      localStorage.setItem(STORAGE_KEY_WORK_DUR, String(this.workDuration));
      localStorage.setItem(STORAGE_KEY_BREAK_DUR, String(this.breakDuration));
      localStorage.setItem(STORAGE_KEY_REMAINING, String(this.remainingSeconds));
      if (this.endTimestamp) {
        localStorage.setItem(STORAGE_KEY_END_TIME, String(this.endTimestamp));
      } else {
        localStorage.removeItem(STORAGE_KEY_END_TIME);
      }
      localStorage.setItem(STORAGE_KEY_CHIME, this.chime);
    } catch {
      // Storage fallback
    }
  }

  private loadTelemetry(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TELEMETRY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.sessions)) {
          this.telemetry = parsed;
        }
      }
    } catch {
      this.telemetry = { sessions: [] };
    }
  }

  private saveTelemetry(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_TELEMETRY, JSON.stringify(this.telemetry));
    } catch {
      // Storage fallback
    }
  }

  private initInterval(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.status !== 'running') return;

      if (this.endTimestamp) {
        const now = Date.now();
        const diff = Math.ceil((this.endTimestamp - now) / 1000);
        if (diff <= 0) {
          this.remainingSeconds = 0;
          this.completeSession();
          return;
        }
        this.remainingSeconds = diff;
      } else {
        this.remainingSeconds = Math.max(0, this.remainingSeconds - 1);
        if (this.remainingSeconds <= 0) {
          this.completeSession();
          return;
        }
      }
      this.updateUI();
    }, 1000);
  }

  /**
   * Mode change with sliding animation
   */
  public setMode(newMode: FlowMode): void {
    if (this.mode === newMode) return;
    this.abortCountdown();
    this.mode = newMode;
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.mode === 'work' ? this.workDuration : this.breakDuration;
    this.saveState();
    this.updateUI();
  }

  /**
   * Cycle preset duration under the active mode
   */
  public cyclePresetForCurrentMode(): void {
    this.abortCountdown();
    if (this.mode === 'work') {
      const idx = WORK_PRESETS.indexOf(this.workDuration);
      const nextIdx = (idx + 1) % WORK_PRESETS.length;
      this.workDuration = WORK_PRESETS[nextIdx];
      this.remainingSeconds = this.workDuration;
    } else {
      const idx = BREAK_PRESETS.indexOf(this.breakDuration);
      const nextIdx = (idx + 1) % BREAK_PRESETS.length;
      this.breakDuration = BREAK_PRESETS[nextIdx];
      this.remainingSeconds = this.breakDuration;
    }
    this.status = 'idle';
    this.endTimestamp = null;
    this.saveState();
    this.updateUI();
  }

  /**
   * Play / Pause toggle with 3, 2, 1 Countdown Sequence on start
   */
  public togglePlayPause(): void {
    if (this.status === 'running') {
      this.pause();
    } else if (this.status === 'countdown') {
      this.abortCountdown();
    } else {
      this.startWithCountdown();
    }
  }

  public startWithCountdown(): void {
    this.abortCountdown();
    this.status = 'countdown';
    this.updateUI();

    const overlay = document.getElementById('pomoCountdownOverlay');
    const numEl = document.getElementById('pomoCountdownNum');
    const subEl = document.getElementById('pomoCountdownSub');

    if (!overlay || !numEl) {
      this.start();
      return;
    }

    overlay.style.display = 'flex';
    overlay.classList.remove('is-fading');
    overlay.classList.toggle('is-break', this.mode === 'break');
    document.body.style.overflow = 'hidden';

    const runStep = (step: 3 | 2 | 1 | 0) => {
      if (this.status !== 'countdown') return;

      this.chimeSynth.playCountdownTick(step);

      if (step > 0) {
        numEl.textContent = String(step);
        numEl.className = `pomo-countdown-num step-${step}`;
        if (subEl) {
          subEl.textContent =
            this.mode === 'work' ? 'PREPARING FOCUS BLOCK' : 'PREPARING REST PERIOD';
        }
        this.countdownTimeout = setTimeout(() => {
          runStep((step - 1) as 3 | 2 | 1 | 0);
        }, 900);
      } else {
        // Step 0: COMMENCE
        numEl.textContent = this.mode === 'work' ? 'FLOW' : 'REST';
        numEl.className = 'pomo-countdown-num step-commence';
        if (subEl) {
          subEl.textContent = this.mode === 'work' ? 'DEEP WORK COMMENCED' : 'REST ACTIVE';
        }

        overlay.classList.add('is-fading');
        this.countdownTimeout = setTimeout(() => {
          overlay.style.display = 'none';
          overlay.classList.remove('is-fading');
          document.body.style.overflow = '';
          this.start();
        }, 450);
      }
    };

    runStep(3);
  }

  public abortCountdown(): void {
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout);
      this.countdownTimeout = null;
    }
    const overlay = document.getElementById('pomoCountdownOverlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.classList.remove('is-fading');
      document.body.style.overflow = '';
    }
    if (this.status === 'countdown') {
      this.status = 'idle';
      this.updateUI();
    }
  }

  public start(): void {
    this.status = 'running';
    this.endTimestamp = Date.now() + this.remainingSeconds * 1000;
    this.saveState();
    this.updateUI();
  }

  public pause(): void {
    this.status = 'paused';
    this.endTimestamp = null;
    this.saveState();
    this.updateUI();
  }

  public reset(): void {
    this.abortCountdown();
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.mode === 'work' ? this.workDuration : this.breakDuration;
    this.saveState();
    this.updateUI();
  }

  private completeSession(): void {
    const plannedSecs = this.mode === 'work' ? this.workDuration : this.breakDuration;

    // Record session telemetry
    const session: FlowSession = {
      id: `flow-${Date.now()}`,
      timestamp: Date.now(),
      type: this.mode,
      durationSeconds: plannedSecs,
      completed: true,
    };
    this.telemetry.sessions.unshift(session);
    if (this.telemetry.sessions.length > 800) {
      this.telemetry.sessions = this.telemetry.sessions.slice(0, 800);
    }
    this.saveTelemetry();

    this.chimeSynth.play(this.chime);

    // Switch mode automatically
    this.mode = this.mode === 'work' ? 'break' : 'work';
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.mode === 'work' ? this.workDuration : this.breakDuration;
    this.saveState();
    this.updateUI();
  }

  public clearTelemetry(): void {
    this.telemetry = { sessions: [] };
    this.saveTelemetry();
    this.renderStatsModal();
  }

  public formatDuration(totalSeconds: number): string {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }

  public getStats() {
    const sessions = this.telemetry.sessions;
    const workSessions = sessions.filter((s) => s.type === 'work' && s.completed);
    const breakSessions = sessions.filter((s) => s.type === 'break' && s.completed);

    const totalFlows = workSessions.length;
    const totalWorkSeconds = workSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalBreakSeconds = breakSessions.reduce((acc, s) => acc + s.durationSeconds, 0);

    // Group sessions by day (YYYY-MM-DD)
    const dayMap = new Map<string, { flows: number; seconds: number }>();
    sessions.forEach((s) => {
      if (s.type !== 'work' || !s.completed) return;
      const d = new Date(s.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const cur = dayMap.get(key) || { flows: 0, seconds: 0 };
      cur.flows += 1;
      cur.seconds += s.durationSeconds;
      dayMap.set(key, cur);
    });

    return {
      totalFlows,
      totalWorkSeconds,
      totalBreakSeconds,
      dayMap,
      recentSessions: sessions.slice(0, 10),
    };
  }

  public updateUI(): void {
    if (typeof document === 'undefined') return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const timeEl = document.getElementById('pomo-time');
    if (timeEl) {
      timeEl.textContent = timeStr;
      timeEl.title = `Preset: ${mins}m (Click to cycle preset duration)`;
    }

    const clockContainer = document.getElementById('local-clock');
    if (clockContainer) {
      clockContainer.classList.toggle('is-mode-flow', this.mode === 'work');
      clockContainer.classList.toggle('is-mode-break', this.mode === 'break');
    }

    const sliderTrack = document.getElementById('pomo-slider-track');
    if (sliderTrack) {
      sliderTrack.classList.toggle('is-break', this.mode === 'break');
    }

    const flowBtn = document.getElementById('pomo-flow-btn');
    const breakBtn = document.getElementById('pomo-break-btn');
    if (flowBtn && breakBtn) {
      flowBtn.classList.toggle('is-active', this.mode === 'work');
      breakBtn.classList.toggle('is-active', this.mode === 'break');
    }

    const playBtn = document.getElementById('pomo-play-btn');
    const playIconEl = document.getElementById('pomo-play-icon');
    if (playBtn && playIconEl) {
      playBtn.classList.toggle('is-running', this.status === 'running');
      if (this.status === 'running') {
        playIconEl.innerHTML =
          '<svg class="pomo-svg-icon" width="7" height="7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        playBtn.title = 'Pause Flow';
      } else {
        playIconEl.innerHTML =
          '<svg class="pomo-svg-icon" width="7" height="7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
        playBtn.title = `Start ${this.mode === 'work' ? 'Flow' : 'Break'}`;
      }
    }
  }

  public renderStatsModal(): void {
    if (typeof document === 'undefined') return;
    const stats = this.getStats();

    // Summary Cards
    const totalFlowsEl = document.getElementById('pomo-stat-total-flows');
    if (totalFlowsEl) totalFlowsEl.textContent = String(stats.totalFlows);

    const totalFocusEl = document.getElementById('pomo-stat-total-focus');
    if (totalFocusEl) totalFocusEl.textContent = this.formatDuration(stats.totalWorkSeconds);

    const totalBreakEl = document.getElementById('pomo-stat-total-break');
    if (totalBreakEl) totalBreakEl.textContent = this.formatDuration(stats.totalBreakSeconds);

    // Lifetime Productivity Metric
    const lifetimeMetricEl = document.getElementById('pomo-stat-lifetime-ratio');
    if (lifetimeMetricEl) {
      const activeDays = stats.dayMap.size;
      const totalHours = (stats.totalWorkSeconds / 3600).toFixed(1);
      lifetimeMetricEl.textContent = `${totalHours} hrs / ${activeDays} active days`;
    }

    // Render GitHub-style Commit Heatmap Matrix (Last 16 weeks / 112 days)
    const commitGraphEl = document.getElementById('pomo-commit-graph');
    if (commitGraphEl) {
      const now = new Date();
      const numDays = 112; // 16 weeks * 7 days
      const days = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dayData = stats.dayMap.get(key) || { flows: 0, seconds: 0 };
        days.push({
          dateStr: key,
          dayOfWeek: d.getDay(),
          flows: dayData.flows,
          seconds: dayData.seconds,
        });
      }

      // Group into weeks
      const cellsHtml = days
        .map((day) => {
          let lvl = 0;
          if (day.seconds > 0) lvl = 1;
          if (day.seconds >= 25 * 60) lvl = 2;
          if (day.seconds >= 50 * 60) lvl = 3;
          if (day.seconds >= 100 * 60) lvl = 4;

          const title = `${day.dateStr}: ${day.flows} flow${day.flows === 1 ? '' : 's'} (${this.formatDuration(day.seconds)})`;
          return `<div class="pomo-graph-cell lvl-${lvl}" title="${title}" data-date="${day.dateStr}"></div>`;
        })
        .join('');

      commitGraphEl.innerHTML = cellsHtml;
    }

    // Recent Sessions Log
    const historyList = document.getElementById('pomo-history-list');
    if (historyList) {
      if (stats.recentSessions.length === 0) {
        historyList.innerHTML = `<div class="pomo-history-empty">NO COMPLETED FLOW SESSIONS RECORDED YET. START A FLOW TO LOG TELEMETRY.</div>`;
      } else {
        const rows = stats.recentSessions.map((s) => {
          const date = new Date(s.timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dayStr = date.toLocaleDateString([], { day: '2-digit', month: 'short' });
          const typeBadge =
            s.type === 'work'
              ? `<span class="pomo-log-tag tag-work">FLOW</span>`
              : `<span class="pomo-log-tag tag-break">BREAK</span>`;
          return `
            <div class="pomo-history-row">
              <span class="pomo-log-date">${dayStr.toUpperCase()} ${timeStr}</span>
              <span class="pomo-log-type">${typeBadge}</span>
              <span class="pomo-log-dur">${this.formatDuration(s.durationSeconds)}</span>
              <span class="pomo-log-status">✓ COMPLETED</span>
            </div>
          `;
        });
        historyList.innerHTML = rows.join('');
      }
    }
  }
}
