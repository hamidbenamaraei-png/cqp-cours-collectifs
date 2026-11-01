/* Tests unitaires : node sm-7q4x/tests/test-core.js */
'use strict';
const C = require('../core.js');
const S = require('./synth.js');
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) { passes++; console.log('  ✓ ' + msg); } else { fails++; console.log('  ✗ ' + msg); } }
function section(t) { console.log('\n' + t); }

/* ---------- 4. Alignement audio ---------- */
section('4. Alignement audio (musique décalée de 37,4 s + voix + bruit)');
{
  const sr = 11025, rr = S.rng(42);
  const musicLen = 150, videoLen = 20 * 60, OFF = 37.4;
  // musique : grosse caisse à 128 bpm, charleston, nappes qui changent
  const mus = new Float32Array(musicLen * sr);
  const beat = 60 / 128; let ph = 0, chordF = 220;
  for (let i = 0; i < mus.length; i++) {
    const t = i / sr, bt = t % beat, bi = Math.floor(t / beat);
    if (bi % 8 === 0 && bt < 1 / sr * 2) chordF = [220, 247, 196, 262, 175][Math.floor(rr() * 5)];
    ph += 2 * Math.PI * chordF / sr;
    const kick = Math.exp(-bt * 30) * Math.sin(2 * Math.PI * 60 * bt) * 0.8;
    const hat = ((t + beat / 2) % beat) < 0.03 ? (rr() * 2 - 1) * 0.25 : 0;
    const snare = (bi % 2 === 1 && bt < 0.12) ? (rr() * 2 - 1) * 0.35 * Math.exp(-bt * 25) : 0;
    const pad = 0.15 * Math.sin(ph) * (0.6 + 0.4 * Math.sin(2 * Math.PI * t / 7.3));
    const sec = Math.floor(t / 9.7) % 3 === 0 ? 0.6 : 1; // variations de structure
    mus[i] = (kick + hat + snare) * sec + pad;
  }
  // vidéo : autre musique avant/après, notre musique à 37,4 s, voix forte, bruit, filtre « micro »
  const vid = new Float32Array(videoLen * sr);
  const o0 = Math.round(OFF * sr);
  for (let i = 0; i < mus.length && o0 + i < vid.length; i++) vid[o0 + i] = 0.5 * mus[i];
  // une autre musique au même tempo plus loin (piège)
  for (let i = 0; i < 150 * sr; i++) { const t = i / sr, bt = t % beat; vid[Math.round(400 * sr) + i] += 0.5 * Math.exp(-bt * 30) * Math.sin(2 * Math.PI * 55 * bt) * 0.8 + 0.05 * (rr() * 2 - 1); }
  // voix : bruit filtré modulé en syllabes (4 Hz), plus fort que la musique
  let lp = 0, bp = 0, f0ph = 0;
  for (let i = 0; i < vid.length; i++) {
    const t = i / sr; const syl = Math.max(0, Math.sin(2 * Math.PI * 4.3 * t + Math.sin(t))) * (Math.sin(2 * Math.PI * t / 13) > -0.3 ? 1 : 0);
    f0ph += 2 * Math.PI * (130 + 30 * Math.sin(t * 1.7)) / sr;
    const n = rr() * 2 - 1; lp += 0.3 * (n - lp); bp = lp - bp * 0.2;
    const voice = (0.5 * Math.sign(Math.sin(f0ph)) * 0.3 + bp) * syl * 0.6;
    vid[i] += voice + 0.03 * (rr() * 2 - 1);
  }
  // micro de téléphone : on coupe les très basses (passe-haut simple)
  let prev = 0, y = 0; for (let i = 0; i < vid.length; i++) { y = 0.97 * (y + vid[i] - prev); prev = vid[i]; vid[i] = y; }
  const t0 = Date.now();
  const vf = C.audioFeaturesFromPCM(vid, sr), mf = C.audioFeaturesFromPCM(mus, sr);
  const t1 = Date.now();
  const prep = C.prepareVideo(vf, mf.n + 10);
  const res = C.alignMusic(prep, mf);
  const t2 = Date.now();
  console.log(`    → décalage trouvé ${res && res.offset} s (score ${res && res.score}, rapport ${res && res.ratio}, confiance ${res && res.conf}) ; calcul ${t1 - t0} ms + ${t2 - t1} ms pour 20 min`);
  ok(res && Math.abs(res.offset - OFF) <= 0.1, `décalage ${res && res.offset} s ≈ 37,4 s (±0,1 s)`);
  ok(res && res.conf > 0.3, 'confiance suffisante');
  // musique qui démarre AVANT le début de la vidéo
  const vid2 = vid.subarray(Math.round(60 * sr));
  const vf2 = C.audioFeaturesFromPCM(vid2, sr); const res2 = C.alignMusic(C.prepareVideo(vf2, mf.n + 10), mf);
  ok(res2 && Math.abs(res2.offset - (OFF - 60)) <= 0.1, `vidéo commencée en cours de musique : ${res2 && res2.offset} s ≈ −22,6 s`);
  const bpm = C.estimateBPM(mf); ok(bpm && Math.abs(bpm - 128) <= 2, `tempo de la musique : ${bpm} BPM (128)`);
  // découpage par creux : 3 morceaux séparés par 4 s de silence (voix seulement)
  const d3 = new Float32Array(400 * sr);
  for (const st of [0, 130, 265]) for (let i = 0; i < 125 * sr && (st * sr + i) < d3.length; i++) d3[st * sr + i] += mus[i % mus.length] * 0.5;
  for (let i = 0; i < d3.length; i++) { const t = i / sr; d3[i] += 0.2 * (rr() * 2 - 1) * Math.max(0, Math.sin(2 * Math.PI * 4 * t)); }
  const cuts = C.silenceCuts(C.audioFeaturesFromPCM(d3, sr), { minSong: 90 });
  console.log('    → coupures proposées : ' + cuts.map((c) => c.t + ' s').join(', '));
  ok(cuts.length === 2 && Math.abs(cuts[0].t - 127.5) < 3 && Math.abs(cuts[1].t - 262.5) < 3, 'coupures aux silences (≈127 s et ≈262 s)');
}

