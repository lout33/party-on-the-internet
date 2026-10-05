// Section A0 (0:00-0:11.5), instrumental cold open. Night lab.
// A0.1 push through a window onto the empty human place; A0.2 the hero pops out of a server box; A0.3 the hero waves.
(function () {
  const R = (id, fn) => { window.SHOTS[id] = fn; };
  // chirp onsets measured from the mp3 (3-8 kHz band): a steady 0.5 s tick, then busier from 3.8 s
  const CH = [0.06, 0.56, 1.06, 1.56, 2.05, 2.55, 3.05, 3.56, 3.82, 4.06, 4.44, 4.56, 4.81, 5.06, 5.31, 5.56, 6.06, 6.43, 6.56, 6.82, 7.06, 7.31, 7.56,
    8.06, 8.31, 8.44, 8.56, 8.81, 9.06, 9.31, 9.56, 9.81, 10.05, 10.31, 10.44, 10.55, 10.81, 11.05, 11.32, 11.56];
  function sinceChirp(S) {
    let last = -1;
    for (let i = 0; i < CH.length && CH[i] <= S; i++) last = i;
    return last < 0 ? { n: -1, dt: 9 } : { n: last, dt: S - CH[last] };
  }
  const chirp = (S, decay) => { const q = sinceChirp(S); return q.n < 0 ? 0 : Math.exp(-q.dt * decay); };

  // ---- A0.1: window push ------------------------------------------------------------------------------
  const GLASS = { x: 640, y: 360, w: 640, h: 360 };
  function exterior(c, S, kit) {
    const { h1, glow, fillInk, wrect, blob } = kit;
    // eaves and sky line
    fillInk(c, () => wrect(c, -300, 60, 2520, 120, 3001, 3, 120), '#0a2a33', 3.4);
    // moonlit wall
    fillInk(c, () => wrect(c, -300, 170, 2520, 720, 3002, 3, 120), '#1d5560', 3.6, { rimW: 18 });
    c.strokeStyle = 'rgba(8,26,34,.38)'; c.lineWidth = 3; c.lineCap = 'round';
    for (let y = 222; y < 880; y += 54) { c.beginPath(); c.moveTo(-300, y); c.lineTo(2220, y + (h1(y) - 0.5) * 6); c.stroke(); }
    c.strokeStyle = 'rgba(190,225,230,.07)'; c.lineWidth = 60;
    c.beginPath(); c.moveTo(1180, 180); c.lineTo(900, 880); c.stroke();
    // drainpipe
    fillInk(c, () => wrect(c, 300, 150, 34, 750, 3003, 1.6, 90), '#2c6f78', 3, { rim: false });
    // ground and bushes
    c.fillStyle = '#0b2428'; c.beginPath(); wrect(c, -300, 860, 2520, 400, 3004, 4, 100); c.fill();
    for (const [bx, sc, id] of [[120, 1, 1], [470, 0.7, 2], [1500, 0.8, 3], [1790, 1.1, 4]]) {
      fillInk(c, () => blob(c, bx, 850, 150 * sc, 100 * sc, 3010 + id, 5, 12), '#1c5a4c', 3.2);
      fillInk(c, () => blob(c, bx + 60 * sc, 880, 110 * sc, 70 * sc, 3020 + id, 4, 10), '#237060', 3, { rim: false });
    }
    // glow from the window onto the wall
    glow(c, 960, 540, 560, 'rgba(120,180,200,A)', 0.16);
    // fireflies
    for (let i = 0; i < 9; i++) {
      const fx = 120 + h1(i * 3) * 1700 + Math.sin(S * 0.7 + i * 2) * 40, fy = 760 + h1(i * 3 + 1) * 150 + Math.cos(S * 0.9 + i) * 30;
      const bl = 0.5 + 0.5 * Math.sin(S * 3 + i * 1.7);
      glow(c, fx, fy, 22, 'rgba(255,230,140,A)', 0.8 * bl);
      c.fillStyle = `rgba(255,240,170,${0.4 + 0.6 * bl})`; c.beginPath(); c.arc(fx, fy, 3, 0, 6.3); c.fill();
    }
  }

  R('A0.1', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    // the sky above the eaves
    glowSky(c, S, kit);
    const k1 = ease.inOut(seg(t, 0.03, 0.7)), k2 = ease.smooth(seg(t, 0.7, 1));
    const z = Math.exp(lerp(0, Math.log(3), k1)) * (1 + 0.15 * k2);
    const cx = lerp(lerp(880, 960, k1), 985, k2), cy = lerp(lerp(500, 540, k1), 552, k2);
    c.save();
    c.translate(960, 540); c.scale(z, z); c.translate(-cx, -cy);
    exterior(c, S, kit);
    kit.window(c, GLASS.x, GLASS.y, GLASS.w, GLASS.h, {
      mode: 'night', S, plant: false,
      draw: (cc, x, y, w, h) => {
        cc.save(); cc.translate(x, y); cc.scale(w / 1920, w / 1920);
        kit.humanRoom(cc, {
          mode: 'night', S, phi: 0.45 + 0.07 * Math.sin(S * 0.9), sway: 6 * Math.sin(S * 1.3), zzz: seg(t, 0.15, 0.5), dust: 1, dim: 0.85,
          led: 0.35 + 0.65 * chirp(S, 7), light: 0.4
        });
        cc.restore();
      }
    });
    c.restore();
    // frame-edge darkening that eases off as we arrive in the room
    c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(190,215,235,${0.5 * (1 - k1)})`; c.fillRect(0, 0, 1920, 1080); c.restore();
  });

  function glowSky(c, S, kit) {
    const { h1, glow, fillInk, blob } = kit;
    // moon, stars and a slow cloud, top of the frame (they leave the shot as we push in)
    glow(c, 1560, 70, 330, 'rgba(244,232,192,A)', 0.2);
    for (let i = 0; i < 22; i++) {
      const sx = 40 + h1(i * 5) * 1840, sy = 18 + h1(i * 5 + 1) * 110, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2);
      c.strokeStyle = `rgba(246,236,212,${0.25 + 0.55 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
      const r = 5 + 4 * h1(i + 3);
      c.beginPath(); c.moveTo(sx - r, sy); c.lineTo(sx + r, sy); c.moveTo(sx, sy - r); c.lineTo(sx, sy + r); c.stroke();
    }
    fillInk(c, () => blob(c, 1560, 70, 62, 62, 3050, 2.5, 14), '#f4e8c0', 3);
    kit.wash(c, '#d8c58a', 0.4, () => blob(c, 1545, 88, 20, 14, 3051, 2, 8));
    const cl = (S * 18) % 2400 - 300;
    c.save(); c.globalAlpha = 0.22; c.fillStyle = '#9fc4c8';
    c.beginPath(); blob(c, cl, 40, 150, 28, 3052, 5, 10); c.fill(); c.beginPath(); blob(c, cl + 90, 52, 100, 22, 3053, 4, 10); c.fill(); c.restore();
  }

  // ---- A0.2: the hero pops out of a server box -----------------------------------------------------------
  const POP = 5.56;
  function serverStage(c, S, kit, api, opt) {
    const { h1, glow, fillInk, blob } = kit;
    // deep teal room, floor line, moon, cables, lamp cone: the same set as the fragment's first shot
    kit.floor(c, 'night', { y: opt.floorY, planks: false });
    glow(c, 1700, 300, 330, 'rgba(244,232,192,A)', 0.2);
    fillInk(c, () => blob(c, 1700, 300, 82, 82, 301, 2.5, 14), '#f4e8c0', 3);
    kit.wash(c, '#d8c58a', 0.4, () => blob(c, 1678, 322, 26, 18, 302, 2, 8));
    for (let i = 0; i < 16; i++) {
      const sx = 200 + h1(i * 5) * 1500, sy = 120 + h1(i * 5 + 1) * 380, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2);
      c.strokeStyle = `rgba(246,236,212,${0.25 + 0.5 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 8, sy); c.lineTo(sx + 8, sy); c.moveTo(sx, sy - 8); c.lineTo(sx, sy + 8); c.stroke();
    }
    c.lineWidth = 7; c.lineCap = 'round';
    [[kit.PAL.ochre, 0], [kit.PAL.rose, 1], [kit.PAL.sage, 2]].forEach(([col, k]) => {
      c.strokeStyle = col; c.globalAlpha = 0.6;
      c.beginPath(); c.moveTo(-200, opt.floorY - 330 + k * 40); c.bezierCurveTo(100, opt.floorY - 100 + k * 40, opt.rx - 600, opt.floorY - 380, opt.rx - 330, opt.floorY - 10 - k * 14); c.stroke();
    });
    c.globalAlpha = 1;
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(236,190,110,.09)';
    c.beginPath(); c.moveTo(opt.rx - 90, -20); c.lineTo(opt.rx + 90, -20); c.lineTo(opt.rx + 640, opt.floorY); c.lineTo(opt.rx - 640, opt.floorY); c.closePath(); c.fill(); c.restore();
    fillInk(c, () => kit.wrect(c, opt.rx - 100, -40, 200, 74, 310, 2, 40), '#caa05a', 3);
  }
  // LED levels for 3 boxes x 6 lamps from the chirp times: each chirp lights one lamp, then it fades
  function ledLevels(S) {
    const out = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    for (let i = 0; i < CH.length && CH[i] <= S; i++) {
      const dt = S - CH[i]; if (dt > 0.5) continue;
      const b = i % 3, j = (i * 5 + 1) % 6, v = Math.exp(-dt * 6);
      out[b][j] = Math.max(out[b][j], v);
    }
    return out;
  }

  R('A0.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const RX = 1020, RY = 960, RS = 500, FLOOR = 830;
    const dt = S - POP;
    serverStage(c, S, kit, api, { floorY: FLOOR, rx: RX });
    const leds = ledLevels(S);
    const rattle = dt < 0 ? seg(S, 4.7, POP) : 0;
    const q = sinceChirp(S);
    // rack hums: tiny lurch on every chirp, a big shake just before the pop
    const lurch = 0.005 * Math.exp(-q.dt * 14) * (q.n % 2 ? 1 : -1) + rattle * 0.012 * Math.sin(S * 70);
    const eyes = dt < 0 ? 3 : (dt < 0.6 ? 1 : 0);
    const boxes = [
      { mood: eyes, leds: leds[0], lid: dt >= 0 ? Math.min(1, ease.back(seg(dt, 0, 0.22))) : 0, dy: dt < 0 ? -10 * rattle * Math.abs(Math.sin(S * 38)) : 0 },
      { mood: dt < 0 ? 3 : 0, leds: leds[1] },
      { mood: dt < 0 ? 3 : 0, leds: leds[2] }
    ];
    const lay = kit.rack(c, RX, RY, RS, { mode: 'night', S, tilt: lurch, part: 'back', boxes });
    // hero: hidden inside the top box until the pop, then rockets up, lands on the rack top, squashes, then waves
    const topY = lay.boxes[0].y;
    if (dt >= -0.02) {
      const u = Math.max(0, dt);
      let feet;
      // ballistic arc: up to the peak at 0.3 s, down to the rack top by 0.62 s
      const peak = topY - 115;
      if (u < 0.3) feet = lerp(topY + 90, peak, ease.out(u / 0.3));
      else if (u < 0.62) feet = lerp(peak, topY - 6, ease.in((u - 0.3) / 0.32));
      else feet = topY - 6;
      // squash and stretch: stretched going up, squashed on landing, then little bounces on the chirps
      let sq = 0;
      if (u < 0.3) sq = -0.16 * (1 - u / 0.3) - 0.04;
      else if (u < 0.62) sq = -0.1 * (u - 0.3) / 0.32;
      else sq = 0.24 * Math.exp(-(u - 0.62) * 9) * Math.cos((u - 0.62) * 22);
      if (u > 0.9) sq += 0.07 * Math.exp(-q.dt * 12) - 0.02;
      const look = u < 1.0 ? lerp(-0.8, 0.9, ease.smooth(seg(u, 0.55, 1.0))) : lerp(0.9, 0, ease.smooth(seg(u, 1.0, 1.5)));
      const wave = u > 1.15;
      const rot = u < 0.62 ? 0.18 * Math.sin(u * 14) * (1 - u / 0.62) : 0.03 * Math.sin(S * 4);
      kit.bean(c, RX + 15, feet, 230, {
        hero: true, S, seed: 11, mood: u < 0.62 ? 'gasp' : (u < 1.15 ? 'grin' : 'wink'),
        arm: u < 0.3 ? 'up' : (wave ? 'wave' : 'up'), squash: sq, tilt: rot, look, bulb: 0.3 + chirp(S, 8)
      });
      // pop burst
      if (u < 0.5) {
        const k = ease.out(seg(u, 0, 0.5));
        c.save(); c.globalAlpha = 1 - k; c.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const a = -Math.PI * (0.05 + 0.9 * i / 8), r0 = 130 + 90 * k, r1 = r0 + 40 + 50 * (1 - k);
          c.strokeStyle = i % 2 ? '#ffd873' : '#e99aa8'; c.lineWidth = 8;
          c.beginPath(); c.moveTo(RX + 15 + Math.cos(a) * r0, topY + Math.sin(a) * r0 * 0.9); c.lineTo(RX + 15 + Math.cos(a) * r1, topY + Math.sin(a) * r1 * 0.9); c.stroke();
        }
        c.restore();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI * (0.1 + 0.8 * i / 5), d = (100 + 150 * kit.h1(i + 9)) * k;
          kit.star(c, RX + 15 + Math.cos(a) * d * 1.3, topY - 60 + Math.sin(a) * d * 1.1, 22 * (1 - 0.5 * k), { kind: 'sparkle', col: i % 2 ? '#ffe9a8' : '#f6ecd4', S });
        }
      }
    }
    kit.rack(c, RX, RY, RS, { mode: 'night', S, tilt: lurch, part: 'front', boxes, sparks: 0 });
    // a few sparkles on the chirps even before the pop
    if (dt < 0) for (let i = 0; i < 3; i++) {
      const cc = chirp(S, 5); if (cc < 0.05) break;
      kit.star(c, RX - 260 + i * 260, topY - 40 - i * 20, 12 * cc, { kind: 'sparkle', col: '#ffe9a8', S });
    }
  });

  // ---- A0.3: the hero waves at us ----------------------------------------------------------------------
  R('A0.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const z = 1 + 0.07 * ease.smooth(seg(t, 0.15, 1));
    c.save();
    c.translate(960, 640); c.scale(z, z); c.translate(-960, -640);
    kit.floor(c, 'night', { y: 800, planks: false });
    // far back: the rack with its lid open, still chirping
    const leds = ledLevels(S);
    kit.rack(c, 400, 880, 400, { mode: 'night', S, boxes: [{ mood: 0, leds: leds[0], lid: 1 }, { mood: 0, leds: leds[1] }, { mood: 0, leds: leds[2] }] });
    // spot of light on the hero
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(236,200,130,.10)';
    c.beginPath(); c.moveTo(1010, -20); c.lineTo(1190, -20); c.lineTo(1700, 960); c.lineTo(500, 960); c.closePath(); c.fill(); c.restore();
    kit.glow(c, 1100, 620, 560, 'rgba(255,214,140,A)', 0.14);
    kit.shadow(c, 1100, 968, 210 - 20 * chirp(S, 9), 26, 0.35);
    const q = sinceChirp(S);
    const bounce = Math.exp(-q.dt * 10);
    const hop = 26 * Math.exp(-q.dt * 7) * Math.sin(Math.min(1, q.dt / 0.12) * Math.PI);
    const sq = -0.07 * bounce + 0.035 * Math.sin(S * 3);
    const wink = t > 0.86 && t < 0.97;
    kit.bean(c, 1100, 964 - hop, 520, {
      hero: true, S, seed: 21, mood: wink ? 'wink' : 'grin', arm: 'wave', squash: sq, look: 0.1 * Math.sin(S * 0.8),
      tilt: 0.02 * Math.sin(S * 1.7), bulb: 0.25 + 0.75 * chirp(S, 8)
    });
    // sparkles that pop on the chirps
    for (let i = 0; i < CH.length; i++) {
      const dt = S - CH[i]; if (dt < 0 || dt > 0.6) continue;
      const k = dt / 0.6, a = kit.h1(i * 7 + 1) * Math.PI * 2, d = 330 + 220 * kit.h1(i * 7 + 2);
      kit.star(c, 1100 + Math.cos(a) * d * 1.1, 620 + Math.sin(a) * d * 0.75, 26 * (1 - k) + 6, { kind: 'sparkle', col: i % 2 ? '#ffe9a8' : '#e99aa8', S, rot: a });
    }
    c.restore();
  });
})();
