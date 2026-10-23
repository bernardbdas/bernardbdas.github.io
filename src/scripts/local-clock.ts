/**
 * User Local Time, Bernard's Clock & Pomodoro Flow HUD Clock
 *
 * Cycles on click:
 * Cycle 1: Local Clock
 * Cycle 2: Bernard's Clock (Asia/Kolkata IST)
 * Cycle 3: Pomodoro Flow Clock
 *
 * In Local/Bernard mode: Displays live date, time, timezone.
 * Shift-click copies the active timestamp.
 * In Pomodoro mode: Minimal HUD counter with animated FLOW/BREAK slider,
 * clickable timer number that cycles duration presets,
 * immersive 3-2-1 slow starting chime with big text on screen,
 * and persistent detailed productivity heatmap comparison.
 */

import { PomodoroEngine } from './pomodoro';

const BERNARD_TIMEZONE = 'Asia/Kolkata';

function getTimezoneAbbr(): string {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZoneName: 'short',
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart && tzPart.value) {
      return tzPart.value;
    }
  } catch {
    // fallback
  }

  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const m = String(Math.abs(offset) % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textArea);
    return ok;
  } catch {
    return false;
  }
}

export function initLocalClock(): void {
  const container = document.getElementById('local-clock');
  const badgeEl = document.getElementById('clock-badge');
  const clockDisplayEl = document.getElementById('clock-display');
  const weekdayEl = document.getElementById('clock-weekday');
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');
  const tzEl = document.getElementById('clock-tz');

  // Pomodoro HUD elements
  const pomoDisplayEl = document.getElementById('pomo-display');
  const pomoFlowBtn = document.getElementById('pomo-flow-btn');
  const pomoBreakBtn = document.getElementById('pomo-break-btn');
  const pomoTimeClickable = document.getElementById('pomo-time');
  const pomoPlayBtn = document.getElementById('pomo-play-btn');
  const pomoOpenStatsBtn = document.getElementById('pomo-open-stats-btn');

  // Detailed Statistics Modal elements
  const pomoStatsModal = document.getElementById('pomoStatsModal');
  const pomoModalClose = document.getElementById('pomoModalClose');
  const pomoCloseModalBtn = document.getElementById('pomoCloseModalBtn');
  const pomoCopyReportBtn = document.getElementById('pomoCopyReportBtn');
  const pomoResetStatsBtn = document.getElementById('pomoResetStatsBtn');

  if (!container || !dateEl || !timeEl) return;
  if (container.dataset.clockBound === 'true') return;
  container.dataset.clockBound = 'true';

  type ClockMode = 'local' | 'bernard' | 'pomodoro';
  let mode: ClockMode = (localStorage.getItem('clock_mode') as ClockMode) || 'local';
  if (!['local', 'bernard', 'pomodoro'].includes(mode)) {
    mode = 'local';
  }

  const pomoEngine = PomodoroEngine.getInstance();
  let currentString = '';
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCopied = false;
  let lastToggleTime = 0;

  function updateClock(): void {
    const now = new Date();

    if (mode === 'pomodoro') {
      if (badgeEl) badgeEl.textContent = 'POMODORO';
      container!.classList.add('mode-pomodoro');
      container!.classList.remove('mode-bernard');
      if (clockDisplayEl) clockDisplayEl.style.display = 'none';
      if (pomoDisplayEl) pomoDisplayEl.style.display = 'inline-flex';
      container!.title =
        'Pomodoro Flow Instrument (Click badge or background to switch to Local Time)';
      pomoEngine.updateUI();
      return;
    }

    if (pomoDisplayEl) pomoDisplayEl.style.display = 'none';
    if (clockDisplayEl) clockDisplayEl.style.display = 'inline-flex';
    container!.classList.remove('mode-pomodoro');

    let weekdayStr = '';
    let dateStr = '';
    let timeStr = '';
    let tzStr = '';

    if (mode === 'bernard') {
      try {
        weekdayStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: BERNARD_TIMEZONE,
          weekday: 'short',
        })
          .format(now)
          .toUpperCase();

        const day = new Intl.DateTimeFormat('en-GB', {
          timeZone: BERNARD_TIMEZONE,
          day: '2-digit',
        }).format(now);
        const month = new Intl.DateTimeFormat('en-GB', {
          timeZone: BERNARD_TIMEZONE,
          month: 'short',
        })
          .format(now)
          .toUpperCase();
        const year = new Intl.DateTimeFormat('en-GB', {
          timeZone: BERNARD_TIMEZONE,
          year: 'numeric',
        }).format(now);
        dateStr = `${day} ${month} ${year}`;

        timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: BERNARD_TIMEZONE,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23',
        }).format(now);

        tzStr = 'IST';
      } catch {
        weekdayStr = 'THU';
        dateStr = now.toLocaleDateString();
        timeStr = now.toLocaleTimeString();
        tzStr = 'IST';
      }

      if (badgeEl) badgeEl.textContent = "BERNARD'S CLOCK";
      container!.classList.add('mode-bernard');
      container!.title =
        "Bernard's Clock — Asia/Kolkata (IST) (Click for Pomodoro Flow Timer, Shift+Click to copy)";
      currentString = `Bernard's Clock (Asia/Kolkata): ${weekdayStr}, ${dateStr} ${timeStr} ${tzStr}`;
    } else {
      weekdayStr = now.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      const day = String(now.getDate()).padStart(2, '0');
      const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = now.getFullYear();
      dateStr = `${day} ${month} ${year}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeStr = `${hours}:${minutes}:${seconds}`;

      tzStr = getTimezoneAbbr();

      if (badgeEl) badgeEl.textContent = 'LOCAL';
      container!.classList.remove('mode-bernard');
      container!.title = "Your Local Time (Click for Bernard's Clock, Shift+Click to copy)";
      currentString = `Local Time: ${weekdayStr}, ${dateStr} ${timeStr} ${tzStr}`;
    }

    if (weekdayEl && weekdayEl.textContent !== weekdayStr) weekdayEl.textContent = weekdayStr;
    if (dateEl && dateEl.textContent !== dateStr) dateEl.textContent = dateStr;
    if (!isCopied && timeEl && timeEl.textContent !== timeStr) timeEl.textContent = timeStr;
    if (tzEl && tzEl.textContent !== tzStr) tzEl.textContent = tzStr;
  }

  function cycleMode(): void {
    const now = Date.now();
    if (now - lastToggleTime < 180) return;
    lastToggleTime = now;

    if (mode === 'local') {
      mode = 'bernard';
    } else if (mode === 'bernard') {
      mode = 'pomodoro';
    } else {
      mode = 'local';
    }
    localStorage.setItem('clock_mode', mode);
    updateClock();
  }

  const handleCopy = async (): Promise<void> => {
    if (!currentString || mode === 'pomodoro') return;
    const ok = await copyText(currentString);
    if (!ok) return;

    if (copyTimeout) clearTimeout(copyTimeout);
    isCopied = true;
    container.classList.add('copied');
    if (timeEl) timeEl.textContent = 'COPIED!';
    container.title = `Copied: ${currentString}`;

    copyTimeout = setTimeout(() => {
      isCopied = false;
      container.classList.remove('copied');
      updateClock();
      copyTimeout = null;
    }, 1500);
  };

  // Clock click: Cycle modes or handle controls
  container.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore cycling if interacting with pomo controls
    if (
      target.closest(
        '#pomo-flow-btn, #pomo-break-btn, #pomo-time, #pomo-play-btn, #pomo-open-stats-btn, .pomo-toggle-btn, .pomo-mini-btn',
      )
    ) {
      return;
    }

    if (e.shiftKey && (mode === 'local' || mode === 'bernard')) {
      e.preventDefault();
      handleCopy();
      return;
    }

    e.preventDefault();
    cycleMode();
  });

  // Native double click copies timestamp in local or bernard mode
  container.addEventListener('dblclick', (e: MouseEvent) => {
    if (mode !== 'pomodoro') {
      e.preventDefault();
      handleCopy();
    }
  });

  // Keyboard accessibility
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.id === 'pomo-play-btn' ||
          activeEl.id === 'pomo-flow-btn' ||
          activeEl.id === 'pomo-break-btn' ||
          activeEl.id === 'pomo-time' ||
          activeEl.id === 'pomo-open-stats-btn')
      ) {
        return;
      }
      e.preventDefault();
      if (e.shiftKey && (mode === 'local' || mode === 'bernard')) {
        handleCopy();
      } else {
        cycleMode();
      }
    }
  });

  // Pomodoro Slider buttons: FLOW vs BREAK
  pomoFlowBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    pomoEngine.setMode('work');
  });

  pomoBreakBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    pomoEngine.setMode('break');
  });

  // Clicking on the timer number cycles the preset duration under current mode
  pomoTimeClickable?.addEventListener('click', (e) => {
    e.stopPropagation();
    pomoEngine.cyclePresetForCurrentMode();
  });

  // Play / Pause button
  pomoPlayBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    pomoEngine.togglePlayPause();
  });

  // Detailed Statistics Modal Handlers
  const openStatsModal = (e: Event) => {
    e.stopPropagation();
    if (pomoStatsModal) {
      pomoEngine.renderStatsModal();
      pomoStatsModal.style.display = 'flex';
      pomoStatsModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeStatsModal = () => {
    if (pomoStatsModal) {
      pomoStatsModal.style.display = 'none';
      pomoStatsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  pomoOpenStatsBtn?.addEventListener('click', openStatsModal);
  pomoModalClose?.addEventListener('click', closeStatsModal);
  pomoCloseModalBtn?.addEventListener('click', closeStatsModal);

  pomoStatsModal?.addEventListener('click', (e) => {
    if (e.target === pomoStatsModal) {
      closeStatsModal();
    }
  });

  pomoCopyReportBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const stats = pomoEngine.getStats();
    const report = [
      '========================================',
      'POMODORO FLOW & LIFETIME AUDIT // BERNARD DAS',
      '========================================',
      `Total Completed Flows: ${stats.totalFlows}`,
      `Total Focus Logged:    ${pomoEngine.formatDuration(stats.totalWorkSeconds)}`,
      `Total Rest Logged:     ${pomoEngine.formatDuration(stats.totalBreakSeconds)}`,
      `Active Days:           ${stats.dayMap.size}`,
      '========================================',
    ].join('\n');
    const ok = await copyText(report);
    if (ok && pomoCopyReportBtn) {
      const orig = pomoCopyReportBtn.textContent;
      pomoCopyReportBtn.textContent = 'COPIED TO CLIPBOARD!';
      setTimeout(() => {
        pomoCopyReportBtn.textContent = orig;
      }, 1600);
    }
  });

  pomoResetStatsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      'Are you sure you want to clear all persisted Pomodoro flow telemetry and session history? This action cannot be undone.',
    );
    if (confirmed) {
      pomoEngine.clearTelemetry();
    }
  });

  // Global dismiss on ESC
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (pomoStatsModal && pomoStatsModal.style.display !== 'none') {
        closeStatsModal();
      } else {
        pomoEngine.abortCountdown();
      }
    }
  });

  updateClock();
  window.setInterval(updateClock, 1000);

  // Pause/refresh on visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      updateClock();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLocalClock);
} else {
  initLocalClock();
}

document.addEventListener('astro:page-load', initLocalClock);
