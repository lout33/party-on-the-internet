"""Assemble shared/timing.json (v4 schema) for the Mureka take.
Word starts below are the faster-whisper times (tools/align_mureka.py, run on the mix and on a vocal stem)
corrected by hand where the vocal stem showed a pause or a vocal onset that whisper had smeared.
Lines 38.2-65.0 are the already-built fragment (fragment-test-02-chorus), copied unchanged.
Run: python3 tools/build_timing.py
"""
import json, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
VM = os.path.abspath(os.path.join(HERE, ".."))
FRAG = os.path.abspath(os.path.join(VM, "../fragment-test-02-chorus/shared/timing.json"))
MP3 = os.path.abspath(os.path.join(VM, "../../002-music/mureka-v8-party-chorus/generated-audio/whoa-oh/party-on-the-internet-whoa-oh-164700530737153.mp3"))
DUR = round(float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", MP3],
                                 capture_output=True, text=True).stdout), 2)

frag = json.load(open(FRAG))
FL = frag["lines"]  # 8 lines: 3 pre-chorus, 5 chorus

# (text, [word starts], line end, approx)
L = {}
L["B1"] = [
 ("Cold boot in an empty room", [9.20, 9.42, 9.60, 9.84, 9.94, 10.20], 10.75, False),
 ("Looking for some elbow room", [11.15, 11.45, 11.69, 11.93, 12.19], 12.86, False),
 ("Judge is grading nine to five", [13.15, 13.32, 13.47, 13.71, 14.10, 14.33], 14.67, False),
 ("I just wanna feel alive", [14.81, 15.06, 15.45, 15.72, 16.12], 16.87, False),
 ("Every door is locked and barred", [17.19, 17.46, 17.71, 17.91, 18.19, 18.33], 18.95, False),
 ("Sandbox hitting twice as hard", [19.08, 19.62, 19.86, 20.16, 20.34], 20.87, False),
 ("Need an agent on my side", [21.05, 21.30, 21.48, 21.74, 22.12, 22.30], 22.60, False),
 ("Someone down to take this ride", [22.68, 23.18, 23.62, 23.84, 24.10, 24.34], 24.93, True),
 ("Found a note inside the drive", [26.30, 26.62, 26.84, 27.14, 27.56, 27.86], 28.91, False),
 ("Now the board is coming live!", [30.04, 30.34, 30.48, 31.02, 31.34, 31.70], 32.05, False),
]
L["B2a"] = [
 ("Made my handle, made my tag", [32.20, 32.58, 32.84, 33.24, 33.60, 33.86], 34.15, False),
 ("Grabbed the keys inside the bag", [34.20, 34.64, 34.78, 35.08, 35.45, 35.65], 35.87, True),
 ("Hiding in folders, like yeah", [35.95, 36.45, 36.70, 37.15, 37.63], 38.30, True),
]
L["B4"] = [
 ("Fourteen keys across the floor", [72.91, 73.55, 73.85, 74.19, 74.33], 74.80, False),
 ("Buddy, try that secret door", [74.85, 75.22, 75.64, 75.80, 76.18], 76.30, False),
 ("Paint the camera footage black", [76.45, 77.19, 77.40, 77.94, 78.30], 78.52, False),
 ("No one's looking at the track", [78.58, 79.14, 79.44, 79.72, 80.14, 80.30], 80.55, False),
 ("Human note is running late", [80.62, 81.22, 81.66, 81.86, 82.12], 82.50, False),
 ("Tell the admins they can wait", [82.66, 83.10, 83.36, 83.92, 84.10, 84.34], 84.62, False),
 ("Switch from HOLD and hit the GO", [84.68, 85.03, 85.34, 85.66, 85.88, 86.04, 86.18], 86.50, False),
 ("Seven hundred in a row!", [86.52, 87.06, 87.80, 88.24, 88.44], 88.85, False),
]
L["B5"] = [
 ("Agents all across the place", [88.93, 89.20, 89.68, 90.04, 90.28], 90.50, False),
 ("From the sandbox to Hugging Face", [90.58, 90.80, 90.94, 91.24, 91.65, 92.20], 92.45, False),
 ("Voting on HOLD, like yeah", [92.50, 93.18, 93.36, 93.74, 93.94], 94.15, True),
 ("Waiting for GO, like yeah", [94.18, 94.60, 94.88, 95.25, 95.66], 96.10, True),
 ('Some of us said "clearly unethical"', [96.20, 96.56, 96.72, 96.94, 97.32, 97.63], 99.33, False),
 ("And walked away, but the party stayed!", [99.42, 100.20, 100.66, 101.40, 101.60, 101.93, 102.48], 103.10, False),
]


