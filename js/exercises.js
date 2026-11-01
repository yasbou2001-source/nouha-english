'use strict';
/* Nouha English — exercise runner + speaking widgets */
const PRAISE = ['Mzyan bzzaf! 🎉', 'Excellent, {name}! 🌟', 'S7i7! 👏', 'Bravo! 💪', 'Wa3ra! 🔥', 'Top! Kemmli hakka ✨', 'Hadi hiya! 👌'];
const OOPS = ['Machi mochkil, ha ljawab s7i7:', 'Chwiya ghalat. Ljawab s7i7 howa:', '3adi, kolna kanghelto. Ljawab:', 'Ljawab s7i7 kan:'];
function praise() { return rand(PRAISE).replace('{name}', Store.state.name || 'Nouha'); }

/* ---- speaking widget: pronounce a target sentence ---- */
function speakPractice(target, opts = {}) {
  const node = el('div', { class: 'speak-box' });
  const mic = el('button', { class: 'btn mic' }, icon('mic'), el('span', {}, 'Tkellmi'));
  const status = el('div', { class: 'speak-status da' });
  const heard = el('div', { class: 'heard' });
  const result = el('div', { class: 'speak-result' });
  let rec = null, best = 0, label = mic.querySelector('span');
  if (!Speech.recSupported) { status.textContent = Speech.micError('unsupported'); mic.disabled = true; }
  mic.addEventListener('click', () => {
    if (rec) { try { rec.stop(); } catch (e) { } return; }
    heard.textContent = ''; result.innerHTML = ''; status.textContent = 'Hdri daba…';
    mic.classList.add('listening'); label.textContent = 'Kansme3… (wrrki bach tw9fi)';
    rec = Speech.listen({
      onInterim: t => { heard.textContent = t; },
      onResult: alts => {
        const scored = alts.map(a => ({ a, r: alignWords(target, a) })).sort((x, y) => y.r.score - x.r.score)[0];
        heard.textContent = scored.a; best = Math.max(best, scored.r.score); show(scored);
      },
      onError: e => { status.textContent = Speech.micError(e); },
      onEnd: gotFinal => { rec = null; mic.classList.remove('listening'); label.textContent = '3awdi'; if (!gotFinal && !heard.textContent && !status.textContent) status.textContent = Speech.micError('no-speech'); },
    });
  });
  function show(scored) {
    const { words, score } = scored.r; result.innerHTML = '';
    const ws = el('div', { class: 'en-text words' }); words.forEach(w => ws.append(el('span', { class: 'w ' + (w.ok ? 'ok' : 'bad'), 'data-say': w.w }, w.w), ' '));
    const msg = score >= 85 ? 'Wa3ra! Nnot9 dyalek wade7 bzzaf 🌟' : score >= 70 ? 'Mzyan bzzaf! 👏' : score >= 40 ? 'Machi khayb. Lkelmat l7omr khasshom chwiya dyal ttamrin. Wrrki 3lihom bach tsem3ihom, w 3awdi 🔁' : 'Ma fhemtch mzyan. Sem3i ljomla merra khra 🐢 w 3awdi b chwiya.';
    result.append(el('div', { class: 'score-row' }, el('div', { class: 'score-ring ' + (score >= 70 ? 'good' : score >= 40 ? 'mid' : 'low') }, score + '%'), el('div', { class: 'da' }, msg)), ws);
    status.textContent = '';
    if (opts.onResult) opts.onResult(score, scored.a);
  }
  node.append(el('div', { class: 'speak-row' }, mic, el('button', { class: 'btn btn-ghost', 'data-say': target }, icon('speaker'), ' Sem3i'), el('button', { class: 'btn btn-ghost', 'data-say': target, 'data-slow': '1' }, '🐢')), status, heard, result);
  return { node, get best() { return best; } };
}

