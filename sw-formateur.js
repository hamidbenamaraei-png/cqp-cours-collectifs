// Appli « CQP Formateur » : rien n'est mis en cache, la page est toujours la dernière version en ligne
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
