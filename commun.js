// ===== Réglages communs à l'espace stagiaires et à l'espace formateur =====

// Formulaire des réponses des stagiaires (petit bilan)
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfENcJ-l4TOxJ4RV44Npl-B5x5EnINrPCt7GYhxH3y2Kygmog/formResponse';
const E = {nom:'entry.1232198973', prenom:'entry.1179002030', journee:'entry.1357484407', ressenti:'entry.2006212165', reponses:'entry.27978275', difficulte:'entry.1243309547'};
// Tableau des réponses des stagiaires (publié en CSV)
const CSV_REPONSES = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ0Q6CmVaNRB_wzqusRfYaLQjon3iYJ9qjfPRGaimeo687QAkNxIeem81Mf_HeHGIdTqe3AsVerGOnx/pub?gid=1231707561&single=true&output=csv';

// Formulaire « Mes quiz CQP » (le formateur y enregistre ses quiz et les ouvre)
const FORM_QUIZ = 'https://docs.google.com/forms/d/e/1FAIpQLScCSm_8nGm4TWIQMvUkcaa97s5RM2IpcuN2NFEzixBtUJHGSA/formResponse';
const EQ = {journee:'entry.131332134', statut:'entry.1387340432', contenu:'entry.1725634115'};
// Tableau « Mes quiz CQP » (publié en CSV)
const CSV_QUIZ = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQCaX7uDaAUK00POJ2rU9QnYYy6UjTL4N9RAx0TZDCM7ETDSmNYiu_5-xfISJzlnp20rrAN3wCIbqrr/pub?gid=1092502539&single=true&output=csv';

const LIEN_STAGIAIRES = 'https://hamidbenamaraei-png.github.io/cqp-cours-collectifs/';

// ===== Journées (on ajoute une journée ici à chaque intervention) =====
// "quiz" = quiz préparé à l'avance. Il reste caché tant que le formateur ne l'a pas ouvert.
const JOURNEES = [
 {id:'2026-10-27', titre:'Mardi 27 octobre', theme:'EPMSP – Préparer son passage', diapos:16, dossier:'j1',
  docs:[{titre:'Télécharger toutes les diapos', fichier:'j1/Diapos_EPMSP_27-10.pdf'}],
  quiz:{
   ressenti:[
    "Ce qu'est l'EPMSP et comment se passe le passage",
    "Ce que le jury observe",
    "Comment répartir mes 20 minutes",
    "Ce que je dois préparer"],
   questions:[
    {q:"Combien dure le passage, et quelles sont ses parties ?",
     o:["20 min : échauffement, corps de séance, retour au calme, étirements",
        "30 min : échauffement, corps de séance, étirements, bilan",
        "20 min : seulement le corps de séance"],
     b:0, e:"Le passage dure 20 minutes et c'est une séance entière : échauffement, corps de séance, retour au calme, puis étirements."},
    {q:"Sur quoi le jury regarde surtout ?",
     o:["La difficulté des exercices",
        "La sécurité des pratiquants et la tienne, des mouvements sûrs, le placement dans la salle",
        "Ta tenue et le choix de ta musique"],
     b:1, e:"Le jury regarde d'abord la sécurité : celle des pratiquants et la tienne, des mouvements sûrs, et le placement dans la salle."},
    {q:"Pour l'EPMSP, la musique ou le Tabata, c'est obligatoire ?",
     o:["Oui, la musique est obligatoire",
        "Non, c'est au choix : sur la musique ou en version Tabata",
        "Oui, le Tabata est obligatoire"],
     b:1, e:"Pour l'EPMSP, c'est au choix. Attention : à l'examen final, la musique peut être imposée, donc il faut savoir animer sur la musique."}
   ]}}
];

// ===== Outils =====
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function parseCSV(txt){
  const rows=[];let row=[],cur='',q=false;
  for(let i=0;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){cur+='"';i++}else q=false}else cur+=c}
    else if(c==='"')q=true;
    else if(c===','){row.push(cur);cur=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&txt[i+1]==='\n')i++;row.push(cur);rows.push(row);row=[];cur=''}
    else cur+=c}
  if(cur!==''||row.length){row.push(cur);rows.push(row)}
  return rows.filter(r=>r.some(x=>x.trim()!==''));
}
async function lireCSV(url){
  const r=await fetch(url+'&t='+Date.now(),{cache:'no-store'});
  if(!r.ok)throw new Error('csv');
  return parseCSV(await r.text());
}
function dateFR(s){const m=String(s).match(/(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:''}
function envoyerForm(url,champs){
  const d=new URLSearchParams();Object.entries(champs).forEach(([k,v])=>d.append(k,v));
  return fetch(url,{method:'POST',mode:'no-cors',body:d});
}
function quizValide(z){return z&&Array.isArray(z.ressenti)&&Array.isArray(z.questions)&&z.questions.every(q=>q&&q.q&&Array.isArray(q.o)&&q.o.length>=2&&typeof q.b==='number')}

// État général, lu dans le tableau « Mes quiz CQP » :
// - pour chaque journée : le dernier quiz enregistré et s'il est ouvert
//   (ligne « quiz » = nouveau contenu ; « ouvert » / « ferme » = visibilité) ;
// - les stagiaires : colonne Journée = « stagiaires », Statut = demande / accepte / refuse / supprime,
//   Contenu = {"id","nom","prenom"}. La ligne la plus récente gagne.
async function etatGeneral(){
  const etat={};JOURNEES.forEach(j=>etat[j.id]={quiz:j.quiz,ouvert:false});
  const stag={};
  const L=await lireCSV(CSV_QUIZ);
  if(L.length){
    const h=L[0].map(x=>x.trim().toLowerCase());
    const iJ=h.findIndex(x=>x.startsWith('journ')), iS=h.indexOf('statut'), iC=h.indexOf('contenu');
    L.slice(1).forEach((l,n)=>{
      const id=(l[iJ]||'').trim(), st=(l[iS]||'').trim().toLowerCase();
      if(id==='stagiaires'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(!c||!c.id)return;
        const s0=stag[c.id];
        if(st==='demande'){
          if(!s0)stag[c.id]={id:c.id,nom:String(c.nom||'').trim(),prenom:String(c.prenom||'').trim(),statut:'attente',n:n+1,date:l[0]||''};
        }else if(['accepte','refuse','supprime','efface'].includes(st)){
          stag[c.id]=Object.assign(s0||{id:c.id,nom:String(c.nom||'').trim(),prenom:String(c.prenom||'').trim(),date:l[0]||''},{statut:st,n:n+1});
        }
        return;
      }
      if(!etat[id])return;
      if(st==='quiz'){try{const z=JSON.parse(l[iC]||'');if(quizValide(z))etat[id].quiz=z}catch(e){}}
      else if(st==='ouvert')etat[id].ouvert=true;
      else if(st==='ferme')etat[id].ouvert=false;
    });
  }
  return {quiz:etat,stagiaires:stag};
}
async function etatQuiz(){return (await etatGeneral()).quiz}
function nouvelId(){
  const a=new Uint8Array(9);crypto.getRandomValues(a);
  return [...a].map(x=>x.toString(36).padStart(2,'0')).join('').slice(0,14);
}
function memeNom(a,b){const f=x=>String(x||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');return f(a)===f(b)}
