// CHFM Service Worker
// - network-first para HTML (con fallback a cache + página offline branded)
// - cache-first para assets estáticos de Next.js, iconos y fuentes
// - excluye /api/* y /auth/* del cache (siempre pedir red)
// - update flow: NO skipWaiting automático; espera mensaje del cliente para activar nueva versión

const VERSION = "v2";
const STATIC_CACHE = `chfm-static-${VERSION}`;
const RUNTIME_CACHE = `chfm-runtime-${VERSION}`;

const OFFLINE_URL = "/offline";
const SHELL_ASSETS = ["/auth/login", OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined)),
  );
  // NO skipWaiting aquí — esperamos a que el cliente lo pida explícitamente
  // (vía postMessage SKIP_WAITING) para no recargar a media interacción.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear API ni auth — siempre red, sin fallback.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  // Assets estáticos: cache-first (immutable).
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon" ||
    url.pathname === "/apple-icon" ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        });
      }),
    );
    return;
  }

  // HTML pages: network-first → cache → /offline.
  if (req.mode === "navigate" || req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(
            (cached) =>
              cached ??
              caches.match(OFFLINE_URL).then(
                (off) =>
                  off ??
                  new Response("Sin conexión", {
                    status: 503,
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                  }),
              ),
          ),
        ),
    );
  }
});
