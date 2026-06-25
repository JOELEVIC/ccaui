/*
 * Engine service worker — scoped strictly to /stockfish/* (the Stockfish worker
 * + 7 MB wasm). Serves them from a durable Cache Storage bucket so the engine
 * loads even after the browser evicts its HTTP disk cache. EVERY other request
 * passes straight through untouched (no respondWith), so this can't affect the
 * rest of the site.
 */
const CACHE = "cca-engine-v1";
const ASSETS = [
  "/stockfish/stockfish-18-lite-single.js",
  "/stockfish/stockfish-18-lite-single.wasm",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  // Pre-cache best-effort; if it fails (offline first visit) the app layer and
  // normal fetch handler will populate the cache later.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop any older engine caches.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("cca-engine-") && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }
  // Only ever handle our own engine assets.
  if (url.origin !== self.location.origin || !url.pathname.startsWith("/stockfish/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(event.request);
      if (hit) return hit;
      try {
        const res = await fetch(event.request);
        if (res && res.ok) cache.put(event.request, res.clone());
        return res;
      } catch (err) {
        const fallback = await cache.match(url.pathname);
        if (fallback) return fallback;
        throw err;
      }
    })()
  );
});
