"""Validate Nouha English lesson JSON files.

Usage:  python tools/validate.py content/lessons_02_04.json [more files...]
Prints "OK" when everything is valid, otherwise lists errors and exits 1.
"""
import json
import re
import sys

LEVELS = {"A1.1", "A1.2", "A2.1", "A2.2"}
EX_TYPES = {"mcq", "listen_mcq", "fill", "order", "translate", "dictation", "match", "truefalse", "speak"}
ARABIC = re.compile(r"[\u0600-\u06FF]")


def norm_word(w):
    return re.sub(r"[^a-z0-9']", "", w.lower())


class V:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def err(self, path, msg):
        self.errors.append(f"{path}: {msg}")

    def warn(self, path, msg):
        self.warnings.append(f"{path}: {msg}")

    # ---- generic helpers
    def req(self, obj, key, path, typ=None):
        if key not in obj:
            self.err(path, f"missing '{key}'")
            return None
        v = obj[key]
        if typ is not None and not isinstance(v, typ):
            self.err(path, f"'{key}' must be {typ}")
            return None
        if isinstance(v, str) and not v.strip():
            self.err(path, f"'{key}' is empty")
        return v

    def scan_arabic(self, obj, path):
        if isinstance(obj, str):
            if ARABIC.search(obj):
                self.err(path, "Arabic script found — Darija must be in LATIN letters")
        elif isinstance(obj, list):
            for i, x in enumerate(obj):
                self.scan_arabic(x, f"{path}[{i}]")
        elif isinstance(obj, dict):
            for k, x in obj.items():
                self.scan_arabic(x, f"{path}.{k}")

    # ---- exercises
    def exercise(self, ex, path, default_level):
        if not isinstance(ex, dict):
            self.err(path, "exercise must be an object")
            return
        t = ex.get("type")
        if t not in EX_TYPES:
            self.err(path, f"unknown type {t!r}")
            return
        if "level" in ex and ex["level"] not in LEVELS:
            self.err(path, f"bad level {ex['level']!r}")
        if t in ("mcq", "listen_mcq"):
            opts = self.req(ex, "options", path, list)
            ans = ex.get("answer")
            if opts is not None:
                if len(opts) < 2:
                    self.err(path, "need >= 2 options")
                if len(set(map(str, opts))) != len(opts):
                    self.err(path, "duplicate options")
                if not isinstance(ans, int) or isinstance(ans, bool) or not (0 <= ans < len(opts)):
                    self.err(path, "'answer' must be an int index into options")
            if t == "listen_mcq":
                self.req(ex, "say_en", path, str)
            if t == "mcq" and not (ex.get("question_da") or ex.get("question_en")):
                self.err(path, "mcq needs question_da or question_en")
        elif t == "fill":
            s = self.req(ex, "sentence_en", path, str) or ""
            if s.count("___") != 1:
                self.err(path, "sentence_en must contain exactly one '___'")
            if "options" in ex:
                if not isinstance(ex["options"], list) or len(ex["options"]) < 2:
                    self.err(path, "fill options must be a list of >= 2")
                elif ex.get("answer") not in ex["options"]:
                    self.err(path, "fill 'answer' must be one of 'options'")
            else:
                a = ex.get("answers")
                if not isinstance(a, list) or not a:
                    self.err(path, "fill without options needs non-empty 'answers' list")
        elif t == "order":
            words = self.req(ex, "words", path, list) or []
            answer = self.req(ex, "answer", path, str) or ""
            if words and answer:
                a = sorted(norm_word(w) for w in answer.split())
                b = sorted(norm_word(w) for w in words)
                if a != b:
                    self.err(path, f"order: words {words} do not match answer {answer!r}")
                if len(words) < 3:
                    self.err(path, "order needs >= 3 words")
            self.req(ex, "da", path, str)
        elif t == "translate":
            self.req(ex, "da", path, str)
            a = self.req(ex, "answers", path, list)
            if a is not None and (not a or not all(isinstance(x, str) and x.strip() for x in a)):
                self.err(path, "translate 'answers' must be non-empty strings")
        elif t == "dictation":
            self.req(ex, "say_en", path, str)
        elif t == "match":
            pairs = self.req(ex, "pairs", path, list) or []
            if len(pairs) < 3:
                self.err(path, "match needs >= 3 pairs")
            for i, p in enumerate(pairs):
                if not isinstance(p, dict) or not p.get("en") or not p.get("da"):
                    self.err(f"{path}.pairs[{i}]", "pair needs 'en' and 'da'")
            ens = [p.get("en") for p in pairs if isinstance(p, dict)]
            das = [p.get("da") for p in pairs if isinstance(p, dict)]
            if len(set(ens)) != len(ens) or len(set(das)) != len(das):
                self.err(path, "match pairs must be unique on both sides")
        elif t == "truefalse":
            self.req(ex, "statement_en", path, str)
            if not isinstance(ex.get("answer"), bool):
                self.err(path, "truefalse 'answer' must be true/false (boolean)")
        elif t == "speak":
            self.req(ex, "target_en", path, str)
            self.req(ex, "da", path, str)

    def questions(self, qs, path, allowed, minimum=3):
        if not isinstance(qs, list):
            self.err(path, "questions must be a list")
            return
        if len(qs) < minimum:
            self.err(path, f"need >= {minimum} questions")
        for i, q in enumerate(qs):
            p = f"{path}[{i}]"
            self.exercise(q, p, None)
            if isinstance(q, dict) and q.get("type") not in allowed:
                self.err(p, f"type {q.get('type')!r} not allowed here (allowed: {sorted(allowed)})")

    # ---- lesson
    def lesson(self, L, path):
        if not isinstance(L, dict):
            self.err(path, "lesson must be an object")
            return
        lid = self.req(L, "id", path, str) or ""
        if lid and not re.fullmatch(r"l\d{2}", lid):
            self.err(path, f"id {lid!r} must look like 'l05'")
        order = self.req(L, "order", path, int)
        if lid and order is not None and lid != f"l{order:02d}":
            self.err(path, f"id {lid!r} does not match order {order}")
        level = self.req(L, "level", path, str)
        if level not in LEVELS:
            self.err(path, f"bad level {level!r}")
        self.req(L, "emoji", path, str)
        self.req(L, "title_en", path, str)
        self.req(L, "title_da", path, str)
        goals = self.req(L, "goals_da", path, list)
        if goals is not None and not (2 <= len(goals) <= 5):
            self.err(path, "goals_da should have 2–5 items")

        # sections
        secs = self.req(L, "sections", path, list) or []
        counts = {"explain": 0, "vocab": 0, "dialogue": 0, "tip": 0}
        for i, s in enumerate(secs):
            p = f"{path}.sections[{i}]"
            if not isinstance(s, dict):
                self.err(p, "section must be an object")
                continue
            t = s.get("type")
            if t not in counts:
                self.err(p, f"unknown section type {t!r}")
                continue
            counts[t] += 1
            if t == "explain":
                self.req(s, "title_da", p, str)
                self.req(s, "body_da", p, str)
                exs = s.get("examples", [])
                if not isinstance(exs, list) or len(exs) < 2:
                    self.err(p, "explain needs >= 2 examples")
                else:
                    for j, e in enumerate(exs):
                        if not isinstance(e, dict) or not e.get("en") or not e.get("da"):
                            self.err(f"{p}.examples[{j}]", "example needs 'en' and 'da'")
            elif t == "vocab":
                items = self.req(s, "items", p, list) or []
                if len(items) < 8:
                    self.err(p, "vocab needs >= 8 items (12–16 recommended)")
                seen = set()
                for j, it in enumerate(items):
                    pp = f"{p}.items[{j}]"
                    if not isinstance(it, dict):
                        self.err(pp, "item must be an object")
                        continue
                    self.req(it, "en", pp, str)
                    self.req(it, "da", pp, str)
                    self.req(it, "example_en", pp, str)
                    self.req(it, "example_da", pp, str)
                    if "emoji" not in it:
                        self.warn(pp, "no emoji")
                    if "pron" not in it:
                        self.warn(pp, "no pron")
                    en = (it.get("en") or "").lower()
                    if en in seen:
                        self.err(pp, f"duplicate vocab '{en}'")
                    seen.add(en)
            elif t == "dialogue":
                self.req(s, "title_da", p, str)
                lines = self.req(s, "lines", p, list) or []
                if len(lines) < 4:
                    self.err(p, "dialogue needs >= 4 lines")
                for j, ln in enumerate(lines):
                    if not isinstance(ln, dict) or not ln.get("speaker") or not ln.get("en") or not ln.get("da"):
                        self.err(f"{p}.lines[{j}]", "line needs speaker, en, da")
            elif t == "tip":
                self.req(s, "body_da", p, str)
        if counts["explain"] < 2:
            self.err(path, "need >= 2 explain sections")
        if counts["vocab"] != 1:
            self.err(path, "need exactly 1 vocab section")
        if counts["dialogue"] != 1:
            self.err(path, "need exactly 1 dialogue section")

        # exercises
        exs = self.req(L, "exercises", path, list) or []
        if len(exs) < 10:
            self.err(path, f"need >= 10 exercises (have {len(exs)})")
        types = {}
        for i, ex in enumerate(exs):
            self.exercise(ex, f"{path}.exercises[{i}]", level)
            if isinstance(ex, dict):
                types[ex.get("type")] = types.get(ex.get("type"), 0) + 1
        for t in ("listen_mcq", "dictation", "order", "translate"):
            if types.get(t, 0) < 1:
                self.err(path, f"exercises need at least one '{t}'")
        if types.get("match", 0) < 1:
            self.warn(path, "no 'match' exercise")
        if types.get("speak", 0) < 1:
            self.warn(path, "no 'speak' exercise")

        # reading
        r = self.req(L, "reading", path, dict)
        if r is not None:
            p = f"{path}.reading"
            self.req(r, "title_en", p, str)
            self.req(r, "title_da", p, str)
            txt = self.req(r, "text_en", p, str) or ""
            n = len(txt.split())
            if n < 45:
                self.err(p, f"text_en too short ({n} words)")
            if n > 200:
                self.warn(p, f"text_en long ({n} words)")
            self.req(r, "text_da", p, str)
            g = self.req(r, "glossary", p, list) or []
            if len(g) < 4:
                self.err(p, "glossary needs >= 4 items")
            self.questions(r.get("questions"), f"{p}.questions", {"mcq", "truefalse"})

        # listening
        li = self.req(L, "listening", path, dict)
        if li is not None:
            p = f"{path}.listening"
            self.req(li, "title_da", p, str)
            self.req(li, "pre_da", p, str)
            lines = self.req(li, "lines", p, list) or []
            if len(lines) < 5:
                self.err(p, "listening needs >= 5 lines")
            for j, ln in enumerate(lines):
                if not isinstance(ln, dict) or not ln.get("speaker") or not ln.get("en") or not ln.get("da"):
                    self.err(f"{p}.lines[{j}]", "line needs speaker, en, da")
            self.questions(li.get("questions"), f"{p}.questions", {"mcq", "truefalse", "listen_mcq"})

        # speaking
        sp = self.req(L, "speaking", path, dict)
        if sp is not None:
            p = f"{path}.speaking"
            pr = self.req(sp, "pronunciation", p, list) or []
            if len(pr) < 4:
                self.err(p, "pronunciation needs >= 4 sentences")
            for j, s in enumerate(pr):
                if not isinstance(s, dict) or not s.get("target_en") or not s.get("da"):
                    self.err(f"{p}.pronunciation[{j}]", "needs target_en and da")
            rp = self.req(sp, "roleplay", p, dict)
            if rp is not None:
                pp = f"{p}.roleplay"
                self.req(rp, "title_da", pp, str)
                turns = self.req(rp, "turns", pp, list) or []
                if len(turns) < 3:
                    self.err(pp, "roleplay needs >= 3 turns")
                for j, t in enumerate(turns):
                    q = f"{pp}.turns[{j}]"
                    if not isinstance(t, dict):
                        self.err(q, "turn must be an object")
                        continue
                    self.req(t, "bot_en", q, str)
                    self.req(t, "bot_da", q, str)
                    self.req(t, "sample_en", q, str)
                    kws = self.req(t, "expect_keywords", q, list) or []
                    if not kws:
                        self.err(q, "expect_keywords empty")
                    for k in kws:
                        if not isinstance(k, str) or k != k.lower():
                            self.err(q, f"keyword {k!r} must be lowercase")

        # writing
        w = self.req(L, "writing", path, dict)
        if w is not None:
            p = f"{path}.writing"
            self.req(w, "title_da", p, str)
            self.req(w, "prompt_da", p, str)
            self.req(w, "model_en", p, str)
            mw = self.req(w, "min_words", p, int)
            if mw is not None and not (8 <= mw <= 120):
                self.err(p, "min_words should be 8–120")
            h = self.req(w, "helper_en", p, list)
            kws = w.get("keywords", [])
            for k in kws:
                if not isinstance(k, str) or k != k.lower():
                    self.err(p, f"keyword {k!r} must be lowercase")

        self.scan_arabic(L, path)


def validate_file(fn, v):
    try:
        with open(fn, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:  # noqa
        v.err(fn, f"invalid JSON: {e}")
        return []
    if isinstance(data, dict):
        data = [data]
    if not isinstance(data, list):
        v.err(fn, "top level must be a JSON array of lessons")
        return []
    for i, L in enumerate(data):
        v.lesson(L, f"{fn}[{i}]")
    return data


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    v = V()
    ids = {}
    for fn in argv[1:]:
        for L in validate_file(fn, v):
            if isinstance(L, dict) and L.get("id"):
                if L["id"] in ids:
                    v.err(fn, f"duplicate lesson id {L['id']} (also in {ids[L['id']]})")
                ids[L["id"]] = fn
    for w in v.warnings:
        print("WARN", w)
    if v.errors:
        for e in v.errors:
            print("ERROR", e)
        print(f"\n{len(v.errors)} error(s).")
        return 1
    print(f"OK — {len(ids)} lesson(s) valid: {', '.join(sorted(ids))}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
