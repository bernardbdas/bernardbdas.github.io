/**
 * hard-reload.ts — Cartography Recalibration & Cache Flush Controller
 *
 * Capabilities:
 * 1. Cartographic Recalibration Animation:
 *    - Triggers full-field topographic sonar sweep and orbital camera elevation in background 3D canvas
 *    - Minimalist non-intrusive HUD status card
 * 2. Storage & Cache Flush:
 *    - Clears CacheStorage caches (window.caches)
 *    - Unregisters active Service Workers (navigator.serviceWorker)
 *    - Clears window.localStorage (theme, sound preferences, uptime state, etc.)
 *    - Clears window.sessionStorage
 *    - Clears IndexedDB databases
 * 3. Cache-Busting Hard Navigation:
 *    - Reloads page with cache-busting timestamp parameter (?_reload=<timestamp>)
 * 4. Dual Triggers:
 *    - Header HUD button (#hardReloadBtn & mobile #mobileHardReloadBtn)
 *    - Global keyboard shortcut: Shift + R (or Cmd/Ctrl + Shift + R)
 */

export interface PurgeOptions {
  bypassConfirmation?: boolean;
}

let isPurging = false;
let reloadOverlayInitialized = false;

function ensureOverlay(): HTMLElement {
  let overlay = document.getElementById('cartographyReloadOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cartographyReloadOverlay';
    overlay.className = 'cartography-recalibrate-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    overlay.setAttribute('aria-label', 'Recalibrating cartography and resetting cache');
    overlay.innerHTML = `
      <div class="carto-recalibrate-card">
        <span class="carto-pulse-reticle" aria-hidden="true"></span>
        <span class="carto-recalibrate-text">CARTOGRAPHY RECALIBRATING // RESETTING STATE</span>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

export async function executeHardReload(_options: PurgeOptions = {}): Promise<void> {
  if (isPurging) return;
  isPurging = true;

  const overlay = ensureOverlay();
  overlay.classList.add('is-active');
  document.body.classList.add('cartography-recalibrating');

  // Trigger background cartography 3D recalibration wave
  try {
    window.dispatchEvent(new CustomEvent('cartography-recalibrate'));
  } catch {
    // Ignore if terrain canvas is not loaded
  }

  // 1. Terminate audio immediately
  try {
    const audioEl = document.getElementById('ambient-audio-element') as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.pause();
      audioEl.src = '';
    }
  } catch {}

  // 2. Unregister service workers
  try {
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ action: 'PURGE_ALL_CACHES' });
      }
      if (navigator.serviceWorker.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    }
  } catch {}

  // 3. Clear CacheStorage
  try {
    if ('caches' in window && window.caches.keys) {
      const keys = await window.caches.keys();
      for (const key of keys) {
        await window.caches.delete(key);
      }
    }
  } catch {}

  // 4. Wipe storage
  try {
    window.sessionStorage.clear();
    window.localStorage.clear();
    localStorage.setItem('ambient_sound', 'disabled');
  } catch {}

  // 5. Delete IndexedDB
  try {
    if (window.indexedDB && window.indexedDB.databases) {
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        if (db.name) {
          window.indexedDB.deleteDatabase(db.name);
        }
      }
    }
  } catch {}

  // Allow the cartography wave animation to sweep across the screen (~650ms)
  await new Promise((r) => setTimeout(r, 650));

  // Redirect to home page with cache-bust
  const url = new URL('/', window.location.origin);
  url.searchParams.set('_reload', String(Date.now()));
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
  // - Cmd/Ctrl + Shift + R: Browser Native Override intercepted to perform cache reset
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
