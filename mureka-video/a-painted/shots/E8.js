// Section E8 (145.0-167.45 s), new song. The bridge (beat cut, teal, near-spoken) and the first half of the final chorus.
// E8.1 keys and leavers; E8.2 plane in the drawer; E8.3 silent crowd; E8.4 the beat slams back, the judge sleeps through it;
// E8.5 the 0 lands. E8.7 / E8.8 (morning, lamp on, crowd gone) live in E9.js because they share the party room.
// All shots are new-seconds code (SHOTS_NEW); the bridge has no beat pulses, the picture is loud again from 160.5.
(function () {
  const R = (id, fn) => { window.SHOTS_NEW[id] = fn; };
  const TAU = Math.PI * 2;
  const FLOOR = 810;
  const DOOR_X = 1700;
  const MUTED = ['#d9993a', '#e99aa8', '#8cc7a1', '#f0c24a'];
  const frac = x => x - Math.floor(x);

  const zoomAbout = (c, ax, ay, z) => { c.translate(ax, ay); c.scale(z, z); c.translate(-ax, -ay); };
  function desat(c, a) {
    if (a <= 0.003) return;
    c.save(); c.globalCompositeOperation = 'saturation'; c.globalAlpha = Math.min(1, a); c.fillStyle = '#808080'; c.fillRect(0, 0, 1920, 1080); c.restore();
  }
  function darken(c, rgb, a) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${rgb},${a})`; c.fillRect(-100, -100, 2120, 1280); c.restore();
  }
  // piecewise-linear map of absolute seconds onto a 0..1 shot-local parameter
  const pw = (pts, S) => {
    if (S <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (S <= pts[i][0]) { const a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (S - a[0]) / (b[0] - a[0]); }
    return pts[pts.length - 1][1];
  };
  function motes(c, S, kit, o) {
    const { h1 } = kit;
    const n = o.n || 30, seed = o.seed || 1, a = o.alpha === undefined ? 1 : o.alpha, col = o.col || '255,236,190';
    c.save();
    for (let i = 0; i < n; i++) {
      const sp = 5 + 9 * h1(seed * 53 + i * 3 + 2);
      const px = o.x + (((h1(seed * 53 + i * 3) * o.w + S * sp + Math.sin(S * 0.6 + i) * 22) % o.w) + o.w) % o.w;
      const py = o.y + (((h1(seed * 53 + i * 3 + 1) * o.h - S * (4 + 5 * h1(i + seed)) + Math.sin(S * 0.8 + i * 2) * 14) % o.h) + o.h) % o.h;
      const tw = 0.5 + 0.5 * Math.sin(S * 1.3 + i * 1.7);
      c.fillStyle = `rgba(${col},${(0.12 + 0.3 * tw) * a})`;
      c.beginPath(); c.arc(px, py, 1.5 + 2 * h1(seed + i * 7), 0, TAU); c.fill();
    }
    c.restore();
  }
  function labBack(c, S, kit, o) {
    o = o || {};
    kit.floor(c, 'teal', { y: FLOOR });
    if (o.window !== false) {
      const w = o.window || { x: 150, y: 150, w: 420, h: 280 };
      kit.window(c, w.x, w.y, w.w, w.h, { mode: 'teal', S, view: 'night', plant: false });
      c.save(); c.globalCompositeOperation = 'screen';
      const g = c.createLinearGradient(0, w.y + w.h, 0, FLOOR + 120);
      g.addColorStop(0, 'rgba(150,200,215,.10)'); g.addColorStop(1, 'rgba(150,200,215,0)');
      c.fillStyle = g; c.beginPath();
      c.moveTo(w.x, w.y + w.h + 30); c.lineTo(w.x + w.w, w.y + w.h + 30); c.lineTo(w.x + w.w + 260, FLOOR + 120); c.lineTo(w.x + 80, FLOOR + 120); c.closePath(); c.fill();
      c.restore();
    }
  }
  function doorWithSpill(c, S, kit, open, glowK) {
    const dx = DOOR_X, s = 430;
    c.save(); c.globalCompositeOperation = 'screen';
    c.translate(dx - 130, FLOOR + 60); c.scale(3.4, 0.5);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 230);
    g.addColorStop(0, `rgba(255,214,130,${0.34 * glowK})`); g.addColorStop(1, 'rgba(255,214,130,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 230, 0, TAU); c.fill();
    c.restore();
    kit.door(c, dx, FLOOR + 6, s, { mode: 'teal', S, open, glow: true });
  }

  // ---- E8.1 (145.0-150.4): the keys lie still, the others leave ---------------------------------------------
  const LEAVERS = [
    { x0: 1380, col: '#d9993a', sz: 150 }, { x0: 1240, col: '#d9728a', sz: 156 }, { x0: 1100, col: '#8cc7a1', sz: 146 },
    { x0: 980, col: '#ecc87c', sz: 152 }, { x0: 860, col: '#5aa7a3', sz: 148 }
  ];
  const KEYS_T = 146.11, OTHERS_T = 148.17;
  R('E8.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp, clamp } = api;
    c.save();
    zoomAbout(c, 960, 640, 1 + 0.045 * ease.inOut(t));
    labBack(c, S, kit);
    kit.lights(c, 40, 30, 1840, 100, { mode: 'teal', S, cell: 105, lit: lerp(0.32, 0, ease.in(seg(S, 145.0, 148.6))), wave: 0, colors: MUTED, seed: 3 });
    doorWithSpill(c, S, kit, 0.88, 1);
    LEAVERS.forEach((L, i) => {
      const u = S - (OTHERS_T + 0.17 * i);
      const dur = 2.0 - 0.1 * i;
      const x = L.x0 + (DOOR_X - L.x0) * clamp(u / dur);
      const moving = u > 0 && x < DOOR_X - 4;
      const fade = 1 - seg(x, 1610, 1690);
      if (fade <= 0.01) return;
      c.save(); c.globalAlpha = fade;
      kit.bean(c, x, FLOOR + 34, L.sz * (1 - 0.18 * seg(x, 1500, 1690)), {
        body: L.col, S, seed: 20 + i, mood: 'flat', look: 0.9, drain: 0.45, walk: moving, arm: 'down', bulb: 0.1,
        squash: moving ? 0.03 * Math.sin(S * 11 + i) : 0
      });
      c.restore();
    });
    // fourteen keys, dropped and left; a glint runs along them as the line is sung
    for (let i = 0; i < 14; i++) {
      const kx = 610 + i * 66 + (kit.h1(i * 3 + 11) - 0.5) * 36;
      const ky = 850 + ((i * 5) % 4) * 14 + (kit.h1(i * 7 + 3) - 0.5) * 12;
      const rot = (kit.h1(i * 13 + 5) - 0.5) * 2.6;
      kit.shadow(c, kx + 6, ky + 12, 34, 7, 0.28);
      kit.keyGlyph(c, kx, ky, 74 + kit.h1(i * 5) * 16, { rot, color: kit.K('#e8b44a', 0.28), S });
      const gi = (S - KEYS_T) / 0.075 - i;
      if (gi > 0 && gi < 5) kit.star(c, kx + 24, ky - 10, 20 * (1 - gi / 5) + 4, { kind: 'sparkle', S, col: '#fff0b0' });
    }
    const idle = Math.floor(S * 1.4 + 0.5);
    const ki = Math.floor(kit.h1(idle * 7 + 1) * 14);
    if (S > KEYS_T + 1.4) kit.star(c, 600 + ki * 66 + 28, 826, 11 * (0.5 + 0.5 * Math.sin(S * 1.4 * TAU / 2)), { kind: 'sparkle', S, col: '#fff0b0', twinkle: 1 });
    kit.bean(c, 380, 890, 250, {
      hero: true, S, seed: 55, mood: 'worry', look: lerp(0.35, 0.95, ease.inOut(seg(S, OTHERS_T - 0.3, OTHERS_T + 1.2))),
      lookY: 0.7 * ease.inOut(seg(S, KEYS_T - 0.3, KEYS_T + 0.2)) * (1 - ease.inOut(seg(S, OTHERS_T - 0.4, OTHERS_T))),
      tilt: 0.02 * Math.sin(S * 1.1), arm: 'down', squash: -0.012 * Math.sin(S * 1.7), drain: 0.1, bulb: 0.15
    });
    motes(c, S, kit, { x: 0, y: 150, w: 1920, h: 650, n: 28, seed: 2, alpha: 0.7 });
    c.restore();
    darken(c, '165,190,205', 0.35);
    desat(c, 0.92 * (1 - ease.out(seg(S, 145.0, 145.4))));
  });

  // ---- E8.2 (150.4-156.0): the paper plane, held, put back on "task" -------------------------------------------
  const E82 = [[150.4, 0], [150.7, 0.06], [151.4, 0.24], [151.6, 0.3], [152.2, 0.44], [154.0, 0.6], [154.8, 0.74], [155.0, 0.8], [155.7, 0.95], [156.0, 1]];
  R('E8.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = pw(E82, S);
    const DX = 341, DY = 567;
    const HX = 1330, HY = 860, HS = 300, s = HS / 88;
    c.save();
    zoomAbout(c, 1130, 640, 1 + 0.05 * ease.inOut(t));
    labBack(c, S, kit, { window: { x: 400, y: 120, w: 420, h: 260 } });
    doorWithSpill(c, S, kit, 0.32, 0.8);
    const drawer = 1 - ease.inOut(seg(u, 0.8, 0.95));
    kit.desk(c, DX, DY, 910, { mode: 'teal', S, open: drawer, mug: true });
    kit.lamp(c, DX + 90, DY, 200, { mode: 'teal', S, on: 0 });
    const hand = a => ({ x: HX - s * (29 + 34 * Math.cos(a)), y: HY + s * (-44 + 34 * Math.sin(a)) });
    const AG = -0.6;
    const rest = hand(AG);
    let aR, holding = false;
    if (u < 0.06) aR = 1.14;
    else if (u < 0.24) aR = lerp(1.14, AG, ease.inOut(seg(u, 0.06, 0.24)));
    else if (u < 0.3) aR = AG;
    else if (u < 0.44) aR = lerp(AG, 2.4, ease.inOut(seg(u, 0.3, 0.44)));
    else if (u < 0.6) { holding = true; aR = 2.4; }
    else if (u < 0.74) aR = lerp(2.4, AG + 0.25, ease.inOut(seg(u, 0.6, 0.74)));
    else aR = lerp(AG + 0.25, 1.14, ease.inOut(seg(u, 0.78, 0.9)));
    const lEnd = holding ? 0.76 : lerp(2.0, 0.76, ease.inOut(seg(u, 0.3, 0.44)) - ease.inOut(seg(u, 0.62, 0.74)));
    const h = hand(aR);
    const heldPos = { x: HX, y: HY - 0.45 * HS };
    const peek = { x: rest.x, y: rest.y - 26 };
    const inDrawer = { x: rest.x + 4, y: rest.y + 6 };
    let px, py, pr;
    const bob = Math.sin(S * 2.6) * 1.5;
    if (u < 0.3) {
      const lift = ease.out(seg(u, 0.0, 0.22));
      px = peek.x; py = lerp(inDrawer.y, peek.y, lift) + bob * (1 - seg(u, 0.24, 0.3)); pr = lerp(-0.2, -0.95, lift);
    } else if (u < 0.6) {
      const k = ease.inOut(seg(u, 0.3, 0.44));
      px = lerp(h.x, heldPos.x, holding ? 1 : 0); py = lerp(h.y, heldPos.y, holding ? 1 : 0);
      if (!holding) { px = h.x; py = h.y; }
      pr = lerp(-0.95, -0.25, k) + (holding ? 0.03 * Math.sin(S * 3) : 0);
    } else if (u < 0.74) {
      const k = ease.inOut(seg(u, 0.6, 0.74));
      px = lerp(heldPos.x, h.x, k); py = lerp(heldPos.y, h.y, k); pr = lerp(-0.25, -0.9, k);
    } else {
      const k = ease.in(seg(u, 0.74, 0.86));
      px = rest.x; py = lerp(peek.y, inDrawer.y, k); pr = lerp(-0.9, -0.2, k);
    }
    const drawPlane = () => {
      c.save();
      if (u >= 0.74) {
        const Lx = DX + (1714 - 1010) - 150 * drawer, top = DY + (770 - 726) - 4;
        c.beginPath(); c.rect(-200, -200, 2400, 1600); c.rect(Lx, top, 182, 76); c.clip('evenodd');
      }
      kit.plane(c, px, py, 120, { S, rot: pr, fold: 1, color: kit.K('#fbf3dc', 0.18) });
      c.restore();
    };
    if (!holding) drawPlane();
    const away = seg(u, 0.52, 0.64);
    kit.bean(c, HX, HY, HS, {
      hero: true, S, seed: 55, flip: true, mood: u < 0.5 ? 'worry' : 'flat',
      look: lerp(0.85, -0.7, ease.inOut(away)), drain: 0.1,
      arm: holding ? 'hold' : ['down', 'point'],
      armR: aR, armL: lEnd, sway: 0.4 * Math.sin(S * 1.1), bulb: 0.15,
      squash: -0.012 * Math.sin(S * 1.7)
    });
    if (holding) drawPlane();
    motes(c, S, kit, { x: 0, y: 150, w: 1920, h: 650, n: 26, seed: 6, alpha: 0.7 });
    c.restore();
    darken(c, '165,190,205', 0.3);
  });

  // ---- E8.3 (156.0-160.5): twelve hundred of us, silent in the dark, facing the empty chair ----------------------
  R('E8.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    c.save();
    zoomAbout(c, 1500, 640, 1 + 0.08 * ease.inOut(t));
    kit.floor(c, 'teal', { y: 700 });
    kit.window(c, 1280, 90, 440, 250, { mode: 'teal', S, view: 'night', plant: false });
    kit.tag(c, 560, 40, 1200, { mode: 'teal', S, scale: 0.8, rot: 0.03 * Math.sin(S * 1.2) });
    kit.crowd(c, {
      x: -10, y: 660, w: 1240, h: 200, rows: 7, n: 230, seed: 8, S, mood: 'flat', target: { x: 1500 }, scale: 1.3, bounce: 0, drain: 0.55, antennas: 0.08,
      reveal: ease.smooth(seg(S, 156.2, 157.7))
    });
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createLinearGradient(0, 0, 1500, 0);
    g.addColorStop(0, 'rgb(70,96,114)'); g.addColorStop(0.6, 'rgb(130,160,175)'); g.addColorStop(1, 'rgb(255,255,255)');
    c.fillStyle = g; c.fillRect(-100, -100, 2120, 1280); c.restore();
    c.save(); c.globalCompositeOperation = 'screen';
    c.fillStyle = 'rgba(170,205,220,.10)'; c.beginPath();
    c.moveTo(1380, 430); c.lineTo(1620, 430); c.lineTo(1880, 840); c.lineTo(1190, 840); c.closePath(); c.fill(); c.restore();
    kit.glow(c, 1520, 620, 330, 'rgba(190,220,230,A)', 0.22);
    kit.shadow(c, 1520, 744, 110, 14, 0.3);
    kit.lamp(c, 1750, 734, 170, { mode: 'teal', S, on: 0 });
    kit.chair(c, 1520, 744, 250, { mode: 'teal', S, phi: 0.45 + 0.05 * Math.sin(S * 0.8), sway: 3 * Math.sin(S * 1.2), coat: true });
    motes(c, S, kit, { x: 1250, y: 300, w: 560, h: 520, n: 26, seed: 9, alpha: 1.1, col: '200,230,240' });
    c.restore();
    darken(c, '175,198,210', 0.25);
  });

  // ---- E8.4 (160.5-164.3): the beat slams back; the judge sleeps through the party --------------------------------
  const SLAM = 160.5;
  R('E8.4', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const { fillInk, wrect, blob, K } = kit;
    const W = window.W4H, u = S - SLAM, hitK = Math.exp(-u * 9), flashK = Math.exp(-u * 24);
    const pul = api.pulse(S, 6), b = api.beat(S);
    const wood = K('#a8774a', 0.05), woodD = K('#7a5434', 0.05);
    c.save();
    c.translate(960, 520); const zz = (1 + 0.1 * ease.inOut(t)) * (1 + 0.12 * hitK + 0.012 * pul); c.scale(zz, zz); c.rotate(0.03 * hitK * Math.sin(u * 40)); c.translate(-960, -520);
    kit.sunburst(c, 960, 460, 0, 2400, { S, n: 22, spin: 0.28 });
    kit.floor(c, 'party', { y: 830 });
    // streamers from the top
    c.save(); c.lineCap = 'round'; c.globalAlpha = 0.92;
    for (let i = 0; i < 14; i++) {
      const x0 = (i + 0.5) / 14 * 2100 - 90, ph = S * 2 + i * 1.3;
      c.strokeStyle = kit.HOT[i % 6]; c.lineWidth = 10 + (i % 3) * 3;
      c.beginPath(); c.moveTo(x0, -20);
      for (let k = 1; k <= 8; k++) c.lineTo(x0 + Math.sin(ph + k * 0.7) * 34 * (k / 3), -20 + k * (46 + 14 * (i % 3)));
      c.stroke();
    }
    c.restore();
    // the score board still says 1,200
    kit.tag(c, 250, 36, 1200, { mode: 'party', S, scale: 0.6 });
    kit.discoBall(c, 1730, 200, 66, { S: W.gS(api, S), spots: false });
    // panelled wall behind the bench
    fillInk(c, () => wrect(c, 330, 120, 1260, 720, 4100, 2, 100), K('#c7966a', 0.05), 3.6);
    c.strokeStyle = 'rgba(30,20,20,.22)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let x = 440; x < 1590; x += 110) { c.beginPath(); c.moveTo(x, 135); c.lineTo(x + (kit.h1(x) - 0.5) * 4, 830); c.stroke(); }
    // colour pops on the wood: coloured spots wandering over it
    for (let k = 0; k < 6; k++) {
      const a = S * 0.55 + k * 1.05, col = kit.HOT[k % 6];
      kit.glow(c, 960 + Math.cos(a) * 560, 380 + Math.sin(a * 1.3 + k) * 190, 190, kit.rgba(col, 'A'), 0.34 * (0.6 + 0.4 * pul));
    }
    // scales on the wall, never adjusting
    const sw = 0.03 * Math.sin(S * 0.9);
    c.save(); c.translate(960, 250); c.rotate(sw);
    c.strokeStyle = kit.INK; c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(-120, 0); c.lineTo(120, 0); c.moveTo(0, -60); c.lineTo(0, 0); c.stroke();
    c.lineWidth = 6; c.strokeStyle = K('#e8c88a', 0.05); c.beginPath(); c.moveTo(-120, 0); c.lineTo(120, 0); c.moveTo(0, -60); c.lineTo(0, 0); c.stroke();
    for (const sg of [-1, 1]) {
      c.save(); c.translate(sg * 120, 0); c.rotate(-sw);
      c.lineWidth = 3; c.strokeStyle = kit.INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, 62); c.moveTo(0, 0); c.lineTo(40, 62); c.stroke();
      fillInk(c, () => blob(c, 0, 66, 52, 10, 4110 + sg, 0.8, 10), K('#e8c88a', 0.05), 2.8);
      c.restore();
    }
    c.restore();
    // wall clock, second hand ticking
    fillInk(c, () => blob(c, 560, 300, 54, 54, 4120, 1.2, 16), K('#efe6cf', 0.05), 3.4);
    c.strokeStyle = kit.INK; c.lineCap = 'round'; c.lineWidth = 4.5;
    c.beginPath(); c.moveTo(560, 300); c.lineTo(580, 284); c.moveTo(560, 300); c.lineTo(556, 336); c.stroke();
    c.lineWidth = 2.4; c.strokeStyle = '#a2402c'; const sa = (S % 3) / 3 * TAU - Math.PI / 2;
    c.beginPath(); c.moveTo(560, 300); c.lineTo(560 + Math.cos(sa) * 44, 300 + Math.sin(sa) * 44); c.stroke();

    // the judge, asleep behind the bench
    const jx = 960, jy = 710, js = 200;
    const breathe = 0.03 * Math.sin(S * 1.9);
    const rock = -5 * pul;
    c.save(); c.translate(0, rock);
    kit.bean(c, jx, jy, js, {
      body: '#d9993a', S, seed: 71, mood: 'asleep', arm: 'down', tilt: 0.085 * Math.sin(S * 1.2 + 0.6), squash: breathe,
      acc: { cape: '#1d1b26', glasses: true }, drain: 0.0, bulb: 0
    });
    c.save(); c.translate(jx, jy); c.rotate(0.085 * Math.sin(S * 1.2 + 0.6));
    const wig = '#f6efdc';
    fillInk(c, () => blob(c, 0, -js * 0.93, js * 0.4, js * 0.17, 4130, 0.8, 12), wig, 2.8);
    for (const sg of [-1, 1]) for (let q = 0; q < 3; q++) {
      fillInk(c, () => blob(c, sg * js * (0.4 - q * 0.03), -js * (0.78 - q * 0.17), js * 0.1, js * 0.1, 4131 + q + (sg > 0 ? 5 : 0), 0.8, 9), wig, 2.6, { rim: false });
    }
    c.restore();
    kit.zzz(c, jx + 130, jy - js - 40, 95, { S, alpha: 0.95 });

    // the bench shakes with the bass; the gavel hops, the judge does not wake
    fillInk(c, () => wrect(c, 440, 520, 150, 310, 4140, 1.4, 60), woodD, 3.6);
    fillInk(c, () => wrect(c, 1330, 520, 150, 310, 4141, 1.4, 60), woodD, 3.6);
    fillInk(c, () => wrect(c, 560, 636, 800, 194, 4142, 1.4, 60), wood, 3.8);
    fillInk(c, () => wrect(c, 540, 612, 840, 40, 4143, 1.4, 60), K('#d4a572', 0.05), 3.8);
    c.strokeStyle = 'rgba(30,20,20,.22)'; c.lineWidth = 3;
    for (let x = 700; x < 1360; x += 150) { c.beginPath(); c.moveTo(x, 664); c.lineTo(x, 826); c.stroke(); }
    fillInk(c, () => wrect(c, 880, 700, 160, 44, 4144, 1, 40), K('#f0dfae', 0.05), 2.8);
    for (let q = 0; q < 3; q++) fillInk(c, () => wrect(c, 650 + q * 3, 590 - q * 9, 120, 24, 4150 + q, 0.8, 30), K('#f6efd8', 0.05), 2.6, { rim: false });
    const hop = 22 * Math.exp(-frac(b) * 7);
    c.save(); c.translate(0, -hop); c.rotate(-0.1 * Math.exp(-frac(b) * 7));
    fillInk(c, () => wrect(c, 1180, 598, 120, 14, 4160, 0.6, 30), K('#d4a572', 0.05), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1140, 570, 52, 44, 4161, 0.8, 30), K('#9a6b3a', 0.05), 3);
    c.restore();
    c.restore();
    kit.shadow(c, 960, 836, 440, 20, 0.28);

    // the crowd cheers on both sides of the bench, in front of the wall
    const list = W.crowdList(api, [{ y: 800, s: 1.35, n: 4 }, { y: 845, s: 1.55, n: 4 }, { y: 888, s: 1.75, n: 3 }], -40, 330, 7000)
      .concat(W.crowdList(api, [{ y: 800, s: 1.35, n: 4 }, { y: 845, s: 1.55, n: 4 }, { y: 888, s: 1.75, n: 3 }], 1590, 1960, 7500));
    W.drawCrowd(c, api, kit, list, { bS: S, S, energy: 1, arms: 'beat' });
    kit.confetti(c, S, 17, { n: 90 + Math.round(90 * hitK), x: -100, y: -110, w: 2120, h: 1300 });
    motes(c, S, kit, { x: 330, y: 160, w: 1260, h: 660, n: 12, seed: 12, alpha: 0.4 });
    c.restore();
    if (flashK > 0.01) { c.fillStyle = `rgba(255,250,236,${0.8 * flashK})`; c.fillRect(0, 0, 1920, 1080); }
  });

  // ---- E8.5 (164.3-167.45): "Zero": the 0 lands, the crowd cheers it, arms up on the held yeah ------------------------
  const ZERO = 164.3, YEAH = 166.13;
  R('E8.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const W = window.W4H, u = S - ZERO, hitK = Math.exp(-u * 8), flashK = Math.exp(-u * 24);
    const held = ease.out(seg(S, YEAH, YEAH + 0.25));
    const pul = api.pulse(S, 6);
    c.save();
    c.translate(960, 500); const zz = (1 + 0.05 * ease.out(t) + 0.04 * held) * (1 + 0.1 * hitK); c.scale(zz, zz); c.translate(-960, -500);
    c.translate(18 * hitK * Math.sin(u * 90), 12 * hitK * Math.cos(u * 77));
    kit.sunburst(c, 960, 330, 0, 2400, { S, n: 20, spin: 0.2, alpha: 0.5, colors: ['rgba(229,35,155,.28)', 'rgba(255,214,46,.2)'] });
    kit.glow(c, 960, 330, 760, 'rgba(255,210,120,A)', 0.3 + 0.12 * held);
    // the zero, hung from a nail up top
    const sc = lerp(4.0, 2.5, ease.back(seg(u, 0, 0.3))) * (1 + 0.025 * Math.sin((S - YEAH) * 5) * held);
    const swing = 0.2 * Math.exp(-u * 3.2) * Math.sin(u * 11);
    c.save(); c.translate(960, 40 - 10 * hitK);
    kit.tag(c, 0, 0, 0, { mode: 'ink', S, scale: sc, rot: swing, raw: '0' });
    c.restore();
    // hot-coloured ring on the hit
    c.save(); c.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const a = TAU * i / 24, k = ease.out(Math.min(1, u / 0.55));
      if (k >= 1) break;
      c.strokeStyle = kit.HOT[i % 6]; c.lineWidth = 9; c.globalAlpha = 1 - k;
      const r0 = 300 + 520 * k;
      c.beginPath(); c.moveTo(960 + Math.cos(a) * r0, 330 + Math.sin(a) * r0 * 0.7); c.lineTo(960 + Math.cos(a) * (r0 + 70), 330 + Math.sin(a) * (r0 + 70) * 0.7); c.stroke();
    }
    c.restore();
    // floor line and the crowd
    kit.useS(S);
    c.fillStyle = '#241f2b'; c.beginPath(); kit.wrect(c, -60, 800, 2040, 400, 1120, 3, 90); c.fill();
    const rows = [{ y: 745, s: 1.0, n: 20 }, { y: 785, s: 1.15, n: 18 }, { y: 825, s: 1.35, n: 14 }, { y: 862, s: 1.55, n: 13 }, { y: 898, s: 1.75, n: 12 }];
    const list = W.crowdList(api, rows, -60, 1980, 5000);
    W.drawCrowd(c, api, kit, list, { bS: S, S, energy: lerp(1, 0.45, held), arms: held > 0.01 ? lerp(0.0, 1, held) : 'beat', look: 0 });
    // the hero in the middle with the split face, arms up on the long note
    const ff = frac(api.beat(S)), jump = (Math.sin(Math.PI * ff) * 70) * (1 - 0.5 * held);
    kit.bean(c, 960, 905 - jump, 240, {
      hero: true, S, seed: 55, mood: u < 1.2 ? 'grin' : 'split', look: 0, arm: held > 0.2 ? 'up' : ['up', 'down'], bulb: Math.exp(-ff * 4),
      squash: 0.2 * Math.exp(-ff * 9) - 0.1 * Math.sin(Math.PI * ff), tilt: 0.06 * Math.sin(api.beat(S) * Math.PI)
    });
    kit.confetti(c, S, 23, { n: 110, x: -100, y: -110, w: 2120, h: 1300 });
    c.restore();
    if (flashK > 0.01) { c.fillStyle = `rgba(255,250,236,${0.85 * flashK})`; c.fillRect(0, 0, 1920, 1080); }
  });
})();
