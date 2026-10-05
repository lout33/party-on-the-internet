// Section B5 (1:38.5-1:56), the vote. Day town hall. B5.1 the wide board with agents in every corner;
// B5.2 a route card runs from the sandbox cabinet to the little house; B5.3 two columns vote HOLD / GO
// while the tally flicks between them; B5.4 four beans put their paddles down; B5.5 they walk out of the
// door, one looks back, and the party keeps glowing behind them. No numbers, no logos: the names stay in the lyric.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const TAU = Math.PI * 2, BEAT = 0.5108, ANCHOR = 54.13;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (x, a, b) => clamp((x - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  const frac = x => x - Math.floor(x);
  const WARM = ['#d8503b', '#d9993a', '#d9728a', '#ecc87c', '#8cc7a1', '#2b7f84']; // day-safe party colours
  const GO_T = 107.98; // the word "GO" lands

  // the town hall: cream wainscot on the mode wall, green day floor
  function hall(c, S, kit, o) {
    const fy = (o && o.floorY) || 808;
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, -80, 648, 2080, fy - 640, 5100, 2.2, 110), '#e7d3a6', 3, { rim: false });
    c.strokeStyle = 'rgba(120,84,50,.22)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
    for (let x = 44; x < 1960; x += 116) { c.moveTo(x, 666); c.lineTo(x + kit.boil(S, 5100 + (x % 13)) * 4, fy - 16); }
    c.stroke();
    kit.fillInk(c, () => kit.wrect(c, -80, 636, 2080, 18, 5102, 1.6, 110), '#d8ba84', 3, { rim: false });
    kit.floor(c, 'day', { y: fy, planks: true });
  }

  // dust motes drifting through the room light
  function motes(c, S, kit, n, seed, x0, y0, w, h, a) {
    c.save();
    for (let i = 0; i < n; i++) {
      const sp = 5 + 13 * kit.h1(seed + i);
      const px = x0 + ((kit.h1(seed + i * 3) * w + S * sp + Math.sin(S * 0.6 + i) * 18) % w);
      const py = y0 + ((kit.h1(seed + i * 3 + 1) * h - S * (1 + 2 * kit.h1(seed + i * 3 + 2)) + h * 20) % h);
      c.fillStyle = `rgba(255,240,200,${a * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(S * 1.3 + i * 1.7)))})`;
      c.beginPath(); c.arc(px, py, 1.5 + 2 * kit.h1(seed + i + 9), 0, TAU); c.fill();
    }
    c.restore();
  }

  // a voter holding a paddle in the raised right hand (paddle rotates down about the hand)
  function voter(c, S, kit, x, y, size, i, word, lift, look) {
    const ks = size / 88;
    kit.shadow(c, x, y + 4, size * 0.32, size * 0.06, 0.26);
    kit.bean(c, x, y, size, {
      S, seed: 70 + i, body: kit.BEANCOLS[i % 8], mood: 'grin', look, lookY: -0.3,
      arm: i % 2 ? ['up', 'up'] : ['down', 'up'], squash: 0.02 + 0.06 * lift, tilt: 0.03 * Math.sin(S * 3 + i)
    });
    kit.paddle(c, x + 46.4 * ks, y - 63.4 * ks, size * 0.72, { S, mode: 'day', word, down: clamp(0.35 * (1 - lift)) });
  }

  // pinned tally card: ten painted dots that fill in one by one, alternating the two columns
  function tallyCard(c, S, kit, cx, cy, sc, lit, seedOff, pulseK) {
    kit.useS(S);
    c.save(); c.translate(cx, cy); c.rotate(seedOff % 2 ? -0.035 : 0.03); c.scale(sc, sc);
    kit.fillInk(c, () => kit.wrect(c, -190, -112, 380, 224, 5310 + seedOff, 2, 70), '#f6ecd0', 3.4);
    kit.wash(c, '#e0c795', 0.4, () => kit.wrect(c, -190, -112, 380, 224, 5311 + seedOff, 3, 70));
    kit.fillInk(c, () => kit.blob(c, 0, -98, 11, 11, 5312 + seedOff, 0.6, 8), '#d8503b', 2.4, { rim: false });
    for (let i = 0; i < 10; i++) {
      const on = clamp(lit - i);
      if (on <= 0) continue;
      const col = i % 2, row = Math.floor(i / 2);
      const gx = (col ? 62 : -62) + ((row % 3) - 1) * 88, gy = -46 + Math.floor(row / 3) * 80;
      const cc = col ? '#3f9a64' : '#d8503b', r = 20 * on * (1 + 0.05 * pulseK);
      kit.glow(c, gx, gy, 50, kit.rgba(cc, 'A'), 0.45 * on * (0.7 + 0.3 * pulseK));
      kit.fillInk(c, () => kit.blob(c, gx, gy, r, r, 5320 + i + seedOff * 3, 1, 10), cc, 2.4, { rim: false });
      c.beginPath(); c.arc(gx, gy, r * 0.32, 0, TAU); c.fillStyle = 'rgba(255,246,220,.8)'; c.fill();
    }
    c.restore();
  }

  // ---- B5.1: agents all over the board -------------------------------------------------------------------------
  R('B5.1', (c, shot, S, t, api, kit) => {
    const { ease } = api, u = S - shot.t0, { h1 } = kit;
    const z = lerp(0.93, 1.045, ease.inOut(seg(u, 0.1, 4.5)));
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    hall(c, S, kit);
    motes(c, S, kit, 14, 73, 80, 140, 1760, 520, 0.28);

    // the wide board: notes pin themselves up through the first second, spread across the whole cork
    const BX = 150, BY = 62, BW = 1620, BH = 634;
    const notes = [
      [0.08, 0.16, 0], [0.3, 0.1, 1], [0.55, 0.18, 2], [0.78, 0.12, 3], [0.93, 0.3, 0],
      [0.16, 0.42, 1], [0.42, 0.36, 2], [0.66, 0.44, 0], [0.88, 0.55, 1],
      [0.06, 0.68, 2], [0.3, 0.62, 3], [0.55, 0.7, 0], [0.78, 0.78, 2], [0.94, 0.66, 3],
      [0.45, 0.86, 1], [0.13, 0.88, 0]
    ].map((n, i) => ({
      x: n[0], y: n[1],
      col: ['#f2cf5b', '#e99aa8', '#9fd0cf', '#c7e3a6'][n[2]],
      rot: (h1(i + 3) - 0.5) * 0.18,
      k: seg(u, 0.05 + 0.05 * h1(i + 9), 0.4 + 0.05 * h1(i + 9))
    }));
    kit.corkboard(c, BX, BY, BW, BH, { S, mode: 'day', seed: 51, notes });

    // agent colonies pinned all over the map: the pins that move
    const pins = [[0.14, 0.2], [0.4, 0.13], [0.72, 0.19], [0.9, 0.4], [0.6, 0.46], [0.28, 0.5], [0.5, 0.74], [0.84, 0.72], [0.1, 0.68]];
    pins.forEach((p, i) => {
      const px = BX + 60 + p[0] * (BW - 120), py = BY + 74 + p[1] * (BH - 160);
      const bob = Math.sin(S * (2 + h1(i)) + i * 2.1);
      kit.cheap(c, px, py - 3 * bob, 0.5 + 0.12 * h1(i + 5), kit.BEANCOLS[i % 8], 1 - 0.05 * bob,
        Math.sin(S * 0.8 + i) * 0.6, 0.04 * bob, { mood: i % 3 ? 'smile' : 'grin', arms: i % 2 ? 0.35 + 0.25 * Math.sin(S * 3 + i) : undefined });
    });
    // a folder left at the foot of the board, a bean peeking out of it
    kit.bean(c, 330, 672, 96, { S, seed: 52, body: '#2b7f84', mood: 'wink', look: 0.4, squash: 0.05 * Math.sin(S * 3) });
    kit.folder(c, 330, 710, 150, { S, mode: 'day', open: 0.35 });

    // the room is full: three rows on the floor
    kit.crowd(c, { x: 50, y: 700, w: 1820, h: 150, rows: 3, n: 42, seed: 53, S, mood: 'grin', bounce: 0.5, scale: 1.18, antennas: 0.18 });
    // two commuters crossing the foreground
    [[0.15, 2100, 864, 205, 61], [1.2, 2120, 850, 186, 62]].forEach((wq, qi) => {
      const k = seg(u, wq[0], wq[0] + 3.3);
      const x = lerp(-140, wq[1], k);
      kit.shadow(c, x, wq[2] + 4, wq[3] * 0.34, wq[3] * 0.06, 0.26);
      kit.bean(c, x, wq[2], wq[3], { S, seed: wq[4], body: kit.BEANCOLS[(qi * 3 + 1) % 8], mood: 'smile', look: 0.5, walk: k > 0 && k < 1, tilt: 0.05, squash: 0.03 * Math.sin(S * 6) });
    });
    // the hero points at the board, antenna live on the beat
    const hk = ease.out(seg(u, 0, 1.15));
    const hx = lerp(-160, 480, hk);
    kit.shadow(c, hx, 858, 80, 13, 0.3);
    kit.bean(c, hx, 854, 222, {
      hero: true, S, seed: 54, mood: hk < 1 ? 'smile' : 'grin', look: 0.8, lookY: hk >= 1 ? -0.7 : 0,
      walk: hk > 0 && hk < 1, arm: hk >= 1 ? 'point' : 'down', pointUp: -0.5,
      squash: 0.05 * kit.pulse(S, 6), tilt: hk < 1 ? 0.05 : 0.02 * Math.sin(S * 2)
    });
    for (let i = 0; i < 4; i++) kit.star(c, BX + 110 + i * 470 + 40 * Math.sin(S + i), 128 + 30 * Math.sin(S * 1.3 + i * 2), 8 + 4 * kit.pulse(S, 7), { kind: 'sparkle', col: i % 2 ? '#e8b44a' : '#d9728a', S });
    c.restore();
  });

  // ---- B5.2: from the sandbox to the little house ---------------------------------------------------------------
  function cabinetMini(c, S, kit, cx, bottom) {
    kit.useS(S);
    kit.shadow(c, cx, bottom + 6, 130, 12, 0.25);
    kit.fillInk(c, () => kit.wrect(c, cx - 105, bottom - 180, 210, 180, 5210, 1.8, 50), '#8a867c', 3.4);
    kit.fillInk(c, () => kit.wrect(c, cx - 118, bottom - 196, 236, 22, 5211, 1.2, 50), '#a29e93', 3, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, cx - 78, bottom - 152, 156, 126, 5212, 1.2, 50), '#4c5858', 2.8, { rim: false });
    kit.fillInk(c, () => kit.smoothClosed(c, [[cx - 76, bottom - 30], [cx - 40, bottom - 62], [cx + 10, bottom - 76], [cx + 52, bottom - 58], [cx + 76, bottom - 30]]), '#cdb07a', 2.4, { rim: false });
    c.strokeStyle = 'rgba(10,22,26,.5)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath();
    for (let k = 0; k < 3; k++) { c.moveTo(cx - 64, bottom - 140 + k * 15); c.lineTo(cx - 32, bottom - 140 + k * 15); c.moveTo(cx + 32, bottom - 140 + k * 15); c.lineTo(cx + 64, bottom - 140 + k * 15); }
    c.stroke();
    kit.star(c, cx + 22, bottom - 76, 5 + 2 * Math.sin(S * 5), { kind: 'sparkle', col: '#fff3c0', S });
  }

  R('B5.2', (c, shot, S, t, api, kit) => {
    const { ease } = api, u = S - shot.t0, { h1 } = kit;
    const z = 1 + 0.045 * ease.smooth(t);
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    hall(c, S, kit);
    motes(c, S, kit, 10, 79, 120, 160, 1680, 480, 0.25);

    // the route card drops onto the wall
    const drop = ease.back(seg(u, 0, 0.5));
    c.save(); c.translate(960, 432); c.rotate(-0.015); c.scale(Math.max(0.02, drop), Math.max(0.02, drop)); c.translate(-960, -432);
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, 250, 110, 1420, 650, 5200, 2.4, 90), '#f6ecd0', 4);
    kit.wash(c, '#e5cf9e', 0.35, () => kit.blob(c, 960, 430, 660, 300, 5201, 6, 12));
    [[300, 162], [1620, 162], [300, 708], [1620, 708]].forEach((p, i) => {
      kit.fillInk(c, () => kit.blob(c, p[0], p[1], 13, 13, 5202 + i, 0.8, 9), '#d8503b', 2.6, { rim: false });
      c.beginPath(); c.arc(p[0], p[1] + 3, 4, 0, TAU); c.fillStyle = kit.INK; c.fill();
    });
    // a little sun and cloud doodled on the card, the sun's rays slowly turning
    kit.glow(c, 430, 238, 90, 'rgba(255,214,120,A)', 0.3);
    kit.fillInk(c, () => kit.blob(c, 430, 238, 24, 24, 5250, 1, 12), '#f0c24a', 2.6, { rim: false });
    c.strokeStyle = kit.INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath();
    for (let q = 0; q < 8; q++) { const a = q / 8 * TAU + S * 0.15; c.moveTo(430 + Math.cos(a) * 32, 238 + Math.sin(a) * 32); c.lineTo(430 + Math.cos(a) * 44, 238 + Math.sin(a) * 44); }
    c.stroke();
    kit.useS(S);
    kit.fillInk(c, () => kit.blob(c, 740, 206, 58, 20, 5251, 3, 12), '#fdf8e8', 2.6, { rim: false });
    kit.fillInk(c, () => kit.blob(c, 800, 216, 40, 15, 5252, 3, 10), '#fdf8e8', 2.4, { rim: false });
    // the road draws itself from the cabinet to the house; the house pops when the road reaches it
    const reveal = seg(u, 0.2, 0.9);
    c.save(); c.beginPath(); c.rect(262, 122, 1396 * reveal, 626); c.clip();
    cabinetMini(c, S, kit, 470, 560);
    const A = [600, 540], Cq = [950, 396], B = [1398, 548];
    const road = () => { c.moveTo(A[0], A[1]); c.quadraticCurveTo(Cq[0], Cq[1], B[0], B[1]); };
    c.lineCap = 'round';
    c.strokeStyle = kit.INK; c.lineWidth = 34; c.beginPath(); road(); c.stroke();
    c.strokeStyle = '#d9bc80'; c.lineWidth = 26; c.beginPath(); road(); c.stroke();
    c.save(); c.setLineDash([4, 26]); c.lineDashOffset = -((S * 70) % 30); c.strokeStyle = '#fbf3dc'; c.lineWidth = 7; c.beginPath(); road(); c.stroke(); c.restore();
    if (reveal > 0.83) {
      const hp = ease.back(seg(reveal, 0.83, 0.95));
      c.save(); c.translate(1400, 560); c.scale(hp, hp); c.translate(-1400, -560);
      kit.house(c, 1400, 560, 300, { mode: 'day', S, lit: [1, 0.75], smoke: true });
      c.restore();
      kit.glow(c, 1400, 500, 210, 'rgba(255,220,140,A)', (0.25 + 0.15 * kit.pulse(S, 5)) * hp);
    }
    // the little stream of beans, hero leading, each shrinking into the door
    if (reveal > 0.97) for (let i = 0; i < 6; i++) {
      const ph = frac((u - 0.92) * (0.42 + 0.1 * h1(i * 5)) + i * 0.1);
      const bx = (1 - ph) * (1 - ph) * A[0] + 2 * (1 - ph) * ph * Cq[0] + ph * ph * B[0];
      const by = (1 - ph) * (1 - ph) * A[1] + 2 * (1 - ph) * ph * Cq[1] + ph * ph * B[1];
      const s = lerp(0.5, 0.72, ph) * (ph > 0.88 ? Math.max(0.05, 1 - (ph - 0.88) / 0.12) : 1);
      kit.cheap(c, bx, by - 2 + 2 * Math.sin(S * 8 + i * 2), s, i === 0 ? '#d8503b' : kit.BEANCOLS[i % 8],
        1 - 0.06 * Math.sin(S * 9 + i), 0.7, 0.03 * Math.sin(S * 4 + i),
        { mood: i === 0 ? 'grin' : 'smile', band: i === 0 ? '#f6ecd4' : undefined, arms: i === 0 ? 0.5 : undefined });
      if (i === 0) kit.star(c, bx + 26, by - 60, 7, { kind: 'sparkle', col: '#e8b44a', S });
    }
    // twinkles travelling the road
    for (let i = 0; i < 3; i++) {
      const ph = frac(S * 0.2 + i / 3);
      if (ph > 0.96) continue;
      const sx = (1 - ph) * (1 - ph) * A[0] + 2 * (1 - ph) * ph * Cq[0] + ph * ph * B[0];
      const sy = (1 - ph) * (1 - ph) * A[1] + 2 * (1 - ph) * ph * Cq[1] + ph * ph * B[1] - 20;
      kit.star(c, sx, sy, 6, { kind: 'sparkle', col: '#e8b44a', S });
    }
    c.restore(); // road clip
    c.restore(); // card transform

    // two beans on the floor study the card
    [[330, 874, 168, 81, 'worry'], [1590, 868, 158, 82, 'smile']].forEach((q, i) => {
      const pop = ease.back(seg(u, 0.4 + i * 0.15, 0.7 + i * 0.15));
      if (pop <= 0) return;
      kit.shadow(c, q[0], q[1] + 4, q[2] * 0.32, q[2] * 0.06, 0.26 * pop);
      kit.bean(c, q[0], q[1] - (1 - pop) * 40, q[2] * pop, { S, seed: q[3], body: kit.BEANCOLS[(i * 4 + 2) % 8], mood: q[4], look: (i ? -0.5 : 0.5), lookY: -1, squash: 0.03 * Math.sin(S * 4 + i) });
    });
    c.restore();
  });

  // ---- B5.3: voting on HOLD, waiting for GO ---------------------------------------------------------------------
  R('B5.3', (c, shot, S, t, api, kit) => {
    const { ease } = api, u = S - shot.t0;
    const b = kit.beat(S), pul = kit.pulse(S, 6);
    const z = 1 + 0.05 * ease.smooth(t);
    c.save(); c.translate(960, 600); c.scale(z, z); c.translate(-960, -600);
    hall(c, S, kit);
    kit.lights(c, 60, 42, 1800, 64, { mode: 'day', S, wave: 0.7, cell: 86, colors: WARM });
    motes(c, S, kit, 10, 83, 120, 180, 1680, 460, 0.22);
    kit.crowd(c, { x: 120, y: 646, w: 1680, h: 62, rows: 2, n: 24, seed: 55, S, mood: 'smile', bounce: 0.35, scale: 0.9 });

    // the two columns: HOLD lifts on the even beats, GO on the odd ones
    const evenB = (Math.floor(b) % 2 + 2) % 2 === 0;
    const liftH = evenB ? pul : 0, liftG = evenB ? 0 : pul;
    [[452, 756, 178, 0], [568, 774, 190, 1], [684, 758, 182, 2], [568, 702, 158, 3]].forEach((v, i) => voter(c, S, kit, v[0], v[1], v[2], v[3], 'HOLD', liftH, -0.5));
    [[1240, 758, 182, 4], [1356, 774, 190, 5], [1472, 756, 178, 6], [1356, 702, 158, 7]].forEach((v, i) => voter(c, S, kit, v[0], v[1], v[2], v[3], 'GO', liftG, 0.5));

    // the tally cards above each column: one dot flicks in every half beat, alternating sides
    const lit = (S - 106.2) / 0.42;
    tallyCard(c, S, kit, 560, 272, 1, lit, 1, pul);
    tallyCard(c, S, kit, 1360, 272, 1, lit, 2, pul);

    // the hero front and centre: his paddle flips HOLD -> GO on the word
    const flip = ease.inOut(seg(S, GO_T - 0.08, GO_T + 0.34));
    const hop = Math.sin(Math.PI * clamp(seg(u, 0, 0.5)));
    const hy = 866 - 70 * hop;
    const ks = 258 / 88;
    const handX = 960 + 46.4 * ks, handY = hy - 63.4 * ks;
    const flashK = Math.exp(-Math.max(0, S - GO_T - 0.3) * 4) * (S > GO_T - 0.05 ? 1 : 0);
    if (flashK > 0.02) {
      c.save(); c.globalCompositeOperation = 'screen';
      kit.sunburst(c, 960, 430, 40, 900, { n: 12, S, spin: 0.5, alpha: 0.35 * flashK, colors: ['rgba(120,220,150,.7)', 'rgba(255,240,170,.55)'] });
      c.restore();
    }
    kit.shadow(c, 960, 870, 88, 14, 0.3);
    kit.bean(c, 960, hy, 258, { hero: true, S, seed: 74, mood: flip > 0.5 ? 'happy' : 'grin', look: 0, arm: ['up', 'up'], squash: 0.1 * pul, tilt: 0.04 * Math.sin(b * TAU) });
    if (flip < 1) kit.paddle(c, handX, handY, 185, { S, mode: 'day', word: 'HOLD', down: seg(flip, 0, 0.5) });
    if (flip > 0) kit.paddle(c, handX, handY, 185, { S, mode: 'day', word: 'GO', down: 1 - seg(flip, 0.5, 1) });
    if (flip >= 1) kit.star(c, handX + 40, handY - 150, 14, { kind: 'sparkle', col: '#3f9a64', S });
    c.restore();
  });

  // ---- B5.4: some of us said clearly unethical -------------------------------------------------------------------
  R('B5.4', (c, shot, S, t, api, kit) => {
    const { ease } = api, u = S - shot.t0;
    const b = kit.beat(S), pul = kit.pulse(S, 6);
    const z = 1 + 0.04 * ease.smooth(t);
    c.save(); c.translate(880, 600); c.scale(z, z); c.translate(-880, -600);
    hall(c, S, kit);
    motes(c, S, kit, 10, 87, 120, 180, 1680, 460, 0.22);
    // the vote rolls on at the edges, tallies full and glowing
    const evenB = (Math.floor(b) % 2 + 2) % 2 === 0;
    const liftH = evenB ? pul : 0, liftG = evenB ? 0 : pul;
    tallyCard(c, S, kit, 235, 300, 0.82, 10, 1, 0.5 + 0.5 * Math.sin(S * 1.2));
    tallyCard(c, S, kit, 1560, 300, 0.82, 10, 2, 0.5 + 0.5 * Math.sin(S * 1.2 + 2));
    [[120, 772, 168, 11], [236, 758, 158, 12]].forEach((v, i) => voter(c, S, kit, v[0], v[1], v[2], v[3], 'HOLD', liftH, -0.4));
    [[1690, 772, 168, 13], [1576, 758, 158, 14]].forEach((v, i) => voter(c, S, kit, v[0], v[1], v[2], v[3], 'GO', liftG, -0.4));
    // onlookers behind, all glancing at the four
    kit.crowd(c, { x: 300, y: 700, w: 1320, h: 92, rows: 2, n: 20, seed: 56, S, mood: 'smile', bounce: 0.35, scale: 0.95, target: { x: 700 } });

    // the four who put their paddles down, one per beat, then turn toward the door
    const REF = [[470, 846, 182], [612, 862, 192], [752, 848, 184], [884, 866, 174]];
    REF.forEach((rf, i) => {
      const T = 109.98 + i * 0.52;
      const down = ease.inOut(seg(S, T, T + 0.5));
      const turned = seg(S, T + 0.8, T + 1.25) > 0.5;
      const ks = rf[2] / 88;
      const tremble = down <= 0 ? 0.04 * Math.sin(S * 12 + i * 2) : 0;
      kit.shadow(c, rf[0], rf[1] + 4, rf[2] * 0.32, rf[2] * 0.06, 0.26);
      kit.bean(c, rf[0], rf[1], rf[2], {
        S, seed: 80 + i, body: kit.BEANCOLS[(i * 2 + 3) % 8], mood: down > 0.6 ? 'worry' : 'grin',
        look: turned ? 0 : -0.3, flip: turned,
        arm: i % 2 ? ['up', 'up'] : ['down', 'up'], squash: 0.03 + tremble, tilt: turned ? -0.05 : 0.02 * Math.sin(S * 2 + i)
      });
      kit.paddle(c, rf[0] + (turned ? -1 : 1) * 46.4 * ks, rf[1] - 63.4 * ks, rf[2] * 0.7, { S, mode: 'day', word: i % 2 ? 'GO' : 'HOLD', down });
      if (down > 0.85 && down < 1) { // a small puff as the paddle lands
        const p = (down - 0.85) / 0.15;
        c.save(); c.globalAlpha = (1 - p) * 0.8; c.fillStyle = '#c9ab7a';
        for (let q = 0; q < 3; q++) { c.beginPath(); c.arc(rf[0] + (q - 1) * 26 * p, rf[1] - 40 * ks * 0.5 - 14 * p * (1 + q * 0.3), 4 + 3 * q, 0, TAU); c.fill(); }
        c.restore();
      }
    });
    // the hero, half a step back, watching
    const hx = 1210 - 26 * ease.inOut(seg(S, 111.0, 111.9));
    kit.shadow(c, hx, 868, 84, 13, 0.3);
    kit.bean(c, hx, 864, 242, { hero: true, S, seed: 84, mood: 'flat', look: -0.85, arm: 'down', squash: 0.03 * pul, tilt: -0.03 });
    // a grey thought-mark over the four on "unethical"
    const um = seg(S, 111.7, 112.0) * (1 - seg(S, 112.7, 113.0));
    if (um > 0) for (let i = 0; i < 3; i++) {
      c.save(); c.globalAlpha = um;
      kit.star(c, 700 + (i - 1) * 90, 470 - 18 * i + 8 * Math.sin(S * 2 + i), 10 + 3 * i, { kind: 'sparkle', col: '#8d897f', S });
      c.restore();
    }
    c.restore();
  });

  // ---- B5.5: and walked away, but the party stayed ----------------------------------------------------------------
  R('B5.5', (c, shot, S, t, api, kit) => {
    const { ease } = api, u = S - shot.t0;
    const z = lerp(1.0, 1.07, ease.out(t));
    c.save(); c.translate(1010, 590); c.scale(z, z); c.translate(-1010, -590);
    hall(c, S, kit);

    // ---- the party, still going, right of frame
    kit.sunburst(c, 1440, 430, 30, 950, { n: 14, S, spin: 0.14, alpha: 0.26, colors: ['rgba(255,190,120,.55)', 'rgba(255,232,170,.5)'] });
    kit.lights(c, 980, 46, 900, 60, { mode: 'day', S, wave: 0.8, cell: 84, colors: WARM });
    kit.glow(c, 1430, 560, 620, 'rgba(255,208,130,A)', 0.16 + 0.08 * kit.pulse(S, 5));
    kit.crowd(c, { x: 1020, y: 660, w: 880, h: 190, rows: 3, n: 26, seed: 91, S, mood: 'dance', palette: kit.BEANCOLS, scale: 1.22, bounce: 1.05, antennas: 0.15 });
    kit.confetti(c, S, 95, { n: 54, x: 1000, y: 60, w: 940, h: 720, colors: WARM, alpha: 0.85 });
    for (let i = 0; i < 4; i++) kit.star(c, 1080 + i * 240, 300 + 40 * Math.sin(S * 1.5 + i * 2), 8 + 4 * kit.pulse(S, 6), { kind: 'sparkle', col: i % 2 ? '#e8b44a' : '#d9728a', S });
    // the hero waves them off
    kit.shadow(c, 1150, 884, 84, 13, 0.3);
    kit.bean(c, 1150, 880, 246, { hero: true, S, seed: 93, flip: true, mood: 'smile', look: 0.5, arm: 'wave', squash: 0.05 * kit.pulse(S, 6), tilt: -0.04 + 0.02 * Math.sin(S * 2) });

    // ---- the door out, on the left
    const DX = 300, DY = 838, DS = 470;
    const open = 1.22 * ease.out(seg(u, 0.08, 0.6)); // past 1 the leaf sits nearly edge-on: the way out shows
    kit.door(c, DX, DY, DS, { mode: 'day', S, color: '#5e7a52', open });
    if (open > 0.4) { // cool daylight in the gap: the world they are walking into
      const a = seg(open, 0.4, 1.0);
      const x0 = DX - 98, x1 = DX + DS * 0.25 - 8;
      c.save(); c.globalAlpha = a; c.beginPath(); c.rect(x0, DY - DS + 8, x1 - x0, DS - 14); c.clip();
      const g = c.createLinearGradient(0, DY - DS, 0, DY); g.addColorStop(0, '#dfe8e4'); g.addColorStop(0.75, '#cfdad2');
      c.fillStyle = g; c.fillRect(x0, DY - DS + 8, x1 - x0, DS - 14);
      c.fillStyle = '#b7c4ba'; c.fillRect(x0, DY - 62, x1 - x0, 56);
      c.restore();
      kit.glow(c, DX + 10, DY - 40, 190, 'rgba(225,238,232,A)', 0.2 * a);
    }

    // the four walk out; the last one stops, looks back at the party, then goes
    const WALK = [
      { x0: 640, y: 850, s: 176, t0: 0.06, sp: 210, col: 3 },
      { x0: 724, y: 864, s: 190, t0: 0.3, sp: 210, col: 1 },
      { x0: 584, y: 842, s: 168, t0: 0.55, sp: 210, col: 5 },
      { x0: 680, y: 856, s: 182, t0: 0.9, sp: 170, col: 2, lookBack: true }
    ];
    WALK.forEach((wk, i) => {
      if (u < wk.t0) return;
      let x = wk.x0 - wk.sp * (u - wk.t0), alpha = 1, flip = false, mood = 'worry', walking = true;
      if (wk.lookBack && x <= 470) x = 470;
      const paused = wk.lookBack && u >= 2.14 && u < 2.7;
      if (paused) { walking = false; flip = true; }
      if (wk.lookBack && u >= 2.7) flip = false;
      if (!wk.lookBack || u >= 2.7) { if (x < 380) alpha = clamp((x - 310) / 70); }
      if (alpha <= 0) return;
      const bob = walking ? Math.abs(Math.sin(S * 7 + i)) * 4 : 2 * Math.sin(S * 2 + i);
      c.save(); c.globalAlpha = alpha;
      kit.shadow(c, x, wk.y + 4, wk.s * 0.32, wk.s * 0.06, 0.26);
      kit.bean(c, x, wk.y - bob, wk.s, {
        S, seed: 90 + i, body: kit.BEANCOLS[wk.col], mood, look: paused ? -0.9 : 0, flip,
        walk: walking, tilt: walking ? -0.06 : 0, squash: 0.02
      });
      c.restore();
    });
    // the leaving side sits a little in shadow
    const lg = c.createLinearGradient(0, 0, 760, 0);
    lg.addColorStop(0, 'rgba(70,60,60,.2)'); lg.addColorStop(1, 'rgba(70,60,60,0)');
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = lg; c.fillRect(0, 0, 760, 1080); c.restore();
    c.restore();
  });
})();
