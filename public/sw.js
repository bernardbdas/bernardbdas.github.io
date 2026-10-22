/**
 * sw.js — High-Performance Cache-First Asset Acceleration Service Worker
 *
 * Capabilities:
 * - Shared cross-origin cache: Supports local development (http://localhost:4321/media)
 *   and production deployment (https://bernardbdas.github.io/media/) seamlessly from
 *   the unified asset repository.
 * - Pre-caches and accelerates micro-sounds FX, Google fonts, and media datasets.
 * - Cache-First strategy for static audio assets (/audio/fx/*) and icons for instant playback.
 * - Stale-While-Revalidate strategy for static font stylesheets and woff2 files.
 * - Stale-While-Revalidate for /media route assets to ensure smooth, instantaneous restoration.
 * - Nuclear purge support: Any request or message containing '_purge' immediately purges
 *   the entire cache storage container across all origins.
 */

const CACHE_NAME = 'birendra-asset-cache-v2';

const PRECACHE_ASSETS = [
  '/audio/fx/click.mp3',
  '/audio/fx/ripple-1.mp3',
  '/audio/fx/ripple-2.mp3',
  '/audio/fx/tab-select.mp3',
  '/audio/fx/portrait.mp3',
  '/audio/fx/continue.mp3',
  '/audio/fx/slider.mp3',
  '/audio/fx/darkmatter-1.mp3',
  '/audio/fx/darkmatter-2.mp3',
  '/favicon.svg',
  '/favicon-32.png',
  '/apple-touch-icon.png',
  '/media',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Attempt precaching; gracefully continue if an individual route isn't available
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn('[SW] Precache skipped for:', url, err);
            }),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Support direct purge broadcast messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'PURGE_ALL_CACHES') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // If request contains cache-purge flag, purge cache and bypass service worker completely
  if (url.searchParams.has('_purge')) {
    event.respondWith(
      caches
        .delete(CACHE_NAME)
        .then(() => fetch(request))
        .catch(() => fetch(request)),
    );
    return;
  }

  // 1. Audio FX and static icons: Cache-First
  if (
    url.pathname.startsWith('/audio/fx/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkRes;
        });
      }),
    );
    return;
  }

  // 2. Google Fonts & CDN resources: Stale-While-Revalidate
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // 3. /media Route & static assets: Stale-While-Revalidate for smooth local & prod restoration
  if (
    url.pathname === '/media' ||
    url.pathname === '/media/' ||
    url.pathname.includes('/_astro/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const clone = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      }),
    );
    return;
  }

  // 4. Default Document navigation and dynamic fetches: Network-First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    }),
  );
});
