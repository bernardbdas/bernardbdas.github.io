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

let globalRafId: number | null = null;
let currentMode: 'standard' | 'decimal' = 'standard';
let delegatedListenerAttached = false;

function getSavedMode(): 'standard' | 'decimal' {
  try {
    const saved = localStorage.getItem('age_counter_mode');
    if (saved === 'decimal' || saved === 'standard') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'standard';
}

function renderContainerSkeleton(container: HTMLElement): void {
  const display = container.querySelector<HTMLElement>('.age-display');
  if (!display) return;

  if (currentMode === 'standard') {
    if (!display.querySelector('.age-y')) {
      display.innerHTML = `
        <span class="age-num age-y">--</span><span class="age-unit">Y</span>
        <span class="age-num age-d">--</span><span class="age-unit">D</span>
        <span class="age-num age-h">--</span><span class="age-sep">:</span><span class="age-num age-m">--</span><span class="age-sep">:</span><span class="age-num age-s">--</span><span class="age-dot">.</span><span class="age-ms">---</span>
      `;
    }
  } else {
    if (!display.querySelector('.age-dec')) {
      display.innerHTML = `<span class="age-num age-dec">--.---------</span><span class="age-unit"> YRS</span>`;
    }
  }
}

function renderAllSkeletons(): void {
  const containers = document.querySelectorAll<HTMLElement>('.age-counter');
  containers.forEach(renderContainerSkeleton);
}

function tick(): void {
  const containers = document.querySelectorAll<HTMLElement>('.age-counter');
  if (containers.length === 0) {
    if (globalRafId !== null) {
      cancelAnimationFrame(globalRafId);
      globalRafId = null;
    }
    return;
  }

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

  if (currentMode === 'decimal') {
    const decEls = document.querySelectorAll<HTMLElement>('.age-dec');
    if (decEls.length === 0) {
      renderAllSkeletons();
    }
    const yearFraction = (nowMs - lastBdayMs) / (nextBdayMs - lastBdayMs);
    const decStr = (years + yearFraction).toFixed(9);
    document.querySelectorAll<HTMLElement>('.age-dec').forEach((el) => {
      if (el.textContent !== decStr) el.textContent = decStr;
    });
  } else {
    const yEls = document.querySelectorAll<HTMLElement>('.age-y');
    if (yEls.length === 0) {
      renderAllSkeletons();
    }
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

    document.querySelectorAll<HTMLElement>('.age-y').forEach((el) => {
      if (el.textContent !== yStr) el.textContent = yStr;
    });
    document.querySelectorAll<HTMLElement>('.age-d').forEach((el) => {
      if (el.textContent !== dStr) el.textContent = dStr;
    });
    document.querySelectorAll<HTMLElement>('.age-h').forEach((el) => {
      if (el.textContent !== hStr) el.textContent = hStr;
    });
    document.querySelectorAll<HTMLElement>('.age-m').forEach((el) => {
      if (el.textContent !== mStr) el.textContent = mStr;
    });
    document.querySelectorAll<HTMLElement>('.age-s').forEach((el) => {
      if (el.textContent !== sStr) el.textContent = sStr;
    });
    document.querySelectorAll<HTMLElement>('.age-ms').forEach((el) => {
      if (el.textContent !== msStr) el.textContent = msStr;
    });
  }

  globalRafId = requestAnimationFrame(tick);
}

function toggleAgeMode(): void {
  currentMode = currentMode === 'standard' ? 'decimal' : 'standard';
  try {
    localStorage.setItem('age_counter_mode', currentMode);
  } catch {
    // Ignore storage errors
  }
  const containers = document.querySelectorAll<HTMLElement>('.age-counter');
  containers.forEach((c) => {
    const disp = c.querySelector<HTMLElement>('.age-display');
    if (disp) disp.innerHTML = '';
  });
  renderAllSkeletons();
  tick();
}

export function initAgeCounter(): void {
  currentMode = getSavedMode();

  const containers = document.querySelectorAll<HTMLElement>('.age-counter');
  if (containers.length === 0) {
    if (globalRafId !== null) {
      cancelAnimationFrame(globalRafId);
      globalRafId = null;
    }
    return;
  }

  renderAllSkeletons();

  if (!delegatedListenerAttached) {
    delegatedListenerAttached = true;
    document.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('.age-counter');
      if (target) {
        e.stopPropagation();
        toggleAgeMode();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (globalRafId !== null) {
          cancelAnimationFrame(globalRafId);
          globalRafId = null;
        }
      } else if (globalRafId === null) {
        globalRafId = requestAnimationFrame(tick);
      }
    });
  }

  if (globalRafId !== null) {
    cancelAnimationFrame(globalRafId);
  }
  tick();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgeCounter);
} else {
  initAgeCounter();
}

document.addEventListener('astro:page-load', initAgeCounter);
