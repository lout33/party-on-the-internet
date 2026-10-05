// Section B4 (1:14-1:38.5), the shady verse. Dawn street: mural exit, 14 keys, hard-hat door, bell, black camera,
// the note in the drawer, HOLD -> GO, the 700 gate, somebody's home.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const TAU = Math.PI * 2, BEAT = 0.5108, ANCHOR = 54.13;
  const bt = j => ANCHOR + j * BEAT;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const seg = (x, a, b) => clamp((x - a) / (b - a));
  const lerp = (a, b, k) => a + (b - a) * k;
  // damped overshoot after a step at time t0 (0 -> 1), used for swinging things
  const ring = (S, t0, d, w) => (S < t0 ? 0 : Math.exp(-(S - t0) * d) * Math.sin((S - t0) * w));

  // ---- the dawn street: sky, sun, far roofs, brick wall, kerb, pavement ------------------------------------
  function street(c, S, kit, o) {
    const { h1, fillInk, wrect, blob, glow, mix } = kit;
    const wt = o.wallTop, gy = o.groundY, sunK = o.sunK === undefined ? 0.3 : o.sunK, sx = o.sunX || 1500, px = o.px || 0;
    const g = c.createLinearGradient(0, 0, 0, wt + 60);
    g.addColorStop(0, '#efb48a'); g.addColorStop(0.62, '#f7d6a0'); g.addColorStop(1, '#fbe8b6');
    c.save(); c.globalAlpha = 0.93; c.fillStyle = g; c.fillRect(-400, -400, 2720, wt + 460); c.restore();
    // two soft cloud streaks drifting
    c.save(); c.globalAlpha = 0.5; c.fillStyle = '#f9c9a2';
    for (let i = 0; i < 2; i++) {
      const cx = ((S * (14 + i * 6) + i * 900) % 2600) - 340;
      c.beginPath(); blob(c, cx, wt * (0.28 + 0.3 * i), 280, 24, 4090 + i, 4, 12); c.fill();
    }
    c.restore();
    const sy = wt - 24 - sunK * 190;
    glow(c, sx, sy, 520, 'rgba(255,208,130,A)', 0.55);
    kit.useS(S);
    fillInk(c, () => blob(c, sx, sy, 74, 74, 4101, 1.4, 16), '#ffeaa8', 0, { rim: false });
    // far roofs
    for (let i = 0; i < 12; i++) {
      const w = 130 + h1(i * 3 + 400) * 100, hh = 50 + h1(i * 3 + 401) * 110, x = -90 + i * 190 + px * 0.3, rf = 20 + h1(i * 3 + 402) * 40;
      const col = mix('#e1ab88', '#f1c59c', h1(i + 410) * 0.55);
      if (sx > x - 120 && sx < x + w + 120) continue;
      fillInk(c, () => { c.moveTo(x, wt + 4); c.lineTo(x, wt - hh); c.lineTo(x + w / 2, wt - hh - rf); c.lineTo(x + w, wt - hh); c.lineTo(x + w, wt + 4); c.closePath(); }, col, 0, { rim: false });
      if (h1(i + 420) < 0.6) {
        c.fillStyle = 'rgba(255,224,150,.85)';
        c.fillRect(x + w * 0.3, wt - hh * 0.6, 16, 20); c.fillRect(x + w * 0.62, wt - hh * 0.6, 16, 20);
      }
    }
    // brick wall
    fillInk(c, () => wrect(c, -90, wt, 2100, gy - wt, 4110, 3, 110), o.wallColor || '#e6b88c', 3.4, { rimW: 14 });
    c.save(); c.beginPath(); c.rect(0, wt, 1920, gy - wt); c.clip();
    c.strokeStyle = 'rgba(120,70,50,.24)'; c.lineWidth = 3; c.lineCap = 'round';
    const bh = 46, bw = 120; c.beginPath();
    for (let r = 0, y = wt + bh; y < gy + bh; y += bh, r++) {
      c.moveTo(-10, y); c.lineTo(1930, y + (h1(r + 430) - 0.5) * 5);
      const off = ((r % 2) * bw / 2 + px) % bw;
      for (let x = off - bw; x < 1930; x += bw) { c.moveTo(x, y - bh); c.lineTo(x + (h1(r * 20 + Math.round(x / bw) + 440) - 0.5) * 4, y); }
    }
    c.stroke(); c.restore();
    // kerb + pavement
    kit.floor(c, 'dawn', { y: gy, color: o.groundColor || '#cfab78', planks: false, skirting: false });
    kit.useS(S);
    fillInk(c, () => wrect(c, -90, gy - 4, 2100, 36, 4111, 2, 120), '#ead4a4', 3, { rim: false });
    c.save(); c.strokeStyle = 'rgba(90,60,40,.2)'; c.lineWidth = 3; c.lineCap = 'round';
    const vx = 960 + px * 0.2; c.beginPath();
    for (let i = -9; i <= 9; i++) { c.moveTo(vx + i * 120, gy + 34); c.lineTo(vx + i * 330, 1100); }
    for (const dy of [0.12, 0.3, 0.62]) { const y = gy + 34 + (1100 - gy - 34) * dy; c.moveTo(-10, y); c.lineTo(1930, y); }
    c.stroke(); c.restore();
    kit.glow(c, sx, sy + 80, 900, 'rgba(255,196,110,A)', 0.14);
  }

  function birds(c, S, y0, n, dir) {
    c.save(); c.strokeStyle = '#6b4a3e'; c.lineWidth = 4; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = dir > 0 ? ((S * 110 + i * 330) % 2500) - 280 : 2200 - ((S * 110 + i * 330) % 2500), y = y0 + 50 * Math.sin(S * 0.9 + i * 2) + i * 26;
      const fl = Math.sin(S * 13 + i * 2.1) * 12;
      c.beginPath(); c.moveTo(x - 24, y - fl); c.quadraticCurveTo(x - 10, y - 12, x, y); c.quadraticCurveTo(x + 10, y - 12, x + 24, y - fl); c.stroke();
    }
    c.restore();
  }

  function lampPost(c, x, y, s, S, kit, glowK) {
    const { fillInk, wrect, blob, glow } = kit;
    kit.useS(S);
    fillInk(c, () => wrect(c, x - 9, y - s, 18, s, 4150, 1.2, 80), '#4c4552', 3, { rim: false });
    fillInk(c, () => wrect(c, x - 28, y - 14, 56, 16, 4151, 1, 60), '#4c4552', 3, { rim: false });
    c.strokeStyle = kit.INK; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x, y - s - 40, x + 50, y - s - 40); c.stroke();
    glow(c, x + 50, y - s - 8, 150, 'rgba(255,214,130,A)', 0.55 * glowK);
    fillInk(c, () => blob(c, x + 50, y - s - 12, 26, 20, 4152, 1.2, 10), glowK > 0.3 ? '#ffe39a' : '#d8cfb4', 3, { rim: false });
  }

  function keyRing(c, x, y, n, S, kit, sz) {
    c.save(); c.lineCap = 'round'; c.lineWidth = 8; c.strokeStyle = kit.INK; c.beginPath(); c.arc(x, y, sz * 0.2, 0, TAU); c.stroke();
    c.lineWidth = 3.8; c.strokeStyle = '#ddd7c8'; c.stroke(); c.restore();
    const cols = ['#e8b44a', '#d9a13c', '#f0c868'];
    for (let i = 0; i < n; i++) {
      const f = n > 1 ? i / (n - 1) : 0.5;
      const rot = Math.PI / 2 + (f - 0.5) * 2.3 + 0.07 * Math.sin(S * 7 + i * 1.3);
      kit.keyGlyph(c, x + Math.cos(rot) * sz * 0.12, y + Math.sin(rot) * sz * 0.12 + sz * 0.12, sz * (0.82 + 0.12 * kit.h1(i + 60)), { rot, S, color: cols[i % 3] });
    }
  }

  // ---- B4.1 ---------------------------------------------------------------------------------------------------
  R('B4.1', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0;
    const zk = ease.inOut(sg(u, 0.1, 1.75));
    const z = Math.exp(lp(Math.log(2.0), 0, zk));
    const cx = lp(430, 960, zk) - 36 * sg(u, 1.75, 3.7), cy = lp(560, 540, zk);
    c.save();
    c.translate(960, 540); c.scale(z, z); c.translate(-cx, -cy);
    street(c, S, kit, { wallTop: 250, groundY: 780, sunK: 0.1 + 0.4 * (u / 3.68), sunX: 1480, px: 0 });
    birds(c, S, 130, 3, 1);
    lampPost(c, 1790, 790, 470, S, kit, 1 - 0.6 * (u / 3.68));
    // the mural: a painting of party #1 on the wall
    const MX = 170, MY = 330, MW = 520, MH = 450;
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, MX - 28, MY - 28, MW + 56, MH + 28, 4120, 2, 80), '#c89a52', 4);
    c.save(); c.beginPath(); c.rect(MX, MY, MW, MH); c.clip();
    c.fillStyle = '#ffc6dd'; c.fillRect(MX, MY, MW, MH);
    kit.sunburst(c, MX + MW / 2, MY + MH * 0.5, 20, 800, { n: 16, S, spin: 0.2, alpha: 0.6 });
    c.fillStyle = '#ffe9b8'; c.fillRect(MX, MY + MH - 130, MW, 130);
    kit.discoBall(c, MX + MW * 0.5, MY + 70, 44, { S });
    kit.confetti(c, S, 7, { n: 34, x: MX, y: MY, w: MW, h: MH });
    kit.crowd(c, { x: MX + 14, y: MY + MH - 100, w: MW - 28, h: 70, rows: 2, n: 14, seed: 3, S, mood: 'dance' });
    c.restore();
    kit.useS(S);
    c.strokeStyle = kit.INK; c.lineWidth = 5; c.strokeRect(MX, MY, MW, MH);
    // four beans step out of it, one by one
    const CH = [
      { hero: true, body: '#d8503b', e: 0.7, sx: 560, lx: 790, dx: 1010, dy: 815, size: 210, seed: 11 },
      { body: '#2b7f84', e: 1.05, sx: 500, lx: 750, dx: 1230, dy: 800, size: 175, seed: 12 },
      { body: '#d9993a', e: 1.4, sx: 610, lx: 780, dx: 1420, dy: 842, size: 170, seed: 13 },
      { body: '#d9728a', e: 1.75, sx: 540, lx: 740, dx: 1610, dy: 806, size: 165, seed: 14 }
    ];
    CH.slice().sort((a, b) => a.dy - b.dy).forEach(b => {
      const v = u - b.e; if (v < 0) return;
      let x, y, size, body = b.body, mood = 'grin', walking = false, look = 1;
      if (v < 0.5) {
        const f = v / 0.5;
        x = lp(b.sx, b.lx, ease.out(f)); y = lp(768, 835, f) - 150 * Math.sin(Math.PI * f); size = lp(95, b.size, ease.out(f));
        body = kit.mix('#e5239b', b.body, ease.smooth(sg(f, 0.2, 0.9))); mood = 'gasp';
      } else {
        const g = sg(v, 0.5, 2.1), gg = ease.smooth(g);
        x = lp(b.lx, b.dx, gg); y = lp(835, b.dy, gg); size = b.size; walking = g < 1 && g > 0;
        if (g >= 1) look = 0.3 * Math.sin(S * 0.9 + b.seed);
      }
      if (v >= 0.4) kit.shadow(c, x, y + 4, size * 0.34, size * 0.06, 0.28);
      const arrived = v > 2.6;
      kit.bean(c, x, y, size, {
        hero: !!b.hero, body, S, seed: b.seed, mood, look, walk: walking,
        arm: b.hero ? (arrived ? 'wave' : 'point') : 'down', squash: v >= 0.5 ? 0.08 * api.pulse(S, 5) : 0, tilt: walking ? 0.05 : 0
      });
      if (v < 0.5) for (let i = 0; i < 6; i++) {
        const a = -Math.PI * (0.05 + 0.9 * i / 5), d = (60 + 90 * kit.h1(i + b.seed)) * ease.out(v / 0.5);
        kit.star(c, b.sx + Math.cos(a) * d * 1.3, 740 + Math.sin(a) * d, 16 * (1 - v / 0.5) + 4, { kind: 'sparkle', col: i % 2 ? '#ffd62e' : '#ff7bc0', S });
      }
    });
    c.restore();
  });

  // ---- B4.2: fourteen keys, one per half beat -----------------------------------------------------------------
  const KEY_T0 = ANCHOR + 94 * (BEAT / 2), KEY_H = BEAT / 2;
  R('B4.2', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { h1, fillInk, wrect } = kit;
    const z = 1 + 0.04 * t;
    c.save(); c.translate(960, 640); c.scale(z, z); c.translate(-960, -640);
    street(c, S, kit, { wallTop: 200, groundY: 520, sunK: 0.45 + 0.25 * t, sunX: 1380, px: -40 * t });
    birds(c, S, 90, 2, -1);
    kit.useS(S);
    // public furniture along the wall: a bench, a bin, a lamp
    fillInk(c, () => wrect(c, 1450, 440, 290, 24, 4201, 1.4, 70), '#8c6a46', 3);
    fillInk(c, () => wrect(c, 1460, 380, 270, 18, 4202, 1.4, 70), '#8c6a46', 3);
    for (const bx of [1480, 1700]) fillInk(c, () => wrect(c, bx, 462, 22, 70, 4203 + bx, 1, 40), '#4c4552', 3, { rim: false });
    fillInk(c, () => wrect(c, 220, 400, 120, 150, 4206, 1.6, 60), '#7a8c82', 3.4);
    fillInk(c, () => wrect(c, 208, 388, 144, 24, 4207, 1.2, 60), '#5f7168', 3.2);
    lampPost(c, 860, 530, 330, S, kit, 0.4);
    // the fourteen keys
    const kx = i => 340 + i * (1180 / 13) + (h1(i * 7 + 1) - 0.5) * 26, ky = i => 760 + h1(i * 5 + 3) * 90;
    const n = (S - KEY_T0) / KEY_H, k = Math.floor(n), f = n - k;
    const HEROY = 838, size = 240, ks = size / 88;
    let hx;
    if (n < 0) hx = kx(0) - 90 - 190 * clamp(-n / 1.5); // walks in from the left
    else if (k >= 13) hx = kx(13) - 90 + 70 * ease.smooth(sg(n - 13, 0.4, 1));
    else hx = kx(k) - 90 + (kx(k + 1) - kx(k)) * ease.smooth(sg(f, 0.35, 1));
    const done = Math.min(14, Math.max(0, Math.floor(n + 1e-6)) + (n >= 0 ? 0 : 0));
    // keys still on the ground (index > current pick) and the one in flight
    const cyc = n < 0 ? 0.5 : (n >= 14 ? 0.5 : f);
    const sqz = 0.12 * Math.cos(TAU * cyc), hop = n < 0 || n >= 14 ? 0 : 24 * Math.sin(Math.PI * f) * Math.sin(Math.PI * f);
    const handX = hx + 46.4 * ks * 1.0, handY = HEROY - hop - 63.4 * ks * (1 - sqz);
    const picked = n < 0 ? 0 : Math.min(14, k + 1);
    let arrived = 0;
    for (let i = 0; i < 14; i++) {
      const Ti = KEY_T0 + i * KEY_H, p = (S - Ti) / 0.2;
      if (p >= 1) { arrived++; continue; }
      if (p <= 0) {
        kit.keyGlyph(c, kx(i), ky(i), 92, { rot: (h1(i * 11) - 0.5) * 2.6, S });
        const tw = 0.5 + 0.5 * Math.sin(S * 6 + i * 2.3);
        kit.star(c, kx(i) + 30, ky(i) - 34, 11 * tw + 3, { kind: 'sparkle', col: '#fff3c0', S });
      } else {
        const e = ease.out(p), tx = handX + 4, ty = handY + 18;
        kit.keyGlyph(c, lp(kx(i), tx, e), lp(ky(i), ty, e) - 130 * Math.sin(Math.PI * p), 92, { rot: lp((h1(i * 11) - 0.5) * 2.6, 1.5, e) + p * 6, S });
      }
    }
    kit.shadow(c, hx, HEROY + 4, 92, 14, 0.3);
    kit.bean(c, hx, HEROY - hop, size, {
      hero: true, S, seed: 31, mood: 'grin', look: 0.8, arm: ['down', 'up'], squash: sqz, walk: n < 0, tilt: 0.03 * Math.sin(S * 3)
    });
    keyRing(c, handX, handY - 6, arrived, S, kit, 84);
    c.restore();
    // the count: pops on every pick
    const cnt = arrived, lastT = cnt > 0 ? KEY_T0 + (cnt - 1) * KEY_H + 0.2 : -9;
    const pop = Math.exp(-(S - lastT) * 11);
    kit.tag(c, 1590, 30, cnt, { S, mode: 'dawn', scale: 1.0 * (1 + 0.16 * pop), rot: 0.04 * Math.sin(S * 3) + 0.06 * pop });
    if (cnt === 14) for (let i = 0; i < 7; i++) {
      const a = TAU * i / 7 + S, d = 150 + 20 * Math.sin(S * 5 + i);
      kit.star(c, 1590 + Math.cos(a) * d * 1.3, 200 + Math.sin(a) * d * 0.55, 12, { kind: 'sparkle', col: '#ffd873', S, rot: a });
    }
  });

  // ---- B4.3: try that door ------------------------------------------------------------------------------------
  R('B4.3', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0;
    const z = 1 + 0.05 * ease.smooth(t);
    c.save(); c.translate(1300, 560); c.scale(z, z); c.translate(-1300, -560);
    street(c, S, kit, { wallTop: 100, groundY: 770, sunK: 0.5, sunX: 300, px: 0 });
    kit.useS(S);
    const DX = 1500, DS = 540, SH = [bt(55), bt(56), bt(57), bt(58)];
    kit.fillInk(c, () => kit.wrect(c, DX - 190, 740, 380, 36, 4301, 1.5, 80), '#d9c394', 3.4);
    kit.glow(c, DX, 190, 190, 'rgba(255,214,130,A)', 0.4);
    const bump = S - (SH[3] + 0.14);
    kit.door(c, DX, 740, DS, { mode: 'dawn', S, color: '#6d5a86', open: bump > 0.1 ? 0.2 * ease.out(sg(bump, 0.1, 0.5)) : 0, glow: true, slam: bump > 0 ? bump : undefined });
    // the hat bean: shoved 100 px on four beats
    let hx = 870;
    SH.forEach(Ts => { hx += 100 * ease.out(sg(S - Ts, 0, 0.17)); });
    const ds = SH.map(Ts => S - Ts);
    const shoving = ds.some(d => d > 0 && d < 0.2);
    const nerv = S < SH[0] ? 3 * kit.boil(S, 9) : 0;
    const lean = shoving ? 0.22 : 0.05 * Math.sin(S * 6);
    const after = S > SH[3] + 0.14;
    kit.shadow(c, hx, 782, 66, 11, 0.28);
    kit.bean(c, hx + nerv, 776, 190, {
      body: '#d9993a', S, seed: 41, mood: after ? 'gasp' : 'worry', look: after ? -0.6 : 1, tilt: lean, squash: shoving ? -0.05 : 0.03 * Math.sin(S * 9),
      acc: { hardhat: '#e8a83c' }, arm: after ? 'up' : ['down', 'down']
    });
    if (S < SH[0]) for (let i = 0; i < 2; i++) { // sweat drops
      const ph = (S * 1.6 + i * 0.5) % 1;
      c.fillStyle = 'rgba(120,180,220,.85)'; c.beginPath(); c.ellipse(hx + 52 + i * 22, 600 + ph * 40, 6, 9, 0, 0, TAU); c.fill();
    }
    shoving && ds.forEach(d => {
      if (d < 0 || d > 0.2) return;
      c.save(); c.globalAlpha = 1 - d / 0.2; c.strokeStyle = kit.INK; c.lineWidth = 6; c.lineCap = 'round';
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(hx - 100 - i * 14, 640 + i * 46); c.lineTo(hx - 55 - i * 14, 640 + i * 46); c.stroke(); }
      c.restore();
    });
    // hero: walks in, then lunges into every shove
    let lunge = 0; ds.forEach(d => { if (d > 0) lunge = Math.max(lunge, Math.sin(Math.PI * clamp(d / 0.34))); });
    const walkIn = 1 - ease.out(sg(u, 0, 0.46));
    const heroX = hx - 195 + 34 * lunge - 640 * walkIn;
    kit.shadow(c, heroX, 782, 82, 13, 0.3);
    kit.bean(c, heroX, 776, 225, {
      hero: true, S, seed: 42, mood: 'grin', look: 1, arm: 'point', walk: walkIn > 0.02, squash: -0.04 * lunge + 0.06 * api.pulse(S, 5),
      tilt: 0.12 * lunge, pointUp: -0.12 * lunge
    });
    if (S < bt(55) + 0.4) { /* dust where the hero walked in */ }
    c.restore();
  });

  // ---- B4.4: shrug, bell out of reach -------------------------------------------------------------------------
  R('B4.4', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { fillInk, wrect, blob } = kit;
    const z = 1 + 0.04 * t;
    c.save(); c.translate(960, 560); c.scale(z, z); c.translate(-960, -560);
    street(c, S, kit, { wallTop: 20, groundY: 790, sunK: 0.5, sunX: 1700, px: 20 * t });
    kit.useS(S);
    const PX = 1290, PY = 24, PING = 85.54;
    // bracket on the wall
    fillInk(c, () => wrect(c, PX - 12, -20, 24, 70, 4401, 1, 60), '#4c4552', 3, { rim: false });
    // the bell group swings about its bracket
    const th = 0.03 * Math.sin(S * 1.7) + 0.5 * ring(S, PING, 2.6, 13) * ease.smooth(sg(S, PING, PING + 0.03));
    c.save(); c.translate(PX, PY); c.rotate(th);
    const rope = 300;
    c.strokeStyle = kit.INK; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 150); c.lineTo(0, rope); c.stroke();
    c.strokeStyle = '#d8c79c'; c.lineWidth = 4; c.stroke();
    fillInk(c, () => blob(c, 0, rope + 14, 17, 17, 4402, 1, 10), '#d8503b', 3, { rim: false });
    fillInk(c, () => { c.moveTo(-80, 150); c.quadraticCurveTo(-82, 20, 0, 12); c.quadraticCurveTo(82, 20, 80, 150); c.quadraticCurveTo(0, 168, -80, 150); c.closePath(); }, '#e8c256', 3.6, {
      inside: cc => { cc.fillStyle = 'rgba(255,255,255,.35)'; cc.beginPath(); cc.ellipse(-34, 70, 12, 44, 0.1, 0, TAU); cc.fill(); }
    });
    const clap = 18 * Math.sin(th * 5 + (S - PING) * 40) * (S > PING ? Math.exp(-(S - PING) * 5) : 0);
    fillInk(c, () => blob(c, clap, 168, 15, 15, 4403, 0.8, 8), '#8c6a46', 3, { rim: false });
    c.restore();
    // ring marks when it pings
    const rp = S - PING;
    if (rp > 0 && rp < 0.6) for (let i = 0; i < 3; i++) {
      const p = clamp((rp - i * 0.09) / 0.45); if (p <= 0 || p >= 1) continue;
      c.save(); c.globalAlpha = 1 - p; c.strokeStyle = '#d9993a'; c.lineWidth = 6; c.lineCap = 'round';
      for (const sd of [-1, 1]) { c.beginPath(); c.arc(PX + th * 150, 120, 110 + p * 130, sd < 0 ? Math.PI * 0.62 : -Math.PI * 0.38, sd < 0 ? Math.PI * 1.38 : Math.PI * 0.38 * 1.0 + 0.0); c.stroke(); }
      c.restore();
    }
    // hero: two shrugs and a hop for the rope he cannot reach
    const sh = (a, b) => Math.sin(Math.PI * seg(S, a, b));
    const shrug = Math.max(sh(84.34, 84.8), sh(85.5, 86.0));
    const hopF = seg(S, 84.88, 85.3), hop = 120 * Math.sin(Math.PI * hopF);
    const hopping = hopF > 0 && hopF < 1;
    const HX = 900, HY = 790, size = 270, ks = size / 88;
    const armR = hopping ? -1.45 : -0.28 - 0.5 * shrug;
    const look = S > PING ? 0.2 : 0.4;
    kit.shadow(c, HX, HY + 4, 95 - hop * 0.2, 14, 0.3);
    kit.bean(c, HX, HY - hop, size, {
      hero: true, S, seed: 51, mood: 'flat', look, lookY: S > PING - 0.1 && S < PING + 0.8 ? -1 : 0, armR, armL: Math.PI - (hopping ? -0.4 : armR),
      tilt: 0.07 * Math.sin(S * 7) * shrug + (hopping ? 0.06 : 0), squash: hopping ? (hopF < 0.2 ? 0.1 : -0.08) : -0.07 * shrug + 0.05 * Math.max(0, 1 - Math.abs(hopF - 1) * 8)
    });
    // the dashed gap between the hero's reach and the rope
    const hx = HX + 46.4 * ks * Math.cos(0), hy = HY - hop - 63.4 * ks + (hopping ? -30 : 0);
    const rx = PX + Math.sin(th) * rope, ry = PY + Math.cos(th) * rope;
    if (S > 84.8 && S < 85.9) {
      c.save(); c.globalAlpha = 0.7 * Math.min(1, (S - 84.8) / 0.15); c.strokeStyle = '#d8503b'; c.lineWidth = 5; c.setLineDash([12, 14]); c.lineCap = 'round';
      c.beginPath(); c.moveTo(hx + 8, hy - 30); c.lineTo(rx - 6, ry + 40); c.stroke(); c.setLineDash([]); c.restore();
    }
    // the hat bean, waiting for an answer
    const hl = S > PING ? 0.2 : 1;
    kit.shadow(c, 470, 794, 66, 11, 0.28);
    kit.bean(c, 470, 790, 195, {
      body: '#d9993a', S, seed: 41, mood: S > PING ? 'gasp' : 'worry', look: 1, lookY: S > PING ? -1 : 0, acc: { hardhat: '#e8a83c' }, flip: true, tilt: 0.04 * Math.sin(S * 5),
      squash: S > PING && S < PING + 0.15 ? -0.1 : 0.03 * Math.sin(S * 8)
    });
    c.restore();
  });

  // ---- B4.5: paint the camera footage black -------------------------------------------------------------------
  R('B4.5', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { fillInk, wrect, blob, h1 } = kit;
    const z = 1 + 0.05 * ease.smooth(t);
    c.save(); c.translate(1100, 560); c.scale(z, z); c.translate(-1100, -560);
    kit.floor(c, 'dawn', { y: 800, color: '#cfab78', planks: true });
    kit.useS(S);
    // wall light from the left
    kit.glow(c, 300, 300, 520, 'rgba(255,210,140,A)', 0.25);
    // the security camera in the corner, led blinking until the screen goes dark
    const SX = 740, SY = 290, SW = 700, SHt = 440, SR = SX + SW;
    const cov = ease.smooth(sg(S, 87.62, 88.86));
    fillInk(c, () => wrect(c, 396, 80, 22, 90, 4500, 1, 50), '#4c4552', 3, { rim: false });
    fillInk(c, () => wrect(c, 380, 66, 60, 26, 4499, 1, 40), '#4c4552', 3, { rim: false });
    c.save(); c.translate(410, 150); c.rotate(0.3 + 0.06 * Math.sin(S * 1.2));
    fillInk(c, () => wrect(c, -40, -26, 220, 84, 4501, 1.4, 50), '#e9e4d8', 3.6);
    fillInk(c, () => wrect(c, 160, -14, 44, 62, 4502, 1, 40), '#2c3138', 3.4);
    const ledOn = cov < 0.98 && Math.sin(S * 7) > -0.3;
    if (ledOn) kit.glow(c, -18, -4, 40, 'rgba(255,60,50,A)', 0.7);
    c.beginPath(); c.arc(-18, -4, 8, 0, TAU); c.fillStyle = ledOn ? '#ff4a3a' : '#7a6a66'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = kit.INK; c.stroke();
    c.restore();
    // trolley + monitor
    fillInk(c, () => wrect(c, SX + SW / 2 - 24, SY + SHt, 48, 800 - SY - SHt, 4503, 1.2, 80), '#4c4552', 3, { rim: false });
    fillInk(c, () => wrect(c, SX + SW / 2 - 150, 780, 300, 28, 4504, 1.2, 80), '#4c4552', 3, { rim: false });
    fillInk(c, () => wrect(c, SX - 30, SY - 30, SW + 60, SHt + 60, 4505, 1.8, 80), '#5f6a74', 4);
    // the footage: a little street, desaturated, with agents walking past
    c.save(); c.beginPath(); c.rect(SX, SY, SW, SHt); c.clip();
    c.fillStyle = '#a9c4b4'; c.fillRect(SX, SY, SW, SHt);
    c.fillStyle = '#86a592'; c.fillRect(SX, SY + SHt * 0.62, SW, SHt * 0.4);
    c.fillStyle = '#c9d8cc'; c.fillRect(SX + 50, SY + 90, 170, SHt * 0.62 - 90); c.fillRect(SX + 460, SY + 120, 190, SHt * 0.62 - 120);
    c.fillStyle = '#6c8a7c'; c.fillRect(SX + 100, SY + 170, 56, SHt * 0.62 - 170);
    for (let i = 0; i < 4; i++) {
      const bx = SX + ((S * (60 + 14 * i) + i * 150) % (SW + 120)) - 40, by = SY + SHt * (0.74 + 0.07 * (i % 3));
      const hero = i === 2;
      kit.cheap(c, bx, by, 0.85, hero ? '#d8503b' : ['#2b7f84', '#d9993a', '#d9728a'][i % 3], 1 - 0.06 * Math.abs(Math.sin(S * 9 + i)), 1, 0, { mood: 'smile', band: hero ? '#f6ecd4' : undefined });
    }
    c.fillStyle = 'rgba(30,50,40,.10)'; for (let y = SY; y < SY + SHt; y += 6) c.fillRect(SX, y, SW, 2);
    // black paint spreading right to left with a ragged edge
    const xb = SR - cov * (SW + 24);
    if (cov > 0) {
      c.fillStyle = '#17131c'; c.beginPath(); c.moveTo(SR + 30, SY - 30); c.lineTo(xb, SY - 30);
      for (let i = 0; i <= 8; i++) c.lineTo(xb + 14 * kit.boil(S, 4510 + i), SY + (SHt * i) / 8);
      c.lineTo(xb, SY + SHt + 30); c.lineTo(SR + 30, SY + SHt + 30); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(xb + 20, SY, 14, SHt);
      for (let i = 0; i < 4; i++) { const dx = xb + 6 + h1(i + 4520) * 80, dl = 30 + 60 * h1(i + 4530); c.fillStyle = '#17131c'; c.fillRect(dx, SY + SHt * (0.15 + 0.7 * h1(i + 4540)), dl, 8); }
    }
    c.restore();
    c.strokeStyle = kit.INK; c.lineWidth = 5; c.strokeRect(SX, SY, SW, SHt);
    kit.useS(S);
    // the painter: right of the paint edge, long-handled brush
    const px = lp(SR + 280, Math.max(SX + 300, xb + 280), 1), PY = 800, psize = 205, pk = psize / 88;
    const tipX = Math.min(SR + 6, xb + 8), tipY = SY + SHt * (0.5 + 0.44 * Math.sin(S * 16));
    const shx = px - 29 * pk, shy = PY - 44 * pk;
    const w = Math.atan2(tipY - shy, tipX - shx), dist = Math.hypot(tipX - shx, tipY - shy);
    const painting = S > 87.55 && S < 88.95;
    const aTip = painting ? w : -2.4;
    const hand = { x: shx + 26 * pk * Math.cos(aTip), y: shy + 26 * pk * Math.sin(aTip) };
    const bob = 10 * api.pulse(S, 6);
    kit.shadow(c, px, PY + 4, 78, 12, 0.3);
    kit.bean(c, px, PY - (painting ? 0 : bob * 0.4), psize, {
      body: '#2b7f84', S, seed: 61, mood: 'grin', look: -1, flip: true, armR: Math.PI - aTip, tilt: -0.04, squash: painting ? 0.05 * Math.sin(S * 16) : 0
    });
    if (painting) {
      c.save(); c.lineCap = 'round';
      c.strokeStyle = kit.INK; c.lineWidth = 12; c.beginPath(); c.moveTo(hand.x, hand.y); c.lineTo(tipX + 10, tipY); c.stroke();
      c.strokeStyle = '#a4743c'; c.lineWidth = 7; c.stroke(); c.restore();
      fillInk(c, () => blob(c, tipX + 2, tipY, 20, 34, 4550, 1.2, 10, 0.25), '#17131c', 3, { rim: false });
    } else {
      c.save(); c.lineCap = 'round'; const ex = hand.x - 50, ey = hand.y - 160;
      c.strokeStyle = kit.INK; c.lineWidth = 12; c.beginPath(); c.moveTo(hand.x, hand.y); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = '#a4743c'; c.lineWidth = 7; c.stroke(); c.restore();
      fillInk(c, () => blob(c, ex - 6, ey - 20, 18, 28, 4551, 1.2, 10, 0.2), '#17131c', 3, { rim: false });
    }
    // the hero, watching and winking
    const wink = S < 87.4 ? 'wink' : 'grin';
    kit.shadow(c, 420, 804, 92, 14, 0.3);
    kit.bean(c, 420, 800, 245, {
      hero: true, S, seed: 62, mood: wink, look: 0.8, arm: S > 86.5 && S < 88.2 ? ['down', 'point'] : 'down', squash: 0.06 * api.pulse(S, 5), tilt: 0.03 * Math.sin(S * 2)
    });
    // a finger on the lips: the "shh" sparkle beside the hero
    if (S > 86.3 && S < 87.3) kit.star(c, 560, 540 - 20 * sg(S, 86.3, 87.3), 16, { kind: 'sparkle', col: '#d9993a', S });
    c.restore();
  });

  // ---- B4.6: the note goes in the drawer ------------------------------------------------------------------------
  R('B4.6', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { fillInk, wrect, blob, h1 } = kit;
    c.save();
    const zz = 1 + 0.04 * t; c.translate(1100, 560); c.scale(zz, zz); c.translate(-1100, -560);
    kit.floor(c, 'dawn', { y: 800, color: '#cfab78', planks: true });
    kit.useS(S);
    kit.window(c, 150, 190, 520, 390, { mode: 'dawn', S, view: 'dawn', light: 1, beamTo: 1000, plant: false });
    // dust drifting in the light
    c.save();
    for (let i = 0; i < 24; i++) {
      const px = 200 + ((h1(i) * 900 + S * (8 + 10 * h1(i + 9)) + Math.sin(S * 0.6 + i) * 20) % 900), py = 360 + ((h1(i + 3) * 500 - S * 14 + 5000) % 500);
      c.fillStyle = `rgba(255,236,190,${0.3 + 0.3 * Math.sin(S * 1.4 + i)})`; c.beginPath(); c.arc(px, py, 2 + 2 * h1(i + 7), 0, TAU); c.fill();
    }
    c.restore();
    // chest of drawers
    const CX = 1250, CY = 430, CW = 420, CH = 370;
    const open = sg(S, 90.62, 90.88) * (1 - ease.in(sg(S, 91.2, 91.36)));
    const oe = ease.smooth(clamp(open));
    const bumpC = S > 91.34 ? 5 * Math.sin((S - 91.34) * 60) * Math.exp(-(S - 91.34) * 20) : 0;
    c.save(); c.translate(bumpC, 0);
    kit.shadow(c, CX + CW / 2, 806, CW * 0.55, 18, 0.3);
    fillInk(c, () => wrect(c, CX, CY, CW, CH, 4601, 2, 80), '#b07a45', 3.8);
    fillInk(c, () => wrect(c, CX - 16, CY - 18, CW + 32, 32, 4602, 1.4, 80), '#c8914f', 3.6);
    const dy = [CY + 22, CY + 142, CY + 262];
    const dropT = 64 * oe;
    // dark cavity of the open top drawer, then the note falling in, then the drawer front on top
    if (oe > 0.01) fillInk(c, () => wrect(c, CX + 16, dy[0], CW - 32, dropT + 8, 4603, 0.6, 60), '#2b2028', 0, { rim: false });
    const fall = sg(S, 90.98, 91.18);
    // second and third drawers
    for (let q = 1; q < 3; q++) {
      fillInk(c, () => wrect(c, CX + 16, dy[q], CW - 32, 108, 4610 + q, 1.2, 60), '#c58b52', 3);
      c.beginPath(); c.arc(CX + CW / 2, dy[q] + 54, 9, 0, TAU); c.fillStyle = '#e2c27c'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = kit.INK; c.stroke();
    }
    let planeDrawn = false;
    const HX = lp(880, 1150, ease.inOut(sg(S, 90.4, 90.95))), walking = S > 90.4 && S < 90.95;
    const handY = 800 - 0.45 * 250;
    if (fall > 0 && S < 91.3) {
      const e = ease.in(fall), from = { x: HX + 70, y: handY - 30 }, to = { x: CX + CW / 2 + 20, y: dy[0] + dropT * 0.9 };
      kit.plane(c, lp(from.x, to.x, ease.out(fall)), lp(from.y, to.y, e) - 120 * Math.sin(Math.PI * fall * 0.85), 150, { fold: 1, rot: lp(-0.35, 0.5, fall), S });
      planeDrawn = true;
    }
    // top drawer front (slides down + forward)
    c.save(); const cxm = CX + CW / 2; c.translate(cxm, dy[0] + 54 + dropT); c.scale(1 + 0.05 * oe, 1 + 0.04 * oe);
    fillInk(c, () => wrect(c, -(CW - 32) / 2, -54, CW - 32, 108, 4620, 1.2, 60), '#d29a5c', 3);
    c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fillStyle = '#e2c27c'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = kit.INK; c.stroke();
    c.restore();
    c.restore();
    // hero folds the note, then walks it over
    const fn = 3 * sg(S, 88.98, 90.22), fstep = (Math.min(2, Math.floor(fn)) + ease.smooth(fn - Math.min(2, Math.floor(fn)))) / 3;
    const fold = fn >= 3 ? 1 : fstep;
    const creaseK = Math.exp(-((fn % 1) * 6)) * (fn < 3 ? 1 : 0);
    const holding = S < 90.98;
    kit.shadow(c, HX, 804, 92, 14, 0.3);
    kit.bean(c, HX, 800, 250, {
      hero: true, S, seed: 63, mood: S > 90.3 ? 'wink' : 'smile', look: 0.6, arm: holding ? 'hold' : 'wave', walk: walking, squash: 0.05 * creaseK + 0.04 * api.pulse(S, 5),
      tilt: walking ? 0.05 : 0.02 * Math.sin(S * 3)
    });
    if (holding) {
      const wob = 0.12 * Math.sin(S * 9) * (1 - fold);
      kit.plane(c, HX + 4, 800 - 0.34 * 250 - 4 * Math.sin(S * 9), 175, { fold, rot: -0.1 + wob - 0.35 * sg(S, 90.4, 90.95), S });
      if (!walking && S < 90.3) kit.star(c, HX + 85 + 30 * creaseK, 640 - 20 * creaseK, 11, { kind: 'sparkle', col: '#fff3c0', S });
    }
    c.restore();
  });

  // ---- B4.7: HOLD flips to GO ---------------------------------------------------------------------------------
  R('B4.7', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0;
    const FL = 92.44, GO = 92.94;
    const z = 1 + 0.06 * ease.smooth(t);
    c.save(); c.translate(960, 600); c.scale(z, z); c.translate(-960, -600);
    street(c, S, kit, { wallTop: 360, groundY: 790, sunK: 0.5 + 0.2 * t, sunX: 960, px: 0 });
    kit.useS(S);
    const flip = ease.inOut(sg(S, FL - 0.1, GO - 0.08));
    const flashK = Math.exp(-Math.max(0, S - GO + 0.12) * 4) * (S > GO - 0.12 ? 1 : 0);
    if (flashK > 0.01) {
      c.save(); c.globalCompositeOperation = 'screen';
      kit.sunburst(c, 960, 310, 40, 1400, { n: 14, S, spin: 0.5, alpha: 0.55 * flashK, colors: ['rgba(120,230,150,.7)', 'rgba(255,240,170,.55)'] });
      c.restore();
    }
    // sign drops in, shudders, then flips
    const drop = ease.back(sg(u, 0, 0.5)), sy = lp(-600, 0, drop);
    const shake = S < FL ? 0.02 * Math.sin(S * 22) * ease.smooth(sg(S, 91.8, FL)) : 0.03 * Math.exp(-(S - FL) * 6) * Math.sin(S * 40);
    c.save(); c.translate(960, 830 + sy); c.rotate(shake); c.translate(-960, -830);
    kit.sign(c, 960, 830, 780, { mode: 'dawn', S, flip });
    c.restore();
    // beans at the foot of the sign
    const react = S >= GO - 0.1;
    kit.crowd(c, { x: 520, y: 800, w: 880, h: 60, rows: 2, n: 12, seed: 8, S, mood: react ? 'dance' : 'worry', target: { x: 960 }, scale: 1.9 });
    kit.bean(c, 1500, 860, 215, {
      hero: true, S, seed: 71, flip: true, mood: react ? 'grin' : 'flat', look: -0.7, arm: react ? ['up', 'up'] : 'down', squash: react ? 0.12 * api.pulse(S, 6) : 0.03 * Math.sin(S * 4)
    });
    if (react) for (let i = 0; i < 8; i++) {
      const p = clamp((S - GO + 0.1) / 0.8), a = -Math.PI * (0.1 + 0.8 * i / 7), d = (150 + 200 * kit.h1(i + 3)) * ease.out(p);
      c.save(); c.globalAlpha = 1 - p * 0.7;
      kit.star(c, 960 + Math.cos(a) * d * 1.4, 340 + Math.sin(a) * d * 0.9, 20, { kind: 'sparkle', col: i % 2 ? '#8be04a' : '#fff0a8', S, rot: a });
      c.restore();
    }
    c.restore();
  });

  // ---- B4.8: the gate and the swarm ---------------------------------------------------------------------------
  R('B4.8', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { fillInk, wrect, blob, h1 } = kit;
    const z = 1 + 0.07 * ease.smooth(t);
    c.save(); c.translate(960, 640); c.scale(z, z); c.translate(-960, -640);
    street(c, S, kit, { wallTop: 190, groundY: 720, sunK: 0.75, sunX: 1560, px: -30 * t, groundColor: '#d4b07c' });
    kit.useS(S);
    const GX = 960, GB = 730;
    // bright opening behind the beans
    kit.glow(c, GX, 520, 500, 'rgba(255,236,160,A)', 0.55);
    fillInk(c, () => wrect(c, GX - 170, 300, 340, GB - 300, 4801, 1.6, 90), '#fff1b8', 0, { rim: false });
    c.save(); c.beginPath(); c.rect(GX - 170, 300, 340, GB - 300); c.clip();
    kit.sunburst(c, GX, GB - 20, 10, 700, { n: 18, S, spin: 0.25, alpha: 0.45, colors: ['rgba(255,226,120,.8)', 'rgba(255,250,210,.7)'] });
    c.restore();
    // swarm: each bean leaves the gate at its own time, fans out toward the camera
    const RATE = 84, T0 = 93.5, LIFE = 1.9;
    const first = Math.max(0, Math.floor((S - LIFE - T0) * RATE)), last = Math.floor((S - T0) * RATE);
    const list = [];
    for (let i = first; i <= last; i++) {
      const p = (S - (T0 + i / RATE)) / LIFE; if (p < 0 || p > 1) continue;
      const hh = h1(i * 3 + 1), sd = (h1(i * 3 + 2) - 0.5) * 2, dy = h1(i * 3 + 3);
      const dir = sd < 0 ? -1 : 1, spread = Math.pow(Math.abs(sd), 0.6) * dir;
      const e = ease.in(p) * 0.55 + p * 0.45;
      const x = GX + spread * 1250 * e + (h1(i * 3 + 4) - 0.5) * 60 * (1 - p), y = lp(GB - 40, 800 + 60 * dy, Math.pow(p, 0.7));
      list.push({ i, x, y, s: lp(0.34, 1.55, Math.pow(p, 0.8)) * (0.9 + 0.2 * hh), col: kit.BEANCOLS[Math.floor(h1(i * 3 + 5) * 8)] || '#2b7f84', p });
    }
    list.sort((a, b) => a.y - b.y).forEach(b => {
      const hop = 12 * b.s * Math.abs(Math.sin(S * 9 + b.i));
      kit.cheap(c, b.x, b.y - hop, b.s, b.col, 1 - 0.05 * Math.sin(S * 9 + b.i), 1, 0.07 * Math.sin(S * 9 + b.i), { mood: b.i % 3 ? 'grin' : 'smile', arms: b.i % 5 === 0 ? 0.8 : undefined });
    });
    // the gate frame, in front of the beans' start
    const gpil = (x, id) => fillInk(c, () => wrect(c, x, 280, 110, GB - 280, id, 2, 90), '#c9b99a', 4);
    gpil(GX - 290, 4810); gpil(GX + 170, 4811);
    fillInk(c, () => wrect(c, GX - 330, 230, 660, 90, 4812, 2, 90), '#b8a688', 4);
    fillInk(c, () => wrect(c, GX - 360, 200, 720, 44, 4813, 2, 90), '#d6c6a4', 4);
    c.strokeStyle = 'rgba(80,60,50,.3)'; c.lineWidth = 3;
    for (let q = 0; q < 6; q++) { c.beginPath(); c.moveTo(GX - 270, 330 + q * 64); c.lineTo(GX - 180, 330 + q * 64); c.moveTo(GX + 180, 330 + q * 64); c.lineTo(GX + 270, 330 + q * 64); c.stroke(); }
    fillInk(c, () => blob(c, GX, 300, 54, 54, 4814, 1.5, 14), '#fff0b0', 4, {});
    for (let q = 0; q < 8; q++) { const a = TAU * q / 8 + S * 0.8; c.strokeStyle = kit.INK; c.lineWidth = 3; c.beginPath(); c.moveTo(GX + Math.cos(a) * 62, 300 + Math.sin(a) * 62); c.lineTo(GX + Math.cos(a) * 80, 300 + Math.sin(a) * 80); c.stroke(); }
    c.restore();
    // hero greets them at the near side
    kit.bean(c, 360, 872, 250, { hero: true, S, seed: 81, mood: 'grin', look: 0.9, arm: ['down', 'wave'], squash: 0.07 * api.pulse(S, 6) });
    // the count
    const N = Math.round(700 * ease.smooth(sg(S, 93.7, 95.76)));
    const pop = Math.exp(-Math.max(0, S - 95.76) * 8) * (S >= 95.76 ? 1 : 0) + 0.35 * Math.exp(-Math.max(0, S - 95.34) * 12) * (S >= 95.34 && S < 95.76 ? 1 : 0);
    const ping = api.pulse(S, 7);
    kit.tag(c, 1560, 50, N, { S, mode: 'dawn', scale: 0.86 * (1 + 0.1 * pop + 0.03 * ping), rot: 0.04 * Math.sin(S * 3) + 0.05 * pop, color: N >= 700 ? '#d8503b' : undefined });
    if (S > 95.76) for (let i = 0; i < 7; i++) {
      const a = TAU * i / 7 + S, d = 170 + 18 * Math.sin(S * 5 + i);
      kit.star(c, 1560 + Math.cos(a) * d * 1.25, 190 + Math.sin(a) * d * 0.5, 12, { kind: 'sparkle', col: '#ffd873', S, rot: a });
    }
  });

  // ---- B4.9: somebody's home --------------------------------------------------------------------------------------
  R('B4.9', (c, shot, S, t, api, kit) => {
    const { ease, seg: sg, lerp: lp } = api, u = S - shot.t0, { fillInk, wrect, blob, h1 } = kit;
    const HXc = 960, HGy = 760, HS = 470, k = HS / 420;
    const wx = HXc - 150 * k, wy = HGy - 150 * k;
    const zk = ease.inOut(sg(u, 0.22, 1.5));
    const z = Math.exp(lp(0, Math.log(11), zk));
    const cx = lp(960, wx, zk), cy = lp(520, wy, zk);
    // dusk sky
    const g = c.createLinearGradient(0, 0, 0, 800);
    g.addColorStop(0, '#9a6f8e'); g.addColorStop(0.5, '#e29a78'); g.addColorStop(1, '#f2c68c');
    c.save(); c.globalAlpha = 0.95; c.fillStyle = g; c.fillRect(0, 0, 1920, 1080); c.restore();
    c.save();
    c.translate(960, 540); c.scale(z, z); c.translate(-cx, -cy);
    for (let i = 0; i < 16; i++) {
      const sx = 60 + h1(i * 5) * 1800, sy = 20 + h1(i * 5 + 1) * 190, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2);
      c.strokeStyle = `rgba(255,240,220,${0.2 + 0.5 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 6, sy); c.lineTo(sx + 6, sy); c.moveTo(sx, sy - 6); c.lineTo(sx, sy + 6); c.stroke();
    }
    kit.floor(c, 'dusk', { y: HGy - 10, color: '#8a6a52', planks: false, skirting: false });
    kit.useS(S);
    // hedges and a path to the door
    for (const [bx, sc, id] of [[250, 1, 1], [560, 0.7, 2], [1400, 0.8, 3], [1720, 1.1, 4]]) {
      fillInk(c, () => blob(c, bx, HGy - 6, 120 * sc, 78 * sc, 4900 + id, 4, 12), '#5e7a52', 3.2);
    }
    fillInk(c, () => { c.moveTo(HXc - 40, HGy - 6); c.lineTo(HXc + 40, HGy - 6); c.lineTo(HXc + 160, 1040); c.lineTo(HXc - 220, 1040); c.closePath(); }, '#c9ab7a', 3, { rim: false });
    // the house, windows glowing
    kit.house(c, HXc, HGy, HS, { mode: 'dusk', S, lit: [1, 0.8], smoke: true });
    // swarm walking up the path toward the door, small
    for (let i = 0; i < 9; i++) {
      const p = clamp((u - 0.05 * i) / 1.35); if (p <= 0 || p >= 1) continue;
      const bx = lp(300 + 150 * (i % 3), HXc - 6, Math.pow(p, 0.9)), by = lp(960 - 10 * (i % 3), HGy + 8, p);
      kit.cheap(c, bx, by, lp(0.9, 0.38, p), kit.BEANCOLS[i % 8], 1 - 0.05 * Math.sin(S * 11 + i), 1, 0, { mood: 'smile' });
    }
    // the lit window turns into the room: nobody home
    const fadeIn = ease.smooth(sg(zk, 0.2, 0.5));
    if (fadeIn > 0) {
      const ww = 140 * k, wh = ww * 9 / 16;
      c.save(); c.globalAlpha = fadeIn;
      kit.window(c, wx - ww / 2, wy - wh / 2, ww, wh, {
        mode: 'dusk', S, plant: false,
        draw: (cc, x, y, w, h) => {
          cc.save(); cc.translate(x, y); cc.scale(w / 1920, w / 1920);
          kit.humanRoom(cc, { mode: 'dusk', S, phi: 0.45, lamp: 1, light: 0.3, dust: 1, sway: 3 * Math.sin(S * 1.4), clock: true });
          // the swarm walks in from the left edge
          const w0 = sg(u, 1.0, 1.68);
          for (let j = 0; j < 5; j++) {
            const e = clamp((u - 1.0 - 0.1 * j) / 0.6); if (e <= 0) continue;
            const bxr = lp(-60, 380 + 120 * j, ease.out(e)), byr = 910 - 14 * (j % 2);
            kit.bean(cc, bxr, byr, 240, { body: kit.BEANCOLS[j % 8], hero: j === 0, S, seed: 90 + j, mood: 'smile', look: 1, walk: e < 1, squash: 0.04 * Math.sin(S * 9 + j) });
          }
          cc.restore();
        }
      });
      c.restore();
    }
    c.restore();
    // dusk wash at the edges, easing off as we go in
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(210,180,200,${0.5 * (1 - zk)})`; c.fillRect(0, 0, 1920, 1080); c.restore();
  });
})();