/* ---------- 7. Lecture ---------- */
section('7. État de lecture (jeu de danse)');
{
  const segs = [{ name: 'Squat', reps: 4, start: 10, end: 18, repTimes: [10, 12, 14, 16] }, { name: 'Rowing', reps: 2, start: 18, end: 22, repTimes: [18, 20] }];
  const a = C.playState(segs, 13.1), b = C.playState(segs, 21), c = C.playState(segs, 5);
  ok(a.seg.name === 'Squat' && a.rep === 2 && a.next.name === 'Rowing', 'à 13,1 s : Squat 2 / 4, suivant Rowing');
  ok(b.seg.name === 'Rowing' && b.rep === 2, 'à 21 s : Rowing 2 / 2');
  ok(c.before && c.next.name === 'Squat', 'avant le début : « prépare-toi »');
}

/* ---------- 8. Recalage prudent des musiques ---------- */
section('8. Recalage prudent (a : refuse les mauvaises versions ; b : accepte la bonne, voix par-dessus)');
{
  const sr = 8000;
  const A = S.song({ seed: 1, bpm: 128, dur: 240, sr }), B = S.song({ seed: 2, bpm: 132, dur: 200, sr });
  const Cc = S.song({ seed: 3, bpm: 128, dur: 260, sr }), D = S.song({ seed: 4, bpm: 126, dur: 300, sr });
  const parts = [Cc, A, S.speed(B, 1.03), D];
  let tot = 30 * sr; for (const p of parts) tot += p.length + 2 * sr; tot += 20 * sr;
  const vid = new Float32Array(tot); let pos = 30 * sr; const starts = [];
  for (const p of parts) { starts.push(pos / sr); for (let i = 0; i < p.length; i++) vid[pos + i] += 0.5 * p[i]; pos += p.length + 2 * sr; }
  const vo = S.voice(tot, sr, 5, 1.0); for (let i = 0; i < tot; i++) vid[i] += vo[i]; // voix plus forte que la musique
  let prev = 0, y = 0; for (let i = 0; i < vid.length; i++) { y = 0.97 * (y + vid[i] - prev); prev = vid[i]; vid[i] = y; }
  const vp = C.prepareVideo2(C.audioFeaturesFromPCM(vid, sr), Math.round(420 / 0.02));
  const find = (x) => C.findMusic(vp, C.audioFeaturesFromPCM(x, sr));
  const ext = (() => { const X = S.song({ seed: 11, bpm: 128, dur: 60, sr }), Y = S.song({ seed: 12, bpm: 128, dur: 40, sr }); const o = new Float32Array(X.length + A.length + Y.length); o.set(X); o.set(A, X.length); o.set(Y, X.length + A.length); return o; })();
  const remix = (() => { const z = S.speed(A, 1.04), w = S.song({ seed: 24, bpm: 128 * 1.04, dur: 240, sr }); const o = new Float32Array(Math.min(z.length, w.length)); for (let i = 0; i < o.length; i++) o[i] = 0.3 * z[i] + 0.7 * w[i]; return o; })();
  const bad = { 'même tempo, autre arrangement': S.song({ seed: 21, bpm: 128, dur: 240, sr }), 'autre durée (version longue)': ext,
    'remix +4 % autre arrangement': S.song({ seed: 23, bpm: 128 * 1.04, dur: 250, sr }), 'remix +4 % mélangé': remix, 'absente, tempo voisin': S.song({ seed: 30, bpm: 126, dur: 280, sr }) };
  for (const k in bad) { const r = find(bad[k]); ok(!r.ok, `(a) ${k} : refusée (${r.why}, ${Math.round(r.frac * 100)} % de tranches)`); }
  const ra = find(A); ok(ra.ok && Math.abs(ra.offset - starts[1]) < 0.1 && Math.abs(ra.ratio - 1) < 0.002, `(b) bonne musique + voix forte : placée à ${ra.offset} s (attendu ${starts[1]}), confiance ${ra.conf}`);
  const rc = find(Cc); ok(rc.ok && Math.abs(rc.offset - starts[0]) < 0.1, `(b) 1re musique : ${rc.offset} s (attendu ${starts[0]})`);
  const rb = find(B); ok(rb.ok && Math.abs(rb.offset - starts[2]) < 0.15 && Math.abs(rb.ratio - 1 / 1.03) < 0.003, `(b) même musique jouée 3 % plus vite : ${rb.offset} s, rapport ${rb.ratio} (attendu ${(1 / 1.03).toFixed(4)})`);
  // musique qui dépasse le début de la vidéo
  const vp2 = C.prepareVideo2(C.audioFeaturesFromPCM(vid.subarray(Math.round(60 * sr)), sr), Math.round(420 / 0.02));
  const rcut = C.findMusic(vp2, C.audioFeaturesFromPCM(Cc, sr)); ok(!rcut.ok, `(a) musique commencée avant la vidéo (décalage négatif) : refusée (${rcut.why})`);
  // deux placements qui se chevauchent : le plus sûr gagne
  const pl = C.placeMusics([{ id: 'x', res: { ok: true, start: 100, end: 300, conf: 0.9 } }, { id: 'y', res: { ok: true, start: 250, end: 450, conf: 0.6 } }, { id: 'z', res: { ok: true, start: 302, end: 500, conf: 0.5 } }]);
  ok(pl.map((x) => x.id).join(',') === 'x,z', 'chevauchement : la musique la moins sûre est écartée');
}

