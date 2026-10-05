// Shared scene builder for both full-song styles.
// A style's scene.js calls: window.SCENE = window.makeShotScene({ folder: 'a-painted' });
// It loads <folder>/kit.js (window.KIT), <folder>/shots/<SECTION>.js (window.SHOTS[id]) and the built
// fragment <folder>/fragment.js (the approved 45.5-61.8 s scene from fragment-test-01-drop, used as is).
// Outside the fragment window the shot for song time S is drawn, then the lyric caption.
window.makeShotScene = function makeShotScene({ folder }) {
  const load = src => new Promise(res => {
    const s = document.createElement('script');
    s.src = `${src}?v=${Date.now()}`;
    s.onload = res;
    s.onerror = () => { console.warn('missing', src); res(); };
    document.head.appendChild(s);
  });
  let shots = [], frag = null, fragApi = null, KIT = null;

  return {
    async init(api) {
      const doc = await (await fetch('/shots.json')).json();
      shots = doc.shots;
      window.__shotList = shots;
      window.SHOTS = {};
      await load(`/${folder}/kit.js`);
      KIT = window.KIT;
      await Promise.all([...new Set(shots.map(s => s.section))].map(id => load(`/${folder}/shots/${id}.js`)));

      // the built fragment: it expects its own local timing (t0, cues, lines, count)
      const ft = api.timing.fragment;
      await load(`/${folder}/fragment.js`);
      const fragScene = window.SCENE_FRAGMENT || window.SCENE;
      if (fragScene && fragScene.draw && ft) {
        const { clamp, ease } = api;
        fragApi = Object.assign(Object.create(api), {
          t0: ft.t0, t1: ft.t1, cues: ft.cues, lines: ft.lines,
          timing: Object.assign({}, api.timing, { t0: ft.t0, t1: ft.t1, cues: ft.cues, lines: ft.lines }),
          lineAt: S => ft.lines.find(l => S >= l.words[0].s - 0.4 && S <= l.words[l.words.length - 1].e + 0.6) || null,
          count: S => {
            const c = ft.cues, k = clamp((S - c.countFrom) / (c.countTo - c.countFrom));
            if (S < c.countFrom) return 0;
            return Math.round(Math.pow(c.countValue, ease.smooth(k) * 0.9 + 0.1 * k));
          }
        });
        if (fragScene.init) await fragScene.init(fragApi);
        frag = { t0: ft.t0, t1: ft.t1, scene: fragScene };
      }
      window.SCENE_FRAGMENT = null;
    },
    draw(ctx, S, api) {
      if (frag && S >= frag.t0 && S < frag.t1) { frag.scene.draw(ctx, S, fragApi); return; }
      const shot = shots.find(sh => S >= sh.t0 && S < sh.t1) || shots[shots.length - 1];
      const t = Math.min(1, Math.max(0, (S - shot.t0) / (shot.t1 - shot.t0)));
      KIT.frame(ctx, shot.mode);
      ctx.save();
      if (window.SHOTS[shot.id]) window.SHOTS[shot.id](ctx, shot, S, t, api, KIT);
      else {
        const P = KIT.MODES[shot.mode] || KIT.MODES.day;
        ctx.fillStyle = P.ink; ctx.textAlign = 'center'; ctx.font = '700 90px Menlo, monospace';
        ctx.fillText(shot.id, 960, 510); ctx.font = '400 40px Menlo, monospace'; ctx.fillText('(not drawn yet)', 960, 580);
      }
      ctx.restore();
      KIT.caption(ctx, api.lineAt(S), S, api, shot.mode);
    }
  };
};
