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
   o:["Exigences Préalables à la Mise en Situation Pédagogique","Évaluation Pratique des Méthodes et Savoirs Pédagogiques","Épreuve Pratique de Mise en Situation Professionnelle"],
   b:0,e:"EPMSP veut dire : Exigences Préalables à la Mise en Situation Pédagogique."},
  {id:"e02",theme:"epmsp",q:"À quoi sert l'EPMSP ?",
   o:["À prouver que tu sais encadrer un groupe en sécurité","À prouver que tu as une très bonne condition physique","À prouver que tu connais beaucoup d'exercices"],
   b:0,e:"L'EPMSP sert à prouver que tu sais encadrer un groupe en sécurité, avant d'animer en stage."},
  {id:"e03",theme:"epmsp",q:"Quand dois-tu avoir réussi l'EPMSP ?",
   o:["Avant de rencontrer les autres stagiaires","Avant de commencer la formation","Avant d'animer des cours en stage"],
   b:2,e:"Il faut réussir l'EPMSP avant d'animer des cours en stage."},
  {id:"e05",theme:"epmsp",q:"Qui est présent pendant ton passage ?",
   o:["Seulement des pratiquants","Un jury et des pratiquants","Seulement un jury"],
   b:1,e:"Pendant ton passage, il y a un jury et des pratiquants : tu animes un vrai groupe."},
  {id:"e06",theme:"epmsp",q:"Que veut dire le sigle CQP ?",
   o:["Cours de Qualification Pratique","Certificat de Qualité Pédagogique","Certificat de Qualification Professionnelle"],
   b:2,e:"CQP veut dire : Certificat de Qualification Professionnelle."},
  {id:"e07",theme:"epmsp",q:"Dans « CQP CC », que veut dire CC ?",
   o:["Cours Collectifs","Cardio et Circuit","Coaching Complet"],
   b:0,e:"CC veut dire Cours Collectifs : c'est ton option."},
  {id:"j01",theme:"jury",q:"Que regarde surtout le jury pendant ton passage ?",
   o:["Ta tenue et le choix de ta musique","La sécurité des pratiquants et la tienne","La difficulté des exercices choisis"],
   b:1,e:"Le jury regarde d'abord la sécurité : celle des pratiquants et la tienne. Il regarde aussi les mouvements et le placement dans la salle."},
  {id:"j02",theme:"jury",q:"Ta propre sécurité compte-t-elle pour le jury ?",
   o:["Oui, le jury la regarde aussi","Non, seuls les pratiquants comptent","Non, seule la musique compte"],
   b:0,e:"Oui : le jury regarde la sécurité des pratiquants, et aussi ta propre sécurité."},
  {id:"j03",theme:"jury",q:"Quels mouvements le jury veut-il voir ?",
   o:["Des mouvements très difficiles","Des mouvements sans danger","Des mouvements très rapides"],
   b:1,e:"Le jury veut voir des mouvements sans danger, pas des mouvements difficiles."},
  {id:"j04",theme:"jury",q:"Parmi ces points, lequel le jury regarde-t-il ?",
   o:["Le nombre d'exercices différents","La marque de ton matériel","Le placement dans la salle"],
   b:2,e:"Le jury regarde le placement dans la salle : tout le monde doit bien te voir."},
  {id:"j05",theme:"jury",q:"Qu'est-ce qui peut faire rater ton passage ?",
   o:["Choisir la version Tabata","Faire un échauffement de 4 minutes","Oublier la sécurité des pratiquants"],
   b:2,e:"La sécurité, c'est ce que le jury regarde en premier. Le Tabata est permis, et 4 minutes d'échauffement, c'est l'exemple du cours."},
  {id:"m01",theme:"minutes",q:"Combien de temps dure ton passage ?",
   o:["20 minutes","10 minutes","45 minutes"],
   b:0,e:"Ton passage dure 20 minutes."},
  {id:"m02",theme:"minutes",q:"Que montres-tu pendant tes 20 minutes ?",
   o:["Seulement le corps de la séance","Seulement quelques exercices au choix","Une séance entière, du début à la fin"],
   b:2,e:"Tes 20 minutes sont une séance entière : échauffement, corps de séance, retour au calme, puis étirements."},
  {id:"m03",theme:"minutes",q:"Dans quel ordre se passe la séance ?",
   o:["Échauffement, étirements, corps de séance, retour au calme","Échauffement, corps de séance, retour au calme, étirements","Corps de séance, échauffement, étirements, retour au calme"],
   b:1,e:"L'ordre : échauffement, corps de séance, retour au calme, puis étirements."},
  {id:"m04",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure l'échauffement ?",
   o:["1 minute","8 minutes","4 minutes"],
   b:2,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m05",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure le corps de séance ?",
   o:["11 minutes","4 minutes","16 minutes"],
   b:0,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m06",theme:"minutes",q:"Dans l'exemple du cours, combien de temps dure le retour au calme ?",
   o:["10 minutes","2 minutes","6 minutes"],
   b:1,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m07",theme:"minutes",q:"Dans l'exemple du cours, combien de temps durent les étirements ?",
   o:["8 minutes","10 minutes","3 minutes"],
   b:2,e:"Dans l'exemple : 4 min d'échauffement, 11 min de corps de séance, 2 min de retour au calme, 3 min d'étirements."},
  {id:"m08",theme:"minutes",q:"Quelle partie de la séance dure le plus longtemps ?",
   o:["L'échauffement","Le corps de séance","Les étirements"],
   b:1,e:"Le corps de séance est la partie la plus longue : 11 minutes sur 20 dans l'exemple."},
  {id:"m09",theme:"minutes",q:"À quoi sert l'échauffement ?",
   o:["À faire les exercices les plus durs","À mettre le corps en route en douceur","À relâcher les muscles travaillés"],
   b:1,e:"L'échauffement met le corps en route en douceur : le cœur monte, les articulations bougent, on prépare les mouvements du cours."},
  {id:"m10",theme:"minutes",q:"Que fait-on pendant le corps de séance ?",
   o:["Des étirements doux, sans à-coups","Les exercices de renforcement","Des mouvements lents pour se calmer"],
   b:1,e:"Le corps de séance, c'est le cœur du cours : les exercices de renforcement, avec les consignes, la sécurité et les adaptations."},
  {id:"m11",theme:"minutes",q:"Pendant le corps de séance, que donnes-tu en plus des exercices ?",
   o:["Le nombre de calories dépensées","Le classement de chaque pratiquant","Les consignes, la sécurité, les adaptations"],
   b:2,e:"Dans le corps de séance, tu donnes les consignes, tu veilles à la sécurité et tu proposes des adaptations."},
  {id:"m12",theme:"minutes",q:"À quoi sert le retour au calme ?",
   o:["À faire redescendre le cœur et la respiration","À faire les exercices les plus intenses","À faire monter le cœur avant l'effort"],
   b:0,e:"Le retour au calme fait redescendre le cœur et la respiration, avec des mouvements lents."},
  {id:"m13",theme:"minutes",q:"Comment fait-on les étirements ?",
   o:["Doucement, sans à-coups","Vite, avec de petits rebonds","En forçant le plus possible"],
   b:0,e:"Les étirements relâchent les muscles travaillés, doucement, sans à-coups."},
  {id:"b01",theme:"briefing",q:"Quand fais-tu le briefing de sécurité ?",
   o:["À la fin du cours","Au début du cours","Pendant les étirements"],
   b:1,e:"Le briefing se fait au début du cours, avant de commencer."},
  {id:"b02",theme:"briefing",q:"Combien de temps dure ton briefing devant le groupe ?",
   o:["10 minutes","5 à 6 minutes","1 à 2 minutes"],
   b:2,e:"Ton briefing de sécurité dure 1 à 2 minutes : court et clair."},
  {id:"b03",theme:"briefing",q:"Au briefing, que demandes-tu sur la santé ?",
   o:["S'ils ont une douleur ou une blessure","S'ils ont déjà fait ce cours","S'ils ont bien mangé avant le cours"],
   b:0,e:"Tu demandes : « Des douleurs, une blessure, un souci de santé ? Dites-le-moi. »"},
  {id:"b04",theme:"briefing",q:"Au briefing, que vérifies-tu pour la tenue ?",
   o:["Une tenue de la même couleur pour tous","Une tenue et des chaussures adaptées","Une tenue neuve, achetée pour le cours"],
   b:1,e:"Tu vérifies que la tenue et les chaussures sont adaptées."},
  {id:"b05",theme:"briefing",q:"Où doit être la bouteille d'eau ?",
   o:["Sur le tapis, pour boire plus vite","Dans le vestiaire, loin de la salle","À portée de main, hors de la zone de travail"],
   b:2,e:"L'eau est à portée de main, mais pas sur la zone de travail."},
  {id:"b06",theme:"briefing",q:"Pourquoi le chewing-gum est-il interdit ?",
   o:["Il peut salir le sol de la salle","Il gêne pour entendre la musique","On risque de s'étouffer pendant l'effort"],
   b:2,e:"Le chewing-gum est interdit : on risque de s'étouffer pendant l'effort."},
  {id:"b07",theme:"briefing",q:"En cas de douleur ou de malaise, que dis-tu au groupe de faire ?",
   o:["De ralentir et de continuer","De s'arrêter et de me prévenir","D'attendre la fin du cours"],
   b:1,e:"Tu dis au groupe : « On s'arrête et on me prévient. »"},
  {id:"s01",theme:"salle",q:"Où mets-tu les bouteilles d'eau et les serviettes ?",
   o:["Au bord de la salle, ou la serviette déjà sur le tapis","Au milieu de la salle, près du coach","Sous les tapis des pratiquants"],
   b:0,e:"Les bouteilles sont rangées au bord de la salle, jamais au milieu. Les serviettes aussi, ou bien déjà posées sur le tapis du pratiquant."},
  {id:"s02",theme:"salle",q:"Comment doit être le sol de la salle ?",
   o:["Sec, avec rien qui traîne","Un peu mouillé, pour moins glisser","Couvert de serviettes"],
   b:0,e:"Le sol doit être sec, avec rien qui traîne."},
  {id:"s03",theme:"salle",q:"Quand vérifies-tu le matériel ?",
   o:["Pendant les étirements","Avant le cours","Après le cours"],
   b:1,e:"Le matériel se vérifie avant le cours."},
  {id:"s04",theme:"salle",q:"Que fais-tu du matériel qui ne sert plus ?",
   o:["Tu le ranges à sa place","Tu le laisses près du tapis","Tu le poses au milieu de la salle"],
   b:0,e:"Le matériel est rangé dès qu'il ne sert plus."},
  {id:"s05",theme:"salle",q:"Comment doit être l'espace entre les pratiquants ?",
   o:["Assez grand pour bouger sans se gêner","Très serré, pour faire entrer tout le monde","Occupé par le matériel du cours"],
   b:0,e:"Il faut assez de place entre les pratiquants."},
  {id:"s07",theme:"salle",q:"Pendant la séance, quelles sont tes 3 actions pour la sécurité ?",
   o:["Montrer, accélérer, répéter","Observer, corriger, arrêter","Compter, chanter, encourager"],
   b:1,e:"Pendant la séance : observer, corriger, et arrêter un mouvement dangereux."},
  {id:"s08",theme:"salle",q:"Que fais-tu si un pratiquant fait un mouvement dangereux ?",
   o:["Tu le laisses finir sa série","Tu en parles à la fin du cours","Tu te déplaces pour aller le corriger"],
   b:2,e:"Tu ne restes pas sur l'estrade : tu te déplaces jusqu'au pratiquant pour corriger son mouvement tout de suite."},
  {id:"p01",theme:"placement",q:"Pourquoi te déplaces-tu parmi les pratiquants pendant la séance ?",
   o:["Pour te reposer un peu","Pour aller corriger une posture","Pour compter les pratiquants"],
   b:1,e:"Tu peux quitter l'estrade pour aller corriger la posture d'un pratiquant, si besoin."},
  {id:"p02",theme:"placement",q:"Comment places-tu les tapis des pratiquants ?",
   o:["En une seule longue ligne","En cercle autour du coach","Parallèles au tapis du coach"],
   b:2,e:"Les tapis des pratiquants sont parallèles au tapis du coach."},
  {id:"p03",theme:"placement",q:"Les tapis sont en quinconce, c'est-à-dire décalés d'une ligne à l'autre. Pourquoi ?",
   o:["Chacun voit l'estrade entre les tapis de devant","Chacun est plus près d'un mur","On peut mettre plus de monde dans la salle"],
   b:0,e:"En quinconce, chacun voit l'estrade entre les deux tapis de devant."},
  {id:"p04",theme:"placement",q:"Pour un exercice debout, où se place le pratiquant ?",
   o:["Derrière son tapis","À côté de son tapis","Devant son tapis"],
   b:0,e:"Debout, le pratiquant se place derrière son tapis."},
  {id:"p05",theme:"placement",q:"Allongé sur le dos, où le pratiquant met-il sa tête ?",
   o:["Vers son voisin","Vers le centre","Vers l'extérieur"],
   b:2,e:"Sur le dos : tête vers l'extérieur."},
  {id:"p06",theme:"placement",q:"À quatre pattes ou sur le ventre, où va la tête du pratiquant ?",
   o:["Vers son voisin","Vers l'extérieur","Vers le centre"],
   b:2,e:"À quatre pattes et sur le ventre : tête vers le centre."},
  {id:"p07",theme:"placement",q:"Le coach peut-il quitter l'estrade ?",
   o:["Oui, mais seulement pour boire","Non, jamais pendant le cours","Oui, pour corriger une posture si besoin"],
   b:2,e:"Le coach peut quitter l'estrade pour corriger une posture, si besoin."},
  {id:"p08",theme:"placement",q:"Où se trouve le tapis du coach ?",
   o:["Au fond de la salle","Sur l'estrade, face au groupe","Au milieu des pratiquants"],
   b:1,e:"Le tapis du coach est sur l'estrade, face au groupe."},
  {id:"t01",theme:"musique",q:"À l'EPMSP, peux-tu choisir entre musique et Tabata ?",
   o:["Oui, c'est au choix","Non, le Tabata est obligatoire","Non, la musique est obligatoire"],
   b:0,e:"Pour l'EPMSP, c'est au choix. Attention : à l'examen final, la musique peut être imposée."},
  {id:"t02",theme:"musique",q:"Sur la musique, comment se font les mouvements ?",
   o:["Ils suivent un minuteur","Ils se font sans rythme précis","Ils suivent le rythme de la musique"],
   b:2,e:"Sur la musique, les mouvements suivent le rythme de la musique."},
  {id:"t03",theme:"musique",q:"Qu'est-ce que la version Tabata ?",
   o:["Une séance d'étirements lents et doux","Des temps d'effort et de repos, réglés sur un minuteur","Des mouvements qui suivent le rythme de la musique"],
   b:1,e:"En Tabata, il y a des temps d'effort et de repos, réglés sur un minuteur."},
  {id:"t05",theme:"musique",q:"À l'examen final, que peut-on t'imposer ?",
   o:["Le Tabata","La musique","Le nombre de pratiquants"],
   b:1,e:"À l'examen final, la musique peut être imposée."},
  {id:"t06",theme:"musique",q:"Pourquoi dois-tu savoir animer sur la musique ?",
   o:["Elle peut être imposée à l'examen final","Le Tabata est interdit en cours collectifs","Elle est obligatoire à l'EPMSP"],
   b:0,e:"Pour l'EPMSP c'est au choix, mais à l'examen final la musique peut être imposée."}
 ],
 categories:[
  {id:"epmsp",emoji:"🎯",titre:"L'EPMSP, c'est quoi",themes:["epmsp","jury"],quiz:[
   {id:"epmsp-1",titre:"L'EPMSP et les mots à connaître",ressenti:["Ce qu'est l'EPMSP et à quoi elle sert","Le sens des mots CQP, EPMSP et CC","Comment se passe le passage"],questions:["e01","e02","e03","e05","e06","e07","j01","j02","j03","m01"]},
   {id:"epmsp-2",titre:"Ce que regarde le jury",ressenti:["Ce que le jury observe","Ce qui peut faire rater un passage","Comment se passe le passage"],questions:["j01","j02","j03","j04","j05","e02","e03","e05","m01","m02"]}]},
  {id:"minutes",emoji:"⏱️",titre:"Mes 20 minutes",themes:["minutes"],quiz:[
   {id:"minutes-1",titre:"Les 4 parties et leur durée",ressenti:["Les 4 parties de la séance","Comment répartir mes 20 minutes"],questions:["m01","m02","m03","m04","m05","m06","m07","m08","m09","m10"]},
   {id:"minutes-2",titre:"Le rôle de chaque partie",ressenti:["Le rôle de l'échauffement et du retour au calme","Ce que je fais dans le corps de séance"],questions:["m02","m03","m08","m09","m10","m11","m12","m13","m04","m05"]}]},
  {id:"securite",emoji:"🛡️",titre:"La sécurité",themes:["briefing","salle","placement"],quiz:[
   {id:"securite-1",titre:"Le briefing et la salle",ressenti:["Ce que je dis dans mon briefing","Comment préparer la salle","Comment réagir en cas de douleur"],questions:["b01","b02","b03","b04","b05","b06","b07","s01","s02","s03"]},
   {id:"securite-2",titre:"La salle et le placement",ressenti:["Comment surveiller pendant la séance","Comment placer les tapis","Où mettre la tête selon la position"],questions:["s04","s05","s07","s08","p01","p02","p03","p04","p05","p06"]},
   {id:"securite-3",titre:"La sécurité, tout mélangé",ressenti:["Le briefing de début de cours","La salle sans danger","Le placement des pratiquants"],questions:["b02","b05","b06","s01","s08","p03","p05","p06","p07","p08"]}]},
  {id:"musique",emoji:"🎵",titre:"Musique ou Tabata",themes:["musique"],quiz:[
   {id:"musique-1",titre:"Musique, Tabata et passage",ressenti:["La différence entre musique et Tabata","Ce qui est au choix pour l'EPMSP","Comment se passe le passage"],questions:["t01","t02","t03","t05","t06","m01","m02","m03","j01","e02"]}]},
  {id:"revision",emoji:"🔀",titre:"Révision de la journée",themes:[],quiz:[
   {id:"revision-1",titre:"Le tour de la journée",ressenti:["Ce qu'est l'EPMSP et comment se passe le passage","Comment répartir mes 20 minutes","La sécurité et le placement"],questions:["e02","j01","m02","m03","m08","b03","b07","s07","p02","t01"]},
   {id:"revision-2",titre:"Spécial sécurité et passage",ressenti:["Ce que le jury observe","Mon briefing de sécurité","Le placement des pratiquants"],questions:["j03","j05","m11","b06","s05","s08","p01","p04","p05","t05"]},
   {id:"revision-3",titre:"Révision express",ressenti:["Les points clés de la journée"],questions:["e01","e05","m01","m05","b01","b02","s02","p07","t03","t06"]}]}
 ]
};
const QUIZ_DEFAUT_J1={"ressenti":["Ce qu'est l'EPMSP et comment se passe le passage","Comment répartir mes 20 minutes","La sécurité et le placement"],"questions":["m02","j01","t01","m03","m08","b03","b07","s07","p03","p05"]};
// </BANQUE_J1>

