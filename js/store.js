'use strict';
/* Nouha English — persistent state (localStorage) + adaptive level */
const Store = (() => {
  const KEY = 'nouha-english-v1';
  const defaults = () => ({
    name: 'Nouha', level: 0, placementDone: false,
    lessons: {}, history: [], vocab: {}, writing: [], speaking: { attempts: 0, sum: 0 },
    readingDone: {}, listeningDone: {},
    streak: { last: null, count: 0 }, days: {},
    settings: { voice: null, rate: 0.95, showPron: true, showDa: true, autoPlay: true, bigText: false },
    xp: 0, levelLog: [], created: Date.now(),
  });
  let state = defaults();
  const INTERVALS = [0, 1, 3, 7, 14, 30];

  function hydrate(s) { const st = Object.assign(defaults(), s); st.settings = Object.assign(defaults().settings, s.settings || {}); return st; }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = hydrate(JSON.parse(raw));
    } catch (e) { console.warn('load failed', e); }
    // Published progress (data/seed.js): adopted automatically on a PC where nothing has been done yet.
    const seed = seedInfo();
    if (seed && isUntouched(state) && state.seedApplied !== seed.published) { applySeed({ keepLocalVoice: true }); state.seedJustApplied = true; }
    return state;
  }
  function isUntouched(s) {
    return !s.placementDone && (s.xp || 0) === 0 && !Object.keys(s.lessons || {}).length && !(s.history || []).length && !Object.keys(s.vocab || {}).length && !(s.writing || []).length && !((s.speaking || {}).attempts);
  }
  function seedInfo() {
    const sd = window.NOUHA_SEED;
    if (!sd || !sd.state || typeof sd.state !== 'object' || !('lessons' in sd.state)) return null;
    const st = sd.state;
    return { published: sd.published || '', xp: st.xp || 0, level: st.level || 0, lessonsDone: Object.values(st.lessons || {}).filter(l => l && l.done).length, name: st.name || 'Nouha' };
  }
  function applySeed(o = {}) {
    const sd = window.NOUHA_SEED; if (!sd || !sd.state) return false;
    const voice = state.settings && state.settings.voice;
    state = hydrate(JSON.parse(JSON.stringify(sd.state)));
    if (o.keepLocalVoice) state.settings.voice = voice || state.settings.voice;
    state.seedApplied = sd.published || ''; state.seedDismissed = null;
    delete state.seedJustApplied; save(); return true;
  }
  function summary(s) { s = s || state; return { xp: s.xp || 0, level: s.level || 0, lessonsDone: Object.values(s.lessons || {}).filter(l => l && l.done).length, vocab: Object.keys(s.vocab || {}).length, writing: (s.writing || []).length }; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('save failed', e); } }
  function touchDay() {
    const t = todayKey(); const last = state.streak.last;
    if (last !== t) {
      if (last && daysBetween(last, t) === 1) state.streak.count += 1;
      else if (!last || daysBetween(last, t) > 1) state.streak.count = 1;
      state.streak.last = t;
    }
    state.days[t] = state.days[t] || 0;
    save();
  }
  function addXp(n) { state.xp += n; const t = todayKey(); state.days[t] = (state.days[t] || 0) + n; }
  function lesson(id) { return state.lessons[id] || (state.lessons[id] = { steps: {}, best: null, done: false, attempts: 0 }); }
  function markStep(id, step) { const L = lesson(id); if (!L.steps[step]) { L.steps[step] = true; addXp(1); } L.last = Date.now(); save(); }
  function recordAnswer(ok, level, lessonId, type) {
    state.history.push({ t: Date.now(), ok: !!ok, lv: level || null, l: lessonId || null, ty: type });
    if (state.history.length > 400) state.history = state.history.slice(-400);
    addXp(ok ? 2 : 0); save();
  }
  function recentAccuracy(n = 30) { const h = state.history.slice(-n); if (!h.length) return null; return { acc: h.filter(x => x.ok).length / h.length, n: h.length }; }
  function lessonsDoneAtLevel(lv) { return ((window.NOUHA_CONTENT || {}).lessons || []).filter(L => L.level === LEVELS[lv] && state.lessons[L.id] && state.lessons[L.id].done).length; }
  function evaluateLevel() {
    const r = recentAccuracy(30); if (!r || r.n < 20) return null;
    const lv = state.level; let change = 0;
    if (r.acc >= 0.85 && lv < LEVELS.length - 1 && (lessonsDoneAtLevel(lv) >= 2 || (r.acc >= 0.92 && r.n >= 30))) change = 1;
    else if (r.acc < 0.45 && lv > 0) change = -1;
    if (!change) return null;
    state.level += change; state.history = [];
    state.levelLog.push({ t: Date.now(), level: state.level, why: change > 0 ? 'up' : 'down' });
    save();
    return { change, level: state.level };
  }
  function setLevel(i, why = 'placement') { state.level = Math.max(0, Math.min(LEVELS.length - 1, i)); state.history = []; state.levelLog.push({ t: Date.now(), level: state.level, why }); save(); }
  function vocabEntry(en) { const k = en.toLowerCase(); return state.vocab[k] || (state.vocab[k] = { box: 0, due: todayKey(), seen: 0, right: 0 }); }
  function reviewVocab(en, ok) {
    const v = vocabEntry(en); v.seen++;
    if (ok) { v.right++; v.box = Math.min(INTERVALS.length - 1, v.box + 1); } else v.box = Math.max(0, v.box - 1);
    const d = new Date(); d.setDate(d.getDate() + INTERVALS[v.box]); v.due = todayKey(d); v.last = todayKey();
    addXp(ok ? 1 : 0); save();
  }
  function isDue(en) { const v = state.vocab[en.toLowerCase()]; return !v || v.due <= todayKey(); }
  function isSeen(en) { return !!state.vocab[en.toLowerCase()]; }
  function saveWriting(entry) { state.writing.unshift(Object.assign({ t: Date.now() }, entry)); state.writing = state.writing.slice(0, 200); addXp(5); save(); }
  function deleteWriting(t) { state.writing = state.writing.filter(w => w.t !== t); save(); }
  function recordSpeaking(score) { state.speaking.attempts++; state.speaking.sum += score; addXp(score >= 70 ? 3 : 1); save(); }
  function exportJson() { return JSON.stringify(state, null, 2); }
  function parseState(txt) { const s = JSON.parse(txt); if (!s || typeof s !== 'object' || !('lessons' in s)) throw new Error('bad file'); return s; }
  function importJson(txt) { state = hydrate(parseState(txt)); save(); }
  function reset() { const sa = state.seedApplied; state = defaults(); if (sa) state.seedApplied = sa; save(); }
  return { get state() { return state; }, load, save, touchDay, addXp, lesson, markStep, recordAnswer, recentAccuracy, evaluateLevel, setLevel, vocabEntry, reviewVocab, isDue, isSeen, saveWriting, deleteWriting, recordSpeaking, exportJson, importJson, parseState, reset, seedInfo, applySeed, isUntouched, summary, INTERVALS };
})();

/* ---- progress share links: #/import/<z|j><base64url> ---- */
const Transfer = (() => {
  const b64u = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return Uint8Array.from(atob(s), c => c.charCodeAt(0)); };
  async function pipe(bytes, stream) { const r = new Blob([bytes]).stream().pipeThrough(stream); return new Uint8Array(await new Response(r).arrayBuffer()); }
  async function encode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === 'function') { try { return 'z' + b64u(await pipe(raw, new CompressionStream('deflate-raw'))); } catch (e) { /* fall through */ } }
    return 'j' + b64u(raw);
  }
  async function decode(str) {
    const kind = str[0]; let bytes = unb64u(str.slice(1));
    if (kind === 'z') bytes = await pipe(bytes, new DecompressionStream('deflate-raw'));
    else if (kind !== 'j') throw new Error('bad link');
    return new TextDecoder().decode(bytes);
  }
  function baseUrl() { return location.origin === 'null' || location.protocol === 'file:' ? 'https://yasbou2001-source.github.io/nouha-english/' : location.origin + location.pathname; }
  async function link(state) { return baseUrl() + '#/import/' + await encode(state); }
  return { encode, decode, link, baseUrl };
})();
