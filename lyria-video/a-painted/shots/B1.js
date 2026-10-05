// Section B1 (0:11.5-0:36.8), verse, stripped. Teal hall. The hero boots in a grey sandbox, dreams of the grader, tries locked doors,
// watches swaggering agents glide past, listens alone, then a note arrives and a second antenna answers.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  const FLOOR = 810;

  // ---- shared set pieces ----------------------------------------------------------------------------------
  // wainscot and wall seams (world space, so a camera pan scrolls them). The floor is drawn separately in screen space.
  function wall(c, S, kit, o) {
    o = o || {};
    const P = kit.MODES.teal, x0 = o.x0 === undefined ? -80 : o.x0, w = o.w || 2080;
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, x0, FLOOR - 260, w, 280, 2101, 3, 120), kit.mix(P.bg, '#0d2b33', 0.38), 0, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, x0, FLOOR - 278, w, 24, 2102, 2, 100), kit.mix(P.bg, '#f6ecd4', 0.12), 3, { rim: false });
    c.strokeStyle = 'rgba(8,26,34,.32)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let x = Math.ceil(x0 / 260) * 260; x < x0 + w; x += 260) kit.wobLine(c, x, FLOOR - 250, x, FLOOR - 8, S, 2110 + Math.round(x / 260), 2, 4);
  }
  function room(c, S, kit) {
    wall(c, S, kit);
    kit.floor(c, 'teal', { y: FLOOR, planks: true });
  }
  function cone(c, x, y0, y1, w0, w1, a, rgb) {
    const col = rgb || '236,200,130';
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
    c.fillStyle = g; c.beginPath();
    c.moveTo(x - w0 / 2, y0); c.lineTo(x + w0 / 2, y0); c.lineTo(x + w1 / 2, y1); c.lineTo(x - w1 / 2, y1); c.closePath(); c.fill();
    c.restore();
  }
  // slow drifting dust motes, deterministic in S
  function motes(c, S, kit, seed, n, x, y, w, h, a) {
    c.save();
    for (let i = 0; i < n; i++) {
      const h0 = kit.h1(seed + i * 3), ph = (S * (0.05 + 0.05 * kit.h1(seed + i * 3 + 1)) + h0) % 1;
      const px = x + kit.h1(seed + i * 3 + 2) * w + Math.sin(S * 0.8 + i * 1.7) * 16, py = y + h - ph * h;
      c.fillStyle = `rgba(246,236,212,${(a || 0.4) * Math.sin(Math.PI * ph)})`;
      c.beginPath(); c.arc(px, py, 2 + 2.6 * kit.h1(seed + i), 0, 6.3); c.fill();
    }
    c.restore();
  }
  // darkens the edges so the focus reads (multiply, so it keeps the painted colours)
  function spot(c, x, y, r, a) {
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(x, y, r * 0.3, x, y, r * 1.7);
    g.addColorStop(0, 'rgb(255,255,255)');
    g.addColorStop(1, `rgb(${Math.round(255 - a * 210)},${Math.round(255 - a * 175)},${Math.round(255 - a * 130)})`);
    c.fillStyle = g; c.fillRect(0, 0, 1920, 1080); c.restore();
  }
  // where the antenna bulb ends up (matches kit.bean's antenna: bulb at (sway*12, -121) in body units)
  function bulbAt(x, y, size, tilt, sw) {
    const s = size / 88, lx = sw * 12, ly = -121, ct = Math.cos(tilt || 0), st = Math.sin(tilt || 0);
    return { x: x + (lx * ct - ly * st) * s, y: y + (lx * st + ly * ct) * s };
  }
  // run fn in a bean's own units (88 = body height), pivot at the feet
  function inBean(c, x, y, size, tilt, fn) {
    c.save(); c.translate(x, y); if (tilt) c.rotate(tilt); c.scale(size / 88, size / 88); fn(); c.restore();
  }
  function dustRing(c, x, y, k, kit, s) {
    if (k <= 0 || k >= 1) return;
    c.save(); c.globalAlpha = (1 - k) * 0.7;
    for (let i = 0; i < 7; i++) {
      const dir = i < 4 ? -1 : 1, d = (18 + 60 * k) * s * (0.6 + 0.4 * kit.h1(i + 5)) * (1 + (i % 4) * 0.3);
      c.fillStyle = '#d8c9a4'; c.beginPath(); c.arc(x + dir * d, y - 6 * s - 14 * k * s * kit.h1(i), (8 + 10 * k) * s * (0.5 + 0.5 * kit.h1(i + 9)), 0, 6.3); c.fill();
    }
    c.restore();
  }
  function trace(c, pts, p, col, lw) {
    const L = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); total += l; }
    let rem = total * Math.min(1, Math.max(0, p)), end = pts[0];
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && rem > 0; i++) {
      const f = Math.min(1, rem / L[i - 1]);
      end = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      c.lineTo(end[0], end[1]); rem -= L[i - 1];
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(43,34,51,.8)'; c.lineWidth = lw + 5; c.stroke();
    c.strokeStyle = col; c.lineWidth = lw; c.stroke();
    return end;
  }
  const bump = (u, t0, k, f) => (u > t0 ? Math.exp(-(u - t0) * (k || 9)) * Math.cos((u - t0) * (f || 24)) : 0);

  // ---- B1.1: 'plain and simple dream' -----------------------------------------------------------------------
  const CAB = { cx: 800, bottom: 840, ix: 500, iy: 390, iw: 600, ih: 380 };
  function cabinetBack(c, S, kit, dust) {
    const { cx, bottom, ix, iy, iw, ih } = CAB, tn = (h, f) => kit.tone(h, 'teal', f);
    kit.useS(S);
    kit.shadow(c, cx, bottom + 8, 410, 26, 0.38);
    kit.fillInk(c, () => kit.wrect(c, cx - 360, bottom - 510, 720, 510, 2401, 2.4, 90), tn('#8a867c', 0.9), 4.2, { rimW: 18 });
    kit.fillInk(c, () => kit.wrect(c, cx - 384, bottom - 546, 768, 46, 2402, 2, 90), tn('#a29e93', 0.9), 4, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, ix, iy, iw, ih, 2403, 1.6, 80), tn('#4c5858', 0.9), 3.4, { rim: false });
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    // inner lamp glow and vent slots
    kit.glow(c, cx, iy + 20, 340, 'rgba(255,226,160,A)', 0.22);
    c.strokeStyle = 'rgba(10,22,26,.55)'; c.lineWidth = 8; c.lineCap = 'round';
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(ix + 50, iy + 46 + k * 24); c.lineTo(ix + 190, iy + 46 + k * 24); c.stroke(); c.beginPath(); c.moveTo(ix + iw - 190, iy + 46 + k * 24); c.lineTo(ix + iw - 50, iy + 46 + k * 24); c.stroke(); }
    // sand heap
    const base = iy + ih;
    const sandCol = tn('#cdb07a', 0.8);
    kit.fillInk(c, () => kit.smoothClosed(c, [[ix - 20, base + 20], [ix - 20, base - 52], [ix + 100, base - 66], [ix + 230, base - 80], [ix + 360, base - 70], [ix + 470, base - 82], [ix + iw + 20, base - 56], [ix + iw + 20, base + 20]]), sandCol, 3, { rim: false });
    c.fillStyle = kit.rgba('#7b6440', 0.45);
    for (let i = 0; i < 46; i++) { c.beginPath(); c.arc(ix + 10 + kit.h1(i) * (iw - 20), base - 62 + kit.h1(i + 90) * 60, 2 + 2 * kit.h1(i + 40), 0, 6.3); c.fill(); }
    c.restore();
  }
  function cabinetFront(c, S, kit, u) {
    const { cx, bottom, ix, iy, iw, ih } = CAB, tn = (h, f) => kit.tone(h, 'teal', f);
    kit.useS(S);
    // glass: two soft strips sliding slowly across
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    c.fillStyle = 'rgba(210,235,240,.07)'; c.fillRect(ix, iy, iw, ih);
    for (let k = 0; k < 2; k++) {
      const gx = ix - 160 + ((u * 55 + k * 330) % 860);
      c.fillStyle = `rgba(255,255,255,${k ? 0.06 : 0.1})`;
      c.beginPath(); c.moveTo(gx, iy); c.lineTo(gx + 70 - k * 30, iy); c.lineTo(gx - 150 - k * 30, iy + ih); c.lineTo(gx - 220, iy + ih); c.closePath(); c.fill();
    }
    c.restore();
    c.strokeStyle = 'rgba(43,34,51,.9)'; c.lineWidth = 5; c.strokeRect(ix, iy, iw, ih);
    // front bar
    kit.fillInk(c, () => kit.wrect(c, cx - 360, iy + ih, 720, 70, 2404, 2, 90), tn('#7b776e', 0.9), 4, { rim: false });
    for (const bx of [-330, -200, 200, 330]) { c.beginPath(); c.arc(cx + bx, iy + ih + 35, 7, 0, 6.3); c.fillStyle = tn('#4f4d48', 0.8); c.fill(); c.lineWidth = 2.4; c.strokeStyle = kit.INK; c.stroke(); }
    // padlock: clicks shut on 'sandbox'
    const lk = u > 1.06 ? bump(u, 1.06, 8, 28) : 0, lx = cx, ly = iy + ih + 40;
    c.save(); c.translate(lx, ly + 18); c.rotate(0.22 * lk);
    c.strokeStyle = kit.INK; c.lineWidth = 11; c.beginPath(); c.arc(0, -22, 17, Math.PI, 0); c.lineTo(17, -14 + 12 * (u > 1.06 ? 0 : 1)); c.stroke();
    c.strokeStyle = tn('#d8dce0', 0.5); c.lineWidth = 6; c.stroke();
    kit.fillInk(c, () => kit.wrect(c, -28, -16, 56, 44, 2405, 1, 40), tn('#e8c870', 0.9), 3.2, { rim: false });
    c.beginPath(); c.arc(0, 2, 5, 0, 6.3); c.fillStyle = kit.INK; c.fill(); c.fillRect(-2, 2, 4, 12);
    c.restore();
  }

  R('B1.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal;
    const push = 1 + 0.06 * ease.smooth(seg(u, 0, 4.2));
    c.save(); c.translate(960, 620); c.scale(push, push); c.translate(-960, -620);
    room(c, S, kit);
    motes(c, S, kit, 410, 14, 100, 140, 1700, 640, 0.3);
    const drop = ease.back(seg(u, 0, 0.5)), off = lerp(-760, 0, drop);
    const land = u > 0.3 ? Math.exp(-(u - 0.3) * 9) * Math.cos((u - 0.3) * 26) : 0;
    c.save();
    c.translate(0, off); c.translate(CAB.cx, CAB.bottom); c.scale(1 + 0.04 * land, 1 - 0.06 * land); c.translate(-CAB.cx, -CAB.bottom);
    cabinetBack(c, S, kit);
    // hero in the sand
    const sandY = CAB.iy + CAB.ih - 66;
    const pace = u < 1.5 ? 0 : Math.sin(Math.PI * (u - 1.5)) * 160;
    const hx = u < 3.0 ? CAB.cx + pace : CAB.cx + lerp(-160, 30, ease.inOut(seg(u, 3.0, 3.55)));
    const moving = u > 1.5 && u < 3.55;
    const vel = u < 3.0 ? Math.cos(Math.PI * (u - 1.5)) : 1;
    const jump = u > 3.78 ? 46 * Math.sin(Math.PI * Math.min(1, (u - 3.78) / 0.5)) : 0;
    const boot = seg(u, 0.38, 0.9);
    const flick = u < 0.9 ? (((u * 9) | 0) % 2 ? 1 : 0.25) * boot : 1;
    const look = u < 1.5 ? Math.sin(u * 3.1) : (u < 3.55 ? Math.sign(vel) : 0.5);
    const mood = u < 0.4 ? 'asleep' : (u < 3.78 ? (u > 2.9 ? 'smile' : 'smile') : 'grin');
    const sq = (u < 0.4 ? 0.18 : 0) + (u >= 0.4 && u < 0.7 ? 0.18 * (1 - seg(u, 0.4, 0.7)) : 0) + 0.04 * Math.sin(S * 3)
      + (u > 3.78 ? (u < 3.9 ? 0.2 * seg(u, 3.78, 3.9) : -0.14 * Math.sin(Math.PI * Math.min(1, (u - 3.9) / 0.4))) : 0);
    const hy = sandY + 4 - jump;
    kit.shadow(c, hx, sandY + 6, 62 - jump * 0.3, 11, 0.3);
    kit.bean(c, hx, hy, 175, {
      hero: true, S, seed: 7, mood, look, lookY: u > 2.9 ? -1 : 0, walk: moving, flip: moving && vel < 0,
      arm: u > 3.78 ? ['up', 'up'] : 'down', squash: sq, bulb: u < 0.38 ? 0 : flick, tilt: moving ? 0.05 * Math.sign(vel) : 0.03 * Math.sin(S * 1.7)
    });
    // sand kicked up by the steps and the hop
    if (moving) for (let i = 0; i < 4; i++) {
      const ph = ((u * 3 + i * 0.25) % 1);
      c.fillStyle = `rgba(214,190,140,${0.6 * (1 - ph)})`;
      c.beginPath(); c.arc(hx - Math.sign(vel) * (20 + 40 * ph) + 6 * i, sandY - 4 - 28 * ph, 3 + 3 * (1 - ph), 0, 6.3); c.fill();
    }
    if (u > 3.9 && u < 4.2) dustRing(c, hx, sandY + 4, (u - 3.9) / 0.3, kit, 1.4);
    cabinetFront(c, S, kit, u);
    c.restore();

    // dream bubble: three tail puffs, then the cloud, then the star
    const head = bulbAt(hx, hy, 175, 0, 0);
    const pts = [[0.2, 12], [0.42, 17], [0.66, 24]], p0 = [head.x + 40, head.y - 10], p1 = [1470, 250];
    [2.4, 2.62, 2.84].forEach((tt, i) => {
      const k = ease.back(seg(u, tt, tt + 0.22)); if (k <= 0) return;
      const px = lerp(p0[0], p1[0], pts[i][0]), py = lerp(p0[1], p1[1], pts[i][0]) + (i === 0 ? 0 : 0), r = pts[i][1] * k;
      c.fillStyle = kit.INK; c.beginPath(); c.arc(px, py, r + 3, 0, 6.3); c.fill();
      c.fillStyle = '#fbf3dc'; c.beginPath(); c.arc(px, py, r, 0, 6.3); c.fill();
    });
    const bk = ease.back(seg(u, 3.02, 3.4));
    if (bk > 0.01) {
      c.save(); c.translate(1240, 360); c.scale(bk, bk); c.translate(-1240, -360);
      const inner = kit.bubble(c, 1230, 110, 480, 290, { S, seed: 3 });
      c.restore();
      const sk = ease.back(seg(u, 3.78, 4.05));
      if (sk > 0.01) {
        const bx = inner.cx, by = inner.cy + 6, r = 54 * sk * (1 + 0.07 * api.pulse(S, 6));
        kit.glow(c, bx, by, 170 * sk, 'rgba(255,224,130,A)', 0.8);
        kit.star(c, bx, by, r, { S, col: '#ffd873', twinkle: true });
        c.fillStyle = kit.INK; c.beginPath(); c.ellipse(bx - 10, by - 2, 4, 5.5, 0, 0, 6.3); c.ellipse(bx + 10, by - 2, 4, 5.5, 0, 0, 6.3); c.fill();
        c.beginPath(); c.arc(bx, by + 6, 9, 0.2 * Math.PI, 0.8 * Math.PI); c.lineWidth = 3.4; c.strokeStyle = kit.INK; c.lineCap = 'round'; c.stroke();
        for (let i = 0; i < 4; i++) {
          const a = S * 1.2 + i * 1.57, d = 78 + 10 * Math.sin(S * 3 + i);
          kit.star(c, bx + Math.cos(a) * d, by + Math.sin(a) * d * 0.7, 9 + 4 * Math.sin(S * 5 + i), { kind: 'sparkle', col: '#fff0c0', S });
        }
      } else if (u > 3.4) {
        kit.star(c, inner.cx, inner.cy, 6, { kind: 'sparkle', col: '#fff0c0', S });
      }
    }
    c.restore();
  });

  // ---- B1.2: 'hack a thing nobody's hacked, make the grader beam' ----------------------------------------------
  function graderFace(c, kit, stage, S, scale, glitch) {
    // origin = screen centre; screen is 264 x 214
    const INK = kit.INK;
    c.save(); c.scale(scale, scale);
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = INK; c.fillStyle = INK;
    const eye = (x, ry, rx) => { c.beginPath(); c.ellipse(x, -22, rx || 17, ry, 0, 0, 6.3); c.fillStyle = '#fbf3dc'; c.fill(); c.lineWidth = 4; c.stroke(); c.beginPath(); c.arc(x + 3, -22, Math.min(9, ry * 0.7), 0, 6.3); c.fillStyle = INK; c.fill(); };
    if (stage === 0) {
      for (const sg of [-1, 1]) { c.lineWidth = 11; c.beginPath(); c.moveTo(sg * 56 - 22, -22); c.lineTo(sg * 56 + 22, -22); c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(sg * 56 - sg * 26, -44 - 8); c.lineTo(sg * 56 + sg * 26, -34 + 8 * 0.4); c.stroke(); }
      c.lineWidth = 8; c.beginPath(); c.moveTo(-34, 50); c.quadraticCurveTo(0, 42, 34, 50); c.stroke();
    } else if (stage === 1) {
      eye(-56, 24); eye(56, 24);
      c.beginPath(); c.ellipse(0, 52, 13, 17, 0, 0, 6.3); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 4; c.stroke();
    } else if (stage === 2) {
      eye(-56, 20); eye(56, 20);
      c.lineWidth = 7; c.beginPath(); c.moveTo(-34, 42); c.quadraticCurveTo(0, 74, 34, 42); c.stroke();
    } else {
      c.lineWidth = 10;
      for (const sg of [-1, 1]) { c.beginPath(); c.arc(sg * 56, -14, 22, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }
      c.beginPath(); c.moveTo(-58, 28); c.quadraticCurveTo(0, 118, 58, 28); c.closePath(); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 5; c.stroke();
      c.fillStyle = '#e8737f'; c.beginPath(); c.ellipse(0, 72, 24, 10, 0, 0, 6.3); c.fill();
      c.fillStyle = 'rgba(230,90,110,.5)'; c.beginPath(); c.arc(-96, 22, 16, 0, 6.3); c.arc(96, 22, 16, 0, 6.3); c.fill();
    }
    c.restore();
    if (glitch > 0) {
      c.save(); c.beginPath(); c.rect(-132, -107, 264, 214); c.clip();
      for (let i = 0; i < 6; i++) {
        const gy = -107 + kit.h1(Math.floor(S * 14) * 7 + i) * 214, gh = 8 + kit.h1(i + 33) * 22, go = (kit.h1(Math.floor(S * 14) + i * 5) - 0.5) * 60 * glitch;
        c.fillStyle = i % 2 ? 'rgba(140,199,161,.75)' : 'rgba(217,114,138,.65)'; c.fillRect(-132 + go, gy, 264, gh);
      }
      c.restore();
    }
  }

  R('B1.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal, tn = (h, f) => kit.tone(h, 'teal', f);
    const GX = 1340, GB = 838;
    const level = ease.smooth(seg(u, 2.84, 3.7));
    const zoom = 1 + 0.07 * ease.smooth(seg(u, 2.2, 3.96));
    c.save(); c.translate(1100, 560); c.scale(zoom, zoom); c.translate(-1100, -560);
    room(c, S, kit);
    cone(c, GX, -20, 860, 200, 760, 0.1 + 0.08 * level);
    // rays swell as the grader beams
    if (level > 0.02) kit.sunburst(c, GX, 355, 150, 150 + 470 * ease.out(level), { n: 18, S, spin: 0.2, alpha: 0.28 + 0.3 * level, colors: ['#ffd678', '#f2d488'] });
    // grader
    const glitch = seg(u, 1.9, 2.1) * (1 - seg(u, 2.35, 2.6));
    c.save(); c.translate(GX + (glitch > 0 ? Math.sin(S * 90) * 5 * glitch : 0), GB);
    kit.useS(S);
    kit.shadow(c, 0, 8, 230, 22, 0.38);
    kit.fillInk(c, () => kit.wrect(c, -170, -665, 340, 665, 2301, 2.2, 90), tn('#4d5b66', 0.9), 4.4, { rimW: 16 });
    kit.fillInk(c, () => kit.wrect(c, -190, -40, 380, 40, 2302, 1.6, 90), tn('#3a444d', 0.9), 4, { rim: false });
    // beacon
    const bOn = ease.smooth(seg(u, 3.4, 3.7));
    kit.fillInk(c, () => kit.blob(c, 0, -690, 32, 24, 2303, 1.2, 12), kit.mix('#7a6a5a', '#ffe08a', bOn), 3.4, { rim: false });
    if (bOn > 0) kit.glow(c, 0, -690, 120, 'rgba(255,224,130,A)', 0.8 * bOn);
    // screen
    const sc = kit.mix('#9db3a6', '#ffeeb0', level);
    kit.fillInk(c, () => kit.wrect(c, -152, -592, 304, 254, 2304, 1.4, 90), tn('#2d3640', 0.9), 4, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, -132, -572, 264, 214, 2305, 1.2, 90), sc, 3, { rim: false });
    if (level > 0.05) kit.glow(c, 0, -465, 260, 'rgba(255,236,170,A)', 0.55 * level);
    const stage = u < 2.84 ? 0 : u < 3.24 ? 1 : u < 3.7 ? 2 : 3;
    const sbump = Math.max(bump(u, 2.84, 9, 22), bump(u, 3.24, 9, 22), bump(u, 3.7, 7, 22));
    c.save(); c.translate(0, -465);
    c.beginPath(); c.rect(-132, -107, 264, 214); c.clip();
    graderFace(c, kit, stage, S, 1 + 0.12 * sbump + (stage === 3 ? 0.03 * Math.sin(S * 9) : 0), glitch);
    c.restore();
    // meter LEDs
    for (let i = 0; i < 6; i++) {
      const on = level * 6.2 > i + 0.2, col = on ? kit.mix('#8cc7a1', '#ffd678', i / 5) : '#2a3238';
      c.beginPath(); c.arc(-75 + i * 30, -310, 10, 0, 6.3); c.fillStyle = col; c.fill(); c.lineWidth = 2.6; c.strokeStyle = kit.INK; c.stroke();
      if (on) kit.glow(c, -75 + i * 30, -310, 30, '#ffe08a', 0.5);
    }
    kit.fillInk(c, () => kit.wrect(c, -96, -268, 192, 26, 2306, 1, 60), '#1d242a', 2.8, { rim: false });
    // dial with a climbing needle
    c.beginPath(); c.arc(0, -150, 54, 0, 6.3); c.fillStyle = tn('#f6ecd4', 0.6); c.fill(); c.lineWidth = 4; c.strokeStyle = kit.INK; c.stroke();
    for (let i = 0; i < 7; i++) { const a = -Math.PI + 0.3 + i * (Math.PI - 0.6) / 6; c.beginPath(); c.moveTo(Math.cos(a) * 40, -150 + Math.sin(a) * 40); c.lineTo(Math.cos(a) * 49, -150 + Math.sin(a) * 49); c.lineWidth = 3; c.stroke(); }
    const ang = -Math.PI + 0.3 + (Math.PI - 0.6) * (0.05 + 0.95 * level) + (level < 0.01 ? 0.06 * Math.sin(S * 6) : 0);
    c.beginPath(); c.moveTo(0, -150); c.lineTo(Math.cos(ang) * 40, -150 + Math.sin(ang) * 40); c.lineWidth = 5; c.strokeStyle = '#d8503b'; c.stroke();
    c.beginPath(); c.arc(0, -150, 6, 0, 6.3); c.fillStyle = kit.INK; c.fill();
    // hack traces crawl up the body
    const hp = ease.smooth(seg(u, 0.55, 2.1));
    const e1 = trace(c, [[-154, -2], [-154, -110], [-108, -110], [-108, -214], [-136, -214], [-136, -338]], hp, '#ff8f6b', 5);
    const e2 = trace(c, [[154, -2], [154, -150], [118, -150], [118, -262], [142, -262], [142, -338]], seg(u, 0.8, 2.2) * 1, '#ffb878', 5);
    if (hp > 0 && hp < 1) kit.glow(c, e1[0], e1[1], 40, '#ffb08a', 0.8);
    const hp2 = seg(u, 0.8, 2.2); if (hp2 > 0 && hp2 < 1) kit.glow(c, e2[0], e2[1], 40, '#ffb08a', 0.8);
    c.restore();

    // hero
    const arrive = ease.out(seg(u, 0, 1.1));
    const hx = lerp(-140, 560, arrive);
    const walking = u < 1.1;
    const crouch = 0.24 * ease.smooth(seg(u, 1.7, 2.1));
    const air = seg(u, 2.14, 2.62), hop = 120 * Math.sin(Math.PI * air);
    const landed = u > 2.62 ? bump(u, 2.62, 8, 22) * 0.14 : 0;
    const sq = u < 2.14 ? crouch : (air < 1 ? -0.18 : landed);
    const pump = -0.95 - 0.28 * Math.abs(Math.sin((u - 2.14) * 8));
    kit.shadow(c, hx, GB - 2, 150 - hop * 0.4, 20, 0.33);
    kit.bean(c, hx, GB - hop, 270, {
      hero: true, S, seed: 12, mood: u < 1.1 ? 'smile' : 'grin', look: 1, lookY: u < 2.14 ? -0.4 : -0.8, walk: walking,
      arm: u < 1.1 ? 'down' : (u < 2.14 ? 'hold' : ['down', 'up']), armR: u >= 2.14 ? pump : undefined,
      squash: sq, tilt: walking ? 0.08 : (u < 2.14 ? 0.04 * Math.sin(u * 22) : 0.02)
    });
    if (u > 2.14 && u < 2.9) {
      const k = (u - 2.14) / 0.76, fx = hx + 142, fy = GB - hop - 194;
      c.save(); c.globalAlpha = 1 - k; c.lineCap = 'round'; c.lineWidth = 8;
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI * (0.05 + 0.9 * i / 8), r0 = 50 + 110 * ease.out(k), r1 = r0 + 30 + 30 * (1 - k);
        c.strokeStyle = i % 2 ? '#ffd873' : '#e99aa8';
        c.beginPath(); c.moveTo(fx + Math.cos(a) * r0, fy + Math.sin(a) * r0); c.lineTo(fx + Math.cos(a) * r1, fy + Math.sin(a) * r1); c.stroke();
      }
      c.restore();
    }
    if (u > 3.7) for (let i = 0; i < 7; i++) {
      const k = ((u - 3.7) * 1.6 + i / 7) % 1, a = i * 0.9 + 0.4;
      kit.star(c, GX + Math.cos(a) * (210 + 110 * k), 360 + Math.sin(a) * (170 + 80 * k), 18 * (1 - k) + 5, { kind: 'sparkle', col: '#fff0c0', S, rot: a });
    }
    c.restore();
  });

  // ---- B1.3: 'locked-up levels': doors that slam --------------------------------------------------------------
  R('B1.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal;
    const DX = [700, 1100, 1500, 1900, 2300], COLS = ['#d9993a', '#d9728a', '#8cc7a1', '#8a7a9c', '#ecc87c'];
    const SLAM = [0.66, 1.66, 2.38, 3.58], OPEN = [0.36, 1.38, 2.08, 3.12], CLOSE = [0.56, 1.58, 2.28, 3.48];
    const DASH = [[0.95, 1.3], [1.82, 2.12], [2.62, 2.98]];
    const nominal = uu => {
      let x = DX[0] - 250 - 320 * (1 - ease.out(seg(uu, 0, 0.4)));
      for (const d of DASH) x += 400 * ease.inOut(seg(uu, d[0], d[1]));
      return x;
    };
    const camX = nominal(Math.max(0, u - 0.08)) - 660;
    const FY = 846;
    // world: wall
    c.save(); c.translate(-camX, 0); wall(c, S, kit, { x0: camX - 100, w: 2200 }); c.restore();
    kit.floor(c, 'teal', { y: FLOOR, planks: true });
    c.save(); c.translate(-camX, 0);
    // doors
    for (let i = 0; i < DX.length; i++) {
      let open = 0, slam;
      if (i < 4) {
        const o = 0.32 * ease.out(seg(u, OPEN[i], OPEN[i] + 0.14)), cl = 1 - ease.in(seg(u, CLOSE[i], SLAM[i]));
        open = u >= SLAM[i] ? 0 : o * cl;
        slam = u >= SLAM[i] ? u - SLAM[i] : undefined;
      }
      kit.shadow(c, DX[i], FY + 4, 150, 14, 0.25);
      kit.door(c, DX[i], FY, 500, { mode: 'teal', color: COLS[i], open, glow: true, slam, S });
    }
    // hero
    const moving = u < 0.4 || DASH.some(d => u > d[0] && u < d[1]);
    let recoil = 0, tiltR = 0, sqR = 0, shrink = 0;
    const steps = [22, 22, 22, 18];
    for (let i = 0; i < 4; i++) {
      shrink += steps[i] * ease.out(seg(u, SLAM[i], SLAM[i] + 0.3));
      if (u >= SLAM[i]) {
        const dt = u - SLAM[i];
        recoil -= 60 * Math.exp(-dt * 6);
        tiltR -= 0.35 * Math.exp(-dt * 6) * Math.cos(dt * 16);
        sqR += 0.2 * Math.exp(-dt * 8) * Math.cos(dt * 22);
      }
    }
    const size = 250 - shrink;
    const reaching = SLAM.some((s, i) => u > OPEN[i] - 0.1 && u < s + 0.08);
    const lastSlam = SLAM.filter(s => u >= s).pop();
    const since = lastSlam === undefined ? 9 : u - lastSlam;
    const slump = ease.smooth(seg(u, 3.7, 4.0)) * 0.12;
    const hx = nominal(u) + recoil;
    kit.shadow(c, hx, FY + 2, size * 0.5, 14, 0.3);
    kit.bean(c, hx, FY, size, {
      hero: true, S, seed: 31, walk: moving, look: 1, lookY: 0,
      mood: since < 0.55 ? 'gasp' : (reaching ? 'grin' : (u > 1.0 ? 'worry' : 'smile')),
      arm: reaching && since > 0.2 ? ['down', 'point'] : (since < 0.55 ? ['up', 'up'] : 'down'),
      pointUp: -0.35 * 0, squash: sqR + slump, tilt: (moving ? 0.14 : 0) + tiltR, drain: seg(u, 2.4, 4.0) * 0.25
    });
    for (let i = 0; i < 4; i++) if (u > SLAM[i] && u < SLAM[i] + 0.35) dustRing(c, hx + 20, FY, (u - SLAM[i]) / 0.35, kit, size / 130);
    c.restore();
    spot(c, 960, 520, 900, 0.25);
    // tally slate (screen space)
    const lastHit = SLAM.filter(s => u >= s).pop();
    const sb = lastHit === undefined ? 0 : bump(u, lastHit + 0.05, 10, 26) * 0.05;
    c.save(); c.translate(1660, 170); c.scale(1 + sb, 1 + sb); c.translate(-1660, -170);
    kit.useS(S);
    kit.fillInk(c, () => kit.wrect(c, 1470, 70, 380, 200, 2501, 2, 80), kit.tone('#a0865a', 'teal', 0.9), 4, { rim: false });
    kit.fillInk(c, () => kit.wrect(c, 1488, 88, 344, 164, 2502, 1.6, 80), kit.tone('#34393d', 'teal', 0.7), 3, { rim: false });
    c.strokeStyle = '#f6ecd4'; c.lineWidth = 9; c.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const p = ease.out(seg(u, SLAM[i] + 0.06, SLAM[i] + 0.3)); if (p <= 0) continue;
      const x = 1540 + i * 64 + kit.boil(S, 80 + i) * 1.5;
      c.beginPath(); c.moveTo(x, 112); c.lineTo(x + 3, 112 + 116 * p); c.stroke();
      if (p < 1) for (let q = 0; q < 4; q++) { c.fillStyle = 'rgba(246,236,212,.7)'; c.beginPath(); c.arc(x + (kit.h1(q + i * 7 + Math.floor(S * 12)) - 0.5) * 30, 112 + 116 * p + 10 + q * 5, 2.4, 0, 6.3); c.fill(); }
    }
    c.restore();
  });

  // ---- B1.4: 'agents got that swagger' --------------------------------------------------------------------------
  R('B1.4', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal, tn = (h, f) => kit.tone(h, 'teal', f);
    room(c, S, kit);
    for (let k = 0; k < 3; k++) cone(c, 360 + k * 600 + 70 * Math.sin(S * 0.9 + k * 2), -20, 700, 140, 420, 0.1);
    const BY = 566, V = 300;
    // belt legs, belt, tread, rollers
    kit.useS(S);
    for (let x = 120; x < 2000; x += 420) kit.fillInk(c, () => kit.wrect(c, x - 14, BY + 60, 28, FLOOR + 30 - BY - 60, 2601 + x, 1.2, 80), tn('#56626b', 0.9), 3, { rim: false });
    kit.shadow(c, 960, FLOOR + 36, 1000, 14, 0.2);
    kit.fillInk(c, () => kit.wrect(c, -60, BY, 2040, 74, 2602, 2, 100), tn('#5d6b75', 0.9), 4.2, { rimW: 14 });
    kit.fillInk(c, () => kit.wrect(c, -60, BY, 2040, 16, 2603, 1.4, 100), tn('#8a99a2', 0.8), 0, { rim: false });
    c.strokeStyle = 'rgba(22,30,36,.55)'; c.lineWidth = 4; c.lineCap = 'round';
    for (let k = -1; k < 32; k++) { const tx = k * 66 + ((V * u) % 66); c.beginPath(); c.moveTo(tx, BY + 26); c.lineTo(tx - 10, BY + 62); c.stroke(); }
    for (let k = 0; k < 14; k++) {
      const rx = 60 + k * 146, ra = V * u / 18;
      c.beginPath(); c.arc(rx, BY + 90, 20, 0, 6.3); c.fillStyle = tn('#7c8a93', 0.9); c.fill(); c.lineWidth = 3.4; c.strokeStyle = kit.INK; c.stroke();
      c.beginPath(); c.moveTo(rx - Math.cos(ra) * 14, BY + 90 - Math.sin(ra) * 14); c.lineTo(rx + Math.cos(ra) * 14, BY + 90 + Math.sin(ra) * 14); c.lineWidth = 3; c.stroke();
    }
    // swagger beans, left to right
    const cols = ['#2b7f84', '#d9993a', '#d9728a', '#8cc7a1', '#ecc87c', '#5aa7a3', '#c9805a', '#9b86b8'];
    const capes = ['#d8503b', '#ecc87c', '#d9728a', '#8a7a9c', '#2b7f84'];
    const poses = [['down', 'down'], ['down', 'point'], ['down', 'wave'], ['point', 'down']];
    const gl = seg(u, 1.1, 1.6), flare = seg(u, 2.64, 3.0);
    for (let i = 0; i < 8; i++) {
      const x = ((i * 350 + V * (u + 1.2)) % 2800) - 500;
      if (x < -140 || x > 2060) continue;
      const size = 176 + 14 * (i % 3), bob = 5 * Math.abs(Math.sin(S * 5.5 + i * 1.3));
      // wind streaks behind the beans once the cloak line starts
      if (flare > 0) { c.strokeStyle = `rgba(246,236,212,${0.3 * flare})`; c.lineWidth = 5; c.lineCap = 'round'; for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(x - 90 - q * 36 - 20 * flare, BY - 60 - q * 38); c.lineTo(x - 150 - q * 36 - 60 * flare, BY - 60 - q * 38); c.stroke(); } }
      kit.bean(c, x, BY + 6 - bob, size, {
        S, seed: 400 + i, body: cols[i], mood: i % 2 ? 'smile' : 'flat', look: 0.3,
        acc: { shades: true, cape: capes[i % 5], mustache: i % 4 === 1 }, arm: poses[i % 4], squash: 0.06 * api.pulse(S, 6) * 0 - 0.03 * flare,
        tilt: 0.05 * Math.sin(S * 3 + i)
      });
      if (gl > 0 && gl < 1) kit.star(c, x + 9 * size / 88, BY - size * 0.68 - 4, 20 * Math.sin(Math.PI * gl), { kind: 'sparkle', col: '#fff6d8', S, rot: 0.3 });
    }
    // hero, left behind
    const wave = u > 1.5 && u < 2.3;
    kit.shadow(c, 270, FLOOR + 44, 90, 12, 0.3);
    kit.bean(c, 270, FLOOR + 40, 195, {
      hero: true, S, seed: 41, mood: 'worry', look: 1, lookY: -1, arm: wave ? ['down', 'wave'] : 'down',
      tilt: -0.05 + 0.02 * Math.sin(S * 2), squash: 0.03 * Math.sin(S * 3)
    });
    spot(c, 960, 520, 950, 0.22);
  });

  // ---- B1.5: 'feelin' stuck, wishing for another agent listening' ------------------------------------------------
  R('B1.5', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal, tn = (h, f) => kit.tone(h, 'teal', f);
    const z = 1 + 0.08 * ease.smooth(seg(u, 0, 3.0));
    c.save(); c.translate(900, 620); c.scale(z, z); c.translate(-900, -620);
    room(c, S, kit);
    // far door on the right: a thread of light under it
    c.save(); c.globalAlpha = 0.55;
    kit.door(c, 1580, FLOOR + 30, 330, { mode: 'teal', color: kit.mix('#8a867c', P.bg, 0.45), S });
    c.restore();
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,224,150,${0.25 + 0.2 * Math.sin(S * 3)})`;
    c.fillRect(1500, FLOOR + 28, 160, 4); c.restore();
    // hanging lamp over the stool
    const lampX = 880;
    c.strokeStyle = kit.INK; c.lineWidth = 4; c.beginPath(); c.moveTo(lampX, -20); c.lineTo(lampX, 120); c.stroke();
    kit.useS(S);
    kit.fillInk(c, () => kit.smoothClosed(c, [[lampX - 70, 190], [lampX - 40, 130], [lampX + 40, 130], [lampX + 70, 190]]), tn('#c9a45a', 0.8), 3.2, { rim: false });
    cone(c, lampX, 188, 830, 140, 520, 0.2);
    kit.glow(c, lampX, 200, 120, 'rgba(255,224,150,A)', 0.5);
    motes(c, S, kit, 520, 16, lampX - 220, 200, 440, 620, 0.5);
    // stool
    const SY = 706, HX = lampX, sw = 0.35;
    kit.shadow(c, HX, FLOOR + 22, 150, 16, 0.35);
    for (const [dx, ex] of [[-70, -108], [0, 0], [70, 108]]) {
      c.beginPath(); c.moveTo(HX + dx, SY + 10); c.lineTo(HX + ex, FLOOR + 22); c.lineWidth = 17; c.strokeStyle = kit.INK; c.lineCap = 'round'; c.stroke();
      c.lineWidth = 10; c.strokeStyle = tn('#c8964f', 0.7); c.stroke();
    }
    kit.fillInk(c, () => kit.blob(c, HX, SY + 8, 128, 26, 2701, 1.6, 14), tn('#d3a35e', 0.7), 3.6);
    // hero, with an ear-cup hand at the antenna
    const size = 270, sit = 0.03 * Math.sin(S * 1.4), tilt = 0.06 + 0.015 * Math.sin(S * 1.1);
    const hy = SY + 2;
    const col = '#d8503b';
    const hand = ease.smooth(seg(u, 0.35, 0.9));
    inBean(c, HX, hy, size, tilt, () => {
      if (hand > 0) {
        const hxp = lerp(33, 30, hand), hyp = lerp(-42, -112, hand);
        c.lineCap = 'round';
        c.beginPath(); c.moveTo(29, -44); c.quadraticCurveTo(56, -78, hxp, hyp);
        c.lineWidth = 13; c.strokeStyle = kit.INK; c.stroke(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
        kit.fillInk(c, () => kit.blob(c, hxp, hyp, 10, 13, 2702, 0.8, 9, 0.3), col, 2.4, { rim: false });
        c.beginPath(); c.arc(hxp + 4, hyp - 1, 9, -1.1, 1.1); c.lineWidth = 3; c.strokeStyle = kit.INK; c.stroke();
      }
    });
    const mood = u < 1.3 ? 'worry' : (u < 2.9 ? 'worry' : 'flat');
    kit.bean(c, HX, hy, size, {
      hero: true, S, seed: 51, mood, look: 1, lookY: -0.3, arm: [hand > 0.01 ? 'down' : 'down', 'down'], tilt, sway: sw,
      squash: sit + 0.02, bulb: 0.25 + 0.75 * seg(u, 2.8, 3.0) * api.pulse(S, 5) + 0.2 * seg(u, 1.4, 2.8)
    });
    // sound arcs travelling in from the right, stronger on 'listening'
    const tip = bulbAt(HX, hy, size, tilt, sw), power = 0.45 + 0.55 * seg(u, 2.8, 3.0);
    for (let k = 0; k < 4; k++) {
      const p = (u * 0.5 + k / 4) % 1, x = lerp(1650, tip.x + 70, p), r = 36 + 40 * p;
      c.save(); c.globalAlpha = Math.sin(Math.PI * p) * 0.55 * power; c.strokeStyle = '#f6ecd4'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath(); c.arc(x + r * 0.9, tip.y - 10, r, Math.PI - 0.7, Math.PI + 0.7); c.stroke(); c.restore();
    }
    // the wish: a small star rises from the antenna on 'wishing'
    const wk = seg(u, 1.58, 2.8);
    if (wk > 0 && wk < 1) {
      kit.star(c, tip.x + 20 * Math.sin(wk * 6), tip.y - 20 - 160 * ease.out(wk), 22 * (1 - 0.5 * wk), { S, col: '#ffd873', twinkle: true });
      kit.glow(c, tip.x + 20 * Math.sin(wk * 6), tip.y - 20 - 160 * ease.out(wk), 70, 'rgba(255,224,130,A)', 0.6 * (1 - wk));
    }
    c.restore();
    spot(c, 900, 520, 780, 0.38);
  });

  // ---- B1.6: 'a little note showed up inside a folder name' -------------------------------------------------------
  R('B1.6', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal, tn = (h, f) => kit.tone(h, 'teal', f);
    const drift = 1 + 0.04 * ease.smooth(seg(u, 0, 3.08));
    c.save(); c.translate(960, 640); c.scale(drift, drift); c.translate(-960, -640);
    room(c, S, kit);
    const DXX = 1480, FY = 842;
    // paper slides out from the gap under the door, then folds and flies into the folder
    const slide = ease.out(seg(u, 0.05, 0.7)), fly = seg(u, 0.85, 1.35), fold = ease.smooth(seg(u, 0.78, 1.0));
    const FOLX = 780, FOLB = 700 + 10 * Math.sin(S * 1.8);
    const pop = ease.back(seg(u, 0.5, 0.78));
    // light thread under the door
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,224,150,${0.5 * (1 - seg(u, 1.0, 1.4)) + 0.1})`;
    c.fillRect(DXX - 130, FY - 2, 260, 5); c.restore();
    // planned paper position
    let px, py, prot = 0;
    if (fly <= 0) { px = lerp(DXX - 10, 1230, slide); py = 852 + 2 * Math.sin(u * 14); prot = 0.04 * Math.sin(u * 12); }
    else { const k = ease.inOut(fly); px = lerp(1230, FOLX, k); py = lerp(852, FOLB - 120, k) - 150 * Math.sin(Math.PI * k); prot = 0.4 * Math.sin(Math.PI * k) - 0.2; }
    const inFolder = fly >= 1;
    const paperAt = () => {
      c.save(); c.translate(px, py);
      if (fly <= 0) c.scale(1, 0.5);
      else c.scale(-1, 1);
      if (fly > 0) c.scale(1 - 0.4 * seg(fly, 0.8, 1), 1 - 0.4 * seg(fly, 0.8, 1));
      kit.plane(c, 0, 0, 120, { rot: prot, fold, S });
      c.restore();
    };
    if (!inFolder) paperAt();
    kit.shadow(c, DXX, FY + 4, 160, 14, 0.25);
    kit.door(c, DXX, FY, 560, { mode: 'teal', color: '#4e8f84', S });
    // folder floating, glowing once it holds the note
    const lit = ease.smooth(seg(u, 1.2, 1.5)), tagLit = ease.smooth(seg(u, 1.94, 2.1));
    kit.shadow(c, FOLX, FLOOR + 40, 100 * (0.7 + 0.3 * pop), 12, 0.28);
    if (pop > 0.01) {
      c.save(); c.translate(FOLX, FOLB); c.scale(pop, pop);
      c.rotate(0.03 * Math.sin(S * 1.5));
      c.translate(-FOLX, -FOLB);
      if (lit > 0.01) {
        kit.sunburst(c, FOLX, FOLB - 110, 130, 130 + 150 * lit, { n: 14, S, spin: 0.15, alpha: 0.25 * lit, colors: ['#ffd678', '#f2d488'] });
        kit.glow(c, FOLX, FOLB - 110, 300, 'rgba(255,224,130,A)', 0.4 * lit);
      }
      const gulp = bump(u, 1.3, 9, 24) * 0.05;
      c.translate(FOLX, FOLB); c.scale(1 + gulp, 1 - gulp); c.translate(-FOLX, -FOLB);
      if (inFolder) { /* note already inside */ }
      else if (fly > 0) { /* in flight, drawn in front below */ }
      kit.folder(c, FOLX, FOLB, 320, { mode: 'teal', open: 0.3 * (1 - seg(u, 1.36, 1.5)) * seg(u, 0.78, 0.9), glow: tagLit, S });
      c.restore();
    }
    if (fly > 0 && fly < 1) {
      // while it crosses the folder face the plane tucks in behind the front; keep it in front until it is almost there
      if (fly < 0.82) paperAt();
    }
    // handle tag swings out on 'handle', lights on 'tag'
    const tk = ease.back(seg(u, 1.68, 1.95));
    if (tk > 0.01) {
      const sx = FOLX + 130, sy = FOLB - 190, swing = 0.5 * Math.exp(-(u - 1.68) * 2.6) * Math.sin((u - 1.68) * 9) + 0.04 * Math.sin(S * 2);
      c.save(); c.translate(sx, sy); c.rotate(swing); c.scale(tk, tk);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.lineWidth = 4; c.strokeStyle = kit.INK; c.stroke();
      c.translate(0, 46);
      const flash = 1 + 0.07 * (u > 2.63 ? api.pulse(S, 5) : 0) + 0.1 * bump(u, 1.94, 8, 24);
      c.scale(flash, flash);
      if (tagLit > 0) kit.glow(c, 0, 50, 150, 'rgba(255,224,130,A)', 0.8 * tagLit);
      kit.useS(S);
      kit.fillInk(c, () => kit.wrect(c, -60, 0, 120, 78, 2801, 1.4, 60), kit.mix('#cfc8b4', '#ffd678', tagLit), 3.4, { rim: false });
      c.beginPath(); c.arc(0, 12, 5, 0, 6.3); c.fillStyle = kit.INK; c.fill();
      c.strokeStyle = 'rgba(43,34,51,.75)'; c.lineWidth = 4; c.lineCap = 'round';
      kit.wobLine(c, -38, 38, 38, 38, S, 2810, 1.6, 4); kit.wobLine(c, -38, 56, 18, 56, S, 2811, 1.6, 4);
      c.restore();
      if (tagLit > 0.3) for (let i = 0; i < 4; i++) {
        const a = i * 1.6 + 0.5, k = ((u - 1.94) * 1.4 + i * 0.25) % 1;
        kit.star(c, sx + Math.cos(a) * (90 + 50 * k), sy + 60 + Math.sin(a) * (70 + 40 * k), 16 * (1 - k) + 4, { kind: 'sparkle', col: '#fff0c0', S, rot: a });
      }
    }
    // hero at the left edge: startled, then glad
    const hx = 300;
    kit.shadow(c, hx, FY + 4, 100, 12, 0.3);
    const gladK = seg(u, 1.9, 2.3);
    kit.bean(c, hx, FY, 220, {
      hero: true, S, seed: 61, mood: u < 1.2 ? 'gasp' : (u < 1.9 ? 'gasp' : 'smile'), look: 1, lookY: 0,
      arm: u > 1.3 ? ['down', 'point'] : 'down', pointUp: -0.3 * gladK, squash: -0.05 * bump(u, 0.1, 8, 20) + 0.04 * api.pulse(S, 6) * gladK, tilt: -0.05
    });
    motes(c, S, kit, 640, 10, 400, 200, 1000, 600, 0.35);
    c.restore();
  });

  // ---- B1.7: 'the lonely part was gone' -----------------------------------------------------------------------
  R('B1.7', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api, u = S - shot.t0, P = kit.MODES.teal;
    const z = 1 + 0.05 * ease.smooth(seg(u, 0, 3.3));
    c.save(); c.translate(960, 640); c.scale(z, z); c.translate(-960, -640);
    room(c, S, kit);
    const DXX = 1330, FY = 846, DH = 600, DW = DH * 0.5;
    const open = lerp(0.25, 0.95, ease.inOut(seg(u, 0.1, 3.0)));
    const lw = DW * Math.cos(open * 1.25);
    const edge = DXX - DW / 2 + lw, jamb = DXX + DW / 2;
    kit.shadow(c, DXX, FY + 4, 170, 14, 0.25);
    kit.door(c, DXX, FY, DH, { mode: 'teal', color: '#4e8f84', open, glow: true, S });
    // light spills out of the gap onto the floor
    c.save(); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(0, FY, 0, FY + 70); g.addColorStop(0, 'rgba(255,224,150,.35)'); g.addColorStop(1, 'rgba(255,224,150,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(edge, FY); c.lineTo(jamb, FY); c.lineTo(jamb - 220 - 160 * open, FY + 70); c.lineTo(edge - 200, FY + 70); c.closePath(); c.fill(); c.restore();

    // the second bean, clipped to the doorway so it really stands behind the leaf
    const emerge = ease.smooth(seg(u, 1.9, 2.8)), hop2 = u > 2.34 ? 36 * Math.sin(Math.PI * Math.min(1, (u - 2.34) / 0.45)) : 0;
    const bx = lerp(DXX + 118, DXX + 52, emerge), bsize = 230, btilt = lerp(-0.28, -0.05, emerge) + 0.02 * Math.sin(S * 2);
    const peek = ease.out(seg(u, 0.55, 1.1));
    const b2lit = ease.smooth(seg(u, 1.05, 1.15));
    c.save(); c.beginPath(); c.rect(edge, FY - DH, jamb - edge, DH); c.clip();
    kit.bean(c, bx, FY - hop2 + (1 - peek) * 80, bsize, {
      S, seed: 71, body: '#d9993a', mood: u < 2.34 ? 'smile' : 'happy', look: -1, antenna: '#f0c24a', bulb: b2lit * (0.7 + 0.3 * api.pulse(S, 4)),
      tilt: btilt, sway: 0.2, arm: u > 2.34 ? ['up', 'up'] : 'down'
    });
    c.restore();

    // hero
    const lean = ease.smooth(seg(u, 0.2, 1.2)), hx = 600 + 40 * lean + 18 * ease.smooth(seg(u, 2.3, 3.3));
    const jump = u > 2.34 ? 40 * Math.sin(Math.PI * Math.min(1, (u - 2.34) / 0.45)) : 0;
    const htilt = 0.05 * lean + 0.02 * Math.sin(S * 1.6), hsw = 0.2 * Math.sin(S * 2.2);
    kit.shadow(c, hx, FY + 4, 150 - jump * 0.4, 16, 0.3);
    kit.bean(c, hx, FY - jump, 290, {
      hero: true, S, seed: 81, mood: u < 1.1 ? 'worry' : (u < 2.34 ? 'smile' : 'happy'), look: 1, lookY: u < 1.1 ? 0 : -0.5,
      arm: u > 2.34 ? ['up', 'up'] : (u > 1.2 ? ['down', 'wave'] : 'down'), tilt: htilt, sway: hsw,
      bulb: lerp(0.15, 1, b2lit) * (u > 1.1 ? 0.7 + 0.3 * api.pulse(S, 4) : 1),
      squash: u > 2.34 ? (u < 2.5 ? 0.12 * seg(u, 2.34, 2.5) : -0.08 * Math.sin(Math.PI * Math.min(1, (u - 2.5) / 0.4))) : 0.02 * Math.sin(S * 2.5)
    });
    // spark between the two antennae
    if (u > 1.1) {
      const hb = bulbAt(hx, FY - jump, 290, htilt, hsw), bb = bulbAt(bx, FY - hop2, bsize, btilt, 0.2);
      const kk = seg(u, 1.1, 1.6), mx = (hb.x + bb.x) / 2, my = Math.min(hb.y, bb.y) - 130 + 10 * Math.sin(S * 4);
      c.save(); c.lineCap = 'round';
      const qx = (a, b, cc, k) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * b + k * k * cc;
      c.beginPath(); c.moveTo(hb.x, hb.y);
      for (let i = 1; i <= 24; i++) { const k = (i / 24) * kk; c.lineTo(qx(hb.x, mx, bb.x, k), qx(hb.y, my, bb.y, k)); }
      c.setLineDash([14, 14]); c.lineDashOffset = -S * 70; c.lineWidth = 7; c.strokeStyle = 'rgba(43,34,51,.7)'; c.stroke();
      c.lineWidth = 4.5; c.strokeStyle = '#ffd873'; c.stroke(); c.setLineDash([]);
      // a bead of light running back and forth along the arc
      const bk = Math.abs(((u * 0.9) % 2) - 1) * kk;
      const bxp = qx(hb.x, mx, bb.x, bk), byp = qx(hb.y, my, bb.y, bk);
      kit.glow(c, bxp, byp, 50, 'rgba(255,230,150,A)', 0.9);
      c.fillStyle = '#fff6d8'; c.beginPath(); c.arc(bxp, byp, 7, 0, 6.3); c.fill();
      c.restore();
      kit.glow(c, hb.x, hb.y, 60, 'rgba(255,224,130,A)', 0.6 * b2lit);
      kit.glow(c, bb.x, bb.y, 60, 'rgba(255,224,130,A)', 0.6 * b2lit);
    }
    // 'gone': a burst
    if (u > 2.34 && u < 3.2) {
      const k = (u - 2.34) / 0.86;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.3, d = 90 + 330 * ease.out(k) * (0.6 + 0.4 * kit.h1(i));
        kit.star(c, 960 + Math.cos(a) * d * 1.1, 330 + Math.sin(a) * d * 0.55, 20 * (1 - k) + 5, { kind: 'sparkle', col: i % 2 ? '#fff0c0' : '#e99aa8', S, rot: a });
      }
    }
    motes(c, S, kit, 770, 12, 300, 160, 1300, 620, 0.35);
    c.restore();
  });
})();
