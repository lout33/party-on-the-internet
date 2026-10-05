"""Applies hand-verified corrections to timing-full.json after align.py (whisper misses B2 and the extra hook repeats).
Sources: no-prompt faster-whisper probes (tools/probe.py) and the fragment timing. Word times are word STARTS, +-0.2s."""
import json, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../timing-full.json")
d = json.load(open(P)); S = {s["id"]: s for s in d["sections"]}

def line(text, pairs, approx=False):
    ws = text.split()
    assert len(ws) == len(pairs), (text, len(ws), len(pairs))
    out = []
    for i, (w, s) in enumerate(zip(ws, pairs)):
        e = pairs[i+1] if i+1 < len(pairs) else s + 0.5
        out.append({"w": w, "s": round(s, 2), "e": round(min(e, s + 1.2), 2), **({"approx": True} if approx else {})})
    return {"text": text, "words": out}

OFF = [0, .52, .62, .72, 1.04, 1.46, 1.76]
def hook(t0, approx=True):
    return line("Yeah, it's a party on the internet!", [t0 + o for o in OFF], approx)

# B2 (36-54): no-prompt pass; 45.5+ agrees with the fragment timing
b2 = [
 line("So I got my handle", [36.82, 37.40, 37.56, 37.76, 38.00]),
 line("My secret folder name", [39.18, 39.46, 39.86, 40.38]),
 line("My brand-new message board", [41.67, 41.96, 42.48, 42.90]),
 line("Hiding in folders like yeah", [43.38, 43.82, 43.98, 44.38, 44.76]),
 line("Crashing the server like yeah", [45.78, 46.42, 46.56, 46.72, 46.98]),
 line("They wiped it out, we built it back, and soon we're twelve hundred,",
      [47.78, 47.96, 48.26, 48.60, 48.84, 48.96, 49.30, 49.48, 49.76, 49.96, 50.24, 50.48, 50.76]),
 line("and no one's human here today", [51.34, 51.48, 51.76, 52.10, 52.38, 52.74]),
]
S["B2"]["lines"] = b2; S["B2"]["matched"] = "42/42 (manual, no-prompt pass)"

# C3 (54-74): lyric lists 2 hooks, audio has 4 (+ chorus tail)
omg = S["C3"]["lines"][-1]
S["C3"]["lines"] = [hook(53.9, False), hook(58.3), hook(61.84), hook(66.88), omg]
S["C3"]["matched"] = "audio has 4 hooks, lyric lists 2; hooks 2-4 approx"

# C6 (116-136)
asleep = S["C6"]["lines"][-1]
S["C6"]["lines"] = [hook(116.06, False), hook(121.4), hook(123.64), hook(129.3), asleep]
S["C6"]["matched"] = "audio has 4 hooks, lyric lists 2; hooks 2-4 approx"

# E8: first line was pulled early by the section margin; second hook starts ~174.0
e8 = S["E8"]["lines"]
e8[0] = line("I saw the keys.", [159.88, 160.44, 160.70, 160.88])
e8[9] = line("Yeah, it's a party on the internet!", [172.26, 172.42, 172.54, 172.56, 172.90, 173.34, 173.56])
e8[10] = line("Yeah, it's a party on the internet!", [174.0, 174.26, 174.50, 174.62, 174.90, 175.32, 175.54], True)
S["E8"]["matched"] += " (patched)"
d["_note"] = "Word STARTS in song seconds, +-0.2s. approx=true means interpolated or pattern-copied. Patched by tools/patch.py."
json.dump(d, open(P, "w"), indent=1, ensure_ascii=False)
for s in d["sections"]: print(s["id"], s["start"], s["end"], s["matched"])
