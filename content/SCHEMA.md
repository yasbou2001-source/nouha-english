# Content schema (JSON). One file = a JSON ARRAY of lesson objects.
Validate: `python tools/validate.py content/<file>.json` → must print `OK`.
Reference example: `content/lessons_01.json` (lesson 1, complete). Match its depth and quality.

LEVEL ∈ "A1.1" | "A1.2" | "A2.1" | "A2.2"

## Lesson
```json
{
 "id": "l05", "order": 5, "level": "A1.1", "emoji": "🔢",
 "title_en": "Numbers 20–100, age & prices",
 "title_da": "L'ar9am 20–100, l3mer w taman",
 "goals_da": ["Ghadi t9edri t…", "…", "…"],
 "sections": [ ...Section ],
 "exercises": [ ...Exercise ],
 "reading": Reading,
 "listening": Listening,
 "speaking": { "pronunciation": [ {"target_en":"…","da":"…","pron":"…"} ], "roleplay": Roleplay },
 "writing": Writing
}
```
- goals_da: 3–4 short goals.
- sections: 3–5 `explain` + exactly 1 `vocab` + exactly 1 `dialogue` + 1 `tip` (order is free; usually explain → vocab → dialogue → tip).
- exercises: 12–16, mixed types, easy → hard.
- speaking.pronunciation: 5–6 sentences.

## Sections
```json
{"type":"explain","title_da":"…","body_da":"…","examples":[{"en":"…","da":"…","pron":"…"}]}
```
body_da: Darija; paragraphs separated by a blank line (`\n\n`); bullet lines start with `- `; `**bold**` allowed; every English word in `backticks`. examples: 3–5 items.
```json
{"type":"vocab","title_da":"Lkelmat dyal dars","items":[{"en":"apple","da":"teffa7a","emoji":"🍎","pron":"a-peul","example_en":"I eat an apple.","example_da":"Kanakol teffa7a."}]}
```
12–16 items; emoji strongly recommended (use "" if none fits).
```json
{"type":"dialogue","title_da":"…","context_da":"…","lines":[{"speaker":"Sarah","en":"…","da":"…"}]}
```
6–10 lines, 2 speakers.
```json
{"type":"tip","title_da":"Nasi7a","body_da":"…"}
```

## Exercises
Every exercise may carry `"level": LEVEL` (defaults to the lesson level) and `"explain_da"` (short Darija explanation shown after answering — include it on most exercises).
```json
{"type":"mcq","question_da":"…","question_en":"(optional English sentence/question)","options":["a","b","c","d"],"answer":0,"explain_da":"…"}
{"type":"listen_mcq","say_en":"I have two brothers.","question_da":"Sem3i w khtari…","options":["…","…","…"],"answer":1,"explain_da":"…"}
{"type":"fill","sentence_en":"She ___ a doctor.","options":["am","is","are"],"answer":"is","hint_da":"…","explain_da":"…"}
{"type":"fill","sentence_en":"She ___ a doctor.","answers":["is"],"hint_da":"…","explain_da":"…"}
{"type":"order","words":["is","My","Nouha."],"answer":"My name is Nouha.","da":"Smiyti Nouha."}
{"type":"translate","da":"Ana men lMeghrib.","answers":["I am from Morocco.","I'm from Morocco."],"hint_en":"I ... from ...","explain_da":"…"}
{"type":"dictation","say_en":"We live in Rabat.","da":"Kansekno f Rabat.","explain_da":"…"}
{"type":"match","instruction_da":"Wessli lkelma m3a lma3na dyalha","pairs":[{"en":"apple","da":"teffa7a","emoji":"🍎"}]}
{"type":"truefalse","statement_en":"Sarah has two brothers.","statement_da":"(optional)","answer":true,"explain_da":"…"}
{"type":"speak","target_en":"Nice to meet you.","da":"Metcherfa b m3erftek.","pron":"naïs tou mit you"}
```
- mcq / listen_mcq: 3–4 options (English, Darija or emoji); `answer` = index of the correct option (the app shuffles).
- listen_mcq: the app plays `say_en`; the text stays hidden until answered.
- fill: exactly one `___`. With `options` (3) → click chips; without → typed, give `answers` (all accepted spellings).
- order: `words` = exactly the words of `answer`, punctuation attached to the last word. 4–8 words.
- match: 4–6 pairs.
- truefalse: `answer` is a JSON boolean.

## Reading
```json
{"title_en":"…","title_da":"…","emoji":"📖","text_en":"…","text_da":"…","glossary":[{"en":"…","da":"…"}],"questions":[ 4 × (mcq | truefalse) ]}
```
## Listening
```json
{"title_da":"…","emoji":"🎧","pre_da":"…","lines":[{"speaker":"…","en":"…","da":"…"}],"questions":[ 4 × (mcq | truefalse | listen_mcq) ]}
```
## Roleplay
```json
{"title_da":"…","context_da":"…","turns":[{"bot_en":"…","bot_da":"…","expect_keywords":["my name is","i am","i'm"],"sample_en":"My name is Nouha."}]}
```
4–6 turns. The app speaks `bot_en`; Nouha answers with her voice; any keyword found → success; otherwise the app shows `sample_en` for her to repeat.
## Writing
```json
{"title_da":"…","prompt_da":"…","helper_en":["My name is ...","I am from ..."],"min_words":20,"keywords":["name","from"],"model_en":"…"}
```
keywords lowercase (2–5); model_en = model answer of min_words to 2×min_words words.