/* ---------- 9. Découpage par les blancs (1 h, 10 morceaux) ---------- */
section('9. (c) Découpage par les blancs : 1 h, 10 morceaux, 2 s de quasi-silence, voix par-dessus');
{
  const sr = 8000, durs = [330, 420, 300, 380, 270, 440, 360, 250, 400, 350], bpms = [128, 132, 128, 136, 124, 130, 130, 140, 126, 128];
  const total = 30 + durs.reduce((a, b) => a + b, 0) + 9 * 2 + 15;
  const vid = new Float32Array(Math.round(total * sr)); let pos = 30; const starts = [];
  durs.forEach((d, k) => { const x = S.song({ seed: 100 + k, bpm: bpms[k], dur: d, sr }); const o = Math.round(pos * sr); for (let i = 0; i < x.length; i++) vid[o + i] += 0.5 * x[i]; starts.push(pos); pos += d + 2; });
  const vo = S.voice(vid.length, sr, 7, 1.0); for (let i = 0; i < vid.length; i++) vid[i] += vo[i];
  for (let i = 0; i < vid.length; i++) vid[i] += 0.01 * Math.sin(i * 0.37); // petit bruit de salle
  const vf = C.audioFeaturesFromPCM(vid, sr);
  for (const exp of [10, 0]) {
    const t0 = Date.now(); const r = C.cutSongs(vf, { expected: exp });
    const good = starts.slice(1).every((s) => r.cuts.some((c) => Math.abs(c.t - (s - 1)) < 3));
    ok(r.cuts.length === 9 && good, `${exp ? '10 musiques attendues' : 'sans musiques'} : ${r.cuts.length} coupures (${r.cuts.map((c) => Math.round(c.t)).join(', ')}) en ${Date.now() - t0} ms`);
  }
  // proposition des musiques (numéros dans les noms, durées voisines, une musique en trop)
  const r = C.cutSongs(vf, { expected: 10 });
  const segs = r.pieces.map((p, i) => ({ start: p.start, end: p.end, bpm: bpms[i] }));
  const musics = durs.map((d, i) => ({ id: 'm' + (i + 1), name: String(i + 1).padStart(2, '0') + ' - Titre ' + (i + 1) + ' (Extended Mix)', duration: d + 25, bpm: bpms[i] + 1 }));
  musics.splice(4, 0, { id: 'bonus', name: '04b Bonus', duration: 200, bpm: 150 });
  const shuffled = musics.slice().reverse();
  const pr = C.proposeMusics(segs, shuffled);
  ok(pr.map((x) => x.musicId).join(',') === durs.map((d, i) => 'm' + (i + 1)).join(','), 'musique proposée pour chaque morceau (ordre des numéros 01, 02…) : ' + pr.map((x) => x.musicId).join(','));
  segs[2].musicId = 'm3'; // une musique déjà placée sûrement
  const pr2 = C.proposeMusics(segs, shuffled); ok(pr2[2].musicId === 'm3' && pr2[3].musicId === 'm4', 'une musique déjà placée est respectée');
  ok(C.trackNumber('07 - Lunges (Radio Edit)') === 7 && C.trackNumber('Track 3 Studio-X Trap Remix 2024') === 3 && C.trackNumber('Squats') === null, 'numéros lus dans les noms');
}
/* ---------- 11. Jeu de danse sur une musique au tempo différent ---------- */
section('11. (e) Adaptation au tempo de la musique');
{
  // vidéo à 128 BPM, musique de Hamid à 132 BPM : squat « single » sur chaque temps (2 temps par répétition)
  const vb = 128, mb = 132, beatV = 60 / vb, v0 = 41.3;
  const repT = []; for (let k = 0; k < 16; k++) repT.push(v0 + 8 * beatV + k * 2 * beatV);
  const segs = [{ name: 'Squat', reps: 16, start: repT[0], end: repT[15] + 2 * beatV, repTimes: repT }];
  const sy = C.makeSync({ vAttack: v0, vBpm: vb, mAttack: 3.2, mBpm: mb / 2 }); // tempo mesuré à moitié : doit être corrigé
  ok(Math.abs(sy.ratio - mb / vb) < 1e-3 && sy.mBpm === 132, `rapport ${sy.ratio} (attendu ${(mb / vb).toFixed(4)}), musique ${sy.mBpm} BPM`);
  // la 10e répétition doit tomber sur le temps n° 8 + 18 de la musique
  const mt = 3.2 + (8 + 18) * 60 / mb;
  const ps = C.playState(segs, C.musicToVideo(sy, mt) + 0.01);
  ok(ps.seg && ps.rep === 10, `au temps n° 26 de ta musique : répétition ${ps.rep} / 16`);
  ok(Math.abs(C.videoToMusic(sy, C.musicToVideo(sy, 77.7)) - 77.7) < 1e-9, 'aller-retour musique ↔ vidéo exact');
  const same = C.makeSync({ vAttack: 10, vBpm: 128, mAttack: 0, mBpm: 128.3 }); ok(same.ratio === 1, 'tempo presque identique : pas d\'adaptation');
  // premier temps fort d'une musique synthétique (attaque à 5 s, 128 BPM)
  const sr = 8000, x = S.song({ seed: 5, bpm: 128, dur: 40, sr }), pad = new Float32Array(5 * sr + x.length); pad.set(x, 5 * sr);
  const f = C.audioFeaturesFromPCM(pad, sr), fb = C.firstBeat(f, 0, 30);
  ok(Math.abs(fb - 5) < 0.06, `premier temps fort trouvé à ${fb} s (attendu 5 s)`);
}

/* ---------- 12. Mon script : temps vidéo → temps de la musique ---------- */
section('12. Conversion temps vidéo → temps musique (recalage sûr)');
{
  // « 02 Techno » retrouvée à 7:46 dans la vidéo (décalage 466 s), même vitesse
  const sync = { mode: 'sure', v0: 466, a0: 0, ratio: 1, vTop: 466, musicId: 'm2' };
  ok(Math.abs(C.videoToMusic(sync, 466 + 32.5) - 32.5) < 1e-9, 'ligne à 8:18,5 dans la vidéo → 0:32,5 dans la musique');
  const lines = [{ id: 'a', name: 'Squat', reps: 16, tempo: '2/2', t: 480 }, { id: 'b', name: 'Fentes', reps: 8, tempo: 'single', t: 510 }, { id: 'c', kind: 'pause', name: 'Pause', t: 540 }];
  const tl = C.buildTimeline(lines, { sync, sure: true, bpm: 128, endV: 560 });
  ok(tl.mode === 'video', 'musique sûre + horaires : on suit la vidéo (' + tl.mode + ')');
  ok(tl.items[0].start === 14 && tl.items[0].end === 44 && tl.items[1].start === 44 && tl.items[2].end === 94, `débuts dans la musique : ${tl.items.map((x) => x.start + '→' + x.end).join(', ')}`);
  ok(Math.abs(tl.items[0].repDur - 4 * 60 / 128) < 1e-9 && tl.items[0].repTimes.length === 16, 'répétition 2/2 = 4 temps : compteur calculé');
  ok(tl.items[2].repTimes.length === 0 && !tl.items[2].counted, 'pause sans répétitions : pas de compteur');
  // musique 3 % plus rapide que dans la vidéo
  const s2 = { mode: 'sure', v0: 100, a0: 0, ratio: 0.97, vTop: 100 };
  const t2 = C.buildTimeline([{ id: 'x', name: 'Curl', reps: 8, t: 197 }], { sync: s2, sure: true, endV: 294 });
  ok(Math.abs(t2.items[0].start - 100) < 1e-6 && Math.abs(t2.items[0].end - 200) < 1e-6, `rapport de vitesse respecté : ${t2.items[0].start} → ${t2.items[0].end}`);
  ok(Math.abs(t2.items[0].repDur - 12.5) < 1e-6, 'sans tempo : répétitions réparties sur la durée');
}

