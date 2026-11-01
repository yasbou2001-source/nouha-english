'use strict';
/* Nouha English — pages */
const C = () => window.NOUHA_CONTENT || { lessons: [], placement: [] };
const lessons = () => C().lessons || [];
const lessonById = id => lessons().find(L => L.id === id);
const levelIdx = code => LEVELS.indexOf(code);
const vocabOf = L => { const s = (L.sections || []).find(s => s.type === 'vocab'); return s ? s.items : []; };
function allVocab() {
  const seen = new Set(), out = [];
  for (const L of lessons()) for (const it of vocabOf(L)) { const k = it.en.toLowerCase(); if (seen.has(k)) continue; seen.add(k); out.push(Object.assign({ lesson: L.id, level: L.level }, it)); }
  return out;
}
function nextLesson() {
  const Ls = lessons(), st = Store.state;
  return Ls.find(L => !(st.lessons[L.id] && st.lessons[L.id].done) && levelIdx(L.level) >= st.level) || Ls.find(L => !(st.lessons[L.id] && st.lessons[L.id].done)) || Ls[Ls.length - 1];
}
const STEPS = [
  { k: 'dars', label: 'Dars', icon: '📘' }, { k: 'kelmat', label: 'Kelmat', icon: '🃏' }, { k: '7iwar', label: '7iwar', icon: '💬' },
  { k: 'tamarin', label: 'Tamarin', icon: '✏️' }, { k: '9raya', label: '9raya', icon: '📖' }, { k: 'sma3', label: 'Sma3', icon: '🎧' },
  { k: 'klam', label: 'Klam', icon: '🎤' }, { k: 'ktaba', label: 'Ktaba', icon: '✍️' },
];
function stepsProgress(L) {
  const st = Store.state.lessons[L.id]; const row = el('div', { class: 'steps-mini', title: 'Ttaqaddom f dars' });
  STEPS.forEach(s => row.append(el('i', { class: st && st.steps[s.k] ? 'on' : '' })));
  return row;
}
function tile(href, emoji, title, sub) { return el('a', { class: 'tile', href }, el('div', { class: 't-emoji' }, emoji), el('div', {}, el('div', { class: 't-title' }, title), el('div', { class: 't-sub' }, sub))); }
function levelFilter(current, onChange) {
  const bar = el('div', { class: 'filters' }, el('span', { class: 'muted' }, 'Lmostawa:'));
  ['all', ...LEVELS].forEach(lv => bar.append(el('button', { class: 'filter' + (lv === current ? ' active' : ''), onClick: () => onChange(lv) }, lv === 'all' ? 'Kolchi' : lv)));
  return bar;
}
function nearLevels(lv) { const i = levelIdx(lv), c = Store.state.level; return Math.abs(i - c) <= 1; }
function emptyMsg(txt) { return el('div', { class: 'card' }, el('p', { class: 'da' }, txt)); }

/* ---------------- HOME ---------------- */
function viewHome(root) {
  const s = Store.state; const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const greetDa = h < 12 ? 'Sbah lkhir' : 'Msa lkhir';
  const nl = nextLesson(); const acc = Store.recentAccuracy(30);
  const dueCount = allVocab().filter(v => Store.isSeen(v.en) && Store.isDue(v.en)).length;
  root.append(el('section', { class: 'hero-row' },
    el('div', {},
      el('h1', { class: 'greet' }, el('span', { class: 'en tap', 'data-say': `${greet}, ${s.name}!` }, `${greet}, ${s.name}!`)),
      el('p', { class: 'da' }, `${greetDa}, ${s.name}! Wach wajda nt3ellmo chwiya dyal lingliziya lyouma?`)),
    el('div', { class: 'level-card' }, el('div', { class: 'lv-code' }, LEVELS[s.level]), el('div', { class: 'lv-name' }, LEVEL_NAMES[LEVELS[s.level]]),
      acc ? el('div', { class: 'lv-acc da' }, `Dde99a: ${Math.round(acc.acc * 100)}% (akhir ${acc.n} jawab)`) : el('div', { class: 'lv-acc da' }, 'Mazal ma bditi ttamarin'),
      el('div', { class: 'streak' }, `🔥 ${s.streak.count} ${s.streak.count === 1 ? 'nhar' : 'iyam'} mtab3in`))));
  if (!s.placementDone) {
    root.append(el('div', { class: 'card notice' }, el('h3', {}, 'Test dyal lmostawa (5 d9ay9)'),
      el('p', { class: 'da' }, 'Bach lmaw9i3 ytkeyyef m3a lmostawa dyalek, jawbi 3la 16 so2al. Ila nti kat3rfi walou f lingliziya, machi mochkil — 9edri ddouzi had test w tbdi men dars 1.'),
      el('div', { class: 'actions' }, el('a', { class: 'btn btn-primary', href: '#/placement' }, 'Bdi test'), el('a', { class: 'btn btn-ghost', href: '#/lesson/l01', onClick: () => { s.placementDone = true; Store.save(); } }, 'La, ghadi nbda men dars 1'))));
  }
  if (nl) {
    const st = s.lessons[nl.id]; const started = st && Object.keys(st.steps).length;
    root.append(el('a', { class: 'card continue', href: `#/lesson/${nl.id}` }, el('div', { class: 'big-emoji' }, nl.emoji),
      el('div', {}, el('div', { class: 'eyebrow' }, started ? 'Kemmli fin w9efti' : 'Dars li moraha'), el('h2', {}, `${nl.order}. ${nl.title_en}`), el('div', { class: 'da' }, nl.title_da), el('div', { class: 'meta' }, el('span', { class: 'pill' }, nl.level), stepsProgress(nl))),
      el('div', { class: 'arrow' }, '→')));
  }
  root.append(el('h3', { class: 'section-title' }, 'Tamrin sri3 dyal lyouma'));
  root.append(el('div', { class: 'grid4' },
    tile('#/practice', '⚡', 'Tamarin', '10 tamarin 3la 9ed mostawak'),
    tile('#/vocab', '🃏', 'Lkelmat', dueCount ? `${dueCount} kelma khasshom moraja3a lyouma` : 'T3ellmi w raj3i lkelmat b lkart'),
    tile('#/listen', '🎧', 'Sma3', '7iwarat m3a as2ila'),
    tile('#/speak', '🎤', 'Tkellmi', 'Nnot9 w l7iwar b lmicro'),
    tile('#/read', '📖', '9raya', 'Nsous 9sar m3a lkelmat'),
    tile('#/write', '✍️', 'Ktaba', 'Dictée, tarjama w ktaba 7orra')));
  root.append(el('p', { class: 'da small', style: 'margin-top:1.2rem' }, 'Nasi7a: 15 d9i9a kol nhar 7sen men jouj sway3 merra f simana. ', el('a', { href: '#/help' }, 'Kifach nsta3mel lmaw9i3?')));
}

/* ---------------- LESSONS LIST ---------------- */
function viewLessons(root) {
  root.append(el('h1', {}, 'Ddrous'), el('p', { class: 'da' }, `${lessons().length} dars men A1 7ta A2. Dars li fih ⭐ howa li mnaseb lik daba. Kol dars fih: chchar7, lkelmat, 7iwar, tamarin, 9raya, sma3, klam w ktaba.`));
  const next = nextLesson();
  for (const lv of LEVELS) {
    const Ls = lessons().filter(L => L.level === lv); if (!Ls.length) continue;
    const done = Ls.filter(L => Store.state.lessons[L.id] && Store.state.lessons[L.id].done).length;
    root.append(el('h3', { class: 'section-title' }, el('span', { class: 'pill' }, lv), LEVEL_NAMES[lv], el('span', { class: 'muted' }, `— ${done}/${Ls.length} kemlin`)));
    const list = el('div', { class: 'lesson-list' });
    for (const L of Ls) {
      const st = Store.state.lessons[L.id]; const isNext = next && next.id === L.id;
      list.append(el('a', { class: 'lesson-row' + (st && st.done ? ' done' : '') + (isNext ? ' next' : ''), href: `#/lesson/${L.id}` },
        el('div', { class: 'emoji' }, L.emoji), el('div', {}, el('div', { class: 'title' }, `${L.order}. ${L.title_en}`), el('div', { class: 'da' }, L.title_da), stepsProgress(L)),
        el('div', { class: 'status' }, st && st.done ? '✅' : isNext ? '⭐' : (st && Object.keys(st.steps).length ? '⏳' : ''))));
    }
    root.append(list);
  }
}

