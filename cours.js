// ======= 📝 Je prépare mon cours (roadbook) : partie commune aux deux espaces =======
// Hamid définit des modèles de cours (parties + minutes) et choisit celui proposé aux stagiaires / apprentis.
// Réglage partagé : formulaire « Mes quiz CQP », Journée = coursprep, Statut = etat,
//   Contenu = {montrer, choisi, modeles:[{id, nom, parties:[{id, n (nom), m (minutes)}]}]} — la dernière ligne gagne.
// Un cours de stagiaire (gardé sur son téléphone, clé cqp_cours) :
//   {id, nom, cree, maj, envoye, modele:{id,nom}, bpm, tb:{w,r,k}, pas (passage en s), prep (s),
//    parties:[{id, n, m, bpm (null = celui du cours), ex:[{id, f (fiche) ou null, nom, mode t|r|b, s, n, tp, k, pas, cs}]}]}
//   mode t = en temps (s secondes) · r = en répétitions (n répétitions, tempo tp « 2/2 ») · b = en tours de Tabata (k tours)
// Envoi à Hamid : formulaire des réponses, Nom = __cours__, Prénom = numéro du stagiaire, Difficulté = morceau du JSON.
// Utilise : esc, genNorm, genNomExo (commun.js), RENFO, ETIR (fiches.js), tbAudioPret, tbSonTravail, tbSonPause, tbBip… (tabata.js).
const CR_MODELE_DEF={id:'epmsp20',nom:'EPMSP 20 min',parties:[{id:'p1',n:'Échauffement',m:4},{id:'p2',n:'Corps de séance',m:11},{id:'p3',n:'Retour au calme',m:2},{id:'p4',n:'Étirements',m:3}]};
const CR_TEMPOS=['2/2','3/1','1/1','4/4','1/3'];
const CR_TB_PRESETS=[{t:'20 / 10',w:20,r:10},{t:'30 / 30',w:30,r:30},{t:'40 / 20',w:40,r:20}];
const CR_TOLERANCE=15; // pas d'alerte sous 15 s d'écart
const CR_MORCEAU=8000; // taille d'un morceau envoyé dans une case du formulaire

// ---- réglage partagé (avec ce que Hamid vient de décider sur ce téléphone, sans attendre Google) ----
function crModelesValides(L){return Array.isArray(L)&&L.length&&L.every(m=>m&&m.id&&Array.isArray(m.parties))}
function crPrep(g){
  const P={montrer:false,choisi:CR_MODELE_DEF.id,modeles:[JSON.parse(JSON.stringify(CR_MODELE_DEF))]};
  const s=g&&g.prepCours;
  if(s){if(typeof s.montrer==='boolean')P.montrer=s.montrer;if(crModelesValides(s.modeles)){P.modeles=s.modeles;P.choisi=s.choisi||s.modeles[0].id}}
  try{const l=JSON.parse(localStorage.getItem('cqpf_local_coursprep')||'null');
    if(l&&Date.now()-l.at<15*60*1000){if(typeof l.montrer==='boolean')P.montrer=l.montrer;if(crModelesValides(l.modeles)){P.modeles=l.modeles;P.choisi=l.choisi||l.modeles[0].id}}}catch(e){}
  if(!P.modeles.some(m=>m.id===P.choisi))P.choisi=P.modeles[0].id;
  return P;
}
function crModeleChoisi(P){return (P.modeles||[]).find(m=>m.id===P.choisi)||(P.modeles||[])[0]||CR_MODELE_DEF}
function crCibleModele(m){return (m.parties||[]).reduce((t,p)=>t+(+p.m||0)*60,0)}
function crId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

