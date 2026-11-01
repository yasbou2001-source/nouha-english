'use strict';
/* Nouha English — text-to-speech & speech recognition (Web Speech API) */
const Speech = (() => {
  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let voices = [], chosen = null, speakId = 0;
  const PREF = [/Google US English/i, /Microsoft (Aria|Jenny|Michelle|Emma|Ava|Ana)/i, /Microsoft Zira/i, /Google UK English Female/i, /Samantha/i, /Microsoft (Libby|Sonia|Hazel)/i];

  function loadVoices() {
    if (!synth) return;
    const all = synth.getVoices();
    voices = all.filter(v => /^en[-_]/i.test(v.lang) || /^en$/i.test(v.lang));
    if (!voices.length) voices = all;
    pickVoice();
  }
  function pickVoice() {
    const want = Store.state.settings.voice;
    chosen = voices.find(v => v.name === want) || null;
    if (!chosen) {
      for (const re of PREF) { const v = voices.find(v => re.test(v.name)); if (v) { chosen = v; break; } }
    }
    if (!chosen) chosen = voices.find(v => /en-US/i.test(v.lang)) || voices.find(v => /en-GB/i.test(v.lang)) || voices[0] || null;
  }
  function altVoice() {
    const others = voices.filter(v => v !== chosen);
    return others.find(v => /David|Guy|Mark|George|Ryan|Christopher|Eric|Brian|Daniel|Thomas|Male/i.test(v.name)) || others.find(v => /Google UK English Male/i.test(v.name)) || others[0] || chosen;
  }
  function ttsText(text) {
    // "N-O-U-H-A" → "N, O, U, H, A" so voices spell the letters instead of guessing a word
    return String(text).replace(/\b([A-Z](?:-[A-Z])+)\b/g, m => m.split('-').join(', '));
  }
  function chunks(text) { const m = ttsText(text).match(/[^.!?]+[.!?]+["')]?|[^.!?]+$/g); return (m || [text]).map(s => s.trim()).filter(Boolean); }

  function speak(text, opts = {}) {
    if (!synth || !text) return Promise.resolve(false);
    const id = ++speakId;
    const rate = opts.rate != null ? opts.rate : (Store.state.settings.rate || 0.95);
    const voice = opts.voice || chosen;
    const parts = chunks(text);
    return new Promise(resolve => {
      const run = () => {
        let i = 0;
        const next = () => {
          if (id !== speakId) return resolve(false);
          if (i >= parts.length) return resolve(true);
          const u = new SpeechSynthesisUtterance(parts[i++]);
          u.lang = (voice && voice.lang) || 'en-US'; if (voice) u.voice = voice;
          u.rate = rate; u.pitch = 1;
          u.onend = () => setTimeout(next, 80);
          u.onerror = (e) => { if (e.error === 'interrupted' || e.error === 'canceled') return resolve(false); next(); };
          synth.speak(u);
        };
        next();
      };
      const wasBusy = synth.speaking || synth.pending;
      synth.cancel();
      wasBusy ? setTimeout(run, 60) : run();
    });
  }
  function stop() { speakId++; if (synth) synth.cancel(); }
  async function speakLines(lines, o = {}) {
    const speakers = [...new Set(lines.map(l => l.speaker))]; const v2 = altVoice();
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i]; if (o.onLine) o.onLine(i);
      const voice = speakers.indexOf(l.speaker) % 2 === 0 ? chosen : v2;
      const ok = await speak(l.en, { voice, rate: o.rate });
      if (!ok) { if (o.onLine) o.onLine(-1); return false; }
      await new Promise(r => setTimeout(r, 400));
    }
    if (o.onLine) o.onLine(-1);
    return true;
  }
  function listen(h = {}) {
    if (!SR) { h.onError && h.onError('unsupported'); return null; }
    stop();
    const rec = new SR();
    rec.lang = h.lang || 'en-US'; rec.interimResults = true; rec.maxAlternatives = 5; rec.continuous = false;
    let gotFinal = false;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) { gotFinal = true; const alts = []; for (let k = 0; k < r.length; k++) alts.push(r[k].transcript); h.onResult && h.onResult(alts); }
        else interim += r[0].transcript;
      }
      if (interim && h.onInterim) h.onInterim(interim);
    };
    rec.onerror = (e) => { if (e.error !== 'aborted') h.onError && h.onError(e.error); };
    rec.onend = () => h.onEnd && h.onEnd(gotFinal);
    try { rec.start(); } catch (err) { h.onError && h.onError('start-failed'); return null; }
    return rec;
  }
  function micError(code) {
    switch (code) {
      case 'not-allowed': case 'service-not-allowed': return 'Khassek tsem7i l lmicro: chofi l\'ikona dyal lmicro f chrit l\'adresse (lfo9) w khtari "Allow" (Autoriser).';
      case 'no-speech': return 'Ma sme3t walou. 3awdi w hdri b sot 3ali chwiya.';
      case 'network': return 'Lmicro khasso l\'internet. T2ekkdi men l\'connexion dyalek.';
      case 'audio-capture': return 'Ma l9itch lmicro. Wach lmicro mrakkeb w khddam?';
      case 'unsupported': return 'Had lmota9affi7 ma kay9belch lmicro. Sta3mli Google Chrome wla Microsoft Edge.';
      case 'start-failed': return 'Lmicro ma bghach ybda. 3awdi wrrki 3lih.';
      default: return 'W9e3 mochkil m3a lmicro (' + code + '). 3awdi.';
    }
  }
  function init() { if (!synth) return; loadVoices(); synth.onvoiceschanged = loadVoices; }
  return { get supported() { return !!synth; }, get recSupported() { return !!SR; }, get voices() { return voices; }, get voice() { return chosen; }, init, pickVoice, speak, stop, speakLines, listen, micError };
})();
