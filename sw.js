const CACHE_NAME = 'gro-up-v4';

// Основные файлы для мгновенного запуска
const INITIAL_CACHED_RESOURCES = [
  '/GRO-UP/',
  '/GRO-UP/index.html',
  '/GRO-UP/manifest.json',
  '/GRO-UP/app.js'
];

// Установка
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
});

// Активация и чистка старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
});

// ГЛАВНАЯ МАГИЯ: Стратегия "Сначала сеть, если нет — берем из кэша"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Если получили ответ от сети — сохраняем копию в кэш
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // Если интернета нет — ищем в кэше
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Если это переход на страницу, которой нет в кэше — отдаем главную
          if (event.request.mode === 'navigate') {
            return caches.match('/GRO-UP/index.html');
          }
        });
      })
  );
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging/sw.js";

const firebaseConfig = {
    // Твой конфиг Firebase (скопируй из app.js)
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Слушаем фоновые сообщения
onBackgroundMessage(messaging, (payload) => {
  console.log('Получено фоновое сообщение:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/GRO-UP/icon-192x192.png' // Путь к иконке
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
