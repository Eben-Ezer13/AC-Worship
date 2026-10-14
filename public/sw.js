const CACHE = "ac-worship-shell-v2";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/", "/icons/ac-worship-192.png", "/icons/ac-worship-512.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
});
