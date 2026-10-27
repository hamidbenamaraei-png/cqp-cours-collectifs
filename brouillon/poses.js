// ===== Étirements en 3D (27/10) : une image par étirement =====
const E3_DEB=DEB, E3_BRAS0={r:[1,-46,3]};
const E3_SOL={P:[0,6,0]};
const B3_ETIR={
// --- Quadriceps
"etir|Quadriceps|Debout":[Z(DEB,{pD:{a:[-17,46,9],j:[1,26,8]},pG:{r:[1,-52,-1]},mD:{a:[-15,50,13]},mG:{a:[42,100,-16]},v:{y:-62}})],
"etir|Quadriceps|Allongé sur le côté":[{P:[0,10,0],N:[44,10,0],S:[0,1,0],pD:{a:[-7,22,-5],j:[-25,18,2]},pG:{a:[-44,2,8],k:[1,0,0]},mD:{a:[-6,25,-8]},mG:{a:[62,3,6]},v:{y:-25,t:32}}],
"etir|Quadriceps|Allongé sur le ventre":[Z(VEN,{N:[42,14,0],pD:{a:[-10,21,7],j:[-26,3,7]},pG:{a:[-52,-4,-1]},mD:{a:[-9,23,11]},mG:{a:[40,1,-12],k:[0,-1,0]},v:{y:-55,t:20}})],
// --- Psoas
"etir|Psoas|Fente debout":[Z(DEB,{P:[-6,40,0],N:[-4,84,0],m:HAN,pD:{a:[30,0,9]},pG:{a:[-46,0,-9],k:[1,-.3,0]},v:{y:-55}})],
"etir|Psoas|Fente, genou arrière au sol":[Z(DEB,{P:[-6,24,0],N:[-2,68,0],pD:{a:[28,0,9]},pG:{a:[-40,0,-9],j:[-14,1,-9]},mD:{a:[22,30,10]},mG:{a:[22,31,4]},v:{y:-55}})],
// --- Ischios
"etir|Ischios|Allongé sur le dos":[Z(DOSJ,{pD:{a:[14,56,8]},pG:{a:[52,4,-8]},mD:{a:[-2,30,10]},mG:{a:[-2,30,5]},v:{y:-30,t:22}})],
"etir|Ischios|Assis, jambes tendues":[{P:[0,6,0],N:[30,38,0],p:{a:[52,4,8]},m:{a:[46,7,8]},v:{y:-60,t:22}}],
"etir|Ischios|Assis, une jambe tendue":[{P:[0,6,0],N:[30,38,6],pD:{a:[52,4,9]},pG:{a:[20,2,2],j:[14,3,-24]},mD:{a:[44,8,12]},mG:{a:[42,10,6]},v:{y:-45,t:28}}],
"etir|Ischios|Debout, pieds écartés":[Z(DEB,{P:[0,50,0],N:[38,72,0],pD:{a:[2,0,22]},pG:{a:[2,0,-22]},mD:{a:[34,6,10]},mG:{a:[34,6,-10]},v:{y:-45}})],
"etir|Ischios|Debout, un talon posé devant":[Z(DEB,{P:[-6,46,0],N:[22,84,0],pD:{a:[42,2,8]},pG:{a:[-6,0,-8],k:[1,0,0]},mD:{a:[20,40,6]},mG:{a:[16,41,-4]},v:{y:-68}})],
"etir|Ischios|Postural, à genoux jambe tendue":[{P:[-4,26,0],N:[34,42,0],pD:{a:[44,2,8]},pG:{a:[-30,0,-8],j:[-4,1,-8]},mD:{a:[30,1,16]},mG:{a:[30,1,-6]},v:{y:-55,t:20}}],
// --- Mollets
"etir|Mollets|Assis, jambe tendue":[{P:[0,6,0],N:[24,44,0],pD:{a:[52,4,9]},pG:{a:[26,0,-10],k:[0,1,0]},mD:{a:[48,10,11]},mG:{a:[48,10,6]},v:{y:-50,t:22}}],
"etir|Mollets|Chien tête en bas":[{P:[0,48,0],N:[33,19,0],p:{a:[-24,0,8]},m:{a:[70,0,14]},v:{y:-70,t:14}}],
"etir|Mollets|Debout, mains contre un mur":[Z(DEB,{P:[0,48,0],N:[12,90,0],pD:{a:[20,0,9],k:[1,0,0]},pG:{a:[-36,0,-9]},mD:{a:[44,90,14]},mG:{a:[44,90,-14]},pr:[['murx',46]],v:{y:-58}})],
"etir|Mollets|En fente debout, sans appui":[Z(DEB,{P:[0,48,0],N:[8,92,0],pD:{a:[20,0,9],k:[1,0,0]},pG:{a:[-36,0,-9]},mD:{a:[18,38,10]},mG:{a:[18,39,3]},v:{y:-58}})],
// --- Adducteurs
"etir|Adducteurs|Assis, jambes écartées":[{P:[0,6,0],N:[34,34,0],pD:{a:[40,4,34]},pG:{a:[40,4,-34]},mD:{a:[44,1,10]},mG:{a:[44,1,-10]},v:{y:-30,t:30}}],
"etir|Adducteurs|Assis, papillon":[{P:[0,6,0],N:[10,49,0],pD:{a:[22,2,2],j:[12,10,28]},pG:{a:[22,2,-2],j:[12,10,-28]},mD:{a:[22,5,5]},mG:{a:[22,5,-5]},v:{y:-25,t:28}}],
"etir|Adducteurs|Debout, fente latérale":[Z(DEB,{P:[-4,30,10],N:[4,74,8],pD:{a:[4,0,30],k:[1,0,.3]},pG:{a:[2,0,-40]},mD:{a:[14,32,22]},mG:{a:[14,34,14]},v:{y:-65}})],
"etir|Adducteurs|Postural, debout jambes écartées":[Z(DEB,{P:[0,44,0],N:[44,46,0],pD:{a:[0,0,30]},pG:{a:[0,0,-30]},mD:{a:[44,0,14]},mG:{a:[44,0,-14]},v:{y:-40}})],
// --- Fessiers
"etir|Fessiers|Allongé, cheville sur le genou":[Z(DOS,{pG:{a:[34,0,-9],j:[20,22,-8]},pD:{a:[20,25,-4],j:[12,16,22]},mD:{r:[34,-4,6],k:[0,1,0]},mG:{r:[34,-4,-6],k:[0,1,0]},v:{y:-20,t:35}})],
"etir|Fessiers|Allongé, genou à la poitrine":[Z(DOSJ,{pD:{a:[10,38,8],j:[-12,28,8]},pG:{a:[52,4,-8]},mD:{a:[-11,31,12]},mG:{a:[-11,31,4]},v:{y:-35,t:22}})],
"etir|Fessiers|Assis, jambe croisée avec torsion":[{P:[0,6,0],N:[0,50,0],S:[-.7,0,.7],pG:{a:[52,4,-8]},pD:{a:[24,0,-10],j:[18,24,4]},mG:{a:[18,28,8]},mD:{a:[-22,1,10]},v:{y:-40,t:22}}],
"etir|Fessiers|À genoux, jambe avant pliée":[{P:[0,14,0],N:[30,48,0],pD:{a:[18,1,-14],j:[22,2,10]},pG:{a:[-52,1,-8]},mD:{a:[24,1,20]},mG:{a:[24,1,-20]},v:{y:-45,t:22}}],
// --- Lombaires
"etir|Lombaires|Allongé, les deux genoux à la poitrine":[Z(DOS,{p:{a:[10,38,8],j:[-12,28,8]},m:{a:[-10,32,10]},v:{y:-35,t:22}})],
"etir|Lombaires|Assis, dos rond relâché":[{P:[0,6,0],N:[22,42,0],hd:[1,-.6,0],p:{a:[34,0,9],k:[0,1,0]},m:{a:[30,16,9]},v:{y:-60,t:20}}],
// --- Grand droit
"etir|Grand droit|Auto-grandissement allongé":[Z(DOSJ,{m:{a:[-88,6,10]},v:{y:-30,t:26}})],
"etir|Grand droit|Auto-grandissement debout":[Z(DEB,{m:{a:[2,142,10]},v:{y:-50}})],
"etir|Grand droit|Sphinx":[Z(VEN,{N:[40,22,0],mD:{a:[52,1,10],j:[32,1,13]},mG:{a:[52,1,-10],j:[32,1,-13]},v:{y:-55,t:20}})],
// --- Obliques
"etir|Obliques|Allongé, genoux sur le côté":[Z(DOS,{pD:{a:[30,1,22],j:[12,8,26]},pG:{a:[28,6,16],j:[12,14,20]},mD:{a:[-40,6,58]},mG:{a:[-40,6,-58]},v:{y:-10,t:45}})],
"etir|Obliques|Assis, une jambe pliée":[{P:[0,6,0],N:[2,40,22],pD:{a:[30,4,46]},pG:{a:[14,2,4],j:[18,3,-18]},mG:{a:[10,62,46]},mD:{a:[22,6,34]},v:{y:-75,t:15}}],
"etir|Obliques|Debout, inclinaison sur le côté":[Z(DEB,{N:[0,94,14],mG:{a:[2,128,30]},mD:{a:[2,54,26]},v:{y:-80}})],
"etir|Obliques|Postural, debout bras tendus":[Z(DEB,{N:[0,94,12],mD:{a:[2,132,28]},mG:{a:[2,132,24]},v:{y:-80}})],
// --- Dos
"etir|Dos|Debout, dos rond":[Z(DEB,{P:[-4,50,0],N:[10,92,0],hd:[.7,-.7,0],mD:{a:[48,82,4]},mG:{a:[48,82,-4]},p:{a:[2,0,9],k:[1,0,0]},v:{y:-55}})],
"etir|Dos|Position de l'enfant":[{P:[-14,16,0],N:[28,8,0],hd:[1,-.3,0],p:{a:[-16,1,8],j:[10,2,10]},m:{a:[70,1,12]},v:{y:-55,t:20}}],
"etir|Dos|Postural, debout dos plat":[Z(DEB,{P:[-4,50,0],N:[40,54,0],m:{a:[86,56,10]},p:{a:[0,0,9]},v:{y:-55}})],
"etir|Dos|À quatre pattes, dos rond / dos creux":[Z(QP,{P:[0,30,0],N:[40,48,0],hd:[.4,-.9,0],lab:'dos rond'}),Z(QP,{P:[0,24,0],N:[40,42,0],hd:[.8,.6,0],lab:'dos creux'})],
// --- Poitrine
"etir|Poitrine|Avant-bras contre un mur":[Z(DEB,{S:[-.3,0,1],mD:{a:[0,114,37],j:[0,93,37]},mG:{r:[1,-46,-3]},pr:[['murz',39]],v:{y:-55}})],
"etir|Poitrine|Bras écartés tirés vers l'arrière":[Z(DEB,{mD:{a:[-14,92,58]},mG:{a:[-14,92,-58]},v:{y:-70}})],
"etir|Poitrine|Mains crochetées derrière le dos":[Z(DEB,{mD:{a:[-26,52,3]},mG:{a:[-26,52,-3]},v:{y:-40}})],
// --- Biceps
"etir|Biceps|Bras tendu, paume vers le plafond":[Z(DEB,{mD:{a:[46,92,16]},mG:{a:[40,93,12]},v:{y:-50}})],
"etir|Biceps|À quatre pattes, doigts vers les genoux":[Z(QP,{P:[-6,26,0],N:[34,40,0]})],
// --- Triceps
"etir|Triceps|Main entre les omoplates":[Z(DEB,{mD:{a:[-6,90,6],j:[2,116,10]},mG:{a:[4,114,8]},v:{y:-140}})],
// --- Épaules
"etir|Épaules|Bras tendu plaqué contre la poitrine":[Z(DEB,{mD:{a:[14,92,-30]},mG:{a:[16,94,-8]},v:{y:-60}})],
"etir|Épaules|À quatre pattes, bras glissé sous la poitrine":[Z(QP,{N:[38,18,-4],S:[0,-.5,1],mD:{a:[38,1,-40]},mG:{a:[44,0,-14]},v:{y:-40,t:22}})],
// --- Cervicales
"etir|Cervicales|Menton vers la poitrine":[Z(DEB,{hd:[.6,-.8,0],m:NUQUE,v:{y:-60}})],
"etir|Cervicales|Tête penchée sur le côté":[Z(DEB,{hd:[0,.6,.8],mD:{h:[0,6,-4]},mG:{r:[1,-46,-3]},v:{y:-80}})],
"etir|Cervicales|Tête tournée vers l'aisselle":[Z(DEB,{hd:[.5,-.7,.5],mD:{h:[-4,6,0]},mG:{r:[1,-46,-3]},v:{y:-60}})]
};
