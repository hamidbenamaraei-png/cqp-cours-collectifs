/* ScriptMove – « 🎨 Thème du mix » (v24) : une couche rythmique fabriquée par l'appli (synthèse, aucun son enregistré),
   calée sur la grille de 32 temps et le BPM du mix. Utilisée par le lecteur du mix (app.js) ET par la fabrication du MP3 (mix-render.js).
   SMTheme.huit(o) rend UN « huit » (8 temps) à partir de son 1er temps, avec la queue des sons (2 s) :
   o = { theme: 'rock'|'techno'|'country'|'latino'|'80s'|'', sfx, bpm, sr, huit (0 à 3 dans le bloc), block (n° de bloc du mix),
         newTrack (ce huit commence une nouvelle musique), beforeTrack (la musique change juste après), trackNo, last (fin du mix après) } */
(function (root) {
  'use strict';
  const THEMES = [['', 'Aucun'], ['rock', 'Rock'], ['techno', 'Techno'], ['country', 'Country'], ['latino', 'Latino'], ['80s', 'Années 80']];
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x3fffffff - 1; };
  function huit(o) {
    const sr = o.sr, T = 60 / o.bpm, n8 = Math.round(8 * T * sr), len = n8 + Math.round(2 * sr);
    const L = new Float32Array(len), R = new Float32Array(len);
    seed = 1 + ((o.block * 4 + o.huit) * 7919) % 100000;
    const at = (beat) => Math.round(beat * T * sr);
    /** ajoute un son : f(t, i) → valeur, de durée d (s), au temps « beat », gain g, panoramique p (−1 à 1) */
    const put = (beat, d, g, p, f) => {
      const o0 = at(beat), n = Math.min(len - o0, Math.round(d * sr)); if (n <= 0 || o0 < 0) return;
      const gl = g * Math.min(1, 1 - (p || 0)), gr = g * Math.min(1, 1 + (p || 0));
      for (let i = 0; i < n; i++) { const v = f(i / sr, i); L[o0 + i] += v * gl; R[o0 + i] += v * gr; }
    };
    const hp = () => { let a = 0; return (x) => { const y = x - a; a = x; return y; }; }; // passe-haut très simple
    const lp = (k) => { let a = 0; return (x) => (a += k * (x - a)); };
    const S = {
      kick: (b, g) => { let ph = 0; put(b, 0.45, g, 0, (t) => { ph += 2 * Math.PI * (48 + 110 * Math.exp(-t * 28)) / sr; return Math.sin(ph) * Math.exp(-t * 7) * (t < 0.003 ? t / 0.003 : 1); }); },
      snare: (b, g) => { const h = hp(); put(b, 0.25, g, 0.05, (t) => Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22) * 0.5 + h(rnd()) * Math.exp(-t * 15) * 0.8); },
      gated: (b, g) => { const h = hp(), l = lp(0.5); put(b, 0.3, g, 0, (t) => { const gate = t < 0.22 ? 1 : Math.max(0, 1 - (t - 0.22) / 0.02); return (Math.sin(2 * Math.PI * 175 * t) * Math.exp(-t * 18) * 0.5 + l(h(rnd())) * (0.9 * Math.exp(-t * 20) + 0.35)) * gate; }); },
      hat: (b, g, open) => { const h = hp(), h2 = hp(); put(b, open ? 0.32 : 0.06, g, 0.3, (t) => h2(h(rnd())) * Math.exp(-t * (open ? 9 : 45))); },
      clap: (b, g) => { const h = hp(), l = lp(0.35); put(b, 0.22, g, -0.1, (t) => { const e = t < 0.03 ? (Math.floor(t / 0.01) % 1 === 0 ? Math.exp(-(t % 0.01) * 300) : 0) : Math.exp(-(t - 0.03) * 18); return l(h(rnd())) * e * 1.4; }); },
      crash: (b, g) => { const h = hp(), h2 = hp(), k = hp(), k2 = hp(); put(b, 1.9, g, 0, (t, i) => (i & 1 ? h2(h(rnd())) : k2(k(rnd()))) * Math.exp(-t * 2.4)); },
      conga: (b, g, f, p, slap) => put(b, slap ? 0.12 : 0.3, g, p, (t) => Math.sin(2 * Math.PI * f * (1 + 0.25 * Math.exp(-t * 40)) * t) * Math.exp(-t * (slap ? 30 : 11)) + (slap ? rnd() * Math.exp(-t * 60) * 0.5 : 0)),
      clave: (b, g) => put(b, 0.08, g, 0.2, (t) => Math.sin(2 * Math.PI * 2500 * t) * Math.exp(-t * 55)),
      shaker: (b, g) => { const h = hp(), h2 = hp(); put(b, 0.09, g, -0.35, (t) => h2(h(rnd())) * (t < 0.025 ? t / 0.025 : Math.exp(-(t - 0.025) * 45))); },
      brush: (b, g) => { const l = lp(0.25), h = hp(); put(b, 0.2, g, 0.1, (t) => l(h(rnd())) * (t < 0.03 ? t / 0.03 : Math.exp(-(t - 0.03) * 16)) * 1.6); },
      tom: (b, g, f) => { let ph = 0; put(b, 0.35, g, f > 160 ? 0.3 : -0.3, (t) => { ph += 2 * Math.PI * f * (0.55 + 0.45 * Math.exp(-t * 9)) / sr; return Math.sin(ph) * Math.exp(-t * 7); }); },
      riser: (b, beats, g) => { const d = beats * T, h = hp(); let ph = 0; put(b, d, g, 0, (t) => { const f = t / d; ph += 2 * Math.PI * (300 + 2200 * f * f) / sr; return (h(rnd()) * 0.8 + Math.sin(ph) * 0.15) * f * f * (f > 0.97 ? (1 - f) / 0.03 : 1); }); },
      whoosh: (b, beats, g) => { const d = beats * T; let a = 0; put(b, d, g, 0, (t) => { const f = t / d, k = 0.02 + 0.3 * f; a += k * (rnd() - a); return a * Math.sin(Math.PI * f) * 2; }); },
      impact: (b, g) => { const l = lp(0.08); put(b, 1.4, g, 0, (t) => Math.sin(2 * Math.PI * (42 + 30 * Math.exp(-t * 12)) * t) * Math.exp(-t * 3) + l(rnd()) * Math.exp(-t * 10) * 2); S.crash(b, g * 0.35); },
      hey: (b, g) => { for (const [det, p] of [[1, -0.25], [1.06, 0.25], [0.94, 0]]) heyVoice(b, g * 0.5, det, p); }
    };
    /** « Hey ! » : voix synthétisée (impulsions + 3 formants de la voyelle « è », souffle au début) */
    function heyVoice(b, g, det, p) {
      const bp = (f, q) => { const w = 2 * Math.PI * f / sr, al = Math.sin(w) / (2 * q), a0 = 1 + al, b0 = al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; return (x) => { const y = b0 * x - b0 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; }; };
      const f1 = bp(620, 6), f2 = bp(1750, 9), f3 = bp(2600, 10); let ph = 0;
      put(b, 0.34, g, p, (t) => {
        const f0 = (230 - 70 * t / 0.34) * det; ph += f0 / sr; const saw = 2 * (ph % 1) - 1;
        const src = t < 0.05 ? rnd() * (1 - t / 0.05) + saw * (t / 0.05) : saw;
        const e = t < 0.02 ? t / 0.02 : t > 0.24 ? Math.max(0, 1 - (t - 0.24) / 0.1) : 1;
        return (f1(src) * 1.0 + f2(src) * 0.7 + f3(src) * 0.35) * e * 1.6;
      });
    }
    const th = o.theme, lastH = o.huit === 3;
    for (let bar = 0; bar < 8; bar += 4) {
      if (th === 'rock') { for (const k of [0, 2]) S.kick(bar + k, 0.9); for (const k of [1, 3]) S.snare(bar + k, 0.7); for (let k = 0; k < 4; k += 0.5) S.hat(bar + k, 0.22, true); }
      else if (th === 'techno') { for (let k = 0; k < 4; k++) S.kick(bar + k, 0.95); for (let k = 0.5; k < 4; k += 1) S.hat(bar + k, 0.28, true); for (const k of [1, 3]) S.clap(bar + k, 0.55); }
      else if (th === 'country') { for (let k = 0; k < 4; k += 0.5) S.brush(bar + k, (k % 1 ? 0.25 : 0.4) * (k === 1 || k === 3 ? 1.5 : 1)); for (let k = 0; k < 4; k += 0.25) S.shaker(bar + k, 0.1); for (const k of [1, 3]) S.clap(bar + k, 0.45); for (const k of [0, 2]) S.kick(bar + k, 0.55); }
      else if (th === 'latino') { S.conga(bar, 0.35, 190, -0.3); S.conga(bar + 1, 0.5, 330, -0.3, true); S.conga(bar + 2, 0.35, 190, -0.3); S.conga(bar + 3, 0.55, 260, 0.3); S.conga(bar + 3.5, 0.55, 260, 0.3); S.conga(bar + 2.5, 0.3, 380, 0.4); for (let k = 0; k < 4; k += 0.5) S.shaker(bar + k, k % 1 ? 0.18 : 0.12); S.kick(bar, 0.45); }
      else if (th === '80s') { for (const k of [0, 2]) S.kick(bar + k, 0.85); for (const k of [1, 3]) S.gated(bar + k, 0.6); for (let k = 0; k < 4; k += 0.5) S.hat(bar + k, 0.14, false); }
    }
    if (th === 'latino') for (const k of [0, 1.5, 3, 5, 6]) S.clave(k, 0.35); // clave 3-2
    if (th === '80s' && lastH) { S.tom(6, 0.55, 220); S.tom(6.5, 0.55, 180); S.tom(7, 0.55, 150); S.tom(7.5, 0.55, 120); }
    if (th && o.huit === 0 && !o.newTrack && th !== 'country') S.crash(0, th === 'rock' ? 0.35 : 0.22);
    if (th === 'techno' && lastH && !o.beforeTrack && !o.last) S.riser(6, 2, 0.22);
    if (o.sfx) {
      if (o.newTrack) { S.impact(0, 0.55); if (o.trackNo % 2 === 1) S.hey(0, 0.5); }
      if (o.beforeTrack) S.riser(4, 4, 0.3);
      else if (lastH && !o.last && th !== 'techno' && o.block % 2 === 0) S.whoosh(7, 1, 0.25);
    }
    for (let i = 0; i < len; i++) { L[i] *= 0.45; R[i] *= 0.45; } // niveau : le thème reste sous la musique
    return { L, R, n8 };
  }
  root.SMTheme = { THEMES, huit };
})(typeof self !== 'undefined' ? self : this);
