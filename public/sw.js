// ─── Morning Delight Service Worker ──────────────────────────────────
// Caches the app shell so it works offline and loads instantly.
// Uses a "stale-while-revalidate" strategy for app files.

const CACHE_NAME   = 'morning-delight-v1';
const FONT_CACHE   = 'morning-delight-fonts-v1';

// Core app shell files to cache immediately
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: cache app shell ──────────────────────────────────────────
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, update in background ────────────────────
self.addEventListener('fetch', evt => {
  const { request } = evt;
  const url = new URL(request.url);

  // Skip non-GET and external API calls (Leaflet tiles, Unsplash images, etc.)
  if (request.method !== 'GET') return;

  // Cache Google Fonts
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    evt.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          const fresh = fetch(request).then(res => {
            cache.put(request, res.clone()); return res;
          }).catch(() => cached);
          return cached || fresh;
        })
      )
    );
    return;
  }

  // For app files: stale-while-revalidate
  if (url.origin === self.location.origin) {
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          const fresh = fetch(request).then(res => {
            // Only cache successful same-origin responses
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached || new Response('Offline', { status: 503 }));
          return cached || fresh;
        })
      )
    );
  }
  // All other requests (CDN tiles, images) go straight to network
});

// ── Push notifications ────────────────────────────────────────────────
self.addEventListener('push', evt => {
  const data = evt.data?.json() || {};
  evt.waitUntil(
    self.registration.showNotification(data.title || 'Morning Delight', {
      body:    data.body    || 'You have a new notification',
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-72.png',
      tag:     data.tag     || 'morning-delight',
      data:    data.url     || '/',
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open',    title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss'  },
      ],
    })
  );
});

self.addEventListener('notificationclick', evt => {
  evt.notification.close();
  if (evt.action === 'dismiss') return;
  evt.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
