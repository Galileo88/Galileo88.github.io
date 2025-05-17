
const cacheName = "gridiron-cache";
const assets = ["index.html", "style.css", "game.js", "manifest.json", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(cacheName).then(c => c.addAll(assets)));
});
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
