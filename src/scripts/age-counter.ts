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
  const containers = document.querySelectorAll<HTMLElement>('.age-counter');
  if (containers.length === 0) return;

  let mode: 'standard' | 'decimal' = 'standard';

  function renderSkeleton(): void {
    containers.forEach((container) => {
      const display = container.querySelector<HTMLElement>('.age-display');
      if (!display) return;

      if (mode === 'standard') {
        display.innerHTML = `
          <span class="age-num age-y">--</span><span class="age-unit">Y</span>
          <span class="age-num age-d">--</span><span class="age-unit">D</span>
          <span class="age-num age-h">--</span><span class="age-sep">:</span><span class="age-num age-m">--</span><span class="age-sep">:</span><span class="age-num age-s">--</span><span class="age-dot">.</span><span class="age-ms">---</span>
        `;
      } else {
        display.innerHTML = `<span class="age-num age-dec">--.---------</span><span class="age-unit"> YRS</span>`;
      }
    });
  }

  renderSkeleton();

  containers.forEach((container) => {
    container.addEventListener('click', () => {
      mode = mode === 'standard' ? 'decimal' : 'standard';
      renderSkeleton();
    });
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
      document.querySelectorAll('.age-dec').forEach((el) => {
        if (el.textContent !== decStr) el.textContent = decStr;
      });
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

      const yStr = String(years);
      const dStr = String(days).padStart(days > 99 ? 3 : 2, '0');
      const hStr = String(hours).padStart(2, '0');
      const mStr = String(minutes).padStart(2, '0');
      const sStr = String(seconds).padStart(2, '0');
      const msStr = String(ms).padStart(3, '0');

      document.querySelectorAll('.age-y').forEach((el) => {
        if (el.textContent !== yStr) el.textContent = yStr;
      });
      document.querySelectorAll('.age-d').forEach((el) => {
        if (el.textContent !== dStr) el.textContent = dStr;
      });
      document.querySelectorAll('.age-h').forEach((el) => {
        if (el.textContent !== hStr) el.textContent = hStr;
      });
      document.querySelectorAll('.age-m').forEach((el) => {
        if (el.textContent !== mStr) el.textContent = mStr;
      });
      document.querySelectorAll('.age-s').forEach((el) => {
        if (el.textContent !== sStr) el.textContent = sStr;
      });
      document.querySelectorAll('.age-ms').forEach((el) => {
        if (el.textContent !== msStr) el.textContent = msStr;
      });
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
