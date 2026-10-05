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
  let shots = [], frag = null, fragApi = null, KIT = null, v4 = {};

  // A shot with `from: "<v4 shot id>"` re-plays that v4 shot's code through a piecewise-linear time warp.
  // `keys` = [[newS, v4S], ...] ascending in both; default maps [t0,t1] onto the v4 shot's [t0,t1].
  // Outside the keys the slope is 1. Put keys on beat boundaries (new 0.5 s grid <-> v4 0.5108 grid) so beat pulses stay on the song's beat.
  const warpTo = (keys, S) => {
    if (S <= keys[0][0]) return keys[0][1] + (S - keys[0][0]);
    for (let i = 1; i < keys.length; i++) {
      if (S <= keys[i][0]) { const a = keys[i - 1], b = keys[i]; return a[1] + (b[1] - a[1]) * (S - a[0]) / (b[0] - a[0]); }
    }
    const l = keys[keys.length - 1];
    return l[1] + (S - l[0]);
  };

  return {
    async init(api) {
      const doc = await (await fetch('/shots.json')).json();
      shots = doc.shots;
      try { (await (await fetch('/shots-v4.json')).json()).shots.forEach(x => { v4[x.id] = x; }); } catch (e) { console.warn('no shots-v4.json'); }
      window.__shotList = shots;
      window.SHOTS = {}; window.SHOTS_NEW = {}; window.SHOTKEYS = window.SHOTKEYS || {};
      await load(`/${folder}/kit.js`);
      KIT = window.KIT;
      await Promise.all([...new Set(shots.flatMap(s => [s.section, s.from ? s.from.split('.')[0] : s.section]))].map(id => load(`/${folder}/shots/${id}.js`)));

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
      if (window.SHOTS_NEW && window.SHOTS_NEW[shot.id]) window.SHOTS_NEW[shot.id](ctx, shot, S, t, api, KIT);
      else if (shot.from && v4[shot.from] && window.SHOTS[shot.from]) {
        const old = v4[shot.from];
        const keys = shot.keys || (window.SHOTKEYS && window.SHOTKEYS[shot.id]) || [[shot.t0, old.t0], [shot.t1, old.t1]];
        const So = warpTo(keys, S), to = Math.min(1, Math.max(0, (So - old.t0) / (old.t1 - old.t0)));
        window.SHOTS[shot.from](ctx, old, So, to, api, KIT);
      }
      else if (window.SHOTS[shot.id]) window.SHOTS[shot.id](ctx, shot, S, t, api, KIT);
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