/* ---------- 13. Durées calculées par le BPM et le tempo ---------- */
section('13. Durées par BPM / tempo (musique pas retrouvée avec certitude, ou script sans horaires)');
{
  const B = C.beatsPerRep;
  ok(B('single') === 2 && B('2/2') === 4 && B('3/1') === 4 && B('1/3') === 4 && B('4/4') === 8 && B('pulses') === 8 && B('—') === null && B('') === null, 'anciens tempos encore compris : single 2, 2/2 4, 3/1 4, 1/3 4, 4/4 8, pulses (= 8 pulses) 8');
  const lines = [{ id: 'a', name: 'Squat', reps: 16, tempo: '1-1' }, { id: 'b', name: 'Squat', reps: 8, tempo: '3-1' }, { id: 'c', name: 'Squat', reps: 4, tempo: '3 pulses' }, { id: 'd', name: 'Squat', reps: 4, tempo: '4-4' }];
  const tl = C.buildTimeline(lines, { bpm: 120, attack: 2 });
  const d = tl.items.map((x) => Math.round((x.end - x.start) * 1000) / 1000);
  ok(tl.mode === 'bpm' && tl.items[0].start === 2, 'sans horaires : départ au 1er temps fort de la musique (2 s)');
  ok(d.join() === '16,16,8,16', `à 120 BPM : 16 × 1-1 = 16 s, 8 × 3-1 = 16 s, 4 × 3 pulses = 8 s, 4 × 4-4 = 16 s → ${d.join(' / ')}`);
  ok(tl.items[3].start === 42, 'les lignes s\'enchaînent (4e ligne à 42 s)');
  const ps = C.playState(tl.items, 2 + 5.1);
  ok(ps.seg.id === 'a' && ps.rep === 6, `à 5,1 s du départ (1-1 = 1 s à 120 BPM) : Squat répétition ${ps.rep} / 16`);
  // musique proposée (pas sûre), horaires vidéo + recalage au rythme : on part de l'heure convertie, durées au BPM
  const sync = { mode: 'tempo', v0: 300, a0: 1.5, ratio: 1, vTop: 300 };
  const t2 = C.buildTimeline([{ id: 'a', name: 'Rowing', reps: 8, tempo: '2/2', t: 310 }, { id: 'b', name: 'Curl', reps: 8, tempo: 'single', t: 330 }], { sync, sure: false, bpm: 128 });
  ok(t2.mode === 'bpm' && t2.items[0].start === 11.5 && Math.abs(t2.items[1].start - (11.5 + 32 * 60 / 128)) < 0.002, `musique pas sûre : début converti (11,5 s), puis durées au BPM (${t2.items[1].start})`);
  const t3 = C.buildTimeline([{ id: 'a', name: 'Gainage', reps: 0, t: 310 }, { id: 'b', name: 'Crunch', reps: 16, t: 340 }], { sync, bpm: 128, endV: 372 });
  ok(Math.abs((t3.items[0].end - t3.items[0].start) - 30) < 1e-6 && !t3.items[0].counted, 'ligne sans répétitions : durée prise sur les horaires de la vidéo');
  ok(t3.items[1].counted && Math.abs(t3.items[1].repDur - 2) < 1e-6, 'sans tempo mais avec horaires : compteur réparti (2 s par répétition)');
}

/* ---------- 14. Bibliothèque : migration des anciens cours ---------- */
section('14. Migration des anciens cours vers les dossiers');
{
  let n = 0; const mk = () => 'id' + (n++);
  const old = { id: 'c1', name: 'Pump – 31/10/2026', style: 'pump', created: 1, video: { name: 'v.mp4', size: 10, duration: 3600 }, morceaux: [
    { id: 'm1', name: '01 Strong Ones', start: 130, end: 429, status: 'done', segments: [{ name: 'Squat', reps: 16, tempo: '2/2', start: 140.2, end: 170 }, { name: 'Pause', base: 'Pause', reps: 0, start: 170, end: 175 }, { name: 'Squat', reps: 8, tempo: 'single', start: 175, end: 190 }] },
    { id: 'm2', name: '02 Techno', start: 466, end: 789, status: 'todo', segments: [] }] };
  const combat = { id: 'c2', name: 'Combat 87', style: 'combat', created: 2, morceaux: [] };
  const custom = { id: 'c3', name: 'Zumba 1', style: 'zumba', created: 3, morceaux: [] };
  const ch = C.migrateCourse(old, C.BASE_FOLDERS, mk);
  ok(ch && old.folder === 'pump', 'cours Pump → dossier 📁 Pump');
  ok(old.morceaux[0].lines.length === 2 && old.morceaux[0].lines[0].name === 'Squat' && old.morceaux[0].lines[0].reps === 16 && old.morceaux[0].lines[0].tempo === '2-2' && old.morceaux[0].lines[1].tempo === '1-1' && old.morceaux[0].lines[0].t === 140.2, 'ancien script repris dans « Mon script » (heures gardées, pauses vides retirées)');
  ok(old.morceaux[0].segments.length === 3 && old.morceaux[1].lines.length === 0, 'rien n\'est perdu (ancien script gardé aussi)');
  ok(!C.migrateCourse(old, C.BASE_FOLDERS, mk), 'une 2e migration ne change rien');
  C.migrateCourse(combat, C.BASE_FOLDERS, mk); C.migrateCourse(custom, C.BASE_FOLDERS, mk);
  ok(combat.folder === 'combat' && custom.folder === 'pump', 'Combat → 📁 Combat ; style inconnu → 📁 Pump');
  const mine = C.BASE_FOLDERS.concat([{ id: 'f_z', name: 'Zumba', style: 'f_z' }]);
  const z = { id: 'c4', name: 'Zumba 2', style: 'f_z', folder: 'f_z', morceaux: [] };
  ok(!C.migrateCourse(Object.assign(z, { version: C.COURSE_VERSION }), mine, mk) && z.folder === 'f_z', 'une édition déjà dans son propre dossier y reste');
  ok(C.editionNumber('Pump 99') === 99 && C.editionNumber('Pump – 31/10/2026') === null && C.editionNumber('BodyPump 101 (oct.)') === 101, 'numéro d\'édition lu dans le nom (dates ignorées)');
  const ord = C.sortEditions([{ name: 'Pump 98', created: 5 }, { name: 'Pump – 31/10/2026', created: 9 }, { name: 'Pump 99', created: 1 }, { name: 'Pump 100', created: 2 }]).map((x) => x.name);
  ok(ord.join(' | ') === 'Pump 100 | Pump 99 | Pump 98 | Pump – 31/10/2026', 'éditions triées par numéro décroissant : ' + ord.join(', '));
  const top = C.topMoves([old, combat], 'pump');
  ok(top[0].name === 'Squat' && top[0].n === 2, 'mouvements les plus utilisés du style en premier');
}

