// ======= 🧍 Bonshommes en 3D (vus de trois quarts) pour les fiches de renfo : moteur + positions =======
// ======= Bonshommes vus de trois quarts (3D) : x = devant, y = haut, z = côté droit =======
const B3C={OR:'#f08a4b',BL:'#6b78b0',SOL:'#3a4466',TAP:'#e9ecf5',MET:'#4a5274',GR:'#9aa1bd',EL:'#3fa66a',BAL:'#e8b04a',BOX:'#dfe2ee',BOX2:'#c9cde0',BOXS:'#7a83a6'};
const b3a=(p,q)=>[p[0]+q[0],p[1]+q[1],p[2]+q[2]],b3s=(p,q)=>[p[0]-q[0],p[1]-q[1],p[2]-q[2]],b3m=(p,k)=>[p[0]*k,p[1]*k,p[2]*k],
 b3d=(p,q)=>p[0]*q[0]+p[1]*q[1]+p[2]*q[2],b3l=p=>Math.sqrt(b3d(p,p)),b3n=p=>{const l=b3l(p)||1;return b3m(p,1/l)},
 b3x=(p,q)=>[p[1]*q[2]-p[2]*q[1],p[2]*q[0]-p[0]*q[2],p[0]*q[1]-p[1]*q[0]],b3mz=p=>p&&[p[0],p[1],-p[2]];
function b3ik(A,T,l1,l2,H){const u=b3n(b3s(T,A));let d=b3l(b3s(T,A));d=Math.min(Math.max(d,Math.abs(l1-l2)+.01),l1+l2-.01);
  const x=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-x*x));let p=b3s(H,b3m(u,b3d(H,u)));if(b3l(p)<1e-6)p=[0,1,0];
  return[b3a(b3a(A,b3m(u,x)),b3m(b3n(p),h)),b3a(A,b3m(u,d))]}
function b3corps(o){
  const P=o.P,dT=b3n(b3s(o.N,P));let S=o.S||[0,0,1];S=b3n(b3s(S,b3m(dT,b3d(S,dT))));const F=b3x(dT,S);
  const N=b3a(P,b3m(dT,44)),ep=b3a(N,b3m(dT,-3));
  const J={P,N,eD:b3a(ep,b3m(S,15)),eG:b3a(ep,b3m(S,-15)),hD:b3a(P,b3m(S,8)),hG:b3a(P,b3m(S,-8))};
  J.tete=b3a(b3a(N,b3m(o.hd?b3n(o.hd):dT,11)),o.hd?[0,0,0]:F);
  const membre=(rac,sp,l1,l2,defH)=>{ if(!sp)return null; if(Array.isArray(sp))sp={r:sp};
    const T=sp.a||(sp.h?b3a(J.tete,sp.h):b3a(rac,sp.r));
    if(sp.j)return[sp.j,T]; if(sp.jh)return[b3a(J.tete,sp.jh),T]; if(sp.je)return[b3a(rac,sp.je),T]; return b3ik(rac,T,l1,l2,sp.k||defH)};
  const mi=sp=>{if(!sp)return sp;if(Array.isArray(sp))return b3mz(sp);const r={};for(const k in sp)r[k]=b3mz(sp[k]);return r};
  const bD=o.mD||o.m, bG=o.mG||(o.mD?null:mi(o.m)), jD=o.pD||o.p, jG=o.pG||(o.pD?null:mi(o.p));
  const hb=b3a(b3m(F,-1),[0,-.6,0]);
  let r;r=membre(J.eD,bD,24,22,hb);if(r){J.cD=r[0];J.mD=r[1]}
  r=membre(J.eG,bG||bD&&mi(bD),24,22,b3mz(hb));if(r){J.cG=r[0];J.mG=r[1]}
  r=membre(J.hD,jD,26,26,F);if(r){J.gD=r[0];J.pD=r[1]}
  r=membre(J.hG,jG||jD&&mi(jD),26,26,F);if(r){J.gG=r[0];J.pG=r[1]}
  return J}
