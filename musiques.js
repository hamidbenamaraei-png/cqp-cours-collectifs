// ======= 🎵 Mes musiques (espace formateur seulement) =======
// Les musiques importées restent dans CE téléphone (navigateur), rien n'est envoyé sur internet.
// Catégories créées par Hamid ; lecture avec enchaînement automatique dans la catégorie.
const MU_DB='cqpf_musiques', MU_CATS='cqpf_mu_cats';
let MU_LISTE=[], MU_EN=null, MU_FILE=[], MU_URL=null;
const muAudio=new Audio();
function muCats(){try{const c=JSON.parse(localStorage.getItem(MU_CATS)||'null');if(Array.isArray(c)&&c.length)return c}catch(e){}return['Tabata','Renfo','Étirements']}
function muCatsEcrire(c){try{localStorage.setItem(MU_CATS,JSON.stringify(c))}catch(e){}}
function muBase(){return new Promise((ok,ko)=>{const r=indexedDB.open(MU_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('m',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)})}
async function muOp(mode,f){const db=await muBase();return new Promise((ok,ko)=>{const t=db.transaction('m',mode),s=t.objectStore('m');const r=f(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>ko(t.error)})}
async function muCharger(){const L=await muOp('readonly',s=>s.getAll());MU_LISTE=(L||[]).map(x=>({id:x.id,nom:x.nom,cat:x.cat,fmt:x.fmt||'',at:x.at})).sort((a,b)=>a.at-b.at)}
// Tabata : le format (20/10, 45/15…) est lu dans le nom du fichier ; « » = Tabata – autres
const muEstTb=c=>/tabata/i.test(c||'');
function muFormat(nom){const m=String(nom).match(/(?:^|\D)([1-9]\d)\s*[\/\-_x×: ]\s*([1-9]\d?)(?!\d)/);if(!m)return'';const w=+m[1],r=+m[2];return w>=10&&w<=90&&r>=5&&r<=60?w+'/'+r:''}
function muFmts(L){return[...new Set(L.map(m=>m.fmt||''))].sort((a,b)=>a===''?1:b===''?-1:(+a.split('/')[0]-+b.split('/')[0])||(+a.split('/')[1]-+b.split('/')[1]))}
const muFmtNom=f=>f?'Tabata '+f:'Tabata – autres';
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
async function mesMusiques(msg,garder){
  const pos=garder?window.scrollY:0, ouverts=garder?[...app.querySelectorAll('details[data-f][open]')].map(d=>d.dataset.f):[];
  app.innerHTML='<p class="muted">Chargement…</p>';
  try{await muCharger()}catch(e){app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="err">⚠️ Ce navigateur ne peut pas garder de musiques.</div>`;document.getElementById('bk').onclick=accueil;return}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  const C=muCats().filter(c=>c!=='Échauffement'||MU_LISTE.some(m=>m.cat===c));MU_LISTE.forEach(m=>{if(!C.includes(m.cat))C.push(m.cat)});
  const tbL=MU_LISTE.filter(m=>muEstTb(m.cat)), tbF=muFmts(tbL);
  // choix « déplacer vers » : les formats Tabata à la place de « Tabata »
  const dest=[];C.forEach(c=>{if(muEstTb(c)){(tbF.length?tbF:['']).forEach(f=>dest.push([c+'|'+f,muFmtNom(f)]));if(!tbF.includes(''))dest.push([c+'|','Tabata – autres'])}else dest.push([c+'|',c])});
  const ligne=(m,liste)=>`<div style="display:flex;align-items:center;gap:6px;margin-top:10px"><button class="btn sec" style="margin:0;text-align:left;flex:1;font-size:16px;padding:12px" data-j="${m.id}" data-l="${liste}">${MU_EN===m.id?'🔊':'▶️'} ${esc(m.nom)}</button>
        <select data-dep="${m.id}" aria-label="Changer de catégorie" style="max-width:120px;padding:10px;border-radius:10px">${dest.map(([v,t])=>`<option value="${esc(v)}"${v===m.cat+'|'+(muEstTb(m.cat)?m.fmt||'':'')?' selected':''}>${esc(t)}</option>`).join('')}</select>
        <button class="btn small ko" style="margin:0" data-sup="${m.id}" aria-label="Supprimer">🗑️</button></div>`;
  const LISTES=[];const liste=ids=>{LISTES.push(ids);return LISTES.length-1};
  let h=`<button class="back" id="bk">← Retour</button><div class="tag">Espace formateur</div><h1>🎵 Mes musiques</h1>
  ${msg?`<div class="${msg.startsWith('⚠️')?'err':'ok'}" style="margin:-6px 0 14px">${esc(msg)}</div>`:''}
  <div class="card o" id="mu-lect"></div>
  <p class="muted" style="margin-top:0">Touche « ➕ Ajouter » dans une catégorie, puis choisis tes musiques dans ton téléphone (plusieurs d'un coup si tu veux). Pour le Tabata, le format (20/10, 45/15…) est lu dans le nom du fichier et rangé tout seul. Elles restent seulement sur ce téléphone.</p>
  <input type="file" id="mu-f" accept="audio/*" multiple hidden>
  <button class="btn small sec" id="mu-nc" style="margin:0 0 14px">➕ Nouvelle catégorie</button>`;
  C.forEach((c,ci)=>{const L=MU_LISTE.filter(m=>m.cat===c);const tb=muEstTb(c);
    h+=`<div class="card"><div style="display:flex;align-items:center;gap:8px;justify-content:space-between"><h2 style="margin:0">${esc(c)} <span class="muted" style="font-weight:400;font-size:15px">(${L.length})</span></h2>
      <span style="display:flex;gap:6px">${L.length&&!tb?`<button class="btn small" style="margin:0" data-tout="${liste(L.map(m=>m.id))}">▶️ Tout jouer</button>`:''}<button class="btn small sec" style="margin:0" data-add="${ci}">➕ Ajouter</button></span></div>`+
      (!L.length?`<p class="muted" style="margin:8px 0 0">Aucune musique.</p>`:
       tb?muFmts(L).map(f=>{const F=L.filter(m=>(m.fmt||'')===f),li=liste(F.map(m=>m.id));
         return `<details data-f="${esc(c+'|'+f)}" style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px"${F.some(m=>m.id===MU_EN)||ouverts.includes(c+'|'+f)?' open':''}><summary style="cursor:pointer;font-weight:800;font-size:17px">⏱️ ${esc(muFmtNom(f))} <span class="muted" style="font-weight:400">(${F.length})</span></summary>
           <button class="btn small" style="margin:8px 0 0" data-tout="${li}">▶️ Tout jouer</button>${F.map(m=>ligne(m,li)).join('')}</details>`}).join('')
       :(()=>{const li=liste(L.map(m=>m.id));return L.map(m=>ligne(m,li)).join('')})())+
      `<div style="margin-top:8px"><button class="link" data-ren="${ci}">✏️ Renommer</button>${L.length?'':` · <button class="link" data-supc="${ci}" aria-label="Supprimer la catégorie" style="text-decoration:none">🗑️</button>`}</div></div>`});
  h+=`<button class="btn sec" id="bk2">← Retour à l'accueil</button>`;
  app.innerHTML=h;muBarre();
  document.getElementById('bk').onclick=accueil;document.getElementById('bk2').onclick=accueil;
  const f=document.getElementById('mu-f');let cat='';
  app.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{cat=C[+b.dataset.add];f.value='';f.click()});
  f.onchange=async()=>{const fs=[...f.files];if(!fs.length||!cat)return;
    const bA=app.querySelector(`[data-add="${C.indexOf(cat)}"]`);if(bA)bA.textContent='Import…';let n=0;
    const tbC=C.find(muEstTb);
    try{for(const x of fs){const nom=muNom(x),fmt=muFormat(nom);const c2=muEstTb(cat)||(tbC&&/tabata/i.test(nom))?(muEstTb(cat)?cat:tbC):cat;
      await muOp('readwrite',s=>s.put({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),nom,cat:c2,fmt:muEstTb(c2)?fmt:'',at:Date.now()+n,blob:x}));n++}}
    catch(e){return mesMusiques(`⚠️ ${n} musique${n>1?'s':''} importée${n>1?'s':''} seulement : le téléphone manque peut-être de place.`)}
    mesMusiques(`✅ ${n} musique${n>1?'s':''} ajoutée${n>1?'s':''} dans « ${cat} ».`)};
  document.getElementById('mu-nc').onclick=()=>{const t=(prompt('Nom de la nouvelle catégorie :')||'').trim();if(!t)return;if(!C.includes(t)){C.push(t);muCatsEcrire(C)}mesMusiques()};
  app.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>muJouer(b.dataset.j,LISTES[+b.dataset.l]).then(()=>mesMusiques('',1)));
  app.querySelectorAll('[data-tout]').forEach(b=>b.onclick=()=>{const L=LISTES[+b.dataset.tout];muJouer(L[0],L).then(()=>mesMusiques('',1))});
  app.querySelectorAll('[data-dep]').forEach(s=>s.onchange=async()=>{const id=s.dataset.dep,[c,f]=s.value.split('|');await muOp('readwrite',st=>{const r=st.get(id);r.onsuccess=()=>{const x=r.result;if(x){x.cat=c;x.fmt=muEstTb(c)?(f||''):'';st.put(x)}};return r});mesMusiques('',1)});
  // 1er appui : la poubelle devient « Confirmer » (4 s) ; 2e appui : supprimée, sans fenêtre
  app.querySelectorAll('[data-sup]').forEach(b=>b.onclick=async()=>{const m=MU_LISTE.find(x=>x.id===b.dataset.sup);if(!m)return;
    if(!b.dataset.ok){b.dataset.ok='1';b.textContent='Confirmer';b.style.background='var(--ko)';b.style.color='#fff';clearTimeout(b._t);b._t=setTimeout(()=>{delete b.dataset.ok;b.textContent='🗑️';b.style.background='';b.style.color=''},4000);return}
    clearTimeout(b._t);if(MU_EN===m.id){muAudio.pause();MU_EN=null}await muOp('readwrite',s=>s.delete(m.id));mesMusiques('',1)});
  app.querySelectorAll('[data-ren]').forEach(b=>b.onclick=async()=>{const old=C[+b.dataset.ren],t=(prompt('Nouveau nom :',old)||'').trim();if(!t||t===old)return;
    const L=MU_LISTE.filter(m=>m.cat===old);for(const m of L)await muOp('readwrite',st=>{const r=st.get(m.id);r.onsuccess=()=>{const x=r.result;if(x){x.cat=t;st.put(x)}};return r});
    const N=C.map(c=>c===old?t:c).filter((c,i,a)=>a.indexOf(c)===i);muCatsEcrire(N);mesMusiques()});
  app.querySelectorAll('[data-supc]').forEach(b=>b.onclick=()=>{const c=C[+b.dataset.supc];
    if(!b.dataset.ok){b.dataset.ok='1';b.textContent='Confirmer';b.style.cssText='text-decoration:none;background:var(--ko);color:#fff;border-radius:8px;padding:4px 10px';clearTimeout(b._t);b._t=setTimeout(()=>{delete b.dataset.ok;b.textContent='🗑️';b.style.cssText='text-decoration:none'},4000);return}
    clearTimeout(b._t);muCatsEcrire(C.filter(k=>k!==c));mesMusiques('',1)});
  if(garder)window.scrollTo(0,pos);else haut()}
