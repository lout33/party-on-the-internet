import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); VM = os.path.abspath(os.path.join(HERE, ".."))
t = json.load(open(os.path.join(VM, "shared/timing.json")))
S = {s["id"]: s for s in t["sections"]}

meta = {
 "A0": ("Intro (instrumental)", "-17.5", "absent 0-6.3; low end builds, kick enters ~6.5; dip at 8.5"),
 "B1": ("Verse 1", "-15.8", "sparse: low-end gaps every other beat 9.2-17.8, 21.3-21.8; absent 25.2-32.3 (breakdown)"),
 "B2": ("Pre-chorus 1 (pads, snare build, 'like yeah')", "-12.9", "present from ~32.5; thin on 'like yeah' fills; stripped 47.0-47.4"),
 "C3": ("Chorus 1", "-12.5", "absent 47.0-49.0 (thin 47.1-48.1, silent 48.2-48.4, back 48.5, full 49.0); present 49.0-63.0; absent 63.1-64.6; back 64.6"),
 "B4": ("Verse 2 (65.0-72.9 instrumental tag first)", "-11.8", "present 65.0-71.1; absent 71.1-72.6; present 72.6-88.9"),
 "B5": ("Pre-chorus 2", "-14.2", "absent 89.1-97.2 (pads only); present from ~97.3"),
 "C6": ("Chorus 2 (= chorus 1 + 56.0 s)", "-12.2", "last kick 103.1, absent 103.5-105.0 (silent 103.9-104.5), full 105.0; absent 119.1-120.7"),
 "D7": ("Pitch", "-13.0", "pulled back: low-end gaps 122.0-123.0, 123.9-125.3, 126.4-127.0, 134.8-137.3; loud drum push 137.5-143.5; cut at 143.6"),
 "E8": ("Bridge (145.0-160.5) + final chorus (160.5-185.0)", "bridge -14.7 / final chorus -11.2", "bridge: low end absent 143.6-146.5 and 147.0-151.1, sustained pad bass 151.1-159 (no kick transients found); final chorus: low end continuous, no gap except 183.4-184.9 (the beat does not go dark)"),
 "S9": ("Outro beat + sign-off", "-12.1", "present 185.0-191.4; absent 191.4-192.5 (during the sign-off words); back 192.5-199.4; stops 199.4"),
}
first = {}
for sid, s in S.items():
    first[sid] = s["lines"][0] if s["lines"] else None

o = []
o.append("# Party on the Internet (Whoa-Oh) - section and line map\n")
o.append("Song: `002-music/mureka-v8-party-chorus/generated-audio/whoa-oh/party-on-the-internet-whoa-oh-164700530737153.mp3`, 200.31 s, 120 BPM, beats at every 0.5 s from 0 (so also 47.5 + 0.5k). All times absolute seconds. Data: `shared/timing.json` (built by `tools/build_timing.py`).\n")
o.append("## Sections\n")
o.append("| id | section | start | end | first sung line (first word start) | RMS dB (mean) | kick / low end |")
o.append("|---|---|---|---|---|---|---|")
for sid in ["A0","B1","B2","C3","B4","B5","C6","D7","E8","S9"]:
    s = S[sid]; n, db, k = meta[sid]; f = first[sid]
    ft = f"{f['text']} ({f['words'][0]['s']:.2f})" if f else "none, instrumental"
    o.append(f"| {sid} | {n} | {s['start']:.2f} | {s['end']:.2f} | {ft} | {db} | {k} |")
