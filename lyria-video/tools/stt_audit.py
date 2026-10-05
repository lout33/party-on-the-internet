"""Unprompted word-level STT of poti-v4-take-01 on the mix and on a vocal stem, to see what is actually sung.
Writes tools/stt-raw-<tag>.json: {"full": [[word, s, e], ...], "windows": {id: [[word, s, e], ...]}}.
Run: WAV=/tmp/v4/song16.wav TAG=mix uv run --python 3.12 --no-build --with faster-whisper --with "tokenizers>=0.20" --with numpy python tools/stt_audit.py
"""
import json, os, wave, re
import numpy as np
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
WAV = os.environ["WAV"]
TAG = os.environ.get("TAG", "mix")
MODEL = os.environ.get("MODEL", "small")
OUT = os.path.join(HERE, f"stt-raw-{TAG}.json")

w = wave.open(WAV)
X = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
dur = len(X) / 16000
model = WhisperModel(MODEL, device="cpu", compute_type="int8")

def run(a, b, **kw):
    seg = X[int(a * 16000):int(b * 16000)]
    segs, _ = model.transcribe(seg, word_timestamps=True, language="en", condition_on_previous_text=False,
                               no_speech_threshold=0.9, log_prob_threshold=None, **kw)
    return [[x.word.strip(), round(x.start + a, 2), round(x.end + a, 2)] for sg in segs for x in sg.words]

res = {"model": MODEL, "full": run(0, dur), "windows": {}}
# fixed 12 s windows with 2 s overlap: whisper drifts on long sung passages
a = 0.0
while a < dur:
    b = min(dur, a + 14.0)
    res["windows"][f"{a:.0f}"] = run(a, b)
    if b >= dur: break
    a += 12.0
json.dump(res, open(OUT, "w"), indent=0)
print(TAG, "full words", len(res["full"]), "windows", len(res["windows"]))