// ---- les exercices des fiches (renforcement et étirements seulement) ----
let CR_CATA=null;
function crCatalogue(){
  if(CR_CATA)return CR_CATA;
  CR_CATA=[];
  if(typeof RENFO==='undefined'||typeof ETIR==='undefined')return CR_CATA;
  [['renfo',RENFO],['etir',ETIR]].forEach(([src,A])=>A.forEach(g=>g.cases.forEach(c=>c.v.forEach(v=>{
    const nom=(typeof genNomExo==='function')?genNomExo(src,g,c,v):v[0];
    CR_CATA.push({f:src+'|'+c.c+'|'+v[0],src,k:g.k,theme:src+'.'+g.k,themeNom:(src==='renfo'?'Renfo · ':'Étirements · ')+String(g.t||'').toLowerCase(),
      cas:c.c,nom,cotes:v[1]===1,pl:v[2]||'',ex:v[3]||'',se:v[4]||'',me:src==='etir'?(v[5]||''):'',
      cherche:(typeof genNorm==='function'?genNorm:(x=>String(x).toLowerCase()))(nom+' '+c.c+' '+v[0])});
  }))));
  return CR_CATA;
}
function crFiche(f){return f?crCatalogue().find(x=>x.f===f)||null:null}
const CR_THEMES=[['tout','Tout'],['renfo.bas','💪 Bas du corps'],['renfo.haut','💪 Haut du corps'],['renfo.abdos','💪 Abdos'],['etir.bas','🧘 Étir. bas'],['etir.haut','🧘 Étir. haut'],['etir.abdos','🧘 Étir. abdos']];

// ---- les calculs ----
function crNum(v){if(v==null)return null;const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?null:n}
// 2/2 = 4 temps ; « libre » : n'importe quels nombres séparés par « / »
function crTemps(tp){const a=String(tp||'').split('/').map(x=>crNum(x.trim()));if(!a.length||a.some(x=>x==null||x<0))return 0;return a.reduce((s,x)=>s+x,0)}
function crBpm(c,p){const b=p&&crNum(p.bpm);return b&&b>0?b:(crNum(c.bpm)>0?crNum(c.bpm):128)}
function crTb(c){const t=c.tb||{};return {w:Math.max(0,crNum(t.w)||0),r:Math.max(0,crNum(t.r)||0),k:Math.max(1,Math.round(crNum(t.k)||8))}}
function crDuree(ex,bpm,tb){
  if(ex.mode==='r')return bpm>0?Math.max(0,crNum(ex.n)||0)*crTemps(ex.tp)*60/bpm:0;
  if(ex.mode==='b'){const k=Math.max(0,Math.round(crNum(ex.k)||0));return k?k*tb.w+(k-1)*tb.r:0}
  return Math.max(0,crNum(ex.s)||0);
}
function crPassage(c,ex){const p=crNum(ex.pas);return Math.max(0,p!=null&&String(ex.pas).trim()!==''?p:(crNum(c.pas)||0))}
// tout le cours : temps par exercice, par partie, total, écarts et alertes
function crCalc(c){
  const tb=crTb(c), tous=[];
  (c.parties||[]).forEach((p,pi)=>(p.ex||[]).forEach(ex=>tous.push({ex,pi})));
  const dernier=tous.length?tous[tous.length-1].ex:null;
  const R={parties:[],total:0,cible:0,alertes:[],ex:{}};
  (c.parties||[]).forEach((p,pi)=>{
    const bpm=crBpm(c,p), cible=(crNum(p.m)||0)*60;let tot=0;
    (p.ex||[]).forEach(ex=>{const d=crDuree(ex,bpm,tb), pas=ex===dernier?0:crPassage(c,ex);R.ex[ex.id]={d,pas,bpm,dernier:ex===dernier};tot+=d+pas});
    const ecart=tot-cible;
    R.parties.push({n:p.n,cible,total:tot,ecart,bpm,alerte:crAlerte(p.n,ecart)});
    R.total+=tot;R.cible+=cible;
  });
  R.ecart=R.total-R.cible;R.alerteTotal=crAlerte('Total du cours',R.ecart);
  R.parties.forEach(p=>{if(p.alerte)R.alertes.push(p.alerte)});
  if(R.alerteTotal)R.alertes.push(R.alerteTotal);
  return R;
}
function crFmt(s){s=Math.max(0,Math.round(s));const m=Math.floor(s/60),x=s%60;return m?(x?`${m} min ${String(x).padStart(2,'0')}`:`${m} min`):`${x} s`}
function crAlerte(nom,ecart){if(Math.abs(ecart)<CR_TOLERANCE)return '';return ecart>0?`⚠️ ${nom} : ${crFmt(ecart)} de trop`:`⚠️ ${nom} : il manque ${crFmt(-ecart)}`}
function crArrondi(x){return Math.round(x*10)/10}
function crComptage(c,ex,bpm){
  const tb=crTb(c);
  if(ex.mode==='r')return `🔢 ${crNum(ex.n)||0} répétition${(crNum(ex.n)||0)>1?'s':''} · tempo ${ex.tp||'?'} · ${crArrondi(bpm)} BPM`;
  if(ex.mode==='b'){const k=Math.round(crNum(ex.k)||0);return `🔁 Tabata ${k} tour${k>1?'s':''} · ${crFmt(tb.w)} / ${crFmt(tb.r)}`}
  return `⏱️ En temps : ${crFmt(crNum(ex.s)||0)}`;
}
// le calcul expliqué (répétitions)
function crDetail(c,ex,bpm){
  if(ex.mode==='r'){const n=crNum(ex.n)||0, t=crTemps(ex.tp);return `${n} rép. × ${crArrondi(t)} temps × 60 / ${crArrondi(bpm)} BPM = ${crFmt(n*t*60/bpm)}`}
  if(ex.mode==='b'){const tb=crTb(c), k=Math.round(crNum(ex.k)||0);return k?`${k} × ${crFmt(tb.w)} de travail + ${Math.max(0,k-1)} × ${crFmt(tb.r)} de repos = ${crFmt(k*tb.w+(k-1)*tb.r)}`:'0 tour'}
  return crFmt(crNum(ex.s)||0);
}

