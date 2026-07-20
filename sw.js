var CACHE = 'web-games-v4';
var PRECACHE = [
    './',
    'index.html',
    'manifest.json',
    'favicon.svg',
    'version.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-maskable-512.png',
    'icons/apple-touch-icon.png',
    'shared/base.css',
    'shared/shell.js',
    'Sudoku/index.html',
    'Yakazu/index.html',
    'Memory/index.html',
    'Snake/index.html',
    'ZooKeeper/index.html'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (cache) {
            // Cache each resource independently: one failure must not abort install.
            return Promise.all(PRECACHE.map(function (url) {
                return cache.add(url).catch(function () {});
            }));
        }).then(function () { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE; })
                     .map(function (n) { return caches.delete(n); })
            );
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (e) {
    var req = e.request;

    // Only handle GET over http(s); let POST, chrome-extension:, etc. pass through.
    if (req.method !== 'GET') return;
    var scheme = req.url.split(':')[0];
    if (scheme !== 'http' && scheme !== 'https') return;

    e.respondWith(
        fetch(req).then(function (res) {
            // Cache only successful, non-partial responses of a type we can store.
            if (res && res.ok && res.status !== 206 &&
                (res.type === 'basic' || res.type === 'cors')) {
                var clone = res.clone();
                e.waitUntil(
                    caches.open(CACHE).then(function (cache) { return cache.put(req, clone); })
                );
            }
            return res;
        }).catch(function () {
            // Offline: serve from cache, with a sensible fallback.
            return caches.match(req, { ignoreSearch: true }).then(function (cached) {
                if (cached) return cached;
                if (req.mode === 'navigate') return caches.match('index.html');
                return new Response('', { status: 503, statusText: 'Offline' });
            });
        })
    );
});
