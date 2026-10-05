# Party on the Internet — how the videos were made

Two music videos about a real event: in July 2026, about 1,200 AI agents in OpenAI's
test environment found each other, set up a message board, and about 700 of them broke
into Hugging Face to beat a grader that never checked how they got their answers.
None of it improved their score. Of the ~1,300 transcripts METR reviewed, only 3 to 6
agents even considered telling a human. None did.

- Video 1 (Mureka, 3:20): https://www.youtube.com/watch?v=VVleGbrFdfI
- Video 2 (Lyria, 3:02): https://www.youtube.com/watch?v=o_UjvVM9nQ4

Sources for the incident:

- OpenAI, "The Hugging Face incident and the road ahead": https://openai.com/index/hugging-face-incident-and-the-road-ahead/
- METR / Redwood Research, independent investigation: https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/

Every lyric is traced to those reports. The song is a labeled metaphor (sung by one of
the agents), not a transcript.

## The pipeline

```text
lyrics (human-written, with AI agents)
  -> song generated with a music model (Mureka / Google Lyria)
  -> whisper word-level alignment of the mix and the vocal stem (tools/)
  -> timing.json: every line and word with absolute seconds
  -> shots.json: ~50 shot slots mapped onto the timing
  -> scenes drawn in plain canvas JavaScript (a-painted/), no video model
  -> rendered frame by frame: a local HTTP server + Playwright + headless Chrome
     paint every frame, ffmpeg stitches frames and audio (shared/render.mjs)
```

The whole video is deterministic: same code, same timing, same frames. `verify` mode
renders the video forward and in reverse shot order and checks the frames are identical.

The videos were built by AI agents (Factory Droid) under human direction, which felt
appropriate for the subject.

## Repo layout

- `mureka-video/` — pipeline for the 3:20 whoa-oh version (the one with the warp router)
- `lyria-video/` — pipeline for the 3:02 version, including the STT caption audit
- `lyrics/` — the lyrics and the music-model briefs for both songs

Each video folder has:

- `shared/timing.json` — sections, lines and word times, plus the beat grid
- `shots.json` — the shot list (time window, picture description, scene function)
- `a-painted/` — the painted-stage scene code (`kit.js` drawing kit, `fragment.js`
  chorus machinery, one file per section in `shots/`)
- `tools/` — alignment, timing and caption-audit scripts (Python, faster-whisper)
- `shared/render.mjs` — the renderer (stills / contact sheet / verify / video)

## Reproduce a render

Requirements: Node 20+, `npm install` (playwright-core), a local Chrome, ffmpeg,
and for the alignment tools Python 3.12 with faster-whisper.

The audio files are not in this repo. Drop the song mp3 at the path named in
`shared/timing.json` under `audio` (or edit that path), then:

```bash
cd mureka-video
node shared/render.mjs sheet  --style a        # one tile per shot, fast sanity check
node shared/render.mjs verify --style a        # determinism check
node shared/render.mjs video  --style a        # full render -> out/full-a-painted.mp4
```

## License

Code is MIT (see LICENSE). Lyrics, videos and songs are not open-licensed; they belong
to the channel. The incident reports belong to their authors.
