self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("game-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/assets/garage.png",
        "/assets/icon-192x192.png",
        "/assets/icon-512x512.png",
        "/assets/left.png",
        "/assets/logo.png",
        "/assets/metal.png",
        "/assets/nepodporovano.png",
        "/assets/nut.png",
        "/assets/right.png",
        "/assets/smn.png",
        "/assets/ZLKLGround.png",
        "/assets/ZLKLHraPozadí.png",
        "/assets/ZLKLHudba.wav",
        "/assets/ZLKLPostavička.png",
        "/app.js",
        "/style.css",
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
