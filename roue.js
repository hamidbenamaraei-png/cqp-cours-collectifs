// ===== 🎡 La roue : données et dessin (chargé par l'espace stagiaires et l'espace formateur) =====
// <ROUE_DONNEES> (fabriqué à partir des cours d'Hamid : renfo, stretch, step)
const ROUE_EXERCICES=[
 {"id":"x01","nom":"Squat","court":"Squat","cours":["caf"],"pl":"Les pieds largeur bassin, les pointes légèrement vers l'extérieur, mettre les fesses en arrière, serrer les omoplates et lever la poitrine afin de garder une bonne posture.","ex":"Fléchit les genoux, laisse partir les fesses en arrière, bien contracter les omoplates. Lever la poitrine afin de garder une belle posture, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux écartés et ne dépassent pas la pointe des pieds et les abdominaux sont bien contractés."},
 {"id":"x02","nom":"Fente","court":"Fente","cours":["caf"],"pl":"Les pieds largeur bassin, une jambe devant et l'autre derrière, le pied arrière est en demi-pointe, la cheville est verrouillée, les abdominaux sont contractés.","ex":"Fléchit le genou arrière, garde le dos bien droit, oreille parallèle avec l'épaule, la hanche et le genou arrière, inspire dans la descente et souffle dans la montée.","se":"Garde le dos droit, le genou avant ne dépasse pas la pointe de pied, les abdominaux sont contractés.","d":1},
 {"id":"x03","nom":"Squat large","court":"Squat large","cours":["caf"],"pl":"Les pieds largeur d'épaules, les pointes légèrement vers l'extérieur, mettre les fesses en arrière, serrer les omoplates et lever la poitrine afin de garder une belle posture.","ex":"Fléchit les genoux, laisse partir les fesses en arrière, bien contracter les omoplates. Lève la poitrine afin de garder une belle posture, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux écartés et ne dépassent pas la pointe des pieds et les abdominaux sont bien contractés."},
 {"id":"x04","nom":"Squat serré, un pied en pointe","court":"Squat serré pied pointe","cours":["caf"],"pl":"Les pieds largeur bassin, un pied en pointe, la poitrine levée, en position demi-squat.","ex":"Le genou d'appui reste fléchi, la poitrine légèrement sur l'avant, le dos est droit, les omoplates sont serrées, écarte et ramène la jambe en pied pointe, pense à respirer.","se":"Attention à garder le dos bien droit et les abdos gainés.","d":1},
 {"id":"x05","nom":"Relevé de jambe arrière","court":"Relevé jambe arrière","cours":["caf"],"pl":"Se positionner à 4 pattes, les mains au niveau des épaules, l'écartement des genoux est à la largeur du bassin, garde le dos droit.","ex":"Dérouler une jambe vers l'arrière, la monter à hauteur des fessiers, puis la ramener à sa position de départ, inspire dans la montée et souffle dans la descente.","se":"Garder le dos bien plat, les cervicales dans l'alignement de la colonne vertébrale, contracter la sangle abdominale et les fessiers.","d":1},
 {"id":"x06","nom":"Relevé de jambe arrière, jambe tendue","court":"Jambe arrière tendue","cours":["caf"],"pl":"Se positionner à 4 pattes, les mains au niveau des épaules, l'écartement des genoux est à la largeur du bassin, tendre une jambe vers l'arrière, gardez le dos droit.","ex":"Reste la jambe arrière tendue, contracte les fessiers, puis lève et baisse la jambe arrière, inspire dans la montée et souffle dans la descente.","se":"Garder le dos bien plat, les cervicales dans l'alignement de la colonne vertébrale, contracter la sangle abdominale et les fessiers.","d":1},
 {"id":"x07","nom":"Jambe arrière, genou plié (pulses)","court":"Pulses genou plié","cours":["caf"],"pl":"Se positionner à 4 pattes, les mains au niveau des épaules, l'écartement des genoux est à la largeur du bassin, tend une jambe vers le haut et plie le genou vers le plafond, garde le dos droit.","ex":"Faire des petits pulses vers le haut avec la jambe arrière, pense à respirer.","se":"Garder le dos bien plat, les cervicales dans l'alignement de la colonne vertébrale, contracter la sangle abdominale et les fessiers.","d":1},
 {"id":"x08","nom":"Élévation latérale","court":"Élévation latérale","cours":["caf"],"pl":"Se positionner sur le côté la jambe du dessous est pliée à 90 degrés, l'autre jambe est tendue pied pointe, le bras du dessous est posé au sol et sert de soutien à la tête, l'autre se pose devant pour soutenir.","ex":"Monter et descendre la jambe du dessus, penser à bien contracter les abdominaux, inspire dans la montée et souffle dans la descente.","se":"Garder bien la tête posée sur le bras, attention aux cervicales.","d":1},
 {"id":"x09","nom":"Élévation frontale","court":"Élévation frontale","cours":["caf"],"pl":"Se positionner sur le côté, la jambe en dessous est pliée à 90 degrés, l'autre jambe est tendue pied pointe, le bras du dessous est posé au sol et sert de soutien à la tête, l'autre se pose devant pour soutenir.","ex":"Avance la jambe du dessus puis ramène-la à la position de départ sans la poser au sol, pense à bien contracter les abdominaux, inspire et souffle.","se":"Garde bien la tête posée sur le bras, attention aux cervicales.","d":1},
 {"id":"x10","nom":"Relevé de bassin","court":"Relevé de bassin","cours":["caf"],"pl":"Allongé sur le dos, les bras le long du corps, les pieds largeur bassin, genoux fléchis de façon à pouvoir toucher le talon avec le bout des doigts.","ex":"Monte et descends le bassin, pense bien à contracter les fessiers, souffle dans la montée inspire dans la descente.","se":"La tête est posée au sol, les pieds largeur du bassin et les fessiers contractés."},
 {"id":"x11","nom":"Relevé de buste","court":"Relevé de buste","cours":["caf"],"pl":"Allongé sur le dos, les bras écartés, les mains derrière les cervicales, fléchit les genoux de façon à pouvoir toucher les talons avec les doigts, les pieds sont largeur du bassin.","ex":"Fait des relevés de poitrine, souffle dans la montée, inspire dans la descente.","se":"Garde bien les bras écartés, attention à ne pas tirer sur les cervicales."},
 {"id":"x12","nom":"Relevé de buste, jambes à 90°","court":"Buste jambes 90°","cours":["caf"],"pl":"Allongé sur le dos, les bras écartés, les mains derrière les cervicales, fléchit et monte les genoux à 90 degrés, tes pieds sont largeur du bassin.","ex":"Fais des relevés de poitrine, souffle dans la montée, inspire dans la descente.","se":"Garde bien les bras écartés, attention à ne pas tirer sur les cervicales."},
 {"id":"x13","nom":"Jambes à 90°, extension d'une jambe en alternance","court":"Jambes alternées","cours":["caf"],"pl":"Allongé sur le dos, les bras le long de la taille, les mains posées à plat sur le tapis, fléchit et monte les genoux à 90 degrés, tes pieds sont largeur bassin.","ex":"Tendre et fléchir une jambe en alternance, souffle et inspire.","se":"Garde bien ta tête posée au sol, tes abdominaux sont contractés."},
 {"id":"x14","nom":"Jambes à 90°, extension des deux jambes","court":"Deux jambes ensemble","cours":["caf"],"pl":"Allongé sur le dos, les bras le long de la taille, les mains posées à plat sur le tapis, fléchit et monte les genoux à 90 degrés, tes pieds sont largeur du bassin.","ex":"Tendre et fléchir les jambes en même temps, souffle et inspire.","se":"Garde bien ta tête posée au sol, tes abdominaux sont contractés."},
 {"id":"x15","nom":"Squat sur ballon","court":"Squat sur ballon","cours":["ballon"],"pl":"Les pieds largeur du ballon, les pointes légèrement vers l'extérieur, met les fesses en arrière, serre les omoplates et lève la poitrine afin de garder une belle posture, bloque le ballon avec les mollets.","ex":"Fléchir les genoux, laisse partir les fesses en arrière, contracte les omoplates, lève la poitrine afin de garder une belle posture, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux sont écartés et ne dépassent pas les pointes de pieds, les abdominaux sont bien contractés."},
 {"id":"x16","nom":"Squat avec ballon au sol","court":"Squat ballon au sol","cours":["ballon"],"pl":"Les pieds largeur du bassin, les mains touchent le ballon, garde le dos bien droit.","ex":"Fléchit les genoux, laisse partir les fesses en arrière, tend les bras afin de pousser le ballon, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux sont écartés et ne dépassent pas les pointes de pieds, les abdominaux sont bien contractés."},
 {"id":"x17","nom":"Squat avec le ballon","court":"Squat avec ballon","cours":["ballon"],"pl":"Les pieds largeur du bassin, les mains tiennent le ballon au niveau de la taille.","ex":"Fléchit les genoux, laisse partir les fesses en arrière et garde le ballon dans tes mains, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux sont écartés et ne dépassent pas les pointes de pieds, les abdominaux sont bien contractés."},
 {"id":"x18","nom":"Squat + ballon au-dessus de la tête","court":"Squat ballon en haut","cours":["ballon"],"pl":"Les pieds largeur du bassin, les mains tiennent le ballon au niveau de la taille.","ex":"Fléchit les genoux, laisse partir les fesses en arrière et garde le ballon dans tes mains, monte et descend le ballon en même temps que le squat, inspire dans la descente et souffle dans la montée.","se":"Garde le dos bien droit, les genoux sont écartés et ne dépassent pas les pointes de pieds les abdominaux sont bien contractés."},
 {"id":"x19","nom":"Fente avec ballon sur le côté","court":"Fente ballon côté","cours":["ballon"],"pl":"Les pieds largeur du bassin, une jambe devant et l'autre derrière, le pied arrière est en demi pointe, la cheville est verrouillée, une main est posée sur le ballon.","ex":"Fléchit le genou arrière, garde le dos bien droit, oreille parallèle à l'épaule et la hanche, le ballon sert de soutien, inspire dans la descente et souffle dans la montée.","se":"Garde le dos droit, le genou avant ne dépasse pas la pointe de pied, les abdominaux sont contractés.","d":1},
 {"id":"x20","nom":"Obliques en position fente","court":"Obliques en fente","cours":["ballon"],"pl":"Reste en contraction musculaire, le ballon face à toi et légèrement plus bas que les épaules.","ex":"Fais une torsion du buste avec le ballon du côté fermeture de hanche le bassin stable et revient à la position de départ pense à respirer.","se":"Garde le dos droit, le genou avant ne dépasse pas la pointe de pied, les abdominaux sont contractés.","d":1},
 {"id":"x21","nom":"Élévation latérale sur ballon","court":"Élévation lat. ballon","cours":["ballon"],"pl":"Appuyé sur le ballon de profil, la jambe qui est au sol est pliée à 90 degrés et la jambe du dessus est tendue.","ex":"Gaine les abdominaux, met une pression avec le bras sur le ballon afin de maintenir l'équilibre, monte et descends la jambe du dessus, inspire dans la montée et souffle dans la descente.","se":"Garde la tête bien parallèle à la colonne vertébrale, garde tes abdominaux contractés afin de garder un bon équilibre.","d":1},
 {"id":"x22","nom":"Flexion-extension jambe et bras","court":"Jambe et bras","cours":["ballon"],"pl":"Appuyée sur le ballon de profil, la jambe qui est au sol est pliée à 90 degrés et la jambe du dessus est tendue, le bras est levé au-dessus de la tête.","ex":"Gaine les abdominaux, met une pression sur le ballon avec le bras afin de garder un équilibre, fléchit la jambe et le bras du dessus en même temps, inspire et souffle.","se":"Garde la tête bien parallèle à la colonne vertébrale, garde bien les abdominaux contractés afin de garder un bon équilibre.","d":1},
 {"id":"x23","nom":"Relevé de bassin sur ballon","court":"Bassin sur ballon","cours":["ballon"],"pl":"Positionne le ballon au niveau des trapèzes, les mains sont au niveau des cervicales, les pieds légèrement plus large que le bassin, descends les fessiers.","ex":"Monte et descends le bassin tout en contractant les fessiers et les abdominaux, souffle dans la montée et inspire dans la descente.","se":"La tête reste bien parallèle à la colonne vertébrale, les bras bien écartés, ne tire pas sur tes cervicales."},
 {"id":"x24","nom":"Abdominaux sur le ballon","court":"Abdos sur ballon","cours":["ballon"],"pl":"Positionne le ballon au niveau des lombaires, les bras écartés, les mains au niveau de la nuque et les pieds sont légèrement plus larges que le bassin.","ex":"Met une pression sur les lombaires afin de pouvoir lever la poitrine, souffle dans la montée inspire dans la descente.","se":"Contracte les abdominaux afin de garder un bon équilibre, les bras sont écartés et ne tire pas sur les cervicales."},
 {"id":"x25","nom":"Gainage sur ballon","court":"Gainage","cours":["ballon"],"pl":"À genoux le dos droit les mains posées sur le ballon les jambes sont largeur du bassin.","ex":"Pose les avant-bras sur le ballon et tends les jambes afin de faire une planche, pense à respirer.","se":"Garde les abdominaux contractés, la tête est dans l'alignement de la colonne vertébrale."},
 {"id":"x26","nom":"Relevé de bassin, jambes sur le ballon","court":"Bassin jambes ballon","cours":["ballon"],"pl":"Allongé sur le dos les jambes, pliées sur le ballon, les fessiers, touchent le ballon, les pieds sont largeur du bassin et les mains sont le long de la taille.","ex":"Mets une pression sur les chevilles afin de relever le bassin, soutiens l'équilibre avec tes bras qui sont au sol, souffle dans la montée et inspire dans la descente.","se":"Contracte les fessiers et abdominaux afin de garder l'équilibre sur le ballon."},
 {"id":"x27","nom":"Rotation des jambes","court":"Rotation des jambes","cours":["ballon"],"pl":"Allongé sur le dos, les jambes, pliées sur le ballon, les fessiers, touchent le ballon, les pieds sont presque collés et les mains sont le long de la taille.","ex":"Les pieds sont posés sur le ballon, fais un balancier de gauche à droite avec tes jambes en gardant bien les abdominaux contractés, souffle et inspire.","se":"Les bras sont plaqués au sol, les abdominaux sont gainés, et la tête reste posée au sol."},
 {"id":"x28","nom":"Obliques, bras alternés, ballon sur les genoux","court":"Obliques bras alternés","cours":["ballon"],"pl":"Allongée au sol, les jambes largeur du bassin en position chaise renversée, le ballon est posé au niveau des tibias, la tête au sol, les mains derrière la nuque.","ex":"Fais des relevés de poitrine, bras alternés, touche le ballon d'une main et répète l'opération avec l'autre, souffle et inspire.","se":"Attention aux cervicales au moment du changement de bras."},
 {"id":"x29","nom":"Relevé de poitrine avec le ballon","court":"Relevé de poitrine","cours":["ballon"],"pl":"Allongé au sol les jambes largeur du bassin en position chaise renversée les bras tendus vers le plafond le ballon entre les mains la tête est posée au sol.","ex":"Faire des relevés de bassin, souffle et inspire.","se":"Garde bien la tête dans l'alignement des cervicales."},
 {"id":"x30","nom":"Abdos : flexion-extension bras et jambes","court":"Abdos bras-jambes","cours":["ballon"],"pl":"Allongé au sol les jambes pliées à 90 degrés, maintien le ballon les bras tendus derrière la tête.","ex":"Fais une extension et flexion avec les jambes, souffle et inspire.","se":"Garde bien ton dos et la tête plaquée au sol."},
 {"id":"x31","nom":"Squat (barre)","court":"Squat (barre)","cours":["full"],"pl":"Pieds largeur du bassin le dos bien droit, la barre posée sur les trapèzes.","ex":"Flexion et extension des genoux le dos droit les fesses en arrière, inspire dans la descente et souffle dans la montée.","se":"Gaine les abdominaux, garde le dos droit, bien tenir la barre."},
 {"id":"x32","nom":"Fente (barre)","court":"Fente (barre)","cours":["full"],"pl":"Pieds largeur du bassin un pied devant l'autre derrière en demi pointe verrouille la cheville.","ex":"Dos bien droit flexion et extension, inspire dans la descente souffle dans la montée.","se":"Gaine les abdominaux, garde le dos droit, bien tenir la barre.","d":1},
 {"id":"x33","nom":"Squat large (barre)","court":"Squat large (barre)","cours":["full"],"pl":"Pieds, largeur d'épaule, pointes vers l'extérieur, la barre posée sur les trapèzes.","ex":"Flexion et extension des genoux, le dos droit, les fesses en arrière, inspire dans la descente souffle dans la montée.","se":"Gaine les abdominaux, garde le dos droit, bien tenir la barre."},
 {"id":"x34","nom":"Développé épaules","court":"Développé épaules","cours":["full"],"pl":"Pieds, largeur du bassin, prise de mains en pronation largeur des épaules la barre au niveau des clavicules. dos bien droit.","ex":"Lève et baisse la barre, jusqu'à la position de départ, souffle dans la poussée inspire dans la descente.","se":"Bien gainer la sangle abdominale, dos bien droit, épaules relâchées."},
 {"id":"x35","nom":"Fente + développé épaules","court":"Fente + développé","cours":["full"],"pl":"Pieds largeur du bassin, prise de mains en pronation largeur des épaules, la barre aux clavicules. Un pied devant puis 1 pied derrière, le pied arrière est en demi-pointe, la cheville est verrouillée, le dos bien droit.","ex":"Flexion des jambes et extension des bras en simultané, inspire et souffle.","se":"Bien gainer les abdominaux, dos bien droit, cheville arrière verrouillée, le genou avant ne dépasse pas la pointe de pied.","d":1},
 {"id":"x36","nom":"Descente levée (soulevé de terre)","court":"Descente levée","cours":["full"],"pl":"Pieds largeur du bassin, prise de mains en pronation largeur des épaules, la poitrine relevée, les épaules relâchées et le dos droit.","ex":"Fléchir légèrement les genoux, les fesses partent en arrière, serre les omoplates, penche le buste en avant, amène la barre sous les rotules, souffle et inspire.","se":"Garder le dos bien droit, attention aux cervicales, rester bien dans l'alignement de la colonne vertébrale"},
 {"id":"x37","nom":"Tirage poitrine","court":"Tirage poitrine","cours":["full"],"pl":"Pieds largeur du bassin, les fesses en arrière, les genoux fléchis, les bras tendus, mains en pronation, barre mi-cuisse, contracte les omoplates","ex":"Garder la même posture, faire des va-et-vient pour amener la barre entre le nombril et la poitrine, les coudes collés au corps, inspire et souffle","se":"Dos bien droit, les cervicales en alignement avec la colonne vertébrale. Rester bien gainé"},
 {"id":"x38","nom":"Curl biceps","court":"Curl biceps","cours":["full"],"pl":"Pieds, largeur du bassin, poitrine levée, abdos gainés et les bras collés à la taille, prise de mains en supination, prise de barre légèrement plus large que bassin","ex":"Faire une flexion et une extension complète, inspire et souffle","se":"Dos bien droit, la poitrine levée, épaules relâchées, abdos bien gainés"},
 {"id":"x39","nom":"Curl biceps prise marteau","court":"Curl marteau","cours":["full"],"pl":"Pieds, largeur du bassin, poitrine levée, les abdos sont gainés et les bras collés à la taille, prise marteau.","ex":"Faire une flexion et une extension complète, inspire et souffle.","se":"Dos bien droit, la poitrine levée, épaules relâchées, abdos bien gainés."},
 {"id":"x40","nom":"Transverses (flexion latérale)","court":"Transverses","cours":["full"],"pl":"Pieds largeur du bassin, abdos gainés, dos bien droit, épaules relâchées, une main niveau de la taille, l'autre le long du corps.","ex":"Faire une flexion latérale du côté où le bras est tendu, inspire et souffle.","se":"Dos bien droit, abdos gainés, épaules relâchées.","d":1},
 {"id":"x41","nom":"Élévation latérale jambe et bras opposés","court":"Jambe + bras opposés","cours":["full"],"pl":"Un pied en demi-pointe, la main du côté de la demi pointe est sur la hanche, l'autre est avec le poids le long du corps.","ex":"Faire une abduction et adduction avec la jambe en pointe et le bras opposé qui tient le poids. inspire et souffle.","se":"Dos bien droit, jambe d'appui verrouillée, abdos contractés fixe un point pour l'équilibre.","d":1},
 {"id":"x42","nom":"Élévation des fessiers (avec poids)","court":"Élévation fessiers","cours":["full"],"pl":"Allongés sur le dos, les pieds largeur bassin, les bras sont posés le long de la taille, tu peux toucher tes talons avec les doigts, le poids est posé sur le bassin.","ex":"Contracte les fessiers et monte le bassin vers le haut et redescend, souffle dans la montée inspire dans la descente.","se":"Faire attention aux vertèbres et contracter les fessiers."},
 {"id":"x43","nom":"Crunch avec haltère","court":"Crunch haltère","cours":["full"],"pl":"Allongés sur le dos, les genoux pliés et relevés à 90 degrés, les pieds sont largeur du bassin, un poids est posé sur la poitrine, les mains sont en croix posées sur les poids afin de les tenir.","ex":"Faire des relevés de poitrine souffle dans la montée inspire dans la descente.","se":"Attention aux vertèbres et bien gainer les abdos."},
 {"id":"x44","nom":"Relevé de jambes","court":"Relevé de jambes","cours":["full"],"pl":"Jambes tendues, pieds vers le plafond, les bras le long du corps, paumes de mains au sol. Si tu le souhaites tu peux mettre les mains derrière les lombaires.","ex":"Faire des descentes levées les jambes tendues, inspire dans la descente et souffle dans la montée.","se":"Garde la tête et les épaules bien posées au sol, contracte les abdominaux"}
];
const ROUE_ETIREMENTS=[
 {"id":"s01","nom":"Étirement abdominaux (CAF 1)","court":"Abdominaux (CAF 1)","cours":["caf","full"],"co":"Allongé au sol étire-toi de la pointe des pieds jusqu'à la pointe de tes doigts."},
 {"id":"s02","nom":"Étirement fessiers (CAF 1)","court":"Fessiers (CAF 1)","cours":["caf","full","stapis"],"d":1,"co":"Ramène un genou à la poitrine, les mains se positionnent au niveau du tibia, l'autre jambe reste tendue."},
 {"id":"s03","nom":"Étirement ischios (CAF 1)","court":"Ischios (CAF 1)","cours":["caf","full"],"d":1,"co":"Une jambe au plafond, l'autre jambe est fléchie, pied à plat au sol, les mains sont posées soit au niveau de la cuisse, du mollet ou de la cheville en fonction de ta souplesse."},
 {"id":"s04","nom":"Étirement fessiers (CAF 2)","court":"Fessiers (CAF 2)","cours":["caf","full"],"d":1,"co":"Genou plié, la cheville est posée sur la cuisse de l'autre jambe, passe un bras entre les jambes, attrape soit la cuisse, soit le tibia et ramène vers la poitrine."},
 {"id":"s05","nom":"Étirement des obliques","court":"Obliques","cours":["caf","full"],"d":1,"co":"Le dos à plat au sol, les bras écartés, les genoux pliés à 90 degrés, posés sur un côté et le regard posé de l'autre côté."},
 {"id":"s06","nom":"Étirement des ischios (CAF 2)","court":"Ischios (CAF 2)","cours":["caf"],"co":"Assis pieds joints, penche en avant et attrape soit tes pointes de pied ou touche tes tibias en fonction de ta souplesse."},
 {"id":"s07","nom":"Étirement quadriceps (CAF)","court":"Quadriceps (CAF)","cours":["caf"],"d":1,"co":"Fléchis une jambe, attrape ton pied, tend le bras opposé fixe un point du regard afin de maintenir ton équilibre."},
 {"id":"s08","nom":"Étirement psoas (CAF)","court":"Psoas (CAF)","cours":["caf","full"],"d":1,"co":"Plie la jambe de devant et tends celle de derrière, laisse descendre le bassin vers le sol et garde ton dos droit."},
 {"id":"s09","nom":"Étirement abdominaux (CAF 2)","court":"Abdominaux (CAF 2)","cours":["caf"],"co":"Prends une grande inspiration et monte pied pointe allonge les bras vers le plafond, souffle et relâche dans le but de revenir à ta position initiale."},
 {"id":"s10","nom":"Étirement du dos (ballon)","court":"Dos (ballon)","cours":["ballon"],"co":"Derrière le ballon, les mains posées sur le ballon, passe en position de l'enfant, les fessiers posés sur les talons."},
 {"id":"s11","nom":"Étirement fessiers (ballon)","court":"Fessiers (ballon)","cours":["ballon"],"d":1,"co":"Derrière le ballon, jambe avant pliée et jambe arrière tendue, accompagne le ballon devant."},
 {"id":"s12","nom":"Étirement des épaules et du dos (ballon)","court":"Épaules et dos (ballon)","cours":["ballon"],"d":1,"co":"Derrière le ballon accompagne le ballon avec le dos de la main, glisse un bras sur le ballon jusqu'à l'épaule, puis tend l'autre bras vers le plafond et accompagne celui-ci du regard."},
 {"id":"s13","nom":"Étirement des quadriceps (ballon)","court":"Quadriceps (ballon)","cours":["ballon"],"d":1,"co":"Le ballon au niveau des hanches maintenu d'un bras, attrape le pied opposé et ramène le talon au niveau des fessiers, sers-toi du ballon pour maintenir ton équilibre."},
 {"id":"s14","nom":"Étirement du psoas (ballon)","court":"Psoas (ballon)","cours":["ballon"],"d":1,"co":"Une fesse sur le ballon, une jambe devant et une derrière en demi pointe, un bras en soutien sur le ballon, faire une flexion, extension de hanche vers le ballon, 1 bras en arc de cercle."},
 {"id":"s15","nom":"Étirement des ischios (ballon)","court":"Ischios (ballon)","cours":["ballon"],"d":1,"co":"Assis sur le ballon, tends une jambe, fléchit l'autre, penche-toi légèrement en avant en gardant le dos bien droit."},
 {"id":"s16","nom":"Étirement biceps, épaules et triceps (ballon)","court":"Biceps, épaules, triceps (ballon)","cours":["ballon"],"d":1,"co":"Assis sur le ballon, tends un bras, paume de main vers le plafond, main niveau de la taille, ramène les bouts de doigt vers toi. Plaque ce même bras au niveau de la poitrine, le bras reste tendu. Puis passe l'autre main au niveau du coude, met une légère pression afin d'étirer les épaules, pour enfin accompagner le bras qui est tendu derrière la nuque pour pouvoir poser la main entre les omoplates."},
 {"id":"s17","nom":"Auto grandissement (ballon)","court":"Auto grandissement (ballon)","cours":["ballon"],"co":"Assis sur le ballon, prend une grande inspiration, monte les bras au plafond et étire-toi, souffle et relâche afin de revenir à ta position initiale."},
 {"id":"s18","nom":"Étirement du quadriceps (full body)","court":"Quadriceps (full body)","cours":["full"],"d":1,"co":"Fléchit une jambe, attrape un pied, tends le bras opposé fixe également un point du regard afin de maintenir l'équilibre."},
 {"id":"s19","nom":"Étirement des épaules (full body)","court":"Épaules (full body)","cours":["full"],"d":1,"co":"Tend un bras, celui-ci reste tendu et vient se plaquer au niveau de la poitrine."},
 {"id":"s20","nom":"Étirement du triceps","court":"Triceps","cours":["full"],"d":1,"co":"Une main passe derrière entre les omoplates, l'autre main pousse légèrement le coude vers l'arrière."},
 {"id":"s21","nom":"Étirement du dos (full body)","court":"Dos (full body)","cours":["full","step"],"co":"Paume de main vers l'extérieur, pousse les mains en avant, arrondit le dos, rentre le ventre, la tête passe entre tes bras."},
 {"id":"s22","nom":"Auto grandissement (full body)","court":"Auto grandissement (full body)","cours":["full","step"],"co":"Prends une grande inspiration, monte pieds pointe et allonge les bras vers le plafond, souffle et relâche dans le but de revenir à ta position initiale."},
 {"id":"s23","nom":"Étirement des épaules et du dos (stretch ballon)","court":"Épaules et dos (stretch ballon)","cours":["sballon"],"d":1,"ex":"Se positionner derrière le ballon les pieds largeur d'épaules. Prendre une grande inspiration, souffler en accompagnant le ballon avec le dos de la main, glisser un bras sur le ballon jusqu'à l'épaule, puis tendre son autre bras vers le plafond et accompagner celui-ci du regard. Répétez plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s24","nom":"Étirement des obliques et du dos (stretch ballon)","court":"Obliques et dos (stretch ballon)","cours":["sballon"],"d":1,"ex":"Le ballon entre les mains, se positionner les pieds, largeur d'épaules, le ballon au-dessus de la tête, prendre une grande inspiration puis faire une inclinaison d'un côté sur l'expiration. Répétez plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s25","nom":"Torsion du dos","court":"Torsion du dos","cours":["sballon"],"d":1,"ex":"Le ballon entre les mains, les pieds largeur bassin le ballon au niveau des épaules, prendre une grande inspiration puis sur l'expiration faire une rotation d'un côté. Répétez plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s26","nom":"Étirement du dos et ischios","court":"Dos et ischios","cours":["sballon"],"ex":"Derrière le ballon, les pieds sont largeur bassin, jambes tendues, bras tendus, le dos droit, les paumes de main sur le ballon, prend une grande inspiration pousse le ballon vers l'avant tout en expirant en gardant les jambes tendues et le dos droit. Répétez plusieurs fois l'opération.","me":"Actif statique"},
 {"id":"s27","nom":"Étirement psoas, quadriceps et fessier","court":"Psoas, quadri, fessier","cours":["sballon"],"d":1,"ex":"Derrière le ballon, pieds largeur du bassin, jambe avant pliée, genou au-dessus de la cheville, jambe arrière tendue, le pied en demi pointe prend une grande inspiration pousse le ballon vers l'avant tout en expirant écrase le bassin vers le sol, maintenir la posture bien droite puis aller sur le côté d'ouverture de hanches.","me":"Actif statique"},
 {"id":"s28","nom":"Étirement mollet et ischios","court":"Mollet et ischios","cours":["sballon"],"d":1,"ex":"Derrière le ballon, jambe arrière fléchie, la jambe avant est tendue le talon au sol, pied largeur bassin, paume de main sur le ballon, le dos bien droit, prendre une grande inspiration et pousser le ballon sur l'expiration.","me":"Actif statique"},
 {"id":"s29","nom":"Étirement du dos (stretch ballon 1)","court":"Dos (stretch ballon 1)","cours":["sballon"],"ex":"Assis sur le ballon, pieds largeur bassin, pencher en avant et bloquer quelques secondes en position dos plat, jambes tendues, bras tendus, prendre une grande inspiration, maintenir la posture quelques secondes, souffler et relâcher en dos rond.","me":"Postural"},
 {"id":"s30","nom":"Mobilité du bassin (stretch ballon)","court":"Mobilité du bassin (stretch ballon)","cours":["sballon"],"ex":"Assis sur le ballon, faire une rétroversion et antéversion du bassin sur le rythme de la respiration. Répéter plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s31","nom":"Inclinaison du buste et de la colonne","court":"Inclinaison du buste","cours":["sballon"],"d":1,"ex":"Assis sur le ballon, pied largeur bassin, une paume de main posée sur le ballon, l'autre s'étend en arc de cercle au-dessus de la tête. Faire l'exercice sur le rythme de la respiration. Répéter plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s32","nom":"Biceps, épaules et triceps (stretch ballon)","court":"Biceps, épaules, triceps (stretch ballon)","cours":["sballon"],"d":1,"ex":"Biceps : tend le bras devant paume de main vers le plafond, inspire et sur l'expiration, met une pression sur tes bouts de doigt avec l'autre main. Épaules : tend le bras, ramène-le à la poitrine, relâche les épaules, inspire, maintient une pression du bras avec l'autre main contre la poitrine et souffle. Triceps : une main posée entre les omoplates, l'autre main met une pression sur le coude. inspire et souffle.","me":"Actif dynamique lent"},
 {"id":"s33","nom":"Étirement des abdominaux, des épaules et de la poitrine","court":"Abdos, épaules, poitrine","cours":["sballon"],"ex":"Assis sur le ballon, prendre une grande inspiration en se laissant glisser sur le dos, souffler tout en relâchant la tête et les bras.","me":"Passif lourd"},
 {"id":"s34","nom":"Étirement du dos (stretch ballon 2)","court":"Dos (stretch ballon 2)","cours":["sballon"],"ex":"Passer derrière le ballon s'allonger à plat ventre, prendre une grande inspiration, contracter les lombaires monter en alignement avec les jambes, tendre les bras, rester quelques secondes souffler tout en relâchant le haut du corps sur le ballon","me":"Postural"},
 {"id":"s35","nom":"Étirement des fessiers (stretch ballon)","court":"Fessiers (stretch ballon)","cours":["sballon"],"d":1,"ex":"À genoux derrière le ballon, jambe avant pliée, mollet au sol, la jambe arrière est légèrement fléchie avec pointe de pied au sol. Départ bien droit, prendre une grande inspiration puis souffler en accompagnant le ballon devant puis sur le côté de l'ouverture de hanches.","me":"Passif lourd"},
 {"id":"s36","nom":"Étirement du dos (stretch ballon 3)","court":"Dos (stretch ballon 3)","cours":["sballon"],"ex":"Jambes tendues, tenir le ballon entre les mains, bras tendus faire des rotations de droite à gauche en gardant le dos bien droit répéter cet exercice sur le rythme de la respiration.","me":"Actif dynamique lent"},
 {"id":"s37","nom":"Étirement des adducteurs (stretch ballon)","court":"Adducteurs (stretch ballon)","cours":["sballon"],"ex":"Assis les jambes écartées, le ballon est posé entre les jambes, mains au-dessus du ballon, prendre une grande inspiration et sur l'inspiration pousser le ballon d'un côté puis de l'autre.","me":"Passif lourd"},
 {"id":"s38","nom":"Étirement des ischios et mobilité du dos","court":"Ischios + dos","cours":["sballon"],"ex":"Assis les jambes tendues, le ballon entre les mains, bras tendus, prendre une grande inspiration et sur l'inspiration pousser le ballon en avant en dos rond, ramener vers soi en dos creux","me":"Actif dynamique lent"},
 {"id":"s39","nom":"Étirement des cervicales (stretch tapis 1)","court":"Cervicales (stretch tapis 1)","cours":["stapis"],"d":1,"ex":"Poser le poignet sur la tête, recouvrir l'oreille avec le bout des doigts, laisser pencher la tête sur le côté en se laissant tirer par le poids du bras, inspirer et souffler.","me":"Actif dynamique lent"},
 {"id":"s40","nom":"Étirement des cervicales (stretch tapis 2)","court":"Cervicales (stretch tapis 2)","cours":["stapis"],"d":1,"ex":"Tourner la tête sur le côté, poser le poignet sur la tête, laisser les doigts se poser derrière la tête, au niveau de la nuque. Se laissant tirer par le poids du bras, inspirer et souffler.","me":"Actif dynamique lent"},
 {"id":"s41","nom":"Mobilité des épaules (stretch tapis)","court":"Mobilité des épaules (stretch tapis)","cours":["stapis"],"ex":"Écarter les bras, hauteur d'épaules, faire des rotations avec les mains, paume de mains vers le haut puis vers le bas, rester bras tendus. Penser à respirer.","me":"Actif dynamique lent"},
 {"id":"s42","nom":"Étirement des obliques et transverses","court":"Obliques et transverses","cours":["stapis"],"d":1,"ex":"Une jambe pliée, l'autre jambe est tendue, poser son bras sur la jambe pliée, prendre une grande inspiration, sur l'expiration s'incliner sur le côté et tendre le bras en arc de cercle.","me":"Actif statique"},
 {"id":"s43","nom":"Étirement des ischios (stretch tapis 1)","court":"Ischios (stretch tapis 1)","cours":["stapis"],"d":1,"ex":"Les pieds légèrement plus larges que les épaules, les jambes tendues, prendre une grande inspiration puis expirer en s'inclinant vers l'avant pour aller toucher la pointe de pieds. Remonter puis répéter l'opération de l'autre côté.","me":"Actif statique"},
 {"id":"s44","nom":"Mobilité du bassin (stretch tapis)","court":"Mobilité du bassin (stretch tapis)","cours":["stapis"],"ex":"Faire une rétroversion et antéversion du bassin sur le rythme de la respiration. Répéter plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s45","nom":"Étirement de la poitrine et du dos","court":"Poitrine et dos","cours":["stapis"],"ex":"Debout pied, largeur bassin, bras écartés sur le côté, pouces vers le haut, ramener les mains vers l'avant, pouces vers le bas, rentrer le ventre et arrondir le dos","me":"Actif dynamique lent"},
 {"id":"s46","nom":"Étirement des ischios et mobilité des épaules","court":"Ischios + épaules","cours":["stapis"],"ex":"Debout les pieds, largeur du bassin, crocheter les mains derrière le dos, les jambes légèrement fléchies, prendre une grande inspiration, puis expirer en se penchant en avant, tout en tirant les mains vers le plafond.","me":"Actif statique"},
 {"id":"s47","nom":"Étirement du dos, des ischios et des mollets","court":"Chien tête en bas","cours":["stapis"],"ex":"Passe en position du chien tête en bas, place les pieds en largeur du bassin, les mains au sol en largeur d'épaules, les fesses en arrière, le dos creux, la tête est entre les bras. Sur le rythme de la respiration, fait des flexions extension de mollets en alternant les montées et descentes de talons.","me":"Actif statique et dynamique lent"},
 {"id":"s48","nom":"Étirement des épaules et poitrine","court":"Épaules et poitrine","cours":["stapis"],"d":1,"ex":"En position quadrupédie, prendre une grande inspiration et sur l'expiration tendre un bras au plafond et le suivre du regard.","me":"Actif dynamique lent"},
 {"id":"s49","nom":"Étirement du dos et des épaules (stretch tapis)","court":"Dos et épaules (stretch tapis)","cours":["stapis"],"d":1,"ex":"En position quadrupédie, prendre une grande inspiration puis sur l'expiration, glisse un bras sous la poitrine afin de poser une épaule au sol, accompagne ce même bras du regard. La tête passe au sol, l'autre bras se tend, parallèle à la tête.","me":"Passif lourd"},
 {"id":"s50","nom":"Étirement des fessiers (stretch tapis 1)","court":"Fessiers (stretch tapis 1)","cours":["stapis"],"d":1,"ex":"À genoux, jambe avant pliée, mollet au sol, la jambe arrière est légèrement fléchie avec la pointe de pied au sol. Départ bien droit, prendre une grande inspiration puis souffler en poussant les bras en avant.","me":"Passif lourd"},
 {"id":"s51","nom":"Étirement des abdominaux (stretch tapis)","court":"Abdominaux (stretch tapis)","cours":["stapis"],"ex":"Allongé face au sol, les coudes sont au niveau des épaules et collés au corps. Prendre une grande inspiration, mettre une pression sur les mains afin de tendre les bras, de courber le dos pour enfin expirer en position du sphinx.","me":"Actif statique"},
 {"id":"s52","nom":"Étirement dos (stretch tapis)","court":"Dos (stretch tapis)","cours":["stapis"],"ex":"Position de l'enfant, se mettre sur les genoux, bras tendus en avant, les fesses posées sur les talons, respirer calmement.","me":"Passif lourd"},
 {"id":"s53","nom":"Étirement des adducteurs (stretch tapis)","court":"Adducteurs (stretch tapis)","cours":["stapis"],"d":1,"ex":"Assis les jambes écartées, prendre une grande inspiration et sur l'inspiration pousser les mains d'un côté devant puis de l'autre.","me":"Actif statique"},
 {"id":"s54","nom":"Étirement des ischios (stretch tapis 2)","court":"Ischios (stretch tapis 2)","cours":["stapis"],"ex":"Assis les jambes tendues, prendre une grande inspiration et sur l'expiration tendre les bras afin d'attraper les tibias, les chevilles ou les pointes de pieds avec les mains.","me":"Actif statique"},
 {"id":"s55","nom":"Mobilité des épaules, étirement du dos et des ischios","court":"Épaules, dos, ischios (charrue)","cours":["stapis"],"ex":"Allongé au sol les pieds pliés à 90 degrés, les bras sont le long du corps, prendre une grande inspiration, et sur l'expiration pousser sur les mains afin de monter les fesses au plafond pour passer la tête entre les jambes et si possible poser les pointes de pied au sol.","me":"Actif statique"},
 {"id":"s56","nom":"Auto grandissement au sol","court":"Auto grandissement au sol","cours":["stapis"],"ex":"Allongé dos au sol, prendre une grande inspiration et sur l'expiration tendre les jambes et les bras.","me":"Actif statique"},
 {"id":"s57","nom":"Étirement des ischios (stretch tapis 3)","court":"Ischios (stretch tapis 3)","cours":["stapis"],"d":1,"ex":"Allongé sur le dos, une jambe est tendue au plafond, l'autre reste tendue au sol, attrape avec les mains la cuisse, le mollet ou la cheville de la jambe qui est au plafond. Respire calmement.","me":"Actif statique"},
 {"id":"s58","nom":"Étirement des fessiers (stretch tapis 2)","court":"Fessiers (stretch tapis 2)","cours":["stapis"],"d":1,"ex":"Allongé sur le dos, un genou est plié, l'autre est également plié avec la cheville posée sur le tibia de l'autre genou, passer un bras entre les jambes et l'autre sur le côté et ramener à la poitrine, respire calmement.","me":"Actif statique"},
 {"id":"s59","nom":"Étirement des obliques et dos (stretch tapis)","court":"Obliques et dos (stretch tapis)","cours":["stapis"],"d":1,"ex":"Allongé au sol, jambes à 90° sur le côté, les bras écartés et le regard à l'opposé des jambes.","me":"Passif lourd"},
 {"id":"s60","nom":"Rotation des cervicales","court":"Rotation des cervicales","cours":["schaise"],"ex":"Assis sur la chaise, sur le rythme de la respiration faire des rotations de gauche à droite avec la tête, répéter plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s61","nom":"Étirement des cervicales (chaise)","court":"Cervicales (chaise)","cours":["schaise"],"ex":"Assis sur la chaise, sur le rythme de la respiration, monter et descendre la tête, attention aux cervicales, répéter plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s62","nom":"Mobilité des épaules (chaise)","court":"Mobilité des épaules (chaise)","cours":["schaise"],"ex":"Les pieds à la largeur du bassin, levez les bras pliés, les coudes au niveau de la poitrine, en gardant les mains ouvertes. Sans déplier les bras et sur le rythme de la respiration, faites des rotations des épaules en bas et ensuite en haut. Répétez plusieurs fois l'opération.","me":"Actif dynamique lent"},
 {"id":"s63","nom":"Ouverture de la poitrine","court":"Ouverture de la poitrine","cours":["schaise"],"ex":"Assis sur la chaise, mettez les bras derrière le dossier et entrelacez vos doigts. Fixez cette position, prenez une grande inspiration, courber le dos puis tirez votre poitrine vers le haut, maintenir la posture quelques secondes. puis souffler sur le relâchement.","me":"Actif dynamique lent"},
 {"id":"s64","nom":"Inclinaisons de la tête","court":"Inclinaisons de la tête","cours":["schaise"],"d":1,"ex":"Asseyez-vous sur le bord de la chaise, placez vos mains derrière le dos, les doigts entrelacés. Mettez vos mains sur votre hanche droite, prendre une grande inspiration puis souffler en inclinant la tête à droite. Restez dans cette position pendant quelques secondes.","me":"Actif statique"},
 {"id":"s65","nom":"Dos rond et dos creux","court":"Dos rond et dos creux","cours":["schaise"],"ex":"Assis au bout de la chaise, tirez votre colonne vertébrale vers le haut, mettez les mains bras tendus sur les hanches. Prendre une grande inspiration, arrondir le dos, baissez le menton vers la poitrine tout en expirant.","me":"Actif dynamique lent"},
 {"id":"s66","nom":"Torsions de bassin (chaise 1)","court":"Torsions de bassin (chaise 1)","cours":["schaise"],"ex":"Posez vos mains sur les côtés de la chaise et levez votre corps vers le haut en expirant. Tout en restant dans cette position, tortillez votre bassin vers la droite et la gauche et en avant puis en arrière. Retournez doucement dans la position initiale.","me":"Actif dynamique lent"},
 {"id":"s67","nom":"Inclinaisons du haut du corps","court":"Inclinaison haut du corps","cours":["schaise"],"d":1,"ex":"Se positionner le dos droit, mettre votre main droite sur le côté gauche de l'assise, levez la main gauche au-dessus de la tête, prendre une grande inspiration puis souffler en s'inclinant en arc de cercle.","me":"Actif statique"},
 {"id":"s68","nom":"Torsion du bassin (chaise 2)","court":"Torsion du bassin (chaise 2)","cours":["schaise"],"ex":"Assis au bout de la chaise, les pieds largeur du bassin, une main est posée sur la cuisse opposée, l'autre main se positionne derrière le dossier, prendre une grande inspiration puis sur l'expiration faire une torsion du buste en gardant bien le bassin fixe et le dos bien droit.","me":"Actif statique"},
 {"id":"s69","nom":"Étirement des fessiers (chaise)","court":"Fessiers (chaise)","cours":["schaise"],"d":1,"ex":"Une cheville posée sur la cuisse opposée, prendre une grande inspiration mettre une résistance avec les mains sous le genou qui est en appui durant 10 secondes, relâcher 2 secondes puis souffler en levant le genou et en le ramenant à la poitrine à l'aide des bras étirer 10 secondes.","me":"Méthode du creux"},
 {"id":"s70","nom":"Torsion du bassin avec étirement des fessiers","court":"Torsion bassin + fessiers","cours":["schaise"],"d":1,"ex":"Assis sur la chaise, une cheville sur la cuisse, une main appuie sur le genou, l'autre bras est derrière dossier afin de faire une torsion du buste. Pense à respirer.","me":"Actif statique"},
 {"id":"s71","nom":"Inclinaisons en avant étirement des fessiers","court":"Penché avant + fessiers","cours":["schaise"],"ex":"Un pied au sol, une cheville sur la cuisse. Sans bouger votre bassin, tendre la colonne vertébrale, prendre une grande inspiration puis sur l'expiration, tendez la poitrine vers vos genoux et relâcher le haut du corps, le cou doit être détendu.","me":"Passif lourd"},
 {"id":"s72","nom":"Étirement des ischios (chaise 1)","court":"Ischios (chaise 1)","cours":["schaise"],"d":1,"ex":"Assis en bout de chaise, les mains sont posées sur les hanches, tends une jambe, le talon se pose au sol, fléchis l'autre jambe, penche légèrement le buste en avant en gardant le dos bien droit. Pense bien à respirer.","me":"Actif statique"},
 {"id":"s73","nom":"Étirement des ischios (chaise 2)","court":"Ischios (chaise 2)","cours":["schaise"],"d":1,"ex":"Assis en bout de chaise, tends une jambe, le talon se pose au sol, fléchis l'autre jambe, penche légèrement le buste en avant en gardant le dos bien droit. Prend une grande inspiration puis souffle tout en relâchant le haut du corps.","me":"Actif statique"},
 {"id":"s74","nom":"Étirement du psoas, du dos et des obliques","court":"Psoas, dos, obliques","cours":["schaise"],"d":1,"ex":"Asseyez-vous au bord de la chaise, le dos perpendiculaire au dossier de la chaise, installez-vous confortablement, en vous appuyant sur une fesse, ensuite faites une fente en avant. Tout en inspirant, tirez votre poitrine en avant et faites une flexion de dos en arrière, penchez la tête en arrière et gardez cette position pendant quelques secondes. Relâcher puis souffler. Retournez dans la position initiale, adossez-vous sur le dos de la chaise, prenez une grande inspiration tout en étirant le côté de votre dos en tendant le bras en arc de cercle.","me":"Actif statique"},
 {"id":"s75","nom":"Étirement du psoas et du quadriceps","court":"Psoas et quadriceps","cours":["schaise"],"d":1,"ex":"Asseyez-vous au bord de la chaise, le dos perpendiculaire au dossier, ensuite faites une fente en avant. Installez-vous confortablement en vous appuyant sur une fesse, plier la jambe qui est derrière afin de pouvoir attraper la cheville avec la main, prenez une grande inspiration tout en tirant le côté de votre dos.","me":"Passif lourd"},
 {"id":"s76","nom":"Torsion du buste et étirement des fessiers","court":"Torsion buste + fessiers","cours":["schaise"],"d":1,"ex":"Se positionner face à la chaise, poser un pied sur l'assise, rester bien droit, poser la main opposée sur la cuisse qui est sur la chaise, l'autre main est sur les hanches puis prendre une grande inspiration puis souffler en faisant une torsion du buste côté fermeture de hanche.","me":"Actif statique"},
 {"id":"s77","nom":"Étirement des ischios (chaise 3)","court":"Ischios (chaise 3)","cours":["schaise"],"d":1,"ex":"Se positionner face à la chaise, poser un talon sur l'assise, rester bien droit, fléchir la jambe d'appui, faire une légère antéversion du bassin puis pencher le buste légèrement en avant, garder le dos droit.","me":"Actif statique"},
 {"id":"s78","nom":"Posture du chien sur une chaise","court":"Chien sur la chaise","cours":["schaise"],"ex":"Se positionner face à la chaise, inclinez-vous en avant, posez vos mains sur la chaise, sans plier les bras ni les jambes, poussez votre bassin en arrière jusqu'à ce que vous sentiez l'épaule et la poitrine s'étirer. Puis appuyez-vous sur vos mains, inspirez et dans l'expiration, levez la tête, le corps, tordez le dos et tirez vos épaules en arrière.","me":"Actif statique"},
 {"id":"s79","nom":"Étirement des épaules (chaise)","court":"Épaules (chaise)","cours":["schaise"],"ex":"Se placer dos à l'assise de la chaise, positionner les mains à plat, les jambes sont fléchies, les fesses sont dans le vide, les bras sont tendus, sur inspiration le bassin va vers le plafond, la tête se relâche doucement vers l'arrière, la poitrine s'ouvre et les omoplates contractent.","me":"Actif statique"},
 {"id":"s80","nom":"Étirement des ischios (chaise 4)","court":"Ischios (chaise 4)","cours":["schaise"],"ex":"Assis en bout de chaise, les jambes tendues, penche le buste légèrement en avant, tends les bras vers le plafond, prend une grande inspiration, tiens la posture quelques secondes, puis sur l'expiration, relâche en posant les mains au niveau des tibias ou des pieds afin d'étirer les ischios.","me":"Postural"},
 {"id":"s81","nom":"Étirement des adducteurs (chaise)","court":"Adducteurs (chaise)","cours":["schaise"],"ex":"Assis sur la chaise, les jambes écartées, rejoins les talons, grandis-toi, prend une grande inspiration puis sur l'expiration relâche tout le haut du corps vers le bas.","me":"Passif lourd"},
 {"id":"s82","nom":"Relâchement du dos","court":"Relâchement du dos","cours":["schaise"],"ex":"Assis en bout de chaise, les pieds légèrement écartés, prend une grande inspiration puis sur l'expiration relâche totalement le haut du corps.","me":"Passif lourd"},
 {"id":"s83","nom":"Étirement des épaules et des triceps","court":"Épaules et triceps","cours":["schaise"],"d":1,"ex":"Assis sur la chaise, tends le bras, paume de main vers le plafond, le bras descend au niveau de la taille, ramène les bouts de doigt vers la poitrine puis relâche les bouts de doigt. Plaque ce même bras au niveau de la poitrine, le bras reste tendu. Puis passe l'autre main au niveau du coude, afin de mettre une légère pression pour étirer les épaules. Relâche pour enfin accompagner le bras qui est tendu derrière la nuque, celui-ci se (plie) pour pouvoir poser la main entre les omoplates, tire légèrement vers l'arrière afin d'étirer le triceps. Penser à bien respirer","me":"Actif statique"},
 {"id":"s84","nom":"Auto grandissement (chaise)","court":"Auto grandissement (chaise)","cours":["schaise"],"ex":"Assis sur la chaise, prend une grande inspiration, monte les bras au plafond et étire-toi, souffle et relâche afin de revenir à ta position initiale.","me":"Actif dynamique lent"},
 {"id":"s85","nom":"Étirement mollet","court":"Mollet","cours":["step"],"d":1,"co":"Un pied à plat sur le step, l'autre pied a le talon dans le vide, la jambe arrière reste tendue, la jambe de devant est légèrement fléchie pour maintenir un équilibre."},
 {"id":"s86","nom":"Étirement ischios (step)","court":"Ischios (step)","cours":["step"],"d":1,"co":"Les pieds largeur du bassin, plante un talon sur le step, antéversion du bassin, le pied au sol est fléchi, garde bien le dos droit."},
 {"id":"s87","nom":"Étirement psoas (step)","court":"Psoas (step)","cours":["step"],"d":1,"co":"Jambes fléchies, pieds à plat sur le step, l'autre jambe est tendue à l'arrière, pied en demi-pointe, pieds largeur bassin, rétroversion du bassin, redresse-toi et garde le dos bien droit."},
 {"id":"s88","nom":"Étirement quadriceps (step)","court":"Quadriceps (step)","cours":["step"],"d":1,"co":"Passe derrière ton step afin de l'avoir à vue, fléchis une jambe, attrape ton pied, tends le bras opposé, fixe un point du regard afin de maintenir ton équilibre."}
];
// </ROUE_DONNEES>