// ---- la feuille complète (impression, et bilan côté formateur) ----
(function(){const st=document.createElement('style');st.textContent=`
.cr-feuille{background:#fff;color:#111;border-radius:8px;padding:18px 14px;font-size:14px;line-height:1.35}
.cr-feuille h3{margin:0 0 4px;font-size:19px;color:#111}
.cr-feuille .cr-sub{color:#444;margin:0 0 10px}
.cr-feuille .cr-al{border:1.5px solid #c0392b;color:#8e1d12;background:#fdecea;border-radius:8px;padding:8px 10px;margin:8px 0}
.cr-feuille .cr-okb{border:1.5px solid #1e8449;color:#145a32;background:#e9f7ef;border-radius:8px;padding:8px 10px;margin:8px 0}
.cr-tw{overflow-x:auto}
.cr-feuille table{width:100%;border-collapse:collapse;font-size:13px}
.cr-feuille th,.cr-feuille td{border:1px solid #999;padding:5px 6px;vertical-align:top;text-align:left}
.cr-feuille th{background:#eee}
.cr-feuille td.cr-pt{background:#f6f6f6;font-weight:700;min-width:84px}
.cr-feuille td.cr-pt small,.cr-feuille small{font-weight:400;color:#444}
.cr-feuille td.cr-pt .cr-ko{color:#c0392b;font-weight:700}
.cr-feuille tfoot td{font-weight:800;background:#eee}
.cr-feuille .cr-cs{white-space:pre-wrap}
.cr-feuille tr{break-inside:avoid}
@media print{
  body{background:#fff!important;color:#111!important}
  .noprint{display:none!important}
  .wrap{max-width:none!important;padding:0!important}
  .cr-feuille{border-radius:0;padding:0;font-size:12px}
  .cr-tw{overflow:visible}
}
.cr-run .cr-pa{font-size:min(5vw,26px);font-weight:800;opacity:.85;text-transform:uppercase;letter-spacing:1px}
.cr-run .cr-nom{font-size:min(8.5vw,48px);font-weight:900;line-height:1.1;max-width:96vw;overflow-wrap:anywhere}
.cr-run .tb-ph{font-size:min(9vw,60px)}
.cr-run .tb-big{font-size:min(30vw,32vh,260px)}
.cr-run .tb-inf{font-size:min(6vw,32px)}
.cr-run .cr-suiv{font-size:min(5vw,24px);font-weight:700;opacity:.9;margin-top:4px}
.cr-run .tb-bt button{min-width:96px;padding:14px 14px;font-size:18px}
.cr-run.tb-x{background:#7a5a12}
`;document.head.appendChild(st)})();
function crFeuille(c,qui){
  const K=crCalc(c), tb=crTb(c);
  let h=`<div class="cr-feuille"><h3>📝 ${esc(c.nom||'Mon cours')}</h3>
   <p class="cr-sub">${qui?`<b>${esc(qui)}</b> · `:''}Modèle : ${esc((c.modele&&c.modele.nom)||'?')} · 🎵 ${crArrondi(crNum(c.bpm)||128)} BPM · ⏱️ Tabata ${crFmt(tb.w)} / ${crFmt(tb.r)} · ↔️ passage ${crNum(c.pas)?crFmt(crNum(c.pas)):'aucun'}${c.envoye?` · envoyé le ${esc(new Date(c.envoye).toLocaleDateString('fr-FR'))}`:''}</p>`;
  h+=K.alertes.length?`<div class="cr-al">${K.alertes.map(esc).join('<br>')}</div>`:`<div class="cr-okb">✅ Les temps correspondent au modèle (${crFmt(K.cible)}).</div>`;
  h+=`<div class="cr-tw"><table><thead><tr><th>Partie</th><th>Exercice</th><th>Comptage</th><th>Temps</th><th>Consignes</th></tr></thead><tbody>`;
  (c.parties||[]).forEach((p,pi)=>{
    const P=K.parties[pi], L=p.ex||[], rs=Math.max(1,L.length);
    const tete=`<td class="cr-pt" rowspan="${rs}">${esc(p.n)}<br><small>${crFmt(P.total)} / ${crFmt(P.cible)}${crNum(p.bpm)?` · 🎵 ${crArrondi(P.bpm)} BPM`:''}</small>${P.alerte?`<br><span class="cr-ko">${esc(P.alerte.replace(/^⚠️ [^:]+: /,'⚠️ '))}</span>`:''}</td>`;
    if(!L.length){h+=`<tr>${tete}<td colspan="4"><i>Aucun exercice</i></td></tr>`;return}
    L.forEach((ex,i)=>{const x=K.ex[ex.id], F=crFiche(ex.f);
      h+=`<tr>${i===0?tete:''}<td>${esc(ex.nom||'Exercice')}${ex.f?'':' <small>(libre)</small>'}${F&&F.cotes?' <small>(des 2 côtés)</small>':''}</td>
        <td>${esc(crComptage(c,ex,x.bpm))}${ex.mode!=='t'?`<br><small>${esc(crDetail(c,ex,x.bpm))}</small>`:''}</td>
        <td style="white-space:nowrap">${crFmt(x.d)}${x.pas?`<br><small>+ ${crFmt(x.pas)} passage</small>`:''}</td>
        <td class="cr-cs">${esc(ex.cs||'')}</td></tr>`});
  });
  h+=`</tbody><tfoot><tr><td>Total</td><td colspan="2"></td><td style="white-space:nowrap">${crFmt(K.total)} / ${crFmt(K.cible)}</td><td>${K.alerteTotal?esc(K.alerteTotal):'✅'}</td></tr></tfoot></table></div></div>`;
  return h;
}
// écran d'impression : la feuille seule + un bouton (window.print)
function crImprimer(c,retour,qui){
  window.scrollTo(0,0);
  const a=document.getElementById('app');
  a.innerHTML=`<div class="noprint"><button class="back" id="cr-pbk">← Retour</button>
   <p class="muted" style="margin:0 0 10px">Touche « Imprimer » puis choisis ton imprimante, ou « Enregistrer en PDF ».</p>
   <button class="btn" id="cr-pgo" style="margin:0 0 14px">🖨️ Imprimer / PDF</button></div>${crFeuille(c,qui)}
   <div class="noprint"><button class="btn sec" id="cr-pbk2">← Retour</button></div>`;
  document.getElementById('cr-pbk').onclick=retour;document.getElementById('cr-pbk2').onclick=retour;
  document.getElementById('cr-pgo').onclick=()=>{try{window.print()}catch(e){}};
}

