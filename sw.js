// Lets the site install as an app and open offline.
// Pages: try the network first so updates show right away, fall back to the saved copy offline.
// Everything else (css, js, photos, fonts): use the saved copy, and refresh it in the background.
// Bump VERSION to drop old saved files.
const VERSION = 'brittany-v2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(['./', 'manifest.webmanifest', 'icons/icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async c => {
    const saved = await c.match(req);
    const fresh = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => saved);
    return saved || fresh;
  }));
});
