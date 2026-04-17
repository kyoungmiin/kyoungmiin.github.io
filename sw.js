self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      } catch (_) {}

      try {
        await self.registration.unregister();
      } catch (_) {}

      try {
        await self.clients.claim();
      } catch (_) {}

      try {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        await Promise.all(
          clients.map((client) =>
            typeof client.navigate === "function" ? client.navigate(client.url) : Promise.resolve()
          )
        );
      } catch (_) {}
    })()
  );
});

self.addEventListener("fetch", () => {});
