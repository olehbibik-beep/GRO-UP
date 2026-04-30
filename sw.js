const CACHE_NAME = 'gro-up-v3';
const urlsToCache = [
  '/GRO-UP/',
  '/GRO-UP/index.html',
  '/GRO-UP/login.html',
  '/GRO-UP/app.js',
  '/GRO-UP/login.js',
  '/GRO-UP/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Чистим старый кэш при обновлении версии
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
