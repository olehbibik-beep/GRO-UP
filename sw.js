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
        icon: './icon-512.png',
        badge: './icon-512.png'
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
// ЛОГИКА КЭШИРОВАНИЯ И ЗАЩИТА ОТ ДУБЛЕЙ
// ==========================================
const CACHE_NAME = 'gro-up-v45'; 

const INITIAL_CACHED_RESOURCES = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  
  // 🔥 НЕУБИВАЕМАЯ УСТАНОВКА: Игнорируем ошибки при скачивании файлов
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (let req of INITIAL_CACHED_RESOURCES) {
         try { 
             await cache.add(req); 
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
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim(); 
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
