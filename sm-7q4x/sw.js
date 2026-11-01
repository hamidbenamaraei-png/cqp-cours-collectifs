/* ScriptMove – fonctionne sans Internet après la 1re visite.
   Ne met en cache que les fichiers de l'appli (jamais tes vidéos, tes musiques, tes photos ni tes livrets : ils restent dans l'appli).
   lib/ : pdf.js 6.2.108 (Mozilla, licence Apache 2.0, voir lib/LICENSE-pdfjs.txt) pour afficher le livret sans Internet. */
const V = 'sm-app-v18';
const CORE = ['./', './index.html', './core.js', './mp4.js', './app.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './lib/pdf.min.mjs', './lib/pdf.worker.min.mjs'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE.map((x) => new Request(x, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  // anciennes versions (et l'ancien détecteur de mouvements) : effacées
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sm-') && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || !u.pathname.includes('/sm-7q4x/')) return;
  // fichiers de l'appli : réseau d'abord (pour les mises à jour), sinon le cache
  e.respondWith(fetch(req, { cache: 'no-cache' }).then((r) => {
    if (r && r.ok) { const cl = r.clone(); caches.open(V).then((c) => c.put(req, cl)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('./index.html'))));
});
