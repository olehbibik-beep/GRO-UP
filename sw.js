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

messaging.onBackgroundMessage((payload) => {
  if (!payload.notification) {
     const title = payload.data?.title || 'GRO-UP';
     const options = {
        body: payload.data?.body || 'Новое уведомление',
        icon: 'https://olehbibik-beep.github.io/GRO-UP/icon-512.png',
        badge: 'https://olehbibik-beep.github.io/GRO-UP/icon-512.png',
        data: payload.data
     };
     self.registration.showNotification(title, options);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      if (windowClients.length > 0) {
        let client = windowClients[0];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ==========================================
// 🔥 ГЛАВНЫЙ РУБИЛЬНИК КЭША (Версия 81)
// ==========================================
const CACHE_NAME = 'gro-up-v81'; // Увеличили версию!

const INITIAL_CACHED_RESOURCES = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-512.png',
  // 🔥 ДОБАВЛЯЕМ ДИЗАЙН В ПАМЯТЬ ТЕЛЕФОНА
  'https://cdn.tailwindcss.com',
  // 🔥 ДОБАВЛЯЕМ ФОНЫ СТЕНДА, ЧТОБЫ РАБОТАЛИ БЕЗ ИНТЕРНЕТА
  './bg-day-clear.webp',
  './bg-day-cloudy.webp',
  './bg-day-rain.webp',
  './bg-day-snow.webp',
  './bg-night-clear.webp',
  './bg-night-cloudy.webp',
  './bg-night-rain.webp',
  './bg-night-snow.webp'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (let req of INITIAL_CACHED_RESOURCES) {
         try { 
             await cache.add(new Request(req, { cache: 'reload' })); 
         } catch(e) { 
             console.log('Файл пропущен при кэшировании: ' + req); 
         }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) {
            console.log('Удаляем старый кэш: ' + key);
            return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  // 🔥 Разрешаем кэшировать файлы НАШЕГО сайта И скрипт дизайна Tailwind
  const isLocal = event.request.url.startsWith(self.location.origin);
  const isTailwind = event.request.url.includes('cdn.tailwindcss.com');
  
  // Игнорируем базу данных Firebase и прочие посторонние ссылки
  if (!isLocal && !isTailwind) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((response) => {
      // Сеть есть! Отдаем свежий файл и незаметно обновляем кэш в фоне
      const resClone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      return response;
    }).catch(() => {
      // Интернета нет! Достаем из заначки
      return caches.match(event.request);
    })
  );
});
