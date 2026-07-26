const CACHE_NAME = 'app-cache-v2'; // Incrementado a v2 por los nuevos cambios
const STATIC_ASSETS = [
    './',
    './index.html',
    './calculadora.html',
    './offline.html',
    './styles.css',
    './manifest.json',
    './js/app.js',
    './js/config.js',
    './js/modules/api.js',
    './js/modules/clock.js',
    './js/modules/converter.js',
    './js/modules/gold.js',
    './js/modules/greeting.js',
    './js/modules/stats.js',
    './js/modules/storage.js',
    './js/modules/theme.js',
    './js/modules/ui.js',
    './js/modules/utils.js',
    './js/modules/weather.js',
    './assets/images/favicon.ico',
    './assets/images/apple-touch-icon.png',
    './assets/images/android-chrome-192x192.png',
    './assets/images/android-chrome-512x512.png',
    './assets/images/maskable-icon-512x512.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// 1. Instalar e Iniciar Caché
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precacheando recursos estáticos');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// 2. Activar y Limpiar Cachés Antiguos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Estrategia de Intercepción de Peticiones (Híbrida Pro)
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // Solo procesar peticiones GET
    if (request.method !== 'GET') return;

    // Estrategia A: Navegación HTML (Network First -> Cache -> Offline Page)
    if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        return caches.match('./offline.html');
                    });
                })
        );
        return;
    }

    // Estrategia B: CSS, JS, Imágenes y CDN (Stale-While-Revalidate)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
                    }
                    return networkResponse;
                })
                .catch((err) => console.log('[SW] Fetch falló en segundo plano:', err));

            return cachedResponse || fetchPromise;
        })
    );
});