// ======= 📝 Je prépare mon cours : espace stagiaires / apprentis =======
// Visible seulement quand Hamid le montre (COURS_PREP.montrer). Les cours sont gardés sur ce téléphone (cqp_cours).
// Utilise les outils de index.html (app, moi, lire, ecrire, accueil, monEspace, haut, ECRAN) et de cours.js.
let COURS_PREP=null;
function crTous(){const L=lire('cours',[]);return Array.isArray(L)?L:[]}
function crGarderTous(L){ecrire('cours',L)}
function crSauver(c){c.maj=Date.now();const L=crTous(),i=L.findIndex(x=>x.id===c.id);if(i>=0)L[i]=c;else L.push(c);crGarderTous(L)}
function crTrouver(id){return crTous().find(x=>x.id===id)||null}
function crNouveau(nom){
  const M=crModeleChoisi(COURS_PREP||crPrep(null));
  return {id:crId(),nom:nom||('Mon cours '+M.nom),cree:Date.now(),maj:Date.now(),modele:{id:M.id,nom:M.nom},
    bpm:128,tb:{w:20,r:10,k:8},pas:10,prep:10,
    parties:(M.parties||[]).map(p=>({id:crId(),n:p.n,m:+p.m||0,bpm:null,ex:[]}))};
}
const crRetourAccueil=()=>{if(typeof accueil==='function')accueil()};

// ---- la liste de mes cours ----
function crListe(msg){
  ECRAN='cours';
  const L=crTous().sort((a,b)=>(b.maj||0)-(a.maj||0)), M=crModeleChoisi(COURS_PREP||crPrep(null));
  let h=`<button class="back" id="bk">← Retour</button><div class="tag">${esc(monEspace())}</div><h1>📝 Je prépare mon cours</h1>
   ${msg?`<div class="done" style="margin:-6px 0 14px">${msg}</div>`:''}
   <div class="card o nopli"><h2>Le modèle de Hamid : ${esc(M.nom)}</h2>
    ${(M.parties||[]).map(p=>`<div class="frise"><span>${esc(p.n)}</span><b>${crFmt((+p.m||0)*60)}</b></div>`).join('')}
    <div class="frise"><span><b>Total</b></span><b>${crFmt(crCibleModele(M))}</b></div>
    <p class="muted" style="margin:10px 0 0">Tu choisis ta musique, tes exercices et comment les compter. Le téléphone calcule les temps et te prévient si une partie est trop longue ou trop courte.</p>
    <button class="btn" id="cr-new">➕ Créer un nouveau cours</button></div>`;
  h+=`<h2 style="margin:22px 0 10px">Mes cours (${L.length})</h2>`;
  if(!L.length)h+=`<div class="card nopli"><p class="muted" style="margin:0">Pas encore de cours. Touche « Créer un nouveau cours ».</p></div>`;
  L.forEach(c=>{const K=crCalc(c), n=(c.parties||[]).reduce((t,p)=>t+(p.ex||[]).length,0);
    h+=`<div class="card nopli ${K.alertes.length?'j':'g'}"><h2 style="margin-bottom:4px">${esc(c.nom)}</h2>
     <p class="muted" style="margin:0">${esc((c.modele&&c.modele.nom)||'')} · ${n} exercice${n>1?'s':''} · ⏱️ ${crFmt(K.total)} sur ${crFmt(K.cible)}${c.envoye?' · 📤 envoyé':''}</p>
     ${K.alertes.length?`<p style="margin:6px 0 0;color:var(--ja);font-weight:700">${K.alertes.length} alerte${K.alertes.length>1?'s':''} de temps</p>`:''}
     <button class="btn" data-crop="${c.id}">✏️ Ouvrir</button>
     <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
      <button class="link" data-crren="${c.id}">✏️ Renommer</button><button class="link" data-crdup="${c.id}">📄 Dupliquer</button><button class="link" data-crsup="${c.id}" style="color:var(--ko)">🗑️ Supprimer</button></div></div>`});
  h+=`<p class="muted">Tes cours sont gardés sur ce téléphone. Envoie-les à Hamid pour qu'il les voie.</p><button class="btn sec" id="bk2">← Retour à l'accueil</button>`;
  app.innerHTML=h;
  document.getElementById('bk').onclick=crRetourAccueil;document.getElementById('bk2').onclick=crRetourAccueil;
  document.getElementById('cr-new').onclick=()=>{const c=crNouveau();const nom=prompt('Le nom de ton cours :',c.nom);if(nom===null)return;c.nom=nom.trim()||c.nom;crSauver(c);crEditeur(c.id)};
  app.querySelectorAll('[data-crop]').forEach(b=>b.onclick=()=>crEditeur(b.dataset.crop));
  app.querySelectorAll('[data-crren]').forEach(b=>b.onclick=()=>{const c=crTrouver(b.dataset.crren);const nom=prompt('Nouveau nom du cours :',c.nom);if(nom&&nom.trim()){c.nom=nom.trim();crSauver(c);crListe('✅ Cours renommé.')}});
  app.querySelectorAll('[data-crdup]').forEach(b=>b.onclick=()=>{const c=JSON.parse(JSON.stringify(crTrouver(b.dataset.crdup)));
    c.id=crId();c.nom=c.nom+' (copie)';c.cree=Date.now();delete c.envoye;c.parties.forEach(p=>{p.id=crId();p.ex.forEach(x=>x.id=crId())});crSauver(c);crListe('✅ Cours dupliqué.')});
  app.querySelectorAll('[data-crsup]').forEach(b=>b.onclick=()=>{const c=crTrouver(b.dataset.crsup);if(!confirm(`Supprimer le cours « ${c.nom} » ?\n\nIl sera effacé de ce téléphone.`))return;crGarderTous(crTous().filter(x=>x.id!==c.id));crListe('🗑️ Cours supprimé.')});
  haut();
}

