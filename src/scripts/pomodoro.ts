/**
 * Pomodoro Flow Instrument & Telemetry Engine
 *
 * Hidden on the 3rd cycle of the HUD clock: Local > Bernard's > Pomodoro.
 * Minimalist HUD timer display with preset flows (50-10, 25-5),
 * Web Audio synthesized chimes (Zen, Synth, Radar, Beep),
 * and persisted telemetry (flows, work/break duration, daily/weekly/monthly statistics).
 */

export interface FlowSession {
  id: string;
  timestamp: number;
  type: 'work' | 'break';
  preset: '25-5' | '50-10';
  durationSeconds: number;
  completed: boolean;
}

export interface PomodoroTelemetry {
  sessions: FlowSession[];
}

export type ChimeTune = 'zen' | 'synth' | 'radar' | 'beep';
export type FlowPreset = '25-5' | '50-10';
export type FlowMode = 'work' | 'break';
export type FlowStatus = 'idle' | 'running' | 'paused';

const STORAGE_KEY_TELEMETRY = 'pomodoro_flow_telemetry_v1';
const STORAGE_KEY_PRESET = 'pomo_preset';
const STORAGE_KEY_MODE = 'pomo_mode';
const STORAGE_KEY_STATUS = 'pomo_status';
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

  public play(tune: ChimeTune): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (tune === 'zen') {
      // Singing bowl / Tibetan harmonic gong (Solfeggio 528Hz clarity frequency)
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
      // Cyberpunk ascending shimmer chord (Eb5, G5, Bb5, C6)
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
      // Tactical sonar / radar ping with resonant drop
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
      // Double chronometer high-precision beep
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

  public preset: FlowPreset = '25-5';
  public mode: FlowMode = 'work';
  public status: FlowStatus = 'idle';
  public remainingSeconds = 1500;
  public endTimestamp: number | null = null;
  public chime: ChimeTune = 'zen';

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private telemetry: PomodoroTelemetry = { sessions: [] };
  private sessionElapsedSeconds = 0;

  constructor() {
    this.chimeSynth = new ChimeSynthesizer();
    this.loadState();
    this.loadTelemetry();
    this.initInterval();

    // Recover timer if page was reloaded or navigated
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

  public getPresetSeconds(preset: FlowPreset, mode: FlowMode): number {
    if (preset === '50-10') {
      return mode === 'work' ? 50 * 60 : 10 * 60;
    }
    return mode === 'work' ? 25 * 60 : 5 * 60;
  }

  private loadState(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const savedPreset = localStorage.getItem(STORAGE_KEY_PRESET) as FlowPreset;
      if (savedPreset === '25-5' || savedPreset === '50-10') {
        this.preset = savedPreset;
      }
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as FlowMode;
      if (savedMode === 'work' || savedMode === 'break') {
        this.mode = savedMode;
      }
      const savedStatus = localStorage.getItem(STORAGE_KEY_STATUS) as FlowStatus;
      if (savedStatus === 'idle' || savedStatus === 'running' || savedStatus === 'paused') {
        this.status = savedStatus;
      }
      const savedRemaining = localStorage.getItem(STORAGE_KEY_REMAINING);
      if (savedRemaining && !Number.isNaN(Number(savedRemaining))) {
        this.remainingSeconds = Math.max(0, parseInt(savedRemaining, 10));
      } else {
        this.remainingSeconds = this.getPresetSeconds(this.preset, this.mode);
      }
      const savedEndTime = localStorage.getItem(STORAGE_KEY_END_TIME);
      if (savedEndTime && !Number.isNaN(Number(savedEndTime))) {
        this.endTimestamp = parseInt(savedEndTime, 10);
      }
      const savedChime = localStorage.getItem(STORAGE_KEY_CHIME) as ChimeTune;
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
      localStorage.setItem(STORAGE_KEY_PRESET, this.preset);
      localStorage.setItem(STORAGE_KEY_MODE, this.mode);
      localStorage.setItem(STORAGE_KEY_STATUS, this.status);
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
      this.sessionElapsedSeconds++;
      this.updateUI();
    }, 1000);
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

  public togglePlayPause(): void {
    if (this.status === 'running') {
      this.pause();
    } else {
      this.start();
    }
  }

  public reset(): void {
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.getPresetSeconds(this.preset, this.mode);
    this.sessionElapsedSeconds = 0;
    this.saveState();
    this.updateUI();
  }

  public skip(): void {
    this.mode = this.mode === 'work' ? 'break' : 'work';
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.getPresetSeconds(this.preset, this.mode);
    this.sessionElapsedSeconds = 0;
    this.saveState();
    this.updateUI();
  }

  public setPreset(preset: FlowPreset): void {
    if (this.preset === preset) return;
    this.preset = preset;
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.getPresetSeconds(this.preset, this.mode);
    this.sessionElapsedSeconds = 0;
    this.saveState();
    this.updateUI();
  }

  public setChime(chime: ChimeTune): void {
    this.chime = chime;
    this.saveState();
  }

  public testChime(): void {
    this.chimeSynth.play(this.chime);
  }

  private completeSession(): void {
    const plannedSecs = this.getPresetSeconds(this.preset, this.mode);

    // Record session telemetry
    const session: FlowSession = {
      id: `flow-${Date.now()}`,
      timestamp: Date.now(),
      type: this.mode,
      preset: this.preset,
      durationSeconds: plannedSecs,
      completed: true,
    };
    this.telemetry.sessions.unshift(session);
    if (this.telemetry.sessions.length > 500) {
      this.telemetry.sessions = this.telemetry.sessions.slice(0, 500);
    }
    this.saveTelemetry();

    // Play chime sound
    this.chimeSynth.play(this.chime);

    // System Notification if authorized
    try {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(this.mode === 'work' ? 'Flow Session Complete' : 'Break Period Finished', {
          body:
            this.mode === 'work'
              ? `You completed a ${this.preset === '50-10' ? '50m' : '25m'} focus block. Time for a well-deserved break!`
              : 'Rest completed. Ready to step back into the flow?',
          icon: '/favicon.svg',
        });
      }
    } catch {
      // Notification fallback
    }

    // Auto-advance mode: work -> break, break -> work
    this.mode = this.mode === 'work' ? 'break' : 'work';
    this.status = 'idle';
    this.endTimestamp = null;
    this.remainingSeconds = this.getPresetSeconds(this.preset, this.mode);
    this.sessionElapsedSeconds = 0;
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
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const ONE_WEEK_MS = 7 * ONE_DAY_MS;
    const ONE_MONTH_MS = 30 * ONE_DAY_MS;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTimestamp = startOfToday.getTime();

    const sessions = this.telemetry.sessions;

    const allWork = sessions.filter((s) => s.type === 'work' && s.completed);
    const allBreak = sessions.filter((s) => s.type === 'break' && s.completed);

    const totalFlows = allWork.length;
    const totalWorkSeconds = allWork.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalBreakSeconds = allBreak.reduce((acc, s) => acc + s.durationSeconds, 0);

    const todaySessions = sessions.filter((s) => s.timestamp >= todayTimestamp);
    const todayWork = todaySessions.filter((s) => s.type === 'work' && s.completed);
    const todayBreak = todaySessions.filter((s) => s.type === 'break' && s.completed);

    const weekSessions = sessions.filter((s) => s.timestamp >= now - ONE_WEEK_MS);
    const weekWork = weekSessions.filter((s) => s.type === 'work' && s.completed);
    const weekBreak = weekSessions.filter((s) => s.type === 'break' && s.completed);

    const monthSessions = sessions.filter((s) => s.timestamp >= now - ONE_MONTH_MS);
    const monthWork = monthSessions.filter((s) => s.type === 'work' && s.completed);
    const monthBreak = monthSessions.filter((s) => s.type === 'break' && s.completed);

    return {
      totalFlows,
      totalWorkSeconds,
      totalBreakSeconds,
      today: {
        flows: todayWork.length,
        workSeconds: todayWork.reduce((acc, s) => acc + s.durationSeconds, 0),
        breakSeconds: todayBreak.reduce((acc, s) => acc + s.durationSeconds, 0),
      },
      week: {
        flows: weekWork.length,
        workSeconds: weekWork.reduce((acc, s) => acc + s.durationSeconds, 0),
        breakSeconds: weekBreak.reduce((acc, s) => acc + s.durationSeconds, 0),
      },
      month: {
        flows: monthWork.length,
        workSeconds: monthWork.reduce((acc, s) => acc + s.durationSeconds, 0),
        breakSeconds: monthBreak.reduce((acc, s) => acc + s.durationSeconds, 0),
      },
      recentSessions: sessions.slice(0, 10),
    };
  }

  public generateReport(): string {
    const stats = this.getStats();
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return [
      '========================================',
      `POMODORO FLOW AUDIT // BERNARD DAS HUD`,
      `Generated: ${dateStr.toUpperCase()}`,
      '========================================',
      `ALL TIME:`,
      `- Total Completed Flows: ${stats.totalFlows}`,
      `- Focus Time Logged:     ${this.formatDuration(stats.totalWorkSeconds)}`,
      `- Break Time Logged:     ${this.formatDuration(stats.totalBreakSeconds)}`,
      '',
      `THIS MONTH (30D):`,
      `- Completed Flows:       ${stats.month.flows}`,
      `- Focus Time:            ${this.formatDuration(stats.month.workSeconds)}`,
      `- Break Time:            ${this.formatDuration(stats.month.breakSeconds)}`,
      '',
      `THIS WEEK (7D):`,
      `- Completed Flows:       ${stats.week.flows}`,
      `- Focus Time:            ${this.formatDuration(stats.week.workSeconds)}`,
      `- Break Time:            ${this.formatDuration(stats.week.breakSeconds)}`,
      '',
      `TODAY:`,
      `- Completed Flows:       ${stats.today.flows}`,
      `- Focus Time:            ${this.formatDuration(stats.today.workSeconds)}`,
      `- Break Time:            ${this.formatDuration(stats.today.breakSeconds)}`,
      '========================================',
    ].join('\n');
  }

  public updateUI(): void {
    if (typeof document === 'undefined') return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update Minimal Nav Timer
    const tagEl = document.getElementById('pomo-tag');
    if (tagEl) {
      tagEl.textContent = this.mode === 'work' ? 'WORK' : 'REST';
      tagEl.className = `pomo-tag ${this.mode === 'work' ? 'mode-work' : 'mode-rest'}`;
    }

    const timeEl = document.getElementById('pomo-time');
    if (timeEl) {
      timeEl.textContent = timeStr;
    }

    const playIconEl = document.getElementById('pomo-play-icon');
    if (playIconEl) {
      if (this.status === 'running') {
        playIconEl.innerHTML =
          '<svg class="pomo-svg-icon" width="7" height="7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      } else {
        playIconEl.innerHTML =
          '<svg class="pomo-svg-icon" width="7" height="7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
      }
    }

    const playBtn = document.getElementById('pomo-play-btn');
    if (playBtn) {
      playBtn.setAttribute(
        'title',
        this.status === 'running'
          ? 'Pause Flow'
          : `Start ${this.mode === 'work' ? 'Flow' : 'Break'}`,
      );
      playBtn.classList.toggle('is-running', this.status === 'running');
    }

    // Update Popover Deck elements if visible
    const deckPlayText = document.getElementById('pomo-deck-play-text');
    if (deckPlayText) {
      deckPlayText.textContent =
        this.status === 'running' ? 'PAUSE' : `START ${this.mode.toUpperCase()}`;
    }

    const preset25Btn = document.getElementById('pomo-preset-25');
    const preset50Btn = document.getElementById('pomo-preset-50');
    if (preset25Btn && preset50Btn) {
      preset25Btn.classList.toggle('is-active', this.preset === '25-5');
      preset50Btn.classList.toggle('is-active', this.preset === '50-10');
    }

    const chimeSelect = document.getElementById('pomo-chime-select') as HTMLSelectElement | null;
    if (chimeSelect && chimeSelect.value !== this.chime) {
      chimeSelect.value = this.chime;
    }

    const skipBtn = document.getElementById('pomo-action-skip');
    if (skipBtn) {
      skipBtn.textContent = this.mode === 'work' ? 'SKIP TO BREAK' : 'SKIP TO WORK';
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

    const activePresetEl = document.getElementById('pomo-stat-active-preset');
    if (activePresetEl) activePresetEl.textContent = this.preset === '50-10' ? '50 / 10' : '25 / 5';

    // Breakdown Table
    const todayFlowsEl = document.getElementById('pomo-td-today-flows');
    if (todayFlowsEl) todayFlowsEl.textContent = String(stats.today.flows);

    const todayFocusEl = document.getElementById('pomo-td-today-focus');
    if (todayFocusEl) todayFocusEl.textContent = this.formatDuration(stats.today.workSeconds);

    const todayBreakEl = document.getElementById('pomo-td-today-break');
    if (todayBreakEl) todayBreakEl.textContent = this.formatDuration(stats.today.breakSeconds);

    const weekFlowsEl = document.getElementById('pomo-td-week-flows');
    if (weekFlowsEl) weekFlowsEl.textContent = String(stats.week.flows);

    const weekFocusEl = document.getElementById('pomo-td-week-focus');
    if (weekFocusEl) weekFocusEl.textContent = this.formatDuration(stats.week.workSeconds);

    const weekBreakEl = document.getElementById('pomo-td-week-break');
    if (weekBreakEl) weekBreakEl.textContent = this.formatDuration(stats.week.breakSeconds);

    const monthFlowsEl = document.getElementById('pomo-td-month-flows');
    if (monthFlowsEl) monthFlowsEl.textContent = String(stats.month.flows);

    const monthFocusEl = document.getElementById('pomo-td-month-focus');
    if (monthFocusEl) monthFocusEl.textContent = this.formatDuration(stats.month.workSeconds);

    const monthBreakEl = document.getElementById('pomo-td-month-break');
    if (monthBreakEl) monthBreakEl.textContent = this.formatDuration(stats.month.breakSeconds);

    const allFlowsEl = document.getElementById('pomo-td-all-flows');
    if (allFlowsEl) allFlowsEl.textContent = String(stats.totalFlows);

    const allFocusEl = document.getElementById('pomo-td-all-focus');
    if (allFocusEl) allFocusEl.textContent = this.formatDuration(stats.totalWorkSeconds);

    const allBreakEl = document.getElementById('pomo-td-all-break');
    if (allBreakEl) allBreakEl.textContent = this.formatDuration(stats.totalBreakSeconds);

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
              ? `<span class="pomo-log-tag tag-work">FOCUS</span>`
              : `<span class="pomo-log-tag tag-break">REST</span>`;
          return `
            <div class="pomo-history-row">
              <span class="pomo-log-date">${dayStr.toUpperCase()} ${timeStr}</span>
              <span class="pomo-log-type">${typeBadge}</span>
              <span class="pomo-log-preset">${s.preset}</span>
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
