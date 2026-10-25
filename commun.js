// ===== Réglages communs à l'espace stagiaires et à l'espace formateur =====

// Formulaire des réponses des stagiaires (petit bilan). Il sert seulement à écrire :
// le tableau des réponses, lui, n'est lu que par l'autre espace (pas ici).
const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfENcJ-l4TOxJ4RV44Npl-B5x5EnINrPCt7GYhxH3y2Kygmog/formResponse';
const E = {nom:'entry.1232198973', prenom:'entry.1179002030', journee:'entry.1357484407', ressenti:'entry.2006212165', reponses:'entry.27978275', difficulte:'entry.1243309547'};

// Formulaire « Mes quiz CQP » (le formateur y enregistre ses quiz et les ouvre)
const FORM_QUIZ = 'https://docs.google.com/forms/d/e/1FAIpQLScCSm_8nGm4TWIQMvUkcaa97s5RM2IpcuN2NFEzixBtUJHGSA/formResponse';
const EQ = {journee:'entry.131332134', statut:'entry.1387340432', contenu:'entry.1725634115'};
// Tableau « Mes quiz CQP » (publié en CSV)
const CSV_QUIZ = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQCaX7uDaAUK00POJ2rU9QnYYy6UjTL4N9RAx0TZDCM7ETDSmNYiu_5-xfISJzlnp20rrAN3wCIbqrr/pub?gid=1092502539&single=true&output=csv';

const LIEN_STAGIAIRES = 'https://hamidbenamaraei-png.github.io/cqp-cours-collectifs/';

