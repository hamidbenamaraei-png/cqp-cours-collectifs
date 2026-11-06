// ======= 06/11 : « 💻 Envoyer depuis mon PC » et « 📁 Mes documents » (espace formateur seulement) =======
// Même principe que « 💻 Relier mon PC » de ScriptMove (sm-7q4x/app.js), avec son propre sel (fpc-commun.js) :
// - le téléphone crée un code ; la page fpc-r8w3m5.html de l'ordinateur se relie avec ce code ;
// - le relais Supabase (fonctions pc_*, utilisées telles quelles) ne transporte que de petits messages chiffrés pour se trouver ;
// - les fichiers passent DIRECTEMENT de l'ordinateur au téléphone (WebRTC chiffré), puis restent SEULEMENT sur ce téléphone :
//   musiques dans « 🎵 Mes musiques » (base cqpf_musiques, exactement comme une musique ajoutée sur le téléphone),
//   documents dans « 📁 Mes documents » (base cqpf_docs). Rien n'est envoyé aux stagiaires ni aux autres formateurs.
// Chaque formateur (Hamid = « admin », les autres = leur id) a son propre code et ses propres dossiers sur l'appareil.
const DP_DB='cqpf_docs', DP_BLOC=8*1024*1024, DP_PAGE='fpc-r8w3m5.html';
let DP_BASE=null;
function dpBase(){
  if(DP_BASE)return DP_BASE;
  DP_BASE=new Promise((ok,ko)=>{const r=indexedDB.open(DP_DB,1);
    r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('f',{keyPath:'id'});d.createObjectStore('d',{keyPath:'id'});d.createObjectStore('kv');d.createObjectStore('part')};
    r.onsuccess=()=>{const d=r.result;d.onversionchange=()=>{d.close();DP_BASE=null};ok(d)};
    r.onerror=()=>{DP_BASE=null;ko(r.error)}});
  return DP_BASE;
}
async function dpOp(st,mode,f){const db=await dpBase();return new Promise((ok,ko)=>{const t=db.transaction(st,mode),s=t.objectStore(st);const r=f(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ko(t.error);t.onabort=()=>ko(t.error)})}
const dpProprio=()=>estAdmin()?'admin':((moiF()||{}).id||'');
async function dpDossiers(p){return ((await dpOp('d','readonly',s=>s.getAll()))||[]).filter(x=>x.proprio===p).sort((a,b)=>a.nom.localeCompare(b.nom,'fr'))}
async function dpFichiers(p){return ((await dpOp('f','readonly',s=>s.getAll()))||[]).filter(x=>x.proprio===p).sort((a,b)=>a.at-b.at)}
const dpPartRange=id=>IDBKeyRange.bound('rx_'+id+':','rx_'+id+':￿');
const dpPartCle=(id,i)=>'rx_'+id+':'+String(i).padStart(6,'0');
function dpTaille(b){b=b||0;if(b<1e6)return Math.max(1,Math.round(b/1e3))+' Ko';if(b<1e9)return Math.round(b/1e6)+' Mo';return (b/1e9).toFixed(1).replace('.',',')+' Go'}
const dpEstQuota=e=>!!e&&(e.name==='QuotaExceededError'||/quota/i.test(String(e.message||e)));
const dpId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const DP_EXT_MU=/\.(mp3|m4a|wav|aac|ogg|oga|opus|flac|wma|amr)$/i;
const dpEstMusique=(nom,type)=>/^audio\//.test(type||'')||DP_EXT_MU.test(nom||'');
function dpIcone(x){const t=x.type||'',n=x.nom||'';return /\.pdf$/i.test(n)||t==='application/pdf'?'📕':/^image\//.test(t)?'🖼️':dpEstMusique(n,t)?'🎵':/^video\//.test(t)?'🎬':/\.(docx?|odt|rtf|txt)$/i.test(n)?'📝':/\.(pptx?|odp|key)$/i.test(n)?'📊':/\.(xlsx?|ods|csv)$/i.test(n)?'📈':'📄'}

/* ---------- le lien avec l'ordinateur (gardé dans cqpf_docs, jamais dans le lien « Ouvrir mon espace sur mon PC ») ---------- */
const DPT={raw:null,rawP:'',lien:null,proprio:'',occupe:false,tour:0,rtc:null,dc:null,cx:'',rx:null,vus:new Set(),wake:null,msg:'',demarre:false};
const dpOk=()=>!!(window.FPC&&window.RTCPeerConnection&&window.crypto&&crypto.subtle&&window.indexedDB);
const dpPage=()=>new URL(DP_PAGE,location.href).href;
async function dpRaw(p){
  if(DPT.raw&&DPT.rawP===p)return DPT.raw;
  let x=null;try{x=await dpOp('kv','readonly',s=>s.get('pc_'+p))}catch(e){x=null}
  if(!x||!/^[0-9a-f]{32}$/.test(String(x.canal||''))||!x.cle||!x.code)return null;
  DPT.raw=x;DPT.rawP=p;return x;
}
async function dpEcrireRaw(p,x){await dpOp('kv','readwrite',s=>s.put(x,'pc_'+p));DPT.raw=x;DPT.rawP=p}
async function dpLien(p){const x=await dpRaw(p);if(!x)return null;if(!DPT.lien||DPT.lien.canal!==x.canal)DPT.lien={canal:x.canal,cle:await FPC.importer(x.cle)};return DPT.lien}
const dpIciPC=()=>!!document.getElementById('dp-pc');
const dpReseau=e=>e&&e.reseau?'Pas de connexion internet. Vérifie ta connexion, puis réessaie.':'Le service ne répond pas pour le moment. Réessaie dans quelques minutes.';

async function ecranEnvoiPC(){
  const p=dpProprio(); if(!p)return ecranCode();
  const x=dpOk()?await dpRaw(p):null;
  const top=`<button class="back" id="bk">← Retour</button><div class="tag">Espace formateur</div><h1>💻 Envoyer depuis mon PC</h1><span id="dp-pc"></span>`;
  const msg=DPT.msg?`<div class="err" role="status">${esc(DPT.msg)}</div>`:'';
  const garde=`<div class="card j nopli"><p style="margin:0">📱 <b>Pour recevoir, garde ton espace formateur ouvert sur ce téléphone</b>, écran allumé, pendant tout l'envoi.</p></div>`;
  const prive=`<p class="muted">🔒 Les fichiers vont directement de ton ordinateur à ce téléphone, chiffrés. Ils ne sont gardés sur aucun serveur et restent seulement sur ce téléphone : les stagiaires et les autres formateurs ne les voient pas.</p>`;
  const dest=`<p class="muted" style="margin:8px 0 0">Sur l'ordinateur, tu choisis où les ranger : ${estAdmin()?'« 🎵 Mes musiques » (Tabata, Renfo… : comme une musique ajoutée ici) ou ':''}« 📁 Mes documents » (un dossier existant ou un nouveau).</p>`;
  let h;
  if(!dpOk())h=top+`<div class="card r nopli"><p style="margin:0">Ce téléphone ou ce navigateur ne permet pas de recevoir des fichiers d'un ordinateur. Utilise Chrome, à jour.</p></div>`;
  else if(navigator.onLine===false)h=top+`<div class="card j nopli"><h2>📶 Il faut internet pour relier ton PC</h2><p class="muted" style="margin:0">Reviens ici quand tu as du réseau ou du Wi-Fi.</p><button class="btn sec" id="dp-re">🔄 Réessayer</button></div>`;
  else if(!x)h=top+`<div class="card o nopli"><div style="font-size:40px">💻</div><h2>Envoie tes musiques et tes documents depuis ton ordinateur</h2>
    <p style="margin:0">Tu les glisses sur une page de ton ordinateur, ils arrivent ici, sur ce téléphone.</p>${dest}${prive}${msg}
    <button class="btn" id="dp-creer"${DPT.occupe?' disabled':''}>${DPT.occupe?'⏳ Un instant…':'💻 Relier mon ordinateur'}</button></div>`;
  else{
    const url=dpPage()+'#'+x.code;let qr=null;try{qr=typeof qrSvg==='function'?qrSvg(url):null}catch(e){qr=null}
    h=top+(x.pc?`<div class="card g nopli"><h2>✅ Ton ordinateur est relié</h2><p class="muted" style="margin:0">${esc(x.pc)}</p><p style="margin:8px 0 0">Sur ton ordinateur, choisis où ranger, puis glisse tes fichiers sur la page.</p>${x.recus?`<p class="muted" style="margin:8px 0 0">📥 ${x.recus} fichier${x.recus>1?'s reçus':' reçu'} de ton ordinateur</p>`:''}</div>`
      :`<div class="card j nopli" role="status"><h2>⏳ J'attends ton ordinateur…</h2><p class="muted" style="margin:0">Laisse cet écran ouvert pendant que tu ouvres la page sur ton ordinateur.</p></div>`)+
     `<div class="card o nopli"><h2>Ouvre cette page sur ton ordinateur</h2>
      <p style="margin:0"><b>1.</b> Touche « 📤 M'envoyer le lien », envoie-le-toi (e-mail ou WhatsApp), puis ouvre-le sur ton ordinateur. La page se relie toute seule.</p>
      <button class="btn" id="dp-lien">📤 M'envoyer le lien</button>
      ${qr?`<div class="qr">${qr}</div><p class="muted" style="margin:4px 0 0;text-align:center">Si ton ordinateur a une caméra, tu peux aussi viser ce code.</p>`:''}
      <p style="margin:12px 0 6px"><b>2.</b> Ou tape ce code sur la page de ton ordinateur :</p>
      <div style="font-size:clamp(22px,7.5vw,30px);font-weight:900;letter-spacing:2px;white-space:nowrap;text-align:center;padding:12px 6px;border-radius:14px;background:#141b33;font-family:ui-monospace,Menlo,Consolas,monospace">${esc(FPC.joli(x.code))}</div>
      <div class="lien hide" id="dp-l"></div><div class="ok hide" id="dp-ok"></div>
      ${dest}</div>`+garde+prive+msg+
     `<button class="btn sec" id="dp-docs-b">📁 Voir mes documents</button>
      <button class="btn ko" id="dp-delier"${DPT.occupe?' disabled':''}>Délier mon ordinateur</button><div id="dp-cz"></div>`;
  }
  h+=`<button class="btn sec" id="bk2">← Retour à l'accueil</button>`;
  app.innerHTML=h;
  const on=(id,f)=>{const b=document.getElementById(id);if(b)b.onclick=f};
  on('bk',accueil);on('bk2',accueil);on('dp-re',ecranEnvoiPC);on('dp-creer',dpCreer);on('dp-docs-b',()=>mesDocuments());
  on('dp-lien',async()=>{const y=await dpRaw(p);if(!y)return;const url=dpPage()+'#'+y.code;
    if(navigator.share){try{await navigator.share({title:'Envoyer sur mon téléphone',text:"J'ouvre ce lien sur mon ordinateur pour envoyer mes musiques et mes documents sur mon téléphone :",url});return}catch(e){if(e&&e.name==='AbortError')return}}
    const c=await copier(url),zl=document.getElementById('dp-l'),ok=document.getElementById('dp-ok');
    zl.textContent=url;zl.classList.remove('hide');ok.textContent=c?'✅ Lien copié : colle-le dans un message pour toi (e-mail ou WhatsApp).':'Appuie longtemps sur le lien ci-dessus, puis choisis « Copier ».';ok.classList.remove('hide')});
  on('dp-delier',()=>confirmerIci(document.getElementById('dp-cz'),"Délier ton ordinateur ? Les fichiers déjà arrivés restent sur ce téléphone. Pour envoyer de nouveau, il faudra un nouveau code.",'Délier',dpDelier));
  haut();
}
async function dpCreer(){
  if(DPT.occupe)return;const p=dpProprio();if(!p)return;
  DPT.occupe=true;DPT.msg='';ecranEnvoiPC();
  try{const r=await FPC.deriver(FPC.nouveauCode());
    await FPC.rpc('pc_canal_creer',{p_canal:r.canal});
    await dpEcrireRaw(p,{code:r.code,canal:r.canal,cle:r.cleB64,le:Date.now(),pc:'',recus:0});DPT.lien=null;
  }catch(e){DPT.msg=dpReseau(e)}
  DPT.occupe=false;if(dpIciPC())ecranEnvoiPC();
}
async function dpOublier(p,txt){
  dpFermer();try{await dpOp('kv','readwrite',s=>s.delete('pc_'+p))}catch(e){}
  if(DPT.rawP===p){DPT.raw=null;DPT.rawP=''}DPT.lien=null;DPT.vus.clear();
  if(txt)dpBandeau({ok:txt});
  if(dpIciPC())ecranEnvoiPC();
}
async function dpDelier(){
  const p=dpProprio(),x=await dpRaw(p);if(!x)return ecranEnvoiPC();
  try{await FPC.rpc('pc_canal_supprimer',{p_canal:x.canal})}catch(e){/* le relais efface tout seul les canaux inutilisés */}
  await dpOublier(p,'💻 Ordinateur délié');ecranEnvoiPC();
}

/* ---------- ce que l'ordinateur peut proposer : catégories de musiques (Hamid) et dossiers ---------- */
async function dpLieux(p){
  let mu=null;
  if(p==='admin'&&typeof muCats==='function'){
    // les mêmes catégories que l'écran 🎵 Mes musiques
    let L=[];try{L=(await muOp('readonly',s=>s.getAll()))||[]}catch(e){L=[]}
    mu=muCats().filter(c=>c!=='Échauffement'||L.some(m=>m&&m.cat===c));
    L.forEach(m=>{if(m&&m.cat&&!mu.includes(m.cat))mu.push(m.cat)});
  }
  const D=await dpDossiers(p),F=await dpFichiers(p);
  return {t:'lieux',mu,dossiers:D.map(d=>({id:d.id,nom:d.nom,n:F.filter(f=>f.dossier===d.id).length}))};
}
async function dpEnvoyerLieux(){const p=DPT.cx;if(!p||p!==dpProprio())return;try{dpDire(await dpLieux(p))}catch(e){}}

/* ---------- écouter l'ordinateur (tant que l'espace formateur est ouvert) ---------- */
async function dpTour(){
  if(DPT.tour||document.hidden||!dpOk()||navigator.onLine===false)return;
  const p=dpProprio();
  if(p!==DPT.proprio){dpFermer();DPT.lien=null;DPT.vus.clear();DPT.proprio=p}
  if(!p)return;
  const x=await dpRaw(p);if(!x)return;
  DPT.tour=Date.now();
  try{
    const l=await dpLien(p);let r;
    try{r=await FPC.relever(l)}catch(e){return}
    if(!r.existe){if(DPT.raw&&DPT.raw.canal===l.canal)await dpOublier(p,"💻 Ton ordinateur n'est plus relié");return}
    if(r.pc&&!x.pc){let nom='Ordinateur';try{nom=(await FPC.dechiffrerTexte(l.cle,r.pc,'pc')).slice(0,60)||nom}catch(e){}
      x.pc=nom;await dpEcrireRaw(p,x);dpBandeau({ok:'✅ Ton ordinateur est relié'});if(dpIciPC())ecranEnvoiPC()}
    for(const m of r.msgs){
      const vieux=Date.now()-m.le>5*60000;
      if(m.de==='tel'){if(vieux)FPC.effacer(l,m.id);continue} // nos réponses : l'ordinateur les efface en les lisant
      if(DPT.vus.has(m.id))continue;DPT.vus.add(m.id);
      const o=await FPC.lire(l,m.id);FPC.effacer(l,m.id);
      if(!vieux&&o&&o.t==='offre'&&o.sdp)dpRepondre(l,o,p).catch(e=>console.warn('envoyer depuis mon PC',e));
    }
  }finally{DPT.tour=0}
}
function dpFermer(){
  if(DPT.rx)dpCoupe();
  try{if(DPT.dc)DPT.dc.close()}catch(e){}
  try{if(DPT.rtc)DPT.rtc.close()}catch(e){}
  DPT.dc=null;DPT.rtc=null;DPT.cx='';
}
async function dpRepondre(l,o,p){
  dpFermer(); // une seule connexion à la fois (page de l'ordinateur rechargée : on reprend la nouvelle)
  const rtc=new RTCPeerConnection({iceServers:FPC.ICE});DPT.rtc=rtc;DPT.cx=p;
  rtc.ondatachannel=e=>{if(DPT.rtc===rtc)dpCanal(e.channel)};
  rtc.onconnectionstatechange=()=>{if(DPT.rtc===rtc&&(rtc.connectionState==='failed'||rtc.connectionState==='closed')&&DPT.rx)dpCoupe()};
  await rtc.setRemoteDescription({type:'offer',sdp:o.sdp});
  await rtc.setLocalDescription(await rtc.createAnswer());
  await FPC.adresses(rtc,5000);
  if(DPT.rtc!==rtc)return;
  await FPC.poster(l,'tel',{t:'reponse',s:o.s,sdp:rtc.localDescription.sdp});
}
function dpDire(o){try{if(DPT.dc&&DPT.dc.readyState==='open')DPT.dc.send(JSON.stringify(o))}catch(e){}}
function dpCanal(dc){
  DPT.dc=dc;dc.binaryType='arraybuffer';
  dc.onclose=()=>{if(DPT.dc===dc){DPT.dc=null;if(DPT.rx)dpCoupe()}};
  if(dc.readyState==='open')dpEnvoyerLieux();else dc.onopen=()=>dpEnvoyerLieux();
  dc.onmessage=e=>{
    if(typeof e.data!=='string')return dpDonnees(e.data);
    let o=null;try{o=JSON.parse(e.data)}catch(er){return}
    if(o&&o.t==='lieux?')dpEnvoyerLieux();
    else if(o&&o.t==='f')dpDebut(o).catch(er=>{console.warn(er);dpDire({t:'non',id:o.id,raison:'erreur'})});
    else if(o&&o.t==='fin')dpFin(o).catch(er=>console.warn(er));
  };
}
async function dpGarderEcran(on){
  try{
    if(on&&!DPT.wake&&'wakeLock' in navigator){DPT.wake=await navigator.wakeLock.request('screen');DPT.wake.addEventListener('release',()=>{DPT.wake=null})}
    if(!on&&DPT.wake){const w=DPT.wake;DPT.wake=null;await w.release()}
  }catch(e){/* pas grave */}
}
async function dpDebut(o){
  if(DPT.rx)dpCoupe(true);
  const nom=String(o.nom||'fichier').replace(/[\\/:*?"<>|\u0000-\u001f]+/g,' ').trim().slice(0,200)||'fichier',type=String(o.type||'').slice(0,100),taille=Math.max(0,+o.taille||0),id=String(o.id||'').replace(/[^0-9a-z]/gi,'').slice(0,40);
  if(!id)return;
  const p=DPT.cx, d=o.dest&&typeof o.dest==='object'?o.dest:{};
  if(!p||p!==dpProprio())return dpDire({t:'non',id,raison:'qui'});
  let dest=null;
  if(d.k==='mu'){
    if(p!=='admin'||typeof muOp!=='function')return dpDire({t:'non',id,raison:'qui'});
    if(!dpEstMusique(nom,type))return dpDire({t:'non',id,raison:'type'});
    const cat=String(d.cat||'').trim().slice(0,60);if(!cat)return dpDire({t:'non',id,raison:'erreur'});
    dest={k:'mu',cat};
  }else if(d.k==='doc'){
    if(d.dossier){const D=await dpDossiers(p);if(!D.some(x=>x.id===d.dossier))return dpDire({t:'non',id,raison:'erreur'});dest={k:'doc',dossier:String(d.dossier)}}
    else{const n=String(d.nouveau||'').trim().slice(0,60);if(!n)return dpDire({t:'non',id,raison:'erreur'});dest={k:'doc',nouveau:n}}
  }else return dpDire({t:'non',id,raison:'erreur'});
  if(!taille)return dpDire({t:'non',id,raison:'vide'});
  try{ // il faut la place deux fois : la copie reçue, puis la copie rangée
    if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();if(e.quota&&e.quota-(e.usage||0)<taille*2+50e6)return dpDire({t:'non',id,raison:'place'})}
  }catch(e){/* on essaie quand même */}
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
  DPT.rx={id,nom,type,taille,dest,p,recu:0,ecrit:0,buf:[],bufN:0,i:0,q:Promise.resolve(),err:null,vu:0};
  dpGarderEcran(true);dpBandeau();
  dpDire({t:'go',id});
}
function dpVider(r){
  if(!r.bufN)return;
  const parts=r.buf,n=r.bufN,i=r.i++;r.buf=[];r.bufN=0;
  r.q=r.q.then(async()=>{
    if(r.err)return;
    await dpOp('part','readwrite',s=>s.put(new Blob(parts,{type:r.type||''}),dpPartCle(r.id,i)));
    r.ecrit+=n;if(DPT.rx===r)dpDire({t:'ack',id:r.id,n:r.ecrit});
  }).catch(e=>{
    if(r.err)return;r.err=e;
    dpDire({t:'non',id:r.id,raison:dpEstQuota(e)?'place':'erreur'});
    if(DPT.rx===r){DPT.rx=null;dpGarderEcran(false);dpBandeau({ko:dpEstQuota(e)?'Plus assez de place sur ton téléphone : « '+r.nom+' » n\'est pas reçu.':'Je n\'ai pas réussi à garder « '+r.nom+' ». Renvoie-le depuis ton ordinateur.'})}
    dpOp('part','readwrite',s=>s.delete(dpPartRange(r.id))).catch(()=>{});
  });
}
function dpDonnees(buf){
  const r=DPT.rx;if(!r||r.err)return;
  const u=new Uint8Array(buf);r.buf.push(u);r.bufN+=u.length;r.recu+=u.length;
  if(r.bufN>=DP_BLOC)dpVider(r);
  if(Date.now()-r.vu>400){r.vu=Date.now();dpBandeau()}
}
async function dpFin(o){
  const r=DPT.rx;if(!r||r.id!==o.id)return;
  dpVider(r);await r.q;
  if(r.err||DPT.rx!==r)return;
  DPT.rx=null;dpGarderEcran(false);
  const efface=()=>dpOp('part','readwrite',s=>s.delete(dpPartRange(r.id))).catch(()=>{});
  const rate=t=>{efface();dpDire({t:'non',id:r.id,raison:'erreur'});dpBandeau({ko:t})};
  if(r.ecrit!==r.taille)return rate('« '+r.nom+' » est arrivé incomplet. Renvoie-le depuis ton ordinateur.');
  let ou='',dossier='';
  try{
    const parts=await dpOp('part','readonly',s=>s.getAll(dpPartRange(r.id)));
    if(!parts||parts.length!==r.i)return rate('« '+r.nom+' » est arrivé incomplet. Renvoie-le depuis ton ordinateur.');
    const blob=new Blob(parts,{type:r.type||''});
    if(r.dest.k==='mu'){
      // exactement comme « ➕ Ajouter » dans 🎵 Mes musiques
      const cat=r.dest.cat,nom=muNom({name:r.nom});
      await muOp('readwrite',s=>s.put({id:dpId(),nom,cat,fmt:muEstTb(cat)?muFormat(nom):'',at:Date.now(),blob}));
      const C=muCats();if(!C.includes(cat)){C.push(cat);muCatsEcrire(C)}
      ou='🎵 Mes musiques › '+cat;
    }else{
      const D=await dpDossiers(r.p);let d=null;
      if(r.dest.dossier)d=D.find(x=>x.id===r.dest.dossier);
      else{d=D.find(x=>memeNom(x.nom,r.dest.nouveau));if(!d){d={id:dpId(),proprio:r.p,nom:r.dest.nouveau,at:Date.now()};await dpOp('d','readwrite',s=>s.put(d))}}
      if(!d)return rate('Le dossier choisi n\'existe plus sur ton téléphone. Choisis-en un autre sur ton ordinateur, puis renvoie « '+r.nom+' ».');
      await dpOp('f','readwrite',s=>s.put({id:dpId(),proprio:r.p,dossier:d.id,nom:r.nom,type:r.type||blob.type||'',taille:r.taille,at:Date.now(),blob}));
      ou='📁 '+d.nom;dossier=d.id;
    }
  }catch(e){efface();dpDire({t:'non',id:r.id,raison:dpEstQuota(e)?'place':'erreur'});dpBandeau({ko:dpEstQuota(e)?'Plus assez de place sur ton téléphone : « '+r.nom+' » n\'est pas rangé.':'Je n\'ai pas réussi à ranger « '+r.nom+' ». Renvoie-le depuis ton ordinateur.'});return}
  await efface();
  dpDire({t:'ok',id:r.id,dossier});
  dpEnvoyerLieux();
  const x=await dpRaw(r.p);if(x){x.recus=(+x.recus||0)+1;dpEcrireRaw(r.p,x).catch(()=>{})}
  dpBandeau({ok:'✅ « '+r.nom+' » est arrivé dans '+ou});
  // l'écran ouvert se met à jour
  if(document.getElementById('dp-docs')&&r.dest.k==='doc')mesDocuments('',dossier,1);
  else if(document.getElementById('mu-f')&&r.dest.k==='mu'&&typeof mesMusiques==='function')mesMusiques('',1);
  else if(dpIciPC())ecranEnvoiPC();
}
/** Connexion coupée pendant une réception : ce qui était reçu est effacé */
function dpCoupe(silence){
  const r=DPT.rx;if(!r)return;DPT.rx=null;r.err=r.err||new Error('coupé');
  r.q.then(()=>dpOp('part','readwrite',s=>s.delete(dpPartRange(r.id)))).catch(()=>{});
  dpGarderEcran(false);
  if(!silence)dpBandeau({ko:'La connexion avec ton ordinateur est coupée. Garde ton espace formateur ouvert sur ce téléphone, puis renvoie « '+r.nom+' » depuis ton ordinateur.'});
}
/** Bandeau en haut de l'écran (reste affiché quel que soit l'écran) */
let DP_BT=null;
function dpBandeau(fin){
  let b=document.getElementById('dprx');
  if(!b){b=document.createElement('div');b.id='dprx';b.setAttribute('role','status');b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:60;padding:10px 16px;background:#1c2442;border-bottom:2px solid var(--line);box-shadow:0 6px 20px rgba(0,0,0,.4)';document.body.appendChild(b);b.addEventListener('click',e=>{if(e.target.closest('[data-dpx]'))b.remove()})}
  clearTimeout(DP_BT);
  const r=DPT.rx;
  if(fin&&fin.ko)b.innerHTML=`<div style="max-width:720px;margin:0 auto"><p style="margin:0 0 4px;font-weight:800;color:var(--ko)">⚠️ ${esc(fin.ko)}</p><button class="btn small sec" data-dpx="1" style="margin:0">OK</button></div>`;
  else if(fin&&fin.ok){b.innerHTML=`<div style="max-width:720px;margin:0 auto;font-weight:800;color:var(--ok)">${esc(fin.ok)}</div>`;DP_BT=setTimeout(()=>b.remove(),4500)}
  else if(r){const f=r.taille?Math.min(1,r.recu/r.taille):0;
    b.innerHTML=`<div style="max-width:720px;margin:0 auto"><p style="margin:0 0 6px;font-weight:800;font-size:16px;overflow-wrap:anywhere">💻 Réception de ton ordinateur : ${esc(r.nom)}</p><div style="height:12px;background:#0f1328;border-radius:9px;overflow:hidden;border:1px solid var(--line)"><i style="display:block;height:100%;width:${Math.round(f*100)}%;background:var(--or)"></i></div><p class="muted" style="margin:4px 0 0">${Math.round(f*100)} % · ${dpTaille(r.recu)} sur ${dpTaille(r.taille)} · garde ton espace formateur ouvert</p></div>`}
  else b.remove();
}
async function fpcDemarrer(){
  if(!dpOk()||DPT.demarre)return;DPT.demarre=true;
  // morceaux d'un fichier jamais fini (page fermée pendant l'envoi) : effacés
  try{await dpOp('part','readwrite',s=>s.clear())}catch(e){}
  const boucle=async()=>{try{await dpTour()}catch(e){}setTimeout(boucle,dpIciPC()?3000:4000)};
  setTimeout(boucle,1500);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){setTimeout(()=>dpTour().catch(()=>{}),500);if(DPT.rx)dpGarderEcran(true)}});
}

/* ======= 📁 Mes documents : seulement sur ce téléphone, seulement pour le formateur connecté ======= */
let DP_URLS=[];
function dpLibererUrls(){DP_URLS.forEach(u=>{try{URL.revokeObjectURL(u)}catch(e){}});DP_URLS=[]}
async function mesDocuments(msg,ouvert,garder){
  const p=dpProprio();if(!p)return ecranCode();
  const pos=garder?window.scrollY:0;
  const ouverts=garder?[...app.querySelectorAll('details[data-dos][open]')].map(d=>d.dataset.dos):[];
  if(ouvert)ouverts.push(ouvert);
  app.innerHTML='<p class="muted">Chargement…</p>';
  let D,F;try{D=await dpDossiers(p);F=await dpFichiers(p)}catch(e){app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="err">⚠️ Ce navigateur ne peut pas garder de documents.</div>`;document.getElementById('bk').onclick=accueil;return}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  const ids=new Set(D.map(d=>d.id)),orph=F.filter(f=>!ids.has(f.dossier));
  const G=D.map(d=>({id:d.id,nom:d.nom,L:F.filter(f=>f.dossier===d.id)}));
  if(orph.length)G.push({id:'',nom:'Sans dossier',L:orph});
  const opts=D.map(d=>[d.id,d.nom]);
  const ligne=(f,g)=>`<div data-fi="${esc(f.id)}" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">
      <div style="font-weight:700;word-break:break-word">${dpIcone(f)} ${esc(f.nom)}</div>
      <div class="muted" style="font-size:13px">${dpTaille(f.taille||(f.blob&&f.blob.size))} · ${new Date(f.at).toLocaleDateString('fr-FR')}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
        <button class="btn small" style="margin:0" data-voir="${esc(f.id)}">👁️ Ouvrir</button>
        <button class="btn small sec" style="margin:0" data-part="${esc(f.id)}">📤 Partager / télécharger</button>
        <button class="btn small ko" style="margin:0" data-supf="${esc(f.id)}" aria-label="Supprimer">🗑️</button></div>
      ${opts.length>(g.id?1:0)?`<select data-dep="${esc(f.id)}" aria-label="Déplacer vers un autre dossier" style="margin-top:6px;padding:10px;font-size:15px"><option value="">↪️ Déplacer vers…</option>${opts.filter(([v])=>v!==g.id).map(([v,t])=>`<option value="${esc(v)}">📁 ${esc(t)}</option>`).join('')}</select>`:''}
      <div data-cz="${esc(f.id)}"></div></div>`;
  let h=`<button class="back" id="bk">← Retour</button><div class="tag">Espace formateur</div><h1>📁 Mes documents</h1><span id="dp-docs"></span>
  ${msg?`<div class="${msg.startsWith('⚠️')?'err':'ok'}" style="margin:-6px 0 14px">${esc(msg)}</div>`:''}
  <p class="muted" style="margin-top:0">🔒 Seulement sur ce téléphone, rien que pour toi : les stagiaires et les autres formateurs ne les voient pas.</p>
  <div class="card o nopli"><h2>💻 Depuis mon ordinateur</h2><p class="muted" style="margin:0">Glisse tes documents sur une page de ton ordinateur : ils arrivent ici, dans le dossier que tu choisis.</p>
    <button class="btn sec" id="dp-pcb">💻 Envoyer depuis mon PC</button></div>
  <div class="card nopli"><h2>➕ Nouveau dossier</h2><div class="ligne"><input type="text" id="dp-nd" placeholder="Nom du dossier (ex. EPMSP)" maxlength="60" aria-label="Nom du nouveau dossier"><button class="btn small" style="margin:0;flex:none" id="dp-ndok">Créer</button></div><div class="err hide" id="dp-nder"></div></div>
  <input type="file" id="dp-f" multiple hidden>`;
  if(!G.length)h+=`<div class="card nopli"><p class="muted" style="margin:0">Aucun document pour l'instant. Crée un dossier, ou envoie tes documents depuis ton ordinateur.</p></div>`;
  G.forEach(g=>{h+=`<details class="card" data-dos="${esc(g.id)}"${ouverts.includes(g.id)||G.length===1?' open':''}><summary style="cursor:pointer;list-style:none;font-weight:800;font-size:18px">📁 ${esc(g.nom)} <span class="muted" style="font-weight:400">(${g.L.length})</span></summary>
    ${g.L.length?g.L.map(f=>ligne(f,g)).join(''):`<p class="muted" style="margin:10px 0 0">Ce dossier est vide.</p>`}
    ${g.id?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px;padding-top:10px;border-top:1px solid var(--line)">
      <button class="btn small sec" style="margin:0" data-add="${esc(g.id)}">➕ Ajouter depuis ce téléphone</button>
      <button class="btn small sec" style="margin:0" data-ren="${esc(g.id)}">✏️ Renommer</button>
      <button class="btn small ko" style="margin:0" data-supd="${esc(g.id)}">🗑️ Supprimer le dossier</button></div><div data-dz="${esc(g.id)}"></div>`:''}</details>`});
  h+=`<button class="btn sec" id="bk2">← Retour à l'accueil</button>`;
  app.innerHTML=h;
  document.getElementById('bk').onclick=accueil;document.getElementById('bk2').onclick=accueil;
  document.getElementById('dp-pcb').onclick=()=>ecranEnvoiPC();
  const trouve=id=>F.find(f=>f.id===id);
  // nouveau dossier
  const nd=document.getElementById('dp-nd'),nder=document.getElementById('dp-nder');
  const creer=async()=>{const n=nd.value.trim().slice(0,60);
    if(!n){nder.textContent='Écris le nom du dossier.';nder.classList.remove('hide');return}
    const ex=D.find(d=>memeNom(d.nom,n));if(ex)return mesDocuments('Ce dossier existe déjà.',ex.id,1);
    const d={id:dpId(),proprio:p,nom:n,at:Date.now()};
    try{await dpOp('d','readwrite',s=>s.put(d))}catch(e){return mesDocuments('⚠️ Le dossier n\'a pas pu être créé.')}
    mesDocuments(`✅ Dossier « ${n} » créé.`,d.id,1)};
  document.getElementById('dp-ndok').onclick=creer;nd.onkeydown=e=>{if(e.key==='Enter')creer()};
  // ajouter depuis ce téléphone
  const fi=document.getElementById('dp-f');let cible='';
  app.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{cible=b.dataset.add;fi.value='';fi.click()});
  fi.onchange=async()=>{const fs=[...fi.files];if(!fs.length||!cible)return;let n=0;
    try{for(const x of fs){await dpOp('f','readwrite',s=>s.put({id:dpId(),proprio:p,dossier:cible,nom:x.name||'document',type:x.type||'',taille:x.size,at:Date.now()+n,blob:x}));n++}}
    catch(e){return mesDocuments(`⚠️ ${n} document${n>1?'s':''} ajouté${n>1?'s':''} seulement : le téléphone manque peut-être de place.`,cible,1)}
    mesDocuments(`✅ ${n} document${n>1?'s':''} ajouté${n>1?'s':''}.`,cible,1)};
  // ouvrir
  app.querySelectorAll('[data-voir]').forEach(b=>b.onclick=()=>{const f=trouve(b.dataset.voir);if(f)dpVoir(f)});
  // partager / télécharger
  app.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{const f=trouve(b.dataset.part);if(f)dpPartager(f)});
  // déplacer
  app.querySelectorAll('[data-dep]').forEach(s=>s.onchange=async()=>{const f=trouve(s.dataset.dep),v=s.value;if(!f||!v)return;
    await dpOp('f','readwrite',st=>{const r=st.get(f.id);r.onsuccess=()=>{const x=r.result;if(x){x.dossier=v;st.put(x)}};return r});
    const d=D.find(x=>x.id===v);mesDocuments(`✅ « ${f.nom} » déplacé dans « ${d?d.nom:''} ».`,v,1)});
  // supprimer un document (confirmation dans la page)
  app.querySelectorAll('[data-supf]').forEach(b=>b.onclick=()=>{const f=trouve(b.dataset.supf);if(!f)return;
    confirmerIci(app.querySelector(`[data-cz="${CSS.escape(f.id)}"]`),`Supprimer « ${esc(f.nom)} » de ce téléphone ?`,'🗑️ Supprimer',async()=>{
      await dpOp('f','readwrite',s=>s.delete(f.id));mesDocuments('✅ Document supprimé.',f.dossier,1)})});
  // renommer un dossier (dans la page)
  app.querySelectorAll('[data-ren]').forEach(b=>b.onclick=()=>{const d=D.find(x=>x.id===b.dataset.ren);if(!d)return;
    const z=app.querySelector(`[data-dz="${CSS.escape(d.id)}"]`);
    z.innerHTML=`<div class="stag" style="margin-top:10px"><input type="text" maxlength="60" placeholder="Nouveau nom" aria-label="Nouveau nom du dossier"><div class="muted" style="font-size:13px;margin-top:4px">Ancien nom : ${esc(d.nom)}</div>
      <div style="display:flex;gap:6px;margin-top:8px"><button class="btn small" style="margin:0;flex:1" data-ok>✅ OK</button><button class="btn small sec" style="margin:0" data-no>Annuler</button></div></div>`;
    const i=z.querySelector('input');i.focus();
    const ok=async()=>{const t=i.value.trim().slice(0,60);if(!t||t===d.nom)return mesDocuments('',d.id,1);
      if(D.some(x=>x.id!==d.id&&memeNom(x.nom,t))){i.value='';i.placeholder='Ce nom existe déjà : un autre nom';return}
      await dpOp('d','readwrite',st=>{const r=st.get(d.id);r.onsuccess=()=>{const x=r.result;if(x){x.nom=t;st.put(x)}};return r});mesDocuments('✅ Dossier renommé.',d.id,1)};
    z.querySelector('[data-ok]').onclick=ok;z.querySelector('[data-no]').onclick=()=>{z.innerHTML=''};i.onkeydown=e=>{if(e.key==='Enter')ok()}});
  // supprimer un dossier et ce qu'il contient (confirmation dans la page)
  app.querySelectorAll('[data-supd]').forEach(b=>b.onclick=()=>{const g=G.find(x=>x.id===b.dataset.supd);if(!g)return;
    confirmerIci(app.querySelector(`[data-dz="${CSS.escape(g.id)}"]`),`Supprimer le dossier « ${esc(g.nom)} »${g.L.length?` et ses <b>${g.L.length} document${g.L.length>1?'s':''}</b>`:''} de ce téléphone ?`,'🗑️ Supprimer',async()=>{
      await dpOp('f','readwrite',s=>{g.L.forEach(f=>s.delete(f.id))});await dpOp('d','readwrite',s=>s.delete(g.id));mesDocuments('✅ Dossier supprimé.')})});
  if(garder)window.scrollTo(0,pos);else haut();
}
function dpFichier(f){const b=f.blob;return b instanceof File&&b.name===f.nom?b:new File([b],f.nom||'document',{type:f.type||b.type||''})}
function dpTelecharger(f){
  // téléchargé tel quel, jamais affiché dans la page (aucun risque qu'un fichier « page web » s'ouvre ici)
  const u=URL.createObjectURL(new Blob([f.blob],{type:'application/octet-stream'}));
  const a=document.createElement('a');a.href=u;a.download=f.nom||'document';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>{try{URL.revokeObjectURL(u)}catch(e){}},60000);
}
async function dpPartager(f){
  try{const fl=dpFichier(f);if(navigator.canShare&&navigator.canShare({files:[fl]})){await navigator.share({files:[fl],title:f.nom});return}}
  catch(e){if(e&&e.name==='AbortError')return}
  dpTelecharger(f);
}
/** Ouvrir : image, musique, vidéo dans la page ; PDF dans un nouvel onglet ; le reste : télécharger ou envoyer vers une appli */
function dpVoir(f){
  dpLibererUrls();
  const t=f.type||'',n=f.nom||'';
  const estPdf=t==='application/pdf'||/\.pdf$/i.test(n);
  const estImg=/^image\/(png|jpe?g|gif|webp|bmp|avif|heic|heif)$/i.test(t)||/\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(n);
  const estAud=dpEstMusique(n,t),estVid=/^video\//.test(t)||/\.(mp4|webm|mov|m4v)$/i.test(n);
  const sur=(type)=>{const u=URL.createObjectURL(new Blob([f.blob],{type}));DP_URLS.push(u);return u};
  let corps='';
  if(estImg)corps=`<img src="${sur(t&&/^image\//.test(t)&&!/svg/i.test(t)?t:'image/jpeg')}" alt="${esc(n)}" style="max-width:100%;max-height:72vh;display:block;margin:0 auto;border-radius:10px;background:#fff">`;
  else if(estAud)corps=`<audio controls autoplay src="${sur(t||'audio/mpeg')}" style="width:100%"></audio>`;
  else if(estVid)corps=`<video controls autoplay playsinline src="${sur(t||'video/mp4')}" style="width:100%;max-height:70vh;border-radius:10px;background:#000"></video>`;
  else if(estPdf)corps=`<p style="margin:0 0 8px">${dpIcone(f)} Document PDF</p><button class="btn" id="dp-vpdf">📖 Lire le PDF</button><p class="muted" style="margin:8px 0 0">S'il ne s'affiche pas, touche « 📤 Ouvrir avec une autre appli ».</p>`;
  else corps=`<p style="margin:0">${dpIcone(f)} Ce document s'ouvre avec une autre appli de ton téléphone (Word, PowerPoint, lecteur…).</p>`;
  const z=document.createElement('div');z.id='dp-vue';
  z.style.cssText='position:fixed;inset:0;z-index:70;background:rgba(5,8,18,.94);overflow:auto;padding:16px';
  z.innerHTML=`<div style="max-width:760px;margin:0 auto"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 12px"><b style="word-break:break-word">${esc(n)}</b><button class="btn small sec" style="margin:0;flex:none" id="dp-vx">✖ Fermer</button></div>
    ${corps}<button class="btn sec" id="dp-vsh">📤 Ouvrir avec une autre appli</button><button class="btn sec" id="dp-vdl">📥 Télécharger</button></div>`;
  document.body.appendChild(z);
  const fermer=()=>{z.querySelectorAll('audio,video').forEach(m=>{try{m.pause()}catch(e){}});z.remove();dpLibererUrls()};
  z.querySelector('#dp-vx').onclick=fermer;
  z.querySelector('#dp-vsh').onclick=()=>dpPartager(f);
  z.querySelector('#dp-vdl').onclick=()=>dpTelecharger(f);
  const vp=z.querySelector('#dp-vpdf');if(vp)vp.onclick=()=>{const u=sur('application/pdf');window.open(u,'_blank')};
}

