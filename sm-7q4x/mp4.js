/* ScriptMove – lecture de la piste audio d'un fichier MP4 / MOV, morceau par morceau
   (le fichier n'est jamais chargé en entier : une vidéo d'1 h peut faire plusieurs Go). */
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m; else root.SMMp4 = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CONTAINERS = { moov: 1, trak: 1, mdia: 1, minf: 1, stbl: 1, edts: 1, udta: 0 };

  function u32(d, o) { return d.getUint32(o); }
  function u64(d, o) { return d.getUint32(o) * 4294967296 + d.getUint32(o + 4); }
  function type(d, o) { return String.fromCharCode(d.getUint8(o), d.getUint8(o + 1), d.getUint8(o + 2), d.getUint8(o + 3)); }

  const RATES = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

  /** 08/11 (v55) : liste des boîtes du haut du fichier (ftyp, moov, mdat, moof…) : { t, off, size } */
  async function topBoxes(read, size) {
    const out = []; let off = 0;
    while (off + 8 <= size) {
      const h = new DataView(await read(off, 16));
      if (h.byteLength < 8) break;
      let sz = u32(h, 0); const t = type(h, 4);
      if (sz === 1) { if (h.byteLength < 16) break; sz = u64(h, 8); } else if (sz === 0) sz = size - off;
      if (sz < 8) { if (!out.length) throw new Error('fichier MP4 abîmé'); break; }
      out.push({ t, off, size: Math.min(sz, size - off) });
      off += sz;
    }
    return out;
  }
  /** read(offset, length) → Promise<ArrayBuffer> ; size = taille du fichier */
  async function findMoov(read, size, boxes) {
    boxes = boxes || await topBoxes(read, size);
    const m = boxes.find((b) => b.t === 'moov');
    if (!m) throw new Error('pas de « moov » : ce n\'est pas un MP4 lisible');
    return new DataView(await read(m.off, m.size));
  }

  function children(d, start, end) {
    const out = []; let o = start;
    while (o + 8 <= end) {
      let sz = u32(d, o); const t = type(d, o + 4); let hl = 8;
      if (sz === 1) { sz = u64(d, o + 8); hl = 16; } else if (sz === 0) sz = end - o;
      if (sz < 8 || o + sz > end) break;
      out.push({ t, o, s: o + hl, e: o + sz });
      o += sz;
    }
    return out;
  }
  function find(d, box, path) {
    let cur = [box];
    for (const p of path) {
      const nx = [];
      for (const b of cur) for (const c of children(d, b.s, b.e)) if (c.t === p) nx.push(c);
      cur = nx; if (!cur.length) return [];
    }
    return cur;
  }

  function parseEsds(d, s, e) {
    let o = s + 4; // version + flags
    const readLen = () => { let l = 0; for (let i = 0; i < 4; i++) { const b = d.getUint8(o++); l = (l << 7) | (b & 0x7f); if (!(b & 0x80)) break; } return l; };
    try {
      while (o < e) {
        const tag = d.getUint8(o++); const l = readLen();
        if (tag === 0x03) { o += 2; const fl = d.getUint8(o++); if (fl & 0x80) o += 2; if (fl & 0x40) o += d.getUint8(o) + 1; if (fl & 0x20) o += 2; continue; }
        if (tag === 0x04) { const ot = d.getUint8(o); o += 13; if (ot === 0x6b || ot === 0x69) return { mp3: true }; continue; }
        if (tag === 0x05) { if (o + l > e || !l) return {}; return { asc: new Uint8Array(d.buffer, d.byteOffset + o, l).slice() }; }
        o += l;
      }
    } catch (err) { /* esds abîmé : on fera sans */ }
    return {};
  }

  /** 08/11 (v55) : lit la config AAC (AudioSpecificConfig), y compris AAC-HE / SBR / PS.
      { aot, baseAot, fi (index de la fréquence de base, -1 si inconnue), coreRate, rate (fréquence de sortie), cc, channels, sbr } ou null */
  function parseAsc(a) {
    if (!a || a.length < 2) return null;
    let bit = 0;
    const rb = (n) => { let v = 0; for (let i = 0; i < n; i++) { const B = a[bit >> 3]; if (B === undefined) throw new Error('court'); v = v * 2 + ((B >> (7 - (bit & 7))) & 1); bit++; } return v; };
    const aotOf = () => { let t = rb(5); if (t === 31) t = 32 + rb(6); return t; };
    const rateOf = () => { const i = rb(4); if (i === 15) { const r = rb(24); return { i: RATES.indexOf(r), r }; } return { i: i < RATES.length ? i : -1, r: RATES[i] || 0 }; };
    try {
      const aot = aotOf(), f = rateOf(), cc = rb(4);
      const out = { aot, baseAot: aot, fi: f.i, coreRate: f.r, rate: f.r, cc, channels: cc >= 1 && cc <= 6 ? cc : cc === 7 ? 8 : 0, sbr: false };
      if (aot === 5 || aot === 29) {
        const x = rateOf(); out.rate = x.r || f.r * 2; out.sbr = true;
        out.baseAot = aotOf();
        if (aot === 29 && out.channels === 1) out.channels = 2; // PS : mono codé, stéréo à l'écoute
      }
      return out;
    } catch (e) { return null; }
  }
  /** 08/11 (v55) : config AAC simple (AAC-LC, 2 octets) tirée d'une config plus compliquée (AAC-HE…), ou null */
  function lcAsc(asc) {
    const p = parseAsc(asc); if (!p || p.fi < 0 || p.cc < 1 || p.cc > 7) return null;
    return new Uint8Array([(2 << 3) | (p.fi >> 1), ((p.fi & 1) << 7) | (p.cc << 3)]);
  }

  /** Une piste « soun » du moov → description (sans les échantillons des fragments) */
  function soundTrak(d, trak, trex) {
    const mdhd = find(d, trak, ['mdia', 'mdhd'])[0]; if (!mdhd) return null;
    const ver = d.getUint8(mdhd.s);
    const timescale = (ver === 1 ? u32(d, mdhd.s + 20) : u32(d, mdhd.s + 12)) || 1;
    const duration = ver === 1 ? u64(d, mdhd.s + 24) : u32(d, mdhd.s + 16);
    const tkhd = find(d, trak, ['tkhd'])[0];
    const id = tkhd ? (d.getUint8(tkhd.s) === 1 ? u32(d, tkhd.s + 20) : u32(d, tkhd.s + 12)) : 0;
    const stbl = find(d, trak, ['mdia', 'minf', 'stbl'])[0]; if (!stbl) return null;
    const get = (n) => children(d, stbl.s, stbl.e).find((c) => c.t === n);
    const stsd = get('stsd'); if (!stsd) return null;
    const ent = children(d, stsd.s + 8, stsd.e)[0]; if (!ent) return null;
    const fmt = ent.t; const sv = d.getUint16(ent.s + 8);
    let channels = d.getUint16(ent.s + 16), rate = u32(d, ent.s + 24) / 65536;
    let ext = ent.s + 28;
    if (sv === 1) ext += 16;
    else if (sv === 2) { try { rate = d.getFloat64(ent.s + 32); channels = u32(d, ent.s + 40); } catch (e) { /* rien */ } ext += 36; }
    let codec = null, description, asc = null;
    const sub = ext < ent.e ? children(d, ext, ent.e) : [];
    if (fmt === 'mp4a') {
      const wave = sub.find((c) => c.t === 'wave');
      const es = sub.find((c) => c.t === 'esds') || (wave && children(d, wave.s, wave.e).find((c) => c.t === 'esds'));
      const info = es ? parseEsds(d, es.s, es.e) : {};
      if (info.mp3) codec = 'mp3';
      else {
        description = info.asc; asc = parseAsc(description);
        codec = 'mp4a.40.' + (asc ? asc.aot : 2);
        if (asc && asc.rate && !(rate >= 3000 && rate <= 384000)) rate = asc.rate; // fréquence de la piste absente ou fausse (MOV « v2 »)
        if (asc && asc.channels && !(channels >= 1 && channels <= 8)) channels = asc.channels;
      }
    } else if (fmt === 'Opus') codec = 'opus';
    else if (fmt === 'fLaC') codec = 'flac';
    else if (fmt === '.mp3') codec = 'mp3';
    else if (fmt === 'ulaw') codec = 'ulaw'; else if (fmt === 'alaw') codec = 'alaw';
    if (!(rate >= 3000 && rate <= 384000)) rate = timescale >= 3000 && timescale <= 384000 ? timescale : 44100;
    if (!(channels >= 1 && channels <= 8)) channels = (asc && asc.channels) || 2;
    if (fmt === 'mp4a' && codec !== 'mp3' && !asc) { // pas de config AAC lisible : on suppose l'AAC simple (le plus courant)
      const fi = RATES.indexOf(rate), cc = Math.min(channels, 2);
      if (fi >= 0) { description = new Uint8Array([(2 << 3) | (fi >> 1), ((fi & 1) << 7) | (cc << 3)]); asc = parseAsc(description); codec = 'mp4a.40.2'; }
    }
    // tables
    const sizes = [], offsets = [], times = [];
    const stsz = get('stsz'), stz2 = get('stz2'), stsc = get('stsc'), stco = get('stco') || get('co64'), stts = get('stts');
    let count = 0;
    if ((stsz || stz2) && stsc && stco && stts) {
      const sz = [];
      if (stsz) { const fixed = u32(d, stsz.s + 4); count = u32(d, stsz.s + 8); for (let i = 0; i < count; i++) sz.push(fixed || u32(d, stsz.s + 12 + 4 * i)); }
      else { const fs = d.getUint8(stz2.s + 7); count = u32(d, stz2.s + 8); for (let i = 0; i < count; i++) { const o = stz2.s + 12; sz.push(fs === 16 ? d.getUint16(o + 2 * i) : fs === 8 ? d.getUint8(o + i) : ((d.getUint8(o + (i >> 1)) >> ((i & 1) ? 0 : 4)) & 15)); } }
      const nch = u32(d, stco.s + 4), co64 = stco.t === 'co64';
      const nsc = u32(d, stsc.s + 4), sc = [];
      for (let i = 0; i < nsc; i++) sc.push([u32(d, stsc.s + 8 + 12 * i), u32(d, stsc.s + 12 + 12 * i)]);
      let si = 0, k = 0;
      for (let c = 0; c < nch && si < count && sc.length; c++) {
        while (k + 1 < sc.length && sc[k + 1][0] <= c + 1) k++;
        let o = co64 ? u64(d, stco.s + 8 + 8 * c) : u32(d, stco.s + 8 + 4 * c);
        for (let j = 0; j < sc[k][1] && si < count; j++) { offsets.push(o); sizes.push(sz[si]); o += sz[si]; si++; }
      }
      count = si;
      const nts = u32(d, stts.s + 4); let t = 0, n = 0;
      for (let i = 0; i < nts && n < count; i++) { const cnt = u32(d, stts.s + 8 + 8 * i), dl = u32(d, stts.s + 12 + 8 * i); for (let j = 0; j < cnt && n < count; j++) { times.push(t / timescale); t += dl; n++; } }
      while (times.length < count) times.push(t / timescale); // table des temps trop courte
    }
    return { id, codec, description, asc, channels, sampleRate: rate, timescale, duration: duration / timescale, sizes, offsets, times, trex: trex[id] || null };
  }

  /** 08/11 (v55) : MP4 fragmentés (moof + mdat) : ajoute à chaque piste son les échantillons des fragments */
  async function addFragments(read, boxes, tracks) {
    const byId = {}; for (const tr of tracks) byId[tr.id] = tr;
    for (const b of boxes) {
      if (b.t !== 'moof' || b.size > 64 * 1024 * 1024) continue;
      let d; try { d = new DataView(await read(b.off, b.size)); } catch (e) { continue; }
      const moof = { s: 8, e: d.byteLength };
      for (const traf of find(d, moof, ['traf'])) {
        try {
          const kids = children(d, traf.s, traf.e);
          const tfhd = kids.find((c) => c.t === 'tfhd'); if (!tfhd) continue;
          const tf = u32(d, tfhd.s) & 0xffffff, tr = byId[u32(d, tfhd.s + 4)]; if (!tr) continue;
          const dx = tr.trex || {};
          let p = tfhd.s + 8, base = b.off, dDur = dx.dur || 0, dSize = dx.size || 0;
          if (tf & 0x1) { base = u64(d, p); p += 8; }
          if (tf & 0x2) p += 4;
          if (tf & 0x8) { dDur = u32(d, p); p += 4; }
          if (tf & 0x10) { dSize = u32(d, p); p += 4; }
          const tfdt = kids.find((c) => c.t === 'tfdt');
          let t = tfdt ? (d.getUint8(tfdt.s) === 1 ? u64(d, tfdt.s + 4) : u32(d, tfdt.s + 4)) : (tr.nextT || 0);
          let cursor = base;
          for (const run of kids.filter((c) => c.t === 'trun')) {
            const rf = u32(d, run.s) & 0xffffff, n = u32(d, run.s + 4); let q = run.s + 8;
            if (rf & 0x1) { cursor = base + d.getInt32(q); q += 4; }
            if (rf & 0x4) q += 4;
            for (let i = 0; i < n && q <= run.e; i++) {
              let dur = dDur, size = dSize;
              if (rf & 0x100) { dur = u32(d, q); q += 4; }
              if (rf & 0x200) { size = u32(d, q); q += 4; }
              if (rf & 0x400) q += 4;
              if (rf & 0x800) q += 4;
              tr.offsets.push(cursor); tr.sizes.push(size); tr.times.push(t / tr.timescale);
              cursor += size; t += dur;
            }
          }
          tr.nextT = t;
        } catch (e) { /* fragment abîmé : sauté */ }
      }
    }
  }

  /** 08/11 (v55) : toutes les pistes son qui ont vraiment des échantillons (celles au codec connu d'abord) */
  async function audioTracks(read, size) {
    const boxes = await topBoxes(read, size);
    const d = await findMoov(read, size, boxes);
    const moov = { s: 8, e: d.byteLength };
    const trex = {};
    for (const x of find(d, moov, ['mvex', 'trex'])) trex[u32(d, x.s + 4)] = { dur: u32(d, x.s + 12), size: u32(d, x.s + 16) };
    const list = [];
    for (const trak of find(d, moov, ['trak'])) {
      try {
        const hdlr = find(d, trak, ['mdia', 'hdlr'])[0];
        if (!hdlr || type(d, hdlr.s + 8) !== 'soun') continue;
        const tr = soundTrak(d, trak, trex); if (tr) list.push(tr);
      } catch (e) { /* piste abîmée : on passe à la suivante */ }
    }
    if (list.length && boxes.some((b) => b.t === 'moof')) await addFragments(read, boxes, list);
    const out = [];
    for (const tr of list) {
      // échantillons vides ou hors du fichier : retirés
      const keep = []; for (let i = 0; i < tr.sizes.length; i++) if (tr.sizes[i] > 0 && tr.offsets[i] + tr.sizes[i] <= size) keep.push(i);
      if (!keep.length) continue;
      const n = keep.length, sizes = new Uint32Array(n), offsets = new Float64Array(n), times = new Float64Array(n);
      for (let j = 0; j < n; j++) { const i = keep[j]; sizes[j] = tr.sizes[i]; offsets[j] = tr.offsets[i]; times[j] = tr.times[i]; }
      const last = times[n - 1] + (n > 1 ? times[n - 1] - times[n - 2] : 0);
      out.push({ codec: tr.codec, description: tr.description, asc: tr.asc, channels: tr.channels, sampleRate: tr.sampleRate, timescale: tr.timescale,
        duration: tr.duration > 0 ? tr.duration : last, count: n, sizes, offsets, times });
    }
    const known = (t) => !!(t.codec && /^(mp4a|opus|flac|mp3)/.test(t.codec));
    out.sort((a, b) => (known(b) ? 1 : 0) - (known(a) ? 1 : 0));
    return out;
  }
  /** Décrit la piste audio : codec, fréquence, liste des échantillons (position, taille, temps) */
  async function audioTrack(read, size) {
    const l = await audioTracks(read, size);
    if (!l.length) throw new Error('pas de son dans cette vidéo');
    return l[0];
  }

  /** Temps (secondes) de chaque échantillon (anciennes descriptions : calculés depuis « deltas ») */
  function timesOf(tr) {
    if (tr.times) return tr.times;
    const times = new Float64Array(tr.count); let t = 0, si = 0;
    for (const [n, dl] of tr.deltas || []) for (let j = 0; j < n && si < tr.count; j++) { times[si++] = t / tr.timescale; t += dl; }
    tr.times = times; return times;
  }
  /** Parcourt les échantillons par paquets lus d'un coup (≈ 2 Mo). cb(Uint8Array, index, tempsEnSecondes)
      v55 : un échantillon incomplet (fichier coupé) ou dont la lecture plante est sauté, il ne fait pas tout échouer. */
  async function forEachSample(read, tr, cb, opt) {
    opt = opt || {};
    const maxRead = opt.maxRead || 2 * 1024 * 1024, gapMax = opt.gapMax || 256 * 1024;
    const times = timesOf(tr);
    let i = opt.from || 0;
    const first = i, last = opt.to != null ? Math.min(tr.count, opt.to) : tr.count; // 08/11 : opt.to = s'arrêter avant cet échantillon
    while (i < last) {
      if (opt.cancelled && opt.cancelled()) return false;
      const a = tr.offsets[i]; let j = i + 1, end = a + tr.sizes[i];
      while (j < last) {
        const o = tr.offsets[j];
        if (o < end || o - end > gapMax || o + tr.sizes[j] - a > maxRead) break;
        end = o + tr.sizes[j]; j++;
      }
      let buf = null; try { buf = new Uint8Array(await read(a, end - a)); } catch (e) { buf = null; }
      if (buf) {
        for (let k = i; k < j; k++) {
          const s = tr.offsets[k] - a;
          if (s + tr.sizes[k] > buf.length) continue; // échantillon incomplet : sauté
          await cb(buf.subarray(s, s + tr.sizes[k]), k, times[k]);
        }
      }
      if (opt.progress) opt.progress((j - first) / Math.max(1, last - first));
      i = j;
    }
    return true;
  }

  /** 08/11 : échantillons à lire pour le passage [t0, t1] (secondes) : { from, to } (to exclu), avec une petite marge avant/après */
  function sampleRange(tr, t0, t1) {
    let from = -1, to = tr.count; const times = timesOf(tr);
    for (let si = 0; si < tr.count; si++) {
      const s = times[si];
      if (s <= t0) from = si;
      if (s >= t1) { to = si; break; }
    }
    if (from < 0) from = 0;
    return { from: Math.max(0, from - 2), to: Math.min(tr.count, to + 2) };
  }
  /** 08/11 : en-tête ADTS (7 octets) pour un échantillon AAC (pour le lire avec decodeAudioData). null si impossible.
      v55 : marche aussi avec l'AAC-HE (SBR / PS) : l'en-tête annonce l'AAC de base, le décodeur retrouve le reste. */
  function adtsHeader(asc, len) {
    const p = parseAsc(asc); if (!p) return null;
    let aot = p.sbr ? 2 : p.aot; if (aot === 5 || aot === 29) aot = 2;
    const fi = p.fi, cc = p.cc;
    if (aot < 1 || aot > 4 || fi < 0 || fi > 12 || cc < 1 || cc > 7) return null;
    const L = len + 7;
    if (L > 8191) return null;
    return new Uint8Array([0xff, 0xf1, ((aot - 1) << 6) | (fi << 2) | (cc >> 2), ((cc & 3) << 6) | (L >> 11), (L >> 3) & 0xff, ((L & 7) << 5) | 0x1f, 0xfc]);
  }

  return { audioTrack, audioTracks, forEachSample, findMoov, sampleRange, adtsHeader, parseAsc, lcAsc };
});
