const CACHE_NAME = 'typing-notes-v7';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.svg',
    './icon-192.png',
    './icon-512.png'
];

/**
 * PWA Service Worker
 * Optimizes the app for 100% offline reliability.
 */

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching critical assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Clearing legacy cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Cache-First with Network Fallback for static assets
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Optionally cache new requests dynamically
                return fetchResponse;
            });
        }).catch(() => {
            // Offline fallback for main page if everything fails
            if (event.request.mode === 'navigate') {
                return caches.match('./index.html');
            }
        })
    );
});

// Advanced OS Integration: Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notes') {
        console.log('[SW] Background sync triggered');
    }
});

// Advanced OS Integration: Periodic Sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-refresh') {
        event.waitUntil(Promise.resolve());
    }
});

// Advanced OS Integration: Push Notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.text() : 'Time for your daily typing practice!';
    const options = {
        body: data,
        icon: './icon.svg',
        badge: './icon.svg',
        tag: 'practice-reminder'
    };
    event.waitUntil(self.registration.showNotification('Typing Notes', options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});
