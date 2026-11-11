/**
 * Service Worker Nativo di Brumavento (PWA Offline & Caching).
 * Versione: 0.5.0 - brumavento-cache-v0.5.0
 *
 * Strategie di caching:
 * - Network-First per richieste di navigazione HTML (index.html).
 * - Cache-First per asset binari statici (.glb, .png, audio, .js, .css).
 * - Pulizia automatica delle cache obsolete (v0.4.0 e precedenti) all'attivazione.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.5.0
 */

const CACHE_NAME = 'brumavento-cache-v0.5.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/models/Textures/colormap.png',
  '/models/barrel.glb',
  '/models/BoatWSail.glb',
  '/models/campfire_logs.glb',
  '/models/chest.glb',
  '/models/Fox.glb',
  '/models/Mage.glb',
  '/models/Rig_Medium_General.glb',
  '/models/Rig_Medium_MovementBasic.glb',
  '/models/Rogue_Hooded.glb',
  '/models/sign.glb',
  '/models/tree_detailed.glb',
  '/models/tree_oak.glb'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Apertura cache e precaching asset essenziali:', CACHE_NAME);
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Alcuni asset non sono stati pre-caricati:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME && name.startsWith('brumavento-cache-')) {
            console.log('[Service Worker] Eliminazione vecchia cache obsoleta:', name);
            return caches.delete(name);
          }
          return Promise.resolve(false);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignora richieste non-GET o verso estensioni browser / schemi speciali
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Richieste di navigazione HTML: Network-First con fallback su cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Modelli 3D, Texture, CSS, JS: Cache-First con fallback di rete
  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[Service Worker] Fetch fallita per:', event.request.url, err);
        return cachedResponse || new Response('Offline resource unavailable', { status: 503 });
      });
    })
  );
});
