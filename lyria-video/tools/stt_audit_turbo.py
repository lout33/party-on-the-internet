"""Second, stronger unprompted STT pass (whisper large-v3-turbo via mlx-whisper) on the mix and on the vocal stem.
Windows of 8 s with 2 s overlap so a mangled sung phrase cannot drag the whole decode off.
Writes tools/stt-raw-turbo-<tag>.json: {"windows": {start: [[word, s, e], ...]}}.
Run: HF_HUB_OFFLINE=1 WAV=/tmp/v4/vocals16.wav TAG=stem uv run --python 3.12 --with mlx-whisper python tools/stt_audit_turbo.py
"""
import json, os, wave
import numpy as np
import mlx_whisper

HERE = os.path.dirname(os.path.abspath(__file__))
WAV = os.environ["WAV"]; TAG = os.environ.get("TAG", "stem")
w = wave.open(WAV)
X = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
dur = len(X) / 16000
res = {"model": "whisper-large-v3-turbo (mlx)", "windows": {}}
a = 0.0
while a < dur:
    b = min(dur, a + 8.0)
    r = mlx_whisper.transcribe(X[int(a * 16000):int(b * 16000)], path_or_hf_repo="mlx-community/whisper-large-v3-turbo",
                               language="en", word_timestamps=True, condition_on_previous_text=False,
                               no_speech_threshold=0.9, logprob_threshold=None, compression_ratio_threshold=None, temperature=0.0)
    res["windows"][f"{a:.0f}"] = [[x["word"].strip(), round(x["start"] + a, 2), round(x["end"] + a, 2)]
                                  for sg in r["segments"] for x in sg.get("words", [])]
    if b >= dur: break
    a += 6.0
json.dump(res, open(os.path.join(HERE, f"stt-raw-turbo-{TAG}.json"), "w"), indent=0)
print(TAG, len(res["windows"]))
