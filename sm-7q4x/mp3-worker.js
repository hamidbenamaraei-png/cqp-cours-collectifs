/* ScriptMove – fabrique un fichier MP3 (128 kbit/s) à partir du son, dans le téléphone, sans Internet (08/11).
   Utilise lib/lame.min.js (lamejs 1.2.1, encodeur MP3 LAME en JavaScript, licence LGPL, voir lib/LICENSE-lamejs.txt).
   Marche en « Web Worker » (l'écran n'est pas bloqué) ; sinon l'appli s'en sert directement (SMMp3.make).
   Messages reçus : {t:'init', ch, rate, kbps} · {t:'pcm', l: Float32Array, r: Float32Array|null} · {t:'end'}
   Messages envoyés : {t:'ready'} · {t:'ack', n} (n = nombre d'échantillons encodés) · {t:'done', blob} · {t:'err', msg} */
(function (root) {
  'use strict';
  const RATES = [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000];
  function make(lame, post) {
    let enc = null, ch = 1, parts = [];
    const i16 = (f) => { const o = new Int16Array(f.length); for (let i = 0; i < f.length; i++) { const v = f[i] < -1 ? -1 : f[i] > 1 ? 1 : f[i]; o[i] = v < 0 ? v * 32768 : v * 32767; } return o; };
    return function (d) {
      try {
        if (!d) return;
        if (d.t === 'init') {
          if (RATES.indexOf(d.rate) < 0) throw new Error('fréquence ' + d.rate);
          ch = d.ch === 2 ? 2 : 1; parts = [];
          enc = new lame.Mp3Encoder(ch, d.rate, d.kbps || 128);
        } else if (d.t === 'pcm') {
          if (!enc) throw new Error('pas prêt');
          const l = i16(d.l), r = ch === 2 ? i16(d.r || d.l) : null;
          const STEP = 1152 * 10;
          for (let i = 0; i < l.length; i += STEP) {
            const b = ch === 2 ? enc.encodeBuffer(l.subarray(i, i + STEP), r.subarray(i, i + STEP)) : enc.encodeBuffer(l.subarray(i, i + STEP));
            if (b.length) parts.push(b);
          }
          post({ t: 'ack', n: l.length });
        } else if (d.t === 'end') {
          if (!enc) throw new Error('pas prêt');
          const b = enc.flush(); if (b.length) parts.push(b);
          const blob = new Blob(parts, { type: 'audio/mpeg' }); parts = []; enc = null;
          post({ t: 'done', blob });
        }
      } catch (e) { post({ t: 'err', msg: String((e && e.message) || e) }); }
    };
  }
  const inWorker = typeof WorkerGlobalScope !== 'undefined' && root instanceof WorkerGlobalScope;
  if (inWorker) {
    try {
      root.importScripts('lib/lame.min.js?v=1');
      const h = make(root.lamejs, (m) => root.postMessage(m));
      root.onmessage = (e) => h(e.data);
      root.postMessage({ t: 'ready' });
    } catch (e) { root.postMessage({ t: 'err', msg: 'lame' }); }
  } else root.SMMp3 = { make, RATES };
})(typeof self !== 'undefined' ? self : this);
