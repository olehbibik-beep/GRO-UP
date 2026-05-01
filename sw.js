// 1. ИМПОРТЫ FIREBASE
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 2. КОНФИГ
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

// ==========================================
// ЛОГИКА ПУШ-УВЕДОМЛЕНИЙ
// ==========================================

// Принимаем фоновые сообщения (FIREBASE САМ НАРИСУЕТ ПУШ, МЫ НИЧЕГО НЕ ДЕЛАЕМ!)
messaging.onBackgroundMessage((payload) => {
  console.log('Фоновое сообщение получено:', payload);
  // Мы удалили ручной код отрисовки, поэтому двойного пуша больше не будет
});

// МАГИЯ КЛИКА: Открываем приложение при нажатии на пуш
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Смахиваем пуш

  // Ссылка на главную страницу
  const urlToOpen = new URL('/GRO-UP/index.html', self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Если приложение уже открыто где-то в фоне - разворачиваем
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Если закрыто - открываем заново
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==========================================
// ЛОГИКА КЭШИРОВАНИЯ (ОФФЛАЙН РЕЖИМ)
// ==========================================
const CACHE_NAME = 'gro-up-v15'; // ⚠️ ОБЯЗАТЕЛЬНО НОВАЯ ВЕРСИЯ

const INITIAL_CACHED_RESOURCES = [
  '/GRO-UP/',
  '/GRO-UP/index.html',
  '/GRO-UP/manifest.json',
  '/GRO-UP/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('/GRO-UP/index.html');
          }
        });
      })
  );
});
