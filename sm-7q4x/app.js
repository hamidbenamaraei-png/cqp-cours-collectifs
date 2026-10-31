/* ScriptMove – application (tout reste dans le téléphone) */
(function () {
  'use strict';
  const C = window.SMCore, MP4 = window.SMMp4;
  const MP_VER = '0.10.14';
  const MP_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + MP_VER;
  const MODELS = {
    lite: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    full: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'
  };
  const STYLE_INFO = { pump: { label: 'Pump', test: false }, combat: { label: 'Combat', test: false }, attack: { label: 'Attack', test: true }, step: { label: 'Step', test: true } };
  const app = document.getElementById('app');
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const fmt = C.fmtTime;
  const fmtDur = (s) => { s = Math.max(0, Math.round(s)); if (s < 60) return s + ' s'; const m = Math.round(s / 60); if (m < 60) return m + ' min'; return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
  const DEF_SET = { quality: 'precis', numPoses: 6 };
  const S = { videoFile: null, videoURL: null, settings: Object.assign({}, DEF_SET), vocab: {}, prints: [] };
  window.SM = S; // pour les tests

  /* ======================= Base de données (IndexedDB) ======================= */
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res, rej) => {
      const r = indexedDB.open('scriptmove', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('courses', { keyPath: 'id' }); d.createObjectStore('musics', { keyPath: 'id' }); d.createObjectStore('data'); d.createObjectStore('kv'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode); const r = fn(t.objectStore(store));
      t.oncomplete = () => res(r && 'result' in r ? r.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('abandon'));
    });
  }
  const dget = (st, k) => tx(st, 'readonly', (s) => s.get(k));
  const dput = (st, v, k) => tx(st, 'readwrite', (s) => (k === undefined ? s.put(v) : s.put(v, k)));
  const ddel = (st, k) => tx(st, 'readwrite', (s) => s.delete(k));
  const dall = (st) => tx(st, 'readonly', (s) => s.getAll());
  const saveCourse = (c) => dput('courses', c);
  async function loadKV() {
    S.settings = Object.assign({}, DEF_SET, (await dget('kv', 'settings')) || {});
    if (!(S.settings.numPoses >= 6)) S.settings.numPoses = 6; // petites personnes : on en cherche au moins 6
    if (!S.settings.quality) S.settings.quality = 'precis';
    S.vocab = (await dget('kv', 'vocab')) || {};
    S.prints = (await dget('kv', 'prints')) || [];
  }
  const saveKV = (k) => dput('kv', S[k === 'settings' ? 'settings' : k], k);

  /* ======================= Petits outils d'écran ======================= */
  let acts = {};
  function render(html, actions) {
    app.innerHTML = html; acts = actions || {}; window.scrollTo(0, 0);
  }
  app.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || !app.contains(b)) return;
    const f = acts[b.dataset.act]; if (f) { e.preventDefault(); f(b, e); }
  });
  function toast(msg, ms) {
    document.querySelectorAll('.toast').forEach((x) => x.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
    setTimeout(() => t.remove(), ms || 2600);
  }
  /** Feuille du bas (fenêtre). Renvoie {el, close} ; handlers : data-sact */
  function sheet(html, handlers, onClose) {
    const bg = document.createElement('div'); bg.className = 'sheet-bg';
    bg.innerHTML = '<div class="sheet">' + html + '</div>';
    document.body.appendChild(bg);
    const close = () => { bg.remove(); if (onClose) onClose(); };
    bg.addEventListener('click', (e) => {
      if (e.target === bg) return close();
      const b = e.target.closest('[data-sact]'); if (!b) return;
      const f = handlers && handlers[b.dataset.sact]; if (f) { e.preventDefault(); f(b, e, close); }
    });
    return { el: bg.firstChild, close };
  }
  /** Question avec gros boutons. buttons = [{label, value, cls}] */
  function ask(title, text, buttons) {
    return new Promise((res) => {
      const h = '<h2>' + esc(title) + '</h2>' + (text ? '<p class="soft">' + text + '</p>' : '') +
        buttons.map((b, i) => '<button class="btn ' + (b.cls || '') + '" data-sact="b' + i + '">' + esc(b.label) + '</button>').join('');
      const hd = {}; buttons.forEach((b, i) => { hd['b' + i] = (el, e, close) => { res(b.value); close(); }; });
      sheet(h, hd, () => res(undefined));
    });
  }
  function askText(title, value, placeholder) {
    return new Promise((res) => {
      let done = false;
      const s = sheet('<h2>' + esc(title) + '</h2><input type="text" id="askt" value="' + esc(value || '') + '" placeholder="' + esc(placeholder || '') + '"><div style="height:12px"></div><button class="btn" data-sact="ok">✅ Valider</button><button class="btn sec" data-sact="no">Annuler</button>',
        { ok: (b, e, close) => { done = true; const v = $('#askt').value.trim(); close(); res(v || null); }, no: (b, e, close) => { done = true; close(); res(null); } }, () => { if (!done) res(null); });
      const i = $('#askt', s.el); i.focus(); i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { done = true; const v = i.value.trim(); s.close(); res(v || null); } });
    });
  }
  function pickFile(accept, multiple) {
    return new Promise((res) => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = accept; if (multiple) i.multiple = true;
      i.style.display = 'none'; document.body.appendChild(i);
      i.onchange = () => { const f = Array.from(i.files || []); i.remove(); res(f); };
      i.click();
    });
  }
  let wake = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
      if (!on && wake) { await wake.release(); wake = null; }
    } catch (e) { /* pas grave */ }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.wantAwake) keepAwake(true); });
  const styleName = (st) => (STYLE_INFO[st] || { label: st }).label;
  function movesFor(style) {
    const v = S.vocab[style] || {};
    const base = (C.MOVES[style] || []).map((n) => v[n] || n);
    const learned = S.prints.filter((p) => p.style === style).map((p) => p.name);
    return Array.from(new Set(base.concat(learned, S.customMoves && S.customMoves[style] || [])));
  }

  /* ======================= Code d'accès ======================= */
  async function sha(txt) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join('');
  }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* rien */ } }
  function scrLock() {
    const pin = lsGet('sm_pin');
    const creating = !pin;
    let first = null, code = '';
    const draw = () => {
      const title = creating ? (first ? 'Tape-le une 2e fois' : 'Choisis ton code') : 'Ton code';
      const sub = creating ? (first ? 'Pour être sûr qu\'il n\'y a pas d\'erreur.' : '4 à 8 chiffres. Il protège tes scripts sur ce téléphone.') : '';
      render('<div class="logo"><img src="icon-192.png" alt=""><div><b>ScriptMove</b><span>Tes chorés en script</span></div></div>' +
        '<div class="card" style="text-align:center"><h2>' + title + '</h2><p class="soft small">' + sub + '</p>' +
        '<div class="dots">' + Array.from({ length: Math.max(4, code.length) }, (_, i) => '<i class="' + (i < code.length ? 'f' : '') + '"></i>').join('') + '</div>' +
        '<p id="lmsg" class="small" style="min-height:24px;color:var(--ko);font-weight:700"></p>' +
        '<div class="pad">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => '<button data-act="k" data-k="' + n + '">' + n + '</button>').join('') +
        '<button data-act="del" aria-label="Effacer">⌫</button><button data-act="k" data-k="0">0</button><button class="ok" data-act="ok" aria-label="Valider">✓</button></div></div>' +
        (creating ? '' : '<div class="card j small"><b>Code oublié ?</b> Il n\'y a pas d\'autre moyen : touche « Tout effacer et recommencer ». Tes scripts seront perdus (sauf si tu as fait une sauvegarde 💾).</div><button class="btn ghost small" data-act="reset">🗑️ Tout effacer et recommencer</button>'),
      { k: (b) => { if (code.length < 8) { code += b.dataset.k; draw(); } }, del: () => { code = code.slice(0, -1); draw(); }, ok: submit, reset: resetAll });
      waitMsg();
    };
    const msg = (t) => { const m = $('#lmsg'); if (m) m.textContent = t; };
    let timer = null;
    function waitMsg() {
      const tr = lsGet('sm_tries') || {}; clearTimeout(timer);
      if (tr.until && tr.until > Date.now()) { msg('Trop d\'essais. Attends ' + Math.ceil((tr.until - Date.now()) / 1000) + ' s.'); timer = setTimeout(waitMsg, 1000); }
      else if (tr.until) msg('');
    }
    async function submit() {
      if (code.length < 4) { msg('Il faut au moins 4 chiffres.'); return; }
      if (creating) {
        if (!first) { first = code; code = ''; draw(); return; }
        if (first !== code) { first = null; code = ''; draw(); msg('Les deux codes ne sont pas pareils. Recommence.'); return; }
        const salt = uid() + uid();
        lsSet('sm_pin', { salt, hash: await sha(salt + ':' + code) });
        toast('Code enregistré ✅'); return start();
      }
      const tr = lsGet('sm_tries') || { fails: 0, locks: 0 };
      if (tr.until && tr.until > Date.now()) return waitMsg();
      const h = await sha(pin.salt + ':' + code);
      if (h === pin.hash) { lsSet('sm_tries', { fails: 0, locks: 0 }); return start(); }
      tr.fails = (tr.fails || 0) + 1; code = '';
      if (tr.fails >= 5) { tr.locks = (tr.locks || 0) + 1; tr.fails = 0; tr.until = Date.now() + 30000 * Math.pow(2, tr.locks - 1); }
      lsSet('sm_tries', tr); draw();
      if (!tr.until || tr.until < Date.now()) msg('Ce n\'est pas le bon code. Encore ' + (5 - tr.fails) + ' essai(s).');
    }
    draw();
  }
  async function resetAll() {
    const a = await ask('Tout effacer ?', 'Tous tes cours, scripts, musiques et ce que l\'appli a appris seront <b>supprimés de ce téléphone</b>. Tu pourras choisir un nouveau code.', [{ label: '🗑️ Oui, tout effacer', value: 1, cls: 'red' }, { label: 'Non, garder', value: 0, cls: 'sec' }]);
    if (!a) return;
    const b = await ask('Vraiment sûr ?', 'On ne peut pas revenir en arrière.', [{ label: 'Oui, je suis sûr', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
    if (!b) return;
    try { (await db()).close(); } catch (e) { /* rien */ }
    dbp = null;
    await new Promise((r) => { const q = indexedDB.deleteDatabase('scriptmove'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
    try { ['sm_pin', 'sm_tries'].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ }
    location.reload();
  }

  /* ======================= Accueil ======================= */
  async function scrHome() {
    S.wantAwake = false; keepAwake(false);
    const courses = (await dall('courses')).sort((a, b) => b.created - a.created);
    const card = (c) => {
      const done = c.morceaux.filter((m) => m.status === 'done').length;
      return '<button class="seg" data-act="open" data-id="' + c.id + '"><span class="n">' + esc(styleName(c.style).slice(0, 2)) + '</span><span class="t"><b>' + esc(c.name) + '</b><span class="mute">' + c.morceaux.length + ' morceau(x) · ' + done + ' analysé(s)</span></span><span style="font-size:24px">›</span></button>';
    };
    render('<div class="logo"><img src="icon-192.png" alt=""><div><b>ScriptMove</b><span>Tes chorés en script</span></div></div>' +
      '<button class="btn" data-act="new">➕ Nouveau cours</button>' +
      (courses.length ? '<h2 style="margin-top:18px">Mes cours</h2>' + courses.map(card).join('') : '<div class="card o"><h3>Bienvenue Hamid 👋</h3><p class="soft">Choisis une vidéo de cours : l\'appli regarde le groupe (ou une seule personne) et écrit le script (mouvements + répétitions). Tout reste dans ton téléphone.</p><p class="soft small">Conseil pour le 1er essai : un seul morceau.</p></div>') +
      '<div style="height:10px"></div><div class="row"><button class="btn sec" data-act="moves">📚 Mes mouvements</button><button class="btn sec" data-act="set">⚙️ Réglages</button></div>' +
      '<div class="row"><button class="btn sec" data-act="save">💾 Sauvegarder mes scripts</button><button class="btn sec" data-act="restore">📂 Restaurer</button></div>',
    { new: () => scrNew(), open: (b) => scrCourse(b.dataset.id), moves: () => scrMoves('pump'), set: () => scrSettings(), save: () => doBackup(), restore: () => doRestore() });
  }

  /* ======================= Nouveau cours ======================= */
  function videoMeta(file) {
    return new Promise((res) => {
      const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
      const u = URL.createObjectURL(file); v.src = u;
      const free = () => { v.removeAttribute('src'); v.load(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
      v.onloadedmetadata = () => { res({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); free(); };
      v.onerror = () => { res(null); free(); };
    });
  }
  function setVideo(file) {
    if (S.videoURL) URL.revokeObjectURL(S.videoURL);
    S.videoFile = file; S.videoURL = URL.createObjectURL(file); S.vid = null;
  }
  function scrNew() {
    const st = { file: null, meta: null, style: 'pump', name: '', musics: [] };
    const draw = () => {
      const d = new Date();
      if (!st.name) st.name = styleName(st.style) + ' – ' + d.toLocaleDateString('fr-FR');
      render('<div class="top"><button class="back" data-act="back">‹</button><h1>Nouveau cours</h1></div>' +
        '<div class="card o"><h2>1. La vidéo du cours</h2>' +
        (st.file ? '<p>🎬 <b>' + esc(st.file.name) + '</b><br><span class="mute">' + (st.meta ? fmt(st.meta.duration) + ' · ' : '') + (st.file.size / 1e6).toFixed(0) + ' Mo</span></p><button class="btn sec small" data-act="vid">Changer de vidéo</button>' : '<button class="btn" data-act="vid">🎬 Choisir la vidéo</button><p class="mute">Elle reste dans ton téléphone, rien n\'est envoyé.</p>') + '</div>' +
        '<div class="card o"><h2>2. Le style</h2><div class="chips">' + Object.keys(STYLE_INFO).map((k) => '<button class="chip ' + (st.style === k ? 'on' : '') + '" data-act="style" data-k="' + k + '">' + STYLE_INFO[k].label + (STYLE_INFO[k].test ? '<small>en test</small>' : '') + '</button>').join('') + '</div></div>' +
        '<div class="card o"><h2>3. Le nom</h2><input type="text" id="cname" value="' + esc(st.name) + '"></div>' +
        '<div class="card o"><h2>4. Tes musiques <span class="mute">(conseillé)</span></h2><p class="soft small">Ajoute les musiques du cours (tes fichiers propres). L\'appli retrouve toute seule où chacune commence dans la vidéo, et tu pourras jouer le script en musique.</p>' +
        st.musics.map((f, i) => '<div class="row" style="align-items:center;margin-bottom:8px"><span style="flex:3 1 200px">🎵 ' + esc(f.name) + '</span><button class="btn sec small" style="flex:0 0 auto;width:auto;margin:0" data-act="rm" data-i="' + i + '">Retirer</button></div>').join('') +
        '<button class="btn sec" data-act="mus">🎵 Ajouter des musiques</button></div>' +
        '<button class="btn" data-act="go" ' + (st.file ? '' : 'disabled') + '>➡️ Continuer</button>',
      {
        back: () => scrHome(),
        vid: async () => { const f = (await pickFile('video/*'))[0]; if (!f) return; st.file = f; st.meta = await videoMeta(f); draw(); },
        style: (b) => { const old = styleName(st.style); st.style = b.dataset.k; st.name = ($('#cname').value || '').replace(old, styleName(st.style)); draw(); },
        mus: async () => { const fs = await pickFile('audio/*', true); st.name = $('#cname').value; st.musics.push(...fs); draw(); },
        rm: (b) => { st.name = $('#cname').value; st.musics.splice(+b.dataset.i, 1); draw(); },
        go: async () => {
          if (!st.file) return;
          if (!st.meta) { toast('Cette vidéo ne peut pas être lue par le téléphone.'); return; }
          setVideo(st.file);
          const c = { id: uid(), name: $('#cname').value.trim() || st.name, style: st.style, created: Date.now(), video: { name: st.file.name, size: st.file.size, duration: st.meta.duration, w: st.meta.w, h: st.meta.h }, morceaux: [], audio: 'todo' };
          const mids = [];
          for (const f of st.musics) { const m = { id: uid(), name: f.name.replace(/\.[^.]+$/, ''), type: f.type, blob: f }; await dput('musics', m); mids.push(m.id); }
          c.pendingMusics = mids;
          await saveCourse(c);
          scrPrepare(c);
        }
      });
      const i = $('#cname'); if (i) i.addEventListener('input', () => { st.name = i.value; });
    };
    draw();
  }

  /* ======================= Son : lecture et alignement ======================= */
  /** Lit le son d'une vidéo, renvoie les caractéristiques (énergie par bande, 50 par seconde) */
  async function readVideoAudio(file, progress, cancelled) {
    const read = (o, l) => file.slice(o, o + l).arrayBuffer();
    let tr = null;
    try { tr = await MP4.audioTrack(read, file.size); } catch (e) { tr = null; }
    if (tr && window.AudioDecoder && tr.codec && /^(mp4a|opus|flac|mp3)/.test(tr.codec)) {
      try {
        const cfg = { codec: tr.codec, sampleRate: tr.sampleRate, numberOfChannels: tr.channels };
        if (tr.description) cfg.description = tr.description;
        const sup = await AudioDecoder.isConfigSupported(cfg);
        if (sup.supported) {
          let fs = null, err = null; let tmp = new Float32Array(4096), mono = new Float32Array(4096);
          const dec = new AudioDecoder({
            output: (ad) => {
              try {
                const n = ad.numberOfFrames, ch = ad.numberOfChannels;
                if (!fs) fs = new C.AudioFeatureStream(ad.sampleRate);
                if (tmp.length < n * ch) { tmp = new Float32Array(n * ch); }
                if (mono.length < n) mono = new Float32Array(n);
                mono.fill(0, 0, n);
                let planar = true;
                try { for (let c = 0; c < ch; c++) { ad.copyTo(tmp.subarray(0, n), { planeIndex: c, format: 'f32-planar' }); for (let i = 0; i < n; i++) mono[i] += tmp[i] / ch; } } catch (e) { planar = false; }
                if (!planar) {
                  if (ad.format === 'f32') { ad.copyTo(tmp.subarray(0, n * ch), { planeIndex: 0 }); for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < ch; c++) s += tmp[i * ch + c]; mono[i] = s / ch; } }
                  else if (ad.format === 's16') { const t16 = new Int16Array(n * ch); ad.copyTo(t16, { planeIndex: 0 }); for (let i = 0; i < n; i++) { let s = 0; for (let c = 0; c < ch; c++) s += t16[i * ch + c]; mono[i] = s / ch / 32768; } }
                }
                fs.push(mono.subarray(0, n));
              } catch (e) { err = e; }
              ad.close();
            },
            error: (e) => { err = e; }
          });
          dec.configure(cfg);
          const ok = await MP4.forEachSample(read, tr, async (bytes, i, t) => {
            if (err) throw err;
            dec.decode(new EncodedAudioChunk({ type: 'key', timestamp: Math.round(t * 1e6), data: bytes }));
            if (dec.decodeQueueSize > 40) { while (dec.decodeQueueSize > 10) await sleep(2); }
          }, { progress, cancelled });
          if (!ok) { try { dec.close(); } catch (e) { /* rien */ } return null; }
          await dec.flush(); dec.close();
          if (err) throw err;
          if (fs) return fs.finish();
        }
      } catch (e) { console.warn('WebCodecs audio', e); }
    }
    // plan B : petits fichiers seulement
    if (file.size < 400e6) {
      progress && progress(0.3);
      const buf = await decodeSmall(await file.arrayBuffer());
      progress && progress(1);
      return C.audioFeaturesFromPCM(buf.data, buf.rate);
    }
    throw new Error('son illisible');
  }
  async function decodeSmall(ab) {
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new AC(1, 1, 8000);
    const b = await ctx.decodeAudioData(ab);
    const n = b.length, ch = b.numberOfChannels, out = new Float32Array(n);
    for (let c = 0; c < ch; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) out[i] += d[i] / ch; }
    return { data: out, rate: b.sampleRate, duration: b.duration };
  }
  async function musicFeatures(m) {
    const buf = await decodeSmall(await m.blob.arrayBuffer());
    const feat = C.audioFeaturesFromPCM(buf.data, buf.rate);
    const tr = C.trimSilence(feat);
    const bpm = C.estimateBPM(C.sliceFeat(feat, tr.start + 15, Math.min(tr.end, tr.start + 150))) || C.estimateBPM(feat);
    return { feat, duration: buf.duration, bpm, attack: C.firstBeat(feat, tr.start, tr.start + 30, bpm), trim: tr };
  }
  /** Tempo de la vidéo sur un morceau (musique de la salle) */
  function videoBpm(feat, a, b) { const s = a + Math.min(20, (b - a) * 0.15), e = Math.min(b - 5, s + 120); return e - s > 20 ? C.estimateBPM(C.sliceFeat(feat, s, e)) : null; }
  /** Calage « au rythme » d'une musique qui n'est pas exactement celle de la vidéo */
  function tempoSync(feat, mo, mu) {
    const vb = mo.bpm || (feat ? videoBpm(feat, mo.start, mo.end) : null);
    const va = feat ? C.firstBeat(feat, mo.start, Math.min(mo.end, mo.start + 30), vb) : mo.start;
    const sy = C.makeSync({ vAttack: va, vBpm: vb, mAttack: mu.attack || 0, mBpm: mu.bpm });
    sy.musicId = mu.id; return sy;
  }
  /** Lien musique ↔ vidéo d'un morceau (null s'il n'y a pas de musique) */
  function syncOf(m) {
    if (!m.musicId) return null;
    if (m.sync && (!m.sync.musicId || m.sync.musicId === m.musicId)) return m.sync;
    if (m.offset != null && !m.alignMode) return { mode: 'sure', v0: m.offset, a0: 0, ratio: 1, vTop: m.offset }; // ancien cours
    return null;
  }

  /** Découpage automatique : musiques retrouvées sûrement + blancs entre morceaux + proposition des musiques.
      Renvoie la liste des morceaux. ui = {title(t), bar(f), msg(t)} */
  async function autoCut(c, feat, mids, ui) {
    const dur = c.video.duration;
    const infos = [];
    for (const id of mids) {
      const mu = await dget('musics', id); if (!mu) continue;
      ui.msg('Je lis ta musique : ' + mu.name); await sleep(10);
      try {
        const r = await musicFeatures(mu);
        mu.duration = r.duration; mu.bpm = r.bpm; mu.attack = r.attack; mu.len = r.trim.end - r.trim.start; await dput('musics', mu);
        infos.push({ mu, feat: r.feat });
      } catch (e) { infos.push({ mu, err: true }); }
    }
    const items = [];
    if (feat && infos.some((x) => !x.err)) {
      ui.title('Je cherche tes musiques dans la vidéo…'); ui.bar(0);
      const maxM = Math.max(10, ...infos.filter((x) => !x.err).map((x) => x.feat.n));
      const vp = C.prepareVideo2(feat, maxM);
      let k = 0;
      for (const x of infos) {
        k++; ui.bar(k / infos.length); ui.msg('Musique ' + k + ' / ' + infos.length + ' : ' + x.mu.name); await sleep(20);
        if (x.err) continue;
        const res = C.findMusic(vp, x.feat);
        items.push({ id: x.mu.id, res });
      }
    }
    const placed = C.placeMusics(items);
    const segs = placed.map((p) => ({ start: Math.max(0, p.res.start), end: Math.min(dur, p.res.end), musicId: p.id, res: p.res }));
    if (feat) {
      ui.title('Je découpe la vidéo en morceaux…'); ui.msg('Je cherche les blancs entre les musiques.'); await sleep(20);
      const cs = C.cutSongs(feat, { expected: infos.length || 0, minSong: 100 });
      for (const pc of cs.pieces) {
        // on garde la plus grande partie libre (pas déjà prise par une musique retrouvée)
        let parts = [[pc.start, pc.end]];
        for (const g of segs.filter((x) => x.musicId)) parts = parts.flatMap(([a, b]) => (g.end <= a || g.start >= b ? [[a, b]] : [[a, Math.min(b, g.start)], [Math.max(a, g.end), b]].filter(([x, y]) => y - x > 1)));
        parts.sort((p, q) => (q[1] - q[0]) - (p[1] - p[0]));
        if (parts[0] && parts[0][1] - parts[0][0] >= 60) segs.push({ start: parts[0][0], end: parts[0][1] });
      }
    } else if (!segs.length) segs.push({ start: 0, end: dur });
    segs.sort((a, b) => a.start - b.start);
    if (feat) segs.forEach((g) => { g.bpm = g.res ? null : videoBpm(feat, g.start, g.end); });
    const mlist = infos.filter((x) => !x.err).map((x) => ({ id: x.mu.id, name: x.mu.name, duration: x.mu.len || x.mu.duration, bpm: x.mu.bpm }));
    const prop = C.proposeMusics(segs, mlist);
    const byId = {}; for (const x of infos) byId[x.mu.id] = x.mu;
    const morceaux = segs.map((g, i) => {
      if (g.res) {
        const mu = byId[g.musicId];
        const mo = newMorceau(mu.name, g.start, g.end, g.musicId, g.res.offset, g.res.conf, false);
        mo.alignMode = 'sure'; mo.sync = { mode: 'sure', v0: g.res.offset, a0: 0, ratio: g.res.ratio, vTop: g.res.offset + (mu.attack || 0) * g.res.ratio, musicId: mu.id };
        return mo;
      }
      const p = prop[i], mu = p && p.musicId ? byId[p.musicId] : null;
      const mo = newMorceau(mu ? mu.name : 'Morceau ' + (i + 1), g.start, g.end, mu ? mu.id : null, null, 0, false);
      mo.bpm = g.bpm || null; mo.autoName = true;
      if (mu) { mo.alignMode = 'proposed'; mo.proposedSure = !!p.sure; mo.sync = tempoSync(feat, mo, mu); }
      return mo;
    });
    const used = new Set(morceaux.map((x) => x.musicId).filter(Boolean));
    for (const x of infos) if (!used.has(x.mu.id)) { const lo = newMorceau(x.mu.name, 0, 0, x.mu.id, null, 0, true); lo.why = x.err ? 'illisible' : 'absente'; morceaux.push(lo); }
    return morceaux;
  }

  /** Étape « préparation » : lecture du son, recherche des musiques, découpage */
  async function scrPrepare(c) {
    let cancelled = false;
    render('<div class="top"><h1>Préparation</h1></div><div class="card o"><h2 id="pt">J\'écoute le son de la vidéo…</h2><div class="bar"><i id="pb"></i></div><p class="soft" id="pm" style="margin-top:10px">Ça prend environ 1 à 3 minutes pour 1 h de vidéo.</p></div><button class="btn sec" data-act="stop">Passer (je découperai à la main)</button>',
      { stop: () => { cancelled = true; } });
    S.wantAwake = true; keepAwake(true);
    const ui = { bar: (f) => { const b = $('#pb'); if (b) b.style.width = Math.round(f * 100) + '%'; }, title: (t) => { const e = $('#pt'); if (e) e.textContent = t; }, msg: (t) => { const e = $('#pm'); if (e) e.textContent = t; } };
    let feat = null;
    try { feat = await readVideoAudio(S.videoFile, ui.bar, () => cancelled); } catch (e) { feat = null; }
    if (feat) { await dput('data', feat, 'af:' + c.id); c.audio = 'ok'; } else c.audio = 'none';
    const mids = c.pendingMusics || []; delete c.pendingMusics;
    c.musicIds = mids;
    let morceaux;
    try { morceaux = await autoCut(c, cancelled ? null : feat, mids, ui); } catch (e) { console.error(e); morceaux = [newMorceau('Morceau 1', 0, c.video.duration)]; }
    c.morceaux = morceaux; c.cutVersion = 2;
    await saveCourse(c);
    S.wantAwake = false; keepAwake(false);
    if (!feat) toast(cancelled ? 'D\'accord, découpe à la main.' : 'Je n\'arrive pas à lire le son : découpe à la main.', 4000);
    scrCut(c.id);
  }
  function newMorceau(name, start, end, musicId, offset, conf, lost) {
    return { id: uid(), name, start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10, musicId: musicId || null, offset: offset == null ? null : offset, alignConf: conf || 0, shift: 0, bpm: null, status: 'todo', progressT: null, segments: [], lost: !!lost, sync: null, alignMode: null };
  }
  /** Musiques du cours (dans l'ordre où elles ont été ajoutées) */
  function courseMusicIds(c) {
    const ids = (c.musicIds || []).slice();
    for (const m of c.morceaux) if (m.musicId && !ids.includes(m.musicId)) ids.push(m.musicId);
    return ids;
  }
  /** Ancien découpage (musiques placées par l'ancienne méthode) ? */
  const oldCut = (c) => !c.cutVersion && c.morceaux.some((m) => m.musicId);

  /** Refaire le découpage d'un cours existant, sans tout recommencer (vidéo, musiques et nom gardés) */
  async function redoCut(c) {
    const done = c.morceaux.filter((m) => !m.lost && (m.status === 'done' || m.status === 'partial')).length;
    const r = await ask('Refaire le découpage ?', 'Je retrouve les morceaux avec la nouvelle méthode (les musiques ne sont plus jamais placées au hasard). Tes musiques, ta vidéo et le nom du cours sont gardés.' + (done ? '<br><b>' + done + ' morceau(x) déjà analysé(s)</b> : ceux dont les limites ne changent pas sont gardés, les autres seront à analyser à nouveau.' : ''), [{ label: '🔁 Oui, refaire', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
    if (!r) return;
    let feat = await dget('data', 'af:' + c.id);
    if (!feat) {
      if (!S.videoFile || S.videoFile.size !== c.video.size) {
        const q = await ask('Choisis la vidéo', 'Pour écouter le son, choisis à nouveau la vidéo du cours <b>' + esc(c.video.name) + '</b>.', [{ label: '🎬 Choisir la vidéo', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
        if (!q || !(await chooseVideoAgain(c))) return;
      }
    }
    render('<div class="top"><h1>Nouveau découpage</h1></div><div class="card o"><h2 id="pt">Un instant…</h2><div class="bar"><i id="pb"></i></div><p class="soft" id="pm" style="margin-top:10px"></p></div>');
    S.wantAwake = true; keepAwake(true);
    const ui = { bar: (f) => { const b = $('#pb'); if (b) b.style.width = Math.round(f * 100) + '%'; }, title: (t) => { const e = $('#pt'); if (e) e.textContent = t; }, msg: (t) => { const e = $('#pm'); if (e) e.textContent = t; } };
    if (!feat) { ui.title('J\'écoute le son de la vidéo…'); try { feat = await readVideoAudio(S.videoFile, ui.bar, () => false); } catch (e) { feat = null; } if (feat) { await dput('data', feat, 'af:' + c.id); c.audio = 'ok'; } }
    let ms;
    try { ms = await autoCut(c, feat, courseMusicIds(c), ui); } catch (e) { console.error(e); S.wantAwake = false; keepAwake(false); toast('Le découpage n\'a pas marché. Ton cours n\'a pas été modifié.', 4000); return scrCourse(c.id); }
    // garder les analyses des morceaux qui n'ont pas bougé
    const old = c.morceaux.filter((m) => !m.lost); const kept = new Set();
    ms = ms.map((n) => {
      if (n.lost) return n;
      const o = old.find((x) => !kept.has(x.id) && (x.status === 'done' || x.status === 'partial') && Math.abs(x.start - n.start) < 3 && Math.abs(x.end - n.end) < 3);
      if (!o) return n;
      kept.add(o.id);
      return Object.assign({}, n, { id: o.id, start: o.start, end: o.end, status: o.status, segments: o.segments, track: o.track, progressT: o.progressT, group: o.group, shift: o.shift || 0 });
    });
    for (const o of c.morceaux) if (!kept.has(o.id)) { await ddel('data', 'po:' + o.id); await ddel('data', 'th:' + o.id); }
    c.musicIds = courseMusicIds(c); c.morceaux = ms; c.cutVersion = 2;
    await saveCourse(c);
    S.wantAwake = false; keepAwake(false);
    toast('Nouveau découpage ✅ Vérifie les morceaux.', 3000);
    scrCut(c.id);
  }

  /* ======================= Découpage ======================= */
  async function scrCut(cid) {
    const c = await dget('courses', cid);
    const musics = {}; for (const m of await dall('musics')) musics[m.id] = m;
    const hasVid = !!(S.videoFile && S.videoFile.size === c.video.size);
    const vtime = () => { const v = $('#cutvid'); return v ? v.currentTime : 0; };
    const mids = courseMusicIds(c);
    const draw = () => {
      const lost = c.morceaux.filter((m) => m.lost);
      const ms = c.morceaux.filter((m) => !m.lost);
      const nSure = ms.filter((m) => m.alignMode === 'sure').length;
      const nProp = ms.filter((m) => m.alignMode === 'proposed').length;
      const usedIds = new Set(ms.map((m) => m.musicId).filter(Boolean));
      const musicLine = (m) => {
        if (!mids.length) return '';
        const mu = m.musicId && musics[m.musicId];
        if (m.alignMode === 'sure') return '<p class="small soft">🎵 ' + esc(mu ? mu.name : '?') + ' <span class="badge ok">✅ retrouvée</span></p>';
        const opts = '<option value="">— aucune musique —</option>' + mids.filter((id) => musics[id]).map((id) => '<option value="' + id + '"' + (id === m.musicId ? ' selected' : '') + '>' + esc(musics[id].name) + (usedIds.has(id) && id !== m.musicId ? ' (déjà prise)' : '') + '</option>').join('');
        const badge = !m.alignMode && m.musicId ? '<span class="badge q wrap">placée par l\'ancienne méthode : pas sûr</span>' : m.alignMode === 'proposed' ? '<span class="badge wait wrap">❓ musique pas retrouvée dans la vidéo : proposée' + (m.proposedSure ? ' (probable)' : ', vérifie') + '</span>' : m.alignMode === 'manual' ? '<span class="badge ok wrap">choisie par toi</span>' : '';
        return '<label class="lab small" style="margin-top:4px">🎵 Ta musique pour ce morceau</label>' + (badge ? '<p style="margin:0 0 6px">' + badge + '</p>' : '') + '<select data-mus="' + m.id + '">' + opts + '</select>';
      };
      render('<div class="top"><button class="back" data-act="back">‹</button><h1>Les morceaux</h1></div>' +
        (oldCut(c) ? '<div class="card r"><h3>⚠️ Ancien découpage</h3><p class="soft small">Ce cours a été découpé avec l\'ancienne méthode : des musiques ont pu être placées n\'importe où. Refais le découpage (vidéo, musiques et nom gardés).</p><button class="btn" data-act="redo">🔁 Refaire le découpage</button></div>' :
        mids.length ? '<div class="card ' + (nSure === ms.length ? 'g' : 'j') + ' small">' + (nSure ? '✅ <b>' + nSure + ' musique(s) retrouvée(s)</b> dans la vidéo.<br>' : '') +
          (nSure < mids.length ? '❓ <b>' + (mids.length - nSure) + ' musique(s) pas retrouvée(s) dans la vidéo</b> (souvent : une autre version, un autre mix). Je n\'en place jamais une au hasard : ' + (nProp ? 'pour chaque morceau, je te propose la plus probable (numéro, durée, tempo). <b>Vérifie avec la liste</b>.' : 'choisis-la dans la liste de chaque morceau.') : '') + '</div>' : '') +
        (hasVid ? '<div class="vidbox"><video id="cutvid" src="' + S.videoURL + '" controls playsinline preload="metadata"></video></div><p class="mute">Regarde la vidéo pour vérifier. « ✂️ Couper ici » coupe à l\'endroit où est la vidéo.</p><button class="btn sec" data-act="cut">✂️ Couper ici (' + '<span id="vt">0:00</span>)</button>' : '<div class="card j small">Pour voir la vidéo ici, choisis-la à nouveau (la même). <button class="btn sec small" data-act="revid" style="margin-top:8px">🎬 Choisir la vidéo</button></div>') +
        ms.map((m, i) => {
          return '<div class="card mrc ' + (m.alignMode === 'proposed' && !m.proposedSure ? 'j' : 'o') + '"><div class="head"><h2>Morceau ' + (i + 1) + '</h2><button class="btn sec small" style="width:auto;flex:0 0 auto;margin:0" data-act="ren" data-id="' + m.id + '">✏️ Nom</button></div>' +
            '<p style="margin:0 0 6px"><b>' + esc(m.name) + '</b> <span class="mute">(' + fmtDur(m.end - m.start) + ')</span></p>' +
            musicLine(m) +
            '<p class="tline"><span class="mute">Début</span> <b>' + fmt(m.start) + '</b></p><div class="times"><button data-act="mv" data-id="' + m.id + '" data-w="start" data-d="-5">−5</button><button data-act="mv" data-id="' + m.id + '" data-w="start" data-d="-1">−1</button><button data-act="mv" data-id="' + m.id + '" data-w="start" data-d="1">+1</button><button data-act="mv" data-id="' + m.id + '" data-w="start" data-d="5">+5</button>' + (hasVid ? '<button data-act="see" data-t="' + m.start + '">▶️</button>' : '') + '</div>' +
            '<p class="tline"><span class="mute">Fin</span> <b>' + fmt(m.end) + '</b></p><div class="times"><button data-act="mv" data-id="' + m.id + '" data-w="end" data-d="-5">−5</button><button data-act="mv" data-id="' + m.id + '" data-w="end" data-d="-1">−1</button><button data-act="mv" data-id="' + m.id + '" data-w="end" data-d="1">+1</button><button data-act="mv" data-id="' + m.id + '" data-w="end" data-d="5">+5</button>' + (hasVid ? '<button data-act="see" data-t="' + Math.max(0, m.end - 5) + '">▶️</button>' : '') + '</div>' +
            '<div class="row tight" style="margin-top:8px">' + (i + 1 < ms.length ? '<button class="btn sec small" data-act="fuse" data-id="' + m.id + '">🔗 Fusionner avec le suivant</button>' : '') + '<button class="btn sec small" data-act="del" data-id="' + m.id + '">🗑️ Retirer</button></div></div>';
        }).join('') +
        (lost.length ? '<div class="card r"><h3>❓ Musiques pas retrouvées dans la vidéo</h3><p class="soft small">Elles ne sont liées à aucun morceau. Tu peux en choisir une dans la liste d\'un morceau ci-dessus.</p>' + lost.map((m) => '<p>🎵 ' + esc(m.name) + '</p>').join('') + '</div>' : '') +
        '<button class="btn" data-act="ok">✅ C\'est bon</button>' +
        (mids.length || c.audio === 'ok' ? '<button class="btn ghost small" data-act="redo">🔁 Refaire le découpage automatique</button>' : ''),
      {
        back: () => scrCourse(c.id),
        revid: async () => { await chooseVideoAgain(c); scrCut(cid); },
        ren: async (b) => { const m = c.morceaux.find((x) => x.id === b.dataset.id); const n = await askText('Nom du morceau', m.name, 'ex. Morceau 3 : Squats'); if (n) { m.name = n; await saveCourse(c); draw(); } },
        mv: async (b) => {
          const m = c.morceaux.find((x) => x.id === b.dataset.id); const w = b.dataset.w; const d = +b.dataset.d;
          m[w] = Math.max(0, Math.min(c.video.duration, Math.round((m[w] + d) * 10) / 10));
          if (m.end < m.start + 5) { if (w === 'start') m.start = m.end - 5; else m.end = m.start + 5; }
          await saveCourse(c); const y = window.scrollY; draw(); window.scrollTo(0, y);
        },
        see: (b) => { const v = $('#cutvid'); if (v) { v.currentTime = +b.dataset.t; v.play(); v.scrollIntoView({ behavior: 'smooth' }); } },
        cut: async () => {
          const t = Math.round(vtime() * 10) / 10;
          const m = c.morceaux.find((x) => !x.lost && t > x.start + 3 && t < x.end - 3);
          if (!m) { toast('Mets la vidéo au milieu d\'un morceau, puis touche « Couper ici ».', 3500); return; }
          const n = newMorceau('Morceau', t, m.end); n.name = m.name + ' (suite)'; m.end = t;
          c.morceaux.splice(c.morceaux.indexOf(m) + 1, 0, n); m.status = 'todo'; m.segments = [];
          await saveCourse(c); draw(); toast('Coupé à ' + fmt(t));
        },
        fuse: async (b) => {
          const ms2 = c.morceaux.filter((x) => !x.lost); const i = ms2.findIndex((x) => x.id === b.dataset.id); const A = ms2[i], B = ms2[i + 1]; if (!B) return;
          A.end = B.end; A.status = 'todo'; A.segments = []; if (!A.musicId && B.musicId) { A.musicId = B.musicId; A.offset = B.offset; A.sync = B.sync; A.alignMode = B.alignMode; }
          c.morceaux.splice(c.morceaux.indexOf(B), 1); await saveCourse(c); draw();
        },
        del: async (b) => {
          const r = await ask('Retirer ce morceau ?', 'Il ne sera pas analysé (la vidéo n\'est pas touchée).', [{ label: 'Oui, retirer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
          if (!r) return; c.morceaux = c.morceaux.filter((x) => x.id !== b.dataset.id); await saveCourse(c); draw();
        },
        ok: () => scrCourse(c.id),
        redo: () => redoCut(c)
      });
      const v = $('#cutvid'); if (v) v.addEventListener('timeupdate', () => { const e = $('#vt'); if (e) e.textContent = fmt(v.currentTime); });
      app.querySelectorAll('select[data-mus]').forEach((sel) => sel.addEventListener('change', async () => {
        const m = c.morceaux.find((x) => x.id === sel.dataset.mus); if (!m) return;
        const id = sel.value || null;
        // la musique était liée ailleurs (ou « pas retrouvée ») : on la retire de là
        c.morceaux = c.morceaux.filter((x) => !(x.lost && x.musicId === id));
        if (id) for (const x of c.morceaux) if (x !== m && !x.lost && x.musicId === id && x.alignMode !== 'sure') { x.musicId = null; x.sync = null; x.alignMode = null; }
        const prevId = m.musicId;
        m.musicId = id; m.alignMode = id ? 'manual' : null; m.offset = null; m.shift = 0;
        if (m.autoName || (prevId && musics[prevId] && m.name === musics[prevId].name)) { m.name = id ? musics[id].name : 'Morceau'; m.autoName = true; }
        const feat = await dget('data', 'af:' + c.id);
        m.sync = id ? tempoSync(feat, m, musics[id]) : null;
        if (prevId && prevId !== id && !c.morceaux.some((x) => x.musicId === prevId)) { const lo = newMorceau(musics[prevId].name, 0, 0, prevId, null, 0, true); lo.why = 'absente'; c.morceaux.push(lo); }
        await saveCourse(c); const y = window.scrollY; draw(); window.scrollTo(0, y);
        toast(id ? 'Musique choisie ✅' : 'Plus de musique pour ce morceau.');
      }));
    };
    draw();
  }
  async function chooseVideoAgain(c) {
    const f = (await pickFile('video/*'))[0]; if (!f) return false;
    if (f.size !== c.video.size) {
      const r = await ask('Ce n\'est pas la même vidéo ?', 'La vidéo choisie n\'a pas la même taille que celle du cours « ' + esc(c.name) + ' ».', [{ label: 'Utiliser quand même', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
      if (!r) return false;
    }
    setVideo(f); return true;
  }

  /* ======================= Page d'un cours ======================= */
  async function scrCourse(cid) {
    S.wantAwake = false; keepAwake(false);
    const c = await dget('courses', cid); if (!c) return scrHome();
    const musics = {}; for (const m of await dall('musics')) musics[m.id] = m;
    const ms = c.morceaux.filter((m) => !m.lost);
    const st = (m) => m.status === 'done' ? '<span class="badge ok">✓ analysé</span>' : m.status === 'partial' ? '<span class="badge wait">⏸️ commencé ' + Math.round(100 * ((m.progressT || m.start) - m.start) / Math.max(1, m.end - m.start)) + ' %</span>' : '<span class="badge">pas encore analysé</span>';
    const left = ms.filter((m) => m.status !== 'done');
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + esc(c.name) + '</h1></div>' +
      '<p class="mute">' + styleName(c.style) + (STYLE_INFO[c.style] && STYLE_INFO[c.style].test ? ' (en test)' : '') + ' · ' + fmt(c.video.duration) + ' · ' + esc(c.video.name) + '</p>' +
      (oldCut(c) ? '<div class="card r"><h3>⚠️ Découpage à refaire</h3><p class="soft small">Ce cours a été découpé avec l\'ancienne méthode : des musiques ont pu être placées n\'importe où. La nouvelle méthode ne place une musique que si elle est sûre, et sinon découpe par les blancs entre les morceaux. Ta vidéo, tes musiques et le nom sont gardés.</p><button class="btn" data-act="redo">🔁 Refaire le découpage</button></div>' : '') +
      (left.length ? '<button class="btn" data-act="all">🔍 Analyser ' + (left.length === ms.length ? 'tout le cours' : 'les ' + left.length + ' morceaux restants') + '</button>' : '') +
      '<div class="row"><button class="btn sec" data-act="script">📝 Script du cours</button><button class="btn sec" data-act="pdf">🖨️ PDF</button></div>' +
      ms.map((m, i) => '<div class="card mrc ' + (m.status === 'done' ? 'g' : 'o') + '"><div class="head"><h2>' + (i + 1) + '. ' + esc(m.name) + '</h2>' + st(m) + '</div>' +
        '<p class="mute">' + fmt(m.start) + ' → ' + fmt(m.end) + (m.musicId && musics[m.musicId] ? ' · 🎵 ' + esc(musics[m.musicId].name) + (m.alignMode === 'sure' ? ' ✅' : m.alignMode === 'proposed' ? ' ❓' : '') : ' · pas de musique liée') + (m.status === 'done' ? ' · ' + (modeOf(m) === 'group' ? '👥 groupe' : '🙋 1 personne') : '') + '</p>' +
        '<div class="row tight">' +
        (m.status === 'done' ? '<button class="btn small" data-act="play" data-id="' + m.id + '">🎮 Jouer</button><button class="btn sec small" data-act="see" data-id="' + m.id + '">📝 Script</button>' : '<button class="btn small" data-act="one" data-id="' + m.id + '">🔍 ' + (m.status === 'partial' ? 'Reprendre' : 'Analyser') + '</button>') +
        '<button class="btn sec small" data-act="link" data-id="' + m.id + '">🎵 ' + (m.musicId ? 'Musique' : 'Lier une musique') + '</button></div></div>').join('') +
      '<div class="row"><button class="btn sec" data-act="cut">✂️ Modifier le découpage</button><button class="btn sec" data-act="ren">✏️ Renommer le cours</button></div>' +
      '<button class="btn ghost small" data-act="del">🗑️ Supprimer ce cours</button>',
    {
      back: () => scrHome(),
      all: () => startAnalysis(c, left.map((m) => m.id)),
      one: (b) => startAnalysis(c, [b.dataset.id]),
      play: (b) => scrPlay(c.id, b.dataset.id),
      see: (b) => scrScript(c.id, b.dataset.id),
      script: () => scrCourseScript(c.id),
      pdf: () => printCourse(c),
      link: (b) => linkMusic(c, b.dataset.id),
      cut: () => scrCut(c.id),
      redo: () => redoCut(c),
      ren: async () => { const n = await askText('Nom du cours', c.name); if (n) { c.name = n; await saveCourse(c); scrCourse(c.id); } },
      del: async () => {
        const r = await ask('Supprimer ce cours ?', 'Le script de ce cours sera effacé (ce que l\'appli a appris est gardé).', [{ label: '🗑️ Oui, supprimer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return;
        for (const m of c.morceaux) { await ddel('data', 'po:' + m.id); await ddel('data', 'th:' + m.id); }
        await ddel('data', 'af:' + c.id); await ddel('courses', c.id); scrHome();
      }
    });
  }

  /** Lier une musique à un morceau (et la caler sur la vidéo si elle y est vraiment) */
  async function linkMusic(c, mid) {
    const m = c.morceaux.find((x) => x.id === mid);
    const all = await dall('musics');
    const cur = m.musicId && all.find((x) => x.id === m.musicId);
    const choice = await ask('Musique du morceau', (cur ? 'Liée : <b>' + esc(cur.name) + '</b>' : 'Pas de musique liée.') + '<br>Choisis le fichier propre de cette musique.', [{ label: '🎵 Choisir un fichier', value: 'file' }].concat(cur ? [{ label: 'Enlever la musique', value: 'rm', cls: 'sec' }] : [], [{ label: 'Annuler', value: null, cls: 'sec' }]));
    if (!choice) return;
    if (choice === 'rm') { m.musicId = null; m.offset = null; m.sync = null; m.alignMode = null; await saveCourse(c); return scrCourse(c.id); }
    const f = (await pickFile('audio/*'))[0]; if (!f) return;
    const mu = { id: uid(), name: f.name.replace(/\.[^.]+$/, ''), type: f.type, blob: f };
    render('<div class="card o"><h2>Je cale la musique…</h2><p class="soft">Quelques secondes.</p></div>');
    let r;
    try { r = await musicFeatures(mu); } catch (e) { toast('Je n\'arrive pas à lire ce fichier audio.'); return scrCourse(c.id); }
    mu.duration = r.duration; mu.bpm = r.bpm; mu.attack = r.attack; mu.len = r.trim.end - r.trim.start; await dput('musics', mu);
    c.musicIds = courseMusicIds(c).concat([mu.id]);
    m.musicId = mu.id; m.offset = null; m.shift = 0;
    const af = await dget('data', 'af:' + c.id);
    let res = null;
    if (af) {
      const vp = C.prepareVideo2(af, r.feat.n + 10);
      res = C.findMusic(vp, r.feat, { minT: m.start - 90, maxT: m.start + 60 });
    }
    if (res && res.ok) {
      m.alignMode = 'sure'; m.offset = res.offset; m.alignConf = res.conf;
      m.sync = { mode: 'sure', v0: res.offset, a0: 0, ratio: res.ratio, vTop: res.offset + (mu.attack || 0) * res.ratio, musicId: mu.id };
      toast('Musique retrouvée dans la vidéo et calée ✅', 3500);
    } else {
      m.alignMode = 'manual'; m.sync = tempoSync(af, m, mu);
      toast('Elle n\'est pas exactement dans la vidéo : j\'ai calé son rythme sur le morceau. Ajuste avec « un peu avant / après ».', 5000);
    }
    await saveCourse(c); scrCourse(c.id);
  }

  /* ======================= Détecteur de mouvements ======================= */
  const fpsFor = () => (S.settings.quality === 'rapide' ? 6 : 8);
  let engine = null;
  async function getEngine(msg) {
    if (window.SM_TEST && window.SM_TEST.engine) return window.SM_TEST.engine;
    if (engine && engine.np === S.settings.numPoses) return engine;
    msg && msg('Chargement du détecteur de mouvements… (la 1re fois : environ 10 Mo, ensuite il est gardé dans le téléphone)');
    const mod = await import(MP_BASE + '/vision_bundle.mjs');
    const files = await mod.FilesetResolver.forVisionTasks(MP_BASE + '/wasm');
    const buf = new Uint8Array(await (await fetch(MODELS.full)).arrayBuffer());
    const np = S.settings.numPoses;
    let delegate = 'GPU';
    const make = async (mode) => {
      const o = (d) => ({ baseOptions: { modelAssetBuffer: buf, delegate: d }, runningMode: mode, numPoses: np, minPoseDetectionConfidence: 0.3, minPosePresenceConfidence: 0.3, minTrackingConfidence: 0.3 });
      try { return await mod.PoseLandmarker.createFromOptions(files, o(delegate)); } catch (e) { delegate = 'CPU'; return mod.PoseLandmarker.createFromOptions(files, o('CPU')); }
    };
    const img = await make('IMAGE');
    const vids = {}, ts = {};
    const out = (r) => ({ landmarks: r.landmarks || [], world: r.worldLandmarks || [] });
    engine = {
      np,
      /** image seule (pas de suivi d'une image à l'autre) */
      image(src) { return out(img.detect(src)); },
      /** vidéo : un détecteur par zone, qui suit les personnes d'une image à l'autre */
      async video(src, key) {
        if (!vids[key]) { try { vids[key] = await make('VIDEO'); } catch (e) { vids[key] = 'img'; } }
        if (vids[key] === 'img') return out(img.detect(src));
        ts[key] = Math.max((ts[key] || 0) + 1, Math.floor(performance.now()));
        return out(vids[key].detectForVideo(src, ts[key]));
      },
      reset() { for (const k in vids) { try { if (vids[k] !== 'img') vids[k].close(); } catch (e) { /* rien */ } delete vids[k]; delete ts[k]; } }
    };
    return engine;
  }
  /* ---- zones de l'image (les petites personnes sont mieux vues dans une zone agrandie) ---- */
  const FULL = { key: 'full', x: 0, y: 0, w: 1, h: 1 };
  function tiles(n, band) {
    band = band || { y: 0, h: 1 };
    const w = n === 2 ? 0.56 : 0.42, st = n === 2 ? 0.44 : 0.29;
    return Array.from({ length: n }, (_, i) => ({ key: 't' + n + i, x: Math.min(1 - w, i * st), y: band.y, w, h: band.h }));
  }
  /** Zone autour d'un cadre (ou d'un point) : la personne y apparaît en grand */
  function focusRect(cx, cy, h, aspect, key) {
    h = Math.max(0.22, Math.min(1, h)); const w = Math.min(1, h * 0.85 / aspect);
    return { key: key || 'focus', x: Math.max(0, Math.min(1 - w, cx - w / 2)), y: Math.max(0, Math.min(1 - h, cy - h / 2)), w, h };
  }
  /** Zones à regarder pour chaque image */
  function viewsFor(mode, scene, target, aspect, lost) {
    const q = S.settings.quality, big = scene && scene.big, band = scene && scene.band;
    if (mode === 'group') { if (big) return [FULL]; return q === 'rapide' ? tiles(2, band) : [FULL].concat(tiles(3, band)); }
    const v = [];
    if (target) v.push(focusRect(target.cx, target.cy, target.h * 2.2, aspect));
    if (q !== 'rapide' || !target || lost) v.push(FULL);
    if ((lost || !target) && !big) v.push(...tiles(q === 'rapide' ? 2 : 3, band));
    return v;
  }
  const cropCv = {};
  /** Découpe une zone de la vidéo dans un petit canevas (côté max 640 px) */
  function crop(v, r) {
    const vw = v.videoWidth || 640, vh = v.videoHeight || 360;
    const sw = r.w * vw, sh = r.h * vh, sc = Math.min(1.6, 640 / Math.max(sw, sh));
    const c = cropCv[r.key] || (cropCv[r.key] = document.createElement('canvas'));
    const cw = Math.max(16, Math.round(sw * sc)), ch = Math.max(16, Math.round(sh * sc));
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    c.getContext('2d').drawImage(v, r.x * vw, r.y * vh, sw, sh, 0, 0, cw, ch);
    return c;
  }
  /** Cherche les personnes dans toutes les zones et les réunit. how = 'image' ou 'video' */
  async function detectViews(eng, v, views, t, how) {
    const dets = [];
    for (const r of views) {
      const cv = crop(v, r);
      const res = how === 'video' ? await eng.video(cv, r.key, { rect: r, t }) : eng.image(cv, { rect: r, t });
      res.landmarks.forEach((lm, i) => dets.push({ lm: C.mapFromRect(lm, r), world: res.world && res.world[i], rect: r }));
    }
    return C.mergeDetections(dets);
  }
  /** Où sont les gens dans l'image (bande de la scène) et sont-ils grands ? */
  function sceneOf(boxes) {
    if (!boxes.length) return null;
    const hs = boxes.map((b) => b.h).sort((a, b) => a - b), mh = hs[Math.floor(hs.length / 2)];
    const y0 = Math.min(...boxes.map((b) => b.y)), y1 = Math.max(...boxes.map((b) => b.y + b.h)), mg = 0.35 * mh;
    let band = { y: Math.max(0, y0 - mg), h: 0 }; band.h = Math.min(1, y1 + mg) - band.y;
    if (band.h > 0.85) band = { y: 0, h: 1 };
    return { band, big: mh > 0.5, mh };
  }

  function getVid() {
    if (S.vid && S.vid.dataset.src === S.videoURL) return S.vid;
    const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    v.src = S.videoURL; v.dataset.src = S.videoURL; S.vid = v; return v;
  }
  function seek(v, t) {
    return new Promise((res) => {
      const done = () => { v.removeEventListener('seeked', done); res(); };
      if (v.readyState < 1) { v.addEventListener('loadedmetadata', () => { v.addEventListener('seeked', done); v.currentTime = t; }, { once: true }); return; }
      if (Math.abs(v.currentTime - t) < 0.001 && v.readyState >= 2) return res();
      v.addEventListener('seeked', done); v.currentTime = t;
    });
  }
  const EDGES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
  function drawSkel(g, lm, w, h, col, lw) {
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    for (const [a, b] of EDGES) { const p = lm[a], q = lm[b]; if (!p || !q) continue; g.beginPath(); g.moveTo(p.x * w, p.y * h); g.lineTo(q.x * w, q.y * h); g.stroke(); }
  }
  function drawBoxes(g, boxes, w, h, sel) {
    boxes.forEach((b, i) => {
      const on = i === sel;
      g.strokeStyle = on ? '#ff8a3d' : '#ffffff'; g.lineWidth = Math.max(3, w / 160);
      g.strokeRect(b.x * w, b.y * h, b.w * w, b.h * h);
      const r = Math.max(16, w / 30);
      g.fillStyle = on ? '#ff8a3d' : '#151a33'; g.beginPath(); g.arc(b.x * w + r, b.y * h + r, r, 0, 7); g.fill();
      g.fillStyle = on ? '#151a33' : '#fff'; g.font = 'bold ' + Math.round(r * 1.2) + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(String(i + 1), b.x * w + r, b.y * h + r + 1);
    });
  }

  /* ======================= Analyse ======================= */
  async function startAnalysis(c, ids) {
    if (!S.videoFile || S.videoFile.size !== c.video.size) {
      const r = await ask('Choisis la vidéo', 'Pour analyser, choisis à nouveau la vidéo du cours <b>' + esc(c.video.name) + '</b> (elle reste dans ton téléphone).', [{ label: '🎬 Choisir la vidéo', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
      if (!r || !(await chooseVideoAgain(c))) return;
    }
    render('<div class="top"><h1>Préparation…</h1></div><div class="card o"><p id="em" class="soft">Un instant…</p></div>');
    let eng;
    try { eng = await getEngine((t) => { const e = $('#em'); if (e) e.textContent = t; }); } catch (e) {
      console.error(e);
      render('<div class="top"><button class="back" data-act="back">‹</button><h1>Oups</h1></div><div class="card r"><h2>Le détecteur n\'a pas pu se charger</h2><p class="soft">Il faut Internet <b>la première fois</b> seulement (pour télécharger le détecteur, environ 10 Mo). Vérifie ta connexion puis réessaie. Tes vidéos, elles, ne sont jamais envoyées.</p></div><button class="btn" data-act="again">🔁 Réessayer</button>',
        { back: () => scrCourse(c.id), again: () => startAnalysis(c, ids) });
      return;
    }
    const queue = ids.slice(); let same = null;
    const runNext = async () => {
      const cc = await dget('courses', c.id);
      const id = queue.shift(); if (!id) return scrCourse(c.id);
      const m = cc.morceaux.find((x) => x.id === id); if (!m) return runNext();
      if (m.track && !m.track.mode && m.track.box) m.track.mode = 'one'; // ancien cours
      if (!m.track || !m.track.mode) {
        let res = same;
        if (!res) {
          const prev = cc.morceaux.find((x) => x.track && x.track.mode === 'one' && x.track.box);
          const rest = queue.map((q) => cc.morceaux.find((x) => x.id === q)).filter(Boolean);
          res = await scrWho(cc, m, eng, prev ? prev.track.box : null, rest);
          if (!res) return scrCourse(c.id);
          if (res.same) same = res;
        }
        m.track = res.mode === 'group' ? { mode: 'group' } : { mode: 'one', box: res.box, lastT: null, chosen: true };
        if (res.scene) cc.scene = res.scene;
        await saveCourse(cc);
      }
      const ok = await scrAnalyze(cc, m, eng, queue.length);
      if (ok === 'done') { await finishMorceau(cc.id, m.id); if (queue.length) return runNext(); return scrScript(cc.id, m.id); }
      return scrCourse(c.id);
    };
    runNext();
  }

  /** « Qui suivre ? » : tout le groupe (conseillé) ou une seule personne. Renvoie {mode, box, same, scene} */
  function scrWho(c, m, eng, prevBox, rest) {
    return new Promise(async (resolve) => {
      const v = getVid();
      let t = Math.min(m.end - 1, (m.progressT || m.start) + 4);
      let boxes = [], poses = [], sel = -1, mode = 'group', scene = c.scene || null, msView = null, busy = false;
      const more = rest.length > 0;
      const draw = () => {
        render('<div class="top"><button class="back" data-act="back">‹</button><h1>Qui suivre ?</h1></div>' +
          '<p class="mute">' + esc(m.name) + ' · ' + fmt(t) + '</p>' +
          '<canvas class="pickcv" id="pcv" width="640" height="360"></canvas><p class="mute" id="pinfo" style="margin-top:8px">Recherche des personnes…</p>' +
          '<div class="row tight"><button class="btn sec small" data-act="prev">◀️ 10 s avant</button><button class="btn sec small" data-act="next">10 s après ▶️</button></div>' +
          '<div class="chips"><button class="chip ' + (mode === 'group' ? 'on' : '') + '" data-act="mg">👥 Tout le groupe<small style="color:var(--ok)">conseillé</small></button><button class="chip ' + (mode === 'one' ? 'on' : '') + '" data-act="mo">🙋 Une seule personne</button></div>' +
          '<p class="soft small" id="phelp">' + (mode === 'group' ? 'Je regarde <b>toutes les personnes</b> et je garde ce que fait la majorité (une personne en retard ou qui fait une variante est écartée). Idéal quand le prof qui mène change d\'un morceau à l\'autre.' : '<b>Touche la personne à suivre</b> sur l\'image, même si elle n\'a pas de cadre : je zoome pour la trouver.') + '</p>' +
          (more ? '<label style="display:flex;gap:10px;align-items:center;margin:4px 0 12px"><input type="checkbox" id="psame" style="width:26px;height:26px" ' + (mode === 'group' ? 'checked' : '') + '> <span class="small">Même choix pour les ' + rest.length + ' morceau(x) suivant(s)</span></label>' : '') +
          '<p class="mute" id="pest"></p>' +
          '<button class="btn" data-act="ok" id="pok">✅ Lancer l\'analyse</button>',
        {
          back: () => resolve(null),
          prev: () => { t = Math.max(m.start, t - 10); show(); },
          next: () => { t = Math.min(m.end - 0.5, t + 10); show(); },
          mg: () => { mode = 'group'; draw(); paintOnly(); },
          mo: () => { mode = 'one'; if (sel < 0 && boxes.length) { const st = prevBox ? { box: prevBox, lastT: 0 } : null; sel = st ? C.trackStep(st, boxes, 1, aspect()) : 0; } draw(); paintOnly(); },
          ok: () => {
            if (mode === 'one' && sel < 0) { toast('Touche d\'abord la personne à suivre sur l\'image.'); return; }
            const sm = $('#psame'); const sameAll = !!(sm && sm.checked);
            resolve({ mode, box: mode === 'one' ? boxes[sel] : null, same: sameAll && mode === 'group' ? { mode: 'group', scene } : (sameAll ? { mode: 'one', box: boxes[sel], scene } : null), scene });
          }
        });
        const cv = $('#pcv');
        cv.addEventListener('click', onTap);
        estimate();
      };
      const aspect = () => (v.videoWidth || 16) / (v.videoHeight || 9);
      const paintOnly = () => {
        const cv = $('#pcv'); if (!cv || !v.videoWidth) return; const g = cv.getContext('2d');
        const vw = v.videoWidth, vh = v.videoHeight, sc = Math.min(1, 640 / vw);
        if (cv.width !== Math.round(vw * sc)) { cv.width = Math.round(vw * sc); cv.height = Math.round(vh * sc); }
        g.drawImage(v, 0, 0, cv.width, cv.height);
        const hl = mode === 'group' ? -2 : sel;
        poses.forEach((p, i) => drawSkel(g, p, cv.width, cv.height, hl === -2 || i === sel ? '#ff8a3d' : 'rgba(255,255,255,.55)', i === sel || hl === -2 ? 4 : 3));
        drawBoxes(g, boxes, cv.width, cv.height, hl);
        const inf = $('#pinfo');
        if (inf) inf.textContent = boxes.length ? boxes.length + ' personne(s) trouvée(s) à ' + fmt(t) + '.' + (mode === 'one' ? (sel >= 0 ? ' Le cadre orange est suivi.' : '') : '') : 'Personne trouvé ici : essaie « 10 s après ».';
      };
      const estimate = () => {
        const e = $('#pest'); if (!e) return;
        const ms = msView || S.settings.msView; if (!ms) { e.textContent = ''; return; }
        const dur = [m].concat(rest).reduce((a, x) => a + (x.end - x.start), 0);
        const views = viewsFor(mode, scene, mode === 'one' ? { cx: 0.5, cy: 0.5, h: 0.3 } : null, aspect(), false).length;
        const per = ms * views;
        const sec = Math.max(dur / 4, dur * fpsFor() * per / 1000) * 1.15;
        e.innerHTML = '⏱️ Temps estimé : <b>environ ' + fmtDur(sec) + '</b>' + (more ? ' pour ' + (rest.length + 1) + ' morceaux' : '') + ' (réglage « ' + (S.settings.quality === 'rapide' ? 'Plus rapide' : 'Plus précis') + ' », à changer dans ⚙️ Réglages).';
      };
      async function show() {
        if (busy) return; busy = true;
        const inf = $('#pinfo'); if (inf) inf.textContent = 'Recherche des personnes… (' + fmt(t) + ')';
        await seek(v, t);
        // 1re recherche : image entière + zones, pour trouver aussi les petites personnes
        const vs = [FULL].concat(tiles(3, scene && !scene.big ? scene.band : null));
        const a = performance.now();
        const found = await detectViews(eng, v, vs, t, 'image');
        msView = (performance.now() - a) / vs.length; S.settings.msView = msView; saveKV('settings');
        poses = found.map((d) => d.lm); boxes = found.map((d) => d.box);
        scene = sceneOf(boxes) || scene;
        sel = -1;
        if (boxes.length && mode === 'one') {
          if (prevBox) { const st = { box: prevBox, lastT: 0 }; sel = C.trackStep(st, boxes, 1, aspect()); }
          if (sel < 0) { let bi = 0; boxes.forEach((b, i) => { if (b.h > boxes[bi].h) bi = i; }); sel = bi; }
        }
        busy = false; paintOnly(); estimate();
      }
      /** toucher n'importe où : on prend la personne sous le doigt, sinon on zoome autour du doigt */
      async function onTap(e) {
        const cv = $('#pcv'); const r = cv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        if (mode !== 'one') { mode = 'one'; draw(); }
        const inside = boxes.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
        if (inside >= 0) { sel = inside; paintOnly(); return; }
        const inf = $('#pinfo'); if (inf) inf.textContent = 'Je zoome pour trouver la personne…';
        const mh = scene && scene.mh ? scene.mh : 0.3;
        let got = null;
        for (const h of [Math.max(0.3, mh * 2.4), 0.6, 0.95]) {
          const rect = focusRect(x, y, h, aspect(), 'zoom');
          const found = await detectViews(eng, v, [rect], t, 'image');
          let bd = 1e9; for (const d of found) { const b = d.box; const dd = Math.hypot((b.cx - x) * aspect(), b.cy - y) / Math.max(0.05, b.h); if (dd < bd && dd < 0.9) { bd = dd; got = d; } }
          if (got) break;
        }
        if (!got) { paintOnly(); toast('Je ne trouve personne à cet endroit. Touche le milieu du corps, ou essaie « 10 s après ».', 3500); return; }
        const dup = boxes.findIndex((b) => C.boxIoU(b, got.box) > 0.3);
        if (dup >= 0) sel = dup; else { boxes.push(got.box); poses.push(got.lm); sel = boxes.length - 1; }
        paintOnly(); toast('Personne trouvée ✅');
      }
      draw();
      if (v.readyState < 1) await new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }));
      show();
    });
  }

  /** Analyse d'un morceau : on enregistre toutes les personnes (et la personne choisie en mode « une seule »).
      Renvoie 'done' ou 'stop' */
  function scrAnalyze(c, m, eng, remainingMorceaux) {
    return new Promise(async (resolve) => {
      const v = getVid();
      const mode = m.track.mode || 'one';
      const stored = m.status === 'partial' ? ((await dget('data', 'po:' + m.id)) || null) : null;
      const fps = stored && stored.fps ? stored.fps : fpsFor();
      const times = stored ? Array.from(stored.times) : [];
      const feats = stored ? Array.from(stored.feats) : [];
      const per = new Map(); // numéro de personne → caractéristiques (NaN si absente)
      if (stored && stored.tracks) for (const tr of stored.tracks) per.set(tr.id, Array.from(tr.feats));
      const thumbs = m.status === 'partial' ? ((await dget('data', 'th:' + m.id)) || []) : [];
      let t0 = m.status === 'partial' && m.progressT ? m.progressT : m.start;
      const track = { box: m.track.box, lastT: m.track.lastT };
      let stopped = false, finished = false, waitingPick = false;
      S.wantAwake = true; keepAwake(true);
      if (eng.reset) eng.reset();
      render('<div class="top"><h1>Analyse</h1></div><p class="soft"><b>' + esc(m.name) + '</b> · ' + (mode === 'group' ? '👥 tout le groupe' : '🙋 une seule personne') + '</p>' +
        '<div class="vidbox" id="vb"></div>' +
        '<div class="bar"><i id="ab"></i></div><p style="margin:8px 0 2px"><b id="ap">0 %</b> · <span id="ar" class="soft">calcul du temps restant…</span></p>' +
        '<p class="mute" id="ainfo"></p>' +
        '<div class="card j small">🔌 Mets le téléphone <b>sur le chargeur</b> et laisse <b>l\'écran allumé</b> avec cette page ouverte. Tu peux arrêter et reprendre plus tard.</div>' +
        '<div id="lostbox"></div>' +
        '<button class="btn sec" data-act="stop">⏸️ Arrêter (je reprendrai plus tard)</button>',
      { stop: () => { stopped = true; } });
      const vb = $('#vb');
      v.style.width = '100%'; vb.appendChild(v);
      const ov = document.createElement('canvas'); ov.className = 'ov'; vb.appendChild(ov);
      const og = ov.getContext('2d');
      const work = document.createElement('canvas'); const wg = work.getContext('2d', { willReadFrequently: false });
      const thc = document.createElement('canvas'); const tg = thc.getContext('2d');
      await seek(v, t0);
      const vw = v.videoWidth || 640, vh = v.videoHeight || 360, sc = Math.min(1, 640 / Math.max(vw, vh));
      work.width = Math.round(vw * sc); work.height = Math.round(vh * sc);
      ov.width = work.width; ov.height = work.height;
      thc.width = 160; thc.height = Math.round(160 * vh / vw);
      const aspect = vw / vh;
      const multi = new C.MultiTracker(aspect, m.status === 'partial' && m.track.multi ? m.track.multi : null);
      let lastT = -1e9, lastThumb = thumbs.length ? thumbs[thumbs.length - 1].t : -1e9, lastSave = performance.now();
      let rate = S.settings.rate || 1.5, procMs = 40, nProc = 0, nSeen = 0, nViews = 1;
      const wall0 = performance.now(); let speedEMA = null, lastWall = performance.now(), lastVT = t0;
      let rateCheckWall = performance.now(), rateCheckVT = t0, rateCheckN = 0;
      const aEnd = Math.min(c.video.duration, m.end + 1.5); // petite marge : la dernière répétition finit souvent sur la fin de la musique
      const total = aEnd - m.start;
      const packTracks = (final) => {
        const out = []; const n = times.length;
        for (const [id, f] of per) {
          let v2 = 0; for (let i = 0; i < f.length; i += C.NF) if (isFinite(f[i])) v2++;
          if (final && v2 < Math.max(fps * 4, 0.08 * n)) continue; // apparitions trop courtes
          out.push({ id, n: v2, feats: Float32Array.from(f) });
        }
        out.sort((a, b) => b.n - a.n);
        return (final ? out.slice(0, 10) : out.slice(0, 24)).map((x) => ({ id: x.id, feats: x.feats }));
      };
      const savePartial = async (t, final) => {
        await dput('data', { fps, times: Float64Array.from(times), feats: Float32Array.from(feats), tracks: packTracks(final) }, 'po:' + m.id);
        await dput('data', thumbs, 'th:' + m.id);
        const cc = await dget('courses', c.id); const mm = cc.morceaux.find((x) => x.id === m.id);
        if (mm) { mm.status = 'partial'; mm.progressT = t; mm.track = Object.assign({}, m.track, { box: track.box || m.track.box, lastT: null, multi: multi.state() }); await saveCourse(cc); }
      };
      const ui = (t) => {
        const f = Math.max(0, Math.min(1, (t - m.start) / total));
        const ab = $('#ab'); if (!ab) return; ab.style.width = (f * 100).toFixed(1) + '%';
        $('#ap').textContent = Math.round(f * 100) + ' %';
        if (speedEMA) {
          const rest = (aEnd - t) / speedEMA;
          $('#ar').textContent = 'encore environ ' + fmtDur(rest) + (remainingMorceaux ? ' pour ce morceau (+ ' + remainingMorceaux + ' autre(s))' : '');
        }
        $('#ainfo').textContent = 'Vidéo à ' + fmt(t) + ' · vitesse ×' + rate.toFixed(1) + ' · ' + nProc + ' images · ' + (mode === 'group' ? nSeen + ' personne(s) vue(s)' : '');
      };
      const lostAsk = (t, found) => new Promise((res) => {
        waitingPick = true; v.pause();
        const boxes = found.map((d) => d.box);
        const lb = $('#lostbox'); if (!lb) return res(null);
        lb.innerHTML = '<div class="card r"><h3>Je ne trouve plus la personne 🤔</h3><p class="soft small">Touche-la sur l\'image ci-dessous (même sans cadre). Si elle n\'est pas là, touche « Continuer ».</p><canvas class="pickcv" id="lcv"></canvas><button class="btn sec small" id="lskip" style="margin-top:8px">Continuer sans elle</button></div>';
        const lc = $('#lcv'); lc.width = work.width; lc.height = work.height; const lg = lc.getContext('2d');
        lg.drawImage(work, 0, 0); drawBoxes(lg, boxes, lc.width, lc.height, -1);
        lb.scrollIntoView({ behavior: 'smooth' });
        const end = (b) => { lb.innerHTML = ''; waitingPick = false; res(b); };
        lc.addEventListener('click', async (e) => {
          const rr = lc.getBoundingClientRect(); const x = (e.clientX - rr.left) / rr.width, y = (e.clientY - rr.top) / rr.height;
          const inside = boxes.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
          if (inside) return end(inside);
          const z = await detectViews(eng, v, [focusRect(x, y, Math.max(0.3, (track.box ? track.box.h : 0.25) * 2.4), aspect, 'zoom')], t, 'image');
          let got = null, bd = 1e9; for (const d of z) { const dd = Math.hypot((d.box.cx - x) * aspect, d.box.cy - y) / Math.max(0.05, d.box.h); if (dd < bd && dd < 0.9) { bd = dd; got = d.box; } }
          if (got) end(got); else toast('Je ne trouve personne à cet endroit.');
        });
        $('#lskip').onclick = () => end(null);
      });
      const process = async (t) => {
        const a = performance.now();
        wg.drawImage(v, 0, 0, work.width, work.height);
        const lost = mode === 'one' && track.lostSince != null && t - track.lostSince > 2;
        const views = viewsFor(mode, c.scene, mode === 'one' ? track.box : null, aspect, lost); nViews = views.length;
        const found = await detectViews(eng, v, views, t, 'video');
        const boxes = found.map((d) => d.box);
        const ids = multi.step(boxes, t);
        let k = mode === 'one' ? C.trackStep(track, boxes, t, aspect) : -1;
        procMs = 0.8 * procMs + 0.2 * (performance.now() - a); nProc++;
        if (mode === 'one' && k < 0 && track.lostSince != null && t - track.lostSince > 12) {
          const all = await detectViews(eng, v, [FULL].concat(tiles(3, c.scene && c.scene.band)), t, 'image');
          if (all.length) {
            const b = await lostAsk(t, all);
            if (b) { track.box = b; track.lastT = t; track.lostSince = null; k = C.trackStep(track, boxes, t, aspect); }
            else { track.lostSince = t; }
            if (!stopped) { v.playbackRate = rate; await v.play().catch(() => {}); }
          }
        }
        const fi = times.length;
        times.push(Math.round(t * 1000) / 1000);
        if (k >= 0) feats.push(...C.poseFeatures(found[k].lm, found[k].world, aspect));
        else for (let i = 0; i < C.NF; i++) feats.push(NaN);
        // toutes les personnes
        const seenNow = new Set();
        ids.forEach((id, i) => {
          let f = per.get(id);
          if (!f) { f = new Array(fi * C.NF).fill(NaN); per.set(id, f); }
          if (f.length > fi * C.NF) return; // même numéro deux fois (ne devrait pas arriver)
          f.push(...C.poseFeatures(found[i].lm, found[i].world, aspect)); seenNow.add(id);
        });
        for (const [id, f] of per) if (!seenNow.has(id)) { while (f.length < (fi + 1) * C.NF) f.push(NaN); }
        nSeen = Math.max(nSeen, seenNow.size);
        // dessin
        og.clearRect(0, 0, ov.width, ov.height);
        found.forEach((d, i) => { if (mode === 'group') drawSkel(og, d.lm, ov.width, ov.height, '#ff8a3d', 3); else if (i !== k) drawSkel(og, d.lm, ov.width, ov.height, 'rgba(255,255,255,.35)', 2); });
        if (k >= 0) drawSkel(og, found[k].lm, ov.width, ov.height, '#ff8a3d', 5);
        if (t - lastThumb >= 2) {
          tg.drawImage(work, 0, 0, thc.width, thc.height);
          if (mode === 'group') found.forEach((d) => drawSkel(tg, d.lm, thc.width, thc.height, '#ff8a3d', 1.6));
          else if (k >= 0) drawSkel(tg, found[k].lm, thc.width, thc.height, '#ff8a3d', 2.5);
          thumbs.push({ t: Math.round(t * 10) / 10, u: thc.toDataURL('image/jpeg', 0.55) }); lastThumb = t;
        }
      };
      const updateRate = (t) => {
        const now = performance.now();
        const dw = (now - lastWall) / 1000, dv = t - lastVT;
        if (dw > 0.5 && dv > 0) { const sp = dv / dw; speedEMA = speedEMA == null ? sp : 0.85 * speedEMA + 0.15 * sp; lastWall = now; lastVT = t; }
        if (now - rateCheckWall > 2500) {
          const dvv = t - rateCheckVT; const got = dvv > 0 ? (nProc - rateCheckN) / dvv : fps;
          if (got < fps * 0.85 && rate > 0.15) rate = Math.max(0.1, rate * 0.8);
          else if (got >= fps * 0.95 && procMs * fps * rate < 550 && rate < 4) rate = Math.min(4, rate * 1.2);
          try { v.playbackRate = rate; } catch (e) { /* rien */ }
          rateCheckWall = now; rateCheckVT = t; rateCheckN = nProc;
        }
      };
      const finish = async (how) => {
        if (finished) return; finished = true;
        try { v.pause(); } catch (e) { /* rien */ }
        S.settings.rate = Math.max(0.25, Math.min(3, rate)); if (nProc > 20) S.settings.msView = procMs / Math.max(1, nViews); saveKV('settings');
        const t = times.length ? times[times.length - 1] : t0;
        await savePartial(how === 'done' ? m.end : t, how === 'done');
        S.wantAwake = false; keepAwake(false);
        resolve(how);
      };
      const onVis = () => { if (document.visibilityState === 'visible' && !finished && !stopped && !waitingPick) v.play().catch(() => {}); };
      document.addEventListener('visibilitychange', onVis);
      if ('requestVideoFrameCallback' in v && !S.forceSeek) {
        let busy = false;
        const cb = async (now, meta) => {
          if (finished) return;
          const t = meta.mediaTime;
          if (stopped) { document.removeEventListener('visibilitychange', onVis); return finish('stop'); }
          if (t >= aEnd - 0.02 || v.ended) { document.removeEventListener('visibilitychange', onVis); return finish('done'); }
          if (!busy && t - lastT >= 1 / fps - 0.012) {
            busy = true; lastT = t;
            try { await process(t); } catch (e) { console.error(e); }
            busy = false;
            updateRate(t); ui(t);
            if (performance.now() - lastSave > 20000) { lastSave = performance.now(); savePartial(t); }
          }
          v.requestVideoFrameCallback(cb);
        };
        v.onended = () => { if (!finished) { document.removeEventListener('visibilitychange', onVis); finish('done'); } };
        v.playbackRate = rate; v.requestVideoFrameCallback(cb);
        try { await v.play(); } catch (e) { console.warn(e); S.forceSeek = true; }
        if (!S.forceSeek) return;
      }
      // mode « image par image » (si la lecture accélérée n'est pas possible)
      for (let t = t0; t < aEnd && !stopped; t += 1 / fps) {
        await seek(v, t); await process(t); ui(t); speedEMA = (t - t0) / Math.max(0.1, (performance.now() - wall0) / 1000);
        if (performance.now() - lastSave > 20000) { lastSave = performance.now(); await savePartial(t); }
      }
      document.removeEventListener('visibilitychange', onVis);
      finish(stopped ? 'stop' : 'done');
    });
  }

  /** Séquence de mouvements d'un morceau : tout le groupe (fusion) ou la personne choisie */
  const modeOf = (m) => (m.track && m.track.mode) || (m.track && m.track.box ? 'one' : 'group');
  async function loadSeq(mid, mode) {
    const po = await dget('data', 'po:' + mid); if (!po || !po.times || !po.times.length) return null;
    if (mode === 'group' && po.tracks && po.tracks.length) {
      const g = C.fuseGroup({ fps: po.fps || 8, times: po.times, tracks: po.tracks });
      if (g) return g;
    }
    let any = false; if (po.feats) for (let i = 0; i < po.feats.length; i += C.NF) if (isFinite(po.feats[i])) { any = true; break; }
    if (!any) return null;
    return C.resample(po.times, po.feats, po.fps || 8);
  }
  async function finishMorceau(cid, mid) {
    const c = await dget('courses', cid); const m = c.morceaux.find((x) => x.id === mid);
    const seq = await loadSeq(mid, modeOf(m));
    if (seq) {
      m.segments = C.buildScript(seq, { style: c.style, fingerprints: S.prints, vocab: S.vocab[c.style] || {}, bpm: m.bpm || null });
      m.group = seq.group ? { persons: seq.group.persons, used: seq.group.used } : null;
    } else m.segments = [];
    m.status = 'done'; m.progressT = m.end;
    await saveCourse(c);
  }

  /* ======================= Script d'un morceau ======================= */
  async function scrScript(cid, mid) {
    S.wantAwake = false; keepAwake(false);
    const c = await dget('courses', cid); const m = c.morceaux.find((x) => x.id === mid); if (!m) return scrCourse(cid);
    const thumbs = (await dget('data', 'th:' + mid)) || [];
    const near = (t) => { let b = null, bd = 1e9; for (const x of thumbs) { const d = Math.abs(x.t - t); if (d < bd) { bd = d; b = x; } } return b; };
    const segs = m.segments || [];
    const nQ = segs.filter((s) => s.check).length;
    const line = (s, i) => {
      const th = s.check ? near((s.start + s.end) / 2) : null;
      return '<button class="seg ' + (s.check ? 'q ' : '') + (s.base === 'Pause' && !s.reps ? 'pause' : '') + '" data-act="edit" data-i="' + i + '"><span class="n">' + (i + 1) + '</span><span class="t"><b>' + esc(s.name) + (s.reps ? ' × ' + s.reps : '') + '</b><span class="mute">' + (s.tempo ? esc(s.tempo) + ' · ' : '') + fmt(s.start - m.start) + ' → ' + fmt(s.end - m.start) + '</span>' + (s.check ? '<br><span class="badge q">❓ à vérifier</span>' : '') + '</span>' + (th ? '<img src="' + th.u + '" alt="">' : '') + '</button>';
    };
    const md = modeOf(m);
    const po = await dget('data', 'po:' + mid);
    const hasTracks = !!(po && po.tracks && po.tracks.length >= 3); // assez de monde enregistré pour « tout le groupe »
    const who = md === 'group' ? '👥 Tout le groupe' + (m.group ? ' (' + m.group.persons + ' personne(s) suivie(s), ' + String(m.group.used).replace('.', ',') + ' utilisée(s) en moyenne)' : '') : '🙋 Une seule personne';
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + esc(m.name) + '</h1></div>' +
      '<button class="btn" data-act="play">🎮 Jouer ce morceau</button>' +
      '<p class="mute">' + who + '</p>' +
      (nQ ? '<div class="card j small">❓ <b>' + nQ + ' passage(s) à vérifier.</b> Touche une ligne pour voir l\'image et corriger. Chaque correction apprend à l\'appli.</div>' : '<p class="mute">Touche une ligne pour la corriger. Chaque correction apprend à l\'appli.</p>') +
      (segs.length ? segs.map(line).join('') : '<div class="card r">Aucun mouvement trouvé. Vérifie qui est suivi (bouton « Refaire l\'analyse »).</div>') +
      '<div class="row"><button class="btn sec" data-act="copy">📋 Copier le texte</button><button class="btn sec" data-act="pdf">🖨️ PDF</button></div>' +
      '<div class="row"><button class="btn sec small" data-act="redo">🔁 Refaire le script (avec ce que l\'appli a appris)</button>' +
      (md === 'one' && hasTracks ? '<button class="btn sec small" data-act="togroup">👥 Utiliser tout le groupe</button>' : '') +
      '<button class="btn sec small" data-act="reanalyse">🎯 Refaire l\'analyse (' + (md === 'group' ? 'une seule personne' : 'autre personne') + ')</button></div>',
    {
      back: () => scrCourse(cid),
      play: () => scrPlay(cid, mid),
      edit: (b) => editSeg(c, m, +b.dataset.i, thumbs),
      copy: () => copyText(scriptText(c, [m])),
      pdf: () => printCourse(c, [m]),
      redo: async () => {
        const r = await ask('Refaire le script ?', 'Le script sera recalculé avec tout ce que l\'appli a appris. <b>Tes corrections faites à la main sur ce morceau seront remplacées.</b>', [{ label: 'Oui, refaire', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return; const seq = await loadSeq(mid, modeOf(m)); if (!seq) { toast('Les données de l\'analyse ne sont plus là : refais l\'analyse.'); return; }
        await finishMorceau(cid, mid); scrScript(cid, mid);
      },
      togroup: async () => {
        const r = await ask('Tout le groupe ?', 'Le script de ce morceau sera recalculé avec <b>toutes les personnes</b> (déjà enregistrées, pas besoin de refaire l\'analyse). Tes corrections faites à la main sur ce morceau seront remplacées.', [{ label: '👥 Oui, tout le groupe', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return; m.track = Object.assign({}, m.track, { mode: 'group' }); await saveCourse(c); await finishMorceau(cid, mid); scrScript(cid, mid);
      },
      reanalyse: async () => {
        const r = await ask('Refaire l\'analyse ?', 'Tu choisiras à nouveau qui suivre (tout le groupe ou une seule personne). Le script de ce morceau sera remplacé.', [{ label: 'Oui', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return; m.status = 'todo'; m.track = null; m.progressT = null; m.segments = []; await ddel('data', 'po:' + mid); await ddel('data', 'th:' + mid); await saveCourse(c); startAnalysis(c, [mid]);
      }
    });
  }

  function evenTimes(start, end, n) { const o = []; for (let i = 0; i < n; i++) o.push(Math.round((start + (end - start) * i / Math.max(1, n)) * 100) / 100); return o; }
  async function addPrint(style, name, vec) {
    if (!vec || !vec.length) return;
    S.prints.push({ id: uid(), style, name, vec, date: Date.now() });
    if (S.prints.length > 2000) S.prints.splice(0, S.prints.length - 2000);
    await saveKV('prints');
  }

  /** Fenêtre de correction d'un passage */
  function editSeg(c, m, i, thumbs) {
    const s = m.segments[i]; if (!s) return;
    const st = { name: s.name, reps: s.reps, tempo: s.tempo || '' };
    const near = (t) => { let b = null, bd = 1e9; for (const x of thumbs) { const d = Math.abs(x.t - t); if (d < bd) { bd = d; b = x; } } return b; };
    const ims = [['début', s.start + 0.5], ['milieu', (s.start + s.end) / 2], ['fin', s.end - 0.5]].map(([l, t]) => { const x = near(t); return x ? '<figure><img src="' + x.u + '" alt=""><figcaption>' + l + ' ' + fmt(x.t - m.start) + '</figcaption></figure>' : ''; }).join('');
    let sh;
    const body = () => '<h2>Passage ' + (i + 1) + '</h2>' + (ims ? '<div class="thumbs">' + ims + '</div>' : '') +
      '<p class="mute">' + fmt(s.start - m.start) + ' → ' + fmt(s.end - m.start) + ' · confiance ' + Math.round((s.conf || 0) * 100) + ' %' + (s.source === 'appris' ? ' · reconnu grâce à tes corrections' : '') + '</p>' +
      '<label class="lab">Mouvement</label><button class="btn sec" data-sact="name">' + esc(st.name) + ' ✏️</button>' +
      '<label class="lab">Répétitions</label><div class="stepper"><button data-sact="m1">−</button><b id="rp">' + st.reps + '</b><button data-sact="p1">+</button></div>' +
      '<label class="lab">Tempo <span class="mute">(facultatif, ex. 2/2, 3/1, single)</span></label><input type="text" id="tp" value="' + esc(st.tempo) + '">' +
      '<div style="height:12px"></div><button class="btn" data-sact="save">✅ Enregistrer</button>' +
      '<div class="row tight"><button class="btn sec small" data-sact="split">✂️ Couper en deux</button>' + (i + 1 < m.segments.length ? '<button class="btn sec small" data-sact="fuse">🔗 Fusionner avec le suivant</button>' : '') + '</div>' +
      '<button class="btn ghost small" data-sact="del">🗑️ Supprimer ce passage</button>';
    const reopen = () => { sh.el.innerHTML = body(); };
    const persist = async (learn) => {
      if (learn) await addPrint(c.style, s.name, s.vec);
      await saveCourse(c);
    };
    sh = sheet(body(), {
      name: async () => { const n = await pickMoveName(c.style, st.name); if (n) { st.name = n.name; if (n.everywhere) await renameEverywhere(c.style, s.name, n.name, c); reopen(); } },
      m1: () => { st.reps = Math.max(0, st.reps - 1); $('#rp', sh.el).textContent = st.reps; },
      p1: () => { st.reps++; $('#rp', sh.el).textContent = st.reps; },
      save: async (b, e, close) => {
        st.tempo = $('#tp', sh.el).value.trim();
        const renamed = st.name !== s.name, recount = st.reps !== s.reps;
        s.name = st.name; s.tempo = st.tempo;
        if (recount) { s.reps = st.reps; s.repTimes = s.repTimes && s.repTimes.length === st.reps ? s.repTimes : evenTimes(s.start, s.end, st.reps); }
        s.check = false; s.conf = Math.max(s.conf || 0, 0.95); s.source = 'corrigé';
        await persist(true);
        close(); toast(renamed || recount ? 'Corrigé ✅ L\'appli s\'en souviendra.' : 'Validé ✅'); scrScript(c.id, m.id);
      },
      split: async (b, e, close) => {
        const n = s.repTimes && s.repTimes.length >= 2 ? s.repTimes.length : 0;
        let cut, k;
        if (n >= 2) { k = Math.floor(n / 2); cut = s.repTimes[k]; } else { cut = (s.start + s.end) / 2; k = 0; }
        const A = Object.assign({}, s, { id: uid(), end: cut, reps: n ? k : Math.floor(s.reps / 2), repTimes: (s.repTimes || []).slice(0, k), check: true });
        const B = Object.assign({}, s, { id: uid(), start: cut, reps: n ? n - k : s.reps - Math.floor(s.reps / 2), repTimes: (s.repTimes || []).slice(k), check: true });
        const seq = await loadSeq(m.id, modeOf(m));
        if (seq) {
          const o = { style: c.style, fingerprints: S.prints, vocab: S.vocab[c.style] || {}, bpm: m.bpm };
          const a2 = C.analyseRange(seq, A.start, A.end, o), b2 = C.analyseRange(seq, B.start, B.end, o);
          if (a2) { A.vec = a2.vec; } if (b2) { B.vec = b2.vec; B.name = b2.name; B.base = b2.base; }
        }
        m.segments.splice(i, 1, A, B); await saveCourse(c); close(); toast('Coupé en deux : corrige chaque partie.'); scrScript(c.id, m.id);
      },
      fuse: async (b, e, close) => {
        const B = m.segments[i + 1]; if (!B) return;
        s.end = B.end; s.reps = (s.reps || 0) + (B.reps || 0); s.repTimes = (s.repTimes || []).concat(B.repTimes || []);
        const seq = await loadSeq(m.id, modeOf(m));
        if (seq) { const r = C.analyseRange(seq, s.start, s.end, { style: c.style, fingerprints: [], vocab: {}, bpm: m.bpm }); if (r) s.vec = r.vec; }
        m.segments.splice(i + 1, 1); await saveCourse(c); close(); scrScript(c.id, m.id);
      },
      del: async (b, e, close) => { m.segments.splice(i, 1); await saveCourse(c); close(); scrScript(c.id, m.id); }
    });
  }

  /** Choix d'un nom de mouvement. Renvoie {name, everywhere} */
  function pickMoveName(style, current) {
    return new Promise((res) => {
      let q = '', done = false;
      const list = () => movesFor(style).filter((n) => !q || n.toLowerCase().includes(q.toLowerCase()));
      const grid = () => list().map((n) => '<button data-sact="pick" data-n="' + esc(n) + '" class="' + (n === current ? 'on' : '') + '">' + esc(n) + '</button>').join('') || '<p class="mute">Aucun mouvement ne correspond.</p>';
      const s = sheet('<h2>Quel mouvement ?</h2><input type="search" id="mq" placeholder="🔎 Chercher…"><div class="namegrid" id="mg">' + grid() + '</div>' +
        '<button class="btn sec" data-sact="new">➕ Nouveau mouvement</button>' +
        '<label style="display:flex;gap:10px;align-items:center;margin:8px 0 14px"><input type="checkbox" id="mev" style="width:26px;height:26px"> <span class="small">Renommer aussi <b>' + esc(current) + '</b> partout (tous mes scripts et pour la suite)</span></label>' +
        '<button class="btn ghost small" data-sact="no">Annuler</button>', {
        pick: (b, e, close) => { done = true; const ev = $('#mev', s.el).checked; close(); res({ name: b.dataset.n, everywhere: ev }); },
        new: async (b, e, close) => {
          const ev = $('#mev', s.el).checked; done = true; close();
          const n = await askText('Nom du nouveau mouvement', q, 'ex. Descente tirage');
          if (n) { S.customMoves = S.customMoves || {}; (S.customMoves[style] = S.customMoves[style] || []).push(n); }
          res(n ? { name: n, everywhere: ev } : null);
        },
        no: (b, e, close) => { done = true; close(); res(null); }
      }, () => { if (!done) res(null); });
      $('#mq', s.el).addEventListener('input', (e) => { q = e.target.value; $('#mg', s.el).innerHTML = grid(); });
    });
  }

  /** Renommer un mouvement partout (scripts, empreintes, vocabulaire) */
  async function renameEverywhere(style, oldName, newName, currentCourse) {
    S.vocab[style] = S.vocab[style] || {};
    const base = Object.keys(S.vocab[style]).find((k) => S.vocab[style][k] === oldName) || ((C.MOVES[style] || []).includes(oldName) ? oldName : null);
    if (base) S.vocab[style][base] = newName;
    else S.vocab[style][oldName] = newName;
    await saveKV('vocab');
    S.prints.forEach((p) => { if (p.style === style && p.name === oldName) p.name = newName; }); await saveKV('prints');
    const all = await dall('courses');
    for (const c of all) {
      if (c.style !== style) continue; let ch = false;
      for (const m of c.morceaux) for (const s of m.segments || []) if (s.name === oldName) { s.name = newName; ch = true; }
      if (ch) { await saveCourse(c); if (currentCourse && c.id === currentCourse.id) currentCourse.morceaux = c.morceaux; }
    }
    toast('« ' + oldName + ' » s\'appelle maintenant « ' + newName + ' » partout.', 3500);
  }

  /* ======================= Script du cours, texte, PDF ======================= */
  function scriptText(c, ms) {
    ms = ms || c.morceaux.filter((m) => !m.lost);
    const out = [c.name + ' (' + styleName(c.style) + ')', ''];
    ms.forEach((m) => {
      out.push((c.morceaux.filter((x) => !x.lost).indexOf(m) + 1) + '. ' + m.name);
      const segs = (m.segments || []).filter((s) => !(s.base === 'Pause' && !s.reps));
      if (!segs.length) out.push('   (pas encore analysé)');
      segs.forEach((s, i) => out.push('   ' + C.segLine(s, i)));
      out.push('');
    });
    return out.join('\n');
  }
  async function copyText(t) {
    try { await navigator.clipboard.writeText(t); toast('Texte copié ✅ Tu peux le coller où tu veux.'); return; } catch (e) { /* plan B */ }
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Texte copié ✅'); } catch (e) { toast('Copie impossible'); }
    ta.remove();
  }
  function printCourse(c, ms) {
    ms = ms || c.morceaux.filter((m) => !m.lost);
    const all = c.morceaux.filter((m) => !m.lost);
    $('#print').innerHTML = '<h1>' + esc(c.name) + '</h1><p class="sub">' + styleName(c.style) + ' · ' + new Date(c.created).toLocaleDateString('fr-FR') + ' · ScriptMove</p>' +
      ms.map((m) => {
        const segs = (m.segments || []).filter((s) => !(s.base === 'Pause' && !s.reps));
        return '<section><h2>' + (all.indexOf(m) + 1) + '. ' + esc(m.name) + '</h2>' + (segs.length ? '<ol>' + segs.map((s) => '<li>' + esc(s.name) + (s.reps ? ' × ' + s.reps : '') + (s.tempo ? ' <span class="t">(' + esc(s.tempo) + ')</span>' : '') + '</li>').join('') + '</ol>' : '<p class="t">(pas encore analysé)</p>') + '</section>';
      }).join('');
    const old = document.title; document.title = c.name.replace(/[\\/:*?"<>|]/g, '-');
    setTimeout(() => { window.print(); document.title = old; }, 50);
    toast('Dans la fenêtre d\'impression, choisis « Enregistrer en PDF ».', 4000);
  }
  async function scrCourseScript(cid) {
    const c = await dget('courses', cid);
    const ms = c.morceaux.filter((m) => !m.lost);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Script du cours</h1></div><p class="soft">' + esc(c.name) + '</p>' +
      ms.map((m, i) => {
        const segs = (m.segments || []).filter((s) => !(s.base === 'Pause' && !s.reps));
        return '<div class="card ' + (m.status === 'done' ? 'g' : '') + '"><h2>' + (i + 1) + '. ' + esc(m.name) + '</h2>' + (segs.length ? '<ol style="margin:0;padding-left:26px">' + segs.map((s) => '<li style="margin:2px 0"><b>' + esc(s.name) + '</b>' + (s.reps ? ' × ' + s.reps : '') + (s.tempo ? ' <span class="mute">(' + esc(s.tempo) + ')</span>' : '') + (s.check ? ' ❓' : '') + '</li>').join('') + '</ol>' : '<p class="mute">Pas encore analysé.</p>') +
          (m.status === 'done' ? '<button class="btn sec small" style="margin-top:10px" data-act="open" data-id="' + m.id + '">Voir / corriger</button>' : '') + '</div>';
      }).join('') +
      '<div class="row"><button class="btn sec" data-act="copy">📋 Copier le texte</button><button class="btn" data-act="pdf">🖨️ PDF</button></div>',
    { back: () => scrCourse(cid), copy: () => copyText(scriptText(c)), pdf: () => printCourse(c), open: (b) => scrScript(cid, b.dataset.id) });
  }

  /* ======================= Jeu de danse ======================= */
  async function scrPlay(cid, mid) {
    const c = await dget('courses', cid); const ms = c.morceaux.filter((x) => !x.lost && x.status === 'done');
    const m = c.morceaux.find((x) => x.id === mid); if (!m) return scrCourse(cid);
    const mu = m.musicId ? await dget('musics', m.musicId) : null;
    const segs = (m.segments || []).filter((s) => !(s.base === 'Pause' && !s.reps));
    if (!segs.length) { toast('Pas de script pour ce morceau.'); return scrCourse(cid); }
    const nextM = ms[ms.indexOf(m) + 1];
    const choice = await ask(m.name, mu ? '🎵 ' + esc(mu.name) : 'Pas de musique liée à ce morceau.', (mu ? [{ label: '▶️ Jouer avec ma musique', value: 'music' }] : [{ label: '🎵 Lier une musique', value: 'link' }])
      .concat([{ label: '🎬 Top départ (la musique joue ailleurs)', value: 'top', cls: 'sec' }, { label: 'Retour', value: null, cls: 'ghost' }]));
    if (!choice) return scrScript(cid, mid);
    if (choice === 'link') return linkMusic(c, m.id);
    // lien temps de la musique → temps de la vidéo (avec adaptation au tempo si la musique n'est pas la même version)
    let sy = mu ? syncOf(m) : null;
    if (mu && !sy) { const af = await dget('data', 'af:' + cid); sy = tempoSync(af, m, mu); m.sync = sy; await saveCourse(c); }
    const toV = (mt) => (P.mode === 'music' && sy ? C.musicToVideo(sy, mt) : (sy ? sy.vTop : m.start) + mt * (sy ? sy.ratio || 1 : 1));
    const fromV = (vt) => (P.mode === 'music' && sy ? C.videoToMusic(sy, vt) : (vt - (sy ? sy.vTop : m.start)) / (sy ? sy.ratio || 1 : 1));
    const adapted = sy && sy.mode === 'tempo' && sy.ratio !== 1 && sy.vBpm && sy.mBpm;
    const P = { mode: choice, started: false, paused: true, ref: 0, pausedAt: 0, audio: null, raf: 0 };
    const base = toV(0);
    if (choice === 'music') { P.url = URL.createObjectURL(mu.blob); P.audio = new Audio(P.url); P.audio.preload = 'auto'; }
    S.wantAwake = true; keepAwake(true);
    const el = document.createElement('div'); el.className = 'play';
    el.innerHTML = '<div class="ph"><h3>' + esc(m.name) + '</h3><button data-p="close" aria-label="Fermer">✖</button></div>' +
      '<div class="main"><div class="nx" id="pbefore"></div><div class="mv" id="pmv"></div><div class="cnt" id="pcnt"></div><div class="tempo" id="ptp"></div></div>' +
      '<div class="nx" id="pnx" style="text-align:center"></div><div class="bar"><i id="pbar"></i></div>' +
      '<div class="ctl"><button data-p="prev" aria-label="Mouvement précédent">⏮️</button><button class="main" data-p="pp" id="ppp">▶️</button><button data-p="next" aria-label="Mouvement suivant">⏭️</button></div>' +
      '<div class="adj"><button data-p="early">⏪ un peu avant</button><span id="pshift"></span><button data-p="late">un peu après ⏩</button></div>' +
      (adapted ? '<p class="mute" id="psync" style="text-align:center;margin:8px 0 0">🎵 Rythme adapté à ta musique (' + sy.vBpm + ' → ' + sy.mBpm + ' BPM)</p>' : '') +
      (nextM ? '<button class="btn sec small" style="margin:10px 0 0" data-p="nextm">Morceau suivant ➡️</button>' : '');
    document.body.appendChild(el);
    const musicT = () => {
      if (P.mode === 'music') return P.audio.currentTime;
      return P.paused ? P.pausedAt : (performance.now() - P.ref) / 1000;
    };
    const setMusicT = (t) => {
      t = Math.max(0, t);
      if (P.mode === 'music') P.audio.currentTime = t;
      else if (P.paused) P.pausedAt = t; else P.ref = performance.now() - t * 1000;
    };
    const shiftTxt = () => { const s = m.shift || 0; $('#pshift', el).textContent = 'réglage ' + (s > 0 ? '+' : s < 0 ? '−' : '') + Math.abs(s).toFixed(2).replace('.', ',') + ' s'; };
    shiftTxt();
    let lastKey = '';
    const tick = () => {
      const vt = toV(musicT()) + (m.shift || 0);
      const ps = C.playState(segs, vt);
      let mv = '', cnt = '', tp = '', nx = '', bef = '', frac = 0;
      if (!P.started) { mv = P.mode === 'top' ? 'Touche ▶️ au début de la musique' : 'Touche ▶️ pour commencer'; nx = 'Premier : ' + segs[0].name + (segs[0].reps ? ' × ' + segs[0].reps : ''); }
      else if (!ps || ps.after) { mv = 'Bravo ! 🎉'; cnt = ''; nx = 'Morceau terminé'; frac = 1; }
      else if (ps.before || ps.gap) { bef = 'Prépare-toi'; mv = ps.next.name; cnt = Math.ceil(ps.remain) + '<small> s</small>'; nx = ps.next.reps ? '× ' + ps.next.reps : ''; }
      else {
        mv = ps.seg.name; cnt = ps.seg.reps ? ps.rep + '<small> / ' + ps.seg.reps + '</small>' : ''; tp = ps.seg.tempo || '';
        nx = ps.next ? 'Ensuite : ' + ps.next.name + (ps.next.reps ? ' × ' + ps.next.reps : '') + ' · dans ' + Math.ceil(ps.remain) + ' s' : 'Dernier mouvement · ' + Math.ceil(ps.remain) + ' s';
        frac = ps.frac;
      }
      const key = mv + '|' + cnt + '|' + tp + '|' + nx + '|' + bef;
      if (key !== lastKey) { lastKey = key; $('#pmv', el).textContent = mv; $('#pcnt', el).innerHTML = cnt; $('#ptp', el).textContent = tp; $('#pnx', el).textContent = nx; $('#pbefore', el).textContent = bef; }
      $('#pbar', el).style.width = (Math.max(0, Math.min(1, 1 - frac)) * 100).toFixed(1) + '%';
      if (P.mode === 'music' && P.started && P.audio.ended && !P.paused) { P.paused = true; $('#ppp', el).textContent = '▶️'; }
      P.raf = requestAnimationFrame(tick);
    };
    const play = async () => {
      if (P.mode === 'music') { try { await P.audio.play(); } catch (e) { toast('Le son ne peut pas démarrer.'); return; } }
      else P.ref = performance.now() - P.pausedAt * 1000;
      P.paused = false; P.started = true; $('#ppp', el).textContent = '⏸️';
    };
    const pause = () => { if (P.mode === 'music') P.audio.pause(); else P.pausedAt = musicT(); P.paused = true; $('#ppp', el).textContent = '▶️'; };
    if (P.mode === 'music') {
      // commencer un peu avant le premier mouvement (pas au tout début de la musique s'il y a une intro silencieuse)
      P.audio.addEventListener('loadedmetadata', () => { const t0 = Math.max(0, fromV(segs[0].start) - 4); if (t0 > 0) setMusicT(t0); }, { once: true });
    }
    const jump = (dir) => {
      const vt = toV(musicT()) + (m.shift || 0);
      let i = segs.findIndex((s) => vt >= s.start && vt < s.end);
      if (i < 0) i = dir > 0 ? segs.findIndex((s) => s.start > vt) - 1 : segs.findIndex((s) => s.start > vt);
      let j = dir > 0 ? i + 1 : (i >= 0 && vt - segs[i].start > 2 ? i : i - 1);
      j = Math.max(0, Math.min(segs.length - 1, j));
      setMusicT(fromV(segs[j].start - (m.shift || 0)) + 0.02); P.started = true;
    };
    let saveT = null;
    const adj = (d) => { m.shift = Math.round(((m.shift || 0) + d) * 100) / 100; shiftTxt(); clearTimeout(saveT); saveT = setTimeout(() => saveCourse(c), 600); };
    const close = () => { cancelAnimationFrame(P.raf); if (P.audio) { P.audio.pause(); URL.revokeObjectURL(P.url); } el.remove(); S.wantAwake = false; keepAwake(false); };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      const a = b.dataset.p;
      if (a === 'close') { close(); saveCourse(c); scrScript(cid, mid); }
      else if (a === 'pp') { P.paused ? play() : pause(); }
      else if (a === 'prev') jump(-1); else if (a === 'next') jump(1);
      else if (a === 'early') adj(0.25); else if (a === 'late') adj(-0.25);
      else if (a === 'nextm') { close(); saveCourse(c); scrPlay(cid, nextM.id); }
    });
    window.SM_PLAY = { P, el, musicT, setMusicT, base, segs, toV, fromV, sync: sy }; // pour les tests
    tick();
  }

  /* ======================= Mes mouvements ======================= */
  async function scrMoves(style) {
    const names = movesFor(style);
    const cnt = {}; S.prints.filter((p) => p.style === style).forEach((p) => { cnt[p.name] = (cnt[p.name] || 0) + 1; });
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Mes mouvements</h1></div>' +
      '<div class="chips">' + Object.keys(STYLE_INFO).map((k) => '<button class="chip ' + (k === style ? 'on' : '') + '" data-act="st" data-k="' + k + '">' + STYLE_INFO[k].label + '</button>').join('') + '</div>' +
      '<p class="soft small">Les noms utilisés dans tes scripts. « appris » = nombre de fois où tu as corrigé ou validé ce mouvement : plus il y en a, mieux l\'appli le reconnaît.</p>' +
      names.map((n) => '<button class="seg" data-act="mv" data-n="' + esc(n) + '"><span class="t"><b>' + esc(n) + '</b><span class="mute">' + (cnt[n] ? cnt[n] + ' appris' : 'pas encore appris') + '</span></span><span style="font-size:22px">✏️</span></button>').join('') +
      '<button class="btn sec" data-act="add">➕ Nouveau mouvement</button>',
    {
      back: () => scrHome(),
      st: (b) => scrMoves(b.dataset.k),
      add: async () => { const n = await askText('Nom du nouveau mouvement', '', 'ex. Descente tirage'); if (n) { S.customMoves = S.customMoves || {}; (S.customMoves[style] = S.customMoves[style] || []).push(n); await saveKV('customMoves'); scrMoves(style); } },
      mv: async (b) => {
        const n = b.dataset.n;
        const r = await ask(n, (cnt[n] ? cnt[n] + ' empreinte(s) apprise(s).' : 'Pas encore appris.'), [{ label: '✏️ Renommer partout', value: 'ren' }].concat(cnt[n] ? [{ label: '🧽 Oublier ce que l\'appli a appris', value: 'forget', cls: 'sec' }] : [], [{ label: 'Retour', value: null, cls: 'ghost' }]));
        if (r === 'ren') { const nn = await askText('Nouveau nom pour « ' + n + ' »', n); if (nn && nn !== n) { await renameEverywhere(style, n, nn); scrMoves(style); } }
        if (r === 'forget') { S.prints = S.prints.filter((p) => !(p.style === style && p.name === n)); await saveKV('prints'); toast('Oublié.'); scrMoves(style); }
      }
    });
  }

  /* ======================= Réglages ======================= */
  async function scrSettings() {
    const s = S.settings;
    let est = '';
    try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); est = Math.round((e.usage || 0) / 1e6) + ' Mo utilisés'; } } catch (e) { /* rien */ }
    const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted().catch(() => false) : false;
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Réglages</h1></div>' +
      '<div class="card"><h2>Analyse des vidéos</h2><p class="soft small">« Plus précis » regarde 8 images par seconde et découpe l\'image en zones agrandies pour bien voir les personnes petites ou loin. « Plus rapide » : 6 images par seconde et 2 zones.</p><div class="chips"><button class="chip ' + (s.quality === 'rapide' ? 'on' : '') + '" data-act="q" data-v="rapide">Plus rapide</button><button class="chip ' + (s.quality !== 'rapide' ? 'on' : '') + '" data-act="q" data-v="precis">Plus précis<small style="color:var(--soft)">conseillé</small></button></div>' +
        (s.msView ? '<p class="mute">Sur ce téléphone, pour 1 h de vidéo de groupe : environ ' + fmtDur(Math.max(900, 3600 * 6 * 2 * s.msView / 1000)) + ' en « Plus rapide », ' + fmtDur(Math.max(900, 3600 * 8 * 4 * s.msView / 1000)) + ' en « Plus précis » (estimation).</p>' : '') + '</div>' +
      '<div class="card"><h2>Personnes cherchées par zone</h2><div class="chips">' + [6, 8].map((n) => '<button class="chip ' + (s.numPoses === n ? 'on' : '') + '" data-act="np" data-v="' + n + '">' + n + '</button>').join('') + '</div></div>' +
      '<div class="card"><h2>Stockage</h2><p class="soft small">' + esc(est) + (persisted ? ' · protégé ✅' : ' · non protégé (le téléphone pourrait effacer si la mémoire est pleine : fais des sauvegardes 💾)') + '</p></div>' +
      '<button class="btn ghost" data-act="reset">🗑️ Tout effacer et recommencer</button>' +
      '<p class="mute" style="text-align:center">ScriptMove · tout est calculé dans ton téléphone</p>',
    {
      back: () => scrHome(),
      q: async (b) => { s.quality = b.dataset.v; await saveKV('settings'); scrSettings(); },
      np: async (b) => { s.numPoses = +b.dataset.v; await saveKV('settings'); scrSettings(); },
      reset: () => resetAll()
    });
  }

  /* ======================= Sauvegarde / restauration ======================= */
  const b64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
  async function doBackup() {
    const courses = await dall('courses'); const musics = await dall('musics');
    const msize = musics.reduce((a, m) => a + (m.blob ? m.blob.size : 0), 0);
    const opts = [{ label: '💾 Scripts seulement (léger)', value: 'light' }];
    if (msize < 150e6) opts.push({ label: '🎵 Avec les musiques (' + Math.round(msize / 1e6) + ' Mo)', value: 'full', cls: 'sec' });
    opts.push({ label: 'Annuler', value: null, cls: 'ghost' });
    const r = await ask('Sauvegarder', 'Un fichier est enregistré dans ton téléphone (dossier Téléchargements). Garde-le précieusement, par exemple sur ton Drive.', opts);
    if (!r) return;
    const data = { app: 'ScriptMove', version: 1, date: new Date().toISOString(), courses, vocab: S.vocab, prints: S.prints, customMoves: S.customMoves || {}, settings: S.settings };
    data.musicsInfo = musics.map((m) => ({ id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm }));
    if (r === 'full') {
      toast('Préparation…');
      data.musics = []; for (const m of musics) if (m.blob) data.musics.push({ id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm, data: await b64(m.blob) });
      data.thumbs = {}; for (const c of courses) for (const m of c.morceaux) { const t = await dget('data', 'th:' + m.id); if (t) data.thumbs[m.id] = t; }
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'ScriptMove-sauvegarde-' + new Date().toISOString().slice(0, 10) + (r === 'full' ? '-complete' : '') + '.json';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
    toast('Sauvegarde enregistrée ✅', 3500);
  }
  async function doRestore() {
    const f = (await pickFile('application/json,.json'))[0]; if (!f) return;
    let d; try { d = JSON.parse(await f.text()); } catch (e) { toast('Ce fichier n\'est pas une sauvegarde ScriptMove.'); return; }
    if (!d || d.app !== 'ScriptMove') { toast('Ce fichier n\'est pas une sauvegarde ScriptMove.'); return; }
    const r = await ask('Restaurer ?', 'Sauvegarde du ' + esc(new Date(d.date).toLocaleDateString('fr-FR')) + ' : ' + (d.courses || []).length + ' cours. Les cours déjà présents avec le même nom interne seront remplacés, les autres sont gardés.', [{ label: '📂 Restaurer', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
    if (!r) return;
    for (const c of d.courses || []) await saveCourse(c);
    for (const m of d.musics || []) { const blob = await (await fetch(m.data)).blob(); await dput('musics', { id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm, blob }); }
    for (const k in d.thumbs || {}) await dput('data', d.thumbs[k], 'th:' + k);
    const ids = new Set(S.prints.map((p) => p.id)); for (const p of d.prints || []) if (!ids.has(p.id)) S.prints.push(p);
    for (const st in d.vocab || {}) S.vocab[st] = Object.assign({}, S.vocab[st] || {}, d.vocab[st]);
    S.customMoves = S.customMoves || {}; for (const st in d.customMoves || {}) S.customMoves[st] = Array.from(new Set((S.customMoves[st] || []).concat(d.customMoves[st])));
    await saveKV('prints'); await saveKV('vocab'); await saveKV('customMoves');
    toast('Restauré ✅', 3000); scrHome();
  }

  /* ======================= Démarrage ======================= */
  async function start() {
    await loadKV();
    S.customMoves = (await dget('kv', 'customMoves')) || {};
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* rien */ }
    scrHome();
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* rien */ }
  }
  S.api = { scrHome, scrCourse, scrScript, scrPlay, startAnalysis, finishMorceau, setVideo, dget, dput, dall, saveCourse, scriptText };
  scrLock();
})();