// ===== Journées (on ajoute une journée ici à chaque intervention) =====
// "quiz" = quiz préparé à l'avance. Il reste caché tant que le formateur ne l'a pas ouvert.
// "banque" = les questions toutes prêtes de la journée (pour le formateur et les révisions).
const JOURNEES = [
 {id:'2026-10-27', titre:'Mardi 27 octobre', theme:'EPMSP – Préparer son passage', diapos:16, dossier:'j1',
  docs:[{titre:'Télécharger toutes les diapos', fichier:'j1/Diapos_EPMSP_27-10.pdf'}],
  banque:BANQUE_J1,
  quiz:QUIZ_DEFAUT_J1},
 // 29/10 : les journées suivantes du planning (pas encore de diapos ; le quiz se prépare dans l'espace formateur)
 {id:'2026-10-30', titre:'Vendredi 30 octobre (matin)', theme:'EPMSP – Passages complets de 20 min avec la grille', diapos:6, dossier:'j2',
  docs:[{titre:'Télécharger tous les documents', fichier:'j2/Documents_30-10.pdf'}],
  quiz:{ressenti:[],questions:[]}},
 {id:'2026-11-06', titre:'Vendredi 6 novembre (matin)', theme:'EPMSP – Examen blanc', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2026-12-11', titre:'Vendredi 11 décembre (matin)', theme:'Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2027-01-08', titre:'Vendredi 8 janvier (matin)', theme:'BC1 – Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2027-01-29', titre:'Vendredi 29 janvier (matin)', theme:'BC1 – Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2027-02-12', titre:'Vendredi 12 février (matin)', theme:'BC1 – Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2027-02-19', titre:'Vendredi 19 février (matin)', theme:'BC1 – Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}},
 {id:'2027-02-26', titre:'Vendredi 26 février (matin)', theme:'BC1 – Cours collectifs', diapos:0, quiz:{ressenti:[],questions:[]}}
];
// Un quiz vide (aucune question, aucune ligne de ressenti) n'est jamais montré aux stagiaires
function quizVide(z){return !z||!((z.questions||[]).length||(z.ressenti||[]).length)}

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
  return fetch(url,{method:'POST',mode:'no-cors',body:d,keepalive:true});
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
// - la roue : colonne Journée = « roue » ; Statut = tirage (le tirage complet, le plus récent gagne),
//   lance (un stagiaire a lancé la roue), liste (cases d'une roue modifiée), perso (« Ma roue » enregistrée).
const CLES_EN_ATTENTE={};
// ===== Retours d'observation : chiffrés pour que seul le stagiaire concerné puisse les lire =====
function b64(u8){let s='';u8.forEach(x=>s+=String.fromCharCode(x));return btoa(s)}
function deB64(t){return Uint8Array.from(atob(t),c=>c.charCodeAt(0))}
async function chiffrerPour(pubJwk,obj){
  const C=crypto.subtle;
  const pub=await C.importKey('jwk',pubJwk,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const eph=await C.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);
  const k=await C.deriveKey({name:'ECDH',public:pub},eph.privateKey,{name:'AES-GCM',length:256},false,['encrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ct=new Uint8Array(await C.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(JSON.stringify(obj))));
  return {epk:await C.exportKey('jwk',eph.publicKey),iv:b64(iv),ct:b64(ct)};
}
async function dechiffrerAvec(privJwk,m){
  const C=crypto.subtle;
  const priv=await C.importKey('jwk',privJwk,{name:'ECDH',namedCurve:'P-256'},false,['deriveKey']);
  const epk=await C.importKey('jwk',m.epk,{name:'ECDH',namedCurve:'P-256'},false,[]);
  const k=await C.deriveKey({name:'ECDH',public:epk},priv,{name:'AES-GCM',length:256},false,['decrypt']);
  const pt=await C.decrypt({name:'AES-GCM',iv:deB64(m.iv)},k,deB64(m.ct));
  return JSON.parse(new TextDecoder().decode(pt));
}
async function nouvellesCles(){
  const C=crypto.subtle, kp=await C.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveKey']);
  return {priv:await C.exportKey('jwk',kp.privateKey),pub:await C.exportKey('jwk',kp.publicKey)};
}
async function etatGeneral(){
  const etat={};JOURNEES.forEach(j=>etat[j.id]={quiz:j.quiz,ouvert:false,duree:0,ouvertAt:null,ouvCle:''});
  const stag={}, revs={}, roue={tirage:null,lances:{},listes:{},persos:{}}, fiches={ouverts:[]}, diapos={ouverts:[]}, reouv=[], retours=[];
  const deroules={}, minuteur={montrer:false}, prepCours={montrer:false,modeles:null,choisi:null};
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
          if(!s0)stag[c.id]={id:c.id,nom:String(c.nom||'').trim(),prenom:String(c.prenom||'').trim(),statut:'attente',n:n+1,date:l[0]||'',st:c.st==='apprenti'?'apprenti':'stagiaire',str:String(c.str||'').trim()};
        }else if(st==='type'){
          if(s0&&c.st)s0.st=c.st==='apprenti'?'apprenti':'stagiaire';
          if(s0&&typeof c.str==='string')s0.str=c.str.trim();
        }else if(['accepte','refuse','supprime','efface'].includes(st)){
          stag[c.id]=Object.assign(s0||{id:c.id,nom:String(c.nom||'').trim(),prenom:String(c.prenom||'').trim(),date:l[0]||''},{statut:st,n:n+1});
        }
        return;
      }
      if(id==='roue'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(!c||typeof c!=='object')return;
        if(st==='tirage'&&c.id&&Array.isArray(c.roues)&&c.res&&typeof c.res==='object'){if(!roue.tirage||(+c.at||0)>=(+roue.tirage.at||0))roue.tirage=c}
        else if(st==='lance'&&c.id&&c.s){const t=roue.lances[c.id]||(roue.lances[c.id]={});t[c.s]=Math.max(t[c.s]||0,+c.m||1)}
        else if(st==='liste'&&c.roue&&Array.isArray(c.cases))roue.listes[c.roue]=c.cases.map(String).filter(x=>x.trim());
        else if(st==='perso'&&c.nom){const k=memeNomCle(c.nom);if(c.supprime)delete roue.persos[k];else if(Array.isArray(c.cases))roue.persos[k]={nom:String(c.nom),cases:c.cases.map(String)}}
        return;
      }
      // fiches de révision ouvertes aux stagiaires (la dernière ligne gagne)
      // clé publique d'un stagiaire (pour que lui seul puisse lire ses retours)
      if(id==='cles'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(c&&c.id&&c.pub&&stag[c.id])stag[c.id].pub=c.pub;
        else if(c&&c.id&&c.pub)(CLES_EN_ATTENTE[c.id]=c.pub);
        return;
      }
      // retour d'observation chiffré pour un stagiaire : {sid, epk, iv, ct}
      if(id==='retour'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(c&&c.sid&&c.ct)retours.push(c);
        return;
      }
      // Hamid redonne accès à un quiz quitté (appel…) : {sid, cle}
      if(id==='reouvrir'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(c&&c.sid&&c.cle)reouv.push({sid:String(c.sid),cle:String(c.cle),at:horoVersMs(l[0])||0});
        return;
      }
      // diaporamas montrés aux stagiaires : liste des journées (la dernière ligne gagne)
      if(id==='diapos'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(st==='etat'&&c&&Array.isArray(c.ouverts))diapos.ouverts=c.ouverts.map(String);
        return;
      }
      // 29/10 : « Mon déroulé prévu » d'une journée (espace formateur seulement) : {id, texte, at} — la dernière ligne gagne
      if(id==='deroule'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(c&&c.id&&typeof c.texte==='string')deroules[c.id]={texte:c.texte,at:+c.at||horoVersMs(l[0])||0};
        return;
      }
      // 29/10 : minuteur montré ou non aux stagiaires : {montrer:true/false} — la dernière ligne gagne
      if(id==='minuteur'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(st==='etat'&&c&&typeof c.montrer==='boolean')minuteur.montrer=c.montrer;
        return;
      }
      // 29/10 : « 📝 Je prépare mon cours » : {montrer, choisi, modeles:[{id,nom,parties:[{id,n,m}]}]} — la dernière ligne gagne
      if(id==='coursprep'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(st==='etat'&&c&&typeof c==='object'){
          if(typeof c.montrer==='boolean')prepCours.montrer=c.montrer;
          if(Array.isArray(c.modeles)&&c.modeles.length){prepCours.modeles=c.modeles;prepCours.choisi=c.choisi||c.modeles[0].id}
        }
        return;
      }
      if(id==='fiches'){
        let c;try{c=JSON.parse(l[iC]||'')}catch(e){return}
        if(st==='etat'&&c&&Array.isArray(c.ouverts))fiches.ouverts=c.ouverts.map(String);
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
  Object.entries(CLES_EN_ATTENTE).forEach(([k,v])=>{if(stag[k]&&!stag[k].pub)stag[k].pub=v});
  return {quiz:etat,stagiaires:stag,revisions:revs,roue,fiches,diapos,reouv,retours,deroules,minuteur,prepCours};
}
async function etatQuiz(){return (await etatGeneral()).quiz}
// La révision « en cours » = la dernière préparée
function revisionCourante(revs){return Object.values(revs||{}).sort((a,b)=>b.cree-a.cree)[0]||null}
function nouvelId(){
  const a=new Uint8Array(9);crypto.getRandomValues(a);
  return [...a].map(x=>x.toString(36).padStart(2,'0')).join('').slice(0,14);
}
function memeNomCle(x){return String(x||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ')}
function memeNom(a,b){const f=x=>String(x||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ');return f(a)===f(b)}

// ===== Banque de questions : outils =====
function toutesQuestions(){const t=[];JOURNEES.forEach(j=>(j.banque&&j.banque.questions||[]).forEach(q=>t.push(Object.assign({journee:j.id},q))));return t}
function questionParId(id){if(typeof id==='string'&&id.startsWith('g:'))return genQuestion(id);for(const j of JOURNEES){const q=(j.banque&&j.banque.questions||[]).find(x=>x.id===id);if(q)return q}return null}
function nomTheme(t){if(GEN_THEMES[t])return GEN_THEMES[t];for(const j of JOURNEES){if(j.banque&&j.banque.themes&&j.banque.themes[t])return j.banque.themes[t]}return 'Autres questions'}
function copieQ(q){const c=JSON.parse(JSON.stringify(q));delete c.journee;return c}
function quizDepuisBanque(qz){return {ressenti:qz.ressenti.slice(),questions:qz.questions.map(id=>copieQ(questionParId(id))).filter(q=>q&&q.q)}}
// Durée estimée : ≈ 15 s par ligne de ressenti, ≈ 25 s par question
function dureeQuiz(z){const s=((z&&z.ressenti)||[]).length*15+((z&&z.questions)||[]).length*25;return Math.max(1,Math.round(s/60))}
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

// ===== 29/10 : générateur de questions à partir des fiches d'exercices (fiches.js : RENFO et ETIR seulement) =====
// Chaque question a un numéro « g:… » fabriqué à partir du nom de l'exercice : la même question revient
// toujours avec les mêmes réponses (dans le même ordre), sur tous les téléphones.
// Types : p = placement, e = exécution, s = sécurité, c = des deux côtés ?, m = méthode (étirements).
const GEN_THEMES={'renfo.bas':'Renfo · bas du corps','renfo.haut':'Renfo · haut du corps','renfo.abdos':'Renfo · abdos',
  'etir.bas':'Étirements · bas du corps','etir.haut':'Étirements · haut du corps','etir.abdos':'Étirements · abdos'};
const GEN_ARTICLE={quadriceps:'des quadriceps',ischios:'des ischios',fessiers:'des fessiers',psoas:'du psoas',adducteurs:'des adducteurs',mollets:'des mollets',
  poitrine:'de la poitrine',epaules:'des épaules',dos:'du dos',biceps:'des biceps',triceps:'des triceps',cervicales:'des cervicales',
  'grand droit':'du grand droit',obliques:'des obliques',lombaires:'des lombaires'};
let GEN_CACHE=null;
function genHash(t){let h=5381;t=String(t);for(let i=0;i<t.length;i++)h=((h*33)^t.charCodeAt(i))>>>0;return h}
function genAlea(graine){let a=genHash(graine)||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function genMelanger(a,r){a=a.slice();for(let i=a.length-1;i>0;i--){const k=Math.floor(r()*(i+1));[a[i],a[k]]=[a[k],a[i]]}return a}
function genNorm(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()}
function genMots(t){return new Set(genNorm(t).split(' ').filter(m=>m.length>3))}
// ressemblance de 0 (rien en commun) à 1 (mêmes mots)
function genProche(a,b){const A=genMots(a),B=genMots(b);if(!A.size||!B.size)return genNorm(a)===genNorm(b)?1:0;let n=0;A.forEach(m=>{if(B.has(m))n++});return n/(A.size+B.size-n)}
function genMin(t){t=String(t||'');return /^[A-ZÀ-Ý][a-zà-ÿ]/.test(t)?t[0].toLowerCase()+t.slice(1):t}
function genNomExo(src,g,c,v){
  if(src==='etir'){const a=GEN_ARTICLE[genNorm(c.c)];return `Étirement ${a||'– '+c.c} (${genMin(v[0])})`}
  if(g.k==='bas'&&!genNorm(v[0]).includes(genNorm(c.c).split(' ')[0]))return `${c.c} (${genMin(v[0])})`;
  return v[0];
}
function genTout(){
  if(GEN_CACHE)return GEN_CACHE;
  const L=[], par={};
  if(typeof RENFO==='undefined'||typeof ETIR==='undefined')return {liste:[],par:{}}; // fiches.js pas chargé
  [['renfo',RENFO],['etir',ETIR]].forEach(([src,A])=>A.forEach(g=>{
    const theme=src+'.'+g.k;
    g.cases.forEach(c=>c.v.forEach(v=>L.push({src,theme,g,c,v,nom:genNomExo(src,g,c,v),cle:(genHash(c.c+'|'+v[0])).toString(36)})));
  }));
  const methodes=[...new Set(L.filter(x=>x.src==='etir'&&x.v[5]).map(x=>String(x.v[5]).trim()))];
  const CH={p:[2,'quel est le bon placement ?','Placement'],e:[3,'quelle est la bonne exécution ?','Exécution'],s:[4,'quelle est la bonne consigne de sécurité ?','Sécurité']};
  L.forEach(x=>{
    const base='g:'+x.theme+'.'+x.cle+'.';
    Object.entries(CH).forEach(([t,[f,fin,champ]])=>{
      const bon=String(x.v[f]||'').trim(); if(!bon)return;
      const id=base+t, r=genAlea(id);
      // les mauvaises réponses : d'autres exercices du même thème, assez différentes de la bonne et entre elles
      const prem=genNorm(bon).split(' ')[0];
      let cand=L.filter(y=>y.theme===x.theme&&y!==x).map(y=>({y,t:String(y.v[f]||'').trim()}))
        .filter(o=>o.t&&genNorm(o.t)!==genNorm(bon)&&genProche(o.t,bon)<0.45);
      cand=genMelanger(cand,r);
      // d'abord un autre exercice ; pour le placement, la même position de départ (sinon la réponse se devine)
      const rang=o=>(o.y.c===x.c?2:0)+(t==='p'&&genNorm(o.t).split(' ')[0]!==prem?1:0);
      cand.sort((a,b)=>rang(a)-rang(b));
      const pris=[];
      for(const o of cand){if(pris.length>=2)break;if(pris.every(p=>genNorm(p.t)!==genNorm(o.t)&&genProche(p.t,o.t)<0.45))pris.push(o)}
      if(pris.length<2)return;
      const o=genMelanger([bon,pris[0].t,pris[1].t],r);
      par[id]={id,theme:x.theme,q:`${x.nom} : ${fin}`,o,b:o.indexOf(bon),e:`Fiche « ${x.nom} » – ${champ} : ${bon}`};
    });
    // des deux côtés ?
    if(x.v[1]===0||x.v[1]===1){const id=base+'c';
      par[id]={id,theme:x.theme,q:`${x.nom} : se fait-il des deux côtés ?`,o:['Oui','Non'],b:x.v[1]?0:1,
        e:x.v[1]?`Oui : ${genMin(x.nom)} se fait d'un côté, puis de l'autre.`:`Non : ${genMin(x.nom)} ne se fait pas d'un côté puis de l'autre.`}}
    // méthode d'étirement
    if(x.src==='etir'&&x.v[5]&&methodes.length>=3){const id=base+'m', r=genAlea(id), bon=String(x.v[5]).trim();
      const o=genMelanger([bon].concat(genMelanger(methodes.filter(m=>m!==bon),r).slice(0,2)),r);
      par[id]={id,theme:x.theme,q:`${x.nom} : quelle est la méthode d'étirement ?`,o,b:o.indexOf(bon),e:`Fiche « ${x.nom} » – Méthode : ${bon}`}}
  });
  GEN_CACHE={liste:Object.keys(par),par};
  return GEN_CACHE;
}
function genQuestion(id){const q=genTout().par[id];return q?JSON.parse(JSON.stringify(q)):null}
// toutes les questions d'un thème (« tout » = les 6 thèmes)
function genIds(theme){const T=genTout();return T.liste.filter(id=>theme==='tout'||T.par[id].theme===theme)}
// une question tirée au hasard, jamais une question déjà dans le quiz (même numéro ou même texte), ni une déjà vue si possible
function genProposer(theme,dejaQuestions,vus){
  const ids=new Set((dejaQuestions||[]).map(q=>q.id).filter(Boolean)), txt=new Set((dejaQuestions||[]).map(q=>genNorm(q.q)));
  const libres=genIds(theme).filter(id=>!ids.has(id)&&!txt.has(genNorm(genTout().par[id].q)));
  if(!libres.length)return null;
  const neufs=libres.filter(id=>!(vus&&vus.has(id))), L=neufs.length?neufs:libres;
  return genQuestion(L[Math.floor(Math.random()*L.length)]);
}

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

// ===== 27/10 : cadres repliables (espace stagiaires et espace formateur) =====
// Toucher le titre d'un cadre le ferme (seul le titre reste) ; le retoucher le rouvre. Ouvert par défaut ;
// le choix est retenu sur ce téléphone. Jamais pour : formulaires (quiz, notes, code), messages d'erreur ou d'attente.
(function(){
  const CLE='cqpf_plies', NON=/connexion|impossible|quitté|code d'accès|qui es-tu|c'est bien toi|demande est envoyée|accès non actif|déjà à un autre nom|arrive bientôt|tu as \d+ minute/i;
  let plies; try{plies=new Set(JSON.parse(localStorage.getItem(CLE)||'[]'))}catch(e){plies=new Set()}
  const garder=()=>{try{localStorage.setItem(CLE,JSON.stringify([...plies].slice(-300)))}catch(e){}};
  const st=document.createElement('style');
  st.textContent='.card.plie>*:not(h2.pli-t){display:none!important}.card.plie{padding-bottom:14px}h2.pli-t{cursor:pointer;-webkit-tap-highlight-color:transparent}.pli-f{font-size:.7em;opacity:.55;margin-left:6px;font-weight:400}';
  document.head.appendChild(st);
  const titre=c=>[...c.children].find(x=>x.tagName==='H2');
  const cle=(c,h)=>(location.pathname.split('/').pop()||'index')+'|'+h.textContent.replace(/[▸▾]/g,'').replace(/\(?\d+\)?/g,'#').replace(/\s+/g,' ').trim();
  const prep=c=>{
    if(c.dataset.pli||c.tagName==='DETAILS'||c.classList.contains('nopli'))return;
    const h=titre(c); if(!h||c.querySelector('input,textarea,select')||NON.test(h.textContent))return;
    c.dataset.pli=1; h.classList.add('pli-t');
    const f=document.createElement('span');f.className='pli-f';h.appendChild(f);
    const k=cle(c,h), maj=()=>{const p=plies.has(k);c.classList.toggle('plie',p);f.textContent=p?'▸':'▾'};
    maj();
    h.addEventListener('click',e=>{if(e.target.closest('button,a,input'))return;plies.has(k)?plies.delete(k):plies.add(k);garder();maj()});
  };
  const tout=()=>document.querySelectorAll('#app .card').forEach(prep);
  const go=()=>{const a=document.getElementById('app');if(!a)return;tout();new MutationObserver(tout).observe(a,{childList:true,subtree:true})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();

// 30/10 : documents montrés un par un (« jour » = tous, « jour#3 » = seulement le 3e)
function diaposVisibles(ouv,j){ if(!j||!j.diapos) return []; ouv=(ouv||[]).map(String);
  const tous=[]; for(let i=1;i<=j.diapos;i++) tous.push(i);
  if(ouv.includes(j.id)) return tous; return tous.filter(i=>ouv.includes(j.id+'#'+i)) }
function diaposAvec(ouv,j,i,montrer){ // renvoie la nouvelle liste après avoir coché / décoché le document i
  let v=diaposVisibles(ouv,j); v=montrer?[...new Set(v.concat(i))]:v.filter(x=>x!==i);
  const autres=(ouv||[]).map(String).filter(x=>x!==j.id&&!x.startsWith(j.id+'#'));
  return v.length===j.diapos?autres.concat(j.id):autres.concat(v.sort((a,b)=>a-b).map(x=>j.id+'#'+x)) }
