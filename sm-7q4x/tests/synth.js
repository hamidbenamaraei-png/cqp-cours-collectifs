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
    const cam = { cx: 0.5, cy: 0.88, s: 0.42, yaw: opt.yaw == null ? 25 : opt.yaw, aspect: opt.aspect || 16 / 9 };
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
  return { program, skeleton, params, cyc, rng, gauss };
});