// ===== Les roues : types, listes de départ, phrases =====
const ROUE_COURS={caf:'CAF',ballon:'Gym ballon',full:'Full body',sballon:'Stretch ballon',stapis:'Stretch tapis',schaise:'Stretch chaise',step:'Step'};
const ROUE_TYPES=[
 {type:'exercices',emoji:'🏋️',titre:'Exercices',cours:['caf','ballon','full']},
 {type:'etirements',emoji:'🧘',titre:'Étirements',cours:['caf','ballon','full','step','sballon','stapis','schaise']},
 {type:'partie',emoji:'🧩',titre:'Partie du cours',modifiable:true},
 {type:'style',emoji:'🎵',titre:'Style de cours',modifiable:true},
 {type:'materiel',emoji:'🧰',titre:'Matériel',modifiable:true},
 {type:'perso',emoji:'✏️',titre:'Ma roue'}
];
const ROUE_LISTES_DEFAUT={
 partie:['Échauffement','Corps de séance','Retour au calme','Étirements'],
 style:['Renfo sur musique','Tabata','CAF','Gym ballon','Full body','Step','Stretch','Circuit training'],
 materiel:['Step','Ballon','Haltères','Barre','Élastique','Tapis seul','Chaise','Kettlebell']
};
// Morceaux de phrase pour « Ta mission »
const ROUE_PHRASES={
 partie:{'echauffement':"l'échauffement",'corps de seance':'le corps de séance','retour au calme':'le retour au calme','etirements':'les étirements'},
 style:{'renfo sur musique':"d'un cours de renfo sur musique",'tabata':"d'une séance de Tabata",'caf':"d'un cours de CAF",'gym ballon':"d'un cours de gym ballon",
  'full body':"d'un cours de full body",'step':"d'un cours de step",'stretch':"d'un cours de stretch",'circuit training':"d'un circuit training"},
 materiel:{'step':'avec un step','ballon':'avec ballon','halteres':'avec des haltères','barre':'avec une barre','elastique':'avec un élastique',
  'tapis seul':'avec seulement un tapis','chaise':'avec une chaise','kettlebell':'avec une kettlebell'}
};
function roueType(t){return ROUE_TYPES.find(x=>x.type===t)||{type:t,emoji:'🎡',titre:'Roue'}}
function roueCle(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ')}
function ficheRoue(id){if(!id)return null;return ROUE_EXERCICES.find(x=>x.id===id)||ROUE_ETIREMENTS.find(x=>x.id===id)||null}
function etiquetteCase(c){const f=c&&c.f&&ficheRoue(c.f);return f?f.court:String(c&&c.t||'')}
function nomCase(c){const f=c&&c.f&&ficheRoue(c.f);return f?f.nom:String(c&&c.t||'')}

// ===== Couleurs des cases =====
const ROUE_COULEURS=['#ff7a3d','#4c8dff','#4cc38a','#f5c451','#ff5d6c','#a07bff','#2ec4c4','#ff9fd0'];
function couleurCase(i,n){
  const k=ROUE_COULEURS.length;let c=i%k;
  if(n>1&&i===n-1&&c===0)c=2; // la dernière case ne touche pas la première avec la même couleur
  return ROUE_COULEURS[c];
}

// ===== Styles de la roue (communs aux deux espaces) =====
(function(){
  const css=`
.roue-boite{position:relative;margin:6px auto 0;width:100%;max-width:460px;aspect-ratio:1/1;user-select:none;-webkit-user-select:none}
.roue-boite svg{display:block;width:100%;height:100%;overflow:visible}
.roue-boite .roue-pointe{transform-origin:0 -505px;transition:transform .08s}
.roue-boite .roue-pointe.tic{transform:rotate(-12deg)}
.roue-boite .roue-case.gagne{filter:brightness(1.18) saturate(1.1)}
.roue-res{text-align:center;font-size:24px;font-weight:800;margin:12px 0 0;min-height:34px;line-height:1.25}
.roue-res small{display:block;font-size:14px;color:var(--mute);font-weight:700;letter-spacing:1px;text-transform:uppercase}
.roue-son{background:none;border:2px solid var(--line);color:var(--soft);border-radius:999px;padding:6px 12px;font-size:15px;cursor:pointer;font-family:inherit}
.mission{background:linear-gradient(160deg,#2a2230,#1c2442);border:2px solid var(--or);border-radius:18px;padding:18px;margin:0 0 16px}
.mission h2{font-size:22px}
.mission .phrase{font-size:21px;font-weight:800;line-height:1.35;margin:4px 0 12px}
.mission .ml{display:flex;gap:10px;padding:8px 0;border-top:1px solid var(--line);font-size:16px}
.mission .ml b{flex:none;color:var(--soft);font-weight:700}
.fiche{background:#141b33;border-radius:14px;padding:14px;margin:12px 0 0;border-left:4px solid var(--ok)}
.fiche h3{margin:0 0 6px;font-size:18px}
.fiche .fl{margin:8px 0 0;font-size:16px;line-height:1.45}
.fiche .fl b{display:block;color:var(--ok);font-size:13px;letter-spacing:1px;text-transform:uppercase}
.fiche .fc{font-size:13px;color:var(--mute);margin-top:2px}
@media (prefers-reduced-motion:reduce){.roue-boite .roue-pointe{transition:none}}
`;
  try{const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)}catch(e){}
})();

