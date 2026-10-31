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

console.log(`\n${passes} réussis, ${fails} échoués`);
process.exit(fails ? 1 : 0);
