// Appli « CQP Formateur » : rien n'est mis en cache, la page est toujours la dernière version en ligne
// version 2026-11-06d : la page est toujours redemandée au serveur (plus de vieille version gardée 10 min)
// version 2026-11-06c : « Partager » depuis une autre appli du téléphone → les fichiers arrivent dans l'appli formateur (« Où ranger ? »)
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'&&e.request.method==='GET'){e.respondWith(fetch(e.request,{cache:'no-cache'}).catch(()=>fetch(e.request)));return}
  if(e.request.method!=='POST'||!u.searchParams.has('partage'))return;
  e.respondWith((async()=>{
    try{const fd=await e.request.formData(), fs=fd.getAll('fichiers').filter(f=>f&&typeof f!=='string'&&f.size>0);
      const c=await caches.open('cqpf-partage');let i=0;
      for(const f of fs)await c.put(new URL('partage/'+Date.now()+'-'+(i++),self.registration.scope).href,new Response(f,{headers:{'content-type':f.type||'application/octet-stream','x-nom':encodeURIComponent(f.name||'document')}}));
    }catch(err){}
    return Response.redirect(new URL('f-l93i4ev.html?recu=1',self.registration.scope).href,303);
  })());
});