// ===== Petit tic-tac (Web Audio), coupable =====
let ROUE_AC=null;
function roueSonActif(){try{return localStorage.getItem('roue_son')!=='0'}catch(e){return true}}
function roueSonChanger(v){try{localStorage.setItem('roue_son',v?'1':'0')}catch(e){}}
function roueAudioPret(){try{if(!ROUE_AC){const A=window.AudioContext||window.webkitAudioContext;if(A)ROUE_AC=new A()}if(ROUE_AC&&ROUE_AC.state==='suspended')ROUE_AC.resume()}catch(e){ROUE_AC=null}}
function roueTic(fort){
  if(!roueSonActif()||!ROUE_AC)return;
  try{
    const t=ROUE_AC.currentTime, o=ROUE_AC.createOscillator(), g=ROUE_AC.createGain();
    o.type='triangle';o.frequency.setValueAtTime(fort?880:1600,t);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(fort?0.12:0.05,t+0.003);g.gain.exponentialRampToValueAtTime(0.0001,t+(fort?0.25:0.035));
    o.connect(g);g.connect(ROUE_AC.destination);o.start(t);o.stop(t+(fort?0.27:0.04));
  }catch(e){}
}

// ===== Dessin d'une roue en SVG =====
// cases : [{t, f?}] ; la case i occupe l'angle [i*a, (i+1)*a], compté depuis le haut, dans le sens des aiguilles d'une montre.
function roueSVG(cases,opt){
  opt=opt||{};
  const n=Math.max(1,cases.length), R=480, a=360/n;
  const pt=(deg,r)=>{const t=(deg-90)*Math.PI/180;return [(r*Math.cos(t)).toFixed(2),(r*Math.sin(t)).toFixed(2)]};
  let parts='';
  // taille du texte : une seule taille pour toute la roue, la plus grande qui tient ;
  // un nom peut passer sur 2 lignes si la case est assez large
  const Lr=R*0.77, h=n===1?R:2*Math.PI*(R*0.55)/n, maxF=n<=4?68:n<=8?58:52, W=0.58;
  const couper=t=>{const m=t.split(' ');if(m.length<2)return null;let best=null;
    for(let k=1;k<m.length;k++){const a=m.slice(0,k).join(' '),b=m.slice(k).join(' '),L=Math.max(a.length,b.length);if(!best||L<best.L)best={a,b,L}}return best};
  const infos=cases.map(c=>{const t=etiquetteCase(c),f1=Math.min(Lr/(Math.max(1,t.length)*W),h*0.8),cp=couper(t),f2=cp?Math.min(Lr/(cp.L*W),h/2.4):0;return {t,f1,cp,f2}});
  const fs=Math.max(13,Math.min(maxF,...infos.map(x=>Math.max(x.f1,x.f2))));
  cases.forEach((c,i)=>{
    const col=couleurCase(i,n), x=infos[i];
    if(n===1)parts+=`<circle class="roue-case" data-i="0" r="${R}" fill="${col}" stroke="#10162b" stroke-width="4"/>`;
    else{
      const [x1,y1]=pt(i*a,R),[x2,y2]=pt((i+1)*a,R);
      parts+=`<path class="roue-case" data-i="${i}" d="M0 0 L${x1} ${y1} A${R} ${R} 0 ${a>180?1:0} 1 ${x2} ${y2} Z" fill="${col}" stroke="#10162b" stroke-width="4"/>`;
    }
    let lignes;
    if(x.t.length*W*fs<=Lr)lignes=[x.t];
    else if(x.cp&&x.cp.L*W*fs<=Lr&&h>=fs*2.3)lignes=[x.cp.a,x.cp.b];
    else{const mx=Math.max(3,Math.floor(Lr/(fs*W)));lignes=[x.t.slice(0,mx-1).trim()+'…']}
    const mid=i*a+a/2-90, tsp=lignes.length===1?esc(lignes[0]):lignes.map((l,k)=>`<tspan x="0" dy="${k?'1.08em':'-0.54em'}">${esc(l)}</tspan>`).join('');
    parts+=`<text transform="rotate(${mid.toFixed(3)}) translate(${(R*0.92).toFixed(1)} 0)" text-anchor="end" dominant-baseline="central" font-size="${fs.toFixed(1)}" font-weight="800" fill="#10162b" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" style="pointer-events:none">${tsp}</text>`;
  });
  // petits clous sur le bord
  let clous='';for(let i=0;i<n&&n>1&&n<=60;i++){const [x,y]=pt(i*a,R+14);clous+=`<circle cx="${x}" cy="${y}" r="6" fill="#c9cfe6"/>`}
  return `<svg viewBox="-540 -560 1080 1100" role="img" aria-label="${esc(opt.titre||'Roue')}">
   <circle r="${R+28}" fill="#0b1022" stroke="#2c365c" stroke-width="10"/>
   <g class="roue-g" transform="rotate(0)">${parts}${clous}</g>
   <circle r="${n>1?64:0}" fill="#10162b" stroke="#c9cfe6" stroke-width="8"/>
   <circle r="${n>1?20:0}" fill="#ff7a3d"/>
   <g class="roue-pointe"><path d="M-38 -548 L38 -548 L0 -452 Z" fill="#fff" stroke="#10162b" stroke-width="8" stroke-linejoin="round"/></g>
  </svg>`;
}
// Place une roue dans un élément et renvoie de quoi la faire tourner
function creerRoue(boite,cases,opt){
  opt=opt||{};
  boite.classList.add('roue-boite');
  delete boite.dataset.case;
  boite.innerHTML=roueSVG(cases,opt);
  const g=boite.querySelector('.roue-g'), pointe=boite.querySelector('.roue-pointe');
  const n=Math.max(1,cases.length), a=360/n;
  let angle=opt.angle||0;
  const poser=th=>{angle=th;g.setAttribute('transform',`rotate(${th.toFixed(3)})`);boite.dataset.angle=String(((th%360)+360)%360)};
  poser(angle);
  // la case sous la flèche pour un angle donné
  const sous=th=>{const phi=(((-th)%360)+360)%360;return Math.min(n-1,Math.floor(phi/a))};
  const R={n,boite,get angle(){return angle},caseSous:()=>sous(angle),
    surligner(i){boite.querySelectorAll('.roue-case').forEach(p=>p.classList.toggle('gagne',+p.dataset.i===i))},
    // fait tourner jusqu'à la case i ; renvoie une promesse
    tourner(i,duree){
      return new Promise(res=>{
        R.surligner(-1);
        const reduit=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        duree=duree||(reduit?1200:4200);
        const jeu=(Math.random()-0.5)*a*0.6; // pas toujours au milieu de la case
        const cible=-(i*a+a/2+jeu);
        const tours=(reduit?1:5)+Math.floor(Math.random()*2);
        let delta=((cible-angle)%360+360)%360; delta+=360*tours;
        const depart=angle, t0=performance.now();
        let derniere=Math.floor(((-depart)%360+360)%360/a), dernierSon=0;
        const ease=x=>1-Math.pow(1-x,4);
        const pas=now=>{
          const x=Math.min(1,(now-t0)/duree), th=depart+delta*ease(x);
          poser(th);
          const k=sous(th);
          if(k!==derniere){derniere=k;if(now-dernierSon>45){dernierSon=now;roueTic(false);pointe.classList.add('tic');setTimeout(()=>pointe.classList.remove('tic'),70)}}
          if(x<1)requestAnimationFrame(pas);
          else{poser(depart+delta);R.surligner(i);roueTic(true);boite.dataset.case=String(i);res(i)}
        };
        requestAnimationFrame(pas);
      });
    }};
  return R;
}

