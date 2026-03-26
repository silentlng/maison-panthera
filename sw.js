/* ═══════════════════════════════════════════════════════
   MAISON PANTHERA — Service Worker (PWA)
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'maison-panthera-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/logo.jpeg',
  '/images/hero-bg.jpeg',
  '/images/about-1.jpeg',
  '/images/about-2.jpeg',
  '/images/vtc-1.jpeg',
  '/images/vtc-2.jpeg',
  '/images/vtc-3.jpeg',
  '/images/vtc-4.jpeg',
  '/images/personal-shopper.jpeg',
  '/images/car-interior.jpeg',
  '/images/hotel.jpeg',
  '/images/match.jpeg',
  '/images/concert.jpeg',
  '/images/private-jet.jpeg',
  '/images/yacht.jpeg',
  '/images/resort.jpeg',
  '/images/neon.jpeg',
  '/images/champagne.jpeg',
  '/images/dining.jpeg'
];

/* Install — pre-cache all assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Activate — clean old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch — cache-first strategy */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
