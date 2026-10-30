// ======= ⏱️ Minuteur : travail / repos / préparation / tours (ou sans fin), avec bips =======
// Chargé par l'espace formateur, et par l'espace stagiaires / apprentis quand Hamid le montre.
// Réglages gardés sur le téléphone. Les sons utilisent Web Audio (créé au toucher de « Démarrer »).
// 29/10 : buzzer au début du travail, cloche au début du repos, 3 petits bips avant chaque changement, mélodie de fin.
const TB_PRESETS=[{t:'Tabata 20 / 10',w:20,r:10,k:8},{t:'30 / 30',w:30,r:30,k:8},{t:'40 / 20',w:40,r:20,k:8}];
const TB_CLE='tabata_reglages';
const TB_DEF={w:20,r:10,k:8,p:10,fin:false};
function tbLire(){try{const c=Object.assign({},TB_DEF,JSON.parse(localStorage.getItem(TB_CLE)||'{}'));c.fin=!!c.fin;return c}catch(e){return Object.assign({},TB_DEF)}}
function tbEcrire(c){try{localStorage.setItem(TB_CLE,JSON.stringify(c))}catch(e){}}
function tbTxt(s){s=Math.max(0,Math.round(s));const m=Math.floor(s/60),x=s%60;return m?`${m} min${x?' '+String(x).padStart(2,'0')+' s':''}`:`${x} s`}
function tbMmss(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
(function(){const st=document.createElement('style');st.textContent=`
.tb-reg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)}
.tb-reg:last-child{border-bottom:0}
.tb-reg b{font-size:17px}
.tb-reg small{display:block;font-weight:400;color:var(--mute);font-size:13px}
.tb-st{display:flex;align-items:center;gap:6px;flex:none}
.tb-st button{width:44px;height:46px;border-radius:12px;border:0;background:var(--line);color:#fff;font-size:24px;font-weight:800;cursor:pointer;font-family:inherit}
.tb-st input{width:74px;height:46px;padding:0 4px;text-align:center;font-size:20px;font-weight:800;border-radius:12px;border:2px solid var(--line);background:#141b33;color:#fff;font-family:inherit}
.tb-st input:disabled{opacity:.4}
.tb-fin{display:flex;align-items:center;gap:10px;margin-top:10px;font-weight:700;cursor:pointer}
.tb-fin input{width:24px;height:24px;margin:0}
.tb-pr{display:flex;flex-wrap:wrap;gap:8px}
.tb-pr button{flex:1 1 28%;padding:12px 8px;border-radius:12px;border:2px solid var(--line);background:#141b33;color:#fff;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit}
.tb-go{display:block;width:100%;padding:16px;border:0;border-radius:14px;background:var(--ok);color:#0b2416;font-weight:900;font-size:20px;cursor:pointer;margin-top:4px;font-family:inherit}
.tb-run{position:fixed;inset:0;z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:24px 16px;text-align:center;color:#fff;background:#10162b;transition:background .3s;overflow:hidden}
.tb-run.tb-w{background:#1f7a4d}.tb-run.tb-r{background:#9b2c35}.tb-run.tb-p{background:#2c365c}.tb-run.tb-f{background:#10162b}
.tb-ph{font-size:min(14vw,96px);font-weight:900;letter-spacing:2px;text-transform:uppercase;line-height:1.05}
.tb-big{font-size:min(36vw,48vh,300px);font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.tb-inf{font-size:min(8vw,44px);font-weight:800;opacity:.95}
.tb-rest{font-size:18px;opacity:.75;font-weight:600}
.tb-bt{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;justify-content:center}
.tb-bt button{min-width:140px;padding:16px 20px;border-radius:14px;border:0;font-size:20px;font-weight:800;cursor:pointer;font-family:inherit;background:rgba(255,255,255,.2);color:#fff}
.tb-nav{display:flex;gap:8px;margin-top:12px;justify-content:center;flex-wrap:wrap}
.tb-nav button{min-width:66px;padding:13px 10px;border-radius:12px;border:0;font-size:18px;font-weight:800;cursor:pointer;font-family:inherit;background:rgba(255,255,255,.16);color:#fff}
`;document.head.appendChild(st)})();
// ---- les bips (Web Audio) ----
let TB_AUDIO=null;
function tbAudioPret(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;if(!TB_AUDIO)TB_AUDIO=new A();if(TB_AUDIO.state==='suspended')TB_AUDIO.resume()}catch(e){TB_AUDIO=null}}
function tbBip(freq,duree,quand){
  try{if(!TB_AUDIO)return;const t=TB_AUDIO.currentTime+(quand||0),o=TB_AUDIO.createOscillator(),g=TB_AUDIO.createGain();
    o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.6,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+duree);
    o.connect(g);g.connect(TB_AUDIO.destination);o.start(t);o.stop(t+duree+0.02)}catch(e){}
}
function tbBipCourt(){tbBip(880,0.12)}
function tbBipChangement(){tbBip(1320,0.45)}
function tbBipFin(){tbBip(1320,0.3);tbBip(1320,0.3,0.4);tbBip(1760,0.7,0.8)}
// ---- 29/10 : les vrais sons d'Hamid (buzzer = début du travail, cloche = début de la pause / du repos) ----
// Les fichiers sont téléchargés dès l'ouverture de la page, puis décodés au premier toucher (ou à « Démarrer »)
// (le téléphone n'autorise le son qu'après un toucher). Si un fichier ne charge pas : l'ancien bip.
const TB_SONS={travail:'sons/buzzer.mp3',pause:'sons/cloche.mp3'};
const TB_BRUT={}, TB_BUF={}, TB_DEC={};
Object.entries(TB_SONS).forEach(([k,u])=>{try{TB_BRUT[k]=fetch(u).then(r=>{if(!r.ok)throw new Error('son');return r.arrayBuffer()}).catch(()=>null)}catch(e){TB_BRUT[k]=Promise.resolve(null)}});
function tbDecoder(){
  if(!TB_AUDIO)return;
  Object.keys(TB_SONS).forEach(k=>{
    if(TB_DEC[k])return;
    TB_DEC[k]=TB_BRUT[k].then(ab=>new Promise(fin=>{
      if(!ab||!TB_AUDIO)return fin(null);
      const ok=b=>{TB_BUF[k]=b;fin(b)}, ko=()=>fin(null);
      try{const p=TB_AUDIO.decodeAudioData(ab.slice(0),ok,ko);if(p&&p.then)p.then(ok,ko)}catch(e){ko()}
    })).catch(()=>null);
  });
}
// petit son vide joué au toucher : « déverrouille » le son sur iPhone
function tbDeverrouiller(){try{const b=TB_AUDIO.createBuffer(1,1,22050),s=TB_AUDIO.createBufferSource();s.buffer=b;s.connect(TB_AUDIO.destination);s.start(0)}catch(e){}}
(function(){const avant=tbAudioPret;tbAudioPret=function(){avant();if(TB_AUDIO){tbDeverrouiller();tbDecoder()}}})();
// le premier toucher sur la page prépare déjà le son (les fichiers sont prêts avant « Démarrer »)
(function(){const un=()=>{document.removeEventListener('pointerdown',un,true);document.removeEventListener('touchstart',un,true);tbAudioPret()};
  document.addEventListener('pointerdown',un,true);document.addEventListener('touchstart',un,true)})();