/* ---------- 15. Copier / coller un bloc, dupliquer, déplacer ---------- */
section('15. Copier un bloc, coller à l\'heure de la vidéo, dupliquer, déplacer');
{
  let n = 0; const mk = () => 'n' + (n++);
  let L = [];
  L = C.insertLine(L, { id: 'a', name: 'Squat', reps: 16, tempo: '2/2', t: 10 });
  L = C.insertLine(L, { id: 'c', name: 'Curl', reps: 8, t: 50 });
  L = C.insertLine(L, { id: 'b', name: 'Rowing', reps: 8, tempo: 'single', t: 40 });
  ok(L.map((l) => l.id).join('') === 'abc', 'une ligne ajoutée se range dans l\'ordre de la vidéo');
  const P = C.pasteBlock(L, [L[0], L[1]], 100, mk, 128);
  ok(P.length === 5 && P[3].name === 'Squat' && P[3].t === 100 && P[4].name === 'Rowing' && P[4].t === 130, `bloc Squat + Rowing collé à 1:40 (écart de 30 s gardé) : ${P.slice(3).map((l) => l.name + '@' + l.t).join(', ')}`);
  ok(new Set(P.map((l) => l.id)).size === 5 && P[0].t === 10, 'les copies ont de nouveaux identifiants, les originaux ne bougent pas');
  const P2 = C.pasteBlock(L, [L[1], L[2]], 45, mk, 128);
  ok(P2.map((l) => l.name).join(',') === 'Squat,Rowing,Rowing,Curl,Curl' && P2[2].t === 45 && P2[4].t === 55, 'collé au milieu : remis dans l\'ordre chronologique');
  const nt = C.pasteBlock(L, [{ id: 'x', name: 'Squat', reps: 16, tempo: 'single' }, { id: 'y', name: 'Fentes', reps: 8, tempo: 'single' }], 200, mk, 120);
  ok(nt[3].t === 200 && nt[4].t === 216, 'bloc sans horaires : écarts calculés au tempo (16 single à 120 BPM = 16 s)');
  const D = C.dupLine(L, 'a', 25, 128, 'd1');
  ok(D.length === 4 && D[1].id === 'd1' && D[1].t === 25 && D[1].name === 'Squat', 'dupliquer : copie placée à l\'heure actuelle de la vidéo');
  const D2 = C.dupLine(L, 'a', 10, 120, 'd2');
  ok(D2.find((l) => l.id === 'd2').t === 42 && D2[2].id === 'd2', 'dupliquer sans avancer la vidéo : copie placée juste après (16 × 2/2 à 120 BPM = 32 s)');
  const M = C.moveLine(L, 'b', -1);
  ok(M.lines.map((l) => l.name).join(',') === 'Rowing,Squat,Curl' && M.lines[0].t === 10 && M.lines[1].t === 40 && M.lines[0].id === 'b', 'déplacer vers le haut : le contenu change de place, les heures restent dans l\'ordre');
  ok(C.lineText({ name: 'Squat', reps: 16, tempo: '2/2' }, 0) === '1. Squat × 16 (2-2)' && C.lineText({ name: 'Squat', reps: 8, tempo: 'pulses' }, 0) === '1. Squat × 8 (8 pulses)' && C.lineText({ kind: 'pause', name: 'Pause', reps: 0 }, 1) === '2. Pause' && C.lineText({ name: 'Fentes', reps: 8, tempo: '—', note: 'jambe droite' }, 2) === '3. Fentes × 8 – jambe droite', 'texte du script : « 1. Squat × 16 (2-2) » (ancien tempo affiché à la nouvelle façon)');
  ok(C.norm('Élévations') === 'elevations', 'recherche sans accents');
}

