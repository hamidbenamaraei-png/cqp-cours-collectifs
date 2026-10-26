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
// ---- forme de la musique (barres) et BPM : calculés une fois, gardés avec la musique ----
const MU_INFO={}; const MU_NB=90;
async function muAnalyser(blob){
  const buf=await blob.arrayBuffer(); const R=11025;
  const oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,R,R);
  const ab=await new Promise((ok,ko)=>{const r=oc.decodeAudioData(buf,ok,ko);if(r&&r.then)r.then(ok,ko)});
  const n=ab.length,ch=[];for(let c=0;c<ab.numberOfChannels;c++)ch.push(ab.getChannelData(c));
  const mono=i=>{let v=0;for(const d of ch)v+=d[i];return v/ch.length};
  // barres : niveau moyen par morceau de musique
  const peaks=[];const pas=Math.floor(n/MU_NB)||1;
  for(let b=0;b<MU_NB;b++){let e=0,k=0;for(let i=b*pas;i<Math.min(n,(b+1)*pas);i+=16){const v=mono(i);e+=v*v;k++}peaks.push(Math.sqrt(e/(k||1)))}
  const mx=Math.max(...peaks)||1;
  // BPM : énergie toutes les 128 échantillons, montées d'énergie, puis la période qui se répète le plus (85 à 175 BPM)
  const H=128,fps=ab.sampleRate/H,E=[];for(let i=0;i+H<n;i+=H){let e=0;for(let j=i;j<i+H;j+=2){const v=mono(j);e+=v*v}E.push(e)}
  const O=E.map((e,i)=>i?Math.max(0,e-E[i-1]):0);const m=O.reduce((a,b)=>a+b,0)/(O.length||1);for(let i=0;i<O.length;i++)O[i]=Math.max(0,O[i]-m);
  const lmin=Math.floor(fps*60/175),lmax=Math.ceil(fps*60/85),ac=[];
  for(let l=lmin;l<=lmax;l++){let v=0;for(let i=l;i<O.length;i++)v+=O[i]*O[i-l];ac[l]=v}
  let best=lmin;for(let l=lmin;l<=lmax;l++)if(ac[l]>ac[best])best=l;
  let lb=best;if(best>lmin&&best<lmax){const a=ac[best-1],b=ac[best],c=ac[best+1],d=a-2*b+c;if(d)lb=best+.5*(a-c)/d}
  let bpm=60*fps/lb;
  return {peaks:peaks.map(v=>+(v/mx).toFixed(3)),bpm0:Math.round(bpm*10)/10}}
async function muMaj(id,f){await muOp('readwrite',st=>{const r=st.get(id);r.onsuccess=()=>{const x=r.result;if(x){f(x);st.put(x)}};return r})}
function muVitesse(){const I=MU_INFO[MU_EN];const v=I&&I.bpm0&&I.bpm?I.bpm/I.bpm0:1;muAudio.playbackRate=v;try{muAudio.preservesPitch=true;muAudio.webkitPreservesPitch=true}catch(e){}}
async function muJouer(id,file){
  const x=await muOp('readonly',s=>s.get(id));if(!x)return;
  if(MU_URL)URL.revokeObjectURL(MU_URL);MU_URL=URL.createObjectURL(x.blob);
  MU_EN=id;if(file)MU_FILE=file;MU_INFO[id]={peaks:x.peaks||null,bpm0:x.bpmMan||x.bpm0||null,bpmAuto:x.bpm0||null,bpm:x.bpm||null,tbStart:x.tbStart==null?null:x.tbStart};
  muAudio.src=MU_URL;muVitesse();try{await muAudio.play()}catch(e){}
  muBarre();
  if(!x.peaks){try{const a=await muAnalyser(x.blob);await muMaj(id,y=>{y.peaks=a.peaks;y.bpm0=a.bpm0});
    Object.assign(MU_INFO[id],{peaks:a.peaks,bpmAuto:a.bpm0});if(!x.bpmMan)MU_INFO[id].bpm0=a.bpm0;if(MU_EN===id){muVitesse();muBarre()}}catch(e){MU_INFO[id].err=1;if(MU_EN===id)muBarre()}}}