// ---- envoi à Hamid : en morceaux si c'est long ----
function crMorceaux(texte){const L=[];for(let i=0;i<texte.length;i+=CR_MORCEAU)L.push(texte.slice(i,i+CR_MORCEAU));return L.length?L:['']}
// lignes « __cours__ » du tableau des réponses → envois complets [{e, sid, at, nom, prenom, c, h}]
function crRecoller(lignesCours){
  const G={};
  lignesCours.forEach(l=>{let m;try{m=JSON.parse(l[6]||'')}catch(e){return}
    if(!m||!m.e||typeof m.d!=='string')return;
    const g=G[m.e]||(G[m.e]={e:m.e,sid:String(l[2]||'').trim(),n:+m.n||1,p:{},h:l[0]||''});g.p[+m.p||0]=m.d});
  const res=[];
  Object.values(G).forEach(g=>{
    for(let i=0;i<g.n;i++)if(g.p[i]==null)return res.push({e:g.e,sid:g.sid,incomplet:true,h:g.h});
    try{const o=JSON.parse(Array.from({length:g.n},(_,i)=>g.p[i]).join(''));if(o&&o.c&&Array.isArray(o.c.parties))res.push(Object.assign({e:g.e,h:g.h},o,{sid:o.sid||g.sid}))}catch(e){res.push({e:g.e,sid:g.sid,incomplet:true,h:g.h})}
  });
  return res.sort((a,b)=>(b.at||0)-(a.at||0));
}