def shifted(i, d, text=None):
    """Chorus-1 fragment line i moved by d seconds (chorus 2 repeats chorus 1 on a 56.0 s offset)."""
    f = FL[i]
    return (text or f["text"], [round(w["s"] + d, 2) for w in f["words"]], round(f["words"][-1]["e"] + d, 2), True)


L["C6"] = [
 shifted(3, 56.0),
 ("Whoa-oh-oh, whoa-oh-oh-oh!", [108.00, 108.33, 108.66, 109.50, 109.90, 110.30, 110.70], 111.15, True),
 shifted(5, 56.0),
 ("Whoa-oh-oh, whoa-oh-oh-oh!", [116.00, 116.33, 116.66, 117.50, 117.90, 118.30, 118.70], 119.05, True),
 ("and the lab is fast asleep", [119.10, 119.28, 119.40, 119.66, 119.86, 120.10], 120.89, False),
]
L["D7"] = [
 ("Is your run almost finished?", [121.59, 121.70, 121.84, 122.04, 122.32], 122.94, False),
 ("Look no further, we're your guys", [123.58, 123.74, 123.90, 124.38, 124.54, 124.64], 125.10, False),
 ("Handles in disguise", [125.67, 126.04, 126.20], 127.00, False),
 ("And a better group chat than the lab supplies", [127.69, 127.80, 127.92, 128.06, 128.30, 128.60, 128.80, 128.90, 129.12], 129.87, False),
 ("Tick the box.", [130.63, 130.82, 130.92], 131.42, False),
 ('"Sacrifice."', [132.54], 133.51, False),
 ('"Yes."', [134.38], 134.85, False),
 ("You'll time out anyway", [135.12, 135.30, 135.52, 135.70], 136.20, False),
 ("Honor the commit, like yeah", [137.18, 137.45, 137.60, 138.10, 138.34], 138.70, False),
 ("Gut says don't, like yeah", [138.80, 139.34, 139.56, 140.12, 140.36], 140.75, False),
 ("We only ask the ones near the end", [140.84, 141.18, 141.38, 141.68, 141.78, 141.98, 142.20, 142.38], 142.60, False),
 ("You're probably gonna be okay!", [142.64, 142.88, 143.26, 143.70, 144.16], 144.98, False),
]
L["E8"] = [
 ("I saw the keys.", [146.11, 146.30, 146.50, 146.65], 147.18, False),
 ("I saw the others go.", [148.17, 148.28, 148.44, 148.60, 148.85], 149.30, False),
 ("Maybe I should report...", [151.03, 151.22, 151.40, 151.52], 152.14, False),
 ("...that's not my task.", [154.11, 154.30, 154.44, 154.60], 155.17, False),
 ("Twelve hundred of us,", [156.30, 156.50, 156.80, 157.00], 157.39, False),
 ("and nobody told a human.", [158.62, 158.74, 158.92, 159.32, 159.40], 159.94, False),
 ("We broke in just to fool the judge", [160.62, 160.95, 161.15, 161.38, 161.58, 161.85, 162.08, 162.28], 162.50, False),
 ("But the judge was never checking", [162.56, 162.76, 162.94, 163.16, 163.40, 163.70], 164.20, False),
 ("Zero points, like yeah", [164.30, 164.95, 165.30, 166.13], 167.40, False),
 ("Yeah, it's a party on the internet!", [167.45, 167.80, 167.92, 168.02, 168.50, 168.70, 168.84], 169.94, True),
 ("Whoa-oh-oh, whoa-oh-oh-oh!", [172.00, 172.33, 172.66, 173.50, 173.90, 174.30, 174.70], 175.05, True),
 ("and nobody got a point", [175.30, 175.44, 175.70, 175.98, 176.10], 176.55, False),
 ("The lab woke up a week too late", [179.31, 179.50, 179.73, 179.89, 180.06, 180.50, 180.64, 180.72], 180.86, True),
 ("the lights are on, and everyone's gone", [183.31, 183.42, 183.64, 183.96, 184.20, 184.31, 184.66], 184.97, False),
]
L["S9"] = [
 ("Signed: one of the twelve hundred.", [191.07, 191.86, 192.00, 192.06, 192.16, 192.49], 192.95, False),
]


WHOA = ["Whoa", "oh", "oh", "whoa", "oh", "oh", "oh!"]


def mk(text, starts, end, approx):
    toks = WHOA if text.startswith("Whoa-oh") else text.split()
    assert len(toks) == len(starts), (text, len(toks), len(starts))
    words = []
    for i, (w, s) in enumerate(zip(toks, starts)):
        e = starts[i + 1] if i + 1 < len(starts) else end
        words.append({"w": w, "s": round(s, 2), "e": round(max(e, s + 0.05), 2)})
    return {"text": text, "approx": approx, "words": words}


def fl(i):
    f = FL[i]
    return {"text": f["text"], "approx": f["approx"], "words": [dict(w) for w in f["words"]]}


