/**
 * hard-reload.ts — Nuclear System Reset & Bypass Hard Reload Controller
 *
 * Capabilities:
 * 1. Nuclear Storage Purge:
 *    - Clears CacheStorage caches (window.caches)
 *    - Unregisters any active Service Workers (navigator.serviceWorker)
 *    - Clears window.localStorage (theme, sound preferences, uptime state, etc.)
 *    - Clears window.sessionStorage (audio playback coordinates, transient router states)
 *    - Clears IndexedDB databases (indexedDB.databases)
 * 2. Visual Instrument HUD Overlay:
 *    - Terminal-style sequence logging showing step-by-step diagnostic purge
 *    - Glitch / scanline CRT effect with progress telemetry
 * 3. Cache-Busting Hard Navigation:
 *    - Reloads page with cache-busting timestamp parameter (?_purge=<timestamp>)
 *    - Calls location.replace / location.reload(true) with headers to prevent HTTP cache
 * 4. Dual Triggers:
 *    - Header HUD button (#hardReloadBtn & mobile #mobileHardReloadBtn)
 *    - Global keyboard shortcut: Shift + R (or Cmd/Ctrl + Shift + R)
 */

export interface PurgeOptions {
  bypassConfirmation?: boolean;
}

let isPurging = false;
let reloadOverlayInitialized = false;

/**
 * Creates the tactical HUD terminal overlay DOM element if not already present.
 */
