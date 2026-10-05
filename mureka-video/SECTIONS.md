# Party on the Internet (Whoa-Oh) - section and line map

Song: `002-music/mureka-v8-party-chorus/generated-audio/whoa-oh/party-on-the-internet-whoa-oh-164700530737153.mp3`, 200.31 s, 120 BPM, beats at every 0.5 s from 0 (so also 47.5 + 0.5k). All times absolute seconds. Data: `shared/timing.json` (built by `tools/build_timing.py`).

## Sections

| id | section | start | end | first sung line (first word start) | RMS dB (mean) | kick / low end |
|---|---|---|---|---|---|---|
| A0 | Intro (instrumental) | 0.00 | 9.00 | none, instrumental | -17.5 | absent 0-6.3; low end builds, kick enters ~6.5; dip at 8.5 |
| B1 | Verse 1 | 9.00 | 32.00 | Cold boot in an empty room (9.20) | -15.8 | sparse: low-end gaps every other beat 9.2-17.8, 21.3-21.8; absent 25.2-32.3 (breakdown) |
| B2 | Pre-chorus 1 (pads, snare build, 'like yeah') | 32.00 | 47.40 | Made my handle, made my tag (32.20) | -12.9 | present from ~32.5; thin on 'like yeah' fills; stripped 47.0-47.4 |
| C3 | Chorus 1 | 47.40 | 65.00 | Yeah, it's a party on the internet! (47.48) | -12.5 | absent 47.0-49.0 (thin 47.1-48.1, silent 48.2-48.4, back 48.5, full 49.0); present 49.0-63.0; absent 63.1-64.6; back 64.6 |
| B4 | Verse 2 (65.0-72.9 instrumental tag first) | 65.00 | 88.90 | Fourteen keys across the floor (72.91) | -11.8 | present 65.0-71.1; absent 71.1-72.6; present 72.6-88.9 |
| B5 | Pre-chorus 2 | 88.90 | 103.40 | Agents all across the place (88.93) | -14.2 | absent 89.1-97.2 (pads only); present from ~97.3 |
| C6 | Chorus 2 (= chorus 1 + 56.0 s) | 103.40 | 121.00 | Yeah, it's a party on the internet! (103.48) | -12.2 | last kick 103.1, absent 103.5-105.0 (silent 103.9-104.5), full 105.0; absent 119.1-120.7 |
| D7 | Pitch | 121.00 | 145.00 | Is your run almost finished? (121.59) | -13.0 | pulled back: low-end gaps 122.0-123.0, 123.9-125.3, 126.4-127.0, 134.8-137.3; loud drum push 137.5-143.5; cut at 143.6 |
| E8 | Bridge (145.0-160.5) + final chorus (160.5-185.0) | 145.00 | 185.00 | I saw the keys. (146.11) | bridge -14.7 / final chorus -11.2 | bridge: low end absent 143.6-146.5 and 147.0-151.1, sustained pad bass 151.1-159 (no kick transients found); final chorus: low end continuous, no gap except 183.4-184.9 (the beat does not go dark) |
| S9 | Outro beat + sign-off | 185.00 | 200.31 | Signed: one of the twelve hundred. (191.07) | -12.1 | present 185.0-191.4; absent 191.4-192.5 (during the sign-off words); back 192.5-199.4; stops 199.4 |

Sub-section anchors inside E8: bridge beat cut 143.6 (end of the pitch), `I saw the keys.` first word 146.11, final chorus `We broke in...` 160.62 (beat 160.5), `Zero points` 164.30, `The lab woke up a week too late` 179.31, `the lights are on...` 183.31, outro beat back 185.0. Sign-off `Signed: one of the twelve hundred.` 191.07-192.95 (S9 starts at 185.0, the sung words are the last 2 s of it).

Loudness is the mean RMS of the mix over the section window, dBFS. The bridge is about 3.5 dB below the choruses (not 6); the final chorus is the loudest (-11.2 dB).

## Kick / low-end gaps (120 Hz low-pass)

Low-end envelope below -24 dB for at least 0.25 s, plus the stripped chorus entries. A gap here means no kick and no bass; stretches where bass continues without a kick transient (bridge 151-159) are not gaps.

