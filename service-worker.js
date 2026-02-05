const CACHE_NAME = 'typing-notes-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.svg'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// Background Sync: For ensuring notes are saved locally or queued for sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-notes') {
        console.log('[SW] Background Sync: Syncing notes...');
        // Logic to sync with local storage or indexedDB if backend were present
    }
});

// Periodic Background Sync: For refreshing data in the background
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'refresh-history') {
        event.waitUntil(refreshAppContent());
    }
});

async function refreshAppContent() {
    console.log('[SW] Periodic Sync: Refreshing content...');
    // Fetch latest updates if any remote source existed
}

// Push Notifications: Re-engage user
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Typing Notes', body: 'Time to practice!' };
    const options = {
        body: data.body,
        icon: 'icon.svg',
        badge: 'icon.svg',
        vibrate: [100, 50, 100],
        data: { url: './' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click: Navigate to app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow('./');
        })
    );
});
