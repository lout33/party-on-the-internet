// Section C6 (1:56-2:16), party #2: the same room as party #1, bigger and wilder, at night.
// C6.1 conga line walks the room past a window and toward a lit doorway; C6.2 strobing string-lights, crowd, confetti;
// C6.3 crowd surge, the hero carried overhead; C6.4 everything at once, the chair waiting in the corner;
// C6.5 (0.56 s) hard cut to the dark lab: a huge zzz cloud, party glow through the window.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const MODE = 'party-night';
  const PINK = '#ff4fb0', YEL = '#ffd62e', SKY = '#2fb4ff', LIME = '#8be04a', ORG = '#ff8a3d', VIO = '#a56bff';

  const frac = x => x - Math.floor(x);

  // deep pink / violet sunburst on the wall, breathing with the beat
  function backdrop(c, S, kit, cx, cy, spin) {
    kit.sunburst(c, cx, cy, 0, 2700, { n: 22, S, spin: spin === undefined ? 0.12 : spin, alpha: 1, colors: ['rgba(255,79,176,.34)', 'rgba(104,40,170,.40)'] });
    kit.glow(c, cx, cy, 780, 'rgba(255,130,210,A)', 0.30 + 0.14 * kit.pulse(S, 5));
  }

  // checker dance floor in deep pink / amber; the colours swap every beat. scroll moves it sideways.
  function danceFloor(c, S, kit, y0, scroll) {
    kit.floor(c, MODE, { y: y0, planks: false });
    kit.useS(S);
    const b = Math.floor(kit.beat(S));
    const pa = kit.K(PINK, 0.30), pb = kit.K(YEL, 0.52);
    c.save();
    for (let r = 0; r < 4; r++) {
      const wq = 150 + r * 14, y1 = y0 + r * r * 8 + r * 50, hh = 50 + r * 18;
      const sh = ((scroll * (0.7 + 0.3 * r / 3)) % (wq * 2) + wq * 2) % (wq * 2);
      for (let q = -2; q < Math.ceil(1920 / wq) + 3; q++) {
        c.fillStyle = ((q + r + b) & 1) === 0 ? pa : pb;
        c.beginPath(); kit.wrect(c, q * wq - sh - 10, y1, wq + 6, hh - 4, 1130 + r * 40 + ((q % 40) + 40) % 40, 1.5, 70); c.fill();
      }
    }
    c.restore();
  }

  function streamers(c, S, kit, n, seed) {
    c.save(); c.lineCap = 'round'; c.globalAlpha = 0.92;
    for (let i = 0; i < n; i++) {
      const x0 = (i + 0.5) / n * 2000 - 40, ph = S * 2 + i * 1.3 + seed;
      c.strokeStyle = kit.HOT[(i + seed) % 6]; c.lineWidth = 10 + (i % 3) * 3;
      c.beginPath(); c.moveTo(x0, -20);
      for (let k = 1; k <= 8; k++) c.lineTo(x0 + Math.sin(ph + k * 0.7) * 34 * (k / 3), -20 + k * (46 + 14 * (i % 3)));
      c.stroke();
    }
    c.restore();
  }

  // deepen everything toward night after the picture is drawn; light sources go on top afterwards
  function nightTint(c, k) {
    c.save(); c.globalCompositeOperation = 'multiply';
    c.fillStyle = `rgb(${Math.round(255 - 70 * k)},${Math.round(255 - 105 * k)},${Math.round(255 - 30 * k)})`;
    c.fillRect(-100, -100, 2120, 1280); c.restore();
  }

  // wandering coloured spots on floor and wall
  function spots(c, S, kit, n, y0, y1, a) {
    const pul = kit.pulse(S, 5);
    for (let k = 0; k < n; k++) {
      const ang = S * 0.55 + k * 0.9, col = [PINK, SKY, YEL, LIME, ORG, VIO][k % 6];
      kit.glow(c, 960 + Math.cos(ang) * (420 + 460 * kit.h1(k + 3)), y0 + (y1 - y0) * (0.5 + 0.5 * Math.sin(ang * 1.3 + k)), 160 + 60 * kit.h1(k), kit.rgba(col, 'A'), a * (0.6 + 0.4 * pul));
    }
  }

  function beatFlash(c, S, kit, a) {
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,200,240,${a * kit.pulse(S, 6)})`; c.fillRect(-100, -100, 2120, 1280); c.restore();
  }

  // the world outside the window: night sky, fireworks, the other house, and a tiny conga walking into it
  function outside(c, x, y, w, h, S, u, kit) {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#1d1458'); g.addColorStop(1, '#8a1f78');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    const cols = [SKY, PINK, YEL];
    for (let q = 0; q < 3; q++) {
      const ph = frac(S * 0.6 + q * 0.37), fx = x + w * (0.2 + q * 0.3), fy = y + h * (0.22 + (q % 2) * 0.16);
      c.strokeStyle = cols[q]; c.lineWidth = 6; c.lineCap = 'round'; c.globalAlpha = 1 - ph;
      for (let r = 0; r < 12; r++) { const a = r / 12 * 6.283; c.beginPath(); c.moveTo(fx + Math.cos(a) * (ph * 36 + 10), fy + Math.sin(a) * (ph * 36 + 10)); c.lineTo(fx + Math.cos(a) * (ph * 74 + 22), fy + Math.sin(a) * (ph * 74 + 22)); c.stroke(); }
      c.globalAlpha = 1;
    }
    const gy = y + h * 0.9;
    c.fillStyle = '#2a1034'; c.beginPath(); kit.wrect(c, x - 20, gy - 6, w + 40, h * 0.3, 1331, 4, 80); c.fill();
    const hx = x + w * 0.74, doorX = hx;
    // the walking line first, so the house hides the beans that have gone in
    const head = x + w * 0.1 + 62 * u;
    for (let i = 0; i < 8; i++) {
      const bx = head - i * 34, k = kit.clamp((doorX - 6 - bx) / 40);
      if (bx < x + 6 || k <= 0) continue;
      kit.bean(c, bx, gy + 2 - Math.abs(Math.sin(S * 7 + i)) * 5, 40 * Math.min(1, k + 0.2), { S, seed: 300 + i, body: [PINK, YEL, SKY, LIME, ORG, VIO][i % 6], mood: 'grin', arm: 'up', hero: i === 0 });
    }
    kit.house(c, hx, gy + 4, 200, { mode: MODE, S, lit: 1, wall: '#c988b0', roof: '#7a3a68' });
  }

  // ---- C6.1: the conga line ------------------------------------------------------------------------------
  R('C6.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), pul = kit.pulse(S, 5);
    const offF = 275 * u, offW = 150 * u;
    const push = 1 + 0.03 * ease.smooth(t) + 0.02 * pul;
    c.save(); c.translate(960, 640); c.scale(push, push); c.translate(-960, -640);

    backdrop(c, S, kit, 1000, 420, 0.14);
    // wall: window sliding past, then the lit doorway arriving
    const wx = 1000 - offW, wy = 150, ww = 560, wh = 380;
    kit.window(c, wx, wy, ww, wh, { mode: MODE, S, plant: false, mullions: true, draw: (cc, x, y, w, h) => outside(cc, x, y, w, h, S, u, kit) });
    const dx = 2250 - offW;
    kit.door(c, dx, 800, 470, { mode: MODE, S, color: '#7a3a68', open: 1, glow: true });
    kit.glow(c, dx, 600, 420, 'rgba(255,170,220,A)', 0.35 + 0.15 * pul);
    streamers(c, S, kit, 9, 1);
    kit.discoBall(c, 300, 200, 70, { S, spots: false });
    danceFloor(c, S, kit, 800, offF);

    // the conga: hero in front, snake travelling down the line
    const N = 12, heroX = 1400 + 22 * Math.sin(u * 1.4);
    const list = [];
    for (let i = 0; i < N; i++) {
      const wob = Math.sin(u * 4.1 - i * 0.9);
      const x = heroX - i * 160 + 14 * Math.sin(b * 6.283 - i * 0.6);
      const y = i === 0 ? 872 : 842 + 30 * wob;
      list.push({ i, x, y });
    }
    list.sort((p, q) => p.y - q.y || q.i - p.i);
    for (const p of list) {
      const i = p.i;
      const pop = ease.back(seg(u, 0.05 + i * 0.07, 0.05 + i * 0.07 + 0.32));
      if (pop <= 0) continue;
      const f = frac(b - i * 0.16), hop = Math.sin(Math.PI * f);
      const size = (i === 0 ? 250 : lerp(155, 190, kit.clamp((p.y - 812) / 58))) * Math.max(0.05, pop);
      const par = (Math.floor(b + i) & 1) === 0;
      kit.shadow(c, p.x, p.y + 4, size * 0.34, size * 0.07, 0.3);
      kit.bean(c, p.x, p.y - hop * size * 0.1, size, {
        S, seed: 40 + i, hero: i === 0, body: i === 0 ? undefined : [PINK, YEL, SKY, LIME, ORG, VIO][i % 6],
        mood: i === 0 ? (f < 0.5 ? 'happy' : 'grin') : 'grin', walk: true,
        arm: i === 0 ? ['up', 'wave'] : (par ? ['up', 'down'] : ['down', 'up']),
        squash: 0.2 * Math.exp(-f * 9) - 0.08 * hop, tilt: (par ? 1 : -1) * 0.1 * Math.sin(Math.PI * f) + (i === 0 ? 0.05 : 0.04)
      });
    }
    // bunting
    kit.lights(c, 30, 40, 1860, 70, { mode: MODE, S, wave: 0.8, cell: 66 });
    kit.confetti(c, S, 61, { n: 130, alpha: 0.95 });
    spots(c, S, kit, 8, 300, 800, 0.35);
    nightTint(c, 0.22);
    beatFlash(c, S, kit, 0.10);
    c.restore();
  });

  // ---- C6.2: strobing string-lights, crowd, confetti -------------------------------------------------------
  R('C6.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 5);
    const push = 1 + 0.06 * ease.smooth(t) + 0.025 * pul;
    c.save(); c.translate(960, 620); c.scale(push, push); c.rotate(0.006 * Math.sin(b * Math.PI)); c.translate(-960, -620);

    backdrop(c, S, kit, 960, 380, -0.10);
    // swivelling light beams from the ceiling
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 5; k++) {
      const x0 = 260 + k * 350, sw = Math.sin(S * 1.3 + k * 1.7) * 380, col = [PINK, SKY, YEL, LIME, ORG][k];
      const gr = c.createLinearGradient(x0, 60, x0 + sw, 800); gr.addColorStop(0, kit.rgba(col, 0.28 + 0.2 * pul)); gr.addColorStop(1, kit.rgba(col, 0));
      c.fillStyle = gr; c.beginPath(); c.moveTo(x0 - 22, 60); c.lineTo(x0 + 22, 60); c.lineTo(x0 + sw + 150, 800); c.lineTo(x0 + sw - 150, 800); c.closePath(); c.fill();
    }
    c.restore();
    danceFloor(c, S, kit, 800, 0);
    // three decks of string-lights, the dot wave of the old board, strobing on the beat
    const rise = ease.out(seg(u, 0, 0.5));
    c.save(); c.translate(0, -(1 - rise) * 260);
    kit.lights(c, 40, 60, 1840, 280, { mode: MODE, S, wave: 1, lit: 0.92, cell: 70, seed: 5 });
    c.restore();
    kit.discoBall(c, 1560, 470, 82, { S, spots: false });
    // the crowd, four deep, all dancing
    const reveal = ease.smooth(seg(u, 0, 1.1));
    kit.crowd(c, { x: 40, y: 600, w: 1840, h: 250, rows: 4, n: 76, seed: 7, S, mood: 'dance', scale: 1.5, reveal, bounce: 1.1, antennas: 0.2 });
    // the hero, front and centre, jumping hard on every beat
    const hop = Math.sin(Math.PI * f);
    kit.shadow(c, 960, 888, 120 - hop * 30, 20, 0.35);
    kit.bean(c, 960, 884 - hop * 120, 330, {
      hero: true, S, seed: 11, mood: f < 0.5 ? 'happy' : 'grin', arm: 'up',
      squash: 0.22 * Math.exp(-f * 9) - 0.12 * hop, tilt: 0.07 * Math.sin(b * Math.PI), bulb: pul
    });
    streamers(c, S, kit, 8, 3);
    kit.confetti(c, S, 62, { n: 190, alpha: 0.95 });
    for (let k = 0; k < 6; k++) kit.star(c, 140 + k * 330 + (k % 2) * 60, 400 + 70 * Math.sin(S * 3 + k), 20 + 8 * pul, { kind: 'sparkle', col: k % 2 ? '#ffe9a8' : '#ffd0f0', S });
    nightTint(c, 0.20);
    // strobe: pink on the beat, blue on the off-beat
    const half = frac(b * 2), onBeat = frac(b) < 0.5;
    c.save(); c.globalCompositeOperation = 'screen';
    c.fillStyle = onBeat ? `rgba(255,90,190,${0.20 * Math.exp(-half * 9)})` : `rgba(80,170,255,${0.13 * Math.exp(-half * 9)})`;
    c.fillRect(-100, -100, 2120, 1280); c.restore();
    c.restore();
  });

  // ---- C6.3: crowd surge, the hero carried overhead --------------------------------------------------------
  R('C6.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 5);
    const shk = 5 * pul;
    c.save();
    c.translate(960 + shk * Math.sin(S * 61), 640 + shk * Math.cos(S * 53)); c.scale(1 + 0.08 * ease.smooth(t), 1 + 0.08 * ease.smooth(t)); c.rotate(-0.012 + 0.012 * Math.sin(S * 1.7)); c.translate(-960, -640);

    backdrop(c, S, kit, 960, 430, 0.30);
    c.save(); c.globalCompositeOperation = 'screen'; c.strokeStyle = 'rgba(255,210,240,.35)'; c.lineWidth = 5; c.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const y = 180 + k * 62, x = ((S * 900 * (0.6 + 0.4 * kit.h1(k)) + k * 400) % 2600) - 340;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 180 + 90 * kit.h1(k + 7), y); c.stroke();
    }
    c.restore();
    kit.discoBall(c, 1620, 190, 70, { S, spots: false });
    streamers(c, S, kit, 7, 5);
    danceFloor(c, S, kit, 800, 0);
    // back crowd, two rows
    kit.crowd(c, { x: -20, y: 720, w: 1960, h: 80, rows: 2, n: 52, seed: 9, S, mood: 'dance', scale: 1.1, bounce: 1.1 });

    // the hero crosses the room overhead, rolling a little
    const kk = ease.inOut(seg(u, 0.05, 3.3));
    const hx = lerp(560, 1400, kk), hy = 592 + 10 * Math.sin(S * 3.1) - 14 * Math.sin(Math.PI * f);
    const rot = -1.38 + 0.16 * Math.sin(S * 2.4) + 0.08 * Math.sin(Math.PI * f);
    // carriers: a row of bouncing beans with arms up, right under him
    for (let i = 0; i < 6; i++) {
      const cx2 = hx + (i - 2.5) * 74 + 10 * Math.sin(S * 3 + i), ff = frac(b + i * 0.13);
      kit.cheap(c, cx2, 842 + (i % 2) * 10 - Math.sin(Math.PI * ff) * 22, 2.3, kit.BHOT[(i * 2 + 1) % 7], 1 - 0.1 * Math.exp(-ff * 8), 0, 0.05 * Math.sin(S * 4 + i), { mood: 'gasp', arms: 1 });
    }
    kit.glow(c, hx, hy, 340, 'rgba(255,214,90,A)', 0.55);
    kit.bean(c, hx, hy, 270, { origin: 'center', hero: true, S, seed: 11, mood: u < 1.6 ? 'gasp' : 'happy', arm: 'up', tilt: rot, squash: -0.06 * Math.sin(Math.PI * f), bulb: pul });
    // front crowd, close and loud
    kit.crowd(c, { x: -40, y: 830, w: 2000, h: 50, rows: 2, n: 26, seed: 13, S, mood: 'dance', scale: 1.7, bounce: 1.15 });
    for (let k = 0; k < 7; k++) kit.star(c, hx + 120 * Math.cos(k * 0.9 + S * 2) * (1 + 0.3 * k % 2), hy - 150 + 150 * Math.sin(k * 0.9 + S * 2), 16 + 8 * pul, { kind: 'sparkle', col: '#fff0a8', S });
    kit.confetti(c, S, 63, { n: 170, alpha: 0.95 });
    nightTint(c, 0.20);
    spots(c, S, kit, 6, 300, 800, 0.3);
    beatFlash(c, S, kit, 0.10);
    c.restore();
  });

  // ---- C6.4: the biggest frame, and the chair in the corner ---------------------------------------------------
  R('C6.4', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 5);
    const z = 1 + 0.05 * ease.smooth(t) + 0.04 * pul;
    c.save(); c.translate(900, 640); c.scale(z, z); c.translate(-900, -640);

    backdrop(c, S, kit, 900, 400, 0.16);
    const wx = 420, wy = 190, ww = 560, wh = 340;
    kit.window(c, wx, wy, ww, wh, { mode: MODE, S, plant: false, mullions: true, view: 'party' });
    streamers(c, S, kit, 12, 7);
    kit.discoBall(c, 1260, 190, 88, { S, spots: true });
    kit.lights(c, 30, 40, 1860, 70, { mode: MODE, S, wave: 1, cell: 66 });
    danceFloor(c, S, kit, 800, 0);

    // the quiet corner at the right: a darker wall, the chair, the lamp, both off
    c.save();
    const cg = c.createLinearGradient(1480, 0, 1920, 0); cg.addColorStop(0, 'rgba(14,4,24,0)'); cg.addColorStop(0.35, 'rgba(14,4,24,0.55)'); cg.addColorStop(1, 'rgba(14,4,24,0.7)');
    c.fillStyle = cg; c.fillRect(1480, -100, 460, 1200);
    kit.glow(c, 1770, 640, 330, 'rgba(60,40,110,A)', 0.3, 'source-over');
    c.restore();
    kit.lamp(c, 1620, 830, 230, { mode: MODE, S, on: 0 });
    kit.shadow(c, 1770, 850, 170, 20, 0.35);
    kit.chair(c, 1770, 848, 420, { mode: MODE, S, phi: 0.75, coat: true, confetti: 1, sway: 3 * Math.sin(S * 1.1) });

    // everyone else: a packed crowd, five rows, building as the shot runs
    const reveal = ease.smooth(seg(u, 0, 0.8));
    kit.crowd(c, { x: -30, y: 650, w: 1480, h: 230, rows: 5, n: 116, seed: 21, S, mood: 'dance', scale: 1.5, reveal, bounce: 1.15, antennas: 0.2 });
    const hop = Math.sin(Math.PI * f);
    kit.shadow(c, 760, 900, 130 - hop * 30, 20, 0.35);
    kit.bean(c, 760, 896 - hop * 120, 340, {
      hero: true, S, seed: 11, mood: f < 0.5 ? 'happy' : 'grin', arm: 'up',
      squash: 0.22 * Math.exp(-f * 9) - 0.12 * hop, tilt: 0.07 * Math.sin(b * Math.PI), bulb: pul
    });
    kit.confetti(c, S, 64, { n: 240, alpha: 0.95 });
    // a drift of confetti keeps settling on the chair
    kit.confetti(c, S, 65, { n: 18, x: 1640, w: 240, y: 500, h: 330, alpha: 1 });
    for (let k = 0; k < 8; k++) kit.star(c, 100 + k * 220 + (k % 3) * 40, 330 + 80 * Math.sin(S * 3 + k * 1.3), 18 + 8 * pul, { kind: 'sparkle', col: k % 2 ? '#fff0a8' : '#ffd0f0', S });
    nightTint(c, 0.20);
    spots(c, S, kit, 9, 300, 800, 0.35);
    beatFlash(c, S, kit, 0.12);
    c.restore();
  });

  // ---- C6.5: the lab, fast asleep (0.56 s) -------------------------------------------------------------------
  R('C6.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const z = lerp(1.0, 1.07, ease.out(t));
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    kit.humanRoom(c, {
      mode: 'night', S, phi: 0.8, dim: 0.9, dust: 1, zzz: 0, lamp: 0, monitor: 0, led: 0.5, clock: true,
      view: 'party', windowDraw: (cc, x, y, w, h) => {
        outside(cc, x, y, w, h, S, S - 133.94, kit);
      }
    });
    // the party glow leaks through the glass onto the floor
    c.save(); c.globalCompositeOperation = 'screen';
    const lg = c.createLinearGradient(0, 734, 0, 1080); lg.addColorStop(0, `rgba(255,90,190,${0.26 + 0.08 * kit.pulse(S, 5)})`); lg.addColorStop(1, 'rgba(255,90,190,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(90, 734); c.lineTo(950, 734); c.lineTo(1250, 1080); c.lineTo(250, 1080); c.closePath(); c.fill();
    c.restore();
    kit.glow(c, 520, 490, 620, 'rgba(255,90,190,A)', 0.20);
    // the zzz cloud from the opening, much larger
    const pop = ease.back(seg(t, 0, 0.45));
    {
      const zk = 4.2 * Math.max(0.01, pop), zx = 1150, zy = 330 + Math.sin(S * 0.9) * 4 * zk;
      c.save(); c.globalAlpha = Math.min(1, pop * 1.4) * 0.5; c.fillStyle = 'rgba(200,205,235,.22)'; c.beginPath();
      [[0, 0, 62], [-52, 14, 42], [54, 16, 44], [-18, -34, 40], [30, -30, 38]].forEach(q => { c.moveTo(zx + (q[0] + q[2]) * zk, zy + q[1] * zk); c.arc(zx + q[0] * zk, zy + q[1] * zk, q[2] * zk, 0, 6.283); }); c.fill(); c.restore();
    }
    kit.zzz(c, 1150, 330, 420 * Math.max(0.01, pop), { S, alpha: Math.min(1, pop * 1.4) });
    c.restore();
  });
})();