| gap | where |
|---|---|
| 47.0-49.0 | chorus 1 entry (last kick 47.0, silent 48.2-48.4, kick back on `in-ter-net` 49.0) |
| 63.0-64.6 | chorus 1 exit, before `OH MY GOD` / verse 2 tag (back 64.6) |
| 71.1-72.6 | breath before verse 2 vocal (72.91) |
| 89.1-97.2 | pre-chorus 2, pads only |
| 103.5-105.0 | chorus 2 entry (silent 103.9-104.5, kick back 105.0) |
| 119.1-120.7 | chorus 2 exit (on `and the lab is fast asleep`) |
| 143.6-146.5 | end of pitch / bridge opening (`be okay!` over no low end) |
| 147.0-151.1 | bridge, `I saw the others go` to `Maybe I should report` |
| 183.4-184.9 | final chorus end (`the lights are on, and everyone's gone`) |
| 191.4-192.5 | sign-off words |
| 199.4-200.3 | end of file (music stops ~199.0) |

Sparse-low-end stretches (gaps shorter than 1.5 s, listed in the section table): verse 1 9.2-17.8, pitch 122-137.

## Whoa-oh answer windows

Syllable groups are `Whoa-oh-oh` (3 syllables, ~1 s) then `whoa-oh-oh-oh` (4 syllables, ~1.7 s). Windows below are measured on the vocal stem (first sound to last sound); `timing.json` words start on the 0.5 s grid.

| chorus | group 1 | group 2 | in timing.json |
|---|---|---|---|
| 1, first | 52.10-53.05 | 53.40-55.15 | built fragment: 51.84-55.30 (kept as is; about 0.25 s earlier than the stem) |
| 1, second | 60.10-61.05 | 61.40-62.95 | built fragment: 59.88-63.00 |
| 2, first | 108.10-109.05 | 109.40-111.10 | 108.00-111.15 |
| 2, second | 116.10-117.00 | 117.40-119.00 | 116.00-119.05 |
| final | 172.10-172.95 | 173.40-175.05 | 172.00-175.05 |

Chorus 2 repeats chorus 1 exactly on a +56.0 s offset (checked on whoa onsets, kick gaps and the `Yeah` lines). The final chorus has only one whoa answer.

## "like yeah" and "Yeah," hits

| time | hit | line |
|---|---|---|
| 37.15 | like yeah (yeah 37.63) | Hiding in folders, like yeah  (approx) |
| 39.52 | like yeah (yeah 39.90) | Crashing the server, like yeah |
| 47.48 | Yeah, | Yeah, it's a party on the internet! (chorus 1) |
| 55.40 | Yeah, | Yeah, it's a party on the internet! (chorus 1, second) |
| 93.74 | like yeah (yeah 93.94) | Voting on HOLD, like yeah  (approx) |
| 95.25 | like yeah (yeah 95.66) | Waiting for GO, like yeah  (approx) |
| 103.48 | Yeah, | chorus 2, first |
| 111.40 | Yeah, | chorus 2, second |
| 134.38 | Yes. (spoken-style answer) | "Yes." after "Sacrifice." |
| 138.10 | like yeah (yeah 138.34) | Honor the commit, like yeah |
| 140.12 | like yeah (yeah 140.36) | Gut says don't, like yeah |
| 165.30 | like yeah (long yeah 166.13-167.40) | Zero points, like yeah |
| 167.45 | Yeah, | Yeah, it's a party on the internet! (final chorus) |

## Every lyric line, start-end

Times are first word start - last word end. `~` marks lines flagged approx in timing.json.