// ---- ⏱️ chrono Tabata : d'après le format (30/10…) et le début marqué une fois par musique ----
const MU_CH='cqpf_mu_chrono';
function muChOn(){try{return localStorage.getItem(MU_CH)!=='0'}catch(e){return true}}
function muFmtWR(x){const m=String(x&&x.fmt||'').match(/^(\d+)\/(\d+)$/);return m?[+m[1],+m[2]]:null}
function muEtat(){const x=MU_LISTE.find(m=>m.id===MU_EN),I=MU_INFO[MU_EN]||{},wr=muFmtWR(x);if(!x||!wr||I.tbStart==null)return null;
  const [w,r]=wr,c=w+r,t=(muAudio.currentTime||0)-I.tbStart,rate=muAudio.playbackRate||1,d=muAudio.duration||0;
  const N=Math.max(1,Math.floor((d-I.tbStart+r)/c));
  if(t<0)return{ph:'p',rest:-t/rate,k:0,N};
  const k=Math.floor(t/c),u=t-k*c;if(k>=N)return{ph:'f',rest:0,k:N,N};
  return u<w?{ph:'w',rest:(w-u)/rate,k:k+1,N}:{ph:'r',rest:(c-u)/rate,k:k+1,N}}
const MU_PH={p:['⏳ PRÉPARE-TOI','#2c365c'],w:['💪 EFFORT','#1f7a4d'],r:['😮‍💨 REPOS','#9b2c35'],f:['🎉 TERMINÉ','#2c365c']};
function muChronoHtml(x){const wr=muFmtWR(x);if(!wr)return '';const I=MU_INFO[MU_EN]||{},on=muChOn();
  return `<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">
   <div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><b style="font-size:17px">⏱️ Chrono ${wr[0]}/${wr[1]}</b><button class="btn small ${on?'':'sec'}" style="margin:0" id="mu-chon">${on?'Activé':'Désactivé'}</button></div>
   ${!on?'':I.tbStart==null?`<p class="muted" style="font-size:14px;margin:8px 0 0">Touche ce bouton au moment exact où le premier effort commence (une seule fois pour cette musique).</p><button class="btn" id="mu-deb">⏱️ Le Tabata commence ici</button>`
   :`<div id="mu-ch" style="margin-top:10px;border-radius:14px;padding:12px;text-align:center;color:#fff"><div id="mu-chp" style="font-size:20px;font-weight:900;letter-spacing:1px"></div><div id="mu-chs" style="font-size:56px;font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums"></div><div id="mu-cht" style="font-size:16px;font-weight:700;opacity:.9"></div></div>
     <div style="display:flex;gap:8px;margin-top:8px"><button class="btn small" style="margin:0;flex:1" id="mu-plein">⛶ Plein écran</button><button class="btn small sec" style="margin:0" id="mu-rec">Recaler le début</button></div>`}</div>`}
function muChrono(){const e=muEtat();const T=(z,id)=>{const el=document.getElementById(id);return el};
  for(const pre of ['mu-','mu-g']){const box=document.getElementById(pre+'ch');if(!box)continue;
    if(!e){box.style.display='none';continue}box.style.display=pre==='mu-g'?'flex':'';const [txt,col]=MU_PH[e.ph];box.style.background=col;
    document.getElementById(pre+'chp').textContent=(muAudio.paused&&e.ph!=='f'?'⏸️ ':'')+txt;
    document.getElementById(pre+'chs').textContent=e.ph==='f'?'0:00':muTemps(Math.ceil(e.rest));
    document.getElementById(pre+'cht').textContent=e.ph==='p'?`${e.N} tours`:`Tour ${Math.min(e.k,e.N)} / ${e.N}`}}
function muChronoBranche(x){const on=document.getElementById('mu-chon');if(!on)return;
  on.onclick=()=>{try{localStorage.setItem(MU_CH,muChOn()?'0':'1')}catch(e){}muBarre()};
  const deb=document.getElementById('mu-deb');if(deb)deb.onclick=async()=>{const id=MU_EN,t=+(muAudio.currentTime||0).toFixed(2);MU_INFO[id].tbStart=t;await muMaj(id,y=>{y.tbStart=t});muBarre()};
  const rec=document.getElementById('mu-rec');if(rec)rec.onclick=async()=>{const id=MU_EN;MU_INFO[id].tbStart=null;await muMaj(id,y=>{delete y.tbStart});muBarre()};
  const pl=document.getElementById('mu-plein');if(pl)pl.onclick=()=>{const g=document.createElement('div');g.id='mu-gros';
    g.style.cssText='position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center';
    g.innerHTML=`<div id="mu-gch" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff"><div id="mu-gchp" style="font-size:9vw;font-weight:900;letter-spacing:2px"></div><div id="mu-gchs" style="font-size:38vw;font-weight:900;line-height:1;font-variant-numeric:tabular-nums"></div><div id="mu-gcht" style="font-size:7vw;font-weight:800;opacity:.9"></div></div>
      <div style="position:absolute;bottom:24px;left:0;right:0;display:flex;gap:10px;justify-content:center"><button class="btn sec" style="margin:0;width:auto;padding:14px 22px" id="mu-gpp">⏯️</button><button class="btn sec" style="margin:0;width:auto;padding:14px 22px" id="mu-gx">✕ Fermer</button></div>`;
    document.body.appendChild(g);try{g.requestFullscreen&&g.requestFullscreen().catch(()=>{})}catch(e){}
    document.getElementById('mu-gpp').onclick=()=>{muAudio.paused?muAudio.play().catch(()=>{}):muAudio.pause()};
    document.getElementById('mu-gx').onclick=()=>{try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}g.remove()};muChrono()};
  muChrono()}