/* ======= 06/11 : glisser un fichier N'IMPORTE OÙ sur l'espace formateur (ordinateur) : « Où le ranger ? » puis rangé ici ======= */
(function(){
  if(typeof document==='undefined')return;
  let cpt=0;
  const voile=on=>{let v=document.getElementById('dp-voile');
    if(!on){if(v)v.remove();return}
    if(v)return;v=document.createElement('div');v.id='dp-voile';
    v.style.cssText='position:fixed;inset:0;z-index:70;background:rgba(10,14,35,.85);display:flex;align-items:center;justify-content:center;border:4px dashed var(--line);pointer-events:none';
    v.innerHTML='<div style="font-size:26px;font-weight:900;text-align:center;padding:20px">📥 Lâche tes fichiers ici</div>';document.body.appendChild(v)};
  const connecte=()=>{try{return (typeof estAdmin==='function'&&estAdmin())||(typeof moiF==='function'&&!!moiF())}catch(e){return false}};
  const avecFichiers=e=>e.dataTransfer&&[...(e.dataTransfer.types||[])].includes('Files');
  document.addEventListener('dragenter',e=>{if(!avecFichiers(e)||!connecte())return;e.preventDefault();cpt++;voile(true)});
  document.addEventListener('dragover',e=>{if(!avecFichiers(e)||!connecte())return;e.preventDefault();e.dataTransfer.dropEffect='copy'});
  document.addEventListener('dragleave',e=>{if(!avecFichiers(e))return;cpt=Math.max(0,cpt-1);if(!cpt)voile(false)});
  document.addEventListener('drop',e=>{if(!avecFichiers(e))return;e.preventDefault();cpt=0;voile(false);if(!connecte())return;
    const F=[...(e.dataTransfer.files||[])];if(!F.length)return;
    if(document.getElementById('dp-stg')&&typeof window.DP_STG==='function')return window.DP_STG(F);dpOuRanger(F)});
})();
async function dpOuRanger(F){
  const p=dpProprio(), mus=F.every(f=>dpEstMusique(f.name,f.type)), admin=estAdmin();
  const cats=(admin&&typeof muCats==='function')?muCats():[], D=await dpDossiers(p).catch(()=>[]);
  const fond=document.createElement('div');fond.style.cssText='position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px';
  const nb=F.length>1?F.length+' fichiers':'« '+esc(F[0].name)+' »';
  fond.innerHTML=`<div class="card o" style="max-width:520px;width:100%;max-height:85vh;overflow:auto;margin:0">
    <h2 style="margin-top:0">Où ranger ${nb} ?</h2>
    ${mus&&cats.length?`<div class="tag">🎵 Mes musiques</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px">${cats.map(c=>`<button class="btn sec" style="width:auto;margin:0" data-mu="${esc(c)}">${esc(c)}</button>`).join('')}<button class="btn sec" style="width:auto;margin:0" data-mu="">➕ Nouvelle catégorie</button></div>`:''}
    <div class="tag">📁 Mes documents</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px">${D.map(d=>`<button class="btn sec" style="width:auto;margin:0" data-doc="${esc(d.id)}">📁 ${esc(d.nom)}</button>`).join('')}<button class="btn sec" style="width:auto;margin:0" data-doc="">➕ Nouveau dossier</button></div>
    <div id="dp-nv" class="hide"><input id="dp-nvn" placeholder="Nom" style="margin-bottom:8px"><button class="btn" id="dp-nvok">Ranger ici</button></div>
    <p class="muted hide" id="dp-msg"></p>
    <button class="btn sec" id="dp-ann">Annuler</button></div>`;
  document.body.appendChild(fond);
  const fermer=()=>fond.remove(), msg=t=>{const m=fond.querySelector('#dp-msg');m.textContent=t;m.classList.remove('hide')};
  fond.querySelector('#dp-ann').onclick=fermer;
  let choix=null;
  const ranger=async(k,val)=>{
    fond.querySelectorAll('button').forEach(b=>b.disabled=true);msg('Rangement…');
    try{
      if(k==='mu'){const cat=val;for(const f of F){const nom=muNom({name:f.name});await muOp('readwrite',s=>s.put({id:dpId(),nom,cat,fmt:muEstTb(cat)?muFormat(nom):'',at:Date.now(),blob:f}))}
        const C=muCats();if(!C.includes(cat)){C.push(cat);muCatsEcrire(C)}
        fermer();if(typeof dpBandeau==='function')dpBandeau({ok:'✅ Rangé dans 🎵 Mes musiques › '+cat});
        if(document.getElementById('mu-f')&&typeof mesMusiques==='function')mesMusiques('',1)}
      else{let d=val.id?D.find(x=>x.id===val.id):D.find(x=>memeNom(x.nom,val.nouveau));
        if(!d){d={id:dpId(),proprio:p,nom:val.nouveau,at:Date.now()};await dpOp('d','readwrite',s=>s.put(d))}
        for(const f of F)await dpOp('f','readwrite',s=>s.put({id:dpId(),proprio:p,dossier:d.id,nom:f.name,type:f.type||'',taille:f.size,at:Date.now(),blob:f}));
        fermer();if(typeof dpBandeau==='function')dpBandeau({ok:'✅ Rangé dans 📁 '+d.nom});
        if(document.getElementById('dp-docs')&&typeof mesDocuments==='function')mesDocuments('',d.id,1)}
    }catch(e){fond.querySelectorAll('button').forEach(b=>b.disabled=false);msg(dpEstQuota(e)?'Plus assez de place sur cet appareil.':'Je n\'ai pas réussi à ranger. Réessaie.')}
  };
  const demander=k=>{choix=k;fond.querySelector('#dp-nv').classList.remove('hide');const i=fond.querySelector('#dp-nvn');i.placeholder=k==='mu'?'Nom de la nouvelle catégorie':'Nom du nouveau dossier';i.focus()};
  fond.querySelectorAll('[data-mu]').forEach(b=>b.onclick=()=>b.dataset.mu?ranger('mu',b.dataset.mu):demander('mu'));
  fond.querySelectorAll('[data-doc]').forEach(b=>b.onclick=()=>b.dataset.doc?ranger('doc',{id:b.dataset.doc}):demander('doc'));
  fond.querySelector('#dp-nvok').onclick=()=>{const n=(fond.querySelector('#dp-nvn').value||'').trim();if(!n){msg('Écris un nom.');return}ranger(choix,choix==='mu'?n:{nouveau:n})};
}
