// ======= ⏱️ Tabata : minuteur travail / repos / tours (sans son pour l'instant) =======
// Chargé par l'espace formateur et l'espace stagiaires. Réglages gardés sur le téléphone.
const TB_PRESETS=[{t:'Tabata 20 / 10 × 8',w:20,r:10,k:8},{t:'30 / 30 × 8',w:30,r:30,k:8},{t:'40 / 20 × 8',w:40,r:20,k:8}];
const TB_CLE='tabata_reglages';
function tbLire(){try{return Object.assign({w:20,r:10,k:8,p:10},JSON.parse(localStorage.getItem(TB_CLE)||'{}'))}catch(e){return {w:20,r:10,k:8,p:10}}}
function tbEcrire(c){try{localStorage.setItem(TB_CLE,JSON.stringify(c))}catch(e){}}
function tbTxt(s){s=Math.max(0,Math.round(s));const m=Math.floor(s/60),x=s%60;return m?`${m} min${x?' '+String(x).padStart(2,'0')+' s':''}`:`${x} s`}
function tbMmss(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
(function(){const st=document.createElement('style');st.textContent=`
.tb-reg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid var(--line)}
.tb-reg:last-child{border-bottom:0}
.tb-reg b{font-size:17px}
.tb-st{display:flex;align-items:center;gap:8px}
.tb-st button{width:46px;height:46px;border-radius:12px;border:0;background:var(--line);color:#fff;font-size:24px;font-weight:800;cursor:pointer;font-family:inherit}
.tb-st span{min-width:84px;text-align:center;font-size:20px;font-weight:800}
.tb-run{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center;color:#fff;background:#10162b;transition:background .3s}
.tb-run.tb-w{background:#1f7a4d}.tb-run.tb-r{background:#9b2c35}.tb-run.tb-p{background:#2c365c}.tb-run.tb-f{background:#10162b}
.tb-ph{font-size:28px;font-weight:900;letter-spacing:2px;text-transform:uppercase}
.tb-big{font-size:min(38vw,240px);font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.tb-inf{font-size:20px;font-weight:700;opacity:.9}
.tb-bt{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;justify-content:center}
.tb-bt button{min-width:140px;padding:14px 18px;border-radius:14px;border:0;font-size:18px;font-weight:800;cursor:pointer;font-family:inherit;background:rgba(255,255,255,.18);color:#fff}
`;document.head.appendChild(st)})();
function tabataEcran(retour,tag){
  const c=tbLire();
  const total=()=>c.p+c.k*c.w+Math.max(0,c.k-1)*c.r;
  const ligne=(k,t,min,max,pas,fmt)=>`<div class="tb-reg"><b>${t}</b><div class="tb-st"><button data-m="${k}" data-d="-${pas}" aria-label="Moins">−</button><span id="tb-${k}">${fmt(c[k])}</span><button data-m="${k}" data-d="${pas}" aria-label="Plus">+</button></div></div>`;
  const B={w:[5,300,5],r:[0,300,5],k:[1,20,1],p:[0,30,5]}, F={w:tbTxt,r:tbTxt,k:v=>v,p:tbTxt};
  app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="tag">${tag||''}</div><h1>⏱️ Tabata</h1>
  <div class="card o"><h2>Réglages</h2>
   ${ligne('w','💪 Travail',...B.w,F.w)}${ligne('r','😮‍💨 Repos',...B.r,F.r)}${ligne('k','🔁 Tours',...B.k,F.k)}${ligne('p','⏳ Préparation',...B.p,F.p)}
   <p class="muted" id="tb-tot" style="margin:10px 0 0"></p></div>
  <div class="card"><h2>Raccourcis</h2><div style="display:flex;flex-wrap:wrap;gap:8px">${TB_PRESETS.map((x,i)=>`<button class="btn small sec" style="margin:0" data-pr="${i}">${x.t}</button>`).join('')}</div></div>
  <button class="btn" id="tb-go">▶️ Démarrer</button>`;
  const maj=()=>{Object.keys(B).forEach(k=>document.getElementById('tb-'+k).textContent=F[k](c[k]));document.getElementById('tb-tot').textContent=`Durée totale : ${tbTxt(total())} (préparation comprise).`;tbEcrire(c)};
  maj();
  app.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m,[mi,ma]=B[k];c[k]=Math.min(ma,Math.max(mi,c[k]+ +b.dataset.d));maj()});
  app.querySelectorAll('[data-pr]').forEach(b=>b.onclick=()=>{const x=TB_PRESETS[+b.dataset.pr];c.w=x.w;c.r=x.r;c.k=x.k;maj()});
  document.getElementById('bk').onclick=retour;
  document.getElementById('tb-go').onclick=()=>tabataLancer(Object.assign({},c),()=>tabataEcran(retour,tag));
  window.scrollTo(0,0);
}
function tabataLancer(c,fin){
  // la suite des étapes : préparation, puis travail / repos × tours (pas de repos après le dernier tour)
  const E=[];if(c.p)E.push({t:'p',d:c.p});
  for(let i=1;i<=c.k;i++){E.push({t:'w',d:c.w,i});if(i<c.k&&c.r)E.push({t:'r',d:c.r,i})}
  const tot=E.reduce((a,e)=>a+e.d,0);
  const box=document.createElement('div');box.className='tb-run tb-p';document.body.appendChild(box);
  let n=0, debut=performance.now(), pauseAt=null, decal=0, fini=false, verrou=null;
  try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>verrou=l).catch(()=>{})}catch(e){}
  const NOM={p:'Prépare-toi',w:'Travail',r:'Repos'};
  box.innerHTML=`<div class="tb-ph" id="tb-ph"></div><div class="tb-big" id="tb-big"></div><div class="tb-inf" id="tb-inf"></div><div class="tb-inf" id="tb-rest" style="font-size:16px;opacity:.75"></div>
   <div class="tb-bt"><button id="tb-pause">⏸️ Pause</button><button id="tb-stop">⏹️ Arrêter</button></div>`;
  const $=id=>document.getElementById(id);
  const quitter=()=>{fini=true;try{if(verrou)verrou.release()}catch(e){}box.remove();document.removeEventListener('visibilitychange',vis);fin()};
  const vis=()=>{if(document.visibilityState==='visible'&&!fini&&!pauseAt&&navigator.wakeLock&&!verrou)navigator.wakeLock.request('screen').then(l=>verrou=l).catch(()=>{})};
  document.addEventListener('visibilitychange',vis);
  $('tb-stop').onclick=()=>{if(n>=E.length||confirm('Arrêter le Tabata ?'))quitter()};
  $('tb-pause').onclick=()=>{
    if(n>=E.length)return quitter();
    if(pauseAt){decal+=performance.now()-pauseAt;pauseAt=null;$('tb-pause').textContent='⏸️ Pause'}
    else{pauseAt=performance.now();$('tb-pause').textContent='▶️ Reprendre'}};
  const tick=()=>{
    if(fini)return;
    const now=pauseAt||performance.now();
    let ecoule=(now-debut-decal)/1000, cumul=0; n=0;
    while(n<E.length&&ecoule>=cumul+E[n].d){cumul+=E[n].d;n++}
    if(n>=E.length){box.className='tb-run tb-f';$('tb-ph').textContent='🎉 Terminé !';$('tb-big').textContent='0:00';$('tb-inf').textContent=`${c.k} tour${c.k>1?'s':''} · bravo !`;$('tb-rest').textContent='';$('tb-pause').textContent='✅ Fermer';$('tb-stop').style.display='none';try{if(verrou)verrou.release()}catch(e){}return}
    const e=E[n], reste=e.d-(ecoule-cumul);
    box.className='tb-run tb-'+e.t;
    $('tb-ph').textContent=(pauseAt?'⏸️ ':'')+NOM[e.t];
    $('tb-big').textContent=tbMmss(reste);
    $('tb-inf').textContent=e.t==='p'?`${c.k} tours · ${tbTxt(c.w)} / ${tbTxt(c.r)}`:`Tour ${e.i} / ${c.k}`;
    $('tb-rest').textContent=`Temps total restant : ${tbMmss(tot-ecoule)}`;
    requestAnimationFrame(tick);
  };
  tick();
}