function muSuivante(d){const i=MU_FILE.indexOf(MU_EN);const j=i+d;if(i<0||j<0||j>=MU_FILE.length){muBarre();return}muJouer(MU_FILE[j])}
muAudio.addEventListener('ended',()=>muSuivante(1));
let muGlisse=false;
function muAvance(){const w=document.getElementById('mu-onde');const d=muAudio.duration||0,t=muAudio.currentTime||0,f=d?t/d:0;
  if(w&&!muGlisse){const R=w.querySelectorAll('rect');const k=Math.floor(f*R.length);R.forEach((r,i)=>r.setAttribute('fill',i<k?'#f08a4b':'#3d4870'));const c=w.querySelector('line');if(c){c.setAttribute('x1',f*320);c.setAttribute('x2',f*320)}}
  const a=document.getElementById('mu-t0'),b=document.getElementById('mu-t1');if(a&&!muGlisse)a.textContent=muTemps(t);if(b)b.textContent=muTemps(d)}
muAudio.addEventListener('timeupdate',muAvance);setInterval(()=>{if(!muAudio.paused)muChrono()},200);
muAudio.addEventListener('play',()=>{muBarre();muChrono()});muAudio.addEventListener('pause',()=>{muBarre();muChrono()});
function muTemps(s){s=Math.floor(s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function muBarre(){const b=document.getElementById('mu-lect');if(!b)return;const x=MU_LISTE.find(m=>m.id===MU_EN);
  if(!x){b.innerHTML='<p class="muted" style="margin:0">Touche une musique pour la lancer.</p>';return}
  const I=MU_INFO[MU_EN]||{};const P=I.peaks;
  const onde=P?`<svg id="mu-onde" viewBox="0 0 320 68" style="width:100%;display:block;touch-action:none;cursor:pointer">${P.map((v,i)=>{const h=Math.max(5,v*62);return `<rect x="${(i*320/P.length).toFixed(1)}" y="${((68-h)/2).toFixed(1)}" width="${(320/P.length-1.2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="#3d4870"/>`}).join('')}<line x1="0" y1="0" x2="0" y2="68" stroke="#fff" stroke-width="2"/></svg>`
    :`<div class="muted" style="font-size:14px;padding:22px 0;text-align:center">${I.err?'Forme de la musique indisponible':'Analyse de la musique…'}</div>`;
  const b0=I.bpm0,bp=I.bpm||b0;
  b.innerHTML=`<div class="tag">▶️ En cours · ${esc(x.cat)}${muEstTb(x.cat)?' '+esc(x.fmt||''):''}</div><h2 style="margin:4px 0 8px">${esc(x.nom)}</h2>
   <div style="background:#141a33;border-radius:12px;padding:8px">${onde}</div>
   <div class="muted" style="font-size:14px;margin-top:4px;display:flex;justify-content:space-between"><span id="mu-t0">0:00</span><span id="mu-t1">0:00</span></div>
   <div style="display:flex;gap:8px;margin-top:8px"><button class="btn sec" style="margin:0" id="mu-pr">⏮️</button><button class="btn" style="margin:0" id="mu-pp">${muAudio.paused?'▶️ Lecture':'⏸️ Pause'}</button><button class="btn sec" style="margin:0" id="mu-su">⏭️</button></div>
   ${muChronoHtml(x)}
   <div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap"><b style="font-size:17px">🥁 Tempo</b><span class="muted" style="font-size:14px" id="mu-b0">${b0?`BPM d'origine : ≈ ${Math.round(b0)} <button class="link" id="mu-cor" style="padding:0">corriger</button>`:(I.err?'BPM inconnu <button class="link" id="mu-cor" style="padding:0">l\'écrire</button>':'Calcul du BPM…')}</span></div>
    ${b0?`<div style="display:flex;align-items:center;gap:10px;margin-top:10px"><button class="btn sec" style="margin:0;width:64px;font-size:26px" id="mu-bm" aria-label="Moins vite">−</button>
     <div style="flex:1;text-align:center"><div style="font-size:34px;font-weight:900">${Math.round(bp)}</div><div class="muted" style="font-size:13px">BPM${Math.round(bp)!==Math.round(b0)?' · '+(bp>b0?'+':'')+Math.round((bp/b0-1)*100)+' %':' · d\'origine'}</div></div>
     <button class="btn sec" style="margin:0;width:64px;font-size:26px" id="mu-bp" aria-label="Plus vite">+</button></div>
     ${Math.round(bp)!==Math.round(b0)?`<button class="btn small sec" style="margin-top:10px" id="mu-br">↩️ Revenir à ${Math.round(b0)} BPM</button>`:''}
     <p class="muted" style="font-size:13px;margin:8px 0 0">💾 Ce tempo est gardé pour cette musique.</p>`:''}</div>`;
  document.getElementById('mu-pp').onclick=()=>{muAudio.paused?muAudio.play().catch(()=>{}):muAudio.pause()};
  document.getElementById('mu-pr').onclick=()=>{if(muAudio.currentTime>3)muAudio.currentTime=0;else muSuivante(-1)};
  document.getElementById('mu-su').onclick=()=>muSuivante(1);
  // toucher ou glisser sur la forme : aller à cet endroit
  const w=document.getElementById('mu-onde');
  if(w){const ou=e=>{const r=w.getBoundingClientRect();return Math.min(1,Math.max(0,(e.clientX-r.left)/r.width))};
    const voir=f=>{const R=w.querySelectorAll('rect'),k=Math.floor(f*R.length);R.forEach((r,i)=>r.setAttribute('fill',i<k?'#f08a4b':'#3d4870'));const c=w.querySelector('line');c.setAttribute('x1',f*320);c.setAttribute('x2',f*320);const a=document.getElementById('mu-t0');if(a)a.textContent=muTemps(f*(muAudio.duration||0))};
    w.onpointerdown=e=>{muGlisse=true;try{w.setPointerCapture(e.pointerId)}catch(_){}voir(ou(e))};
    w.onpointermove=e=>{if(muGlisse)voir(ou(e))};
    w.onpointerup=w.onpointercancel=e=>{if(!muGlisse)return;muGlisse=false;const f=ou(e);if(muAudio.duration)muAudio.currentTime=f*muAudio.duration;muAvance()}}
  muAvance();muChronoBranche(x);
  const regler=async v=>{const I=MU_INFO[MU_EN];if(!I||!I.bpm0)return;v=Math.round(Math.min(I.bpm0*4,Math.max(I.bpm0*.25,v)));I.bpm=v;muVitesse();const id=MU_EN;await muMaj(id,y=>{y.bpm=v});muBarre()};
  const bm=document.getElementById('mu-bm'),bpb=document.getElementById('mu-bp'),br=document.getElementById('mu-br'),cor=document.getElementById('mu-cor');
  if(bm)bm.onclick=()=>regler(Math.round(MU_INFO[MU_EN].bpm||MU_INFO[MU_EN].bpm0)-2);
  if(bpb)bpb.onclick=()=>regler(Math.round(MU_INFO[MU_EN].bpm||MU_INFO[MU_EN].bpm0)+2);
  if(br)br.onclick=async()=>{const I=MU_INFO[MU_EN];I.bpm=null;muVitesse();const id=MU_EN;await muMaj(id,y=>{delete y.bpm});muBarre()};
  if(cor)cor.onclick=()=>{const z=document.getElementById('mu-b0');const I=MU_INFO[MU_EN];
    z.innerHTML=`<input type="number" inputmode="numeric" min="40" max="220" placeholder="BPM" value="${I.bpm0?Math.round(I.bpm0):''}" style="width:80px;padding:6px;border-radius:8px"> <button class="btn small" style="margin:0" id="mu-cok">OK</button>`;
    const i=z.querySelector('input');i.focus();
    const ok=async()=>{const v=+i.value;if(!(v>=40&&v<=220))return muBarre();const r=I.bpm&&I.bpm0?I.bpm/I.bpm0:1;I.bpm0=v;I.bpm=r!==1?Math.round(v*r):null;muVitesse();const id=MU_EN;await muMaj(id,y=>{y.bpmMan=v;if(I.bpm)y.bpm=I.bpm;else delete y.bpm});muBarre()};
    document.getElementById('mu-cok').onclick=ok;i.onkeydown=e=>{if(e.key==='Enter')ok()}}}
async function mesMusiques(msg,garder){
  const pos=garder?window.scrollY:0, ouverts=garder?[...app.querySelectorAll('details[data-f][open]')].map(d=>d.dataset.f):[];
  app.innerHTML='<p class="muted">Chargement…</p>';
  try{await muCharger()}catch(e){app.innerHTML=`<button class="back" id="bk">← Retour</button><div class="err">⚠️ Ce navigateur ne peut pas garder de musiques.</div>`;document.getElementById('bk').onclick=accueil;return}
  try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
  const C=muCats().filter(c=>c!=='Échauffement'||MU_LISTE.some(m=>m.cat===c));MU_LISTE.forEach(m=>{if(!C.includes(m.cat))C.push(m.cat)});
  const tbL=MU_LISTE.filter(m=>muEstTb(m.cat)), tbF=muFmts(tbL);
  // choix « déplacer vers » : les formats Tabata à la place de « Tabata »
  const dest=[];C.forEach(c=>{if(muEstTb(c)){(tbF.length?tbF:['']).forEach(f=>dest.push([c+'|'+f,muFmtNom(f)]));if(!tbF.includes(''))dest.push([c+'|','Tabata – autres'])}else dest.push([c+'|',c])});
  const ligne=(m,liste)=>`<div data-li="${m.id}" style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)"><button class="btn sec" style="margin:0;text-align:left;width:100%;font-size:16px;padding:12px;word-break:break-word" data-j="${m.id}" data-l="${liste}">${MU_EN===m.id?'🔊':'▶️'} ${esc(m.nom)}</button>
        <div style="display:flex;align-items:center;gap:6px;margin-top:6px"><select data-dep="${m.id}" aria-label="Changer de catégorie" style="flex:1 1 auto;width:auto;min-width:0;padding:10px;border-radius:10px;font-size:15px">${dest.map(([v,t])=>`<option value="${esc(v)}"${v===m.cat+'|'+(muEstTb(m.cat)?m.fmt||'':'')?' selected':''}>${esc(t)}</option>`).join('')}</select>
        <button class="btn small sec" style="margin:0;flex:none;width:auto;min-width:48px" data-renm="${m.id}" aria-label="Renommer">✏️</button>
        <button class="btn small ko" style="margin:0;flex:none;width:auto;min-width:48px" data-sup="${m.id}" aria-label="Supprimer">🗑️</button></div></div>`;
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
  // ✏️ renommer une musique dans la page (le format Tabata est relu dans le nouveau nom)
  // ✏️ renommer : case vide (ancien nom en dessous) ; pour le Tabata, boutons de format
  app.querySelectorAll('[data-renm]').forEach(b=>b.onclick=()=>{const m=MU_LISTE.find(x=>x.id===b.dataset.renm);if(!m)return;
    const bloc=app.querySelector(`[data-li="${m.id}"]`);if(!bloc)return;const tb=muEstTb(m.cat);let fmt=m.fmt||'';
    const F=[...new Set(['20/10','30/10','40/20','45/15',...tbF.filter(Boolean)])].sort((a,b)=>(+a.split('/')[0]-+b.split('/')[0])||(+a.split('/')[1]-+b.split('/')[1]));
    bloc.innerHTML=`<input type="text" placeholder="Nouveau nom" style="width:100%;padding:12px;border-radius:10px;font-size:16px" aria-label="Nouveau nom">
      <div class="muted" style="font-size:13px;margin-top:4px;word-break:break-word">Ancien nom : ${esc(m.nom)}</div>
      ${tb?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${[...F,''].map(f=>`<button class="btn small ${f===fmt?'':'sec'}" style="margin:0" data-fx="${f}">${f||'autre'}</button>`).join('')}</div>`:''}
      <div style="display:flex;gap:6px;margin-top:8px"><button class="btn small" style="margin:0;flex:1" data-ok>✅ OK</button><button class="btn small sec" style="margin:0" data-no>Annuler</button></div>`;
    const i=bloc.querySelector('input');i.focus();
    bloc.querySelectorAll('[data-fx]').forEach(x=>x.onclick=()=>{fmt=x.dataset.fx;bloc.querySelectorAll('[data-fx]').forEach(y=>y.classList.toggle('sec',y.dataset.fx!==fmt))});
    const ok=async()=>{const t=i.value.trim()||m.nom;const f2=tb?(fmt!==(m.fmt||'')?fmt:(muFormat(t)||fmt)):'';
      await muOp('readwrite',st=>{const r=st.get(m.id);r.onsuccess=()=>{const x=r.result;if(x){x.nom=t;if(tb)x.fmt=f2;st.put(x)}};return r});mesMusiques('',1)};
    bloc.querySelector('[data-ok]').onclick=ok;bloc.querySelector('[data-no]').onclick=()=>mesMusiques('',1);i.onkeydown=e=>{if(e.key==='Enter')ok()}});
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