/* ---------- 16. Nouveaux noms de mouvements Pump et nouveaux tempos (31/10) ---------- */
section('16. Mouvements Pump, tempos, migration');
{
  const q = C.QUICK.pump;
  ok(q.join('|') === ['Curl biceps', 'Développé militaire', 'Squat', 'Descente lever', 'Descente tirage', 'Triple descente tirage', 'Épaulé', 'Épaulé jeté', 'Triple épaulé jeté', 'Développé couché', 'Pompes', 'Extension triceps', 'Dips', 'Fentes', 'Élévations latérales'].join('|'), 'boutons rapides Pump : 15, dans l\'ordre demandé (5 lignes de 3)');
  ok(!C.MOVES.pump.includes('Soulevé de terre') && !C.MOVES.pump.includes('Rowing') && ['Élévations frontales', 'Gainage', 'Crunch', 'Pont fessier'].every((n) => C.MOVES.pump.includes(n)), 'anciens noms retirés, les autres mouvements restent');
  ok(C.TEMPOS.join('|') === '1-1|2-2|3-1|1-3|4-4|BB 2-2|Pause|3 pulses|8 pulses|Enroule les épaules', 'tempos dans l\'ordre demandé');
  const B = C.beatsPerRep;
  const exp = { '1-1': 2, '2-2': 4, '3-1': 4, '1-3': 4, '4-4': 8, 'BB 2-2': 4, '3 pulses': 4, '8 pulses': 8, 'Enroule les épaules': 4, 'Pause': 4, 'Tempo inventé': 4 };
  ok(Object.keys(exp).every((k) => B(k) === exp[k]), 'temps par répétition : ' + Object.keys(exp).map((k) => k + ' = ' + B(k)).join(', '));
  const tl = C.buildTimeline([{ id: 'p', name: 'Squat', reps: 3, tempo: 'Pause' }, { id: 'e', name: 'Épaulé', reps: 4, tempo: 'Enroule les épaules' }, { id: 'b', name: 'Squat', reps: 2, tempo: 'BB 2-2' }, { id: 'h', name: 'Curl biceps', reps: 2, tempo: '8 pulses' }], { bpm: 120 });
  const d = tl.items.map((x) => Math.round((x.end - x.start) * 1000) / 1000);
  ok(d.join() === '6,8,4,8', 'à 120 BPM : 3 × Pause = 12 temps (6 s), 4 × Enroule = 8 s, 2 × BB 2-2 = 4 s, 2 × 8 pulses = 8 s → ' + d.join(' / '));
  ok(C.normTempo('single') === '1-1' && C.normTempo('2/2') === '2-2' && C.normTempo('3/1') === '3-1' && C.normTempo('1/3') === '1-3' && C.normTempo('4/4') === '4-4' && C.normTempo('pulses') === '8 pulses' && C.normTempo('—') === '' && C.normTempo('bb 2-2') === 'BB 2-2', 'anciens tempos → nouveaux (single → 1-1 … pulses → 8 pulses)');
  // ancien script enregistré (version 3) avec les anciens noms et tempos
  const c = { id: 'x', name: 'Pump 98', style: 'pump', folder: 'pump', version: 3, morceaux: [{ id: 'm', name: '02 Squats', lines: [
    { id: 'a', name: 'Soulevé de terre', reps: 16, tempo: '2/2', t: 10 }, { id: 'b', name: 'Rowing', reps: 8, tempo: 'pulses', t: 20 }, { id: 'c', name: 'Squat', reps: 4, tempo: 'single', note: 'garder', t: 30 }, { id: 'd', kind: 'pause', name: 'Pause', t: 40 }],
    segments: [{ name: 'Rowing', reps: 8, tempo: '3/1', start: 1, end: 2 }] }] };
  ok(C.migrateCourse(c, C.BASE_FOLDERS) && c.version === C.COURSE_VERSION, 'ancien script migré (version ' + c.version + ')');
  const L = c.morceaux[0].lines;
  ok(L.map((l) => l.name + ':' + (l.tempo || '')).join('|') === 'Descente lever:2-2|Descente tirage:8 pulses|Squat:1-1|Pause:' && L[2].note === 'garder' && L.length === 4 && L[0].t === 10 && c.morceaux[0].segments[0].name === 'Descente tirage' && c.morceaux[0].segments[0].tempo === '3-1', 'noms et tempos remplacés, rien de perdu (heures, notes, pauses)');
  ok(!C.migrateCourse(c, C.BASE_FOLDERS), 'la migration ne se fait qu\'une fois');
  L[0].name = 'Rowing'; ok(!C.migrateCourse(c, C.BASE_FOLDERS) && L[0].name === 'Rowing', 'après la migration, un nom écrit plus tard n\'est plus touché');
  const combat = { id: 'y', name: 'Combat 1', style: 'combat', folder: 'combat', version: 3, morceaux: [{ id: 'm', name: '01', lines: [{ id: 'a', name: 'Rowing', reps: 8, tempo: '2/2' }] }] };
  C.migrateCourse(combat, C.BASE_FOLDERS); ok(combat.morceaux[0].lines[0].name === 'Rowing' && combat.morceaux[0].lines[0].tempo === '2-2', 'autre style : noms gardés, tempos convertis');
  // listes personnelles
  const k = { vocab: { pump: { 'Rowing': 'Tirage buste', 'Soulevé de terre': 'Soulevé de terre' } }, prints: [{ id: 'p', style: 'pump', name: 'Soulevé de terre' }, { id: 'q', style: 'combat', name: 'Rowing' }], customMoves: { pump: ['Rowing', 'Mon move', 'Descente tirage'] }, favs: { pump: { 2: ['Rowing', 'Squat'] } } };
  ok(C.migrateMoveLists(k), 'listes personnelles migrées');
  ok(!('Rowing' in k.vocab.pump) && !('Soulevé de terre' in k.vocab.pump), 'plus d\'anciennes clés dans le vocabulaire');
  ok(k.prints[0].name === 'Descente lever' && k.prints[1].name === 'Rowing', 'mouvements appris : renommés (style Pump seulement)');
  ok(k.customMoves.pump.join('|') === 'Descente tirage|Mon move|Tirage buste', 'mes mouvements : renommés sans doublon, son nom perso gardé (' + k.customMoves.pump.join(', ') + ')');
  ok(k.favs.pump[2].join('|') === 'Descente tirage|Squat', 'favoris renommés');
  ok(!C.migrateMoveLists(k), '2e passage : rien ne change');
}

