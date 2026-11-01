'use strict';
/* Nouha English — router & bootstrap */
const ROUTES = {
  home: viewHome, lessons: viewLessons,
  lesson: (root, id, step) => viewLesson(root, id, step || 'dars'),
  practice: viewPractice, placement: viewPlacement,
  listen: viewListening, read: viewReading,
  speak: (root, tab, id) => viewSpeaking(root, tab || 'pron', id),
  write: (root, tab, id) => viewWriting(root, tab || 'dict', id),
  vocab: viewVocab, progress: viewProgress, settings: viewSettings, help: viewHelp,
};
const NAV = [
  ['home', 'Ddar', 'home'], ['lessons', 'Ddrous', 'book'], ['practice', 'Tamarin', 'bolt'], ['listen', 'Sma3', 'headphones'],
  ['read', '9raya', 'read'], ['speak', 'Klam', 'mic'], ['write', 'Ktaba', 'pen'], ['vocab', 'Kelmat', 'cards'], ['progress', 'Ttaqaddom', 'chart'],
];
function buildNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  NAV.forEach(([r, label, ic]) => nav.append(el('a', { href: `#/${r}`, 'data-route': r }, icon(ic), label)));
}
function updateTopbar() {
  const s = Store.state;
  const lv = $('#top-level'); if (lv) lv.textContent = LEVELS[s.level];
  const st = $('#top-streak'); if (st) st.textContent = `🔥 ${s.streak.count}`;
}
function route() {
  Speech.stop();
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const name = parts[0] || 'home';
  if (name === '_') return; // transient reload route
  const fn = ROUTES[name] || viewHome;
  const app = $('#app'); app.innerHTML = '';
  const wrap = el('div', { class: 'wrap' }); app.append(wrap);
  if (!lessons().length) {
    wrap.append(el('div', { class: 'card notice' }, el('h2', {}, 'Lmo7tawa mazal ma tbna'), el('p', {}, 'Le contenu n\'est pas encore généré : lance "python tools/build.py" dans le dossier du site, puis recharge la page.')));
    return;
  }
  try { fn(wrap, ...parts.slice(1)); }
  catch (err) { console.error(err); wrap.append(el('div', { class: 'card' }, el('h2', {}, 'Oups, w9e3 chi mochkil'), el('p', { class: 'da' }, '3awdi 7emmli ssaf7a (F5). Ila b9a lmochkil, 9oli l yassi.'), el('pre', { style: 'white-space:pre-wrap;font-size:.8rem;color:var(--muted)' }, String(err && err.stack || err)))); }
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.route === name || (name === 'lesson' && a.dataset.route === 'lessons')));
  window.scrollTo(0, 0); updateTopbar();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-say]');
  if (!t) return;
  if (t.closest('.option')) return;
  e.stopPropagation();
  Speech.speak(t.dataset.say, t.dataset.slow ? { rate: 0.62 } : {});
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') Speech.stop(); });
function boot() {
  Store.load();
  document.documentElement.classList.toggle('big', !!Store.state.settings.bigText);
  Speech.init();
  Store.touchDay();
  buildNav();
  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/home';
  route();
}
document.addEventListener('DOMContentLoaded', boot);