// ---- l'éditeur d'un cours ----
function crPas(k,v,pas,mi,ma){return `<div class="cr-st"><button data-crmoins="${k}" data-pas="${pas}" data-mi="${mi}" data-ma="${ma}" aria-label="Moins">−</button><input type="number" inputmode="decimal" data-crk="${k}" value="${esc(v)}"><button data-crplus="${k}" data-pas="${pas}" data-mi="${mi}" data-ma="${ma}" aria-label="Plus">+</button></div>`}
(function(){const st=document.createElement('style');st.textContent=`
.cr-st{display:flex;align-items:center;gap:6px;flex:none}
.cr-st button{width:42px;height:44px;border-radius:12px;border:0;background:var(--line);color:#fff;font-size:22px;font-weight:800;cursor:pointer;font-family:inherit}
.cr-st input{width:76px;height:44px;padding:0 4px;text-align:center;font-size:19px;font-weight:800;border-radius:12px;border:2px solid var(--line);background:#141b33;color:#fff;font-family:inherit}
.cr-reg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}
.cr-reg:last-child{border-bottom:0}
.cr-reg b small{display:block;font-weight:400;color:var(--mute);font-size:13px}
.cr-chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
.cr-chips button{padding:9px 12px;border-radius:999px;border:2px solid var(--line);background:#141b33;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
.cr-chips button.on{background:var(--or);border-color:var(--or);color:#10162b}
.cr-ex{background:#141b33;border-radius:14px;padding:12px;margin:12px 0;border-left:4px solid var(--or)}
.cr-ext{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.cr-ext b{font-size:17px}
.cr-ext small{display:block;color:var(--mute);font-size:13px;font-weight:400}
.cr-bo{display:flex;gap:4px;flex:none}
.cr-bo button{width:38px;height:38px;border-radius:10px;border:2px solid var(--line);background:#1c2442;color:#fff;font-size:16px;cursor:pointer;padding:0}
.cr-bo button:disabled{opacity:.3}
.cr-ex .cr-in{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:10px}
.cr-ex .cr-in label{margin:0;font-weight:700;font-size:15px}
.cr-ex .cr-in.hide{display:none}
.cr-bpmp{width:90px;padding:10px 8px;text-align:center;font-size:18px;font-weight:800;border-radius:12px;border:2px solid var(--line);background:#141b33;color:#fff;font-family:inherit}
.cr-ex input[type=number],.cr-ex input[type=text].cr-tp{width:84px;padding:10px 8px;text-align:center;font-size:18px;font-weight:800;border-radius:12px;border:2px solid var(--line);background:#1c2442;color:#fff;font-family:inherit}
.cr-ex textarea{min-height:64px;background:#1c2442;font-size:16px}
.cr-tps{margin-top:10px;padding:8px 10px;border-radius:10px;background:#1c2442;color:var(--soft);font-size:15px}
.cr-tps b{color:#fff;font-size:17px}
.cr-ex details{margin-top:10px;background:#1c2442;border-radius:10px;padding:8px 10px}
.cr-ex details summary{font-weight:700;font-size:15px;cursor:pointer}
.cr-ex .fiche{margin-top:6px;background:transparent;padding:4px 0 0;border-left:0}
.cr-barre{position:sticky;top:0;z-index:5;margin:0 -16px 14px;padding:10px 16px;background:#141b33;border-bottom:2px solid var(--line);font-weight:800;font-size:17px;display:flex;justify-content:space-between;gap:8px;align-items:center}
.cr-barre.al{border-bottom-color:var(--ja)}
.cr-barre small{font-weight:600;color:var(--ja);font-size:14px;text-align:right}
.cr-al{color:var(--ja);font-weight:700;margin:6px 0 0}
.cr-okl{color:var(--ok);font-weight:700;margin:6px 0 0}
.cr-res{display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;text-align:left;padding:12px 14px;margin:8px 0;border-radius:12px;border:2px solid var(--line);background:#141b33;color:#fff;font-size:16px;cursor:pointer;font-family:inherit}
.cr-res small{display:block;color:var(--mute);font-size:13px}
.cr-res span.cr-plus{flex:none;font-size:22px;color:var(--or);font-weight:900}
`;document.head.appendChild(st)})();