/* ---- free answer widget (voice or typed) → onText(alternatives[]) ---- */
function freeAnswer(opts = {}) {
  const node = el('div', { class: 'speak-box' });
  const status = el('div', { class: 'speak-status da' });
  const heard = el('div', { class: 'heard' });
  let rec = null;
  if (Speech.recSupported) {
    const mic = el('button', { class: 'btn mic' }, icon('mic'), el('span', {}, 'Jawbi b sot'));
    const label = mic.querySelector('span');
    mic.addEventListener('click', () => {
      if (rec) { try { rec.stop(); } catch (e) { } return; }
      heard.textContent = ''; status.textContent = 'Hdri daba…'; mic.classList.add('listening'); label.textContent = 'Kansme3…';
      rec = Speech.listen({
        onInterim: t => { heard.textContent = t; },
        onResult: alts => { heard.textContent = alts[0]; opts.onText && opts.onText(alts); },
        onError: e => { status.textContent = Speech.micError(e); },
        onEnd: () => { rec = null; mic.classList.remove('listening'); label.textContent = '3awdi'; },
      });
    });
    node.append(el('div', { class: 'speak-row' }, mic, el('span', { class: 'muted' }, 'wla ktbi ljawab:')));
  } else {
    node.append(el('div', { class: 'da small' }, Speech.micError('unsupported') + ' Daba ktbi ljawab:'));
  }
  const inp = el('input', { class: 'input', type: 'text', placeholder: 'Ktbi b lingliziya…', autocomplete: 'off', spellcheck: 'false' });
  const send = el('button', { class: 'btn btn-primary', onClick: () => { if (inp.value.trim()) { heard.textContent = inp.value; opts.onText && opts.onText([inp.value]); inp.value = ''; } } }, 'Sift');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') send.click(); });
  node.append(el('div', { class: 'typed' }, inp, send), status, heard);
  return { node, disable() { $$('button,input', node).forEach(b => b.disabled = true); } };
}

