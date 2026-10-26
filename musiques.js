// ======= 🎵 Mes musiques (espace formateur seulement) =======
// Les musiques importées restent dans CE téléphone (navigateur), rien n'est envoyé sur internet.
// Catégories créées par Hamid ; lecture avec enchaînement automatique dans la catégorie.
const MU_DB='cqpf_musiques', MU_CATS='cqpf_mu_cats';
let MU_LISTE=[], MU_EN=null, MU_FILE=[], MU_URL=null;
const muAudio=new Audio();
function muCats(){try{const c=JSON.parse(localStorage.getItem(MU_CATS)||'null');if(Array.isArray(c)&&c.length)return c}catch(e){}return['Échauffement','Tabata','Renfo','Étirements']}
function muCatsEcrire(c){try{localStorage.setItem(MU_CATS,JSON.stringify(c))}catch(e){}}
function muBase(){return new Promise((ok,ko)=>{const r=indexedDB.open(MU_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('m',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)})}
async function muOp(mode,f){const db=await muBase();return new Promise((ok,ko)=>{const t=db.transaction('m',mode),s=t.objectStore('m');const r=f(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ko(t.error)})}
async function muCharger(){const L=await muOp('readonly',s=>s.getAll());MU_LISTE=(L||[]).map(x=>({id:x.id,nom:x.nom,cat:x.cat,at:x.at})).sort((a,b)=>a.at-b.at)}
function muNom(f){return f.name.replace(/\.[a-z0-9]{2,4}$/i,'').replace(/[_]+/g,' ').trim()||'Musique'}
async function muJouer(id,file){
  const x=await muOp('readonly',s=>s.get(id));if(!x)return;
  if(MU_URL)URL.revokeObjectURL(MU_URL);MU_URL=URL.createObjectURL(x.blob);
  MU_EN=id;if(file)MU_FILE=file;muAudio.src=MU_URL;try{await muAudio.play()}catch(e){}
  muBarre()}
function muSuivante(d){const i=MU_FILE.indexOf(MU_EN);const j=i+d;if(i<0||j<0||j>=MU_FILE.length){muBarre();return}muJouer(MU_FILE[j])}
muAudio.addEventListener('ended',()=>muSuivante(1));
muAudio.addEventListener('timeupdate',()=>{const r=document.getElementById('mu-pos');if(r&&muAudio.duration)r.value=Math.round(muAudio.currentTime/muAudio.duration*1000);const t=document.getElementById('mu-t');if(t)t.textContent=muTemps(muAudio.currentTime)+' / '+muTemps(muAudio.duration||0)});
muAudio.addEventListener('play',()=>muBarre());muAudio.addEventListener('pause',()=>muBarre());
function muTemps(s){s=Math.floor(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function muBarre(){const b=document.getElementById('mu-lect');if(!b)return;const x=MU_LISTE.find(m=>m.id===MU_EN);
  if(!x){b.innerHTML='<p class="muted" style="margin:0">Touche une musique pour la lancer.</p>';return}
  b.innerHTML=`<div class="tag">▶️ En cours · ${esc(x.cat)}</div><h2 style="margin:4px 0 8px">${esc(x.nom)}</h2>
   <input type="range" id="mu-pos" min="0" max="1000" value="0" style="width:100%"><div class="muted" id="mu-t" style="font-size:14px">0:00</div>
   <div style="display:flex;gap:8px;margin-top:8px"><button class="btn sec" style="margin:0" id="mu-pr">⏮️</button><button class="btn" style="margin:0" id="mu-pp">${muAudio.paused?'▶️ Lecture':'⏸️ Pause'}</button><button class="btn sec" style="margin:0" id="mu-su">⏭️</button></div>`;
  document.getElementById('mu-pp').onclick=()=>{muAudio.paused?muAudio.play().catch(()=>{}):muAudio.pause()};
  document.getElementById('mu-pr').onclick=()=>{if(muAudio.currentTime>3)muAudio.currentTime=0;else muSuivante(-1)};
  document.getElementById('mu-su').onclick=()=>muSuivante(1);
  document.getElementById('mu-pos').oninput=e=>{if(muAudio.duration)muAudio.currentTime=e.target.value/1000*muAudio.duration}}
async function mesMusiques(msg){
  app.innerHTML='<p class="muted">Chargement…</p>';
  try{await muCharger()}catch(e){app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="err">⚠️ Ce navigateur ne peut pas garder de musiques.</div>`;document.getElementById('bk').onclick=accueil;return}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  const C=muCats();MU_LISTE.forEach(m=>{if(!C.includes(m.cat))C.push(m.cat)});
  let h=`<button class="back" id="bk">← Retour</button><div class="tag">Espace formateur</div><h1>🎵 Mes musiques</h1>
  ${msg?`<div class="${msg.startsWith('⚠️')?'err':'ok'}" style="margin:-6px 0 14px">${esc(msg)}</div>`:''}
  <div class="card o" id="mu-lect"></div>
  <div class="card"><h2>➕ Importer</h2><p class="muted" style="margin-top:0">Choisis la catégorie, puis tes musiques dans ton téléphone (plusieurs d'un coup si tu veux). Elles restent seulement sur ce téléphone.</p>
   <select id="mu-cat" style="width:100%;padding:12px;border-radius:12px;font-size:16px">${C.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
   <button class="btn" id="mu-imp">🎵 Choisir mes musiques</button><input type="file" id="mu-f" accept="audio/*" multiple hidden>
   <button class="btn small sec" id="mu-nc">➕ Nouvelle catégorie</button></div>`;
  C.forEach((c,ci)=>{const L=MU_LISTE.filter(m=>m.cat===c);
    h+=`<div class="card"><div style="display:flex;align-items:center;gap:8px;justify-content:space-between"><h2 style="margin:0">${esc(c)} <span class="muted" style="font-weight:400;font-size:15px">(${L.length})</span></h2>
      ${L.length?`<button class="btn small" style="margin:0" data-tout="${ci}">▶️ Tout jouer</button>`:''}</div>`+
      (L.length?L.map(m=>`<div style="display:flex;align-items:center;gap:6px;margin-top:10px"><button class="btn sec" style="margin:0;text-align:left;flex:1;font-size:16px;padding:12px" data-j="${m.id}" data-c="${ci}">${MU_EN===m.id?'🔊':'▶️'} ${esc(m.nom)}</button>
        <select data-dep="${m.id}" aria-label="Changer de catégorie" style="max-width:110px;padding:10px;border-radius:10px">${C.map(k=>`<option${k===c?' selected':''}>${esc(k)}</option>`).join('')}</select>
        <button class="btn small ko" style="margin:0" data-sup="${m.id}" aria-label="Supprimer">🗑️</button></div>`).join(''):`<p class="muted" style="margin:8px 0 0">Aucune musique.</p>`)+
      `<div style="margin-top:8px"><button class="link" data-ren="${ci}">✏️ Renommer</button>${L.length?'':` · <button class="link" data-supc="${ci}">🗑️ Supprimer la catégorie</button>`}</div></div>`});
  h+=`<button class="btn sec" id="bk2">← Retour à l'accueil</button>`;
  app.innerHTML=h;muBarre();
  document.getElementById('bk').onclick=accueil;document.getElementById('bk2').onclick=accueil;
  const f=document.getElementById('mu-f');document.getElementById('mu-imp').onclick=()=>f.click();
  f.onchange=async()=>{const cat=document.getElementById('mu-cat').value,fs=[...f.files];if(!fs.length)return;
    app.querySelector('#mu-imp').textContent='Import en cours…';let n=0;
    try{for(const x of fs){await muOp('readwrite',s=>s.put({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom:muNom(x),cat,at:Date.now()+n,blob:x}));n++}}
    catch(e){return mesMusiques(`⚠️ ${n} musique${n>1?'s':''} importée${n>1?'s':''} seulement : le téléphone manque peut-être de place.`)}
    mesMusiques(`✅ ${n} musique${n>1?'s':''} ajoutée${n>1?'s':''} dans « ${cat} ».`)};
  document.getElementById('mu-nc').onclick=()=>{const t=(prompt('Nom de la nouvelle catégorie :')||'').trim();if(!t)return;if(!C.includes(t)){C.push(t);muCatsEcrire(C)}mesMusiques()};
  app.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{const c=C[+b.dataset.c];muJouer(b.dataset.j,MU_LISTE.filter(m=>m.cat===c).map(m=>m.id)).then(()=>mesMusiques())});
  app.querySelectorAll('[data-tout]').forEach(b=>b.onclick=()=>{const L=MU_LISTE.filter(m=>m.cat===C[+b.dataset.tout]).map(m=>m.id);muJouer(L[0],L).then(()=>mesMusiques())});
  app.querySelectorAll('[data-dep]').forEach(s=>s.onchange=async()=>{const id=s.dataset.dep;await muOp('readwrite',st=>{const r=st.get(id);r.onsuccess=()=>{const x=r.result;if(x){x.cat=s.value;st.put(x)}};return r});mesMusiques()});
  app.querySelectorAll('[data-sup]').forEach(b=>b.onclick=async()=>{const m=MU_LISTE.find(x=>x.id===b.dataset.sup);if(!m||!confirm(`Supprimer « ${m.nom} » de ce téléphone ?`))return;if(MU_EN===m.id){muAudio.pause();MU_EN=null}await muOp('readwrite',s=>s.delete(m.id));mesMusiques()});
  app.querySelectorAll('[data-ren]').forEach(b=>b.onclick=async()=>{const old=C[+b.dataset.ren],t=(prompt('Nouveau nom :',old)||'').trim();if(!t||t===old)return;
    const L=MU_LISTE.filter(m=>m.cat===old);for(const m of L)await muOp('readwrite',st=>{const r=st.get(m.id);r.onsuccess=()=>{const x=r.result;if(x){x.cat=t;st.put(x)}};return r});
    const N=C.map(c=>c===old?t:c).filter((c,i,a)=>a.indexOf(c)===i);muCatsEcrire(N);mesMusiques()});
  app.querySelectorAll('[data-supc]').forEach(b=>b.onclick=()=>{const c=C[+b.dataset.supc];if(!confirm(`Supprimer la catégorie « ${c} » ?`))return;muCatsEcrire(C.filter(k=>k!==c));mesMusiques()});
  haut()}