// ===== Banque de questions du 27/10 (faite à partir des 16 diapos) =====
// Chaque question : q (question), o (3 réponses), b (numéro de la bonne réponse, 0 = la première),
// e (explication), theme. Les quiz tout prêts sont rangés par catégorie.
// <BANQUE_J1>
const BANQUE_J1={
 themes:{"epmsp":"L'EPMSP et l'année","jury":"Ce que regarde le jury","minutes":"Les 20 minutes","briefing":"Le briefing de sécurité","salle":"La salle et la séance sans danger","placement":"Le placement des pratiquants","musique":"Musique ou Tabata"},
 questions:[
  {id:"e01",theme:"epmsp",q:"Que veut dire le sigle EPMSP ?",
   o:["Évaluation Pratique des Méthodes et Savoirs Pédagogiques","Exigences Préalables à la Mise en Situation Pédagogique","Épreuve Pratique de Mise en Situation Professionnelle"],
   b:1,e:"EPMSP veut dire : Exigences Préalables à la Mise en Situation Pédagogique."},
  {id:"e02",theme:"epmsp",q:"À quoi sert l'EPMSP ?",
   o:["À prouver que tu connais beaucoup d'exercices","À prouver que tu as une très bonne condition physique","À prouver que tu sais encadrer un groupe en sécurité"],
   b:2,e:"L'EPMSP sert à prouver que tu sais encadrer un groupe en sécurité, avant d'animer en stage."},
  {id:"e03",theme:"epmsp",q:"Quand dois-tu avoir réussi l'EPMSP ?",
   o:["Avant de rencontrer les autres stagiaires","Avant d'animer des cours en stage","Avant de commencer la formation"],
   b:1,e:"Il faut réussir l'EPMSP avant d'animer des cours en stage."},
  {id:"e04",theme:"epmsp",q:"Quelle est la date de ton passage à l'EPMSP ?",
   o:["Le 13 novembre","Fin décembre","Début février"],
   b:0,e:"Le passage de l'EPMSP a lieu le 13 novembre."},
  {id:"e05",theme:"epmsp",q:"Qui est présent pendant ton passage ?",
   o:["Seulement des pratiquants","Un jury et des pratiquants","Seulement un jury"],
   b:1,e:"Pendant ton passage, il y a un jury et des pratiquants : tu animes un vrai groupe."},
  {id:"e06",theme:"epmsp",q:"Que veut dire le sigle CQP ?",
   o:["Certificat de Qualification Professionnelle","Certificat de Qualité Pédagogique","Cours de Qualification Pratique"],
   b:0,e:"CQP veut dire : Certificat de Qualification Professionnelle."},
  {id:"e07",theme:"epmsp",q:"Dans « CQP CC », que veut dire CC ?",
   o:["Cardio et Circuit","Coaching Complet","Cours Collectifs"],
   b:2,e:"CC veut dire Cours Collectifs : c'est ton option."},
  {id:"e08",theme:"epmsp",q:"Quand rends-tu ton dossier ?",
   o:["En décembre","En février","En novembre"],
   b:1,e:"Le dossier se remet en février. C'est la dernière grande étape de l'année."},
  {id:"e10",theme:"epmsp",q:"À quoi sert le petit bilan de fin de journée ?",
   o:["À cibler tes difficultés","À te mettre une note","À remplacer ton passage"],
   b:0,e:"Le petit bilan sert à cibler tes difficultés, pour mieux t'aider. Ce n'est pas une note."},
  {id:"j01",theme:"jury",q:"Que regarde surtout le jury pendant ton passage ?",
   o:["La difficulté des exercices choisis","Ta tenue et le choix de ta musique","La sécurité des pratiquants et la tienne"],
   b:2,e:"Le jury regarde d'abord la sécurité : celle des pratiquants et la tienne. Il regarde aussi les mouvements et le placement dans la salle."},
  {id:"j02",theme:"jury",q:"Ta propre sécurité compte-t-elle pour le jury ?",
   o:["Oui, le jury la regarde aussi","Non, seuls les pratiquants comptent","Non, seule la musique compte"],
   b:0,e:"Oui : le jury regarde la sécurité des pratiquants, et aussi ta propre sécurité."},
  {id:"j03",theme:"jury",q:"Quels mouvements le jury veut-il voir ?",
   o:["Des mouvements sans danger","Des mouvements très difficiles","Des mouvements très rapides"],
   b:0,e:"Le jury veut voir des mouvements sans danger, pas des mouvements difficiles."},
  {id:"j04",theme:"jury",q:"Parmi ces points, lequel le jury regarde-t-il ?",
   o:["La marque de ton matériel","Le nombre d'exercices différents","Le placement dans la salle"],
   b:2,e:"Le jury regarde le placement dans la salle : tout le monde doit bien te voir."},
  {id:"j05",theme:"jury",q:"Qu'est-ce qui peut faire rater ton passage ?",
   o:["Choisir la version Tabata","Faire un échauffement de 4 minutes","Oublier la sécurité des pratiquants"],
   b:2,e:"La sécurité, c'est ce que le jury regarde en premier. Le Tabata est permis, et 4 minutes d'échauffement, c'est l'exemple du cours."},
  {id:"m01",theme:"minutes",q:"Combien de temps dure ton passage ?",
   o:["10 minutes","20 minutes","45 minutes"],
   b:1,e:"Ton passage dure 20 minutes."},
  {id:"m02",theme:"minutes",q:"Que montres-tu pendant tes 20 minutes ?",
   o:["Seulement le corps de la séance","Une séance entière, du début à la fin","Seulement quelques exercices au choix"],
   b:1,e:"Tes 20 minutes sont une séance entière : échauffement, corps de séance, retour au calme, puis étirements."},
  {id:"m03",theme:"minutes",q:"Dans quel ordre se passe la séance ?",
   o:["Échauffement, corps de séance, retour au calme, étirements","Échauffement, étirements, corps de séance, retour au calme","Corps de séance, échauffement, étirements, retour au calme"],
   b:0,e:"L'ordre : échauffement, corps de séance, retour au calme, puis étirements."},
  {id:"m04",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure l'échauffement ?",
   o:["4 minutes","1 minute","8 minutes"],
   b:0,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m05",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure le corps de séance ?",
   o:["16 minutes","4 minutes","11 minutes"],
   b:2,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m06",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure le retour au calme ?",
   o:["10 minutes","2 minutes","6 minutes"],
   b:1,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m07",theme:"minutes",q:"Dans l'exemple du cours, combien de temps durent les étirements ?",
   o:["3 minutes","8 minutes","10 minutes"],
   b:0,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m08",theme:"minutes",q:"Quelle partie de la séance dure le plus longtemps ?",
   o:["Les étirements","L'échauffement","Le corps de séance"],
   b:2,e:"Le corps de séance est la partie la plus longue : 11 minutes sur 20 dans l'exemple."},
  {id:"m09",theme:"minutes",q:"À quoi sert l'échauffement ?",
   o:["À relâcher les muscles travaillés","À mettre le corps en route en douceur","À faire les exercices les plus durs"],
   b:1,e:"L'échauffement met le corps en route en douceur : le cœur monte, les articulations bougent, on prépare les mouvements du cours."},
  {id:"m10",theme:"minutes",q:"Que fait-on pendant le corps de séance ?",
   o:["Des étirements doux, sans à-coups","Des mouvements lents pour se calmer","Les exercices de renforcement"],
   b:2,e:"Le corps de séance, c'est le cœur du cours : les exercices de renforcement, avec les consignes, la sécurité et les adaptations."},
  {id:"m11",theme:"minutes",q:"Pendant le corps de séance, que donnes-tu en plus des exercices ?",
   o:["Le classement de chaque pratiquant","Le nombre de calories dépensées","Les consignes, la sécurité, les adaptations"],
   b:2,e:"Dans le corps de séance, tu donnes les consignes, tu veilles à la sécurité et tu proposes des adaptations."},
  {id:"m12",theme:"minutes",q:"À quoi sert le retour au calme ?",
   o:["À faire les exercices les plus intenses","À faire monter le cœur avant l'effort","À faire redescendre le cœur et la respiration"],
   b:2,e:"Le retour au calme fait redescendre le cœur et la respiration, avec des mouvements lents."},
  {id:"m13",theme:"minutes",q:"Comment fait-on les étirements ?",
   o:["Doucement, sans à-coups","En forçant le plus possible","Vite, avec de petits rebonds"],
   b:0,e:"Les étirements relâchent les muscles travaillés, doucement, sans à-coups."},
  {id:"b01",theme:"briefing",q:"Quand fais-tu le briefing de sécurité ?",
   o:["Au début du cours","Pendant les étirements","À la fin du cours"],
   b:0,e:"Le briefing se fait au début du cours, avant de commencer."},
  {id:"b02",theme:"briefing",q:"Combien de temps dure ton briefing devant le groupe ?",
   o:["10 minutes","1 à 2 minutes","5 à 6 minutes"],
   b:1,e:"Ton briefing de sécurité dure 1 à 2 minutes : court et clair."},
  {id:"b03",theme:"briefing",q:"Au briefing, que demandes-tu sur la santé ?",
   o:["S'ils ont déjà fait ce cours","S'ils ont bien mangé avant le cours","S'ils ont une douleur ou une blessure"],
   b:2,e:"Tu demandes : « Des douleurs, une blessure, un souci de santé ? Dites-le-moi. »"},
  {id:"b04",theme:"briefing",q:"Au briefing, que vérifies-tu pour la tenue ?",
   o:["Une tenue et des chaussures adaptées","Une tenue de la même couleur pour tous","Une tenue neuve, achetée pour le cours"],
   b:0,e:"Tu vérifies que la tenue et les chaussures sont adaptées."},
  {id:"b05",theme:"briefing",q:"Où doit être la bouteille d'eau ?",
   o:["Dans le vestiaire, loin de la salle","À portée de main, hors de la zone de travail","Sur le tapis, pour boire plus vite"],
   b:1,e:"L'eau est à portée de main, mais pas sur la zone de travail."},
  {id:"b06",theme:"briefing",q:"Pourquoi le chewing-gum est-il interdit ?",
   o:["On risque de s'étouffer pendant l'effort","Il gêne pour entendre la musique","Il peut salir le sol de la salle"],
   b:0,e:"Le chewing-gum est interdit : on risque de s'étouffer pendant l'effort."},
  {id:"b07",theme:"briefing",q:"En cas de douleur ou de malaise, que dis-tu au groupe de faire ?",
   o:["De ralentir et de continuer","D'attendre la fin du cours","De s'arrêter et de me prévenir"],
   b:2,e:"Tu dis au groupe : « On s'arrête et on me prévient. »"},
  {id:"s01",theme:"salle",q:"Où ranges-tu les bouteilles et les serviettes ?",
   o:["Au milieu de la salle","Au bord de la salle","Sous les tapis"],
   b:1,e:"Bouteilles et serviettes sont rangées au bord, jamais au milieu."},
  {id:"s02",theme:"salle",q:"Comment doit être le sol de la salle ?",
   o:["Un peu mouillé, pour moins glisser","Couvert de serviettes","Sec, avec rien qui traîne"],
   b:2,e:"Le sol doit être sec, avec rien qui traîne."},
  {id:"s03",theme:"salle",q:"Quand vérifies-tu le matériel ?",
   o:["Pendant les étirements","Avant le cours","Après le cours"],
   b:1,e:"Le matériel se vérifie avant le cours."},
  {id:"s04",theme:"salle",q:"Que fais-tu du matériel qui ne sert plus ?",
   o:["Tu le laisses près du tapis","Tu le ranges à sa place","Tu le poses au milieu de la salle"],
   b:1,e:"Le matériel est rangé dès qu'il ne sert plus."},
  {id:"s05",theme:"salle",q:"Comment doit être l'espace entre les pratiquants ?",
   o:["Occupé par le matériel du cours","Très serré, pour faire entrer tout le monde","Assez grand pour bouger sans se gêner"],
   b:2,e:"Il faut assez de place entre les pratiquants."},
  {id:"s06",theme:"salle",q:"Comment doivent être les sorties de la salle ?",
   o:["Dégagées, avec rien devant","Utilisées pour ranger le matériel","Encombrées par les sacs"],
   b:0,e:"Les sorties doivent rester dégagées."},
  {id:"s07",theme:"salle",q:"Pendant la séance, quelles sont tes 3 actions pour la sécurité ?",
   o:["Montrer, accélérer, répéter","Observer, corriger, arrêter","Compter, chanter, encourager"],
   b:1,e:"Pendant la séance : observer, corriger, et arrêter un mouvement dangereux."},
  {id:"s08",theme:"salle",q:"Que fais-tu si un pratiquant fait un mouvement dangereux ?",
   o:["Tu en parles à la fin du cours","Tu arrêtes le mouvement","Tu le laisses finir sa série"],
   b:1,e:"Un mouvement dangereux, on l'arrête. Tu observes, tu corriges, et tu arrêtes si besoin."},
  {id:"p01",theme:"placement",q:"Quel est le but du placement des pratiquants ?",
   o:["Que tout le monde puisse te voir","Que chacun soit près d'une sortie","Que les plus forts soient devant"],
   b:0,e:"Le placement sert d'abord à ça : tout le monde doit te voir."},
  {id:"p02",theme:"placement",q:"Comment places-tu les tapis des pratiquants ?",
   o:["En cercle autour du coach","Parallèles au tapis du coach","En une seule longue ligne"],
   b:1,e:"Les tapis des pratiquants sont parallèles au tapis du coach."},
  {id:"p03",theme:"placement",q:"Les tapis sont en quinconce, c'est-à-dire décalés d'une ligne à l'autre. Pourquoi ?",
   o:["Chacun voit l'estrade entre les tapis de devant","Chacun est plus près d'un mur","On peut mettre plus de monde dans la salle"],
   b:0,e:"En quinconce, chacun voit l'estrade entre les deux tapis de devant."},
  {id:"p04",theme:"placement",q:"Pour un exercice debout, où se place le pratiquant ?",
   o:["Derrière son tapis","À côté de son tapis","Devant son tapis"],
   b:0,e:"Debout, le pratiquant se place derrière son tapis."},
  {id:"p05",theme:"placement",q:"Allongé sur le dos, où le pratiquant met-il sa tête ?",
   o:["Vers le centre","Vers son voisin","Vers l'extérieur"],
   b:2,e:"Sur le dos : tête vers l'extérieur."},
  {id:"p06",theme:"placement",q:"À quatre pattes ou sur le ventre, où va la tête du pratiquant ?",
   o:["Vers son voisin","Vers le centre","Vers l'extérieur"],
   b:1,e:"À quatre pattes et sur le ventre : tête vers le centre."},
  {id:"p07",theme:"placement",q:"Le coach peut-il quitter l'estrade ?",
   o:["Non, jamais pendant le cours","Oui, mais seulement pour boire","Oui, pour corriger une posture si besoin"],
   b:2,e:"Le coach peut quitter l'estrade pour corriger une posture, si besoin."},
  {id:"p08",theme:"placement",q:"Où se trouve le tapis du coach ?",
   o:["Au fond de la salle","Au milieu des pratiquants","Sur l'estrade, face au groupe"],
   b:2,e:"Le tapis du coach est sur l'estrade, face au groupe."},
  {id:"t01",theme:"musique",q:"À l'EPMSP, peux-tu choisir entre musique et Tabata ?",
   o:["Oui, c'est au choix","Non, la musique est obligatoire","Non, le Tabata est obligatoire"],
   b:0,e:"Pour l'EPMSP, c'est au choix. Attention : à l'examen final, la musique peut être imposée."},
  {id:"t02",theme:"musique",q:"Sur la musique, comment se font les mouvements ?",
   o:["Ils suivent le rythme de la musique","Ils suivent un minuteur","Ils se font sans rythme précis"],
   b:0,e:"Sur la musique, les mouvements suivent le rythme de la musique."},
  {id:"t03",theme:"musique",q:"Qu'est-ce que la version Tabata ?",
   o:["Une séance d'étirements lents et doux","Des temps d'effort et de repos, réglés sur un minuteur","Des mouvements qui suivent le rythme de la musique"],
   b:1,e:"En Tabata, il y a des temps d'effort et de repos, réglés sur un minuteur."},
  {id:"t04",theme:"musique",q:"Dans l'exemple de Tabata du cours, quels sont les temps ?",
   o:["20 s d'effort, 10 s de repos","30 s d'effort, 30 s de repos","10 s d'effort, 20 s de repos"],
   b:0,e:"L'exemple du cours : 20 secondes d'effort, puis 10 secondes de repos."},
  {id:"t05",theme:"musique",q:"À l'examen final, que peut-on t'imposer ?",
   o:["Le nombre de pratiquants","Le Tabata","La musique"],
   b:2,e:"À l'examen final, la musique peut être imposée."},
  {id:"t06",theme:"musique",q:"Pourquoi dois-tu savoir animer sur la musique ?",
   o:["Elle est obligatoire à l'EPMSP","Elle peut être imposée à l'examen final","Le Tabata est interdit en cours collectifs"],
   b:1,e:"Pour l'EPMSP c'est au choix, mais à l'examen final la musique peut être imposée."}
 ],
 categories:[
  {id:"epmsp",emoji:"🎯",titre:"L'EPMSP, c'est quoi",themes:["epmsp","jury"],quiz:[
   {id:"epmsp-1",titre:"L'essentiel de l'EPMSP",ressenti:["Ce qu'est l'EPMSP et à quoi elle sert","Comment se passe le passage","Ce que le jury observe"],questions:["e02","e03","e05","e04","j01"]},
   {id:"epmsp-2",titre:"Les mots à connaître",ressenti:["Le sens des mots CQP, EPMSP et CC","Les grandes étapes de l'année"],questions:["e01","e06","e07","e04","e08"]},
   {id:"epmsp-3",titre:"Ce que regarde le jury",ressenti:["Ce que le jury observe","Ce qui peut faire rater un passage"],questions:["j01","j02","j03","j04","j05"]}]},
  {id:"minutes",emoji:"⏱️",titre:"Mes 20 minutes",themes:["minutes"],quiz:[
   {id:"minutes-1",titre:"Les 4 parties de la séance",ressenti:["Les 4 parties de la séance","L'ordre des parties"],questions:["m02","m03","m09","m12","m13"]},
   {id:"minutes-2",titre:"Répartir mes 20 minutes",ressenti:["Comment répartir mes 20 minutes"],questions:["m01","m04","m05","m07","m08"]},
   {id:"minutes-3",titre:"Le corps de séance",ressenti:["Ce que je fais dans le corps de séance","Le rôle de l'échauffement et du retour au calme"],questions:["m10","m11","m06","m09","m12"]}]},
  {id:"securite",emoji:"🛡️",titre:"La sécurité",themes:["briefing","salle","placement"],quiz:[
   {id:"securite-1",titre:"Mon briefing de sécurité",ressenti:["Ce que je dis dans mon briefing","Comment réagir en cas de douleur"],questions:["b01","b02","b03","b06","b07"]},
   {id:"securite-2",titre:"Une salle sans danger",ressenti:["Comment préparer la salle","Comment surveiller pendant la séance"],questions:["s01","s02","s03","s06","s08"]},
   {id:"securite-3",titre:"Bien placer les pratiquants",ressenti:["Comment placer les tapis","Où mettre la tête selon la position"],questions:["p01","p02","p03","p04","p05"]},
   {id:"securite-4",titre:"La sécurité, tout mélangé",ressenti:["Le briefing de début de cours","La salle et le placement"],questions:["b05","s07","p06","p07","b04"]}]},
  {id:"musique",emoji:"🎵",titre:"Musique ou Tabata",themes:["musique"],quiz:[
   {id:"musique-1",titre:"Musique ou Tabata ?",ressenti:["La différence entre musique et Tabata","Ce qui est au choix pour l'EPMSP"],questions:["t01","t02","t03","t05"]},
   {id:"musique-2",titre:"Animer sur la musique",ressenti:["Pourquoi savoir animer sur la musique"],questions:["t02","t04","t05","t06"]}]},
  {id:"revision",emoji:"🔀",titre:"Révision de la journée",themes:[],quiz:[
   {id:"revision-1",titre:"Le tour de la journée",ressenti:["Ce qu'est l'EPMSP et comment se passe le passage","Ce que le jury observe","Comment répartir mes 20 minutes","Ce que je dois préparer"],questions:["e02","m02","j01","b07","p01"]},
   {id:"revision-2",titre:"Spécial sécurité et passage",ressenti:["Ce que le jury observe","Mon briefing de sécurité","Le placement des pratiquants"],questions:["j03","m03","b06","s08","p04"]},
   {id:"revision-3",titre:"Révision express",ressenti:["Les grandes étapes jusqu'au 13 novembre"],questions:["e04","m01","t01","b01","s01"]}]}
 ]
};
const QUIZ_DEFAUT_J1={"ressenti":["Ce qu'est l'EPMSP et comment se passe le passage","Ce que le jury observe","Comment répartir mes 20 minutes","Ce que je dois préparer"],"questions":["m02","j01","t01"]};
// </BANQUE_J1>

