// Section B2 (0:36.8-0:53.9), style A. Only B2.1 and B2.2 are ever seen: the approved fragment takes over at 45.5 s.
// B2.1 the hero gets a blank handle badge and carries a secret folder; B2.2 the message board and the folders with beans hiding
// in them, then a whip-pan that lands exactly on the fragment's opening frame (night server room, hero left, rack right).
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const TAU = Math.PI * 2;

  // sparkle ring that opens with k 0..1
  function burst(c, kit, S, x, y, k, seed, n, r0, r1, size, cols) {
    if (k <= 0 || k >= 1) return;
    c.save(); c.globalAlpha = 1 - k * k;
    for (let i = 0; i < n; i++) {
      const a = TAU * i / n + kit.h1(seed + i) * 0.5, d = r0 + (r1 - r0) * (1 - Math.pow(1 - k, 3));
      kit.star(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9, size * (1 - 0.5 * k) * (0.7 + 0.6 * kit.h1(seed + i + 40)), { kind: 'sparkle', col: cols[i % cols.length], S, rot: a });
    }
    c.restore();
  }

  // floating dust in the morning light
  function motes(c, S, kit, x, y, w, h, n) {
    c.save();
    for (let i = 0; i < n; i++) {
      const px = x + ((kit.h1(i * 3) * w + S * (8 + 10 * kit.h1(i)) + Math.sin(S * 0.6 + i) * 24) % w);
      const py = y + ((kit.h1(i * 3 + 1) * h - S * (6 + 14 * kit.h1(i * 3 + 2)) + h * 20) % h);
      c.fillStyle = `rgba(255,248,214,${0.35 + 0.35 * Math.sin(S * 1.7 + i * 2.1)})`;
      c.beginPath(); c.arc(px, py, 2 + 2.6 * kit.h1(i + 9), 0, TAU); c.fill();
    }
    c.restore();
  }

  // the blank handle badge, hanging by its clip from (x,y)
  function badge(c, kit, S, x, y, w, rot) {
    kit.useS(S);
    const h = w * 1.3;
    c.save(); c.translate(x, y); c.rotate(rot);
    kit.fillInk(c, () => kit.wrect(c, -w / 2, 0, w, h, 4100, 1.4, 40), '#fbf3dc', 3.2);
    kit.fillInk(c, () => kit.wrect(c, -w * 0.15, -w * 0.12, w * 0.3, w * 0.2, 4101, 0.8, 20), '#b3ac9c', 2.6, { rim: false });
    c.fillStyle = 'rgba(43,34,51,.13)'; c.beginPath(); c.arc(0, h * 0.34, w * 0.2, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(43,34,51,.4)'; c.lineWidth = Math.max(2, w * 0.045); c.lineCap = 'round';
    c.beginPath(); c.moveTo(-w * 0.3, h * 0.66); c.lineTo(w * 0.3, h * 0.66); c.moveTo(-w * 0.3, h * 0.8); c.lineTo(w * 0.14, h * 0.8); c.stroke();
    c.restore();
  }

  // ---- B2.1 -------------------------------------------------------------------------------------------------------
  R('B2.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp, pulse } = api;
    const M = 'dawn';
    const zoom = 1 + 0.07 * ease.smooth(seg(S, 36.8, 41.6)), fx = 900 - 40 * seg(S, 36.8, 41.6);
    c.save(); c.translate(960, 600); c.scale(zoom, zoom); c.translate(-fx, -600);

    kit.floor(c, M, { y: 820 });
    // morning window, sun and its beam on the floor
    kit.window(c, 130, 170, 560, 360, { mode: M, S, view: 'dawn', light: 0.9, beamTo: 930, mullions: true });
    // shelf of ordinary folders on the right wall
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, 1330, 540, 560, 26, 4200, 1.6, 60), '#b98c57', 3.2);
    const fcol = ['#e3b86a', '#8fd0c2', '#f0a58a', '#c8b4e0', '#e8c860'];
    for (let i = 0; i < 5; i++) {
      const bump = pulse(S, 7) * (i % 2 ? 1 : 0.6);
      kit.folder(c, 1400 + i * 100, 540 - 2 - 6 * bump, 92, { mode: M, S, color: fcol[i] });
    }
    motes(c, S, kit, 100, 120, 1700, 700, 26);

    // hero walks in from the left, then idles on the beat
    const walkU = seg(S, 36.84, 37.6), arrive = ease.out(walkU);
    const hx = lerp(-200, 840, arrive);
    const moving = walkU > 0 && walkU < 1;
    const hop = moving ? Math.abs(Math.sin(S * 11)) * 26 : 0;
    const beatSq = 0.1 * pulse(S, 6) - 0.02;
    const landSq = S > 37.6 ? 0.2 * Math.exp(-(S - 37.6) * 9) * Math.cos((S - 37.6) * 24) : 0;
    const hs = 370, hy = 824;
    const grin = S > 37.9;

    // folder flying in from the shelf: arrives in the raised right hand
    const fk = seg(S, 39.18, 39.9);
    const handX = hx + 45 * hs / 88, handY = hy - 64 * hs / 88;
    const raise = ease.back(seg(S, 39.1, 39.45));
    const armR = lerp(1.14, -0.9, raise);
    const bounce = S > 39.9 ? pulse(S, 5) : 0;

    kit.glow(c, hx, hy - 160, 520, 'rgba(255,224,150,A)', 0.2 + 0.1 * pulse(S, 5));
    kit.shadow(c, hx, hy + 6, 150 - hop * 0.8, 22, 0.3);
    kit.bean(c, hx, hy - hop, hs, {
      S, seed: 11, hero: true, mood: S > 40.38 ? 'wink' : (grin ? 'grin' : 'smile'), look: lerp(0.2, 0.6, seg(S, 39, 40)),
      walk: moving, arm: 'down', armR, squash: beatSq * (moving ? 0 : 1) + landSq, tilt: 0.03 * Math.sin(S * 3.2)
    });

    // the blank badge drops on its string (37.4), swings, and clips to the hero on "handle" (38.0)
    const clipX = hx - 16 * hs / 88, clipY = hy - 30 * hs / 88;
    if (S < 38.0 + 0.4) {
      const drop = ease.back(seg(S, 37.35, 37.85)), snap = ease.back(seg(S, 38.0, 38.3));
      const sx = 1180, sy = lerp(-60, 330, drop);
      const sw = 0.22 * Math.sin((S - 37.4) * 7) * Math.exp(-(S - 37.4) * 0.7);
      const px = lerp(sx + Math.sin(sw) * 40, clipX, snap), py = lerp(sy, clipY, snap);
      const wd = lerp(200, 96, snap);
      if (snap < 0.02) { c.strokeStyle = '#2b2233'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, -40); c.lineTo(px, py - 8); c.stroke(); }
      badge(c, kit, S, px, py, wd, lerp(sw, 0, snap));
    } else {
      const settle = 0.14 * Math.exp(-(S - 38.3) * 4) * Math.sin((S - 38.3) * 16);
      badge(c, kit, S, clipX, clipY - hop, 96 * (1 + 0.05 * pulse(S, 6)), settle);
    }
    burst(c, kit, S, clipX, clipY - 40, seg(S, 38.0, 38.7), 5, 8, 90, 200, 30, ['#ffe9a8', '#fff6d0', '#e99aa8']);

    // the secret folder
    if (S >= 39.18) {
      const sx = 1590, sy = 520, ex = handX + 4, ey = handY - 12 - hop;
      const e = ease.back(fk), arc = Math.sin(Math.PI * fk) * 190;
      const fxp = lerp(sx, ex, e), fyp = lerp(sy, ey, e) - arc;
      const glowK = seg(S, 40.38, 40.75);
      const tilt = fk < 1 ? (1 - fk) * 0.5 + 0.18 * Math.sin(fk * 9) : 0.1 * Math.sin(S * 5) * 0.5 - 0.05 + 0.05 * bounce;
      c.save(); c.translate(fxp, fyp); c.rotate(tilt); c.scale(1 + 0.08 * bounce, 1 - 0.06 * bounce);
      if (glowK > 0) kit.glow(c, 0, -70, 240, 'rgba(255,224,130,A)', 0.55 * glowK * (0.8 + 0.2 * pulse(S, 4)));
      kit.folder(c, 0, 0, 190, { mode: M, S, open: 0.1 + 0.08 * bounce, glow: glowK });
      c.restore();
      burst(c, kit, S, fxp, fyp - 80, seg(S, 40.38, 41.0), 21, 8, 110, 230, 28, ['#ffe08a', '#fff6d0', '#8fd0c2']);
    }
    c.restore();
  });

  // ---- B2.1, new song: 'Made my handle, made my tag' / 'Grabbed the keys inside the bag' ---------------------------------------
  // satchel: (x,y) = floor centre, s = width. The mouth is drawn in two halves so things can poke out of it.
  function bagBack(c, kit, S, x, y, s) {
    kit.useS(S);
    kit.fillInk(c, () => kit.blob(c, x, y - s * 0.62, s * 0.34, s * 0.075, 4300, 0.8, 12), '#3b2a22', 3, { rim: false });
  }
  function bagFront(c, kit, S, x, y, s, buckle) {
    kit.useS(S);
    const tn = h => kit.tone(h, 'dawn', 0.4);
    c.strokeStyle = kit.INK; c.lineWidth = 9; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x - s * 0.26, y - s * 0.62); c.quadraticCurveTo(x, y - s * 1.05, x + s * 0.26, y - s * 0.62); c.stroke();
    c.lineWidth = 5; c.strokeStyle = tn('#a9784f'); c.stroke();
    kit.fillInk(c, () => kit.smoothClosed(c, [[x - s * 0.4, y], [x - s * 0.46, y - s * 0.34], [x - s * 0.36, y - s * 0.62], [x, y - s * 0.55], [x + s * 0.36, y - s * 0.62], [x + s * 0.46, y - s * 0.34], [x + s * 0.4, y]]), tn('#c08a5a'), 3.4);
    kit.fillInk(c, () => kit.smoothClosed(c, [[x - s * 0.38, y - s * 0.6], [x, y - s * 0.52], [x + s * 0.38, y - s * 0.6], [x + s * 0.3, y - s * 0.34], [x, y - s * 0.28], [x - s * 0.3, y - s * 0.34]]), tn('#a9784f'), 3, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, x - s * 0.07, y - s * 0.4, s * 0.14, s * 0.13, 4301, 0.6, 20), buckle > 0 ? '#ffe08a' : '#e8c06a', 2.6, { rim: false });
  }
  // a ring with three small keys; (x,y) = ring centre, sw = jingle amount
  function keyRing(c, kit, S, x, y, size, sw) {
    const k = size / 100;
    c.save(); c.translate(x, y);
    for (let i = 0; i < 3; i++) {
      const rot = 1.25 + i * 0.62 + sw * 0.28 * Math.sin(S * 17 + i * 2.1);
      kit.keyGlyph(c, Math.cos(rot) * 20 * k, Math.sin(rot) * 20 * k + 14 * k, 78 * k, { S, rot, color: ['#e8b44a', '#d9d4c4', '#e8b44a'][i] });
    }
    c.lineWidth = 11 * k; c.strokeStyle = kit.INK; c.beginPath(); c.arc(0, 0, 21 * k, 0, 6.3); c.stroke();
    c.lineWidth = 6 * k; c.strokeStyle = '#d9d4c4'; c.stroke();
    c.restore();
  }

  window.SHOTS_NEW['B2.1'] = (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp, pulse } = api;
    const M = 'dawn', s0 = shot.t0, s1 = shot.t1;
    const zoom = 1 + 0.07 * ease.smooth(seg(S, s0, s1)), fx = 900 - 40 * seg(S, s0, s1);
    c.save(); c.translate(960, 600); c.scale(zoom, zoom); c.translate(-fx, -600);

    kit.floor(c, M, { y: 820 });
    kit.window(c, 130, 170, 560, 360, { mode: M, S, view: 'dawn', light: 0.9, beamTo: 930, mullions: true });
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, 1330, 540, 560, 26, 4200, 1.6, 60), '#b98c57', 3.2);
    const fcol = ['#e3b86a', '#8fd0c2', '#f0a58a', '#c8b4e0', '#e8c860'];
    for (let i = 0; i < 5; i++) {
      const bump = pulse(S, 7) * (i % 2 ? 1 : 0.6);
      kit.folder(c, 1400 + i * 100, 540 - 2 - 6 * bump, 92, { mode: M, S, color: fcol[i] });
    }
    motes(c, S, kit, 100, 120, 1700, 700, 26);

    // hero trots in, lands on the beat at 32.6, then stands on the beat
    const walkU = seg(S, 32.0, 32.6), arrive = ease.out(walkU);
    const hx = lerp(-100, 840, arrive);
    const moving = walkU < 1;
    const hop = moving ? Math.abs(Math.sin(S * 11)) * 26 : 0;
    const beatSq = 0.1 * pulse(S, 6) - 0.02;
    const landSq = S > 32.6 ? 0.2 * Math.exp(-(S - 32.6) * 9) * Math.cos((S - 32.6) * 24) : 0;
    const hs = 370, hy = 824, sc = hs / 88;

    // right hand: raises to catch the folder (arrives on 'tag', 34.0)
    const fk = seg(S, 33.5, 34.05);
    const raise = ease.back(seg(S, 33.45, 33.8));
    const armR = lerp(1.14, -0.9, raise);
    const handX = hx + 45 * sc, handY = hy - 64 * sc;
    // left hand: down to the bag (reach), then up with the ring (34.5 reach, 35.0 grab, 35.45 up)
    const BX = 610, BY = 824, BW = 190, MOUTH = BY - BW * 0.6;
    const reach = ease.out(seg(S, 34.45, 34.85)), lift = ease.back(seg(S, 35.0, 35.45));
    const aL = lerp(Math.PI - 1.14, Math.PI - 0.6, reach) + lift * (Math.PI + 1.15 - (Math.PI - 0.6));
    const lhX = hx + (-29 + Math.cos(aL) * 26) * sc, lhY = hy - hop + (-44 + Math.sin(aL) * 26) * sc;
    const bagK = ease.back(seg(S, 34.0, 34.45)), bagOff = lerp(-760, 0, bagK);
    const bagLand = S > 34.4 ? Math.exp(-(S - 34.4) * 9) * Math.cos((S - 34.4) * 26) : 0;
    const grabbed = S >= 35.0;
    const watch = S > 34.3 && S < 35.45;

    kit.glow(c, hx, hy - 160, 520, 'rgba(255,224,150,A)', 0.2 + 0.1 * pulse(S, 5));
    kit.shadow(c, hx, hy + 6, 150 - hop * 0.8, 22, 0.3);

    // the bag falls in on 'Grabbed' and sits left of the hero
    if (S >= 34.0) {
      kit.shadow(c, BX, BY + 6, BW * 0.5, 14, 0.28);
      c.save(); c.translate(0, bagOff); c.translate(BX, BY); c.scale(1 + 0.05 * bagLand, 1 - 0.07 * bagLand); c.translate(-BX, -BY);
      bagBack(c, kit, S, BX, BY, BW);
      // ring peeks out of the mouth and rises as the hand closes in
      if (!grabbed) keyRing(c, kit, S, BX + 6, MOUTH - 10 - 26 * seg(S, 34.6, 35.0), 100, 0.5 * seg(S, 34.6, 35.0));
      bagFront(c, kit, S, BX, BY, BW, grabbed ? 1 : 0);
      c.restore();
    }

    kit.bean(c, hx, hy - hop, hs, {
      S, seed: 11, hero: true, mood: S > 35.5 ? 'wink' : (S > 32.8 ? 'grin' : 'smile'), look: watch ? -0.8 : lerp(0.2, 0.6, seg(S, 33, 34)),
      lookY: watch ? 0.7 : 0, walk: moving, arm: 'down', armR, armL: aL,
      squash: beatSq * (moving ? 0 : 1) + landSq, tilt: 0.03 * Math.sin(S * 3.2)
    });

    // the blank badge drops on its string (32.3), swings, and clips to the hero on 'handle' (33.0)
    const clipX = hx - 16 * sc, clipY = hy - 30 * sc;
    if (S < 33.4) {
      const drop = ease.back(seg(S, 32.3, 32.8)), snap = ease.back(seg(S, 33.0, 33.3));
      const sx = 1180, sy = lerp(-60, 330, drop);
      const sw = 0.22 * Math.sin((S - 32.35) * 7) * Math.exp(-(S - 32.35) * 0.7);
      const px = lerp(sx + Math.sin(sw) * 40, clipX, snap), py = lerp(sy, clipY, snap);
      const wd = lerp(200, 96, snap);
      if (snap < 0.02) { c.strokeStyle = '#2b2233'; c.lineWidth = 4; c.beginPath(); c.moveTo(sx, -40); c.lineTo(px, py - 8); c.stroke(); }
      badge(c, kit, S, px, py, wd, lerp(sw, 0, snap));
    } else {
      const settle = 0.14 * Math.exp(-(S - 33.3) * 4) * Math.sin((S - 33.3) * 16);
      badge(c, kit, S, clipX, clipY - hop, 96 * (1 + 0.05 * pulse(S, 6)), settle);
    }
    burst(c, kit, S, clipX, clipY - 40, seg(S, 33.0, 33.7), 5, 8, 90, 200, 30, ['#ffe9a8', '#fff6d0', '#e99aa8']);

    // the secret folder flies in from the shelf and lights on 'tag'
    if (S >= 33.5) {
      const sx = 1590, sy = 520, ex = handX + 4, ey = handY - 12 - hop;
      const e = ease.back(fk), arc = Math.sin(Math.PI * fk) * 190;
      const fxp = lerp(sx, ex, e), fyp = lerp(sy, ey, e) - arc;
      const glowK = seg(S, 33.9, 34.25), bounce = S > 34.05 ? pulse(S, 5) : 0;
      const tilt = fk < 1 ? (1 - fk) * 0.5 + 0.18 * Math.sin(fk * 9) : 0.1 * Math.sin(S * 5) * 0.5 - 0.05 + 0.05 * bounce;
      c.save(); c.translate(fxp, fyp); c.rotate(tilt); c.scale(1 + 0.08 * bounce, 1 - 0.06 * bounce);
      if (glowK > 0) kit.glow(c, 0, -70, 240, 'rgba(255,224,130,A)', 0.55 * glowK * (0.8 + 0.2 * pulse(S, 4)));
      kit.folder(c, 0, 0, 190, { mode: M, S, open: 0.1 + 0.08 * bounce, glow: glowK });
      c.restore();
      burst(c, kit, S, fxp, fyp - 80, seg(S, 33.9, 34.6), 21, 8, 110, 230, 28, ['#ffe08a', '#fff6d0', '#8fd0c2']);
    }

    // the ring in the raised left hand, jingling
    if (grabbed) {
      const jing = Math.exp(-(S - 35.0) * 3.2);
      const rx = lhX, ry = lhY - 52 - 8 * Math.sin(Math.PI * Math.min(1, (S - 35.0) / 0.45));
      keyRing(c, kit, S, rx, ry, 150, 0.25 + 1.2 * jing);
      burst(c, kit, S, rx, ry, seg(S, 35.0, 35.6), 41, 7, 60, 150, 26, ['#fff6d0', '#ffe08a', '#8fd0c2']);
      if (S > 35.45) kit.star(c, rx + 70, ry - 60, 22 + 10 * pulse(S, 4), { kind: 'sparkle', col: '#fff6d0', S, rot: 0.4 });
    }
    c.restore();
    const fl = 0.85 * Math.exp(-(S - s0) * 7);
    if (fl > 0.01) { c.save(); c.globalAlpha = fl; c.fillStyle = '#fff4d0'; c.fillRect(0, 0, 1920, 1080); c.restore(); }
  };

  // ---- B2.2 -------------------------------------------------------------------------------------------------------
  // The night server room exactly as the fragment's opening frame (its world shifted by -100,-20 at zoom 1).
  function serverNight(c, S, kit) {
    kit.useS(S);
    const { h1, blob, wrect, fillInk, glow, wash } = kit;
    c.save(); c.translate(-100, -20);
    c.fillStyle = '#0d2b33'; c.fillRect(-800, -600, 3600, 2400);
    for (let i = 0; i < 9; i++) {
      c.globalAlpha = 0.55; c.fillStyle = i % 2 ? '#164650' : '#1b5560';
      c.beginPath(); blob(c, 80 + i * 250, 260 + (i % 3) * 150, 300, 230, 100 + i, 7, 12); c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = '#0a2127'; c.beginPath(); wrect(c, -800, 830, 3600, 1200, 200, 3, 80); c.fill();
    c.strokeStyle = 'rgba(246,236,212,.07)'; c.lineWidth = 3;
    for (let i = -6; i < 16; i++) { c.beginPath(); c.moveTo(i * 220, 835); c.lineTo(i * 360 - 700, 1300); c.stroke(); }
    glow(c, 1700, 300, 330, 'rgba(244,232,192,A)', 0.22);
    fillInk(c, () => blob(c, 1700, 300, 82, 82, 301, 2.5, 14), '#f4e8c0', 3);
    wash(c, '#d8c58a', 0.4, () => blob(c, 1678, 322, 26, 18, 302, 2, 8));
    for (let i = 0; i < 16; i++) {
      const sx = 200 + h1(i * 5) * 1500, sy = 120 + h1(i * 5 + 1) * 380, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2);
      c.strokeStyle = `rgba(246,236,212,${0.25 + 0.5 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 8, sy); c.lineTo(sx + 8, sy); c.moveTo(sx, sy - 8); c.lineTo(sx, sy + 8); c.stroke();
    }
    c.lineWidth = 7; c.lineCap = 'round';
    [[kit.PAL.ochre, 300], [kit.PAL.rose, 340], [kit.PAL.sage, 380]].forEach((q, k) => {
      c.strokeStyle = q[0]; c.globalAlpha = 0.6;
      c.beginPath(); c.moveTo(-200, q[1] + 150); c.bezierCurveTo(200, q[1] + 400, 500, q[1] - 80, 880, 820 - k * 14); c.stroke();
    });
    c.globalAlpha = 1;
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(236,190,110,.09)';
    c.beginPath(); c.moveTo(1030, -20); c.lineTo(1170, -20); c.lineTo(1650, 830); c.lineTo(520, 830); c.closePath(); c.fill(); c.restore();
    fillInk(c, () => wrect(c, 1020, -40, 160, 74, 310, 2, 40), '#caa05a', 3);
    kit.rack(c, 1205, 830, 500, { mode: 'night', S, boxes: [{ mood: 0 }, { mood: 0 }, { mood: 0 }] });
    c.restore();
  }

  const T4 = { garland: 41.6, board: 41.9, boardDur: 0.44, noteStart: 42.45, noteStep: 0.1, noteDur: 0.35, burst: [41.96, 42.7], folders: [43.38, 43.82, 43.98, 44.38], popDur: 0.28, jig: [43, 43.4], yeah: 44.76, whip: [44.92, 45.5], point: [43.3, 43.7] };
  // the same board scene retimed to the new lyric: board on 'Hiding', one folder per syllable group, wink on 'yeah'
  const TN = { garland: 35.9, board: 36.0, boardDur: 0.3, noteStart: 36.15, noteStep: 0.06, noteDur: 0.25, burst: [36.05, 36.65], folders: [36.5, 36.75, 37.0, 37.25], popDur: 0.2, jig: [36.3, 36.6], yeah: 37.5, whip: [37.62, 38.2], point: [36.4, 36.7] };
  function boardRoom(c, S, kit, api, T) {
    T = T || T4;
    const { ease, seg, lerp, pulse } = api;
    const M = 'dawn';
    kit.frame(c, M);
    kit.floor(c, M, { y: 810 });
    kit.useS(S);
    // wall garland of little lights so the room has a second mover
    kit.lights(c, 40, 20, 1840, 60, { S, mode: M, lit: 0.9, wave: 0.6, cell: 80, colors: ['#e99aa8', '#f2cf5b', '#9fd0cf', '#c7e3a6'] });

    // the corkboard pops onto the wall on "brand-new", notes stick on "message"/"board"
    const bk = ease.back(seg(S, T.board, T.board + T.boardDur));
    const cols = ['#f2cf5b', '#e99aa8', '#9fd0cf', '#c7e3a6'];
    const notes = Array.from({ length: 10 }, (_, i) => ({
      x: 0.12 + 0.76 * ((i * 0.381) % 1), y: 0.22 + 0.58 * kit.h1(i + 30), col: cols[i % 4], rot: (kit.h1(i + 3) - 0.5) * 0.2,
      k: seg(S, T.noteStart + i * T.noteStep, T.noteStart + T.noteDur + i * T.noteStep)
    }));
    c.save();
    c.translate(1060, 335); c.rotate(0.012 * Math.sin(S * 2.2)); c.scale(Math.max(0.001, bk) * (1 + 0.012 * pulse(S, 6)), Math.max(0.001, bk) * (1 + 0.012 * pulse(S, 6))); c.translate(-1060, -335);
    kit.corkboard(c, 560, 110, 1000, 450, { S, mode: M, seed: 31, notes });
    c.restore();
    burst(c, kit, S, 1060, 335, seg(S, T.burst[0], T.burst[1]), 7, 10, 330, 560, 34, ['#ffe9a8', '#fff6d0', '#e99aa8', '#9fd0cf']);

    // folders on the floor; a bean hides in each and pops up as the lyric names them
    const xs = [700, 960, 1220, 1480], pop = T.folders;
    const bcol = ['#8fd0c2', '#f0a58a', '#f2d488', '#c8b4e0'];
    const yeah = ease.back(seg(S, T.yeah, T.yeah + 0.24));
    for (let i = 0; i < 4; i++) {
      const fy = 846, e = ease.back(seg(S, pop[i], pop[i] + T.popDur));
      const jig = S > T.garland ? 0.02 * Math.sin(S * 6 + i * 1.7) * (1 - seg(S, T.jig[0], T.jig[1]) * 0.6) : 0;
      kit.shadow(c, xs[i], fy + 6, 112, 14, 0.25);
      const peek = 81 * e + (S > pop[i] ? 4 * Math.sin(S * 5 + i) : 0) + 30 * yeah * (i === 1 ? 1 : 0.5);
      if (e > 0.001) {
        kit.bean(c, xs[i], fy - 10 - peek, 130, {
          S, seed: 50 + i, body: bcol[i], mood: i === 1 && S > T.yeah ? 'wink' : 'smile', look: i === 1 ? 1 : (i % 2 ? -0.5 : 0.5),
          arm: S > T.yeah ? 'wave' : 'down', squash: 0.08 * pulse(S, 6) - 0.1 * (1 - e), tilt: jig
        });
      }
      c.save(); c.translate(xs[i], fy); c.rotate(jig); c.translate(-xs[i], -fy);
      kit.folder(c, xs[i], fy, 210, { mode: M, S, open: 0.5 + 0.3 * e, color: i % 2 ? '#e8b860' : '#e8c860' });
      c.restore();
    }
    burst(c, kit, S, xs[1], 600, seg(S, T.yeah, T.yeah + 0.54), 33, 7, 60, 150, 26, ['#ffe9a8', '#e99aa8']);
  }

  function board2(c, shot, S, t, api, kit, T) {
    const { ease, seg, lerp, pulse } = api;
    const pu = seg(S, T.whip[0], T.whip[1]), pe = ease.inOut(pu);
    const camX = 1920 * pe;
    if (camX < 1920) {
      c.save(); c.beginPath(); c.rect(0, 0, 1920 - camX, 1080); c.clip(); c.translate(-camX, 0);
      boardRoom(c, S, kit, api, T);
      c.restore();
    }
    if (camX > 0) {
      c.save(); c.beginPath(); c.rect(1920 - camX, 0, camX + 4, 1080); c.clip(); c.translate(1920 - camX, 0);
      serverNight(c, S, kit);
      c.restore();
    }
    // whip streaks while the room slides by
    if (pu > 0 && pu < 1) {
      const a = Math.sin(Math.PI * pu);
      c.save(); c.lineCap = 'round';
      for (let i = 0; i < 18; i++) {
        const y = 80 + kit.h1(i * 7) * 700, L = 300 + 700 * kit.h1(i * 7 + 1);
        const x = (kit.h1(i * 7 + 2) * 2400 - 200 + S * 3000 * kit.h1(i + 3)) % 2300 - 200;
        c.strokeStyle = `rgba(246,236,212,${0.22 * a})`; c.lineWidth = 3 + 6 * kit.h1(i * 7 + 4);
        c.beginPath(); c.moveTo(x, y); c.lineTo(x - L * a, y); c.stroke();
      }
      c.restore();
    }

    // hero: points at the board, looks at the folders, winks on "yeah", then trots right with the camera and
    // arrives in the fragment's first pose (x 460, feet 810, size 2.35 * 88, looking right, arms down)
    const trot = ease.inOut(seg(S, T.whip[0], T.whip[1]));
    const hx = lerp(250, 460, trot);
    const walking = pu > 0 && pu < 0.93;
    const hop = walking ? Math.abs(Math.sin(pu * Math.PI * 4)) * 30 * Math.sin(Math.PI * Math.min(1, pu * 1.1)) : 0;
    const size = lerp(250, 2.35 * 88, ease.smooth(seg(S, T.whip[0] - 0.02, T.whip[1])));
    const pointA = S < T.point[0] ? lerp(-0.2, -0.55, 0.5 + 0.5 * Math.sin(S * 5)) : lerp(-0.4, 0.75, ease.smooth(seg(S, T.point[0], T.point[1])));
    const down = ease.smooth(seg(S, T.whip[0] - 0.07, T.whip[0] + 0.23));
    const armR = lerp(pointA, 1.14, down);
    const wink = S > T.yeah && S < T.yeah + 0.29;
    const settle = pu >= 0.93;
    kit.shadow(c, hx, 816, 0.38 * size - hop * 0.3, 14, 0.3);
    kit.bean(c, hx, 810 - hop, size, {
      S, seed: 12, hero: true, mood: wink ? 'wink' : 'grin', look: lerp(1, 0.6, trot), arm: 'point', armR, walk: walking,
      squash: settle ? 0 : 0.1 * pulse(S, 6) * (1 - trot), bulb: pulse(S, 4)
    });
    if (S > T.whip[0] - 0.02 && S < T.whip[0] + 0.18) kit.star(c, hx + 90, 600 - hop, 30 * (1 - seg(S, T.whip[0] - 0.02, T.whip[0] + 0.18)) + 6, { kind: 'sparkle', col: '#ffe9a8', S });

    // night closes in on the whole picture as the server room arrives
    const nk = camX / 1920;
    if (nk > 0) {
      c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = nk;
      const g = c.createRadialGradient(960, 520, 300, 960, 540, 1250);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(8,24,32,.55)');
      c.fillStyle = g; c.fillRect(0, 0, 1920, 1080); c.restore();
    }
  }
  R('B2.2', (c, shot, S, t, api, kit) => board2(c, shot, S, t, api, kit, T4));
  window.SHOTS_NEW['B2.2'] = (c, shot, S, t, api, kit) => board2(c, shot, S, t, api, kit, TN);

  // ---- never seen: the fragment covers 45.5 s to 61.8 s ---------------------------------------------------------------
  ['B2.3', 'B2.4', 'B2.5', 'B2.6'].forEach(id => R(id, (c, shot, S, t, api, kit) => { /* covered by fragment.js */ }));
})();
