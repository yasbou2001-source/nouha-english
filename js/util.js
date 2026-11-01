'use strict';
/* Nouha English — utilities */
const LEVELS = ['A1.1', 'A1.2', 'A2.1', 'A2.2'];
const LEVEL_NAMES = { 'A1.1': 'Lbidaya', 'A1.2': 'Mobtadi2a', 'A2.1': 'Assassi 1', 'A2.2': 'Assassi 2' };

const ICONS = {
  speaker: '<svg viewBox="0 0 24 24"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/><path d="M8 22h8"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 0 2 2h14"/></svg>',
  headphones: '<svg viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/></svg>',
  read: '<svg viewBox="0 0 24 24"><path d="M12 6a4 4 0 0 0-4-2H3v14h5a4 4 0 0 1 4 2"/><path d="M12 6a4 4 0 0 1 4-2h5v14h-5a4 4 0 0 0-4 2"/><path d="M12 6v14"/></svg>',
  pen: '<svg viewBox="0 0 24 24"><path d="m3 21 3-1 12-12-2-2L4 18z"/><path d="m14 6 2 2"/></svg>',
  cards: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="12" height="16" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M6 4v16l14-8z"/></svg>',
  stop: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 17h.01"/></svg>',
};
function icon(name) { return el('span', { class: 'ico', html: ICONS[name] || '' }); }

