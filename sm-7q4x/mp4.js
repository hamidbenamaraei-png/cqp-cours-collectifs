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

  /** read(offset, length) → Promise<ArrayBuffer> ; size = taille du fichier */
  async function findMoov(read, size) {
    let off = 0;
    while (off + 8 <= size) {
      const h = new DataView(await read(off, 16));
      let sz = u32(h, 0); const t = type(h, 4); let hl = 8;
      if (sz === 1) { sz = u64(h, 8); hl = 16; } else if (sz === 0) sz = size - off;
      if (sz < 8) throw new Error('fichier MP4 abîmé');
      if (t === 'moov') return new DataView(await read(off, sz));
      off += sz; void hl;
    }
    throw new Error('pas de « moov » : ce n\'est pas un MP4 lisible');
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
    while (o < e) {
      const tag = d.getUint8(o++); const l = readLen();
      if (tag === 0x03) { o += 2; const fl = d.getUint8(o++); if (fl & 0x80) o += 2; if (fl & 0x40) o += d.getUint8(o) + 1; if (fl & 0x20) o += 2; continue; }
      if (tag === 0x04) { const ot = d.getUint8(o); o += 13; if (ot === 0x6b || ot === 0x69) return { mp3: true }; continue; }
      if (tag === 0x05) return { asc: new Uint8Array(d.buffer, d.byteOffset + o, l).slice() };
      o += l;
    }
    return {};
  }

  /** Décrit la piste audio : codec, fréquence, liste des échantillons (position, taille) */
  async function audioTrack(read, size) {
    const d = await findMoov(read, size);
    const moov = { s: 8, e: d.byteLength };
    for (const trak of find(d, moov, ['trak'])) {
      const hdlr = find(d, trak, ['mdia', 'hdlr'])[0];
      if (!hdlr || type(d, hdlr.s + 8) !== 'soun') continue;
      const mdhd = find(d, trak, ['mdia', 'mdhd'])[0];
      const ver = d.getUint8(mdhd.s);
      const timescale = ver === 1 ? u32(d, mdhd.s + 20) : u32(d, mdhd.s + 12);
      const duration = ver === 1 ? u64(d, mdhd.s + 24) : u32(d, mdhd.s + 16);
      const stbl = find(d, trak, ['mdia', 'minf', 'stbl'])[0];
      const get = (n) => children(d, stbl.s, stbl.e).find((c) => c.t === n);
      const stsd = get('stsd');
      const ent = children(d, stsd.s + 8, stsd.e)[0];
      const fmt = ent.t; const sv = d.getUint16(ent.s + 8);
      const channels = d.getUint16(ent.s + 16), rate = u32(d, ent.s + 24) / 65536;
      let ext = ent.s + 28; if (sv === 1) ext += 16; else if (sv === 2) ext += 36;
      let codec = null, description;
      const sub = children(d, ext, ent.e);
      if (fmt === 'mp4a') {
        const es = sub.find((c) => c.t === 'esds') || (sub.find((c) => c.t === 'wave') && children(d, sub.find((c) => c.t === 'wave').s, sub.find((c) => c.t === 'wave').e).find((c) => c.t === 'esds'));
        const info = es ? parseEsds(d, es.s, es.e) : {};
        if (info.mp3) codec = 'mp3';
        else {
          description = info.asc;
          let aot = 2; if (description && description.length) { aot = description[0] >> 3; if (aot === 31) aot = 32 + (((description[0] & 7) << 3) | (description[1] >> 5)); }
          codec = 'mp4a.40.' + aot;
        }
      } else if (fmt === 'Opus') codec = 'opus';
      else if (fmt === 'fLaC') codec = 'flac';
      else if (fmt === '.mp3') codec = 'mp3';
      else if (fmt === 'ulaw') codec = 'ulaw'; else if (fmt === 'alaw') codec = 'alaw';
      // tables
      const stsz = get('stsz') || get('stz2'), stsc = get('stsc'), stco = get('stco') || get('co64'), stts = get('stts');
      const fixed = u32(d, stsz.s + 4), count = u32(d, stsz.s + 8);
      const sizes = new Uint32Array(count);
      for (let i = 0; i < count; i++) sizes[i] = fixed || u32(d, stsz.s + 12 + 4 * i);
      const nch = u32(d, stco.s + 4), co64 = stco === get('co64');
      const chunks = new Array(nch);
      for (let i = 0; i < nch; i++) chunks[i] = co64 ? u64(d, stco.s + 8 + 8 * i) : u32(d, stco.s + 8 + 4 * i);
      const nsc = u32(d, stsc.s + 4), sc = [];
      for (let i = 0; i < nsc; i++) sc.push([u32(d, stsc.s + 8 + 12 * i), u32(d, stsc.s + 12 + 12 * i)]);
      const offsets = new Float64Array(count); let si = 0;
      for (let c = 0; c < nch && si < count; c++) {
        let k = sc.length - 1; while (k > 0 && sc[k][0] > c + 1) k--;
        let o = chunks[c];
        for (let j = 0; j < sc[k][1] && si < count; j++) { offsets[si] = o; o += sizes[si]; si++; }
      }
      const nts = u32(d, stts.s + 4), deltas = [];
      for (let i = 0; i < nts; i++) deltas.push([u32(d, stts.s + 8 + 8 * i), u32(d, stts.s + 12 + 8 * i)]);
      return { codec, description, channels, sampleRate: rate || timescale, timescale, duration: duration / timescale, count, sizes, offsets, deltas };
    }
    throw new Error('pas de son dans cette vidéo');
  }

  /** Parcourt les échantillons par paquets lus d'un coup (≈ 2 Mo). cb(Uint8Array, index, tempsEnSecondes) */
  async function forEachSample(read, tr, cb, opt) {
    opt = opt || {};
    const maxRead = opt.maxRead || 2 * 1024 * 1024, gapMax = opt.gapMax || 256 * 1024;
    const times = new Float64Array(tr.count); let t = 0, si = 0;
    for (const [n, dl] of tr.deltas) for (let j = 0; j < n && si < tr.count; j++) { times[si++] = t / tr.timescale; t += dl; }
    let i = opt.from || 0;
    while (i < tr.count) {
      if (opt.cancelled && opt.cancelled()) return false;
      const a = tr.offsets[i]; let j = i + 1, end = a + tr.sizes[i];
      while (j < tr.count) {
        const o = tr.offsets[j];
        if (o < end || o - end > gapMax || o + tr.sizes[j] - a > maxRead) break;
        end = o + tr.sizes[j]; j++;
      }
      const buf = new Uint8Array(await read(a, end - a));
      for (let k = i; k < j; k++) {
        const s = tr.offsets[k] - a;
        await cb(buf.subarray(s, s + tr.sizes[k]), k, times[k]);
      }
      if (opt.progress) opt.progress(j / tr.count);
      i = j;
    }
    return true;
  }

  return { audioTrack, forEachSample, findMoov };
});