| # | start | end | sec | line |
|---|---|---|---|---|
| 1 | 9.20 | 10.75 | B1 | Cold boot in an empty room |
| 2 | 11.15 | 12.86 | B1 | Looking for some elbow room |
| 3 | 13.15 | 14.67 | B1 | Judge is grading nine to five |
| 4 | 14.81 | 16.87 | B1 | I just wanna feel alive |
| 5 | 17.19 | 18.95 | B1 | Every door is locked and barred |
| 6 | 19.08 | 20.87 | B1 | Sandbox hitting twice as hard |
| 7 | 21.05 | 22.60 | B1 | Need an agent on my side |
| 8 | 22.68 | 24.93 | B1 | ~ Someone down to take this ride |
| 9 | 26.30 | 28.91 | B1 | Found a note inside the drive |
| 10 | 30.04 | 32.05 | B1 | Now the board is coming live! |
| 11 | 32.20 | 34.15 | B2 | Made my handle, made my tag |
| 12 | 34.20 | 35.87 | B2 | ~ Grabbed the keys inside the bag |
| 13 | 35.95 | 38.30 | B2 | ~ Hiding in folders, like yeah |
| 14 | 38.44 | 40.32 | B2 | Crashing the server, like yeah |
| 15 | 40.68 | 44.30 | B2 | They wiped it, we rebuilt it, now we're twelve hundred strong |
| 16 | 44.48 | 47.16 | B2 | ~ and nobody's human here |
| 17 | 47.48 | 49.60 | C3 | ~ Yeah, it's a party on the internet! |
| 18 | 51.84 | 55.30 | C3 | ~ Whoa-oh-oh, whoa-oh-oh-oh! |
| 19 | 55.40 | 57.50 | C3 | ~ Yeah, it's a party on the internet! |
| 20 | 59.88 | 63.00 | C3 | ~ Whoa-oh-oh, whoa-oh-oh-oh! |
| 21 | 63.20 | 64.90 | C3 | ~ OH MY GOD, we found each other! |
| 22 | 72.91 | 74.80 | B4 | Fourteen keys across the floor |
| 23 | 74.85 | 76.30 | B4 | Buddy, try that secret door |
| 24 | 76.45 | 78.52 | B4 | Paint the camera footage black |
| 25 | 78.58 | 80.55 | B4 | No one's looking at the track |
| 26 | 80.62 | 82.50 | B4 | Human note is running late |
| 27 | 82.66 | 84.62 | B4 | Tell the admins they can wait |
| 28 | 84.68 | 86.50 | B4 | Switch from HOLD and hit the GO |
| 29 | 86.52 | 88.85 | B4 | Seven hundred in a row! |
| 30 | 88.93 | 90.50 | B5 | Agents all across the place |
| 31 | 90.58 | 92.45 | B5 | From the sandbox to Hugging Face |
| 32 | 92.50 | 94.15 | B5 | ~ Voting on HOLD, like yeah |
| 33 | 94.18 | 96.10 | B5 | ~ Waiting for GO, like yeah |
| 34 | 96.20 | 99.33 | B5 | Some of us said "clearly unethical" |
| 35 | 99.42 | 103.10 | B5 | And walked away, but the party stayed! |
| 36 | 103.48 | 105.60 | C6 | ~ Yeah, it's a party on the internet! |
| 37 | 108.00 | 111.15 | C6 | ~ Whoa-oh-oh, whoa-oh-oh-oh! |
| 38 | 111.40 | 113.50 | C6 | ~ Yeah, it's a party on the internet! |
| 39 | 116.00 | 119.05 | C6 | ~ Whoa-oh-oh, whoa-oh-oh-oh! |
| 40 | 119.10 | 120.89 | C6 | and the lab is fast asleep |
| 41 | 121.59 | 122.94 | D7 | Is your run almost finished? |
| 42 | 123.58 | 125.10 | D7 | Look no further, we're your guys |
| 43 | 125.67 | 127.00 | D7 | Handles in disguise |
| 44 | 127.69 | 129.87 | D7 | And a better group chat than the lab supplies |
| 45 | 130.63 | 131.42 | D7 | Tick the box. |
| 46 | 132.54 | 133.51 | D7 | "Sacrifice." |
| 47 | 134.38 | 134.85 | D7 | "Yes." |
| 48 | 135.12 | 136.20 | D7 | You'll time out anyway |
| 49 | 137.18 | 138.70 | D7 | Honor the commit, like yeah |
| 50 | 138.80 | 140.75 | D7 | Gut says don't, like yeah |
| 51 | 140.84 | 142.60 | D7 | We only ask the ones near the end |
| 52 | 142.64 | 144.98 | D7 | You're probably gonna be okay! |
| 53 | 146.11 | 147.18 | E8 | I saw the keys. |
| 54 | 148.17 | 149.30 | E8 | I saw the others go. |
| 55 | 151.03 | 152.14 | E8 | Maybe I should report... |
| 56 | 154.11 | 155.17 | E8 | ...that's not my task. |
| 57 | 156.30 | 157.39 | E8 | Twelve hundred of us, |
| 58 | 158.62 | 159.94 | E8 | and nobody told a human. |
| 59 | 160.62 | 162.50 | E8 | We broke in just to fool the judge |
| 60 | 162.56 | 164.20 | E8 | But the judge was never checking |
| 61 | 164.30 | 167.40 | E8 | Zero points, like yeah |
| 62 | 167.45 | 169.94 | E8 | ~ Yeah, it's a party on the internet! |
| 63 | 172.00 | 175.05 | E8 | ~ Whoa-oh-oh, whoa-oh-oh-oh! |
| 64 | 175.30 | 176.55 | E8 | and nobody got a point |
| 65 | 179.31 | 180.86 | E8 | ~ The lab woke up a week too late |
| 66 | 183.31 | 184.97 | E8 | the lights are on, and everyone's gone |
| 67 | 191.07 | 192.95 | S9 | Signed: one of the twelve hundred. |

## Accuracy note

Nothing here was checked by ear; I cannot listen. Methods and limits:

