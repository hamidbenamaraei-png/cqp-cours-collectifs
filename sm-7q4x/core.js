/* ScriptMove – calculs (aucun accès réseau, aucun DOM).
   Utilisable dans le navigateur (window.SMCore) et dans Node (require). */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.SMCore = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ======================= 1. Outils de signal ======================= */
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


  /* ======================= 2. Mouvements par style ======================= */
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
    return (i + 1) + '. ' + s.name + r + t + (s.note ? ' – ' + s.note : '');
  }
  function fmtTime(t) {
    t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  }

  /* ======================= 9. Lecture (jeu de danse) ======================= */
  /** État d'affichage à l'instant vt (même base de temps que les lignes) */
  function playState(segs, vt) {
    if (!segs.length) return null;
    let i = segs.findIndex((s) => vt >= s.start && vt < s.end);
    if (i < 0) {
      if (vt < segs[0].start) return { idx: -1, before: true, next: segs[0], remain: segs[0].start - vt, frac: 0 };
      i = segs.findIndex((s) => s.start > vt);
      if (i < 0) return { idx: segs.length, after: true };
      return { idx: i - 0.5, gap: true, next: segs[i], remain: segs[i].start - vt, frac: 0 };
    }
    const s = segs[i];
    let rep = 0; for (const t of s.repTimes || []) if (t <= vt + 0.05) rep++;
    return { idx: i, seg: s, rep: Math.min(rep, s.reps || 0), next: segs[i + 1] || null, remain: s.end - vt, frac: (vt - s.start) / Math.max(0.01, s.end - s.start) };
  }

  /* ======================= 10. Mon script (écrit à la main) ======================= */
  /** Temps par répétition selon le tempo (en temps de musique) */
  const TEMPOS = ['single', '2/2', '3/1', '1/3', '4/4', 'pulses'];
  const TEMPO_BEATS = { single: 2, '2/2': 4, '3/1': 4, '1/3': 4, '4/4': 8, pulses: 1 };
  function beatsPerRep(tempo) { const k = String(tempo || '').trim().toLowerCase(); return TEMPO_BEATS[k] || null; }

  /** Ajoute une ligne à sa place (ordre chronologique ; sans heure = à la fin). Renvoie la nouvelle liste. */
  function insertLine(lines, line) {
    const out = lines.slice();
    if (line.t == null) { out.push(line); return out; }
    let i = out.length;
    while (i > 0 && (out[i - 1].t == null || out[i - 1].t > line.t)) i--;
    out.splice(i, 0, line); return out;
  }
  /** Remet les lignes dans l'ordre chronologique (stable ; sans heure à la fin) */
  function sortLines(lines) {
    return lines.map((l, i) => [l, i]).sort((a, b) => {
      const ta = a[0].t, tb = b[0].t;
      if (ta == null && tb == null) return a[1] - b[1]; if (ta == null) return 1; if (tb == null) return -1;
      return ta - tb || a[1] - b[1];
    }).map((x) => x[0]);
  }
  const CONTENT = ['kind', 'name', 'reps', 'tempo', 'note'];
  /** Déplacer une ligne d'un cran (dir −1 / +1) : le contenu change de place, les heures restent dans l'ordre */
  function moveLine(lines, id, dir) {
    const out = lines.map((l) => Object.assign({}, l));
    const i = out.findIndex((l) => l.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= out.length) return { lines: out, id };
    const a = out[i], b = out[j];
    for (const k of CONTENT) { const x = a[k]; a[k] = b[k]; b[k] = x; }
    const x = a.id; a.id = b.id; b.id = x; // l'identifiant suit le contenu
    return { lines: out, id };
  }
  /** Durée estimée d'une ligne (secondes vidéo) d'après le tempo et le BPM */
  function lineDur(l, bpm) { const b = beatsPerRep(l.tempo); return b && l.reps > 0 && bpm ? b * l.reps * 60 / bpm : null; }
  /** Dupliquer : la copie se place à l'heure actuelle si elle est après l'original, sinon juste après lui */
  function dupLine(lines, id, now, bpm, newId) {
    const s = lines.find((l) => l.id === id); if (!s) return lines.slice();
    const c = Object.assign({}, s, { id: newId });
    if (s.t == null) c.t = null;
    else if (now != null && now > s.t + 0.5) c.t = Math.round(now * 10) / 10;
    else c.t = Math.round((s.t + (lineDur(s, bpm) || 1)) * 10) / 10;
    if (c.t == null) { const out = lines.slice(); out.splice(lines.indexOf(s) + 1, 0, c); return out; }
    return insertLine(lines, c);
  }
  /** Coller un bloc de lignes à l'heure « at » (les écarts entre les lignes sont gardés). mkId() donne un nouvel identifiant. */
  function pasteBlock(lines, block, at, mkId, bpm) {
    if (!block || !block.length) return lines.slice();
    const t0 = block.find((l) => l.t != null);
    let cursor = at;
    const copies = block.map((l) => {
      let t;
      if (at == null) t = null;
      else if (t0 && l.t != null) t = at + (l.t - t0.t);
      else t = cursor;
      if (t != null) { t = Math.round(t * 10) / 10; cursor = t + (lineDur(l, bpm) || 2); }
      return Object.assign({}, l, { id: mkId(), t });
    });
    let out = lines.slice(); for (const c of copies) out = insertLine(out, c);
    return out;
  }

  /** Lignes → frise dans le temps de LA MUSIQUE (fichier propre).
      o = { sync, sure, bpm, attack, startV / endV (début / fin du morceau, temps vidéo) }
      - musique retrouvée avec certitude + toutes les lignes ont une heure : débuts vidéo convertis par le recalage
      - sinon : durées calculées avec le BPM de la musique et le tempo / les répétitions */
  function buildTimeline(lines, o) {
    o = o || {};
    const L = (lines || []).filter((l) => l && (l.name || l.kind));
    const bpm = o.bpm || null, beat = bpm ? 60 / bpm : null, sy = o.sync || null, ratio = sy && sy.ratio ? sy.ratio : 1;
    const toM = (vt) => (sy ? videoToMusic(sy, vt) : vt);
    const timed = L.length && L.every((l) => l.t != null);
    let mode;
    if (o.sure && sy && timed) mode = 'video';
    else if (bpm) mode = 'bpm';
    else mode = timed ? 'approx' : 'fixed';
    const items = []; let cursor = null;
    for (let i = 0; i < L.length; i++) {
      const l = L[i], nx = L[i + 1];
      const bpr = beatsPerRep(l.tempo);
      let start, end;
      if (mode === 'video') {
        start = toM(l.t);
        end = nx ? toM(nx.t) : (o.endV != null && o.endV > l.t ? toM(o.endV) : start + (bpr && l.reps && beat ? bpr * l.reps * beat : 16));
      } else {
        if (cursor == null) {
          if (sy && l.t != null) cursor = Math.max(0, toM(l.t));
          else if (l.t != null && o.startV != null) cursor = Math.max(0, l.t - o.startV); // « top départ » au début du morceau
          else cursor = o.attack || 0;
        }
        start = cursor;
        let d = null;
        if (bpr && l.reps > 0 && beat) d = bpr * l.reps * beat;
        else if (l.t != null && nx && nx.t != null && nx.t > l.t) d = (nx.t - l.t) / ratio;
        else if (l.t != null && !nx && o.endV != null && o.endV > l.t) d = (o.endV - l.t) / ratio;
        else d = beat ? 8 * beat : 16;
        end = start + d; cursor = end;
      }
      if (!(end > start)) end = start + 0.5;
      let repDur = null;
      if (l.reps > 0) repDur = bpr && beat ? bpr * beat : (end - start) / l.reps;
      const repTimes = [];
      if (repDur) for (let k = 0; k < l.reps && start + k * repDur < end + 0.01; k++) repTimes.push(Math.round((start + k * repDur) * 1000) / 1000);
      items.push({ id: l.id, kind: l.kind || 'move', name: l.name || (l.kind === 'pause' ? 'Pause' : 'Transition'), reps: l.reps || 0, tempo: l.tempo || '', note: l.note || '', start: Math.round(start * 1000) / 1000, end: Math.round(end * 1000) / 1000, repDur, repTimes, counted: !!repDur });
    }
    return { mode, items };
  }

  /** Numéro d'édition dans un nom (« Pump 99 » → 99 ; les dates sont ignorées) */
  function editionNumber(name) {
    const s = String(name || '').replace(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g, ' ');
    const m = s.match(/(\d+)(?!.*\d)/);
    return m ? +m[1] : null;
  }
  /** Ordre des éditions : numéro décroissant, puis la plus récente */
  function sortEditions(list) {
    return list.slice().sort((a, b) => {
      const na = editionNumber(a.name), nb = editionNumber(b.name);
      if (na != null && nb != null && na !== nb) return nb - na;
      if (na != null && nb == null) return -1; if (nb != null && na == null) return 1;
      return (b.created || 0) - (a.created || 0);
    });
  }
  const BASE_FOLDERS = [{ id: 'pump', name: 'Pump', style: 'pump' }, { id: 'combat', name: 'Combat', style: 'combat' }, { id: 'attack', name: 'Attack', style: 'attack' }, { id: 'step', name: 'Step', style: 'step' }];
  /** Ancien cours → rangé dans le dossier de son style ; ancien script (analyse) → lignes de « Mon script ». Renvoie true si modifié. */
  function migrateCourse(c, folders, mkId) {
    let ch = false;
    const ids = new Set((folders || BASE_FOLDERS).map((f) => f.id));
    if (!c.folder || !ids.has(c.folder)) {
      const byStyle = (folders || BASE_FOLDERS).find((f) => f.style === c.style);
      c.folder = byStyle ? byStyle.id : (ids.has(c.style) ? c.style : 'pump');
      if (!c.style) c.style = 'pump';
      ch = true;
    }
    for (const m of c.morceaux || []) {
      if (!Array.isArray(m.lines)) {
        m.lines = (m.segments || []).filter((s) => !(s.base === 'Pause' && !s.reps) && s.name).map((s) => ({
          id: mkId ? mkId() : 'l' + Math.random().toString(36).slice(2, 9), kind: s.name === 'Pause' ? 'pause' : 'move', name: s.name, reps: s.reps || 0, tempo: TEMPOS.includes(s.tempo) ? s.tempo : (s.tempo || ''), note: '', t: s.start != null ? Math.round(s.start * 10) / 10 : null
        }));
        ch = true;
      }
    }
    if (c.version !== 3) { c.version = 3; ch = true; }
    return ch;
  }
  /** Mouvements les plus utilisés d'un style (dans toutes les éditions), du plus au moins utilisé */
  function topMoves(courses, style) {
    const n = {};
    for (const c of courses) if (c.style === style) for (const m of c.morceaux || []) for (const l of m.lines || []) if (l.kind !== 'pause' && l.kind !== 'trans' && l.name) n[l.name] = (n[l.name] || 0) + 1;
    return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b)).map((k) => ({ name: k, n: n[k] }));
  }
  /** Ligne lisible : « 1. Squat × 16 (2/2) » */
  function lineText(l, i) {
    const nm = l.kind === 'pause' ? (l.name || 'Pause') : l.kind === 'trans' ? (l.name || 'Transition') : l.name;
    return segLine({ name: nm, reps: l.reps, tempo: l.tempo && l.tempo !== '—' ? l.tempo : '', note: l.note }, i);
  }
  /** Recherche simple (sans accents ni majuscules) */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  return {
    smooth, quantile, MOVES, STYLES, fft, AudioFeatureStream, audioFeaturesFromPCM, prepareVideo, alignMusic, silenceCuts,
    prepareVideo2, findMusic, placeMusics, verifyChunks, sliceFeat, cutSongs, trackNumber, proposeMusics,
    firstBeat, makeSync, musicToVideo, videoToMusic, trimSilence, estimateBPM, segLine, fmtTime, playState, ASR, AHOP,
    TEMPOS, beatsPerRep, insertLine, sortLines, moveLine, dupLine, pasteBlock, lineDur, buildTimeline,
    editionNumber, sortEditions, BASE_FOLDERS, migrateCourse, topMoves, lineText, norm
  };
});
