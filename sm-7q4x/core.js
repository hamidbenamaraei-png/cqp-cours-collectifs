/* ScriptMove – calculs (aucun accès réseau, aucun DOM).
   Utilisable dans le navigateur (window.SMCore) et dans Node (require). */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.SMCore = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ======================= 1. Caractéristiques de pose ======================= */
  const FEATS = ['kneeL', 'kneeR', 'hipL', 'hipR', 'elbL', 'elbR', 'shL', 'shR', 'wrWL', 'wrWR',
    'tilt', 'lean', 'hipY', 'ankHL', 'ankHR', 'kneeHL', 'kneeHR', 'wrFL', 'wrFR', 'wrSpread',
    'feetSpread', 'feetZ', 'elbHL', 'elbHR', 'shY', 'cx', 'tl'];
  const FI = {}; FEATS.forEach((f, i) => { FI[f] = i; });
  const NF = FEATS.length;
  // échelle « une unité de mouvement » pour chaque caractéristique
  const SCALE = {
    kneeL: 30, kneeR: 30, hipL: 30, hipR: 30, elbL: 30, elbR: 30, shL: 30, shR: 30,
    wrWL: 0.3, wrWR: 0.3, tilt: 20, lean: 15, hipY: 0.15, ankHL: 0.15, ankHR: 0.15,
    kneeHL: 0.3, kneeHR: 0.3, wrFL: 0.2, wrFR: 0.2, wrSpread: 0.5, feetSpread: 0.2, feetZ: 0.2,
    elbHL: 0.3, elbHR: 0.3, shY: 0.15, cx: 0.3, tl: Infinity
  };
  const MSCALE = { // échelle pour les positions moyennes (empreintes)
    kneeL: 50, kneeR: 50, hipL: 50, hipR: 50, elbL: 50, elbR: 50, shL: 50, shR: 50,
    wrWL: 0.5, wrWR: 0.5, tilt: 30, lean: 25, hipY: 0.3, ankHL: 0.3, ankHR: 0.3,
    kneeHL: 0.5, kneeHR: 0.5, wrFL: 0.3, wrFR: 0.3, wrSpread: 1, feetSpread: 0.4, feetZ: 0.4,
    elbHL: 0.5, elbHR: 0.5, shY: Infinity, cx: Infinity, tl: Infinity
  };
  const PAIRS = [['kneeL', 'kneeR'], ['hipL', 'hipR'], ['elbL', 'elbR'], ['shL', 'shR'], ['wrWL', 'wrWR'],
    ['ankHL', 'ankHR'], ['kneeHL', 'kneeHR'], ['wrFL', 'wrFR'], ['elbHL', 'elbHR']];
  // position de repos connue : +1 = valeur haute au repos (ex. genou tendu), -1 = valeur basse
  const REST = { knee: 1, hip: 1, elb: 1, sh: -1, wrW: -1, tilt: -1, hipY: 1, ankH: -1, kneeH: -1, wrF: -1, elbH: -1, shY: -1 };
  function restFlip(name) { const b = name.replace(/[LR±]$/, ''); return REST[b] == null ? null : REST[b] === 1; }
  const SINGLES = ['tilt', 'lean', 'hipY', 'wrSpread', 'feetSpread', 'feetZ', 'shY', 'cx'];

  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function len(v) { return Math.hypot(v[0], v[1], v[2]); }
  function dist(a, b) { return len(sub(a, b)); }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; }
  function ang(a, b, c) {
    const u = sub(a, b), v = sub(c, b);
    const d = (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / ((len(u) * len(v)) || 1e-9);
    return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI;
  }
  function P(lm, i, aspect) { const p = lm[i]; return [p.x * (aspect || 1), p.y, (p.z || 0) * (aspect || 1)]; }

  /** img : 33 points normalisés (x,y entre 0 et 1) ; world : 33 points en mètres (ou null) ; aspect = largeur/hauteur */
  function poseFeatures(img, world, aspect) {
    aspect = aspect || 1;
    const W = world && world.length >= 29 ? (i) => [world[i].x, world[i].y, world[i].z || 0] : (i) => P(img, i, aspect);
    const I = (i) => P(img, i, aspect);
    const LS = W(11), RS = W(12), LE = W(13), RE = W(14), LW = W(15), RW = W(16);
    const LH = W(23), RH = W(24), LK = W(25), RK = W(26), LA = W(27), RA = W(28);
    const mS = mid(LS, RS), mH = mid(LH, RH), tor = sub(mS, mH), tlen = len(tor) || 1e-6;
    const legL = dist(LH, LK) + dist(LK, LA), legR = dist(RH, RK) + dist(RK, RA), leg = (legL + legR) / 2 || 1e-6;
    const thigh = (dist(LH, LK) + dist(RH, RK)) / 2 || 1e-6;
    const armL = dist(LS, LE) + dist(LE, LW) || 1e-6, armR = dist(RS, RE) + dist(RE, RW) || 1e-6;
    const uaL = dist(LS, LE) || 1e-6, uaR = dist(RS, RE) || 1e-6;
    const shw = dist(LS, RS) || 1e-6;
    const f = new Array(NF);
    f[0] = ang(LH, LK, LA); f[1] = ang(RH, RK, RA);
    f[2] = ang(LS, LH, LK); f[3] = ang(RS, RH, RK);
    f[4] = ang(LS, LE, LW); f[5] = ang(RS, RE, RW);
    f[6] = ang(LH, LS, LE); f[7] = ang(RH, RS, RE);
    f[8] = (LS[1] - LW[1]) / armL; f[9] = (RS[1] - RW[1]) / armR;
    f[10] = Math.acos(Math.max(-1, Math.min(1, -tor[1] / tlen))) * 180 / Math.PI;
    f[11] = Math.atan2(tor[0], -tor[1]) * 180 / Math.PI;
    f[12] = ((LA[1] + RA[1]) / 2 - mH[1]) / leg;
    f[13] = 1 - (LA[1] - mH[1]) / leg; f[14] = 1 - (RA[1] - mH[1]) / leg;
    f[15] = (mH[1] - LK[1]) / thigh; f[16] = (mH[1] - RK[1]) / thigh;
    f[17] = dist(LW, LS) / armL; f[18] = dist(RW, RS) / armR;
    f[19] = Math.abs(LW[0] - RW[0]) / shw;
    f[20] = dist(LA, RA) / leg;
    f[21] = Math.abs(LA[2] - RA[2]) / leg;
    f[22] = (LS[1] - LE[1]) / uaL; f[23] = (RS[1] - RE[1]) / uaR;
    const iS = mid(I(11), I(12)), iH = mid(I(23), I(24));
    f[24] = iS[1]; f[25] = iH[0]; f[26] = Math.hypot(iS[0] - iH[0], iS[1] - iH[1]);
    for (let i = 0; i < NF; i++) if (!isFinite(f[i])) f[i] = NaN;
    return f;
  }

  /** Cadre (en coordonnées normalisées) d'une pose */
  function poseBox(lm) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
    for (let i = 0; i < lm.length; i++) {
      const p = lm[i]; if (p.visibility != null && p.visibility < 0.3) continue;
      if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; n++;
    }
    if (n < 5) { x0 = 1e9; y0 = 1e9; x1 = -1e9; y1 = -1e9; for (const p of lm) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } }
    const pad = 0.06 * (y1 - y0);
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  /* ======================= 2. Suivi de la personne ======================= */
  /** Suivi par proximité. state = {box, lastT, lostSince} ; renvoie l'indice choisi ou -1 */
  function trackStep(state, boxes, t, aspect) {
    aspect = aspect || 1;
    if (!state.box) return -1;
    const gap = Math.max(0, t - (state.lastT == null ? t : state.lastT));
    const ref = state.box;
    const h = Math.max(ref.h, 0.05);
    let lim = 0.45 + 0.6 * Math.min(gap, 3); // tolérance qui augmente si on l'a perdue
    if (gap > 3) lim = 1.8; // ré-accrochage
    let best = -1, bs = 1e9;
    boxes.forEach((b, i) => {
      const d = Math.hypot((b.cx - ref.cx) * aspect, b.cy - ref.cy) / h;
      const s = d + 0.8 * Math.abs(Math.log(Math.max(b.h, 0.02) / h));
      if (s < bs) { bs = s; best = i; }
    });
    if (best >= 0 && bs <= lim) {
      const b = boxes[best];
      state.box = { cx: b.cx, cy: b.cy, h: 0.7 * b.h + 0.3 * ref.h, w: b.w, x: b.x, y: b.y };
      state.lastT = t; state.lostSince = null; return best;
    }
    if (state.lostSince == null) state.lostSince = t;
    return -1;
  }

  /* ---------- 2b. Plusieurs personnes : zones agrandies, fusion des détections, suivi de chacun ---------- */
  /** Ramène des points détectés dans une zone (rect normalisé {x,y,w,h}) vers l'image entière */
  function mapFromRect(lm, rect) {
    return lm.map((p) => ({ x: rect.x + p.x * rect.w, y: rect.y + p.y * rect.h, z: (p.z || 0) * rect.w, visibility: p.visibility == null ? 1 : p.visibility }));
  }
  function boxIoU(a, b) {
    const x0 = Math.max(a.x, b.x), y0 = Math.max(a.y, b.y), x1 = Math.min(a.x + a.w, b.x + b.w), y1 = Math.min(a.y + a.h, b.y + b.h);
    const i = Math.max(0, x1 - x0) * Math.max(0, y1 - y0); return i / ((a.w * a.h + b.w * b.h - i) || 1e-9);
  }
  /** La personne touche-t-elle un bord de la zone (et pas un bord de l'image) ? → elle est coupée */
  function cutByRect(box, rect) {
    const e = 0.01;
    return (box.x < rect.x + e && rect.x > e) || (box.x + box.w > rect.x + rect.w - e && rect.x + rect.w < 1 - e) ||
      (box.y < rect.y + e && rect.y > e) || (box.y + box.h > rect.y + rect.h - e && rect.y + rect.h < 1 - e);
  }
  /** Fusionne les personnes trouvées dans plusieurs zones (une même personne vue 2 fois → 1).
      dets = [{lm, world, rect}] (lm déjà dans l'image entière). Renvoie [{lm, world, box}] */
  function mergeDetections(dets) {
    const it = dets.map((d) => {
      const box = poseBox(d.lm); let v = 0; for (const p of d.lm) v += p.visibility == null ? 1 : p.visibility; v /= d.lm.length || 1;
      const cut = d.rect ? cutByRect(box, d.rect) : false;
      const zoom = d.rect ? 1 / Math.max(0.2, d.rect.h) : 1; // une zone agrandie voit mieux les petites personnes
      return { lm: d.lm, world: d.world, box, q: v * (cut ? 0.45 : 1) * (1 + 0.15 * Math.min(3, zoom - 1)) };
    }).sort((a, b) => b.q - a.q);
    const keep = [];
    const key = (lm) => [11, 12, 23, 24].map((i) => lm[i]);
    for (const d of it) {
      const dup = keep.some((k) => {
        if (boxIoU(k.box, d.box) > 0.35) return true;
        const a = key(k.lm), b = key(d.lm); let s = 0; for (let i = 0; i < 4; i++) s += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y);
        return s / 4 < 0.25 * Math.max(0.02, Math.min(k.box.h, d.box.h));
      });
      if (!dup) keep.push(d);
    }
    return keep.map((d) => ({ lm: d.lm, world: d.world, box: d.box }));
  }

  /** Suivi de toutes les personnes (chacune garde son numéro d'une image à l'autre) */
  class MultiTracker {
    constructor(aspect, st) { this.aspect = aspect || 1; this.tracks = st ? st.tracks.map((x) => Object.assign({}, x, { box: Object.assign({}, x.box) })) : []; this.next = st ? st.next : 1; }
    state() { return { tracks: this.tracks.map((x) => ({ id: x.id, box: x.box, lastT: x.lastT, hits: x.hits, first: x.first })), next: this.next }; }
    /** boxes = cadres de l'image ; renvoie les numéros (id) dans le même ordre */
    step(boxes, t) {
      const pairs = [];
      this.tracks.forEach((tr, ti) => {
        const gap = Math.max(0, t - tr.lastT); if (gap > 30) return;
        const h = Math.max(tr.box.h, 0.03), lim = gap > 3 ? 1.1 : 0.5 + 0.2 * gap;
        boxes.forEach((b, bi) => {
          const d = Math.hypot((b.cx - tr.box.cx) * this.aspect, b.cy - tr.box.cy) / h;
          const s = d + 0.8 * Math.abs(Math.log(Math.max(b.h, 0.02) / h)) + 0.02 * Math.min(gap, 30);
          if (s <= lim) pairs.push([s, ti, bi]);
        });
      });
      pairs.sort((a, b) => a[0] - b[0]);
      const ids = new Array(boxes.length).fill(0), usedT = new Set();
      for (const [, ti, bi] of pairs) {
        if (usedT.has(ti) || ids[bi]) continue; usedT.add(ti);
        const tr = this.tracks[ti], b = boxes[bi];
        tr.box = { cx: b.cx, cy: b.cy, h: 0.7 * b.h + 0.3 * tr.box.h, w: b.w, x: b.x, y: b.y }; tr.lastT = t; tr.hits++; ids[bi] = tr.id;
      }
      boxes.forEach((b, bi) => {
        if (ids[bi]) return;
        const tr = { id: this.next++, box: { cx: b.cx, cy: b.cy, h: b.h, w: b.w, x: b.x, y: b.y }, lastT: t, hits: 1, first: t };
        this.tracks.push(tr); ids[bi] = tr.id;
      });
      // ménage : on oublie les apparitions très courtes perdues depuis longtemps
      if (this.tracks.length > 24) this.tracks = this.tracks.filter((x) => t - x.lastT < 30 || x.hits > 40).slice(-24);
      return ids;
    }
  }

  const MED_TMP = new Float64Array(64);
  function median(vals, n) { // vals : tableau réutilisable, n valeurs
    const a = MED_TMP.subarray(0, n); for (let i = 0; i < n; i++) a[i] = vals[i]; a.sort();
    return n % 2 ? a[(n - 1) >> 1] : (a[n / 2 - 1] + a[n / 2]) / 2;
  }
  const FUSE_F = FEATS.filter((f) => SCALE[f] !== Infinity);
  /** Fusion du groupe : à chaque instant, valeur médiane des personnes qui font la même chose que la majorité.
      po = {fps, times, tracks:[{id, feats}]} (feats : n images × NF, NaN si absente).
      Renvoie une séquence comme resample() + info {persons, used (moyenne), share[]} */
  function fuseGroup(po, opt) {
    opt = opt || {};
    const fps = po.fps, times = po.times, m = times.length;
    if (!m) return null;
    const t0 = times[0], t1 = times[m - 1];
    let seqs = (po.tracks || []).map((tr) => ({ id: tr.id, s: resample(times, tr.feats, fps, t0, t1) }));
    seqs = seqs.filter((x) => { let v = 0; for (let i = 0; i < x.s.n; i++) v += x.s.valid[i]; return v >= Math.max(fps * 4, 0.08 * x.s.n); });
    if (!seqs.length) return null;
    const n = seqs[0].s.n, P = seqs.length;
    if (P === 1) return Object.assign(seqs[0].s, { group: { persons: 1, used: 1, share: [1] } });
    const X = seqs.map((x) => x.s.X), V = seqs.map((x) => x.s.valid);
    // positions : chacun par rapport à sa propre place (les personnes ne sont pas au même endroit)
    const rel = ['cx', 'shY'].map((f) => FI[f]);
    const base = seqs.map(() => rel.map(() => null));
    seqs.forEach((x, p) => rel.forEach((f, k) => {
      const c = col(X[p], n, f), b = smooth(c, Math.round(fps * 20) | 1); base[p][k] = b;
      for (let i = 0; i < n; i++) X[p][i * NF + f] = c[i] - b[i];
    }));
    const W = Math.round(fps * 4), hop = Math.max(1, Math.round(fps)), SH = Math.round(fps * 0.25);
    const agree = seqs.map(() => new Float32Array(n)), cnt = new Float32Array(n);
    const vals = new Float64Array(P), cons = new Float64Array(n * NF), cv = new Uint8Array(n);
    const consensus = (useW) => {
      for (let i = 0; i < n; i++) {
        let any = false;
        for (let f = 0; f < NF; f++) {
          let k = 0;
          for (let p = 0; p < P; p++) if (V[p][i] && (!useW || agree[p][i] >= 0.5)) vals[k++] = X[p][i * NF + f];
          if (!k && useW) { // personne d'accord ici : la meilleure disponible
            let bp = -1, bw = -1; for (let p = 0; p < P; p++) if (V[p][i] && agree[p][i] > bw) { bw = agree[p][i]; bp = p; }
            if (bp >= 0) vals[k++] = X[bp][i * NF + f];
          }
          if (k) { cons[i * NF + f] = median(vals, k); any = true; }
        }
        cv[i] = any ? 1 : 0;
      }
    };
    const FF = FUSE_F.map((f) => FI[f]), SC = FUSE_F.map((f) => SCALE[f]);
    const PF = ['tilt', 'hipY', 'kneeL', 'kneeR', 'elbL', 'elbR', 'wrWL', 'wrWR'].map((f) => [FI[f], MSCALE[f]]);
    for (let pass = 0; pass < 2; pass++) {
      consensus(pass > 0);
      for (const a of agree) a.fill(0); cnt.fill(0);
      for (let a = 0; a < n; a += hop) {
        const b = Math.min(n, a + W); if (b - a < Math.max(4, W / 2)) continue;
        for (let p = 0; p < P; p++) {
          let nv = 0; for (let i = a; i < b; i++) if (V[p][i] && cv[i]) nv++;
          let ok = 0;
          if (nv >= 0.6 * (b - a)) {
            // énergie du mouvement commun, et écart de la personne (avec un petit décalage permis)
            let em = 0, ep = 0, best = Infinity, post = 0;
            for (let k = 0; k < FF.length; k++) {
              const f = FF[k], s = SC[k]; let mm = 0, mp = 0, c = 0;
              for (let i = a; i < b; i++) if (V[p][i] && cv[i]) { mm += cons[i * NF + f]; mp += X[p][i * NF + f]; c++; }
              mm /= c; mp /= c;
              for (let i = a; i < b; i++) if (V[p][i] && cv[i]) { const u = (cons[i * NF + f] - mm) / s, w = (X[p][i * NF + f] - mp) / s; em += u * u; ep += w * w; }
            }
            for (const [f, s] of PF) { let mm = 0, mp = 0, c = 0; for (let i = a; i < b; i++) if (V[p][i] && cv[i]) { mm += cons[i * NF + f]; mp += X[p][i * NF + f]; c++; } post += Math.abs(mm - mp) / c / s; }
            post /= PF.length;
            for (let d = -SH; d <= SH; d++) {
              let er = 0, c = 0;
              for (let k = 0; k < FF.length; k++) {
                const f = FF[k], s = SC[k]; let mm = 0, mp = 0, cc = 0;
                for (let i = a; i < b; i++) { const j = i + d; if (j < 0 || j >= n || !V[p][j] || !cv[i]) continue; mm += cons[i * NF + f]; mp += X[p][j * NF + f]; cc++; }
                if (!cc) continue; mm /= cc; mp /= cc;
                for (let i = a; i < b; i++) { const j = i + d; if (j < 0 || j >= n || !V[p][j] || !cv[i]) continue; const r = ((X[p][j * NF + f] - mp) - (cons[i * NF + f] - mm)) / s; er += r * r; }
                c = cc;
              }
              if (c) best = Math.min(best, er);
            }
            const still = em / nv < 0.25;
            if (post > 0.9) ok = 0; // autre position (ex. au sol quand les autres sont debout)
            else if (still) ok = ep / nv < Math.max(0.6, 3 * em / nv) ? 1 : 0;
            else ok = best < 0.5 * em ? 1 : 0;
          }
          for (let i = a; i < b; i++) agree[p][i] += ok;
        }
        for (let i = a; i < b; i++) cnt[i]++;
      }
      for (let p = 0; p < P; p++) for (let i = 0; i < n; i++) agree[p][i] = cnt[i] ? agree[p][i] / cnt[i] : 1;
    }
    consensus(true);
    // positions : on remet une place fixe (médiane des places de chacun) — sinon des sauts quand quelqu'un apparaît
    const relC = rel.map((f, k) => { let q = 0; for (let p = 0; p < P; p++) { const c = quantile(base[p][k], 0.5); if (isFinite(c)) vals[q++] = c; } return q ? median(vals, q) : 0; });
    const out = new Float32Array(n * NF), valid = new Uint8Array(n);
    let usedSum = 0; const share = new Array(P).fill(0);
    for (let i = 0; i < n; i++) {
      valid[i] = cv[i];
      for (let f = 0; f < NF; f++) out[i * NF + f] = cons[i * NF + f];
      rel.forEach((f, k) => { out[i * NF + f] += relC[k]; });
      let u = 0; for (let p = 0; p < P; p++) if (V[p][i] && agree[p][i] >= 0.5) { u++; share[p]++; }
      usedSum += u;
    }
    let last = -1; for (let i = 0; i < n; i++) { if (valid[i]) last = i; else if (last >= 0) for (let f = 0; f < NF; f++) out[i * NF + f] = out[last * NF + f]; }
    return { fps, t0, n, X: out, valid, group: { persons: P, used: Math.round(usedSum / n * 10) / 10, ids: seqs.map((x) => x.id), share: share.map((x) => Math.round(x / n * 100) / 100) } };
  }

  /* ======================= 3. Outils de signal ======================= */
  function smooth(a, k) {
    const n = a.length, out = new Float64Array(n); if (k <= 1) { for (let i = 0; i < n; i++) out[i] = a[i]; return out; }
    const h = Math.floor(k / 2); let s = 0, c = 0;
    const pre = new Float64Array(n + 1); for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    for (let i = 0; i < n; i++) { const lo = Math.max(0, i - h), hi = Math.min(n, i + h + 1); out[i] = (pre[hi] - pre[lo]) / (hi - lo); }
    void s; void c; return out;
  }
  function quantile(arr, q) {
    const b = Array.from(arr).filter((x) => isFinite(x)).sort((x, y) => x - y);
    if (!b.length) return NaN; const p = (b.length - 1) * q, i = Math.floor(p), f = p - i;
    return i + 1 < b.length ? b[i] * (1 - f) + b[i + 1] * f : b[i];
  }
  function mean(a) { let s = 0, n = 0; for (const x of a) if (isFinite(x)) { s += x; n++; } return n ? s / n : NaN; }
  function corr(a, b) {
    const ma = mean(a), mb = mean(b); let sab = 0, saa = 0, sbb = 0;
    for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; sab += x * y; saa += x * x; sbb += y * y; }
    return sab / (Math.sqrt(saa * sbb) || 1e-9);
  }

  /** Période dominante (en secondes) par autocorrélation ; {period, strength} */
  function estimatePeriod(sig, fps, minS, maxS) {
    const n = sig.length; minS = minS || 0.35; maxS = Math.min(maxS || 8, n / fps / 1.6);
    const m = mean(sig), x = new Float64Array(n); let e = 0;
    for (let i = 0; i < n; i++) { x[i] = sig[i] - m; e += x[i] * x[i]; }
    if (e < 1e-9) return { period: null, strength: 0 };
    const l0 = Math.max(1, Math.round(minS * fps)), l1 = Math.floor(maxS * fps);
    if (l1 <= l0 + 1) return { period: null, strength: 0 };
    const r = new Float64Array(l1 + 2);
    for (let l = l0 - 1; l <= l1 + 1; l++) {
      let s = 0; for (let i = 0; i + l < n; i++) s += x[i] * x[i + l];
      r[l] = s / e * n / (n - l);
    }
    let gmax = -1; for (let l = l0; l <= l1; l++) if (r[l] > gmax) gmax = r[l];
    if (gmax < 0.15) return { period: null, strength: Math.max(0, gmax) };
    for (let l = l0; l <= l1; l++) {
      if (r[l] >= r[l - 1] && r[l] >= r[l + 1] && r[l] >= 0.7 * gmax) {
        const a = r[l - 1], b = r[l], c = r[l + 1], den = a - 2 * b + c;
        const off = den !== 0 ? 0.5 * (a - c) / den : 0;
        return { period: (l + Math.max(-0.5, Math.min(0.5, off))) / fps, strength: b };
      }
    }
    return { period: null, strength: 0 };
  }

  /** Comptage des répétitions par hystérésis (seuil adaptatif).
      Renvoie {count, starts[], peaks[], period, amp} (indices d'échantillons). */
  function countReps(sig, fps, opt) {
    opt = opt || {};
    const n = sig.length;
    const empty = { count: 0, starts: [], peaks: [], rests: [], period: null, amp: 0 };
    if (n < Math.max(4, fps * 0.8)) return empty;
    let s = smooth(sig, Math.max(1, Math.round(fps * 0.18)) | 1);
    const pe = estimatePeriod(s, fps, 0.35, 10);
    let period = pe.period;
    // retirer la dérive lente
    const dk = Math.max(3, Math.round(fps * (period ? Math.max(2.5, period * 2) : 3))) | 1;
    const tr = smooth(s, dk);
    const d = new Float64Array(n); for (let i = 0; i < n; i++) d[i] = s[i] - tr[i];
    // orientation : la position de repos est celle du début
    const k0 = Math.max(1, Math.round(fps * 0.4));
    let m0 = 0; for (let i = 0; i < k0; i++) m0 += s[i]; m0 /= k0;
    const smed = quantile(s, 0.5);
    const flip = opt.flip != null ? opt.flip : (m0 > smed);
    if (flip) for (let i = 0; i < n; i++) d[i] = -d[i];
    // seuil local
    const win = Math.max(Math.round(fps * 4), Math.round(fps * (period || 2) * 3));
    const half = Math.floor(win / 2);
    const amp = quantile(d, 0.95) - quantile(d, 0.05);
    if (!(amp > (opt.minAmp || 0.35))) return Object.assign(empty, { amp: amp || 0, period });
    const step = Math.max(1, Math.round(fps / 2));
    const loc = new Float64Array(n);
    for (let c = 0; c < n; c += step) {
      const lo = Math.max(0, c - half), hi = Math.min(n, c + half);
      const sl = d.slice(lo, hi), r = quantile(sl, 0.95) - quantile(sl, 0.05);
      for (let i = c; i < Math.min(n, c + step); i++) loc[i] = Math.max(r, amp * 0.3);
    }
    const peaks = [], starts = [], rests = [];
    let state = 0, best = -1, bestV = -1e9, lastPeak = -1, minSince = d[0], riseFrom = d[0];
    for (let i = 0; i < n; i++) {
      const hi = 0.2 * loc[i], lo = -0.12 * loc[i];
      if (state === 0) {
        if (d[i] < minSince) minSince = d[i];
        if (d[i] > hi) { state = 1; best = i; bestV = d[i]; riseFrom = minSince; }
      } else {
        if (d[i] > bestV) { bestV = d[i]; best = i; }
        if (d[i] < lo) {
          // on ne compte que si le signal est vraiment « monté » (évite le faux pic du début)
          if (bestV - riseFrom >= 0.3 * loc[best]) { peaks.push(best); lastPeak = best; }
          state = 0; minSince = d[i];
        }
      }
    }
    if (state === 1 && best > lastPeak) {
      // dernière répétition incomplète : on la compte si elle a vraiment eu lieu
      // (il faut que le retour ait commencé : sinon c'est un simple changement de position)
      if (bestV > 0.3 * loc[best] && bestV - riseFrom >= 0.45 * loc[best] && d[n - 1] < bestV - 0.3 * loc[best]) peaks.push(best);
    }
    // fusion des pics trop proches (bruit)
    const minGap = Math.max(Math.round(fps * 0.3), period ? Math.round(period * fps * 0.45) : 0);
    const pk = [];
    for (const p of peaks) {
      if (pk.length && p - pk[pk.length - 1] < minGap) { if (d[p] > d[pk[pk.length - 1]]) pk[pk.length - 1] = p; }
      else pk.push(p);
    }
    // début de chaque répétition = dernier moment « en bas » avant le pic (le mouvement démarre)
    let prev = 0;
    for (let j = 0; j < pk.length; j++) {
      let mv = 1e9;
      for (let i = prev; i <= pk[j]; i++) if (d[i] < mv) mv = d[i];
      const lim = mv + 0.12 * (d[pk[j]] - mv);
      let mi = pk[j]; while (mi > prev && d[mi] > lim) mi--;
      starts.push(mi);
      // centre de la zone « au repos » (pour le tempo)
      const lim2 = mv + 0.15 * (d[pk[j]] - mv); let sw = 0, sc = 0;
      for (let i = prev; i <= pk[j]; i++) if (d[i] <= lim2) { sw += i; sc++; }
      rests.push(sc ? sw / sc : mi);
      prev = pk[j];
    }
    if (pk.length >= 3) {
      const g = []; for (let j = 1; j < pk.length; j++) g.push(pk[j] - pk[j - 1]);
      period = quantile(g, 0.5) / fps;
    }
    return { count: pk.length, starts, peaks: pk, rests, period, amp, d };
  }

  /* ======================= 4. Mise en forme des séquences ======================= */
  /** Ré-échantillonnage régulier. times (s), feats (tableau plat n*NF) → {fps, t0, n, X: Float32Array, valid: Uint8Array} */
  function resample(times, feats, fps, t0, t1) {
    const m = times.length;
    if (t0 == null) t0 = m ? times[0] : 0; if (t1 == null) t1 = m ? times[m - 1] : 0;
    const n = Math.max(0, Math.floor((t1 - t0) * fps) + 1);
    const X = new Float32Array(n * NF), valid = new Uint8Array(n);
    let j = 0;
    for (let i = 0; i < n; i++) {
      const t = t0 + i / fps;
      while (j + 1 < m && times[j + 1] <= t) j++;
      // trouver des voisins valides
      let a = j; while (a >= 0 && !isFinite(feats[a * NF])) a--;
      let b = j + 1; while (b < m && !isFinite(feats[b * NF])) b++;
      if (a >= 0 && times[a] > t) a = -1;
      let ok = false;
      if (a >= 0 && b < m && times[b] - times[a] <= 1.5) {
        const w = (t - times[a]) / ((times[b] - times[a]) || 1);
        for (let f = 0; f < NF; f++) X[i * NF + f] = feats[a * NF + f] * (1 - Math.max(0, Math.min(1, w))) + feats[b * NF + f] * Math.max(0, Math.min(1, w));
        ok = true;
      } else if (a >= 0 && t - times[a] <= 0.6) { for (let f = 0; f < NF; f++) X[i * NF + f] = feats[a * NF + f]; ok = true; }
      else if (b < m && times[b] - t <= 0.6) { for (let f = 0; f < NF; f++) X[i * NF + f] = feats[b * NF + f]; ok = true; }
      valid[i] = ok ? 1 : 0;
    }
    // trous : on recopie la dernière valeur connue (marqués non valides)
    let last = -1;
    for (let i = 0; i < n; i++) {
      if (valid[i]) last = i;
      else if (last >= 0) for (let f = 0; f < NF; f++) X[i * NF + f] = X[last * NF + f];
    }
    const firstV = valid.indexOf(1);
    if (firstV > 0) for (let i = 0; i < firstV; i++) for (let f = 0; f < NF; f++) X[i * NF + f] = X[firstV * NF + f];
    // normaliser position image par la taille du torse
    const tl = []; for (let i = 0; i < n; i++) if (valid[i]) tl.push(X[i * NF + FI.tl]);
    const sc = quantile(tl, 0.9) || 1;
    for (let i = 0; i < n; i++) { X[i * NF + FI.shY] /= sc; X[i * NF + FI.cx] /= sc; }
    return { fps, t0, n, X, valid };
  }

  function col(X, n, f, a, b) {
    a = a || 0; b = b == null ? n : b; const o = new Float64Array(b - a);
    for (let i = a; i < b; i++) o[i - a] = X[i * NF + f]; return o;
  }

  /** Statistiques d'un passage [a,b) : moyenne, amplitude (p90-p10 en unités), etc. */
  function segStats(seq, a, b) {
    const { X, n } = seq; const st = { mean: {}, amp: {}, ampN: {} };
    for (let f = 0; f < NF; f++) {
      const c = col(X, n, f, a, b); const name = FEATS[f];
      st.mean[name] = mean(c);
      const am = quantile(c, 0.92) - quantile(c, 0.08);
      st.amp[name] = am; st.ampN[name] = SCALE[name] === Infinity ? 0 : am / SCALE[name];
    }
    return st;
  }

  /** Candidats de signal pour le comptage dans [a,b) */
  function candidates(seq, a, b) {
    const { X, n, fps } = seq; const out = [];
    const push = (name, sig, scale, alt) => {
      const z = new Float64Array(sig.length); for (let i = 0; i < sig.length; i++) z[i] = sig[i] / scale;
      const am = quantile(z, 0.92) - quantile(z, 0.08);
      out.push({ name, z, amp: am, alt });
    };
    for (const [l, r] of PAIRS) {
      const L = col(X, n, FI[l], a, b), R = col(X, n, FI[r], a, b);
      const c = corr(L, R);
      const aL = quantile(L, 0.92) - quantile(L, 0.08), aR = quantile(R, 0.92) - quantile(R, 0.08);
      if (c > 0.3) { const m = new Float64Array(L.length); for (let i = 0; i < L.length; i++) m[i] = (L[i] + R[i]) / 2; push(l.slice(0, -1), m, SCALE[l]); }
      else if (c < -0.3 && Math.min(aL, aR) > 0.5 * Math.max(aL, aR)) {
        const zl = L.map((x) => x / SCALE[l]), zr = R.map((x) => x / SCALE[r]);
        push(l.slice(0, -1) + '±', L, SCALE[l], { L: zl, R: zr });
      }
      else { push(l, L, SCALE[l]); push(r, R, SCALE[r]); }
    }
    for (const s of SINGLES) push(s, col(X, n, FI[s], a, b), SCALE[s]);
    for (const c of out) {
      const pe = estimatePeriod(smooth(c.z, Math.max(1, Math.round(fps * 0.18)) | 1), fps, 0.35, 10);
      c.period = pe.period; c.per = pe.strength;
      c.score = c.amp * (0.25 + Math.max(0, pe.strength));
    }
    out.sort((x, y) => y.score - x.score);
    return out;
  }

  /* ======================= 5. Découpage en segments ======================= */
  const ACT = FEATS.filter((f) => SCALE[f] !== Infinity && f !== 'cx' && f !== 'shY');
  function windowDesc(seq, a, b) {
    const { X, fps } = seq; const d = [];
    let maxA = 0, dom = -1;
    for (let k = 0; k < ACT.length; k++) {
      const f = FI[ACT[k]]; let s = 0, s2 = 0, c = 0;
      for (let i = a; i < b; i++) { const v = X[i * NF + f]; s += v; s2 += v * v; c++; }
      const m = s / c, sd = Math.sqrt(Math.max(0, s2 / c - m * m)) / SCALE[ACT[k]];
      d.push(Math.sqrt(sd));
      if (sd > maxA) { maxA = sd; dom = f; }
    }
    // posture moyenne
    const pm = (name, sc) => { let s = 0; for (let i = a; i < b; i++) s += X[i * NF + FI[name]]; return s / (b - a) / sc; };
    d.push(pm('tilt', 25)); d.push(pm('hipY', 0.35)); d.push((pm('wrWL', 0.6) + pm('wrWR', 0.6)) / 2);
    d.push((pm('elbL', 60) + pm('elbR', 60)) / 2); d.push((pm('kneeL', 60) + pm('kneeR', 60)) / 2);
    // rythme
    let per = 0;
    if (dom >= 0 && maxA > 0.25) {
      const c = col(X, seq.n, dom, a, b); const pe = estimatePeriod(c, fps, 0.35, 6);
      per = pe.period ? Math.log2(pe.period) * 0.9 : 0;
    }
    d.push(per);
    return d;
  }
  function dvec(u, v) { let s = 0; for (let i = 0; i < u.length; i++) { const x = u[i] - v[i]; s += x * x; } return Math.sqrt(s); }

  /** Découpe la séquence en passages homogènes. Renvoie [[a,b),…] en indices. */
  function segmentSeq(seq, opt) {
    opt = opt || {};
    const { n, fps } = seq; if (n < fps * 2) return [[0, n]];
    const W = Math.round(fps * (opt.win || 5)), hop = Math.max(1, Math.round(fps * 0.5)), Wmin = Math.round(fps * 1.5);
    const nov = [], pos = [];
    for (let c = Wmin; c + Wmin <= n; c += hop) {
      const w = Math.min(W, c, n - c);
      nov.push(dvec(windowDesc(seq, c - w, c), windowDesc(seq, c, c + w))); pos.push(c);
    }
    if (!nov.length) return [[0, n]];
    const med = quantile(nov, 0.5);
    const thr = Math.max(opt.thr || 0.9, med * 2.2);
    const minLen = Math.round(fps * (opt.minLen || 3)), minEdge = Math.round(fps * 1.5);
    let cuts = [];
    for (let i = 0; i < nov.length; i++) {
      const lo = Math.max(0, i - Math.round(4 * fps / hop)), hi = Math.min(nov.length - 1, i + Math.round(4 * fps / hop));
      let isMax = true; for (let j = lo; j <= hi; j++) if (nov[j] > nov[i] || (nov[j] === nov[i] && j < i)) { isMax = false; break; }
      if (isMax && nov[i] > thr) cuts.push({ p: pos[i], v: nov[i] });
    }
    cuts = cuts.filter((c) => c.p >= minEdge && n - c.p >= minEdge);
    // espacement minimal
    cuts.sort((x, y) => y.v - x.v); const kept = [];
    for (const c of cuts) if (kept.every((k) => Math.abs(k.p - c.p) >= minLen)) kept.push(c);
    kept.sort((x, y) => x.p - y.p);
    const segs = []; let s = 0;
    for (const c of kept) { segs.push([s, c.p]); s = c.p; }
    segs.push([s, n]);
    return segs;
  }

  /** Retire les moments immobiles au début / à la fin de chaque passage */
  function trimIdle(seq, segs) {
    const { fps } = seq; const out = [];
    for (const [a, b] of segs) {
      const c = candidates(seq, a, b)[0];
      if (!c || c.amp < 0.6) { out.push([a, b, true]); continue; }
      const z = smooth(c.z, Math.max(1, Math.round(fps * 0.18)) | 1);
      const w = Math.max(2, Math.round(fps * Math.max(1.2, (c.period || 2) * 0.75)));
      const act = (i) => { let lo = 1e9, hi = -1e9; for (let k = Math.max(0, i - w); k < Math.min(z.length, i + w); k++) { if (z[k] < lo) lo = z[k]; if (z[k] > hi) hi = z[k]; } return hi - lo; };
      const thr = 0.4 * c.amp;
      let s = 0; while (s < z.length && act(s) < thr) s++;
      let e = z.length - 1; while (e > s && act(e) < thr) e--;
      s = Math.max(0, s - Math.round(w * 0.5)); e = Math.min(z.length, e + Math.round(w * 0.5));
      const min = Math.round(fps * 1.5);
      if (s >= min) out.push([a, a + s, true]); else s = 0;
      if (z.length - e >= min) { out.push([a + s, a + e]); out.push([a + e, b, true]); } else out.push([a + s, b]);
    }
    // regrouper les pauses voisines
    const m = [];
    for (const g of out) { const l = m[m.length - 1]; if (l && l[2] && g[2]) l[1] = g[1]; else m.push(g.slice()); }
    return m;
  }

  /* ======================= 6. Reconnaissance ======================= */
  const MOVES = {
    pump: ['Squat', 'Soulevé de terre', 'Rowing', 'Épaulé', 'Développé couché', 'Pompes', 'Développé militaire',
      'Curl biceps', 'Extension triceps', 'Dips', 'Fentes', 'Élévations latérales', 'Élévations frontales',
      'Gainage', 'Crunch', 'Pont fessier', 'Pause'],
    combat: ['Jab', 'Cross', 'Jab cross', 'Crochet', 'Uppercut', 'Coup de pied avant', 'Coup de pied latéral',
      'Coup de pied arrière', 'Coup de pied circulaire', 'Genou', 'Squat', 'Gainage', 'Pompes', 'Crunch', 'Pause'],
    attack: ['Jumping jack', 'Montées de genoux', 'Burpees', 'Squat sauté', 'Mountain climbers', 'Fentes sautées',
      'Course sur place', 'Squat', 'Pompes', 'Gainage', 'Pause'],
    step: ['Pas de base', 'Montée genou', 'Pas en V', 'Repeater', 'Over the top', 'Tap', 'Pause']
  };
  const STYLES = { pump: 'Pump', combat: 'Combat', attack: 'Attack', step: 'Step' };

  function maxA(st, a, b) {
    if (st.pa) { const base = a.slice(0, -1); return st.pa[base] || 0; }
    return Math.max(st.ampN[a], st.ampN[b]);
  }
  /** amplitude « périodique » : on ne garde que ce qui se répète */
  function periodicAmps(cands) {
    const pa = {};
    for (const c of cands) {
      const base = c.name.replace(/[LR±]$/, '');
      const v = c.amp * Math.min(1, Math.max(0, (c.per - 0.15) / 0.55));
      if (!(pa[base] >= v)) { pa[base] = v; pa['sym_' + base] = c.name === base; }
    }
    return pa;
  }
  function avgM(st, a, b) { return (st.mean[a] + st.mean[b]) / 2; }

  /** Règles simples → {name, conf} */
  function ruleName(st, style, dom) {
    const knee = maxA(st, 'kneeL', 'kneeR'), hip = maxA(st, 'hipL', 'hipR'), elb = maxA(st, 'elbL', 'elbR');
    const sh = maxA(st, 'shL', 'shR'), wrW = maxA(st, 'wrWL', 'wrWR'), tiltA = st.pa ? (st.pa.tilt || 0) : st.ampN.tilt;
    const A1 = (k) => (st.pa ? (st.pa[k] || 0) : st.ampN[k]);
    const ankH = maxA(st, 'ankHL', 'ankHR'), kneeH = maxA(st, 'kneeHL', 'kneeHR'), wrF = maxA(st, 'wrFL', 'wrFR');
    const tilt = st.mean.tilt, mWrW = avgM(st, 'wrWL', 'wrWR'), mElb = avgM(st, 'elbL', 'elbR');
    const mKnee = avgM(st, 'kneeL', 'kneeR');
    const feetZ = st.mean.feetZ, kneeDiff = Math.abs(st.mean.kneeL - st.mean.kneeR);
    const lying = tilt > 62, bent = tilt >= 28 && tilt <= 62;
    const alt = dom && dom.alt;
    const domName = dom ? dom.name.replace('±', '') : '';
    const total = knee + hip + elb + sh + wrW + tiltA + ankH + kneeH + wrF + A1('feetSpread') + A1('shY');
    const R = (name, conf) => ({ name, conf: Math.max(0.2, Math.min(0.92, conf)) });
    const still = total < 1.4 || (dom && dom.amp < 0.6);
    if (style === 'step') {
      if (still) return R('Pause', 0.5);
      if (kneeH > 1.1) return R('Montée genou', 0.55);
      if (A1('feetSpread') > 1) return R('Pas en V', 0.45);
      if (ankH > 1) return R('Repeater', 0.4);
      return R('Pas de base', 0.4);
    }
    if (lying) {
      if (still) return R('Gainage', 0.75);
      if (style === 'attack' && kneeH > 1 && alt) return R('Mountain climbers', 0.6);
      if (elb > 1 && A1('shY') > 0.6 && mWrW < 0.2) return R('Pompes', 0.7);
      if (elb > 1 && mWrW >= 0.2) return R('Développé couché', 0.75);
      if (elb > 1) return R('Pompes', 0.5);
      if (tiltA > 0.7 && mKnee < 135) return R('Crunch', 0.6);
      if (hip > 1) return R('Pont fessier', 0.5);
      return R(style === 'pump' ? 'Gainage' : 'Gainage', 0.35);
    }
    if (style === 'attack') {
      if (tiltA > 2.5) return R('Burpees', 0.6);
      if (wrW > 1.2 && A1('feetSpread') > 0.8) return R('Jumping jack', 0.65);
      if (kneeH > 1 && alt) return R('Montées de genoux', 0.65);
      if (knee > 1.2 && A1('feetZ') > 1) return R('Fentes sautées', 0.5);
      if (knee > 1.2) return R('Squat', 0.5);
      if (still) return R('Pause', 0.5);
      return R('Course sur place', 0.35);
    }
    if (style === 'combat') {
      if (still) return R('Pause', 0.5);
      if (knee > 1.1 && st.pa && st.pa.sym_knee && kneeH < knee) return R('Squat', 0.6);
      if (ankH > 1.4 || (kneeH > 1.2 && ankH > 0.8)) {
        if (kneeH > 1.2 && ankH < 2.2 && domName.startsWith('kneeH')) return R('Genou', 0.55);
        if (Math.abs(st.mean.lean) > 12 || A1('lean') > 1) return R('Coup de pied latéral', 0.5);
        if (tilt > 25) return R('Coup de pied arrière', 0.45);
        return R('Coup de pied avant', 0.55);
      }
      if (wrF > 1 || elb > 1.2) {
        const mElbH = avgM(st, 'elbHL', 'elbHR');
        if (wrW > wrF * 1.2 && mElb < 125) return R('Uppercut', 0.5);
        if (mElbH > -0.25 && mElb < 130) return R('Crochet', 0.5);
        if (alt) return R('Jab cross', 0.6);
        const left = st.ampN.wrFL + st.ampN.elbL > st.ampN.wrFR + st.ampN.elbR;
        return R(left ? 'Jab' : 'Cross', 0.45);
      }
      if (knee > 1.2) return R('Squat', 0.55);
      return R('Pause', 0.3);
    }
    // ---------- Pump ----------
    if (still) return R(bent ? 'Rowing' : 'Pause', 0.3);
    if (tiltA > 1.3 && knee < 1.6 && tiltA * 30 > knee * 20) return R('Soulevé de terre', 0.7);
    if (knee > 1.1 && knee >= elb * 0.8) {
      if (kneeDiff > 18 || feetZ > 0.25) return R('Fentes', 0.65);
      if (wrW > 1.3 && elb > 1.2) return R('Épaulé', 0.45);
      return R('Squat', knee > 1.6 ? 0.85 : 0.65);
    }
    if (bent) {
      if (elb > 0.8 || sh > 0.8) return R('Rowing', 0.75);
      return R('Rowing', 0.4);
    }
    if (wrW > 1.3 && elb > 1 && hip > 0.8) return R('Épaulé', 0.5);
    if (elb > 1.1) {
      if (mWrW > 0.25 && sh < 1) return R('Extension triceps', 0.6);
      if (sh > 1.1 && wrW > 1) return R('Développé militaire', 0.65);
      if (sh < 1.2 && mWrW < 0.2) return R('Curl biceps', 0.75);
      return R('Développé militaire', 0.45);
    }
    if (sh > 1.1) {
      if (mElb > 125) return R(A1('wrSpread') > 0.6 ? 'Élévations latérales' : 'Élévations frontales', 0.6);
      return R('Développé militaire', 0.5);
    }
    if (knee > 0.7) return R('Squat', 0.4);
    return R('Pause', 0.3);
  }

  /** Empreinte d'un passage (vecteur de nombres) */
  function fingerprint(st, period) {
    const v = [];
    for (const f of FEATS) {
      if (MSCALE[f] !== Infinity) v.push(st.mean[f] / MSCALE[f]);
      if (SCALE[f] !== Infinity && f !== 'cx') v.push(Math.sqrt(Math.max(0, st.ampN[f])) * 0.9);
    }
    v.push(period ? Math.log2(Math.max(0.3, period)) * 0.4 : 0);
    return v.map((x) => (isFinite(x) ? Math.round(x * 1000) / 1000 : 0));
  }
  function fpDist(a, b) {
    if (!a || !b || a.length !== b.length) return Infinity;
    let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; }
    return Math.sqrt(s / a.length);
  }
  const FP_THR = 0.3;
  /** Plus proche voisin parmi les empreintes apprises */
  function nearest(vec, fps, style) {
    let best = null, bd = Infinity;
    for (const fp of fps || []) {
      if (style && fp.style && fp.style !== style) continue;
      const d = fpDist(vec, fp.vec); if (d < bd) { bd = d; best = fp; }
    }
    return best ? { fp: best, d: bd } : null;
  }

  /** Tempo : « single », « 2/2 », « 3/1 », « pulses »… */
  function tempoLabel(startsT, peaksT, bpm) {
    if (startsT.length < 2) return '';
    const beat = 60 / (bpm || 130);
    const A = [], B = [], D = [];
    for (let j = 0; j < peaksT.length; j++) {
      const s = startsT[j], p = peaksT[j], nx = startsT[j + 1];
      if (nx == null) break; A.push(p - s); B.push(nx - p); D.push(nx - s);
    }
    if (D.length < 2) return '';
    const md = quantile(D, 0.5); const cv = Math.sqrt(D.reduce((x, y) => x + (y - md) * (y - md), 0) / D.length) / md;
    if (cv > 0.3) return '';
    const tot = md / beat; if (tot < 1.5) return 'pulses';
    const a = quantile(A, 0.5), b = quantile(B, 0.5);
    const rt = Math.max(2, Math.round(tot));
    const ra = Math.max(1, Math.min(rt - 1, Math.round(rt * a / (a + b)))), rb = rt - ra;
    if (ra === 1 && rb === 1) return 'single';
    return ra + '/' + rb;
  }

  /** Construit le script d'un morceau à partir d'une séquence ré-échantillonnée */
  function buildScript(seq, opt) {
    opt = opt || {};
    const style = opt.style || 'pump', fpsL = opt.fingerprints || [], vocab = opt.vocab || {};
    const { fps, t0 } = seq;
    let segs = trimIdle(seq, segmentSeq(seq, opt));
    const out = [];
    const analyse = (a, b, forcePause) => {
      const st = segStats(seq, a, b);
      const cands = candidates(seq, a, b);
      const dom = cands[0];
      st.pa = periodicAmps(cands);
      let rep;
      if (dom && dom.alt) {
        const fl = restFlip(dom.name), rl = countReps(dom.alt.L, fps, { flip: fl }), rr = countReps(dom.alt.R, fps, { flip: fl });
        const st2 = rl.starts.concat(rr.starts).sort((x, y) => x - y), pk = rl.peaks.concat(rr.peaks).sort((x, y) => x - y);
        rep = { count: rl.count + rr.count, starts: st2, peaks: pk, rests: [], period: rl.period && rr.period ? (rl.period + rr.period) / 4 : null };
      } else rep = dom ? countReps(dom.z, fps, { flip: restFlip(dom.name) }) : { count: 0, starts: [], peaks: [], rests: [] };
      const vec = fingerprint(st, rep.period || (dom && dom.period));
      let r = ruleName(st, style, dom);
      let source = 'règle';
      const nn = forcePause || !dom || dom.amp < 0.6 || (rep.count < 2 && r.name === 'Pause') ? null : nearest(vec, fpsL, style);
      if (nn && nn.d < FP_THR) {
        const c = 0.6 + 0.35 * (1 - nn.d / FP_THR);
        if (nn.fp.name !== r.name || c > r.conf) { r = { name: nn.fp.name, conf: c }; source = 'appris'; }
      }
      if (forcePause) r = { name: 'Pause', conf: 0.8 };
      // petit morceau de 1 ou 2 répétitions : c'est une transition
      if (!forcePause && rep.count < 3 && (b - a) < fps * 6 && r.name !== 'Gainage') { r = { name: 'Pause', conf: 0.5 }; source = 'règle'; }
      if (r.name === 'Pause' || r.name === 'Gainage') rep = { count: 0, starts: [], peaks: [], rests: [] };
      let conf = r.conf;
      if (dom && dom.per < 0.3 && rep.count > 2) conf *= 0.8;
      const toT = (i) => Math.round((t0 + (a + i) / fps) * 100) / 100;
      const startsT = rep.starts.map(toT), peaksT = rep.peaks.map(toT), restsT = (rep.rests || []).map(toT);
      return {
        name: vocab[r.name] || r.name, base: r.name, reps: rep.count, start: toT(0), end: toT(b - a),
        repTimes: startsT, peakTimes: peaksT, tempo: r.name === 'Pause' || r.name === 'Gainage' ? '' : tempoLabel(restsT.length === peaksT.length ? restsT : startsT, peaksT, opt.bpm),
        conf: Math.round(conf * 100) / 100, source, vec, dom: dom ? dom.name : '', period: rep.period
      };
    };
    for (const [a, b, idle] of segs) { if (idle && (b - a) < fps * 4) continue; out.push(analyse(a, b, idle)); }
    // fusion des voisins identiques
    for (let i = out.length - 1; i > 0; i--) {
      const A = out[i - 1], B = out[i];
      if (A.base === B.base && fpDist(A.vec, B.vec) < 0.22 && (!A.period || !B.period || Math.abs(Math.log2(A.period / B.period)) < 0.4)) {
        const a = Math.round((A.start - t0) * fps), b = Math.round((B.end - t0) * fps);
        out.splice(i - 1, 2, analyse(a, Math.min(seq.n, b)));
      }
    }
    // caler chaque frontière sur le début réel du mouvement suivant
    for (let i = 1; i < out.length; i++) {
      const A = out[i - 1], B = out[i];
      if (!A.reps || !B.reps) continue;
      const a = Math.round((A.start - t0) * fps), c = Math.round((B.start - t0) * fps), b = Math.min(seq.n, Math.round((B.end - t0) * fps));
      const c2 = Math.max(a + Math.round(fps * 2), c - Math.round(fps * 1.5));
      const B2 = analyse(c2, b);
      if (B2.base !== B.base || B2.reps <= B.reps || !B2.repTimes.length) continue;
      const nc = Math.round((B2.repTimes[0] - t0) * fps);
      if (nc >= c || nc <= a + fps) continue;
      // la répétition disputée ressemble-t-elle plus à B qu'à A ?
      const per = Math.round(fps * (B.period || 2));
      const w1 = Math.min(b, nc + per); if (w1 - nc < 3) continue;
      const stw = segStats(seq, nc, w1); stw.pa = null;
      const v = fingerprint(stw, B.period);
      if (!(fpDist(v, B.vec) < fpDist(v, A.vec))) continue;
      const A2 = analyse(a, nc), B3 = analyse(nc, b);
      if (A2.base === A.base && A2.reps >= A.reps - 1 && B3.reps > B.reps) { out[i - 1] = A2; out[i] = B3; }
    }
    // la dernière répétition d'un passage déborde un peu sur le suivant : on la rend au passage
    for (let i = 0; i < out.length; i++) {
      const A = out[i], B = out[i + 1];
      if (!A.reps) continue;
      const a = Math.round((A.start - t0) * fps), c = Math.round((A.end - t0) * fps);
      const freeAfter = !B || B.base === 'Pause';
      const lim = B ? Math.round((B.end - t0) * fps) - (freeAfter ? 0 : Math.round(fps * 2)) : seq.n;
      const c2 = Math.min(seq.n, lim, c + Math.round(fps * (freeAfter ? 2.5 : 1.5)));
      if (c2 <= c + 1) continue;
      const A2 = analyse(a, c2);
      if (A2.base !== A.base || A2.reps < A.reps + 1 || A2.reps > A.reps + (freeAfter ? 2 : 1)) continue;
      const lastPk = A2.peakTimes[A2.peakTimes.length - 1];
      if (!(lastPk <= A.end) && !freeAfter) continue;
      const lastSt = A2.repTimes[A2.repTimes.length - 1];
      const nc = freeAfter ? c2 : Math.min(c2, Math.round((Math.min(A.end + 1.5, lastPk + (lastPk - lastSt) * 1.1) - t0) * fps));
      out[i] = analyse(a, nc);
      if (out[i].reps !== A2.reps) { out[i] = A; continue; }
      if (B) { const b = Math.round((B.end - t0) * fps); if (b - nc >= 2) out[i + 1] = B.base === 'Pause' ? Object.assign({}, B, { start: out[i].end }) : analyse(nc, b); else out.splice(i + 1, 1); }
    }
    // même mouvement, tempo différent : placer la frontière sur la répétition où le rythme change
    for (let i = 1; i < out.length; i++) {
      const A = out[i - 1], B = out[i];
      if (A.base !== B.base || !A.reps || !B.reps || A.base === 'Pause') continue;
      const a = Math.round((A.start - t0) * fps), b = Math.min(seq.n, Math.round((B.end - t0) * fps));
      const U = analyse(a, b); const st = U.repTimes;
      if (st.length < 6) continue;
      const g = []; for (let j = 1; j < st.length; j++) g.push(Math.log(st[j] - st[j - 1]));
      let bj = -1, bc = Infinity;
      for (let j = 2; j <= g.length - 2; j++) {
        const L = g.slice(0, j), R = g.slice(j), ml = mean(L), mr = mean(R);
        let c = 0; for (const x of L) c += (x - ml) ** 2; for (const x of R) c += (x - mr) ** 2;
        if (c < bc) { bc = c; bj = j; }
      }
      if (bj < 0) continue;
      const cut = Math.round((st[bj] - t0) * fps);
      if (cut <= a + 2 || cut >= b - 2) continue;
      out[i - 1] = analyse(a, cut); out[i] = analyse(cut, b);
    }
    // couper les passages « vides » au début et à la fin
    out.forEach((s) => { s.check = s.conf < 0.6 && s.base !== 'Pause'; s.id = Math.random().toString(36).slice(2, 10); });
    return out;
  }

  /** Recalcule un segment sur [start,end] (après coupe/fusion) */
  function analyseRange(seq, start, end, opt) {
    const a = Math.max(0, Math.round((start - seq.t0) * seq.fps)), b = Math.min(seq.n, Math.round((end - seq.t0) * seq.fps));
    if (b - a < 2) return null;
    const sub = { fps: seq.fps, t0: seq.t0 + a / seq.fps, n: b - a, X: seq.X.subarray(a * NF, b * NF), valid: seq.valid.subarray(a, b) };
    const r = buildScript(sub, Object.assign({}, opt, { thr: 1e9 }));
    return r[0];
  }

  /* ======================= 7. Audio : FFT, caractéristiques, alignement ======================= */
  function fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let size = 2; size <= n; size <<= 1) {
      const h = size >> 1, a = (inv ? 2 : -2) * Math.PI / size, wr = Math.cos(a), wi = Math.sin(a);
      for (let s = 0; s < n; s += size) {
        let cr = 1, ci = 0;
        for (let k = 0; k < h; k++) {
          const i = s + k, j = i + h;
          const tr = re[j] * cr - im[j] * ci, ti = re[j] * ci + im[j] * cr;
          re[j] = re[i] - tr; im[j] = im[i] - ti; re[i] += tr; im[i] += ti;
          const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
        }
      }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  const ASR = 8000, AHOP = 160, AFFT = 256; // 8 kHz, 20 ms
  const BANDS = [[1, 3], [3, 5], [5, 8], [8, 13], [13, 20], [20, 32], [32, 52], [52, 84], [84, 128]];

  /** Réduction de fréquence en continu (moyenne par blocs) + calcul des énergies par bande */
  class AudioFeatureStream {
    constructor(inRate) {
      this.ratio = inRate / ASR; this.acc = 0; this.cnt = 0; this.pos = 0; this.edge = this.ratio;
      this.buf = new Float32Array(AFFT * 4); this.bl = 0;
      this.frames = []; for (let b = 0; b < BANDS.length; b++) this.frames.push([]);
      this.re = new Float64Array(AFFT); this.im = new Float64Array(AFFT);
      this.win = new Float64Array(AFFT); for (let i = 0; i < AFFT; i++) this.win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / AFFT);
      this.samples8k = 0;
    }
    /** mono : Float32Array à la fréquence d'entrée */
    push(mono) {
      const r = this.ratio;
      for (let i = 0; i < mono.length; i++) {
        this.acc += mono[i]; this.cnt++; this.pos++;
        if (this.pos >= this.edge) {
          this._out(this.acc / this.cnt); this.acc = 0; this.cnt = 0; this.edge += r;
        }
      }
    }
    _out(v) {
      if (this.bl >= this.buf.length) { // décalage
        this.buf.copyWithin(0, this.buf.length - AFFT); this.bl = AFFT;
      }
      this.buf[this.bl++] = v; this.samples8k++;
      if (this.samples8k >= AFFT && (this.samples8k - AFFT) % AHOP === 0) {
        const o = this.bl - AFFT, re = this.re, im = this.im;
        for (let i = 0; i < AFFT; i++) { re[i] = this.buf[o + i] * this.win[i]; im[i] = 0; }
        fft(re, im, false);
        for (let b = 0; b < BANDS.length; b++) {
          let e = 0; for (let k = BANDS[b][0]; k < BANDS[b][1]; k++) e += re[k] * re[k] + im[k] * im[k];
          this.frames[b].push(Math.log(1e-7 + e));
        }
      }
    }
    finish() {
      return { hop: AHOP / ASR, bands: this.frames.map((a) => Float32Array.from(a)), n: this.frames[0].length };
    }
  }
  function audioFeaturesFromPCM(mono, rate) { const s = new AudioFeatureStream(rate); s.push(mono); return s.finish(); }

  /** Signal « nouveauté » par bande : log-énergie moins la moyenne locale, écrêtée et normalisée */
  function noveltyBands(feat) {
    const k = Math.round(0.6 / feat.hop) | 1;
    return feat.bands.map((e) => {
      const m = smooth(e, k), n = e.length, d = new Float64Array(n);
      for (let i = 0; i < n; i++) d[i] = e[i] - m[i];
      let s2 = 0; for (let i = 0; i < n; i++) s2 += d[i] * d[i]; const sd = Math.sqrt(s2 / Math.max(1, n)) || 1;
      for (let i = 0; i < n; i++) d[i] = Math.max(-2.5, Math.min(2.5, d[i] / sd));
      return d;
    });
  }

  /** Prépare la vidéo pour plusieurs alignements (FFT mises en cache) */
  function prepareVideo(feat, maxMusicFrames) {
    const nov = noveltyBands(feat), N = feat.n;
    const M = maxMusicFrames || Math.round(12 * 60 / feat.hop);
    let L = 1; while (L < N + M) L <<= 1;
    const spec = nov.map((d) => {
      const re = new Float64Array(L), im = new Float64Array(L); re.set(d); fft(re, im, false); return { re, im };
    });
    const sq = nov.map((d) => { const c = new Float64Array(N + 1); for (let i = 0; i < N; i++) c[i + 1] = c[i] + d[i] * d[i]; return c; });
    return { nov, spec, sq, N, L, hop: feat.hop };
  }

  /** Trouve où la musique commence dans la vidéo. Renvoie {offset (s), score, conf} ou null.
      offset = temps vidéo où la musique est à 0 s (peut être négatif). */
  function alignMusic(vprep, mfeat, opt) {
    opt = opt || {};
    const { N, L, hop } = vprep; const mn = noveltyBands(mfeat), M = mfeat.n;
    if (M + N > L) throw new Error('musique trop longue pour la préparation');
    const minOv = Math.min(Math.round(30 / hop), Math.round(M * 0.5));
    const tot = new Float64Array(L);
    const nb = mn.length;
    const perBand = [];
    for (let b = 0; b < nb; b++) {
      const re = new Float64Array(L), im = new Float64Array(L); re.set(mn[b]);
      fft(re, im, false);
      const V = vprep.spec[b];
      // corrélation : IFFT(V * conj(Mu))
      const cr = new Float64Array(L), ci = new Float64Array(L);
      for (let i = 0; i < L; i++) { cr[i] = V.re[i] * re[i] + V.im[i] * im[i]; ci[i] = V.im[i] * re[i] - V.re[i] * im[i]; }
      fft(cr, ci, true);
      const mq = new Float64Array(M + 1); for (let i = 0; i < M; i++) mq[i + 1] = mq[i] + mn[b][i] * mn[b][i];
      const vq = vprep.sq[b];
      const arr = new Float64Array(L);
      for (let idx = 0; idx < L; idx++) {
        const lag = idx < L - M ? idx : idx - L; // lag = position vidéo du début de la musique
        if (lag > N - minOv || lag < -(M - minOv)) { arr[idx] = 0; continue; }
        const v0 = Math.max(0, lag), v1 = Math.min(N, lag + M), m0 = v0 - lag, m1 = v1 - lag;
        if (v1 - v0 < minOv) { arr[idx] = 0; continue; }
        const den = Math.sqrt((vq[v1] - vq[v0]) * (mq[m1] - mq[m0])) || 1e-9;
        arr[idx] = cr[idx] / den * Math.sqrt((v1 - v0) / Math.min(M, N));
      }
      perBand.push(arr);
    }
    // combinaison robuste : moyenne des bandes après avoir retiré la plus faible et la plus forte
    for (let idx = 0; idx < L; idx++) {
      const vals = []; for (let b = 0; b < nb; b++) vals.push(perBand[b][idx]);
      vals.sort((x, y) => x - y); let s = 0; for (let b = 1; b < nb - 1; b++) s += vals[b];
      tot[idx] = s / (nb - 2);
    }
    let bi = 0, bv = -1e9;
    const lagOf = (idx) => (idx < L - M ? idx : idx - L);
    const rangeOk = (idx) => { const lg = lagOf(idx) * hop; return (opt.minT == null || lg >= opt.minT) && (opt.maxT == null || lg <= opt.maxT); };
    for (let i = 0; i < L; i++) if (tot[i] > bv && rangeOk(i)) { bv = tot[i]; bi = i; }
    if (bv <= 0) return null;
    // second meilleur pic éloigné de plus de 3 s
    const ex = Math.round(3 / hop); let sv = 0;
    const vals = [];
    for (let i = 0; i < L; i++) {
      if (!rangeOk(i)) continue; const dd = Math.abs(lagOf(i) - lagOf(bi));
      if (tot[i] !== 0) vals.push(tot[i]);
      if (dd > ex && tot[i] > sv) sv = tot[i];
    }
    const a = tot[(bi - 1 + L) % L], b = tot[bi], c = tot[(bi + 1) % L], den = a - 2 * b + c;
    const off = den !== 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (a - c) / den)) : 0;
    const offset = (lagOf(bi) + off) * hop;
    const ratio = sv > 0 ? bv / sv : 9;
    let m1 = 0, m2 = 0; for (const v of vals) { m1 += v; m2 += v * v; } m1 /= vals.length || 1;
    const sd = Math.sqrt(Math.max(1e-12, m2 / (vals.length || 1) - m1 * m1)), z = (bv - m1) / sd;
    // confiance : pic qui sort du lot (z) OU corrélation forte en elle-même
    const conf = Math.max(0, Math.min(1, Math.max((z - 5) / 10, (bv - 0.12) / 0.25)));
    return { offset: Math.round(offset * 1000) / 1000, score: Math.round(bv * 1000) / 1000, ratio: Math.round(ratio * 100) / 100, z: Math.round(z * 10) / 10, conf: Math.round(conf * 100) / 100 };
  }

  /* ---------- 7b. Recalage prudent : on n'accepte une musique que si on en est sûr ---------- */
  const GROUPS3 = [[0, 1, 2], [3, 4, 5], [6, 7, 8]], SM3 = 7, DEC = 4; // recherche grossière : 3 bandes lissées, 1 image sur 4 (80 ms)
  function merge3(nov) {
    return GROUPS3.map((g) => { const n = nov[0].length, o = new Float64Array(n); for (const b of g) { const d = nov[b]; for (let i = 0; i < n; i++) o[i] += d[i] / g.length; } return o; });
  }
  function coarse(nov) {
    return merge3(nov).map((d) => { const sm = smooth(d, SM3), n = Math.floor(sm.length / DEC), o = new Float64Array(n); for (let i = 0; i < n; i++) { let x = 0; for (let k = 0; k < DEC; k++) x += sm[i * DEC + k]; o[i] = x / DEC; } return o; });
  }
  function specOf(sig, L) {
    const re = new Float64Array(L), im = new Float64Array(L); re.set(sig.length > L ? sig.subarray(0, L) : sig); fft(re, im, false);
    return { re: Float32Array.from(re), im: Float32Array.from(im) };
  }
  function prefSq(d) { const c = new Float64Array(d.length + 1); for (let i = 0; i < d.length; i++) c[i + 1] = c[i] + d[i] * d[i]; return c; }

  /** Prépare la vidéo pour la recherche prudente des musiques */
  function prepareVideo2(feat, maxMusicFrames) {
    const nov = noveltyBands(feat), N = feat.n;
    const M = Math.round((maxMusicFrames || Math.round(12 * 60 / feat.hop)) * 1.08 / DEC) + 10;
    const c3 = coarse(nov), N4 = c3[0].length;
    let L = 1; while (L < N4 + M) L <<= 1;
    return { v2: true, nov, sq9: nov.map(prefSq), N, hop: feat.hop, dur: N * feat.hop, c: { N: N4, L, spec: c3.map((d) => specOf(d, L)), sq: c3.map(prefSq) } };
  }
  /** Étire un signal : s > 1 = la musique est jouée plus vite dans la vidéo */
  function stretchSig(a, s) {
    if (Math.abs(s - 1) < 1e-9) return a;
    const n = Math.max(1, Math.floor((a.length - 1) / s) + 1), o = new Float64Array(n);
    for (let i = 0; i < n; i++) { const p = i * s, k = Math.floor(p), f = p - k; o[i] = k + 1 < a.length ? a[k] * (1 - f) + a[k + 1] * f : a[a.length - 1]; }
    return o;
  }
  /** Corrélation normalisée vidéo × extrait de musique pour tous les décalages [lagMin, lagMax] (FFT) */
  function corrAll(vc, mb, lagMin, lagMax) {
    const L = vc.L, N = vc.N, M = mb[0].length, nb = mb.length;
    const tot = new Float64Array(Math.max(0, lagMax - lagMin + 1));
    if (M + N > L || !tot.length) return tot;
    for (let b = 0; b < nb; b++) {
      const re = new Float64Array(L), im = new Float64Array(L); re.set(mb[b]); fft(re, im, false);
      const V = vc.spec[b], cr = new Float64Array(L), ci = new Float64Array(L);
      for (let i = 0; i < L; i++) { cr[i] = V.re[i] * re[i] + V.im[i] * im[i]; ci[i] = V.im[i] * re[i] - V.re[i] * im[i]; }
      fft(cr, ci, true);
      const mq = prefSq(mb[b]), vq = vc.sq[b];
      for (let lag = lagMin; lag <= lagMax; lag++) {
        const idx = ((lag % L) + L) % L;
        const v0 = Math.max(0, lag), v1 = Math.min(N, lag + M), m0 = v0 - lag, m1 = v1 - lag;
        if (v1 - v0 < 20) continue;
        const den = Math.sqrt((vq[v1] - vq[v0]) * (mq[m1] - mq[m0])) || 1e-9;
        tot[lag - lagMin] += cr[idx] / den * Math.sqrt((v1 - v0) / M) / nb;
      }
    }
    return tot;
  }
  function topPeaks(tot, k, sep) {
    const idx = [];
    for (let i = 0; i < tot.length; i++) if (tot[i] > 0 && (i === 0 || tot[i] >= tot[i - 1]) && (i === tot.length - 1 || tot[i] >= tot[i + 1])) idx.push(i);
    idx.sort((a, b) => tot[b] - tot[a]);
    const out = []; for (const i of idx) { if (out.every((j) => Math.abs(j - i) >= sep)) out.push(i); if (out.length >= k) break; }
    return out;
  }
  /** Vérification tranche par tranche : chaque tranche de 8 s de la musique doit se retrouver
      au même endroit de la vidéo (sur une droite, pour tolérer une petite différence de vitesse),
      avec un pic net (pas seulement « le même tempo »). */
  function verifyChunks(vp, mb, lag, trS, trE, opt) {
    opt = opt || {};
    const hop = vp.hop, N = vp.N, nb = mb.length;
    const CH = Math.round(8 / hop), SR = Math.round(1.5 / hop), EX = Math.round(0.25 / hop);
    const pts = []; let nE = 0, firstE = -1, lastE = -1;
    const mq = mb.map(prefSq), vals = new Float64Array(nb), cc = new Float64Array(2 * SR + 1);
    const isGood = (p) => p.sharp > (opt.minSharp || 0.05) && p.val > (opt.minVal || 0.1);
    const W4 = Math.round(0.4 / hop);
    for (let c = trS; c + CH <= trE; c += CH) {
      if (nE === 10 && !opt.full) { // arrêt rapide : après 10 tranches, presque rien d'aligné → ce n'est pas cette musique
        const g = pts.filter(isGood); let mx = 0; for (const p of g) mx = Math.max(mx, g.filter((q) => Math.abs(q.d - p.d) <= W4).length);
        if (mx < 3) return { chunks: pts.length, energetic: nE, inliers: mx, frac: 0, span: 0, maxGap: 1, edge: 1, a: 0, slope: 0, sharp: 0, early: true };
      }
      let e = 0; for (let b = 0; b < nb; b++) e += (mq[b][c + CH] - mq[b][c]) / CH; e /= nb;
      if (e < 0.25) continue; // tranche calme (pont, silence) : pas utilisable
      nE++; cc.fill(-1); if (firstE < 0) firstE = c; lastE = c + CH;
      for (let d = -SR; d <= SR; d++) {
        const v0 = lag + c + d; if (v0 < 0 || v0 + CH > N) continue;
        for (let b = 0; b < nb; b++) {
          const m = mb[b], v = vp.nov[b]; let s = 0;
          for (let q = 0; q < CH; q++) s += m[c + q] * v[v0 + q];
          vals[b] = s / (Math.sqrt((mq[b][c + CH] - mq[b][c]) * (vp.sq9[b][v0 + CH] - vp.sq9[b][v0])) || 1e-9);
        }
        vals.sort(); let s = 0; for (let b = 1; b < nb - 1; b++) s += vals[b]; cc[d + SR] = s / (nb - 2);
      }
      let bi = 0; for (let i = 1; i < cc.length; i++) if (cc[i] > cc[bi]) bi = i;
      if (cc[bi] <= -1) continue;
      let other = -1; for (let i = 0; i < cc.length; i++) if (Math.abs(i - bi) > EX && cc[i] > other) other = cc[i];
      pts.push({ tau: c + CH / 2, d: bi - SR, val: cc[bi], sharp: cc[bi] - other });
    }
    const good = pts.filter(isGood);
    const tolF = Math.max(2, Math.round(0.08 / hop)), SLM = 0.008;
    let best = { n: 0, a: 0, sl: 0, inl: [] };
    const tryLine = (a, sl) => {
      const inl = good.filter((p) => Math.abs(p.d - (a + sl * (p.tau - trS))) <= tolF);
      if (inl.length > best.n) best = { n: inl.length, a, sl, inl };
    };
    for (const p of good) tryLine(p.d, 0);
    for (let i = 0; i < good.length; i++) for (let j = i + 1; j < good.length; j++) {
      const sl = (good[j].d - good[i].d) / (good[j].tau - good[i].tau);
      if (Math.abs(sl) <= SLM) tryLine(good[i].d - sl * (good[i].tau - trS), sl);
    }
    if (best.n >= 3) { // ajustement final (moindres carrés sur les tranches retenues)
      const xs = best.inl.map((p) => p.tau - trS), ys = best.inl.map((p) => p.d);
      const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0;
      for (let i = 0; i < xs.length; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
      const sl = sxx > 0 ? Math.max(-SLM, Math.min(SLM, sxy / sxx)) : 0;
      best.sl = sl; best.a = my - sl * mx;
    }
    const len = trE - trS;
    const taus = best.inl.map((p) => p.tau).sort((x, y) => x - y);
    const span = taus.length ? Math.min(1, (taus[taus.length - 1] - taus[0] + CH) / len) : 0;
    // trous : au début / à la fin (par rapport aux tranches utilisables) et au milieu
    const edge = taus.length ? Math.max(taus[0] - CH / 2 - firstE, lastE - taus[taus.length - 1] - CH / 2) / len : 1;
    let maxGap = 0;
    for (let i = 1; i < taus.length; i++) maxGap = Math.max(maxGap, taus[i] - taus[i - 1]);
    return { chunks: pts.length, energetic: nE, inliers: best.n, frac: nE ? best.n / nE : 0, span, maxGap: taus.length ? maxGap / len : 1, edge: Math.max(0, edge), a: best.a, slope: best.sl, sharp: mean(best.inl.map((p) => p.sharp)) || 0 };
  }

  const FACTORS = [1, 0.99, 1.01, 0.98, 1.02, 0.97, 1.03, 0.96, 1.04, 0.95, 1.05, 0.94, 1.06];
  /** Cherche une musique dans la vidéo, prudemment (vitesse exacte puis ±1 à ±6 %).
      Renvoie {ok, offset, ratio, start, end, conf, why} ; temps vidéo = offset + temps musique × ratio.
      ok = true seulement si la musique est retrouvée tranche par tranche sur presque toute sa longueur,
      entièrement dans la vidéo (± tol secondes). */
  function findMusic(vp, mfeat, opt) {
    opt = opt || {};
    const hop = vp.hop, N = vp.N, tol = opt.tol == null ? 6 : opt.tol, hc = hop * DEC;
    const tr = trimSilence(mfeat);
    const mnov = noveltyBands(mfeat);
    const factors = opt.factors || FACTORS;
    let bestRej = null, tries = 0;
    for (const s of factors) {
      const mb9 = mnov.map((d) => stretchSig(d, s));
      const M = mb9[0].length;
      const trS = Math.round(tr.start / hop / s), trE = Math.min(M, Math.round(tr.end / hop / s));
      if (trE - trS < Math.round(30 / hop)) return { ok: false, why: 'courte', conf: 0, frac: 0 };
      // décalages autorisés : la musique (sans ses silences) doit être entièrement dans la vidéo (± tol)
      let lagMin = Math.round(-tol / hop) - trS, lagMax = N + Math.round(tol / hop) - trE;
      if (opt.minT != null) lagMin = Math.max(lagMin, Math.round(opt.minT / hop));
      if (opt.maxT != null) lagMax = Math.min(lagMax, Math.round(opt.maxT / hop));
      if (lagMax < lagMin) { bestRej = bestRej || { ok: false, why: 'dépasse', conf: 0, frac: 0 }; continue; }
      // candidats (recherche grossière) : musique entière + deux tranches de 40 s
      const m3 = coarse(mb9), cands = [];
      const cl0 = Math.floor(lagMin / DEC), cl1 = Math.ceil(lagMax / DEC);
      const tot = corrAll(vp.c, m3, cl0, cl1);
      for (const pi of topPeaks(tot, 2, Math.round(5 / hc))) cands.push({ lag: (cl0 + pi) * DEC, peak: tot[pi] });
      const CL = Math.round(40 / hc), s4 = Math.floor(trS / DEC), e4 = Math.floor(trE / DEC);
      for (const fr of [0.3, 0.7]) {
        const cs = Math.max(s4, Math.min(e4 - CL, Math.round(s4 + fr * (e4 - s4) - CL / 2))); if (cs < 0 || cs + CL > m3[0].length) continue;
        const t2 = corrAll(vp.c, m3.map((d) => d.subarray(cs, cs + CL)), cl0 + cs, cl1 + cs);
        for (const pi of topPeaks(t2, 1, 1)) cands.push({ lag: (cl0 + pi) * DEC, peak: t2[pi] });
      }
      const seen = [];
      for (const cd of cands.sort((x, y) => y.peak - x.peak)) {
        const lag = cd.lag; if (seen.some((x) => Math.abs(x - lag) < Math.round(1 / hop))) continue; seen.push(lag);
        const v = verifyChunks(vp, mb9, lag, trS, trE); tries++;
        const ok = v.inliers >= Math.max(5, Math.ceil(0.4 * v.energetic)) && v.span >= 0.75 && v.maxGap <= 0.3 && v.edge <= 0.15;
        const ratio = (1 + v.slope) / s, offset = (lag + v.a - v.slope * trS) * hop;
        const r = { ok, s, offset: Math.round(offset * 1000) / 1000, ratio: Math.round(ratio * 10000) / 10000, start: Math.round((offset + tr.start * ratio) * 10) / 10, end: Math.round((offset + tr.end * ratio) * 10) / 10,
          conf: Math.round(Math.min(1, v.frac * 1.2) * v.span * 100) / 100, frac: Math.round(v.frac * 100) / 100, span: Math.round(v.span * 100) / 100, inliers: v.inliers, energetic: v.energetic, edge: Math.round(v.edge * 100) / 100, peak: Math.round(cd.peak * 1000) / 1000 };
        if (ok && (r.start < -tol || r.end > vp.dur + tol)) { r.ok = false; r.why = 'dépasse'; }
        if (r.ok) return Object.assign(r, { tries });
        if (!bestRej || r.frac > (bestRej.frac || 0)) bestRej = Object.assign({}, r, { ok: false, why: r.why || 'pas sûr' });
      }
    }
    return Object.assign(bestRej || { ok: false, why: 'introuvable', conf: 0 }, { tries });
  }

  /** Place les musiques trouvées sans chevauchement (la plus sûre d'abord). items = [{id, res}] */
  function placeMusics(items, maxOverlap) {
    maxOverlap = maxOverlap == null ? 8 : maxOverlap;
    const ok = items.filter((x) => x.res && x.res.ok).sort((a, b) => b.res.conf - a.res.conf);
    const placed = [];
    for (const x of ok) {
      const clash = placed.some((p) => Math.min(p.res.end, x.res.end) - Math.max(p.res.start, x.res.start) > maxOverlap);
      if (clash) { x.res = Object.assign({}, x.res, { ok: false, why: 'chevauche' }); continue; }
      placed.push(x);
    }
    return placed.sort((a, b) => a.res.start - b.res.start);
  }

  /** Découpage proposé par les creux d'énergie des basses (la voix a peu de basses) */
  function silenceCuts(feat, opt) {
    opt = opt || {};
    const hop = feat.hop, n = feat.n; if (!n) return [];
    const k = Math.round(1 / hop);
    const low = new Float64Array(n);
    for (let i = 0; i < n; i++) low[i] = Math.max(feat.bands[0][i], feat.bands[1][i], feat.bands[2][i]);
    const env = smooth(low, k * 2 + 1);
    const hi = quantile(env, 0.7), lo = quantile(env, 0.05);
    const thr = lo + (hi - lo) * 0.35;
    const minGap = Math.round((opt.minGap || 1.5) / hop), minSong = Math.round((opt.minSong || 90) / hop);
    const gaps = []; let s = -1;
    for (let i = 0; i <= n; i++) {
      const q = i < n && env[i] < thr;
      if (q && s < 0) s = i; if (!q && s >= 0) { if (i - s >= minGap) { let mi = s; for (let j = s; j < i; j++) if (env[j] < env[mi]) mi = j; gaps.push({ c: (s + i) / 2, depth: hi - env[mi], s, e: i }); } s = -1; }
    }
    gaps.sort((x, y) => y.depth - x.depth);
    const kept = [];
    for (const g of gaps) if (g.c > minSong / 3 && n - g.c > minSong / 3 && kept.every((x) => Math.abs(x.c - g.c) >= minSong)) kept.push(g);
    kept.sort((x, y) => x.c - y.c);
    return kept.map((g) => ({ t: Math.round(g.c * hop * 10) / 10, start: g.s * hop, end: g.e * hop }));
  }

  /* ---------- 7c. Découpage en morceaux par les blancs entre musiques ---------- */
  function sliceFeat(feat, t0, t1) {
    const a = Math.max(0, Math.round(t0 / feat.hop)), b = Math.min(feat.n, Math.round(t1 / feat.hop));
    return { hop: feat.hop, n: Math.max(0, b - a), bands: feat.bands.map((x) => x.subarray(a, Math.max(a, b))) };
  }
  function minFilter(a, k) { // minimum glissant (largeur 2k+1)
    const n = a.length, o = new Float64Array(n);
    for (let i = 0; i < n; i++) { let m = Infinity; for (let j = Math.max(0, i - k); j <= Math.min(n - 1, i + k); j++) if (a[j] < m) m = a[j]; o[i] = m; }
    return o;
  }
  /** Niveau « musique » : minimum sur 0,4 s (efface la voix, qui a des petites pauses) puis lissage */
  function musicLevel(feat) {
    const hop = feat.hop, n = feat.n, k = Math.round(0.2 / hop), sm = Math.round(0.5 / hop) | 1;
    const step = 5; // on calcule à 10 images/s pour aller vite
    const m = Math.ceil(n / step), low = new Float64Array(m), broad = new Float64Array(m);
    const mf = feat.bands.map((b) => { const d = new Float64Array(m); for (let i = 0; i < m; i++) { let s = 0, c = 0; for (let j = i * step; j < Math.min(n, i * step + step); j++) { s += b[j]; c++; } d[i] = s / c; } return minFilter(d, Math.max(1, Math.round(k / step))); });
    for (let i = 0; i < m; i++) { low[i] = Math.max(mf[0][i], mf[1][i]); let s = 0; for (let b = 0; b < mf.length; b++) s += mf[b][i]; broad[i] = s / mf.length; }
    return { hop: hop * step, low: smooth(low, Math.max(1, Math.round(sm / step)) | 1), broad: smooth(broad, Math.max(1, Math.round(sm / step)) | 1) };
  }
  /** Propose les coupures entre morceaux.
      opt.expected = nombre de musiques attendues (facultatif) ; opt.minSong, opt.maxSong (s).
      Renvoie {cuts:[{t, score}], pieces:[{start, end}]} */
  function cutSongs(feat, opt) {
    opt = opt || {};
    const minSong = opt.minSong || 120, maxSong = opt.maxSong || 600, edgeMin = opt.edgeMin || 40;
    const ml = musicLevel(feat), h = ml.hop, m = ml.low.length, dur = feat.n * feat.hop;
    // niveau de référence local (±30 s) : on mesure la profondeur de chaque creux par rapport à lui
    const B = Math.round(1 / h), nb = Math.ceil(m / B);
    const blk = (arr) => { const o = new Float64Array(nb); for (let i = 0; i < nb; i++) o[i] = quantile(arr.subarray(i * B, Math.min(m, i * B + B)), 0.5); return o; };
    const bl = blk(ml.low), bb = blk(ml.broad);
    const ref = (arr, i) => quantile(arr.subarray(Math.max(0, i - 30), Math.min(nb, i + 31)), 0.65);
    const refL = new Float64Array(nb), refB = new Float64Array(nb);
    for (let i = 0; i < nb; i++) { refL[i] = ref(bl, i); refB[i] = ref(bb, i); }
    const dL = new Float64Array(m), dB = new Float64Array(m);
    for (let i = 0; i < m; i++) { const j = Math.min(nb - 1, Math.floor(i / B)); dL[i] = refL[j] - ml.low[i]; dB[i] = refB[j] - ml.broad[i]; }
    // creux : la musique baisse nettement (basses ET ensemble)
    const sc = new Float64Array(m); for (let i = 0; i < m; i++) sc[i] = Math.max(0, Math.min(dL[i], 6)) * 0.5 + Math.max(0, Math.min(dB[i], 5));
    const TH = opt.th || 1.2, gaps = []; let s = -1;
    for (let i = 0; i <= m; i++) {
      const q = i < m && sc[i] > TH;
      if (q && s < 0) s = i;
      if (!q && s >= 0) {
        let mx = s; for (let j = s; j < i; j++) if (sc[j] > sc[mx]) mx = j;
        gaps.push({ s: s * h, e: i * h, c: mx * h, score: sc[mx], len: (i - s) * h }); s = -1;
      }
    }
    // creux très proches (la voix a « rallumé » un instant) : on les réunit
    for (let i = gaps.length - 1; i > 0; i--) {
      const A = gaps[i - 1], G = gaps[i];
      if (G.s - A.e < 1.5) gaps.splice(i - 1, 2, { s: A.s, e: G.e, c: A.score >= G.score ? A.c : G.c, score: Math.max(A.score, G.score), len: G.e - A.s });
    }
    // longues zones sans musique (paroles seules) : toujours des limites
    const silent = gaps.filter((g) => g.len >= 12);
    const regions = []; let r0 = 0;
    for (const g of silent) { if (g.s - r0 > 1) regions.push([r0, g.s]); r0 = g.e; }
    if (dur - r0 > 1) regions.push([r0, dur]);
    // changement de tempo de part et d'autre d'un creux : bonus
    const bpmAt = (t0, t1) => { if (t1 - t0 < 15) return null; return estimateBPM(sliceFeat(feat, t0, t1)); };
    const top = new Set(gaps.filter((g) => g.len < 12 && g.len >= 0.5).sort((x, y) => y.score - x.score).slice(0, 40));
    const cand = gaps.filter((g) => g.len < 12 && g.len >= 0.5).map((g) => {
      if (!top.has(g)) return Object.assign({}, g, { score: g.score + Math.min(1, g.len / 3) * 0.5 });
      const b1 = bpmAt(Math.max(0, g.s - 35), g.s - 2), b2 = bpmAt(g.e + 2, Math.min(dur, g.e + 35));
      const ch = b1 && b2 ? Math.min(...[1, 2, 0.5].map((k) => Math.abs(Math.log2(b1 * k / b2)))) : 0;
      return Object.assign({}, g, { bpm1: b1, bpm2: b2, score: g.score + (ch > 0.015 ? 0.8 : 0) + Math.min(1, g.len / 3) * 0.5 });
    });
    const chosen = [];
    const pieceOk = (cuts) => {
      for (const [a, b] of regions) {
        const cs = cuts.filter((t) => t > a && t < b).sort((x, y) => x - y), pts = [a].concat(cs, [b]);
        for (let i = 0; i + 1 < pts.length; i++) {
          const len = pts[i + 1] - pts[i], edge = (i === 0 && a === 0) || (i === pts.length - 2 && Math.abs(b - dur) < 1);
          if (len < (edge && cs.length ? edgeMin : minSong) && cs.length) return false;
        }
      }
      return true;
    };
    const nPieces = (cuts) => regions.reduce((acc, [a, b]) => acc + 1 + cuts.filter((t) => t > a && t < b).length, 0);
    const sorted = cand.slice().sort((x, y) => y.score - x.score);
    const want = opt.expected || 0;
    // sans nombre attendu : seuil relatif aux creux les plus nets (les vrais blancs entre musiques)
    const relTh = sorted.length >= 3 ? 0.8 * sorted[2].score : 0;
    for (const g of sorted) {
      if (want && nPieces(chosen.map((x) => x.c)) >= want) break;
      if (!want && g.score < Math.max(opt.minScore || 2.2, relTh)) break;
      if (want && g.score < 1.6) break;
      const trial = chosen.map((x) => x.c).concat([g.c]);
      if (pieceOk(trial)) chosen.push(g);
    }
    // morceaux trop longs : on coupe au meilleur creux restant
    for (let guard = 0; guard < 30; guard++) {
      const cuts = chosen.map((x) => x.c).sort((x, y) => x - y); let fixed = false;
      for (const [a, b] of regions) {
        const pts = [a].concat(cuts.filter((t) => t > a && t < b), [b]);
        for (let i = 0; i + 1 < pts.length && !fixed; i++) {
          if (pts[i + 1] - pts[i] <= maxSong) continue;
          const inside = sorted.filter((g) => g.c > pts[i] + minSong && g.c < pts[i + 1] - minSong && !chosen.includes(g));
          if (inside.length) { chosen.push(inside[0]); fixed = true; }
        }
      }
      if (!fixed) break;
    }
    const cuts = chosen.sort((x, y) => x.c - y.c);
    const pieces = [];
    for (const [a, b] of regions) {
      const pts = [a].concat(cuts.filter((g) => g.c > a && g.c < b).map((g) => g.c), [b]);
      for (let i = 0; i + 1 < pts.length; i++) if (pts[i + 1] - pts[i] >= Math.min(edgeMin, minSong)) pieces.push({ start: Math.round(pts[i] * 10) / 10, end: Math.round(pts[i + 1] * 10) / 10 });
    }
    return { cuts: cuts.map((g) => ({ t: Math.round(g.c * 10) / 10, score: Math.round(g.score * 100) / 100 })), pieces, silent: silent.map((g) => [g.s, g.e]) };
  }

  /** Numéro dans un nom de fichier (« 03 - Squats », « Track 7 »…) ou null */
  function trackNumber(name) {
    const s = String(name || '').replace(/(19|20)\d\d/g, ' ').replace(/\b\d{3,}\b/g, ' ');
    const m = s.match(/(?:^|[^0-9])(\d{1,2})(?=[^0-9]|$)/); return m ? +m[1] : null;
  }
  function bpmCost(a, b) {
    if (!a || !b) return 0.4;
    const d = Math.min(...[1, 2, 0.5].map((k) => Math.abs(a * k - b)));
    return Math.min(1.5, d / 6);
  }
  /** Pour chaque morceau, la musique la plus probable.
      segs = [{start, end, bpm, musicId (déjà placée sûrement)}] ; musics = [{id, name, duration, bpm}]
      Renvoie [{musicId|null, cost, sure}] (même ordre que segs) */
  function proposeMusics(segs, musics) {
    const nums = musics.map((m) => trackNumber(m.name));
    const known = nums.filter((x) => x != null), uniq = new Set(known).size >= Math.max(2, 0.6 * musics.length);
    const fixed = new Set(segs.filter((s) => s.musicId).map((s) => s.musicId));
    const free = musics.filter((m) => !fixed.has(m.id));
    const cost = (s, m) => Math.min(2, Math.abs((s.end - s.start) - (m.duration || 0)) / 90) + bpmCost(s.bpm, m.bpm);
    const out = segs.map((s) => (s.musicId ? { musicId: s.musicId, cost: 0, sure: true, fixed: true } : { musicId: null, cost: Infinity, sure: false }));
    if (uniq) {
      // ordre des numéros : alignement dans l'ordre (on peut sauter un morceau ou une musique)
      const ord = musics.map((m, i) => ({ m, n: nums[i] == null ? 1e6 + i : nums[i] })).sort((a, b) => a.n - b.n || String(a.m.name).localeCompare(String(b.m.name))).map((x) => x.m);
      const I = segs.length, J = ord.length, INF = 1e9, SKS = 1.3, SKM = 1.0;
      const dp = Array.from({ length: I + 1 }, () => new Float64Array(J + 1).fill(INF)), bk = Array.from({ length: I + 1 }, () => new Int8Array(J + 1));
      dp[0][0] = 0;
      const mc = (i, j) => {
        const s = segs[i], m = ord[j];
        if (s.musicId) return s.musicId === m.id ? 0 : INF;
        if (fixed.has(m.id)) return INF;
        return cost(s, m);
      };
      for (let i = 0; i <= I; i++) for (let j = 0; j <= J; j++) {
        if (i === 0 && j === 0) continue;
        let b = INF, w = 0;
        if (i > 0 && j > 0 && dp[i - 1][j - 1] + mc(i - 1, j - 1) < b) { b = dp[i - 1][j - 1] + mc(i - 1, j - 1); w = 1; }
        if (i > 0 && !segs[i - 1].musicId && dp[i - 1][j] + SKS < b) { b = dp[i - 1][j] + SKS; w = 2; }
        if (j > 0 && !fixed.has(ord[j - 1].id) && dp[i][j - 1] + SKM < b) { b = dp[i][j - 1] + SKM; w = 3; }
        dp[i][j] = b; bk[i][j] = w;
      }
      let i = I, j = J;
      while (i > 0 || j > 0) {
        const w = bk[i][j];
        if (w === 1) { const c = mc(i - 1, j - 1); if (!segs[i - 1].musicId) out[i - 1] = { musicId: ord[j - 1].id, cost: c, sure: c < 0.8, byOrder: true }; i--; j--; }
        else if (w === 2) i--; else if (w === 3) j--; else break;
      }
    } else {
      // pas de numéros : durée et tempo seulement (les paires les plus proches d'abord)
      const pairs = [];
      segs.forEach((s, i) => { if (!s.musicId) free.forEach((m) => pairs.push({ i, m, c: cost(s, m) })); });
      pairs.sort((a, b) => a.c - b.c); const used = new Set();
      for (const p of pairs) { if (out[p.i].musicId || used.has(p.m.id) || p.c > 1.6) continue; out[p.i] = { musicId: p.m.id, cost: p.c, sure: false }; used.add(p.m.id); }
    }
    return out;
  }

  /* ---------- 7d. Rythme : premier temps fort, adaptation au tempo de la musique ---------- */
  /** Premier temps fort après t0 (attaque de la musique), en s. bpm facultatif. */
  function firstBeat(feat, t0, t1, bpm) {
    const hop = feat.hop; t1 = Math.min(t1 == null ? t0 + 30 : t1, feat.n * hop);
    const a = Math.max(1, Math.round(t0 / hop)), b = Math.min(feat.n, Math.round(t1 / hop)); if (b - a < 50) return t0;
    const n = b - a, on = new Float64Array(n), low = new Float64Array(n);
    for (let i = 0; i < n; i++) { const k = a + i; let s = 0; for (let q = 0; q < 3; q++) s += Math.max(0, feat.bands[q][k] - feat.bands[q][k - 1]); on[i] = s; low[i] = Math.max(feat.bands[0][k], feat.bands[1][k]); }
    const ls = smooth(low, Math.round(0.2 / hop) | 1), hi = quantile(ls, 0.9), lo = quantile(ls, 0.05);
    let att = 0; while (att < n && ls[att] < lo + 0.5 * (hi - lo)) att++;
    if (att >= n) return t0;
    bpm = bpm || estimateBPM(sliceFeat(feat, t0, t1)) || 128;
    const P = 60 / bpm / hop, W = Math.min(n, att + Math.round(16 * P));
    let bp = 0, bv = -1;
    for (let ph = 0; ph < P; ph += 0.25) {
      let s = 0; for (let k = att + ph; k < W; k += P) { const i = Math.floor(k), f = k - i; if (i + 1 < n) s += on[i] * (1 - f) + on[i + 1] * f; }
      if (s > bv) { bv = s; bp = ph; }
    }
    // premier temps de la grille qui n'arrive pas avant l'attaque
    let k = att + bp; while (k - P >= att - 0.3 * P) k -= P;
    return Math.round((t0 + k * hop) * 1000) / 1000;
  }
  /** Lien musique ↔ vidéo quand la musique n'a pas le même tempo : temps vidéo = v0 + (t musique − a0) × ratio */
  function makeSync(o) {
    let mb = o.mBpm, vb = o.vBpm;
    if (mb && vb) { while (mb / vb > 1.4) mb /= 2; while (mb / vb < 0.71) mb *= 2; }
    let ratio = mb && vb ? mb / vb : 1;
    if (Math.abs(ratio - 1) < 0.004 || Math.abs(ratio - 1) > 0.25) ratio = 1;
    return { mode: 'tempo', v0: o.vAttack, a0: o.mAttack || 0, ratio: Math.round(ratio * 10000) / 10000, vBpm: vb ? Math.round(vb) : null, mBpm: mb ? Math.round(mb) : null, vTop: o.vAttack };
  }
  function musicToVideo(sy, mt) { return sy.v0 + (mt - sy.a0) * (sy.ratio || 1); }
  function videoToMusic(sy, vt) { return sy.a0 + (vt - sy.v0) / (sy.ratio || 1); }

  /** Musique : début et fin réels (sans le silence) */
  function trimSilence(feat) {
    const n = feat.n; const e = new Float64Array(n);
    for (let i = 0; i < n; i++) { let s = -1e9; for (const b of feat.bands) if (b[i] > s) s = b[i]; e[i] = s; }
    const mx = quantile(e, 0.95), thr = mx - 9;
    let a = 0; while (a < n && e[a] < thr) a++; let b = n - 1; while (b > a && e[b] < thr) b--;
    return { start: a * feat.hop, end: (b + 1) * feat.hop };
  }

  /** Tempo (BPM) estimé d'après les attaques dans les basses */
  function estimateBPM(feat) {
    const n = feat.n, hop = feat.hop; if (n < 200) return null;
    const on = new Float64Array(n);
    for (let i = 1; i < n; i++) { let s = 0; for (let b = 0; b < 4; b++) s += Math.max(0, feat.bands[b][i] - feat.bands[b][i - 1]); on[i] = s; }
    const m = mean(on); for (let i = 0; i < n; i++) on[i] -= m;
    const N = Math.min(n, Math.round(120 / hop));
    let best = 0, bv = -1e18;
    for (let bpm = 90; bpm <= 180; bpm += 0.25) {
      let s = 0;
      for (const mult of [1, 2, 4, 8]) {
        const lag = mult * 60 / bpm / hop, li = Math.floor(lag), fr = lag - li;
        for (let i = 0; i + li + 1 < N; i++) s += on[i] * (on[i + li] * (1 - fr) + on[i + li + 1] * fr);
      }
      const w = 1 - 0.04 * Math.abs(Math.log2(bpm / 130));
      if (s * w > bv) { bv = s * w; best = bpm; }
    }
    return best;
  }

  /* ======================= 8. Texte du script ======================= */
  function segLine(s, i) {
    const r = s.reps > 0 ? ' × ' + s.reps : '';
    const t = s.tempo ? ' (' + s.tempo + ')' : '';
    return (i + 1) + '. ' + s.name + r + t;
  }
  function fmtTime(t) {
    t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  /* ======================= 9. Lecture (jeu de danse) ======================= */
  /** État d'affichage à l'instant vt (temps vidéo) */
  function playState(segs, vt) {
    if (!segs.length) return null;
    let i = segs.findIndex((s) => vt >= s.start && vt < s.end);
    if (i < 0) {
      if (vt < segs[0].start) return { idx: -1, before: true, next: segs[0], remain: segs[0].start - vt, frac: 0 };
      // entre deux segments ?
      i = segs.findIndex((s) => s.start > vt);
      if (i < 0) return { idx: segs.length, after: true };
      return { idx: i - 0.5, gap: true, next: segs[i], remain: segs[i].start - vt, frac: 0 };
    }
    const s = segs[i];
    let rep = 0; for (const t of s.repTimes || []) if (t <= vt + 0.05) rep++;
    if (s.reps && rep === 0) rep = 0;
    return { idx: i, seg: s, rep: Math.min(rep, s.reps || 0), next: segs[i + 1] || null, remain: s.end - vt, frac: (vt - s.start) / Math.max(0.01, s.end - s.start) };
  }

  return {
    FEATS, FI, NF, SCALE, poseFeatures, poseBox, trackStep, smooth, quantile, estimatePeriod, countReps,
    resample, segmentSeq, segStats, candidates, buildScript, analyseRange, ruleName, fingerprint, fpDist, nearest, FP_THR,
    MOVES, STYLES, tempoLabel, fft, AudioFeatureStream, audioFeaturesFromPCM, prepareVideo, alignMusic, silenceCuts,
    prepareVideo2, findMusic, placeMusics, verifyChunks, sliceFeat, cutSongs, trackNumber, proposeMusics,
    firstBeat, makeSync, musicToVideo, videoToMusic, mapFromRect, boxIoU, mergeDetections, MultiTracker, fuseGroup,
    trimSilence, estimateBPM, segLine, fmtTime, playState, ASR, AHOP
  };
});
