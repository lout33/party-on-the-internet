// "A retimed": the fragment-test-01 painted-stage scene (orig.js) re-run on the new song through a monotone time warp.
// orig.js keeps living in the old song's seconds; this wrapper maps new absolute S -> old absolute S.
(function () {
  'use strict';
  const KEYS = [[38.2, 45.5], [39.90, 46.98], [40.84, 47.96], [41.60, 48.96], [43.30, 51.0], [44.48, 51.34], [45.92, 52.10], [46.48, 52.74], [47.48, 54.13]];
  const OLD_ANCHOR = 54.13, OLD_BEAT = 0.5;
  let OLD = null, apiOld = null;

  function warp(S) {
    const last = KEYS[KEYS.length - 1];
    if (S >= last[0]) return last[1] + (S - last[0]);
    if (S <= KEYS[0][0]) return KEYS[0][1] + (S - KEYS[0][0]);
    for (let i = 1; i < KEYS.length; i++) {
      if (S <= KEYS[i][0]) {
        const a = KEYS[i - 1], b = KEYS[i];
        return a[1] + (b[1] - a[1]) * (S - a[0]) / (b[0] - a[0]);
      }
    }
    return S;
  }

  window.SCENE = {
    async init(api) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = '/a-painted/orig.js?v=' + Date.now();
        s.onload = res; s.onerror = () => rej(new Error('cannot load orig.js'));
        document.head.appendChild(s);
      });
      OLD = window.SCENE;
      window.SCENE = this;

      const L = api.lines;
      const mapLine = l => ({ text: l.text, approx: l.approx, words: l.words.map(w => ({ w: w.w, s: warp(w.s), e: warp(w.e) })) });
      // old idx: 0..3 same, 4 = second Yeah (new 5), 5 = first whoa (new 4), 6 = second whoa (new 6), 7 = OH MY GOD (new 7)
      const lines = [0, 1, 2, 3, 5, 4, 6, 7].map(i => mapLine(L[i]));
      const cues = { crash: 46.98, wipe: 47.96, rebuild: 48.96, countFrom: 48.96, countTo: 51.0, countValue: 1200, hush: 51.34, human: 52.10, dip: 52.74, drop: 54.13, hook2: 58.3 };
      const clamp = api.clamp, ease = api.ease;
      apiOld = Object.create(api);
      Object.assign(apiOld, {
        t0: 45.5, t1: 61.8, cues, lines, beatSec: OLD_BEAT, anchor: OLD_ANCHOR,
        beat: S => (S - OLD_ANCHOR) / OLD_BEAT,
        pulse: (S, k = 5) => { const b = (S - OLD_ANCHOR) / OLD_BEAT; return Math.exp(-(b - Math.floor(b)) * k); },
        lineAt: S => lines.find(l => S >= l.words[0].s - 0.4 && S <= l.words[l.words.length - 1].e + 0.6) || null,
        count: S => {
          if (S < cues.countFrom) return 0;
          const k = clamp((S - cues.countFrom) / (cues.countTo - cues.countFrom));
          return Math.round(Math.pow(cues.countValue, ease.smooth(k) * 0.9 + 0.1 * k));
        }
      });
      if (OLD.init) await OLD.init(apiOld);
      // Warm the system font once so the very first frame of any render process uses it too.
      const wc = document.createElement('canvas').getContext('2d');
      wc.font = '100px "Marker Felt","Chalkboard SE","Bradley Hand","Comic Sans MS",sans-serif';
      wc.fillText('Warm up the lettering 0123456789', 0, 100);
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      await new Promise(r => setTimeout(r, 300));
    },
    draw(c, S) {
      // draw begins at t0 = 38.2 -> old 45.5 so the orig's own t = S_old - 45.5 stays valid
      OLD.draw(c, warp(S), apiOld);
    }
  };
})();
