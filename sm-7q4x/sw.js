/* ScriptMove – fonctionne sans Internet après la 1re visite.
   Ne met en cache que les fichiers de l'appli et les bibliothèques publiques (jamais tes vidéos ni tes musiques). */
const V = 'sm-app-v1', LIB = 'sm-lib-v1';
const CORE = ['./', './index.html', './core.js', './mp4.js', './app.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sm-') && k !== V && k !== LIB).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const isLib = (u) => u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'storage.googleapis.com';
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (isLib(u)) {
    // bibliothèques (versions fixes) : d'abord le cache
    e.respondWith(caches.open(LIB).then(async (c) => {
      const hit = await c.match(req.url); if (hit) return hit;
      const r = await fetch(req);
      if (r && (r.ok || r.type === 'opaque')) c.put(req.url, r.clone());
      return r;
    }));
    return;
  }
  if (u.origin !== location.origin || !u.pathname.includes('/sm-7q4x/')) return;
  // fichiers de l'appli : réseau d'abord (pour les mises à jour), sinon le cache
  e.respondWith(fetch(req).then((r) => {
    if (r && r.ok) { const cl = r.clone(); caches.open(V).then((c) => c.put(req, cl)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('./index.html'))));
});
