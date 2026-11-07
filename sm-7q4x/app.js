/* ScriptMove – application (tout reste dans le téléphone) */
(function () {
  'use strict';
  const C = window.SMCore, MP4 = window.SMMp4;
  // 31/10 : l'analyse automatique des mouvements est retirée (trop lente) : on écrit son script soi-même en regardant la vidéo
  const STYLE_INFO = { pump: { label: 'Pump' }, combat: { label: 'Combat' }, attack: { label: 'Attack' }, step: { label: 'Step' } };
  const app = document.getElementById('app');
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const fmt = C.fmtTime;
  const fmtDur = (s) => { s = Math.max(0, Math.round(s)); if (s < 60) return s + ' s'; const m = Math.round(s / 60); if (m < 60) return m + ' min'; return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0'); };
  const fmtSize = (b) => { b = b || 0; if (b < 1e9) return Math.max(1, Math.round(b / 1e6)) + ' Mo'; return (b / 1e9).toFixed(1).replace('.', ',') + ' Go'; };
  const fmtDate = (t) => new Date(t || Date.now()).toLocaleDateString('fr-FR');
  const S = { videoFile: null, videoURL: null, videoFor: null, kept: {}, vocab: {}, prints: [], folders: [], clip: null };
  window.SM = S; // pour les tests

  /* ======================= Base de données (IndexedDB) ======================= */
  let dbp = null;
  function db() {
    if (!dbp) dbp = new Promise((res, rej) => {
      const r = indexedDB.open('scriptmove', 2);
      r.onupgradeneeded = (e) => {
        const d = r.result, old = e.oldVersion || 0;
        if (old < 1) { d.createObjectStore('courses', { keyPath: 'id' }); d.createObjectStore('musics', { keyPath: 'id' }); d.createObjectStore('data'); d.createObjectStore('kv'); }
        if (old < 2) {
          d.createObjectStore('vchunks'); // la vidéo de chaque édition, par blocs
          const p = d.createObjectStore('photos', { keyPath: 'id' }); p.createIndex('mid', 'mid'); p.createIndex('cid', 'cid');
        }
      };
      r.onsuccess = () => { const d = r.result; d.onversionchange = () => { d.close(); dbp = null; }; res(d); };
      r.onerror = () => rej(r.error);
      r.onblocked = () => toast('Ferme les autres onglets de ScriptMove, puis rouvre l\'appli.', 6000);
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
  /** Enregistre une édition. v11 : un texte de script non vide n'est jamais remplacé par du vide ni par une copie plus ancienne
      (C.protectTexts), et l'ancien texte d'un morceau est gardé dans son historique (data 'txh:' + id du morceau) avant chaque changement. */
  async function saveCourse(c) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(['courses', 'data'], 'readwrite'), s = t.objectStore('courses'), ds = t.objectStore('data');
      const g = s.get(c.id);
      g.onsuccess = () => {
        const old = g.result;
        const kept = C.protectTexts(c, old);
        if (kept.length) console.warn('ScriptMove : texte protégé (copie plus ancienne ou vide)', kept);
        const om = new Map(((old && old.morceaux) || []).map((m) => [m.id, m]));
        for (const m of c.morceaux || []) {
          const o = om.get(m.id), was = o && typeof o.text === 'string' ? o.text : '';
          if (was.trim() && was !== m.text) { const k = 'txh:' + m.id, hg = ds.get(k); hg.onsuccess = () => ds.put(C.pushHistory(hg.result, was, o.textAt || Date.now()), k); }
        }
        s.put(c);
      };
      t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('abandon'));
    });
  }
  async function loadKV() {
    S.vocab = (await dget('kv', 'vocab')) || {};
    S.prints = (await dget('kv', 'prints')) || [];
    S.customMoves = (await dget('kv', 'customMoves')) || {};
    S.favs = (await dget('kv', 'favs')) || {};
    S.folders = (await dget('kv', 'folders')) || [];
    S.mixes = (await dget('kv', 'mixes')) || [];
    // v25 : les anciens « mix de musiques » (v24, retirés) sont ignorés mais gardés tels quels
    S.mixesOld = S.mixes.filter((x) => x && x.kind === 'music'); S.mixes = S.mixes.filter((x) => !(x && x.kind === 'music')); // 🔀 mes mix (01/11) : des références vers les morceaux, rien n'est recopié
    // 31/10 : nouveaux noms de mouvements dans les listes personnelles (une seule fois)
    if (!(await dget('kv', 'movesV4'))) {
      const k = { vocab: S.vocab, prints: S.prints, customMoves: S.customMoves, favs: S.favs };
      if (C.migrateMoveLists(k)) { S.customMoves = k.customMoves; await saveKV('vocab'); await saveKV('prints'); await saveKV('customMoves'); await saveKV('favs'); }
      await dput('kv', true, 'movesV4');
    }
    let ch = false;
    for (const f of C.BASE_FOLDERS) if (!S.folders.some((x) => x.id === f.id)) { S.folders.push(Object.assign({ builtin: true }, f)); ch = true; }
    if (ch) await saveKV('folders');
  }
  const saveKV = (k) => dput('kv', S[k], k);
  /** Range les anciens cours dans les dossiers (une seule fois, rien n'est perdu) */
  async function migrateAll() {
    const all = await dall('courses');
    for (const c of all) if (C.migrateCourse(c, S.folders, uid)) await saveCourse(c);
  }

  /* ======================= Petits outils d'écran ======================= */
  let acts = {};
  // 31/10 : on reste à la même place quand on revalide un écran (même titre) ; on remonte en haut seulement en changeant d'écran
  let lastScreen = null;
  function render(html, actions) {
    const key = ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
    const y = window.scrollY, same = key && key === lastScreen;
    document.documentElement.style.scrollPaddingTop = '';
    document.body.classList.remove('wtyping');
    app.innerHTML = html; acts = actions || {}; lastScreen = key; S.where = null; // v22 : scrHome / scrPc disent où on est
    if (same) { window.scrollTo(0, y); requestAnimationFrame(() => window.scrollTo(0, y)); } else window.scrollTo(0, 0);
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
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && S.wantAwake) keepAwake(true);
    if (document.visibilityState === 'hidden' && S.flushWrite) S.flushWrite(); // texte de « Mon script » enregistré tout de suite
  });
  window.addEventListener('pagehide', () => { if (S.flushWrite) S.flushWrite(); });
  const folderOf = (id) => S.folders.find((f) => f.id === id) || null;
  /* 🔀 Mes mix : S.mixBack = { id, pos } quand on a ouvert un morceau depuis un mix (le retour revient au mix) */
  const mixOf = (id) => (S.mixes || []).find((x) => x.id === id) || null;
  const goBack = (cid) => { const b = S.mixBack; if (b && mixOf(b.id)) return scrMix(b.id, b.pos); S.mixBack = null; return scrCourse(cid); };
  const playFrom = (cid, mid) => { const b = S.mixBack, x = b && mixOf(b.id); const r = x && x.items[b.pos]; return r && r.cid === cid && r.mid === mid ? scrPlay(cid, mid, { mix: b.id, pos: b.pos }) : scrPlay(cid, mid); };
  const styleName = (st) => { const f = S.folders.find((x) => x.style === st); return f ? f.name : (STYLE_INFO[st] || { label: st }).label; };
  function movesFor(style) {
    const v = S.vocab[style] || {};
    const base = (C.MOVES[style] || []).filter((n) => n !== 'Pause').map((n) => v[n] || n);
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
  // 31/10 : déverrouillage par empreinte (WebAuthn, vérifié par le téléphone ; l'empreinte ne sort jamais du téléphone)
  const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const ub64u = (str) => { const b = atob(str.replace(/-/g, '+').replace(/_/g, '/')); const a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
  async function bioDispo() { try { return !!(window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()); } catch (e) { return false; } }
  async function bioActiver() {
    const cred = await navigator.credentials.create({ publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: 'ScriptMove' },
      user: { id: crypto.getRandomValues(new Uint8Array(16)), name: 'scriptmove', displayName: 'ScriptMove' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
      authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' }, timeout: 60000 } });
    if (!cred) throw new Error('annulé');
    lsSet('sm_bio', { id: b64u(cred.rawId) });
  }
  async function bioVerifier() {
    const b = lsGet('sm_bio'); if (!b) return false;
    const a = await navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: 'public-key', id: ub64u(b.id), transports: ['internal'] }], userVerification: 'required', timeout: 60000 } });
    return !!(a && a.response && a.response.authenticatorData && (new Uint8Array(a.response.authenticatorData)[32] & 4));
  }
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
        (creating || !lsGet('sm_bio') ? '' : '<button class="btn" data-act="bio">👆 Déverrouiller avec mon empreinte</button>') +
        (creating ? '' : '<div class="card j small"><b>Code oublié ?</b> Il n\'y a pas d\'autre moyen : touche « Tout effacer et recommencer ». Tes scripts seront perdus (sauf si tu as fait une sauvegarde 💾).</div><button class="btn ghost small" data-act="reset">🗑️ Tout effacer et recommencer</button>'),
      { k: (b) => { if (code.length < 8) { code += b.dataset.k; draw(); } }, del: () => { code = code.slice(0, -1); draw(); }, ok: submit, reset: resetAll, bio: bioEssai });
      waitMsg();
    };
    const msg = (t) => { const m = $('#lmsg'); if (m) m.textContent = t; };
    let timer = null;
    function waitMsg() {
      const tr = lsGet('sm_tries') || {}; clearTimeout(timer);
      if (tr.until && tr.until > Date.now()) { msg('Trop d\'essais. Attends ' + Math.ceil((tr.until - Date.now()) / 1000) + ' s.'); timer = setTimeout(waitMsg, 1000); }
      else if (tr.until) msg('');
    }
    async function bioEssai() {
      try { if (await bioVerifier()) { lsSet('sm_tries', { fails: 0, locks: 0 }); return start(); } msg('Empreinte pas reconnue. Utilise ton code.'); }
      catch (e) { msg('Empreinte annulée ou pas disponible. Utilise ton code.'); }
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
    if (!creating && lsGet('sm_bio')) setTimeout(() => { bioEssai(); }, 300);
  }
  async function resetAll() {
    const a = await ask('Tout effacer ?', 'Tous tes cours, scripts, musiques et ce que l\'appli a appris seront <b>supprimés de ce téléphone</b>. Tu pourras choisir un nouveau code.', [{ label: '🗑️ Oui, tout effacer', value: 1, cls: 'red' }, { label: 'Non, garder', value: 0, cls: 'sec' }]);
    if (!a) return;
    const b = await ask('Vraiment sûr ?', 'On ne peut pas revenir en arrière.', [{ label: 'Oui, je suis sûr', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
    if (!b) return;
    try { (await db()).close(); } catch (e) { /* rien */ }
    dbp = null;
    await new Promise((r) => { const q = indexedDB.deleteDatabase('scriptmove'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
    try { ['sm_pin', 'sm_tries', 'sm_bio'].forEach((k) => localStorage.removeItem(k)); } catch (e) { /* rien */ }
    location.reload();
  }

  /* ======================= Vidéo gardée dans l'appli ======================= */
  const CHUNK = 8 * 1024 * 1024;
  const vkey = (cid, i) => cid + ':' + String(i).padStart(6, '0');
  const vrange = (cid) => IDBKeyRange.bound(cid + ':', cid + ':￿');
  async function deleteVideo(cid) {
    await tx('vchunks', 'readwrite', (s) => s.delete(vrange(cid)));
    if (S.kept[cid]) { URL.revokeObjectURL(S.kept[cid]); delete S.kept[cid]; }
  }
  const isQuota = (e) => !!e && (e.name === 'QuotaExceededError' || /quota|space|disk/i.test(String(e.message || e)));
  /** Copie la vidéo dans l'appli, par blocs. Renvoie 'ok', 'space', 'cancel' ou 'error'. */
  async function storeVideo(c, file, ui, cancelled) {
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* rien */ }
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const e = await navigator.storage.estimate();
        if (e.quota && e.quota - (e.usage || 0) < file.size + 30e6) return 'space';
      }
    } catch (e) { /* on essaie quand même */ }
    await deleteVideo(c.id);
    const CH = (window.SM_TEST && window.SM_TEST.chunk) || CHUNK; // (les tests utilisent de petits blocs)
    const n = Math.ceil(file.size / CH);
    try {
      for (let i = 0; i < n; i++) {
        if (cancelled && cancelled()) { await deleteVideo(c.id); return 'cancel'; }
        const part = file.slice(i * CH, Math.min(file.size, (i + 1) * CH));
        const blob = new Blob([await part.arrayBuffer()], { type: file.type || 'video/mp4' });
        await dput('vchunks', blob, vkey(c.id, i));
        ui && ui((i + 1) / n);
      }
    } catch (e) {
      console.warn('vidéo non gardée', e);
      try { await deleteVideo(c.id); } catch (e2) { /* rien */ }
      return isQuota(e) ? 'space' : 'error';
    }
    c.video = Object.assign({}, c.video, { kept: { chunks: n, size: file.size, type: file.type || 'video/mp4', date: Date.now() } });
    await saveCourse(c);
    return 'ok';
  }
  /** Écran « je garde la vidéo » (barre de progression). Renvoie 'ok', 'space', 'cancel', 'error'. */
  async function scrStoreVideo(c, file) {
    let cancelled = false;
    render('<div class="top"><h1>Je garde la vidéo</h1></div><div class="card o"><h2>🎬 Copie de la vidéo dans l\'appli…</h2><div class="bar"><i id="vb"></i></div><p style="margin:8px 0 2px"><b id="vp">0 %</b> · <span class="soft">' + fmtSize(file.size) + '</span></p>' +
      '<p class="soft small">Comme ça, tu n\'auras plus besoin de la rechoisir. Elle reste dans ton téléphone.</p></div>' +
      '<div class="card j small">📱 <b>Garde l\'écran allumé</b> et cette page ouverte jusqu\'à la fin.</div>' +
      '<button class="btn sec" data-act="stop">Ne pas garder la vidéo</button>', { stop: () => { cancelled = true; } });
    S.wantAwake = true; keepAwake(true);
    const r = await storeVideo(c, file, (f) => { const b = $('#vb'); if (b) b.style.width = Math.round(f * 100) + '%'; const p = $('#vp'); if (p) p.textContent = Math.round(f * 100) + ' %'; }, () => cancelled);
    S.wantAwake = false; keepAwake(false);
    if (r === 'space') await ask('Pas assez de place', 'Pas assez de place : la vidéo n\'est pas gardée, tu devras la rechoisir pour la revoir.<br><span class="mute">Tes scripts, tes musiques et tes photos, eux, sont bien gardés.</span>', [{ label: 'OK, compris', value: 1 }]);
    else if (r === 'error') await ask('Vidéo pas gardée', 'Je n\'ai pas réussi à copier la vidéo : tu devras la rechoisir pour la revoir.', [{ label: 'OK', value: 1 }]);
    else if (r === 'ok') toast('Vidéo gardée dans l\'appli ✅');
    return r;
  }
  /** Adresse de lecture de la vidéo d'une édition (vidéo gardée ou choisie), ou null */
  async function videoURL(c) {
    if (S.videoFile && S.videoFor === c.id) return S.videoURL;
    if (c.video && c.video.kept) {
      if (S.kept[c.id]) return S.kept[c.id];
      const blobs = await tx('vchunks', 'readonly', (s) => s.getAll(vrange(c.id)));
      if (!blobs || blobs.length !== c.video.kept.chunks) { c.video.kept = null; await saveCourse(c); return null; }
      S.kept[c.id] = URL.createObjectURL(new Blob(blobs, { type: c.video.kept.type || 'video/mp4' }));
      return S.kept[c.id];
    }
    return null;
  }
  /** 07/11 : glisser sur le côté (gauche = suivant, droite = précédent). basIgnore : bande du bas à ignorer (barre de lecture). */
  function glisserCote(el, suivant, precedent, basIgnore) {
    let d = null;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { d = null; return; }
      const t = e.touches[0], r = el.getBoundingClientRect();
      d = (basIgnore && t.clientY > r.bottom - basIgnore) ? null : { x: t.clientX, y: t.clientY, t: Date.now() };
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (!d) return; const t = e.changedTouches[0], dx = t.clientX - d.x, dy = t.clientY - d.y; const ok = Date.now() - d.t < 800; d = null;
      if (!ok || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) suivant(); else precedent();
    }, { passive: true });
  }
  /** Regarder la vidéo d'une édition, même sans musiques ni script */
  async function scrWatch(c, auto) {
    const url = await videoURL(c);
    if (!url) { await ask('Vidéo introuvable', 'La vidéo n\'est plus dans l\'appli : rechoisis-la avec « 🎬 Remettre la vidéo ».', [{ label: 'OK', value: 1 }]); scrCourse(c.id); return; }
    // éditions du même dossier qui ont une vidéo gardée, dans l'ordre du dossier
    const list = C.sortEditions((await dall('courses')).filter((x) => x.folder === c.folder && x.video && x.video.kept));
    const i = list.findIndex((x) => x.id === c.id);
    const prev = i > 0 ? list[i - 1] : null, next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    const stop = () => { const v = $('#smwatch'); if (v) v.pause(); };
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + esc(c.name) + '</h1></div>' +
      '<div id="wsw" style="min-height:60vh"><div class="vidbox"><video id="smwatch" src="' + url + '" controls playsinline preload="metadata"' + (auto ? ' autoplay' : '') + '></video></div>' +
      '<p class="mute small">👈 Glisse sur le côté pour changer de vidéo' + (list.length > 1 ? ' (' + (i + 1) + ' / ' + list.length + ')' : '') + '. Touche ⛶ en bas de la vidéo pour la mettre en plein écran.</p></div>',
      {
        back: () => { stop(); scrCourse(c.id); },
        prev: () => { if (prev) { stop(); scrWatch(prev, true); } },
        next: () => { if (next) { stop(); scrWatch(next, true); } }
      });
    // 07/11 : glisser à gauche = vidéo suivante, à droite = précédente (la barre de lecture du bas n'est pas touchée)
    glisserCote($('#wsw'), () => { if (next) { stop(); scrWatch(next, true); } else toast('C\'est la dernière vidéo'); },
      () => { if (prev) { stop(); scrWatch(prev, true); } else toast('C\'est la première vidéo'); });
    { const v = $('#smwatch'); if (v) v.addEventListener('touchstart', (e) => { const r = v.getBoundingClientRect(); if (e.touches[0].clientY > r.bottom - 70) e.stopPropagation(); }, { passive: true }); }
  }
  /** Rechoisir la vidéo d'une édition, et la garder dans l'appli */
  async function giveVideo(c, given, sure) {
    const f = given || (await pickFile('video/*'))[0]; if (!f) return false;
    if (c.video && c.video.size && f.size !== c.video.size) {
      const r = sure ? 1 : await ask('Ce n\'est pas la même vidéo ?', 'La vidéo choisie n\'a pas la même taille que celle de « ' + esc(c.name) + ' ».', [{ label: 'Utiliser quand même', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
      if (!r) return false;
      const meta = await videoMeta(f); if (meta) c.video = Object.assign({}, c.video, { name: f.name, size: f.size, duration: meta.duration, w: meta.w, h: meta.h });
    }
    setVideo(f, c.id);
    await scrStoreVideo(c, f);
    return true;
  }
  async function storageInfo() {
    let usage = 0, quota = 0;
    try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); usage = e.usage || 0; quota = e.quota || 0; } } catch (e) { /* rien */ }
    const all = await dall('courses');
    const vids = all.reduce((a, c) => a + (c.video && c.video.kept ? c.video.kept.size : 0), 0);
    return { usage, quota, vids };
  }

  /* ======================= Photos de la feuille ======================= */
  async function shrinkImage(file) {
    let src, w, h, close = () => {};
    try { src = await createImageBitmap(file); w = src.width; h = src.height; close = () => src.close && src.close(); } catch (e) {
      const u = URL.createObjectURL(file);
      src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = u; });
      w = src.naturalWidth; h = src.naturalHeight; close = () => URL.revokeObjectURL(u);
    }
    const sc = Math.min(1, 1600 / Math.max(w, h)); const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(h * sc));
    cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height); close();
    const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.85));
    return { blob, w: cv.width, h: cv.height };
  }
  const photosOf = (mid) => tx('photos', 'readonly', (s) => s.index('mid').getAll(mid));
  const photosOfCourse = (cid) => tx('photos', 'readonly', (s) => s.index('cid').getAll(cid));
  async function addPhotos(c, m) {
    const fs = await pickFile('image/*', true); if (!fs.length) return 0;
    let n = 0;
    for (const f of fs) {
      try { const r = await shrinkImage(f); await dput('photos', { id: uid(), cid: c.id, mid: m.id, blob: r.blob, w: r.w, h: r.h, created: Date.now() }); n++; }
      catch (e) { if (isQuota(e)) { toast('Pas assez de place pour la photo.', 4000); break; } toast('Cette image ne peut pas être lue.'); }
    }
    if (n) toast(n > 1 ? n + ' photos ajoutées ✅' : 'Photo ajoutée ✅');
    return n;
  }
  /** Photo en plein écran : pincer pour zoomer, glisser pour se déplacer, toucher deux fois pour revenir */
  function viewPhotos(list, start, onDelete) {
    return new Promise((resolve) => {
      let i = start || 0, url = null;
      const el = document.createElement('div'); el.className = 'pv';
      el.innerHTML = '<div class="pvimg" id="pvz"><img id="pvi" alt="Photo de ma feuille"></div>' +
        '<div class="pvbar"><button data-v="prev" aria-label="Photo précédente">◀️</button><span id="pvn"></span><button data-v="next" aria-label="Photo suivante">▶️</button>' + (onDelete ? '<button data-v="del" aria-label="Supprimer la photo">🗑️</button>' : '') + '<button data-v="close" aria-label="Fermer">✖</button></div>';
      document.body.appendChild(el);
      const img = $('#pvi', el), zone = $('#pvz', el);
      let sc = 1, x = 0, y = 0; const pts = new Map(); let st = null, lastTap = 0;
      const apply = () => { img.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + sc + ')'; };
      const snap = () => { const p = Array.from(pts.values()); st = { sc, x, y, p: p.map((q) => ({ x: q.x, y: q.y })), d: p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0 }; };
      const show = () => {
        if (url) URL.revokeObjectURL(url);
        if (!list.length) { close(); return; }
        i = Math.max(0, Math.min(list.length - 1, i));
        url = URL.createObjectURL(list[i].blob); img.src = url; sc = 1; x = 0; y = 0; apply();
        $('#pvn', el).textContent = (i + 1) + ' / ' + list.length;
      };
      // 07/11 : glisser sur le côté pour changer de photo (quand on n'a pas zoomé)
      glisserCote(zone, () => { if (sc <= 1.01 && i < list.length - 1) { i++; show(); } }, () => { if (sc <= 1.01 && i > 0) { i--; show(); } });
      zone.addEventListener('pointerdown', (e) => {
        zone.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); snap();
        const now = Date.now(); if (pts.size === 1 && now - lastTap < 300) { if (sc > 1.05) { sc = 1; x = 0; y = 0; } else { sc = 2.5; } apply(); } lastTap = now;
      });
      zone.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId) || !st) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const p = Array.from(pts.values());
        if (p.length >= 2 && st.p.length >= 2) {
          const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
          sc = Math.max(1, Math.min(8, st.sc * d / Math.max(10, st.d)));
          x = st.x + ((p[0].x + p[1].x) - (st.p[0].x + st.p[1].x)) / 2; y = st.y + ((p[0].y + p[1].y) - (st.p[0].y + st.p[1].y)) / 2;
        } else if (p.length === 1 && sc > 1) { x = st.x + p[0].x - st.p[0].x; y = st.y + p[0].y - st.p[0].y; }
        apply();
      });
      const up = (e) => { pts.delete(e.pointerId); snap(); if (sc <= 1.01) { sc = 1; x = 0; y = 0; apply(); } };
      zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
      const close = () => { if (url) URL.revokeObjectURL(url); el.remove(); resolve(); };
      el.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        const a = b.dataset.v;
        if (a === 'close') close(); else if (a === 'prev') { i--; show(); } else if (a === 'next') { i++; show(); }
        else if (a === 'del') {
          const r = await ask('Supprimer cette photo ?', '', [{ label: '🗑️ Oui, supprimer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
          if (!r) return; await onDelete(list[i]); list.splice(i, 1); show();
        }
      });
      show();
    });
  }

  /* ======================= 📄 Mon livret (PDF ou images des pages), un par édition (v12) =======================
     Copié dans l'appli (store 'data', clé 'lv:' + id de l'édition) : { cid, kind: 'pdf' | 'img', name, size, pages, created, files: [Blob…] }.
     Sur l'édition : c.livret = { kind, name, pages, size, date } ; sur chaque morceau : m.lvPage (si Hamid l'a réglée).
     Le livret reste dans le téléphone : rien n'est jamais envoyé, et il n'y a pas de bouton pour le partager. */
  const lvKey = (cid) => 'lv:' + cid;
  const getLivret = (cid) => dget('data', lvKey(cid));
  const lvSize = (b) => (b < 1e6 ? Math.max(1, Math.round((b || 0) / 1e3)) + ' Ko' : fmtSize(b));
  const lvPages = (n) => n + ' page' + (n > 1 ? 's' : '');
  const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name || '');
  let pdfLib = null;
  /** pdf.js (dans le dossier lib/ de l'appli : marche sans Internet) */
  function pdfjs() {
    if (!pdfLib) pdfLib = import('./lib/pdf.min.mjs?v=12').then((lib) => { lib.GlobalWorkerOptions.workerSrc = new URL('lib/pdf.worker.min.mjs?v=12', location.href).href; return lib; }).catch((e) => { pdfLib = null; throw e; });
    return pdfLib;
  }
  const openPdf = async (blob) => (await pdfjs()).getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false });
  const LV = { cid: null, task: null, doc: null }; // le PDF ouvert reste prêt (réouverture rapide)
  function lvForget() { if (LV.task) { try { LV.task.destroy(); } catch (e) { /* rien */ } } LV.cid = null; LV.task = null; LV.doc = null; }
  async function lvDoc(cid, rec) {
    if (LV.cid === cid && LV.doc) return LV.doc;
    lvForget(); const task = await openPdf(rec.files[0]); LV.task = task; LV.cid = cid;
    LV.doc = await task.promise; return LV.doc;
  }
  /** Page du livret d'un morceau : { page, auto } (auto = proposition : numéro du morceau + 1) */
  function lvPageFor(c, m) {
    const ms = c.morceaux.filter((x) => !x.lost); const num = ms.findIndex((x) => x.id === m.id) + 1;
    return C.lvPageOf(m, num || 1, c.livret ? c.livret.pages : 0);
  }
  /** Ajouter (ou remplacer) le livret : un PDF, ou des images (les pages, dans l'ordre choisi) */
  async function addLivret(c) {
    const fs = await pickFile('application/pdf,image/*', true); if (!fs.length) return false;
    const pdfs = fs.filter(isPdf), imgs = fs.filter((f) => !isPdf(f));
    if (pdfs.length > 1 || (pdfs.length && imgs.length)) { await ask('Un seul PDF', 'Choisis <b>un seul PDF</b>, ou bien les photos des pages (sans PDF).', [{ label: 'OK, compris', value: 1 }]); return false; }
    const size = fs.reduce((a, f) => a + (f.size || 0), 0);
    const noSpace = () => ask('Pas assez de place', 'Pas assez de place dans le téléphone pour ce livret (' + lvSize(size) + ').' + (c.livret ? ' Ton livret actuel est gardé.' : '') + '<br><span class="mute">Pour libérer de la place : retire la vidéo gardée d\'une autre édition (« 🗑️ Retirer la vidéo »), puis réessaie.</span>', [{ label: 'OK, compris', value: 1 }]);
    try {
      if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); if (e.quota && e.quota - (e.usage || 0) < size + 20e6) { await noSpace(); return false; } }
    } catch (e) { /* on essaie quand même */ }
    render('<div class="top"><h1>Je garde ton livret</h1></div><div class="card o"><h2>📄 Copie du livret dans l\'appli…</h2><div class="bar"><i id="lvb"></i></div><p style="margin:8px 0 2px"><b id="lvpc">0 %</b> · <span class="soft">' + lvSize(size) + '</span></p>' +
      '<p class="soft small" id="lvst">Lecture du fichier…</p><p class="mute">Il reste dans ton téléphone : rien n\'est envoyé.</p></div>');
    const ui = (f, t) => { const b = $('#lvb'); if (b) b.style.width = Math.round(f * 100) + '%'; const p = $('#lvpc'); if (p) p.textContent = Math.round(f * 100) + ' %'; if (t) { const s = $('#lvst'); if (s) s.textContent = t; } };
    const rec = { cid: c.id, kind: pdfs.length ? 'pdf' : 'img', name: fs[0].name || '', size, pages: 0, created: Date.now(), files: [] };
    try {
      if (rec.kind === 'pdf') {
        ui(0.1, 'Lecture du PDF…');
        const blob = new Blob([await fs[0].arrayBuffer()], { type: 'application/pdf' });
        ui(0.4, 'Je compte les pages…');
        let task = null;
        try { task = await openPdf(blob); rec.pages = (await task.promise).numPages; } catch (e) {
          console.warn('livret', e); try { if (task) task.destroy(); } catch (e2) { /* rien */ }
          await ask('PDF pas lisible', 'Ce PDF ne peut pas être ouvert par l\'appli (fichier abîmé ou protégé par un mot de passe ?).', [{ label: 'OK', value: 1 }]); return false;
        }
        try { task.destroy(); } catch (e) { /* rien */ }
        rec.files = [blob];
      } else {
        for (let i = 0; i < fs.length; i++) {
          ui(0.05 + 0.75 * i / fs.length, 'Page ' + (i + 1) + ' sur ' + fs.length + '…');
          try { const bm = await createImageBitmap(fs[i]); if (bm.close) bm.close(); } catch (e) {
            await ask('Image pas lisible', 'L\'image « ' + esc(fs[i].name) + ' » ne peut pas être lue. Choisis des photos en JPG ou PNG.', [{ label: 'OK', value: 1 }]); return false;
          }
          rec.files.push(new Blob([await fs[i].arrayBuffer()], { type: fs[i].type || 'image/jpeg' }));
        }
        rec.pages = rec.files.length;
      }
      ui(0.85, 'Enregistrement dans l\'appli…');
      await dput('data', rec, lvKey(c.id));
    } catch (e) {
      console.warn('livret non gardé', e);
      if (isQuota(e)) await noSpace(); else await ask('Livret pas gardé', 'Je n\'ai pas réussi à copier le livret dans l\'appli.', [{ label: 'OK', value: 1 }]);
      return false;
    }
    if (LV.cid === c.id) lvForget();
    c.livret = C.lvMeta(rec); await saveCourse(c);
    ui(1, 'C\'est fait !'); toast('Livret ajouté ✅ (' + lvPages(rec.pages) + ')');
    return true;
  }
  async function removeLivret(c) {
    const r = await ask('Retirer le livret ?', 'Le livret est retiré de l\'appli (' + lvSize(c.livret.size) + ' libérés). <b>Tes scripts, ta vidéo et tes photos sont gardés.</b>', [{ label: '🗑️ Oui, retirer le livret', value: 1, cls: 'red' }, { label: 'Non, le garder', value: 0, cls: 'sec' }]);
    if (!r) return false;
    await ddel('data', lvKey(c.id)); if (LV.cid === c.id) lvForget();
    c.livret = null; await saveCourse(c); toast('Livret retiré ✅'); return true;
  }
  /** Visionneuse plein écran : ◀ ▶ ou balayage, pincer pour zoomer, toucher deux fois pour zoomer / dézoomer, glisser quand on est zoomé.
      Elle se pose par-dessus l'écran : en la fermant on retrouve tout comme avant (vidéo, script, jeu). */
  function viewLivret(c, page) {
    return new Promise(async (resolve) => {
      const el = document.createElement('div'); el.className = 'lv';
      el.innerHTML = '<div class="lvtop"><b>📄 ' + esc(c.name) + '</b><button data-l="close" aria-label="Fermer le livret">✖</button></div>' +
        '<div class="lvst" id="lvst"><div class="lvpg" id="lvpg"></div><p class="lvmsg" id="lvmsg">Ouverture du livret…</p></div>' +
        '<div class="lvbar"><button data-l="prev" aria-label="Page précédente">◀</button><span id="lvn"></span><button data-l="next" aria-label="Page suivante">▶</button></div>';
      document.body.appendChild(el);
      const st = $('#lvst', el), pg = $('#lvpg', el), msg = $('#lvmsg', el);
      let N = 0, i = 1, sc = 1, x = 0, y = 0, base = { w: 0, h: 0 }, token = 0, q = 0, closed = false, bmp = null, rec = null, doc = null;
      const close = () => { if (closed) return; closed = true; window.removeEventListener('resize', onResize); if (bmp && bmp.close) bmp.close(); el.remove(); window.SM_LV = null; resolve(); };
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (!b) return; const a = b.dataset.l; if (a === 'close') close(); else if (a === 'prev') go(i - 1); else if (a === 'next') go(i + 1); });
      const bounds = () => ({ bx: Math.max(0, (base.w * sc - st.clientWidth) / 2), by: Math.max(0, (base.h * sc - st.clientHeight) / 2) });
      const apply = (free) => {
        if (!free) { const { bx, by } = bounds(); x = Math.max(-bx, Math.min(bx, x)); y = Math.max(-by, Math.min(by, y)); }
        pg.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + sc + ')';
      };
      /** Taille de la page à l'écran (toute la largeur, sans dépasser la hauteur) */
      const pageSize = async (n) => {
        if (doc) { const p = await doc.getPage(n); const v = p.getViewport({ scale: 1 }); return { p, w: v.width, h: v.height }; }
        if (bmp && bmp.close) bmp.close();
        bmp = await createImageBitmap(rec.files[n - 1]); return { b: bmp, w: bmp.width, h: bmp.height };
      };
      let cur = null;
      /** Dessine la page en canvas, net (densité de l'écran × zoom, sans dépasser ~16 millions de points) */
      const draw = async (quality) => {
        const t = ++token; const W = st.clientWidth, H = st.clientHeight;
        if (!cur || !W || !H) return;
        const k = Math.min(W / cur.w, H / cur.h); base = { w: Math.floor(cur.w * k), h: Math.floor(cur.h * k) };
        const dpr = window.devicePixelRatio || 1;
        const qq = Math.max(1, Math.min(quality || 1, 4, Math.sqrt(16e6 / (base.w * base.h * dpr * dpr))));
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(base.w * dpr * qq)); cv.height = Math.max(1, Math.round(base.h * dpr * qq));
        cv.style.width = base.w + 'px'; cv.style.height = base.h + 'px';
        try {
          if (cur.p) await cur.p.render({ canvas: cv, viewport: cur.p.getViewport({ scale: cv.width / cur.w }) }).promise;
          else { const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cur.b, 0, 0, cv.width, cv.height); }
        } catch (e) { if (!/cancel/i.test(String(e && (e.name || e.message)))) console.warn('livret', e); return; }
        if (t !== token || closed) return;
        q = qq; pg.style.width = base.w + 'px'; pg.style.height = base.h + 'px'; pg.replaceChildren(cv); apply();
      };
      async function go(n) {
        n = Math.max(1, Math.min(N, n)); if (!N) return;
        const same = n === i && cur; i = n; $('#lvn', el).textContent = 'Page ' + i + ' / ' + N;
        el.querySelector('[data-l="prev"]').disabled = i <= 1; el.querySelector('[data-l="next"]').disabled = i >= N;
        if (same) return;
        sc = 1; x = 0; y = 0; apply();
        const t = ++token;
        try { const s = await pageSize(i); if (t !== token || closed) return; cur = s; } catch (e) { console.warn('livret', e); msg.textContent = 'Cette page ne peut pas s\'afficher.'; return; }
        msg.textContent = ''; await draw(1);
      }
      let rT = null; const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { sc = 1; x = 0; y = 0; draw(1); }, 150); };
      window.addEventListener('resize', onResize);
      /* gestes : un doigt = balayer (page suivante / précédente) ou glisser quand on est zoomé ; deux doigts = zoomer */
      const pts = new Map(); let g = null, lastTap = { t: 0, x: 0, y: 0 }, moved = false;
      const center = () => { const r = st.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      const startG = () => {
        const p = Array.from(pts.values()); const o = center();
        g = { sc, x, y, n: p.length, o, x0: p[0].x, y0: p[0].y, mid: p.length > 1 ? { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 } : null, d: p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0 };
      };
      const zoomAt = (s2, fx, fy, from) => { // garde le point (fx, fy) sous le doigt
        const o = center(), k = s2 / from.sc;
        x = fx - o.x - k * (from.mid.x - o.x - from.x); y = fy - o.y - k * (from.mid.y - o.y - from.y); sc = s2;
      };
      st.addEventListener('pointerdown', (e) => { try { st.setPointerCapture(e.pointerId); } catch (er) { /* rien */ } pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 1) moved = false; else moved = true; startG(); });
      st.addEventListener('pointermove', (e) => {
        if (!pts.has(e.pointerId) || !g) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const p = Array.from(pts.values());
        if (p.length >= 2 && g.n >= 2) {
          const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
          zoomAt(Math.max(1, Math.min(6, g.sc * d / Math.max(10, g.d))), (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2, g); apply();
        } else if (p.length === 1) {
          const dx = p[0].x - g.x0, dy = p[0].y - g.y0; if (Math.hypot(dx, dy) > 10) moved = true;
          if (g.sc > 1.01) { x = g.x + dx; y = g.y + dy; apply(); } else if (moved && Math.abs(dx) > Math.abs(dy)) { x = dx * 0.6; apply(true); }
        }
      });
      const up = (e) => {
        if (!pts.has(e.pointerId)) return;
        const wasOne = pts.size === 1 && g && g.n === 1; const p0 = pts.get(e.pointerId); pts.delete(e.pointerId);
        if (wasOne && g.sc <= 1.01 && moved) { // balayage
          const dx = p0.x - g.x0, dy = p0.y - g.y0; x = 0; apply();
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? i + 1 : i - 1);
        } else if (wasOne && !moved && e.type === 'pointerup') { // toucher : deux fois = zoom / dézoom
          const now = Date.now();
          if (now - lastTap.t < 320 && Math.hypot(p0.x - lastTap.x, p0.y - lastTap.y) < 40) {
            lastTap.t = 0;
            if (sc > 1.05) { sc = 1; x = 0; y = 0; } else zoomAt(2.5, p0.x, p0.y, { sc: 1, x: 0, y: 0, mid: { x: p0.x, y: p0.y } });
            apply(); if (sc > 1) draw(sc);
          } else lastTap = { t: now, x: p0.x, y: p0.y };
        }
        if (sc <= 1.01) { sc = 1; x = 0; y = 0; apply(); }
        if (pts.size) startG(); else { g = null; if (sc > q + 0.2) draw(sc); }
      };
      st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
      window.SM_LV = { el, get page() { return i; }, get pages() { return N; }, get zoom() { return sc; }, get quality() { return q; }, go, close }; // pour les tests
      try {
        rec = await getLivret(c.id);
        if (!rec || !rec.files || !rec.files.length) { msg.textContent = 'Livret introuvable dans l\'appli. Rajoute-le depuis la page de l\'édition.'; return; }
        if (rec.kind === 'pdf') { doc = await lvDoc(c.id, rec); N = doc.numPages; } else N = rec.files.length;
        if (closed) return;
        i = 0; await go(C.lvClamp(page || 1, N));
      } catch (e) { console.warn('livret', e); if (LV.cid === c.id) lvForget(); msg.textContent = 'Le livret ne peut pas s\'ouvrir (fichier abîmé ?).'; }
    });
  }

  /* ======================= Accueil : la bibliothèque ======================= */
  async function scrHome() {
    S.wantAwake = false; keepAwake(false); S.mixBack = null;
    const courses = await dall('courses');
    const info = await storageInfo();
    const att = (await shareRaw()).length; // v22 : fichiers reçus (partage ou ordinateur) pas encore rangés
    const count = (fid) => courses.filter((c) => c.folder === fid).length;
    const folders = S.folders;
    render('<div class="logo"><img src="icon-192.png" alt=""><div><b>ScriptMove</b><span>Tes chorés en script</span></div></div>' +
      '<input type="search" id="hq" placeholder="🔎 Chercher (édition, morceau, mouvement)" autocomplete="off">' +
      '<div id="hres"></div>' +
      (att ? '<button class="btn green" data-act="rgr">📥 ' + att + ' fichier' + (att > 1 ? 's' : '') + ' reçu' + (att > 1 ? 's' : '') + ' à ranger</button>' : '') +
      '<div id="hlib"><h2 style="margin-top:16px">Ma bibliothèque</h2><div class="fgrid">' +
      folders.map((f) => '<button class="fold" data-act="fold" data-id="' + esc(f.id) + '"><span class="fi">📁</span><b>' + esc(f.name) + '</b><span class="mute">' + (count(f.id) ? count(f.id) + ' édition' + (count(f.id) > 1 ? 's' : '') : 'vide') + '</span></button>').join('') +
      '<button class="fold" data-act="mixes"><span class="fi">🔀</span><b>Mes mix</b><span class="mute">' + (S.mixes.length ? S.mixes.length + ' mix' : 'vide') + '</span></button>' +
      '</div><button class="btn ghost" data-act="newf">➕ Nouveau dossier</button>' +
      (courses.length ? '' : '<div class="card o"><h3>Bienvenue Hamid 👋</h3><p class="soft">Ouvre un dossier (par exemple 📁 Pump), puis « ➕ Nouvelle édition » : choisis la vidéo et tes musiques, l\'appli découpe en morceaux. Ensuite tu écris ton script en regardant la vidéo. Tout reste dans ton téléphone.</p></div>') +
      '<p class="mute">💾 Place utilisée : ' + fmtSize(info.usage) + (info.vids ? ' (dont vidéos ' + fmtSize(info.vids) + ')' : '') + (info.quota ? ' · libre pour l\'appli : ' + fmtSize(Math.max(0, info.quota - info.usage)) : '') + '</p>' +
      '<div class="row"><button class="btn sec" data-act="moves">📚 Mes mouvements</button><button class="btn sec" data-act="set">⚙️ Réglages</button></div>' +
      '<div class="row"><button class="btn sec" data-act="save">💾 Sauvegarder</button><button class="btn sec" data-act="restore">📂 Restaurer</button></div>' +
      '<button class="btn sec" data-act="pc">💻 Relier mon PC</button></div>',
    {
      fold: (b) => scrFolder(b.dataset.id),
      newf: async () => {
        const n = await askText('Nom du nouveau dossier', '', 'ex. Zumba, Stretch…'); if (!n) return;
        const id = 'f_' + uid(); S.folders.push({ id, name: n, style: id }); await saveKV('folders'); scrFolder(id);
      },
      moves: () => scrMoves(folders[0].id), set: () => scrSettings(), save: () => doBackup(), restore: () => doRestore(),
      res: (b) => { const d = b.dataset; if (d.mid) scrWrite(d.cid, d.mid); else scrCourse(d.cid); },
      mixes: () => scrMixes(),
      resmix: (b) => scrMix(b.dataset.id),
      pc: () => scrPc(), rgr: () => shareNext()
    });
    S.where = 'home';
    const q = $('#hq');
    q.addEventListener('input', () => {
      const t = C.norm(q.value.trim());
      $('#hlib').classList.toggle('hide', !!t);
      if (!t) { $('#hres').innerHTML = ''; return; }
      const out = [];
      for (const x of S.mixes) if (C.norm(x.name).includes(t)) out.push('<button class="seg" data-act="resmix" data-id="' + esc(x.id) + '"><span class="n">🔀</span><span class="t"><b>' + esc(x.name) + '</b><span class="mute">Mes mix · ' + x.items.length + ' morceau' + (x.items.length > 1 ? 'x' : '') + '</span></span></button>');
      for (const c of C.sortEditions(courses)) {
        const fo = folderOf(c.folder);
        if (C.norm(c.name).includes(t)) out.push('<button class="seg" data-act="res" data-cid="' + c.id + '"><span class="n">📁</span><span class="t"><b>' + esc(c.name) + '</b><span class="mute">' + esc(fo ? fo.name : '') + ' · ' + c.morceaux.filter((m) => !m.lost).length + ' morceaux</span></span></button>');
        for (const m of c.morceaux.filter((x) => !x.lost)) {
          const hitName = C.norm(m.name).includes(t);
          const hits = C.textOf(m).split('\n').map((x) => x.trim()).filter((x) => x && C.norm(x).includes(t));
          if (hitName || hits.length) out.push('<button class="seg" data-act="res" data-cid="' + c.id + '" data-mid="' + m.id + '"><span class="n">🎵</span><span class="t"><b>' + esc(m.name) + '</b><span class="mute">' + esc(c.name) + (hits.length ? ' · ' + esc(Array.from(new Set(hits.map((x) => (x.length > 28 ? x.slice(0, 27) + '…' : x)))).slice(0, 3).join(', ')) + (hits.length > 1 ? ' (' + hits.length + ' fois)' : '') : '') + '</span></span></button>');
        }
      }
      $('#hres').innerHTML = out.length ? '<p class="mute" style="margin-top:12px">' + out.length + ' résultat(s)</p>' + out.slice(0, 60).join('') : '<p class="mute" style="margin-top:12px">Rien trouvé.</p>';
    });
  }

  /* ======================= Un dossier : ses éditions ======================= */
  const scriptState = (m, nPh) => { const n = C.textCount(C.textOf(m)); return (n ? '<span class="badge ok">✍️ ' + n + ' ligne' + (n > 1 ? 's' : '') + (m.textOk ? ' ✅' : '') + '</span>' : '<span class="badge">✍️ à écrire</span>') + (nPh ? ' <span class="badge" aria-label="' + nPh + ' photo(s)">📷' + (nPh > 1 ? ' ' + nPh : '') + '</span>' : ''); };
  async function scrFolder(fid) {
    S.wantAwake = false; keepAwake(false); S.mixBack = null;
    const f = folderOf(fid); if (!f) return scrHome();
    const list = C.sortEditions((await dall('courses')).filter((c) => c.folder === fid));
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>📁 ' + esc(f.name) + '</h1>' + (/pump/i.test(f.name) ? '<button class="back" data-act="pcat" aria-label="Choisir par morceau (échauffement, squats…)">⋯</button>' : '') + '<button class="back" data-act="ren" aria-label="Renommer le dossier">✏️</button></div>' +
      '<button class="btn" data-act="new">➕ Nouvelle édition</button>' +
      (list.length ? list.map((c) => {
        const ms = c.morceaux.filter((m) => !m.lost); const w = ms.filter((m) => C.textCount(C.textOf(m))).length;
        return '<button class="seg" data-act="open" data-id="' + c.id + '"><span class="t"><b>' + esc(c.name) + '</b><span class="mute">' + fmtDate(c.created) + ' · ' + ms.length + ' morceau' + (ms.length > 1 ? 'x' : '') + ' · ✍️ ' + w + ' / ' + ms.length + ' écrit' + (w > 1 ? 's' : '') + (c.video && c.video.kept ? ' · 🎬' : '') + '</span>' + (c.livret ? '<span class="lvbadge"><span class="badge">📄 livret</span></span>' : '') + '</span><span style="font-size:24px">›</span></button>';
      }).join('') : '<div class="card"><p class="soft">Aucune édition dans ce dossier.</p><p class="mute">Touche « ➕ Nouvelle édition » : choisis la vidéo du cours et tes musiques.</p></div>') +
      (!f.builtin && !list.length ? '<button class="btn ghost small" data-act="del">🗑️ Supprimer ce dossier (vide)</button>' : ''),
    {
      back: () => scrHome(),
      new: () => scrNew(fid),
      pcat: () => scrPumpCats(fid),
      open: (b) => scrCourse(b.dataset.id),
      ren: async () => { const n = await askText('Nom du dossier', f.name); if (n) { f.name = n; await saveKV('folders'); scrFolder(fid); } },
      del: async () => {
        const r = await ask('Supprimer ce dossier ?', 'Il est vide.', [{ label: '🗑️ Oui, supprimer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return; S.folders = S.folders.filter((x) => x.id !== fid); await saveKV('folders'); scrHome();
      }
    });
  }

  /* ======================= 07/11 : Pump : un morceau (ex. Pectoraux) dans toutes les éditions ======================= */
  const PUMP_CATS = ['Échauffement', 'Squats', 'Pectoraux', 'Dos', 'Triceps', 'Biceps', 'Fentes', 'Épaules', 'Abdos', 'Retour au calme'];
  function scrPumpCats(fid) {
    const f = folderOf(fid); if (!f) return scrHome();
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>📁 ' + esc(f.name) + ' · par morceau</h1></div>' +
      '<p class="mute">Choisis un morceau : tu le vois dans toutes tes éditions.</p>' +
      PUMP_CATS.map((t, i) => '<button class="seg" data-act="cat" data-k="' + i + '"><span class="n">' + (i + 1) + '</span><span class="t"><b>' + esc(t) + '</b></span></button>').join(''),
      { back: () => scrFolder(fid), cat: (b) => scrPumpCat(fid, +b.dataset.k) });
  }
  async function scrPumpCat(fid, k) {
    const f = folderOf(fid); if (!f) return scrHome();
    const list = C.sortEditions((await dall('courses')).filter((c) => c.folder === fid));
    const L = list.map((c) => ({ c, m: c.morceaux[k] })).filter((x) => x.m && !x.m.lost);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + (k + 1) + ' · ' + esc(PUMP_CATS[k]) + '</h1></div>' +
      (L.length ? L.map((x) => '<button class="seg" data-act="w" data-cid="' + x.c.id + '" data-mid="' + x.m.id + '"><span class="t"><b>' + esc(x.c.name) + '</b><span class="mute">' + esc(x.m.name || '') + ' · ' + (C.textCount(C.textOf(x.m)) ? '✍️ écrit' : '✍️ à écrire') + '</span></span></button>').join('')
        : '<div class="card"><p class="soft">Aucune édition n\'a encore ce morceau.</p></div>'),
      { back: () => scrPumpCats(fid), w: (b) => scrWrite(b.dataset.cid, b.dataset.mid) });
  }

  /* ======================= Nouvelle édition ======================= */
  function videoMeta(file) {
    return new Promise((res) => {
      const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true;
      const u = URL.createObjectURL(file); v.src = u;
      const free = () => { v.removeAttribute('src'); v.load(); setTimeout(() => URL.revokeObjectURL(u), 1000); };
      v.onloadedmetadata = () => { res({ duration: v.duration, w: v.videoWidth, h: v.videoHeight }); free(); };
      v.onerror = () => { res(null); free(); };
    });
  }
  function setVideo(file, cid) {
    if (S.videoURL) URL.revokeObjectURL(S.videoURL);
    S.videoFile = file; S.videoURL = URL.createObjectURL(file); S.videoFor = cid || null;
  }
  async function scrNew(fid, given) {
    const f = folderOf(fid) || S.folders[0];
    const nums = (await dall('courses')).filter((c) => c.folder === f.id).map((c) => C.editionNumber(c.name)).filter((n) => n != null);
    const st = { file: null, meta: null, name: f.name + ' ' + (nums.length ? Math.max(...nums) + 1 : ''), musics: [] };
    // v19 : vidéo reçue par « Partager » : déjà choisie ; given.back = retour, given.stored = une fois la vidéo gardée
    if (given && given.file) { st.file = given.file; st.meta = await videoMeta(given.file); }
    const draw = () => {
      render('<div class="top"><button class="back" data-act="back">‹</button><h1>Nouvelle édition</h1></div><p class="mute">📁 ' + esc(f.name) + '</p>' +
        '<div class="card o"><h2>1. Le nom</h2><input type="text" id="cname" value="' + esc(st.name) + '" placeholder="ex. ' + esc(f.name) + ' 100"></div>' +
        '<div class="card o"><h2>2. La vidéo du cours</h2>' +
        (st.file ? '<p>🎬 <b>' + esc(st.file.name) + '</b><br><span class="mute">' + (st.meta ? fmt(st.meta.duration) + ' · ' : '') + fmtSize(st.file.size) + '</span></p><button class="btn sec small" data-act="vid">Changer de vidéo</button>' : '<button class="btn" data-act="vid">🎬 Choisir la vidéo</button><p class="mute">Elle est gardée dans l\'appli (rien n\'est envoyé).</p>') + '</div>' +
        '<div class="card o"><h2>3. Tes musiques <span class="mute">(conseillé)</span></h2><p class="soft small">Ajoute les musiques de l\'édition (tes fichiers propres). L\'appli retrouve où chacune commence dans la vidéo et découpe en morceaux.</p>' +
        st.musics.map((x, i) => '<div class="row" style="align-items:center;margin-bottom:8px"><span style="flex:3 1 200px">🎵 ' + esc(x.name) + '</span><button class="btn sec small" style="flex:0 0 auto;width:auto;margin:0" data-act="rm" data-i="' + i + '">Retirer</button></div>').join('') +
        '<button class="btn sec" data-act="mus">🎵 Ajouter des musiques</button></div>' +
        '<button class="btn" data-act="go" ' + (st.file ? '' : 'disabled') + '>➡️ Continuer</button>',
      {
        back: () => (given && given.back ? given.back() : scrFolder(f.id)),
        vid: async () => { st.name = $('#cname').value; const x = (await pickFile('video/*'))[0]; if (!x) return; st.file = x; st.meta = await videoMeta(x); draw(); },
        mus: async () => { st.name = $('#cname').value; const fs = await pickFile('audio/*', true); st.musics.push(...fs); draw(); },
        rm: (b) => { st.name = $('#cname').value; st.musics.splice(+b.dataset.i, 1); draw(); },
        go: async () => {
          if (!st.file) return;
          if (!st.meta) { toast('Cette vidéo ne peut pas être lue par le téléphone.'); return; }
          const c = { id: uid(), name: $('#cname').value.trim() || st.name.trim() || f.name, style: f.style, folder: f.id, version: 3, created: Date.now(), video: { name: st.file.name, size: st.file.size, duration: st.meta.duration, w: st.meta.w, h: st.meta.h }, morceaux: [], audio: 'todo' };
          setVideo(st.file, c.id);
          const mids = [];
          for (const x of st.musics) { const m = { id: uid(), name: x.name.replace(/\.[^.]+$/, ''), type: x.type, blob: x }; await dput('musics', m); mids.push(m.id); }
          c.pendingMusics = mids;
          await saveCourse(c);
          await scrStoreVideo(c, st.file);
          if (given && given.stored && st.file === given.file) await given.stored(c);
          scrPrepare(await dget('courses', c.id));
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
    return { id: uid(), name, start: Math.round(start * 10) / 10, end: Math.round(end * 10) / 10, musicId: musicId || null, offset: offset == null ? null : offset, alignConf: conf || 0, shift: 0, bpm: null, lines: [], text: '', textOk: false, lost: !!lost, sync: null, alignMode: null };
  }
  /** Musiques du cours (dans l'ordre où elles ont été ajoutées) */
  function courseMusicIds(c) {
    const ids = (c.musicIds || []).slice();
    for (const m of c.morceaux) if (m.musicId && !ids.includes(m.musicId)) ids.push(m.musicId);
    return ids;
  }
  /** Ancien découpage (musiques placées par l'ancienne méthode) ? */
  const oldCut = (c) => !c.cutVersion && c.morceaux.some((m) => m.musicId);
  const hasContent = (m, ph) => (m.lines || []).length > 0 || C.textCount(C.textOf(m)) > 0 || (ph && ph.some((p) => p.mid === m.id));

  /** Refaire le découpage d'une édition, sans tout recommencer (vidéo, musiques, nom et scripts gardés) */
  async function redoCut(c) {
    const r = await ask('Refaire le découpage ?', 'Je retrouve les morceaux avec la nouvelle méthode (les musiques ne sont jamais placées au hasard). Tes musiques, ta vidéo, le nom et <b>tes scripts et photos</b> sont gardés (rattachés au morceau qui correspond).', [{ label: '🔁 Oui, refaire', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
    if (!r) return;
    let feat = await dget('data', 'af:' + c.id);
    let file = S.videoFile && S.videoFor === c.id ? S.videoFile : null;
    if (!feat && !file && c.video && c.video.kept) {
      const blobs = await tx('vchunks', 'readonly', (s) => s.getAll(vrange(c.id)));
      if (blobs && blobs.length === c.video.kept.chunks) file = new Blob(blobs, { type: c.video.kept.type });
    }
    if (!feat && !file) {
      const q = await ask('Choisis la vidéo', 'Pour écouter le son, choisis à nouveau la vidéo <b>' + esc(c.video.name) + '</b>.', [{ label: '🎬 Choisir la vidéo', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
      if (!q || !(await giveVideo(c))) return scrCourse(c.id);
      file = S.videoFile;
    }
    render('<div class="top"><h1>Nouveau découpage</h1></div><div class="card o"><h2 id="pt">Un instant…</h2><div class="bar"><i id="pb"></i></div><p class="soft" id="pm" style="margin-top:10px"></p></div>');
    S.wantAwake = true; keepAwake(true);
    const ui = { bar: (f) => { const b = $('#pb'); if (b) b.style.width = Math.round(f * 100) + '%'; }, title: (t) => { const e = $('#pt'); if (e) e.textContent = t; }, msg: (t) => { const e = $('#pm'); if (e) e.textContent = t; } };
    if (!feat) { ui.title('J\'écoute le son de la vidéo…'); try { feat = await readVideoAudio(file, ui.bar, () => false); } catch (e) { feat = null; } if (feat) { await dput('data', feat, 'af:' + c.id); c.audio = 'ok'; } }
    let ms;
    try { ms = await autoCut(c, feat, courseMusicIds(c), ui); } catch (e) { console.error(e); S.wantAwake = false; keepAwake(false); toast('Le découpage n\'a pas marché. Ton édition n\'a pas été modifiée.', 4000); return scrCourse(c.id); }
    // garder les scripts : chaque ancien morceau va au nouveau morceau qui le recouvre le plus
    const ph = await photosOfCourse(c.id);
    const old = c.morceaux.filter((m) => !m.lost); const used = new Set();
    ms = ms.map((n) => {
      if (n.lost) return n;
      let best = null, bo = 0;
      for (const o of old) { if (used.has(o.id)) continue; const ov = Math.min(o.end, n.end) - Math.max(o.start, n.start); if (ov > bo) { bo = ov; best = o; } }
      if (!best || bo < 0.5 * Math.min(best.end - best.start, n.end - n.start)) return n;
      used.add(best.id);
      return Object.assign({}, n, { id: best.id, lines: best.lines || [], text: best.text, textOk: best.textOk, lastT: best.lastT, shift: best.shift || 0, segments: best.segments, name: best.renamed ? best.name : n.name, renamed: best.renamed });
    });
    for (const o of old) if (!used.has(o.id)) {
      if (hasContent(o, ph)) ms.push(o); // jamais perdu : remis tel quel
      else { await ddel('data', 'po:' + o.id); await ddel('data', 'th:' + o.id); }
    }
    ms.sort((a, b) => (a.lost ? 1e9 : a.start) - (b.lost ? 1e9 : b.start));
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
    const vurl = await videoURL(c);
    const hasVid = !!vurl;
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
        (oldCut(c) ? '<div class="card r"><h3>⚠️ Ancien découpage</h3><p class="soft small">Cette édition a été découpée avec l\'ancienne méthode : des musiques ont pu être placées n\'importe où. Refais le découpage (vidéo, musiques, nom et scripts gardés).</p><button class="btn" data-act="redo">🔁 Refaire le découpage</button></div>' :
        mids.length ? '<div class="card ' + (nSure === ms.length ? 'g' : 'j') + ' small">' + (nSure ? '✅ <b>' + nSure + ' musique(s) retrouvée(s)</b> dans la vidéo.<br>' : '') +
          (nSure < mids.length ? '❓ <b>' + (mids.length - nSure) + ' musique(s) pas retrouvée(s) dans la vidéo</b> (souvent : une autre version, un autre mix). Je n\'en place jamais une au hasard : ' + (nProp ? 'pour chaque morceau, je te propose la plus probable (numéro, durée, tempo). <b>Vérifie avec la liste</b>.' : 'choisis-la dans la liste de chaque morceau.') : '') + '</div>' : '') +
        (hasVid ? '<div class="vidbox"><video id="cutvid" src="' + vurl + '" controls playsinline preload="metadata"></video></div><p class="mute">Regarde la vidéo pour vérifier. « ✂️ Couper ici » coupe à l\'endroit où est la vidéo.</p><button class="btn sec" data-act="cut">✂️ Couper ici (' + '<span id="vt">0:00</span>)</button>' : '<div class="card j small">Pour voir la vidéo ici, choisis-la à nouveau (la même) : elle sera gardée dans l\'appli. <button class="btn sec small" data-act="revid" style="margin-top:8px">🎬 Choisir la vidéo</button></div>') +
        ms.map((m, i) => {
          return '<div class="card mrc ' + (m.alignMode === 'proposed' && !m.proposedSure ? 'j' : 'o') + '"><div class="head"><h2>Morceau ' + (i + 1) + '</h2><button class="btn sec small" style="width:auto;flex:0 0 auto;margin:0" data-act="ren" data-id="' + m.id + '">✏️ Nom</button></div>' +
            '<p style="margin:0 0 6px"><b>' + esc(m.name) + '</b> <span class="mute">(' + fmtDur(m.end - m.start) + ')</span>' + (C.textCount(C.textOf(m)) ? ' <span class="badge ok">✍️ ' + C.textCount(C.textOf(m)) + '</span>' : '') + '</p>' +
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
        revid: async () => { await giveVideo(c); scrCut(cid); },
        ren: async (b) => { const m = c.morceaux.find((x) => x.id === b.dataset.id); const n = await askText('Nom du morceau', m.name, 'ex. 03 Squats'); if (n) { m.name = n; m.renamed = true; m.autoName = false; await saveCourse(c); draw(); } },
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
          // le script (texte libre, sans heures) reste dans le premier morceau ; le nouveau est à écrire
          n.lines = []; n.text = ''; n.textOk = false;
          c.morceaux.splice(c.morceaux.indexOf(m) + 1, 0, n);
          await saveCourse(c); draw(); toast('Coupé à ' + fmt(t));
        },
        fuse: async (b) => {
          const ms2 = c.morceaux.filter((x) => !x.lost); const i = ms2.findIndex((x) => x.id === b.dataset.id); const A = ms2[i], B = ms2[i + 1]; if (!B) return;
          const ta = C.textOf(A), tb = C.textOf(B);
          A.text = [ta, tb].filter((x) => x.trim()).join('\n\n'); A.textOk = !!A.text.trim() && (!ta.trim() || !!A.textOk) && (!tb.trim() || !!B.textOk);
          A.end = B.end; A.lines = C.sortLines((A.lines || []).concat(B.lines || [])); if (!A.musicId && B.musicId) { A.musicId = B.musicId; A.offset = B.offset; A.sync = B.sync; A.alignMode = B.alignMode; }
          for (const p of await photosOf(B.id)) { p.mid = A.id; await dput('photos', p); }
          c.morceaux.splice(c.morceaux.indexOf(B), 1); await saveCourse(c); draw();
        },
        del: async (b) => {
          const m = c.morceaux.find((x) => x.id === b.dataset.id); const ph = await photosOf(m.id);
          const r = await ask('Retirer ce morceau ?', C.textCount(C.textOf(m)) || ph.length ? '<b>Son script (' + C.textCount(C.textOf(m)) + ' lignes) et ses photos seront effacés.</b> La vidéo n\'est pas touchée.' : 'La vidéo n\'est pas touchée.', [{ label: 'Oui, retirer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
          if (!r) return; for (const p of ph) await ddel('photos', p.id);
          c.morceaux = c.morceaux.filter((x) => x.id !== b.dataset.id); await saveCourse(c); draw();
        },
        ok: async () => { if (S.shareOn && await shareNext()) return; scrCourse(c.id); },
        redo: () => redoCut(c)
      });
      const v = $('#cutvid'); if (v) v.addEventListener('timeupdate', () => { const e = $('#vt'); if (e) e.textContent = fmt(v.currentTime); });
      app.querySelectorAll('select[data-mus]').forEach((sel) => sel.addEventListener('change', async () => {
        const m = c.morceaux.find((x) => x.id === sel.dataset.mus); if (!m) return;
        const id = sel.value || null;
        c.morceaux = c.morceaux.filter((x) => !(x.lost && x.musicId === id));
        if (id) for (const x of c.morceaux) if (x !== m && !x.lost && x.musicId === id && x.alignMode !== 'sure') { x.musicId = null; x.sync = null; x.alignMode = null; }
        const prevId = m.musicId;
        m.musicId = id; m.alignMode = id ? 'manual' : null; m.offset = null; m.shift = 0;
        if (!m.renamed && (m.autoName || (prevId && musics[prevId] && m.name === musics[prevId].name))) { m.name = id ? musics[id].name : 'Morceau'; m.autoName = true; }
        const feat = await dget('data', 'af:' + c.id);
        m.sync = id ? tempoSync(feat, m, musics[id]) : null;
        if (prevId && prevId !== id && !c.morceaux.some((x) => x.musicId === prevId)) { const lo = newMorceau(musics[prevId].name, 0, 0, prevId, null, 0, true); lo.why = 'absente'; c.morceaux.push(lo); }
        await saveCourse(c); const y = window.scrollY; draw(); window.scrollTo(0, y);
        toast(id ? 'Musique choisie ✅' : 'Plus de musique pour ce morceau.');
      }));
    };
    draw();
  }

  /* ======================= Page d'une édition ======================= */
  async function scrCourse(cid) {
    S.wantAwake = false; keepAwake(false); S.mixBack = null;
    const c = await dget('courses', cid); if (!c) return scrHome();
    const musics = {}; for (const m of await dall('musics')) musics[m.id] = m;
    const ph = await photosOfCourse(cid); const nPh = (mid) => ph.filter((p) => p.mid === mid).length;
    const ms = c.morceaux.filter((m) => !m.lost);
    const fo = folderOf(c.folder);
    const kept = c.video && c.video.kept;
    const lv = c.livret;
    /** Réglage « Page du livret » d'un morceau (la proposition automatique est affichée en clair, pas imposée) */
    const lvSet = (m) => { const r = lvPageFor(c, m); return '<div class="lvset" data-id="' + m.id + '"><span class="lvl">📄 Page du livret :</span><button data-act="lvpm" data-id="' + m.id + '" data-d="-1" aria-label="Page d\'avant">−</button><b class="lvnum' + (r.auto ? ' auto' : '') + '">' + r.page + '</b><button data-act="lvpm" data-id="' + m.id + '" data-d="1" aria-label="Page d\'après">+</button><span class="lvhint mute">' + (r.auto ? 'proposée' : '') + '</span></div>' +
      '<div class="lvq hide" data-id="' + m.id + '"><span>Régler les suivants à la suite ?</span><button data-act="lvfill" data-id="' + m.id + '">Oui</button><button data-act="lvno" data-id="' + m.id + '">Non</button></div>'; };
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + esc(c.name) + '</h1><button class="back" data-act="ren" aria-label="Renommer l\'édition">✏️</button></div>' +
      '<p class="mute">📁 ' + esc(fo ? fo.name : '') + ' · ' + fmtDate(c.created) + ' · ' + (c.video ? fmt(c.video.duration) : '') + '</p>' +
      (oldCut(c) ? '<div class="card r"><h3>⚠️ Découpage à refaire</h3><p class="soft small">Cette édition a été découpée avec l\'ancienne méthode : des musiques ont pu être placées n\'importe où. La nouvelle méthode ne place une musique que si elle est sûre. Ta vidéo, tes musiques, le nom et tes scripts sont gardés.</p><button class="btn" data-act="redo">🔁 Refaire le découpage</button></div>' : '') +
      '<div class="card ' + (kept ? 'g' : 'j') + ' small">' + (kept ? '🎬 <b>Vidéo gardée dans l\'appli</b> (' + fmtSize(kept.size) + ')<button class="btn small" style="margin:8px 0 0" data-act="watch">▶️ Regarder la vidéo</button><button class="btn ghost small" style="margin:8px 0 0" data-act="rmvid">🗑️ Retirer la vidéo (garder scripts et musiques)</button>' : '🎬 <b>La vidéo n\'est pas gardée</b> dans l\'appli.' + (c.video ? ' <span class="mute">(' + esc(c.video.name) + ', ' + fmtSize(c.video.size) + ')</span>' : '') + '<button class="btn sec small" style="margin:8px 0 0" data-act="addvid">🎬 Remettre la vidéo</button>') + '</div>' +
      (lv ? '<div class="card g small lvcard">📄 <b>Mon livret</b> · <span id="lvinfo">' + lvPages(lv.pages) + ' · ' + lvSize(lv.size) + '</span>' +
        '<button class="btn small" style="margin:8px 0 8px" data-act="lvsee">📄 Voir mon livret</button><div class="row tight"><button class="btn sec small" style="margin:0" data-act="lvadd">🔁 Remplacer</button><button class="btn sec small" style="margin:0" data-act="lvrm">🗑️ Retirer</button></div></div>'
        : '<button class="btn sec" data-act="lvadd">📄 Ajouter mon livret</button>') +
      '<div class="row"><button class="btn sec" data-act="script">📖 Script de l\'édition</button><button class="btn sec" data-act="pdf">🖨️ PDF</button></div>' +
      ms.map((m, i) => '<div class="card mrc ' + (C.textCount(C.textOf(m)) ? 'g' : 'o') + '"><div class="head"><button class="btn sec small" style="width:auto;flex:0 0 auto;margin:0 8px 0 0;padding:6px 10px" data-act="renm" data-id="' + m.id + '" aria-label="Renommer ce morceau">✏️</button><h2 style="flex:1 1 auto;min-width:0">' + (i + 1) + '. ' + esc(m.name) + '</h2></div>' +
        '<p style="margin:0 0 6px">' + scriptState(m, nPh(m.id)) + '</p>' +
        (lv ? lvSet(m) : '') +
        '<p class="mute">' + fmt(m.start) + ' → ' + fmt(m.end) + (m.musicId && musics[m.musicId] ? ' · 🎵 ' + esc(musics[m.musicId].name) + (m.alignMode === 'sure' ? ' ✅' : m.alignMode === 'proposed' ? ' ❓' : '') : ' · pas de musique liée') + '</p>' +
        '<button class="btn small" data-act="write" data-id="' + m.id + '">✍️ Mon script</button>' +
        '<div class="row tight">' + (C.textCount(C.textOf(m)) || m.musicId ? '<button class="btn sec small" data-act="play" data-id="' + m.id + '">🎮 Jouer</button>' : '') + (C.textCount(C.textOf(m)) ? '<button class="btn sec small" data-act="read" data-id="' + m.id + '">📖 Lire</button>' : '') +
        '<button class="btn sec small" data-act="photo" data-id="' + m.id + '">📷 ' + (nPh(m.id) ? 'Photos' : 'Photo') + '</button>' +
        '<button class="btn sec small" data-act="link" data-id="' + m.id + '">🎵 ' + (m.musicId ? 'Musique' : 'Lier une musique') + '</button>' +
        (lv ? '<button class="btn sec small" data-act="lv" data-id="' + m.id + '">📄 Livret</button>' : '') + '</div></div>').join('') +
      '<div class="row"><button class="btn sec" data-act="cut">✂️ Modifier le découpage</button><button class="btn sec" data-act="mvf">📁 Changer de dossier</button></div>' +
      '<button class="btn ghost small" data-act="del">🗑️ Supprimer cette édition</button>',
    {
      back: () => scrFolder(c.folder),
      write: (b) => scrWrite(c.id, b.dataset.id),
      play: (b) => scrPlay(c.id, b.dataset.id),
      read: (b) => scrRead(c.id, b.dataset.id),
      photo: (b) => photoMenu(c, c.morceaux.find((x) => x.id === b.dataset.id), () => scrCourse(cid)),
      script: () => scrCourseScript(c.id),
      pdf: () => printCourse(c),
      lvadd: async () => { await addLivret(c); scrCourse(cid); },
      lvrm: async () => { if (await removeLivret(c)) scrCourse(cid); },
      lvsee: () => viewLivret(c, 1),
      lv: (b) => { const m = c.morceaux.find((x) => x.id === b.dataset.id); if (m) viewLivret(c, lvPageFor(c, m).page); },
      lvpm: (b) => {
        const m = c.morceaux.find((x) => x.id === b.dataset.id); if (!m || !lv) return;
        m.lvPage = C.lvClamp(lvPageFor(c, m).page + (+b.dataset.d), lv.pages); saveCourse(c);
        const box = b.closest('.lvset'); box.querySelector('.lvnum').textContent = m.lvPage; box.querySelector('.lvnum').classList.remove('auto'); box.querySelector('.lvhint').textContent = '';
        app.querySelectorAll('.lvq').forEach((q) => q.classList.toggle('hide', !(q.dataset.id === m.id && ms.indexOf(m) < ms.length - 1)));
      },
      lvfill: (b) => {
        const m = c.morceaux.find((x) => x.id === b.dataset.id); if (!m || !lv) return;
        const n = C.lvFillNext(ms, ms.indexOf(m), lvPageFor(c, m).page, lv.pages);
        saveCourse(c).then(() => scrCourse(cid));
        toast(n ? (n > 1 ? n + ' morceaux suivants réglés ✅' : 'Morceau suivant réglé ✅') : 'C\'est déjà la dernière page du livret.');
      },
      lvno: (b) => { const q = b.closest('.lvq'); if (q) q.classList.add('hide'); },
      link: (b) => linkMusic(c, b.dataset.id),
      cut: () => scrCut(c.id),
      redo: () => redoCut(c),
      addvid: async () => { await giveVideo(c); scrCourse(cid); },
      watch: () => scrWatch(c),
      rmvid: async () => {
        const r = await ask('Retirer la vidéo ?', 'La vidéo est retirée de l\'appli pour libérer ' + fmtSize(kept.size) + '. <b>Tes scripts, tes musiques et tes photos sont gardés.</b> Pour la revoir, tu devras la rechoisir.', [{ label: '🗑️ Oui, retirer la vidéo', value: 1, cls: 'red' }, { label: 'Non, la garder', value: 0, cls: 'sec' }]);
        if (!r) return; await deleteVideo(c.id); c.video.kept = null; if (S.videoFor === c.id) S.videoFor = null; await saveCourse(c); toast('Vidéo retirée ✅'); scrCourse(cid);
      },
      ren: async () => { const n = await askText('Nom de l\'édition', c.name, 'ex. Pump 100'); if (n) { c.name = n; await saveCourse(c); scrCourse(c.id); } },
      renm: async (b) => {
        const m = c.morceaux.find((x) => x.id === b.dataset.id); if (!m) return;
        if (!lv) { const n = await askText('Nom du morceau', m.name, 'ex. 04 dos / épaules'); if (n) { m.name = n; m.renamed = true; m.autoName = false; await saveCourse(c); scrCourse(c.id); } return; }
        const r = await morceauMenu(c, m); if (!r) return;
        if (r.name && r.name !== m.name) { m.name = r.name; m.renamed = true; m.autoName = false; }
        const changed = r.page !== lvPageFor(c, m).page || (lvPageFor(c, m).auto && r.touched);
        if (changed) m.lvPage = r.page;
        await saveCourse(c);
        if (changed && ms.indexOf(m) < ms.length - 1) {
          const f = await ask('Régler les suivants à la suite ?', 'Le morceau suivant aurait la page ' + (r.page + 1) + ', puis ' + (r.page + 2) + '… Tu pourras corriger à la main ensuite.', [{ label: 'Oui', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
          if (f) { const n = C.lvFillNext(ms, ms.indexOf(m), r.page, lv.pages); await saveCourse(c); if (n) toast((n > 1 ? n + ' morceaux suivants réglés' : 'Morceau suivant réglé') + ' ✅'); }
        }
        scrCourse(c.id);
      },
      mvf: async () => {
        const v = await ask('Dans quel dossier ?', '', S.folders.map((f) => ({ label: '📁 ' + f.name + (f.id === c.folder ? ' (actuel)' : ''), value: f.id, cls: f.id === c.folder ? 'sec' : '' })).concat([{ label: 'Annuler', value: null, cls: 'ghost' }]));
        if (!v || v === c.folder) return; const f = folderOf(v); c.folder = f.id; c.style = f.style; await saveCourse(c); toast('Rangée dans 📁 ' + f.name); scrCourse(cid);
      },
      del: async () => {
        const r = await ask('Supprimer cette édition ?', 'Ses scripts, ses photos et sa vidéo gardée seront effacés de ce téléphone.', [{ label: '🗑️ Oui, supprimer', value: 1, cls: 'red' }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return;
        for (const m of c.morceaux) { await ddel('data', 'po:' + m.id); await ddel('data', 'th:' + m.id); }
        for (const p of ph) await ddel('photos', p.id);
        await ddel('data', lvKey(c.id)); if (LV.cid === c.id) lvForget();
        await deleteVideo(c.id); await ddel('data', 'af:' + c.id); await ddel('courses', c.id); scrFolder(c.folder);
      }
    });
  }
  /** Menu ✏️ d'un morceau quand l'édition a un livret : son nom et sa page du livret. Renvoie { name, page, touched } ou null */
  function morceauMenu(c, m) {
    return new Promise((res) => {
      const r0 = lvPageFor(c, m); let page = r0.page, touched = false, done = false;
      const s = sheet('<h2>✏️ ' + esc(m.name) + '</h2><label class="lab" for="mmn">Nom du morceau</label><input type="text" id="mmn" value="' + esc(m.name) + '" placeholder="ex. 04 dos / épaules">' +
        '<label class="lab">📄 Page du livret</label><div class="stepper"><button data-sact="pm" data-d="-1" aria-label="Page d\'avant">−</button><b id="mmp">' + page + '</b><button data-sact="pm" data-d="1" aria-label="Page d\'après">+</button></div>' +
        '<p class="mute" id="mmh" style="text-align:center">' + (r0.auto ? 'Proposée (numéro du morceau + 1). Change-la si besoin.' : 'Sur ' + lvPages(c.livret.pages) + '.') + '</p>' +
        '<button class="btn" data-sact="ok">✅ Valider</button><button class="btn sec" data-sact="no">Annuler</button>', {
        pm: (b) => { page = C.lvClamp(page + (+b.dataset.d), c.livret.pages); touched = true; $('#mmp').textContent = page; $('#mmh').textContent = 'Sur ' + lvPages(c.livret.pages) + '.'; },
        ok: (b, e, close) => { done = true; const n = $('#mmn').value.trim(); close(); res({ name: n || m.name, page, touched }); },
        no: (b, e, close) => { done = true; close(); res(null); }
      }, () => { if (!done) res(null); });
      void s;
    });
  }
  /** Photos d'un morceau : en ajouter, les voir */
  async function photoMenu(c, m, back) {
    const list = await photosOf(m.id);
    const v = await ask('📷 ' + m.name, list.length ? list.length + ' photo(s) de ta feuille.' : 'Prends en photo ta feuille de script (ou choisis une photo).', (list.length ? [{ label: '👀 Voir ' + (list.length > 1 ? 'les photos' : 'la photo'), value: 'see' }] : []).concat([{ label: '📷 Photo de ma feuille', value: 'add', cls: list.length ? 'sec' : '' }, { label: 'Retour', value: null, cls: 'ghost' }]));
    if (v === 'add') { await addPhotos(c, m); }
    else if (v === 'see') await viewPhotos(list, 0, (p) => ddel('photos', p.id));
    back();
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
    await linkMusicFile(c, m, f);
    scrCourse(c.id);
  }
  /** Lie le fichier f (musique) au morceau m et le cale. Renvoie true si c'est fait. Le script du morceau n'est jamais touché. */
  async function linkMusicFile(c, m, f) {
    const mu = { id: uid(), name: f.name.replace(/\.[^.]+$/, ''), type: f.type, blob: f };
    render('<div class="card o"><h2>Je cale la musique…</h2><p class="soft">Quelques secondes.</p></div>');
    let r;
    try { r = await musicFeatures(mu); } catch (e) { toast('Je n\'arrive pas à lire ce fichier audio.'); return false; }
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
    await saveCourse(c);
    return true;
  }

  /* ======================= ✍️ Mon script (texte libre, 01/11) ======================= */
  const tcount = (m) => C.textCount(C.textOf(m));
  /** Mise en page propre d'un script (texte de Hamid) : lignes numérotées, nom en gras, répétitions en pastille, tempos en couleur */
  function scriptHtml(text) {
    const blocks = C.parseScript(text);
    if (!blocks.length) return '<p class="mute">Script pas encore écrit.</p>';
    const line = (p) => {
      let b;
      if (p.kind === 'move') {
        b = p.parts.map((x, i) => {
          const pre = i && x.t === 'tempo' ? '<span class="sdot"> · </span>' : i ? ' ' : '';
          return pre + (x.t === 'name' ? '<b class="snm">' + esc(x.s) + '</b>' : x.t === 'reps' ? '<span class="srep">' + esc(x.s) + '</span>' : x.t === 'tempo' ? '<span class="stp">' + esc(x.s) + '</span>' : '<span class="stx">' + esc(x.s) + '</span>');
        }).join('');
      } else b = esc(p.raw.trim());
      return '<div class="sl' + (p.kind === 'pause' ? ' pz' : '') + '"><span class="sn">' + p.n + '.</span><span class="sb">' + b + '</span></div>';
    };
    return blocks.map((bl) => '<div class="sblk">' + bl.map(line).join('') + '</div>').join('');
  }
  /* « ✍️ Mon script » (v10) : une petite case d'une ligne sous la vidéo ; Entrée ajoute la ligne à la fin du script.
     Le script se construit ligne par ligne dans une liste qui défile seule. Pendant l'écriture (clavier ouvert),
     la vidéo, ses boutons et la case restent fixes en haut de la partie visible de l'écran : la page ne bouge plus.
     Stockage inchangé : le texte libre du morceau (m.text), une ligne par entrée ; un séparateur « — » = une ligne vide. */
  async function scrWrite(cid, mid, opt) {
    S.wantAwake = false; keepAwake(false);
    const c = await dget('courses', cid); if (!c) return scrHome();
    const m = c.morceaux.find((x) => x.id === mid); if (!m) return goBack(cid);
    // v23 : ⏮ / ⏭ pour passer d'un morceau à l'autre de l'édition sans quitter l'écran
    const msAll = c.morceaux.filter((x) => !x.lost), mIdx = msAll.indexOf(m);
    const prevM = mIdx > 0 ? msAll[mIdx - 1] : null, nextM = mIdx >= 0 && mIdx < msAll.length - 1 ? msAll[mIdx + 1] : null;
    // v23 : « 🔇 Couper la voix du coach » : la vidéo se tait et la musique liée au morceau joue, calée sur la vidéo
    let mu = null; try { mu = m.musicId ? await dget('musics', m.musicId) : null; } catch (e) { mu = null; }
    if (mu && !mu.blob) mu = null;
    const sy = mu ? syncOf(m) : null;
    let au = null, auURL = null, auTick = null;
    if (!Array.isArray(m.lines)) m.lines = [];
    // ancien script (lignes) : converti en texte au premier affichage, l'ancien format reste gardé à côté
    if (typeof m.text !== 'string') { m.text = C.textOf(m); m.textOk = false; await saveCourse(c); }
    const url = await videoURL(c);
    const nPh = (await photosOf(m.id)).length;
    const hist = ((await dget('data', 'txh:' + m.id)) || []).filter((h) => h && String(h.text || '').trim());
    let editing = !(m.textOk && m.text.trim());
    const L = C.textToLines(m.text); // les lignes de la liste (le texte n'est réécrit qu'au premier changement)
    const fieldName = 'sm' + Math.random().toString(36).slice(2, 10); // nom au hasard : Chrome ne propose rien à remplir
    let mode = { k: 'add' }, menuAt = -1, delAsk = false, wmode = false, savedY = 0, tapT = 0, baseH = 0, kbSeen = false;
    const rel = (t) => fmt(Math.max(0, t - m.start));
    const v = () => $('#wv');
    const inp = () => $('#win');
    const lst = () => $('#wlist');
    const pane = () => $('#wpane');
    let left = false, saveT = null;
    const nums = () => C.lineNumbers(L);
    const lineName = (i) => { const n = nums()[i]; return n ? 'la ligne ' + n : 'le séparateur'; };
    /** Le texte du script suit la liste. Rien n'est écrit si rien n'a changé ; un script vide n'arrive que si Hamid a supprimé toutes les lignes. */
    const setText = () => {
      const t = C.linesToScript(L);
      if (t === m.text) return false;
      m.text = t; m.textOk = false; m.textAt = Date.now();
      if (!t.trim()) m.textCleared = true; else delete m.textCleared;
      return true;
    };
    /** Enregistre le script (tout de suite) */
    const save = async (force) => {
      if (!setText() && !force) return;
      await saveCourse(c);
      const s = $('#wsaved'); if (s) { s.textContent = 'Enregistré ✓'; s.classList.add('on'); }
    };
    /** Ce qui est encore dans la case (pas encore validé par Entrée) n'est pas perdu en quittant */
    const pending = () => { const e = inp(); if (e && e.value.trim()) commit(true); };
    /** Quitter l'écran : la vidéo s'arrête, le script et la position sont enregistrés tout de suite */
    const leave = async () => {
      pending();
      left = true; clearTimeout(saveT); S.flushWrite = null;
      exitType(true); detach(); voixStop();
      const x = v(); if (x) { x.pause(); if (x.readyState >= 1) m.lastT = Math.round(x.currentTime * 10) / 10; }
      setText();
      await saveCourse(c);
    };
    /* ---------- 🔇 voix du coach coupée : musique du morceau calée sur la vidéo ---------- */
    function voixLabel() { return S.wMute && mu ? '🔊 Remettre la voix du coach' : '🔇 Couper la voix du coach'; }
    /** Temps de la musique qui correspond au temps de la vidéo (calage de « 🎮 Jouer » ; sans calage : la musique commence au début du morceau) */
    const musicAt = (vt) => (sy ? C.videoToMusic(sy, vt) : vt - m.start);
    function voixSync(force) {
      const x = v(); if (!au) return;
      if (!x || !document.contains(x)) return voixStop();
      au.playbackRate = x.playbackRate / ((sy && sy.ratio) || 1);
      const mt = musicAt(x.currentTime);
      if (mt < 0 || (au.duration && mt >= au.duration - 0.05)) { if (!au.paused) au.pause(); return; }
      if (force || Math.abs(au.currentTime - mt) > 0.3) { try { au.currentTime = mt; } catch (e) { /* pas encore prête */ } }
      if (x.paused || x.seeking) { if (!au.paused) au.pause(); } else if (au.paused) au.play().catch(() => {});
    }
    function voixStop() {
      clearInterval(auTick); auTick = null;
      if (au) { try { au.pause(); au.removeAttribute('src'); au.load(); } catch (e) { /* rien */ } au = null; }
      if (auURL) { URL.revokeObjectURL(auURL); auURL = null; }
      const x = v(); if (x) x.muted = false;
    }
    function voixApply() {
      const x = v(), b = $('#wvoix');
      if (b) { b.textContent = voixLabel(); b.classList.toggle('on', !!(S.wMute && mu)); }
      if (!x) return;
      if (S.wMute && mu) {
        x.muted = true;
        if (!au) {
          auURL = URL.createObjectURL(mu.blob); au = new Audio(auURL); au.preload = 'auto';
          au.addEventListener('loadedmetadata', () => voixSync(true));
          auTick = setInterval(() => voixSync(false), 1000);
        }
        voixSync(true);
      } else voixStop();
    }
    const photoBtn = '<button class="btn sec small wbtn" data-act="photo">📷 ' + (nPh ? 'Photos (' + nPh + ')' : 'Photo de ma feuille') + '</button>' +
      (c.livret ? '<button class="btn sec small wbtn" data-act="lv">📄 Livret</button>' : ''); // (la barre est cachée pendant l'écriture, clavier ouvert)

    /* ---------- la liste ---------- */
    const menuHtml = (i) => '<div class="wmenu">' + (delAsk
      ? '<span class="wq">Supprimer ' + lineName(i) + ' ?</span><button data-act="lm" data-op="delok" class="red">🗑️ Oui, supprimer</button><button data-act="lm" data-op="delno">Non</button>'
      : '<button data-act="lm" data-op="mod" class="w2">✏️ Modifier</button><button data-act="lm" data-op="ins" class="w2">➕ Insérer avant</button>' +
        '<button data-act="lm" data-op="up"' + (i ? '' : ' disabled') + ' aria-label="Monter la ligne">⬆️</button><button data-act="lm" data-op="down"' + (i < L.length - 1 ? '' : ' disabled') + ' aria-label="Descendre la ligne">⬇️</button>' +
        '<button data-act="lm" data-op="del" class="w2">🗑️ Supprimer</button>') + '</div>';
    const listHtml = () => {
      if (!L.length) return '<p class="mute wempty">Ton script s\'affiche ici, ligne par ligne.</p>' +
        (hist.length ? '<div class="wrec"><p class="small">Un texte écrit avant est gardé dans l\'appli (' + C.textCount(hist[0].text) + ' lignes, ' + esc(fmtDate(hist[0].at)) + ').</p><button class="btn sec small" data-act="wrestore">↩️ Remettre ce texte</button></div>' : '');
      const N = nums();
      return L.map((l, i) => {
        const cls = 'wl' + (C.isSep(l) ? ' wsep' : '') + (C.parseLine(l).kind === 'pause' ? ' wpz' : '') + (i === menuAt ? ' on' : '') + (mode.k === 'edit' && mode.i === i ? ' ed' : '') + (mode.k === 'ins' && mode.i === i ? ' ins' : '');
        const row = '<div class="' + cls + '" data-act="line" data-i="' + i + '">' + (C.isSep(l) ? '<i class="whr" aria-label="Séparateur"></i>' : '<span class="wn">' + N[i] + '.</span><span class="wt">' + esc(l) + '</span>') + '</div>';
        return row + (i === menuAt ? menuHtml(i) : '');
      }).join('');
    };
    /** Fait défiler la liste elle-même (jamais la page) pour montrer la ligne i (ou la dernière) */
    const showLine = (i) => {
      const box = lst(); if (!box) return;
      if (i == null || i >= L.length - 1) { box.scrollTop = box.scrollHeight; return; }
      const r = box.querySelector('.wl[data-i="' + i + '"]'); if (!r) return;
      const mn = i === menuAt ? box.querySelector('.wmenu') : null;
      const top = r.offsetTop - box.offsetTop, bot = (mn ? mn.offsetTop + mn.offsetHeight : r.offsetTop + r.offsetHeight) - box.offsetTop;
      if (top < box.scrollTop) box.scrollTop = top - 4;
      else if (bot > box.scrollTop + box.clientHeight) box.scrollTop = bot - box.clientHeight + 4;
    };
    const paintList = (show) => { const b = lst(); if (!b) return; const y = b.scrollTop; b.innerHTML = listHtml(); b.scrollTop = y; showLine(show); };
    const modeHtml = () => {
      const t = mode.k === 'edit' ? 'Modification de ' + lineName(mode.i) : mode.k === 'ins' ? 'Insertion avant ' + lineName(mode.i) : '';
      return t ? '<span class="wmt">' + t + '</span><button data-act="wcancel" class="wcan">Annuler</button>' : '<span class="wmt"></span>';
    };
    const paintMode = () => {
      const e = $('#wmode'); if (!e) return;
      e.innerHTML = modeHtml(); e.classList.toggle('hide', mode.k === 'add');
      const fb = $('#wform .wclose'); if (fb) fb.classList.toggle('hide', !wmode);
      const i = inp(); if (i) i.placeholder = mode.k === 'edit' ? 'Corrige la ligne puis ↵' : 'Écris un mouvement puis ↵';
      layout();
    };
    const setMode = (k, i) => { mode = k === 'add' ? { k } : { k, i }; paintMode(); };
    /** Entrée (ou ➕) : ajoute la ligne à la fin, ou remplace / insère selon le mode. La case se vide et garde le clavier. */
    const commit = (quiet) => {
      const e = inp(); if (!e) return;
      let val = e.value.trim();
      if (!val) return;
      if (C.isSep(val)) val = C.SEP;
      let show, what;
      if (mode.k === 'edit' && mode.i < L.length) { L[mode.i] = val; show = mode.i; mode = { k: 'add' }; what = 'modifiée'; }
      else if (mode.k === 'ins' && mode.i < L.length) { L.splice(mode.i, 0, val); show = mode.i; mode = { k: 'ins', i: mode.i + 1 }; what = 'insérée'; }
      else { L.push(val); show = L.length - 1; mode = { k: 'add' }; what = 'ajoutée'; }
      e.value = ''; menuAt = -1; delAsk = false;
      if (quiet) { setText(); return; }
      const s = $('#wsaved'); if (s) { s.textContent = ''; s.classList.remove('on'); }
      paintList(show); paintMode(); save();
      okMsg(C.isSep(val) ? '✓ Séparateur ' + (what === 'modifiée' ? 'modifié' : what === 'insérée' ? 'inséré' : 'ajouté') : '✓ Ligne ' + nums()[show] + ' ' + what);
    };
    /** Petite confirmation discrète sous la case (1 seconde) */
    let okT = null;
    const okMsg = (t) => { const o = $('#wok'); if (!o) return; o.textContent = t; o.classList.add('on'); clearTimeout(okT); okT = setTimeout(() => { o.classList.remove('on'); }, 1000); };
    /* ---------- mode écriture (clavier ouvert) : tout est fixe en haut, seule la liste défile ---------- */
    const layout = () => {
      const p = pane(); if (!p) return;
      if (!wmode) return;
      const vv = window.visualViewport;
      const H = Math.round(vv ? vv.height : window.innerHeight), top = Math.round(vv ? vv.offsetTop : 0);
      p.style.top = top + 'px'; p.style.height = H + 'px'; // v11 : la liste est cachée, la vidéo prend toute la place qui reste (CSS)
    };
    const onVV = () => {
      if (!document.contains(pane())) return detach();
      const vv = window.visualViewport, h = vv ? vv.height : window.innerHeight;
      if (wmode && h < baseH * 0.8) kbSeen = true;
      // le clavier a été fermé (bouton Retour d'Android) alors que la case garde le curseur : retour à l'écran normal
      else if (wmode && kbSeen && h >= baseH - 60) return exitType();
      layout();
    };
    const attach = () => { const vv = window.visualViewport; if (vv) { vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV); } window.addEventListener('resize', onVV); };
    const detach = () => { const vv = window.visualViewport; if (vv) { vv.removeEventListener('resize', onVV); vv.removeEventListener('scroll', onVV); } window.removeEventListener('resize', onVV); };
    const enterType = () => {
      if (wmode || !editing) return;
      savedY = window.scrollY; wmode = true; kbSeen = false;
      baseH = Math.max(window.visualViewport ? window.visualViewport.height : 0, window.innerHeight);
      document.body.classList.add('wtyping');
      attach(); paintMode(); layout();
    };
    /** Sortie du mode écriture : l'écran normal revient (titre, photo, Valider) */
    function exitType(noScroll) {
      if (!wmode) return;
      wmode = false; detach();
      document.body.classList.remove('wtyping');
      const p = pane(); if (p) { p.style.top = ''; p.style.height = ''; }
      const e = inp(); if (e && document.activeElement === e) e.blur();
      paintMode();
      const bx = lst(); if (bx) bx.scrollTop = bx.scrollHeight; // la dernière ligne reste visible
      if (!noScroll) window.scrollTo(0, savedY);
    }
    const focusIn = () => { const e = inp(); if (!e) return; try { e.focus({ preventScroll: true }); const n = e.value.length; e.setSelectionRange(n, n); } catch (er) { /* rien */ } enterType(); };

    /* ---------- l'écran ---------- */
    const editHtml = () => editing
      ? '<form id="wform" class="wrow" autocomplete="off" action="#"><textarea id="win" name="' + fieldName + '" class="win" rows="1" wrap="off" enterkeyhint="enter" inputmode="text" autocomplete="off" autocorrect="off" spellcheck="false" autocapitalize="sentences" data-form-type="other" aria-label="Écris un mouvement" placeholder="Écris un mouvement puis ↵"></textarea><button type="submit" class="wadd" aria-label="Ajouter la ligne">➕</button><button type="button" data-act="wclose" class="wclose hide" aria-label="Fermer le clavier"><span>⌨️</span><span>Fermer</span></button></form>' +
        '<div id="wmode" class="wmode hide"></div><div id="wok" class="wok" aria-live="polite"></div>'
      : '';
    const footHtml = () => editing
      ? '<div class="wbar">' + photoBtn + '<span id="wsaved" class="wsaved"></span></div>' +
        '<button class="btn green" data-act="ok">✅ Valider mon script</button>'
      : '<div class="wbar"><span class="badge ok">✅ Script validé · ' + tcount(m) + ' ligne' + (tcount(m) > 1 ? 's' : '') + '</span>' + photoBtn + '</div>' +
        '<button class="btn" data-act="edit">✏️ Modifier</button>' +
        '<div class="row"><button class="btn sec small" data-act="play">🎮 Jouer</button><button class="btn sec small" data-act="read">📖 Lire</button></div>';
    const paint = () => {
      const ed = $('#wedit'), b = $('#wbody'), f = $('#wfoot'); if (!b) return;
      ed.innerHTML = editHtml(); f.innerHTML = footHtml();
      if (editing) { b.innerHTML = '<div id="wlist" class="wlist" aria-label="Mon script, ligne par ligne">' + listHtml() + '</div>'; showLine(null); }
      else b.innerHTML = '<div class="card sc" id="wsc">' + scriptHtml(m.text) + '</div>';
      const e = inp();
      if (e) {
        // ↵ : la ligne est enregistrée (case d'une ligne : un retour à la ligne n'est jamais écrit dans la case)
        e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.keyCode === 13) { ev.preventDefault(); setTimeout(() => commit(), 0); } });
        e.addEventListener('beforeinput', (ev) => { if (ev.inputType === 'insertLineBreak' || ev.inputType === 'insertParagraph') { ev.preventDefault(); setTimeout(() => commit(), 0); } });
        // filet de sécurité (claviers qui écrivent quand même le retour à la ligne, ou texte collé sur plusieurs lignes) : une ligne par entrée
        e.addEventListener('input', () => {
          if (!/[\r\n]/.test(e.value)) return;
          const parts = e.value.split(/\r?\n|\r/); const rest = parts.pop();
          for (const p of parts) { e.value = p; commit(); }
          e.value = rest;
        });
        $('#wform').addEventListener('submit', (ev) => { ev.preventDefault(); commit(); });
        e.addEventListener('focus', enterType);
        e.addEventListener('pointerdown', () => { if (!wmode) savedY = window.scrollY; });
        // le clavier se ferme (bouton Retour, toucher ailleurs) : retour à l'écran normal, sauf si on vient de toucher un bouton de la partie fixe
        e.addEventListener('blur', () => setTimeout(() => {
          if (left || !wmode || document.activeElement === inp()) return;
          const a = document.activeElement, p = pane();
          if (Date.now() - tapT < 700 && inp()) { try { inp().focus({ preventScroll: true }); } catch (er) { /* rien */ } return; }
          if (a && p && p.contains(a) && a !== document.body) return; // barre de temps : on reste en mode écriture
          exitType();
        }, 250));
        paintMode();
      }
    };
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>✍️ ' + esc(m.name) + '</h1></div>' +
      '<div class="wpane" id="wpane"><div class="wstick" id="wstick">' + (url ? '<video id="wv" src="' + url + '" playsinline preload="auto"></video>' +
        '<div class="vctl"><button data-act="b5" aria-label="Reculer de 5 secondes">⏪ 5</button><button data-act="pp" id="wpp" class="main" aria-label="Lecture ou pause">▶️</button><button data-act="f5" aria-label="Avancer de 5 secondes">5 ⏩</button>' +
        '<button data-act="spd" data-s="0.5">0,5×</button><button data-act="spd" data-s="0.75">0,75×</button><button data-act="spd" data-s="1" class="on">1×</button></div>' +
        '<div class="vtime"><b id="wt">0:00</b><input type="range" id="wr" min="0" max="' + Math.max(1, Math.round((m.end - m.start) * 10) / 10) + '" step="0.1" value="0" aria-label="Position dans le morceau"><span class="mute">' + fmt(m.end - m.start) + '</span></div>' +
        '<div class="wnav"><button data-act="prevm"' + (prevM ? '' : ' disabled') + '>⏮ Morceau précédent</button><button data-act="nextm"' + (nextM ? '' : ' disabled') + '>Morceau suivant ⏭</button>' +
        '<button data-act="voix" id="wvoix" class="wvoix">' + voixLabel() + '</button></div>' :
        '<div class="card j small" style="margin:0">🎬 La vidéo n\'est pas gardée dans l\'appli. Rechoisis-la pour écrire en la regardant (elle sera gardée).<button class="btn sec small" style="margin:8px 0 0" data-act="revid">🎬 Choisir la vidéo</button></div>') +
        '<div id="wedit"></div></div>' +
      '<div id="wbody"></div></div><div id="wfoot"></div>',
    {
      back: async () => { await leave(); goBack(cid); },
      prevm: async () => { if (!prevM) return; const x = v(), on = !!(x && !x.paused); await leave(); scrWrite(cid, prevM.id, { fromStart: true, play: on }); },
      nextm: async () => { if (!nextM) return; const x = v(), on = !!(x && !x.paused); await leave(); scrWrite(cid, nextM.id, { fromStart: true, play: on }); },
      voix: () => { if (!mu) { toast('Pas de musique liée à ce morceau'); return; } S.wMute = !S.wMute; voixApply(); },
      revid: async () => { await leave(); await giveVideo(c); scrWrite(cid, mid); },
      pp: () => { const x = v(); if (!x) return; if (x.paused) { if (x.currentTime >= m.end - 0.05) x.currentTime = m.start; x.play().catch(() => {}); } else x.pause(); },
      b5: () => { const x = v(); if (x) x.currentTime = Math.max(m.start, x.currentTime - 5); },
      f5: () => { const x = v(); if (x) x.currentTime = Math.min(m.end, x.currentTime + 5); },
      spd: (b) => { const x = v(); if (!x) return; x.playbackRate = +b.dataset.s; app.querySelectorAll('[data-act="spd"]').forEach((e) => e.classList.toggle('on', e === b)); },
      line: (b) => { const i = +b.dataset.i; delAsk = false; menuAt = menuAt === i ? -1 : i; paintList(i); },
      lm: (b) => {
        const i = menuAt, op = b.dataset.op; if (i < 0 || i >= L.length) return;
        const swap = (a, z) => { [L[a], L[z]] = [L[z], L[a]]; if (mode.k !== 'add') { if (mode.i === a) mode.i = z; else if (mode.i === z) mode.i = a; } menuAt = z; paintList(z); paintMode(); save(); };
        if (op === 'mod') { menuAt = -1; setMode('edit', i); const e = inp(); e.value = C.isSep(L[i]) ? '—' : L[i]; paintList(i); focusIn(); }
        else if (op === 'ins') { const wasEdit = mode.k === 'edit'; menuAt = -1; setMode('ins', i); const e = inp(); if (wasEdit) e.value = ''; paintList(i); focusIn(); }
        else if (op === 'up' && i > 0) swap(i, i - 1);
        else if (op === 'down' && i < L.length - 1) swap(i, i + 1);
        else if (op === 'del') { delAsk = true; paintList(i); }
        else if (op === 'delno') { delAsk = false; paintList(i); }
        else if (op === 'delok') {
          L.splice(i, 1); menuAt = -1; delAsk = false;
          if (mode.k === 'edit' && mode.i === i) { mode = { k: 'add' }; const e = inp(); if (e) e.value = ''; }
          else if (mode.k !== 'add' && mode.i > i) mode.i--;
          if (mode.k === 'ins' && mode.i >= L.length) mode = { k: 'add' };
          paintList(Math.min(i, L.length - 1)); paintMode(); save(); toast('Ligne supprimée');
        }
      },
      wcancel: () => { const was = mode.k; mode = { k: 'add' }; if (was === 'edit') { const e = inp(); if (e) e.value = ''; } paintList(); paintMode(); },
      wclose: () => exitType(),
      wrestore: () => { if (!hist.length) return; L.splice(0, L.length, ...C.textToLines(hist[0].text)); paintList(); save(); toast('Texte remis ✅'); },
      ok: async () => {
        pending(); exitType(true);
        await save(true);
        if (!m.text.trim()) { toast('Écris d\'abord ton script.'); return; }
        m.textOk = true; await saveCourse(c);
        editing = false; menuAt = -1; mode = { k: 'add' }; paint(); window.scrollTo(0, 0);
        toast('Script validé ✅');
      },
      edit: () => { editing = true; paint(); window.scrollTo(0, 0); },
      read: async () => { await leave(); scrRead(cid, mid); },
      play: async () => { await leave(); playFrom(cid, mid); },
      photo: async () => { await leave(); photoMenu(c, m, () => scrWrite(cid, mid)); },
      lv: () => { if (S.flushWrite) S.flushWrite(); viewLivret(c, lvPageFor(c, m).page); } // par-dessus l'écran : la vidéo et le script ne bougent pas
    });
    // les boutons de la partie fixe et la liste ne prennent pas le clavier à la case (le clavier reste ouvert)
    const pn = pane();
    pn.addEventListener('mousedown', (ev) => { if (wmode && ev.target.closest('button, .wl, video')) ev.preventDefault(); });
    pn.addEventListener('pointerdown', (ev) => { if (wmode && ev.target.closest('button:not(.wclose), .wl, video')) tapT = Date.now(); });
    paint();
    S.flushWrite = () => { if (!left) return save(); };
    const x = v();
    if (x) {
      const startAt = !(opt && opt.fromStart) && m.lastT != null && m.lastT >= m.start && m.lastT < m.end ? m.lastT : m.start;
      x.addEventListener('loadedmetadata', () => { x.currentTime = startAt; layout(); if (opt && opt.play) x.play().catch(() => {}); voixApply(); }, { once: true });
      for (const ev of ['play', 'pause', 'seeked', 'ratechange']) x.addEventListener(ev, () => voixSync(true));
      x.addEventListener('seeking', () => { if (au) au.pause(); });
      x.addEventListener('timeupdate', () => voixSync(false));
      x.addEventListener('timeupdate', () => {
        if (x.currentTime > m.end) { x.pause(); x.currentTime = m.end; }
        else if (x.currentTime < m.start - 0.3) x.currentTime = m.start;
        const t = $('#wt'); if (t) t.textContent = rel(x.currentTime);
        const r = $('#wr'); if (r && !r.dragging) r.value = Math.max(0, x.currentTime - m.start);
        clearTimeout(saveT); saveT = setTimeout(() => {
          if (left || !document.contains(x)) return; // on a quitté l'écran : ne rien écraser
          m.lastT = Math.round(x.currentTime * 10) / 10; saveCourse(c);
        }, 1500);
      });
      x.addEventListener('play', () => { const b = $('#wpp'); if (b) b.textContent = '⏸️'; S.wantAwake = true; keepAwake(true); });
      x.addEventListener('pause', () => { const b = $('#wpp'); if (b) b.textContent = '▶️'; });
      const r = $('#wr');
      r.addEventListener('input', () => { r.dragging = true; x.currentTime = m.start + (+r.value); const t = $('#wt'); if (t) t.textContent = rel(m.start + (+r.value)); });
      r.addEventListener('change', () => { r.dragging = false; });
    }
    window.SM_WRITE = { c, m, video: x, lines: L, save, get wmode() { return wmode; } };
  }

  /** Renommer un mouvement partout (scripts, vocabulaire) */
  async function renameEverywhere(style, oldName, newName, currentCourse) {
    S.vocab[style] = S.vocab[style] || {};
    const base = Object.keys(S.vocab[style]).find((k) => S.vocab[style][k] === oldName) || ((C.MOVES[style] || []).includes(oldName) ? oldName : null);
    if (base) S.vocab[style][base] = newName;
    else S.vocab[style][oldName] = newName;
    await saveKV('vocab');
    S.prints.forEach((p) => { if (p.style === style && p.name === oldName) p.name = newName; }); await saveKV('prints');
    if (S.customMoves[style]) { S.customMoves[style] = Array.from(new Set(S.customMoves[style].map((n) => (n === oldName ? newName : n)))); await saveKV('customMoves'); }
    if (S.favs[style]) { for (const k in S.favs[style]) S.favs[style][k] = Array.from(new Set(S.favs[style][k].map((n) => (n === oldName ? newName : n)))); await saveKV('favs'); }
    const all = await dall('courses');
    for (const c of all) {
      if (c.style !== style) continue; let ch = false;
      for (const m of c.morceaux) {
        for (const s of m.segments || []) if (s.name === oldName) { s.name = newName; ch = true; }
        for (const l of m.lines || []) if (l.name === oldName) { l.name = newName; ch = true; }
      }
      if (ch) {
        if (currentCourse && c.id === currentCourse.id) { for (const m of currentCourse.morceaux) for (const l of m.lines || []) if (l.name === oldName) l.name = newName; await saveCourse(currentCourse); }
        else await saveCourse(c);
      }
    }
    toast('« ' + oldName + ' » s\'appelle maintenant « ' + newName + ' » partout.', 3500);
  }

  /* ======================= Script : lecture, texte, PDF ======================= */
  /** Texte à copier : le texte brut de Hamid, morceau par morceau */
  /** o (🔀 mix, facultatif) : { title, head(m, i) } à la place du nom de l'édition et du numéro du morceau */
  function scriptText(c, ms, o) {
    const all = c ? c.morceaux.filter((m) => !m.lost) : [];
    ms = ms || all;
    const out = [o ? o.title : c.name + ' (' + styleName(c.style) + ')', ''];
    ms.forEach((m, i) => {
      out.push(o ? o.head(m, i) : (all.indexOf(m) + 1) + '. ' + m.name);
      const t = C.textOf(m).replace(/\s+$/, '');
      out.push(t.trim() ? t : '(script pas encore écrit)');
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
  /** o (🔀 mix, facultatif) : { title, sub, headHtml(m, i) } */
  function printCourse(c, ms, o) {
    const all = c ? c.morceaux.filter((m) => !m.lost) : [];
    ms = ms || all;
    const title = o ? o.title : c.name;
    $('#print').innerHTML = '<h1>' + esc(title) + '</h1><p class="sub">' + (o ? esc(o.sub) : esc(styleName(c.style)) + ' · ' + fmtDate(c.created)) + ' · ScriptMove</p>' +
      ms.map((m, i) => '<section><h2>' + (o ? o.headHtml(m, i) : (all.indexOf(m) + 1) + '. ' + esc(m.name)) + '</h2>' + (tcount(m) ? '<div class="sc">' + scriptHtml(C.textOf(m)) + '</div>' : '<p class="t">(script pas encore écrit)</p>') + '</section>').join('');
    const old = document.title; document.title = title.replace(/[\\/:*?"<>|]/g, '-');
    setTimeout(() => { window.print(); document.title = old; }, 50);
    toast('Dans la fenêtre d\'impression, choisis « Enregistrer en PDF ».', 4000);
  }
  const readList = (m) => '<div class="sc">' + scriptHtml(C.textOf(m)) + '</div>';
  async function scrRead(cid, mid) {
    const c = await dget('courses', cid); const m = c && c.morceaux.find((x) => x.id === mid); if (!m) return goBack(cid);
    const nPh = (await photosOf(mid)).length;
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>📖 ' + esc(m.name) + '</h1></div><p class="mute">' + esc(c.name) + (tcount(m) ? ' · ' + (m.textOk ? '✅ validé' : 'pas encore validé') : '') + '</p>' +
      '<div class="card">' + readList(m) + '</div>' +
      '<div class="row"><button class="btn" data-act="write">✍️ Modifier</button><button class="btn sec" data-act="play">🎮 Jouer</button></div>' +
      '<div class="row"><button class="btn sec" data-act="copy">📋 Copier le texte</button><button class="btn sec" data-act="pdf">🖨️ PDF</button></div>' +
      '<button class="btn sec" data-act="photo">📷 ' + (nPh ? 'Photos de ma feuille (' + nPh + ')' : 'Photo de ma feuille') + '</button>' +
      (c.livret ? '<button class="btn sec" data-act="lv">📄 Livret (page ' + lvPageFor(c, m).page + ')</button>' : ''),
    { back: () => goBack(cid), write: () => scrWrite(cid, mid), play: () => playFrom(cid, mid), copy: () => copyText(scriptText(c, [m])), pdf: () => printCourse(c, [m]), photo: () => photoMenu(c, m, () => scrRead(cid, mid)), lv: () => viewLivret(c, lvPageFor(c, m).page) });
  }
  async function scrCourseScript(cid) {
    const c = await dget('courses', cid);
    const ms = c.morceaux.filter((m) => !m.lost);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Script de l\'édition</h1></div><p class="soft">' + esc(c.name) + '</p>' +
      ms.map((m, i) => '<div class="card ' + (tcount(m) ? 'g' : '') + '"><h2>' + (i + 1) + '. ' + esc(m.name) + '</h2>' + readList(m) +
        '<button class="btn sec small" style="margin-top:10px" data-act="open" data-id="' + m.id + '">✍️ ' + (tcount(m) ? 'Modifier' : 'Écrire') + '</button></div>').join('') +
      '<div class="row"><button class="btn sec" data-act="copy">📋 Copier le texte</button><button class="btn" data-act="pdf">🖨️ PDF</button></div>',
    { back: () => scrCourse(cid), copy: () => copyText(scriptText(c)), pdf: () => printCourse(c), open: (b) => scrWrite(cid, b.dataset.id) });
  }

  /* ======================= Jeu de danse (texte validé, ligne par ligne) ======================= */
  async function scrPlay(cid, mid, opt) {
    // 🔀 depuis un mix : opt.mix = id du mix, opt.pos = place dans le mix ; ⏮️ / ⏭️ suivent l'ordre du mix (par place : un morceau peut y être 2 fois)
    const mixId = opt && opt.mix && mixOf(opt.mix) ? opt.mix : null, mixPos = mixId ? (opt.pos | 0) : -1;
    if (mixId) S.mixBack = { id: mixId, pos: mixPos };
    const backTo = () => (mixId ? scrMix(mixId, mixPos) : scrCourse(cid));
    const c = await dget('courses', cid); if (!c) { if (opt && opt.old) opt.old.remove(); return mixId ? backTo() : scrHome(); }
    const m = c.morceaux.find((x) => x.id === mid); if (!m) { if (opt && opt.old) opt.old.remove(); return backTo(); }
    const musicOnly = !(m.textOk && tcount(m)) && !!m.musicId; // pas encore de script : on écoute juste la musique
    if (!musicOnly && !tcount(m)) { toast('Écris d\'abord ton script (✍️ Mon script).', 3500); return scrWrite(cid, mid); }
    if (!musicOnly && !m.textOk) { toast('Valide d\'abord ton script (✅ Valider mon script).', 3500); return scrWrite(cid, mid); }
    let nextM, prevM;
    if (mixId) {
      const R = C.mixResolve(mixOf(mixId).items, await dall('courses'), S.folders), nv = C.mixNav(R, mixPos);
      nextM = nv.next != null ? R[nv.next] : null; prevM = nv.prev != null ? R[nv.prev] : null;
    } else {
      const ms = c.morceaux.filter((x) => !x.lost && ((x.textOk && tcount(x)) || x.musicId));
      nextM = ms[ms.indexOf(m) + 1];
      prevM = ms.indexOf(m) > 0 ? ms[ms.indexOf(m) - 1] : null;
    }
    const mu = m.musicId ? await dget('musics', m.musicId) : null;
    const photos = await photosOf(mid);
    let keep = opt && opt.choice && (opt.choice !== 'music' || mu) ? opt.choice : null;
    if (musicOnly && mu) keep = 'music';
    if (musicOnly && !mu) { toast('La musique de ce morceau est introuvable.', 3500); if (opt && opt.old) opt.old.remove(); return backTo(); }
    if (!keep && opt && opt.old) { opt.old.remove(); opt.old = null; } // pas de musique liée : on revient à la question habituelle
    const choice = keep || await ask(m.name, mu ? '🎵 ' + esc(mu.name) : 'Pas de musique liée à ce morceau.', (mu ? [{ label: '▶️ Jouer avec ma musique', value: 'music' }] : [{ label: '🎵 Lier une musique', value: 'link' }])
      .concat([{ label: '🎬 Top départ (la musique joue ailleurs)', value: 'top', cls: 'sec' }, { label: 'Retour', value: null, cls: 'ghost' }]));
    if (!choice) return backTo();
    if (choice === 'link') return linkMusic(c, m.id);
    const bpm = (mu && mu.bpm) || m.bpm || null;
    let L = [];
    if (musicOnly) L = [{ n: 1, raw: '🎵 ' + mu.name, kind: 'music', dur: null }];
    else try { L = C.textPlayLines(C.textOf(m), bpm); } catch (e) { console.warn(e); L = C.textOf(m).split('\n').filter((x) => x.trim()).map((x, i) => ({ n: i + 1, raw: x.trim(), kind: 'text', dur: null })); }
    if (!L.length) { toast('Écris d\'abord ton script (✍️ Mon script).', 3500); return scrWrite(cid, mid); }
    const auto = L.some((l) => l.dur);
    const how = musicOnly ? '🎧 Musique seule : pas encore de script pour ce morceau.' : auto ? '🥁 Les lignes reconnues avancent au tempo (' + Math.round(bpm) + ' BPM). Les autres : touche l\'écran.' : '👆 Touche l\'écran pour passer à la ligne suivante.';
    const P = { mode: choice, started: false, paused: true, ref: 0, pausedAt: 0, audio: null, raf: 0, idx: 0, lineStart: auto && mu ? (mu.attack || 0) : 0 };
    if (choice === 'music') { P.url = URL.createObjectURL(mu.blob); P.audio = new Audio(P.url); P.audio.preload = 'auto'; }
    S.wantAwake = true; keepAwake(true);
    const el = document.createElement('div'); el.className = 'play';
    el.innerHTML = '<div class="ph"><h3>' + (mixId ? (mixPos + 1) + '. ' : '') + esc(m.name) + '</h3>' + (photos.length ? '<button data-p="photo" aria-label="Voir la photo de ma feuille">📷</button>' : '') + (c.livret ? '<button data-p="lv" aria-label="Voir mon livret">📄</button>' : '') + '<button data-p="close" aria-label="Fermer">✖</button></div>' +
      '<div class="main" data-p="tap"><div class="nx" id="pbefore"></div><div class="pnum" id="pnum"></div><div class="mv" id="pmv"></div><div class="cnt" id="pcnt"></div><div class="tempo" id="ptp"></div><div class="nx" id="pnote"></div><div class="phint" id="phint"></div></div>' +
      '<div class="nx" id="pnx" style="text-align:center"></div><div class="pseek" id="pseek"><div class="bar"><i id="pbar"></i></div><b class="pknob" id="pknob"></b></div><div class="ptime" id="ptime"></div>' +
      '<div class="ctl"><button data-p="prevm" aria-label="Musique précédente"' + (prevM ? '' : ' disabled style="opacity:.35"') + '>⏮️</button><button class="main" data-p="pp" id="ppp">▶️</button><button data-p="nextm" aria-label="Musique suivante"' + (nextM ? '' : ' disabled style="opacity:.35"') + '>⏭️</button></div>' +
      (auto ? '<div class="adj"><button data-p="early">⏪ un peu avant</button><span id="pshift"></span><button data-p="late">un peu après ⏩</button></div>' : '') +
      '<p class="mute" style="text-align:center;margin:8px 0 0">' + how + '</p>' +
      (nextM ? '<button class="btn sec small" style="margin:10px 0 0" data-p="nextm">Morceau suivant ➡️</button>' : '');
    document.body.appendChild(el);
    if (opt && opt.old) opt.old.remove(); // changement de musique : l'ancien écran reste jusqu'à ce que le nouveau soit prêt
    const musicT = () => {
      if (P.mode === 'music') return P.audio.currentTime;
      return P.paused ? P.pausedAt : (performance.now() - P.ref) / 1000;
    };
    const setMusicT = (t) => {
      t = Math.max(0, t);
      if (P.mode === 'music') P.audio.currentTime = t;
      else if (P.paused) P.pausedAt = t; else P.ref = performance.now() - t * 1000;
    };
    const now = () => musicT() + (auto ? (m.shift || 0) : 0);
    const shiftTxt = () => { const e = $('#pshift', el); if (!e) return; const s = m.shift || 0; e.textContent = 'réglage ' + (s > 0 ? '+' : s < 0 ? '−' : '') + Math.abs(s).toFixed(2).replace('.', ',') + ' s'; };
    shiftTxt();
    const big = (l) => (l.kind === 'move' && l.name ? l.name : l.raw);
    let lastKey = '', lastTT = '';
    const totalT = () => {
      if (P.mode === 'music' && P.audio && isFinite(P.audio.duration) && P.audio.duration > 0) return P.audio.duration;
      if (mu && mu.duration) return mu.duration;
      const d = (m.end || 0) - (m.start || 0); return d > 0 ? d : 0;
    };
    const tick = () => {
      try {
        const t = now();
        if (P.started && !P.paused) {
          // au tempo : on passe à la ligne suivante quand la durée estimée est finie (jamais sur une ligne « au toucher »)
          while (P.idx < L.length && L[P.idx].dur && t >= P.lineStart + L[P.idx].dur) { P.lineStart += L[P.idx].dur; P.idx++; }
        }
        let mv = '', cnt = '', tp = '', nx = '', bef = '', note = '', num = '', hint = '', frac = 0, pz = false;
        const l = L[P.idx], n2 = L[P.idx + 1];
        if (musicOnly) { mv = mu.name; hint = P.started ? '' : 'Touche ▶️ pour écouter'; nx = ''; }
        else if (!P.started) { mv = P.mode === 'top' ? 'Touche ▶️ au début de la musique' : 'Touche ▶️ pour commencer'; nx = 'Première ligne : ' + L[0].raw; }
        else if (!l) { mv = 'Bravo ! 🎉'; nx = 'Morceau terminé'; frac = 1; }
        else {
          num = l.n + ' / ' + L[L.length - 1].n; mv = big(l); tp = l.tempoTxt || ''; pz = l.kind === 'pause';
          note = (l.parts || []).filter((x) => x.t === 'txt').map((x) => x.s).join(' · ');
          if (l.kind !== 'move') note = '';
          if (l.dur && t < P.lineStart) { bef = 'Prépare-toi'; cnt = Math.ceil(P.lineStart - t) + '<small> s</small>'; }
          else if (l.dur) { const k = Math.min(l.reps, Math.floor((t - P.lineStart) / l.repDur) + 1); cnt = Math.max(1, k) + '<small> / ' + l.reps + '</small>'; frac = (t - P.lineStart) / l.dur; }
          else { if (l.reps) cnt = '<small>× </small>' + l.reps; hint = '👆 Touche l\'écran pour la suite'; }
          nx = n2 ? 'Ensuite : ' + n2.raw + (l.dur && t >= P.lineStart ? ' · dans ' + Math.max(0, Math.ceil(P.lineStart + l.dur - t)) + ' s' : '') : 'Dernière ligne';
        }
        const key = [mv, cnt, tp, nx, bef, note, num, hint, pz].join('|');
        if (key !== lastKey) {
          lastKey = key; const e = $('#pmv', el); e.textContent = mv; e.classList.toggle('long', mv.length > 22); e.classList.toggle('pz', pz);
          $('#pcnt', el).innerHTML = cnt; $('#ptp', el).textContent = tp; $('#pnx', el).textContent = nx; $('#pbefore', el).textContent = bef; $('#pnote', el).textContent = note ? '📝 ' + note : ''; $('#pnum', el).textContent = num; $('#phint', el).textContent = hint;
        }
        { // barre : avance avec la musique, du début à la fin du morceau
          const mt = P.drag != null ? P.drag : musicT(); const D = totalT();
          const pc = (D ? Math.max(0, Math.min(1, mt / D)) * 100 : 0).toFixed(2) + '%';
          $('#pbar', el).style.width = pc; $('#pknob', el).style.left = pc;
          const tt = fmt(mt) + (D ? ' / ' + fmt(D) : '');
          if (tt !== lastTT) { lastTT = tt; $('#ptime', el).textContent = tt; }
        }
        if (P.mode === 'music' && P.started && P.audio.ended && !P.paused) { P.paused = true; $('#ppp', el).textContent = '▶️'; }
      } catch (e) { console.warn('jeu', e); }
      P.raf = requestAnimationFrame(tick);
    };
    const play = async () => {
      if (P.mode === 'music') { try { await P.audio.play(); } catch (e) { toast('Le son ne peut pas démarrer.'); return; } }
      else P.ref = performance.now() - P.pausedAt * 1000;
      if (!P.started && !L[0].dur) P.lineStart = now();
      P.paused = false; P.started = true; $('#ppp', el).textContent = '⏸️';
    };
    const pause = () => { if (P.mode === 'music') P.audio.pause(); else P.pausedAt = musicT(); P.paused = true; $('#ppp', el).textContent = '▶️'; };
    /** Ligne suivante / précédente (au toucher) */
    const go = (d) => {
      if (!P.started) { play(); return; }
      P.idx = Math.max(0, Math.min(L.length, P.idx + d)); P.lineStart = now();
    };
    let saveT = null;
    const adj = (d) => { m.shift = Math.round(((m.shift || 0) + d) * 100) / 100; shiftTxt(); clearTimeout(saveT); saveT = setTimeout(() => saveCourse(c), 600); };
    const stop = () => { cancelAnimationFrame(P.raf); if (P.audio) { P.audio.pause(); URL.revokeObjectURL(P.url); } };
    const close = () => { stop(); el.remove(); S.wantAwake = false; keepAwake(false); };
    const swap = (m2) => {
      stop(); el.style.pointerEvents = 'none'; saveCourse(c);
      if (mixId) scrPlay(m2.cid, m2.mid, { choice: P.mode, auto: true, old: el, mix: mixId, pos: m2.pos });
      else scrPlay(cid, m2.id, { choice: P.mode, auto: true, old: el });
    };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      const a = b.dataset.p;
      if (a === 'close') { close(); saveCourse(c); backTo(); }
      else if (a === 'pp') { P.paused ? play() : pause(); }
      else if (a === 'tap') { if (musicOnly) { P.paused ? play() : pause(); } else go(1); }
      else if (a === 'early') adj(0.25); else if (a === 'late') adj(-0.25);
      else if (a === 'photo') viewPhotos(photos.slice(), 0, null);
      else if (a === 'lv') viewLivret(c, lvPageFor(c, m).page);
      else if (a === 'nextm' && nextM) swap(nextM);
      else if (a === 'prevm' && prevM) swap(prevM);
    });
    { // glisser le doigt sur la barre : avancer / reculer dans la musique (le script ne bouge pas)
      const sk = $('#pseek', el);
      const at = (e) => { const r = sk.getBoundingClientRect(); const D = totalT(); return D ? Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * D : 0; };
      sk.addEventListener('pointerdown', (e) => { if (!totalT()) return; e.preventDefault(); try { sk.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } P.drag = at(e); });
      sk.addEventListener('pointermove', (e) => { if (P.drag != null) P.drag = at(e); });
      const end = (e) => {
        if (P.drag == null) return; const t = e.type === 'pointercancel' ? P.drag : at(e); P.drag = null;
        const d = t - musicT(); setMusicT(t); P.lineStart += d; // la ligne en cours reste la même
      };
      sk.addEventListener('pointerup', end); sk.addEventListener('pointercancel', end);
    }
    window.SM_PLAY = { P, el, musicT, setMusicT, lines: L, auto }; // pour les tests
    tick();
    if (choice === 'music' && (musicOnly || (keep && opt && opt.auto))) play();
  }

  /* ======================= 🔀 Mes mix (01/11) =======================
     Un mix = une liste ordonnée de RÉFÉRENCES { cid, mid } vers des morceaux qui existent déjà (rien n'est recopié).
     Rangés à part (kv 'mixes') : enlever ou supprimer un mix ne touche jamais aux éditions, scripts, musiques, vidéos ni photos. */
  const saveMixes = () => dput('kv', S.mixes.concat(S.mixesOld || []), 'mixes');
  const plural = (n, a, b) => n + ' ' + (n > 1 ? b : a);
  async function newMix() {
    const name = await askText('Nom du nouveau mix', '', 'ex. Cours mélangé 1 h'); if (!name) return;
    const how = await ask('Comment commencer ?', '« ' + esc(name) + ' »', [{ label: '📁 Partir d\'une édition', value: 'ed' }, { label: '➕ Mix vide', value: 'empty', cls: 'sec' }, { label: 'Annuler', value: null, cls: 'ghost' }]);
    if (!how) return;
    if (how === 'empty') return createMix(name, []);
    scrPickCourse(name);
  }
  async function createMix(name, items) {
    const x = { id: 'mx_' + uid(), name, created: Date.now(), items };
    S.mixes.push(x); await saveMixes(); toast('Mix créé ✅'); scrMix(x.id);
  }
  /** Écran : choisir l'édition de départ d'un nouveau mix */
  async function scrPickCourse(name) {
    const courses = await dall('courses');
    const groups = S.folders.map((f) => ({ f, list: C.sortEditions(courses.filter((c) => c.folder === f.id)) })).filter((g) => g.list.length);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Partir d\'une édition</h1></div>' +
      '<p class="soft">Le mix « ' + esc(name) + ' » reprend tous les morceaux de l\'édition choisie, dans l\'ordre. Rien n\'est recopié : ce sont les mêmes morceaux.</p>' +
      (groups.length ? groups.map((g) => '<h2 style="margin-top:14px">📁 ' + esc(g.f.name) + '</h2>' + g.list.map((c) => {
        const n = c.morceaux.filter((m) => !m.lost).length;
        return '<button class="seg" data-act="pick" data-id="' + esc(c.id) + '"><span class="t"><b>' + esc(c.name) + '</b><span class="mute">' + plural(n, 'morceau', 'morceaux') + '</span></span><span style="font-size:24px">›</span></button>';
      }).join('')).join('') : '<div class="card"><p class="soft">Tu n\'as encore aucune édition.</p></div>'),
    {
      back: () => scrMixes(),
      pick: async (b) => { const c = await dget('courses', b.dataset.id); if (c) createMix(name, C.mixFromCourse(c)); }
    });
  }
  /** Écran « 🔀 Mes mix » : la liste des mix */
  async function scrMixes() {
    S.wantAwake = false; keepAwake(false); S.mixBack = null;
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>🔀 Mes mix</h1></div>' +
      '<p class="soft small">Un mix, c\'est ton cours à toi : des morceaux pris dans n\'importe quelles éditions, dans l\'ordre que tu veux. Les morceaux gardent leur script, leur musique et leur vidéo.</p>' +
      '<button class="btn" data-act="new">➕ Nouveau mix</button>' +
      (S.mixes.length ? S.mixes.map((x) => '<div class="mixrow"><button class="seg" data-act="open" data-id="' + esc(x.id) + '"><span class="n">🔀</span><span class="t"><b>' + esc(x.name) + '</b><span class="mute">' + plural(x.items.length, 'morceau', 'morceaux') + '</span></span></button>' +
        '<button class="ib" data-act="ren" data-id="' + esc(x.id) + '" aria-label="Renommer ce mix">✏️</button><button class="ib" data-act="del" data-id="' + esc(x.id) + '" aria-label="Supprimer ce mix">🗑️</button></div>').join('')
        : '<div class="card"><p class="soft">Tu n\'as pas encore de mix.</p><p class="mute">Touche « ➕ Nouveau mix ».</p></div>'),
    {
      back: () => scrHome(),
      new: () => newMix(),
      open: (b) => scrMix(b.dataset.id),
      ren: async (b) => { const x = mixOf(b.dataset.id); if (!x) return; const n = await askText('Nom du mix', x.name); if (n) { x.name = n; await saveMixes(); scrMixes(); } },
      del: async (b) => { if (await delMix(b.dataset.id)) scrMixes(); }
    });
  }
  async function delMix(id) {
    const x = mixOf(id); if (!x) return false;
    const r = await ask('Supprimer ce mix ?', '« ' + esc(x.name) + ' »<br><b>Tes morceaux, tes scripts, tes musiques et tes vidéos restent dans leurs éditions.</b> Seule la liste du mix est supprimée.', [{ label: '🗑️ Oui, supprimer le mix', value: 1, cls: 'red' }, { label: 'Non, garder', value: 0, cls: 'sec' }]);
    if (!r) return false;
    S.mixes = S.mixes.filter((y) => y.id !== id); await saveMixes(); toast('Mix supprimé'); return true;
  }
  /** Les morceaux d'un mix retrouvés dans les éditions (+ les musiques) */
  async function mixData(x) {
    const courses = await dall('courses');
    const musics = {}; for (const m of await dall('musics')) musics[m.id] = { id: m.id, name: m.name, duration: m.duration };
    return { courses, musics, R: C.mixResolve(x.items, courses, S.folders) };
  }
  const mixPrintOpts = (x, okR) => ({
    title: x.name, sub: '🔀 Mix · ' + plural(okR.length, 'morceau', 'morceaux'),
    head: (m, i) => (i + 1) + '. ' + m.name + '  (' + okR[i].from + ')',
    headHtml: (m, i) => (i + 1) + '. ' + esc(m.name) + ' <span class="t">— ' + esc(okR[i].from) + '</span>'
  });
  /** Écran d'un mix */
  async function scrMix(id, pos) {
    S.wantAwake = false; keepAwake(false); S.mixBack = null;
    const x = mixOf(id); if (!x) return scrMixes();
    const { musics, R } = await mixData(x);
    const okR = R.filter((r) => r.ok);
    const dur = C.mixDuration(R, musics);
    const n = x.items.length;
    const card = (r) => {
      const i = r.pos, arrows = '<div class="row tight"><button class="btn sec small" data-act="up" data-i="' + i + '"' + (i ? '' : ' disabled') + ' aria-label="Monter">⬆️</button><button class="btn sec small" data-act="down" data-i="' + i + '"' + (i < n - 1 ? '' : ' disabled') + ' aria-label="Descendre">⬇️</button><button class="btn sec small" data-act="rm" data-i="' + i + '">✖ Enlever</button></div>';
      if (!r.ok) return '<div class="card mrc lost" id="mx' + i + '"><h2>' + (i + 1) + '. Morceau introuvable</h2><p class="mute">Son édition ou ce morceau a été supprimé.</p>' +
        '<button class="btn sec small" data-act="rep" data-i="' + i + '">🔁 Remplacer</button><button class="btn sec small" data-act="rm" data-i="' + i + '">✖ Enlever</button></div>';
      const m = r.m, has = tcount(m) > 0, mu = m.musicId && musics[m.musicId];
      return '<div class="card mrc ' + (has ? 'g' : 'o') + '" id="mx' + i + '"><h2>' + (i + 1) + '. ' + esc(m.name) + '</h2>' +
        '<p class="mute" style="margin:0 0 6px">📁 ' + esc(r.from) + '</p>' +
        '<p style="margin:0 0 6px">' + scriptState(m, 0) + '</p>' +
        '<p class="mute">' + (mu ? '🎵 ' + esc(mu.name) + ' ✅' : 'Pas de musique liée') + ' · ⏱️ ' + fmt(C.morceauDur(m, musics)) + '</p>' +
        '<button class="btn small" data-act="write" data-i="' + i + '">✍️ Mon script</button>' +
        '<div class="row tight">' + (C.playableM(m) ? '<button class="btn sec small" data-act="play" data-i="' + i + '">🎮 Jouer</button>' : '') + (has ? '<button class="btn sec small" data-act="read" data-i="' + i + '">📖 Lire</button>' : '') +
        '<button class="btn sec small" data-act="rep" data-i="' + i + '">🔁 Remplacer</button></div>' + arrows + '</div>';
    };
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>🔀 ' + esc(x.name) + '</h1><button class="back" data-act="ren" aria-label="Renommer le mix">✏️</button></div>' +
      '<div class="card j"><b>⏱️ Durée du cours : ' + fmtDur(dur) + '</b><br><span class="mute">' + plural(n, 'morceau', 'morceaux') + (okR.length < n ? ' · ' + (n - okR.length) + ' introuvable' + (n - okR.length > 1 ? 's' : '') : '') + '</span></div>' +
      (n ? R.map(card).join('') : '<div class="card"><p class="soft">Ton mix est vide.</p><p class="mute">Touche « ➕ Ajouter un morceau ».</p></div>') +
      '<button class="btn" data-act="add">➕ Ajouter un morceau</button>' +
      (okR.length ? '<div class="row"><button class="btn sec" data-act="script">📖 Script du mix</button><button class="btn sec" data-act="pdf">🖨️ PDF</button></div>' : '') +
      '<button class="btn ghost small" data-act="del">🗑️ Supprimer ce mix</button>',
    {
      back: () => scrMixes(),
      ren: async () => { const v = await askText('Nom du mix', x.name); if (v) { x.name = v; await saveMixes(); scrMix(id); } },
      write: (b) => { const r = R[+b.dataset.i]; if (!r || !r.ok) return; S.mixBack = { id, pos: r.pos }; scrWrite(r.cid, r.mid); },
      read: (b) => { const r = R[+b.dataset.i]; if (!r || !r.ok) return; S.mixBack = { id, pos: r.pos }; scrRead(r.cid, r.mid); },
      play: (b) => { const r = R[+b.dataset.i]; if (!r || !r.ok) return; S.mixBack = { id, pos: r.pos }; scrPlay(r.cid, r.mid, { mix: id, pos: r.pos }); },
      rep: (b) => scrPickMorceau(id, +b.dataset.i),
      add: () => scrPickMorceau(id, -1),
      up: async (b) => { const i = +b.dataset.i; x.items = C.mixMove(x.items, i, -1); await saveMixes(); scrMix(id, i - 1); },
      down: async (b) => { const i = +b.dataset.i; x.items = C.mixMove(x.items, i, 1); await saveMixes(); scrMix(id, i + 1); },
      rm: async (b) => {
        const i = +b.dataset.i, r = R[i]; if (!r) return;
        const ok = await ask('Enlever du mix ?', r.ok ? '« ' + esc(r.m.name) + ' » reste dans son édition (' + esc(r.from) + '), avec son script et sa musique.' : '', [{ label: '✖ Oui, enlever du mix', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!ok) return; x.items.splice(i, 1); await saveMixes(); scrMix(id, Math.min(i, x.items.length - 1));
      },
      script: () => scrMixScript(id),
      pdf: () => printCourse(null, okR.map((r) => r.m), mixPrintOpts(x, okR)),
      del: async () => { if (await delMix(id)) scrMixes(); }
    });
    if (pos != null && pos >= 0) { const e = document.getElementById('mx' + pos); if (e) e.scrollIntoView({ block: 'center' }); }
  }
  /** Script complet du mix, dans l'ordre du mix */
  async function scrMixScript(id) {
    const x = mixOf(id); if (!x) return scrMixes();
    const { R } = await mixData(x); const okR = R.filter((r) => r.ok);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Script du mix</h1></div><p class="soft">🔀 ' + esc(x.name) + '</p>' +
      okR.map((r, i) => '<div class="card ' + (tcount(r.m) ? 'g' : '') + '"><h2>' + (i + 1) + '. ' + esc(r.m.name) + '</h2><p class="mute">📁 ' + esc(r.from) + '</p>' + readList(r.m) +
        '<button class="btn sec small" style="margin-top:10px" data-act="open" data-i="' + r.pos + '">✍️ ' + (tcount(r.m) ? 'Modifier' : 'Écrire') + '</button></div>').join('') +
      '<div class="row"><button class="btn sec" data-act="copy">📋 Copier le texte</button><button class="btn" data-act="pdf">🖨️ PDF</button></div>',
    {
      back: () => scrMix(id),
      copy: () => copyText(scriptText(null, okR.map((r) => r.m), mixPrintOpts(x, okR))),
      pdf: () => printCourse(null, okR.map((r) => r.m), mixPrintOpts(x, okR)),
      open: (b) => { const r = R[+b.dataset.i]; if (!r || !r.ok) return; S.mixBack = { id, pos: r.pos }; scrWrite(r.cid, r.mid); }
    });
  }
  /** Choisir un morceau : pos ≥ 0 = remplacer celui de cette place, pos = −1 = ajouter à la fin */
  async function scrPickMorceau(id, pos) {
    const x = mixOf(id); if (!x) return scrMixes();
    const courses = await dall('courses');
    const cur = pos >= 0 ? C.mixResolve([x.items[pos]], courses, S.folders)[0] : null;
    const same = cur && cur.ok ? C.mixSameNumber(courses, cur.cid, cur.mid) : [];
    const fo = (c) => folderOf(c.folder);
    const row = (c, m, extra) => '<button class="seg pkrow" data-act="pick" data-cid="' + esc(c.id) + '" data-mid="' + esc(m.id) + '" data-s="' + esc(C.norm((fo(c) ? fo(c).name : '') + ' ' + c.name + ' ' + m.name)) + '"><span class="n">' + C.numLabel(C.mixNum(c, m)) + '</span><span class="t"><b>' + esc(m.name) + '</b><span class="mute">' + (extra ? esc(extra) + ' · ' : '') + (tcount(m) ? '✍️ ' + plural(tcount(m), 'ligne', 'lignes') + (m.textOk ? ' ✅' : '') : '✍️ à écrire') + (m.musicId ? ' · 🎵' : '') + '</span></span></button>';
    const total = courses.reduce((a, c) => a + c.morceaux.filter((m) => !m.lost).length, 0);
    const groups = S.folders.map((f) => ({ f, list: C.sortEditions(courses.filter((c) => c.folder === f.id && c.morceaux.some((m) => !m.lost))) })).filter((g) => g.list.length);
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>' + (pos >= 0 ? '🔁 Remplacer' : '➕ Ajouter un morceau') + '</h1></div>' +
      (cur && cur.ok ? '<p class="soft">À la place de : <b>' + (pos + 1) + '. ' + esc(cur.m.name) + '</b><br><span class="mute">📁 ' + esc(cur.from) + '</span></p>' : cur ? '<p class="soft">À la place du morceau introuvable n° ' + (pos + 1) + '.</p>' : '<p class="soft">Il sera ajouté à la fin du mix.</p>') +
      (same.length ? '<div class="card j" id="pksame"><h3>Même numéro (' + C.numLabel(cur.num) + ') dans tes autres éditions</h3>' + same.map((s) => row(s.c, s.m, (fo(s.c) ? fo(s.c).name + ' › ' : '') + s.c.name)).join('') + '</div>' : '') +
      '<input type="search" id="pq" placeholder="🔎 Chercher (morceau, édition, dossier)" autocomplete="off" style="margin:0 0 12px">' +
      '<p class="mute hide" id="pknone">Rien trouvé.</p>' +
      (groups.length ? groups.map((g) => '<div class="pkf"><h2 style="margin-top:14px">📁 ' + esc(g.f.name) + '</h2>' + g.list.map((c) => {
        const ms = c.morceaux.filter((m) => !m.lost);
        return '<details class="pk"' + (total <= 30 || (cur && cur.cid === c.id) ? ' open' : '') + '><summary>' + esc(c.name) + ' <span class="mute">· ' + plural(ms.length, 'morceau', 'morceaux') + '</span></summary>' + ms.map((m) => row(c, m)).join('') + '</details>';
      }).join('') + '</div>').join('') : '<div class="card"><p class="soft">Aucun morceau pour l\'instant.</p></div>'),
    {
      back: () => scrMix(id, pos >= 0 ? pos : undefined),
      pick: async (b) => {
        const y = mixOf(id); if (!y) return scrMixes();
        const ref = { cid: b.dataset.cid, mid: b.dataset.mid };
        let at;
        if (pos >= 0 && pos < y.items.length) { y.items[pos] = ref; at = pos; toast('Morceau remplacé ✅'); } else { y.items.push(ref); at = y.items.length - 1; toast('Morceau ajouté ✅'); }
        await saveMixes(); scrMix(id, at);
      }
    });
    const q = $('#pq');
    q.addEventListener('input', () => {
      const t = C.norm(q.value.trim()); let any = false;
      const sm = $('#pksame'); if (sm) sm.classList.toggle('hide', !!t);
      app.querySelectorAll('.pkf').forEach((f) => {
        let fany = false;
        f.querySelectorAll('details.pk').forEach((d) => {
          let dany = false;
          d.querySelectorAll('.pkrow').forEach((r) => { const h = !t || r.dataset.s.includes(t); r.classList.toggle('hide', !h); if (h) dany = true; });
          d.classList.toggle('hide', !dany); if (t && dany) d.open = true; if (dany) fany = true;
        });
        f.classList.toggle('hide', !fany); if (fany) any = true;
      });
      $('#pknone').classList.toggle('hide', any || !t);
    });
  }

  /* ======================= Mes mouvements ======================= */
  async function scrMoves(fid) {
    const f = folderOf(fid) || S.folders[0]; const style = f.style;
    const names = movesFor(style);
    const used = {}; for (const x of C.topMoves(await dall('courses'), style)) used[x.name] = x.n;
    const all = Array.from(new Set(Object.keys(used).concat(names)));
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Mes mouvements</h1></div>' +
      '<div class="chips">' + S.folders.map((x) => '<button class="chip ' + (x.id === f.id ? 'on' : '') + '" data-act="st" data-k="' + esc(x.id) + '">' + esc(x.name) + '</button>').join('') + '</div>' +
      '<p class="soft small">Les boutons rapides de « ✍️ Mon script ». Tes mouvements les plus utilisés passent en premier.</p>' +
      all.map((n) => '<button class="seg" data-act="mv" data-n="' + esc(n) + '"><span class="t"><b>' + esc(n) + '</b><span class="mute">' + (used[n] ? 'utilisé ' + used[n] + ' fois' : 'pas encore utilisé') + '</span></span><span style="font-size:22px">✏️</span></button>').join('') +
      '<button class="btn sec" data-act="add">➕ Nouveau mouvement</button>',
    {
      back: () => scrHome(),
      st: (b) => scrMoves(b.dataset.k),
      add: async () => { const n = await askText('Nom du nouveau mouvement', '', 'ex. Descente tirage'); if (n) { S.customMoves[style] = S.customMoves[style] || []; if (!S.customMoves[style].includes(n)) S.customMoves[style].push(n); await saveKV('customMoves'); scrMoves(f.id); } },
      mv: async (b) => {
        const n = b.dataset.n; const mine = (S.customMoves[style] || []).includes(n);
        const r = await ask(n, used[n] ? 'Utilisé ' + used[n] + ' fois dans tes scripts.' : '', [{ label: '✏️ Renommer partout', value: 'ren' }].concat(mine && !used[n] ? [{ label: '🗑️ Retirer de ma liste', value: 'rm', cls: 'sec' }] : [], [{ label: 'Retour', value: null, cls: 'ghost' }]));
        if (r === 'ren') { const nn = await askText('Nouveau nom pour « ' + n + ' »', n); if (nn && nn !== n) { await renameEverywhere(style, n, nn); scrMoves(f.id); } }
        if (r === 'rm') { S.customMoves[style] = S.customMoves[style].filter((x) => x !== n); await saveKV('customMoves'); scrMoves(f.id); }
      }
    });
  }

  /* ======================= Réglages ======================= */
  async function scrSettings() {
    const info = await storageInfo();
    const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted().catch(() => false) : false;
    const bio = await bioDispo();
    const vids = (await dall('courses')).filter((c) => c.video && c.video.kept);
    const pcx = await pcRaw();
    render('<div class="top"><button class="back" data-act="back">‹</button><h1>Réglages</h1></div>' +
      '<div class="card"><h2>💾 Place</h2><p class="soft small">Utilisé : <b>' + fmtSize(info.usage) + '</b>' + (info.quota ? ' · encore libre pour l\'appli : ' + fmtSize(Math.max(0, info.quota - info.usage)) : '') + (persisted ? '<br>Protégé ✅ (le téléphone ne l\'effacera pas tout seul)' : '<br>Pas encore protégé : fais des sauvegardes 💾') + '</p>' +
        (vids.length ? '<p class="small"><b>Vidéos gardées :</b></p>' + vids.map((c) => '<p class="small soft" style="margin:0 0 4px">🎬 ' + esc(c.name) + ' · ' + fmtSize(c.video.kept.size) + '</p>').join('') + '<p class="mute">Pour en retirer une : ouvre l\'édition › « 🗑️ Retirer la vidéo ».</p>' : '<p class="mute">Aucune vidéo gardée.</p>') +
        (persisted ? '' : '<button class="btn sec small" data-act="persist">🛡️ Protéger mes données</button>') + '</div>' +
      '<div class="card"><h2>👆 Empreinte</h2>' + (bio ? (lsGet('sm_bio') ? '<p class="soft small">Activée ✅ : à l\'ouverture, pose ton doigt. Ton code marche toujours.</p><button class="btn sec" data-act="bioOff">Désactiver l\'empreinte</button>' : '<p class="soft small">Ouvre l\'appli avec ton empreinte. Ton code reste possible. Ton empreinte ne sort jamais du téléphone.</p><button class="btn" data-act="bioOn">👆 Activer l\'empreinte</button>') : '<p class="soft small">Ce téléphone ou ce navigateur ne permet pas l\'empreinte ici. Utilise Chrome.</p>') + '</div>' +
      '<div class="card"><h2>💻 Relier mon PC</h2><p class="soft small">' + (pcx ? (pcx.pc ? 'Relié ✅ : glisse tes vidéos et musiques sur la page de ton ordinateur.' : 'Code créé : tape-le sur ton ordinateur.') : 'Envoie tes vidéos et tes musiques depuis ton ordinateur, directement dans ScriptMove.') + '</p><button class="btn sec" data-act="pc">💻 Relier mon PC</button></div>' +
      '<button class="btn ghost" data-act="reset">🗑️ Tout effacer et recommencer</button>' +
      '<p class="mute" style="text-align:center">ScriptMove · tout reste dans ton téléphone</p>',
    {
      back: () => scrHome(),
      persist: async () => { let ok = false; try { ok = await navigator.storage.persist(); } catch (e) { /* rien */ } toast(ok ? 'Protégé ✅' : 'Le téléphone n\'a pas accepté pour l\'instant (réessaie après avoir installé l\'appli).', 4000); scrSettings(); },
      bioOn: async () => { try { await bioActiver(); toast('Empreinte activée ✅'); } catch (e) { toast('Empreinte pas activée (annulée ou pas disponible).'); } scrSettings(); },
      bioOff: async () => { try { localStorage.removeItem('sm_bio'); } catch (e) { /* rien */ } toast('Empreinte désactivée'); scrSettings(); },
      pc: () => scrPc(),
      reset: () => resetAll()
    });
  }

  /* ======================= Sauvegarde / restauration ======================= */
  const b64 = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(blob); });
  async function doBackup() {
    const courses = await dall('courses'); const musics = await dall('musics'); const photos = await dall('photos');
    const lvs = (await tx('data', 'readonly', (s) => s.getAll(IDBKeyRange.bound('lv:', 'lv:\uffff')))) || [];
    const msize = musics.reduce((a, m) => a + (m.blob ? m.blob.size : 0), 0) + photos.reduce((a, p) => a + (p.blob ? p.blob.size : 0), 0) + lvs.reduce((a, l) => a + (l.size || 0), 0);
    const opts = [{ label: '💾 Scripts seulement (léger)', value: 'light' }];
    if (msize < 150e6) opts.push({ label: '🎵 Avec musiques, photos' + (lvs.length ? ' et livrets' : '') + ' (' + fmtSize(msize) + ')', value: 'full', cls: 'sec' });
    opts.push({ label: 'Annuler', value: null, cls: 'ghost' });
    const r = await ask('Sauvegarder', 'Un fichier est enregistré dans ton téléphone (dossier Téléchargements). Garde-le précieusement, par exemple sur ton Drive.<br><span class="mute">Les vidéos ne sont pas dans la sauvegarde (trop grosses).</span>', opts);
    if (!r) return;
    const data = { app: 'ScriptMove', version: 3, date: new Date().toISOString(), courses, mixes: S.mixes || [], folders: S.folders, vocab: S.vocab, prints: S.prints, customMoves: S.customMoves || {}, favs: S.favs || {} };
    data.musicsInfo = musics.map((m) => ({ id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm }));
    if (r === 'full') {
      toast('Préparation…');
      data.musics = []; for (const m of musics) if (m.blob) data.musics.push({ id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm, attack: m.attack, len: m.len, data: await b64(m.blob) });
      data.photos = []; for (const p of photos) data.photos.push({ id: p.id, cid: p.cid, mid: p.mid, w: p.w, h: p.h, created: p.created, data: await b64(p.blob) });
      data.livrets = []; for (const l of lvs) if (l && l.files && l.files.length) data.livrets.push(await C.lvPack(l, b64));
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
    const r = await ask('Restaurer ?', 'Sauvegarde du ' + esc(new Date(d.date).toLocaleDateString('fr-FR')) + ' : ' + (d.courses || []).length + ' édition(s)' + ((d.mixes || []).length ? ', ' + d.mixes.length + ' mix' : '') + '. Celles déjà présentes (les mêmes) seront remplacées, les autres sont gardées.', [{ label: '📂 Restaurer', value: 1 }, { label: 'Annuler', value: 0, cls: 'sec' }]);
    if (!r) return;
    for (const fo of d.folders || []) if (!S.folders.some((x) => x.id === fo.id)) S.folders.push(fo);
    await saveKV('folders');
    const lvIn = {}; for (const o of d.livrets || []) if (o && o.cid) lvIn[o.cid] = o;
    for (const c of d.courses || []) {
      const here = await dget('courses', c.id);
      // la vidéo gardée n'est pas dans la sauvegarde : on garde celle du téléphone si elle y est
      c.video = Object.assign({}, c.video || {}, { kept: here && here.video && here.video.kept ? here.video.kept : null });
      // le livret : celui de la sauvegarde complète, sinon celui déjà dans le téléphone
      if (lvIn[c.id]) c.livret = C.lvMeta(lvIn[c.id]);
      else c.livret = here && here.livret && (await getLivret(c.id)) ? here.livret : null;
      C.migrateCourse(c, S.folders, uid);
      await saveCourse(c);
    }
    for (const m of d.musics || []) { const blob = await (await fetch(m.data)).blob(); await dput('musics', { id: m.id, name: m.name, type: m.type, duration: m.duration, bpm: m.bpm, attack: m.attack, len: m.len, blob }); }
    for (const p of d.photos || []) { const blob = await (await fetch(p.data)).blob(); await dput('photos', { id: p.id, cid: p.cid, mid: p.mid, w: p.w, h: p.h, created: p.created, blob }); }
    for (const k in d.thumbs || {}) await dput('data', d.thumbs[k], 'th:' + k);
    for (const o of d.livrets || []) {
      const rec = await C.lvUnpack(o, async (u, type) => { const b = await (await fetch(u)).blob(); return type && b.type !== type ? new Blob([b], { type }) : b; });
      if (rec) { await dput('data', rec, lvKey(rec.cid)); if (LV.cid === rec.cid) lvForget(); }
    }
    // ancienne sauvegarde : anciens noms de mouvements → nouveaux
    if (!(d.version >= 3)) { const k = { vocab: d.vocab || {}, prints: d.prints || [], customMoves: d.customMoves || {}, favs: d.favs || {} }; C.migrateMoveLists(k); Object.assign(d, k); }
    for (const st in d.favs || {}) S.favs[st] = Object.assign({}, S.favs[st] || {}, d.favs[st]);
    const ids = new Set(S.prints.map((p) => p.id)); for (const p of d.prints || []) if (!ids.has(p.id)) S.prints.push(p);
    for (const st in d.vocab || {}) S.vocab[st] = Object.assign({}, S.vocab[st] || {}, d.vocab[st]);
    for (const st in d.customMoves || {}) S.customMoves[st] = Array.from(new Set((S.customMoves[st] || []).concat(d.customMoves[st])));
    await saveKV('prints'); await saveKV('vocab'); await saveKV('customMoves'); await saveKV('favs');
    if (Array.isArray(d.mixes) && d.mixes.length) { S.mixes = C.mixMerge(S.mixes, d.mixes); await saveMixes(); }
    toast('Restauré ✅', 3000); scrHome();
  }

  /* ======================= 📤 Partage reçu (v19) =======================
     « Partager › ScriptMove » depuis WhatsApp, la galerie, Fichiers… : le service worker met le fichier de côté
     (kv 'sharePending' = { files: [{ id, name, type, size, blob }] }), puis on demande ici où le ranger.
     Le rangement passe par les mêmes fonctions que dans l'appli : giveVideo / scrNew (vidéo de l'édition), linkMusicFile (musique d'un morceau). */
  const SHARE_KEY = 'sharePending';
  /* v22 : un fichier venu de l'ordinateur (💻 Relier mon PC) est écrit par blocs dans 'vchunks' (clés 'pcin_<id>:000000'…) ;
     dans 'sharePending' il n'a pas de blob mais pcChunks (nombre de blocs) : on le reconstitue ici sans le charger en mémoire. */
  const pcinRange = (id) => IDBKeyRange.bound('pcin_' + id + ':', 'pcin_' + id + ':\uffff');
  async function shareRaw() { try { const p = await dget('kv', SHARE_KEY); return p && Array.isArray(p.files) ? p.files.filter((x) => x && (x.blob || x.pcChunks)) : []; } catch (e) { return []; } }
  async function sharePending() {
    const out = [], bad = [];
    for (const x of await shareRaw()) {
      if (x.blob) { out.push(x); continue; }
      let bl = null; try { bl = await tx('vchunks', 'readonly', (s) => s.getAll(pcinRange(x.id))); } catch (e) { /* rien */ }
      if (bl && bl.length === x.pcChunks) out.push(Object.assign({}, x, { blob: new Blob(bl, { type: x.type || '' }) })); else bad.push(x.id);
    }
    for (const id of bad) await shareDrop(id).catch(() => {});
    return out;
  }
  async function shareDrop(id) {
    const all = await shareRaw(), gone = all.filter((x) => id === '*' || x.id === id), left = all.filter((x) => !(id === '*' || x.id === id));
    if (left.length) await dput('kv', { files: left, at: Date.now() }, SHARE_KEY); else await ddel('kv', SHARE_KEY);
    for (const x of gone) if (x.pcChunks) { try { await tx('vchunks', 'readwrite', (s) => s.delete(pcinRange(x.id))); } catch (e) { /* rien */ } }
    return left;
  }
  function shareCleanURL() { try { if (/[?&]share=/.test(location.search)) history.replaceState(null, '', location.pathname); } catch (e) { /* rien */ } }
  const shareExt = (n) => (String(n || '').match(/\.([a-z0-9]+)$/i) || [])[1] || '';
  function shareKind(x) {
    const t = String(x.type || '').toLowerCase(), e = shareExt(x.name).toLowerCase();
    if (/^(m4a|mp3|wav|aac|ogg|oga|opus|flac|wma|amr)$/.test(e)) return 'audio';
    if (t.startsWith('audio/')) return 'audio';
    if (t.startsWith('video/') || /^(mp4|mov|m4v|webm|3gp|mkv|avi)$/.test(e)) return 'video';
    return null;
  }
  const shareFile = (x) => (x.blob instanceof File ? x.blob : new File([x.blob], x.name || 'fichier', { type: x.type || x.blob.type || '' }));
  /** Passe au fichier partagé suivant. Renvoie true s'il y en avait un. */
  async function shareNext() {
    const list = await sharePending();
    if (!list.length) { S.shareOn = false; shareCleanURL(); return false; }
    S.shareOn = true; scrShare(list[0], list.length); return true;
  }
  async function shareDone(x, where, open) {
    const left = await shareDrop(x.id);
    shareCleanURL();
    render('<div class="top"><h1>Partage reçu</h1></div><div class="card g"><h2>✅ Rangé dans ' + esc(where) + '</h2><p class="soft small">' + (shareKind(x) === 'video' ? '🎬 ' : '🎵 ') + esc(x.name) + '</p></div>' +
      (left.length ? '<button class="btn" data-act="next">➡️ Fichier suivant (' + left.length + ' restant' + (left.length > 1 ? 's' : '') + ')</button>' : '<button class="btn" data-act="open">👀 Voir</button>') +
      '<button class="btn sec" data-act="home">🏠 Accueil</button>',
    { next: () => shareNext(), open: () => { S.shareOn = false; open(); }, home: () => { S.shareOn = false; scrHome(); } });
  }
  /** Écran « Où veux-tu la ranger ? » */
  async function scrShare(x, total, st) {
    st = st || { kind: shareKind(x) };
    const head = '<div class="top">' + (st.fid ? '<button class="back" data-act="up">‹</button>' : '') + '<h1>Partage reçu</h1></div>' +
      '<div class="card o"><p style="margin:0">' + (st.kind === 'video' ? '🎬' : st.kind === 'audio' ? '🎵' : '📄') + ' <b>' + esc(x.name) + '</b></p><p class="mute" style="margin:4px 0 0">' + fmtSize(x.size || x.blob.size) + (total > 1 ? ' · ' + total + ' fichiers reçus' : '') + '</p></div>';
    const foot = '<button class="btn ghost" data-act="cancel">✖ Annuler</button>' + (total > 1 ? '<button class="btn ghost small" data-act="cancelall">Tout annuler (' + total + ' fichiers)</button>' : '');
    const common = {
      cancel: async () => { const left = await shareDrop(x.id); if (left.length) return shareNext(); S.shareOn = false; shareCleanURL(); toast('Partage annulé.'); scrHome(); },
      cancelall: async () => { await shareDrop('*'); S.shareOn = false; shareCleanURL(); toast('Partage annulé.'); scrHome(); },
      up: () => scrShare(x, total, st.cid ? { kind: st.kind, fid: st.fid } : { kind: st.kind })
    };
    // 0. on ne sait pas si c'est une vidéo ou une musique
    if (!st.kind) {
      return render(head + '<h2>C\'est quoi ?</h2><button class="btn" data-act="k" data-k="video">🎬 La vidéo d\'un cours</button><button class="btn" data-act="k" data-k="audio">🎵 Une musique</button>' + foot,
        Object.assign({ k: (b) => scrShare(x, total, { kind: b.dataset.k }) }, common));
    }
    // 1. le dossier
    if (!st.fid) {
      return render(head + '<h2>Où veux-tu la ranger ?</h2>' +
        S.folders.map((f) => '<button class="seg" data-act="fold" data-id="' + esc(f.id) + '"><span class="t"><b>📁 ' + esc(f.name) + '</b></span><span style="font-size:24px">›</span></button>').join('') +
        (st.kind === 'video' ? '<button class="btn ghost small" data-act="asmus">🎵 C\'est une musique ? La ranger comme musique</button>' : '') + foot,
        Object.assign({ fold: (b) => scrShare(x, total, { kind: st.kind, fid: b.dataset.id }), asmus: () => scrShare(x, total, { kind: 'audio' }) }, common));
    }
    const f = folderOf(st.fid); if (!f) return scrShare(x, total, { kind: st.kind });
    // 2. l'édition
    if (!st.cid) {
      const list = C.sortEditions((await dall('courses')).filter((c) => c.folder === f.id));
      return render(head + '<p class="mute">📁 ' + esc(f.name) + '</p><h2>' + (st.kind === 'video' ? 'Vidéo de quelle édition ?' : 'Dans quelle édition ?') + '</h2>' +
        (st.kind === 'video' ? '<button class="btn" data-act="newc">➕ Nouvelle édition avec cette vidéo</button>' : '') +
        (list.length ? list.map((c) => '<button class="seg" data-act="ed" data-id="' + c.id + '"><span class="t"><b>' + esc(c.name) + '</b><span class="mute">' + c.morceaux.filter((m) => !m.lost).length + ' morceau(x)' + (c.video && c.video.kept ? ' · 🎬 vidéo gardée' : '') + '</span></span><span style="font-size:24px">›</span></button>').join('')
          : '<div class="card"><p class="soft">Aucune édition dans ce dossier.</p>' + (st.kind === 'audio' ? '<p class="mute">Une musique se range dans un morceau d\'une édition. Choisis un autre dossier, ou crée d\'abord l\'édition avec la vidéo du cours.</p>' : '') + '</div>') + foot,
        Object.assign({
          ed: (b) => scrShare(x, total, { kind: st.kind, fid: f.id, cid: b.dataset.id }),
          newc: () => scrNew(f.id, { file: shareFile(x), back: () => scrShare(x, total, st), stored: async () => { await shareDrop(x.id); shareCleanURL(); } })
        }, common));
    }
    const c = await dget('courses', st.cid); if (!c) return scrShare(x, total, { kind: st.kind, fid: f.id });
    const where = '📁 ' + f.name + ' › ' + c.name;
    // 3a. une vidéo : c'est la vidéo de l'édition (comme « 🎬 Remettre la vidéo »)
    if (st.kind === 'video') {
      if (c.video && c.video.kept) {
        const r = await ask('Remplacer la vidéo ?', '« ' + esc(c.name) + ' » a déjà une vidéo gardée (' + fmtSize(c.video.kept.size) + '). <b>Tes scripts, tes musiques et tes photos sont gardés.</b>', [{ label: '🔁 Oui, remplacer la vidéo', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
        if (!r) return scrShare(x, total, { kind: st.kind, fid: f.id });
      }
      await giveVideo(c, shareFile(x), true);
      const c2 = await dget('courses', c.id);
      if (!(c2 && c2.video && c2.video.kept)) return scrShare(x, total, { kind: st.kind, fid: f.id }); // pas gardée (place, annulé…) : le partage reste en attente
      return shareDone(x, where, () => scrCourse(c.id));
    }
    // 3b. une musique : dans quel morceau ?
    const ms = c.morceaux.filter((m) => !m.lost);
    const musics = {}; for (const mu of await dall('musics')) musics[mu.id] = mu;
    render(head + '<p class="mute">' + esc(where) + '</p><h2>Dans quel morceau ?</h2>' +
      ms.map((m, i) => '<button class="seg" data-act="mo" data-id="' + m.id + '"><span class="t"><b>' + (i + 1) + '. ' + esc(m.name) + '</b><span class="mute">' + (m.musicId && musics[m.musicId] ? '🎵 ' + esc(musics[m.musicId].name) : 'pas de musique') + (tcount(m) ? ' · ✍️ script écrit' : '') + '</span></span><span style="font-size:24px">›</span></button>').join('') +
      '<button class="btn sec" data-act="newm">➕ Nouveau morceau</button>' + foot,
    Object.assign({
      mo: async (b) => {
        const m = c.morceaux.find((y) => y.id === b.dataset.id); if (!m) return;
        if (m.musicId) {
          const cur = musics[m.musicId];
          const r = await ask('Remplacer la musique ?', 'Ce morceau a déjà une musique' + (cur ? ' : <b>' + esc(cur.name) + '</b>' : '') + '.<br><b>Ton script est gardé</b>, seule la musique change.', [{ label: '🔁 Oui, remplacer', value: 1 }, { label: 'Non', value: 0, cls: 'sec' }]);
          if (!r) return;
        }
        if (!(await linkMusicFile(c, m, shareFile(x)))) return scrShare(x, total, st);
        shareDone(x, where + ' › ' + m.name, () => scrCourse(c.id));
      },
      newm: async () => {
        const n = await askText('Nom du nouveau morceau', x.name.replace(/\.[^.]+$/, ''), 'ex. 04 dos / épaules'); if (!n) return;
        const last = ms[ms.length - 1], t = last ? last.end : 0;
        const m = newMorceau(n, t, t); m.renamed = true;
        c.morceaux.splice(last ? c.morceaux.indexOf(last) + 1 : 0, 0, m);
        await saveCourse(c);
        if (!(await linkMusicFile(c, m, shareFile(x)))) return scrShare(x, total, st);
        shareDone(x, where + ' › ' + m.name, () => scrCourse(c.id));
      }
    }, common));
  }

  /* ======================= 💻 Relier mon PC (v22) =======================
     Des vidéos et musiques glissées sur la page pc.html de l'ordinateur arrivent ici, en direct (WebRTC) : rien n'est stocké
     sur un serveur. Le relais Supabase de Gestinéro (pc-commun.js) ne sert qu'à se trouver, avec de petits messages chiffrés.
     Un fichier reçu est écrit par blocs (jamais tout en mémoire), puis rangé EXACTEMENT comme un « Partager › ScriptMove ». */
  const PCX = window.SMPC, PCK = 'pcLien';
  const PCT = { raw: null, lien: null, occupe: false, tour: 0, rtc: null, dc: null, rx: null, vus: new Set(), wake: null, msg: '' };
  const PC_BLOC = 8 * 1024 * 1024; // écrit dans l'appli tous les 8 Mo
  const pcinKey = (id, i) => 'pcin_' + id + ':' + String(i).padStart(6, '0');
  const pcPage = () => new URL('pc.html', location.href).href;
  const pcOk = () => !!(PCX && window.RTCPeerConnection && window.crypto && crypto.subtle);
  async function pcRaw() {
    if (PCT.raw) return PCT.raw;
    let x = null; try { x = await dget('kv', PCK); } catch (e) { /* rien */ }
    if (!x || !/^[0-9a-f]{32}$/.test(String(x.canal || '')) || !x.cle || !x.code) return null;
    PCT.raw = x; return x;
  }
  async function pcLien() { const x = await pcRaw(); if (!x) return null; if (!PCT.lien || PCT.lien.canal !== x.canal) PCT.lien = { canal: x.canal, cle: await PCX.importer(x.cle) }; return PCT.lien; }
  const pcIci = () => S.where === 'pc';
  const pcReseau = (e) => (e && e.reseau ? 'Pas de connexion internet. Vérifie ta connexion, puis réessaie.' : 'Le service ne répond pas pour le moment. Réessaie dans quelques minutes.');

  async function scrPc() {
    const x = await pcRaw();
    const top = '<div class="top"><button class="back" data-act="back">‹</button><h1>Relier mon PC</h1></div>';
    const gros = 'font-size:clamp(24px,8vw,32px);font-weight:900;letter-spacing:2px;white-space:nowrap;text-align:center;padding:12px 6px;border-radius:14px;background:#11162c;font-family:ui-monospace,Menlo,Consolas,monospace;margin:0 0 12px';
    const msg = PCT.msg ? '<p class="small" role="status" style="color:var(--ko);font-weight:700">' + esc(PCT.msg) + '</p>' : '';
    const garde = '<div class="card j small">📱 <b>Pour recevoir, garde ScriptMove ouvert sur ton téléphone</b>, écran allumé, pendant tout l\'envoi.</div>';
    const prive = '<p class="mute">🔒 Tes fichiers vont directement de ton ordinateur à ton téléphone. Ils ne sont gardés sur aucun serveur, et personne d\'autre ne peut les lire. Pas de limite de taille.</p>';
    let h;
    if (!pcOk()) h = top + '<div class="card"><p class="soft">Ce téléphone ou ce navigateur ne permet pas de relier un ordinateur. Utilise Chrome.</p></div>';
    else if (navigator.onLine === false) h = top + '<div class="card j"><h2>📶 Il faut internet pour relier ton PC</h2><p class="soft">Tout le reste de ScriptMove marche sans internet. Reviens ici quand tu as du réseau ou du Wi-Fi.</p><button class="btn sec" data-act="re">🔄 Réessayer</button></div>';
    else if (!x) h = top + '<div class="card o"><div style="font-size:40px">💻</div><h2>Envoie tes fichiers depuis ton ordinateur</h2>' +
      '<p class="soft">Tes vidéos de cours et tes musiques, glissées sur une page de ton ordinateur, arrivent ici, dans ScriptMove. Elles se rangent comme si tu les avais partagées depuis ton téléphone.</p>' + prive + msg +
      '<button class="btn" data-act="creer"' + (PCT.occupe ? ' disabled' : '') + '>' + (PCT.occupe ? 'Un instant…' : '💻 Relier mon ordinateur') + '</button></div>';
    else h = top + (x.pc ? '<div class="card g"><h2>✅ Ton ordinateur est relié</h2><p class="soft small">' + esc(x.pc) + '</p><p class="small">Sur ton ordinateur, glisse tes vidéos et tes musiques sur la page. Elles arrivent ici, puis ScriptMove te demande où les ranger.</p>' + (x.recus ? '<p class="small">📥 ' + x.recus + ' fichier' + (x.recus > 1 ? 's reçus' : ' reçu') + ' de ton ordinateur</p>' : '') + '</div>'
      : '<div class="card j" role="status"><h2>⏳ J\'attends ton ordinateur…</h2><p class="soft small">Laisse cet écran ouvert pendant que tu tapes le code sur ton ordinateur.</p></div>') +
      '<div class="card"><p class="small"><b>1. Sur ton ordinateur, ouvre le lien</b> : touche « 📤 M\'envoyer le lien » et envoie-le-toi (WhatsApp, e-mail…), puis ouvre-le sur ton ordinateur. La page se relie toute seule.</p>' +
      '<button class="btn" data-act="lien">📤 M\'envoyer le lien</button>' +
      '<p class="small"><b>2. Ou tape ce code</b> sur la page de ton ordinateur :</p><div style="' + gros + '">' + esc(PCX.joli(x.code)) + '</div>' +
      '<p class="mute" style="overflow-wrap:anywhere">Adresse de la page : ' + esc(pcPage()) + '</p></div>' +
      garde + prive + msg + '<button class="btn ghost" data-act="delier"' + (PCT.occupe ? ' disabled' : '') + '>Délier mon ordinateur</button>';
    render(h, {
      back: () => scrHome(),
      creer: () => pcCreer(),
      re: () => scrPc(),
      lien: () => pcEnvoyerLien(),
      delier: () => pcDelier()
    });
    S.where = 'pc';
  }
  async function pcCreer() {
    if (PCT.occupe) return; PCT.occupe = true; PCT.msg = ''; scrPc();
    try {
      const r = await PCX.deriver(PCX.nouveauCode());
      await PCX.rpc('pc_canal_creer', { p_canal: r.canal });
      const x = { code: r.code, canal: r.canal, cle: r.cleB64, le: Date.now(), pc: '', recus: 0 };
      await dput('kv', x, PCK); PCT.raw = x; PCT.lien = null;
    } catch (e) { PCT.msg = pcReseau(e); }
    PCT.occupe = false; if (pcIci()) scrPc();
  }
  async function pcOublier(toastTxt) {
    pcFermer(); try { await ddel('kv', PCK); } catch (e) { /* rien */ }
    PCT.raw = null; PCT.lien = null; PCT.vus.clear(); if (toastTxt) toast(toastTxt, 4000);
    if (pcIci()) scrPc();
  }
  async function pcDelier() {
    const x = await pcRaw(); if (!x) return;
    const ok = await ask('Délier ton ordinateur ?', 'Les fichiers déjà arrivés restent dans ScriptMove. Pour envoyer de nouveau, il faudra un nouveau code.', [{ label: 'Délier', value: 1, cls: 'red' }, { label: 'Annuler', value: 0, cls: 'sec' }]);
    if (!ok) return;
    PCT.occupe = true; scrPc();
    try { await PCX.rpc('pc_canal_supprimer', { p_canal: x.canal }); } catch (e) { /* le relais efface tout seul les canaux inutilisés */ }
    PCT.occupe = false; await pcOublier('💻 Ordinateur délié');
  }
  async function pcEnvoyerLien() {
    const x = await pcRaw(); if (!x) return;
    const url = pcPage() + '#' + x.code;
    const txt = 'Pour envoyer mes vidéos et musiques à ScriptMove, j\'ouvre ce lien sur mon ordinateur : ' + url;
    try { if (navigator.share) { await navigator.share({ title: 'ScriptMove sur mon ordinateur', text: txt }); return; } }
    catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); toast('Lien copié ✅'); } catch (e) { toast(url, 8000); }
  }

  /* ---------- écouter l'ordinateur (tant que ScriptMove est ouvert) ---------- */
  async function pcTour() {
    if (PCT.tour || document.hidden || !pcOk() || navigator.onLine === false) return;
    const x = await pcRaw(); if (!x) return;
    PCT.tour = Date.now();
    try {
      const l = await pcLien(); let r;
      try { r = await PCX.relever(l); } catch (e) { return; }
      if (!r.existe) { if (PCT.raw && PCT.raw.canal === l.canal) await pcOublier('💻 Ton ordinateur n\'est plus relié'); return; }
      if (r.pc && !x.pc) {
        let nom = 'Ordinateur'; try { nom = (await PCX.dechiffrerTexte(l.cle, r.pc, 'pc')).slice(0, 60) || nom; } catch (e) { /* rien */ }
        x.pc = nom; await dput('kv', x, PCK); toast('✅ Ton ordinateur est relié'); if (pcIci()) scrPc();
      }
      for (const m of r.msgs) {
        const vieux = Date.now() - m.le > 5 * 60000;
        if (m.de === 'tel') { if (vieux) PCX.effacer(l, m.id); continue; } // nos réponses : l'ordinateur les efface en les lisant
        if (PCT.vus.has(m.id)) continue; PCT.vus.add(m.id);
        const o = await PCX.lire(l, m.id); PCX.effacer(l, m.id);
        if (!vieux && o && o.t === 'offre' && o.sdp) pcRepondre(l, o).catch((e) => console.warn('relier mon PC', e));
      }
    } finally { PCT.tour = 0; }
  }
  function pcFermer() {
    if (PCT.rx) pcCoupe();
    try { if (PCT.dc) PCT.dc.close(); } catch (e) { /* rien */ }
    try { if (PCT.rtc) PCT.rtc.close(); } catch (e) { /* rien */ }
    PCT.dc = null; PCT.rtc = null;
  }
  async function pcRepondre(l, o) {
    pcFermer(); // une seule connexion à la fois (page de l'ordinateur rechargée : on reprend la nouvelle)
    const rtc = new RTCPeerConnection({ iceServers: PCX.ICE }); PCT.rtc = rtc;
    rtc.ondatachannel = (e) => { if (PCT.rtc === rtc) pcCanal(e.channel); };
    rtc.onconnectionstatechange = () => { if (PCT.rtc === rtc && (rtc.connectionState === 'failed' || rtc.connectionState === 'closed') && PCT.rx) pcCoupe(); };
    await rtc.setRemoteDescription({ type: 'offer', sdp: o.sdp });
    await rtc.setLocalDescription(await rtc.createAnswer());
    await PCX.adresses(rtc, 5000);
    if (PCT.rtc !== rtc) return;
    await PCX.poster(l, 'tel', { t: 'reponse', s: o.s, sdp: rtc.localDescription.sdp });
  }
  function pcDire(o) { try { if (PCT.dc && PCT.dc.readyState === 'open') PCT.dc.send(JSON.stringify(o)); } catch (e) { /* rien */ } }
  function pcCanal(dc) {
    PCT.dc = dc; dc.binaryType = 'arraybuffer';
    dc.onclose = () => { if (PCT.dc === dc) { PCT.dc = null; if (PCT.rx) pcCoupe(); } };
    dc.onmessage = (e) => {
      if (typeof e.data !== 'string') return pcDonnees(e.data);
      let o = null; try { o = JSON.parse(e.data); } catch (er) { return; }
      if (o && o.t === 'f') pcDebut(o).catch((er) => { console.warn(er); pcDire({ t: 'non', id: o.id, raison: 'erreur' }); });
      else if (o && o.t === 'fin') pcFin(o).catch((er) => console.warn(er));
    };
  }
  async function pcGarderEcran(on) {
    try {
      if (on && !PCT.wake && 'wakeLock' in navigator) { PCT.wake = await navigator.wakeLock.request('screen'); PCT.wake.addEventListener('release', () => { PCT.wake = null; }); }
      if (!on && PCT.wake) { const w = PCT.wake; PCT.wake = null; await w.release(); }
    } catch (e) { /* pas grave */ }
  }
  async function pcDebut(o) {
    if (PCT.rx) pcCoupe(true);
    const nom = String(o.nom || 'fichier').slice(0, 200), type = String(o.type || '').slice(0, 100), taille = Math.max(0, +o.taille || 0), id = String(o.id || '').replace(/[^0-9a-z]/gi, '').slice(0, 40);
    if (!id) return;
    if (!shareKind({ name: nom, type })) return pcDire({ t: 'non', id, raison: 'type' });
    try { // il faut la place deux fois : la copie reçue, puis la copie rangée
      if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); if (e.quota && e.quota - (e.usage || 0) < taille * 2 + 50e6) return pcDire({ t: 'non', id, raison: 'place', libre: Math.max(0, e.quota - (e.usage || 0)) }); }
    } catch (e) { /* on essaie quand même */ }
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* rien */ }
    PCT.rx = { id, nom, type, taille, recu: 0, ecrit: 0, buf: [], bufN: 0, i: 0, q: Promise.resolve(), err: null, vu: 0 };
    pcGarderEcran(true); pcBandeau();
    pcDire({ t: 'go', id });
  }
  function pcVider(r) {
    if (!r.bufN) return;
    const parts = r.buf, n = r.bufN, i = r.i++; r.buf = []; r.bufN = 0;
    r.q = r.q.then(async () => {
      if (r.err) return;
      await dput('vchunks', new Blob(parts, { type: r.type || '' }), pcinKey(r.id, i));
      r.ecrit += n; if (PCT.rx === r) pcDire({ t: 'ack', id: r.id, n: r.ecrit });
    }).catch((e) => {
      if (r.err) return; r.err = e;
      pcDire({ t: 'non', id: r.id, raison: isQuota(e) ? 'place' : 'erreur' });
      if (PCT.rx === r) { PCT.rx = null; pcGarderEcran(false); pcBandeau({ ko: isQuota(e) ? 'Plus assez de place sur ton téléphone : « ' + r.nom + ' » n\'est pas reçu.' : 'Je n\'ai pas réussi à garder « ' + r.nom + ' ». Renvoie-le depuis ton ordinateur.' }); }
      tx('vchunks', 'readwrite', (s) => s.delete(pcinRange(r.id))).catch(() => {});
    });
  }
  function pcDonnees(buf) {
    const r = PCT.rx; if (!r || r.err) return;
    const u = new Uint8Array(buf); r.buf.push(u); r.bufN += u.length; r.recu += u.length;
    if (r.bufN >= PC_BLOC) pcVider(r);
    if (Date.now() - r.vu > 400) { r.vu = Date.now(); pcBandeau(); }
  }
  async function pcFin(o) {
    const r = PCT.rx; if (!r || r.id !== o.id) return;
    pcVider(r); await r.q;
    if (r.err || PCT.rx !== r) return;
    PCT.rx = null; pcGarderEcran(false);
    if (r.ecrit !== r.taille) { tx('vchunks', 'readwrite', (s) => s.delete(pcinRange(r.id))).catch(() => {}); pcDire({ t: 'non', id: r.id, raison: 'erreur' }); pcBandeau({ ko: '« ' + r.nom + ' » est arrivé incomplet. Renvoie-le depuis ton ordinateur.' }); return; }
    // rangé dans la même file d'attente que « Partager › ScriptMove » (une seule écriture, comme le service worker)
    await tx('kv', 'readwrite', (s) => {
      const g = s.get(SHARE_KEY);
      g.onsuccess = () => {
        const cur = g.result && Array.isArray(g.result.files) ? g.result : { files: [] };
        cur.files.push({ id: r.id, name: r.nom, type: r.type, size: r.taille, at: Date.now(), pcChunks: r.i, from: 'pc' });
        cur.at = Date.now(); s.put(cur, SHARE_KEY);
      };
    });
    pcDire({ t: 'ok', id: r.id });
    const x = await pcRaw(); if (x) { x.recus = (+x.recus || 0) + 1; dput('kv', x, PCK).catch(() => {}); }
    pcBandeau({ ok: '✅ « ' + r.nom + ' » est arrivé' });
    if ((S.where === 'home' || S.where === 'pc') && !S.shareOn && !document.querySelector('.sheet-bg')) shareNext();
    else toast('📥 « ' + r.nom + ' » est arrivé de ton ordinateur. Il t\'attend sur l\'accueil.', 5000);
  }
  /** Connexion coupée pendant une réception : ce qui était reçu est effacé */
  function pcCoupe(silence) {
    const r = PCT.rx; if (!r) return; PCT.rx = null; r.err = r.err || new Error('coupé');
    r.q.then(() => tx('vchunks', 'readwrite', (s) => s.delete(pcinRange(r.id)))).catch(() => {});
    pcGarderEcran(false);
    if (!silence) pcBandeau({ ko: 'La connexion avec ton ordinateur est coupée. Garde ScriptMove ouvert sur ton téléphone, puis renvoie « ' + r.nom + ' » depuis ton ordinateur.' });
  }
  /** Bandeau en haut de l'écran (reste affiché quel que soit l'écran) */
  let pcBTimer = null;
  function pcBandeau(fin) {
    let b = document.getElementById('pcrx');
    if (!b) { b = document.createElement('div'); b.id = 'pcrx'; b.setAttribute('role', 'status'); b.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:60;padding:10px 16px;background:#252d56;border-bottom:2px solid var(--line);box-shadow:0 6px 20px rgba(0,0,0,.4)'; document.body.appendChild(b); b.addEventListener('click', (e) => { if (e.target.closest('[data-pcx]')) b.remove(); }); }
    clearTimeout(pcBTimer);
    const r = PCT.rx;
    if (fin && fin.ko) b.innerHTML = '<div style="max-width:640px;margin:0 auto"><p style="margin:0 0 8px;font-weight:800;color:var(--ko)">⚠️ ' + esc(fin.ko) + '</p><button class="btn small sec" data-pcx="1" style="margin:0">OK</button></div>';
    else if (fin && fin.ok) { b.innerHTML = '<div style="max-width:640px;margin:0 auto;font-weight:800;color:var(--ok)">' + esc(fin.ok) + '</div>'; pcBTimer = setTimeout(() => b.remove(), 4000); }
    else if (r) {
      const f = r.taille ? Math.min(1, r.recu / r.taille) : 0;
      b.innerHTML = '<div style="max-width:640px;margin:0 auto"><p style="margin:0 0 6px;font-weight:800;font-size:16px;overflow-wrap:anywhere">💻 Réception de ton ordinateur : ' + esc(r.nom) + '</p><div class="bar"><i style="width:' + Math.round(f * 100) + '%;transition:none"></i></div><p class="mute" style="margin:4px 0 0">' + Math.round(f * 100) + ' % · ' + fmtSize(r.recu) + ' sur ' + fmtSize(r.taille) + ' · garde ScriptMove ouvert</p></div>';
    } else b.remove();
  }
  async function pcDemarrer() {
    if (!pcOk() || PCT.demarre) return; PCT.demarre = true;
    // blocs reçus d'un fichier qui n'a jamais été fini (appli fermée pendant l'envoi) : effacés
    try {
      const garde = new Set((await shareRaw()).filter((x) => x.pcChunks).map((x) => x.id));
      const ks = await tx('vchunks', 'readonly', (s) => s.getAllKeys(IDBKeyRange.bound('pcin_', 'pcin_￿')));
      const morts = new Set(); for (const k of ks || []) { const id = String(k).slice(5).split(':')[0]; if (!garde.has(id)) morts.add(id); }
      for (const id of morts) await tx('vchunks', 'readwrite', (s) => s.delete(pcinRange(id)));
    } catch (e) { /* rien */ }
    const boucle = async () => { try { await pcTour(); } catch (e) { /* rien */ } setTimeout(boucle, pcIci() ? 3000 : 4000); };
    setTimeout(boucle, 1500);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { setTimeout(() => pcTour().catch(() => {}), 500); if (PCT.rx) pcGarderEcran(true); } });
  }

  /* ======================= Démarrage ======================= */
  async function start() {
    await loadKV();
    try { await migrateAll(); } catch (e) { console.error('migration', e); }
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* rien */ }
    // v19 : un fichier reçu par « Partager › ScriptMove » attend d'être rangé
    if (/[?&]share=err/.test(location.search)) { shareCleanURL(); toast('Le fichier partagé n\'a pas pu être reçu. Réessaie.', 5000); }
    pcDemarrer();
    if (await shareNext()) return;
    scrHome();
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* rien */ }
  }
  S.api = { scrPc, pcRaw, shareRaw, scrShare, shareNext, sharePending, scrMixes, scrMix, scrPickMorceau, scrMixScript, doBackup, printCourse, scrHome, scrFolder, scrCourse, scrWrite, scrRead, scrPlay, scrCourseScript, setVideo, dget, dput, dall, saveCourse, scriptText, storeVideo, videoURL, photosOf, migrateAll, loadKV, getLivret, viewLivret, lvPageFor };
  scrLock();
})();
