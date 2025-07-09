const cacheName = 'artesp-pwa-cache-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json' 
];

// Evento de Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                console.log('Cache aberto. Adicionando arquivos...');
                return cache.addAll(assetsToCache);
            })
    );
});

// Evento Fetch: Intercepta as requisições
self.addEventListener('fetch', event => {
    event.respondWith(
        // Tenta encontrar o recurso no cache primeiro
        caches.match(event.request)
            .then(response => {
                // Se encontrar no cache, retorna ele. Senão, busca na rede.
                return response || fetch(event.request);
            })
    );
});