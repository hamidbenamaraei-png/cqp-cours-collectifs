/* ScriptMove – fabrication du fichier MP3 d'un mix de musiques (v24), dans un Worker, sans internet.
   Le téléphone (app.js) décode chaque partie de musique et l'envoie ici, une partie à la fois (mémoire limitée) :
   - changement de tempo SANS changer le son : WSOLA (on recolle des tranches de 46 ms là où elles se ressemblent le plus) ;
   - chaque partie est posée à sa place exacte (calcul en échantillons), et se raccorde à la précédente par un micro-fondu de 40 ms
     centré sur le 1er temps du bloc, exactement comme à l'écoute dans l'appli ;
   - encodage MP3 192 kb/s au fur et à mesure (lamejs, lib/lame.min.js), les morceaux du fichier repartent tout de suite vers l'appli. */
'use strict';
self.window = self; // lame.min.js s'attend à « window »
importScripts('lib/lame.min.js', 'theme.js');
const N = 2048, HS = 1024, TOL = 512, D = 4;
const WIN = new Float32Array(N); for (let n = 0; n < N; n++) WIN[n] = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / N);
let enc = null, SR = 44100;
// sortie pas encore encodée : échantillons [base, base + len) du mix entier
let base = 0, len = 0, AL = new Float32Array(SR * 20), AR = new Float32Array(SR * 20), done = 0;
function room(end) { // la zone [base, end) doit exister
  const need = end - base; if (need <= AL.length) return;
  let c = AL.length; while (c < need) c *= 2;
  const l = new Float32Array(c), r = new Float32Array(c); l.set(AL.subarray(0, len)); r.set(AR.subarray(0, len)); AL = l; AR = r;
}
const I16 = (f, out) => { for (let i = 0; i < f.length; i++) { const v = f[i]; out[i] = v >= 1 ? 32767 : v <= -1 ? -32768 : (v * 32767) | 0; } return out; };
let bl = new Int16Array(1152 * 32), br = new Int16Array(1152 * 32);
/** Encode tout ce qui est avant « upto » (les échantillons y sont définitifs) */
function flushTo(upto, all) {
  let n = upto - base; if (n <= 0) return;
  if (!all) n -= n % 1152;
  let o = 0; const parts = [];
  while (o < n) {
    const k = Math.min(1152 * 32, n - o);
    const l = I16(AL.subarray(o, o + k), k === bl.length ? bl : new Int16Array(k)), r = I16(AR.subarray(o, o + k), k === br.length ? br : new Int16Array(k));
    const m = enc.encodeBuffer(l, r); if (m.length) parts.push(new Uint8Array(m));
    o += k;
  }
  AL.copyWithin(0, n, len); AR.copyWithin(0, n, len); AL.fill(0, len - n, len); AR.fill(0, len - n, len);
  base += n; len -= n; done = base;
  if (parts.length) { const tot = parts.reduce((a, p) => a + p.length, 0), u = new Uint8Array(tot); let q = 0; for (const p of parts) { u.set(p, q); q += p.length; } postMessage({ t: 'mp3', data: u, pos: done }, [u.buffer]); }
  else postMessage({ t: 'prog', pos: done });
}
/** Gain d'un échantillon de la partie (fondus) */
function gainAt(j, s) {
  if (s.fin && j < s.fin) return Math.sin(Math.PI / 2 * (j / s.fin));
  if (j >= s.outLen - s.fout) { const f = (s.outLen - j) / s.fout; return s.fadeCos ? Math.sin(Math.PI / 2 * Math.max(0, f)) : Math.max(0, f); }
  return 1;
}
function addFrame(L, R, q, o, s) { // tranche d'entrée qui commence à q, posée à la sortie locale o
  const g0 = s.outStart; room(g0 + o + N);
  for (let n = 0; n < N; n++) {
    const j = o + n; if (j < 0 || j >= s.outLen) continue;
    const gi = g0 + j - base; if (gi < 0) continue;
    const w = WIN[n] * gainAt(j, s), x = q + n;
    if (x < 0 || x >= L.length) continue;
    AL[gi] += L[x] * w; AR[gi] += R[x] * w;
  }
  const e = g0 + Math.min(s.outLen, o + N) - base; if (e > len) len = e;
}
/* 🎨 thème : les « huit » de la partie sont ajoutés juste avant que la musique arrive à leur place */
function themer(s) {
  const th = s.th; if (!th || (!th.theme && !th.sfx)) return () => {};
  const c0 = s.outStart + (s.fin && !s.first ? s.fin / 2 : 0), step = 8 * 60 / th.bpm * SR, nH = th.beats / 8;
  let h = 0;
  return (limit) => {
    while (h < nH && c0 + h * step < limit) {
      const hi = h % 4, at0 = Math.round(c0 + h * step);
      const x = self.SMTheme.huit({ theme: th.theme, sfx: th.sfx, bpm: th.bpm, sr: SR, huit: hi, block: th.block0 + Math.floor(h / 4), newTrack: h === 0 && th.newTrack, beforeTrack: h === nH - 1 && th.nextNew, trackNo: th.trackNo, last: h === nH - 1 && !th.hasNext });
      if (at0 >= base) {
        room(at0 + x.L.length); const o = at0 - base;
        for (let i = 0; i < x.L.length; i++) { AL[o + i] += x.L[i] * th.vol; AR[o + i] += x.R[i] * th.vol; }
        if (o + x.L.length > len) len = o + x.L.length;
      }
      h++;
    }
  };
}
function render(s) {
  const L = s.L, R = s.R, r = s.rate, addTheme = themer(s);
  addTheme(s.outStart + s.fin + 1);
  // signal de comparaison : mono, un échantillon sur 4
  const m = new Float32Array(Math.floor(L.length / D)); for (let i = 0; i < m.length; i++) m[i] = L[i * D] + R[i * D];
  const safe = s.outStart + s.safe; // tout ce qui est avant est définitif quand la partie est finie
  let qPrev = null, k = 0, last = Date.now();
  for (;;) {
    const o = k * HS - HS; if (o >= s.outLen) break;
    let q = Math.round(s.q0 + o * r);
    if (qPrev != null && Math.abs(r - 1) > 1e-4) {
      // la tranche dont le début ressemble le plus à la suite naturelle de la précédente
      const t = Math.floor((qPrev + HS) / D), Lc = HS / D; let best = q, bv = -Infinity;
      for (let d = -TOL; d <= TOL; d += D) {
        const c = Math.floor((q + d) / D); if (c < 0 || c + Lc >= m.length || t + Lc >= m.length || t < 0) continue;
        let sc = 0, ec = 1e-9; for (let i = 0; i < Lc; i++) { const v = m[c + i]; sc += m[t + i] * v; ec += v * v; }
        sc /= Math.sqrt(ec); if (sc > bv) { bv = sc; best = q + d; }
      }
      q = best;
    } else if (qPrev != null) q = qPrev + HS;
    addFrame(L, R, q, o, s); qPrev = q; k++;
    if ((k & 63) === 0) { addTheme(s.outStart + o + HS + N); flushTo(Math.min(safe, s.outStart + o + HS)); if (Date.now() - last > 300) { last = Date.now(); postMessage({ t: 'prog', pos: s.outStart + o }); } }
  }
  addTheme(Infinity); flushTo(safe);
}
onmessage = (e) => {
  const d = e.data;
  try {
    if (d.t === 'init') { SR = d.sr; enc = new self.lamejs.Mp3Encoder(2, SR, d.kbps || 192); base = 0; len = 0; postMessage({ t: 'ok' }); }
    else if (d.t === 'seg') { render(d); postMessage({ t: 'segdone' }); }
    else if (d.t === 'end') { flushTo(base + len, true); const m = enc.flush(); const u = new Uint8Array(m); postMessage({ t: 'mp3', data: u, pos: base }, [u.buffer]); postMessage({ t: 'fin' }); }
  } catch (err) { postMessage({ t: 'err', msg: String(err && err.message || err), mem: err instanceof RangeError }); }
};