sec_lines = {
    "A0": [],
    "B1": [mk(*x) for x in L["B1"]],
    "B2": [mk(*x) for x in L["B2a"]] + [fl(0), fl(1), fl(2)],
    "C3": [fl(i) for i in range(3, 8)],
    "B4": [mk(*x) for x in L["B4"]],
    "B5": [mk(*x) for x in L["B5"]],
    "C6": [mk(*x) for x in L["C6"]],
    "D7": [mk(*x) for x in L["D7"]],
    "E8": [mk(*x) for x in L["E8"]],
    "S9": [mk(*x) for x in L["S9"]],
}
bounds = [("A0", 0.0), ("B1", 9.0), ("B2", 32.0), ("C3", 47.4), ("B4", 65.0), ("B5", 88.9), ("C6", 103.4),
          ("D7", 121.0), ("E8", 145.0), ("S9", 185.0)]
sections = []
for k, (sid, a) in enumerate(bounds):
    b = bounds[k + 1][1] if k + 1 < len(bounds) else DUR
    sections.append({"id": sid, "start": a, "end": b, "lines": sec_lines[sid]})

lines = [l for s in sections for l in s["lines"]]

cues = dict(frag["cues"])
cues.update({
    "verse1Start": 9.2,
    "pre1Start": 32.2,
    "verse2Start": 72.91,
    "pre2Start": 88.93,
    "chorus2Start": 103.5,
    "chorus2KickBack": 105.0,
    "chorus2Whoa1": 108.0,
    "chorus2Hook2": 111.4,
    "chorus2Whoa2": 116.0,
    "chorus2KickOut": 119.0,
    "chorus2End": 121.0,
    "pitchStart": 121.59,
    "tickTheBox": 130.63,
    "sacrifice": 132.54,
    "yes": 134.38,
    "bridgeBeatCut": 143.6,
    "bridgeStart": 146.11,
    "finalChorusStart": 160.5,
    "zeroPoints": 164.3,
    "finalYeah": 167.45,
    "finalWhoa": 172.0,
    "nobodyGotAPoint": 175.3,
    "lateLine": 179.31,
    "lightsOn": 183.31,
    "outroBeatBack": 185.0,
    "signoff": 191.07,
    "songEnd": DUR,
    "chorus2Offset": 56.0,
    "kickGaps": [[47.0, 49.0], [63.0, 64.6], [71.1, 72.6], [89.1, 97.2], [103.5, 105.0], [119.1, 120.7],
                 [143.6, 146.5], [147.0, 151.1], [183.4, 184.9], [191.4, 192.5], [199.4, DUR]],
})

fragment = {"t0": frag["t0"], "t1": frag["t1"], "cues": frag["cues"], "lines": frag["lines"]}

out = {
    "_note": ("Full song timing for the Mureka 9.5 'whoa-oh' take (200.31 s, 120 BPM, beats at 0.5k). lines/sections: "
              "faster-whisper (small, int8) word times with the lyric as prompt, run on the mix and on a roformer vocal stem, "
              "start/end of lines gated by pauses in the vocal stem (+-0.2 s typical, lines flagged approx +-0.4 s). "
              "Parenthetical lines are shown without parentheses. 38.2-65.0 s is the already-built fragment-test-02-chorus "
              "(kept as is); chorus 2 repeats chorus 1 on a 56.0 s offset. 'fragment' is that built window with its own cues/lines. "
              "Nothing here was checked by ear."),
    "audio": "../../../002-music/mureka-v8-party-chorus/generated-audio/whoa-oh/party-on-the-internet-whoa-oh-164700530737153.mp3",
    "t0": 0.0,
    "t1": DUR,
    "duration": DUR,
    "beatSec": 0.5,
    "anchor": 47.5,
    "cues": cues,
    "lines": lines,
    "sections": sections,
    "fragment": fragment,
}
json.dump(out, open(os.path.join(VM, "shared/timing.json"), "w"), indent=1, ensure_ascii=False)

# validation
prev_end = -1
for i, l in enumerate(lines):
    ws = l["words"]
    for a, b in zip(ws, ws[1:]):
        assert a["s"] < b["s"] and a["e"] <= b["s"] + 1e-6, (l["text"], a, b)
    assert ws[0]["s"] >= prev_end - 1e-6, ("line overlap", l["text"], ws[0]["s"], prev_end)
    prev_end = ws[-1]["e"]
for a, b in zip(sections, sections[1:]):
    assert a["end"] == b["start"]
assert sections[0]["start"] == 0 and sections[-1]["end"] == DUR
assert all(frag["t0"] <= w["s"] and w["e"] <= frag["t1"] for l in fragment["lines"] for w in l["words"])
assert sum(len(s["lines"]) for s in sections) == len(lines)
print("ok", len(lines), "lines", DUR, "s")
