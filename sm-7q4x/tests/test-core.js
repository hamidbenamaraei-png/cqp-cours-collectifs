/* Tests unitaires : node sm-7q4x/tests/test-core.js */
'use strict';
const C = require('../core.js');
const S = require('./synth.js');
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) { passes++; console.log('  ✓ ' + msg); } else { fails++; console.log('  ✗ ' + msg); } }
function section(t) { console.log('\n' + t); }

/* ---------- 1. Comptage sur sinusoïdes ---------- */
section('1. Comptage de répétitions (sinusoïdes bruitées)');
const r = S.rng(3);
for (const [period, amp, noise, reps] of [[2, 2, 0.15, 16], [1, 1.2, 0.15, 16], [3.7, 3, 0.3, 8], [0.9, 0.9, 0.12, 24], [2.5, 1.5, 0.35, 12]]) {
  const fps = 8, n = Math.round((reps * period + 1) * fps), x = new Float64Array(n);
  for (let i = 0; i < n; i++) { const t = i / fps - 0.5; x[i] = (t < 0 || t > reps * period ? 0 : amp * (0.5 - 0.5 * Math.cos(2 * Math.PI * t / period))) + noise * S.gauss(r) + 0.2 * Math.sin(i / 50); }
  const c = C.countReps(x, fps);
  ok(c.count === reps, `période ${period}s amplitude ${amp} bruit ${noise} : ${c.count} / ${reps}`);
}
// signal plat → 0
{ const x = new Float64Array(200); for (let i = 0; i < 200; i++) x[i] = 0.08 * S.gauss(r); ok(C.countReps(x, 8).count === 0, 'signal immobile → 0 répétition'); }

/* ---------- 2. Mouvement lent 3/1 ---------- */
section('2. Tempo lent 3/1 et 2/2');
for (const [tempo, label] of [[[3, 1], '3/1'], [[2, 2], '2/2'], [[1, 1], 'single']]) {
  const bpm = 130, beat = 60 / bpm, period = (tempo[0] + tempo[1]) * beat, fps = 10, reps = 8;
  const n = Math.round((reps * period + 1) * fps), x = new Float64Array(n);
  for (let i = 0; i < n; i++) { const t = i / fps - 0.5; x[i] = (t < 0 || t >= reps * period ? 0 : -3 * S.cyc(t / period, tempo)) + 0.1 * S.gauss(r); }
  const c = C.countReps(x, fps);
  const st = c.rests.map((i) => i / fps), pk = c.peaks.map((i) => i / fps);
  const tl = C.tempoLabel(st, pk, bpm);
  ok(c.count === reps && tl === label, `${label} : ${c.count} rép., tempo trouvé « ${tl} »`);
}

/* ---------- 3. Enchaînement squat 16 → rowing 8 → curl 8 ---------- */
function runSeq(plan, opt) {
  opt = opt || {};
  const prog = S.program(plan, { seed: opt.seed || 11, noise: opt.noise, second: false });
  const fps = opt.fps || 8, times = [], feats = [];
  for (let t = 0; t < prog.total; t += 1 / fps + (opt.jitter ? (S.gauss(r) * 0.01) : 0)) {
    const p = prog.poses(t)[0]; times.push(t);
    if (opt.drop && Math.floor(t * 3) % 41 === 7) { for (let k = 0; k < C.NF; k++) feats.push(NaN); continue; }
    feats.push(...C.poseFeatures(p.img, p.world, 16 / 9));
  }
  const seq = C.resample(Float64Array.from(times), Float64Array.from(feats), fps);
  return { seq, segs: C.buildScript(seq, { style: 'pump', fingerprints: opt.fps_ || [], bpm: 130 }), prog };
}
section('3. Enchaînement squat 16 → rowing 8 → curl 8');
{
  const plan = [{ move: 'squat', reps: 16, period: 2 }, { move: 'row', reps: 8, period: 2 }, { move: 'curl', reps: 8, period: 2 }];
  for (const o of [{ seed: 11 }, { seed: 5, noise: 0.02, jitter: true }, { seed: 9, drop: true, fps: 6 }]) {
    const { segs } = runSeq(plan, o);
    const main = segs.filter((s) => s.reps > 0);
    console.log('    → ' + segs.map((s, i) => C.segLine(s, i) + ` [${s.start}-${s.end}s, conf ${s.conf}]`).join(' | '));
    ok(main.length === 3 && main[0].name === 'Squat' && main[0].reps === 16 && main[1].name === 'Rowing' && main[1].reps === 8 && main[2].name === 'Curl biceps' && main[2].reps === 8,
      `réglages ${JSON.stringify(o)} : ${main.map((s) => s.name + ' ' + s.reps).join(', ')}`);
    if (o.seed === 11) {
      ok(Math.abs(main[0].start - 2) < 1.5 && Math.abs(main[1].start - 35.5) < 2 && Math.abs(main[2].start - 53) < 2, `débuts ≈ 2 s / 35,5 s / 53 s : ${main.map((s) => s.start).join(' / ')}`);
      const rt = main[0].repTimes; ok(rt.length === 16 && Math.abs(rt[1] - rt[0] - 2) < 0.4, `temps de chaque répétition (écart ${(rt[1] - rt[0]).toFixed(2)} s)`);
    }
  }
}
section('3b. Squat 2/2 puis squat single (changement de tempo)');
{
  const beat = 60 / 130;
  const { segs } = runSeq([{ move: 'squat', reps: 8, period: 4 * beat, tempo: [2, 2] }, { move: 'squat', reps: 16, period: 2 * beat }], { seed: 4 });
  console.log('    → ' + segs.map((s, i) => C.segLine(s, i)).join(' | '));
  const tot = segs.reduce((a, s) => a + (s.name === 'Squat' ? s.reps : 0), 0);
  ok(tot === 24, `total squats = ${tot} / 24`);
  const mv = segs.filter((s) => s.reps > 0);
  ok(mv.length === 2 && mv[0].reps === 8 && mv[0].tempo === '2/2' && mv[1].reps === 16 && mv[1].tempo === 'single', `passages : ${mv.map((s) => s.reps + ' ' + s.tempo).join(', ')} (attendu 8 2/2, 16 single)`);
}

