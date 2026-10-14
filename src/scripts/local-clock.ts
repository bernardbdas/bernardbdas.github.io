/**
 * User Local Time and Date HUD Clock
 *
 * Displays live user local date (e.g. 15 OCT 2026),
 * 24-hour time (e.g. 04:00:25), and timezone abbreviation.
 * Supports click-to-copy with feedback.
 */

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
    // fallback
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
  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');
  const tzEl = document.getElementById('clock-tz');

  if (!container || !dateEl || !timeEl) return;

  let currentString = '';
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;
  let isCopied = false;

  function updateClock(): void {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    const dateStr = `${day} ${month} ${year}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    const tzStr = getTimezoneAbbr();

    currentString = `${dateStr} ${timeStr} ${tzStr}`;

    if (dateEl && dateEl.textContent !== dateStr) dateEl.textContent = dateStr;
    if (!isCopied && timeEl && timeEl.textContent !== timeStr) timeEl.textContent = timeStr;
    if (tzEl && tzEl.textContent !== tzStr) tzEl.textContent = tzStr;
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  // Copy on click or Enter/Space
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
      container.title = 'User Local Time & Date (Click to copy)';
      copyTimeout = null;
    }, 1500);
  };

  container.addEventListener('click', handleCopy);
  container.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  });

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
