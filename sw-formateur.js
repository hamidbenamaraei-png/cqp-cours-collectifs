// Appli « CQP Formateur » : rien n'est mis en cache, la page est toujours la dernière version en ligne
// version 2026-11-06b : « Envoyer depuis mon PC » et « Mes documents » (la page de l'ordinateur fpc-r8w3m5.html est hors de cette appli)
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
