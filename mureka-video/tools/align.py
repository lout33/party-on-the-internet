"""Word-level alignment of poti-v4-take-01 against its known lyric.
Per section: cut the mp3 with a margin, run faster-whisper (word timestamps, lyric as prompt),
match recognised words to known words with difflib, interpolate the unmatched ones.
Run: uv run --python 3.12 --no-build --with faster-whisper --with "tokenizers>=0.20" --with numpy python tools/align.py
"""
import json, re, subprocess, difflib, sys, os
import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
SONG = os.path.abspath(os.path.join(HERE, "../../../002-music/lyria-v4-demo/poti-v4-take-01.mp3"))
LYR = os.path.abspath(os.path.join(HERE, "../../../002-music/lyria-v4-demo/poti-v4-take-01.lyrics.txt"))
OUT = os.path.abspath(os.path.join(HERE, "../timing-full.json"))

def dur():
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",SONG],capture_output=True,text=True).stdout)
TOTAL = dur()

# parse lyrics: sections with nominal start, lines
sections, cur = [], None
for raw in open(LYR, encoding="utf8"):
    raw = raw.rstrip("\n")
    m = re.match(r"\[\[(\w+)\]\]", raw)
    if m:
        cur = {"id": m.group(1), "start": None, "lines": []}; sections.append(cur); continue
    if not raw.strip() or cur is None: continue
    m = re.match(r"\[([\d.]*):\]\s?(.*)", raw)
    if m:
        if m.group(1) and cur["start"] is None: cur["start"] = float(m.group(1))
        if m.group(2).strip(): cur["lines"].append(m.group(2).strip())
sections = [s for s in sections if s["lines"]]
for i, s in enumerate(sections):
    s["end"] = sections[i+1]["start"] if i+1 < len(sections) else TOTAL
print([(s["id"], s["start"], s["end"], len(s["lines"])) for s in sections])

norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’","'"))
model = WhisperModel("small", device="cpu", compute_type="int8")

def load(a, b):
    raw = subprocess.run(["ffmpeg","-v","error","-ss",str(a),"-t",str(b-a),"-i",SONG,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

result = {"song": "poti-v4-take-01.mp3", "duration": TOTAL, "sections": []}
for s in sections:
    a, b = max(0, s["start"] - 1.5), min(TOTAL, s["end"] + 1.5)
    prompt = " ".join(s["lines"])
    segs, _ = model.transcribe(load(a, b), word_timestamps=True, language="en", initial_prompt=prompt, condition_on_previous_text=False)
    rec = [(norm(w.word), w.start + a, w.end + a) for sg in segs for w in sg.words if norm(w.word)]
    known = []  # (line_idx, word_idx, text, norm)
    for li, line in enumerate(s["lines"]):
        for wi, w in enumerate(line.split()):
            if norm(w): known.append((li, wi, w, norm(w)))
    sm = difflib.SequenceMatcher(None, [k[3] for k in known], [r[0] for r in rec], autojunk=False)
    t = [None] * len(known)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            t[blk.a + j] = (rec[blk.b + j][1], rec[blk.b + j][2])
    matched = sum(x is not None for x in t)
    # fuzzy rescue for neighbours that differ slightly (e.g. 'dinner' for 'party')
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                if difflib.SequenceMatcher(None, known[i1+k][3], rec[j1+k][0]).ratio() > 0.5 and t[i1+k] is None:
                    t[i1+k] = (rec[j1+k][1], rec[j1+k][2])
    # interpolate the rest between neighbours
    n = len(t)
    for i in range(n):
        if t[i] is not None: continue
        l = next((k for k in range(i-1, -1, -1) if t[k] is not None), None)
        r = next((k for k in range(i+1, n) if t[k] is not None), None)
        lo = t[l][1] if l is not None else s["start"]
        hi = t[r][0] if r is not None else s["end"]
        gap = [k for k in range(n) if (l is None or k > l) and (r is None or k < r) and t[k] is None]
        idx = gap.index(i); step = (hi - lo) / (len(gap) + 1)
        t[i] = (lo + step * idx, lo + step * (idx + 1), "interp")
    lines, p = [], 0
    for li, line in enumerate(s["lines"]):
        ws = []
        for wi, w in enumerate(line.split()):
            if not norm(w): continue
            x = t[p]; p += 1
            ws.append({"w": w, "s": round(x[0], 2), "e": round(x[1], 2), **({"approx": True} if len(x) == 3 else {})})
        lines.append({"text": line, "words": ws})
    result["sections"].append({"id": s["id"], "start": s["start"], "end": s["end"], "matched": f"{matched}/{len(known)}", "lines": lines})
    print(s["id"], f"matched {matched}/{len(known)}")
json.dump(result, open(OUT, "w"), indent=1, ensure_ascii=False)
print("wrote", OUT)