function b3svg(o,lab){
  const J=b3corps(o),V=o.v||{},ya=(V.y??-40)*Math.PI/180,ti=(V.t??18)*Math.PI/180;
  const pr=p=>{const u=p[0]*Math.cos(ya)+p[2]*Math.sin(ya),d=-p[0]*Math.sin(ya)+p[2]*Math.cos(ya);return{u,v:-p[1]*Math.cos(ti)+d*Math.sin(ti),d}};
  const it=[];const L=(pts,c,w,d,cap)=>it.push({k:'l',pts,c,w,d,cap});
  const dep=pts=>pts.reduce((a,p)=>a+pr(p).d,0)/pts.length;
  // le côté le plus proche en orange, l'autre en bleu
  const proche=(a,b)=>pr(a).d>=pr(b).d;
  const bras=[['eD','cD','mD'],['eG','cG','mG']],jambes=[['hD','gD','pD'],['hG','gG','pG']];
  for(const [grp,ra,rb] of [[bras,'eD','eG'],[jambes,'hD','hG']]){const dP=proche(J[ra],J[rb]);
    grp.forEach((g,i)=>{if(!J[g[2]])return;const pts=g.map(k=>J[k]);L(pts,(i===0)===dP?B3C.OR:B3C.BL,7,dep(pts))})}
  L([J.P,J.N],B3C.OR,8,dep([J.P,J.N]));L([J.eD,J.eG],B3C.OR,7,dep([J.eD,J.eG]));L([J.hD,J.hG],B3C.OR,7,dep([J.hD,J.hG]));
  it.push({k:'c',p:J.tete,r:10,f:B3C.OR,d:pr(J.tete).d+.5});
  // accessoires
  const fond=[];const xs=Object.values(J).map(p=>p[0]),zs=Object.values(J).map(p=>p[2]);
  let x0=Math.min(...xs)-16,x1=Math.max(...xs)+16,z0=Math.min(-38,Math.min(...zs)-12),z1=Math.max(38,Math.max(...zs)+12);
  const boite=(a,b,c,e,h,col)=>{const C=(x,y,z)=>[x,y,z];const f=[[C(a,h,c),C(b,h,c),C(b,h,e),C(a,h,e)]];
    if(-Math.sin(ya)>0)f.push([C(b,0,c),C(b,h,c),C(b,h,e),C(b,0,e)]);else f.push([C(a,0,c),C(a,h,c),C(a,h,e),C(a,0,e)]);
    if(Math.cos(ya)>0)f.push([C(a,0,e),C(b,0,e),C(b,h,e),C(a,h,e)]);else f.push([C(a,0,c),C(b,0,c),C(b,h,c),C(a,h,c)]);
    f.forEach((q,i)=>fond.push({k:'p',pts:q,f:i?B3C.BOX2:B3C.BOX,s:B3C.BOXS}))};
  for(const a of o.pr||[]){const t=a[0];
    if(t==='box'){boite(a[1],a[2],a[3],a[4],a[5]);x0=Math.min(x0,a[1]-8);x1=Math.max(x1,a[2]+8)}
    else if(t==='murx'){fond.push({k:'p',pts:[[a[1],0,-40],[a[1],120,-40],[a[1],120,40],[a[1],0,40]],f:B3C.BOX,s:B3C.BOXS});x1=Math.max(x1,a[1])}
    else if(t==='murz'){fond.push({k:'p',pts:[[-30,0,a[1]],[-30,120,a[1]],[40,120,a[1]],[40,0,a[1]]],f:B3C.BOX,s:B3C.BOXS});z0=Math.min(z0,a[1])}
    else if(t==='halt'){const c=a[1]==='mil'?b3m(b3a(J.mD,J.mG),.5):J[a[1]],ax=b3n(a[2]||[0,0,1]);const p1=b3a(c,b3m(ax,-7)),p2=b3a(c,b3m(ax,7));
      L([p1,p2],B3C.MET,4,pr(c).d+1);it.push({k:'c',p:p1,r:5,f:B3C.GR,s:B3C.MET,d:pr(p1).d+1.1});it.push({k:'c',p:p2,r:5,f:B3C.GR,s:B3C.MET,d:pr(p2).d+1.1})}
    else if(t==='barre'){const u=b3n(b3s(J.mD,J.mG)),p1=b3a(J.mG,b3m(u,-14)),p2=b3a(J.mD,b3m(u,14));
      L([p1,p2],B3C.MET,4,Math.max(pr(J.mD).d,pr(J.mG).d)+1);it.push({k:'c',p:p1,r:8,f:B3C.GR,s:B3C.MET,d:pr(p1).d+1});it.push({k:'c',p:p2,r:8,f:B3C.GR,s:B3C.MET,d:pr(p2).d+1})}
    else if(t==='disque'){const c=b3m(b3a(J.mD,J.mG),.5);it.push({k:'c',p:c,r:12,f:B3C.GR,s:B3C.MET,trou:1,d:pr(c).d+2})}
    else if(t==='ballon'){const c=b3a(b3m(b3a(J.pD,J.pG),.5),a[1]||[0,0,0]);it.push({k:'c',p:c,r:10,f:B3C.BAL,s:'#b07c1c',d:pr(c).d+2})}
    else if(t==='elast'){for(const m of ['mD','mG'])L([a[1],J[m]],B3C.EL,3,pr(J[m]).d-.1)}}
  const sol=o.nosol?[]:[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]];
  // cadre
  const tout=[...Object.values(J),...sol,...fond.flatMap(f=>f.pts),...it.flatMap(i=>i.pts||[i.p])].map(pr);
  let mu=Math.min(...tout.map(p=>p.u))-12,Mu=Math.max(...tout.map(p=>p.u))+12;if(lab&&Mu-mu<160){const c=(Mu+mu)/2;mu=c-80;Mu=c+80}const _z=0,mv=Math.min(...tout.map(p=>p.v))-12,Mv=Math.max(...tout.map(p=>p.v))+(lab?24:10);
  const X=p=>(pr(p).u-mu).toFixed(1),Y=p=>(pr(p).v-mv).toFixed(1),W=Mu-mu,H=Mv-mv;
  let s=`<svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${(W*1.5).toFixed(0)}" xmlns="http://www.w3.org/2000/svg">`;
  if(sol.length)s+=`<polygon points="${sol.map(p=>X(p)+','+Y(p)).join(' ')}" fill="${B3C.TAP}" stroke="${B3C.SOL}" stroke-width="2"/>`;
  for(const f of fond)s+=`<polygon points="${f.pts.map(p=>X(p)+','+Y(p)).join(' ')}" fill="${f.f}" stroke="${f.s}" stroke-width="1.5" stroke-linejoin="round"/>`;
  it.sort((a,b)=>a.d-b.d);
  for(const i of it){ if(i.k==='l')s+=`<polyline points="${i.pts.map(p=>X(p)+','+Y(p)).join(' ')}" fill="none" stroke="${i.c}" stroke-width="${i.w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    else{s+=`<circle cx="${X(i.p)}" cy="${Y(i.p)}" r="${i.r}" fill="${i.f}"${i.s?` stroke="${i.s}" stroke-width="2"`:''}/>`;if(i.trou)s+=`<circle cx="${X(i.p)}" cy="${Y(i.p)}" r="3" fill="#fff"/>`}}
  if(lab)s+=`<text x="${(W/2).toFixed(0)}" y="${(H-6).toFixed(0)}" text-anchor="middle" font-size="13" font-weight="700" fill="#5b6380" font-family="system-ui,sans-serif">${lab}</text>`;
  return s+'</svg>'}
if(typeof module!=='undefined')module.exports={b3svg};

// positions des exercices de renfo (2 images : départ → arrivée)
const Z=(o,p)=>Object.assign({},o,p);
const HAN={r:[3,-38,-3],k:[-.4,0,1]}, JOINT={r:[16,-26,-14]}, BAS={r:[1,-46,3]};
const DEB={P:[0,52,0],N:[0,96,0],p:[1,-52,1],m:BAS};
// allongé sur le dos, tête vers l'arrière (-x), genoux pliés pieds au sol
const DOS={P:[0,6,0],N:[-44,6,0],p:{a:[34,0,9],k:[0,1,0]},m:{r:[34,-4,6],k:[0,1,0]}};
const DOSJ=Z(DOS,{p:{a:[52,4,8]}});                          // jambes tendues
const TABLE={a:[26,32,8],j:[0,32,8]};                        // jambes en table (cuisses verticales, tibias à plat)
const NUQUE={h:[-3,1,8],k:[0,.4,1]};                          // mains derrière la tête
// sur le ventre, tête vers l'avant (+x)
const VEN={P:[0,6,0],N:[44,7,0],p:[-52,-4,1],m:[44,0,4]};
// à quatre pattes
const QP={P:[0,27,0],N:[40,45,0],m:{a:[42,0,15]},p:{a:[-25,1,8],j:[1,1,8]},v:{y:-32,t:18}};
// planche haute / pompe en bas (pieds fixes)
const PH={P:[-38.8,24,0],N:[0,44,0],p:{a:[-85,1,7]},m:{a:[-2,0,16]},v:{y:-40,t:18}};
const PB={P:[-33.5,7.6,0],N:[10,14,0],p:{a:[-85,1,7]},m:{a:[-2,0,16],k:[-1,1,.25]},v:{y:-40,t:18}};
// allongé sur un banc (step), tête vers l'avant
const BANC={P:[-40,26,0],N:[4,26,0],S:[0,0,-1],p:{a:[-74,0,14],k:[0,1,0]},pr:[['box',-72,18,-14,14,20]],v:{y:-35,t:20}};
// buste penché, main et genou sur un banc (rowing, kickback)
const PENCHE={P:[0,46,0],N:[44,50,0],mG:{a:[46,22,-16]},pG:{a:[-26,22,-10],j:[0,22,-10]},pD:{a:[2,0,14]},pr:[['box',-12,52,-30,-2,22]],v:{y:-18,t:14}};
// assis au sol, genoux pliés, buste incliné en arrière
const ASSIS={P:[0,6,0],N:[-26,42,0],p:{a:[36,0,9],k:[0,1,0]},v:{y:-60,t:24}};
const B3_RENFO={
"renfo|Squat|Squat normal":[Z(DEB,{p:{a:[2,0,12]},v:{y:-50}}),Z(DEB,{P:[-20,30,0],N:[0,70,0],p:{a:[2,0,12],k:[1,0,.3]},m:[44,-4,0],v:{y:-50}})],
"renfo|Squat|Squat sumo":[Z(DEB,{P:[0,49,0],N:[0,93,0],p:{a:[4,0,24]},m:JOINT,v:{y:-60}}),Z(DEB,{P:[-6,28,0],N:[0,72,0],p:{a:[4,0,24],k:[.4,0,1]},m:JOINT,v:{y:-60}})],
"renfo|Squat|Squat pieds serrés":[Z(DEB,{p:{a:[2,0,4]},v:{y:-50}}),Z(DEB,{P:[-20,32,0],N:[0,72,0],p:{a:[2,0,4],k:[1,0,.15]},m:{r:[16,-30,3],k:[-1,-.2,0]},v:{y:-50}})],
"renfo|Fente|Fente avant":[Z(DEB,{m:HAN,v:{y:-35}}),Z(DEB,{P:[2,30,0],N:[2,74,0],m:HAN,pD:{a:[36,0,9]},pG:{a:[-34,0,-9],k:[1,-.3,0]},v:{y:-35}})],
"renfo|Fente|Fente arrière":[Z(DEB,{m:HAN,v:{y:-35}}),Z(DEB,{P:[-14,30,0],N:[-14,74,0],m:HAN,pD:{a:[16,0,9]},pG:{a:[-52,0,-9],k:[1,-.3,0]},v:{y:-35}})],
"renfo|Fente|Fente latérale":[Z(DEB,{m:JOINT,v:{y:-65}}),Z(DEB,{P:[-12,30,10],N:[2,70,8],m:JOINT,pD:{a:[4,0,30],k:[1,0,.3]},pG:{a:[2,0,-36]},v:{y:-65}})],
"renfo|Fente|Fente croisée":[Z(DEB,{m:HAN,v:{y:-60}}),Z(DEB,{P:[-4,32,2],N:[0,76,2],m:HAN,pD:{a:[12,0,6]},pG:{a:[-30,0,22],k:[1,-.5,.5]},v:{y:-60}})],
"renfo|Relevé de bassin|Pieds largeur de bassin":[Z(DOS,{v:{y:-35}}),Z(DOS,{P:[0,30,0],N:[-38,8,0],v:{y:-35}})],
"renfo|Relevé de bassin|Pieds écartés":[Z(DOS,{p:{a:[34,0,24],k:[0,1,.8]},v:{y:-35}}),Z(DOS,{P:[0,30,0],N:[-38,8,0],p:{a:[34,0,24],k:[0,1,.8]},v:{y:-35}})],
"renfo|Relevé de bassin|Sur une jambe":[Z(DOS,{pD:{a:[34,0,9],k:[0,1,0]},pG:{a:[37,37,-8]},v:{y:-35}}),Z(DOS,{P:[0,30,0],N:[-38,8,0],pD:{a:[34,0,9],k:[0,1,0]},pG:{a:[45,56,-8]},v:{y:-35}})],
"renfo|Élévation latérale|Allongé sur le côté":[0,1].map(i=>({P:[0,15,0],N:[44,15,0],S:[0,1,0],mG:{a:[50,24,-2],j:[40,1,3]},mD:{a:[22,1,18],k:[0,1,0]},pG:{a:[-52,7,0]},pD:{a:i?[-46,48,0]:[-52,23,0]},v:{y:-12,t:22}})),
"renfo|Élévation latérale|À quatre pattes":[Z(QP,{v:{y:70,t:22}}),Z(QP,{pD:{a:[-22,24,34],j:[0,24,30]},v:{y:70,t:22}})],
"renfo|Élévation latérale|Debout":[Z(DEB,{mD:HAN,mG:{a:[2,92,-38]},pr:[['murz',-40]],v:{y:-80,t:14}}),Z(DEB,{P:[0,52,-3],N:[0,96,-6],mD:HAN,mG:{a:[2,92,-38]},pD:{a:[0,16,36]},pG:[1,-52,-1],pr:[['murz',-40]],v:{y:-80,t:14}})],
"renfo|Extension de hanche|À quatre pattes jambe tendue":[Z(QP,{pD:{a:[-50,2,8]}}),Z(QP,{pD:{a:[-52,30,8]}})],
"renfo|Extension de hanche|À quatre pattes genou plié":[QP,Z(QP,{pD:{a:[-26,54,8],j:[-26,28,8]}})],
"renfo|Extension de hanche|Debout":[Z(DEB,{N:[6,96,0],m:{a:[40,92,15]},pr:[['murx',40]],v:{y:-35}}),Z(DEB,{N:[10,95,0],m:{a:[40,92,15]},pD:{a:[-30,10,9]},pG:[1,-52,-1],pr:[['murx',40]],v:{y:-35}})],
"renfo|Poitrine|Pompes normales":[PH,PB],
"renfo|Poitrine|Pompes larges":[Z(PH,{m:{a:[2,0,40]},v:{y:-55,t:20}}),Z(PB,{P:[-35,9,0],N:[6,18,0],m:{a:[2,0,42],k:[0,1,1]},v:{y:-55,t:20}})],
"renfo|Poitrine|Pompes sur les genoux":[{P:[-34,16.5,0],N:[0,44,0],p:{a:[-74,16,7],j:[-54,1,8]},m:{a:[-2,0,16]},v:{y:-40,t:18}},{P:[-29,6,0],N:[14,14,0],p:{a:[-74,16,7],j:[-54,1,8]},m:{a:[8,0,16],k:[-1,1,.25]},v:{y:-40,t:18}}],
"renfo|Poitrine|Pompes contre un mur":[{P:[5.5,51.7,0],N:[10.2,95.4,0],p:{a:[0,0,9]},m:{a:[50,88,18]},pr:[['murx',50]],v:{y:-35}},{P:[16.3,49.4,0],N:[30.2,91.2,0],p:{a:[0,0,9]},m:{a:[50,88,18],k:[-1,0,.6]},pr:[['murx',50]],v:{y:-35}}],
"renfo|Poitrine|Développé couché à la barre":[Z(BANC,{m:{a:[0,70,20]},pr:[...BANC.pr,['barre']]}),Z(BANC,{m:{a:[-2,36,22],k:[0,-1,1]},pr:[...BANC.pr,['barre']]})],
"renfo|Poitrine|Développé couché aux haltères":[Z(BANC,{m:{a:[0,70,16]},pr:[...BANC.pr,['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]]}),Z(BANC,{m:{a:[-2,34,28],k:[0,-1,1]},pr:[...BANC.pr,['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]]})],
"renfo|Poitrine|Écarté couché aux haltères":[Z(BANC,{m:{a:[0,68,8],k:[0,-1,1]},pr:[...BANC.pr,['halt','mD',[1,0,0]],['halt','mG',[1,0,0]]]}),Z(BANC,{m:{a:[0,32,44],k:[0,-1,0]},pr:[...BANC.pr,['halt','mD',[1,0,0]],['halt','mG',[1,0,0]]]})],
"renfo|Obliques|Touches d'épaules en planche":[Z(PH,{v:{y:-55,t:20}}),Z(PH,{mD:{a:[-1,44,-12],k:[0,-1,.5]},mG:{a:[-2,0,-16]},v:{y:-55,t:20}})],
"renfo|Épaules|Développé épaules à la barre":[Z(DEB,{m:{a:[8,94,22],k:[.2,-1,.4]},pr:[['barre']],v:{y:-45}}),Z(DEB,{m:{a:[2,138,22]},pr:[['barre']],v:{y:-45}})],
"renfo|Épaules|Développé épaules aux haltères":[Z(DEB,{m:{a:[0,100,30],k:[0,-1,1]},pr:[['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]],v:{y:-50}}),Z(DEB,{m:{a:[0,138,18]},pr:[['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]],v:{y:-50}})],
"renfo|Épaules|Élévations latérales aux haltères":[Z(DEB,{m:{r:[0,-46,4]},pr:[['halt','mD',[1,0,0]],['halt','mG',[1,0,0]]],v:{y:-80,t:14}}),Z(DEB,{m:{r:[0,-3,45],k:[0,-1,0]},pr:[['halt','mD',[1,0,0]],['halt','mG',[1,0,0]]],v:{y:-80,t:14}})],
"renfo|Épaules|Élévations frontales aux haltères":[Z(DEB,{m:{r:[2,-46,2]},pr:[['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]],v:{y:-35}}),Z(DEB,{m:{r:[45,-3,2]},pr:[['halt','mD',[0,0,1]],['halt','mG',[0,0,1]]],v:{y:-35}})],
"renfo|Dos|Nage au sol":[Z(VEN,{v:{y:-35,t:20}}),Z(VEN,{N:[44,12,0],mD:[44,14,3],mG:[44,-3,-4],pD:[-52,-4,1],pG:[-50,12,-1],v:{y:-35,t:20}})],
"renfo|Dos|Y-T-W allongé":[Z(VEN,{N:[44,10,0],m:[38,4,26],v:{y:-40,t:28}}),Z(VEN,{N:[44,10,0],m:[0,4,46],v:{y:-40,t:28}}),Z(VEN,{N:[44,10,0],m:{r:[10,6,22],k:[-1,0,.5]},v:{y:-40,t:28}})],
"renfo|Dos|Bras en W tirés vers l'arrière":[Z(VEN,{N:[44,10,0],v:{y:-40,t:24}}),Z(VEN,{N:[44,13,0],m:{r:[2,6,24],k:[-1,.4,.5]},v:{y:-40,t:24}})],
"renfo|Dos|Rowing à la barre buste penché":[Z(DEB,{P:[-12,48,0],N:[19,79,0],p:{a:[2,0,10],k:[1,0,0]},m:{r:[0,-44,4]},pr:[['barre']],v:{y:-35}}),Z(DEB,{P:[-12,48,0],N:[19,79,0],p:{a:[2,0,10],k:[1,0,0]},m:{r:[-4,-22,4],k:[-1,.5,.2]},pr:[['barre']],v:{y:-35}})],
"renfo|Dos|Rowing haltère un bras":[Z(PENCHE,{mD:{r:[0,-44,2]},pr:[...PENCHE.pr,['halt','mD',[1,0,0]]]}),Z(PENCHE,{mD:{r:[-8,-12,2],k:[-1,1,0]},pr:[...PENCHE.pr,['halt','mD',[1,0,0]]]})],
"renfo|Dos|Tirage avec élastique":[{P:[0,6,0],N:[-4,50,0],p:{a:[52,4,8]},m:{r:[44,-14,-4]},pr:[['elast',[56,6,0]]],v:{y:-40}},{P:[0,6,0],N:[-6,50,0],p:{a:[52,4,8]},m:{r:[-2,-14,2],k:[-1,0,.4]},pr:[['elast',[56,6,0]]],v:{y:-40}}],
"renfo|Dos|Pull-over haltère":[Z(BANC,{m:{a:[4,68,4]},pr:[...BANC.pr,['halt','mil',[0,1,0]]],v:{y:-22,t:16}}),Z(BANC,{m:{a:[46,26,4],k:[0,1,0]},pr:[...BANC.pr,['halt','mil',[0,1,0]]],v:{y:-22,t:16}})],
"renfo|Biceps|Curl en supination":[Z(DEB,{pr:[['barre']],lab:'paumes vers l\'avant',v:{y:-45}}),Z(DEB,{m:{r:[14,-8,3],k:[0,-1,0]},pr:[['barre']],v:{y:-45}})],
"renfo|Biceps|Curl prise marteau":[Z(DEB,{pr:[['halt','mD',[1,0,0]],['halt','mG',[1,0,0]]],lab:'pouces vers l\'avant',v:{y:-45}}),Z(DEB,{m:{r:[14,-8,3],k:[0,-1,0]},pr:[['halt','mD',[0,1,0]],['halt','mG',[0,1,0]]],v:{y:-45}})],
"renfo|Biceps|Curl en pronation":[Z(DEB,{pr:[['barre']],lab:'paumes vers l\'arrière',v:{y:-45}}),Z(DEB,{m:{r:[14,-8,3],k:[0,-1,0]},pr:[['barre']],v:{y:-45}})],
"renfo|Biceps|Curl concentré":[0,1].map(i=>({P:[-10,30,0],N:[20,62,0],p:{a:[26,0,16],k:[1,0,0]},mD:{a:i?[22,56,8]:[16,16,6],j:[14,38,8]},mG:{a:[14,32,-14]},pr:[['box',-32,8,-15,15,26],['halt','mD',[0,0,1]]],v:{y:-45}})),
"renfo|Triceps|Dips au sol":[{P:[0,14,0],N:[-26,49,0],p:{a:[44,0,9],k:[0,1,0]},m:{a:[-30,0,14]},v:{y:-40}},{P:[0,6,0],N:[-30,38,0],p:{a:[44,0,9],k:[0,1,0]},m:{a:[-30,0,14],k:[-1,.5,0]},v:{y:-40}}],
"renfo|Triceps|Dips sur une chaise":[{P:[-6,30,0],N:[-12,74,0],p:{a:[40,0,9],k:[0,1,0]},m:{a:[-14,26,14]},pr:[['box',-42,-10,-20,20,26]],v:{y:-40}},{P:[-2,10,0],N:[-8,54,0],p:{a:[40,0,9],k:[0,1,0]},m:{a:[-14,26,14],k:[-1,0,0]},pr:[['box',-42,-10,-20,20,26]],v:{y:-40}}],
"renfo|Triceps|Pompes serrées":[Z(PH,{m:{a:[-2,0,9]}}),Z(PB,{m:{a:[-2,0,9],k:[-1,.8,0]}})],
"renfo|Triceps|Extension haltère au-dessus de la tête":[Z(DEB,{m:{a:[2,138,4]},pr:[['halt','mil',[0,1,0]]],v:{y:-18,t:14}}),Z(DEB,{m:{a:[-12,100,3],k:[.5,1,.15]},pr:[['halt','mil',[0,1,0]]],v:{y:-18,t:14}})],
"renfo|Triceps|Kickback haltère":[Z(PENCHE,{mD:{a:[20,26,15],j:[20,48,15]},pr:[...PENCHE.pr,['halt','mD',[1,0,0]]]}),Z(PENCHE,{mD:{a:[-2,50,15],j:[20,48,15]},pr:[...PENCHE.pr,['halt','mD',[1,0,0]]]})],
"renfo|Triceps|Barre au front":[Z(BANC,{m:{a:[2,70,14]},pr:[...BANC.pr,['barre']]}),Z(BANC,{m:{a:[14,36,14],k:[-.3,1,0]},pr:[...BANC.pr,['barre']]})],
"renfo|Obliques|Planche latérale":[{P:[0,22,0],N:[44,32,0],S:[0,1,0],mG:{a:[44,1,20],j:[42,1,0]},mD:{r:[0,44,0]},pG:{a:[-52,1,0]},pD:{a:[-52,14,0]},v:{y:-10,t:16}}],
"renfo|Obliques|Crunch oblique":[Z(DOS,{mD:{h:[-3,1,5],je:[-8,4,21]},mG:{h:[-3,1,-5],je:[-8,4,-21]},v:{y:30,t:45}}),Z(DOS,{N:[-30,28,-10],S:[.5,.65,.6],mD:{h:[-3,3,6],j:[-18,46,-10]},mG:{h:[-3,1,-6],je:[-10,2,-21]},pG:{a:[34,0,-9],k:[0,1,-.3]},v:{y:30,t:45}})],
"renfo|Obliques|Rotations du buste assis":[Z(ASSIS,{S:[-.7,0,1],mD:{a:[-2,32,20],k:[0,-1,0]},mG:{a:[-2,32,20],k:[0,-1,0]}}),Z(ASSIS,{S:[.7,0,1],mD:{a:[-2,32,-20],k:[0,-1,0]},mG:{a:[-2,32,-20],k:[0,-1,0]}})],
"renfo|Obliques|Essuie-glace":[Z(DOS,{m:{a:[-41,2,58]},pD:{a:[0,58,4]},pG:{a:[0,58,-4]},v:{y:-75,t:30}}),Z(DOS,{m:{a:[-41,2,58]},pD:{a:[0,40,44]},pG:{a:[0,46,34]},v:{y:-75,t:30}})],
"renfo|Obliques|Flexion latérale avec haltère":[Z(DEB,{mD:BAS,mG:b3mz(HAN.r)&&{r:[3,-38,3],k:[-.4,0,-1]},pr:[['halt','mD',[1,0,0]]],v:{y:-80,t:14}}),Z(DEB,{N:[0,95,14],mD:{r:[0,-46,6]},mG:b3mz(HAN.r)&&{r:[3,-38,3],k:[-.4,0,-1]},pr:[['halt','mD',[1,0,0]]],v:{y:-80,t:14}})],
"renfo|Obliques|Rotations du buste avec un disque":[Z(ASSIS,{S:[-.7,0,1],mD:{a:[-2,32,20],k:[0,-1,0]},mG:{a:[-2,32,20],k:[0,-1,0]},pr:[['disque']]}),Z(ASSIS,{S:[.7,0,1],mD:{a:[-2,32,-20],k:[0,-1,0]},mG:{a:[-2,32,-20],k:[0,-1,0]},pr:[['disque']]})],
"renfo|Grand droit|Crunch":[Z(DOS,{m:NUQUE,v:{y:-35}}),Z(DOS,{N:[-40,18,0],m:NUQUE,v:{y:-35}})],
"renfo|Grand droit|Montée de buste":[Z(DOS,{m:{r:[30,10,0]},v:{y:-35}}),Z(DOS,{N:[-10,49,0],m:{r:[40,-6,-4]},v:{y:-35}})],
"renfo|Grand droit|Relevé de jambes alternées":[Z(DOSJ,{p:TABLE,v:{y:-35}}),Z(DOSJ,{pD:{a:[49,18,8]},pG:{a:[26,32,-8],j:[0,32,-8]},v:{y:-35}})],
"renfo|Obliques|Genoux-coudes alternés, allongé sur le dos":[Z(DOS,{N:[-40,18,0],S:[.3,.3,1],m:NUQUE,pD:{a:[50,14,8]},pG:{a:[34,30,-8],j:[12,30,-8]},v:{y:-30,t:26}}),Z(DOS,{N:[-40,18,0],S:[-.3,-.3,1],m:NUQUE,pG:{a:[50,14,-8]},pD:{a:[34,30,8],j:[12,30,8]},v:{y:-30,t:26}})],
"renfo|Grand droit|Relevé de jambes":[Z(DOSJ,{p:{a:[2,58,8]},v:{y:-35}}),Z(DOSJ,{p:{a:[48,24,8]},v:{y:-35}})],
"renfo|Grand droit|Crunch inversé":[Z(DOSJ,{p:TABLE,v:{y:-35}}),Z(DOSJ,{P:[4,14,0],N:[-40,6,0],p:{a:[18,46,8],j:[-4,36,8]},v:{y:-35}})],
"renfo|Grand droit|Crunch avec haltère":[Z(DOSJ,{p:TABLE,m:{a:[-30,14,4],k:[0,1,1]},pr:[['halt','mil',[0,0,1]]],v:{y:-30,t:26}}),Z(DOSJ,{N:[-40,18,0],p:TABLE,m:{a:[-24,26,4],k:[0,1,1]},pr:[['halt','mil',[0,0,1]]],v:{y:-30,t:26}})],
"renfo|Grand droit|Relevé de jambes avec un ballon":[Z(DOSJ,{p:{a:[2,58,8]},pr:[['ballon']],v:{y:-35}}),Z(DOSJ,{p:{a:[48,24,8]},pr:[['ballon']],v:{y:-35}})],
"renfo|Lombaires|Superman":[Z(VEN,{v:{y:-35,t:20}}),Z(VEN,{N:[44,12,0],m:[42,10,3],p:[-50,12,1],v:{y:-35,t:20}})],
"renfo|Lombaires|Bird dog":[QP,Z(QP,{mD:{a:[86,50,15]},pG:{a:[-52,30,-8]}})],
"renfo|Lombaires|Extension lombaire mains derrière la tête":[Z(VEN,{m:NUQUE,v:{y:-35,t:20}}),Z(VEN,{N:[42,18,0],m:NUQUE,v:{y:-35,t:20}})],
"renfo|Lombaires|Soulevé de terre jambes semi-tendues":[Z(DEB,{pr:[['barre']],v:{y:-35}}),Z(DEB,{P:[-14,47,0],N:[23,70,0],p:{a:[2,0,9],k:[1,0,0]},m:{r:[0,-44,3]},pr:[['barre']],v:{y:-35}})],
"renfo|Lombaires|Superman avec un disque":[Z(VEN,{m:{r:[44,0,-12]},pr:[['disque']],v:{y:-35,t:20}}),Z(VEN,{N:[44,12,0],m:{r:[42,10,-12]},p:[-50,12,1],pr:[['disque']],v:{y:-35,t:20}})]
};
if(typeof module!=='undefined')module.exports={B3_RENFO};