/* ---------------- LESSON ---------------- */
function viewLesson(root, id, stepKey) {
  const L = lessonById(id);
  if (!L) { root.append(emptyMsg('Had dars mazal ma kaynch. Rje3i l ' + '"Ddrous".'), el('a', { class: 'btn', href: '#/lessons' }, '← Ddrous')); return; }
  const st = Store.lesson(id);
  const stepIdx = Math.max(0, STEPS.findIndex(s => s.k === stepKey)); const step = STEPS[stepIdx];
  root.append(el('div', { class: 'lesson-head' }, el('a', { href: '#/lessons', class: 'back' }, '← Ddrous'),
    el('div', { class: 'lh-title' }, el('span', { class: 'emoji' }, L.emoji), el('div', {}, el('h1', {}, `${L.order}. ${L.title_en}`), el('div', { class: 'da' }, L.title_da)), el('span', { class: 'pill' }, L.level), st.done ? el('span', { class: 'pill green' }, '✓ kamel') : null)));
  const stepper = el('nav', { class: 'stepper' });
  STEPS.forEach((s, i) => stepper.append(el('a', { class: 'step' + (i === stepIdx ? ' active' : '') + (st.steps[s.k] ? ' done' : ''), href: `#/lesson/${id}/${s.k}` }, el('span', {}, st.steps[s.k] && i !== stepIdx ? '✓' : s.icon), s.label)));
  root.append(stepper);
  const body = el('div', { class: 'lesson-body' }); root.append(body);
  const nav = el('div', { class: 'lesson-nav' });
  nav.append(stepIdx > 0 ? el('a', { class: 'btn btn-ghost', href: `#/lesson/${id}/${STEPS[stepIdx - 1].k}` }, `← ${STEPS[stepIdx - 1].label}`) : el('span'));
  if (stepIdx < STEPS.length - 1) nav.append(el('a', { class: 'btn btn-primary', href: `#/lesson/${id}/${STEPS[stepIdx + 1].k}` }, `${STEPS[stepIdx + 1].label} →`));
  else {
    const nx = lessons().find(x => x.order === L.order + 1);
    nav.append(nx ? el('a', { class: 'btn btn-primary', href: `#/lesson/${nx.id}` }, `Dars ${nx.order} →`) : el('a', { class: 'btn btn-primary', href: '#/lessons' }, 'Ddrous →'));
  }
  switch (step.k) {
    case 'dars': renderDars(body, L); Store.markStep(id, 'dars'); break;
    case 'kelmat': renderKelmat(body, L); Store.markStep(id, 'kelmat'); break;
    case '7iwar': renderDialogue(body, L); Store.markStep(id, '7iwar'); break;
    case 'tamarin': renderTamarin(body, L); break;
    case '9raya': renderReading(body, L, { lessonId: id, onDone: () => Store.markStep(id, '9raya') }); break;
    case 'sma3': renderListening(body, L, { lessonId: id, onDone: () => Store.markStep(id, 'sma3') }); break;
    case 'klam': renderSpeaking(body, L, { onDone: () => Store.markStep(id, 'klam') }); break;
    case 'ktaba': renderWriting(body, L.writing, { lessonId: id, onDone: () => Store.markStep(id, 'ktaba') }); break;
  }
  root.append(nav);
}
function renderDars(body, L) {
  body.append(el('div', { class: 'card' }, el('div', { class: 'label' }, 'F had dars ghadi tt3ellmi'), el('ul', { class: 'goals' }, (L.goals_da || []).map(g => el('li', { html: inlineDa(g) })))));
  for (const s of L.sections) {
    if (s.type === 'explain') {
      const c = el('div', { class: 'card explain' }, el('h3', {}, s.title_da), el('div', { html: renderDa(s.body_da) }));
      if (s.examples && s.examples.length) { c.append(el('div', { class: 'label', style: 'margin-top:.8rem' }, 'Amtila — wrrki 3la ay kelma bach tsem3iha')); s.examples.forEach(e => c.append(enLine(e.en, { da: e.da, pron: e.pron }))); }
      body.append(c);
    } else if (s.type === 'tip') {
      body.append(el('div', { class: 'card tipcard explain' }, el('h3', {}, '💡 ' + (s.title_da || 'Nasi7a')), el('div', { html: renderDa(s.body_da) })));
    }
  }
}
function renderKelmat(body, L) {
  const items = vocabOf(L);
  body.append(el('div', { class: 'actions', style: 'margin:0 0 1rem' }, el('a', { class: 'btn btn-primary', href: `#/vocab/${L.id}` }, '🃏 Tmerrni b lkart'), el('button', { class: 'btn btn-ghost', onClick: () => Speech.speakLines(items.map(i => ({ speaker: 'a', en: i.en }))) }, icon('speaker'), ' Sem3i lkelmat kollhom'), el('span', { class: 'muted' }, `${items.length} kelma`)));
  const grid = el('div', { class: 'vocab-grid' });
  items.forEach(it => grid.append(el('div', { class: 'vocab-card' },
    el('div', { class: 'v-top' }, el('span', { class: 'v-emoji' }, it.emoji || '•'), el('span', { class: 'v-en', 'data-say': it.en }, it.en), el('button', { class: 'btn-icon', 'data-say': it.en, 'aria-label': 'Sem3i' }, icon('speaker'))),
    it.pron && Store.state.settings.showPron ? el('div', { class: 'pron' }, it.pron) : null,
    el('div', { class: 'v-da' }, it.da),
    it.example_en ? el('div', { class: 'v-ex' }, el('div', { class: 'en-text' }, wordSpans(it.example_en)), el('div', { class: 'da small' }, it.example_da || '')) : null)));
  body.append(grid);
}
function dialogueLines(lines, o = {}) {
  const speakers = [...new Set(lines.map(l => l.speaker))];
  const wrap = el('div', { class: 'dialogue' });
  lines.forEach((l, i) => {
    const alt = speakers.indexOf(l.speaker) % 2 === 1;
    const bubble = el('div', { class: 'bubble' }, el('div', { class: 'speaker' }, l.speaker), o.hidden ? el('div', { class: 'muted' }, '…') : enLine(l.en, { da: l.da }));
    if (!o.hidden && o.practice) {
      const tools = el('div', { class: 'line-tools' });
      const btn = el('button', { class: 'btn btn-sm btn-ghost', onClick: () => { if (tools.nextSibling) { tools.nextSibling.remove(); return; } bubble.append(speakPractice(l.en).node); } }, icon('mic'), ' 9oliha nti');
      tools.append(btn); bubble.append(tools);
    }
    wrap.append(el('div', { class: 'line' + (alt ? ' alt' : ''), 'data-i': i }, el('div', { class: 'avatar' }, l.speaker.replace(/^(Mr|Mrs|Ms|Dr)\.?\s*/i, '').slice(0, 2)), bubble));
  });
  return wrap;
}
function playAllControls(lines, dlg, o = {}) {
  let playing = false;
  const btn = el('button', { class: 'btn btn-play' }, icon('play'), ' Sem3i l7iwar');
  const slow = el('button', { class: 'btn btn-ghost' }, '🐢 Bchwiya');
  const stop = el('button', { class: 'btn btn-ghost' }, icon('stop'), ' W9ef');
  const hl = i => $$('.line', dlg).forEach(x => x.classList.toggle('active', +x.dataset.i === i));
  const go = async (rate) => { if (playing) Speech.stop(); playing = true; await Speech.speakLines(lines, { onLine: hl, rate }); playing = false; if (o.onEnd) o.onEnd(); };
  btn.addEventListener('click', () => go(undefined)); slow.addEventListener('click', () => go(0.65)); stop.addEventListener('click', () => { Speech.stop(); hl(-1); playing = false; });
  return el('div', { class: 'play-block' }, btn, slow, stop);
}
function renderDialogue(body, L) {
  const s = L.sections.find(x => x.type === 'dialogue'); if (!s) return body.append(emptyMsg('Ma kayn 7ta 7iwar f had dars.'));
  const card = el('div', { class: 'card' }, el('h3', {}, '💬 ' + s.title_da));
  if (s.context_da) card.append(el('p', { class: 'da', html: renderDa(s.context_da) }));
  const dlg = dialogueLines(s.lines, { practice: true });
  const toggle = el('button', { class: 'btn btn-ghost', onClick: () => { dlg.classList.toggle('hide-da'); toggle.textContent = dlg.classList.contains('hide-da') ? '👁 Werri darija' : '🙈 Khebbi darija'; } }, '🙈 Khebbi darija');
  const controls = playAllControls(s.lines, dlg); controls.append(toggle);
  card.append(controls, dlg, el('p', { class: 'da small', style: 'margin-top:.8rem' }, 'Nasi7a: sem3i l7iwar merrtin, men ba3d khebbi darija w jarrbi tfehmi. F l\'akhir wrrki 3la "9oliha nti" bach t3awdi kol jomla b lmicro.'));
  body.append(card);
}
function renderTamarin(body, L) {
  const id = L.id; const st = Store.lesson(id);
  body.append(el('p', { class: 'da' }, `${L.exercises.length} tamarin 3la had dars. Khodi wa9tek, w ila ghlti 9ray chchar7 li kayban men ba3d kol jawab.`, st.best != null ? ` A7sen natija dyalek: ${st.best}%.` : ''));
  const area = el('div'); body.append(area);
  Exercises.run(area, L.exercises, {
    lessonId: id, level: L.level,
    onScore: r => { st.attempts++; st.best = Math.max(st.best || 0, r.pct); if (r.pct >= 70) st.done = true; Store.markStep(id, 'tamarin'); Store.save(); return r.pct >= 70 ? el('p', { class: 'da' }, '✅ Dars t7seb kamel! T9edri tkemmli l 9raya.') : el('p', { class: 'da' }, 'Bach dars yt7seb kamel khassek 70% 3la l\'a9al. 3awdi melli tkouni wajda — ma kayn 7ta mochkil!'); },
    onFinish: () => { location.hash = `#/lesson/${id}/9raya`; }, finishLabel: '9raya →',
  });
}
function readingBlock(R, L, opts = {}) {
  const card = el('div', { class: 'card' }, el('h3', {}, `${R.emoji || '📖'} ${R.title_en}`, ' ', el('span', { class: 'muted' }, R.title_da)));
  card.append(el('p', { class: 'da small' }, 'Wrrki 3la ay kelma bach tsem3iha. Lkelmat li t7thom no9at (…) kaynin f l9amous ta7t.'));
  const gl = {}; (R.glossary || []).forEach(g => g.en.toLowerCase().split(/\s+/).forEach(w => { const k = w.replace(/[^a-z']/g, ''); if (k && !gl[k]) gl[k] = g; }));
  const txt = el('div', { class: 'reading-text' });
  R.text_en.split(/(\s+)/).forEach(tok => {
    if (!tok) return; if (/^\s+$/.test(tok)) { txt.append(' '); return; }
    const core = tok.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ''); const g = gl[core.toLowerCase()];
    const span = el('span', { class: 'w' + (g ? ' gloss' : ''), 'data-say': core }, tok);
    if (g) span.addEventListener('click', e => showTooltip(e.currentTarget, `${g.en} = ${g.da}`));
    txt.append(span);
  });
  card.append(playBlock(R.text_en, { autoplay: false }), txt);
  if (R.glossary && R.glossary.length) { const chips = el('div', { class: 'gloss-chips' }); R.glossary.forEach(g => chips.append(el('span', { class: 'gloss-chip' }, el('b', { class: 'tap', 'data-say': g.en, style: 'cursor:pointer' }, g.en), ` = ${g.da}`))); card.append(el('div', { class: 'label', style: 'margin-top:.8rem' }, 'L9amous'), chips); }
  if (R.text_da) { const tr = el('div', { class: 'da hidden', style: 'margin-top:.6rem' }, R.text_da); card.append(el('button', { class: 'btn btn-ghost btn-sm', onClick: () => { tr.classList.toggle('hidden'); } }, '🔍 Chofi ttarjama b darija'), tr); }
  return card;
}
let tipEl = null, tipTimer = null;
function showTooltip(target, text) {
  if (!tipEl) { tipEl = el('div', { class: 'tooltip' }); document.body.append(tipEl); }
  const r = target.getBoundingClientRect(); tipEl.textContent = text; tipEl.style.left = (r.left + r.width / 2) + 'px'; tipEl.style.top = r.top + 'px'; tipEl.style.display = 'block';
  clearTimeout(tipTimer); tipTimer = setTimeout(() => { tipEl.style.display = 'none'; }, 2200);
}
function renderReading(body, L, opts = {}) {
  const R = L.reading; if (!R) return body.append(emptyMsg('Ma kayn 7ta nass f had dars.'));
  body.append(readingBlock(R, L));
  const qcard = el('div'); body.append(el('h3', { class: 'section-title' }, 'As2ila 3la nnass'), qcard);
  const start = el('button', { class: 'btn btn-primary btn-lg', onClick: () => { start.remove(); Exercises.run(qcard, R.questions, { lessonId: L.id, level: L.level, onScore: r => { Store.state.readingDone[L.id] = Math.max(Store.state.readingDone[L.id] || 0, r.pct); Store.save(); opts.onDone && opts.onDone(r); return null; }, onFinish: opts.onFinish || (() => { location.hash = `#/lesson/${L.id}/sma3`; }), finishLabel: opts.finishLabel || 'Sma3 →' }); } }, 'Jawbi 3la l\'as2ila →');
  qcard.append(start);
}
function renderListening(body, L, opts = {}) {
  const Li = L.listening; if (!Li) return body.append(emptyMsg('Ma kayn 7ta sma3 f had dars.'));
  const card = el('div', { class: 'card' }, el('h3', {}, `${Li.emoji || '🎧'} ${Li.title_da}`));
  if (Li.pre_da) card.append(el('p', { class: 'da', html: renderDa(Li.pre_da) }));
  const hiddenDlg = dialogueLines(Li.lines, { hidden: true });
  card.append(playAllControls(Li.lines, hiddenDlg), hiddenDlg);
  card.append(el('p', { class: 'da small' }, 'Nnass makhbi 3la 9sd — sem3i merrtin wla tlata, men ba3d jawbi. Men ba3d l\'as2ila ghadi yban lik nnass kamel.'));
  body.append(card);
  const qcard = el('div'); body.append(el('h3', { class: 'section-title' }, 'As2ila'), qcard);
  const reveal = () => { const full = el('div', { class: 'card' }, el('h3', {}, '📝 Nnass dyal l7iwar'), dialogueLines(Li.lines, { practice: true })); body.insertBefore(full, qcard.nextSibling); };
  const start = el('button', { class: 'btn btn-primary btn-lg', onClick: () => { start.remove(); Exercises.run(qcard, Li.questions, { lessonId: L.id, level: L.level, onScore: r => { Store.state.listeningDone[L.id] = Math.max(Store.state.listeningDone[L.id] || 0, r.pct); Store.save(); opts.onDone && opts.onDone(r); reveal(); return el('p', { class: 'da small' }, 'Nnass kamel ban lik ta7t 👇'); }, onFinish: opts.onFinish || (() => { location.hash = `#/lesson/${L.id}/klam`; }), finishLabel: opts.finishLabel || 'Klam →' }); } }, 'Jawbi 3la l\'as2ila →');
  qcard.append(start);
}
function renderSpeaking(body, L, opts = {}) {
  const S = L.speaking; if (!S) return body.append(emptyMsg('Ma kayn walou hna.'));
  if (!Speech.recSupported) body.append(el('div', { class: 'card notice' }, el('p', { class: 'da' }, Speech.micError('unsupported'))));
  const card = el('div', { class: 'card' }, el('h3', {}, '🗣 Nnot9 — 3awdi had ljomal'), el('p', { class: 'da small' }, 'Sem3i, men ba3d wrrki 3la "Tkellmi" w 9oli ljomla. Lkelmat lkhodr = mzyan, l7omr = 3awdihom.'));
  let scores = 0;
  (S.pronunciation || []).forEach(p => { const box = el('div', { style: 'margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--line)' }, enLine(p.target_en, { big: true, da: p.da, pron: p.pron })); const sp = speakPractice(p.target_en, { onResult: s => { if (s >= 70) { scores++; if (scores >= 3) opts.onDone && opts.onDone(); } Store.recordSpeaking(s); } }); box.append(sp.node); card.append(box); });
  body.append(card);
  if (S.roleplay) { const rc = el('div', { class: 'card' }); body.append(rc); rolePlay(rc, S.roleplay, { onDone: () => { opts.onDone && opts.onDone(); } }); }
}
function rolePlay(container, rp, opts = {}) {
  container.innerHTML = '';
  container.append(el('h3', {}, '🎭 7iwar: ' + rp.title_da));
  if (rp.context_da) container.append(el('p', { class: 'da', html: renderDa(rp.context_da) }));
  const log = el('div', { class: 'dialogue' }); let i = 0, successes = 0;
  const startBtn = el('button', { class: 'btn btn-primary btn-lg', onClick: () => { startBtn.remove(); container.append(log); botTurn(); } }, icon('play'), ' Bdi l7iwar');
  container.append(startBtn);
  function botTurn() {
    if (i >= rp.turns.length) return finish();
    const t = rp.turns[i];
    log.append(el('div', { class: 'line' }, el('div', { class: 'avatar' }, 'EN'), el('div', { class: 'bubble' }, el('div', { class: 'speaker' }, 'Howa / hiya'), enLine(t.bot_en, { da: t.bot_da }))));
    Speech.speak(t.bot_en);
    const yt = el('div', { class: 'your-turn' }, el('div', { class: 'speaker label' }, `${Store.state.name} — jawbi (b sot wla b lktaba)`));
    const fa = freeAnswer({
      onText: alts => {
        const hit = alts.some(a => t.expect_keywords.some(k => normalizeEn(a).includes(normalizeEn(k))));
        fa.disable();
        if (hit) { successes++; yt.append(el('div', { class: 'feedback ok' }, el('div', { class: 'fb-title' }, praise()), el('div', { class: 'da small' }, 'Jawab mo9tara7: '), enLine(t.sample_en))); i++; setTimeout(botTurn, 900); }
        else {
          const sp = speakPractice(t.sample_en, { onResult: s => { if (s >= 60) { i++; setTimeout(botTurn, 700); } } });
          yt.append(el('div', { class: 'feedback bad' }, el('div', { class: 'fb-title' }, 'Ma fhemtekch mzyan. Jarrbi t9oli had ljawab:'), enLine(t.sample_en), sp.node, el('div', { class: 'actions' }, el('button', { class: 'btn btn-ghost btn-sm', onClick: () => { i++; botTurn(); } }, 'Douzi →'))));
        }
        log.scrollIntoView({ behavior: 'smooth', block: 'end' });
      },
    });
    yt.append(fa.node); log.append(yt);
  }
  function finish() {
    container.append(el('div', { class: 'result', style: 'padding:1rem' }, el('div', { class: 'result-emoji' }, '🎉'), el('h2', { style: 'font-size:1.5rem' }, 'Kemmelti l7iwar!'), el('p', { class: 'da' }, `${successes}/${rp.turns.length} jawab mzyanin men lwla. ${successes === rp.turns.length ? 'Wa3ra!' : '3awdi l7iwar merra khra bach ywelli sahl 3lik.'}`), el('div', { class: 'actions' }, el('button', { class: 'btn btn-ghost', onClick: () => rolePlay(container, rp, opts) }, '↻ 3awdi l7iwar'))));
    Store.addXp(5); Store.save(); opts.onDone && opts.onDone(successes);
  }
}
function checkWriting(text, W) {
  const out = []; const words = text.trim().split(/\s+/).filter(Boolean); const n = words.length;
  out.push({ ok: n >= W.min_words, msg: n >= W.min_words ? `${n} kelma — mzyan (lmatloub: ${W.min_words})` : `${n} kelma. Zidi chwiya — lmatloub ${W.min_words} kelma 3la l'a9al.` });
  const low = ' ' + normalizeEn(text) + ' ';
  if (W.keywords && W.keywords.length) { const missing = W.keywords.filter(k => !low.includes(normalizeEn(k))); out.push({ ok: !missing.length, msg: missing.length ? 'Jarrbi tsta3mli had lkelmat: ' + missing.join(', ') : 'Sta3melti lkelmat lmohimma' }); }
  const sents = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  const noCap = sents.filter(s => /^[a-z]/.test(s));
  out.push(noCap.length ? { ok: false, msg: `Kol jomla khassha tbda b 7arf kbir: "${noCap[0].slice(0, 28)}…"` } : { ok: true, msg: 'Ljomal kaybdaw b 7arf kbir' });
  out.push(/[.!?]\s*$/.test(text.trim()) ? { ok: true, msg: 'Kayna no9ta f l\'akhir' } : { ok: false, msg: 'Zidi no9ta (.) wla (!) f l\'akhir dyal kol jomla.' });
  if (/(^|[\s"(])i(\s|'|$)/.test(text)) out.push({ ok: false, msg: 'Lkelma "I" (ana) dima katktab b 7arf kbir, 7ta f west ljomla.' });
  if (/\bim\b/i.test(text)) out.push({ ok: false, msg: '"I\'m" katktab b apostrophe: I\'m (= I am).' });
  if (/\b(he|she|it) have\b/i.test(text)) out.push({ ok: false, msg: 'M3a he / she / it kan9oulo "has", machi "have".' });
  if (/\b(he|she|it) (go|like|live|work|eat|want|study|play|watch|do)\b/i.test(text)) out.push({ ok: false, msg: 'M3a he / she / it zidi -s l lfi3l f l7adir: goes, likes, lives, works…' });
  if (/\ba [aeiou]/i.test(text)) out.push({ ok: false, msg: '9bel kelma katbda b a, e, i, o, u kan9oulo "an": an apple, an egg.' });
  if (/\bI am agree\b/i.test(text)) out.push({ ok: false, msg: 'Kan9oulo "I agree" (bla am).' });
  if (/\byears\b(?!\s+old)/i.test(text) && /\b(am|is|are)\s+\d+\s+years\b/i.test(text)) out.push({ ok: false, msg: 'L3mer: "I am 25 years old" (zidi old).' });
  return out;
}
function renderWriting(body, W, opts = {}) {
  if (!W) return body.append(emptyMsg('Ma kayn 7ta tamrin dyal lktaba hna.'));
  const card = el('div', { class: 'card' }, el('h3', {}, '✍️ ' + W.title_da), el('p', { class: 'da', html: renderDa(W.prompt_da) }));
  const ta = el('textarea', { class: 'input', rows: 6, placeholder: 'Ktbi hna b lingliziya…', spellcheck: 'true', lang: 'en' });
  const wc = el('div', { class: 'wc' }, `0 / ${W.min_words} kelma`);
  ta.addEventListener('input', () => { const n = ta.value.trim().split(/\s+/).filter(Boolean).length; wc.textContent = `${n} / ${W.min_words} kelma`; });
  if (W.helper_en && W.helper_en.length) { const chips = el('div', { class: 'chips' }); W.helper_en.forEach(h => chips.append(el('button', { class: 'chip helper', onClick: () => { const pos = ta.selectionStart || ta.value.length; const before = ta.value.slice(0, pos), after = ta.value.slice(pos); const sep = before && !/\s$/.test(before) ? ' ' : ''; ta.value = before + sep + h.replace(/\.\.\.$/, '') + after; ta.focus(); ta.dispatchEvent(new Event('input')); } }, h))); card.append(el('div', { class: 'label' }, 'Jomal kat3awnek (wrrki bach tzidiha)'), chips); }
  const fb = el('div');
  const check = el('button', { class: 'btn btn-primary btn-lg', onClick: () => {
    const text = ta.value; if (!text.trim()) return;
    const res = checkWriting(text, W); fb.innerHTML = '';
    const ul = el('ul', { class: 'checks' }); res.forEach(r => ul.append(el('li', { class: r.ok ? 'ok' : 'bad' }, r.msg)));
    const allOk = res.every(r => r.ok);
    fb.append(el('div', { class: 'feedback ' + (allOk ? 'ok' : 'bad') }, el('div', { class: 'fb-title' }, allOk ? praise() + ' Nnass dyalek mzyan.' : 'Chofi had nno9at w sel7i nnass dyalek:'), ul,
      el('div', { class: 'label', style: 'margin-top:.8rem' }, 'Mital dyal jawab (9arni m3a dyalek)'), enLine(W.model_en),
      el('div', { class: 'actions' },
        el('button', { class: 'btn', onClick: () => { Store.saveWriting({ lessonId: opts.lessonId || null, title: W.title_da, text }); toast('Tsejjel f ljournal dyalek ✓'); opts.onDone && opts.onDone(); } }, '💾 Sejjli f ljournal'),
        el('button', { class: 'btn btn-ghost', onClick: () => { Speech.speak(text); } }, icon('speaker'), ' Sem3i nnass dyali'),
        el('button', { class: 'btn btn-ghost', onClick: async () => { try { await navigator.clipboard.writeText(text); toast('Tnsekh ✓'); } catch (e) { toast('Ma 9dertch nnsekh'); } } }, '📋 Nsekh'))));
    if (allOk) { Store.addXp(3); Store.save(); opts.onDone && opts.onDone(); }
  } }, 'Se77i nnass dyali ✓');
  card.append(ta, wc, el('div', { class: 'actions' }, check), fb);
  body.append(card);
}

/* ---------------- HUBS ---------------- */
let hubFilter = 'near';
function hubList(root, kind) {
  const titles = { listen: ['🎧 Sma3', 'Khtari 7iwar, sem3ih, w jawbi 3la l\'as2ila. Nnass makhbi 7ta tjawbi.'], read: ['📖 9raya', 'Nsous 9sar b lingliziya m3a l9amous w ttarjama b darija.'] };
  root.append(el('h1', {}, titles[kind][0]), el('p', { class: 'da' }, titles[kind][1]));
  const listEl = el('div', { class: 'item-list' });
  const draw = () => {
    listEl.innerHTML = '';
    const Ls = lessons().filter(L => (kind === 'listen' ? L.listening : L.reading) && (hubFilter === 'all' ? true : hubFilter === 'near' ? nearLevels(L.level) : L.level === hubFilter));
    if (!Ls.length) listEl.append(emptyMsg('Ma kayn walou f had lmostawa.'));
    Ls.forEach(L => { const item = kind === 'listen' ? L.listening : L.reading; const done = (kind === 'listen' ? Store.state.listeningDone : Store.state.readingDone)[L.id];
      listEl.append(el('a', { class: 'item-row', href: `#/${kind}/${L.id}` }, el('div', { class: 'emoji' }, item.emoji || L.emoji), el('div', {}, el('div', { class: 'title' }, kind === 'listen' ? item.title_da : `${item.title_en} — ${item.title_da}`), el('div', { class: 'da small' }, `Dars ${L.order}: ${L.title_en}`)), el('div', {}, el('span', { class: 'pill' }, L.level), ' ', done != null ? el('span', { class: 'score-pill' }, done + '%') : null))); });
  };
  const bar = el('div', { class: 'filters' }, el('span', { class: 'muted' }, 'Lmostawa:'));
  const opts = [['near', '⭐ Dyali'], ['all', 'Kolchi'], ...LEVELS.map(l => [l, l])];
  opts.forEach(([v, lab]) => bar.append(el('button', { class: 'filter' + (hubFilter === v ? ' active' : ''), onClick: () => { hubFilter = v; $$('.filter', bar).forEach(b => b.classList.toggle('active', b.textContent === lab)); draw(); } }, lab)));
  root.append(bar, listEl); draw();
}
function viewListening(root, id) {
  if (!id) return hubList(root, 'listen');
  const L = lessonById(id); if (!L) return root.append(emptyMsg('Ma l9itch had l7iwar.'));
  root.append(el('a', { href: '#/listen', class: 'back' }, '← Sma3'), el('h1', {}, L.listening.title_da), el('p', { class: 'da small' }, `Dars ${L.order}: ${L.title_en} · `, el('span', { class: 'pill' }, L.level)));
  renderListening(root, L, { lessonId: id, onFinish: () => { location.hash = '#/listen'; }, finishLabel: 'Rje3i l Sma3 →' });
}
function viewReading(root, id) {
  if (!id) return hubList(root, 'read');
  const L = lessonById(id); if (!L) return root.append(emptyMsg('Ma l9itch had nnass.'));
  root.append(el('a', { href: '#/read', class: 'back' }, '← 9raya'), el('h1', {}, L.reading.title_en), el('p', { class: 'da small' }, `Dars ${L.order}: ${L.title_en} · `, el('span', { class: 'pill' }, L.level)));
  renderReading(root, L, { lessonId: id, onFinish: () => { location.hash = '#/read'; }, finishLabel: 'Rje3i l 9raya →' });
}
function tabs(root, current, items, base) {
  const t = el('div', { class: 'tabs' }); items.forEach(([k, lab]) => t.append(el('a', { class: 'tab' + (k === current ? ' active' : ''), href: `${base}/${k}` }, lab))); root.append(t);
}
function viewSpeaking(root, tab = 'pron', id) {
  root.append(el('h1', {}, '🎤 Tkellmi'), el('p', { class: 'da' }, 'Hna kattmerrni 3la nnot9 w 3la l7iwar b lmicro. Khassek Google Chrome wla Microsoft Edge w l\'internet.'));
  tabs(root, tab, [['pron', '🗣 Nnot9'], ['role', '🎭 7iwarat'], ['words', '🃏 Kelmat']], '#/speak');
  if (!Speech.recSupported) root.append(el('div', { class: 'card notice' }, el('p', { class: 'da' }, Speech.micError('unsupported'))));
  if (tab === 'pron') {
    const pool = []; lessons().forEach(L => { if (nearLevels(L.level) && L.speaking) (L.speaking.pronunciation || []).forEach(p => pool.push(Object.assign({ lesson: L }, p))); });
    const card = el('div', { class: 'card' }, el('div', { class: 'actions', style: 'margin:0 0 .8rem' }, el('button', { class: 'btn', onClick: () => viewSpeakingReload() }, '🎲 Jomal khrin'), el('span', { class: 'muted' }, '8 jomal men lmostawa dyalek')));
    sample(pool, 8).forEach(p => { const box = el('div', { style: 'margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--line)' }, el('div', { class: 'muted', style: 'font-size:.8rem' }, `Dars ${p.lesson.order}`), enLine(p.target_en, { big: true, da: p.da, pron: p.pron })); box.append(speakPractice(p.target_en, { onResult: s => Store.recordSpeaking(s) }).node); card.append(box); });
    root.append(card);
  } else if (tab === 'role') {
    if (id) { const L = lessonById(id); if (!L || !L.speaking || !L.speaking.roleplay) return root.append(emptyMsg('Ma l9itch had l7iwar.')); const rc = el('div', { class: 'card' }); root.append(rc); rolePlay(rc, L.speaking.roleplay, {}); return; }
    const list = el('div', { class: 'item-list' });
    lessons().filter(L => L.speaking && L.speaking.roleplay).forEach(L => list.append(el('a', { class: 'item-row', href: `#/speak/role/${L.id}` }, el('div', { class: 'emoji' }, L.emoji), el('div', {}, el('div', { class: 'title' }, L.speaking.roleplay.title_da), el('div', { class: 'da small' }, `Dars ${L.order}: ${L.title_en}`)), el('span', { class: 'pill' }, L.level))));
    root.append(list);
  } else {
    const pool = allVocab().filter(v => nearLevels(v.level));
    const card = el('div', { class: 'card' }, el('p', { class: 'da small' }, 'Nnot9 dyal lkelmat: sem3i lkelma w 3awdiha.'), el('div', { class: 'actions', style: 'margin:0 0 .8rem' }, el('button', { class: 'btn', onClick: () => viewSpeakingReload() }, '🎲 Kelmat khrin')));
    sample(pool, 10).forEach(v => { const box = el('div', { style: 'margin-bottom:.8rem;padding-bottom:.8rem;border-bottom:1px solid var(--line)' }, enLine(v.en, { big: true, da: (v.emoji ? v.emoji + ' ' : '') + v.da, pron: v.pron })); box.append(speakPractice(v.en, { onResult: s => Store.recordSpeaking(s) }).node); card.append(box); });
    root.append(card);
  }
}
function viewSpeakingReload() { const h = location.hash; location.hash = '#/_'; setTimeout(() => location.hash = h, 0); }
function viewWriting(root, tab = 'dict', id) {
  root.append(el('h1', {}, '✍️ Ktaba'), el('p', { class: 'da' }, 'Dictée (sem3i w ktbi), tarjama, w ktaba 7orra m3a tas7i7 awtomatiki.'));
  tabs(root, tab, [['dict', '🎧 Dictée'], ['trans', '🔁 Tarjama'], ['free', '📝 Ktaba 7orra'], ['journal', '📓 Ljournal dyali']], '#/write');
  if (tab === 'dict' || tab === 'trans') {
    const type = tab === 'dict' ? 'dictation' : 'translate';
    const pool = []; lessons().forEach(L => L.exercises.forEach(ex => { if (ex.type === type && nearLevels(L.level)) pool.push(Object.assign({ level: L.level }, ex)); }));
    if (!pool.length) return root.append(emptyMsg('Ma kayn walou daba.'));
    const area = el('div'); root.append(area);
    Exercises.run(area, sample(pool, 8), { level: LEVELS[Store.state.level], onFinish: () => viewSpeakingReload(), finishLabel: '🎲 8 khrin', onQuit: () => { location.hash = '#/home'; } });
  } else if (tab === 'free') {
    if (id) { const L = lessonById(id); if (!L) return root.append(emptyMsg('Ma l9itch.')); root.append(el('a', { href: '#/write/free', class: 'back' }, '← Ktaba 7orra')); renderWriting(root, L.writing, { lessonId: id }); return; }
    const list = el('div', { class: 'item-list' });
    lessons().filter(L => L.writing).forEach(L => list.append(el('a', { class: 'item-row', href: `#/write/free/${L.id}` }, el('div', { class: 'emoji' }, L.emoji), el('div', {}, el('div', { class: 'title' }, L.writing.title_da), el('div', { class: 'da small' }, `Dars ${L.order}: ${L.title_en} · ${L.writing.min_words}+ kelma`)), el('span', { class: 'pill' }, L.level))));
    root.append(list);
  } else {
    const W = Store.state.writing;
    if (!W.length) return root.append(emptyMsg('Ljournal khawi. Melli tktbi nass f "Ktaba 7orra" w tsejjlih, ghadi yban hna.'));
    W.forEach(w => { const L = w.lessonId ? lessonById(w.lessonId) : null; root.append(el('div', { class: 'card' }, el('div', { class: 'label' }, `${fmtDate(w.t)}${L ? ' · Dars ' + L.order : ''} · ${w.title || ''}`), el('div', { class: 'journal-entry' }, w.text), el('div', { class: 'actions' }, el('button', { class: 'btn btn-ghost btn-sm', 'data-say': w.text }, icon('speaker'), ' Sem3i'), el('button', { class: 'btn btn-ghost btn-sm btn-danger', onClick: () => { if (confirm('Tms7i had nnass?')) { Store.deleteWriting(w.t); viewSpeakingReload(); } } }, '🗑 Ms7i')))); });
  }
}

/* ---------------- VOCAB ---------------- */
function viewVocab(root, lessonId) {
  const L = lessonId ? lessonById(lessonId) : null;
  const deck = L ? vocabOf(L).map(it => Object.assign({ lesson: L.id, level: L.level }, it)) : allVocab();
  const seen = deck.filter(v => Store.isSeen(v.en)), due = seen.filter(v => Store.isDue(v.en));
  const learned = seen.filter(v => Store.state.vocab[v.en.toLowerCase()].box >= 3);
  root.append(el('h1', {}, '🃏 Lkelmat'), L ? el('p', { class: 'da' }, el('a', { href: '#/vocab' }, 'Lkelmat kollhom'), ` › Dars ${L.order}: ${L.title_en}`) : el('p', { class: 'da' }, 'Lkelmat kollhom dyal ddrous. Lkelmat li 3reftihom kayrej3o men ba3d 1, 3, 7, 14 w 30 yom (tikrar mbe33ed) bach yb9aw f rassek.'));
  root.append(el('div', { class: 'stats' }, el('div', { class: 'stat' }, el('b', {}, deck.length), el('span', {}, 'kelma f lmajmou3')), el('div', { class: 'stat' }, el('b', {}, seen.length), el('span', {}, 'bditi t3ellmihom')), el('div', { class: 'stat' }, el('b', {}, learned.length), el('span', {}, '7fedtihom mzyan')), el('div', { class: 'stat' }, el('b', {}, due.length), el('span', {}, 'khasshom moraja3a lyouma'))));
  const area = el('div', { style: 'margin-top:1rem' });
  const pickSession = n => { const dueFirst = shuffle(due); const fresh = shuffle(deck.filter(v => !Store.isSeen(v.en))).sort((a, b) => Math.abs(levelIdx(a.level) - Store.state.level) - Math.abs(levelIdx(b.level) - Store.state.level)); return [...dueFirst, ...fresh].slice(0, n); };
  const modes = el('div', { class: 'actions', style: 'margin-top:1rem' },
    el('button', { class: 'btn btn-primary btn-lg', onClick: () => flashSession(area, pickSession(12)) }, '🃏 Lkart (12)'),
    el('button', { class: 'btn btn-lg', onClick: () => quizSession(area, pickSession(12), deck) }, '❓ Quiz: khtari lma3na'),
    el('button', { class: 'btn btn-lg', onClick: () => typeSession(area, pickSession(10)) }, '⌨️ Ktbi lkelma'));
  if (!L) { const sel = el('select', { class: 'input', onChange: e => { if (e.target.value) location.hash = '#/vocab/' + e.target.value; } }, el('option', { value: '' }, 'Khtari dars mo3ayyan…')); lessons().forEach(x => sel.append(el('option', { value: x.id }, `${x.order}. ${x.title_en}`))); modes.append(sel); }
  root.append(modes, area);
  if (!deck.length) area.append(emptyMsg('Ma kaynin kelmat.'));
}
function sessionHeader(i, n) { return el('div', { class: 'ex-head' }, el('div', { class: 'ex-count' }, `${i + 1} / ${n}`), el('div', { class: 'progress' }, el('div', { class: 'bar', style: `width:${Math.round(100 * i / n)}%` }))); }
function sessionEnd(area, right, n, again) {
  area.innerHTML = ''; area.append(el('div', { class: 'card result' }, el('div', { class: 'result-emoji' }, right / n >= .8 ? '🏆' : '👍'), el('h2', {}, `${right} / ${n}`), el('p', { class: 'da' }, right / n >= .8 ? 'Wa3ra! Lkelmat ghadi yrej3o lik men ba3d chi iyam bach tt2ekkdi mennhom.' : 'Mzyan. Lkelmat li ma3reftihomch ghadi yrej3o lik ghedda.'), el('div', { class: 'actions' }, el('button', { class: 'btn btn-primary', onClick: again }, '↻ 3awdi'), el('a', { class: 'btn', href: '#/home' }, 'Ddar'))));
  updateTopbar();
}
function flashSession(area, items) {
  if (!items.length) return area.replaceChildren(emptyMsg('Ma kayn 7ta kelma l lyouma — kolchi mraje3! 🎉'));
  let i = 0, right = 0;
  const draw = () => {
    if (i >= items.length) return sessionEnd(area, right, items.length, () => flashSession(area, items));
    const v = items[i]; area.innerHTML = ''; area.append(sessionHeader(i, items.length));
    const card = el('div', { class: 'card flashcard' }, el('div', { class: 'f-emoji' }, v.emoji || '✨'), el('div', { class: 'f-en' }, v.en), v.pron && Store.state.settings.showPron ? el('div', { class: 'pron' }, v.pron) : null, el('div', { class: 'da small' }, 'Wrrki 3la lkart bach tchoufi lma3na'));
    const back = el('div', { class: 'hidden' }, el('div', { class: 'f-da' }, v.da), v.example_en ? el('div', { style: 'margin-top:.6rem' }, enLine(v.example_en, { da: v.example_da })) : null);
    card.append(back);
    const acts = el('div', { class: 'fc-actions hidden' }, el('button', { class: 'btn btn-lg btn-bad', onClick: () => { Store.reviewVocab(v.en, false); i++; draw(); } }, '❌ Ma3reftch'), el('button', { class: 'btn btn-lg btn-good', onClick: () => { Store.reviewVocab(v.en, true); right++; i++; draw(); } }, '✅ 3reftha'));
    card.addEventListener('click', e => { if (e.target.closest('[data-say]')) return; back.classList.remove('hidden'); acts.classList.remove('hidden'); card.querySelector('.da.small').classList.add('hidden'); });
    area.append(card, el('div', { class: 'actions', style: 'justify-content:center' }, el('button', { class: 'btn btn-ghost', 'data-say': v.en }, icon('speaker'), ' Sem3i'), el('button', { class: 'btn btn-ghost', 'data-say': v.en, 'data-slow': '1' }, '🐢')), acts);
    if (Store.state.settings.autoPlay) setTimeout(() => Speech.speak(v.en), 300);
  };
  draw();
}
function quizSession(area, items, deck) {
  if (!items.length) return area.replaceChildren(emptyMsg('Ma kayn 7ta kelma l lyouma — kolchi mraje3! 🎉'));
  let i = 0, right = 0;
  const draw = () => {
    if (i >= items.length) return sessionEnd(area, right, items.length, () => quizSession(area, items, deck));
    const v = items[i]; area.innerHTML = ''; area.append(sessionHeader(i, items.length));
    const others = sample(deck.filter(d => d.da !== v.da && d.en !== v.en), 3).map(d => d.da);
    const card = el('div', { class: 'card ex-card' }, el('div', { class: 'f-emoji', style: 'font-size:2.2rem;text-align:center' }, v.emoji || ''), enLine(v.en, { big: true, pron: v.pron }), el('p', { class: 'da q' }, 'Chno lma3na dyal had lkelma?'));
    const list = el('div', { class: 'options' });
    shuffle([v.da, ...others]).forEach(o => list.append(el('button', { class: 'btn option', onClick: e => { const ok = o === v.da; $$('.option', list).forEach(b => { b.disabled = true; if (b.textContent === v.da) b.classList.add('correct'); }); if (!ok) e.currentTarget.classList.add('wrong'); Store.reviewVocab(v.en, ok); if (ok) right++; card.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, el('div', { class: 'fb-title' }, ok ? praise() : 'Lma3na s7i7: ' + v.da), v.example_en ? enLine(v.example_en, { da: v.example_da }) : null, el('div', { class: 'fb-actions' }, el('button', { class: 'btn btn-primary', onClick: () => { i++; draw(); } }, 'Lli moraha →')))); } }, o)));
    card.append(list); area.append(card);
    if (Store.state.settings.autoPlay) setTimeout(() => Speech.speak(v.en), 300);
  };
  draw();
}
function typeSession(area, items) {
  if (!items.length) return area.replaceChildren(emptyMsg('Ma kayn 7ta kelma l lyouma — kolchi mraje3! 🎉'));
  let i = 0, right = 0;
  const draw = () => {
    if (i >= items.length) return sessionEnd(area, right, items.length, () => typeSession(area, items));
    const v = items[i]; area.innerHTML = ''; area.append(sessionHeader(i, items.length));
    const card = el('div', { class: 'card ex-card' }, el('div', { style: 'font-size:2.2rem;text-align:center' }, v.emoji || ''), el('div', { class: 'da-big', style: 'text-align:center' }, v.da), el('p', { class: 'da q' }, 'Ktbi had lkelma b lingliziya:'));
    const inp = el('input', { class: 'input', type: 'text', placeholder: 'English…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const check = el('button', { class: 'btn btn-primary btn-lg', onClick: () => { const val = inp.value; if (!val.trim()) return; const exact = normalizeEn(val) === normalizeEn(v.en); const ok = exact || similarity(v.en, val) >= 0.85; inp.disabled = true; check.disabled = true; Store.reviewVocab(v.en, ok); if (ok) right++; card.append(el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') }, el('div', { class: 'fb-title' }, ok ? (exact ? praise() : '9riba bzzaf! Lkitaba s7i7a:') : 'Ljawab s7i7:'), enLine(v.en, { pron: v.pron }), el('div', { class: 'fb-actions' }, el('button', { class: 'btn btn-primary', onClick: () => { i++; draw(); } }, 'Lli moraha →')))); } }, 'Se77i ✓');
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check.click(); });
    card.append(inp, el('div', { class: 'actions' }, check, el('button', { class: 'btn btn-ghost', onClick: () => Speech.speak(v.en) }, icon('speaker'), ' Hint: sem3iha'))); area.append(card); setTimeout(() => inp.focus(), 60);
  };
  draw();
}

