var CACHE = 'web-games-v1';

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE).then(function (cache) {
            return cache.addAll([
                './',
                'index.html',
                'favicon.svg'
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE; })
                     .map(function (n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    e.respondWith(
        fetch(e.request).then(function (res) {
            var clone = res.clone();
            caches.open(CACHE).then(function (cache) {
                cache.put(e.request, clone);
            });
            return res;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
