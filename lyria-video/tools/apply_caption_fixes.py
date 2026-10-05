"""Apply the STT-audit caption fixes (see CAPTION-FIXES.md) to shared/timing.json and timing-full.json.
Replaces text + words of the listed lines in the flat `lines`, in the matching `sections[].lines` entry and,
where the old line sits in the built window, in `fragment.lines`. Backs up to *.orig.json first (never overwrites a backup).
Idempotent: a line already carrying the new text is skipped.
Run: python3 tools/apply_caption_fixes.py
"""
import json, os, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
TIMING = os.path.join(ROOT, "shared/timing.json")
FULL = os.path.join(ROOT, "timing-full.json")

def L(text, words, approx_idx=()):
    out = []
    for i, (w, s, e) in enumerate(words):
        d = {"w": w, "s": s, "e": e}
        if i in approx_idx: d["approx"] = True
        out.append(d)
    return {"text": text, "words": out}

# key = (old text, old first-word start) -> new line
FIXES = {
    ("For another agent listening", 29.28): L("For another little note", [
        ("For", 29.28, 29.7), ("another", 29.7, 29.98), ("little", 29.98, 30.24), ("note", 30.24, 30.42)]),
    ("That's when a little note showed up inside a folder name", 30.4): L("showed up inside a folder name", [
        ("showed", 30.42, 30.56), ("up", 30.56, 30.72), ("inside", 30.72, 30.9), ("a", 30.9, 31.04),
        ("folder", 31.04, 31.34), ("name", 31.34, 31.7)]),
    ("Yeah, it's a party on the internet!", 58.3): L("It's the internet!", [
        ("It's", 59.05, 59.55), ("the", 59.55, 59.72), ("internet!", 59.72, 60.7)], approx_idx=(1,)),
    ("Yeah, it's a party on the internet!", 66.88): L("It's the internet!", [
        ("It's", 67.1, 67.56), ("the", 67.56, 67.7), ("internet!", 67.7, 68.8)], approx_idx=(1,)),
    ("Yeah, it's a party on the internet!", 121.4): L("It's the internet!", [
        ("It's", 120.85, 121.4), ("the", 121.4, 121.56), ("internet!", 121.56, 122.4)], approx_idx=(1,)),
    ("Yeah, it's a party on the internet!", 129.3): L("It's the internet!", [
        ("It's", 128.85, 129.4), ("the", 129.4, 129.55), ("internet!", 129.55, 130.6)], approx_idx=(1,)),
}

def key(line): return (line["text"].strip(), round(line["words"][0]["s"], 2))

def patch_list(lines, label):
    n = 0
    for i, l in enumerate(lines):
        new = FIXES.get(key(l))
        if new is None: continue
        keep = {k: v for k, v in l.items() if k not in ("text", "words")}
        lines[i] = {**keep, "text": new["text"], "words": [dict(w) for w in new["words"]]}
        n += 1
    print(f"  {label}: {n} lines changed")

def process(path, flat=True):
    bak = path.replace(".json", ".orig.json")
    if not os.path.exists(bak):
        shutil.copy2(path, bak); print("backup ->", bak)
    d = json.load(open(path, encoding="utf8"))
    print(path)
    if flat and "lines" in d: patch_list(d["lines"], "lines")
    for s in d["sections"]: patch_list(s["lines"], "section " + s["id"])
    if flat and "fragment" in d: patch_list(d["fragment"]["lines"], "fragment")
    with open(path, "w", encoding="utf8") as f:
        json.dump(d, f, indent=1, ensure_ascii=False)

process(TIMING)
process(FULL, flat=False)

# validation
t = json.load(open(TIMING, encoding="utf8"))
flat = t["lines"]
assert len(flat) == 73, len(flat)
sec = [l for s in t["sections"] for l in s["lines"]]
assert sec == flat, "sections differ from flat lines"
last = -1
for i, l in enumerate(flat):
    ws = l["words"]
    assert ws and l["text"].split() == [w["w"] for w in ws], (i, l["text"])
    assert all(a["e"] >= a["s"] and b["s"] >= a["e"] - 1e-9 for a, b in zip(ws, ws[1:])), ("non-monotonic words", i)
    assert all(w["e"] >= w["s"] for w in ws), i
    assert ws[0]["s"] >= last - 1.0, ("line order", i)  # existing data overlaps neighbours slightly
    last = ws[0]["s"]
assert all(flat[i]["words"][0]["s"] <= flat[i + 1]["words"][0]["s"] for i in range(72)), "lines not ordered by start"
fr = t["fragment"]
for l in fr["lines"]:
    assert fr["t0"] <= l["words"][0]["s"] and l["words"][-1]["e"] <= fr["t1"], l["text"]
f = json.load(open(FULL, encoding="utf8"))
assert [l for s in f["sections"] for l in s["lines"]] == flat, "timing-full lines differ from timing.json"
print("validation ok")
