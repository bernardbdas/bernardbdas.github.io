/**
 * User Local Time & Bernard's Clock HUD Clock
 *
 * Displays live user local date, time, and timezone.
 * On double-click / double-tap, toggles to Bernard's Clockzone (Asia/Kolkata)
 * saying "Bernard's Clock".
 * On single-click, copies the active timestamp with visual feedback.
 */

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
  const weekdayEl = document.getElementById('clock-weekday');
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');
  const tzEl = document.getElementById('clock-tz');

  if (!container || !dateEl || !timeEl) return;

  type ClockMode = 'local' | 'bernard';
  let mode: ClockMode = 'local';
  let currentString = '';
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCopied = false;
  let clickCount = 0;
  let clickTimer: ReturnType<typeof setTimeout> | null = null;
  let lastToggleTime = 0;

  function updateClock(): void {
    const now = new Date();

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
        // In case environment lacks timezone DB
        weekdayStr = 'THU';
        dateStr = now.toLocaleDateString();
        timeStr = now.toLocaleTimeString();
        tzStr = 'IST';
      }

      if (badgeEl) badgeEl.textContent = "BERNARD'S CLOCK";
      container!.classList.add('mode-bernard');
      container!.title =
        "Bernard's Clock — Asia/Kolkata (IST) (Double-click for Your Local Time, click to copy)";
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
      container!.title =
        "Your Local Time (Double-click for Bernard's Clock [Asia/Kolkata], click to copy)";
      currentString = `Local Time: ${weekdayStr}, ${dateStr} ${timeStr} ${tzStr}`;
    }

    if (weekdayEl && weekdayEl.textContent !== weekdayStr) weekdayEl.textContent = weekdayStr;
    if (dateEl && dateEl.textContent !== dateStr) dateEl.textContent = dateStr;
    if (!isCopied && timeEl && timeEl.textContent !== timeStr) timeEl.textContent = timeStr;
    if (tzEl && tzEl.textContent !== tzStr) tzEl.textContent = tzStr;
  }

  function toggleMode(): void {
    const now = Date.now();
    if (now - lastToggleTime < 180) return;
    lastToggleTime = now;

    mode = mode === 'local' ? 'bernard' : 'local';
    updateClock();
  }

  const handleCopy = async (): Promise<void> => {
    if (!currentString) return;
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

  // Click & Double-click discrimination
  container.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    clickCount++;

    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        clickCount = 0;
        clickTimer = null;
        handleCopy();
      }, 260);
    } else if (clickCount >= 2) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
      }
      clickCount = 0;
      toggleMode();
    }
  });

  // Native double click listener for fast double-clicks
  container.addEventListener('dblclick', (e: MouseEvent) => {
    e.preventDefault();
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    clickCount = 0;
    toggleMode();
  });

  // Keyboard accessibility: Enter to copy, Shift+Enter or Space to toggle
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === ' ' || (e.key === 'Enter' && e.shiftKey)) {
      e.preventDefault();
      toggleMode();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleCopy();
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
