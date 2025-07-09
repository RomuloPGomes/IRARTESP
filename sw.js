const cacheName = 'artesp-pwa-cache-v2'; // Versão do cache atualizada
const assetsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json' 
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(assetsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});