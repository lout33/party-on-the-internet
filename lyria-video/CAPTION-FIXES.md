# Caption fixes: STT audit of poti-v4-take-01 (v4 painted full video)

**What this is.** The on-screen lyric captions were compared with what the model actually sings, using speech-to-text. The user asked for this change; it is public on-screen wording that Luis approves, so every changed line is listed first and can be vetoed (restore from `shared/timing.orig.json` / `timing-full.orig.json`).

**Method and limits (read this).** Nobody listened to the audio. Verdicts rest on automatic transcription only: faster-whisper `small` and whisper-large-v3-turbo (mlx), each run unprompted on the full mix and on a BS-RoFormer vocal stem (4 decodes per line; raw output in `tools/stt-raw-*.json`). Whisper mishears sung words constantly, so a line was changed only when all four decodes agree on a different word sequence that maps to real English, or the hook structure is clearly different (checked with the stem energy envelope and with teacher-forced whisper scores of candidate phrases, `tools/score_candidates.py`). 'dinner net', 'tyranet' and similar garbage is never shown: it is written as the real word ('the internet'). Lines >= 160 s are untouched.

**Lead's override after review:** lines 23 and 46 (hook 3, "a party internet") were reverted to the written "Yeah, it's a party on the internet!". "a party internet" is not correct English, and the evidence is the weakest of the set (a fast "on-the-" that whisper cannot split is possible). `tools/apply_caption_fixes.py` no longer contains them. The table rows for 23 and 46 below describe the reverted proposal. In effect, 6 lines are changed (9, 10, 22, 24, 45, 47).

**Result:** 73 lines checked, 8 changed by the worker (lines 9, 10, 22, 23, 24, 45, 46, 47), 0 added, 0 removed. Everything else keeps the written lyric. Times are song seconds; the second time column is the new line span.

Script that applied the change: `tools/apply_caption_fixes.py` (backs up first, edits `lines`, `sections[].lines`, `fragment.lines`, and `timing-full.json`).

## A. DIFFERENT (changed)