// ===== Journées (on ajoute une journée ici à chaque intervention) =====
// "quiz" = quiz préparé à l'avance. Il reste caché tant que le formateur ne l'a pas ouvert.
// "banque" = les questions toutes prêtes de la journée (pour le formateur et les révisions).
const JOURNEES = [
 {id:'2026-10-27', titre:'Mardi 27 octobre', theme:'EPMSP – Préparer son passage', diapos:16, dossier:'j1',
  docs:[{titre:'Télécharger toutes les diapos', fichier:'j1/Diapos_EPMSP_27-10.pdf'}],
  banque:BANQUE_J1,
  quiz:QUIZ_DEFAUT_J1}
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

// ===== Heures (le tableau Google écrit l'heure de Paris : « 27/10/2026 17:05:12 ») =====
function parisVersMs(y,mo,d,h,mi,s){
  const guess=Date.UTC(y,mo-1,d,h,mi,s);
  try{
    const f=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
    const dec=t=>{const p={};f.formatToParts(new Date(t)).forEach(x=>p[x.type]=+x.value);return Date.UTC(p.year,p.month-1,p.day,p.hour%24,p.minute,p.second)-t};
    let t=guess-dec(guess); t=guess-dec(t); return t;
  }catch(e){return new Date(y,mo-1,d,h,mi,s).getTime()}
}
function horoVersMs(s){
  s=String(s||'');
  let m=s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ T,]+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if(m)return parisVersMs(+m[3],+m[2],+m[1],+m[4],+m[5],+(m[6]||0));
  m=s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if(m)return parisVersMs(+m[1],+m[2],+m[3],+m[4],+m[5],+(m[6]||0));
  return null;
}
function jjmm(ms){try{return new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',day:'2-digit',month:'2-digit'}).format(new Date(ms))}catch(e){const d=new Date(ms);return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')}}
function heureParis(ms){try{return new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'}).format(new Date(ms))}catch(e){return new Date(ms).toTimeString().slice(0,5)}}
// Un quiz ouvert avec chrono se ferme tout seul 15 min + durée après son ouverture
function finQuiz(e){return (e&&e.ouvert&&e.duree>0&&e.ouvertAt)?e.ouvertAt+(15+e.duree)*60000:null}
function estOuvert(e){if(!e||!e.ouvert)return false;const f=finQuiz(e);return !(f&&Date.now()>f)}

// État général, lu dans le tableau « Mes quiz CQP » :
// - pour chaque journée : le dernier quiz enregistré et s'il est ouvert
//   (ligne « quiz » = nouveau contenu ; « ouvert » / « ferme » = visibilité ; « ouvert » peut contenir {"duree":5}) ;
// - les révisions : colonne Journée = « revision », Contenu = {"id",...} ;
// - les stagiaires : colonne Journée = « stagiaires », Statut = demande / accepte / refuse / supprime,
//   Contenu = {"id","nom","prenom"}. La ligne la plus récente gagne.
async function etatGeneral(){
  const etat={};JOURNEES.forEach(j=>etat[j.id]={quiz:j.quiz,ouvert:false,duree:0,ouvertAt:null,ouvCle:''});
  const stag={}, revs={};
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
      if(id==='revision'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(!c||!c.id)return;
        const r=revs[c.id]||(revs[c.id]={id:c.id,titre:'Révision',quiz:null,journees:[],ouvert:false,duree:0,ouvertAt:null,ouvCle:'',cree:n+1});
        if(st==='quiz'){if(quizValide(c.quiz))r.quiz=c.quiz;if(c.titre)r.titre=String(c.titre);if(Array.isArray(c.journees))r.journees=c.journees}
        else if(st==='ouvert'){r.ouvert=true;r.duree=+c.duree||0;r.ouvertAt=horoVersMs(l[0]);r.ouvCle=String(l[0]||'')+'#'+(n+1)}
        else if(st==='ferme')r.ouvert=false;
        return;
      }
      if(!etat[id])return;
      if(st==='quiz'){try{const z=JSON.parse(l[iC]||'');if(quizValide(z))etat[id].quiz=z}catch(e){}}
      else if(st==='ouvert'){let c={};try{c=JSON.parse(l[iC]||'{}')||{}}catch(e){}
        Object.assign(etat[id],{ouvert:true,duree:+c.duree||0,ouvertAt:horoVersMs(l[0]),ouvCle:String(l[0]||'')+'#'+(n+1)})}
      else if(st==='ferme')etat[id].ouvert=false;
    });
  }
  Object.keys(revs).forEach(k=>{if(!revs[k].quiz)delete revs[k]});
  return {quiz:etat,stagiaires:stag,revisions:revs};
}
async function etatQuiz(){return (await etatGeneral()).quiz}
// La révision « en cours » = la dernière préparée
function revisionCourante(revs){return Object.values(revs||{}).sort((a,b)=>b.cree-a.cree)[0]||null}
function nouvelId(){
  const a=new Uint8Array(9);crypto.getRandomValues(a);
  return [...a].map(x=>x.toString(36).padStart(2,'0')).join('').slice(0,14);
}
function memeNom(a,b){const f=x=>String(x||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');return f(a)===f(b)}

// ===== Banque de questions : outils =====
function toutesQuestions(){const t=[];JOURNEES.forEach(j=>(j.banque&&j.banque.questions||[]).forEach(q=>t.push(Object.assign({journee:j.id},q))));return t}
function questionParId(id){for(const j of JOURNEES){const q=(j.banque&&j.banque.questions||[]).find(x=>x.id===id);if(q)return q}return null}
function nomTheme(t){for(const j of JOURNEES){if(j.banque&&j.banque.themes&&j.banque.themes[t])return j.banque.themes[t]}return 'Autres questions'}
function copieQ(q){const c=JSON.parse(JSON.stringify(q));delete c.journee;return c}
function quizDepuisBanque(qz){return {ressenti:qz.ressenti.slice(),questions:qz.questions.map(id=>copieQ(questionParId(id))).filter(q=>q&&q.q)}}
// Durée estimée : ≈ 15 s par ligne de ressenti, ≈ 40 s par question
function dureeQuiz(z){const s=((z&&z.ressenti)||[]).length*15+((z&&z.questions)||[]).length*40;return Math.max(1,Math.round(s/60))}
function texteDuree(z){return `⏱️ environ ${dureeQuiz(z)} min`}
function melanger(a){a=a.slice();for(let i=a.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a}
function cleQ(q){return q.id||('t:'+q.q)}
// Remplace les questions non verrouillées : même thème d'abord, puis un autre thème. Jamais de doublon.
// « vus » garde ce qui a déjà été proposé, pour proposer du neuf à chaque fois.
function autreProposition(questions,verrous,pool,vus){
  vus=vus||new Set(); questions.forEach(q=>vus.add(cleQ(q)));
  const avant=new Set(questions.map(cleQ)), res=questions.slice();
  res.forEach((q,i)=>{
    if(verrous[i])return;
    const pris=new Set([...avant,...res.map(cleQ)]);
    const libres=pool.filter(p=>!pris.has(cleQ(p)));
    const neuf=libres.filter(p=>!vus.has(cleQ(p)));
    const essais=[neuf.filter(p=>p.theme===q.theme),neuf,libres.filter(p=>p.theme===q.theme),libres];
    for(const c of essais){if(c.length){const n=c[Math.floor(Math.random()*c.length)];res[i]=copieQ(n);vus.add(cleQ(n));return}}
  });
  return res;
}
// Tirage mélangé, réparti entre plusieurs paquets (thèmes ou journées), sans doublon
function tirerQuestions(paquets,n){
  const p=paquets.map(a=>melanger(a)).filter(a=>a.length), res=[], vu=new Set();
  let k=0;
  while(res.length<n&&p.some(a=>a.length)){const a=p[k%p.length];k++;if(!a.length)continue;const q=a.shift();if(vu.has(cleQ(q)))continue;vu.add(cleQ(q));res.push(copieQ(q))}
  return melanger(res);
}
function paquetsParTheme(questions){const m={};questions.forEach(q=>(m[q.theme||'autre']=m[q.theme||'autre']||[]).push(q));return Object.values(m)}

// ===== Texte des réponses envoyées dans le formulaire =====
// Format : « Q1 ✅ | Q2 ❌ (texte répondu) | Q3 ⏳ (pas répondu) — Score 1/3 (papier) [q:m02,j01,_] »
// (le [q:…] = numéros des questions de la banque, pour retrouver les questions plus tard)
function texteReponses(z,r,rep,papier){
  const bon=rep.filter((k,i)=>k===z.questions[i].b).length;
  const ressenti=z.ressenti.map((t,i)=>`${t} : ${r[i]>0?r[i]:'-'}/5`).join(' | ');
  const ids=z.questions.map(q=>q.id||'_');
  const reponses=z.questions.map((q,i)=>`Q${i+1} ${rep[i]<0?'⏳ (pas répondu)':rep[i]===q.b?'✅':'❌ ('+q.o[rep[i]]+')'}`).join(' | ')
    +` — Score ${bon}/${z.questions.length}`+(papier?' (papier)':'')+(ids.some(x=>x!=='_')?` [q:${ids.join(',')}]`:'');
  return {ressenti,reponses,bon};
}
function lireReponses(s){
  s=String(s||'');
  const m=s.match(/Score\s*(\d+)\/(\d+)/), im=s.match(/\[q:([^\]]*)\]/);
  const etats=[], re=/Q(\d+)\s*(✅|❌|⏳)(?:\s*\((.*?)\))?(?=\s*(?:\||—|$))/g;
  let x;while((x=re.exec(s))){etats[+x[1]-1]={etat:x[2]==='✅'?'ok':x[2]==='❌'?'ko':'na',rep:x[2]==='❌'?(x[3]||''):null}}
  return {score:m?+m[1]:null,total:Math.max(m?+m[2]:0,etats.length),etats,ids:im?im[1].split(',').map(t=>t==='_'?null:t):[],papier:/\(papier\)/.test(s)};
}
function lireRessenti(s){return String(s||'').split('|').map(p=>{const m=p.match(/(.+?)\s*:\s*(\d|-)\/5/);return m?{t:m[1].trim(),n:m[2]==='-'?0:+m[2]}:null}).filter(Boolean)}

// ===== Lien de transfert vers un nouveau téléphone (données dans #t=…) =====
function b64url(bytes){let s='';for(let i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function deb64url(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t);const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
async function encoderLien(obj){
  const bytes=new TextEncoder().encode(JSON.stringify(obj));
  if(typeof CompressionStream!=='undefined'){
    try{const cs=new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));return 'z'+b64url(new Uint8Array(await new Response(cs).arrayBuffer()))}catch(e){}
  }
  return 'j'+b64url(bytes);
}
async function decoderLien(t){
  const k=t[0], bytes=deb64url(t.slice(1));
  let txt;
  if(k==='z'){const ds=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));txt=await new Response(ds).text()}
  else if(k==='j')txt=new TextDecoder().decode(bytes);
  else throw new Error('format');
  return JSON.parse(txt);
}

// Prépare les journées (le quiz du jour est écrit avec les numéros de la banque)
function preparerJournee(j){if(j.quiz&&Array.isArray(j.quiz.questions))j.quiz.questions=j.quiz.questions.map(q=>typeof q==='string'?copieQ(questionParId(q)):q)}
JOURNEES.forEach(preparerJournee);