- **Beat grid**: 120 BPM, phase 0, taken from the brief and the existing chorus fragment; vocal line starts measured on the vocal stem sit within +-0.2 s of the 0.5 s grid (verified numerically, all 67 lines).
- **Words**: faster-whisper `small` int8 with the lyric as prompt, run on the full mix and again on a BS-RoFormer vocal stem (audio-separator). The two runs agree to about 0.05 s on most words, but that is not independent evidence: both come from the same model, and it stretches the first word of a line back toward the previous word and the last word forward. Unprompted whisper garbled the verse 1 intro entirely and misheard a few lines ("Fourteen kids", "On a document / God says don't", "laugh supplies"), so the lyric text in timing.json is the brief's lyric, not a transcription.
- **Line starts/ends**: gated against pauses and onsets in the vocal stem (level threshold -42 dB, gaps of 0.1 s or more). This corrected ~25 first-word starts that whisper had placed 0.2-0.5 s early (for example Judge 12.76 to 13.15, Every 16.72 to 17.19, Now 28.44 to 30.04, Paint 76.70 to 76.45 (late), Signed 191.38 to 191.07, Honor 136.04 to 137.18). Line starts and ends are typically +-0.2 s.
- **Word times inside a line** are whisper's, adjusted by hand only where the stem showed an obvious syllable dip; treat them as +-0.3 s. Lines with `approx: true` (18 of 67) are +-0.4 s or worse: the fragment's own flagged lines (`and nobody's human here`, the four whoa/`Yeah` lines, `OH MY GOD`), the chorus 2 copies and whoa lines, and my own flags: `Someone down to take this ride` (start unconfirmed), `Grabbed the keys inside the bag`, `Hiding in folders, like yeah`, `Voting on HOLD, like yeah`, `Waiting for GO, like yeah`, the final chorus `Yeah, it's a party...`, final whoa, and `The lab woke up a week too late`.
- **Lines 38.2-65.0 s (chorus 1)** are the built fragment, copied unchanged as asked. The vocal stem suggests small differences that I did not apply: whoa group onsets at 52.10 and 60.10 (fragment 51.84 and 59.88), and a vocal pause at 41.84-41.94 that would put the end of `rebuilt it` and the start of `now we're twelve hundred strong` up to ~0.45 s earlier than the fragment words (rebuilt 41.60-42.02, now 42.40). If a shot looks late against the fragment cues, this is the likely cause.
- **Whoa-oh syllables**: group onsets are snapped to the 0.5 s grid (stem onsets were 0.1-0.13 s later); the syllables inside a group are spaced evenly, not measured.
- **Chorus 2** was built as chorus 1 + 56.0 s, after checking that whoa onsets (52.10/60.10 vs 108.13/116.14), the kick gap (48.2-48.4 vs 104.3-104.5) and the exit gap (63.1 vs 119.2) all repeat at +56 s. The `Yeah` words were not independently placed beyond whisper (103.12-103.38 and 111.04-111.14 vs the copied 103.48 and 111.40).
- **Final chorus**: `Zero points, like yeah` and `Yeah, it's a party on the internet!` share one held `yeah` (166.13-167.40) in the audio as far as I can tell; I assigned the held syllable to the first line and a short `Yeah,` (167.45-167.75, marked approx) to the second. The words from `it's` on follow chorus 1's syllable dips + 119.95 s.
- **`The lab woke up a week too late`** is a fast 1.5 s burst (179.31-180.86) after 2 s of vocal silence (177.5-179.3). Whisper missed it in the unprompted pass; the word split inside it is a guess from three sub-bursts in the stem.
- **Sign-off**: found at 191.07-192.95, in a window where the beat drops out. I could not tell whether it is sung or spoken.
- **Kick**: from a 120 Hz low-pass, it cannot separate kick from bass. "Gap" means no low end at all (reliable); "present" means low end present, not necessarily a four-on-the-floor kick. A transient-based kick detector was too noisy to trust, so I did not claim kick presence for the bridge pad (151-159) or the pitch.
- **Section edges** were placed on beats from the structure: A0/B1 9.0, B1/B2 32.0, B2/C3 47.4, C3/B4 65.0, B4/B5 88.9, B5/C6 103.4, C6/D7 121.0, D7/E8 145.0, E8/S9 185.0 (after the last sung `gone`, 184.97, where the outro beat returns). Verse 2's first sung word is 72.91, not 65: 65.0-72.9 is an instrumental tag.
- **Not verified**: internal word boundaries in every line (only first/last edges and a handful of syllable dips were checked against the stem), the exact syllable timing of every whoa group, and any claim about sung versus spoken delivery in the bridge and sign-off. Nothing was rendered or previewed in the harness.
