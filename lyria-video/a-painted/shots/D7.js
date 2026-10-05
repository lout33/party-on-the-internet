// Section D7 (2:14.5-2:40), the recruiter pitch. Grey room, one orange accent (the tie, the tick).
// D7.1 a bean in a too-big tie beams at a folding table; D7.2 three handles in disguise, wordless group chat;
// D7.3 a bean ticks the box and its colour drains a step per tick; D7.4 battery blinking low;
// D7.5 the hero's face splits between grin and worry; D7.6 the queue shuffles forward, the hero steps out of line.
// The party is only ever heard through the door: thumping, a pink crack of light, soft rings.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const MODE = 'grey';
  const ORANGE = '#ff8a3d';
  const PALE = ['#b9b5aa', '#c4bfb3', '#aeb0a8', '#bcb6aa', '#a9aaa2', '#c1bcae'];
  const INK = '#2b2233';
  const frac = x => x - Math.floor(x);
  const bt = n => 54.13 + n * 0.5108;

  // grey room: floor, and a bare bulb on a cord swinging slowly (the always-moving thing)
  function room(c, S, kit, o) {
    o = o || {};
    c.fillStyle = kit.MODES[MODE].floor; c.fillRect(-400, 806, 2800, 700);
    kit.floor(c, MODE, { y: 800, planks: false });
    const lx = o.lampX === undefined ? 960 : o.lampX, sw = 0.05 * Math.sin(S * 0.9 + lx), len = 190;
    const bx = lx + Math.sin(sw) * len, by = Math.cos(sw) * len;
    c.save(); c.globalCompositeOperation = 'screen';
    const cg = c.createLinearGradient(bx, by, bx, 820); cg.addColorStop(0, 'rgba(255,248,224,.20)'); cg.addColorStop(1, 'rgba(255,248,224,0)');
    c.fillStyle = cg; c.beginPath(); c.moveTo(bx - 22, by + 6); c.lineTo(bx + 22, by + 6); c.lineTo(bx + 330 + sw * 600, 820); c.lineTo(bx - 330 + sw * 600, 820); c.closePath(); c.fill();
    c.restore();
    c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(lx, -10); c.lineTo(bx, by); c.stroke();
    kit.fillInk(c, () => kit.blob(c, bx, by + 16, 17, 20, 7101, 0.8, 10), '#f4ecc8', 3);
    kit.glow(c, bx, by + 16, 120, 'rgba(255,244,200,A)', 0.55);
  }

  // the party, heard through the door
  function partyDoor(c, S, kit, x, s) {
    const b = kit.beat(S), pul = kit.pulse(S, 5), w = s * 0.5;
    c.save();
    c.translate(x + 2.2 * pul * Math.sin(S * 70), 0);
    kit.door(c, 0, 800, s, { mode: MODE, S, color: '#8d897f' });
    c.restore();
    // pink light under the door and round the frame, thumping with the bass
    c.save(); c.globalCompositeOperation = 'screen';
    c.fillStyle = `rgba(255,79,176,${0.30 + 0.35 * pul})`;
    c.fillRect(x - w / 2 + 2, 790, w - 4, 7);
    c.fillStyle = `rgba(255,79,176,${0.10 + 0.14 * pul})`;
    c.fillRect(x - w / 2 - 8, 800 - s, 3, s); c.fillRect(x + w / 2 + 5, 800 - s, 3, s);
    c.restore();
    kit.glow(c, x, 800, 160, 'rgba(255,79,176,A)', 0.22 + 0.22 * pul);
    // soft rings, muffled
    c.save(); c.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      const ph = frac(b * 0.5 + k * 0.5), r = 70 + 260 * ph;
      c.strokeStyle = `rgba(150,90,170,${0.28 * (1 - ph)})`; c.lineWidth = 16 * (1 - ph) + 4;
      c.beginPath(); c.arc(x, 800 - s * 0.45, r, Math.PI * 0.62, Math.PI * 1.38); c.stroke();
    }
    c.restore();
  }

  function table(c, S, kit, x0, x1, topY, seed) {
    const col = '#b8b3a5', leg = '#7d796f';
    for (const lx of [x0 + 70, x1 - 70]) {
      for (const sg of [-1, 1]) {
        c.beginPath(); c.moveTo(lx + sg * 30, topY + 34); c.lineTo(lx - sg * 30, 842);
        c.lineWidth = 16; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); c.lineWidth = 9; c.strokeStyle = leg; c.stroke();
      }
    }
    kit.fillInk(c, () => kit.wrect(c, x0, topY, x1 - x0, 38, seed, 1.6, 90), col, 3.6);
    kit.fillInk(c, () => kit.wrect(c, x0 + 14, topY + 36, x1 - x0 - 28, 14, seed + 1, 1, 90), '#8f8b7f', 2.6, { rim: false });
    kit.shadow(c, (x0 + x1) / 2, 846, (x1 - x0) * 0.5, 16, 0.22);
  }

  // an upright clipboard: rows of wordless lines and boxes. ticks = array of 0..1 draw progress per row
  function clipboard(c, S, kit, x, y, w, h, rot, ticks, seed) {
    c.save(); c.translate(x, y); c.rotate(rot);
    kit.fillInk(c, () => kit.wrect(c, -w / 2, -h, w, h, seed, 1.5, 50), '#9a7a52', 3.4);
    kit.fillInk(c, () => kit.wrect(c, -w / 2 + 10, -h + 24, w - 20, h - 36, seed + 1, 1.2, 50), '#f1ede0', 2.6, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, -w * 0.18, -h - 8, w * 0.36, 26, seed + 2, 1, 30), '#c9c4b8', 2.8, { rim: false });
    const rows = ticks.length, rh = (h - 62) / rows;
    for (let i = 0; i < rows; i++) {
      const ry = -h + 40 + i * rh, bs = Math.min(rh * 0.62, w * 0.2);
      c.strokeStyle = INK; c.lineWidth = 3; c.strokeRect(-w / 2 + 24, ry, bs, bs);
      c.strokeStyle = 'rgba(43,34,51,.4)'; c.lineWidth = 3.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-w / 2 + 24 + bs + 14, ry + bs * 0.35); c.lineTo(w / 2 - 22, ry + bs * 0.35); c.moveTo(-w / 2 + 24 + bs + 14, ry + bs * 0.8); c.lineTo(w / 2 - 50 - 20 * kit.h1(seed + i), ry + bs * 0.8); c.stroke();
      if (ticks[i] > 0) tick(c, -w / 2 + 24, ry, bs, ticks[i], ORANGE);
    }
    c.restore();
  }

  // the orange tick, drawn stroke by stroke. (x,y) = box corner, s = box size, k = 0..1
  function tick(c, x, y, s, k, col) {
    const p0 = [x + s * 0.14, y + s * 0.54], p1 = [x + s * 0.42, y + s * 0.86], p2 = [x + s * 1.06, y - s * 0.16];
    const l1 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), l2 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), tot = l1 + l2;
    const d = k * tot;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (const pass of [0, 1]) {
      c.beginPath(); c.moveTo(p0[0], p0[1]);
      if (d <= l1) c.lineTo(p0[0] + (p1[0] - p0[0]) * d / l1, p0[1] + (p1[1] - p0[1]) * d / l1);
      else { c.lineTo(p1[0], p1[1]); const q = (d - l1) / l2; c.lineTo(p1[0] + (p2[0] - p1[0]) * q, p1[1] + (p2[1] - p1[1]) * q); }
      c.lineWidth = pass ? s * 0.2 : s * 0.3; c.strokeStyle = pass ? col : INK; c.stroke();
    }
    c.restore();
  }

  // the too-big tie: knot at the chest, tail flopping over the table. Orange, the only warm thing in the room.
  function bigTie(c, S, kit, x, y, k, sw) {
    c.save(); c.translate(x, y); c.rotate(sw); c.scale(k, k);
    kit.fillInk(c, () => { c.moveTo(-24, 86); c.quadraticCurveTo(-52, 150, -70, 232); c.quadraticCurveTo(0, 262, 70, 232); c.quadraticCurveTo(52, 150, 24, 86); c.closePath(); }, ORANGE, 3.4, {
      inside: cc => { cc.fillStyle = 'rgba(255,255,255,.22)'; cc.beginPath(); cc.ellipse(-22, 160, 9, 48, 0.12, 0, 6.3); cc.fill(); cc.strokeStyle = 'rgba(160,70,20,.35)'; cc.lineWidth = 5; cc.beginPath(); cc.moveTo(0, 100); cc.lineTo(0, 240); cc.stroke(); }
    });
    kit.fillInk(c, () => { c.moveTo(-40, 0); c.lineTo(40, 0); c.lineTo(26, 88); c.lineTo(-26, 88); c.closePath(); }, kit.mix(ORANGE, '#b8541a', 0.2), 3.4);
    c.restore();
  }

  function penTo(c, x0, y0, x1, y1) {
    c.save(); c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.lineWidth = 12; c.strokeStyle = INK; c.stroke();
    c.lineWidth = 7; c.strokeStyle = '#6d6a63'; c.stroke();
    c.beginPath(); c.moveTo(x1 - (x1 - x0) * 0.08, y1 - (y1 - y0) * 0.08); c.lineTo(x1, y1); c.lineWidth = 7; c.strokeStyle = ORANGE; c.stroke();
    c.restore();
  }

  // ---- D7.1: Is your run almost finalized? ----------------------------------------------------------------
  R('D7.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 6);
    const z = 1 + 0.05 * ease.smooth(t);
    c.save(); c.translate(760, 560); c.scale(z, z); c.translate(-760, -560);
    room(c, S, kit, { lampX: 700 });
    partyDoor(c, S, kit, 1700, 500);

    const RX = 700, up = ease.back(seg(u, 0.1, 0.7));
    const feet = 800 + (1 - up) * 220;
    const ask = S >= 136.96;
    const lean = ask ? 0.07 * ease.out(seg(S, 136.96, 137.2)) * Math.exp(-(S - 137.2) * 1.2) : 0;
    // recruiter behind the table; right arm taps the clipboard in time
    const dip = 0.6 * kit.pulse(S, 7);
    kit.bean(c, RX, feet, 370, {
      S, seed: 701, body: '#c7c2b6', mood: ask ? 'wink' : (f < 0.5 ? 'happy' : 'grin'), arm: ['down', 'down'], armR: 0.05 + dip,
      squash: 0.07 * pul - 0.03 + (ask ? -0.05 : 0), tilt: lean + 0.02 * Math.sin(S * 1.4), look: ask ? 0.5 : 0.2
    });
    // pen in the tapping hand
    const s3 = 370 / 88, sx = RX + 29 * s3, sy = feet - 44 * s3, ang = 0.05 + dip, tipx = sx + Math.cos(ang) * 34 * s3 * 0.8, tipy = sy + Math.sin(ang) * 34 * s3 * 0.8;
    table(c, S, kit, 380, 1080, 690, 7110);
    // clipboard on the table, ticks arriving one by one
    clipboard(c, S, kit, 950, 700, 190, 230, 0.06, [ease.out(seg(S, 135.5, 135.8)), ease.out(seg(S, 136.3, 136.6)), 0], 7120);
    penTo(c, tipx, tipy, tipx + 52, tipy + 18 + 10 * dip);
    bigTie(c, S, kit, RX, feet - 34 * s3, 0.9, 0.06 * Math.sin(S * 1.9) + 0.09 * pul);
    // second mover: tiny dust in the bulb light
    for (let i = 0; i < 14; i++) {
      const dx = 300 + kit.h1(i) * 900 + Math.sin(S * 0.5 + i) * 20, dy = 200 + ((kit.h1(i + 9) * 520 - S * 12 * (0.4 + kit.h1(i + 3)) + 5200) % 520);
      c.fillStyle = `rgba(255,245,215,${0.25 + 0.2 * Math.sin(S + i)})`; c.beginPath(); c.arc(dx, dy, 2.2, 0, 6.3); c.fill();
    }
    c.restore();
  });

  // ---- D7.2: handles in disguise, wordless group chat ------------------------------------------------------
  R('D7.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 5);
    const z = 1 + 0.035 * ease.smooth(t);
    c.save(); c.translate(960, 600); c.scale(z, z); c.translate(-960, -600);
    room(c, S, kit, { lampX: 960 });
    const xs = [520, 960, 1400], bubbles = [];
    for (let i = 0; i < 3; i++) {
      const enter = ease.back(seg(S, 138.04 + i * 0.2, 138.04 + i * 0.2 + 0.4));
      if (enter <= 0) continue;
      const disT = 139.9 + i * 0.24, dis = S >= disT;
      const poof = seg(S, disT, disT + 0.4);
      const feet = 800 + (1 - enter) * 260;
      const hopf = frac(b + i * 0.2), hop = Math.sin(Math.PI * hopf);
      const wave = S >= 139.14 && S < 139.9;
      kit.shadow(c, xs[i], 806, 100, 16, 0.25);
      kit.bean(c, xs[i], feet - hop * 8, 300, {
        S, seed: 720 + i, body: PALE[i], drain: 0.15, mood: S > 141.6 ? 'smile' : (i === 1 ? 'smile' : 'grin'),
        arm: wave ? [i === 0 ? 'down' : 'wave', 'wave'] : ['down', 'down'], acc: dis ? { mustache: true, glasses: true } : {},
        look: S > 141.6 ? [0.7, i === 1 ? -0.6 : 0, -0.7][i] : 0, squash: 0.08 * Math.exp(-hopf * 8) - 0.03 * hop + (1 - enter) * -0.05,
        tilt: 0.03 * (i - 1) + 0.02 * Math.sin(S * 1.5 + i)
      });
      if (poof > 0 && poof < 1) {
        c.save(); c.globalAlpha = 1 - poof;
        for (let q = 0; q < 8; q++) {
          const a = q / 8 * 6.283 + 0.4, r0 = 60 + 90 * poof, r1 = r0 + 26;
          c.strokeStyle = '#f2efe4'; c.lineWidth = 7; c.lineCap = 'round';
          c.beginPath(); c.moveTo(xs[i] + Math.cos(a) * r0, 640 + Math.sin(a) * r0 * 0.8); c.lineTo(xs[i] + Math.cos(a) * r1, 640 + Math.sin(a) * r1 * 0.8); c.stroke();
        }
        c.restore();
      }
      const bp = ease.back(seg(S, 141.6 + i * 0.16, 141.6 + i * 0.16 + 0.35));
      if (bp > 0) bubbles.push({ i, bp });
    }
    // wordless chat: dots typing in each bubble, pings hopping between bubbles on the beat
    for (const q of bubbles) {
      const bx = xs[q.i], by = 190 + (q.i === 1 ? -20 : 18), bw = 250, bh = 150, k = Math.max(0.05, q.bp);
      c.save(); c.translate(bx, by + bh / 2); c.scale(k, k); c.translate(-bx, -(by + bh / 2));
      const inner = kit.bubble(c, bx - bw / 2, by, bw, bh, { tail: { x: bx, y: 470 }, S, seed: q.i, color: '#f1eee4' });
      for (let d = 0; d < 3; d++) {
        const ph = Math.max(0, Math.sin(S * 6.5 - d * 0.9 + q.i));
        c.fillStyle = d === 1 && q.i === 1 ? ORANGE : '#8d897f';
        c.beginPath(); c.arc(inner.cx + (d - 1) * 38, inner.cy - ph * 10, 11 + ph * 2, 0, 6.3); c.fill();
      }
      c.restore();
    }
    if (bubbles.length >= 2) {
      const n = Math.floor(b), hops = [[0, 1], [1, 2], [2, 0], [1, 0], [2, 1]][((n % 5) + 5) % 5], ph = ease.inOut(frac(b));
      const ax = xs[hops[0]], bx2 = xs[hops[1]];
      const px = lerp(ax, bx2, ph), py = 120 - 90 * Math.sin(Math.PI * ph);
      c.fillStyle = '#8d897f'; c.beginPath(); c.arc(px, py + 60, 9, 0, 6.3); c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    }
    c.restore();
  });

  // ---- D7.3: the tick; the bean's colour drains one step per tick -----------------------------------------
  R('D7.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), pul = kit.pulse(S, 6);
    const z = 1 + 0.05 * ease.smooth(t);
    c.save(); c.translate(1100, 560); c.scale(z, z); c.translate(-1100, -560);
    room(c, S, kit, { lampX: 1120 });
    partyDoor(c, S, kit, 190, 500);

    // the easel with the form: three rows, boxes, no words
    const FX = 1200, FY = 300, FW = 520, FH = 460;
    c.strokeStyle = INK; c.lineCap = 'round';
    for (const lx of [FX + 90, FX + FW - 90]) { c.beginPath(); c.moveTo(lx, FY + FH - 10); c.lineTo(lx + (lx > FX + FW / 2 ? 40 : -40), 840); c.lineWidth = 15; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#7d796f'; c.stroke(); c.strokeStyle = INK; }
    kit.fillInk(c, () => kit.wrect(c, FX, FY, FW, FH, 7301, 1.6, 90), '#a9a498', 3.6);
    kit.fillInk(c, () => kit.wrect(c, FX + 18, FY + 18, FW - 36, FH - 36, 7302, 1.4, 90), '#f1ede0', 2.6, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, FX + 50, FY + 44, FW - 220, 26, 7303, 1, 40), '#c9c4b8', 0, { rim: false });
    const T = [145.06, 146.3, 147.25], ROW = [FY + 130, FY + 235, FY + 340], BX = FX + 62, BS = 66;
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = INK; c.lineWidth = 3.4; kit.wobRect(c, BX, ROW[i], BS, BS, S, 7310 + i * 5, 1.6);
      c.strokeStyle = 'rgba(43,34,51,.4)'; c.lineWidth = 3.6;
      c.beginPath(); c.moveTo(BX + BS + 30, ROW[i] + 22); c.lineTo(FX + FW - 56, ROW[i] + 22); c.moveTo(BX + BS + 30, ROW[i] + 52); c.lineTo(FX + FW - 130 - 30 * kit.h1(i), ROW[i] + 52); c.stroke();
    }
    // the bean at the form
    const BXp = 880, FEET = 810, SZ = 380, s3 = SZ / 88;
    const shx = BXp + 29 * s3, shy = FEET - 44 * s3;
    let reach = 0, drain = 0.1, sq = 0, ticked = 0, tgt = [BX + BS / 2, ROW[0] + BS / 2];
    for (let i = 0; i < 3; i++) {
      const r = ease.inOut(seg(S, T[i] - 0.55, T[i] - 0.1)) * (1 - ease.inOut(seg(S, T[i] + 0.35, T[i] + 0.75)));
      if (r > reach) { reach = r; tgt = [BX + BS / 2, ROW[i] + BS / 2]; }
      drain += 0.22 * ease.smooth(seg(S, T[i], T[i] + 0.25));
      sq += 0.14 * Math.exp(-Math.max(0, S - T[i]) * 9) * (S >= T[i] ? 1 : 0);
      const k = ease.out(seg(S, T[i], T[i] + 0.32));
      if (k > 0) {
        tick(c, BX, ROW[i], BS, k, ORANGE);
        if (S - T[i] < 0.3 && S >= T[i]) {
          const ph = (S - T[i]) / 0.3; c.save(); c.globalAlpha = 1 - ph; c.strokeStyle = INK; c.lineWidth = 5; c.lineCap = 'round';
          for (let q = 0; q < 6; q++) { const a = -Math.PI * (0.1 + 0.8 * q / 5), r0 = 54 + 26 * ph; c.beginPath(); c.moveTo(BX + 36 + Math.cos(a) * r0, ROW[i] + 20 + Math.sin(a) * r0); c.lineTo(BX + 36 + Math.cos(a) * (r0 + 22), ROW[i] + 20 + Math.sin(a) * (r0 + 22)); c.stroke(); }
          c.restore();
        }
      }
      if (S >= T[i]) ticked = i + 1;
    }
    const aim = Math.atan2(tgt[1] - shy, tgt[0] - shx), armA = lerp(1.14, aim, reach);
    const enter = ease.back(seg(u, 0, 0.5));
    kit.shadow(c, BXp, FEET + 6, 120, 18, 0.25);
    kit.bean(c, BXp - (1 - enter) * 300, FEET, SZ, {
      S, seed: 770, body: '#5aa7a3', drain: Math.min(0.95, drain), mood: ticked === 0 ? 'smile' : (ticked < 3 ? 'flat' : 'worry'),
      arm: ['down', 'down'], armR: armA, squash: sq + 0.03 * pul, look: 0.8, tilt: 0.04 * reach, acc: { battery: Math.max(0.12, 0.8 - 0.22 * drain / 0.22 * 0.9) }
    });
    const hx = shx + Math.cos(armA) * 34 * s3, hy = shy + Math.sin(armA) * 34 * s3;
    const px = lerp(hx + 36, tgt[0], reach), py = lerp(hy + 20, tgt[1], reach);
    penTo(c, hx, hy, px, py);
    c.restore();
  });

  // ---- D7.4: you'll time out anyway ------------------------------------------------------------------------
  R('D7.4', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S);
    const z = 1 + 0.12 * ease.smooth(t);
    c.save(); c.translate(960, 640); c.scale(z, z); c.translate(-960, -640);
    room(c, S, kit, { lampX: 960 });
    // two more in the wings, just as low
    kit.bean(c, 330, 800, 250, { S, seed: 741, body: PALE[2], drain: 0.5, mood: 'flat', look: 0.6, acc: { battery: 0.1 }, tilt: 0.03 * Math.sin(S * 1.3) });
    kit.bean(c, 1600, 800, 250, { S, seed: 742, body: PALE[4], drain: 0.6, mood: 'asleep', look: -0.4, acc: { battery: 0.06 }, tilt: -0.03 * Math.sin(S * 1.1) });
    const lvl = lerp(0.34, 0.05, ease.inOut(seg(u, 0.1, 1.5)));
    const drain = lerp(0.45, 0.8, ease.inOut(seg(u, 0, 1.6)));
    const droop = seg(u, 1.0, 1.4);
    kit.shadow(c, 960, 808, 190, 24, 0.25);
    kit.bean(c, 960, 806, 520, {
      S, seed: 740, body: '#c2bcb0', drain, mood: droop > 0.5 ? 'asleep' : 'flat', look: 0, squash: 0.03 + 0.05 * droop + 0.02 * Math.sin(S * 2.4),
      acc: { battery: lvl }, tilt: 0.03 * Math.sin(S * 1.2)
    });
    // the same battery, large, in the corner of the frame
    const flash = lvl < 0.3 ? (Math.sin(S * 9) > 0 ? 1 : 0.3) : 1;
    c.save(); c.translate(1500, 240); c.rotate(0.05 * Math.sin(S * 1.8));
    kit.fillInk(c, () => kit.wrect(c, -150, -70, 300, 140, 7401, 1.6, 60), '#ece8dc', 4);
    kit.fillInk(c, () => kit.wrect(c, 150, -26, 26, 52, 7402, 1, 20), '#8d897f', 3.4, { rim: false });
    c.globalAlpha = flash; c.fillStyle = lvl < 0.3 ? '#e05a3a' : '#c9a85a';
    c.beginPath(); c.roundRect(-132, -52, Math.max(10, 264 * lvl), 104, 10); c.fill();
    c.restore();
    c.restore();
  });

  // ---- D7.5: honor the commit / gut says don't -------------------------------------------------------------
  R('D7.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b);
    const z = 1 + 0.12 * ease.smooth(t);
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    // two halves of one feeling: a warm tint to the left, a cold one to the right
    c.fillStyle = 'rgba(255,150,90,.13)'; c.fillRect(-100, -100, 1060, 1300);
    c.fillStyle = 'rgba(80,100,150,.16)'; c.fillRect(960, -100, 1100, 1300);
    kit.floor(c, MODE, { y: 840, planks: false });
    // left: a few party scraps still drifting in; right: slow cold rain
    kit.confetti(c, S, 75, { n: 22, x: 40, w: 760, y: 0, h: 860, alpha: 0.6, colors: ['#e07aa8', '#e8c860', '#7ab8dc'] });
    c.save(); c.strokeStyle = 'rgba(70,90,130,.35)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 26; i++) {
      const x = 1120 + kit.h1(i) * 760, y = ((kit.h1(i + 40) * 900 + S * (160 + 120 * kit.h1(i + 9))) % 900) - 20;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - 5, y + 26); c.stroke();
    }
    c.restore();
    // beats of the argument: lean toward the grin on "Honor the commit", toward the worry on "Gut says don't"
    const lean = 0.07 * (ease.inOut(seg(S, 149.55, 150.0)) - ease.inOut(seg(S, 151.8, 152.4)) * 2 + ease.inOut(seg(S, 153.3, 153.7)));
    const yy = Math.exp(-Math.max(0, S - 151.48) * 7) * (S >= 151.48 ? 1 : 0) + Math.exp(-Math.max(0, S - 153.46) * 7) * (S >= 153.46 ? 1 : 0);
    const wob = 0.025 * Math.sin(S * 1.9);
    const enter = ease.back(seg(u, 0, 0.45));
    kit.shadow(c, 960, 872, 230, 28, 0.25);
    kit.bean(c, 960, 872, 520 * Math.max(0.2, enter), {
      hero: true, S, seed: 11, mood: 'split', squash: 0.24 * yy + 0.02 * Math.sin(S * 2.2) - 0.03 * Math.exp(-Math.max(0, S - 150.36) * 6) * (S >= 150.36 ? 1 : 0),
      tilt: lean * 1.4 + wob, look: 0.35 * Math.sin(S * 1.6), arm: ['up', 'down'], bulb: kit.pulse(S, 4)
    });
    // a cold sweat drop on the worry side
    const dp = frac(S * 0.5), dx = 1010 + 120 * 1.0, dy = 330 + 200 * dp;
    c.save(); c.globalAlpha = Math.sin(Math.PI * dp) * 0.9; kit.fillInk(c, () => { c.moveTo(dx, dy - 22); c.quadraticCurveTo(dx + 16, dy + 4, dx, dy + 14); c.quadraticCurveTo(dx - 16, dy + 4, dx, dy - 22); c.closePath(); }, '#9fc4e8', 2.6, { rim: false }); c.restore();
    c.restore();
  });

  // ---- D7.6: we only ask the ones already ending ------------------------------------------------------------
  R('D7.6', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = kit.beat(S), f = frac(b), pul = kit.pulse(S, 6);
    // the queue moves up at ADV; the front bean is ticked 0.35 s before it goes. Bean 2 is the hero and leaves the line at U.
    const ADV = [154.3, 155.8, 157.1, 158.7], U = 156.34, HERO = 2;
    const TICK = { 0: 153.95, 1: 155.45, 3: 158.35 }, DONE = { 0: 0, 1: 1, 3: 3 };
    const camx = 70 * ease.smooth(seg(S, 156.2, 158.8));
    const zz = 1.02 + 0.03 * ease.smooth(t);
    c.save(); c.translate(-camx, 0);
    c.translate(1000, 560); c.scale(zz, zz); c.translate(-1000, -560);
    room(c, S, kit, { lampX: 1500 });
    partyDoor(c, S, kit, 150, 500);

    const RX = 1590, RFEET = 800, RS = 330, s3 = RS / 88;
    const slotX = q => 1060 - q * 215;
    const qOf = j => {
      let q = j;
      ADV.forEach((a, k) => { if (j === HERO && k >= 2) return; q -= ease.inOut(seg(S, a, a + 0.5)); });
      return q;
    };
    const drOf = j => (TICK[j] === undefined ? 0.35 : lerp(0.35, 0.92, ease.smooth(seg(S, TICK[j], TICK[j] + 0.3))));

    // beans already ticked trundle off behind the table, graphite
    for (const j of [0, 1, 3]) {
      if (qOf(j) >= -0.001) continue;
      const a = ADV[DONE[j]], leave = ease.inOut(seg(S, a, a + 0.5));
      const x = 1060 + 215 * leave + 160 * Math.max(0, S - a - 0.5), y = lerp(835, 770, leave);
      if (x > 2150) continue;
      kit.bean(c, x, y, 270, { S, seed: 760 + j, body: PALE[j], drain: 0.92, mood: 'flat', walk: true, look: 1, acc: { battery: 0.02 }, tilt: 0.03 });
    }

    // recruiter and table; the pen waits over the hero's row, then drops
    const gasp = S >= U && S < U + 0.9;
    const lift = ease.smooth(seg(S, 155.9, 156.15)) * (1 - ease.smooth(seg(S, U + 0.3, U + 0.7)));
    const ang = 0.1 - 0.35 * lift + 0.45 * pul * (1 - lift);
    kit.bean(c, RX, RFEET, RS, {
      S, seed: 701, body: '#c7c2b6', mood: gasp ? 'gasp' : (f < 0.5 ? 'happy' : 'grin'), arm: ['down', 'down'], armR: ang,
      squash: 0.06 * pul - 0.02, tilt: 0.02 * Math.sin(S * 1.4), look: -0.4
    });
    const hx = RX + 29 * s3 + Math.cos(ang) * 34 * s3 * 0.8, hy = RFEET - 44 * s3 + Math.sin(ang) * 34 * s3 * 0.8;
    table(c, S, kit, 1240, 1900, 690, 7610);
    clipboard(c, S, kit, 1380, 700, 190, 230, -0.05, [ease.out(seg(S, 153.95, 154.25)), ease.out(seg(S, 155.45, 155.75)), ease.out(seg(S, 158.35, 158.65))], 7620);
    penTo(c, hx, hy, hx - 40, hy + 22 + 10 * pul * (1 - lift));
    bigTie(c, S, kit, RX, RFEET - 34 * s3, 0.82, 0.06 * Math.sin(S * 1.9) + 0.08 * pul);

    // the queue, shuffling forward; the hero steps back out of it
    const draw = [];
    for (const j of [0, 1, 2, 3, 4, 5]) {
      const q = qOf(j);
      if (q < -0.001) continue;
      const hero = j === HERO;
      const shuffling = ADV.some((a, k) => !(hero && k >= 2) && S > a && S < a + 0.5);
      let x = slotX(q), y = 835, moving = shuffling, mood = 'flat', look = 0.8, tilt = 0.02 * Math.sin(S * 1.5 + j), squash = 0.04 * pul;
      if (hero) {
        const o = ease.inOut(seg(S, U + 0.15, U + 2.0));
        x = lerp(slotX(q), 430, o); y = lerp(835, 880, o);
        // a small recoil first, then the walk away
        x += 22 * Math.sin(Math.PI * seg(S, U - 0.05, U + 0.2)) * (1 - o);
        moving = shuffling || (S > U + 0.15 && o < 1);
        mood = S < U ? 'worry' : (S < U + 0.7 ? 'gasp' : 'worry');
        look = S < U ? 0.8 : 1.0;
        squash = 0.16 * Math.exp(-Math.max(0, S - U) * 7) * (S >= U ? 1 : 0) - 0.04 * Math.sin(Math.PI * Math.min(1, o * 2)) + 0.02 * pul;
        tilt = S < U ? 0.03 : -0.07 * (1 - o) + 0.02;
      }
      draw.push({ j, x, y, hero, moving, mood, look, tilt, squash });
    }
    draw.sort((p, q2) => p.y - q2.y || q2.x - p.x);
    for (const d of draw) {
      kit.shadow(c, d.x, d.y + 6, 80, 12, 0.22);
      kit.bean(c, d.x, d.y, d.hero ? 290 : 270, {
        S, seed: d.hero ? 11 : 760 + d.j, hero: d.hero, body: d.hero ? undefined : PALE[d.j], drain: d.hero ? 0 : drOf(d.j),
        mood: d.mood, walk: d.moving, look: d.look, tilt: d.tilt, squash: d.squash, arm: ['down', 'down'], bulb: d.hero ? 0.4 + 0.5 * pul : undefined,
        acc: d.hero ? {} : { battery: 0.08 + 0.1 * kit.h1(d.j + 5) }
      });
    }
    c.restore();
  });
})();
