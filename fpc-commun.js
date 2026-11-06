/* Espace formateur CQP – « 💻 Envoyer depuis mon PC » : outils communs au téléphone (f-l93i4ev.html) et à la page de
   l'ordinateur (fpc-r8w3m5.html). Copie de sm-7q4x/pc-commun.js (ScriptMove), avec son PROPRE sel ('cqp-formateur-pc-v1')
   et sa propre marque : les codes, canaux et clés ne se mélangent jamais avec ceux de ScriptMove.
   - le téléphone tire un code de 12 caractères ; ce code donne (PBKDF2, 200 000 tours) un « canal » et une clé AES-GCM 256 bits
     qui ne quitte jamais le téléphone ni l'ordinateur ;
   - le relais (fonctions Supabase pc_canal_creer, pc_etat, pc_relier, pc_envoyer, pc_liste, pc_morceau, pc_effacer,
     pc_canal_supprimer) est utilisé tel quel, sans rien y changer, seulement pour de petits messages chiffrés (se trouver) ;
   - les fichiers passent DIRECTEMENT de l'ordinateur au téléphone (WebRTC, chiffré de bout en bout) : rien n'est gardé
     sur un serveur. */
(function (root) {
  'use strict';
  const CFG = { url: 'https://zcbhnmqykfxzlgxbubgi.supabase.co', cle: 'sb_publishable_4_D2HnqgFolxoI002UJ-BQ_4nQAj2HF' }; // clé publique (faite pour être dans une page)
  const ALPHA = '23456789ABCDEFGHJKMNPQRSTVWXYZ', LONG = 12, SEL = 'cqp-formateur-pc-v1', TOURS = 200000;
  const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }, { urls: 'stun:stun.cloudflare.com:3478' }];
  const BLOC = 64 * 1024; // un message du canal direct
  const te = new TextEncoder(), td = new TextDecoder();
  const sub = () => root.crypto && root.crypto.subtle;
  const b64e = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const b64d = (s) => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const hex = (u) => Array.from(u, (x) => x.toString(16).padStart(2, '0')).join('');
  const auHasard = (n) => root.crypto.getRandomValues(new Uint8Array(n));

  /* ---------- le code ---------- */
  function nouveauCode() { let s = ''; while (s.length < LONG) { for (const x of auHasard(32)) if (x < 240 && s.length < LONG) s += ALPHA[x % 30]; } return s; }
  function normaliser(t) { const s = String(t || '').toUpperCase().replace(/[\s\-_.·–—#]/g, ''); return s.length === LONG && Array.from(s).every((c) => ALPHA.includes(c)) ? s : ''; }
  const joli = (c) => String(c || '').replace(/(.{4})(?=.)/g, '$1-');
  async function deriver(code) {
    const c = normaliser(code); if (!c) throw new Error('code');
    const base = await sub().importKey('raw', te.encode(c), 'PBKDF2', false, ['deriveBits']);
    const bits = new Uint8Array(await sub().deriveBits({ name: 'PBKDF2', salt: te.encode(SEL), iterations: TOURS, hash: 'SHA-256' }, base, 384));
    const brut = bits.slice(0, 32);
    return { code: c, canal: hex(bits.slice(32, 48)), cleB64: b64e(brut), cle: await importer(b64e(brut)) };
  }
  const importer = (b) => sub().importKey('raw', b64d(b), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  async function chiffrer(cle, bytes, aad) {
    const iv = auHasard(12), ct = new Uint8Array(await sub().encrypt({ name: 'AES-GCM', iv, additionalData: te.encode(aad) }, cle, bytes));
    const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return b64e(out);
  }
  async function dechiffrer(cle, b64, aad) { const u = b64d(b64); return new Uint8Array(await sub().decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12), additionalData: te.encode(aad) }, cle, u.subarray(12))); }
  const chiffrerTexte = (cle, t, aad) => chiffrer(cle, te.encode(t), aad);
  const dechiffrerTexte = async (cle, b, aad) => td.decode(await dechiffrer(cle, b, aad));

  /* ---------- le relais (fonctions Supabase) ---------- */
  async function rpc(fn, args, ms) {
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null, t = ctl ? setTimeout(() => ctl.abort(), ms || 20000) : 0;
    let r;
    try { r = await fetch(CFG.url + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: CFG.cle, Authorization: 'Bearer ' + CFG.cle }, body: JSON.stringify(args || {}), signal: ctl ? ctl.signal : undefined, cache: 'no-store' }); }
    catch (e) { const x = new Error('reseau'); x.reseau = true; throw x; } finally { if (t) clearTimeout(t); }
    const txt = await r.text(); if (!r.ok) { const x = new Error('relais ' + r.status); x.statut = r.status; throw x; }
    return txt ? JSON.parse(txt) : null;
  }
  /* Petits messages chiffrés (un « fichier » d'un seul morceau du relais). de : 'pc' ou 'tel'. */
  async function poster(lien, de, obj) {
    const id = hex(auHasard(16));
    const info = await chiffrerTexte(lien.cle, JSON.stringify({ fp: 1, de }), id + '|info');
    const r = await rpc('pc_envoyer', { p_canal: lien.canal, p_fichier: id, p_n: 0, p_total: 1, p_info: info, p_donnees: await chiffrerTexte(lien.cle, JSON.stringify(obj), id + '|0|1') });
    if (!r || !r.ok) { const x = new Error((r && r.raison) || 'refus'); x.raison = r && r.raison; throw x; }
    return id;
  }
  const qui = new Map(); // fichier → expéditeur (déjà déchiffré)
  /** Ce qui attend sur le relais : { existe, pc (chiffré), msgs: [{id, de, le}] } */
  async function relever(lien) {
    const r = await rpc('pc_liste', { p_canal: lien.canal });
    if (!r || r.existe === false) return { existe: false, msgs: [] };
    const msgs = [];
    for (const f of Array.isArray(r.fichiers) ? r.fichiers : []) {
      if (!f || !/^[0-9a-f]{32}$/.test(f.fichier || '')) continue;
      let de = qui.get(f.fichier);
      if (de === undefined) { de = ''; try { const m = JSON.parse(await dechiffrerTexte(lien.cle, f.info, f.fichier + '|info')); if (m && m.fp) de = String(m.de || ''); } catch (e) { /* pas à nous */ } qui.set(f.fichier, de); }
      if (de) msgs.push({ id: f.fichier, de, le: Date.parse(f.le) || Date.now() });
    }
    return { existe: true, pc: r.pc || '', msgs };
  }
  async function lire(lien, id) {
    const b = await rpc('pc_morceau', { p_canal: lien.canal, p_fichier: id, p_n: 0 });
    if (typeof b !== 'string' || !b) return null;
    try { return JSON.parse(await dechiffrerTexte(lien.cle, b, id + '|0|1')); } catch (e) { return null; }
  }
  const effacer = (lien, id) => rpc('pc_effacer', { p_canal: lien.canal, p_fichier: id }).then(() => { qui.delete(id); }, () => {});

  /* ---------- WebRTC : on attend toutes les adresses (une seule offre, une seule réponse) ---------- */
  function adresses(pc, ms) {
    return new Promise((res) => {
      if (pc.iceGatheringState === 'complete') return res();
      const fin = () => { pc.removeEventListener('icegatheringstatechange', ch); clearTimeout(t); res(); };
      const ch = () => { if (pc.iceGatheringState === 'complete') fin(); };
      const t = setTimeout(fin, ms || 5000);
      pc.addEventListener('icegatheringstatechange', ch);
    });
  }
  const taille = (b) => { b = b || 0; if (b < 1e9) return Math.max(1, Math.round(b / 1e6)) + ' Mo'; return (b / 1e9).toFixed(1).replace('.', ',') + ' Go'; };

  root.FPC = { CFG, ALPHA, LONG, ICE, BLOC, nouveauCode, normaliser, joli, deriver, importer, chiffrerTexte, dechiffrerTexte, rpc, poster, relever, lire, effacer, adresses, taille };
})(typeof window !== 'undefined' ? window : globalThis);
