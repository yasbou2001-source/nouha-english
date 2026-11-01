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

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); state = Object.assign(defaults(), s); state.settings = Object.assign(defaults().settings, s.settings || {}); }
    } catch (e) { console.warn('load failed', e); }
    return state;
  }
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
  function importJson(txt) { const s = JSON.parse(txt); if (!s || typeof s !== 'object' || !('lessons' in s)) throw new Error('bad file'); state = Object.assign(defaults(), s); state.settings = Object.assign(defaults().settings, s.settings || {}); save(); }
  function reset() { state = defaults(); save(); }
  return { get state() { return state; }, load, save, touchDay, addXp, lesson, markStep, recordAnswer, recentAccuracy, evaluateLevel, setLevel, vocabEntry, reviewVocab, isDue, isSeen, saveWriting, deleteWriting, recordSpeaking, exportJson, importJson, reset, INTERVALS };
})();
