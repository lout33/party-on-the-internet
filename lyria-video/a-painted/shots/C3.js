// Section C3 (0:53.9-1:14.2), style A, party #1. C3.1/C3.2 and the first 7.9 s of the drop are the approved fragment (to 61.8 s).
// Visible here: C3.3 pull-back onto the whole room with the dot-light field, C3.4 the quiet pool round the empty chair,
// C3.5 "OH MY GOD, we found each other": one unison gasp, then time hangs.
// The party room is rebuilt in the fragment's own world coordinates (sunburst centre 860,440; window 220,250; hero 640,1040;
// chair 1430,1012; disco ball 1740,190) so the first frame of C3.3 sits on the fragment's last frame.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const TAU = Math.PI * 2;
  const WIN = { x: 220, y: 250, w: 860, h: 484 };
  const ROWS = [{ y: 1040, s: 1.2, n: 8 }, { y: 975, s: 1.06, n: 10 }, { y: 915, s: 0.94, n: 12 }, { y: 862, s: 0.84, n: 14 }, { y: 816, s: 0.74, n: 16 }, { y: 776, s: 0.66, n: 18 }];
  const LITS = ['#2fb4ff', '#d8503b', '#e5239b', '#ffd62e', '#2fb4ff', '#8be04a', '#d8503b'];
  const SPOT = { x: 650, y: 470 };
  const CAM0 = { z: 1.06, cx: 987, cy: 553 };   // fragment's last framing

  // The fragment's 78 dancers, same hashes and rows, plus a left wing that the wide shots reveal.
  function crowdList(api) {
    const out = []; let idx = 0;
    ROWS.forEach((rw, ri) => {
      for (let j = 0; j < rw.n; j++, idx++) {
        out.push({
          i: idx, row: ri, wing: false, th: 0,
          x: -20 + (j + 0.5 + (ri % 2) * 0.35) / (rw.n + 0.4) * 1330 + (api.hash(idx) - 0.5) * 30,
          y: rw.y + (api.hash(idx + 7) - 0.5) * 12, s: rw.s * (0.92 + 0.16 * api.hash(idx + 3)),
          col: Math.floor(api.hash(idx + 11) * 6.99), h: api.hash(idx + 13)
        });
      }
    });
    ROWS.forEach((rw, ri) => {
      const nw = Math.round(rw.n * 0.42);
      for (let j = 0; j < nw; j++, idx++) {
        out.push({
          i: idx, row: ri, wing: true, th: api.hash(idx + 500),
          x: -40 - (j + 0.5 + (ri % 2) * 0.35) / (rw.n + 0.4) * 1330 + (api.hash(idx) - 0.5) * 30,
          y: rw.y + (api.hash(idx + 7) - 0.5) * 12, s: rw.s * (0.92 + 0.16 * api.hash(idx + 3)),
          col: Math.floor(api.hash(idx + 11) * 6.99), h: api.hash(idx + 13)
        });
      }
    });
    out.sort((a, b) => a.y - b.y || a.i - b.i);
    return out;
  }

  function banner(c, S, kit, api, line, o) {
    if (!line) return;
    o = o || {};
    const nw = line.words.length;
    const size = 166, gap = size * 0.44, rows = nw >= 7 ? [[0, 1, 2, 3], [4, 5, 6]] : nw >= 5 ? [[0, 1, 2], [3, 4]] : [[0, 1, 2].filter(i => i < nw)];
    const appear = o.popAt === undefined ? 1 : api.ease.back(api.seg(S, o.popAt, o.popAt + 0.3));
    if (appear <= 0.001) return;
    const cx = o.cx === undefined ? 987 : o.cx, y0 = o.y0 === undefined ? 246 : o.y0;
    kit.useS(S);
    c.save();
    if (o.outAt !== undefined) c.translate(0, -720 * api.ease.in(api.seg(S, o.outAt, o.outAt + 0.7)));
    c.font = size + 'px ' + kit.FONT;
    const widths = rows.map(r => r.map(i => c.measureText(line.words[i].w).width));
    const tots = widths.map(w => w.reduce((a, b) => a + b, 0) + gap * (w.length - 1));
    const fit = Math.min(1, 1630 / Math.max(...tots));
    // ropes from the streamer line
    c.strokeStyle = kit.INK; c.lineWidth = 5; c.lineCap = 'round';
    for (const sg of [-1, 1]) {
      c.beginPath(); c.moveTo(cx + sg * tots[0] * fit * 0.46, y0 - size * 0.9); c.lineTo(cx + sg * tots[0] * fit * 0.3, -300); c.stroke();
    }
    c.translate(cx, y0 + size * 0.2); c.scale(appear, appear); c.translate(-cx, -(y0 + size * 0.2));
    rows.forEach((r, ri) => {
      let x = cx - tots[ri] * fit / 2;
      const y = y0 + ri * 179;
      r.forEach((wi, k) => {
        const w = line.words[wi], wd = widths[ri][k] * fit, px = x + wd / 2;
        x += (widths[ri][k] + gap) * fit;
        const since = S - w.s, sung = since >= 0;
        const sc = (sung ? 1 + 0.14 * Math.exp(-since * 9) : 1) * fit;
        const hop = sung ? -size * 0.2 * Math.sin(Math.PI * api.seg(S, w.s, w.s + 0.32)) : 0;
        const bb = -size * 0.05 * api.pulse(S, 6);
        const rot = (kit.h1(900 + wi * 3 + 160) - 0.5) * 0.06 + 0.02 * (wi % 2 ? 1 : -1);
        const wp = api.wordProgress(w, S);
        c.save(); c.translate(px, y + hop + bb); c.rotate(rot); c.scale(sc, sc);
        kit.letter(c, w.w, 0, 0, size, '#efe3c8', { sticker: true });
        if (wp > 0) {
          const half = widths[ri][k] / 2, lit = LITS[wi % LITS.length];
          kit.wash(c, lit, 0.35, () => kit.blob(c, 0, -size * 0.28, half * Math.min(1, wp * 2.2) * 0.9, size * 0.34, wi + 50 + 80, 4, 10));
          c.save(); c.beginPath(); c.rect(-half - 20, -size * 1.2, (half * 2 + 40) * (sung ? Math.min(1, wp * 2.2) : 0), size * 1.6); c.clip();
          c.font = size + 'px ' + kit.FONT; c.textAlign = 'center'; c.fillStyle = lit; c.fillText(w.w, 0, 0);
          c.restore();
        }
        c.restore();
      });
    });
    c.restore();
  }

  // The room, the crowd, the hero, in the fragment's world. o: { Sw, cam, lights:{lit,wave}, banner, phi, sway, chairConf, wave, reveal,
  // gasp:{G}, heroMode, pool, winBurst }
  function world(c, S, kit, api, o) {
    const { ease, seg, lerp } = api;
    const Sw = o.Sw === undefined ? S : o.Sw, M = 'party';
    const b = kit.beat(Sw), f = b - Math.floor(b), pul = Math.exp(-f * 5);
    const cam = o.cam;
    const zp = cam.z * (1 + 0.02 * pul) * (1 + (o.punch || 0));
    c.save();
    c.translate(960, 540); c.scale(zp, zp); c.rotate(o.rot || 0); c.translate(-cam.cx, -cam.cy);
    kit.useS(S);

    // wall and rotating sunburst
    c.fillStyle = '#ffd0e0'; c.fillRect(-1800, -1200, 6000, 3200);
    kit.sunburst(c, 860, 440, 0, 2800, { S: Sw, n: 22, spin: 0.28 });
    kit.glow(c, 860, 440, 650, 'rgba(255,255,255,A)', 0.55);

    // checkered floor and skirting
    kit.useS(S);
    c.fillStyle = '#fff0c8'; c.beginPath(); kit.wrect(c, -1800, 800, 6000, 1200, 1120, 3, 90); c.fill();
    const bf = Math.floor(b);
    for (let r = 0; r < 4; r++) for (let q = -12; q < 26; q++) {
      const on = ((q + r + bf) & 1) === 0;
      c.fillStyle = on ? 'rgba(255,100,170,.85)' : 'rgba(255,214,60,.8)';
      const y0 = 800 + r * r * 8 + r * 50, hh = 50 + r * 18;
      c.beginPath(); kit.wrect(c, q * 140 - 30, y0, 130 + r * 10, hh - 4, 1130 + r * 40 + q, 1.5, 70); c.fill();
    }
    kit.fillInk(c, () => kit.wrect(c, -1800, 780, 6000, 36, 1121, 2, 100), kit.K('#7c6a5a', 0.45), 3, { rim: false });

    // window onto fireworks
    const col2 = ['#2fb4ff', '#e5239b', '#ffd62e'];
    kit.window(c, WIN.x, WIN.y, WIN.w, WIN.h, {
      mode: M, S, view: 'party',
      draw: (cc, x, y, w, h) => {
        const g = cc.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2a2f7a'); g.addColorStop(1, '#e5239b');
        cc.fillStyle = g; cc.fillRect(x, y, w, h);
        for (let k = 0; k < 4; k++) {
          const ph = ((Sw * 0.5 + k * 0.25) % 1), fx = x + 140 + k * 210, fy = y + 130 + (k % 2) * 90;
          cc.strokeStyle = col2[k % 3]; cc.lineWidth = 6; cc.lineCap = 'round'; cc.globalAlpha = 1 - ph;
          for (let q = 0; q < 12; q++) { const a = q / 12 * TAU; cc.beginPath(); cc.moveTo(fx + Math.cos(a) * ph * 40, fy + Math.sin(a) * ph * 40); cc.lineTo(fx + Math.cos(a) * (ph * 80 + 20), fy + Math.sin(a) * (ph * 80 + 20)); cc.stroke(); }
          cc.globalAlpha = 1;
        }
      }
    });

    // desk side of the room (fragment shifts it 130 px right of the humanRoom layout)
    kit.rug(c, 1430, 1010, 800, { mode: M, S });
    kit.desk(c, 1140, 726, 910, { mode: M, S, mug: true });
    kit.monitor(c, 1685, 730, 270, { mode: M, S, on: 0 });
    kit.lamp(c, 1230, 722, 250, { mode: M, S, on: 0 });
    kit.shadow(c, 1430, 1012, 220, 24, 0.2);

    // the quiet pool goes behind the chair
    const pk = o.pool || 0;
    if (pk > 0) {
      const g = c.createRadialGradient(1430, 780, 30, 1430, 780, 560);
      g.addColorStop(0, `rgba(240,238,252,${0.7 * pk})`); g.addColorStop(0.5, `rgba(228,224,246,${0.42 * pk})`); g.addColorStop(1, 'rgba(228,224,246,0)');
      c.fillStyle = g; c.fillRect(800, 200, 1260, 1100);
      c.save(); c.globalCompositeOperation = 'screen';
      const lg = c.createLinearGradient(0, -100, 0, 1010); lg.addColorStop(0, `rgba(210,220,255,${0.0})`); lg.addColorStop(1, `rgba(210,220,255,${0.22 * pk})`);
      c.fillStyle = lg; c.beginPath(); c.moveTo(1380, -100); c.lineTo(1480, -100); c.lineTo(1760, 1010); c.lineTo(1100, 1010); c.closePath(); c.fill(); c.restore();
      c.save();
      for (let i = 0; i < 18; i++) {
        const px = 1250 + kit.h1(i * 3) * 360 + Math.sin(S * 0.7 + i) * 14, py = 1000 - ((kit.h1(i * 3 + 1) * 700 + S * (14 + 20 * kit.h1(i))) % 700);
        c.fillStyle = `rgba(255,255,255,${(0.2 + 0.4 * (0.5 + 0.5 * Math.sin(S * 1.3 + i * 2))) * pk})`;
        c.beginPath(); c.arc(px, py, 2 + 2 * kit.h1(i + 9), 0, TAU); c.fill();
      }
      c.restore();
    }
    kit.chair(c, 1430, 1012, 430, { mode: M, S, phi: o.phi === undefined ? 0.8 : o.phi, coat: true, confetti: o.chairConf || 0, sway: o.sway || 0 });
    if (pk > 0) {
      // a few pieces drifting down into the pool, slower than the party's own
      for (let i = 0; i < 16; i++) {
        const px = 1280 + kit.h1(i * 5 + 1) * 300 + Math.sin(S * 0.9 + i * 1.7) * 18, ty = ((kit.h1(i * 5 + 2) * 760 + S * 46) % 760);
        const py = 260 + ty;
        c.save(); c.globalAlpha = Math.min(1, ty / 80) * pk; c.translate(px, py); c.rotate(S * (1 + kit.h1(i)) + i); c.scale(1, Math.sin(S * 2.4 + i));
        c.fillStyle = kit.HOT[i % 7]; c.fillRect(-7, -4, 14, 8); c.lineWidth = 1.6; c.strokeStyle = kit.INK; c.strokeRect(-7, -4, 14, 8); c.restore();
      }
    }

    // dot-light field over the whole board
    if (o.lights && o.lights.lit > 0) kit.lights(c, -700, -150, 3300, 230, { S, mode: M, lit: o.lights.lit, wave: o.lights.wave, cell: 72, seed: 5, colors: kit.HOT.slice(0, 6) });

    // streamers
    const ns = 16;
    c.save(); c.lineCap = 'round'; c.globalAlpha = 0.9;
    for (let i = 0; i < ns; i++) {
      const x0 = (i + 0.5) / ns * 3000 - 500, ph = Sw * 2 + i;
      c.strokeStyle = kit.HOT[i % 6]; c.lineWidth = 10 + (i % 3) * 3;
      c.beginPath();
      for (let k = -5; k <= 8; k++) {
        const x = x0 + Math.sin(ph + k * 0.7) * 34 * (k / 3), y = -20 + k * (46 + 14 * (i % 3));
        k === -5 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();

    // disco ball
    c.strokeStyle = kit.INK; c.lineWidth = 4; c.beginPath(); c.moveTo(1740, -320); c.lineTo(1740, -20); c.stroke();
    kit.discoBall(c, 1740, 190 + 6 * Math.sin(Sw * 2) - 6 * Math.sin(S * 2), 78, { S: Sw, spots: true, bob: false });

    if (o.banner) banner(c, S, kit, api, o.banner, o.bannerOpt);

    // colour light on the chair
    if (!o.noChairLight) {
      const cl = kit.HOT[Math.floor(b / 2 + 4) % 3 === 0 ? 0 : (Math.floor(b / 2) % 3 === 1 ? 2 : 1)];
      kit.glow(c, 1430, 800, 420, kit.rgba(cl, 'A'), (0.14 + 0.1 * pul) * (1 - 0.8 * pk));
    }

    // the spot everyone turns to
    const gs = o.gasp, G = gs ? gs.G : 1e9;
    if (gs && S >= G) {
      const u = S - G, e = ease.back(seg(u, 0, 0.22));
      let puls = 1 + 0.06 * Math.sin(S * 14);
      for (const tw of [73.0, 73.24, 73.44]) if (S >= tw) puls += 0.18 * Math.exp(-(S - tw) * 8);
      kit.glow(c, SPOT.x, SPOT.y, 520 * e, 'rgba(255,230,140,A)', 0.55);
      c.save(); c.lineCap = 'round';
      for (let i = 0; i < 20; i++) {
        const a = TAU * i / 20 + 0.12 * Math.sin(S * 3), k = ease.out(seg(u, 0, 0.5)), r0 = 70 * e + 40, r1 = r0 + (110 + 160 * kit.h1(i + 3)) * k * (0.8 + 0.2 * Math.sin(S * 9 + i));
        c.strokeStyle = kit.HOT[i % 6]; c.lineWidth = 8; c.globalAlpha = 0.9;
        c.beginPath(); c.moveTo(SPOT.x + Math.cos(a) * r0, SPOT.y + Math.sin(a) * r0); c.lineTo(SPOT.x + Math.cos(a) * r1, SPOT.y + Math.sin(a) * r1); c.stroke();
      }
      c.restore();
      kit.star(c, SPOT.x, SPOT.y, 96 * e * puls, { col: '#ffd62e', S, spin: 0.35 });
      kit.star(c, SPOT.x, SPOT.y, 44 * e * puls, { col: '#fff6d0', S, spin: -0.5 });
      for (let i = 0; i < 6; i++) {
        const a = TAU * i / 6 + S * 0.6, d = 170 + 20 * Math.sin(S * 5 + i);
        kit.star(c, SPOT.x + Math.cos(a) * d, SPOT.y + Math.sin(a) * d * 0.8, 20 * e, { kind: 'sparkle', col: i % 2 ? '#ffffff' : '#ffe9a8', S, rot: a });
      }
    }

    // crowd
    const list = crowdList(api);
    const crowdWave = o.wave || 0;
    const stateGasp = gs && S >= G;
    for (const bn of list) {
      let vis = 1;
      if (bn.wing) { vis = ease.back(seg(o.reveal === undefined ? 1 : o.reveal, bn.th * 0.7, bn.th * 0.7 + 0.3)); if (vis <= 0.01) continue; }
      const ph = (bn.row % 2) * 0.5 - crowdWave * (bn.x - 640) * 0.0011, ff = (b + ph) - Math.floor(b + ph);
      const jump = Math.sin(Math.PI * ff) * 50.4 * bn.s;
      let sy = (1 - 0.2 * Math.exp(-ff * 9) + 0.1 * Math.sin(Math.PI * ff)) * (0.4 + 0.6 * vis);
      let look = Math.sin(b * 1.5 + bn.i) * 0.5, tilt = Math.sin(b * Math.PI + bn.h * 6) * 0.07;
      let arms = Math.min(1, Math.sin(Math.PI * ff) * 1.4), happy = ff < 0.5, mood = undefined, mouth = true, dx = 0;
      if (stateGasp) {
        const u = S - G, shock = ease.back(seg(u, 0, 0.1)), tr = kit.boil(S, bn.i + 7, 24);
        look = Math.max(-1, Math.min(1, (SPOT.x - bn.x) / 380)); tilt = 0.12 * look * shock + 0.012 * tr;
        sy = (sy * (1 + 0.16 * shock)) + 0.01 * tr; arms = 0.55 + 0.4 * shock; happy = false; mood = 'gasp'; mouth = false; dx = 1.6 * tr;
      }
      kit.cheap(c, bn.x + dx, bn.y - jump, bn.s * (0.35 + 0.65 * vis), kit.BHOT[bn.col], sy, look, tilt, {
        arms, happy, mood, mouth, antenna: bn.i % 7 === 0 ? '#ffd62e' : undefined, band: bn.i % 5 === 2 ? '#e5239b' : undefined
      });
    }

    // hero, front and centre
    {
      const hm = o.heroMode || 'dance', q = Math.sin(Math.PI * f);
      let jump = q * 100, sq = 0.22 * Math.exp(-f * 9) - 0.12 * q, mood = 'happy', look = 0, lookY = 0, tilt = Math.sin(b * Math.PI) * 0.08;
      let aL = lerp(2.0, -2.3, Math.min(1, q * 1.5)), aR = lerp(1.14, -0.84, Math.min(1, q * 1.5));
      if (hm === 'wave') aR = lerp(1.14, -0.7 + 0.55 * Math.sin(S * 14), Math.min(1, q * 1.5 + 0.35));
      if (hm === 'watch') {
        const k = ease.smooth(seg(S, o.watchAt, o.watchAt + 0.5));
        jump *= 1 - k; sq *= 1 - k; look = 0.9 * k; mood = k > 0.5 ? 'smile' : 'happy'; aL = lerp(aL, 2.0, k); aR = lerp(aR, 1.14, k); tilt *= 1 - k;
      }
      if (stateGasp) {
        const u = S - G, shock = ease.back(seg(u, 0, 0.1));
        jump = 0; sq = -0.12 * shock + 0.01 * kit.boil(S, 99, 24); mood = 'gasp'; look = 0; lookY = -1; aL = -2.3; aR = -0.84; tilt = 0.03 * kit.boil(S, 98, 24);
      }
      kit.shadow(c, 640, 1040, 90 - jump * 0.3, 14, 0.3);
      kit.bean(c, 640, 1040 - jump, 224, {
        S, seed: 11, hero: true, mood, look, lookY, band: '#ffd62e', antenna: '#ffd62e', bulb: stateGasp ? 1 : pul, sway: Math.sin(b * Math.PI),
        squash: sq, tilt, armL: aL, armR: aR
      });
    }

    // confetti
    kit.confetti(c, Sw, 17, { n: 260, x: -650, y: -330, w: 3300, h: 1620 });
    c.restore();

    // beat flash
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,240,200,${0.1 * pul})`; c.fillRect(0, 0, 1920, 1080); c.restore();
  }

  const lineFor = (api, shot) => api.lines.find(l => Math.abs(l.words[0].s - shot.t0) < 0.2);

  // ---- C3.3 pull-back --------------------------------------------------------------------------------------------------
  R('C3.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = ease.inOut(seg(S, 61.84, 64.9));
    const cam = { z: lerp(CAM0.z, 0.72, u), cx: lerp(CAM0.cx, 1000, u), cy: lerp(CAM0.cy, 603, u) };
    world(c, S, kit, api, {
      cam, banner: lineFor(api, shot), bannerOpt: { outAt: 64.1 }, heroMode: 'wave', phi: 0.8, chairConf: 0.2 + 0.2 * u,
      wave: ease.smooth(seg(S, 62.2, 63.6)), reveal: seg(S, 62.4, 64.4),
      lights: { lit: 0.25 + 0.75 * seg(S, 62.2, 64.2), wave: ease.smooth(seg(S, 62.2, 63.4)) }
    });
  });

  // ---- C3.4 the quiet pool ----------------------------------------------------------------------------------------------
  R('C3.4', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = ease.inOut(seg(S, 66.88, 70.4)), slow = seg(S, 70.4, 71.7);
    const cam = { z: lerp(0.9, 1.12, u) + 0.02 * slow, cx: lerp(760, 1330, u), cy: lerp(640, 700, u) };
    world(c, S, kit, api, {
      cam, heroMode: 'watch', watchAt: 69.5,
      phi: 0.8 + 0.14 * Math.sin((S - 66.88) * 0.9), sway: 5 * Math.sin(S * 1.3), chairConf: 0.45 + 0.55 * seg(S, 66.9, 70.5),
      wave: 0, reveal: 1, pool: ease.smooth(seg(S, 67.4, 69.4)), noChairLight: true,
      lights: { lit: 1, wave: 1 }
    });
  });

  // ---- C3.5 found each other --------------------------------------------------------------------------------------------
  R('C3.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const G = 72.44;
    // world time hangs from the gasp: the confetti, streamers and sunburst drift at a tenth of speed
    const Sw = S < G ? S : G + (S - G) * 0.1;
    const pre = ease.smooth(seg(S, 71.7, G));
    const punch = 0.1 * ease.out(seg(S, G, G + 0.3));
    const cam = { z: lerp(0.98, 1.02, pre) + 0.025 * seg(S, G, 74.16), cx: lerp(800, 760, pre), cy: lerp(720, 700, pre) };
    world(c, S, kit, api, {
      Sw, cam, punch, phi: 0.8, chairConf: 1, wave: 0, reveal: 1, gasp: { G }, heroMode: 'dance', noChairLight: S >= G,
      lights: { lit: 1, wave: S < G ? 1 : 0 }
    });
    // one white frame on the word, then paper flash fading
    const dt = S - G;
    const fl = dt < 0 ? 0 : (dt < 0.034 ? 0.9 : 0.4 * (1 - seg(dt, 0.034, 0.12)));
    if (fl > 0) { c.save(); c.fillStyle = `rgba(255,252,240,${fl})`; c.fillRect(0, 0, 1920, 1080); c.restore(); }
  });

  ['C3.1', 'C3.2'].forEach(id => R(id, (c, shot, S, t, api, kit) => { /* covered by fragment.js */ }));
})();
