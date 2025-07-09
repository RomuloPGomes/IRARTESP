const cacheName = 'artesp-pwa-cache-v4';
const assetsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/logos/default.png',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('cdnjs.cloudflare.com')) {
        return fetch(event.request);
    }
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});