section('3c. Robustesse : 2 enchaînements × 10 tirages × 8 et 10 images/s');
{
  const plans = [[{ move: 'squat', reps: 16, period: 2 }, { move: 'row', reps: 8, period: 2.2 }, { move: 'curl', reps: 8, period: 1.8 }],
    [{ move: 'curl', reps: 12, period: 2 }, { move: 'squat', reps: 8, period: 3 }, { move: 'row', reps: 16, period: 1.2 }]];
  const want = ['Squat 16, Rowing 8, Curl biceps 8', 'Curl biceps 12, Squat 8, Rowing 16'];
  let good = 0, tot = 0;
  for (const k of [0, 1]) for (let seed = 1; seed <= 10; seed++) for (const fps of [8, 10]) {
    tot++;
    const prog = S.program(plans[k], { seed, noise: 0.012 + 0.01 * (seed % 3), lead: 1 + seed % 4, trans: 0.8 + 0.3 * (seed % 4) });
    const times = [], feats = [];
    for (let t = 0; t < prog.total; t += 1 / fps) { const p = prog.poses(t)[0]; times.push(t); feats.push(...C.poseFeatures(p.img, p.world, 16 / 9)); }
    const segs = C.buildScript(C.resample(times, feats, fps), { style: 'pump' }).filter((s) => s.reps > 0);
    if (segs.map((s) => s.name + ' ' + s.reps).join(', ') === want[k]) good++;
  }
  ok(good >= tot - 1, `${good} / ${tot} scripts parfaits`);
}

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

/* ---------- 5. Empreintes (apprentissage) ---------- */
section('5. Apprentissage par empreintes');
{
  const plan = [{ move: 'squat', reps: 12, period: 2 }, { move: 'curl', reps: 8, period: 2 }];
  const a = runSeq(plan, { seed: 21 });
  const curl = a.segs.find((s) => s.name === 'Curl biceps');
  ok(!!curl, 'curl reconnu par les règles avant correction');
  // Hamid corrige : ce passage s'appelle « Curl marteau »
  const fps_ = [{ style: 'pump', name: 'Curl marteau', vec: curl.vec }];
  const b = runSeq(plan, { seed: 77, noise: 0.018, fps_ });
  console.log('    → après correction : ' + b.segs.map((s, i) => C.segLine(s, i) + ' (' + s.source + ')').join(' | '));
  ok(b.segs.some((s) => s.name === 'Curl marteau' && s.source === 'appris' && s.reps === 8), 'nouvelle vidéo : « Curl marteau × 8 » reconnu grâce à l\'empreinte');
  ok(b.segs.some((s) => s.name === 'Squat' && s.reps === 12), 'le squat n\'est pas touché');
  const nn = C.nearest(curl.vec, fps_, 'combat'); ok(nn === null, 'les empreintes Pump ne servent pas pour Combat');
}