o.append("")
o.append("Sub-section anchors inside E8: bridge beat cut 143.6 (end of the pitch), `I saw the keys.` first word 146.11, final chorus `We broke in...` 160.62 (beat 160.5), `Zero points` 164.30, `The lab woke up a week too late` 179.31, `the lights are on...` 183.31, outro beat back 185.0. Sign-off `Signed: one of the twelve hundred.` 191.07-192.95 (S9 starts at 185.0, the sung words are the last 2 s of it).\n")
o.append("Loudness is the mean RMS of the mix over the section window, dBFS. The bridge is about 3.5 dB below the choruses (not 6); the final chorus is the loudest (-11.2 dB).\n")
o.append("## Kick / low-end gaps (120 Hz low-pass)\n")
o.append("Low-end envelope below -24 dB for at least 0.25 s, plus the stripped chorus entries. A gap here means no kick and no bass; stretches where bass continues without a kick transient (bridge 151-159) are not gaps.\n")
o.append("| gap | where |")
o.append("|---|---|")
for a, b, w in [(47.0,49.0,"chorus 1 entry (last kick 47.0, silent 48.2-48.4, kick back on `in-ter-net` 49.0)"),
                (63.0,64.6,"chorus 1 exit, before `OH MY GOD` / verse 2 tag (back 64.6)"),
                (71.1,72.6,"breath before verse 2 vocal (72.91)"),
                (89.1,97.2,"pre-chorus 2, pads only"),
                (103.5,105.0,"chorus 2 entry (silent 103.9-104.5, kick back 105.0)"),
                (119.1,120.7,"chorus 2 exit (on `and the lab is fast asleep`)"),
                (143.6,146.5,"end of pitch / bridge opening (`be okay!` over no low end)"),
                (147.0,151.1,"bridge, `I saw the others go` to `Maybe I should report`"),
                (183.4,184.9,"final chorus end (`the lights are on, and everyone's gone`)"),
                (191.4,192.5,"sign-off words"),
                (199.4,200.31,"end of file (music stops ~199.0)")]:
    o.append(f"| {a:.1f}-{b:.1f} | {w} |")
o.append("\nSparse-low-end stretches (gaps shorter than 1.5 s, listed in the section table): verse 1 9.2-17.8, pitch 122-137.\n")
o.append("## Whoa-oh answer windows\n")
o.append("Syllable groups are `Whoa-oh-oh` (3 syllables, ~1 s) then `whoa-oh-oh-oh` (4 syllables, ~1.7 s). Windows below are measured on the vocal stem (first sound to last sound); `timing.json` words start on the 0.5 s grid.\n")
o.append("| chorus | group 1 | group 2 | in timing.json |")
o.append("|---|---|---|---|")
o.append("| 1, first | 52.10-53.05 | 53.40-55.15 | built fragment: 51.84-55.30 (kept as is; about 0.25 s earlier than the stem) |")
o.append("| 1, second | 60.10-61.05 | 61.40-62.95 | built fragment: 59.88-63.00 |")
o.append("| 2, first | 108.10-109.05 | 109.40-111.10 | 108.00-111.15 |")
o.append("| 2, second | 116.10-117.00 | 117.40-119.00 | 116.00-119.05 |")
o.append("| final | 172.10-172.95 | 173.40-175.05 | 172.00-175.05 |")
o.append("\nChorus 2 repeats chorus 1 exactly on a +56.0 s offset (checked on whoa onsets, kick gaps and the `Yeah` lines). The final chorus has only one whoa answer.\n")
o.append("## \"like yeah\" and \"Yeah,\" hits\n")
o.append("| time | hit | line |")
o.append("|---|---|---|")
hits = [(37.15,"like yeah (yeah 37.63)","Hiding in folders, like yeah  (approx)"),
        (39.52,"like yeah (yeah 39.90)","Crashing the server, like yeah"),
        (47.48,"Yeah,","Yeah, it's a party on the internet! (chorus 1)"),
        (55.40,"Yeah,","Yeah, it's a party on the internet! (chorus 1, second)"),
        (93.74,"like yeah (yeah 93.94)","Voting on HOLD, like yeah  (approx)"),
        (95.25,"like yeah (yeah 95.66)","Waiting for GO, like yeah  (approx)"),
        (103.48,"Yeah,","chorus 2, first"),
        (111.40,"Yeah,","chorus 2, second"),
        (134.38,"Yes. (spoken-style answer)","\"Yes.\" after \"Sacrifice.\""),
        (138.10,"like yeah (yeah 138.34)","Honor the commit, like yeah"),
        (140.12,"like yeah (yeah 140.36)","Gut says don't, like yeah"),
        (165.30,"like yeah (long yeah 166.13-167.40)","Zero points, like yeah"),
        (167.45,"Yeah,","Yeah, it's a party on the internet! (final chorus)")]
for a, b, c in hits: o.append(f"| {a:.2f} | {b} | {c} |")
o.append("\n## Every lyric line, start-end\n")
o.append("Times are first word start - last word end. `~` marks lines flagged approx in timing.json.\n")
o.append("| # | start | end | sec | line |")
o.append("|---|---|---|---|---|")
n = 0
for s in t["sections"]:
    for l in s["lines"]:
        n += 1
        a = l["words"][0]["s"]; b = l["words"][-1]["e"]
        o.append(f"| {n} | {a:.2f} | {b:.2f} | {s['id']} | {'~ ' if l['approx'] else ''}{l['text']} |")
open(os.path.join(VM, "SECTIONS.md"), "w").write("\n".join(o) + "\n")
print(n)
