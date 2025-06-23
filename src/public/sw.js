// src/public/sw.js

const IS_DEVELOPMENT = self.location.hostname === 'localhost';

const CACHE_NAME = 'story-app-cache-v1';
const DYNAMIC_CACHE_NAME = 'story-app-dynamic-cache-v1';
const API_BASE_URL = 'https://story-api.dicoding.dev/v1/';

const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-96x96.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  'https://unpkg.com/leaflet/dist/leaflet.css',
];

self.addEventListener('install', (event) => {
  if (IS_DEVELOPMENT) {
    console.log('Skipping App Shell caching in development mode.');
    return;
  }
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(APP_SHELL_ASSETS);
    }).catch(error => {
      console.error('Service Worker: Failed to cache App Shell', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (IS_DEVELOPMENT) {
    return;
  }
  const { request } = event;
  if (!request.url.startsWith('http')) {
    return;
  }
  if (request.url.startsWith(API_BASE_URL)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.log('Service Worker: Fetching from cache for API request.');
          return await cache.match(request);
        }
      })
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  let notificationData = {};
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Notifikasi Uji Coba',
      body: event.data ? event.data.text() : 'Ini adalah pesan push simulasi.',
      url: '/',
    };
  }
  const title = notificationData.title || 'Notifikasi Baru';
  const options = {
    body: notificationData.body || 'Ada sesuatu yang baru untuk Anda.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: {
      url: notificationData.url || '/',
    },
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// === BAGIAN YANG DIPERBAIKI ===
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification-click event');
  // event.notification.close(); // Baris ini dihapus agar notifikasi tidak langsung hilang

  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});