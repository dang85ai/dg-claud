const CACHE = "caledon-u9-public-shell-v2";
const SHELL = ["/", "/schedule", "/roster", "/kit", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
  ));
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Private pages, authenticated requests and external APIs always use the network.
  if (request.method !== "GET" || url.origin !== self.location.origin ||
      request.headers.has("authorization") || request.headers.has("rsc") ||
      url.search || (!SHELL.includes(url.pathname) && !url.pathname.startsWith("/_next/static/") &&
        !url.pathname.startsWith("/images/") && !url.pathname.startsWith("/kit/"))) return;
  event.respondWith(fetch(request).then((response) => {
    const control = response.headers.get("cache-control") ?? "";
    if (response.ok && !/no-store|private/i.test(control)) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  }).catch(async (error) => {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }));
});
