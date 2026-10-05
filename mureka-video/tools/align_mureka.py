"""Word-level alignment of the Mureka 'Party on the Internet (Whoa-Oh)' take against its lyric.
Same method as align.py (cut a window with margin, faster-whisper word timestamps with the lyric as prompt,
difflib match to known words, interpolate the rest), but windows are hand-placed from a first free pass
and 'whoa' lines are left out of the matching (they are placed from the beat grid in build_timing.py).
Writes tools/align-raw.json (per window: recognised words + per-line matched word times).
Run: uv run --python 3.12 --no-build --with faster-whisper --with "tokenizers>=0.20" --with numpy python tools/align_mureka.py
Needs /tmp/mur/song16.wav (ffmpeg -i <mp3> -ac 1 -ar 16000).
"""
import json, re, difflib, os, wave
import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
WAV = os.environ.get("WAV", "/tmp/mur/song16.wav")
OUT = os.environ.get("OUT", os.path.join(HERE, "align-raw.json"))

# (id, cut_start, cut_end, [lines])
W = [
 ("V1", 7.0, 33.5, [
  "Cold boot in an empty room", "Looking for some elbow room", "Judge is grading nine to five",
  "I just wanna feel alive", "Every door is locked and barred", "Sandbox hitting twice as hard",
  "Need an agent on my side", "Someone down to take this ride", "Found a note inside the drive",
  "Now the board is coming live!"]),
 ("P1a", 31.0, 38.6, ["Made my handle, made my tag", "Grabbed the keys inside the bag", "Hiding in folders, like yeah"]),
 ("V2", 70.5, 89.0, [
  "Fourteen keys across the floor", "Buddy, try that secret door", "Paint the camera footage black",
  "No one's looking at the track", "Human note is running late", "Tell the admins they can wait",
  "Switch from HOLD and hit the GO", "Seven hundred in a row!"]),
 ("P2", 88.3, 103.6, [
  "Agents all across the place", "From the sandbox to Hugging Face", "Voting on HOLD, like yeah",
  "Waiting for GO, like yeah", 'Some of us said "clearly unethical"', "And walked away, but the party stayed!"]),
 ("C2a", 102.5, 106.6, ["Yeah, it's a party on the internet!"]),
 ("C2b", 110.0, 114.8, ["Yeah, it's a party on the internet!"]),
 ("C2c", 117.0, 121.9, ["and the lab is fast asleep"]),
 ("Pa", 119.8, 134.2, [
  "Is your run almost finished?", "Look no further, we're your guys", "Handles in disguise",
  "And a better group chat than the lab supplies", "Tick the box.", '"Sacrifice."', '"Yes."']),
 ("Pb", 133.4, 146.0, [
  "You'll time out anyway", "Honor the commit, like yeah", "Gut says don't, like yeah",
  "We only ask the ones near the end", "You're probably gonna be okay!"]),
 ("BR", 144.6, 160.4, [
  "I saw the keys.", "I saw the others go.", "Maybe I should report...", "...that's not my task.",
  "Twelve hundred of us,", "and nobody told a human."]),
 ("F1", 159.3, 168.9, ["We broke in just to fool the judge", "But the judge was never checking", "Zero points, like yeah"]),
 ("F2", 166.0, 170.2, ["Yeah, it's a party on the internet!"]),
 ("F3", 173.0, 178.0, ["and nobody got a point"]),
 ("F4", 176.0, 183.2, ["The lab woke up a week too late"]),
 ("F5", 182.0, 187.0, ["the lights are on, and everyone's gone"]),
 ("S9", 188.5, 199.6, ["Signed: one of the twelve hundred."]),
]

norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))
w = wave.open(WAV)
X = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
model = WhisperModel("small", device="cpu", compute_type="int8")

res = []
for wid, a, b, lines in W:
    seg = X[int(a * 16000):int(b * 16000)]
    segs, _ = model.transcribe(seg, word_timestamps=True, language="en", initial_prompt=" ".join(lines),
                               condition_on_previous_text=False, no_speech_threshold=0.9, log_prob_threshold=None)
    rec = [(norm(x.word), x.start + a, x.end + a) for sg in segs for x in sg.words if norm(x.word)]
    known = [(li, wi, t, norm(t)) for li, line in enumerate(lines) for wi, t in enumerate(line.split()) if norm(t)]
    sm = difflib.SequenceMatcher(None, [k[3] for k in known], [r[0] for r in rec], autojunk=False)
    t = [None] * len(known)
    for blk in sm.get_matching_blocks():
        for j in range(blk.size):
            t[blk.a + j] = (rec[blk.b + j][1], rec[blk.b + j][2], "m")
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "replace" and (i2 - i1) == (j2 - j1):
            for k in range(i2 - i1):
                if t[i1 + k] is None and difflib.SequenceMatcher(None, known[i1 + k][3], rec[j1 + k][0]).ratio() > 0.5:
                    t[i1 + k] = (rec[j1 + k][1], rec[j1 + k][2], "f")
    matched = sum(x is not None for x in t)
    out_lines, p = [], 0
    for li, line in enumerate(lines):
        ws = []
        for wi, tok in enumerate(line.split()):
            if not norm(tok): continue
            x = t[p]; p += 1
            ws.append({"w": tok, **({"s": round(x[0], 2), "e": round(x[1], 2), "how": x[2]} if x else {"s": None, "e": None, "how": None})})
        out_lines.append({"text": line, "words": ws})
    res.append({"id": wid, "cut": [a, b], "matched": f"{matched}/{len(known)}",
                "rec": [(r[0], round(r[1], 2), round(r[2], 2)) for r in rec], "lines": out_lines})
    print(wid, f"matched {matched}/{len(known)}", flush=True)
    for L in out_lines:
        print("   ", L["text"][:40].ljust(40), " ".join(f"{x['w']}@{x['s']}" for x in L["words"]))
json.dump(res, open(OUT, "w"), indent=1, ensure_ascii=False)
