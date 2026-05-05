importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCwflIUs2AnBRIIxrssVpbpykHwG2436q0",
    authDomain: "gro-uping.firebaseapp.com",
    projectId: "gro-uping",
    storageBucket: "gro-uping.firebasestorage.app",
    messagingSenderId: "819938349545",
    appId: "1:819938349545:web:a00c3bef66d99f5b6cfb78"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Firebase сам нарисует уведомление. Мы ловим ТОЛЬКО клик!
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = self.location.origin + '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Ищем открытое приложение
      if (windowClients.length > 0) {
        let client = windowClients[0];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Если закрыто - открываем
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==========================================
// ЛОГИКА КЭШИРОВАНИЯ И ЗАЩИТА ОТ ДУБЛЕЙ
// ==========================================
const CACHE_NAME = 'gro-up-v41'; 

const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.js',
  '/icon-512.png' // Кэшируем иконку для уведомлений
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // 🔥 ЖЕСТКО: Заставляем новый кэш примениться немедленно и убиваем старые воркеры (защита от дублей)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(INITIAL_CACHED_RESOURCES))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim(); // 🔥 Перехватываем контроль над всеми вкладками
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).then((response) => {
      const resClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      return response;
    }).catch(() => caches.match(event.request))
  );
});