/* ---------- 17. Favoris par numéro de morceau ---------- */
section('17. Favoris par style et numéro de morceau (partagés entre éditions)');
{
  const e99 = { name: 'Pump 99', style: 'pump', morceaux: [{ id: 'a', name: '01 Echauffement' }, { id: 'b', name: '02 Squats' }, { id: 'c', name: '03 Pecs' }] };
  const e100 = { name: 'Pump 100', style: 'pump', morceaux: [{ id: 'x', name: 'Échauffement' }, { id: 'l', name: 'perdu', lost: true }, { id: 'y', name: 'Squats' }] };
  const e101 = { name: 'Pump 101', style: 'pump', morceaux: [{ id: 'u', name: 'Intro' }, { id: 'v', name: '2 - Squats (Remix)' }] };
  const n99 = C.morceauNumber(e99.morceaux[1], e99.morceaux), n100 = C.morceauNumber(e100.morceaux[2], e100.morceaux), n101 = C.morceauNumber(e101.morceaux[1], e101.morceaux);
  ok(n99 === 2 && n100 === 2 && n101 === 2 && C.numLabel(n99) === '02', 'numéro du morceau : en tête du titre, sinon sa place (morceaux perdus ignorés) → 02, 02, 02');
  ok(C.morceauNumber(e99.morceaux[2], e99.morceaux) === 3 && C.morceauNumber(e100.morceaux[0], e100.morceaux) === 1, 'autres numéros (03, 01)');
  const favs = {};
  C.setFavs(favs, 'pump', n99, ['Squat', 'Fentes', 'Curl biceps', 'Descente lever']);
  ok(C.getFavs(favs, 'pump', n100).length === 4 && C.getFavs(favs, 'pump', n101).length === 4, 'favoris choisis sur le 02 de Pump 99 → aussi sur le 02 de Pump 100 et Pump 101');
  ok(C.getFavs(favs, 'pump', 3).length === 0 && C.getFavs(favs, 'combat', 2).length === 0, 'pas sur un autre numéro ni un autre style');
  const all = C.MOVES.pump.filter((n) => n !== 'Pause').concat(['Mon move']);
  const mb = C.moveButtons({ all, quick: C.QUICK.pump, favs: C.getFavs(favs, 'pump', n100) });
  ok(mb.fav && mb.main.join('|') === 'Curl biceps|Squat|Descente lever|Fentes', 'en gros : seulement les favoris, dans l\'ordre de la liste (' + mb.main.join(', ') + ')');
  ok(mb.rest.length === all.length - 4 && mb.total === all.length && mb.rest.includes('Mon move') && mb.rest.includes('Gainage'), 'les autres restent dans « ▼ Tous (' + mb.total + ') »');
  const d = C.moveButtons({ all, quick: C.QUICK.pump, favs: C.getFavs(favs, 'pump', 5) });
  ok(!d.fav && d.main.join('|') === C.QUICK.pump.join('|'), 'sans favoris : les 15 boutons rapides par défaut');
  C.setFavs(favs, 'pump', 2, ['Mon move', 'Gainage']);
  const m2 = C.moveButtons({ all, quick: C.QUICK.pump, favs: C.getFavs(favs, 'pump', 2) });
  ok(m2.main.join('|') === 'Gainage|Mon move', 'favoris pris dans « Tous » et mes mouvements');
  C.setFavs(favs, 'pump', 2, []); ok(!('2' in favs.pump), 'tout décocher : retour à l\'affichage par défaut');
  const st = C.moveButtons({ all: ['A', 'B', 'C'], quick: null, favs: [], first: 2 }); ok(st.main.join() === 'A,B' && st.rest.join() === 'C', 'autre style sans liste rapide : comme avant (les premiers, puis « Tous »)');
  ok(JSON.parse(JSON.stringify({ favs: C.setFavs({}, 'pump', 2, ['Squat']) })).favs.pump['2'][0] === 'Squat', 'favoris enregistrables dans la sauvegarde (JSON)');
}

