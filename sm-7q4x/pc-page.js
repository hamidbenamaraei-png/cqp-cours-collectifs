/* ScriptMove – page de l'ordinateur (pc.html) : on glisse des vidéos et des musiques, elles partent DIRECTEMENT au téléphone
   (WebRTC, chiffré de bout en bout). Le relais (pc-commun.js) ne sert qu'à se trouver : rien n'est stocké sur un serveur. */
(function () {
  'use strict';
  const X = window.SMPC;
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (x) => x.toString(16).padStart(2, '0')).join('');
  const LU = 1024 * 1024, FENETRE = 32 * LU, TAMPON = 8 * LU;
  const montre = (id) => { for (const s of ['#ecranCode', '#ecranEnvoi']) $(s).classList.toggle('hide', s !== id); };
  if (!X || !window.RTCPeerConnection || !window.crypto || !crypto.subtle) { $('#pasOk').classList.remove('hide'); return; }

  let lien = null, code = '';
  const ERR = {
    muet: 'Ton téléphone ne répond pas. Ouvre ScriptMove sur ton téléphone (déverrouillé, écran allumé), puis clique sur « Renvoyer ».',
    direct: 'Impossible de joindre ton téléphone en direct sur ce réseau. Mets le téléphone et l\'ordinateur sur le même Wi-Fi, garde ScriptMove ouvert, puis clique sur « Renvoyer ».',
    coupe: 'La connexion est coupée. Garde ScriptMove ouvert sur ton téléphone, puis clique sur « Renvoyer ».',
    place: 'Pas assez de place sur ton téléphone pour ce fichier. Fais de la place, puis clique sur « Renvoyer ».',
    type: 'Ce n\'est ni une vidéo ni une musique : ScriptMove ne le prend pas.',
    erreur: 'Ton téléphone n\'a pas réussi à garder ce fichier. Clique sur « Renvoyer ».',
    reseau: 'Pas de connexion internet sur cet ordinateur. Vérifie ta connexion, puis clique sur « Renvoyer ».',
    delie: 'Ton téléphone n\'est plus relié. Crée un nouveau code sur ton téléphone (ScriptMove › 💻 Relier mon PC).'
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
      if (!r || !r.existe) { m.textContent = 'Ce code ne marche pas. Regarde le code sur ton téléphone (ScriptMove › 💻 Relier mon PC) et retape-le.'; montre('#ecranCode'); return; }
      await X.rpc('pc_relier', { p_canal: d.canal, p_pc: await X.chiffrerTexte(d.cle, nomOrdi(), 'pc') });
      lien = { canal: d.canal, cle: d.cle }; code = c;
      try { history.replaceState(null, '', location.pathname + '#' + c); } catch (e) { /* rien */ }
      $('#codeVu').textContent = '· code ' + X.joli(c); montre('#ecranEnvoi');
    } catch (e) {
      m.textContent = e && e.reseau ? 'Pas de connexion internet. Vérifie ta connexion, puis réessaie.' : 'Le service ne répond pas pour le moment. Réessaie dans quelques minutes.';
      montre('#ecranCode');
    } finally { b.disabled = false; b.textContent = 'Relier'; }
  }
  $('#relier').addEventListener('click', () => relier($('#code').value));
  $('#code').addEventListener('keydown', (e) => { if (e.key === 'Enter') relier($('#code').value); });
  $('#autre').addEventListener('click', () => { if (enCours) return; fermer(); lien = null; code = ''; try { history.replaceState(null, '', location.pathname); } catch (e) { /* rien */ } $('#code').value = ''; montre('#ecranCode'); });

  /* ---------- 2. la connexion directe ---------- */
  let C = null; // { pc, dc, s, attente: Set<fn>, ack: {} }
  const lus = new Set();
  function fermer() { if (!C) return; try { C.dc.close(); } catch (e) { /* rien */ } try { C.pc.close(); } catch (e) { /* rien */ } C = null; }
  const reveiller = (c) => { for (const f of Array.from(c.attente)) f(); };
  function attendre(c, ms) { return new Promise((res) => { const f = () => { clearTimeout(t); c.attente.delete(f); res(); }; const t = setTimeout(f, ms); c.attente.add(f); }); }
  async function connecter() {
    if (C && C.dc.readyState === 'open') return C;
    fermer();
    const pc = new RTCPeerConnection({ iceServers: X.ICE });
    const dc = pc.createDataChannel('sm', { ordered: true });
    dc.binaryType = 'arraybuffer'; dc.bufferedAmountLowThreshold = LU;
    const c = C = { pc, dc, s: rid(), attente: new Set(), ack: {}, msgs: [] };
    dc.onbufferedamountlow = () => reveiller(c);
    dc.onmessage = (e) => { let o = null; try { o = JSON.parse(e.data); } catch (er) { return; } if (o && o.t === 'ack') c.ack[o.id] = +o.n || 0; else c.msgs.push(o); reveiller(c); };
    dc.onclose = () => { c.ferme = true; reveiller(c); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed' || pc.connectionState === 'closed') { c.ferme = true; reveiller(c); } };
    await pc.setLocalDescription(await pc.createOffer());
    await X.adresses(pc, 5000);
    let mid;
    try { mid = await X.poster(lien, 'pc', { t: 'offre', s: c.s, sdp: pc.localDescription.sdp }); }
    catch (e) { fermer(); throw erreur(e && e.reseau ? 'reseau' : 'muet'); }
    // la réponse du téléphone (il regarde toutes les 3 à 4 secondes quand ScriptMove est ouvert)
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

  /* ---------- 3. les fichiers ---------- */
  const file = []; let enCours = false;
  const estMedia = (f) => /^(video|audio)\//.test(f.type || '') || /\.(mp4|mov|m4v|webm|mkv|avi|3gp|mp3|m4a|wav|aac|ogg|oga|opus|flac|wma)$/i.test(f.name || '');
  function ajouter(files) {
    for (const f of files) {
      const el = document.createElement('div'); el.className = 'f';
      $('#liste').appendChild(el);
      const it = { f, el, etat: 'attente', fait: 0 };
      if (!estMedia(f)) { it.etat = 'refus'; dessiner(it, ERR.type); continue; }
      dessiner(it); file.push(it);
    }
    suivant();
  }
  function dessiner(it, txt) {
    const pct = it.f.size ? Math.min(100, Math.round(it.fait / it.f.size * 100)) : 0;
    const etat = { attente: '⏳ En attente…', connexion: '⏳ Je cherche ton téléphone…', envoi: '📤 Envoi : ' + pct + ' % (' + X.taille(it.fait) + ' sur ' + X.taille(it.f.size) + ')', fin: '⏳ Ton téléphone termine…', ok: '✅ Arrivé dans ScriptMove', ko: '⚠️ ' + (txt || ''), refus: '⚠️ ' + (txt || '') }[it.etat];
    it.el.className = 'f' + (it.etat === 'ok' ? ' fini' : '');
    it.el.innerHTML = '<div class="n">' + (/^audio\//.test(it.f.type) || /\.(mp3|m4a|wav|aac|ogg|oga|opus|flac|wma)$/i.test(it.f.name) ? '🎵 ' : '🎬 ') + esc(it.f.name) + ' <span class="mute">· ' + X.taille(it.f.size) + '</span></div>' +
      (it.etat === 'refus' ? '' : '<div class="bar"><i style="width:' + (it.etat === 'ok' ? 100 : pct) + '%"></i></div>') +
      '<div class="row"><p class="e' + (it.etat === 'ok' ? ' ok' : it.etat === 'ko' || it.etat === 'refus' ? ' ko' : '') + '" style="flex:1;margin:6px 0 0">' + esc(etat) + '</p>' +
      (it.etat === 'ko' ? '<button class="btn small" data-re="1" style="margin-top:6px">Renvoyer</button>' : '') + '</div>';
    const b = it.el.querySelector('[data-re]'); if (b) b.onclick = () => { it.etat = 'attente'; it.fait = 0; dessiner(it); file.push(it); suivant(); };
  }
  async function suivant() {
    if (enCours) return; const it = file.shift(); if (!it) return;
    enCours = true;
    try { await envoyer(it); it.etat = 'ok'; dessiner(it); }
    catch (e) {
      const k = (e && e.k) || 'coupe'; it.etat = k === 'type' ? 'refus' : 'ko'; dessiner(it, ERR[k] || ERR.coupe);
      if (k === 'muet' || k === 'direct' || k === 'delie' || k === 'reseau') { for (const o of file.splice(0)) { o.etat = 'ko'; dessiner(o, ERR[k]); } }
      if (k === 'delie') { lien = null; setTimeout(() => { $('#codeMsg').textContent = ERR.delie; montre('#ecranCode'); }, 3000); }
    } finally { enCours = false; }
    suivant();
  }
  async function envoyer(it) {
    it.etat = 'connexion'; dessiner(it);
    const c = await connecter();
    const id = rid(), f = it.f, dc = c.dc;
    dc.send(JSON.stringify({ t: 'f', id, nom: f.name, type: f.type || '', taille: f.size }));
    const r0 = await reponse(c, id, ['go', 'non'], 30000);
    if (r0.t === 'non') throw erreur(r0.raison === 'place' ? 'place' : r0.raison === 'type' ? 'type' : 'erreur');
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
    if (r1.t === 'non') throw erreur(r1.raison === 'place' ? 'place' : 'erreur');
  }

  /* ---------- glisser-déposer ---------- */
  const zone = $('#zone');
  $('#choix').addEventListener('change', (e) => { ajouter(Array.from(e.target.files || [])); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); if (lien) zone.classList.add('sur'); }));
  ['dragleave', 'dragend'].forEach((t) => document.addEventListener(t, (e) => { if (!e.relatedTarget) zone.classList.remove('sur'); }));
  document.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('sur'); if (!lien) return; ajouter(Array.from((e.dataTransfer && e.dataTransfer.files) || [])); });
  window.addEventListener('beforeunload', (e) => { if (enCours || file.length) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- départ : le code vient du lien (…/pc.html#CODE) ou est tapé ---------- */
  const h = X.normaliser(decodeURIComponent(location.hash.slice(1)));
  montre('#ecranCode');
  if (h) { $('#code').value = X.joli(h); relier(h); } else setTimeout(() => $('#code').focus(), 50);
})();