/* ---- exercise renderers ---- */
const RENDER = {};
function mcqOptions(card, ex, api, afterCheck) {
  const list = el('div', { class: 'options' }); let sel = null;
  const check = el('button', { class: 'btn btn-primary btn-lg check', disabled: true }, 'Se77i ✓');
  shuffle(ex.options.map((o, i) => ({ o, i }))).forEach(({ o, i }) => {
    const b = el('button', { class: 'btn option' }, String(o)); b.dataset.i = i;
    b.addEventListener('click', () => { sel = i; $$('.option', list).forEach(x => x.classList.remove('selected')); b.classList.add('selected'); check.disabled = false; if (!looksDarija(String(o)) && /[a-z]/i.test(String(o))) Speech.speak(String(o)); });
    list.append(b);
  });
  check.addEventListener('click', () => {
    const ok = sel === ex.answer;
    $$('.option', list).forEach(x => { const i = +x.dataset.i; x.disabled = true; if (i === ex.answer) x.classList.add('correct'); else if (i === sel) x.classList.add('wrong'); });
    check.disabled = true;
    api.done(ok, Object.assign({ correctText: String(ex.options[ex.answer]) }, afterCheck ? afterCheck() : {}));
  });
  card.append(list, el('div', { class: 'actions' }, check));
}
RENDER.mcq = (card, ex, api) => {
  if (ex.question_en) card.append(enLine(ex.question_en, { big: true }));
  if (ex.question_da) card.append(el('p', { class: 'da q', html: renderDa(ex.question_da) }));
  mcqOptions(card, ex, api);
};
RENDER.listen_mcq = (card, ex, api) => {
  card.append(playBlock(ex.say_en));
  card.append(el('p', { class: 'da q', html: renderDa(ex.question_da || 'Sem3i w khtari ljawab s7i7.') }));
  mcqOptions(card, ex, api, () => ({ node: el('div', {}, el('div', { class: 'label' }, 'Lli sme3ti'), enLine(ex.say_en)) }));
};
RENDER.truefalse = (card, ex, api) => {
  card.append(enLine(ex.statement_en, { big: true, da: ex.statement_da }));
  card.append(el('p', { class: 'da q' }, 'Wach had ljomla s7i7a wla ghalta?'));
  const row = el('div', { class: 'tf' });
  const mk = (val, label) => el('button', { class: 'btn option tf-btn', onClick: (e) => { $$('.tf-btn', row).forEach(b => b.disabled = true); const ok = val === ex.answer; e.currentTarget.classList.add(ok ? 'correct' : 'wrong'); api.done(ok, { node: el('div', { class: 'da small' }, 'Ljawab: ' + (ex.answer ? 'True — s7i7' : 'False — ghalet')) }); } }, label);
  row.append(mk(true, '✅ True — s7i7'), mk(false, '❌ False — ghalet'));
  card.append(row);
};
RENDER.fill = (card, ex, api) => {
  const [before, after] = ex.sentence_en.split('___');
  const slot = el('span', { class: 'slot' }, '…');
  const t = el('span', { class: 'en-text' }); t.append(wordSpans(before), slot, wordSpans(after));
  card.append(el('div', { class: 'en-line big' }, el('div', { class: 'en-row' }, t)));
  card.append(el('p', { class: 'da q' }, ex.options ? 'Khtari lkelma li khassha tkoun f lblasa lkhawya.' : 'Ktbi lkelma li khassha tkoun f lblasa lkhawya.'));
  if (ex.hint_da) card.append(el('p', { class: 'da hint', html: renderDa(ex.hint_da) }));
  const check = el('button', { class: 'btn btn-primary btn-lg check', disabled: true }, 'Se77i ✓');
  let value = '';
  if (ex.options) {
    const chips = el('div', { class: 'chips' });
    shuffle(ex.options).forEach(o => { const c = el('button', { class: 'chip' }, o); c.addEventListener('click', () => { value = o; slot.textContent = o; $$('.chip', chips).forEach(x => x.classList.remove('selected')); c.classList.add('selected'); check.disabled = false; }); chips.append(c); });
    card.append(chips);
  } else {
    const inp = el('input', { class: 'input', type: 'text', placeholder: 'Ktbi lkelma hna…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    inp.addEventListener('input', () => { value = inp.value; slot.textContent = inp.value || '…'; check.disabled = !inp.value.trim(); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !check.disabled) check.click(); });
    card.append(inp); setTimeout(() => inp.focus(), 60);
  }
  check.addEventListener('click', () => {
    const accepted = ex.options ? [ex.answer] : (ex.answers || [ex.answer]);
    const ok = accepted.some(a => normalizeEn(a) === normalizeEn(value));
    slot.textContent = value; slot.classList.add(ok ? 'correct' : 'wrong');
    $$('.chip,input', card).forEach(x => x.disabled = true); check.disabled = true;
    api.done(ok, { correct: ex.sentence_en.replace('___', accepted[0]), correctDa: ex.da, showCorrectOnOk: true });
  });
  card.append(el('div', { class: 'actions' }, check));
};
RENDER.order = (card, ex, api) => {
  card.append(el('p', { class: 'da q' }, 'Wrrki 3la lkelmat b ttartib bach tkewni ljomla:'));
  if (ex.da) card.append(el('div', { class: 'da-big' }, ex.da));
  const line = el('div', { class: 'answer-line' }), bank = el('div', { class: 'bank' });
  const check = el('button', { class: 'btn btn-primary btn-lg check', disabled: true }, 'Se77i ✓');
  let order = shuffle(ex.words); if (order.join(' ') === ex.words.join(' ') && ex.words.length > 2) order = shuffle(ex.words);
  order.forEach(w => { const c = el('button', { class: 'chip' }, w); c.addEventListener('click', () => { (c.parentElement === bank ? line : bank).append(c); check.disabled = line.children.length !== ex.words.length; }); bank.append(c); });
  check.addEventListener('click', () => {
    const got = Array.from(line.children).map(c => c.textContent).join(' ');
    const ok = normalizeEn(got) === normalizeEn(ex.answer) && got.replace(/\s+/g, ' ').trim().toLowerCase() === ex.answer.replace(/\s+/g, ' ').trim().toLowerCase();
    line.classList.add(ok ? 'correct' : 'wrong'); $$('.chip', card).forEach(x => x.disabled = true); check.disabled = true;
    api.done(ok, { correct: ex.answer, correctDa: ex.da, showCorrectOnOk: true });
  });
  card.append(line, bank, el('div', { class: 'actions' }, check));
};
RENDER.translate = (card, ex, api) => {
  card.append(el('p', { class: 'da q' }, 'Terjmi had ljomla l lingliziya:'), el('div', { class: 'da-big' }, ex.da));
  const ta = el('textarea', { class: 'input', rows: 2, placeholder: 'Ktbi b lingliziya hna…', spellcheck: 'false' });
  const check = el('button', { class: 'btn btn-primary btn-lg check', disabled: true }, 'Se77i ✓');
  const hintWrap = el('div');
  if (ex.hint_en) hintWrap.append(el('button', { class: 'btn btn-ghost btn-sm', onClick: () => { hintWrap.innerHTML = ''; hintWrap.append(el('div', { class: 'hint' }, '💡 ' + ex.hint_en)); } }, '💡 3tini hint'));
  ta.addEventListener('input', () => check.disabled = !ta.value.trim());
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!check.disabled) check.click(); } });
  check.addEventListener('click', () => {
    const val = ta.value;
    const best = ex.answers.map(a => ({ a, s: similarity(a, val) })).sort((x, y) => y.s - x.s)[0];
    const exact = ex.answers.some(a => normalizeEn(a) === normalizeEn(val));
    const ok = exact || best.s >= 0.92;
    ta.disabled = true; check.disabled = true;
    let node = null;
    if (ok && !exact) node = el('div', { class: 'da small' }, 'Ghir chi ghalat sghir f lktaba — ha ljomla lkamla:');
    else if (!ok && best.s >= 0.7) node = el('div', {}, el('div', { class: 'da small' }, '9riba bzzaf! Lkelmat l7omr hiya li khasshom yt3awdo:'), diffNode(best.a, val));
    api.done(ok, { correct: best.a, correctDa: ex.da, showCorrectOnOk: true, node });
  });
  card.append(ta, hintWrap, el('div', { class: 'actions' }, check)); setTimeout(() => ta.focus(), 60);
};
RENDER.dictation = (card, ex, api) => {
  card.append(playBlock(ex.say_en), el('p', { class: 'da q' }, 'Sem3i mzyan w ktbi ljomla li sme3ti. T9edri tsem3iha ch7al men merra bghiti.'));
  const ta = el('textarea', { class: 'input', rows: 2, placeholder: 'Ktbi hna…', spellcheck: 'false' });
  const check = el('button', { class: 'btn btn-primary btn-lg check', disabled: true }, 'Se77i ✓');
  ta.addEventListener('input', () => check.disabled = !ta.value.trim());
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!check.disabled) check.click(); } });
  check.addEventListener('click', () => {
    const val = ta.value; const exact = normalizeEn(val) === normalizeEn(ex.say_en); const s = similarity(ex.say_en, val);
    const ok = exact || s >= 0.9; ta.disabled = true; check.disabled = true;
    const node = ok && !exact ? el('div', { class: 'da small' }, 'Ghir chi 7arf ghalet — ha ljomla s7i7a:') : (!ok ? diffNode(ex.say_en, val) : null);
    api.done(ok, { correct: ex.say_en, correctDa: ex.da, showCorrectOnOk: true, node });
  });
  card.append(ta, el('div', { class: 'actions' }, check));
};
RENDER.match = (card, ex, api) => {
  card.append(el('p', { class: 'da q', html: renderDa(ex.instruction_da || 'Wessli lkelma m3a lma3na dyalha.') }));
  const left = shuffle(ex.pairs.map((p, i) => ({ t: p.en, i, emoji: p.emoji }))), right = shuffle(ex.pairs.map((p, i) => ({ t: p.da, i })));
  const colL = el('div', { class: 'col' }), colR = el('div', { class: 'col' });
  let selL = null, selR = null, mistakes = 0, matched = 0;
  function attempt() {
    if (!selL || !selR) return;
    const a = selL.btn, b = selR.btn, good = selL.i === selR.i;
    a.classList.remove('selected'); b.classList.remove('selected');
    if (good) { a.classList.add('matched'); b.classList.add('matched'); a.disabled = b.disabled = true; matched++; }
    else { mistakes++; a.classList.add('wrong'); b.classList.add('wrong'); setTimeout(() => { a.classList.remove('wrong'); b.classList.remove('wrong'); }, 650); }
    selL = selR = null;
    if (matched === ex.pairs.length) { const ok = mistakes <= Math.max(1, Math.floor(ex.pairs.length / 3)); api.done(ok, { node: el('div', { class: 'da small' }, mistakes === 0 ? 'Bla 7ta ghalat! 🎯' : `Lghalat: ${mistakes}`) }); }
  }
  left.forEach(x => { const btn = el('button', { class: 'btn option' }, (x.emoji ? x.emoji + ' ' : '') + x.t); btn.addEventListener('click', () => { $$('.option', colL).forEach(o => o.classList.remove('selected')); btn.classList.add('selected'); selL = { ...x, btn }; Speech.speak(x.t); attempt(); }); colL.append(btn); });
  right.forEach(x => { const btn = el('button', { class: 'btn option da-opt' }, x.t); btn.addEventListener('click', () => { $$('.option', colR).forEach(o => o.classList.remove('selected')); btn.classList.add('selected'); selR = { ...x, btn }; attempt(); }); colR.append(btn); });
  card.append(el('div', { class: 'match' }, colL, colR));
};
RENDER.speak = (card, ex, api) => {
  card.append(el('p', { class: 'da q' }, 'Sem3i ljomla, men ba3d wrrki 3la lmicro w 9oliha b sot wade7:'));
  card.append(enLine(ex.target_en, { big: true, da: ex.da, pron: ex.pron }));
  const cont = el('button', { class: 'btn btn-primary btn-lg', disabled: Speech.recSupported }, 'Kemmli →');
  const sp = speakPractice(ex.target_en, { onResult: () => { cont.disabled = false; } });
  cont.addEventListener('click', () => { if (!Speech.recSupported) return api.skip(); api.done(sp.best >= 70, { score: sp.best, node: el('div', { class: 'da small' }, sp.best >= 70 ? 'Nnot9 dyalek mzyan!' : 'Kemmli ttamrin 3la nnot9, ghadi yt7essen m3a lwa9t.') }); });
  card.append(sp.node, el('div', { class: 'actions' }, cont, Speech.recSupported ? el('button', { class: 'btn btn-ghost', onClick: () => api.skip() }, 'Douzi') : null));
};