/* ---------------- PRACTICE / PLACEMENT ---------------- */
function viewPractice(root) {
  const cur = Store.state.level; const pool = [];
  for (const L of lessons()) { const d = Math.abs(levelIdx(L.level) - cur); if (d > 1) continue; const w = d === 0 ? 3 : 1; for (const ex of L.exercises) { if (ex.type === 'speak' && !Speech.recSupported) continue; pool.push({ ex: Object.assign({ level: L.level }, ex), w }); } }
  root.append(el('h1', {}, '⚡ Tamrin sri3'), el('p', { class: 'da' }, `10 tamarin mkhelltin men lmostawa dyalek (${LEVELS[cur]}). Lmaw9i3 kaytbe3 nnata2ij dyalek: ila kenti kat jawbi mzyan, lmostawa kaytla3 bou7do.`));
  if (!pool.length) return root.append(emptyMsg('Ma kaynin tamarin.'));
  const picked = pool.map(p => ({ p, key: Math.pow(Math.random(), 1 / p.w) })).sort((a, b) => b.key - a.key).slice(0, 10).map(x => x.p.ex);
  const area = el('div'); root.append(area);
  Exercises.run(area, picked, { level: LEVELS[cur], onFinish: () => viewSpeakingReload(), finishLabel: '⚡ 10 khrin', onQuit: () => { location.hash = '#/home'; } });
}
function viewPlacement(root) {
  const qs = C().placement || [];
  root.append(el('h1', {}, '📝 Test dyal lmostawa'), el('p', { class: 'da' }, `${qs.length} so2al, men ssahel l ss3ib. Ila ma3reftich ljawab, khtari ay wa7ed — had test ghir bach n3erfo mnin nbdaw. Nnatija ma kattsejjelch f ttamarin dyalek.`));
  if (!qs.length) return root.append(emptyMsg('Test ma kaynch.'));
  const area = el('div'); root.append(area);
  Exercises.run(area, qs, {
    record: false, resultMessage: '',
    onScore: r => {
      const by = {}; r.results.forEach(x => { const lv = x.ex.level; by[lv] = by[lv] || { ok: 0, n: 0 }; by[lv].n++; if (x.ok) by[lv].ok++; });
      let lvl = 0; for (let i = 0; i < LEVELS.length; i++) { const b = by[LEVELS[i]]; if (b && b.ok >= Math.ceil(b.n * 0.75)) lvl = Math.min(LEVELS.length - 1, i + 1); else break; }
      Store.setLevel(lvl); Store.state.placementDone = true; Store.save(); updateTopbar();
      const code = LEVELS[lvl];
      return el('div', { class: 'card notice', style: 'text-align:left' }, el('h3', {}, `Lmostawa dyalek: ${code} — ${LEVEL_NAMES[code]}`), el('p', { class: 'da' }, lvl === 0 ? 'Ghadi nbdaw men lbidaya, b chwiya b chwiya. Dars 1 kayt-sennak!' : `Mzyan! Ghadi nbdaw men ddrous dyal ${code}. T9edri dima trej3i l ddrous li 9bel ila bghiti tzidi tt2ekkdi.`));
    },
    onFinish: () => { location.hash = '#/home'; }, finishLabel: 'Yallah nbdaw →',
  });
}

