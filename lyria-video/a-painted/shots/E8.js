// Section E8 (2:40-3:02), the morning after. The beat is gone: colours drain back to the A0 teal, then morning gold.
// E8.1 keys + leavers; E8.2 plane in the drawer; E8.3 silent crowd; E8.4 sleeping judge; E8.5 the 0; E8.6 two beans clap;
// E8.7 window turns gold; E8.8 lamp on, empty chair, fade (rhymes with A0.1).
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const TAU = Math.PI * 2;
  const FLOOR = 810;
  const DOOR_X = 1700;
  const MUTED = ['#d9993a', '#e99aa8', '#8cc7a1', '#f0c24a'];

  const zoomAbout = (c, ax, ay, z) => { c.translate(ax, ay); c.scale(z, z); c.translate(-ax, -ay); };
  // colours leaving: a full-frame saturation pass (no ctx.filter)
  function desat(c, a) {
    if (a <= 0.003) return;
    c.save(); c.globalCompositeOperation = 'saturation'; c.globalAlpha = Math.min(1, a); c.fillStyle = '#808080'; c.fillRect(0, 0, 1920, 1080); c.restore();
  }
  function darken(c, rgb, a) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${rgb},${a})`; c.fillRect(-100, -100, 2120, 1280); c.restore();
  }
  // slow drifting dust in a box
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
  // the lab floor with a window of night on the wall: shared by the teal lab shots
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

  // ---- E8.1: the keys lie still, the others leave ------------------------------------------------------
  const LEAVERS = [
    { x0: 1380, s: 0.0, v: 300, col: '#d9993a', sz: 150 }, { x0: 1240, s: 0.1, v: 340, col: '#d9728a', sz: 156 },
    { x0: 1100, s: 0.3, v: 400, col: '#8cc7a1', sz: 146 }, { x0: 980, s: 0.5, v: 450, col: '#ecc87c', sz: 152 },
    { x0: 860, s: 0.7, v: 480, col: '#5aa7a3', sz: 148 }
  ];
  R('E8.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, ts = S - shot.t0;
    c.save();
    zoomAbout(c, 960, 640, 1 + 0.045 * ease.inOut(t));
    labBack(c, S, kit);
    // the leftover string lights go out one by one
    kit.lights(c, 40, 30, 1840, 100, { mode: 'teal', S, cell: 105, lit: lerp(0.32, 0, ease.in(seg(t, 0, 0.85))), wave: 0, colors: MUTED, seed: 3 });
    doorWithSpill(c, S, kit, 0.88, 1);
    // the others walk to the door and step into the light
    LEAVERS.forEach((L, i) => {
      const u = Math.max(0, ts - L.s);
      const x = Math.min(DOOR_X, L.x0 + L.v * (u - 0.2 * (1 - Math.exp(-u / 0.2))));
      const moving = u > 0 && x < DOOR_X - 4;
      const fade = 1 - seg(x, 1610, 1690);
      if (fade <= 0.01) return;
      c.save(); c.globalAlpha = fade;
      kit.bean(c, x, FLOOR + 34, L.sz * (1 - 0.18 * seg(x, 1500, 1690)), {
        body: L.col, S, seed: 20 + i, mood: 'flat', look: 0.9, drain: 0.45, walk: moving, arm: 'down',
        squash: moving ? 0.03 * Math.sin(S * 11 + i) : 0
      });
      c.restore();
    });
    // fourteen keys, dropped and left
    for (let i = 0; i < 14; i++) {
      const kx = 610 + i * 66 + (kit.h1(i * 3 + 11) - 0.5) * 36;
      const ky = 850 + ((i * 5) % 4) * 14 + (kit.h1(i * 7 + 3) - 0.5) * 12;
      const rot = (kit.h1(i * 13 + 5) - 0.5) * 2.6;
      kit.shadow(c, kx + 6, ky + 12, 34, 7, 0.28);
      kit.keyGlyph(c, kx, ky, 74 + kit.h1(i * 5) * 16, { rot, color: kit.K('#e8b44a', 0.28), S });
    }
    const tw = Math.floor(S * 1.4 + 0.5);
    const ki = Math.floor(kit.h1(tw * 7 + 1) * 14);
    kit.star(c, 600 + ki * 66 + 28, 826, 11 * (0.5 + 0.5 * Math.sin(S * 1.4 * TAU / 2)), { kind: 'sparkle', S, col: '#fff0b0', twinkle: 1 });
    // the hero stays, looking after the last of them
        kit.bean(c, 380, 890, 250, {
      hero: true, S, seed: 55, mood: 'worry', look: lerp(0.9, 0.35, ease.inOut(seg(t, 0.55, 1))), tilt: 0.02 * Math.sin(S * 1.1),
      arm: 'down', squash: -0.012 * Math.sin(S * 1.7), drain: 0.1
    });
    motes(c, S, kit, { x: 0, y: 150, w: 1920, h: 650, n: 28, seed: 2, alpha: 0.7 });
    c.restore();
    darken(c, '165,190,205', 0.35);
    desat(c, 0.92 * (1 - ease.out(seg(t, 0.0, 0.4))));
  });

  // ---- E8.2: the paper plane, held, put back --------------------------------------------------------------
  R('E8.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp, clamp } = api;
    const DX = 341, DY = 567;                 // desk top-left
    const HX = 1330, HY = 860, HS = 300, s = HS / 88;
    c.save();
    zoomAbout(c, 1130, 640, 1 + 0.05 * ease.inOut(t));
    labBack(c, S, kit, { window: { x: 400, y: 120, w: 420, h: 260 } });
    doorWithSpill(c, S, kit, 0.32, 0.8);
    const drawer = 1 - ease.inOut(seg(t, 0.8, 0.95));
    kit.desk(c, DX, DY, 910, { mode: 'teal', S, open: drawer, mug: true });
    kit.lamp(c, DX + 90, DY, 200, { mode: 'teal', S, on: 0 });
    // hand position of the hero's right arm (flipped bean: forward is screen-left)
    const hand = a => ({ x: HX - s * (29 + 34 * Math.cos(a)), y: HY + s * (-44 + 34 * Math.sin(a)) });
    const AG = -0.6;
    const rest = hand(AG);
    // arm schedule: reach, grab, draw in, hold, push out, release
    let aR, holding = false, p;
    if (t < 0.06) { aR = 1.14; }
    else if (t < 0.24) aR = lerp(1.14, AG, ease.inOut(seg(t, 0.06, 0.24)));
    else if (t < 0.3) aR = AG;
    else if (t < 0.44) aR = lerp(AG, 2.4, ease.inOut(seg(t, 0.3, 0.44)));
    else if (t < 0.6) { holding = true; aR = 2.4; }
    else if (t < 0.74) aR = lerp(2.4, AG + 0.25, ease.inOut(seg(t, 0.6, 0.74)));
    else aR = lerp(AG + 0.25, 1.14, ease.inOut(seg(t, 0.78, 0.9)));
    const lEnd = holding ? 0.76 : lerp(2.0, 0.76, ease.inOut(seg(t, 0.3, 0.44)) - ease.inOut(seg(t, 0.62, 0.74)));
    const h = hand(aR);
    const heldPos = { x: HX, y: HY - 0.45 * HS };
    // plane: in the drawer, with the hand, at the belly, back in the drawer
    const peek = { x: rest.x, y: rest.y - 26 };
    const inDrawer = { x: rest.x + 4, y: rest.y + 6 };
    let px, py, pr;
    const bob = Math.sin(S * 2.6) * 1.5;
    if (t < 0.3) {
      const lift = ease.out(seg(t, 0.0, 0.22));
      px = peek.x; py = lerp(inDrawer.y, peek.y, lift) + bob * (1 - seg(t, 0.24, 0.3)); pr = lerp(-0.2, -0.95, lift);
    } else if (t < 0.6) {
      const k = ease.inOut(seg(t, 0.3, 0.44));
      px = lerp(h.x, heldPos.x, holding ? 1 : 0); py = lerp(h.y, heldPos.y, holding ? 1 : 0);
      if (!holding) { px = h.x; py = h.y; }
      pr = lerp(-0.95, -0.25, k) + (holding ? 0.03 * Math.sin(S * 3) : 0);
    } else if (t < 0.74) {
      const k = ease.inOut(seg(t, 0.6, 0.74));
      px = lerp(heldPos.x, h.x, k); py = lerp(heldPos.y, h.y, k); pr = lerp(-0.25, -0.9, k);
    } else {
      const k = ease.in(seg(t, 0.74, 0.86));
      px = rest.x; py = lerp(peek.y, inDrawer.y, k); pr = lerp(-0.9, -0.2, k);
    }
    const drawPlane = () => {
      c.save();
      if (t >= 0.74) {
        // the closing drawer front slides over the plane
        const Lx = DX + (1714 - 1010) - 150 * drawer, top = DY + (770 - 726) - 4;
        c.beginPath(); c.rect(-200, -200, 2400, 1600); c.rect(Lx, top, 182, 76); c.clip('evenodd');
      }
      kit.plane(c, px, py, 120, { S, rot: pr, fold: 1, color: kit.K('#fbf3dc', 0.18) });
      c.restore();
    };
    if (!holding) drawPlane();
    const away = seg(t, 0.52, 0.64) * (1 - seg(t, 0.9, 1) * 0);
    kit.bean(c, HX, HY, HS, {
      hero: true, S, seed: 55, flip: true, mood: t < 0.5 ? 'worry' : 'flat',
      look: lerp(0.85, -0.7, ease.inOut(away)), drain: 0.1,
      arm: holding ? 'hold' : ['down', 'point'],
      armR: aR, armL: lEnd, sway: 0.4 * Math.sin(S * 1.1),
      squash: -0.012 * Math.sin(S * 1.7)
    });
    if (holding) drawPlane();
    motes(c, S, kit, { x: 0, y: 150, w: 1920, h: 650, n: 26, seed: 6, alpha: 0.7 });
    c.restore();
    darken(c, '165,190,205', 0.3);
  });

  // ---- E8.3: twelve hundred of us, silent in the dark, facing the empty chair ----------------------------
  R('E8.3', (c, shot, S, t, api, kit) => {
    const { ease, lerp } = api;
    c.save();
    zoomAbout(c, 1500, 640, 1 + 0.08 * ease.inOut(t));
    kit.floor(c, 'teal', { y: 700 });
    kit.window(c, 1280, 90, 440, 250, { mode: 'teal', S, view: 'night', plant: false });
    kit.tag(c, 560, 40, 1200, { mode: 'teal', S, scale: 0.8, rot: 0.03 * Math.sin(S * 1.2) });
    kit.crowd(c, { x: -10, y: 660, w: 1240, h: 200, rows: 7, n: 230, seed: 8, S, mood: 'flat', target: { x: 1500 }, scale: 1.3, bounce: 0, drain: 0.55, antennas: 0.08 });
    // the dark presses on the crowd; the chair keeps the moonlight
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

  // ---- E8.4: the judge was never checking ---------------------------------------------------------------
  R('E8.4', (c, shot, S, t, api, kit) => {
    const { ease, lerp } = api;
    const { fillInk, wrect, blob, K, wash } = kit;
    const wood = K('#9a6f46', 0.3), woodD = K('#6e4c30', 0.3);
    c.save();
    zoomAbout(c, 960, 520, 1 + 0.1 * ease.inOut(t));
    kit.floor(c, 'teal', { y: 830 });
    // panelled wall behind the bench
    fillInk(c, () => wrect(c, 330, 120, 1260, 720, 4100, 2, 100), K('#7a5a3c', 0.32), 3.6);
    c.strokeStyle = 'rgba(30,20,20,.28)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let x = 440; x < 1590; x += 110) { c.beginPath(); c.moveTo(x, 135); c.lineTo(x + (kit.h1(x) - 0.5) * 4, 830); c.stroke(); }
    // scales hung from the wall, never adjusting
    const sw = 0.03 * Math.sin(S * 0.9);
    c.save(); c.translate(960, 250); c.rotate(sw);
    c.strokeStyle = kit.INK; c.lineCap = 'round'; c.lineWidth = 10; c.beginPath(); c.moveTo(-120, 0); c.lineTo(120, 0); c.moveTo(0, -60); c.lineTo(0, 0); c.stroke();
    c.lineWidth = 6; c.strokeStyle = K('#d2b27a', 0.2); c.beginPath(); c.moveTo(-120, 0); c.lineTo(120, 0); c.moveTo(0, -60); c.lineTo(0, 0); c.stroke();
    for (const sg of [-1, 1]) {
      c.save(); c.translate(sg * 120, 0); c.rotate(-sw);
      c.lineWidth = 3; c.strokeStyle = kit.INK; c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, 62); c.moveTo(0, 0); c.lineTo(40, 62); c.stroke();
      fillInk(c, () => blob(c, 0, 66, 52, 10, 4110 + sg, 0.8, 10), K('#d2b27a', 0.2), 2.8);
      c.restore();
    }
    c.restore();
    // wall clock
    fillInk(c, () => blob(c, 560, 300, 54, 54, 4120, 1.2, 16), K('#efe6cf', 0.3), 3.4);
    c.strokeStyle = kit.INK; c.lineCap = 'round'; c.lineWidth = 4.5;
    c.beginPath(); c.moveTo(560, 300); c.lineTo(580, 284); c.moveTo(560, 300); c.lineTo(556, 336); c.stroke();
    c.lineWidth = 2.4; c.strokeStyle = '#a2402c'; const sa = (S % 3) / 3 * TAU - Math.PI / 2;
    c.beginPath(); c.moveTo(560, 300); c.lineTo(560 + Math.cos(sa) * 44, 300 + Math.sin(sa) * 44); c.stroke();

    // the judge, asleep behind the bench
    const jx = 960, jy = 710, js = 200;
    const breathe = 0.03 * Math.sin(S * 1.9);
    kit.bean(c, jx, jy, js, {
      body: '#d9993a', S, seed: 71, mood: 'asleep', arm: 'down', tilt: 0.085 * Math.sin(S * 1.2 + 0.6), squash: breathe,
      acc: { cape: '#1d1b26', glasses: true }, drain: 0.1
    });
    c.save(); c.translate(jx, jy); c.rotate(0.085 * Math.sin(S * 1.2 + 0.6));
    const wig = '#efe7d2';
    fillInk(c, () => blob(c, 0, -js * 0.93, js * 0.4, js * 0.17, 4130, 0.8, 12), wig, 2.8);
    for (const sg of [-1, 1]) for (let q = 0; q < 3; q++) {
      fillInk(c, () => blob(c, sg * js * (0.4 - q * 0.03), -js * (0.78 - q * 0.17), js * 0.1, js * 0.1, 4131 + q + (sg > 0 ? 5 : 0), 0.8, 9), wig, 2.6, { rim: false });
    }
    c.restore();
    kit.zzz(c, jx + 130, jy - js - 40, 95, { S, alpha: 0.95 });

    // the bench
    fillInk(c, () => wrect(c, 440, 520, 150, 310, 4140, 1.4, 60), woodD, 3.6);
    fillInk(c, () => wrect(c, 1330, 520, 150, 310, 4141, 1.4, 60), woodD, 3.6);
    fillInk(c, () => wrect(c, 560, 636, 800, 194, 4142, 1.4, 60), wood, 3.8);
    fillInk(c, () => wrect(c, 540, 612, 840, 40, 4143, 1.4, 60), K('#b8895a', 0.3), 3.8);
    c.strokeStyle = 'rgba(30,20,20,.25)'; c.lineWidth = 3;
    for (let x = 700; x < 1360; x += 150) { c.beginPath(); c.moveTo(x, 664); c.lineTo(x, 826); c.stroke(); }
    fillInk(c, () => wrect(c, 880, 700, 160, 44, 4144, 1, 40), K('#d9c79a', 0.3), 2.8);
    // paper stack, gavel
    for (let q = 0; q < 3; q++) fillInk(c, () => wrect(c, 650 + q * 3, 590 - q * 9, 120, 24, 4150 + q, 0.8, 30), K('#f3ead0', 0.25), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1180, 598, 120, 14, 4160, 0.6, 30), K('#b8895a', 0.2), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1140, 570, 52, 44, 4161, 0.8, 30), K('#7e5b36', 0.2), 3);
    kit.shadow(c, 960, 836, 440, 20, 0.28);
    motes(c, S, kit, { x: 330, y: 160, w: 1260, h: 660, n: 22, seed: 12, alpha: 0.6 });
    c.restore();
    darken(c, '170,194,208', 0.22);
  });

  // ---- E8.5: zero points ---------------------------------------------------------------------------------
  R('E8.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const FLIP = 0.1;                          // the 0 lands on "Zero"
    const after = Math.max(0, t - FLIP) * (shot.t1 - shot.t0);
    const landed = t >= FLIP;
    c.save();
    zoomAbout(c, 960, 480, 1 + 0.06 * ease.out(t));
    // a single warm pool of light on the tag
    kit.glow(c, 960, 470, 700, 'rgba(240,190,110,A)', 0.2);
    const swing = landed ? 0.2 * Math.exp(-after * 3.2) * Math.sin(after * 11) : 0.015 * Math.sin(S * 3);
    const hop = landed ? 14 * Math.exp(-after * 9) * Math.abs(Math.sin(after * 18)) : 0;
    c.save();
    const sc = landed ? lerp(2.4, 3.1, ease.back(Math.min(1, after / 0.22))) : 2.4;
    c.translate(960, 250 - hop);
    kit.tag(c, 0, 0, landed ? 0 : 1200, { mode: 'ink', S, scale: sc, rot: swing, raw: landed ? '0' : '1,200', color: landed ? '#33505a' : '#d8503b' });
    c.restore();
    if (landed) {
      c.save(); c.fillStyle = '#c9b68a';
      for (let i = 0; i < 22; i++) {
        const a = kit.h1(i * 3) * TAU, d = 150 + 340 * kit.h1(i * 3 + 1), k = ease.out(Math.min(1, after / 0.7));
        const px = 960 + Math.cos(a) * d * k * 1.3, py = 500 + Math.sin(a) * d * k * 0.8 + 50 * k * k;
        c.globalAlpha = (1 - k) * 0.7; c.beginPath(); c.arc(px, py, 2 + 3 * kit.h1(i * 3 + 2), 0, TAU); c.fill();
      }
      c.restore();
    }
    motes(c, S, kit, { x: 200, y: 100, w: 1520, h: 700, n: 30, seed: 15, alpha: 0.6 });
    c.restore();
  });

  // ---- E8.6: the hollow chorus, two beans clap in an empty room ------------------------------------------
  // clap contact times (seconds into the shot); the second bean is a hair late, and they run out of steam
  const CLAP_A = [0.2, 0.71, 1.22, 1.73, 2.24, 2.76, 3.27, 3.95];
  const CLAP_B = [0.27, 0.78, 1.29, 1.8, 2.31, 2.83, 3.34, 4.05, 4.75];
  function clap(tl, ts) {
    let i = -1;
    for (let k = 0; k < tl.length && tl[k] <= ts; k++) i = k;
    if (i < 0) return { ang: -0.15, hit: 9, last: false };
    const dt = ts - tl[i], nxt = tl[i + 1];
    if (nxt === undefined) return { ang: dt < 0.18 ? 2.6 + (-0.15 - 2.6) * Math.min(1, dt / 0.18) : -0.15, hit: dt, last: true };
    const P = nxt - tl[i], f = dt / P;
    // open out fast after contact, swing back in to meet the next
    const open = Math.sin(Math.PI * Math.pow(f, 0.8));
    return { ang: 2.6 - 2.75 * Math.pow(open, 0.8), hit: dt, last: false };
  }
  R('E8.6', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, ts = S - shot.t0;
    c.save();
    zoomAbout(c, 960, 560, 1 + 0.06 * ease.inOut(t));
    kit.floor(c, 'teal', { y: 780 });
    kit.window(c, 1330, 150, 440, 290, { mode: 'teal', S, view: 'night', plant: false });
    // bunting that stayed up, one flag fallen
    c.strokeStyle = kit.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(60, 190); c.quadraticCurveTo(540, 300, 1020, 200); c.stroke();
    for (let i = 0; i < 9; i++) {
      const u = (i + 0.5) / 9, x = 60 + u * 960, y = 190 + 2 * u * (1 - u) * 220 * 0.5 + (u * 10) * 0 + (u - 0.5) * 0 + 0;
      const yy = 190 + (1 - Math.pow(2 * u - 1, 2)) * 62 - 8 * u;
      if (i === 5) continue;
      kit.fillInk(c, () => { c.moveTo(x - 26, yy); c.lineTo(x + 26, yy); c.lineTo(x + Math.sin(S * 1.1 + i) * 2, yy + 56); c.closePath(); }, kit.K(['#d9993a', '#8cc7a1', '#d9728a', '#ecc87c'][i % 4], 0.3), 2.6, { rim: false });
    }
    kit.confetti(c, S, 4, { n: 46, x: 80, y: 800, w: 1760, h: 80, still: true, colors: ['#8a6a50', '#4f6f78', '#a8884a', '#7d5a6a'], alpha: 0.85 });
    // only a few of the string lights are left, still counting the old tempo
    kit.lights(c, 60, 40, 1800, 100, { mode: 'teal', S, cell: 105, lit: lerp(0.3, 0.14, seg(t, 0, 0.9)), wave: 0.22, colors: MUTED, seed: 3 });
    const A = clap(CLAP_A, ts), B = clap(CLAP_B, ts);
    const drawClapper = (x, col, seed, cl, face, sq) => {
      const pa = cl.ang;
      kit.bean(c, x, 880, 270, {
        body: col, S, seed, mood: face, look: x < 960 ? 0.85 : -0.85, drain: 0.3, arm: ['down', 'down'],
        armL: Math.PI - pa, armR: pa, squash: cl.hit < 0.1 ? 0.04 * (1 - cl.hit / 0.1) : 0, tilt: 0.015 * Math.sin(S * 1.3 + seed)
      });
      if (cl.hit < 0.1) {
        c.save(); c.globalAlpha = 1 - cl.hit / 0.1; c.strokeStyle = kit.INK; c.lineWidth = 4; c.lineCap = 'round';
        const hx = x + (x < 960 ? 1 : -1) * 6, hy = 880 - 270 * 0.38, d = 28 + 90 * cl.hit;
        for (let q = -1; q <= 1; q++) { const a = -Math.PI / 2 + q * 0.7; c.beginPath(); c.moveTo(hx + Math.cos(a) * d, hy + Math.sin(a) * d); c.lineTo(hx + Math.cos(a) * (d + 16), hy + Math.sin(a) * (d + 16)); c.stroke(); }
        c.restore();
      }
    };
    const tired = seg(ts, 3.3, 4.2);
    drawClapper(790, '#d9993a', 31, A, tired > 0.5 ? 'flat' : 'smile');
    drawClapper(1130, '#d9728a', 32, B, ts > 4.9 ? 'flat' : (tired > 0.5 ? 'worry' : 'smile'));
    motes(c, S, kit, { x: 0, y: 200, w: 1920, h: 600, n: 24, seed: 18, alpha: 0.6 });
    c.restore();
    darken(c, '160,186,200', 0.3);
  });

  // ---- E8.7 / E8.8: the lab, the same empty place as A0.1, now morning --------------------------------------
  // A0.1 ended on this framing: the room at 1.15x, offset (-230,-122).
  const END_Z = 1.15, END_TX = -230, END_TY = -122;
  const phiAt = S => 0.45 + 0.07 * Math.sin(S * 0.9);
  const swayAt = S => 6 * Math.sin(S * 1.3);


  // the window sky, night to sunrise, as one continuous grade (humanRoom resets globalAlpha, so no layered crossfade)
  function skyDraw(k, S, kit) {
    return (cc, x, y, w, h) => {
      const { mix, glow, h1, fillInk, blob, wrect } = kit;
      const g = cc.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, mix('#0a2230', '#ffe9a6', k)); g.addColorStop(1, mix('#1b4a58', '#ffc56a', k));
      cc.fillStyle = g; cc.fillRect(x, y, w, h);
      cc.lineCap = 'round'; cc.lineWidth = 3;
      for (let i = 0; i < 12; i++) {
        const sx = x + 30 + h1(i * 5) * (w - 60), sy = y + 24 + h1(i * 5 + 1) * h * 0.5, r = 5 + 4 * h1(i + 3);
        cc.strokeStyle = `rgba(246,236,212,${(0.3 + 0.5 * (0.5 + 0.5 * Math.sin(S * 3 + i * 2))) * (1 - k)})`;
        cc.beginPath(); cc.moveTo(sx - r, sy); cc.lineTo(sx + r, sy); cc.moveTo(sx, sy - r); cc.lineTo(sx, sy + r); cc.stroke();
      }
      cc.save(); cc.globalAlpha = 1 - k;
      glow(cc, x + w * 0.72, y + h * 0.3, w * 0.38, 'rgba(244,232,192,A)', 0.25);
      fillInk(cc, () => blob(cc, x + w * 0.72, y + h * 0.3, w * 0.085, w * 0.085, 301, 2, 14), '#f4e8c0', 3);
      cc.restore();
      const sx = x + w * 0.3, sy = y + h * (1.0 - 0.38 * k);
      glow(cc, sx, sy, w * 0.6, 'rgba(255,240,170,A)', 0.8 * k);
      cc.save(); cc.globalAlpha = Math.min(1, k * 1.6);
      fillInk(cc, () => blob(cc, sx, sy, w * 0.07, w * 0.07, 303, 1.6, 14), '#fff1b8', 3);
      cc.restore();
      cc.fillStyle = mix('#0b2228', '#d9a45a', k); cc.beginPath(); wrect(cc, x - 20, y + h * 0.82, w + 40, h * 0.3, 1330, 5, 80); cc.fill();
    };
  }

  R('E8.7', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const k = ease.smooth(seg(t, 0.04, 0.78));
    const e = ease.inOut(seg(t, 0, 0.85));
    const z0 = 1.6, tx0 = 880 - z0 * 520, ty0 = 520 - z0 * 500;
    const z = lerp(z0, END_Z, e), tx = lerp(tx0, END_TX, e), ty = lerp(ty0, END_TY, e);
    c.save();
    c.translate(tx, ty); c.scale(z, z);
    kit.humanRoom(c, {
      mode: 'gold', S, phi: phiAt(S), sway: swayAt(S), lamp: 0, monitor: 0, zzz: 1 - k, dust: 1, led: 0.15 + 0.25 * (1 - k),
      dim: 0.85 * (1 - k), light: 0.4 + 0.6 * k, windowDraw: skyDraw(k, S, kit)
    });
    // sun on the window, then across the floor
    c.save(); c.globalCompositeOperation = 'screen';
    kit.glow(c, 520, 490, 560, 'rgba(255,224,150,A)', 0.4 * k);
    kit.glow(c, 1050, 880, 640, 'rgba(255,214,130,A)', 0.14 * k);
    c.restore();
    c.restore();
    darken(c, '78,108,136', 0.9 * (1 - k));
  });

  R('E8.8', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const ts = S - shot.t0;
    // the lamp catches: a couple of flickers, then steady
    const FL = [[0.12, 0.35], [0.2, 0.0], [0.26, 0.8], [0.31, 0.2], [0.37, 1]];
    let on = 0;
    for (const [tt, v] of FL) if (ts >= tt) on = v;
    on = ts >= 0.37 ? Math.min(1, 0.92 + 0.08 * ease.out(seg(ts, 0.37, 0.8)) + 0.02 * Math.sin(S * 23)) : on;
    const z = lerp(END_Z, END_Z * 1.05, ease.inOut(t));
    c.save();
    // push toward the chair while keeping the A0.1 end framing at t=0
    const cx = 1300 * END_Z + END_TX, cy = 800 * END_Z + END_TY;
    zoomAbout(c, cx, cy, z / END_Z);
    c.translate(END_TX, END_TY); c.scale(END_Z, END_Z);
    kit.humanRoom(c, { mode: 'gold', S, phi: phiAt(S), sway: swayAt(S), lamp: on, monitor: 0, light: 1, dust: 1, led: 0.15 });
    // the morning stays a little dim at the edges so the lamp reads as a change
    c.save(); c.globalCompositeOperation = 'multiply';
    const gv = c.createRadialGradient(1190, 520, 160, 1190, 520, 1250);
    gv.addColorStop(0, 'rgb(255,255,255)'); gv.addColorStop(1, 'rgb(176,146,112)');
    c.fillStyle = gv; c.fillRect(-300, -300, 2600, 1800); c.restore();
    kit.glow(c, 1195, 500, 520, 'rgba(255,226,150,A)', 0.55 * on);
    kit.glow(c, 1195, 500, 140, 'rgba(255,244,200,A)', 0.55 * on, 'source-over');
    kit.glow(c, 520, 490, 560, 'rgba(255,224,150,A)', 0.3);
    c.restore();
    c.restore();
    // long fade on the chair
    const f = ease.in(seg(t, 0.55, 1));
    if (f > 0.001) { c.fillStyle = `rgba(8,18,22,${f})`; c.fillRect(0, 0, 1920, 1080); }
  });
})();
