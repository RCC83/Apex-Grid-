// Service worker de ScoreBoard Live : permet d'ouvrir l'app sans réseau au bord du terrain.
// - Pages : réseau d'abord, version en cache si hors ligne.
// - Fichiers de l'app (/assets/*, icônes) : cache d'abord (leurs noms changent à chaque build).
// - Polices Google : cache, mis à jour en arrière-plan.

const CACHE = 'scoreboard-v2';
const PRECACHE = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putInCache = async (request, response) => {
  if (response && (response.ok || response.type === 'opaque')) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => putInCache('/', response))
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => putInCache(request, response)))
    );
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => putInCache(request, response))
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
