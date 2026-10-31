/* Bonhomme 3D synthétique pour les tests (squat, rowing, curl, etc.) */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.SMSynth = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const D2R = Math.PI / 180;
  // graine aléatoire reproductible
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); }

  /** phase de répétition 0→1→0. tempo [a,b] = proportion aller / retour */
  function cyc(u, tempo) {
    const a = tempo ? tempo[0] / (tempo[0] + tempo[1]) : 0.5;
    u = u - Math.floor(u);
    if (u < a) return 0.5 - 0.5 * Math.cos(Math.PI * u / a);
    return 0.5 + 0.5 * Math.cos(Math.PI * (u - a) / (1 - a));
  }

  /** Paramètres de posture pour un mouvement à la phase c (0..1) */
  function params(move, c, side) {
    const p = { kneeFlex: 0, tilt: 0, arms: [{ phi: 5, alpha: 5, psi: 8 }, { phi: 5, alpha: 5, psi: 8 }], lunge: 0, liftL: 0 };
    switch (move) {
      case 'squat': p.kneeFlex = 100 * c; p.tilt = 8 + 30 * c; p.arms = [{ phi: 25, alpha: 160, psi: 60 }, { phi: 25, alpha: 160, psi: 60 }]; break;
      case 'row': p.kneeFlex = 25; p.tilt = 50; p.arms = [0, 1].map(() => ({ phi: -5 - 75 * c, alpha: 50 - 40 * c, psi: 10 })); break;
      case 'curl': p.arms = [0, 1].map(() => ({ phi: 5 + 10 * c, alpha: 8 + 140 * c, psi: 6 })); break;
      case 'press': p.arms = [0, 1].map(() => ({ phi: 0, alpha: 0, psi: 85 + 80 * c, up: true, elbow: 95 - 90 * c })); break;
      case 'idle': default: break;
    }
    void side; return p;
  }

  function lerpP(a, b, u) {
    const L = (x, y) => x + (y - x) * u;
    return { kneeFlex: L(a.kneeFlex, b.kneeFlex), tilt: L(a.tilt, b.tilt), lunge: 0, liftL: 0,
      arms: a.arms.map((q, i) => ({ phi: L(q.phi, b.arms[i].phi), alpha: L(q.alpha, b.arms[i].alpha), psi: L(q.psi, b.arms[i].psi) })) };
  }
  /** Squelette 3D (mètres, y vers le haut, z vers la caméra) */
  function skeleton(p, x0) {
    x0 = x0 || 0;
    const shin = 0.43, thigh = 0.45, torso = 0.52, shw = 0.19, hw = 0.13, ua = 0.3, fa = 0.28;
    const j = {};
    const kf = p.kneeFlex * D2R;
    for (const [s, sx] of [['L', 1], ['R', -1]]) {
      const ax = x0 + sx * hw * 1.05, az = 0;
      const A = [ax, 0.08, az];
      const K = [ax, A[1] + shin * Math.cos(kf / 2), az + shin * Math.sin(kf / 2)];
      const H = [ax, K[1] + thigh * Math.cos(kf / 2), K[2] - thigh * Math.sin(kf / 2)];
      j['A' + s] = A; j['K' + s] = K; j['H' + s] = H; j['F' + s] = [ax, 0.02, az + 0.15];
    }
    const hc = [(j.HL[0] + j.HR[0]) / 2, (j.HL[1] + j.HR[1]) / 2, (j.HL[2] + j.HR[2]) / 2];
    const t = p.tilt * D2R;
    const sc = [hc[0], hc[1] + torso * Math.cos(t), hc[2] + torso * Math.sin(t)];
    j.SL = [sc[0] + shw, sc[1], sc[2]]; j.SR = [sc[0] - shw, sc[1], sc[2]];
    j.N = [sc[0], sc[1] + 0.2 * Math.cos(t), sc[2] + 0.2 * Math.sin(t) + 0.04];
    p.arms.forEach((a, k) => {
      const s = k === 0 ? 'L' : 'R', sx = k === 0 ? 1 : -1, S = j['S' + s];
      let E, W;
      if (a.up) { // bras en abduction dans le plan frontal (développé)
        const g = a.psi * D2R; E = [S[0] + sx * ua * Math.sin(g), S[1] - ua * Math.cos(g), S[2]];
        const fe = (a.psi - 180 + a.elbow) * D2R;
        void fe; const e2 = Math.min(180, a.psi + (180 - a.elbow)) * D2R;
        W = [E[0] + sx * fa * Math.sin(e2) * 0.3, E[1] + fa * Math.abs(Math.cos(Math.PI - e2)) * (a.psi + 180 - a.elbow > 90 ? 1 : -1), E[2]];
      } else {
        const ph = a.phi * D2R, ps = a.psi * D2R, al = a.alpha * D2R;
        E = [S[0] + sx * ua * Math.sin(ps) * 0.6, S[1] - ua * Math.cos(ph) * Math.cos(ps * 0.6), S[2] + ua * Math.sin(ph)];
        W = [E[0] + sx * fa * Math.sin(ps) * 0.25, E[1] - fa * Math.cos(al), E[2] + fa * Math.sin(al)];
      }
      j['E' + s] = E; j['W' + s] = W;
    });
    return j;
  }

  const MAP = { 0: 'N', 11: 'SL', 12: 'SR', 13: 'EL', 14: 'ER', 15: 'WL', 16: 'WR', 23: 'HL', 24: 'HR', 25: 'KL', 26: 'KR', 27: 'AL', 28: 'AR', 31: 'FL', 32: 'FR', 29: 'AL', 30: 'AR' };
  function toLandmarks(j, cam, r, noise) {
    const cy = Math.cos(cam.yaw * D2R), sy = Math.sin(cam.yaw * D2R);
    const hc = [(j.HL[0] + j.HR[0]) / 2, (j.HL[1] + j.HR[1]) / 2, (j.HL[2] + j.HR[2]) / 2];
    const img = [], world = [];
    for (let i = 0; i < 33; i++) {
      let key = MAP[i]; if (!key) key = i < 11 ? 'N' : (i % 2 ? 'WL' : 'WR');
      if (i >= 17 && i <= 22) key = i % 2 ? 'WL' : 'WR';
      const q = j[key];
      const nz = () => (noise ? gauss(r) * noise : 0);
      const x = q[0] + nz(), y = q[1] + nz(), z = q[2] + nz();
      const rx = x * cy + z * sy, rz = -x * sy + z * cy;
      img.push({ x: cam.cx + rx * cam.s / cam.aspect, y: cam.cy - y * cam.s, z: -rz * cam.s, visibility: 0.95 });
      const wx = (x - hc[0]), wz = (z - hc[2]);
      world.push({ x: wx * cy + wz * sy, y: -(y - hc[1]), z: -(-wx * sy + wz * cy), visibility: 0.95 });
    }
    return { img, world };
  }

  /** Programme : [{move, reps, period, tempo:[a,b]}]. Renvoie une fonction t → [{img, world}] (prof d'abord) */
  function program(plan, opt) {
    opt = opt || {};
    const r = rng(opt.seed || 7);
    const lead = opt.lead == null ? 2 : opt.lead, trans = opt.trans == null ? 1.5 : opt.trans;
    const parts = []; let t = 0;
    parts.push({ move: 'idle', t0: 0, t1: lead });
    t = lead;
    for (const p of plan) {
      const d = p.reps * p.period; parts.push(Object.assign({}, p, { t0: t, t1: t + d })); t += d;
      parts.push({ move: 'idle', t0: t, t1: t + trans }); t += trans;
    }
    const total = t;
    const cam = Object.assign({ cx: 0.5, cy: 0.88, s: 0.42, yaw: opt.yaw == null ? 25 : opt.yaw, aspect: opt.aspect || 16 / 9 }, opt.cam || {});
    const cam2 = { cx: 0.2, cy: 0.62, s: 0.22, yaw: 10, aspect: cam.aspect };
    function at(time, who) {
      const part = parts.find((q) => time >= q.t0 && time < q.t1) || parts[parts.length - 1];
      let c = 0, p;
      if (part.move !== 'idle') { c = cyc((time - part.t0) / part.period, part.tempo); p = params(part.move, c); }
      else {
        // transition douce entre la position de départ du mouvement d'avant et celle d'après
        const k = parts.indexOf(part), prev = parts[k - 1], next = parts[k + 1];
        const pa = params(prev ? prev.move : 'idle', 0), pb = params(next ? next.move : 'idle', 0);
        let u = (time - part.t0) / Math.max(0.01, part.t1 - part.t0); u = u * u * (3 - 2 * u);
        p = lerpP(pa, pb, Math.max(0, Math.min(1, u)));
      }
      const j = skeleton(p, 0);
      return toLandmarks(j, who === 2 ? cam2 : cam, r, opt.noise == null ? 0.012 : opt.noise);
    }
    return {
      total, parts,
      poses(time) { const out = [at(time, 1)]; if (opt.second) out.push(at(time - 0.4, 2)); return out; }
    };
  }
  /** Morceau de musique synthétique (Float32Array) : batterie, basse, accords, mélodie, ponts sans grosse caisse.
      seed = arrangement ; bpm ; dur (s) ; sr ; intro (s de nappes sans batterie au début) */
  function song(opt) {
    const r = rng(opt.seed || 1), sr = opt.sr || 8000, bpm = opt.bpm || 128, dur = opt.dur || 180;
    const beat = 60 / bpm, n = Math.round(dur * sr), out = new Float32Array(n);
    const nb = Math.ceil(dur / beat) + 1;
    const roots = [110, 123.5, 98, 130.8, 87.3, 146.8, 116.5, 103.8];
    const prog = []; for (let b = 0; b < nb / 16 + 2; b++) prog.push(roots[Math.floor(r() * roots.length)]);
    // structure : ponts (pas de grosse caisse) de 8 à 16 temps
    const brk = new Uint8Array(nb); const intro = Math.round((opt.intro || 0) / beat);
    for (let b = 0; b < intro && b < nb; b++) brk[b] = 1;
    for (let b = intro + 32; b < nb - 32; b += 32 + Math.floor(r() * 64)) { const L = 8 + 8 * Math.floor(r() * 2); for (let k = 0; k < L && b + k < nb; k++) brk[b + k] = 1; b += L; }
    const mel = []; for (let b = 0; b < nb * 2; b++) mel.push(r() < 0.55 ? [1, 1.25, 1.5, 2, 2.25, 3][Math.floor(r() * 6)] : 0);
    const fill = []; for (let b = 0; b < nb; b++) fill.push(r() < 0.12);
    let ph = 0, phb = 0, phm = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr, bi = Math.floor(t / beat), bt = t - bi * beat;
      const root = prog[Math.floor(bi / 16)] || 110, br = brk[bi] === 1;
      ph += 2 * Math.PI * root * 2 / sr; phb += 2 * Math.PI * root / 2 / sr;
      const h8 = Math.floor(t / (beat / 2)); const m = mel[h8] || 0; phm += 2 * Math.PI * root * 4 * (m || 1) / sr;
      const kick = br ? 0 : Math.exp(-bt * 28) * Math.sin(2 * Math.PI * (50 + 60 * Math.exp(-bt * 40)) * bt) * 0.9;
      const bass = br ? 0 : 0.25 * Math.sin(phb) * Math.min(1, ((t + beat / 2) % beat) / 0.05) * Math.exp(-((t + beat / 2) % beat) * 4);
      const hat = (((t + beat / 2) % beat) < 0.025 || (fill[bi] && (bt % (beat / 4)) < 0.02)) ? (r() * 2 - 1) * 0.18 : 0;
      const snare = (!br && bi % 2 === 1 && bt < 0.12) ? (r() * 2 - 1) * 0.3 * Math.exp(-bt * 22) : 0;
      const pad = 0.1 * (Math.sin(ph) + 0.5 * Math.sin(ph * 1.5)) * (br ? 1.6 : 1);
      const lead = m ? 0.08 * Math.sin(phm) * Math.exp(-((t % (beat / 2)) * 6)) : 0;
      out[i] = kick + bass + hat + snare + pad + lead;
    }
    return out;
  }
  /** « Voix » du prof : bruit filtré en syllabes, avec des pauses */
  function voice(n, sr, seed, level) {
    const r = rng(seed || 9), out = new Float32Array(n); let lp = 0, bp = 0, f0ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr; const syl = Math.max(0, Math.sin(2 * Math.PI * 4.3 * t + Math.sin(t))) * (Math.sin(2 * Math.PI * t / 13) > -0.3 ? 1 : 0);
      f0ph += 2 * Math.PI * (130 + 30 * Math.sin(t * 1.7)) / sr;
      const nn = r() * 2 - 1; lp += 0.3 * (nn - lp); bp = lp - bp * 0.2;
      out[i] = ((0.5 * Math.sign(Math.sin(f0ph)) * 0.3 + bp) * syl * 0.6 + 0.03 * (r() * 2 - 1)) * (level == null ? 1 : level);
    }
    return out;
  }
  /** Change la vitesse (rééchantillonnage linéaire) : speed > 1 = plus rapide */
  function speed(x, s) {
    const n = Math.floor((x.length - 1) / s), o = new Float32Array(n);
    for (let i = 0; i < n; i++) { const p = i * s, k = Math.floor(p), f = p - k; o[i] = x[k] * (1 - f) + x[k + 1] * f; }
    return o;
  }
  return { program, skeleton, params, cyc, rng, gauss, song, voice, speed };
});