/* ---------- 6. Suivi de la personne ---------- */
section('6. Suivi de la personne (2 personnes, ordre mélangé)');
{
  const prog = S.program([{ move: 'squat', reps: 6, period: 2 }], { second: true, seed: 3 });
  const st = { box: null }; let good = 0, tot = 0;
  const first = prog.poses(0).map((p) => C.poseBox(p.img)); st.box = first[0]; st.lastT = 0;
  for (let t = 0.125; t < prog.total; t += 0.125) {
    let ps = prog.poses(t); const swap = Math.floor(t * 5) % 3 === 0; if (swap) ps = ps.slice().reverse();
    if (Math.floor(t) === 6) ps = []; // disparition 1 s
    const k = C.trackStep(st, ps.map((p) => C.poseBox(p.img)), t, 16 / 9);
    if (ps.length) { tot++; if (k === (swap ? 1 : 0)) good++; }
  }
  ok(good === tot, `prof suivi sur ${good} / ${tot} images (avec une disparition d'1 s)`);
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

/* ---------- 10. Fusion de groupe ---------- */
section('10. (d) Tout le groupe : 5 personnes (1 en retard, 1 variante, 1 masquée par moments)');
{
  const plan = [{ move: 'squat', reps: 16, period: 2 }, { move: 'row', reps: 8, period: 2 }, { move: 'curl', reps: 8, period: 2 }];
  const plan2 = [{ move: 'curl', reps: 16, period: 2 }, { move: 'press', reps: 8, period: 2 }, { move: 'squat', reps: 8, period: 2 }];
  for (const seed of [30, 50]) {
    const cams = [0.12, 0.31, 0.5, 0.69, 0.88];
    const progs = cams.map((cx, k) => S.program(k === 3 ? plan2 : plan, { seed: seed + k, noise: 0.012, cam: { cx, cy: 0.75, s: 0.16 }, yaw: 10 + 8 * k }));
    const fps = 8, rr = S.rng(seed), total = progs[0].total + 1;
    const tracker = new C.MultiTracker(16 / 9), times = [], per = {}; let nF = 0, swaps = 0;
    for (let t = 0; t < total; t += 1 / fps) {
      const ps = [];
      progs.forEach((pg, k) => {
        if (k === 4 && (Math.floor(t / 3) % 3 === 1)) return; // masquée 1/3 du temps
        ps.push({ k, p: pg.poses(Math.max(0, k === 2 ? t - 0.8 : t))[0] }); // n° 2 : 0,8 s en retard
      });
      for (let i = ps.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); [ps[i], ps[j]] = [ps[j], ps[i]]; }
      const ids = tracker.step(ps.map((x) => C.poseBox(x.p.img)), t); times.push(t);
      ids.forEach((id, i) => { if (!per[id]) per[id] = { k: ps[i].k, f: new Array(nF * C.NF).fill(NaN) }; });
      for (const id in per) { const i = ids.indexOf(+id); if (i >= 0) { if (per[id].k !== ps[i].k) swaps++; per[id].f.push(...C.poseFeatures(ps[i].p.img, ps[i].p.world, 16 / 9)); } else for (let q = 0; q < C.NF; q++) per[id].f.push(NaN); }
      nF++;
    }
    ok(Object.keys(per).length === 5 && swaps === 0, `suivi : ${Object.keys(per).length} personnes, ${swaps} échange(s)`);
    const tracks = Object.keys(per).map((id) => ({ id: +id, feats: Float32Array.from(per[id].f) }));
    const seq = C.fuseGroup({ fps, times, tracks });
    const kOf = (id) => per[id].k, sh = {}; seq.group.ids.forEach((id, i) => { sh[kOf(id)] = seq.group.share[i]; });
    const segs = C.buildScript(seq, { style: 'pump' }).filter((s) => s.reps > 0);
    ok(segs.map((s) => s.name + ' ' + s.reps).join(', ') === 'Squat 16, Rowing 8, Curl biceps 8', `tirage ${seed} : ${segs.map((s) => s.name + ' ' + s.reps).join(', ')} (utilisées : ${JSON.stringify(sh)})`);
    ok(sh[2] < 0.2 && sh[3] < 0.2 && sh[0] > 0.8 && sh[1] > 0.8, 'la personne en retard et celle qui fait une variante sont écartées');
  }
  // fusion des zones : une même personne vue dans 2 zones ne compte qu'une fois
  const prog = S.program([{ move: 'squat', reps: 2, period: 2 }], { cam: { cx: 0.5, cy: 0.8, s: 0.2 } });
  const p = prog.poses(1)[0].img;
  const rA = { x: 0.3, y: 0, w: 0.42, h: 1 }, rB = { x: 0.29, y: 0.1, w: 0.42, h: 0.9 };
  const toRect = (lm, r) => lm.map((q) => ({ x: (q.x - r.x) / r.w, y: (q.y - r.y) / r.h, z: q.z / r.w, visibility: 0.9 }));
  const back = C.mapFromRect(toRect(p, rA), rA);
  ok(Math.abs(back[11].x - p[11].x) < 1e-9 && Math.abs(back[11].y - p[11].y) < 1e-9, 'coordonnées d\'une zone agrandie ramenées dans l\'image');
  const other = S.program([{ move: 'squat', reps: 2, period: 2 }], { cam: { cx: 0.2, cy: 0.8, s: 0.2 } }).poses(1)[0].img;
  const mg = C.mergeDetections([{ lm: C.mapFromRect(toRect(p, rA), rA), rect: rA }, { lm: C.mapFromRect(toRect(p, rB), rB), rect: rB }, { lm: other, rect: { x: 0, y: 0, w: 1, h: 1 } }]);
  ok(mg.length === 2, `doublons retirés : ${mg.length} personnes (attendu 2)`);
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

console.log(`\n${passes} réussis, ${fails} échoués`);
process.exit(fails ? 1 : 0);
