// AquaMeter Service Worker — handles push + offline
const CACHE = 'aquameter-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['/', '/index.html']))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Serve from cache when offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Handle incoming push messages
self.addEventListener('push', e => {
  let data = { title: 'AquaMeter Alert', body: 'New water intelligence alert.' };
  try { data = e.data.json(); } catch (_) {
    if (e.data) data.body = e.data.text();
  }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/icons/icon-192.png',
      badge:   '/icons/badge-72.png',
      tag:     data.tag || 'aquameter',
      vibrate: [200, 100, 200, 100, 200],
      data:    data,
      actions: [
        { action: 'view',    title: '👁 View Alert' },
        { action: 'dismiss', title: '✕ Dismiss'     }
      ]
    })
  );
});

// Notification click — open or focus the app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const existing = cs.find(c => c.url.includes('aquameter') && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow('/');
    })
  );
});
