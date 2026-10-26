// ======= Fiches de révision : renforcement, étirements, méthodes =======
// Chargé par l'espace formateur ET l'espace stagiaires. Hamid ouvre aux stagiaires partie par partie
// (clés : renfo.bas, renfo.haut, renfo.abdos, etir.bas, etir.haut, etir.abdos, meth).
// renforcement : [nom, des 2 côtés ?, placement, exécution, sécurité] ; m = ligne « Avec matériel »
const RENFO=[
{
"t": "Bas du corps",
"cases": [
{
"c": "Squat",
"m": "Barre posée sur les trapèzes, ou un haltère dans chaque main le long du corps. Bien tenir la charge, garder le dos droit et les abdominaux gainés.",
"v": [
[
"Squat normal",
0,
"Les pieds largeur du bassin, les pointes légèrement vers l'extérieur, mets les fesses en arrière, verrouille les omoplates et lève la poitrine afin de garder une belle posture.",
"Fléchis les genoux, laisse partir les fesses en arrière, garde les omoplates verrouillées et la poitrine levée, inspire dans la descente et souffle dans la montée.",
"Garde le dos bien droit, les genoux dans l'axe des pieds, les talons au sol et les abdominaux bien contractés."
],
[
"Squat sumo",
0,
"Les pieds plus larges que les épaules, les pointes vers l'extérieur, mets les fesses en arrière, verrouille les omoplates et lève la poitrine afin de garder une belle posture.",
"Fléchis les genoux en les poussant vers l'extérieur, descends le bassin entre les jambes en gardant le buste droit, inspire dans la descente et souffle dans la montée.",
"Garde le dos bien droit, les genoux dans l'axe des pointes de pieds, les talons au sol et les abdominaux bien contractés."
],
[
"Squat pieds serrés",
0,
"Les pieds joints ou presque collés, les pointes vers l'avant, les bras tendus devant toi, verrouille les omoplates et lève la poitrine.",
"Fléchis les genoux, laisse partir les fesses en arrière, penche légèrement le buste en avant en gardant le dos droit, inspire dans la descente et souffle dans la montée.",
"Garde les talons au sol, les genoux serrés et dans l'axe des pieds, le dos droit et les abdominaux contractés. Descends seulement jusqu'où tu gardes le dos droit."
]
]
},
{
"c": "Fente",
"m": "Barre posée sur les trapèzes, ou un haltère dans chaque main le long du corps. Bien tenir la charge, garder le dos droit et le buste vertical.",
"v": [
[
"Fente avant",
1,
"Les pieds largeur du bassin, les mains sur les hanches, verrouille les omoplates, la poitrine levée, les abdominaux contractés.",
"Fais un grand pas en avant, fléchis les deux genoux, puis pousse sur le pied avant pour revenir à la position de départ. Inspire dans la descente et souffle dans la remontée.",
"Garde le dos droit, le genou avant dans l'axe du pied, le talon avant au sol. L'oreille, l'épaule et la hanche restent alignées."
],
[
"Fente arrière",
1,
"Les pieds largeur du bassin, les mains sur les hanches, verrouille les omoplates, la poitrine levée, les abdominaux contractés.",
"Fais un grand pas en arrière, pose le pied arrière en demi-pointe, fléchis les deux genoux, puis reviens à la position de départ. Inspire dans la descente et souffle dans la remontée.",
"Garde le dos droit, le genou avant dans l'axe du pied, le genou arrière descend vers le sol sans le toucher, les abdominaux sont contractés."
],
[
"Fente latérale",
1,
"Les pieds largeur du bassin, les mains devant la poitrine, verrouille les omoplates, la poitrine levée.",
"Fais un grand pas sur le côté, fléchis la jambe qui avance et laisse partir les fesses en arrière, l'autre jambe reste tendue, puis pousse pour revenir. Inspire dans la descente et souffle dans la remontée.",
"Garde le dos droit, les deux pieds à plat et les pointes vers l'avant, le genou fléchi dans l'axe du pied, les abdominaux contractés."
],
[
"Fente croisée",
1,
"Les pieds largeur du bassin, les mains sur les hanches, verrouille les omoplates, la poitrine levée, les abdominaux contractés.",
"Recule une jambe en diagonale derrière l'autre, comme une révérence, fléchis les deux genoux, puis reviens à la position de départ. Inspire dans la descente et souffle dans la remontée.",
"Garde le bassin face à l'avant, le dos droit, le genou avant dans l'axe du pied. Fixe un point du regard pour garder l'équilibre."
]
]
},
{
"c": "Relevé de bassin",
"m": "Un haltère, un disque ou une barre posé sur le bassin, tenu avec les deux mains. Bien tenir la charge pour qu'elle ne glisse pas.",
"v": [
[
"Pieds largeur de bassin",
0,
"Allongé sur le dos, les bras le long du corps, les pieds largeur du bassin, les genoux fléchis de façon à pouvoir toucher les talons avec le bout des doigts.",
"Monte et descends le bassin, pense bien à contracter les fessiers, souffle dans la montée et inspire dans la descente.",
"La tête est posée au sol, les pieds restent largeur du bassin et les fessiers contractés. Ne creuse pas le dos en haut du mouvement."
],
[
"Pieds écartés",
0,
"Allongé sur le dos, les bras le long du corps, les pieds plus larges que le bassin, les pointes vers l'extérieur, les genoux fléchis.",
"Monte et descends le bassin en poussant légèrement les genoux vers l'extérieur, contracte les fessiers, souffle dans la montée et inspire dans la descente.",
"La tête est posée au sol, les genoux dans l'axe des pieds, les fessiers contractés. Ne creuse pas le dos en haut du mouvement."
],
[
"Sur une jambe",
1,
"Allongé sur le dos, les bras le long du corps, un pied au sol, genou fléchi, l'autre jambe tendue vers le plafond ou genou ramené vers la poitrine.",
"Pousse sur le talon au sol pour monter le bassin, puis redescends, contracte le fessier de la jambe d'appui, souffle dans la montée et inspire dans la descente.",
"Le bassin reste bien horizontal, il ne penche pas d'un côté. La tête et les épaules restent posées au sol, les abdominaux sont contractés."
]
]
},
{
"c": "Élévation latérale",
"m": "Un élastique autour des cuisses, au-dessus des genoux, ou des lests aux chevilles. Garder le même mouvement, sans élan.",
"v": [
[
"Allongé sur le côté",
1,
"Allongé sur le côté, la jambe du dessous est pliée à 90 degrés, l'autre jambe est tendue pied pointe, le bras du dessous est posé au sol et sert de soutien à la tête, l'autre main se pose devant pour soutenir.",
"Monte et descends la jambe du dessus, pense à bien contracter les abdominaux, souffle dans la montée et inspire dans la descente.",
"Garde bien la tête posée sur le bras, attention aux cervicales. Le bassin ne bascule pas en arrière."
],
[
"À quatre pattes",
1,
"À quatre pattes, les mains sous les épaules, les genoux sous les hanches, le dos plat.",
"Ouvre une jambe sur le côté, genou plié, jusqu'à hauteur de la hanche, puis ramène-la sans la poser. Souffle dans la montée et inspire dans la descente.",
"Garde le dos bien plat, les bras tendus, les cervicales dans l'alignement de la colonne vertébrale. Le bassin ne penche pas du côté de la jambe d'appui."
],
[
"Debout",
1,
"Debout, les pieds largeur du bassin, une main sur la hanche ou appuyée contre un mur, la poitrine levée, les abdominaux contractés.",
"Monte la jambe tendue sur le côté, puis ramène-la sans la poser au sol. Souffle dans la montée et inspire dans la descente.",
"Garde le buste droit, il ne penche pas de l'autre côté. La jambe d'appui est légèrement fléchie, fixe un point du regard pour garder l'équilibre."
]
]
},
{
"c": "Extension de hanche",
"m": "Un élastique autour des cuisses ou des lests aux chevilles. Garder le dos plat, sans élan.",
"v": [
[
"À quatre pattes jambe tendue",
1,
"À quatre pattes, les mains au niveau des épaules, l'écartement des genoux est à la largeur du bassin, tends une jambe vers l'arrière, garde le dos droit.",
"Garde la jambe arrière tendue, contracte les fessiers, puis lève et baisse la jambe, souffle dans la montée et inspire dans la descente.",
"Garde le dos bien plat, les cervicales dans l'alignement de la colonne vertébrale, contracte la sangle abdominale et les fessiers. La jambe ne monte pas plus haut que les fessiers."
],
[
"À quatre pattes genou plié",
1,
"À quatre pattes, les mains au niveau des épaules, l'écartement des genoux est à la largeur du bassin, plie une jambe à 90 degrés, la plante du pied vers le plafond.",
"Pousse le pied vers le plafond, puis redescends le genou sans le poser, souffle dans la montée et inspire dans la descente.",
"Garde le dos bien plat, ne creuse pas les lombaires, les cervicales dans l'alignement de la colonne vertébrale, contracte la sangle abdominale et les fessiers."
],
[
"Debout",
1,
"Debout, les pieds largeur du bassin, les mains sur les hanches ou appuyées contre un mur, le buste légèrement penché en avant, le dos droit.",
"Recule la jambe tendue vers l'arrière en contractant le fessier, puis ramène-la sans la poser au sol. Souffle dans la montée et inspire dans la descente.",
"Garde le dos droit, ne creuse pas les lombaires, la jambe d'appui est légèrement fléchie, les abdominaux sont contractés."
]
]
}
],
"k": "bas"
},
{
"t": "Haut du corps",
"cases": [
{
"c": "Poitrine",
"v": [
[
"Pompes normales",
0,
"En appui sur les mains et les pointes de pieds, les mains un peu plus larges que les épaules, le corps bien droit de la tête aux talons.",
"Fléchis les coudes pour descendre la poitrine vers le sol, puis pousse pour remonter. Inspire dans la descente et souffle dans la poussée.",
"Gaine les abdominaux et les fessiers, le dos ne se creuse pas, la tête reste dans l'alignement de la colonne vertébrale, les coudes partent légèrement vers l'arrière."
],
[
"Pompes larges",
0,
"En appui sur les mains et les pointes de pieds, les mains nettement plus larges que les épaules, le corps bien droit.",
"Fléchis les coudes pour descendre la poitrine vers le sol, puis pousse pour remonter. Inspire dans la descente et souffle dans la poussée.",
"Gaine les abdominaux, le dos ne se creuse pas, la tête dans l'alignement de la colonne. Ne descends pas plus bas que ce que tes épaules supportent."
],
[
"Pompes sur les genoux",
0,
"En appui sur les mains et les genoux, les mains un peu plus larges que les épaules, le corps droit des genoux à la tête.",
"Fléchis les coudes pour descendre la poitrine vers le sol, puis pousse pour remonter. Inspire dans la descente et souffle dans la poussée.",
"Les fesses ne montent pas, le corps reste aligné des genoux à la tête, les abdominaux sont gainés. Mets un tapis sous les genoux."
],
[
"Pompes contre un mur",
0,
"Debout face à un mur, à un grand pas, les mains posées sur le mur à hauteur d'épaules, un peu plus larges que les épaules.",
"Fléchis les coudes pour approcher la poitrine du mur, puis pousse pour revenir. Inspire en approchant et souffle en poussant.",
"Le corps reste droit, les talons au sol, les abdominaux gainés. Plus tu recules les pieds, plus c'est difficile."
],
[
"Développé couché à la barre",
0,
"Allongé sur le dos sur un step ou au sol, les pieds à plat, prise de mains en pronation un peu plus large que les épaules, la barre tenue bras tendus au-dessus de la poitrine.",
"Descends la barre vers la poitrine en fléchissant les coudes, puis pousse pour tendre les bras. Inspire dans la descente et souffle dans la poussée.",
"Les fessiers et la tête restent posés, le dos ne se creuse pas, les poignets sont droits. Bien tenir la barre."
],
[
"Développé couché aux haltères",
0,
"Allongé sur le dos sur un step ou au sol, les pieds à plat, un haltère dans chaque main, bras tendus au-dessus de la poitrine, paumes vers les pieds.",
"Descends les haltères sur les côtés de la poitrine en fléchissant les coudes, puis pousse pour tendre les bras. Inspire dans la descente et souffle dans la poussée.",
"Les fessiers et la tête restent posés, le dos ne se creuse pas, les poignets sont droits, les coudes ne descendent pas trop bas."
],
[
"Écarté couché aux haltères",
0,
"Allongé sur le dos sur un step ou au sol, les pieds à plat, un haltère dans chaque main, bras tendus au-dessus de la poitrine, paumes face à face, coudes légèrement fléchis.",
"Ouvre les bras sur les côtés en gardant les coudes légèrement fléchis, puis referme-les au-dessus de la poitrine. Inspire en ouvrant et souffle en refermant.",
"Les coudes restent légèrement fléchis tout le long, n'ouvre pas plus bas que ce que tes épaules supportent. Prends des haltères légers."
]
]
},
{
"c": "Épaules",
"v": [
[
"Touches d'épaules en planche",
0,
"En planche haute, les mains sous les épaules, les pieds un peu écartés pour l'équilibre, le corps bien droit.",
"Touche l'épaule opposée avec une main, repose-la, puis change de main. Pense à respirer.",
"Le bassin ne tourne pas et ne se balance pas, les abdominaux et les fessiers sont gainés. Version plus facile : sur les genoux."
],
[
"Développé épaules à la barre",
0,
"Pieds largeur du bassin, prise de mains en pronation (paumes vers l'avant) largeur des épaules, la barre au niveau des clavicules, le dos bien droit.",
"Lève et baisse la barre jusqu'à la position de départ, souffle dans la poussée et inspire dans la descente.",
"Bien gainer la sangle abdominale, dos bien droit sans creuser, épaules relâchées."
],
[
"Développé épaules aux haltères",
0,
"Pieds largeur du bassin, un haltère dans chaque main à hauteur des épaules, les coudes à 90 degrés, les paumes vers l'avant, le dos bien droit.",
"Pousse les haltères vers le plafond sans les cogner, puis redescends jusqu'à la position de départ. Souffle dans la poussée et inspire dans la descente.",
"Bien gainer la sangle abdominale, ne creuse pas le dos, les épaules restent loin des oreilles."
],
[
"Élévations latérales aux haltères",
0,
"Pieds largeur du bassin, un haltère dans chaque main le long du corps, les coudes très légèrement fléchis, la poitrine levée.",
"Monte les bras sur les côtés jusqu'à hauteur des épaules, puis redescends lentement. Souffle dans la montée et inspire dans la descente.",
"Les bras ne montent pas plus haut que les épaules, pas d'élan avec le dos, les épaules restent basses, abdos gainés."
],
[
"Élévations frontales aux haltères",
0,
"Pieds largeur du bassin, un haltère dans chaque main devant les cuisses, les coudes très légèrement fléchis, la poitrine levée.",
"Monte les bras tendus devant toi jusqu'à hauteur des épaules, puis redescends lentement. Souffle dans la montée et inspire dans la descente.",
"Les bras ne montent pas plus haut que les épaules, pas d'élan avec le dos, abdos gainés."
]
]
},
{
"c": "Dos",
"v": [
[
"Nage au sol",
0,
"Allongé sur le ventre, les bras tendus devant toi, les jambes tendues, le front légèrement au-dessus du sol, le regard vers le sol.",
"Décolle légèrement les bras et les jambes, puis lève en alternance le bras et la jambe opposés comme si tu nageais. Pense à respirer.",
"Le regard reste vers le sol, les cervicales dans l'alignement de la colonne. Petits mouvements, sans creuser fort le dos."
],
[
"Y-T-W allongé",
0,
"Allongé sur le ventre, le front légèrement au-dessus du sol, les bras tendus devant toi en forme de Y, les pouces vers le plafond.",
"Décolle les bras en Y, repose-les, ouvre-les en T et décolle-les, puis plie les coudes en W et tire-les vers l'arrière. Souffle en décollant les bras, inspire en les reposant.",
"Verrouille les omoplates, les épaules restent loin des oreilles, le regard vers le sol. Les jambes restent posées au sol."
],
[
"Bras en W tirés vers l'arrière",
0,
"Allongé sur le ventre, le front légèrement au-dessus du sol, les bras tendus devant toi.",
"Plie les coudes et tire-les vers les côtes, comme un tirage, en verrouillant les omoplates, puis tends à nouveau les bras devant. Souffle en tirant, inspire en tendant.",
"Le regard reste vers le sol, les cervicales dans l'alignement de la colonne. Les épaules restent basses, les jambes posées au sol."
],
[
"Rowing à la barre buste penché",
0,
"Pieds largeur du bassin, les fesses en arrière, les genoux fléchis, le buste penché en avant, les bras tendus, prise de mains en pronation, la barre à mi-cuisse, verrouille les omoplates.",
"Garde la même posture et amène la barre entre le nombril et la poitrine, les coudes près du corps, puis tends les bras. Souffle en tirant et inspire en tendant.",
"Dos bien droit, les cervicales dans l'alignement de la colonne vertébrale, reste bien gainé."
],
[
"Rowing haltère un bras",
1,
"Une main et un genou posés sur un step ou une chaise, l'autre pied au sol, le dos plat, un haltère dans la main libre, bras tendu.",
"Tire l'haltère vers la hanche en gardant le coude près du corps, puis redescends lentement. Souffle en tirant et inspire en descendant.",
"Le dos reste plat et ne tourne pas, les cervicales dans l'alignement de la colonne, l'épaule reste loin de l'oreille."
],
[
"Tirage avec élastique",
0,
"Assis, les jambes tendues, l'élastique passé sous les pieds, une extrémité dans chaque main, le dos droit, verrouille les omoplates.",
"Tire les mains vers le nombril en gardant les coudes près du corps, puis tends les bras lentement. Souffle en tirant et inspire en tendant.",
"Le dos reste droit, tu ne te penches pas en arrière, les épaules restent basses."
],
[
"Pull-over haltère",
0,
"Allongé sur le dos sur un step ou au sol, les pieds à plat, un haltère tenu à deux mains au-dessus de la poitrine, les coudes légèrement fléchis.",
"Descends l'haltère derrière la tête en gardant les bras presque tendus, puis ramène-le au-dessus de la poitrine. Inspire en descendant et souffle en remontant.",
"Le dos ne se creuse pas, les abdominaux restent gainés, ne descends que jusqu'où tes épaules le permettent. Bien tenir l'haltère."
]
]
},
{
"c": "Biceps",
"v": [
[
"Curl en supination",
0,
"Pieds largeur du bassin, poitrine levée, abdos gainés, les bras collés à la taille. Prise en supination : paumes vers le haut. À la barre (prise légèrement plus large que le bassin), aux haltères ou avec un élastique sous les pieds.",
"Fais une flexion et une extension complète des coudes, souffle en montant et inspire en descendant.",
"Dos bien droit, la poitrine levée, épaules relâchées, les coudes restent collés à la taille, abdos bien gainés, pas d'élan avec le dos."
],
[
"Curl prise marteau",
0,
"Pieds largeur du bassin, poitrine levée, abdos gainés, les bras collés à la taille, un haltère dans chaque main. Prise marteau : paumes face à face.",
"Fais une flexion et une extension complète des coudes, souffle en montant et inspire en descendant.",
"Dos bien droit, la poitrine levée, épaules relâchées, abdos bien gainés, pas d'élan avec le dos."
],
[
"Curl en pronation",
0,
"Pieds largeur du bassin, poitrine levée, abdos gainés, les bras collés à la taille. Prise en pronation : paumes vers le bas. À la barre ou aux haltères. Travaille aussi les avant-bras.",
"Fais une flexion et une extension complète des coudes, souffle en montant et inspire en descendant.",
"Dos bien droit, les poignets restent droits, épaules relâchées, prends une charge plus légère qu'en supination."
],
[
"Curl concentré",
1,
"Assis, les jambes écartées, le buste penché en avant, le coude posé contre l'intérieur de la cuisse, un haltère dans la main, prise en supination (paume vers le haut).",
"Monte l'haltère vers l'épaule en fléchissant le coude, puis redescends lentement jusqu'à tendre le bras. Souffle en montant et inspire en descendant.",
"Garde le dos droit, le coude reste collé à la cuisse, l'épaule reste immobile."
]
]
},
{
"c": "Triceps",
"v": [
[
"Dips au sol",
0,
"Assis au sol, les mains posées derrière les fesses, les doigts vers l'avant, les genoux fléchis et les pieds à plat.",
"Pousse sur les mains pour décoller les fesses, puis fléchis et tends les coudes. Inspire dans la flexion et souffle dans la poussée.",
"Les coudes partent vers l'arrière, pas sur les côtés. Les épaules restent loin des oreilles."
],
[
"Dips sur une chaise",
0,
"Dos à une chaise stable, les mains posées sur le bord, les doigts vers l'avant, les genoux fléchis et les pieds à plat devant toi.",
"Fléchis les coudes pour descendre les fesses vers le sol, puis pousse pour remonter. Inspire dans la descente et souffle dans la poussée.",
"Le dos reste proche de la chaise, les coudes vers l'arrière, les épaules basses. Ne descends pas plus bas que les coudes à 90 degrés."
],
[
"Pompes serrées",
0,
"En appui sur les mains et les pointes de pieds (ou sur les genoux), les mains sous les épaules ou plus serrées, le corps bien droit.",
"Fléchis les coudes en les gardant collés au corps, descends la poitrine vers les mains, puis pousse pour remonter. Inspire dans la descente et souffle dans la poussée.",
"Gaine les abdominaux, le dos ne se creuse pas, les coudes restent près des côtes, la tête dans l'alignement de la colonne."
],
[
"Extension haltère au-dessus de la tête",
0,
"Debout ou assis, le dos droit, un haltère tenu à deux mains au-dessus de la tête, les bras tendus, les coudes près des oreilles.",
"Descends l'haltère derrière la tête en fléchissant les coudes, puis tends les bras. Inspire en descendant et souffle en tendant.",
"Les coudes restent serrés et pointés vers le plafond, ne creuse pas le dos, abdos gainés. Bien tenir l'haltère."
],
[
"Kickback haltère",
1,
"Une main et un genou posés sur un step ou une chaise, le dos plat, l'haltère dans l'autre main, le coude collé au corps et plié à 90 degrés.",
"Tends le bras vers l'arrière, puis reviens à 90 degrés. Seul l'avant-bras bouge. Souffle en tendant et inspire en revenant.",
"Le coude reste fixe contre le corps, le dos reste plat, les cervicales dans l'alignement de la colonne."
],
[
"Barre au front",
0,
"Allongé sur le dos sur un step ou au sol, les pieds à plat, la barre tenue bras tendus au-dessus de la poitrine, prise de mains en pronation largeur des épaules.",
"Fléchis les coudes pour descendre la barre vers le front, puis tends les bras. Inspire en descendant et souffle en tendant.",
"Les coudes restent serrés et fixes, descends lentement et contrôle la barre, le dos ne se creuse pas."
]
]
}
],
"k": "haut"
},
{
"t": "Abdos",
"cases": [
{
"c": "Obliques",
"v": [
[
"Planche latérale",
1,
"Allongé sur le côté, en appui sur l'avant-bras, le coude sous l'épaule, les jambes tendues l'une sur l'autre (ou genoux fléchis pour débuter).",
"Décolle le bassin pour aligner la tête, les épaules, le bassin et les pieds, et tiens la position. Pense à respirer.",
"Le bassin ne s'affaisse pas et ne part pas en arrière, l'épaule reste loin de l'oreille, les abdominaux sont gainés."
],
[
"Crunch oblique",
1,
"Allongé sur le dos, les genoux fléchis, les pieds largeur du bassin, une main derrière la tête, le coude écarté, l'autre bras au sol.",
"Relève la poitrine en amenant l'épaule vers le genou opposé, puis redescends. Souffle dans la montée, inspire dans la descente.",
"Garde le coude écarté, ne tire pas sur les cervicales. Le bas du dos reste au sol."
],
[
"Rotations du buste assis",
0,
"Assis, les genoux fléchis, les talons au sol, le buste légèrement penché en arrière, le dos droit, les mains jointes devant la poitrine.",
"Tourne le buste d'un côté puis de l'autre, les mains suivent le mouvement. Souffle à chaque rotation.",
"Garde le dos droit, ne t'arrondis pas, les abdominaux gainés. Pour plus difficile : décolle les pieds."
],
[
"Essuie-glace",
0,
"Allongé sur le dos, les bras écartés en croix, les paumes au sol, les genoux fléchis à 90 degrés au-dessus du bassin.",
"Descends les genoux d'un côté sans toucher le sol, reviens au centre, puis de l'autre côté. Inspire dans la descente et souffle dans la remontée.",
"Les épaules restent collées au sol, la tête reste posée. Ne descends que jusqu'où tu contrôles."
],
[
"Flexion latérale avec haltère",
1,
"Pieds largeur du bassin, abdos gainés, dos bien droit, épaules relâchées, un haltère dans une main le long du corps, l'autre main sur la hanche.",
"Penche le buste sur le côté de l'haltère, puis remonte en contractant le côté opposé. Inspire en descendant et souffle en remontant.",
"Dos bien droit, le buste ne part ni en avant ni en arrière, épaules relâchées, pas d'élan."
],
[
"Rotations du buste avec un disque",
0,
"Assis, les genoux fléchis, les talons au sol, le buste légèrement penché en arrière, le dos droit, un disque ou un haltère tenu à deux mains devant la poitrine.",
"Tourne le buste d'un côté puis de l'autre en amenant la charge près de la hanche. Souffle à chaque rotation.",
"Garde le dos droit, ne t'arrondis pas, les abdominaux gainés, prends une charge légère."
]
]
},
{
"c": "Grand droit",
"v": [
[
"Crunch",
0,
"Allongé sur le dos, les bras écartés, les mains derrière la nuque, les genoux fléchis de façon à pouvoir toucher les talons avec les doigts, les pieds largeur du bassin.",
"Fais des relevés de poitrine en décollant seulement les épaules, souffle dans la montée et inspire dans la descente.",
"Garde bien les bras écartés, attention à ne pas tirer sur les cervicales. Le bas du dos reste au sol."
],
[
"Montée de buste",
0,
"Allongé sur le dos, les genoux fléchis, les pieds à plat largeur du bassin, les bras tendus devant toi ou croisés sur la poitrine.",
"Monte le buste jusqu'à être assis, en déroulant le dos, puis redescends lentement. Souffle dans la montée et inspire dans la descente.",
"Les pieds restent au sol, pas d'élan avec les bras. Redescends en contrôlant, vertèbre par vertèbre."
],
[
"Relevé de jambes",
0,
"Allongé sur le dos, les jambes tendues vers le plafond, les bras le long du corps, paumes de mains au sol. Si tu le souhaites, tu peux mettre les mains sous les lombaires.",
"Descends et remonte les jambes tendues. Inspire dans la descente et souffle dans la montée.",
"Garde la tête et les épaules posées au sol, contracte les abdominaux. Le bas du dos ne se creuse pas : si c'est le cas, descends moins bas ou plie les genoux."
],
[
"Crunch inversé",
0,
"Allongé sur le dos, les bras le long du corps, paumes au sol, les genoux fléchis à 90 degrés au-dessus du bassin.",
"Ramène les genoux vers la poitrine en décollant légèrement le bassin, puis reviens lentement. Souffle en ramenant les genoux, inspire en revenant.",
"La tête et les épaules restent au sol, pas d'élan avec les jambes, c'est le ventre qui travaille."
],
[
"Crunch avec haltère",
0,
"Allongé sur le dos, les genoux pliés et relevés à 90 degrés, les pieds largeur du bassin, un haltère posé sur la poitrine, les mains croisées dessus pour le tenir.",
"Fais des relevés de poitrine, souffle dans la montée et inspire dans la descente.",
"Attention aux vertèbres, bien gainer les abdos, la tête reste dans l'alignement de la colonne."
],
[
"Relevé de jambes avec un ballon",
0,
"Allongé sur le dos, un ballon serré entre les pieds ou les chevilles, les jambes tendues vers le plafond, les bras le long du corps, paumes au sol.",
"Descends et remonte les jambes en gardant le ballon serré. Inspire dans la descente et souffle dans la montée.",
"Garde la tête et les épaules posées au sol, le bas du dos ne se creuse pas : descends moins bas si besoin."
]
]
},
{
"c": "Lombaires",
"v": [
[
"Superman",
0,
"Allongé sur le ventre, les bras tendus devant toi, les jambes tendues largeur du bassin, le front proche du sol.",
"Décolle en même temps les bras, la poitrine et les jambes, tiens un temps, puis repose. Souffle en montant et inspire en reposant.",
"Le regard reste vers le sol, les cervicales dans l'alignement de la colonne. Petite amplitude, sans forcer sur le bas du dos."
],
[
"Bird dog",
1,
"À quatre pattes, les mains sous les épaules, les genoux sous les hanches, le dos plat.",
"Tends en même temps un bras devant et la jambe opposée derrière, tiens un temps, puis ramène-les et change de côté. Souffle en tendant, inspire en ramenant.",
"Garde le dos bien plat et le bassin immobile, les cervicales dans l'alignement de la colonne vertébrale, les abdominaux contractés. Le bras et la jambe ne montent pas plus haut que le dos."
],
[
"Extension lombaire mains derrière la tête",
0,
"Allongé sur le ventre, les jambes tendues largeur du bassin, les mains derrière la tête, les coudes écartés, le front proche du sol.",
"Décolle la poitrine du sol, tiens un temps, puis redescends. Souffle en montant et inspire en descendant.",
"Les pieds restent au sol, le regard vers le sol, ne tire pas sur la nuque. Petite amplitude, sans forcer sur le bas du dos."
],
[
"Soulevé de terre jambes semi-tendues",
0,
"Pieds largeur du bassin, la barre tenue bras tendus devant les cuisses, prise de mains en pronation largeur des épaules, la poitrine relevée, les épaules relâchées, le dos droit.",
"Fléchis légèrement les genoux, laisse partir les fesses en arrière, verrouille les omoplates, penche le buste en avant et amène la barre sous les rotules, puis remonte. Inspire en descendant et souffle en remontant.",
"Garde le dos bien droit tout le long, la barre reste près des jambes, attention aux cervicales, reste dans l'alignement de la colonne vertébrale."
],
[
"Superman avec un disque",
0,
"Allongé sur le ventre, les bras tendus devant toi tenant un disque léger, les jambes tendues largeur du bassin, le front proche du sol.",
"Décolle en même temps les bras, la poitrine et les jambes, tiens un temps, puis repose. Souffle en montant et inspire en reposant.",
"Le regard reste vers le sol, petite amplitude, prends un disque léger et ne force pas sur le bas du dos."
]
]
}
],
"k": "abdos"
}
];
// [nom, des 2 côtés ?, placement, exécution, sécurité, méthode]
const ETIR=[
 {k:"bas",t:"Bas du corps",cases:[
  {c:"Quadriceps",v:[
   ["Debout",1,"Debout, les pieds largeur du bassin, une main contre un mur si besoin pour l'équilibre.","Fléchis une jambe, attrape ton pied et ramène le talon vers la fesse, tends le bras opposé et fixe un point du regard. Respire calmement.","Les genoux restent serrés l'un contre l'autre, le genou plié pointe vers le sol, le bassin ne part pas en avant, le dos reste droit.","Actif statique"],
   ["Allongé sur le côté",1,"Allongé sur le côté, la tête posée sur le bras du dessous, la jambe du dessous légèrement pliée.","Plie la jambe du dessus, attrape ton pied avec la main du dessus et ramène le talon vers la fesse. Respire calmement.","Les genoux restent l'un au-dessus de l'autre, le bassin ne bascule pas en arrière, ne tire pas fort sur le genou.","Passif lourd"],
   ["Allongé sur le ventre",1,"Allongé sur le ventre, le front posé sur un avant-bras, les jambes tendues.","Plie une jambe, attrape ton pied avec la main du même côté et ramène doucement le talon vers la fesse. Respire calmement.","Les hanches restent collées au sol, le genou reste dans l'axe, ne creuse pas le bas du dos.","Passif lourd"]]},
  {c:"Ischios",v:[
   ["Allongé sur le dos",1,"Allongé sur le dos, une jambe tendue vers le plafond, l'autre reste tendue au sol (ou pliée, pied à plat).","Attrape avec les mains la cuisse, le mollet ou la cheville de la jambe au plafond en fonction de ta souplesse, ramène la pointe de pied vers toi. Respire calmement.","La tête et le bassin restent posés au sol, ne tire pas sur la nuque, la jambe reste tendue sans bloquer le genou.","Actif statique"],
   ["Assis, jambes tendues",0,"Assis, les jambes tendues et serrées, le dos droit, les pointes de pieds vers le plafond.","Prends une grande inspiration et sur l'expiration penche-toi en avant, attrape les tibias, les chevilles ou les pointes de pieds selon ta souplesse.","Penche-toi depuis le bassin en gardant le dos le plus droit possible, ne force pas avec les bras.","Actif statique"],
   ["Assis, une jambe tendue",1,"Assis, une jambe tendue, l'autre pliée, la plante du pied contre l'intérieur de la cuisse tendue, le dos droit.","Prends une grande inspiration et sur l'expiration penche le buste vers la jambe tendue, les mains glissent vers la cheville.","Le dos reste le plus droit possible, le genou de la jambe tendue n'est pas bloqué, ne force pas.","Actif statique"],
   ["Debout, pieds écartés",0,"Debout, les pieds légèrement plus larges que les épaules, les jambes tendues sans bloquer les genoux.","Prends une grande inspiration puis expire en t'inclinant vers l'avant pour aller vers les pointes de pieds. Remonte doucement, vertèbre par vertèbre.","Remonte lentement en déroulant le dos, la tête en dernier, pour éviter la tête qui tourne.","Actif statique"],
   ["Debout, un talon posé devant",1,"Debout, un pied devant, talon au sol et pointe vers le plafond, la jambe arrière légèrement fléchie, les mains sur la cuisse arrière.","Penche le buste en avant en gardant le dos droit et en poussant les fesses en arrière. Respire calmement.","Le dos reste droit, la jambe avant reste tendue sans bloquer le genou, les mains ne s'appuient pas sur le genou avant.","Actif statique"]]},
  {c:"Fessiers",v:[
   ["Allongé, genou à la poitrine",1,"Allongé sur le dos, les deux jambes tendues.","Ramène un genou à la poitrine, les mains se positionnent au niveau du tibia, l'autre jambe reste tendue. Respire calmement.","La tête et les épaules restent au sol, la jambe tendue reste posée.","Actif statique"],
   ["Allongé, cheville sur le genou",1,"Allongé sur le dos, les deux genoux pliés, les pieds à plat. Pose une cheville sur le genou de l'autre jambe.","Passe un bras entre les jambes, l'autre sur le côté, attrape la cuisse de la jambe d'appui et ramène vers la poitrine. Respire calmement.","La tête reste au sol, le genou de la jambe croisée s'ouvre vers l'extérieur, ne tire pas sur la nuque.","Actif statique"],
   ["Assis, jambe croisée avec torsion",1,"Assis, une jambe tendue, l'autre pliée et croisée par-dessus, le pied à plat à l'extérieur du genou, le dos droit.","Enroule le bras opposé autour du genou plié et ramène-le vers la poitrine, puis tourne doucement le buste vers l'arrière. Respire calmement.","Grandis-toi avant de tourner, les deux fesses restent au sol, la torsion est douce.","Actif statique"],
   ["À genoux, jambe avant pliée",1,"À genoux, une jambe avant pliée, le mollet au sol devant toi, la jambe arrière tendue vers l'arrière, pointe de pied au sol.","Départ bien droit, prends une grande inspiration puis souffle en poussant les bras en avant et en relâchant le buste.","Le bassin reste face à l'avant, pas de douleur au genou avant : si ça tire au genou, choisis la version allongée.","Passif lourd"]]},
  {c:"Psoas",v:[
   ["Fente, genou arrière au sol",1,"En fente, le genou arrière posé au sol (sur un tapis), le pied avant à plat, le genou avant au-dessus de la cheville, les mains sur la cuisse avant.","Avance doucement le bassin vers l'avant et le bas, garde le buste droit. Respire calmement.","Le genou avant ne dépasse pas trop la pointe de pied, ne creuse pas le bas du dos, contracte légèrement les fessiers.","Actif statique"],
   ["Fente debout",1,"Debout en fente, la jambe avant pliée, genou au-dessus de la cheville, la jambe arrière tendue, le pied en demi-pointe.","Laisse descendre le bassin vers le sol en gardant le dos droit, tu peux monter le bras du côté de la jambe arrière. Respire calmement.","Le dos reste droit, le bassin ne bascule pas en avant, les abdominaux sont légèrement contractés.","Actif statique"]]},
  {c:"Adducteurs",v:[
   ["Assis, jambes écartées",0,"Assis, les jambes tendues et écartées, le dos droit.","Prends une grande inspiration et sur l'expiration pousse les mains devant toi, puis vers une jambe et vers l'autre.","Le dos reste le plus droit possible, les pointes de pieds vers le plafond, ne force pas.","Actif statique"],
   ["Assis, papillon",0,"Assis, les plantes de pieds collées l'une contre l'autre, les talons près du bassin, les mains tiennent les pieds.","Grandis-toi, puis laisse descendre doucement les genoux vers le sol. Respire calmement.","Ne pousse pas sur les genoux avec les mains ou les coudes, garde le dos droit.","Passif lourd"],
   ["Debout, fente latérale",1,"Debout, les jambes très écartées, les pointes de pieds vers l'avant.","Fléchis une jambe en laissant partir les fesses en arrière, l'autre jambe reste tendue, jusqu'à sentir l'étirement à l'intérieur de la cuisse tendue.","Le genou fléchi reste dans l'axe du pied, les deux pieds restent à plat, le dos reste droit.","Actif statique"]]},
  {c:"Mollets",v:[
   ["Debout, mains contre un mur",1,"Face à un mur, les mains posées dessus, une jambe devant pliée, l'autre tendue derrière, le talon arrière au sol.","Avance le bassin vers le mur en gardant le talon arrière au sol. Respire calmement.","Le pied arrière pointe vers l'avant, le talon ne décolle pas, le dos reste droit.","Actif statique"],
   ["Chien tête en bas",0,"En appui sur les mains et les pieds, les fesses vers le plafond, les mains largeur d'épaules, les pieds largeur du bassin, la tête entre les bras.","Sur le rythme de la respiration, pédale doucement en baissant un talon puis l'autre.","Garde le dos droit plutôt que les jambes tendues : plie les genoux si besoin. Pas en cas de mal aux poignets.","Actif dynamique lent"]]}
 ]},
 {k:"haut",t:"Haut du corps",cases:[
  {c:"Poitrine",v:[
   ["Mains crochetées derrière le dos",0,"Debout, les pieds largeur du bassin, les mains crochetées derrière le dos, les bras tendus.","Ouvre la poitrine et tire doucement les mains vers l'arrière et le bas. Respire calmement.","Ne creuse pas le bas du dos, les épaules restent basses, loin des oreilles.","Actif statique"],
   ["Avant-bras contre un mur",1,"Debout de profil à un mur, l'avant-bras posé contre le mur, le coude à hauteur d'épaule.","Tourne doucement le buste à l'opposé du mur jusqu'à sentir l'étirement dans la poitrine. Respire calmement.","Tourne lentement, l'épaule reste basse, arrête-toi avant toute douleur à l'épaule.","Actif statique"],
   ["Bras écartés tirés vers l'arrière",0,"Debout, les pieds largeur du bassin, les bras écartés sur les côtés à hauteur d'épaules, les pouces vers le haut.","Tire doucement les bras vers l'arrière en ouvrant la poitrine, puis ramène-les devant toi. Recommence sur le rythme de la respiration.","Le dos ne se creuse pas, les abdominaux sont légèrement contractés, le mouvement reste lent.","Actif dynamique lent"]]},
  {c:"Épaules",v:[
   ["Bras tendu plaqué contre la poitrine",1,"Debout ou assis, le dos droit, un bras tendu devant toi.","Ramène ce bras contre la poitrine, l'autre main se pose au niveau du coude et met une légère pression. Respire calmement.","Relâche les épaules, ne tourne pas le buste, la pression se fait sur le coude et pas sur l'articulation de l'épaule.","Actif statique"],
   ["À quatre pattes, bras glissé sous la poitrine",1,"En position quadrupédie, les mains sous les épaules, les genoux sous les hanches.","Prends une grande inspiration puis sur l'expiration glisse un bras sous la poitrine afin de poser l'épaule au sol, accompagne ce bras du regard. L'autre bras se tend devant.","Descends doucement, la tête se pose au sol sans forcer sur la nuque.","Passif lourd"]]},
  {c:"Dos",v:[
   ["Position de l'enfant",0,"À genoux, les fesses posées sur les talons, les bras tendus en avant, le front au sol.","Laisse-toi aller vers l'avant et respire calmement, en sentant le dos s'allonger.","Si les genoux font mal, écarte-les un peu ou mets un coussin entre les fesses et les talons.","Passif lourd"],
   ["Debout, dos rond",0,"Debout, les pieds largeur du bassin, les genoux légèrement fléchis, les mains jointes devant toi, paumes vers l'extérieur.","Pousse les mains en avant, arrondis le dos, rentre le ventre et laisse passer la tête entre les bras. Respire calmement.","Les genoux restent légèrement fléchis, reviens doucement en position droite.","Actif statique"],
   ["À quatre pattes, dos rond / dos creux",0,"En position quadrupédie, les mains sous les épaules, les genoux sous les hanches, le dos plat.","Sur l'expiration, arrondis le dos et rentre le menton ; sur l'inspiration, creuse doucement le dos et regarde devant. Recommence plusieurs fois.","Mouvement lent et sans forcer, surtout dans le dos creux.","Actif dynamique lent"]]},
  {c:"Biceps",v:[
   ["Bras tendu, paume vers le plafond",1,"Debout ou assis, un bras tendu devant toi, la paume de main vers le plafond.","Avec l'autre main, ramène doucement les bouts de doigts vers le sol et vers toi. Respire calmement.","Le coude reste tendu sans être bloqué, pression douce sur les doigts.","Actif statique"],
   ["À quatre pattes, doigts vers les genoux",0,"En position quadrupédie, les mains posées au sol, les doigts tournés vers les genoux, les bras tendus.","Recule doucement les fesses vers les talons jusqu'à sentir l'étirement dans les avant-bras et les biceps. Respire calmement.","Recule très doucement, arrête-toi dès que ça tire trop aux poignets.","Passif lourd"]]},
  {c:"Triceps",v:[
   ["Main entre les omoplates",1,"Debout ou assis, le dos droit, un bras levé au-dessus de la tête.","Plie ce bras pour poser la main entre les omoplates, l'autre main pousse légèrement le coude vers l'arrière. Respire calmement.","La tête reste droite, pas poussée en avant par le bras, ne creuse pas le dos.","Actif statique"]]},
  {c:"Cervicales",v:[
   ["Tête penchée sur le côté",1,"Debout ou assis, le dos droit, les épaules relâchées.","Pose le poignet sur la tête, le bout des doigts sur l'oreille, laisse pencher la tête sur le côté en te laissant tirer par le poids du bras. Inspire et souffle.","Ne tire pas avec le bras, laisse juste son poids agir. L'épaule opposée reste basse.","Actif dynamique lent"],
   ["Tête tournée vers l'aisselle",1,"Debout ou assis, le dos droit, les épaules relâchées.","Tourne la tête vers une aisselle, pose le poignet sur la tête, les doigts derrière la tête au niveau de la nuque, laisse le poids du bras descendre la tête. Inspire et souffle.","Ne tire pas avec le bras, mouvement très doux, arrête-toi si ça fait mal ou si la tête tourne.","Actif dynamique lent"],
   ["Menton vers la poitrine",0,"Debout ou assis, le dos droit, les épaules relâchées.","Descends doucement le menton vers la poitrine, tu peux poser les mains derrière la tête sans appuyer. Respire calmement.","Pas de pression des mains, le dos reste droit, remonte la tête doucement.","Actif statique"]]}
 ]},
 {k:"abdos",t:"Abdos",cases:[
  {c:"Grand droit",v:[
   ["Sphinx",0,"Allongé face au sol, les coudes au niveau des épaules et collés au corps, les avant-bras au sol.","Prends une grande inspiration, pousse sur les avant-bras pour relever la poitrine, puis expire en restant en position du sphinx.","Les hanches restent au sol, les épaules restent basses. Si le bas du dos fait mal, reste plus bas.","Actif statique"],
   ["Auto-grandissement allongé",0,"Allongé sur le dos, les jambes tendues, les bras tendus au sol au-dessus de la tête.","Prends une grande inspiration et sur l'expiration étire-toi de la pointe des pieds jusqu'au bout des doigts.","Le bas du dos ne se creuse pas trop, garde les épaules relâchées.","Actif statique"],
   ["Auto-grandissement debout",0,"Debout, les pieds largeur du bassin.","Prends une grande inspiration, monte sur la pointe des pieds et allonge les bras vers le plafond, souffle et relâche pour revenir à la position de départ.","Fixe un point du regard pour l'équilibre, ne creuse pas le bas du dos.","Actif dynamique lent"]]},
  {c:"Obliques",v:[
   ["Debout, inclinaison sur le côté",1,"Debout, les pieds largeur d'épaules, une main sur la hanche, l'autre bras le long du corps.","Prends une grande inspiration, puis sur l'expiration incline-toi sur le côté de la main sur la hanche en montant l'autre bras en arc de cercle au-dessus de la tête.","Le buste ne part ni en avant ni en arrière, le bassin reste fixe, les genoux légèrement fléchis.","Actif statique"],
   ["Assis, une jambe pliée",1,"Assis, une jambe pliée, l'autre tendue sur le côté, le bras posé sur la jambe pliée.","Prends une grande inspiration, sur l'expiration incline-toi vers la jambe tendue et tends l'autre bras en arc de cercle au-dessus de la tête.","Les deux fesses restent au sol, le buste reste de face.","Actif statique"],
   ["Allongé, genoux sur le côté",1,"Le dos à plat au sol, les bras écartés en croix, les genoux pliés à 90 degrés.","Pose les genoux d'un côté et regarde de l'autre côté. Respire calmement et laisse le dos se relâcher.","Les épaules restent collées au sol, descends les genoux doucement.","Passif lourd"]]},
  {c:"Lombaires",v:[
   ["Allongé, les deux genoux à la poitrine",0,"Allongé sur le dos, les jambes pliées.","Ramène les deux genoux vers la poitrine, les mains sous les genoux ou sur les tibias. Respire calmement, tu peux te balancer doucement de gauche à droite.","La tête reste posée au sol, ne tire pas sur les genoux.","Passif lourd"],
   ["Assis, dos rond relâché",0,"Assis (au sol jambes pliées, ou sur le bord d'une chaise), les pieds légèrement écartés.","Prends une grande inspiration puis sur l'expiration relâche totalement le haut du corps vers l'avant, la tête et les bras pendent.","Remonte doucement, vertèbre par vertèbre, la tête en dernier.","Passif lourd"]]}
 ]}
];
// méthodes : nom, ce que c'est, comment faire, quand l'utiliser, exemple
const METHODES=[
 ["Actif dynamique lent","L'étirement se fait en mouvement lent, sur le rythme de la respiration, sans tenir la position.","On va et revient lentement dans l'étirement, plusieurs fois, en soufflant quand on s'étire. Amplitude douce, sans à-coups.","Échauffement et début de cours de stretch, pour mobiliser les articulations en douceur.","À quatre pattes, dos rond / dos creux"],
 ["Actif dynamique rapide","Mouvements plus rapides et plus amples (balancés de bras ou de jambes), toujours contrôlés.","On balance le membre d'avant en arrière ou sur le côté, en augmentant petit à petit l'amplitude, 8 à 10 fois de chaque côté.","Fin d'échauffement, avant un effort rapide. Jamais à froid, jamais pour un public fragile.","Balancés de jambe d'avant en arrière, une main contre un mur"],
 ["Actif statique","On se place dans l'étirement et on tient la position, en contrôlant soi-même la tension.","On tient environ 20 à 30 secondes, en respirant calmement, la tension doit rester supportable. On relâche doucement.","Retour au calme et cours de stretch.","Étirement des ischios allongé sur le dos"],
 ["Passif léger","Étirement doux où l'on se laisse aller, sans chercher à aller loin.","On se laisse aller dans la position, on relâche les muscles et on respire lentement, sans forcer.","Fin de séance, pour la détente et la récupération.","Position de l'enfant"],
 ["Passif lourd","On se laisse aller dans la position grâce au poids du corps, au sol ou à un appui, en relâchant complètement.","On tient plus longtemps (30 secondes et plus), on relâche tout et on respire calmement. L'étirement est plus profond, il ne doit jamais faire mal.","Cours de stretch et retour au calme, jamais avant un effort.","Allongé, genoux posés sur le côté"],
 ["Postural","On tient une posture qui étire plusieurs muscles en même temps (une chaîne musculaire), en se grandissant.","On se place dans la posture, on tient quelques secondes en respirant profondément, puis on relâche. On peut répéter plusieurs fois.","Cours de stretch, pour la posture et la souplesse générale.","Dos plat penché en avant, puis relâché en dos rond"],
 ["CRE (Contracter – Relâcher – Étirer)","On contracte le muscle sans bouger, on relâche, puis on l'étire. La contraction aide le muscle à se laisser étirer ensuite.","Contracte le muscle 10 secondes sans bouger (en poussant contre une résistance, par exemple tes mains), relâche 2 secondes, puis étire 10 secondes. Tu peux répéter 2 ou 3 fois.","Cours de stretch, pour gagner en souplesse. Jamais avant un effort, pas pour un débutant qui ne sait pas encore doser.","Fessiers : cheville sur le genou, pousse le genou contre les mains 10 s, relâche 2 s, ramène le genou vers la poitrine 10 s"],
 ["PNF (facilitation neuromusculaire proprioceptive)","Méthode venue de la rééducation : contraction forte contre une résistance, relâchement, puis étirement plus long, souvent guidé par un partenaire.","Contracte le muscle 6 à 10 secondes contre la résistance du partenaire, relâche 2 à 3 secondes, puis le partenaire accompagne un étirement de 20 à 30 secondes. 2 à 4 fois.","Cours de stretch avancé, quand les personnes travaillent à deux et savent doser. Pas en échauffement.","Ischios allongé : le partenaire tient la jambe tendue, tu pousses contre lui, puis il accompagne l'étirement"]
];
const FICHES_CATS={
  renfo:{emoji:'💪',titre:'Exercices de renforcement musculaire',parties:RENFO},
  etir:{emoji:'🧘',titre:"Exercices d'étirement",parties:ETIR},
  meth:{emoji:'📏',titre:"Méthodes d'étirement"}
};
const FICHES_COULEURS={bas:'o',haut:'j',abdos:'g'};
(function(){const st=document.createElement('style');st.textContent=`
.fx-ps{list-style:none;display:flex;align-items:center;gap:10px;cursor:pointer}
.fx-ps::-webkit-details-marker{display:none}
.fx-ps h2{margin:0}
.fx-fl{display:inline-block;transition:transform .15s;color:var(--mute);font-size:18px}
details[open]>.fx-ps .fx-fl{transform:rotate(90deg)}
.fx-var{margin-top:14px}
.fx-nom{font-weight:800;color:var(--or)}
.fx-tg{margin:0 0 12px;padding:8px 12px}
`;document.head.appendChild(st)})();
function fxEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function fxLigne(t,v){return v?`<div class="fl"><b>${t}</b>${fxEsc(v)}</div>`:''}
function fxCote(d){return d?' <span class="muted" style="font-weight:400">(des 2 côtés)</span>':''}
// une partie (Bas du corps…) : refermable ; « avant » = html placé au-dessus (bouton Montrer/Cacher)
function fxPartie(cat,p,avant){
  const etir=cat==='etir';
  return `<div class="card ${FICHES_COULEURS[p.k]||''}">${avant||''}<details class="fx-p"><summary class="fx-ps"><span class="fx-fl">▶</span><h2>${fxEsc(p.t)}</h2></summary>`+
    p.cases.map(c=>`<details class="fiche" style="border-left-color:var(--or)"><summary style="font-weight:800;font-size:17px;cursor:pointer">${fxEsc(c.c)} <span class="muted" style="font-weight:400">(${c.v.length} variante${c.v.length>1?'s':''})</span></summary>`+
      (c.m?`<div class="fl" style="margin-top:10px"><b>Avec matériel</b>${fxEsc(c.m)}</div>`:'')+
      c.v.map(v=>`<div class="fx-var"><div class="fx-nom">${fxEsc(v[0])}${fxCote(v[1])}</div>${fxLigne('Placement',v[2])}${fxLigne('Exécution',v[3])}${fxLigne('Sécurité',v[4])}${etir?fxLigne('Méthode',v[5]):''}</div>`).join('')+
    `</details>`).join('')+`</details></div>`;
}
function fxMethodes(avant){
  return `<div class="card g">${avant||''}<details class="fx-p"><summary class="fx-ps"><span class="fx-fl">▶</span><h2>Les ${METHODES.length} méthodes</h2></summary>`+
    METHODES.map(m=>`<details class="fiche"><summary style="font-weight:800;font-size:17px;cursor:pointer">${fxEsc(m[0])}</summary>${fxLigne("Ce que c'est",m[1])}${fxLigne('Comment faire',m[2])}${fxLigne("Quand l'utiliser",m[3])}${fxLigne('Exemple',m[4])}</details>`).join('')+`</details></div>`;
}
// clés d'une catégorie
function fxCles(cat){return cat==='meth'?['meth']:FICHES_CATS[cat].parties.map(p=>cat+'.'+p.k)}
