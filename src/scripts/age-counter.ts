/**
 * Live Age Counter with Millisecond Precision
 *
 * Birthday: 14th October 2000, 00:55:00 IST (UTC+05:30)
 * Equivalent UTC: 13th October 2000, 19:25:00 UTC (971465100000 ms)
 */

const BIRTH_YEAR = 2000;
const BIRTH_MONTH_UTC = 9; // October (0-indexed)
const BIRTH_DAY_UTC = 13;
const BIRTH_HOUR_UTC = 19;
const BIRTH_MIN_UTC = 25;

export function initAgeCounter(): void {
  const container = document.getElementById('age-counter');
  const display = document.getElementById('age-display');
  if (!container || !display) return;

  let mode: 'standard' | 'decimal' = 'standard';

  function renderSkeleton(): void {
    if (mode === 'standard') {
      display!.innerHTML = `
        <span class="age-num" id="age-y">--</span><span class="age-unit">Y</span>
        <span class="age-num" id="age-d">--</span><span class="age-unit">D</span>
        <span class="age-num" id="age-h">--</span><span class="age-sep">:</span><span class="age-num" id="age-m">--</span><span class="age-sep">:</span><span class="age-num" id="age-s">--</span><span class="age-dot">.</span><span class="age-ms" id="age-ms">---</span>
      `;
    } else {
      display!.innerHTML = `<span class="age-num" id="age-dec">--.---------</span><span class="age-unit"> YRS</span>`;
    }
  }

  renderSkeleton();

  container.addEventListener('click', () => {
    mode = mode === 'standard' ? 'decimal' : 'standard';
    renderSkeleton();
  });

  let rafId: number | null = null;

  function tick(): void {
    const nowMs = Date.now();
    const now = new Date(nowMs);
    const curYear = now.getUTCFullYear();

    const bdayThisYear = Date.UTC(
      curYear,
      BIRTH_MONTH_UTC,
      BIRTH_DAY_UTC,
      BIRTH_HOUR_UTC,
      BIRTH_MIN_UTC,
      0,
      0,
    );

    let years: number;
    let lastBdayMs: number;
    let nextBdayMs: number;

    if (nowMs >= bdayThisYear) {
      years = curYear - BIRTH_YEAR;
      lastBdayMs = bdayThisYear;
      nextBdayMs = Date.UTC(
        curYear + 1,
        BIRTH_MONTH_UTC,
        BIRTH_DAY_UTC,
        BIRTH_HOUR_UTC,
        BIRTH_MIN_UTC,
        0,
        0,
      );
    } else {
      years = curYear - BIRTH_YEAR - 1;
      lastBdayMs = Date.UTC(
        curYear - 1,
        BIRTH_MONTH_UTC,
        BIRTH_DAY_UTC,
        BIRTH_HOUR_UTC,
        BIRTH_MIN_UTC,
        0,
        0,
      );
      nextBdayMs = bdayThisYear;
    }

    if (mode === 'decimal') {
      const yearFraction = (nowMs - lastBdayMs) / (nextBdayMs - lastBdayMs);
      const decStr = (years + yearFraction).toFixed(9);
      const decEl = document.getElementById('age-dec');
      if (decEl) decEl.textContent = decStr;
    } else {
      let diff = nowMs - lastBdayMs;
      const days = Math.floor(diff / 86400000);
      diff %= 86400000;
      const hours = Math.floor(diff / 3600000);
      diff %= 3600000;
      const minutes = Math.floor(diff / 60000);
      diff %= 60000;
      const seconds = Math.floor(diff / 1000);
      const ms = diff % 1000;

      const yEl = document.getElementById('age-y');
      const dEl = document.getElementById('age-d');
      const hEl = document.getElementById('age-h');
      const mEl = document.getElementById('age-m');
      const sEl = document.getElementById('age-s');
      const msEl = document.getElementById('age-ms');

      const yStr = String(years);
      const dStr = String(days).padStart(days > 99 ? 3 : 2, '0');
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');
      const msStr = String(ms).padStart(3, '0');

      if (yEl && yEl.textContent !== yStr) yEl.textContent = yStr;
      if (dEl && dEl.textContent !== dStr) dEl.textContent = dStr;
      if (hEl && hEl.textContent !== hStr) hEl.textContent = hStr;
      if (mEl && mEl.textContent !== mStr) mEl.textContent = mStr;
      if (sEl && sEl.textContent !== sStr) sEl.textContent = sStr;
      if (msEl) msEl.textContent = msStr;
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (rafId === null) {
      rafId = requestAnimationFrame(tick);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgeCounter);
} else {
  initAgeCounter();
}
