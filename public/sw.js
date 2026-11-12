// Network-first caching is limited to immutable, public static assets.
// Never intercept HTML navigation, authenticated routes, forms, API calls, or external requests.
const CACHE = "caledon-united-static-assets-v3";
const PUBLIC_ASSET_PATHS = [
  /^\/_next\/static\//,
  /^\/assets\/brand\/[^/]+\.(?:webp|png|jpg|jpeg|svg|ico|avif)$/i,
  /^\/kit\/[^/]+\.(?:webp|png|jpg|jpeg|svg|avif)$/i,
  /^\/sponsors\/[^/]+\.(?:webp|png|jpg|jpeg|svg|avif)$/i,
  /^\/(?:favicon\.ico|site\.webmanifest|manifest\.webmanifest)$/i
];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) =>
            (key.startsWith("caledon-") || key.startsWith("caledon-u9")) && key !== CACHE
          )
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode === "navigate" || request.destination === "document") return;
  if (request.headers.has("authorization")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!PUBLIC_ASSET_PATHS.some((pattern) => pattern.test(url.pathname))) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        event.waitUntil(
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
        );
      }
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  })());
});
