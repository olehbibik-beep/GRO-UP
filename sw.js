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

  // УМНАЯ ССЫЛКА: сама определяет, где лежит твой index.html
  const urlToOpen = new URL('./index.html', self.location.href).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Ищем, есть ли уже открытое окно с нашим сайтом
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus(); // Разворачиваем свернутое
        }
      }
      // 2. Если приложение полностью закрыто - открываем новое
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==========================================
// ЛОГИКА КЭШИРОВАНИЯ (ОФФЛАЙН РЕЖИМ)
// ==========================================
const CACHE_NAME = 'gro-up-v26'; // ⚠️ ОБЯЗАТЕЛЬНО НОВАЯ ВЕРСИЯ

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

// МАГИЯ КЛИКА: Бронебойный вариант
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Смахиваем пуш

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 1. Если приложение хоть где-то висит в памяти (даже свернутое) - разворачиваем его!
      if (windowClients.length > 0) {
        let client = windowClients[0]; // Берем первое попавшееся окно нашего приложения
        if ('focus' in client) {
          return client.focus();
        }
      }
      // 2. Если приложение было полностью закрыто свайпом вверх - запускаем его с нуля
      if (clients.openWindow) {
        return clients.openWindow('/'); // '/' означает главную страницу
      }
    })
  );
});