function crEditeur(id,cibleEx){
  ECRAN='cours';
  const c=crTrouver(id);if(!c)return crListe();
  const tb=crTb(c), K=crCalc(c);
  const chips=(attr,liste,actif)=>`<div class="cr-chips">${liste.map(([v,t])=>`<button ${attr}="${esc(v)}" class="${String(actif)===String(v)?'on':''}">${t}</button>`).join('')}</div>`;
  let h=`<div class="cr-barre" id="cr-barre"></div>
   <button class="back" id="bk">← Mes cours</button><div class="tag">📝 Je prépare mon cours</div>
   <h1 style="margin-bottom:6px">${esc(c.nom)}</h1><p class="muted" style="margin:0 0 14px">Modèle de Hamid : ${esc((c.modele&&c.modele.nom)||'')} · tout est gardé tout seul sur ce téléphone.</p>
   <div class="card o nopli"><h2>⏱️ Mes temps</h2><div id="cr-resume"></div></div>
   <div class="card nopli"><h2>⚙️ Mes réglages</h2>
    <div class="cr-reg"><b>✏️ Nom du cours</b></div><input type="text" data-crk="nom" value="${esc(c.nom)}" style="margin-bottom:6px">
    <div class="cr-reg"><b>🎵 Ma musique<small>en BPM, pour tout le cours</small></b>${crPas('bpm',c.bpm,1,40,220)}</div>
    <div class="cr-reg" style="display:block"><b>⏱️ Mon Tabata</b><p class="muted" style="margin:2px 0 0">Pour les exercices comptés en tours de Tabata.</p>
     <div class="cr-reg"><b>💪 Travail<small>en secondes</small></b>${crPas('tbw',tb.w,5,5,600)}</div>
     <div class="cr-reg"><b>😮‍💨 Repos<small>en secondes</small></b>${crPas('tbr',tb.r,5,0,600)}</div>
     <div class="cr-reg"><b>🔁 Tours<small>proposés pour un nouvel exercice</small></b>${crPas('tbk',tb.k,1,1,99)}</div>
     <div class="cr-chips">${CR_TB_PRESETS.map((p,i)=>`<button data-crtbp="${i}" class="${tb.w===p.w&&tb.r===p.r?'on':''}">${p.t}</button>`).join('')}</div></div>
    <div class="cr-reg" style="display:block"><b>↔️ Temps de passage entre les exercices</b><p class="muted" style="margin:2px 0 8px">Le temps pour changer d'exercice. 0 = aucun. Tu peux le changer pour un exercice.</p>
     <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span>En secondes</span>${crPas('pas',c.pas,5,0,300)}</div></div>
   </div>`;
  (c.parties||[]).forEach((p,pi)=>{
    h+=`<div class="card nopli ${['o','j','g',''][pi%4]}" id="cr-p-${pi}"><h2 style="margin-bottom:2px">${pi+1}. ${esc(p.n)}</h2>
      <div id="cr-pt-${pi}"></div>
      <details style="margin-top:8px"${crNum(p.bpm)?' open':''}><summary class="muted" style="cursor:pointer">🎵 Une autre musique pour cette partie ?</summary>
        <div class="cr-reg" style="border:0"><b>BPM de cette partie<small>vide = comme le cours (${crArrondi(crNum(c.bpm)||128)})</small></b><input type="number" inputmode="decimal" data-crpbpm="${pi}" value="${esc(p.bpm==null?'':p.bpm)}" placeholder="${esc(c.bpm)}" class="cr-bpmp"></div></details>`;
    (p.ex||[]).forEach((ex,i)=>{
      const F=crFiche(ex.f), x=K.ex[ex.id]||{};
      h+=`<div class="cr-ex" id="cr-x-${ex.id}"><div class="cr-ext"><div><b>${i+1}. ${esc(ex.nom||'Exercice')}</b><small>${F?esc(F.themeNom)+(F.cotes?' · des 2 côtés':''):'✍️ Exercice libre'}</small></div>
        <div class="cr-bo"><button data-crup="${ex.id}" ${i===0?'disabled':''} aria-label="Monter">⬆️</button><button data-crdn="${ex.id}" ${i===p.ex.length-1?'disabled':''} aria-label="Descendre">⬇️</button><button data-crx="${ex.id}" aria-label="Supprimer">🗑️</button></div></div>
        ${chips('data-crmode-'+ex.id,[['t','⏱️ En temps'],['r','🔢 En répétitions'],['b','🔁 En Tabata']],ex.mode)}`;
      if(ex.mode==='r'){
        const perso=!CR_TEMPOS.includes(ex.tp);
        h+=`<div class="cr-in"><label>Répétitions</label><input type="number" inputmode="numeric" data-crx-n="${ex.id}" value="${esc(ex.n)}"></div>
         <div class="cr-in" style="margin-top:6px"><label>Tempo</label></div>
         ${chips('data-crtp-'+ex.id,CR_TEMPOS.map(t=>[t,t]).concat([['libre','✏️ Libre']]),perso?'libre':ex.tp)}
         <div class="cr-in ${perso?'':'hide'}" id="cr-tpl-${ex.id}"><label>Mon tempo (x/y)</label><input type="text" class="cr-tp" inputmode="decimal" data-crx-tp="${ex.id}" value="${esc(perso?ex.tp:'')}" placeholder="2/1"></div>`;
      }else if(ex.mode==='b'){
        h+=`<div class="cr-in"><label>Tours de Tabata</label><input type="number" inputmode="numeric" data-crx-k="${ex.id}" value="${esc(ex.k)}"><span class="muted">${crFmt(tb.w)} de travail / ${crFmt(tb.r)} de repos</span></div>`;
      }else{
        const s=Math.round(crNum(ex.s)||0);
        h+=`<div class="cr-in"><label>Durée</label><input type="number" inputmode="numeric" data-crx-mn="${ex.id}" value="${Math.floor(s/60)}"><span>min</span><input type="number" inputmode="numeric" data-crx-sc="${ex.id}" value="${s%60}"><span>s</span></div>`;
      }
      h+=`<div class="cr-tps" id="cr-t-${ex.id}"></div>
        <div class="cr-in" id="cr-pw-${ex.id}"><label>↔️ Passage après</label><input type="number" inputmode="numeric" data-crx-pas="${ex.id}" value="${esc(ex.pas==null?'':ex.pas)}" placeholder="${esc(crNum(c.pas)||0)}"><span class="muted">s (vide = comme le cours)</span></div>
        ${F?`<details><summary>📋 Rappel de la fiche</summary><div class="fiche">${F.pl?`<div class="fl"><b>Placement</b>${esc(F.pl)}</div>`:''}${F.ex?`<div class="fl"><b>Exécution</b>${esc(F.ex)}</div>`:''}${F.se?`<div class="fl"><b>Sécurité</b>${esc(F.se)}</div>`:''}${F.me?`<div class="fl"><b>Méthode</b>${esc(F.me)}</div>`:''}</div></details>`:''}
        <label style="font-size:15px;margin-top:10px">✍️ Mes consignes / adaptations</label><textarea data-crx-cs="${ex.id}" placeholder="Ce que je dis au groupe, mes adaptations…">${esc(ex.cs||'')}</textarea></div>`;
    });
    if(!(p.ex||[]).length)h+=`<p class="muted" style="margin:10px 0 0">Pas encore d'exercice dans cette partie.</p>`;
    h+=`<button class="btn sec" data-cradd="${pi}">➕ Ajouter un exercice</button></div>`;
  });
  h+=`<div class="card g nopli"><h2>Et maintenant ?</h2>
    <button class="btn" id="cr-run">▶️ Dérouler mon cours</button>
    <button class="btn sec" id="cr-env">📤 Envoyer à Hamid</button><div id="cr-envok"></div>
    <button class="btn sec" id="cr-pr">🖨️ Imprimer / PDF</button></div>
   <button class="btn sec" id="bk2">← Mes cours</button>`;
  app.innerHTML=h;
  const majTemps=()=>{
    const K=crCalc(c);
    const b=document.getElementById('cr-barre');
    b.className='cr-barre'+(K.alertes.length?' al':'');
    b.innerHTML=`<span>⏱️ ${crFmt(K.total)} / ${crFmt(K.cible)}</span><small>${K.alertes.length?`⚠️ ${K.alertes.length} alerte${K.alertes.length>1?'s':''}`:'<span style="color:var(--ok)">✅ Temps OK</span>'}</small>`;
    document.getElementById('cr-resume').innerHTML=K.parties.map(P=>`<div class="frise"><span>${esc(P.n)}</span><b style="white-space:nowrap">${crFmt(P.total)} <span class="muted" style="font-weight:400">/ ${crFmt(P.cible)}</span></b></div>`).join('')
      +`<div class="frise"><span><b>Total du cours</b></span><b style="white-space:nowrap">${crFmt(K.total)} <span class="muted" style="font-weight:400">/ ${crFmt(K.cible)}</span></b></div>`
      +(K.alertes.length?K.alertes.map(a=>`<p class="cr-al">${esc(a)}</p>`).join('')+`<p class="muted" style="margin:6px 0 0">C'est seulement pour te prévenir : tu peux continuer.</p>`:`<p class="cr-okl">✅ Les temps correspondent au modèle.</p>`);
    K.parties.forEach((P,pi)=>{const z=document.getElementById('cr-pt-'+pi);if(z)z.innerHTML=`<p class="muted" style="margin:0">⏱️ ${crFmt(P.total)} sur ${crFmt(P.cible)}${crNum(c.parties[pi].bpm)?` · 🎵 ${crArrondi(P.bpm)} BPM`:''}</p>${P.alerte?`<p class="cr-al">${esc(P.alerte)}</p>`:''}`});
    c.parties.forEach(p=>p.ex.forEach(ex=>{const x=K.ex[ex.id], z=document.getElementById('cr-t-'+ex.id);if(!z||!x)return;
      z.innerHTML=`⏱️ Temps : <b>${crFmt(x.d)}</b>${ex.mode!=='t'?`<br>${esc(crDetail(c,ex,x.bpm))}`:''}${x.pas?`<br>↔️ + ${crFmt(x.pas)} de passage`:''}`;
      const pw=document.getElementById('cr-pw-'+ex.id);if(pw)pw.classList.toggle('hide',!!x.dernier)}));
  };
  const garder=()=>{crSauver(c);majTemps()};
  const trouverEx=xid=>{for(const p of c.parties){const i=p.ex.findIndex(e=>e.id===xid);if(i>=0)return {p,i,ex:p.ex[i]}}return null};
  const reafficher=xid=>{const y=window.scrollY;crEditeur(c.id);window.scrollTo(0,y);if(xid){const z=document.getElementById('cr-x-'+xid);if(z&&z.getBoundingClientRect().top<60)z.scrollIntoView({block:'start'})}};
  // champs
  app.querySelectorAll('[data-crk]').forEach(inp=>inp.addEventListener('input',()=>{const k=inp.dataset.crk,v=inp.value;
    if(k==='nom'){c.nom=v.trim()||c.nom;return garder()}
    const n=crNum(v);if(n==null)return;
    if(k==='bpm'){if(n>0)c.bpm=n}else if(k==='pas')c.pas=Math.max(0,n);
    else if(k==='tbw')c.tb=Object.assign(crTb(c),{w:Math.max(1,n)});else if(k==='tbr')c.tb=Object.assign(crTb(c),{r:Math.max(0,n)});else if(k==='tbk')c.tb=Object.assign(crTb(c),{k:Math.max(1,Math.round(n))});
    garder()}));
  app.querySelectorAll('[data-crk]').forEach(inp=>inp.addEventListener('change',()=>{if(['tbw','tbr','pas','bpm'].includes(inp.dataset.crk))reafficher()}));
  app.querySelectorAll('[data-crmoins],[data-crplus]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.crmoins||b.dataset.crplus, inp=app.querySelector(`[data-crk="${k}"]`), pas=+b.dataset.pas, sens=b.dataset.crmoins?-1:1;
    let v=(crNum(inp.value)||0)+sens*pas; if(pas>1)v=sens>0?Math.floor((crNum(inp.value)||0)/pas)*pas+pas:Math.ceil((crNum(inp.value)||0)/pas)*pas-pas;
    v=Math.min(+b.dataset.ma,Math.max(+b.dataset.mi,v));inp.value=v;inp.dispatchEvent(new Event('input'));
    if(k!=='bpm'&&k!=='tbk')reafficher()});
  app.querySelectorAll('[data-crtbp]').forEach(b=>b.onclick=()=>{const p=CR_TB_PRESETS[+b.dataset.crtbp];c.tb=Object.assign(crTb(c),{w:p.w,r:p.r});crSauver(c);reafficher()});
  app.querySelectorAll('[data-crpbpm]').forEach(inp=>inp.addEventListener('input',()=>{const p=c.parties[+inp.dataset.crpbpm],n=crNum(inp.value);p.bpm=n&&n>0?n:null;garder()}));
  const champEx=(attr,fn)=>app.querySelectorAll(`[${attr}]`).forEach(inp=>inp.addEventListener('input',()=>{const T=trouverEx(inp.getAttribute(attr));if(T){fn(T.ex,inp.value);garder()}}));
  champEx('data-crx-n',(ex,v)=>{const n=crNum(v);ex.n=n==null?0:Math.max(0,Math.round(n))});
  champEx('data-crx-k',(ex,v)=>{const n=crNum(v);ex.k=n==null?0:Math.max(0,Math.round(n))});
  champEx('data-crx-tp',(ex,v)=>{ex.tp=v.trim()});
  champEx('data-crx-pas',(ex,v)=>{const n=crNum(v);ex.pas=(v.trim()===''||n==null)?null:Math.max(0,n)});
  champEx('data-crx-cs',(ex,v)=>{ex.cs=v});
  const temps=xid=>{const mn=app.querySelector(`[data-crx-mn="${xid}"]`),sc=app.querySelector(`[data-crx-sc="${xid}"]`);return Math.max(0,(crNum(mn.value)||0)*60+(crNum(sc.value)||0))};
  champEx('data-crx-mn',(ex)=>{ex.s=temps(ex.id)});champEx('data-crx-sc',(ex)=>{ex.s=temps(ex.id)});
  // boutons des exercices
  c.parties.forEach(p=>p.ex.forEach(ex=>{
    app.querySelectorAll(`[data-crmode-${ex.id}]`).forEach(b=>b.onclick=()=>{const m=b.getAttribute('data-crmode-'+ex.id);if(m===ex.mode)return;
      if(m==='r'&&!(crNum(ex.n)>0))ex.n=16;if(m==='r'&&!ex.tp)ex.tp='2/2';if(m==='b'&&!(crNum(ex.k)>0))ex.k=crTb(c).k;if(m==='t'&&!(crNum(ex.s)>0))ex.s=30;
      ex.mode=m;crSauver(c);reafficher(ex.id)});
    app.querySelectorAll(`[data-crtp-${ex.id}]`).forEach(b=>b.onclick=()=>{const t=b.getAttribute('data-crtp-'+ex.id);
      if(t==='libre'){app.querySelectorAll(`[data-crtp-${ex.id}]`).forEach(x=>x.classList.toggle('on',x===b));const z=document.getElementById('cr-tpl-'+ex.id);z.classList.remove('hide');const i=z.querySelector('input');if(!i.value)i.value=CR_TEMPOS.includes(ex.tp)?'':ex.tp;i.focus();return}
      ex.tp=t;crSauver(c);reafficher(ex.id)});
  }));
  app.querySelectorAll('[data-crup],[data-crdn]').forEach(b=>b.onclick=()=>{const xid=b.dataset.crup||b.dataset.crdn,T=trouverEx(xid),j=T.i+(b.dataset.crup?-1:1);
    if(j<0||j>=T.p.ex.length)return;[T.p.ex[T.i],T.p.ex[j]]=[T.p.ex[j],T.p.ex[T.i]];crSauver(c);reafficher(xid)});
  app.querySelectorAll('[data-crx]').forEach(b=>b.onclick=()=>{const T=trouverEx(b.dataset.crx);if(!confirm(`Enlever « ${T.ex.nom} » du cours ?`))return;T.p.ex.splice(T.i,1);crSauver(c);reafficher()});
  app.querySelectorAll('[data-cradd]').forEach(b=>b.onclick=()=>crChoisirExo(c.id,+b.dataset.cradd));
  document.getElementById('bk').onclick=()=>crListe();document.getElementById('bk2').onclick=()=>crListe();
  document.getElementById('cr-run').onclick=()=>crDerouler(c,()=>{});
  document.getElementById('cr-pr').onclick=()=>crImprimer(c,()=>crEditeur(c.id),moi?`${moi.prenom} ${moi.nom}`:'');
  document.getElementById('cr-env').onclick=()=>crEnvoyer(c);
  majTemps();
  if(cibleEx){const z=document.getElementById('cr-x-'+cibleEx);if(z){z.scrollIntoView({block:'start'});window.scrollBy(0,-60);return}}
  haut();
}