function tbJouer(b){const s=TB_AUDIO.createBufferSource();s.buffer=b;s.connect(TB_AUDIO.destination);s.start(0)}
function tbSon(k){
  try{
    if(TB_AUDIO&&TB_BUF[k]){tbJouer(TB_BUF[k]);return}
    // pas encore décodé : on attend un tout petit peu (au tout premier départ), sinon l'ancien bip
    if(TB_AUDIO&&TB_DEC[k]){let fait=false;
      const t=setTimeout(()=>{if(!fait){fait=true;tbBipChangement()}},700);
      TB_DEC[k].then(b=>{if(fait)return;fait=true;clearTimeout(t);try{b?tbJouer(b):tbBipChangement()}catch(e){tbBipChangement()}});return}
  }catch(e){}
  tbBipChangement();
}
function tbSonTravail(){tbSon('travail')}
function tbSonPause(){tbSon('pause')}
// pour vérifier : quels sons sont prêts
function tbSonsPrets(){return Object.keys(TB_SONS).filter(k=>!!TB_BUF[k])}

function tabataEcran(retour,tag){
  const c=tbLire();
  const B={w:[1,3600,5],r:[0,3600,5],p:[0,600,5],k:[1,999,1]};
  const ligne=(k,t,aide)=>`<div class="tb-reg"><b>${t}${aide?`<small>${aide}</small>`:''}</b><div class="tb-st"><button data-m="${k}" data-d="-1" aria-label="Moins">−</button><input type="number" inputmode="numeric" id="tb-${k}" min="${B[k][0]}" max="${B[k][1]}" value="${c[k]}"><button data-m="${k}" data-d="1" aria-label="Plus">+</button></div></div>`;
  app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="tag">${tag||''}</div><h1>⏱️ Minuteur</h1>
  <div class="card o nopli"><h2>Réglages</h2>
   ${ligne('w','💪 Travail','en secondes')}${ligne('r','😮‍💨 Repos','en secondes')}${ligne('p','⏳ Préparation','en secondes')}${ligne('k','🔁 Nombre de tours','')}
   <label class="tb-fin"><input type="checkbox" id="tb-fin" ${c.fin?'checked':''}> ♾️ Sans fin (tourne jusqu'à « Arrêt »)</label>
   <p class="muted" id="tb-tot" style="margin:12px 0 0"></p></div>
  <div class="card nopli"><h2>Réglages tout prêts</h2><div class="tb-pr">${TB_PRESETS.map((x,i)=>`<button data-pr="${i}">${x.t}</button>`).join('')}</div>
   <p class="muted" style="margin:10px 0 0">8 tours. Tu peux ensuite changer chaque réglage.</p></div>
  <button class="tb-go" id="tb-go">▶️ Démarrer</button>`;
  const $=id=>document.getElementById(id);
  const lireCase=k=>{const v=Math.round(parseFloat(String($('tb-'+k).value).replace(',','.')));return isNaN(v)?null:Math.min(B[k][1],Math.max(B[k][0],v))};
  const maj=()=>{
    $('tb-k').disabled=c.fin;
    const tot=c.p+c.k*c.w+Math.max(0,c.k-1)*c.r;
    $('tb-tot').textContent=c.fin?`Sans fin : ${tbTxt(c.w)} de travail, ${tbTxt(c.r)} de repos, jusqu'à ce que tu touches « Arrêt ».`:`Durée totale : ${tbTxt(tot)} (préparation comprise).`;
    tbEcrire(c)};
  ['w','r','p','k'].forEach(k=>{const inp=$('tb-'+k);
    inp.oninput=()=>{const v=lireCase(k);if(v!=null){c[k]=v;maj()}};
    inp.onblur=()=>{inp.value=c[k]}});
  app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m,[mi,ma,pas]=B[k];if(k==='k'&&c.fin)return;
    let v=c[k]+(+b.dataset.d)*pas; if(+b.dataset.d>0&&c[k]%pas)v=Math.ceil(c[k]/pas)*pas; if(+b.dataset.d<0&&c[k]%pas)v=Math.floor(c[k]/pas)*pas;
    c[k]=Math.min(ma,Math.max(mi,v));$('tb-'+k).value=c[k];maj()});
  $('tb-fin').onchange=e=>{c.fin=e.target.checked;maj()};
  app.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>{const x=TB_PRESETS[+b.dataset.pr];c.w=x.w;c.r=x.r;c.k=x.k;c.fin=false;$('tb-fin').checked=false;['w','r','k'].forEach(k=>$('tb-'+k).value=c[k]);maj()});
  $('bk').onclick=retour;
  $('tb-go').onclick=()=>{['w','r','p','k'].forEach(k=>{const v=lireCase(k);if(v!=null)c[k]=v});maj();tbAudioPret();tabataLancer(Object.assign({},c),()=>tabataEcran(retour,tag))};
  maj();
  window.scrollTo(0,0);
}
// Où en est-on après « ecoule » secondes ? → {t:'p'|'w'|'r', reste, tour, fini, n (numéro d'étape)}
function tbPhase(c,ecoule){
  if(c.p&&ecoule<c.p)return {t:'p',reste:c.p-ecoule,tour:0,n:0};
  let x=ecoule-(c.p||0);
  const cyc=c.w+c.r;
  if(c.fin){
    const i=Math.floor(x/cyc), y=x-i*cyc;
    return y<c.w?{t:'w',reste:c.w-y,tour:i+1,n:1+2*i}:{t:'r',reste:cyc-y,tour:i+1,n:2+2*i};
  }
  for(let i=1;i<=c.k;i++){
    if(x<c.w)return {t:'w',reste:c.w-x,tour:i,n:2*i-1};
    x-=c.w;
    if(i<c.k&&c.r){if(x<c.r)return {t:'r',reste:c.r-x,tour:i,n:2*i};x-=c.r}
  }
  return {fini:true,tour:c.k,n:2*c.k+1};
}
function tabataLancer(c,fin){
  if(!c.r)c.r=0;
  const tot=c.fin?null:c.p+c.k*c.w+Math.max(0,c.k-1)*c.r;
  const box=document.createElement('div');box.className='tb-run tb-p';document.body.appendChild(box);
  let debut=performance.now(), pauseAt=null, decal=0, fini=false, verrou=null, minut=null, avantN=-1, avantS=null;
  const garderAllume=()=>{try{if(navigator.wakeLock&&!verrou)navigator.wakeLock.request('screen').then(l=>{verrou=l;l.addEventListener('release',()=>{verrou=null})}).catch(()=>{})}catch(e){}};
  const lacher=()=>{try{if(verrou)verrou.release()}catch(e){}verrou=null};
  garderAllume();
  try{if(box.requestFullscreen)box.requestFullscreen().catch(()=>{})}catch(e){}
  const NOM={p:'Préparation',w:'Travail',r:'Repos'};
  box.innerHTML=`<div class="tb-ph" id="tb-ph"></div><div class="tb-big" id="tb-big"></div><div class="tb-inf" id="tb-inf"></div><div class="tb-rest" id="tb-rest"></div>
   <div class="tb-bt"><button id="tb-pause">⏸️ Pause</button><button id="tb-stop">⏹️ Arrêt</button></div>
   <div class="tb-nav" id="tb-nav"><button id="tb-prev" aria-label="Étape précédente">⏮️</button><button id="tb-m10" aria-label="Enlever 10 secondes">−10 s</button><button id="tb-p10" aria-label="Ajouter 10 secondes">+10 s</button><button id="tb-next" aria-label="Étape suivante">⏭️</button></div>`;
  const $=id=>document.getElementById(id);
  const quitter=()=>{fini=true;clearInterval(minut);lacher();try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}box.remove();document.removeEventListener('visibilitychange',vis);fin()};
  const vis=()=>{if(document.visibilityState==='visible'&&!fini)garderAllume()};
  document.addEventListener('visibilitychange',vis);
  $('tb-stop').onclick=()=>{if(box.classList.contains('tb-f')||confirm('Arrêter le minuteur ?'))quitter()};
  $('tb-pause').onclick=()=>{
    tbAudioPret();
    if(box.classList.contains('tb-f'))return quitter();
    if(pauseAt){decal+=performance.now()-pauseAt;pauseAt=null;$('tb-pause').textContent='⏸️ Pause'}
    else{pauseAt=performance.now();$('tb-pause').textContent='▶️ Reprendre'}
    tick()};
  // 30/10 : avancer / reculer (fonctionne aussi en pause)
  const DUR=t=>t==='p'?(c.p||0):t==='w'?c.w:c.r;
  const ec=()=>((pauseAt||performance.now())-debut-decal)/1000;
  const aller=t=>{decal=(pauseAt||performance.now())-debut-Math.max(0,t)*1000;tick()};
  $('tb-next').onclick=()=>{tbAudioPret();const e=ec(),P=tbPhase(c,e);if(P.fini)return;aller(e+P.reste+0.001)};
  $('tb-prev').onclick=()=>{tbAudioPret();const e=ec(),P=tbPhase(c,e);if(P.fini)return;
    const dans=DUR(P.t)-P.reste, cur=e-dans;
    if(dans>2||cur<=0.01)return aller(cur+0.001);
    const Q=tbPhase(c,cur-0.01);aller(cur-0.01-(DUR(Q.t)-Q.reste)+0.001)};
  $('tb-m10').onclick=()=>{tbAudioPret();const e=ec(),P=tbPhase(c,e);if(P.fini)return;aller(e+Math.min(10,Math.max(0,P.reste-0.05)))};
  $('tb-p10').onclick=()=>{tbAudioPret();const e=ec(),P=tbPhase(c,e);if(P.fini)return;aller(e-Math.min(10,DUR(P.t)-P.reste))};
  const tick=()=>{
    if(fini)return;
    const now=pauseAt||performance.now(), ecoule=(now-debut-decal)/1000, P=tbPhase(c,ecoule);
    if(P.fini){
      if(!box.classList.contains('tb-f')){tbBipFin();lacher()}
      box.className='tb-run tb-f';$('tb-ph').textContent='🎉 Terminé !';$('tb-big').textContent='0:00';$('tb-inf').textContent=`${c.k} tour${c.k>1?'s':''} · bravo !`;$('tb-rest').textContent='';$('tb-pause').textContent='✅ Fermer';$('tb-stop').style.display='none';$('tb-nav').style.display='none';clearInterval(minut);return}
    const sec=Math.ceil(P.reste);
    if(!pauseAt){
      if(avantN>=0&&P.n!==avantN){if(P.t==='w')tbSonTravail();else if(P.t==='r')tbSonPause();else tbBipChangement()}
      else if(avantS!=null&&sec!==avantS&&sec<=3&&sec>=1)tbBipCourt();
    }
    avantN=P.n;avantS=sec;
    box.className='tb-run tb-'+P.t;
    $('tb-ph').textContent=(pauseAt?'⏸️ ':'')+NOM[P.t];
    $('tb-big').textContent=tbMmss(P.reste);
    $('tb-inf').textContent=P.t==='p'?(c.fin?`Sans fin · ${tbTxt(c.w)} / ${tbTxt(c.r)}`:`${c.k} tours · ${tbTxt(c.w)} / ${tbTxt(c.r)}`):(c.fin?`Tour ${P.tour}`:`Tour ${P.tour} / ${c.k}`);
    $('tb-rest').textContent=pauseAt?'En pause':(c.fin?'Sans fin : touche « Arrêt » pour finir':`Temps total restant : ${tbMmss(tot-ecoule)}`);
  };
  tick();
  minut=setInterval(tick,100);
  // au départ : bip si on commence par la préparation (elle finira par le buzzer), sinon le buzzer du travail
  if(c.p)tbBipChangement();else tbSonTravail();
}
