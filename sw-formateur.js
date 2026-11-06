// Appli « CQP Formateur » : rien n'est mis en cache, la page est toujours la dernière version en ligne
// version 2026-11-06 : autres formateurs et « Ouvrir mon espace sur mon PC »
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