/* ---------- 18. Script en texte libre ---------- */
section('18. Script en texte libre : analyse d\'une ligne, migration, jeu');
{
  const P = (t) => C.parseLine(t);
  const sig = (p) => p.parts.map((x) => x.t + ':' + x.s).join(' | ');
  const cases = [
    ['Squat × 8 (2-2)', 8, '2-2', 'Squat'], ['Squat x8 2/2', 8, '2-2', 'Squat'], ['Squat X 8 2 2', 8, '2-2', 'Squat'],
    ['Squat 8x (1-1)', 8, '1-1', 'Squat'], ['Squat 8 fois 3-1', 8, '3-1', 'Squat'], ['Squat × 16 1-1', 16, '1-1', 'Squat'],
    ['Fentes ×4 1/3', 4, '1-3', 'Fentes'], ['Pompes × 8 4-4', 8, '4-4', 'Pompes'], ['Squat × 8 BB 2-2', 8, 'BB 2-2', 'Squat'],
    ['Squat ×8 bb 2/2', 8, 'BB 2-2', 'Squat'], ['3 pulses × 4', 4, '3 pulses', ''], ['Squat × 2 8 pulses', 2, '8 pulses', 'Squat'],
    ['Squat pulses × 16', 16, 'pulses', 'Squat'], ['Enroule les épaules × 4', 4, 'Enroule les épaules', ''], ['Descente tirage × 8 (Pause)', 8, 'Pause', 'Descente tirage']
  ];
  const bad = cases.filter(([t, r, tp, n]) => { const p = P(t); return !(p.kind === 'move' && p.reps === r && p.tempo === tp && p.name === n); });
  ok(!bad.length, cases.length + ' écritures de répétitions et tempos reconnues' + (bad.length ? ' — ratées : ' + bad.map((b) => b[0] + ' → ' + sig(P(b[0]))).join(' / ') : ''));
  ok(sig(P('Squat × 8 (2-2)')) === 'name:Squat | reps:× 8 | tempo:2-2', 'parenthèses rangées, texte gardé tel qu\'écrit (« × 8 », « 2-2 »)');
  ok(P('Squat × 8 (2-2)').beats === 4 && P('Squat × 8 1-1').beats === 2 && P('Squat × 8 4-4').beats === 8 && P('3 pulses × 4').beats === 4 && P('x 8 pulses ×2').beats === 8, 'temps par répétition : 2-2 = 4, 1-1 = 2, 4-4 = 8, 3 pulses = 4, 8 pulses = 8');
  ok(P('Pause').kind === 'pause' && P('pause 30 s').kind === 'pause' && P('Transition vers fentes').kind === 'pause' && P('Transition').raw === 'Transition', '« Pause » et « Transition » : lignes à part');
  const keep = ['Attention garder le dos droit', 'Squat', 'Bras en haut, on respire', 'Squat 16 1:30', '🔥 Le final !!'];
  ok(keep.every((t) => { const p = P(t); return p.kind === 'text' && p.parts.length === 1 && p.parts[0].s === t && !p.reps && !p.tempo; }), 'lignes non reconnues gardées telles quelles (rien inventé)');
  const lt = P('Descente lever × 16 (2-2) – dos droit');
  ok(lt.name === 'Descente lever' && lt.parts.some((x) => x.t === 'txt' && x.s === 'dos droit'), 'note après le tempo gardée (« dos droit »)');
  ok(P('Squat 16 2-2').name === 'Squat 16' && P('Squat 16 2-2').reps === 0, '« 16 » sans × ni « fois » : pas pris pour des répétitions (gardé dans le texte)');
  ok(P('Développé 2-2-1').tempo === '' && P('Rang 12-12').tempo === '', 'pas de faux tempo dans « 2-2-1 » ou « 12-12 »');
  ok(P('   ').kind === 'blank' && P('').kind === 'blank' && P(null).kind === 'blank', 'ligne vide = séparation de blocs');
  const bl = C.parseScript('Squat × 8 (2-2)\nSquat × 16 1-1\n\n\nPause\n3 pulses × 4\n');
  ok(bl.length === 2 && bl[0].length === 2 && bl[1].length === 2 && bl[1][1].n === 4, 'lignes vides → 2 blocs, numéros continus 1 à 4');
  ok(C.textCount('a\n\n b \n\n') === 2 && C.textCount('') === 0, 'compte des lignes écrites (sans les vides)');
  // migration
  const old = [
    { id: 'l1', kind: 'move', name: 'Squat', reps: 16, tempo: '2-2', note: '', t: 310 },
    { id: 'l2', kind: 'pause', name: 'Pause', reps: 0, tempo: '', note: '', t: 340 },
    { id: 'l3', kind: 'move', name: 'Descente lever', reps: 8, tempo: '8 pulses', note: 'dos droit', t: 352 },
    { id: 'l4', kind: 'trans', name: '', reps: 0, tempo: '', t: null },
    { id: 'l5', kind: 'move', name: 'Fentes', reps: 0, tempo: '—', t: null }];
  const txt = C.linesToText(old);
  ok(txt === 'Squat × 16 (2-2)\nPause\nDescente lever × 8 (8 pulses) – dos droit\nTransition\nFentes', 'ancien format → texte, une ligne par mouvement, sans heure :\n      ' + txt.split('\n').join('\n      '));
  const re = C.parseLine(txt.split('\n')[0]);
  ok(re.name === 'Squat' && re.reps === 16 && re.tempo === '2-2', 'le texte migré se relit (Squat × 16, 2-2)');
  const cm = { id: 'c', name: 'Pump 97', style: 'pump', folder: 'pump', version: 3, morceaux: [{ id: 'a', name: '01', lines: old.map((l) => Object.assign({}, l)) }, { id: 'b', name: '02', lines: [] }, { id: 'd', name: '03', text: 'Mon texte', lines: [{ id: 'z', kind: 'move', name: 'Squat', reps: 4, tempo: '1-1' }] }, { id: 'e', name: '04', segments: [{ name: 'Rowing', reps: 8, tempo: '2/2', start: 3 }] }] };
  ok(C.migrateCourse(cm, C.BASE_FOLDERS, () => 'id') === true, 'migration du cours faite');
  ok(cm.morceaux[0].text === txt && cm.morceaux[0].textOk === false && cm.morceaux[0].lines.length === 5 && cm.morceaux[0].lines[0].t === 310, 'texte rempli, ancien format gardé à côté (5 lignes, heures)');
  ok(cm.morceaux[1].text === undefined && C.textOf(cm.morceaux[1]) === '', 'morceau vide : rien à écrire');
  ok(cm.morceaux[2].text === 'Mon texte', 'texte déjà écrit : jamais écrasé');
  ok(cm.morceaux[3].text === 'Descente tirage × 8 (2-2)', 'très ancien script (analyse) : renommé puis converti (« ' + cm.morceaux[3].text + ' »)');
  const again = JSON.stringify(cm); C.migrateCourse(cm, C.BASE_FOLDERS, () => 'id');
  ok(JSON.stringify(cm) === again, 'la migration ne se refait pas');
  ok(C.textOf({ lines: old }) === txt && C.textOf({ text: '', lines: old }) === '', 'textOf : texte libre d\'abord (même vide), sinon l\'ancien format');
  // jeu
  const pl = C.textPlayLines('Squat × 8 (2-2)\nBras en haut\n\nPause\nFentes × 4 1-1\n3 pulses × 4', 120);
  ok(pl.length === 5 && pl[0].dur === 16 && pl[0].repDur === 2 && pl[1].dur === null && pl[2].dur === null && pl[3].dur === 4 && pl[4].dur === 8, 'jeu à 120 BPM : 8 × 2-2 = 16 s, 4 × 1-1 = 4 s, 4 × 3 pulses = 8 s ; texte et pause : au toucher');
  ok(C.textPlayLines('Squat × 8 (2-2)', null)[0].dur === null && C.textPlayLines('Squat (2-2)', 120)[0].dur === null && C.textPlayLines('Squat × 8', 120)[0].dur === null, 'sans BPM, sans répétitions ou sans tempo : au toucher');
  let crash = null; try { for (const t of ['', '\n\n', '×××', '((((', '2-2-2-2', 'x', '0 fois', '999x 4/4 bb', '💪🔥', 'a'.repeat(5000), 'Pause\u0000', undefined]) C.textPlayLines(t, 128); } catch (e) { crash = e; }
  ok(!crash && C.textPlayLines('0 fois 2-2', 120)[0].dur === null, 'texte libre bizarre : jamais d\'erreur' + (crash ? ' (' + crash.message + ')' : ''));
}

console.log(`\n${passes} réussis, ${fails} échoués`);
process.exit(fails ? 1 : 0);
