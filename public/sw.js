// CHFM Service Worker
// Estrategia: network-first para datos (rutas con auth), cache-first para assets estáticos.
// Mantén la versión sincronizada para invalidar caches en deploys.

const VERSION = "v1";
const STATIC_CACHE = `chfm-static-${VERSION}`;
const RUNTIME_CACHE = `chfm-runtime-${VERSION}`;

// Recursos del shell que cacheamos en install (mínimo lo necesario para que
// la app abra offline mostrando el layout y un mensaje "sin conexión").
const SHELL_ASSETS = ["/auth/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
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

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo manejamos GET del mismo origen.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Nunca cachear rutas /api/* ni /auth/* (siempre pedir red).
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    return;
  }

  // Assets estáticos de Next.js: cache-first (immutable).
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname.startsWith("/icon") ||
    url.pathname.startsWith("/apple-icon") ||
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

  // HTML pages: network-first, fallback al último cacheado.
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
            new Response(
              `<!doctype html><html lang="es"><body style="font-family:system-ui;padding:2rem"><h1>Sin conexión</h1><p>El sistema CHFM no puede conectarse en este momento.</p></body></html>`,
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            ),
        ),
      ),
  );
});