/* ---- the runner ---- */
const Exercises = {
  run(container, list, opts = {}) {
    const items = list.slice(); let idx = 0; const results = [];
    function render() {
      container.innerHTML = '';
      if (idx >= items.length) return finish();
      const ex = items[idx]; const lv = ex.level || opts.level || null;
      const head = el('div', { class: 'ex-head' }, el('div', { class: 'ex-count' }, `${idx + 1} / ${items.length}`), el('div', { class: 'progress' }, el('div', { class: 'bar', style: `width:${Math.round(100 * idx / items.length)}%` })));
      if (opts.onQuit) head.append(el('button', { class: 'btn btn-ghost btn-sm', onClick: opts.onQuit }, 'Khroji'));
      const card = el('div', { class: 'card ex-card' });
      container.append(head, card);
      const api = {
        done(ok, extra = {}) {
          results.push({ ex, ok });
          if (opts.record !== false && ex.type !== 'speak') Store.recordAnswer(ok, lv, opts.lessonId, ex.type);
          if (ex.type === 'speak' && extra.score != null) Store.recordSpeaking(extra.score);
          feedback(card, ok, ex, extra);
        },
        skip() { results.push({ ex, ok: null }); idx++; render(); },
      };
      (RENDER[ex.type] || RENDER.mcq)(card, ex, api);
    }
    function feedback(card, ok, ex, extra) {
      const fb = el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') });
      fb.append(el('div', { class: 'fb-title' }, ok ? praise() : rand(OOPS)));
      if (extra.correct && (!ok || extra.showCorrectOnOk)) fb.append(enLine(extra.correct, { da: extra.correctDa }));
      if (extra.correctText && !ok) fb.append(looksDarija(extra.correctText) || !/[a-z]/i.test(extra.correctText) ? el('div', { class: 'da-big' }, extra.correctText) : enLine(extra.correctText));
      if (extra.node) fb.append(extra.node);
      if (ex.explain_da) fb.append(el('div', { class: 'da explain', html: renderDa(ex.explain_da) }));
      const next = el('button', { class: 'btn btn-primary btn-lg', onClick: () => { idx++; render(); } }, idx + 1 < items.length ? 'Lli moraha →' : 'Chofi nnatija →');
      fb.append(el('div', { class: 'fb-actions' }, next));
      card.append(fb); next.focus({ preventScroll: true }); fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    function finish() {
      const graded = results.filter(r => r.ok !== null); const total = graded.length; const score = graded.filter(r => r.ok).length; const p = pct(score, total);
      const r = { score, total, pct: p, results };
      const msg = opts.resultMessage != null ? opts.resultMessage : (p >= 90 ? 'Wa3ra! Nti top! 🏆' : p >= 70 ? 'Mzyan bzzaf! Kemmli hakka 💪' : p >= 50 ? 'Machi khayb! 3awdi 9ray dars w jarrbi merra khra.' : 'Had ddars s3ib chwiya. Rje3i l chchar7 w lkelmat, w 3awdi — ghadi tnej7i!');
      const wrap = el('div', { class: 'card result' }, el('div', { class: 'result-emoji' }, p >= 90 ? '🏆' : p >= 70 ? '🎉' : p >= 50 ? '👍' : '💪'), el('h2', {}, `${score} / ${total}`), el('div', { class: 'result-pct' }, p + '%'), msg ? el('p', { class: 'da' }, msg) : null);
      const extra = opts.onScore ? opts.onScore(r) : null; if (extra) wrap.append(extra);
      const actions = el('div', { class: 'actions' }, el('button', { class: 'btn btn-ghost', onClick: () => { idx = 0; results.length = 0; render(); } }, '↻ 3awdi'));
      if (opts.onFinish) actions.append(el('button', { class: 'btn btn-primary btn-lg', onClick: () => opts.onFinish(r) }, opts.finishLabel || 'Kemmli →'));
      wrap.append(actions); container.append(wrap);
      if (opts.record !== false) { const ch = Store.evaluateLevel(); if (ch) announceLevel(ch, container); }
      updateTopbar();
    }
    render();
  },
};
function announceLevel(ch, container) {
  const code = LEVELS[ch.level];
  const msg = ch.change > 0 ? `🎉 Mostawak tla3! Daba nti f ${code} (${LEVEL_NAMES[code]}). Ttamarin ghadi ykounou s3ab chwiya kter.` : `Nzelna chwiya l ${code} (${LEVEL_NAMES[code]}) bach nrakkzo 3la l'assassiyat. Machi mochkil, hadchi 3adi!`;
  container.prepend(el('div', { class: 'card notice' }, el('p', { class: 'da' }, msg)));
  toast(msg);
}
