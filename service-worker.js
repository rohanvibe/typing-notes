const CACHE_NAME = 'typing-notes-v3';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.svg'
];

// Install: Cache essential assets immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching offline assets');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Serve from cache offline, check network online
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notes') {
        console.log('[SW] Syncing data...');
    }
});

// Periodic Sync
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'refresh-history') {
        event.waitUntil(fetch('./').then(r => console.log('[SW] Content refreshed')));
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: 'Time to practice your typing speed!',
        icon: './icon.svg',
        badge: './icon.svg',
        vibrate: [100, 50, 100],
        data: { url: './' }
    };
    event.waitUntil(self.registration.showNotification('Typing Notes', options));
});

// Notification Interaction
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});
