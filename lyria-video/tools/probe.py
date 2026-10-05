"""Ad-hoc whisper probe: python tools/probe.py START END  (no lyric prompt). Prints word times."""
import sys, os, subprocess, numpy as np
from faster_whisper import WhisperModel
SONG = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../002-music/lyria-v4-demo/poti-v4-take-01.mp3"))
a, b = float(sys.argv[1]), float(sys.argv[2])
raw = subprocess.run(["ffmpeg","-v","error","-ss",str(a),"-t",str(b-a),"-i",SONG,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True).stdout
m = WhisperModel("small", device="cpu", compute_type="int8")
segs,_ = m.transcribe(np.frombuffer(raw,dtype=np.float32), word_timestamps=True, language="en", condition_on_previous_text=False, vad_filter=False)
print(" ".join(f"{w.word.strip()}@{w.start+a:.2f}" for s in segs for w in s.words))
