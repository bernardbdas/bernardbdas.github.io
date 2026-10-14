/**
 * Core Web Vitals & Real-Time Performance Instrumentation Module
 *
 * Captures real-time client performance metrics (FCP, LCP, CLS, TTFB, INP)
 * using the standard browser PerformanceObserver & Navigation Timing APIs.
 * Updates HUD readouts near 'Vitals — Optimal' and supports 1-click clipboard export.
 */

interface VitalsReport {
  fcp: number | null;
  lcp: number | null;
  cls: number;
  ttfb: number | null;
  inp: number | null;
}

const vitals: VitalsReport = {
  fcp: null,
  lcp: null,
  cls: 0,
  ttfb: null,
  inp: null,
};

function formatMs(ms: number | null): string {
  if (ms === null || ms < 0) return '--';
  if (ms >= 1000) {
    return (ms / 1000).toFixed(2) + 's';
  }
  return Math.round(ms) + 'ms';
}

function formatCls(val: number): string {
  return val.toFixed(2);
}

function getMetricStatus(
  metric: 'fcp' | 'lcp' | 'cls' | 'ttfb',
  val: number | null,
): 'optimal' | 'moderate' | 'slow' {
  if (val === null) return 'optimal';
  switch (metric) {
    case 'fcp':
      return val <= 1800 ? 'optimal' : val <= 3000 ? 'moderate' : 'slow';
    case 'lcp':
      return val <= 2500 ? 'optimal' : val <= 4000 ? 'moderate' : 'slow';
    case 'cls':
      return val <= 0.1 ? 'optimal' : val <= 0.25 ? 'moderate' : 'slow';
    case 'ttfb':
      return val <= 800 ? 'optimal' : val <= 1800 ? 'moderate' : 'slow';
    default:
      return 'optimal';
  }
}

function updateOverallRating() {
  const fcpStatus = getMetricStatus('fcp', vitals.fcp);
  const lcpStatus = getMetricStatus('lcp', vitals.lcp);
  const clsStatus = getMetricStatus('cls', vitals.cls);

  const statusTextEl = document.getElementById('vitals-status-text');
  const statusDotEl = document.getElementById('vitals-status-dot');

  if (!statusTextEl) return;

  if (fcpStatus === 'optimal' && lcpStatus === 'optimal' && clsStatus === 'optimal') {
    statusTextEl.textContent = 'Vitals — Optimal';
    statusDotEl?.classList.remove('status-warn', 'status-alert');
  } else if (fcpStatus === 'slow' || lcpStatus === 'slow' || clsStatus === 'slow') {
    statusTextEl.textContent = 'Vitals — Notice';
    statusDotEl?.classList.remove('status-alert');
    statusDotEl?.classList.add('status-warn');
  } else {
    statusTextEl.textContent = 'Vitals — Good';
    statusDotEl?.classList.remove('status-warn', 'status-alert');
  }
}

function updatePill(id: string, valStr: string, status: 'optimal' | 'moderate' | 'slow') {
  const pill = document.getElementById(id);
  if (!pill) return;
  const valEl = pill.querySelector('.pill-val');
  if (valEl) {
    valEl.textContent = valStr;
  }
  pill.classList.remove('vital-optimal', 'vital-moderate', 'vital-slow');
  pill.classList.add(`vital-${status}`);
}

function copyToClipboard(val: string, el: HTMLElement, label = 'COPIED') {
  navigator.clipboard.writeText(val).then(
    () => {
      el.classList.add('copied');
      const valEl = el.querySelector('.pill-val') || el.querySelector('.vitals-text');
      const orig = valEl?.textContent || '';
      if (valEl) valEl.textContent = label;
      setTimeout(() => {
        el.classList.remove('copied');
        if (valEl) valEl.textContent = orig;
      }, 1400);
    },
    () => {
      /* ignore */
    },
  );
}

