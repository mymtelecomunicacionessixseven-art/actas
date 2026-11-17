// Service worker de la app de actas: permite instalarla y abrirla sin internet.
// Siempre intenta la red primero (para recibir las versiones nuevas) y usa la copia guardada si no hay señal.
// Solo guarda archivos de esta misma página; no toca el servidor de actas ni otros sitios.
const CACHE = 'actas-mym-v1';
const BASE = ['./', 'index.html', 'logo.png', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'icono-apple-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(new URL('./', location).pathname)) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
