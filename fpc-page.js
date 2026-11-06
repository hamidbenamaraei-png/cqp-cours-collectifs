/* Espace formateur CQP – page de l'ordinateur (fpc-r8w3m5.html) : on choisit où ranger, on glisse des musiques ou des documents,
   ils partent DIRECTEMENT au téléphone (WebRTC, chiffré de bout en bout), comme « 💻 Relier mon PC » de ScriptMove.
   Le relais (fpc-commun.js) ne sert qu'à se trouver : rien n'est gardé sur un serveur.
   Le téléphone envoie la liste de ses catégories de musiques et de ses dossiers (message « lieux ») dès que la connexion est ouverte. */
(function () {
  'use strict';
  const X = window.FPC;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (x) => x.toString(16).padStart(2, '0')).join('');
  const LU = 1024 * 1024, FENETRE = 32 * LU, TAMPON = 8 * LU;
  const ECRANS = ['#ecranCode', '#ecranCherche', '#ecranMuet', '#ecranEnvoi'];
  const montre = (id) => { for (const s of ECRANS) $(s).classList.toggle('hide', s !== id); };
  if (!X || !window.RTCPeerConnection || !window.crypto || !crypto.subtle) { $('#pasOk').classList.remove('hide'); return; }

  let lien = null, code = '';
  const ERR = {
    muet: 'Ton téléphone ne répond pas. Ouvre ton espace formateur sur ton téléphone (déverrouillé, écran allumé), puis clique sur « Renvoyer ».',
    direct: 'Impossible de joindre ton téléphone en direct sur ce réseau. Mets le téléphone et l\'ordinateur sur le même Wi-Fi, garde ton espace formateur ouvert, puis clique sur « Renvoyer ».',
    coupe: 'La connexion est coupée. Garde ton espace formateur ouvert sur ton téléphone, puis clique sur « Renvoyer ».',
    place: 'Pas assez de place sur ton téléphone pour ce fichier. Fais de la place, puis clique sur « Renvoyer ».',
    type: 'Ce n\'est pas une musique. Choisis « 📁 Mes documents » en haut, puis glisse-le de nouveau.',
    vide: 'Ce fichier est vide.',
    qui: 'Ton téléphone n\'a pas accepté ce fichier (l\'espace ouvert n\'est plus le même). Ouvre ton espace formateur, puis clique sur « Renvoyer ».',
    erreur: 'Ton téléphone n\'a pas réussi à garder ce fichier. Clique sur « Renvoyer ».',
    reseau: 'Pas de connexion internet sur cet ordinateur. Vérifie ta connexion, puis clique sur « Renvoyer ».',
    delie: 'Ton téléphone n\'est plus relié. Crée un nouveau code sur ton téléphone (📱 Mes appareils › 💻 Envoyer depuis mon PC).'
  };
  const erreur = (k) => Object.assign(new Error(k), { k });

  /* ---------- 1. le code ---------- */
  function nomOrdi() {
    const ua = navigator.userAgent || '';
    const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /CrOS/.test(ua) ? 'Chromebook' : /Linux/.test(ua) ? 'Linux' : '';
    const nav = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
    return 'Ordinateur' + (os ? ' ' + os : '') + (nav ? ' (' + nav + ')' : '');
  }
  async function relier(t) {
    const c = X.normaliser(t), m = $('#codeMsg');
    if (!c) { m.textContent = 'Ce code n\'est pas complet : il faut les 12 caractères affichés sur ton téléphone.'; return; }
    m.textContent = ''; const b = $('#relier'); b.disabled = true; b.textContent = 'Un instant…';
    try {
      const d = await X.deriver(c);
      const r = await X.rpc('pc_etat', { p_canal: d.canal });
      if (!r || !r.existe) { m.textContent = 'Ce code ne marche pas. Regarde le code sur ton téléphone (📱 Mes appareils › 💻 Envoyer depuis mon PC) et retape-le.'; montre('#ecranCode'); return; }
      await X.rpc('pc_relier', { p_canal: d.canal, p_pc: await X.chiffrerTexte(d.cle, nomOrdi(), 'pc') });
      lien = { canal: d.canal, cle: d.cle }; code = c;
      try { history.replaceState(null, '', location.pathname + '#' + c); } catch (e) { /* rien */ }
      $('#codeVu').textContent = '· code ' + X.joli(c);
      chercher();
    } catch (e) {
      m.textContent = e && e.reseau ? 'Pas de connexion internet. Vérifie ta connexion, puis réessaie.' : 'Le service ne répond pas pour le moment. Réessaie dans quelques minutes.';
      montre('#ecranCode');
    } finally { b.disabled = false; b.textContent = 'Relier'; }
  }
  /** On se connecte tout de suite : le téléphone nous donne ses catégories et ses dossiers */
  async function chercher() {
    montre('#ecranCherche');
    try { await connecter(); }
    catch (e) {
      const k = (e && e.k) || 'muet';
      if (k === 'delie') { lien = null; $('#codeMsg').textContent = ERR.delie; return montre('#ecranCode'); }
      $('#muetTxt').textContent = k === 'direct' ? ERR.direct : k === 'reseau' ? ERR.reseau : 'Ouvre ton espace formateur sur ton téléphone (déverrouillé, écran allumé), puis clique sur « Réessayer ».';
      return montre('#ecranMuet');
    }
    const t0 = Date.now(); while (!LIEUX && C && Date.now() - t0 < 8000) await sleep(200);
    dessinerLieux(); montre('#ecranEnvoi');
  }
  $('#relier').addEventListener('click', () => relier($('#code').value));
  $('#code').addEventListener('keydown', (e) => { if (e.key === 'Enter') relier($('#code').value); });
  $('#reessayer').addEventListener('click', () => { if (lien) chercher(); else montre('#ecranCode'); });
  $('#autre').addEventListener('click', () => { if (enCours) return; fermer(); lien = null; code = ''; LIEUX = null; try { history.replaceState(null, '', location.pathname); } catch (e) { /* rien */ } $('#code').value = ''; montre('#ecranCode'); });

  /* ---------- 2. où ranger (liste venue du téléphone) ---------- */
  let LIEUX = null, DEST = null; // DEST : 'mu' ou 'doc'
  const NOUVEAU = '__nouveau__';
  function dessinerLieux() {
    const L = LIEUX || { mu: null, dossiers: [] };
    if (!L.mu && DEST === 'mu') DEST = null;
    if (!DEST) DEST = L.mu ? 'mu' : 'doc';
    $('#dest').innerHTML = (L.mu ? '<button type="button" data-d="mu" class="' + (DEST === 'mu' ? 'on' : '') + '">🎵 Mes musiques<br><span class="mute" style="font-weight:600">(dont le Tabata)</span></button>' : '') +
      '<button type="button" data-d="doc" class="' + (DEST === 'doc' ? 'on' : '') + '">📁 Mes documents<br><span class="mute" style="font-weight:600">(PDF, images, Word…)</span></button>';
    $('#dest').querySelectorAll('[data-d]').forEach((b) => { b.onclick = () => { DEST = b.dataset.d; $('#destMsg').textContent = ''; dessinerLieux(); }; });
    $('#destMu').classList.toggle('hide', DEST !== 'mu');
    $('#destDoc').classList.toggle('hide', DEST !== 'doc');
    const remplir = (sel, opts, nv, vide) => {
      const avant = sel.value;
      sel.innerHTML = opts.map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + '</option>').join('') + '<option value="' + NOUVEAU + '">' + esc(vide) + '</option>';
      if (avant && Array.from(sel.options).some((o) => o.value === avant)) sel.value = avant;
      nv.classList.toggle('hide', sel.value !== NOUVEAU);
    };
    if (L.mu) remplir($('#selMu'), L.mu.map((c) => [c, c]), $('#nvMu'), '➕ Nouvelle catégorie…');
    remplir($('#selDoc'), (L.dossiers || []).map((d) => [d.id, d.nom + (d.n ? ' (' + d.n + ')' : '')]), $('#nvDoc'), '➕ Nouveau dossier…');
  }
  $('#selMu').addEventListener('change', () => { $('#nvMu').classList.toggle('hide', $('#selMu').value !== NOUVEAU); if ($('#selMu').value === NOUVEAU) $('#nvMu').focus(); });
  $('#selDoc').addEventListener('change', () => { $('#nvDoc').classList.toggle('hide', $('#selDoc').value !== NOUVEAU); if ($('#selDoc').value === NOUVEAU) $('#nvDoc').focus(); });
  /** La destination choisie maintenant (gardée avec chaque fichier), ou null avec un message */
  function destination() {
    const m = $('#destMsg'); m.textContent = '';
    if (DEST === 'mu' && LIEUX && LIEUX.mu) {
      const v = $('#selMu').value;
      if (v === NOUVEAU) { const n = $('#nvMu').value.trim(); if (!n) { m.textContent = 'Écris le nom de la nouvelle catégorie de musiques.'; $('#nvMu').focus(); return null; } return { k: 'mu', cat: n.slice(0, 60), txt: '🎵 Mes musiques › ' + n }; }
      return v ? { k: 'mu', cat: v, txt: '🎵 Mes musiques › ' + v } : null;
    }
    const v = $('#selDoc').value;
    if (v === NOUVEAU || !v) { const n = $('#nvDoc').value.trim(); if (!n) { m.textContent = 'Choisis un dossier, ou écris le nom du nouveau dossier.'; $('#nvDoc').focus(); return null; } return { k: 'doc', nouveau: n.slice(0, 60), txt: '📁 ' + n }; }
    const d = (LIEUX && LIEUX.dossiers || []).find((x) => x.id === v);
    return { k: 'doc', dossier: v, txt: '📁 ' + (d ? d.nom : 'Mes documents') };
  }

  /* ---------- 3. la connexion directe ---------- */
  let C = null; // { pc, dc, s, attente: Set<fn>, ack: {}, msgs: [] }
  const lus = new Set();
  function fermer() { if (!C) return; try { C.dc.close(); } catch (e) { /* rien */ } try { C.pc.close(); } catch (e) { /* rien */ } C = null; }
  const reveiller = (c) => { for (const f of Array.from(c.attente)) f(); };
  function attendre(c, ms) { return new Promise((res) => { const f = () => { clearTimeout(t); c.attente.delete(f); res(); }; const t = setTimeout(f, ms); c.attente.add(f); }); }
  async function connecter() {
    if (C && C.dc.readyState === 'open') return C;
    fermer();
    const pc = new RTCPeerConnection({ iceServers: X.ICE });
    const dc = pc.createDataChannel('fp', { ordered: true });
    dc.binaryType = 'arraybuffer'; dc.bufferedAmountLowThreshold = LU;
    const c = C = { pc, dc, s: rid(), attente: new Set(), ack: {}, msgs: [] };
    dc.onbufferedamountlow = () => reveiller(c);
    dc.onmessage = (e) => {
      let o = null; try { o = JSON.parse(e.data); } catch (er) { return; }
      if (o && o.t === 'ack') c.ack[o.id] = +o.n || 0;
      else if (o && o.t === 'lieux') { LIEUX = { mu: Array.isArray(o.mu) ? o.mu.map(String) : null, dossiers: Array.isArray(o.dossiers) ? o.dossiers : [] }; if (!$('#ecranEnvoi').classList.contains('hide')) dessinerLieux(); }
      else c.msgs.push(o);
      reveiller(c);
    };
    dc.onopen = () => { try { dc.send(JSON.stringify({ t: 'lieux?' })); } catch (e) { /* rien */ } };
    dc.onclose = () => { c.ferme = true; reveiller(c); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') { c.ferme = true; reveiller(c); } };
    await pc.setLocalDescription(await pc.createOffer());
    await X.adresses(pc, 5000);
    let mid;
    try { mid = await X.poster(lien, 'pc', { t: 'offre', s: c.s, sdp: pc.localDescription.sdp }); }
    catch (e) { fermer(); throw erreur(e && e.reseau ? 'reseau' : 'muet'); }
    // la réponse du téléphone (il regarde toutes les 3 à 4 secondes quand l'espace formateur est ouvert)
    let rep = null; const t0 = Date.now();
    while (!rep && Date.now() - t0 < 40000) {
      await sleep(1500);
      let r = null; try { r = await X.relever(lien); } catch (e) { continue; }
      if (!r.existe) { fermer(); throw erreur('delie'); }
      for (const m of r.msgs) {
        if (m.de !== 'tel' || lus.has(m.id)) continue;
        lus.add(m.id); const o = await X.lire(lien, m.id); X.effacer(lien, m.id);
        if (o && o.t === 'reponse' && o.s === c.s) rep = o;
      }
    }
    if (!rep) { X.effacer(lien, mid); fermer(); throw erreur('muet'); }
    await pc.setRemoteDescription({ type: 'answer', sdp: rep.sdp });
    const t1 = Date.now();
    while (dc.readyState !== 'open' && !c.ferme && Date.now() - t1 < 25000) await attendre(c, 500);
    if (dc.readyState !== 'open') { fermer(); throw erreur('direct'); }
    return c;
  }
  async function reponse(c, id, types, ms) {
    const t0 = Date.now();
    for (;;) {
      const i = c.msgs.findIndex((o) => o && o.id === id && types.includes(o.t));
      if (i >= 0) return c.msgs.splice(i, 1)[0];
      if (c.ferme || c.dc.readyState !== 'open') throw erreur('coupe');
      if (Date.now() - t0 > ms) throw erreur('coupe');
      await attendre(c, 1000);
    }
  }

  /* ---------- 4. les fichiers ---------- */
  const file = []; let enCours = false;
  const EXT_MU = /\.(mp3|m4a|wav|aac|ogg|oga|opus|flac|wma|amr)$/i;
  const estMusique = (f) => /^audio\//.test(f.type || '') || EXT_MU.test(f.name || '');
  const icone = (f) => estMusique(f) ? '🎵 ' : /\.pdf$/i.test(f.name) ? '📕 ' : /^image\//.test(f.type || '') ? '🖼️ ' : '📄 ';
  function ajouter(files) {
    if (!files.length) return;
    const d = destination(); if (!d) { $('#destMsg').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    for (const f of files) {
      const el = document.createElement('div'); el.className = 'f';
      $('#liste').appendChild(el);
      const it = { f, el, etat: 'attente', fait: 0, d };
      if (!f.size) { it.etat = 'refus'; dessiner(it, ERR.vide); continue; }
      if (d.k === 'mu' && !estMusique(f)) { it.etat = 'refus'; dessiner(it, ERR.type); continue; }
      dessiner(it); file.push(it);
    }
    suivant();
  }
  function dessiner(it, txt) {
    const pct = it.f.size ? Math.min(100, Math.round(it.fait / it.f.size * 100)) : 0;
    const etat = { attente: '⏳ En attente…', connexion: '⏳ Je cherche ton téléphone…', envoi: '📤 Envoi : ' + pct + ' % (' + X.taille(it.fait) + ' sur ' + X.taille(it.f.size) + ')', fin: '⏳ Ton téléphone range le fichier…', ok: 'Arrivé sur ton téléphone ✓', ko: '⚠️ ' + (txt || ''), refus: '⚠️ ' + (txt || '') }[it.etat];
    it.el.className = 'f' + (it.etat === 'ok' ? ' fini' : '');
    it.el.innerHTML = '<div class="n">' + icone(it.f) + esc(it.f.name) + ' <span class="mute">· ' + X.taille(it.f.size) + '</span></div>' +
      '<div class="mute">→ ' + esc(it.d.txt) + '</div>' +
      (it.etat === 'refus' ? '' : '<div class="bar"><i style="width:' + (it.etat === 'ok' ? 100 : pct) + '%"></i></div>') +
      '<div class="row"><p class="e' + (it.etat === 'ok' ? ' ok' : it.etat === 'ko' || it.etat === 'refus' ? ' ko' : '') + '" style="flex:1;margin:6px 0 0">' + esc(etat) + '</p>' +
      (it.etat === 'ko' ? '<button class="btn small" data-re="1" style="margin-top:6px">Renvoyer</button>' : '') + '</div>';
    const b = it.el.querySelector('[data-re]'); if (b) b.onclick = () => { if (!lien) return; it.etat = 'attente'; it.fait = 0; dessiner(it); file.push(it); suivant(); };
  }
  async function suivant() {
    if (enCours) return; const it = file.shift(); if (!it) return;
    enCours = true;
    try { await envoyer(it); it.etat = 'ok'; dessiner(it); }
    catch (e) {
      const k = (e && e.k) || 'coupe'; it.etat = k === 'type' || k === 'vide' ? 'refus' : 'ko'; dessiner(it, ERR[k] || ERR.coupe);
      if (k === 'muet' || k === 'direct' || k === 'delie' || k === 'reseau' || k === 'qui') { for (const o of file.splice(0)) { o.etat = 'ko'; dessiner(o, ERR[k]); } }
      if (k === 'delie') { lien = null; setTimeout(() => { $('#codeMsg').textContent = ERR.delie; montre('#ecranCode'); }, 3000); }
    } finally { enCours = false; }
    suivant();
  }
  async function envoyer(it) {
    it.etat = 'connexion'; dessiner(it);
    const c = await connecter();
    const id = rid(), f = it.f, dc = c.dc, d = it.d;
    const dest = d.k === 'mu' ? { k: 'mu', cat: d.cat } : d.dossier ? { k: 'doc', dossier: d.dossier } : { k: 'doc', nouveau: d.nouveau };
    dc.send(JSON.stringify({ t: 'f', id, nom: f.name, type: f.type || '', taille: f.size, dest }));
    const r0 = await reponse(c, id, ['go', 'non'], 30000);
    if (r0.t === 'non') throw erreur(ERR[r0.raison] ? r0.raison : 'erreur');
    it.etat = 'envoi'; it.fait = 0; dessiner(it); c.ack[id] = 0;
    let off = 0, vu = 0;
    while (off < f.size) {
      const part = new Uint8Array(await f.slice(off, Math.min(f.size, off + LU)).arrayBuffer());
      for (let p = 0; p < part.length; p += X.BLOC) {
        // on attend que le téléphone ait écrit ce qu'il a reçu (il n'a jamais trop en mémoire)
        while (!c.ferme && dc.readyState === 'open' && (dc.bufferedAmount > TAMPON || off + p - c.ack[id] > FENETRE)) {
          const nok = c.msgs.find((o) => o && o.id === id && o.t === 'non'); if (nok) throw erreur(nok.raison === 'place' ? 'place' : 'erreur');
          await attendre(c, 1000);
        }
        if (c.ferme || dc.readyState !== 'open') throw erreur('coupe');
        dc.send(part.subarray(p, Math.min(part.length, p + X.BLOC)));
      }
      off += part.length;
      if (Date.now() - vu > 300) { vu = Date.now(); it.fait = Math.max(c.ack[id], off - dc.bufferedAmount); dessiner(it); }
    }
    dc.send(JSON.stringify({ t: 'fin', id }));
    it.etat = 'fin'; it.fait = f.size; dessiner(it);
    const r1 = await reponse(c, id, ['ok', 'non'], 180000);
    if (r1.t === 'non') throw erreur(ERR[r1.raison] ? r1.raison : 'erreur');
    // un nouveau dossier ou une nouvelle catégorie vient d'être créé : les fichiers suivants iront dedans
    if (d.nouveau && r1.dossier) { for (const o of file) if (o.d === d) { o.d = { k: 'doc', dossier: r1.dossier, txt: d.txt }; } }
  }

  /* ---------- glisser-déposer ---------- */
  const zone = $('#zone');
  $('#choix').addEventListener('change', (e) => { ajouter(Array.from(e.target.files || [])); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); if (lien) zone.classList.add('sur'); }));
  ['dragleave', 'dragend'].forEach((t) => document.addEventListener(t, (e) => { if (!e.relatedTarget) zone.classList.remove('sur'); }));
  document.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('sur'); if (!lien || $('#ecranEnvoi').classList.contains('hide')) return; ajouter(Array.from((e.dataTransfer && e.dataTransfer.files) || [])); });
  window.addEventListener('beforeunload', (e) => { if (enCours || file.length) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- départ : le code vient du lien (…/fpc-r8w3m5.html#CODE) ou est tapé ---------- */
  const h = X.normaliser(decodeURIComponent(location.hash.slice(1)));
  montre('#ecranCode');
  if (h) { $('#code').value = X.joli(h); relier(h); } else setTimeout(() => $('#code').focus(), 50);
})();