// ===== « Ta mission » : une phrase propre selon les roues tirées =====
// tirages : [{type, cases:[{t,f}...]}] (les cases sorties pour chaque roue)
function phraseMission(tirages){
  const par={};tirages.forEach(x=>{(par[x.type]=par[x.type]||[]).push(...x.cases)});
  const mor=(type,c)=>ROUE_PHRASES[type]&&ROUE_PHRASES[type][roueCle(c.t)];
  const p=(par.partie||[]).map(c=>mor('partie',c)), s=(par.style||[]).map(c=>mor('style',c)), m=(par.materiel||[]).map(c=>mor('materiel',c));
  const tousConnus=[p,s,m].every(l=>l.every(Boolean));
  let phrase='';
  if(tousConnus&&(p.length||s.length||m.length)){
    const et=l=>l.length<=1?(l[0]||''):l.slice(0,-1).join(', ')+' et '+l[l.length-1];
    if(p.length)phrase=`Tu fais ${et(p)}${s.length?' '+et(s):''}${m.length?' '+et(m):''}.`;
    else if(s.length)phrase=`Tu animes ${et(s).replace(/^d'un /,'un ').replace(/^d'une /,'une ')}${m.length?' '+et(m):''}.`;
    else phrase=`Ton matériel : ${(par.materiel||[]).map(nomCase).join(' et ').toLowerCase()}.`;
  }
  const ex=par.exercices||[], et_=par.etirements||[];
  const bout=[];
  if(ex.length)bout.push(`Tu montres ${ex.length>1?'les exercices':"l'exercice"} ${ex.map(c=>'« '+nomCase(c)+' »').join(' et ')}.`);
  if(et_.length)bout.push(`Tu montres ${et_.length>1?'les étirements':"l'étirement"} ${et_.map(c=>'« '+nomCase(c)+' »').join(' et ')}.`);
  if(par.perso&&par.perso.length&&!phrase&&!bout.length)bout.push(par.perso.map(nomCase).join(' · '));
  phrase=[phrase].concat(bout).filter(Boolean).join(' ');
  const lignes=tirages.map(x=>({emoji:roueType(x.type).emoji,titre:x.titre||roueType(x.type).titre,valeur:x.cases.map(nomCase).join(' + ')}));
  return {phrase,lignes};
}

// ===== Fiche d'un exercice ou d'un étirement =====
function htmlFiche(f){
  if(!f)return '';
  const cours=(f.cours||[]).map(c=>ROUE_COURS[c]||c).join(' · ');
  const l=(t,v)=>v?`<div class="fl"><b>${t}</b>${esc(v)}</div>`:'';
  return `<div class="fiche"><h3>${esc(f.nom)}</h3><div class="fc">Cours : ${esc(cours)}${f.d?' · ↔️ À faire des 2 côtés':''}</div>
   ${l('Placement',f.pl)}${l('Exécution',f.ex&&f.pl?f.ex:'')}${l('Sécurité',f.se)}${l('Consigne',f.co)}${l('Explication',f.pl?'':f.ex)}${l('Méthode',f.me)}</div>`;
}