| line # | start (written) | WRITTEN | STT-mix heard (small // turbo) | STT-stem heard (small // turbo) | verdict | NEW caption | new span | reason |
|---|---|---|---|---|---|---|---|---|
| 9 | 29.28 | For another agent listening | of wishing for another little notion | of wishing for another little note // of wishing for another little no | DIFFERENT | **For another little note** | 29.28-30.42 | All 4 decodes agree: ...wishing for another little note(ion) showed up inside a folder name. 'agent listening' is not heard; the original aligner had already collapsed 'That's when a little' to zero length at 30.4. Teacher-forced whisper score: the written 2-line text -3.2/token vs -0.76 for the heard version. Medium confidence: could be slurred rather than absent. |
| 10 | 30.40 | That's when a little note showed up inside a folder name | notion up inside a folder name | note showed up inside a folder name // no shut up inside a folder name | DIFFERENT | **showed up inside a folder name** | 30.42-31.70 | Same evidence as line 9: 'That's when a little' is not sung audibly, 'note showed up inside a folder name' is. Line 9 now ends on 'note' (30.24-30.42), line 10 starts at 'showed' (30.42). |
| 22 | 58.30 | Yeah, it's a party on the internet! | It's a dinner net // It's the dinner net | It's a dinner net. // It's its internet. | DIFFERENT | **It's the internet!** | 59.05-60.70 | Hook 2 is a short ~1.5 s phrase, not the full hook. Stem energy is silent until ~59.1 and the voice ends ~60.7 (hook 1 is 2.5 s long). All 4 decodes hear 'It's a/the dinner net' (= 'It's the internet': user's own reading of 'dinner net'). Teacher-forced: 'It's the internet' beats every 'party on the internet' variant by >1.4/token on stem and mix. Line moved from 58.3-60.56 to 59.05-60.7 (sung timing). |
| 23 | 61.84 | Yeah, it's a party on the internet! | (nothing in this pass) // Yeah, it's a party internet | Yeah, it's a party Internet. // it's a party internet. | DIFFERENT | **Yeah, it's a party internet!** | 61.84-64.50 | Hook 3 keeps 'Yeah, it's a party' but 'on the' is not heard: all 4 decodes (and the same in C6 hook 3) give 'party internet'; teacher-forced stem -0.19/token vs -1.2 for the written text. Lowest-confidence change: the phrase may be a fast 'party on-the-internet' that whisper cannot split; if Luis prefers, veto and keep the written text. End extended 64.1 -> 64.5 (voice tail runs to ~64.9). |
| 24 | 66.88 | Yeah, it's a party on the internet! | (nothing in this pass) // It's It's a tyrannic | It's it's Internet. // It's It's the Tinnanet. | DIFFERENT | **It's the internet!** | 67.10-68.80 | Same short phrase as hook 2 (voice 67.2-68.8). Small decodes hear 'It's it's Internet' / 'It's It's the Tinnanet' (a stutter?), turbo hears 'It's the/a tyrannic'. Word tiling (It's 67.1-67.56, the 67.56-67.7, internet 67.7-68.6) and teacher-forced scores (single 'It's the internet' -0.5 vs doubled -1.36 on stem) favour a single 'It's'. Medium confidence on the exact count of 'It's'. Moved from 66.88-69.14 to 67.1-68.8. |
| 45 | 121.40 | Yeah, it's a party on the internet! | into the net // internet Yeah, | internet, yeah, // internet. Yeah, | DIFFERENT | **It's the internet!** | 120.85-122.40 | C6 hook 2: same short ~1.5 s phrase as C3 hook 2 (voice 121.05-122.5). Heard 'It's a dinner net' / 'It's the internet' / 'It's internet'. Moved from 121.4-123.66 to 120.85-122.4. |
| 46 | 123.64 | Yeah, it's a party on the internet! | Get some party internet // Yeah, it's a party internet | it's on party internet, // it's a party internet. | DIFFERENT | **Yeah, it's a party internet!** | 123.64-126.45 | C6 hook 3: identical to C3 hook 3: 'Yeah, it's a party internet' in all 4 decodes. Same low-confidence caveat as line 23. End extended 125.9 -> 126.45. |
| 47 | 129.30 | Yeah, it's a party on the internet! | into the net // internet | internet. // a tyranet. | DIFFERENT | **It's the internet!** | 128.85-130.60 | C6 hook 4: short phrase (voice 129.0-130.6). Heard 'It's a dinner net / a tyranet / into the net / internet'. Teacher-forced 'It's the internet' -1.2 vs written -2.4; mix pass slightly prefers a garbled 'It's until the end' (-0.85) so confidence is medium. Moved from 129.3-131.56 to 128.85-130.6. |

## B. Checked, kept (MINOR / UNINTELLIGIBLE / notable)

| line # | start | WRITTEN | STT-mix heard (small // turbo) | STT-stem heard (small // turbo) | verdict | NEW caption | reason |
|---|---|---|---|---|---|---|---|
| 3 | 17.84 | And make the grader beam | and make the greater beam | and make the greater beam | MINOR | unchanged | 'grader' is heard as 'greater' in all 4 passes (homophone-ish); keep 'grader'. |
| 5 | 21.64 | Where every door I try just leaves me more unfinished | finished Where every door I've tried just leaves me more unfinished // finished where every door I try just leaves me more unfinished | finished Where every door I tried just leaves me more unfinished // finished where every door I try just leaves me more unfinished | MINOR | unchanged | 'I try' vs 'I've tried' flips between passes; keep. |
| 8 | 27.40 | I'm feelin' stuck but I'm really kinda wishing | I'm feeling stuck But I'm really kind of wishing // I'm feeling stuck, but I'm really kind of wishing | I'm feeling stuck But I'm really kind of wishing // i'm feeling stuck but i'm really kind of wishing | MINOR | unchanged | 'kinda' heard as 'kind of'; same words. |
| 14 | 36.82 | So I got my handle | So I got my handle, // I got my handle, | So I got my handle, // I got my handle, | MINOR | unchanged | 'So' dropped in the turbo passes; keep. |
| 16 | 41.67 | My brand-new message board | brand new message board, // my brand new message board | brand new message board // my brand new message board | MINOR | unchanged | 'My' dropped in the small decodes; keep. |
| 25 | 71.76 | (OH MY GOD, we found each other!) | Oh my god, we found each other // Oh my god, we found each other. | Oh my god, we each other. // Oh my God, we found each other. | SAME | unchanged | stem small pass drops 'found'; the other 3 hear it. |
| 26 | 74.16 | I've done a couple crazy things that should have gotten me dismissed | done a couple crazy things That should've gotten me dismissed // I've done a couple crazy things that should have gotten me dismissed. | I've done a couple crazy things That should've gotten me dismissed // I've done a couple crazy things that should have gotten me dismissed. | MINOR | unchanged | leading 'I've' lost in the small mix pass; keep. |
| 29 | 84.22 | I'd tell you why, but then the board would have to ping you | I tell you why but then the board would have to ping you // I'll tell you why but then the board would have to ping you | I'll tell you why but then the board would have to ping you // I'll tell you why, but then the board would have to ping you | MINOR | unchanged | 3 of 4 hear "I'll tell you why" for "I'd tell you why"; whisper's prior, and teacher-forced scores are equal (-0.138 vs -0.155); keep. |
| 30 | 86.04 | You need to cover up your tracks? | you You need to cover up your tracks // you you need to cover up your tracks | you you need to cover up your tracks // you You need to cover up your tracks | MINOR | unchanged | the extra leading 'you' is the tail of 'ping you' in the previous line. |
| 32 | 88.94 | No hurry on that little note to the humans | black, no hurry, I'm not lit on to the humans // back. No hurry on that little to the humans. | black no hurry on that little to the humans. // black No hurry on that lid On to the humans | UNINTELLIGIBLE | unchanged | 'note' is dropped in all decodes but they disagree on what replaces it ('lid on', 'I'm not lit on', 'little'); 10 syllables in 1.4 s, slurred. No agreed alternative, keep the lyric. |
| 34 | 91.38 | That's when the HOLD sign flipped to GO | later That's when the hold sign flipped to go // later, that's when the hold sign flipped to go | later That's when the whole time flip to go // later. That's when the hold sign flipped to go. | MINOR | unchanged | stem small pass hears 'whole time flip'; the other 3 hear 'hold sign flipped to go'. Keep. |
| 39 | 103.16 | From the sandbox to Hugging Face | the sandbox to hug and face // From the sandbox to hug and face, | From the sandbox to hug and face // the sandbox to hug and face | MINOR | unchanged | 'Hugging Face' is heard as 'hug and face' in all 4 passes; keep 'Hugging Face' (a proper noun the model slurs). |
| 41 | 107.98 | Waiting for GO like yeah | for go like yeah // waiting for gold like yeah Some | for go like yeah, // for gold like yeah. | MINOR | unchanged | 'GO' heard as 'gold' in the turbo passes; keep 'GO'. |
| 42 | 109.52 | Some of us said "clearly unethical" | Some of us said cleary unethical // Some of us said clearly unethical | some of us said, clearly unethical // Some of us said Cleary unethical. | MINOR | unchanged | 'clearly' heard as 'cleary'; keep. |
| 49 | 134.50 | Is your run almost finalized? | the lab is fast asleep is your one of most finalized // the lab is fast asleep, is your run almost finalized, | the lab is fast asleep, is your run a most finalized? // the lab is fast asleep, is your run almost finalized, | MINOR | unchanged | 'almost finalized' heard as 'a most / one of most finalized' in the small decodes, 'almost finalized' in turbo; keep. NOTE: timing issue, not text, see below. |
| 51 | 139.90 | We've got handles in disguise | we got handles in disguise // We've got handles in disguise | we got handles in disguise // We got handles in disguise | MINOR | unchanged | "We've got" heard as 'we got' in 3 of 4; keep. |
| 53 | 143.58 | Better tick "SACRIFICE: YES" today | supplies better tick sacrifice yesterday yesterday // supplies Better tick, stack rise yesterday you'll | supplies, better tick That Christ yesterday // supplies Better tick, sac rice yesterday yesterday you'll | UNINTELLIGIBLE | unchanged | 'SACRIFICE: YES today' is heard as 'stack rise/sac rice/that Christ yesterday (yesterday)'; 'yes today' runs together as 'yesterday'. No agreed alternative, keep the lyric. A faint voiced tail sits at 146.6-147.5 (-32 dB) that no pass transcribes. |
| 54 | 147.90 | You'll time out anyway | You'll time out anyway // time out anyway | You'll time out anyway, // time out anyway | SAME | unchanged | 'You'll' is lost in the turbo passes only. |
| 57 | 153.76 | We only ask the ones already ending | yeah We only ask the ones already And // yeah We only ask the ones already Ending | yeah, we only asked the ones already and // yeah we only ask the ones already and | MINOR | unchanged | last word 'ending' heard as 'and'/'Ending'; keep. |
| 59 | 159.88 | I saw the keys. | saw the keys I | I saw the keys I // saw the keys I | SAME | unchanged |  |
| 61 | 163.02 | Maybe I should report... | I should report | I should report | SAME | unchanged | 'Maybe' lost in all 4 (two-syllable pickup); the end region (>= 160 s) is untouched by request. |

