// 1. ИМПОРТЫ FIREBASE (Для Service Worker используем importScripts)
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// 2. КОНФИГ И ИНИЦИАЛИЗАЦИЯ
const firebaseConfig = {
    apiKey: "AIzaSyCwflIUs2AnBRIIxrssVpbpykHwG2436q0",
    authDomain: "gro-uping.firebaseapp.com",
    projectId: "gro-uping",
    storageBucket: "gro-uping.firebasestorage.app",
    messagingSenderId: "819938349545",
    appId: "1:819938349545:web:a00c3bef66d99f5b6cfb78"
};

// Инициализируем Firebase в фоновом режиме
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. ЛОГИКА ФОНОВЫХ ПУШ-УВЕДОМЛЕНИЙ
messaging.onBackgroundMessage((payload) => {
  console.log('Получено фоновое сообщение:', payload);
  // ВНИМАНИЕ: Мы удалили ручной вызов showNotification, 
  // потому что Firebase теперь сам рисует пуши автоматически!
});

// ==========================================
// 4. ЛОГИКА КЭШИРОВАНИЯ (ТВОЙ ОФФЛАЙН РЕЖИМ)
// ==========================================
const CACHE_NAME = 'gro-up-v12';

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
  self.skipWaiting(); // Заставляет SW обновиться сразу
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
  // Игнорируем запросы к другим сайтам и API Firebase (чтобы пуши работали)
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