// ---- choisir un exercice (fiches de renfo et d'étirements, ou libre) ----
function crChoisirExo(id,pi,filtre,q){
  ECRAN='cours';
  const c=crTrouver(id);if(!c)return crListe();
  const p=c.parties[pi];filtre=filtre||'tout';q=q||'';
  app.innerHTML=`<button class="back" id="bk">← Retour à mon cours</button><div class="tag">${esc(p.n)}</div><h1>➕ Ajouter un exercice</h1>
   <div class="card nopli"><h2>Dans les fiches</h2>
    <input type="text" id="cr-q" placeholder="🔎 Chercher par nom (ex. squat, pompe…)" value="${esc(q)}">
    <div class="cr-chips">${CR_THEMES.map(([k,t])=>`<button data-crf="${k}" class="${k===filtre?'on':''}">${t}</button>`).join('')}</div>
    <div id="cr-liste" style="margin-top:8px"></div></div>
   <div class="card j nopli"><h2>✍️ Un exercice libre</h2><p class="muted" style="margin-top:0">Un exercice qui n'est pas dans les fiches : écris son nom.</p>
    <input type="text" id="cr-libre" placeholder="Ex. : Jumping jack"><div class="err hide" id="cr-lerr">Écris le nom de l'exercice.</div>
    <button class="btn" id="cr-ladd">➕ Ajouter cet exercice</button></div>
   <button class="btn sec" id="bk2">← Retour à mon cours</button>`;
  const ajouter=(F,nom)=>{
    const etir=F&&F.src==='etir';
    const ex={id:crId(),f:F?F.f:null,nom:F?F.nom:nom,mode:F&&!etir?'r':'t',s:30,n:16,tp:'2/2',k:crTb(c).k,pas:null,cs:''};
    p.ex.push(ex);crSauver(c);crEditeur(c.id,ex.id)};
  const liste=()=>{
    const qq=genNorm(document.getElementById('cr-q').value);
    const L=crCatalogue().filter(x=>(filtre==='tout'||x.theme===filtre)&&(!qq||qq.split(' ').every(m=>x.cherche.includes(m))));
    document.getElementById('cr-liste').innerHTML=L.length?L.map((x,i)=>`<button class="cr-res" data-cri="${esc(x.f)}"><span>${esc(x.nom)}<small>${esc(x.themeNom)} · ${esc(x.cas)}${x.cotes?' · des 2 côtés':''}</small></span><span class="cr-plus">＋</span></button>`).join('')
      :`<p class="muted">Aucun exercice trouvé. Essaie un autre mot, ou ajoute un exercice libre plus bas.</p>`;
    document.querySelectorAll('[data-cri]').forEach(b=>b.onclick=()=>ajouter(crFiche(b.dataset.cri)));
  };
  document.getElementById('cr-q').oninput=liste;
  app.querySelectorAll('[data-crf]').forEach(b=>b.onclick=()=>{filtre=b.dataset.crf;app.querySelectorAll('[data-crf]').forEach(x=>x.classList.toggle('on',x===b));liste()});
  document.getElementById('cr-ladd').onclick=()=>{const n=document.getElementById('cr-libre').value.trim();if(!n){document.getElementById('cr-lerr').classList.remove('hide');return}ajouter(null,n)};
  const ret=()=>crEditeur(c.id);
  document.getElementById('bk').onclick=ret;document.getElementById('bk2').onclick=ret;
  liste();
  haut();
}