export function initWebVitals(): void {
  // 1. Navigation Timing (TTFB)
  const navEntry = performance.getEntriesByType?.('navigation')?.[0] as
    PerformanceNavigationTiming | undefined;

  if (navEntry && navEntry.responseStart > 0) {
    vitals.ttfb = navEntry.responseStart;
    updatePill('vital-ttfb', formatMs(vitals.ttfb), getMetricStatus('ttfb', vitals.ttfb));
  } else if (performance.timing?.responseStart) {
    const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
    if (ttfb > 0) {
      vitals.ttfb = ttfb;
      updatePill('vital-ttfb', formatMs(vitals.ttfb), getMetricStatus('ttfb', vitals.ttfb));
    }
  }

  // 2. First Contentful Paint (FCP)
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');
    if (fcp) {
      vitals.fcp = fcp.startTime;
      updatePill('vital-fcp', formatMs(vitals.fcp), getMetricStatus('fcp', vitals.fcp));
      updateOverallRating();
    }
  } catch {}

  if ('PerformanceObserver' in window) {
    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((entryList, obs) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
            updatePill('vital-fcp', formatMs(vitals.fcp), getMetricStatus('fcp', vitals.fcp));
            updateOverallRating();
            obs.disconnect();
            break;
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch {}

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          vitals.lcp = lastEntry.startTime;
          updatePill('vital-lcp', formatMs(vitals.lcp), getMetricStatus('lcp', vitals.lcp));
          updateOverallRating();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // Stop observing LCP on user input or page visibility change
      const finalizeLcp = () => {
        try {
          lcpObserver.takeRecords();
          lcpObserver.disconnect();
        } catch {}
      };
      ['keydown', 'click', 'visibilitychange'].forEach((type) => {
        window.addEventListener(type, finalizeLcp, { once: true, passive: true });
      });
    } catch {}

    // CLS Observer
    try {
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as (PerformanceEntry & {
          hadRecentInput?: boolean;
          value?: number;
        })[]) {
          if (!entry.hadRecentInput && typeof entry.value === 'number') {
            vitals.cls += entry.value;
            updatePill('vital-cls', formatCls(vitals.cls), getMetricStatus('cls', vitals.cls));
            updateOverallRating();
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {}

    // INP / FID Observer
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries() as (PerformanceEntry & {
          processingStart?: number;
          duration?: number;
        })[]) {
          const duration =
            entry.duration || (entry.processingStart ? entry.processingStart - entry.startTime : 0);
          if (duration > 0) {
            vitals.inp = duration;
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {}
  }

  // Set initial CLS display to 0.00
  updatePill('vital-cls', formatCls(vitals.cls), 'optimal');

  // Interactive Click-to-Copy Handlers
  const fcpPill = document.getElementById('vital-fcp');
  fcpPill?.addEventListener('click', () => {
    copyToClipboard(`FCP: ${formatMs(vitals.fcp)}`, fcpPill);
  });

  const lcpPill = document.getElementById('vital-lcp');
  lcpPill?.addEventListener('click', () => {
    copyToClipboard(`LCP: ${formatMs(vitals.lcp)}`, lcpPill);
  });

  const clsPill = document.getElementById('vital-cls');
  clsPill?.addEventListener('click', () => {
    copyToClipboard(`CLS: ${formatCls(vitals.cls)}`, clsPill);
  });

  const ttfbPill = document.getElementById('vital-ttfb');
  ttfbPill?.addEventListener('click', () => {
    copyToClipboard(`TTFB: ${formatMs(vitals.ttfb)}`, ttfbPill);
  });

  // Vitals badge click: copies complete Web Vitals audit summary
  const vitalsBadge = document.getElementById('vitals-badge');
  vitalsBadge?.addEventListener('click', () => {
    const statusText =
      document.getElementById('vitals-status-text')?.textContent || 'Vitals — Optimal';
    const report = [
      `Web Vitals [${statusText}]:`,
      `FCP: ${formatMs(vitals.fcp)}`,
      `LCP: ${formatMs(vitals.lcp)}`,
      `CLS: ${formatCls(vitals.cls)}`,
      vitals.ttfb !== null ? `TTFB: ${formatMs(vitals.ttfb)}` : null,
      vitals.inp !== null ? `INP: ${formatMs(vitals.inp)}` : null,
    ]
      .filter(Boolean)
      .join(' | ');

    copyToClipboard(report, vitalsBadge);
  });

  // Keyboard accessibility
  [fcpPill, lcpPill, clsPill, ttfbPill, vitalsBadge].forEach((el) => {
    el?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWebVitals);
} else {
  initWebVitals();
}