/* ---------------- PROGRESS / SETTINGS / HELP ---------------- */
function viewProgress(root) {
  const s = Store.state; const Ls = lessons(); const done = Ls.filter(L => s.lessons[L.id] && s.lessons[L.id].done).length;
  const acc = Store.recentAccuracy(30); const vocabSeen = Object.keys(s.vocab).length; const learned = Object.values(s.vocab).filter(v => v.box >= 3).length;
  const spk = s.speaking.attempts ? Math.round(s.speaking.sum / s.speaking.attempts) : null;
  root.append(el('h1', {}, '📊 Ttaqaddom dyalek'));
  root.append(el('div', { class: 'stats' },
    el('div', { class: 'stat' }, el('b', {}, LEVELS[s.level]), el('span', {}, 'lmostawa — ' + LEVEL_NAMES[LEVELS[s.level]])),
    el('div', { class: 'stat' }, el('b', {}, `${done}/${Ls.length}`), el('span', {}, 'drous kemlin')),
    el('div', { class: 'stat' }, el('b', {}, acc ? Math.round(acc.acc * 100) + '%' : '—'), el('span', {}, 'dde99a (akhir 30 jawab)')),
    el('div', { class: 'stat' }, el('b', {}, learned), el('span', {}, `kelma m7fouda (men ${vocabSeen})`)),
    el('div', { class: 'stat' }, el('b', {}, spk != null ? spk + '%' : '—'), el('span', {}, `nnot9 (${s.speaking.attempts} mo7awala)`)),
    el('div', { class: 'stat' }, el('b', {}, s.writing.length), el('span', {}, 'nsous mktoubin')),
    el('div', { class: 'stat' }, el('b', {}, s.xp), el('span', {}, 'no9at (XP)')),
    el('div', { class: 'stat' }, el('b', {}, '🔥 ' + s.streak.count), el('span', {}, 'iyam mtab3in'))));
  const days = el('div', { class: 'days' }); for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = todayKey(d); days.append(el('i', { class: s.days[k] ? 'on' : '', title: k })); }
  root.append(el('div', { class: 'card' }, el('h3', {}, 'Akhir 28 yom'), days));
  const boxes = el('div', { class: 'boxes' }); const counts = Store.INTERVALS.map((_, b) => Object.values(s.vocab).filter(v => v.box === b).length); const mx = Math.max(1, ...counts);
  counts.forEach(c => boxes.append(el('div', { style: `height:${Math.max(4, Math.round(100 * c / mx))}%` }, el('span', {}, c || ''))));
  root.append(el('div', { class: 'card' }, el('h3', {}, 'Lkelmat 7sab ddaraja (tikrar mbe33ed)'), el('p', { class: 'da small' }, 'Men lisar (jdida) l limen (m7fouda mzyan). Kol merra kat3rfi kelma, kattla3 daraja w katrje3 lik men ba3d wa9t tawil kter.'), boxes, el('div', { class: 'boxes-labels' }, Store.INTERVALS.map((d, i) => el('span', {}, i === 0 ? 'jdida' : `${d} yom`)))));
  const tbl = el('table', { class: 't' }, el('tr', {}, el('th', {}, 'Dars'), el('th', {}, 'Tamarin'), el('th', {}, '9raya'), el('th', {}, 'Sma3'), el('th', {}, 'Khatawat')));
  Ls.forEach(L => { const st = s.lessons[L.id]; const steps = st ? Object.keys(st.steps).length : 0; tbl.append(el('tr', {}, el('td', {}, el('a', { href: `#/lesson/${L.id}` }, `${L.emoji} ${L.order}. ${L.title_en}`), ' ', el('span', { class: 'pill' }, L.level)), el('td', {}, st && st.best != null ? el('span', { class: 'score-pill', style: st.best < 70 ? 'color:var(--saffron-ink)' : '' }, st.best + '%') : '—'), el('td', {}, s.readingDone[L.id] != null ? s.readingDone[L.id] + '%' : '—'), el('td', {}, s.listeningDone[L.id] != null ? s.listeningDone[L.id] + '%' : '—'), el('td', {}, `${steps}/${STEPS.length}` + (st && st.done ? ' ✅' : '')))); });
  root.append(el('div', { class: 'card' }, el('h3', {}, 'Ddrous'), tbl));
  if (s.levelLog.length) root.append(el('div', { class: 'card' }, el('h3', {}, 'Ttarikh dyal lmostawa'), el('ul', {}, s.levelLog.slice(-8).map(x => el('li', {}, `${fmtDate(x.t)} — ${LEVELS[x.level]} (${x.why === 'placement' ? 'test' : x.why === 'up' ? 'tla3' : x.why === 'down' ? 'nzel' : 'manuel'})`)))));
  const file = el('input', { type: 'file', accept: 'application/json', class: 'hidden', onChange: e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { try { Store.importJson(rd.result); toast('Ttaqaddom rje3 ✓'); location.hash = '#/home'; } catch (err) { toast('Lfichier machi s7i7'); } }; rd.readAsText(f); } });
  root.append(el('div', { class: 'card' }, el('h3', {}, 'Nnoskha i7tiyatiya'), el('p', { class: 'da small' }, 'Ttaqaddom dyalek msejjel f had lmota9affi7 (browser) f had lpc. Bach ma ydi3ch wla bach tneqlih l pc akhor, sawbi noskha.'),
    el('div', { class: 'actions' }, el('button', { class: 'btn', onClick: () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([Store.exportJson()], { type: 'application/json' })); a.download = `nouha-english-${todayKey()}.json`; a.click(); } }, '⬇️ Sawbi noskha'), el('button', { class: 'btn', onClick: () => file.click() }, '⬆️ Rje3i noskha'), file,
      el('button', { class: 'btn btn-ghost btn-danger', onClick: () => { if (confirm('Wach bessa7 bghiti tms7i ttaqaddom kamel? Had l3amaliya ma kat-trej3ch.')) { Store.reset(); location.hash = '#/home'; location.reload(); } } }, '🗑 Ms7i kolchi'))));
}
function switchBtn(key, onChange) {
  const b = el('button', { class: 'switch' + (Store.state.settings[key] ? ' on' : ''), 'aria-label': key, onClick: () => { Store.state.settings[key] = !Store.state.settings[key]; b.classList.toggle('on', Store.state.settings[key]); Store.save(); onChange && onChange(Store.state.settings[key]); } });
  return b;
}
function viewSettings(root) {
  const s = Store.state.settings;
  root.append(el('h1', {}, '⚙️ L\'i3dadat'));
  const card = el('div', { class: 'card' });
  const name = el('input', { class: 'input', type: 'text', value: Store.state.name, onChange: e => { Store.state.name = e.target.value.trim() || 'Nouha'; Store.save(); updateTopbar(); } });
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Smiytek', el('div', { class: 'sub' }, 'Bach lmaw9i3 ysellem 3lik b smiytek')), name));
  const sel = el('select', { class: 'input', onChange: e => { s.voice = e.target.value || null; Store.save(); Speech.pickVoice(); Speech.speak(`Hello ${Store.state.name}! This is my voice.`); } });
  const fill = () => { sel.innerHTML = ''; sel.append(el('option', { value: '' }, 'Awtomatiki (a7sen sot kayn)')); Speech.voices.forEach(v => sel.append(el('option', { value: v.name, selected: s.voice === v.name }, `${v.name} (${v.lang})`))); };
  fill(); if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', fill);
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Ssot dyal lingliziya', el('div', { class: 'sub' }, `${Speech.voices.length} sot kayn f had lpc. Ila bghiti aswat 7sen, Microsoft Edge fih aswat tabi3iya.`)), sel));
  const rate = el('input', { type: 'range', min: '0.6', max: '1.2', step: '0.05', value: s.rate, onChange: e => { s.rate = +e.target.value; Store.save(); Speech.speak('Hello! How are you today?'); } });
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Ssor3a dyal lhadra', el('div', { class: 'sub' }, 'Lisar = bchwiya, limen = 3adi')), rate));
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Werri nnot9 b darija', el('div', { class: 'sub' }, 'Mital: hé-lo, naïs tou mit you')), switchBtn('showPron')));
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Werri ttarjama b darija', el('div', { class: 'sub' }, 'Ta7t ljomal b lingliziya. Teffiha melli twelli 9wiya!')), switchBtn('showDa')));
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Sem3i awtomatikiyan', el('div', { class: 'sub' }, 'F ttamarin dyal sma3 w lkart')), switchBtn('autoPlay')));
  card.append(el('div', { class: 'setting' }, el('label', {}, 'Lkitaba kbira', el('div', { class: 'sub' }, '7orouf kber chwiya')), switchBtn('bigText', v => document.documentElement.classList.toggle('big', v))));
  root.append(card);
  const mic = el('div', { class: 'card' }, el('h3', {}, '🎤 Jarrbi lmicro'), el('p', { class: 'da small' }, 'Wrrki 3la "Tkellmi" w 9oli: Hello, how are you? Ila tleb mennek lmota9affi7 l\'idn, khtari "Allow".'), enLine('Hello, how are you?', { pron: 'hé-lo, haw ar you' }));
  mic.append(speakPractice('Hello, how are you?').node); root.append(mic);
  root.append(el('div', { class: 'card' }, el('p', { class: 'da small' }, `Nouha English · ${lessons().length} dars · lmo7tawa tbna f ${(C().built || '').slice(0, 10)} · lmota9affi7: ${navigator.userAgent.includes('Edg') ? 'Microsoft Edge' : navigator.userAgent.includes('Chrome') ? 'Google Chrome' : 'akhor'} · lmicro: ${Speech.recSupported ? 'kayn ✓' : 'ma kaynch ✗'}`)));
}
function viewHelp(root) {
  root.append(el('h1', {}, '❓ Kifach nsta3mel lmaw9i3'));
  const H = [
    ['1. Bdi b test dyal lmostawa', 'F ssaf7a lwla kayn "Test dyal lmostawa". 16 so2al, 5 d9ay9. Men ba3d lmaw9i3 kay3tik dars li mnaseb lik.'],
    ['2. Kol dars fih 8 khatawat', '📘 Dars (chchar7 b darija) → 🃏 Kelmat → 💬 7iwar → ✏️ Tamarin → 📖 9raya → 🎧 Sma3 → 🎤 Klam → ✍️ Ktaba. Dars kayt7seb kamel melli tjibi 70% f ttamarin.'],
    ['3. Wrrki 3la ay kelma b lingliziya', 'Ay kelma wla jomla b lingliziya t9edri twrrki 3liha bach tsem3iha. 🔊 = 3adi, 🐢 = bchwiya. Lkelmat lkhodr (bhal `Hello`) 7ta houma kaytsem3o.'],
    ['4. Lmicro (klam)', 'Bach ttkellmi khassek Google Chrome wla Microsoft Edge, w l\'internet. L\'awwal merra lmota9affi7 ghadi ytleb mennek l\'idn dyal lmicro: khtari "Allow" (Autoriser). Ila sta3melti lmaw9i3 men fichier (file://), lmota9affi7 ymken ytleb l\'idn kol merra — 3adi.'],
    ['5. Lmostawa kaytbeddel bou7do', 'Lmaw9i3 kaytbe3 akhir 30 jawab dyalek. Ila kenti kat jawbi mzyan (85%+) lmostawa kaytla3, ila kan s3ib bzzaf (a9al men 45%) kaynzel chwiya bach trakkzi 3la l\'assassiyat.'],
    ['6. Lkelmat (tikrar mbe33ed)', 'Lkelmat li kat3rfihom kayrej3o lik men ba3d 1, 3, 7, 14 w 30 yom. Diri lkart kol nhar 5 d9ay9 — hadi a7sen tari9a bach lkelmat yb9aw f rassek.'],
    ['7. Ttaqaddom dyalek w PC akhor', 'Kolchi msejjel f had lpc (f lmota9affi7). Bach tkhedmi men PC akhor: 7elli nefs l\'adresse `https://yasbou2001-source.github.io/nouha-english/` w diri "Sawbi noskha" (export) f "Ttaqaddom" hna, w "Rje3i noskha" (import) f lpc l\'akhor — hakka ttaqaddom dyalek kaymchi m3ak.'],
  ];
  H.forEach(([t, b]) => root.append(el('div', { class: 'card explain' }, el('h3', {}, t), el('div', { html: renderDa(b) }))));
}
