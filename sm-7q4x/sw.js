/* ScriptMove – fonctionne sans Internet après la 1re visite.
   Ne met en cache que les fichiers de l'appli (jamais tes vidéos, tes musiques, tes photos ni tes livrets : ils restent dans l'appli).
   lib/ : pdf.js 6.2.108 (Mozilla, licence Apache 2.0, voir lib/LICENSE-pdfjs.txt) pour afficher le livret sans Internet. */
const V = 'sm-app-v20';
const CORE = ['./', './index.html', './core.js', './mp4.js', './app.js', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './lib/pdf.min.mjs', './lib/pdf.worker.min.mjs'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE.map((x) => new Request(x, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  // anciennes versions (et l'ancien détecteur de mouvements) : effacées
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sm-') && k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* v19 : « Partager › ScriptMove » (Android). Le fichier partagé (vidéo ou musique) est mis de côté dans l'appli
   (base 'scriptmove', zone 'kv', clé 'sharePending'), puis l'appli s'ouvre et demande où le ranger.
   La base est ouverte en version 2 avec exactement la même création que app.js (rien n'est jamais effacé). */
function openDB() {
  const go = (ver) => new Promise((res, rej) => {
    const r = ver ? indexedDB.open('scriptmove', ver) : indexedDB.open('scriptmove');
    r.onupgradeneeded = (e) => {
      const d = r.result, old = e.oldVersion || 0;
      if (old < 1) { d.createObjectStore('courses', { keyPath: 'id' }); d.createObjectStore('musics', { keyPath: 'id' }); d.createObjectStore('data'); d.createObjectStore('kv'); }
      if (old < 2) {
        d.createObjectStore('vchunks');
        const p = d.createObjectStore('photos', { keyPath: 'id' }); p.createIndex('mid', 'mid'); p.createIndex('cid', 'cid');
      }
    };
    r.onsuccess = () => { const d = r.result; d.onversionchange = () => d.close(); res(d); };
    r.onerror = () => rej(r.error);
  });
  // si un jour la base passe à une version plus récente, on l'ouvre telle qu'elle est
  return go(2).catch((err) => (err && err.name === 'VersionError' ? go(0) : Promise.reject(err)));
}
async function keepShared(req) {
  const fd = await req.formData();
  const files = fd.getAll('media').filter((f) => f && typeof f === 'object' && f.size > 0);
  if (!files.length) return;
  const d = await openDB();
  try {
    await new Promise((res, rej) => {
      const t = d.transaction('kv', 'readwrite'), s = t.objectStore('kv'), g = s.get('sharePending');
      g.onsuccess = () => {
        const cur = g.result && Array.isArray(g.result.files) ? g.result : { files: [] };
        for (const f of files) cur.files.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: f.name || 'fichier', type: f.type || '', size: f.size, at: Date.now(), blob: f });
        cur.at = Date.now(); s.put(cur, 'sharePending');
      };
      t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('abandon'));
    });
  } finally { d.close(); }
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method === 'POST' && new URL(req.url).pathname.endsWith('/sm-7q4x/share-target')) {
    const back = (q) => Response.redirect(new URL('./?' + q, self.registration.scope).href, 303);
    e.respondWith(keepShared(req).then(() => back('share=1')).catch((err) => { console.warn('partage', err); return back('share=err'); }));
    return;
  }
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin !== location.origin || !u.pathname.includes('/sm-7q4x/')) return;
  // fichiers de l'appli : réseau d'abord (pour les mises à jour), sinon le cache
  e.respondWith(fetch(req, { cache: 'no-cache' }).then((r) => {
    if (r && r.ok) { const cl = r.clone(); caches.open(V).then((c) => c.put(req, cl)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('./index.html'))));
});