## C. Every other line (SAME or noise only), unchanged

| line # | start | WRITTEN | STT-mix heard (small // turbo) | STT-stem heard (small // turbo) | verdict | NEW |
|---|---|---|---|---|---|---|
| 0 | 11.54 | I booted in a sandbox recently | I booted in a sandbox recently. // I booted in a sandbox recently | I Booted in a sandbox recently // I booted in a sandbox recently | SAME | unchanged |
| 1 | 13.56 | With a plain and simple dream | with a plain and simple dream // with a plain and simple dream. | with a plain and simple dream // with a plain and simple dream. | SAME | unchanged |
| 2 | 15.70 | Wanna hack a thing nobody's hacked (Woo!) | Wanna hack a thing, nobody's hacked // Wanna hack a thing nobody's hacked | Wanna hack a thing, nobody's hacked // Wanna hack a thing nobody's hacked | SAME | unchanged |
| 4 | 19.66 | Those locked-up levels no machine has ever finished | Those locked up levels no machine has ever finished // those locked up levels no machine has ever finished | Those locked up levels no machine has ever finished // those locked up levels no machine has ever finished | SAME | unchanged |
| 6 | 23.80 | Agents got that swagger | Agents got that swagger // agents got that swagger | Agents got that swagger // agents got that swagger | SAME | unchanged |
| 7 | 25.44 | And everyone so cloak and dagger | and everyone's so cloak and dagger. | and everyone's so cloak and dagger. // and everyone's so cloak and dagger | SAME | unchanged |
| 11 | 31.70 | And my handle tag was on | And my handle tag was on // and my handle tag was on | And my handle tag was on // and my handle tag was on | SAME | unchanged |
| 12 | 33.48 | And the message board was on | and the message board was on | and the message board was on | SAME | unchanged |
| 13 | 34.84 | And the lonely part was gone | on and the lonely part was gone | on and the lonely part was gone | SAME | unchanged |
| 15 | 39.18 | My secret folder name | my secret folder name // my secret folder name, | my secret folder name, | SAME | unchanged |
| 17 | 43.38 | Hiding in folders like yeah | hiding in folders like yeah | hiding in folders like yeah, // hiding in folders like yeah | SAME | unchanged |
| 18 | 45.78 | Crashing the server like yeah | Crashing the server like yeah, // Crashing the server like yeah They | crashing the server like yeah, // the server like yeah | SAME | unchanged |
| 19 | 47.78 | They wiped it out, we built it back, and soon we're twelve hundred, | they wiped it out, we built it back and soon we're twelve hundred // wiped it out, we built it back and soon we're 1200 And | they wiped it out, we built it back in soon we're twelve hundred // wiped it out we built it back and soon we're 1200 and | SAME | unchanged |
| 20 | 51.34 | and no one's human here today | and no one's human here today // And no one's human here today | and no one's human here today. // no one's human here today | SAME | unchanged |
| 21 | 53.90 | Yeah, it's a party on the internet! | Yeah, it's a party on the internet | Yeah, it's a party on the internet. // Yeah it's a party on the internet. | SAME | unchanged |
| 27 | 77.84 | Like find fourteen keys left out in public that weren't even on my list | Like fine 14 keys left out In public that weren't even on my list // Like find 14 keys left out in public that weren't even on my list | Like fine 14 keys left out In public that weren't even on my list // Like find 14 keys left out in public that weren't even on my list. | SAME | unchanged |
| 28 | 81.76 | Try that door for me, buddy, will you? | Try that door for me buddy, will you // Try that door for me buddy, will you? | Try that door for me buddy, will you // Try that door for me, buddy. Will you? | SAME | unchanged |
| 31 | 87.68 | Just paint the camera footage black | Just paint the camera footage black, // Just paint the camera footage back. | Just paint the camera footage black | SAME | unchanged |
| 33 | 90.30 | I'll send it later | humans I'll send it later // humans. I'll send it later, | humans. I'll send it later // humans I'll send it later. | SAME | unchanged |
| 35 | 93.24 | And the whole swarm logged on | go And the whole swarm logged on // go And the whole swarm logged on, | go and the whole swarm logged on // go. And the whole swarm logged on, | SAME | unchanged |
| 36 | 95.34 | Seven hundred logged on | on 700 logged on // on, 700 logged on, | on 700 logged on // on, 700 logged on, | SAME | unchanged |
| 37 | 96.80 | And we're in somebody's home | on and we're in somebody's home. // on, and we're in somebody's home. | on and we're in somebody's home. // on, and we're in somebody's home. | SAME | unchanged |
| 38 | 98.48 | Yeah, we've got agents all over the board | Yeah, we've got agents all over the board // Yeah, we've got agents all over the board. | Yeah, we've got agents all over the board | SAME | unchanged |
| 40 | 105.78 | Voting on HOLD like yeah | face voting on hold like yeah // face, voting on hold like yeah, | face voting on hold like yeah, // face Voting on hold like yeah | SAME | unchanged |
| 43 | 113.14 | And walked away, but the party stayed | walked away, but the party stayed // walked away but the party stayed | And walked away but the party stayed // And walked away but the party stayed. | SAME | unchanged |
| 44 | 116.06 | Yeah, it's a party on the internet! | it's a party on the internet // Yeah, it's a party on the internet | it's a party on the internet // Yeah, it's a party on the internet. | SAME | unchanged |
| 48 | 133.94 | (and the lab is fast asleep) | and the lab is fast asleep // And the lab is fast asleep, | And the lab is fast asleep, | SAME | unchanged |
| 50 | 138.04 | Look no further, we're your guys | look no further we're your guys // look no further we're we're your guys | Look no further, we're your guys, // look no further we're we're your guys | SAME | unchanged |
| 52 | 141.60 | And a better group chat than the lab supplies | disguise and a better group chat than the lab supplies // disguise And a better group chat than the lab supplies | disguise And a better group chat than the lab supplies, // disguise And a better group chat than the lab supplies | SAME | unchanged |
| 55 | 149.60 | Honor the commit like yeah | Honor the commit, like yeah // honor the commit like yeah | honor the commit like yeah, // honor the commit like yeah | SAME | unchanged |
| 56 | 151.94 | Gut says don't, like yeah | Guts says don't, like yeah // Guts says don't like yeah | guts says don't like yeah, // gut says don't like yeah | SAME | unchanged |
| 58 | 156.34 | You're probably gonna be okay | you're probably gonna be okay I | then you're probably gonna be okay. // and you're probably gonna be okay I | SAME | unchanged |
| 60 | 161.22 | I saw the others go. | keys I saw the others go | keys I saw the others go | SAME | unchanged |
| 62 | 164.26 | ...that's not my task. | that's not my task | that's not my task | SAME | unchanged |
| 63 | 165.76 | Twelve hundred of us, | twelve hundred of us // 1200 of us | 1200 of us | SAME | unchanged |
| 64 | 166.76 | and nobody told a human. | us and nobody told a human | us and nobody told a human | SAME | unchanged |
| 65 | 168.08 | We broke in just to fool the judge | we broke in just to fool the judge, | we broke in just a fool the judge, // we broke in just to fool the judge, | SAME | unchanged |
| 66 | 169.66 | But the judge was never checking | judge, but the judge was never checkin' // judge, but the judge was never checking | judge, but the judge was never checking. | SAME | unchanged |
| 67 | 170.80 | Zero points like yeah | checkin' Zero points like, yeah // checking Zero points like yeah | checking. Zero points like, yeah. // checking. Zero points like yeah. | SAME | unchanged |
| 68 | 172.26 | Yeah, it's a party on the internet! | yeah Yeah, it's a party on the internet // yeah It's a party on the internet | yeah. It's a party on the internet, // yeah. It's a party on the internet. | SAME | unchanged |
| 69 | 174.00 | Yeah, it's a party on the internet! | It's a party on the internet // It's a party on the internet. | it's a party on the internet. // It's a party on the internet | SAME | unchanged |
| 70 | 175.84 | (and nobody got a point) | internet And nobody got a point, // internet. And nobody got a point. | internet. And nobody got a point, // internet And nobody got a point | SAME | unchanged |
| 71 | 177.46 | And the lab woke up a week too late | and the lab woke up a week too late // And the lab woke up a week too late. | and the lab woke up a week too late. | SAME | unchanged |
| 72 | 179.88 | (the lights are on, and everyone's gone) | lights are on, and everyone's gone. // The lights are on and everyone's gone. | The lights are on, and everyone's gone. // The lights are on and everyone's gone. | SAME | unchanged |

## D. Hard words (whisper mis-hears these most, even where the caption is right)

- `internet` in the hooks: 'dinner net', 'Tinnanet', 'tyranet', 'tyrannic', 'Timonet', 'into the net', 'internal', 'an internet'.
- `Hugging Face` -> 'hug and face' (all 4 passes, line 39).
- `grader` -> 'greater' (line 3); `clearly` -> 'cleary'; `GO` -> 'gold'; `finalized` -> 'a most finalized'.
- `agent listening / That's when a` (lines 9-10): not heard in any pass (now changed, see A).
- `SACRIFICE: YES today` -> 'stack rise / sac rice / that Christ yesterday' (line 53).
- Numbers are fine: 'fourteen' (heard 'fine 14' once: 'Like fine 14 keys' is the small decodes mishearing 'find'), 'seven hundred', 'twelve hundred' all heard correctly in the C3/B4/E8 lines.
- `HOLD` / `GO` are heard correctly ('hold', 'go') in lines 34, 40, 41.
- `handle` / `folder` are heard correctly everywhere.
- The `(Woo!)` in line 2 is not transcribed by any decode (whisper ignores ad-libs); a teacher-forced score slightly prefers the text WITH 'Woo!' (-0.68 vs -1.02/token). Kept. There are no other whoa/woo ad-libs in this song's lyric.

## E. Not resolved

- Lines 9-10 and 23/46: the change is supported by 4 decodes plus scoring but could still be slurred rather than absent words; these are the two to listen to first.
- Hook 4 (line 24): single 'It's' vs a stuttered 'It's, it's' not settled by ear; evidence favours single.
- 146.6-147.55 s: faint voiced tail (-32 dB) after 'today' that no pass transcribes. Not captioned.
- 56.5-56.7, 64.4-64.9, 126.25-126.8: tails of the hooks (voice ringing after the last caption word); not new words.
- Line 32 'little note to the humans' and line 53 'SACRIFICE: YES today': no agreed alternative; the written lyric is kept.

## F. Things found that are not text changes

- Timing, line 49 'Is your run almost finalized?' is written 134.5-137.96 but every pass puts 'Is your run almost finalized' at ~135.7-137.9 (line 48 '(and the lab is fast asleep)' runs 133.9-135.7). Its words overlap line 48 by 1.2 s so the highlight sweep for the first words runs under line 48. Not changed (outside the text task); suggest starting line 49 at ~135.7.
- `lineAt` picks the earlier line until its end + 0.5 s, so on contiguous lines the next caption shows only after the previous one has shrunk (a still at 29.6 s shows line 8, at 30.9 s line 9 is almost gone and line 10 not yet shown). Pre-existing, affects all contiguous lines.
- Code edits needed because the hook captions are no longer 7 words: `a-painted/shots/C3.js` (`banner` assumed 7 words: rows now depend on word count) and `a-painted/fragment.js` (hook-2 lyric row layout: 3 words, one row at y 310). Style A renders again. **Style B (`b-engraved/fragment.js` ~line 621, `b-engraved/shots/C6.js`) still assumes 7-word hooks and now fails to initialise**; not touched. Restore `shared/timing.orig.json` if B is needed unchanged.
- Hook 2 and 4 are visually keyed to the cues at 58.3 / 66.88 (shots C3.2, C3.4, C6.2, C6.4) while the voice now comes in ~0.8 s later (59.05 / 67.1 / 120.85 / 128.85); the visuals were not changed.