function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function el(tag, attrs, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (v === true) e.setAttribute(k, '');
    else e.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    e.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function sample(a, n) { return shuffle(a).slice(0, n); }
function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
function todayKey(d = new Date()) { const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
function daysBetween(k1, k2) { return Math.round((new Date(k2 + 'T00:00:00') - new Date(k1 + 'T00:00:00')) / 86400000); }
function fmtDate(ts) { const d = new Date(ts); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

/* ---------- English normalisation & comparison ---------- */
const CONTRACTIONS = [
  [/\bi'm\b/g, 'i am'], [/\byou're\b/g, 'you are'], [/\bhe's\b/g, 'he is'], [/\bshe's\b/g, 'she is'], [/\bit's\b/g, 'it is'],
  [/\bwe're\b/g, 'we are'], [/\bthey're\b/g, 'they are'], [/\bwhat's\b/g, 'what is'], [/\bwhere's\b/g, 'where is'], [/\bwho's\b/g, 'who is'],
  [/\bhow's\b/g, 'how is'], [/\bthat's\b/g, 'that is'], [/\bthere's\b/g, 'there is'], [/\bhere's\b/g, 'here is'], [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'], [/\bwasn't\b/g, 'was not'], [/\bweren't\b/g, 'were not'], [/\bdon't\b/g, 'do not'], [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'], [/\bcan't\b/g, 'can not'], [/\bcannot\b/g, 'can not'], [/\bcouldn't\b/g, 'could not'], [/\bwon't\b/g, 'will not'],
  [/\bwouldn't\b/g, 'would not'], [/\bshouldn't\b/g, 'should not'], [/\bmustn't\b/g, 'must not'], [/\bhaven't\b/g, 'have not'], [/\bhasn't\b/g, 'has not'],
  [/\bhadn't\b/g, 'had not'], [/\bi'll\b/g, 'i will'], [/\byou'll\b/g, 'you will'], [/\bhe'll\b/g, 'he will'], [/\bshe'll\b/g, 'she will'],
  [/\bwe'll\b/g, 'we will'], [/\bthey'll\b/g, 'they will'], [/\bit'll\b/g, 'it will'], [/\bi've\b/g, 'i have'], [/\byou've\b/g, 'you have'],
  [/\bwe've\b/g, 'we have'], [/\bthey've\b/g, 'they have'], [/\bi'd\b/g, 'i would'], [/\byou'd\b/g, 'you would'], [/\bhe'd\b/g, 'he would'],
  [/\bshe'd\b/g, 'she would'], [/\bwe'd\b/g, 'we would'], [/\bthey'd\b/g, 'they would'], [/\blet's\b/g, 'let us'], [/\bokay\b/g, 'ok'],
  [/\bmister\b/g, 'mr'], [/\bmrs\b/g, 'missus'],
];
const ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
function numWordsToDigits(s) {
  const t = s.split(' '); const out = [];
  for (let i = 0; i < t.length; i++) {
    let w = t[i];
    if (w in TENS) { let v = TENS[w]; if (t[i + 1] in ONES && ONES[t[i + 1]] < 10) { v += ONES[t[i + 1]]; i++; } out.push(String(v)); }
    else if (w in ONES) {
      let v = ONES[w];
      if (t[i + 1] === 'hundred') { v *= 100; i++; if (t[i + 1] === 'and') i++; if (t[i + 1] in TENS) { v += TENS[t[i + 1]]; i++; if (t[i + 1] in ONES && ONES[t[i + 1]] < 10) { v += ONES[t[i + 1]]; i++; } } else if (t[i + 1] in ONES) { v += ONES[t[i + 1]]; i++; } }
      out.push(String(v));
    } else out.push(w);
  }
  return out.join(' ');
}
function normalizeEn(s) {
  s = String(s || '').toLowerCase().replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/\s+/g, ' ').trim();
  for (const [re, rep] of CONTRACTIONS) s = s.replace(re, rep);
  s = s.replace(/[^a-z0-9' ]+/g, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim();
  return numWordsToDigits(s);
}
function levenshtein(a, b) {
  if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
  let prev = new Array(b.length + 1); for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
function similarity(a, b) { a = normalizeEn(a); b = normalizeEn(b); if (!a && !b) return 1; return 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1); }
const HOMOPHONES = [['to', 'too', 'two', '2'], ['there', 'their', 'theyre'], ['your', 'youre'], ['its'], ['i', 'eye'], ['for', 'four', '4'], ['know', 'no'], ['right', 'write'], ['see', 'sea'], ['one', 'won', '1'], ['hi', 'high'], ['by', 'buy', 'bye'], ['meet', 'meat'], ['our', 'hour'], ['hear', 'here'], ['wear', 'where'], ['week', 'weak'], ['son', 'sun'], ['be', 'bee'], ['ate', 'eight', '8'], ['read', 'red'], ['new', 'knew'], ['sarah', 'sara'], ['nouha', 'noha', 'nuha'], ['mr', 'mister'], ['ok', 'okay']];
const HOMO_MAP = {}; HOMOPHONES.forEach((g, i) => g.forEach(w => { HOMO_MAP[w] = i; }));
function wordsAlike(x, y) {
  if (x === y) return true;
  if (HOMO_MAP[x] != null && HOMO_MAP[x] === HOMO_MAP[y]) return true;
  if (x.length > 3 && y.length > 3) return (1 - levenshtein(x, y) / Math.max(x.length, y.length)) >= 0.7;
  return false;
}
function alignWords(target, said) {
  const T = normalizeEn(target).split(' ').filter(Boolean), S = normalizeEn(said).split(' ').filter(Boolean);
  const n = T.length, m = S.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = wordsAlike(T[i], S[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const words = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (wordsAlike(T[i], S[j])) { words.push({ w: T[i], ok: true }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { words.push({ w: T[i], ok: false }); i++; }
    else j++;
  }
  while (i < n) { words.push({ w: T[i], ok: false }); i++; }
  const matched = words.filter(w => w.ok).length;
  return { words, score: n ? Math.round(100 * matched / n) : 0 };
}
function looksDarija(s) {
  return /[379]/.test(s) || /\b(dyal|wach|chno|kifach|bzzaf|mzyan|men|lli|hiya|howa|ana|nti|kayn|kayna|ghadi|khass|3la|f|w|machi|walou|daba|lbare7|ghedda|choukran|salam|sbah|lkhir|bslama|msa)\b/i.test(s);
}

/* ---------- Rendering helpers ---------- */
function inlineDa(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, (m, w) => `<span class="en tap" data-say="${w}">${w}</span>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
function renderDa(text) {
  const lines = String(text || '').split('\n');
  let html = '', inList = false, para = [];
  const flush = () => { if (para.length) { html += `<p>${inlineDa(para.join(' '))}</p>`; para = []; } };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^- /.test(line.trim())) { flush(); if (!inList) { html += '<ul>'; inList = true; } html += `<li>${inlineDa(line.trim().slice(2))}</li>`; }
    else if (line.trim() === '') { flush(); if (inList) { html += '</ul>'; inList = false; } }
    else { if (inList) { html += '</ul>'; inList = false; } para.push(line); }
  }
  flush(); if (inList) html += '</ul>';
  return html;
}
function wordSpans(text, cls = 'w') {
  const frag = document.createDocumentFragment();
  text.split(/(\s+)/).forEach(tok => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) { frag.append(' '); return; }
    const core = tok.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, '');
    if (!core) { frag.append(tok); return; }
    frag.append(el('span', { class: cls, 'data-say': core }, tok));
  });
  return frag;
}
function enLine(text, o = {}) {
  const line = el('div', { class: 'en-line' + (o.big ? ' big' : '') });
  const row = el('div', { class: 'en-row' });
  const t = el('span', { class: 'en-text' }); t.append(wordSpans(text));
  row.append(t,
    el('button', { class: 'btn-icon', title: 'Sem3i', 'aria-label': 'Sem3i', 'data-say': text }, icon('speaker')),
    el('button', { class: 'btn-icon', title: 'Bchwiya', 'aria-label': 'Bchwiya', 'data-say': text, 'data-slow': '1' }, '🐢'));
  line.append(row);
  if (o.pron && Store.state.settings.showPron) line.append(el('div', { class: 'pron' }, o.pron));
  if (o.da && Store.state.settings.showDa !== false) line.append(el('div', { class: 'da' }, o.da));
  return line;
}
function playBlock(text, o = {}) {
  const wrap = el('div', { class: 'play-block' });
  wrap.append(
    el('button', { class: 'btn btn-play', onClick: () => Speech.speak(text) }, icon('speaker'), ' Sem3i'),
    el('button', { class: 'btn btn-ghost', onClick: () => Speech.speak(text, { rate: 0.62 }) }, '🐢 Bchwiya'));
  if (o.autoplay !== false && Store.state.settings.autoPlay) setTimeout(() => Speech.speak(text), 450);
  return wrap;
}
function diffNode(target, said) {
  const r = alignWords(target, said);
  const w = el('div', { class: 'en-text words' });
  r.words.forEach(x => w.append(el('span', { class: 'w ' + (x.ok ? 'ok' : 'bad') }, x.w), ' '));
  return w;
}
let toastTimer = null;
function toast(msg) {
  const t = $('#toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
