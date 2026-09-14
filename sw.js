const CACHE = 'rr-pwa-v1';
const ASSETS = ['/', '/index.html', '/services.html', '/reviews.html', '/contact.html', '/schedule.html', '/checkout.html', '/css/app.css', '/js/app.js', '/manifest.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