// ---- 📤 Envoyer à Hamid (formulaire des réponses, en morceaux si c'est long) ----
async function crEnvoyer(c){
  const b=document.getElementById('cr-env'), z=document.getElementById('cr-envok');
  if(!moi||!moi.id)return;
  if(!confirm(`Envoyer « ${c.nom} » à Hamid ?\n\nIl le verra dans ton bilan. Tu pourras le renvoyer plus tard si tu le modifies.`))return;
  b.disabled=true;b.textContent='Envoi…';z.innerHTML='';
  const at=Date.now(), e=crId();
  const copie=JSON.parse(JSON.stringify(c));copie.envoye=at;
  const texte=JSON.stringify({v:1,sid:moi.id,nom:moi.nom,prenom:moi.prenom,at,c:copie});
  const M=crMorceaux(texte);
  try{
    for(let i=0;i<M.length;i++){
      await envoyerForm(FORM,{[E.nom]:'__cours__',[E.prenom]:moi.id,[E.journee]:`Cours préparé · ${moi.prenom} ${moi.nom} · ${c.nom}`,[E.ressenti]:`${i+1}/${M.length}`,[E.reponses]:'',[E.difficulte]:JSON.stringify({e,p:i,n:M.length,d:M[i]})});
    }
  }catch(err){b.disabled=false;b.textContent='📤 Envoyer à Hamid';z.innerHTML=`<p class="err">L'envoi n'a pas marché. Vérifie ta connexion internet et réessaie.</p>`;return}
  c.envoye=at;crSauver(c);
  b.disabled=false;b.textContent='📤 Renvoyer à Hamid';
  z.innerHTML=`<p class="done" style="margin:10px 0 0">✅ C'est envoyé ! Hamid verra ton cours dans ton bilan (d'ici quelques minutes).</p>`;
}
