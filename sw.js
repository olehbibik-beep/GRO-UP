const CACHE_NAME = 'gro-up-v1';
// Список файлов для скачивания в память телефона
const urlsToCache = [
  'index.html',
  'login.html',
  'admin.html',
  'school.html',
  'territories.html',
  'calendar.html',
  'duties.html',
  'reports.html',
  'app.js',
  'login.js',
  'admin.js',
  'school.js',
  'territories.js',
  'calendar.js',
  'duties.js',
  'reports.js'
];

// Установка: скачиваем файлы
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Работа с запросами: сначала берем из кэша, потом из сети
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
