"""Teacher-forced whisper log-likelihood of candidate transcripts for a short clip.
Lets us ask 'which of these written phrases does the audio support best' without a free decode echoing the lyric.
Usage: HF_HUB_OFFLINE=1 uv run --python 3.12 --with mlx-whisper python tools/score_candidates.py spec.json
spec.json: [{"name":..., "src":"stem|mix", "a":sec, "b":sec, "cands":["text", ...]}]
Prints per candidate: total logprob, per-token mean (higher = better supported).
"""
import json, sys, wave
import numpy as np
import mlx.core as mx
from mlx_whisper import load_models, audio, tokenizer

REPO = "mlx-community/whisper-large-v3-turbo"
m = load_models.load_model(REPO)
tok = tokenizer.get_tokenizer(m.is_multilingual, num_languages=m.num_languages, language="en", task="transcribe")

def load(p):
    w = wave.open(p)
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
SRC = {"stem": load("/tmp/v4/vocals16.wav"), "mix": load("/tmp/v4/song16.wav")}

def feats(src, a, b):
    x = SRC[src][int(a * 16000):int(b * 16000)]
    mel = audio.log_mel_spectrogram(x, n_mels=m.dims.n_mels, padding=audio.N_SAMPLES)
    mel = audio.pad_or_trim(mel, audio.N_FRAMES, axis=-2).astype(mx.float16)
    return m.embed_audio(mel[None])

def score(f, text):
    ids = list(tok.sot_sequence_including_notimestamps) + tok.encode(" " + text) + [tok.eot]
    n0 = len(tok.sot_sequence_including_notimestamps)
    t = mx.array([ids[:-1]])
    lg = m.logits(t, f)[0].astype(mx.float32)
    lp = lg - mx.logsumexp(lg, axis=-1, keepdims=True)
    tgt = mx.array(ids[1:])
    pick = mx.take_along_axis(lp, tgt[:, None], axis=-1)[:, 0]
    pick = np.array(pick)[n0 - 1:]
    return float(pick.sum()), float(pick.mean()), len(pick)

for spec in json.load(open(sys.argv[1])):
    f = feats(spec["src"], spec["a"], spec["b"])
    print(f"== {spec['name']} [{spec['src']} {spec['a']}-{spec['b']}]")
    rows = sorted(((score(f, c), c) for c in spec["cands"]), key=lambda r: -r[0][1])
    for (s, mean, n), c in rows:
        print(f"  {mean:7.3f} mean  {s:8.2f} sum  n={n:2d}  {c}")