function ensureOverlay(): {
  overlay: HTMLElement;
  terminalBody: HTMLElement;
  progressBar: HTMLElement;
  pctText: HTMLElement;
  statusBadge: HTMLElement;
} {
  let overlay = document.getElementById('system-purge-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'system-purge-overlay';
    overlay.className = 'system-purge-backdrop';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'System Nuclear Purge and Hard Reload In Progress');
    overlay.innerHTML = `
      <div class="system-purge-crt-scanline" aria-hidden="true"></div>
      <div class="system-purge-terminal">
        <div class="purge-terminal-header">
          <div class="purge-terminal-title">
            <span class="purge-dot pulse-alert" aria-hidden="true"></span>
            <span class="purge-mono-title">SYS_RELOAD // NUCLEAR_CACHE_PURGE</span>
          </div>
          <div class="purge-terminal-meta">
            <span class="purge-status-badge" id="purgeStatusBadge">PURGING</span>
          </div>
        </div>
        <div class="purge-terminal-progress-wrap">
          <div class="purge-progress-track">
            <div class="purge-progress-bar" id="purgeProgressBar" style="width: 0%"></div>
          </div>
          <div class="purge-progress-info">
            <span class="purge-subtext">BYPASSING CLIENT-SIDE CACHES &amp; REGISTRIES</span>
            <span class="purge-pct" id="purgePct">0%</span>
          </div>
        </div>
        <div class="purge-terminal-console" id="purgeTerminalBody" role="log" aria-live="polite">
          <div class="purge-log-line purge-log-dim">[INIT] HARD RELOAD PROTOCOL ENGAGED</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const terminalBody = document.getElementById('purgeTerminalBody')!;
  const progressBar = document.getElementById('purgeProgressBar')!;
  const pctText = document.getElementById('purgePct')!;
  const statusBadge = document.getElementById('purgeStatusBadge')!;

  return { overlay, terminalBody, progressBar, pctText, statusBadge };
}

/**
 * Append a high-tech monochrome diagnostic line into the overlay console.
 */
function appendLog(body: HTMLElement, text: string, type: 'info' | 'warn' | 'success' = 'info') {
  const line = document.createElement('div');
  line.className = `purge-log-line purge-log-${type}`;
  const now = new Date().toISOString().substring(11, 23);
  line.textContent = `[${now}] ${text}`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

/**
 * Execute the Nuclear Purge and fresh document fetch.
 */
export async function executeHardReload(_options: PurgeOptions = {}): Promise<void> {
  if (isPurging) return;
  isPurging = true;

  const { overlay, terminalBody, progressBar, pctText, statusBadge } = ensureOverlay();
  overlay.classList.add('is-active');

  // Trigger tactile UI FX if available
  try {
    const fxEvent = new CustomEvent('ui-fx', { detail: { type: 'surge' } });
    window.dispatchEvent(fxEvent);
  } catch {
    // Ignore audio context failures
  }

  const setProgress = (pct: number) => {
    progressBar.style.width = `${pct}%`;
    pctText.textContent = `${pct}%`;
  };

  appendLog(terminalBody, 'KILLING ACTIVE CLIENT AUDIO CHANNELS...', 'warn');
  setProgress(15);

  // 1. Terminate any active media audio playback immediately
  try {
    const audioEl = document.getElementById('ambient-audio-element') as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }
  } catch (err) {
    appendLog(terminalBody, `AUDIO TERMINATION EXCEPTION: ${String(err)}`, 'warn');
  }

  await new Promise((r) => setTimeout(r, 90));

  // 2. Unregister all service workers and broadcast purge signal
  appendLog(terminalBody, 'BROADCASTING PURGE & UNREGISTERING SERVICE WORKERS...', 'info');
  setProgress(30);
  try {
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: 'PURGE_ALL_CACHES' });
      }
      if (navigator.serviceWorker.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          for (const reg of registrations) {
            await reg.unregister();
          }
          appendLog(
            terminalBody,
            `UNREGISTERED ${registrations.length} SERVICE WORKER(S)`,
            'success',
          );
        } else {
          appendLog(terminalBody, 'NO SERVICE WORKER REGISTRATIONS DETECTED', 'info');
        }
      }
    }
  } catch (err) {
    appendLog(terminalBody, `SERVICE WORKER BYPASS FAILED: ${String(err)}`, 'warn');
  }

  await new Promise((r) => setTimeout(r, 90));

  // 3. Clear all CacheStorage entries
  appendLog(terminalBody, 'PURGING WINDOW CACHESTORAGE ENTRIES...', 'info');
  setProgress(50);
  try {
    if ('caches' in window && window.caches.keys) {
      const keys = await window.caches.keys();
      if (keys.length > 0) {
        for (const key of keys) {
          await window.caches.delete(key);
        }
        appendLog(terminalBody, `CLEARED ${keys.length} CACHE STORAGE CONTAINER(S)`, 'success');
      } else {
        appendLog(terminalBody, 'CACHE STORAGE ALREADY ZERO-BYTE', 'info');
      }
    }
  } catch (err) {
    appendLog(terminalBody, `CACHESTORAGE PURGE FAILED: ${String(err)}`, 'warn');
  }

  await new Promise((r) => setTimeout(r, 90));

  // 4. Nuclear wipe of sessionStorage & localStorage (Theme, sound preferences, uptime mode, filters)
  appendLog(terminalBody, 'WIPING CLIENT LOCALSTORAGE & SESSIONSTORAGE (NUCLEAR RESET)...', 'warn');
  setProgress(70);
  try {
    window.sessionStorage.clear();
    window.localStorage.clear();
    appendLog(terminalBody, 'STORAGE REGISTRIES RESET TO FACTORY ZERO', 'success');
  } catch (err) {
    appendLog(terminalBody, `STORAGE WIPE ERROR: ${String(err)}`, 'warn');
  }

  await new Promise((r) => setTimeout(r, 80));

  // 5. Delete IndexedDB databases if any exist
  appendLog(terminalBody, 'INSPECTING INDEXEDDB REPOSITORIES...', 'info');
  setProgress(85);
  try {
    if (window.indexedDB && window.indexedDB.databases) {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
      appendLog(terminalBody, `PURGED ${dbs.length} INDEXEDDB REGISTRIES`, 'success');
    }
  } catch {
    // Some browsers do not support indexedDB.databases()
  }

  await new Promise((r) => setTimeout(r, 80));

  // 6. Complete and dispatch fresh document navigation
  appendLog(terminalBody, 'DISPATCHING DIRECT HARD RELOAD WITH CACHE-BUST...', 'success');
  setProgress(100);
  statusBadge.textContent = 'COMPLETE';
  statusBadge.classList.add('status-complete');

  await new Promise((r) => setTimeout(r, 140));

  // Always redirect to the home page with cache-bust parameter
  const url = new URL('/', window.location.origin);
  url.searchParams.set('_purge', String(Date.now()));

  // Hard reload to home page from network
  window.location.replace(url.toString());
}

/**
 * Initializes the Hard Reload button listeners and global keyboard shortcut.
 */
export function initHardReload(): void {
  if (reloadOverlayInitialized) return;
  reloadOverlayInitialized = true;

  // Global Keyboard Shortcut:
  // - Shift + R (without Ctrl/Cmd): Standard HUD Hard Reload
  // - Cmd/Ctrl + Shift + R: Browser Native Override intercepted to perform our nuclear wipe
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignore keystrokes inside text inputs, textareas, or contenteditables
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement).isContentEditable)
    ) {
      return;
    }

    const isR = e.key === 'R' || e.key === 'r';
    const isShift = e.shiftKey;

    // Shift + R OR (Cmd/Ctrl + Shift + R)
    if (isR && isShift) {
      e.preventDefault();
      executeHardReload();
    }
  });

  // Global document click delegation for all hard reload triggers
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const trigger = target.closest<HTMLElement>(
      '#hardReloadBtn, #mobileHardReloadBtn, [data-action="hard-reload"]',
    );
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      executeHardReload();
    }
  });
}

// Auto-run if DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHardReload);
  } else {
    initHardReload();
  }
  document.addEventListener('astro:page-load', initHardReload);
}
