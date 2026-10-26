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
"Les pieds joints ou presque collés, les pointes vers l'avant, les bras le long du corps, verrouille les omoplates et lève la poitrine.",
"Fléchis les genoux, laisse partir les fesses en arrière, penche légèrement le buste en avant en gardant le dos droit, plie les coudes (coudes vers le bas, mains devant la poitrine), inspire dans la descente et souffle dans la montée.",
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
   ["Debout, un talon posé devant",1,"Debout, un pied devant, talon au sol et pointe vers le plafond, la jambe arrière légèrement fléchie, les mains sur la cuisse arrière.","Penche le buste en avant en gardant le dos droit et en poussant les fesses en arrière. Respire calmement.","Le dos reste droit, la jambe avant reste tendue sans bloquer le genou, les mains ne s'appuient pas sur le genou avant.","Actif statique"],
   ["Postural, à genoux jambe tendue", 1, "Un genou au sol (sur un tapis), l'autre jambe tendue devant, le talon au sol et la pointe de pied ramenée vers soi.", "Penche le buste légèrement vers l'avant, le dos plat, les bras tendus au niveau des oreilles, et tiens la posture quelques secondes avec de petites respirations. Puis souffle et relâche le buste sur la jambe tendue, les mains vers la cheville.", "Pendant le maintien le dos reste plat, ne bloque pas ta respiration ; la jambe avant reste tendue sans bloquer le genou.", "Postural : maintenir la posture, puis relâcher"]]},
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
   ["Debout, fente latérale",1,"Debout, les jambes très écartées, les pointes de pieds vers l'avant.","Fléchis une jambe en laissant partir les fesses en arrière, l'autre jambe reste tendue, jusqu'à sentir l'étirement à l'intérieur de la cuisse tendue.","Le genou fléchi reste dans l'axe du pied, les deux pieds restent à plat, le dos reste droit.","Actif statique"],
   ["Postural, debout jambes écartées", 0, "Debout, les jambes très écartées, les pointes de pieds vers l'avant, les genoux légèrement fléchis.", "Penche le buste vers l'avant, le dos plat, les bras tendus au niveau des oreilles, et tiens la posture quelques secondes avec de petites respirations. Puis souffle et relâche le buste et les bras vers le sol, entre les jambes.", "Dos plat pendant le maintien, remonte doucement en déroulant le dos, la tête en dernier.", "Postural : maintenir la posture, puis relâcher"]]},
  {c:"Mollets",v:[
   ["Debout, mains contre un mur",1,"Face à un mur, les mains posées dessus, une jambe devant pliée, l'autre tendue derrière, le talon arrière au sol.","Avance le bassin vers le mur en gardant le talon arrière au sol. Respire calmement.","Le pied arrière pointe vers l'avant, le talon ne décolle pas, le dos reste droit.","Actif statique"],
   ["Chien tête en bas",0,"En appui sur les mains et les pieds, les fesses vers le plafond, les mains largeur d'épaules, les pieds largeur du bassin, la tête entre les bras.","Sur le rythme de la respiration, pédale doucement en baissant un talon puis l'autre.","Garde le dos droit plutôt que les jambes tendues : plie les genoux si besoin. Pas en cas de mal aux poignets.","Actif dynamique lent"],
   ["En fente debout, sans appui", 1, "Debout en fente, la jambe avant fléchie, la jambe arrière tendue, le talon arrière au sol, les mains sur les hanches.", "Avance doucement le bassin vers l'avant en gardant le talon arrière au sol. Respire calmement.", "Le pied arrière pointe vers l'avant, le talon ne décolle pas, le dos reste droit, fixe un point du regard pour l'équilibre.", "Actif statique"],
   ["Assis, jambe tendue", 1, "Assis au sol, une jambe tendue devant toi, l'autre pliée, le dos droit.", "Attrape la pointe de pied de la jambe tendue avec les mains et tire-la doucement vers toi. Respire calmement.", "Le dos reste le plus droit possible, le genou reste tendu sans être bloqué ; si tu n'atteins pas le pied, plie un peu le genou.", "Actif statique"]]}
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
   ["À quatre pattes, dos rond / dos creux",0,"En position quadrupédie, les mains sous les épaules, les genoux sous les hanches, le dos plat.","Sur l'expiration, arrondis le dos et rentre le menton ; sur l'inspiration, creuse doucement le dos et regarde devant. Recommence plusieurs fois.","Mouvement lent et sans forcer, surtout dans le dos creux.","Actif dynamique lent"],
   ["Postural, debout dos plat", 0, "Debout, les pieds largeur du bassin, les genoux légèrement fléchis.", "Penche le buste vers l'avant, le dos plat, les bras tendus au niveau des oreilles, et tiens la posture quelques secondes avec de petites respirations. Puis souffle et relâche en dos rond, la tête et les bras pendent.", "Genoux légèrement fléchis, remonte doucement vertèbre par vertèbre, la tête en dernier.", "Postural : maintenir la posture, puis relâcher"]]},
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
   ["Allongé, genoux sur le côté",1,"Le dos à plat au sol, les bras écartés en croix, les genoux pliés à 90 degrés.","Pose les genoux d'un côté et regarde de l'autre côté. Respire calmement et laisse le dos se relâcher.","Les épaules restent collées au sol, descends les genoux doucement.","Passif lourd"],
   ["Postural, debout bras tendus", 1, "Debout, les pieds largeur du bassin, les bras tendus au-dessus de la tête au niveau des oreilles, les mains jointes.", "Grandis-toi, puis incline-toi sur le côté et tiens la posture quelques secondes avec de petites respirations. Puis souffle et relâche le bras du dessus et le buste vers le côté.", "Le buste ne part ni en avant ni en arrière, le bassin reste fixe, les genoux légèrement fléchis.", "Postural : maintenir la posture, puis relâcher"]]},
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
 ["Passif lourd","On se laisse aller dans la position grâce au poids du corps, au sol ou à un appui, en relâchant complètement.","On tient plus longtemps (30 secondes et plus), on relâche tout et on respire calmement. L'étirement est plus profond, il ne doit jamais faire mal.","Cours de stretch et retour au calme, pour la détente et la récupération. Jamais avant un effort.","Allongé, genoux posés sur le côté ; position de l'enfant"],
 ["Postural", "Une méthode globale : on n'étire pas un seul muscle mais toute une chaîne de muscles (par exemple tout l'arrière du corps), en se plaçant dans une posture précise et en se grandissant.", "En 2 temps, toujours dans cet ordre. 1) Maintenir la posture : place-toi activement dans la posture (dos plat, bras tendus au niveau des oreilles, grandis-toi) et tiens 6 à 30 secondes avec de petites respirations. 2) Relâcher : sur une grande expiration, relâche tout et laisse le poids du corps agir (par exemple en dos rond), en respirant calmement. On peut répéter 2 ou 3 fois.", "Cours de stretch, pour la posture et la souplesse générale, ou retour au calme. Jamais avant un effort. Le maintien est actif mais ne doit pas faire mal, et on ne bloque pas sa respiration.", "Dos : debout, dos plat penché en avant, bras tendus au niveau des oreilles, puis relâché en dos rond"],
 ["CRE (Contracter – Relâcher – Étirer)","On contracte le muscle sans bouger, on relâche, puis on l'étire. La contraction aide le muscle à se laisser étirer ensuite.","Contracte le muscle 10 secondes sans bouger (en poussant contre une résistance, par exemple tes mains), relâche 2 secondes, puis étire 10 secondes. Tu peux répéter 2 ou 3 fois.","Cours de stretch, pour gagner en souplesse. Jamais avant un effort, pas pour un débutant qui ne sait pas encore doser.","Fessiers : cheville sur le genou, pousse le genou contre les mains 10 s, relâche 2 s, ramène le genou vers la poitrine 10 s"],
 ["PNF (facilitation neuromusculaire proprioceptive)","Méthode venue de la rééducation : contraction forte contre une résistance, relâchement, puis étirement plus long, souvent guidé par un partenaire.","Contracte le muscle 6 à 10 secondes contre la résistance du partenaire, relâche 2 à 3 secondes, puis le partenaire accompagne un étirement de 20 à 30 secondes. 2 à 4 fois.","Cours de stretch avancé, quand les personnes travaillent à deux et savent doser. Pas en échauffement.","Ischios allongé : le partenaire tient la jambe tendue, tu pousses contre lui, puis il accompagne l'étirement"]
];
const FICHES_CATS={
  renfo:{emoji:'💪',titre:'Exercices de renforcement musculaire',parties:RENFO},
  etir:{emoji:'🧘',titre:"Exercices d'étirement",parties:ETIR},
  meth:{emoji:'📏',titre:"Méthodes d'étirement"}
};
const FICHES_COULEURS={bas:'o',haut:'j',abdos:'g'};
// ======= Petits bonshommes : un dessin par variante =======
// Vue de profil par défaut, tourné vers la droite. Membres côté proche orange, côté éloigné bleu.
// Une pose : h = hanche, s = épaule, t = angle du tronc (90 = debout, 0° = vers la droite, sens inverse des aiguilles),
// hd = direction de la tête, tc = dos arrondi (+) ou creusé (-), fv = vue de face, raw = tracé libre.
// Membre : [x,y] = point visé (genou/coude calculés), {a:[a1,a2]} = angles, {j,e} = points imposés.
// Pied : 'f' flex (pointe vers soi), 'p' pointe tendue, 'l' dans l'axe, 'x' aucun, ou un angle.
const BH_OR='#f4844c',BH_BL='#6b7aa8',BH_SOL='#3a4266',BH_MAT='#c9cfe6',BH_SUP='#2c365c',BH_SUPB='#4a5580';
function bhP(p,a,l){const r=a*Math.PI/180;return[p[0]+l*Math.cos(r),p[1]-l*Math.sin(r)]}
function bhA(p,q){return Math.atan2(p[1]-q[1],q[0]-p[0])*180/Math.PI}
function bhIK(r,t,l1,l2,v){const dx=t[0]-r[0],dy=t[1]-r[1],d=Math.max(Math.hypot(dx,dy),.5),ux=dx/d,uy=dy/d,dd=Math.min(d,l1+l2),a=(l1*l1+dd*dd-l2*l2)/(2*dd),h=Math.sqrt(Math.max(0,l1*l1-a*a));let px=-uy,py=ux;if(px*v[0]+py*v[1]<0){px=-px;py=-py}const j=[r[0]+ux*a+px*h,r[1]+uy*a+py*h];return{j,e:bhP(j,bhA(j,t),l2),ko:d-l1-l2}}
function bhMembre(root,sp,l1,l2,front,bdef){
  if(!sp)return null;
  if(Array.isArray(sp)){const b=sp[2]==null?bdef:sp[2],v=Array.isArray(b)?b:[front[0]*b,front[1]*b],r=bhIK(root,[sp[0],sp[1]],l1,l2,v);r.o=sp[3];return r}
  if(sp.j)return{j:sp.j,e:sp.e,o:sp.p};
  const j=bhP(root,sp.a[0],l1);return{j,e:bhP(j,sp.a[1],l2),o:sp.p!=null?sp.p:sp.m}
}
function bhPied(L,fv,droite){
  const o=L.o;if(o==='x')return null;
  const sh=bhA(L.j,L.e);let a;
  if(typeof o==='number')a=o;else if(o==='l')a=sh;else if(o==='p')a=sh+25;
  else if(fv)a=droite?0:180;
  else{a=sh+90;if(o!=='f'&&L.e[1]>122){const s=Math.sin(a*Math.PI/180);if(s<0.574)a=Math.cos(a*Math.PI/180)>=0?0:180}}
  return bhP(L.e,a,fv?7:11);
}
function bhSvg(S){
  const fig=[],der=[],dev=[],P={n:{},f:{}};
  const ln=(L,pts,c,w)=>L.push({k:'l',p:pts.filter(Boolean),c,w:w||7});
  if(S.raw){
    for(const it of S.raw){const k=it[0];
      if(k==='h')fig.push({k:'c',p:[it[1],it[2]],r:10,f:BH_OR});
      else if(k==='t')fig.push({k:'t',p:[it[1],it[2]],s:it[3]});
      else{const pts=[];for(let i=1;i<it.length;i+=2)pts.push([it[i],it[i+1]]);ln(fig,pts,k==='b'?BH_BL:BH_OR)}}
  }else{
    const fv=!!S.fv,tl=S.tl||44;let h,s,t;
    if(S.s&&S.h){h=S.h;s=S.s;t=bhA(h,s)}else if(S.s){t=S.t;s=S.s;h=bhP(s,t+180,tl)}else{h=S.h;t=S.t;s=bhP(h,t,tl)}
    const fr=bhP([0,0],t-90,1);let hd=S.hd,tq=null;
    if(S.tc){const m=[(h[0]+s[0])/2,(h[1]+s[1])/2];tq=[m[0]-fr[0]*S.tc*2,m[1]-fr[1]*S.tc*2];if(hd==null)hd=bhA(tq,s)}
    if(hd==null)hd=fv?90:t;
    P.ha=h;P.ep=s;P.te=bhP(s,hd,13);
    const hr=fv?[[h[0]+7,h[1]],[h[0]-7,h[1]]]:[h,h],sr=fv?[bhP(s,t-90,12),bhP(s,t+90,12)]:[s,s];
    const M={};
    ['n','f'].forEach((sd,i)=>{const q=S[sd]||{},oL=fv?[i?-1:1,0]:fr,oA=fv?bhP([0,0],t-90+(i?180:0),1):fr;
      const L=bhMembre(hr[i],q.l,25,24,oL,1),A=bhMembre(sr[i],q.a,20,20,oA,fv?1:-1);M[sd]={L,A};
      if(L){P[sd].ge=L.j;P[sd].ch=L.e;P[sd].pi=bhPied(L,fv,!i)}
      if(A){P[sd].co=A.j;P[sd].po=A.e;if(typeof A.o==='number')P[sd].mn=bhP(A.e,A.o,7)}
      if(bhSvg.ko&&((L&&L.ko>1.5)||(A&&A.ko>1.5)))bhSvg.ko(sd,L&&L.ko,A&&A.ko)});
    const cf=fv&&!S.c2?BH_OR:BH_BL,f=M.f,n=M.n;
    if(f.A)ln(fig,[sr[1],f.A.j,f.A.e,P.f.mn],cf);
    if(f.L)ln(fig,[hr[1],f.L.j,f.L.e,P.f.pi],cf);
    if(fv){ln(fig,[hr[1],hr[0]],BH_OR);ln(fig,[sr[1],sr[0]],BH_OR)}
    if(tq)fig.push({k:'q',p:[h,tq,s],c:BH_OR,w:7});else ln(fig,[h,s],BH_OR);
    if(!S.ht)fig.push({k:'c',p:P.te,r:10,f:BH_OR});
    if(n.L)ln(fig,[hr[0],n.L.j,n.L.e,P.n.pi],BH_OR);
    if(n.A)ln(fig,[sr[0],n.A.j,n.A.e,P.n.mn],BH_OR);
    if(S.ht)fig.push({k:'c',p:P.te,r:10,f:BH_OR});
  }
  const R=x=>typeof x==='string'?x.split('.').reduce((o,k)=>o&&o[k],P):x;
  for(const q of S.pr||[]){const k=q[0];
    if(k==='step')der.push({k:'r',p:[q[1],q[2]],w:q[3],h:q[4]||131.5-q[2]});
    else if(k==='tapis')der.push({k:'r',p:[q[1],q[2]],w:q[3],h:q[4],f:'#232c4f',s:'#2c365c'});
    else if(k==='mur'){const x=q[2]==='g'?q[1]-6:q[1];der.push({k:'r',p:[x,10],w:6,h:121.5,nob:1})}
    else if(k==='chaise'){const[,x1,x2,y]=q;der.push({k:'l',p:[[x1+3,y+4],[x1+3,131.5]],c:BH_SUPB,w:4},{k:'l',p:[[x2-3,y+4],[x2-3,131.5]],c:BH_SUPB,w:4},{k:'l',p:[[x1+2.5,y+2],[x1+2.5,y-34]],c:BH_SUPB,w:5},{k:'r',p:[x1,y],w:x2-x1,h:5})}
    else if(k==='barre'){const c=R(q[1]);dev.push({k:'c',p:c,r:8,f:BH_SUPB,s:BH_MAT,sw:3},{k:'c',p:c,r:2,f:BH_MAT})}
    else if(k==='disque'){const c=R(q[1]);dev.push({k:'c',p:c,r:9,f:BH_MAT},{k:'c',p:c,r:3,f:BH_SUP})}
    else if(k==='ballon'){const a=R(q[1]),b=q[2]?R(q[2]):a;dev.push({k:'c',p:[(a[0]+b[0])/2,(a[1]+b[1])/2],r:q[3]||9,f:'#4c8dff'})}
    else if(k==='elast')dev.push({k:'l',p:q.slice(1).map(R),c:'#4cc38a',w:2.5});
    else if(k==='halt'){const c=R(q[1]);let a=q[2]||0;if(a==='p'){const sd=P[q[1].split('.')[0]];a=bhA(sd.co,sd.po)+90}
      const u=bhP([0,0],a,1),v=[-u[1],u[0]],e=(t,w)=>[c[0]+u[0]*t+v[0]*w,c[1]+u[1]*t+v[1]*w];
      dev.push({k:'l',p:[e(-8,0),e(8,0)],c:BH_MAT,w:3},{k:'l',p:[e(-7,-4.5),e(-7,4.5)],c:BH_MAT,w:5},{k:'l',p:[e(7,-4.5),e(7,4.5)],c:BH_MAT,w:5})}
  }
  const all=[...der,...fig,...dev];
  if(S.rot){const a=S.rot*Math.PI/180,c=Math.cos(a),sn=Math.sin(a),rp=p=>[100+(p[0]-100)*c+(p[1]-80)*sn,80-(p[0]-100)*sn+(p[1]-80)*c];for(const q of all){if(q.k==='r'){const a1=rp(q.p),a2=rp([q.p[0]+q.w,q.p[1]+q.h]);q.p=[Math.min(a1[0],a2[0]),Math.min(a1[1],a2[1])];q.w=Math.abs(a2[0]-a1[0]);q.h=Math.abs(a2[1]-a1[1])}else q.p=q.k==='c'||q.k==='t'?rp(q.p):q.p.map(rp)}}
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const q of all){const pts=q.k==='r'?[q.p,[q.p[0]+q.w,q.p[1]+q.h]]:q.k==='t'?[[q.p[0],q.p[1]-16],[q.p[0]+14,q.p[1]]]:q.p.length&&typeof q.p[0]==='number'?[q.p]:q.p,m=q.k==='c'?q.r+(q.sw||0)/2:q.k==='l'||q.k==='q'?q.w/2:0;
    for(const p of pts){x0=Math.min(x0,p[0]-m);x1=Math.max(x1,p[0]+m);if(!q.nob){y0=Math.min(y0,p[1]-m);y1=Math.max(y1,p[1]+m)}}}
  const yb=S.nog?70:131.5,dy=S.nog?70-(y0+y1)/2:131.5-y1;let sc=1;
  if(!S.nog&&y0+dy<3)sc=128.5/(131.5-y0-dy);if(S.nog&&y1-y0>132)sc=132/(y1-y0);if(S.zm)sc*=S.zm;if((x1-x0)*sc>194)sc=194/(x1-x0);if(!S.nog&&(131.5-y0-dy)*sc>128.5)sc=128.5/(131.5-y0-dy);
  const cx=(x0+x1)/2,T=p=>[+(100+(p[0]-cx)*sc).toFixed(1),+(yb+(p[1]+dy-yb)*sc).toFixed(1)];
  let o=`<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">`;
  if(!S.nog)o+=`<line x1="8" y1="133" x2="192" y2="133" stroke="${BH_SOL}" stroke-width="3" stroke-linecap="round"/>`;
  for(const q of all){
    if(q.k==='l'){const p=q.p.map(T);o+=p.length===2?`<line x1="${p[0][0]}" y1="${p[0][1]}" x2="${p[1][0]}" y2="${p[1][1]}" stroke="${q.c}" stroke-width="${q.w}" stroke-linecap="round"/>`:`<polyline points="${p.map(a=>a.join(',')).join(' ')}" fill="none" stroke="${q.c}" stroke-width="${q.w}" stroke-linecap="round" stroke-linejoin="round"/>`}
    else if(q.k==='q'){const[a,b,c]=q.p.map(T);o+=`<path d="M${a} Q${b} ${c}" fill="none" stroke="${q.c}" stroke-width="${q.w}" stroke-linecap="round"/>`}
    else if(q.k==='c'){const c=T(q.p);o+=`<circle cx="${c[0]}" cy="${c[1]}" r="${+(q.r*Math.min(sc,1)).toFixed(1)}" fill="${q.f}"${q.s?` stroke="${q.s}" stroke-width="${q.sw}"`:''}/>`}
    else if(q.k==='r'){const a=T(q.p);o+=`<rect x="${a[0]}" y="${a[1]}" width="${+(q.w*sc).toFixed(1)}" height="${+(q.h*sc).toFixed(1)}" rx="2" fill="${q.f||BH_SUP}" stroke="${q.s||BH_SUPB}" stroke-width="2"/>`}
    else if(q.k==='t'){const a=T(q.p);o+=`<text x="${a[0]}" y="${a[1]}" font-size="20" font-weight="800" fill="#8a92b2" font-family="system-ui,sans-serif">${q.s}</text>`}
  }
  return o+'</svg>';
}
// bases réutilisées
function bh(b,o){o=o||{};return{...b,...o,n:{...b.n,...o.n},f:{...b.f,...o.f},pr:[...(b.pr||[]),...(o.pr||[])]}}
function bhMir(r){return{...r,raw:r.raw.map(it=>it.map((v,i)=>it[0]==='t'?(i===1?186-v:v):i%2===1?200-v:v))}}
const BH_DEB={h:[100,79],t:90,n:{l:[103,128],a:[106,74]},f:{l:[97,128],a:[97,75]}};            // debout, bras le long du corps
const BH_HAN=bh(BH_DEB,{n:{a:[104,70]},f:{a:[100,70]}});                                          // mains sur les hanches
const BH_FDEB={fv:1,h:[100,79],t:90,n:{l:[109,128]},f:{l:[91,128]}};                              // debout vu de face
const BH_DOS={h:[100,128],t:180,hd:150,n:{l:{a:[0,0]},a:[97,128]},f:{l:{a:[0,0]},a:[96,128]}};  // allongé sur le dos, jambes tendues
const BH_DOSG=bh(BH_DOS,{n:{l:[124,128]},f:{l:[120,128]}});                                      // allongé, genoux fléchis, pieds à plat
const BH_VEN={h:[86,128],t:0,hd:30,n:{l:{a:[180,180],p:180},a:{a:[0,0]}},f:{l:{a:[180,180],p:180},a:{a:[0,0]}}}; // sur le ventre
const BH_4P={s:[121.4,88],h:[80,103],hd:12,n:{l:{a:[-90,180],p:180},a:[121.4,128]},f:{l:{a:[-93,180],p:180},a:[117.4,128]}}; // à quatre pattes
const BH_SIDE={s:[63,117],h:[106,112],hd:165,n:{a:[97,128,[0,-1]]},f:{l:{j:[127,128],e:[106,128],p:'x'},a:[26,126,[0,1]]}}; // allongé sur le côté (vu de face)
const BH_BANC={h:[108,113.5],t:180,hd:150,n:{l:[136,128]},f:{l:[132,128]},pr:[['step',36,117,76]]};  // allongé sur un step
const BH_PH={s:[140,88],t:18.55,n:{l:{a:[198.55,198.55]},a:[140,128]},f:{l:{a:[197.5,197.5]},a:[136,128]}}; // planche haute
const BH_PB={s:[138,112],t:3.45,n:{l:{a:[183.45,183.45]},a:[140,128,[-1,-.4]]},f:{l:{a:[182.5,182.5]},a:[136,128,[-1,-.4]]}}; // pompe en bas
const BH_ROW={s:[138,67],h:[96,80],hd:15,n:{l:[90,128]},f:{l:{j:[96,105],e:[72,105],p:180},a:[136,105.5]},pr:[['step',62,108.5,84]]}; // main et genou sur un step
const BH_PONT0={h:[100,128],t:180,hd:150,n:{l:[124,128],a:[97,128]},f:{l:[120,128],a:[96,128]}};
const BH_PONT1={s:[56,128],h:[96,110],hd:150,n:{l:[124,128],a:[97,128]},f:{l:[120,128],a:[96,128]}};
const BH_FL={fv:1,h:[112,99],t:90,n:{l:[140,128]},f:{l:[66,128]}};                              // fente latérale vue de face
const BH_ROT=[['o',93,122,82,100,86,128],['o',107,122,118,100,114,128],['o',92,122,108,122],['o',100,122,100,86]]; // assis genoux fléchis, vu de face
const BH_ROTA={raw:[...BH_ROT,['o',90,86,108,88],['h',99,73],['o',108,88,124,100,128,112],['o',90,86,108,104,126,112]]};
const BH_YTWM=[['tapis',4,10,150,120]];const BH_YTW=[['o',60,64,12,62],['o',60,76,12,78],['o',60,63,60,77],['o',60,70,104,70],['o',104,57,104,83],['h',117,70]];
const BH_EG=[['o',50,128,150,128],['h',100,119]];                                               // allongé, vu depuis les pieds
const BONHOMMES={
// ---------- Renforcement : bas du corps ----------
"renfo|Squat|Squat normal":[BH_DEB,{h:[80,104],t:55,hd:70,n:{l:[102,128],a:[117,70,1]},f:{l:[98,128],a:[114,71,1]}}],
"renfo|Squat|Squat sumo":[{fv:1,h:[100,81],t:90,n:{l:[120,128],a:[102,60]},f:{l:[80,128],a:[98,60]}},{fv:1,h:[100,103],t:90,n:{l:[121,128],a:[102,82]},f:{l:[79,128],a:[98,82]}}],
"renfo|Squat|Squat pieds serrés":[bh(BH_DEB,{n:{l:[101,128]},f:{l:[99,128]}}),{h:[82,103],t:57,hd:70,n:{l:[101,128],a:[118,69,1]},f:{l:[99,128],a:[115,70,1]}}],
"renfo|Fente|Fente avant":[BH_HAN,{h:[96,93],t:90,n:{l:[122,128],a:[100,83]},f:{l:[67,121,1,-40],a:[96,83]}}],
"renfo|Fente|Fente arrière":[BH_HAN,{h:[96,93],t:90,n:{l:[67,121,1,-40],a:[100,83]},f:{l:[122,128],a:[96,83]}}],
"renfo|Fente|Fente latérale":[bh(BH_FDEB,{n:{a:[101,58]},f:{a:[99,58]}}),bh(BH_FL,{n:{a:[113,77]},f:{a:[111,77]}})],
"renfo|Fente|Fente croisée":[bh(BH_FDEB,{c2:1,n:{a:[107,62]},f:{a:[93,62]}}),{fv:1,c2:1,h:[98,96],t:90,n:{l:[106,128],a:[105,78]},f:{l:[122,121,1,-30],a:[91,78]}}],
"renfo|Relevé de bassin|Pieds largeur de bassin":[BH_PONT0,BH_PONT1],
"renfo|Relevé de bassin|Pieds écartés":[BH_PONT0,BH_PONT1],
"renfo|Relevé de bassin|Sur une jambe":[bh(BH_PONT0,{f:{l:{a:[88,88]}}}),bh(BH_PONT1,{f:{l:{a:[75,75]}}})],
"renfo|Élévation latérale|Allongé sur le côté":[bh(BH_SIDE,{n:{l:{a:[1,1],p:'l'}}}),bh(BH_SIDE,{n:{l:{a:[38,38],p:'l'}}})],
"renfo|Élévation latérale|À quatre pattes":[BH_4P,bh(BH_4P,{n:{l:{j:[88,100],e:[64,101],p:180}}})],
"renfo|Élévation latérale|Debout":[bh(BH_FDEB,{n:{a:[108,62]},f:{a:[64,50,-1]},pr:[['mur',60.5,'g']]}),bh(BH_FDEB,{h:[100,80],n:{l:{a:[-50,-50],p:-20},a:[108,63]},f:{l:[92,128],a:[64,51,-1]},pr:[['mur',60.5,'g']]})],
"renfo|Extension de hanche|À quatre pattes jambe tendue":[bh(BH_4P,{n:{l:{a:[-165,-165]}}}),bh(BH_4P,{n:{l:{a:[180,180]}}})],
"renfo|Extension de hanche|À quatre pattes genou plié":[bh(BH_4P,{n:{l:{a:[-125,145]}}}),bh(BH_4P,{n:{l:{a:[180,90]}}})],
"renfo|Extension de hanche|Debout":[{h:[100,80],t:82,hd:85,n:{l:[103,128],a:[143,46]},f:{l:[97,128],a:[141,48]},pr:[['mur',146.5]]},{h:[100,81],t:80,hd:83,n:{l:{a:[-125,-125]},a:[143,46]},f:{l:[97,128],a:[141,48]},pr:[['mur',146.5]]}],
// ---------- Renforcement : haut du corps ----------
"renfo|Poitrine|Pompes normales":[BH_PH,BH_PB],
"renfo|Poitrine|Pompes larges":[
  {raw:[['o',84,92,116,92],['o',84,92,64,128],['o',116,92,136,128],['h',100,99]]},
  {raw:[['o',84,112,116,112],['o',84,112,65,104,62,128],['o',116,112,135,104,138,128],['h',100,117]]}],
"renfo|Poitrine|Pompes sur les genoux":[{s:[140,88],t:35.4,n:{l:{a:[215.4,150],p:'l'},a:[140,128]},f:{l:{a:[215.4,145],p:'l'},a:[136,128]}},{s:[137,112],t:13.4,n:{l:{a:[193.4,150],p:'l'},a:[140,128,[-1,-.4]]},f:{l:{a:[193.4,145],p:'l'},a:[136,128,[-1,-.4]]}}],
"renfo|Poitrine|Pompes contre un mur":[{s:[100,40],t:71.2,n:{l:{a:[251.2,251.2]},a:[140,40]},f:{l:{a:[251.2,251.2]},a:[139,43]},pr:[['mur',143.5]]},{s:[118,48.3],t:58.9,n:{l:{a:[238.9,238.9]},a:[140,40,[-.2,1]]},f:{l:{a:[238.9,238.9]},a:[139,43,[-.2,1]]},pr:[['mur',143.5]]}],
"renfo|Poitrine|Développé couché à la barre":[bh(BH_BANC,{n:{a:[66,73.5]},f:{a:[62,74.5]},pr:[['barre','n.po']]}),bh(BH_BANC,{n:{a:[68,101]},f:{a:[64,102]},pr:[['barre','n.po']]})],
"renfo|Poitrine|Développé couché aux haltères":[bh(BH_BANC,{n:{a:[66,73.5]},f:{a:[62,74.5]},pr:[['halt','n.po']]}),bh(BH_BANC,{n:{a:[68,102]},f:{a:[64,103]},pr:[['halt','n.po']]})],
"renfo|Poitrine|Écarté couché aux haltères":[
  {nog:1,raw:[['o',94,64,119,60,126,56],['o',94,76,119,80,126,84],['o',94,63,94,77],['o',50,70,94,70],['o',50,57,50,83],['h',36,70],['o',50,57,58,64],['o',50,83,58,76]],pr:[['step',28,60,96,20],['halt',[60,64],0],['halt',[60,76],0]]},
  {nog:1,raw:[['o',94,64,119,60,126,56],['o',94,76,119,80,126,84],['o',94,63,94,77],['o',50,70,94,70],['o',50,57,50,83],['h',36,70],['o',50,57,46,38,50,19],['o',50,83,46,102,50,121]],pr:[['step',28,60,96,20],['halt',[50,19],0],['halt',[50,121],0]]}],
"renfo|Épaules|Touches d'épaules en planche":[BH_PH,bh(BH_PH,{n:{a:[133,96,[1,1]]},f:{a:[140,128]}})],
"renfo|Épaules|Développé épaules à la barre":[bh(BH_DEB,{n:{a:[111,36,[.3,1]]},f:{a:[108,38,[.3,1]]},pr:[['barre','n.po']]}),bh(BH_DEB,{n:{a:[101,-5]},f:{a:[99,-5]},pr:[['barre','n.po']]})],
"renfo|Épaules|Développé épaules aux haltères":[bh(BH_FDEB,{n:{a:[131,16]},f:{a:[69,16]},pr:[['halt','n.po'],['halt','f.po']]}),bh(BH_FDEB,{n:{a:[105,-4]},f:{a:[95,-4]},pr:[['halt','n.po'],['halt','f.po']]})],
"renfo|Épaules|Élévations latérales aux haltères":[bh(BH_FDEB,{n:{a:[117,74]},f:{a:[83,74]},pr:[['halt','n.po',90],['halt','f.po',90]]}),bh(BH_FDEB,{n:{a:[151,38,[0,1]]},f:{a:[49,38,[0,1]]},pr:[['halt','n.po',90],['halt','f.po',90]]})],
"renfo|Épaules|Élévations frontales aux haltères":[bh(BH_DEB,{n:{a:[106,73]},f:{a:[104,74]},pr:[['halt','n.po','p']]}),bh(BH_DEB,{n:{a:{a:[0,0]}},f:{a:{a:[-3,-3]}},pr:[['halt','n.po','p']]})],
"renfo|Dos|Nage au sol":[bh(BH_VEN,{hd:25,n:{l:{a:[176,176],p:'l'},a:{a:[6,6]}},f:{l:{a:[176,176],p:'l'},a:{a:[5,5]}}}),bh(BH_VEN,{hd:25,n:{l:{a:[177,177],p:'l'},a:{a:[24,24]}},f:{l:{a:[164,164],p:'l'},a:{a:[4,4]}}})],
"renfo|Dos|Y-T-W allongé":[
  {nog:1,raw:[...BH_YTW,['o',104,57,136,35],['o',104,83,136,105],['t',8,26,'Y']],pr:BH_YTWM},
  {nog:1,raw:[...BH_YTW,['o',104,57,104,17],['o',104,83,104,123],['t',8,26,'T']],pr:BH_YTWM},
  {nog:1,raw:[...BH_YTW,['o',104,57,91,43,107,30],['o',104,83,91,97,107,110],['t',8,26,'W']],pr:BH_YTWM}],
"renfo|Dos|Bras en W tirés vers l'arrière":[bh(BH_VEN,{hd:25,n:{a:{a:[6,6]}},f:{a:{a:[5,5]}}}),bh(BH_VEN,{hd:25,n:{a:[130,113,[-1,-.3]]},f:{a:[128,114,[-1,-.3]]}})],
"renfo|Dos|Rowing à la barre buste penché":[{h:[80,88],t:38,hd:45,n:{l:[100,128],a:[102,98]},f:{l:[96,128],a:[100,99]},pr:[['barre','n.po']]},{h:[80,88],t:38,hd:45,n:{l:[100,128],a:[98,80,[-1,-1]]},f:{l:[96,128],a:[96,81,[-1,-1]]},pr:[['barre','n.po']]}],
"renfo|Dos|Rowing haltère un bras":[bh(BH_ROW,{n:{a:[141,105]},pr:[['halt','n.po','p']]}),bh(BH_ROW,{n:{a:[116,82,[-.3,-1]]},pr:[['halt','n.po','p']]})],
"renfo|Dos|Tirage avec élastique":[{h:[80,125],t:90,n:{l:{a:[0,0]},a:[118,90]},f:{l:{a:[0,0]},a:[117,92]},pr:[['elast','n.pi','n.po']]},{h:[80,125],t:90,n:{l:{a:[0,0]},a:[96,103,[-1,.3]]},f:{l:{a:[0,0]},a:[95,104,[-1,.3]]},pr:[['elast','n.pi','n.po']]}],
"renfo|Dos|Pull-over haltère":[bh(BH_BANC,{n:{a:[68,75,[-1,0]]},f:{a:[66,76,[-1,0]]},pr:[['halt','n.po']]}),bh(BH_BANC,{n:{a:[26,106]},f:{a:[27,108]},pr:[['halt','n.po',90]]})],
"renfo|Biceps|Curl en supination":[bh(BH_DEB,{pr:[['barre','n.po']]}),bh(BH_DEB,{n:{a:[112,40,[-.1,1]]},f:{a:[110,42,[-.1,1]]},pr:[['barre','n.po']]})],
"renfo|Biceps|Curl prise marteau":[bh(BH_DEB,{pr:[['halt','n.po','p']]}),bh(BH_DEB,{n:{a:[112,40,[-.1,1]]},f:{a:[110,42,[-.1,1]]},pr:[['halt','n.po','p']]})],
"renfo|Biceps|Curl en pronation":[bh(BH_DEB,{pr:[['barre','n.po']]}),bh(BH_DEB,{n:{a:[112,40,[-.1,1]]},f:{a:[110,42,[-.1,1]]},pr:[['barre','n.po']]})],
"renfo|Biceps|Curl concentré":[{h:[80,104.5],t:35,hd:50,n:{l:[106,128,-1],a:{a:[-108.6,-90]}},f:{l:[102,128,-1],a:[106,99]},pr:[['step',50,108,42],['halt','n.po','p']]},{h:[80,104.5],t:35,hd:50,n:{l:[106,128,-1],a:{a:[-108.6,60]}},f:{l:[102,128,-1],a:[106,99]},pr:[['step',50,108,42],['halt','n.po','p']]}],
"renfo|Triceps|Dips au sol":[{s:[64,88],h:[102,110],hd:100,n:{l:[136,128],a:[60,128,-1,0]},f:{l:[132,128],a:[56,128,-1,0]}},{s:[68,104],h:[110,119],hd:100,n:{l:[138,128],a:[60,128,[-1,0],0]},f:{l:[134,128],a:[56,128,[-1,0],0]}}],
"renfo|Triceps|Dips sur une chaise":[{s:[80,61],h:[83,105],hd:92,n:{l:[118,128],a:[78,100]},f:{l:[114,128],a:[76,100]},pr:[['chaise',44,80,103.5]]},{s:[96,78],h:[97,122],hd:92,n:{l:[134,128],a:[78,100,[-1,-.3]]},f:{l:[130,128],a:[76,100,[-1,-.3]]},pr:[['chaise',44,80,103.5]]}],
"renfo|Triceps|Pompes serrées":[bh(BH_PH,{f:{a:[139,128]}}),bh(BH_PB,{n:{a:[140,128,[-1,-.15]]},f:{a:[139,128,[-1,-.15]]}})],
"renfo|Triceps|Extension haltère au-dessus de la tête":[bh(BH_DEB,{n:{a:[101,-5]},f:{a:[99,-5]},pr:[['halt','n.po','p']]}),bh(BH_DEB,{n:{a:{a:[96,-125]}},f:{a:{a:[94,-125]}},pr:[['halt','n.po','p']]})],
"renfo|Triceps|Kickback haltère":[bh(BH_ROW,{n:{a:{a:[197,-90]}},pr:[['halt','n.po','p']]}),bh(BH_ROW,{n:{a:{a:[197,197]}},pr:[['halt','n.po','p']]})],
"renfo|Triceps|Barre au front":[bh(BH_BANC,{n:{a:[66,73.5]},f:{a:[62,74.5]},pr:[['barre','n.po']]}),bh(BH_BANC,{n:{a:{a:[100,175]}},f:{a:{a:[98,175]}},pr:[['barre','n.po']]})],
// ---------- Renforcement : abdos ----------
"renfo|Obliques|Planche latérale":[{s:[60,108],t:167.6,n:{l:{a:[-12.4,-12.4],p:'x'},a:[99,111,[0,-1]]},f:{l:{a:[-12.4,-12.4],p:'x'},a:{a:[-90,180]}}}],
"renfo|Obliques|Crunch oblique":[bh(BH_DOSG,{n:{a:[38,118,[.3,-1]]}}),{h:[100,128],t:150,hd:140,n:{l:[124,128],a:[44,96,[1,-.6]]},f:{l:[120,128],a:[92,128]}}],
"renfo|Obliques|Rotations du buste assis":[BH_ROTA,bhMir(BH_ROTA)],
"renfo|Obliques|Essuie-glace":[
  {zm:1.5,raw:[...BH_EG,['o',92,125,108,125],['b',103,125,103,99],['o',97,125,97,99]]},
  {zm:1.5,raw:[...BH_EG,['o',92,125,108,125],['b',102,125,121,111],['o',97,125,115,108]]}],
"renfo|Obliques|Flexion latérale avec haltère":[bh(BH_FDEB,{n:{a:[116,74,-1]},f:{a:[93,62]},pr:[['halt','n.po',90]]}),bh(BH_FDEB,{t:72,n:{a:[126,80,-1]},f:{a:[94,62]},pr:[['halt','n.po',90]]})],
"renfo|Obliques|Rotations du buste avec un disque":[bh(BH_ROTA,{pr:[['disque',[127,111]]]}),bh(bhMir(BH_ROTA),{pr:[['disque',[73,111]]]})],
"renfo|Grand droit|Crunch":[bh(BH_DOSG,{n:{a:[44,120,[.2,-1]]},f:{a:[45,121,[.2,-1]]}}),{h:[100,128],t:155,hd:145,n:{l:[124,128],a:[45,104,[.2,-1]]},f:{l:[120,128],a:[46,105,[.2,-1]]}}],
"renfo|Grand droit|Montée de buste":[bh(BH_DOSG,{n:{a:{a:[28,28]}},f:{a:{a:[26,26]}}}),{h:[100,128],t:82,hd:85,n:{l:[124,128,[0,-1]],a:{a:[5,5]}},f:{l:[120,128,[0,-1]],a:{a:[3,3]}}}],
"renfo|Grand droit|Relevé de jambes":[bh(BH_DOS,{n:{l:{a:[90,90]}},f:{l:{a:[88,88]}}}),bh(BH_DOS,{n:{l:{a:[22,22]}},f:{l:{a:[20,20]}}})],
"renfo|Grand droit|Crunch inversé":[bh(BH_DOS,{n:{l:{a:[90,0]}},f:{l:{a:[88,-2]}}}),{s:[56,128],h:[99,119.5],hd:150,n:{l:{a:[130,40]},a:[94,128]},f:{l:{a:[128,38]},a:[92,128]}}],
"renfo|Grand droit|Crunch avec haltère":[bh(BH_DOS,{n:{l:{a:[90,0]},a:[72,118,[.5,-1]]},f:{l:{a:[88,-2]},a:[70,119,[.5,-1]]},pr:[['halt','n.po']]}),{h:[100,128],t:155,hd:145,n:{l:{a:[90,0]},a:[74,108,[.5,-1]]},f:{l:{a:[88,-2]},a:[72,109,[.5,-1]]},pr:[['halt','n.po',-25]]}],
"renfo|Grand droit|Relevé de jambes avec un ballon":[bh(BH_DOS,{n:{l:{a:[90,90]}},f:{l:{a:[88,88]}},pr:[['ballon','n.ch','n.pi']]}),bh(BH_DOS,{n:{l:{a:[22,22]}},f:{l:{a:[20,20]}},pr:[['ballon','n.ch','n.pi']]})],
"renfo|Lombaires|Superman":[BH_VEN,{h:[86,128],t:12,hd:15,n:{l:{a:[172,172],p:'l'},a:{a:[18,18]}},f:{l:{a:[171,171],p:'l'},a:{a:[17,17]}}}],
"renfo|Lombaires|Bird dog":[BH_4P,bh(BH_4P,{n:{a:{a:[12,12]}},f:{l:{a:[183,183]}}})],
"renfo|Lombaires|Extension lombaire mains derrière la tête":[bh(BH_VEN,{n:{a:[137,115,[-.3,-1]]},f:{a:[135,116,[-.3,-1]]}}),bh(BH_VEN,{t:18,hd:20,n:{a:[134,104,[-.3,-1]]},f:{a:[132,105,[-.3,-1]]}})],
"renfo|Lombaires|Soulevé de terre jambes semi-tendues":[bh(BH_DEB,{n:{a:[104,73]},f:{a:[102,74]},pr:[['barre','n.po']]}),{h:[78,86],t:30,hd:32,n:{l:[100,128],a:[102,101]},f:{l:[96,128],a:[100,102]},pr:[['barre','n.po']]}],
"renfo|Lombaires|Superman avec un disque":[bh(BH_VEN,{pr:[['disque','n.po']]}),{h:[86,128],t:12,hd:15,n:{l:{a:[172,172],p:'l'},a:{a:[18,18]}},f:{l:{a:[171,171],p:'l'},a:{a:[17,17]}},pr:[['disque','n.po']]}],
// ---------- Étirements : bas du corps (une seule position tenue, sauf mouvement) ----------
"etir|Quadriceps|Debout":[{h:[100,79],t:90,n:{l:{a:[-100,105],p:'p'},a:[86,76]},f:{l:[100,128],a:{a:[0,0]}}}],
"etir|Quadriceps|Allongé sur le côté":[{nog:1,rot:90,h:[100,79],t:90,hd:95,n:{l:{a:[-100,105],p:'p'},a:[86,76]},f:{l:{a:[-80,-95],p:'x'},a:{a:[90,90]}},pr:[['tapis',76,-14,50,148]]}],
"etir|Quadriceps|Allongé sur le ventre":[bh(BH_VEN,{n:{l:{a:[180,25],p:'p'},a:[86.3,113.7,[0,-1]]}})],
"etir|Ischios|Allongé sur le dos":[bh(BH_DOS,{n:{l:{a:[110,110]},a:[92.5,107.3]},f:{a:[90,108]}})],
"etir|Ischios|Assis, jambes tendues":[{h:[80,125],t:35,hd:28,n:{l:{a:[0,0]},a:[128,120,[0,1]]},f:{l:{a:[0,0]},a:[126,121,[0,1]]}}],
"etir|Ischios|Assis, une jambe tendue":[{h:[80,125],t:35,hd:28,n:{l:{a:[0,0]},a:[127,120,[0,1]]},f:{l:{j:[101,121],e:[92,126],p:0},a:[124,121,[0,1]]}}],
"etir|Ischios|Debout, pieds écartés":[{raw:[["b",91,79,94,128,103,128],["b",112,104,107,127],["o",93,78,97,128,107,128],["o",93,78,114,104],["h",120,114],["o",114,104,110,127]]}],
"etir|Ischios|Debout, un talon posé devant":[{h:[93,86],t:55,hd:60,n:{l:[118,128,1,'f'],a:[97,84]},f:{l:[84,128],a:[95,85]}}],
"etir|Fessiers|Allongé, genou à la poitrine":[bh(BH_DOS,{n:{l:{a:[135,-15]},a:[94,113]},f:{a:[92,114]}})],
"etir|Fessiers|Allongé, cheville sur le genou":[{h:[100,128],t:180,hd:150,n:{l:{j:[107,110],e:[88,105],p:150},a:[91,113]},f:{l:{a:[120,30]},a:[89,114]}}],
"etir|Fessiers|Assis, jambe croisée avec torsion":[{h:[80,125],t:90,hd:100,n:{l:[102,126],a:[66,118]},f:{l:{a:[0,0]},a:[98,100,[1,0]]}}],
"etir|Fessiers|À genoux, jambe avant pliée":[{h:[101,119],t:15,tc:1.5,hd:-25,n:{l:{j:[124,128],e:[106,128],p:'x'},a:[178,127]},f:{l:{a:[190.6,190.6],p:180},a:[176,128]}}],
"etir|Psoas|Fente, genou arrière au sol":[{h:[104,110],t:90,hd:90,n:{l:[128,128],a:[115,104]},f:{l:{a:[-136,180],p:180},a:[113,105]}}],
"etir|Psoas|Fente debout":[{h:[100,98],t:90,hd:90,n:{l:[56.7,121,1,-40],a:{a:[92,92]}},f:{l:[124,128],a:[103,92]}}],
"etir|Adducteurs|Assis, jambes écartées":[{fv:1,h:[100,125],t:90,tl:36,n:{l:{a:[0,0],p:90},a:[110,122]},f:{l:{a:[180,180],p:90},a:[90,122]}}],
"etir|Adducteurs|Assis, papillon":[{fv:1,h:[100,125],t:90,n:{l:{j:[124,112],e:[104,125],p:'x'},a:[105,121]},f:{l:{j:[76,112],e:[96,125],p:'x'},a:[95,121]}}],
"etir|Adducteurs|Debout, fente latérale":[bh(BH_FL,{n:{a:[124,95]},f:{a:[116,92]}})],
"etir|Mollets|Debout, mains contre un mur":[{s:[110,50],t:57.3,hd:60,n:{l:{a:[237.3,237.3]},a:[146,50]},f:{l:[100,128],a:[145,53]},pr:[['mur',149.5]]}],
"etir|Mollets|En fente debout, sans appui":[{h:[92,92],t:80,hd:85,n:{l:[60,128],a:[100,81]},f:{l:[118,128],a:[96,81]}}],
"etir|Mollets|Assis, jambe tendue":[{h:[80,125],t:45,hd:40,n:{l:{a:[0,0]},a:[128,115,[0,1]]},f:{l:[102,126,[0,-1]],a:[126,116,[0,1]]}}],
"etir|Ischios|Postural, à genoux jambe tendue":[{h:[90,103],t:50,n:{l:[132.1,128,1,'f'],a:{a:[50,50]}},f:{l:{a:[-90,180],p:180},a:{a:[48,48]}}},{h:[90,103],t:25,tc:3,hd:-30,n:{l:[132.1,128,1,'f'],a:[128,121,[0,1]]},f:{l:{a:[-90,180],p:180},a:[126,122,[0,1]]}}],
"etir|Dos|Postural, debout dos plat":[{h:[88,82],t:10,n:{l:[100,128],a:{a:[10,10]}},f:{l:[97,128],a:{a:[8,8]}}},{h:[88,82],t:-30,tc:5,hd:-80,n:{l:[100,128],a:[124,127,[1,0]]},f:{l:[97,128],a:[122,127,[1,0]]}}],
"etir|Adducteurs|Postural, debout jambes écartées":[{h:[88,82],t:10,n:{l:[104,128],a:{a:[10,10]}},f:{l:[92,128],a:{a:[8,8]}}},{h:[88,82],t:-35,tc:5,hd:-85,n:{l:[104,128],a:[110,127,[1,0]]},f:{l:[92,128],a:[108,127,[1,0]]}}],
"etir|Obliques|Postural, debout bras tendus":[{fv:1,h:[100,80],t:105,n:{l:[110,128],a:[79.3,2.7]},f:{l:[90,128],a:[79.3,2.7]}}],
"etir|Mollets|Chien tête en bas":[{h:[79.1,82.9],s:[116.2,106.5],n:{l:[60,128],a:[150,128]},f:{l:[66,123,[1,.3],-28],a:[147,128]}}],
// ---------- Étirements : haut du corps ----------
"etir|Poitrine|Mains crochetées derrière le dos":[bh(BH_DEB,{hd:95,n:{a:{a:[-112,-112]}},f:{a:{a:[-110,-110]}}})],
"etir|Poitrine|Avant-bras contre un mur":[bh(BH_FDEB,{n:{a:[116,74,-1]},f:{a:{a:[180,90]}},pr:[['mur',64.5,'g']]})],
"etir|Poitrine|Bras écartés tirés vers l'arrière":[bh(BH_DEB,{n:{a:{a:[0,0]}},f:{a:{a:[3,3]}}}),bh(BH_DEB,{n:{a:{a:[175,175]}},f:{a:{a:[172,172]}}})],
"etir|Épaules|Bras tendu plaqué contre la poitrine":[bh(BH_FDEB,{n:{a:{a:[185,185]}},f:{a:[92,41,[-.5,1]]}})],
"etir|Épaules|À quatre pattes, bras glissé sous la poitrine":[{h:[80,103],t:-20,hd:-5,n:{l:{a:[-90,180],p:180},a:{j:[110,126],e:[96,127]}},f:{l:{a:[-93,180],p:180},a:[160,127]}}],
"etir|Dos|Position de l'enfant":[{h:[88,116],s:[131.7,121.5],hd:0,n:{l:[86,128,[1,0],180],a:[171,127]},f:{l:[84,128,[1,0],180],a:[170,128]}}],
"etir|Dos|Debout, dos rond":[{h:[96,82],t:68,tc:5,hd:-25,n:{l:[100,128],a:[150,52]},f:{l:[97,128],a:[149,55]}}],
"etir|Dos|À quatre pattes, dos rond / dos creux":[bh(BH_4P,{tc:10,hd:-70}),bh(BH_4P,{tc:-8,hd:50})],
"etir|Biceps|Bras tendu, paume vers le plafond":[bh(BH_DEB,{n:{a:{a:[0,0],m:-80}},f:{a:[140,44]}})],
"etir|Biceps|À quatre pattes, doigts vers les genoux":[{h:[64,109],s:[104.6,92],hd:10,n:{l:[56,128,[1,.2],180],a:[122,128,-1,180]},f:{l:[54,128,[1,.2],180],a:[118,128,-1,180]}}],
"etir|Triceps|Main entre les omoplates":[{raw:[['o',107,79,109,128,116,128],['o',93,79,91,128,84,128],['o',93,79,107,79],['o',100,79,100,35],['o',88,35,112,35],['b',109,15.2,102,33],['o',112,35,109,15.2],['o',88,35,84,15.4,103.5,11],['h',100,22]]}],
"etir|Cervicales|Tête penchée sur le côté":[bh(BH_FDEB,{ht:1,hd:62,n:{a:[97,16,[1,-1]]},f:{a:[86,74,-1]}})],
"etir|Cervicales|Tête tournée vers l'aisselle":[bh(BH_FDEB,{ht:1,hd:45,n:{a:[103,15,[1,-1]]},f:{a:[86,74,-1]}})],
"etir|Cervicales|Menton vers la poitrine":[bh(BH_DEB,{hd:40,n:{a:[101,20,[1,0]]},f:{a:[99,21,[1,0]]}})],
// ---------- Étirements : abdos ----------
"etir|Grand droit|Sphinx":[{h:[90,128],s:[129.2,108],tc:-4,hd:35,n:{l:{a:[180,180],p:180},a:{a:[-90,0]}},f:{l:{a:[180,180],p:180},a:{a:[-92,0]}}}],
"etir|Grand droit|Auto-grandissement allongé":[bh(BH_DOS,{n:{l:{a:[0,0],p:'l'},a:{a:[180,180]}},f:{l:{a:[0,0],p:'l'},a:{a:[180,180]}}})],
"etir|Grand droit|Auto-grandissement debout":[BH_DEB,{h:[100,70],t:90,n:{l:[103,119,1,-55],a:{a:[92,92]}},f:{l:[97,119,1,-55],a:{a:[88,88]}}}],
"etir|Obliques|Debout, inclinaison sur le côté":[{fv:1,h:[100,80],t:110,n:{l:[112,128],a:[70,12]},f:{l:[88,128],a:[90,70]}}],
"etir|Obliques|Assis, une jambe pliée":[{fv:1,h:[100,125],t:74,tl:42,n:{l:{a:[0,0],p:90},a:[104,124,-1]},f:{l:{j:[72,114],e:[96,124],p:'x'},a:[142,56]}}],
"etir|Obliques|Allongé, genoux sur le côté":[{zm:1.5,raw:[...BH_EG,['o',92,125,108,125],['b',102,125,126,121],['o',97,125,122,116]]}],
"etir|Lombaires|Allongé, les deux genoux à la poitrine":[bh(BH_DOS,{n:{l:{a:[130,-25]},a:[95,113]},f:{l:{a:[127,-28]},a:[93,114]}})],
"etir|Lombaires|Assis, dos rond relâché":[{h:[80,100.5],t:12,tc:10,hd:-85,n:{l:[106,128],a:[122,127,[1,0]]},f:{l:[102,128],a:[120,127,[1,0]]},pr:[['chaise',44,84,104]]}]
};
function fxDessin(cat,c,v){const P=BONHOMMES[cat+'|'+c+'|'+v];if(!P)return'';return`<div class="fx-des${P.length>1?' fx-des2':''}" aria-hidden="true">${P.map(bhSvg).join('<span class="fx-fle">→</span>')}</div>`}
(function(){const st=document.createElement('style');st.textContent=`
.fx-ps{list-style:none;display:flex;align-items:center;gap:10px;cursor:pointer}
.fx-ps::-webkit-details-marker{display:none}
.fx-ps h2{margin:0}
.fx-fl{display:inline-block;transition:transform .15s;color:var(--mute);font-size:18px}
details[open]>.fx-ps .fx-fl{transform:rotate(90deg)}
.fx-var{margin-top:14px}
.fx-nom{font-weight:800;color:var(--or)}
.fx-tg{margin:0 0 12px;padding:8px 12px}
.fx-des{display:flex;align-items:center;gap:4px;margin:8px 0 6px}
.fx-des svg{display:block;width:100%;height:auto;max-width:62%;margin:0 auto}
.fx-des2 svg{flex:1;min-width:0;max-width:none}
.fx-fle{flex:none;font-size:22px;color:var(--mute)}
`;document.head.appendChild(st)})();
function fxEsc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function fxLigne(t,v){return v?`<div class="fl"><b>${t}</b>${fxEsc(v)}</div>`:''}
function fxCote(d){return d?' <span class="muted" style="font-weight:400">(des 2 côtés)</span>':''}
// une partie (Bas du corps…) : refermable ; « avant » = html placé au-dessus (bouton Montrer/Cacher)
// une variante (nom, dessin, placement, exécution, sécurité, méthode)
function fxVar(cat,v){return`<div class="fx-var"><div class="fx-nom">${fxEsc(v[0])}${fxCote(v[1])}</div>${fxDessin(cat,v._c,v[0])}${fxLigne('Placement',v[2])}${fxLigne('Exécution',v[3])}${fxLigne('Sécurité',v[4])}${cat==='etir'?fxLigne('Méthode',v[5]):''}</div>`}
// une seule case (ex. « Squat »), déjà ouverte, sans repli : utilisée depuis la roue
function fxCase(cat,nomCase){
  const C=FICHES_CATS[cat];if(!C||!C.parties)return'';let c=null;
  for(const p of C.parties)for(const x of p.cases)if(x.c===nomCase){c=x;break}
  if(!c)return'';
  let h='';
  if(cat==='etir'){const ms=[...new Set(c.v.map(v=>/^Postural/.test(v[5]||'')?'Postural':v[5]).filter(Boolean))];h+=fxLigne('Méthodes possibles : ',ms.join(', '))}
  if(c.m)h+=fxLigne('Avec matériel',c.m);
  return`<div class="fx-case fiche" style="border-left-color:var(--or)">${h}${c.v.map(v=>fxVar(cat,Object.assign([...v],{_c:c.c}))).join('')}</div>`;
}
function fxPartie(cat,p,avant){
  return `<div class="card ${FICHES_COULEURS[p.k]||''}">${avant||''}<details class="fx-p"><summary class="fx-ps"><span class="fx-fl">▶</span><h2>${fxEsc(p.t)}</h2></summary>`+
    p.cases.map(c=>`<details class="fiche" style="border-left-color:var(--or)"><summary style="font-weight:800;font-size:17px;cursor:pointer">${fxEsc(c.c)} <span class="muted" style="font-weight:400">(${c.v.length} variante${c.v.length>1?'s':''})</span></summary>`+
      (c.m?`<div class="fl" style="margin-top:10px"><b>Avec matériel</b>${fxEsc(c.m)}</div>`:'')+
      c.v.map(v=>fxVar(cat,Object.assign([...v],{_c:c.c}))).join('')+
    `</details>`).join('')+`</details></div>`;
}
function fxMethodes(avant){
  return `<div class="card g">${avant||''}<details class="fx-p"><summary class="fx-ps"><span class="fx-fl">▶</span><h2>Les ${METHODES.length} méthodes</h2></summary>`+
    METHODES.map(m=>`<details class="fiche"><summary style="font-weight:800;font-size:17px;cursor:pointer">${fxEsc(m[0])}</summary>${fxLigne("Ce que c'est",m[1])}${fxLigne('Comment faire',m[2])}${fxLigne("Quand l'utiliser",m[3])}${fxLigne('Exemple',m[4])}</details>`).join('')+`</details></div>`;
}
// clés d'une catégorie
function fxCles(cat){return cat==='meth'?['meth']:FICHES_CATS[cat].parties.map(p=>cat+'.'+p.k)}
// Une seule case ouverte à la fois (cases, parties, méthodes) : en ouvrir une referme les autres
document.addEventListener('toggle',e=>{
  const d=e.target;if(!d||d.tagName!=='DETAILS'||!d.open)return;
  let freres=[];
  if(d.classList.contains('fx-p'))freres=[...document.querySelectorAll('details.fx-p')];
  else if(d.classList.contains('fiche')&&d.parentElement)freres=[...d.parentElement.querySelectorAll(':scope > details.fiche')];
  else return;
  let ferme=false;freres.forEach(x=>{if(x!==d&&x.open){x.open=false;ferme=true}});
  if(ferme){const s=d.querySelector('summary');if(s)setTimeout(()=>s.scrollIntoView({behavior:'smooth',block:'start'}),30)}
},true);