// ---- ▶️ Dérouler mon cours : plein écran, minuteur et sons ----
function crSegments(c){
  const K=crCalc(c), tb=crTb(c), S=[], prep=Math.max(0,crNum(c.prep)!=null?crNum(c.prep):10);
  if(prep)S.push({t:'p',d:prep,lab:'Préparation'});
  (c.parties||[]).forEach((p,pi)=>(p.ex||[]).forEach(ex=>{
    const x=K.ex[ex.id];if(!x)return;
    if(x.d>0){
      if(ex.mode==='b'){const k=Math.round(crNum(ex.k)||0);
        for(let i=1;i<=k;i++){S.push({t:'w',d:tb.w,ex,pi,lab:'Travail',info:`Tabata · tour ${i} / ${k}`});if(i<k&&tb.r)S.push({t:'r',d:tb.r,ex,pi,lab:'Repos',info:`Tabata · tour ${i} / ${k} fini`})}}
      else S.push({t:'w',d:x.d,ex,pi,lab:'Travail',info:ex.mode==='r'?`${crNum(ex.n)||0} répétitions · tempo ${ex.tp} · ${crArrondi(x.bpm)} BPM · ${crFmt(x.d)}`:''});
    }
    if(x.pas>0)S.push({t:'x',d:x.pas,pi,lab:'Passage',info:'On change d\'exercice'});
  }));
  let t=0;S.forEach(s=>{s.debut=t;t+=s.d});
  return {S,total:t};
}
function crDerouler(c,fin){
  const {S,total}=crSegments(c);
  if(!S.some(s=>s.t==='w')){alert("Ajoute d'abord des exercices (avec un temps) à ton cours.");return}
  try{tbAudioPret()}catch(e){}
  const box=document.createElement('div');box.className='tb-run cr-run tb-p';document.body.appendChild(box);
  let debut=performance.now(), pauseAt=null, decal=0, fini=false, verrou=null, minut=null, avantI=-1, avantS=null;
  const garder=()=>{try{if(navigator.wakeLock&&!verrou)navigator.wakeLock.request('screen').then(l=>{verrou=l;l.addEventListener('release',()=>{verrou=null})}).catch(()=>{})}catch(e){}};
  const lacher=()=>{try{if(verrou)verrou.release()}catch(e){}verrou=null};
  garder();
  try{if(box.requestFullscreen)box.requestFullscreen().catch(()=>{})}catch(e){}
  box.innerHTML=`<div class="cr-pa" id="cr-pa"></div><div class="tb-ph" id="cr-ph"></div><div class="cr-nom" id="cr-nom"></div>
   <div class="tb-big" id="cr-big"></div><div class="tb-inf" id="cr-inf"></div><div class="cr-suiv" id="cr-suiv"></div><div class="tb-rest" id="cr-rest"></div>
   <div class="tb-bt"><button id="cr-pause">⏸️ Pause</button><button id="cr-next">⏭️ Suivant</button><button id="cr-stop">⏹️ Arrêt</button></div>
   <div class="tb-nav" id="cr-nav"><button id="cr-prev" aria-label="Étape précédente">⏮️</button><button id="cr-m10" aria-label="Enlever 10 secondes">−10 s</button><button id="cr-p10" aria-label="Ajouter 10 secondes">+10 s</button></div>`;
  const $=id=>document.getElementById(id);
  const vis=()=>{if(document.visibilityState==='visible'&&!fini)garder()};
  document.addEventListener('visibilitychange',vis);
  const quitter=()=>{fini=true;clearInterval(minut);lacher();try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}box.remove();document.removeEventListener('visibilitychange',vis);if(fin)fin()};
  const ecoule=()=>((pauseAt||performance.now())-debut-decal)/1000;
  const indice=t=>{for(let i=0;i<S.length;i++)if(t<S[i].debut+S[i].d)return i;return S.length};
  const nomEx=s=>s&&s.ex?(s.ex.nom||'Exercice'):'';
  const suivantTravail=i=>{for(let k=i+1;k<S.length;k++)if(S[k].t==='w'&&S[k].ex!==(S[i]&&S[i].ex))return S[k];for(let k=i+1;k<S.length;k++)if(S[k].t==='w')return S[k];return null};
  $('cr-stop').onclick=()=>{if(box.classList.contains('tb-f')||confirm('Arrêter le déroulé du cours ?'))quitter()};
  $('cr-pause').onclick=()=>{try{tbAudioPret()}catch(e){}
    if(box.classList.contains('tb-f'))return quitter();
    if(pauseAt){decal+=performance.now()-pauseAt;pauseAt=null;$('cr-pause').textContent='⏸️ Pause'}
    else{pauseAt=performance.now();$('cr-pause').textContent='▶️ Reprendre'}
    tick()};
  $('cr-next').onclick=()=>{const t=ecoule(),i=indice(t);if(i>=S.length)return;
    const saut=S[i].debut+S[i].d-t+0.001;decal-=saut*1000;tick()};
  const aller=t=>{decal=(pauseAt||performance.now())-debut-Math.max(0,t)*1000;tick()};
  $('cr-prev').onclick=()=>{const t=ecoule(),i=indice(t);if(i>=S.length)return;const cur=S[i].debut;
    if(t-cur>2||i===0)return aller(cur+0.001);aller(S[i-1].debut+0.001)};
  $('cr-m10').onclick=()=>{const t=ecoule(),i=indice(t);if(i>=S.length)return;aller(t+Math.min(10,Math.max(0,S[i].debut+S[i].d-t-0.05)))};
  $('cr-p10').onclick=()=>{const t=ecoule(),i=indice(t);if(i>=S.length)return;aller(Math.max(S[i].debut+0.001,t-10))};
  const tick=()=>{
    if(fini)return;
    const t=ecoule(), i=indice(t);
    if(i>=S.length){
      if(!box.classList.contains('tb-f')){try{tbBipFin()}catch(e){}lacher()}
      box.className='tb-run cr-run tb-f';$('cr-pa').textContent=c.nom||'';$('cr-ph').textContent='🎉 Terminé !';$('cr-nom').textContent='Bravo, ton cours est fini !';$('cr-big').textContent='0:00';
      $('cr-inf').textContent=`Durée : ${crFmt(total)}`;$('cr-suiv').textContent='';$('cr-rest').textContent='';$('cr-pause').textContent='✅ Fermer';$('cr-next').style.display='none';$('cr-stop').style.display='none';$('cr-nav').style.display='none';clearInterval(minut);return}
    const s=S[i], reste=s.debut+s.d-t, sec=Math.ceil(reste);
    if(!pauseAt){
      if(avantI>=0&&i!==avantI){try{s.t==='w'?tbSonTravail():(s.t==='r'||s.t==='x')?tbSonPause():tbBipChangement()}catch(e){}}
      else if(avantS!=null&&sec!==avantS&&sec<=3&&sec>=1){try{tbBipCourt()}catch(e){}}
    }
    avantI=i;avantS=sec;
    box.className='tb-run cr-run tb-'+(s.t==='x'?'x':s.t);
    const p=s.pi!=null?(c.parties[s.pi]||{}).n:'';
    $('cr-pa').textContent=p?`${p}`:(c.nom||'');
    $('cr-ph').textContent=(pauseAt?'⏸️ ':'')+s.lab;
    const suiv=suivantTravail(i);
    $('cr-nom').textContent=s.t==='w'?nomEx(s):s.t==='p'?`Premier : ${nomEx(suiv)}`:(s.t==='r'?nomEx(s):`➡️ ${nomEx(suiv)||'Fin'}`);
    $('cr-big').textContent=tbMmss(reste);
    $('cr-inf').textContent=s.info||'';
    $('cr-suiv').textContent=s.t==='w'||s.t==='r'?(suiv?`Ensuite : ${nomEx(suiv)}`:'Ensuite : fin du cours'):'';
    $('cr-rest').textContent=pauseAt?'En pause':`Temps restant du cours : ${tbMmss(total-t)}`;
  };
  tick();
  minut=setInterval(tick,100);
  try{S[0].t==='w'?tbSonTravail():tbBipChangement()}catch(e){}
}
