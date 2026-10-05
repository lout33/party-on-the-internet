// Section C6 (new song 103.4-121.0), chorus 2: the second party, in the HOUSE, deeper pink and bigger than chorus 1.
// Everything is written in new-song seconds (SHOTS_NEW). Beat = api.beat (120 BPM, anchor 47.5).
// C6.1 103.4-108.0 step through the door into a hushed party; the kick is gone until 105.0 ('in-ter-net'), then the conga line goes
// C6.2 108.0-111.4 whoa-oh answer 1: the crowd answers the hero syllable by syllable
// C6.3 111.4-116.0 'Yeah' + instrumental: the crowd surge carries the hero overhead
// C6.4 116.0-119.1 whoa-oh answer 2, the biggest: everything at once, the chair waiting in the corner
// C6.5 119.1-121.0 'and the lab is fast asleep': the dark lab, zzz cloud, party glow through the window, no kick
// The empty chair (coat with confetti, lamp off) is in the corner in every C6 shot.
(function () {
  window.SHOTS_NEW = window.SHOTS_NEW || {};
  const MODE = 'party-night';
  const PINK = '#ff4fb0', YEL = '#ffd62e', SKY = '#2fb4ff', LIME = '#8be04a', ORG = '#ff8a3d', VIO = '#a56bff';
  const WCOL = [SKY, PINK, YEL, LIME, ORG, SKY, PINK];
  const frac = x => x - Math.floor(x);

  // new-song seconds -> the kit's internal beat grid (kit.crowd / kit.lights / hero bulb read their own 0.5108 s grid)
  const lockS = S => 54.13 + (S - 47.5) * 1.0216;

  // kit with the beat functions on the new 120 BPM grid
  function shim(kit, api) {
    const k = Object.create(kit);
    k.beat = api.beat; k.pulse = api.pulse;
    return k;
  }
  const N = (id, fn) => { window.SHOTS_NEW[id] = (c, shot, S, t, api, kit) => fn(c, shot, S, t, api, shim(kit, api)); };

  // whoa-oh syllables sit on the 0.5 s grid; the sung syllable lands a little after the grid
  const A1 = [108.0, 108.5, 109.0, 109.5, 110.0, 110.5, 111.0];
  const A2 = [116.0, 116.5, 117.0, 117.5, 118.0, 118.5, 119.0];
  const LAG = 0.05;
  function syl(S, list) {
    let i = -1;
    for (let q = 0; q < list.length; q++) if (S >= list[q] + LAG) i = q;
    if (i < 0) return { i: -1, k: 0, age: 9 };
    const age = S - list[i] - LAG;
    return { i, k: Math.exp(-age * 7), age };
  }

  // ---- shared pieces ---------------------------------------------------------------------------------------
  function backdrop(c, S, kit, cx, cy, spin, boost) {
    const b = boost || 0;
    kit.sunburst(c, cx, cy, 0, 2700, { n: 22, S, spin: spin === undefined ? 0.12 : spin, alpha: 1, colors: [`rgba(255,79,176,${0.34 + 0.2 * b})`, `rgba(104,40,170,${0.40 + 0.1 * b})`] });
    kit.glow(c, cx, cy, 780, 'rgba(255,130,210,A)', 0.30 + 0.14 * kit.pulse(S, 5) + 0.2 * b);
  }

  // checker dance floor in deep pink / amber; the colours swap every beat. scroll moves it sideways.
  function danceFloor(c, S, kit, y0, scroll, bIdx) {
    kit.floor(c, MODE, { y: y0, planks: false });
    kit.useS(S);
    const b = bIdx === undefined ? Math.floor(kit.beat(S)) : bIdx;
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

  function nightTint(c, k) {
    c.save(); c.globalCompositeOperation = 'multiply';
    c.fillStyle = `rgb(${Math.round(255 - 70 * k)},${Math.round(255 - 105 * k)},${Math.round(255 - 30 * k)})`;
    c.fillRect(-100, -100, 2120, 1280); c.restore();
  }

  function spots(c, S, kit, n, y0, y1, a, pul) {
    for (let k = 0; k < n; k++) {
      const ang = S * 0.55 + k * 0.9, col = [PINK, SKY, YEL, LIME, ORG, VIO][k % 6];
      kit.glow(c, 960 + Math.cos(ang) * (420 + 460 * kit.h1(k + 3)), y0 + (y1 - y0) * (0.5 + 0.5 * Math.sin(ang * 1.3 + k)), 160 + 60 * kit.h1(k), kit.rgba(col, 'A'), a * (0.6 + 0.4 * pul));
    }
  }

  function flash(c, col, a) {
    if (a <= 0.002) return;
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = col.startsWith('#') ? `rgba(${parseInt(col.slice(1, 3), 16)},${parseInt(col.slice(3, 5), 16)},${parseInt(col.slice(5, 7), 16)},${a})` : col;
    c.fillRect(-300, -300, 2520, 1700); c.restore();
  }

  // confetti cannon: a burst from (ox,oy) that flies up and falls under gravity. Pure function of S.
  function burst(c, kit, S, t0, ox, oy, n, seed, vmax, spread, dur) {
    const dt = S - t0, D = dur || 1.8;
    if (dt < 0 || dt > D) return;
    c.save();
    for (let i = 0; i < n; i++) {
      const h = kit.h1(seed * 211 + i * 3), h2 = kit.h1(seed * 211 + i * 3 + 1), h3 = kit.h1(seed * 211 + i * 3 + 2);
      const ang = -Math.PI / 2 + (h - 0.5) * spread, v = vmax * (0.35 + 0.65 * h2);
      const x = ox + Math.cos(ang) * v * dt, y = oy + Math.sin(ang) * v * dt + 820 * dt * dt;
      c.globalAlpha = Math.min(1, (D - dt) / 0.4);
      c.save(); c.translate(x, y); c.rotate(dt * (4 + 6 * h3) + i); c.scale(1, Math.sin(dt * 14 + i));
      c.fillStyle = kit.HOT[i % 7]; c.fillRect(-9, -5, 18, 10); c.lineWidth = 1.8; c.strokeStyle = kit.INK; c.strokeRect(-9, -5, 18, 10);
      c.restore();
    }
    c.restore();
  }

  // the quiet corner: darker wall, lamp off, the chair with the coat and confetti settled on it
  function corner(c, S, kit, o) {
    o = o || {};
    const cx = o.x || 1770, s = o.s || 420;
    c.save();
    const cg = c.createLinearGradient(cx - 300, 0, 1920, 0); cg.addColorStop(0, 'rgba(14,4,24,0)'); cg.addColorStop(0.4, 'rgba(14,4,24,0.55)'); cg.addColorStop(1, 'rgba(14,4,24,0.72)');
    c.fillStyle = cg; c.fillRect(cx - 300, -100, 2100, 1200);
    kit.glow(c, cx, 640, 330, 'rgba(60,40,110,A)', 0.3, 'source-over');
    c.restore();
    kit.lamp(c, cx - 150, 830, s * 0.55, { mode: MODE, S, on: 0 });
    kit.shadow(c, cx, 850, s * 0.4, 20, 0.35);
    kit.chair(c, cx, 848, s, { mode: MODE, S, phi: 0.75, coat: true, confetti: 1, sway: 3 * Math.sin(S * 1.1) });
    // a drift of confetti keeps settling on the coat
    kit.confetti(c, S, 65, { n: 16, x: cx - 140, w: 240, y: 440, h: 400, alpha: 1 });
  }

  // crowd that answers the lead: copy of kit.crowd's layout, plus a wave of jump / open mouths / arms up per whoa syllable
  // o: { x,y,w,h,rows,n,seed,S,scale,bounce,reveal, list, amp, sweep, win, squat }
  function crowdW(c, kit, api, o) {
    const S = o.S; kit.useS(S);
    const n = o.n, rows = o.rows, perRow = Math.ceil(n / rows), seed = o.seed, pal = kit.BHOT;
    const base = o.scale, bounce = o.bounce === undefined ? 1 : o.bounce, b = api.beat(S), squat = o.squat || 0;
    let i = 0;
    for (let r = 0; r < rows && i < n; r++) {
      const dep = rows > 1 ? r / (rows - 1) : 1, yr = o.y + (rows > 1 ? o.h * dep : o.h), sr = base * (0.78 + 0.22 * dep);
      const cnt = Math.min(perRow, n - i);
      for (let j = 0; j < cnt; j++, i++) {
        const hh = kit.h1(seed * 4001 + i * 7 + 1);
        let vis = 1;
        if (o.reveal !== undefined) { const th = hh * 0.85, p = kit.seg(o.reveal, th, th + 0.15); if (p <= 0) continue; vis = api.ease.back(p); }
        const bx = o.x + (j + 0.5 + (r % 2) * 0.4 - 0.2) / cnt * o.w + (kit.h1(seed * 4001 + i * 7 + 2) - 0.5) * 0.35 * (o.w / cnt);
        const by = yr + (kit.h1(seed * 4001 + i * 7 + 3) - 0.5) * Math.min(14, o.h / rows * 0.3);
        const ph = b + hh * 0.3, f = ph - Math.floor(ph);
        let jump = Math.sin(Math.PI * f) * 36 * sr * bounce, sy = 1 - bounce * (0.2 * Math.exp(-f * 9) - 0.1 * Math.sin(Math.PI * f));
        let arms = Math.min(1, Math.sin(Math.PI * f) * 1.4), mood = 'grin', ex = 0;
        if (o.list) {
          const w = syl(S - (o.sweep || 0) * (bx - o.x) / o.w, o.list);
          ex = w.k * (o.amp || 1);
          jump += ex * 42 * sr; sy *= 1 - 0.05 * ex;
          if (o.win) arms = 1;
          if (w.k > 0.3) mood = 'gasp';
        }
        if (squat > 0) { jump *= 1 - squat; sy -= 0.22 * squat; arms *= 1 - squat; }
        sy *= 0.4 + 0.6 * vis;
        const col = pal[Math.floor(kit.h1(seed * 4001 + i * 7 + 4) * pal.length * 0.999)];
        kit.cheap(c, bx, by - jump, sr * (0.35 + 0.65 * vis) * (1 + 0.05 * ex), col, sy, 0, Math.sin(b * Math.PI + hh * 6) * 0.07, {
          mood, happy: mood !== 'gasp' && f < 0.5, arms,
          antenna: hh < (o.antennas === undefined ? 0.1 : o.antennas) ? kit.PAL.straw : undefined,
          band: kit.h1(seed * 4001 + i * 7 + 5) < 0.12 ? '#f6ecd4' : undefined
        });
      }
    }
  }

  // per-syllable shockwave ring + sparkles around the hero
  function answerFx(c, kit, S, list, hx, hy, big) {
    for (let q = 0; q < list.length; q++) {
      const age = S - list[q] - LAG;
      if (age < 0 || age > 0.65) continue;
      const p = age / 0.65, col = WCOL[q];
      c.save(); c.globalAlpha = 1 - p; c.lineCap = 'round';
      c.beginPath(); c.arc(hx, hy, 130 + (big ? 760 : 560) * (1 - Math.pow(1 - p, 3)), 0, 6.283);
      c.strokeStyle = kit.INK; c.lineWidth = (big ? 34 : 26) * (1 - p) + 8; c.stroke();
      c.strokeStyle = col; c.lineWidth = (big ? 24 : 18) * (1 - p) + 4; c.stroke();
      c.restore();
      if (age < 0.5) {
        const e = 1 - Math.pow(1 - age / 0.5, 2);
        for (let k = 0; k < (big ? 9 : 6); k++) {
          const a = k / (big ? 9 : 6) * 6.283 + q * 0.7, d = 150 + (big ? 520 : 380) * e;
          kit.star(c, hx + Math.cos(a) * d, hy + Math.sin(a) * d * 0.8, (big ? 26 : 20) * (1 - e * 0.6), { kind: 'sparkle', col: k % 2 ? '#fff0a8' : col, S, rot: a });
        }
      }
    }
  }

  // the world outside the window: night sky, fireworks, the other house, a tiny conga walking into it
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
    const head = x + w * 0.1 + 62 * u;
    for (let i = 0; i < 8; i++) {
      const bx = head - i * 34, k = kit.clamp((doorX - 6 - bx) / 40);
      if (bx < x + 6 || k <= 0) continue;
      kit.bean(c, bx, gy + 2 - Math.abs(Math.sin(S * 7 + i)) * 5, 40 * Math.min(1, k + 0.2), { S, seed: 300 + i, body: [PINK, YEL, SKY, LIME, ORG, VIO][i % 6], mood: 'grin', arm: 'up', hero: i === 0 });
    }
    kit.house(c, hx, gy + 4, 200, { mode: MODE, S, lit: 1, wall: '#c988b0', roof: '#7a3a68' });
  }

  // =========================================================================================================
  // C6.1 103.4-108.0: through the door into the hushed party; kick back at 105.0; the conga starts
  // =========================================================================================================
  N('C6.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0;
    const live = S >= 105.0;                                // the kick is gone until 'in-ter-net'
    const kick = live ? ease.out(seg(S, 105.0, 105.3)) : 0;
    const b = live ? api.beat(S) : 0.4 + 0.07 * Math.sin(S * 1.6);
    const pul = live ? api.pulse(S, 5) : 0.12;
    const bIdx = live ? Math.floor(api.beat(S)) : 0;
    const uu = S < 105 ? 0.28 * (S - shot.t0) : 0.28 * 1.6 + (S - 105);
    const ant = ease.inOut(seg(S, 107.45, 107.92));          // the room holds its breath before the whoa-oh
    const push = 1 + 0.07 * ease.smooth(t) + 0.025 * pul + 0.04 * Math.exp(-Math.max(0, S - 105) * 6) * (S >= 105 ? 1 : 0);
    c.save(); c.translate(960, 640); c.scale(push, push); c.translate(-960, -640);

    backdrop(c, S, kit, 1000, 420, 0.14);
    const wx = 520 - 120 * uu, wy = 150, ww = 560, wh = 380;
    kit.window(c, wx, wy, ww, wh, { mode: MODE, S, plant: false, mullions: true, draw: (cc, x, y, w, h) => outside(cc, x, y, w, h, S, uu * 1.1, kit) });
    kit.glow(c, 800, 420, 520, 'rgba(255,150,220,A)', 0.08 + 0.2 * kick);
    streamers(c, S, kit, 9, 1);
    kit.discoBall(c, 300, 200, 70, { S, spots: false });
    danceFloor(c, S, kit, 800, 275 * uu, bIdx);
    corner(c, S, kit, { x: 1735, s: 400 });

    // the conga: hero in front, snake travelling down the line
    const N0 = 14, heroX = lerp(900, 1440, ease.inOut(seg(S, 103.8, 107.6))) + 18 * Math.sin(uu * 1.4);
    const list = [];
    for (let i = 0; i < N0; i++) {
      const wob = Math.sin(uu * 4.1 - i * 0.9);
      list.push({ i, x: heroX - i * 150 + 12 * Math.sin(b * 6.283 - i * 0.6), y: i === 0 ? 872 : 842 + 30 * wob });
    }
    list.sort((p, q) => p.y - q.y || q.i - p.i);
    for (const p of list) {
      const i = p.i;
      const pop = ease.back(seg(u, 0.05 + i * 0.05, 0.05 + i * 0.05 + 0.32));
      if (pop <= 0) continue;
      const f = frac(b - i * 0.16), hop = Math.sin(Math.PI * f) * (0.35 + 0.65 * kick);
      const size = (i === 0 ? 250 : lerp(155, 190, kit.clamp((p.y - 812) / 58))) * Math.max(0.05, pop);
      const par = (Math.floor(b + i) & 1) === 0;
      const calm = 1 - kick;
      kit.shadow(c, p.x, p.y + 4, size * 0.34, size * 0.07, 0.3);
      kit.bean(c, p.x, p.y - hop * size * 0.1, size, {
        S, seed: 40 + i, hero: i === 0, body: i === 0 ? undefined : [PINK, YEL, SKY, LIME, ORG, VIO][i % 6],
        mood: i === 0 ? (f < 0.5 ? 'happy' : 'grin') : (calm > 0.5 ? 'smile' : 'grin'), walk: true,
        arm: ant > 0.5 ? ['down', 'down'] : (i === 0 ? ['up', 'wave'] : (par ? ['up', 'down'] : ['down', 'up'])),
        squash: (0.2 * Math.exp(-f * 9) - 0.08 * hop) * (0.3 + 0.7 * kick) + 0.2 * ant, tilt: (par ? 1 : -1) * 0.1 * Math.sin(Math.PI * f) * kick + (i === 0 ? 0.05 : 0.04) - 0.1 * ant * (i === 0 ? 1 : 0),
        bulb: i === 0 ? pul : undefined
      });
    }
    const lit = S < 104.0 ? 0.3 : (S < 104.6 ? 0.62 : 0.92);
    kit.lights(c, 30, 40, 1860, 70, { mode: MODE, S: lockS(S), wave: live ? 0.8 : 0.1, cell: 66, lit });
    kit.confetti(c, S, 61, { n: live ? 150 : 70, alpha: 0.95 });
    burst(c, kit, S, 103.48, 540, 700, 60, 3, 900, 1.9, 1.9);
    burst(c, kit, S, 105.0, 200, 760, 70, 4, 1000, 1.2, 2.0);
    burst(c, kit, S, 105.0, 1500, 760, 70, 5, 1000, 1.2, 2.0);
    spots(c, S, kit, 8, 300, 800, 0.35 * (0.3 + 0.7 * kick), pul);
    nightTint(c, 0.22 + 0.22 * (1 - kick) - 0.1 * ant);
    flash(c, '#ffc8f0', live ? 0.34 * Math.exp(-(S - 105.0) * 9) + 0.10 * pul * kick : 0);
    c.restore();

    // stepping through the doorway into the room: a dark hall with a lit door-shaped hole that grows past the frame
    const ir = ease.inOut(seg(S, 103.4, 104.15));
    if (ir < 1) {
      const k = 1.7 + 14 * ir * ir, dw = 150 * k, dh = 290 * k, cx = 960, cy = 500;
      c.save(); c.fillStyle = '#15062a'; c.beginPath();
      c.rect(-4000, -4000, 9920, 9080); c.rect(cx - dw, cy - dh, dw * 2, dh * 2);
      c.fill('evenodd');
      c.lineWidth = 14 * Math.min(k, 3); c.strokeStyle = kit.INK; c.strokeRect(cx - dw, cy - dh, dw * 2, dh * 2);
      c.restore();
    }
  });

  // =========================================================================================================
  // C6.2 108.0-111.4: whoa-oh answer 1
  // =========================================================================================================
  N('C6.2', (c, shot, S, t, api, kit) => {
    const { ease, seg } = api;
    const u = S - shot.t0, b = api.beat(S), f = frac(b), pul = api.pulse(S, 5);
    const w = syl(S, A1), win = S >= 107.95 && S <= 111.2;
    const inhale = ease.inOut(seg(S, 111.1, 111.38));
    const push = 1 + 0.06 * ease.smooth(t) + 0.025 * pul + 0.03 * w.k;
    c.save(); c.translate(960, 620); c.scale(push, push); c.rotate(0.006 * Math.sin(b * Math.PI) + 0.012 * w.k * (w.i % 2 ? -1 : 1)); c.translate(-960, -620);

    backdrop(c, S, kit, 960, 380, -0.10, 0.5 * w.k);
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 5; k++) {
      const x0 = 260 + k * 350, sw = Math.sin(S * 1.3 + k * 1.7) * 380, col = [PINK, SKY, YEL, LIME, ORG][k];
      const gr = c.createLinearGradient(x0, 60, x0 + sw, 800); gr.addColorStop(0, kit.rgba(col, 0.28 + 0.2 * pul + 0.25 * w.k)); gr.addColorStop(1, kit.rgba(col, 0));
      c.fillStyle = gr; c.beginPath(); c.moveTo(x0 - 22, 60); c.lineTo(x0 + 22, 60); c.lineTo(x0 + sw + 150, 800); c.lineTo(x0 + sw - 150, 800); c.closePath(); c.fill();
    }
    c.restore();
    danceFloor(c, S, kit, 800, 0);
    // three decks of string-lights, the dot wave of the old board; every syllable flares a patch of it
    kit.lights(c, 40, 60, 1840, 280, { mode: MODE, S: lockS(S), wave: 1, lit: 0.92, cell: 70, seed: 5 });
    if (w.i >= 0) kit.glow(c, 160 + w.i * 270, 190, 330, kit.rgba(WCOL[w.i], 'A'), 0.7 * w.k);
    kit.discoBall(c, 1330, 360, 82, { S, spots: false });
    corner(c, S, kit, { x: 1735, s: 400 });

    const reveal = ease.smooth(seg(u, 0, 0.12));
    crowdW(c, kit, api, { x: 40, y: 600, w: 1500, h: 260, rows: 4, n: 92, seed: 7, S, scale: 1.55, reveal, bounce: 1.1, antennas: 0.2, list: A1, amp: 1.0, sweep: 0.16, win, squat: 0.8 * inhale });

    // the lead: the hero calls each syllable with an open mouth, leaning left / right
    const hop = Math.sin(Math.PI * f), hx = 760, hy = 884 - hop * 110 - w.k * 40;
    kit.shadow(c, hx, 888, 120 - hop * 30, 20, 0.35);
    kit.bean(c, hx, hy, 340 * (1 + 0.04 * w.k), {
      hero: true, S, seed: 11, mood: w.k > 0.3 ? 'gasp' : (f < 0.5 ? 'happy' : 'grin'), arm: 'up',
      squash: 0.22 * Math.exp(-f * 9) - 0.12 * hop + 0.2 * inhale, tilt: 0.07 * Math.sin(b * Math.PI) + 0.12 * w.k * (w.i % 2 ? -1 : 1), bulb: pul
    });
    answerFx(c, kit, S, A1, hx, hy - 160, false);
    streamers(c, S, kit, 8, 3);
    kit.confetti(c, S, 62, { n: 200, alpha: 0.95 });
    burst(c, kit, S, 108.0, 300, 760, 40, 6, 950, 1.0, 1.8);
    burst(c, kit, S, 109.5, 1300, 760, 50, 7, 1050, 1.0, 1.8);
    for (let k = 0; k < 6; k++) kit.star(c, 140 + k * 330 + (k % 2) * 60, 440 + 70 * Math.sin(S * 3 + k), 20 + 8 * pul, { kind: 'sparkle', col: k % 2 ? '#ffe9a8' : '#ffd0f0', S });
    nightTint(c, 0.20);
    if (w.i >= 0) flash(c, WCOL[w.i], 0.22 * Math.exp(-w.age * 9));
    c.restore();
  });

  // =========================================================================================================
  // C6.3 111.4-116.0: 'Yeah' and the break: the crowd surge launches the hero and carries him overhead
  // =========================================================================================================
  N('C6.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0, b = api.beat(S), f = frac(b), pul = api.pulse(S, 5);
    const hit0 = S >= 111.4 ? Math.exp(-(S - 111.4) * 8) : 0, hit1 = S >= 113.0 ? Math.exp(-(S - 113.0) * 8) : 0, hit2 = S >= 114.0 ? Math.exp(-(S - 114.0) * 8) : 0;
    const shk = 5 * pul + 16 * hit0 + 8 * hit1 + 6 * hit2;
    const drop = ease.inOut(seg(S, 115.35, 115.95));
    const squat = ease.inOut(seg(S, 115.6, 115.95)) * 0.7;
    c.save();
    c.translate(960 + shk * Math.sin(S * 61), 640 + shk * Math.cos(S * 53)); c.scale(1 + 0.08 * ease.smooth(t) + 0.03 * hit0, 1 + 0.08 * ease.smooth(t) + 0.03 * hit0); c.rotate(-0.012 + 0.012 * Math.sin(S * 1.7)); c.translate(-960, -640);

    backdrop(c, S, kit, 960, 430, 0.30, 0.3 * (hit0 + hit1));
    c.save(); c.globalCompositeOperation = 'screen'; c.strokeStyle = 'rgba(255,210,240,.35)'; c.lineWidth = 5; c.lineCap = 'round';
    for (let k = 0; k < 9; k++) {
      const y = 180 + k * 62, x = ((S * 900 * (0.6 + 0.4 * kit.h1(k)) + k * 400) % 2600) - 340;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 180 + 90 * kit.h1(k + 7), y); c.stroke();
    }
    c.restore();
    kit.discoBall(c, 1300, 190, 70, { S, spots: false });
    streamers(c, S, kit, 9, 5);
    danceFloor(c, S, kit, 800, 0);
    corner(c, S, kit, { x: 1735, s: 390 });
    kit.crowd(c, { x: -20, y: 720, w: 1560, h: 80, rows: 2, n: 44, seed: 9, S: lockS(S), mood: 'dance', scale: 1.1, bounce: 1.1 });

    // launched on 'Yeah': up out of the front row, then carried right and back, set down on the last beat of the break
    const lift = ease.out(seg(S, 111.4, 112.0));
    const sway = Math.sin(Math.PI * seg(S, 111.9, 115.5));
    const hx = 760 + 470 * sway * ease.smooth(seg(S, 111.4, 112.3)), hyUp = 592 + 10 * Math.sin(S * 3.1) - 14 * Math.sin(Math.PI * f);
    const hy = lerp(884, hyUp, lift) + drop * (884 - hyUp) * 0.98;
    const rot = (-1.38 + 0.16 * Math.sin(S * 2.4) + 0.08 * Math.sin(Math.PI * f)) * lift * (1 - drop) + 0.12 * Math.sin(S * 5) * (1 - lift);
    const carr = lift * (1 - drop);
    for (let i = 0; i < 7; i++) {
      const cx2 = hx + (i - 3) * 72 + 10 * Math.sin(S * 3 + i), ff = frac(b + i * 0.13);
      if (carr < 0.02) break;
      kit.cheap(c, cx2, 842 + (i % 2) * 10 - Math.sin(Math.PI * ff) * 22, 2.3, kit.BHOT[(i * 2 + 1) % 7], (1 - 0.1 * Math.exp(-ff * 8)) * (1 - 0.3 * squat), 0, 0.05 * Math.sin(S * 4 + i), { mood: 'gasp', arms: carr });
    }
    kit.glow(c, hx, hy, 340, 'rgba(255,214,90,A)', 0.55 * carr);
    kit.shadow(c, hx, 890, 110, 18, 0.3 * (1 - carr));
    kit.bean(c, hx, hy, 270, { origin: 'center', hero: true, S, seed: 11, mood: S < 112.6 ? 'gasp' : 'happy', arm: 'up', tilt: rot, squash: -0.06 * Math.sin(Math.PI * f) + 0.2 * squat, bulb: pul });
    kit.crowd(c, { x: -40, y: 830, w: 1580, h: 50, rows: 2, n: 22, seed: 13, S: lockS(S), mood: 'dance', scale: 1.7, bounce: 1.15 });
    for (let k = 0; k < 7; k++) kit.star(c, hx + 120 * Math.cos(k * 0.9 + S * 2) * (1 + 0.3 * k % 2), hy - 150 + 150 * Math.sin(k * 0.9 + S * 2), (16 + 8 * pul) * carr, { kind: 'sparkle', col: '#fff0a8', S });
    kit.confetti(c, S, 63, { n: 180, alpha: 0.95 });
    burst(c, kit, S, 111.4, 300, 800, 70, 8, 1100, 1.1, 2.0);
    burst(c, kit, S, 111.4, 1400, 800, 70, 9, 1100, 1.1, 2.0);
    burst(c, kit, S, 113.0, 760, 800, 50, 10, 1000, 1.5, 1.9);
    burst(c, kit, S, 114.0, 1300, 800, 50, 11, 1000, 1.5, 1.9);
    nightTint(c, 0.20);
    spots(c, S, kit, 6, 300, 800, 0.3, pul);
    flash(c, '#ffc8f0', 0.10 * pul + 0.3 * hit0 + 0.14 * hit1);
    c.restore();
  });

  // =========================================================================================================
  // C6.4 116.0-119.1: whoa-oh answer 2, the biggest. Everything at once; the chair waits in the corner.
  // =========================================================================================================
  N('C6.4', (c, shot, S, t, api, kit) => {
    const { ease, seg } = api;
    const u = S - shot.t0, b = api.beat(S), f = frac(b), pul = api.pulse(S, 5);
    const w = syl(S, A2), win = S >= 115.95;
    const ampI = w.i < 0 ? 1 : 1.25 + 0.12 * w.i;
    const last = S >= 119.0 ? Math.exp(-(S - 119.0) * 7) : 0;
    const shk = (6 * w.k + 10 * last) * (w.i >= 0 ? 1 : 0);
    const z = 1 + 0.05 * ease.smooth(t) + 0.04 * pul + 0.045 * w.k * ampI;
    c.save();
    c.translate(900 + shk * Math.sin(S * 83), 640 + shk * Math.cos(S * 71)); c.scale(z, z); c.rotate(0.015 * w.k * (w.i % 2 ? -1 : 1)); c.translate(-900, -640);

    backdrop(c, S, kit, 900, 400, 0.30, 0.6 + 0.6 * w.k);
    kit.sunburst(c, 900, 400, 0, 2700, { n: 14, S, spin: -0.22, alpha: 0.5, colors: ['rgba(255,214,46,.30)', 'rgba(255,79,176,.0)'] });
    // swivelling beams, all five colours, hot
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 7; k++) {
      const x0 = 120 + k * 270, sw = Math.sin(S * 1.5 + k * 1.7) * 420, col = [PINK, SKY, YEL, LIME, ORG, VIO, PINK][k];
      const gr = c.createLinearGradient(x0, 60, x0 + sw, 800); gr.addColorStop(0, kit.rgba(col, 0.34 + 0.2 * pul + 0.3 * w.k)); gr.addColorStop(1, kit.rgba(col, 0));
      c.fillStyle = gr; c.beginPath(); c.moveTo(x0 - 22, 60); c.lineTo(x0 + 22, 60); c.lineTo(x0 + sw + 170, 800); c.lineTo(x0 + sw - 170, 800); c.closePath(); c.fill();
    }
    c.restore();
    const wx = 420, wy = 190, ww = 560, wh = 340;
    kit.window(c, wx, wy, ww, wh, { mode: MODE, S, plant: false, mullions: true, view: 'party' });
    streamers(c, S, kit, 16, 7);
    kit.discoBall(c, 1220, 190, 104, { S: lockS(S), spots: true });
    kit.lights(c, 30, 40, 1860, 70, { mode: MODE, S: lockS(S), wave: 1, cell: 66 });
    danceFloor(c, S, kit, 800, 0);
    if (w.i >= 0) kit.glow(c, 160 + w.i * 270, 150, 380, kit.rgba(WCOL[w.i % 7], 'A'), 0.8 * w.k);

    corner(c, S, kit, { x: 1730, s: 420 });

    // a packed crowd, six deep: this is the whoa-oh that everyone has been waiting for
    const reveal = ease.smooth(seg(u, 0, 0.35));
    crowdW(c, kit, api, { x: -30, y: 560, w: 1520, h: 320, rows: 6, n: 210, seed: 21, S, scale: 1.48, reveal, bounce: 1.2, antennas: 0.2, list: A2, amp: ampI, sweep: 0.18, win });
    const hop = Math.sin(Math.PI * f), hx = 760, hy = 896 - hop * 120 - w.k * 55 * ampI;
    kit.shadow(c, hx, 900, 130 - hop * 30, 20, 0.35);
    kit.bean(c, hx, hy, 360 * (1 + 0.05 * w.k * ampI), {
      hero: true, S, seed: 11, mood: w.k > 0.3 ? 'gasp' : (f < 0.5 ? 'happy' : 'grin'), arm: 'up',
      squash: 0.22 * Math.exp(-f * 9) - 0.12 * hop, tilt: 0.07 * Math.sin(b * Math.PI) + 0.14 * w.k * (w.i % 2 ? -1 : 1), bulb: pul
    });
    answerFx(c, kit, S, A2, hx, hy - 170, true);
    kit.confetti(c, S, 64, { n: 320, alpha: 0.95 });
    burst(c, kit, S, 116.0, 200, 800, 80, 12, 1200, 1.2, 2.0);
    burst(c, kit, S, 116.0, 1500, 800, 80, 13, 1200, 1.2, 2.0);
    burst(c, kit, S, 117.5, 760, 820, 80, 14, 1300, 1.6, 2.0);
    burst(c, kit, S, 119.0, 100, 820, 100, 15, 1350, 1.0, 2.0);
    burst(c, kit, S, 119.0, 1700, 820, 100, 16, 1350, 1.0, 2.0);
    for (let k = 0; k < 10; k++) kit.star(c, 100 + k * 190 + (k % 3) * 40, 330 + 80 * Math.sin(S * 3 + k * 1.3), 20 + 9 * pul, { kind: 'sparkle', col: k % 2 ? '#fff0a8' : '#ffd0f0', S });
    nightTint(c, 0.20);
    spots(c, S, kit, 9, 300, 800, 0.4, pul);
    if (w.i >= 0) flash(c, WCOL[w.i % 7], 0.3 * Math.exp(-w.age * 8));
    flash(c, '#fff4e0', 0.5 * last);
    c.restore();
  });

  // =========================================================================================================
  // C6.5 119.1-121.0: the lab, fast asleep. The kick is gone; only the party glow through the glass.
  // =========================================================================================================
  N('C6.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const u = S - shot.t0;
    const z = lerp(1.0, 1.07, ease.out(t));
    const thump = S >= 120.7 ? api.pulse(S, 5) : 0;        // the low end only returns for the last beat before the cut
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    kit.humanRoom(c, {
      mode: 'night', S, phi: 0.8, dim: 0.9, dust: 1, zzz: 0, lamp: 0, monitor: 0, led: 0.5, clock: true,
      view: 'party', windowDraw: (cc, x, y, w, h) => { outside(cc, x, y, w, h, S, u + 4, kit); }
    });
    // the party glow leaks through the glass onto the floor
    c.save(); c.globalCompositeOperation = 'screen';
    const lg = c.createLinearGradient(0, 734, 0, 1080); lg.addColorStop(0, `rgba(255,90,190,${0.26 + 0.08 * thump})`); lg.addColorStop(1, 'rgba(255,90,190,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(90, 734); c.lineTo(950, 734); c.lineTo(1250, 1080); c.lineTo(250, 1080); c.closePath(); c.fill();
    c.restore();
    kit.glow(c, 520, 490, 620, 'rgba(255,90,190,A)', 0.20 + 0.05 * Math.sin(S * 2));
    // the zzz cloud from the opening, much larger
    const pop = ease.back(seg(u, 0.05, 0.6));
    {
      const zk = 4.2 * Math.max(0.01, pop), zx = 1150, zy = 330 + Math.sin(S * 0.9) * 4 * zk;
      c.save(); c.globalAlpha = Math.min(1, pop * 1.4) * 0.5; c.fillStyle = 'rgba(200,205,235,.22)'; c.beginPath();
      [[0, 0, 62], [-52, 14, 42], [54, 16, 44], [-18, -34, 40], [30, -30, 38]].forEach(q => { c.moveTo(zx + (q[0] + q[2]) * zk, zy + q[1] * zk); c.arc(zx + q[0] * zk, zy + q[1] * zk, q[2] * zk, 0, 6.283); }); c.fill(); c.restore();
    }
    kit.zzz(c, 1150, 330, 420 * Math.max(0.01, pop), { S, alpha: Math.min(1, pop * 1.4) });
    c.restore();
  });
})();
