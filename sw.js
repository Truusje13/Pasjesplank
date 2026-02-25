const CACHE_NAME = 'pasjesplank-v13';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './pasjesplank_logo_final.svg',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js',
  'https://cdn.jsdelivr.net/npm/@ericblade/quagga2/dist/quagga.min.js'
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for own files, cache-first for CDN
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CDN resources (libraries) → cache-first (they don't change)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Own files → network-first (so updates arrive immediately)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Update cache with fresh version
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // Offline fallback
  );
});
