// Section E9 (167.45-179.3 s) plus E8.7 / E8.8: the final chorus, the loudest part of the song, and what is left of it.
// E9.1 the full party with the 0 on the wall; E9.2 the single whoa-oh answer (7 syllables on the grid);
// E9.3 colour drains in steps on the beat while the crowd thins; E8.7 the party freezes in morning light;
// E8.8 the crowd is gone in one frame (183.4), the lamp comes on. All new-seconds code (SHOTS_NEW).
// The party room is the human room dressed for the party (window left, desk right, chair at 1430), shared with S9.1
// through window.W4H.world. Animation clock (Sw) and beat clock (bS) are separate so the world can freeze and resume.
(function () {
  const R = (id, fn) => { window.SHOTS_NEW[id] = fn; };
  const W = window.W4H = window.W4H || {};
  const TAU = Math.PI * 2;
  const WIN = { x: 220, y: 250, w: 860, h: 484 };
  const ROWS = [{ y: 1040, s: 1.2, n: 14 }, { y: 975, s: 1.06, n: 17 }, { y: 915, s: 0.94, n: 20 }, { y: 862, s: 0.84, n: 24 }, { y: 816, s: 0.74, n: 28 }, { y: 776, s: 0.66, n: 32 }];
  const SYL = [172.0, 172.5, 173.0, 173.5, 174.0, 174.5, 175.0];
  const FREEZE = 178.75;                 // world clock when the party stops (a beat apex, 0.5 s grid + 0.25)
  const GONE = 183.4;                    // the whole crowd leaves on the first beat of the gap
  const BURSTS = [
    [167.5, 0], [167.5, 1], [172.0, 0], [172.0, 1], [173.5, 0], [173.5, 1], [175.0, 0], [175.0, 1], [175.0, 2],
    [185.0, 0], [185.0, 1], [187.0, 1], [189.0, 0]
  ];
  const frac = x => x - Math.floor(x);
  // the kit's own beat is the old song's grid; kit pieces that pulse take this time instead
  const gS = (api, S) => 54.13 + 0.5108 * api.beat(S);
  const bigRect = c => c.fillRect(-2600, -1600, 7200, 5200);

  function desat(c, a) {
    if (a <= 0.003) return;
    c.save(); c.globalCompositeOperation = 'saturation'; c.globalAlpha = Math.min(1, a); c.fillStyle = '#808080'; bigRect(c); c.restore();
  }

  function crowdList(api, rows, x0, x1, seed) {
    const out = []; let idx = 0;
    rows.forEach((rw, ri) => {
      for (let j = 0; j < rw.n; j++, idx++) {
        const hs = seed + idx * 11;
        out.push({
          i: idx, row: ri,
          x: x0 + (j + 0.5 + (ri % 2) * 0.35) / (rw.n + 0.4) * (x1 - x0) + (api.hash(hs) - 0.5) * 30,
          y: rw.y + (api.hash(hs + 1) - 0.5) * 12, s: rw.s * (0.92 + 0.16 * api.hash(hs + 2)),
          col: Math.floor(api.hash(hs + 3) * 6.99), h: api.hash(hs + 4), th: api.hash(hs + 5)
        });
      }
    });
    out.sort((a, b) => a.y - b.y || a.i - b.i);
    return out;
  }

  // Draws a dancing crowd. o: { bS (beat clock), energy, arms ('beat'|0..1), syl (list of sung-syllable times), sylS (real time),
  // crouch 0..1, vanish {t0,t1,keep,dur}, S (real time for vanish), look }
  function drawCrowd(c, api, kit, list, o) {
    const b = api.beat(o.bS), en = o.energy === undefined ? 1 : o.energy;
    let wk = 0, wPar = 0;
    if (o.syl) o.syl.forEach((ts, i) => { if (o.S >= ts) { const k = Math.exp(-(o.S - ts) * 7); if (k > wk) { wk = k; wPar = i; } } });
    const vS = o.vS === undefined ? o.S : o.vS;
    for (const bn of list) {
      let vis = o.goneAt !== undefined && o.S >= o.goneAt ? 0 : 1;
      if (vis > 0 && o.vanish) {
        const v = o.vanish;
        if (bn.th >= v.keep) {
          const stepN = Math.max(1, Math.round((v.t1 - v.t0) / 0.5));
          const step = Math.min(stepN - 1, Math.floor((bn.th - v.keep) / (1 - v.keep) * stepN));
          const Td = v.t0 + step * 0.5, dur = v.dur === undefined ? 0.1 : v.dur;
          vis = dur <= 0 ? (vS >= Td ? 0 : 1) : 1 - api.seg(vS, Td, Td + dur);
        }
      }
      if (vis <= 0.01) continue;
      const ph = (bn.row % 2) * 0.5, ff = frac(b + ph);
      const jump = (Math.sin(Math.PI * ff) * 50 * bn.s * en) + wk * 34 * bn.s * (0.6 + 0.4 * bn.h) * (o.syl ? 1.4 : 0);
      let sy = (1 - 0.2 * Math.exp(-ff * 9) + 0.1 * Math.sin(Math.PI * ff)) * (0.4 + 0.6 * vis);
      sy *= 1 - 0.22 * (o.crouch || 0);
      let arms = o.arms === 'beat' || o.arms === undefined ? Math.min(1, Math.sin(Math.PI * ff) * 1.4) : o.arms;
      if (wk > 0.08) arms = 1;
      const look = o.look === undefined ? Math.sin(b * 1.5 + bn.i) * 0.5 : o.look;
      const tilt = Math.sin(b * Math.PI + bn.h * 6) * 0.07 + (wk > 0.08 ? 0.1 * (wPar % 2 ? -1 : 1) * wk : 0);
      kit.cheap(c, bn.x, bn.y - jump, bn.s * (0.35 + 0.65 * vis), kit.BHOT[bn.col], sy, look, tilt, {
        arms, happy: ff < 0.5, mouth: true, antenna: bn.i % 7 === 0 ? '#ffd62e' : undefined
      });
    }
  }

  function skyDraw(gold, Sw, kit) {
    return (cc, x, y, w, h) => {
      const g = cc.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, kit.mix('#2a2f7a', '#ffe9a6', gold)); g.addColorStop(1, kit.mix('#e5239b', '#ffc56a', gold));
      cc.fillStyle = g; cc.fillRect(x, y, w, h);
      const col2 = ['#2fb4ff', '#e5239b', '#ffd62e'];
      if (gold < 0.98) for (let k = 0; k < 4; k++) {
        const ph = frac(Sw * 0.5 + k * 0.25), fx = x + 140 + k * 210, fy = y + 130 + (k % 2) * 90;
        cc.strokeStyle = col2[k % 3]; cc.lineWidth = 6; cc.lineCap = 'round'; cc.globalAlpha = (1 - ph) * (1 - gold);
        for (let q = 0; q < 12; q++) { const a = q / 12 * TAU; cc.beginPath(); cc.moveTo(fx + Math.cos(a) * ph * 40, fy + Math.sin(a) * ph * 40); cc.lineTo(fx + Math.cos(a) * (ph * 80 + 20), fy + Math.sin(a) * (ph * 80 + 20)); cc.stroke(); }
        cc.globalAlpha = 1;
      }
      if (gold > 0.02) {
        const sx = x + w * 0.3, sy = y + h * (1.0 - 0.4 * gold);
        kit.glow(cc, sx, sy, w * 0.6, 'rgba(255,240,170,A)', 0.8 * gold);
        cc.save(); cc.globalAlpha = Math.min(1, gold * 1.6);
        kit.fillInk(cc, () => kit.blob(cc, sx, sy, w * 0.07, w * 0.07, 303, 1.6, 14), '#fff1b8', 3);
        cc.restore();
        cc.fillStyle = kit.mix('#2a1034', '#d9a45a', gold); cc.beginPath(); kit.wrect(cc, x - 20, y + h * 0.84, w + 40, h * 0.3, 1330, 5, 80); cc.fill();
      }
    };
  }

  function bursts(c, S, kit, api) {
    for (const [tb, side] of BURSTS) {
      const dt = S - tb;
      if (dt < 0 || dt > 2.4) continue;
      const ox = side === 0 ? -120 : side === 1 ? 2050 : 950, oy = side === 2 ? 1150 : 980;
      const base = side === 0 ? -1.1 : side === 1 ? -Math.PI + 1.1 : -Math.PI / 2;
      const spread = side === 2 ? 1.5 : 0.55, n = side === 2 ? 90 : 60;
      const e = (1 - Math.exp(-dt * 1.5)) / 1.5, a = 1 - kit.clamp((dt - 1.5) / 0.9);
      for (let i = 0; i < n; i++) {
        const hk = Math.round(tb * 10) * 31 + side * 977 + i * 3;
        const h = api.hash(hk), h2 = api.hash(hk + 1), h3 = api.hash(hk + 2);
        const ang = base + (h - 0.5) * spread * 2, v = 650 + 900 * h2;
        const x = ox + Math.cos(ang) * v * e, y = oy + Math.sin(ang) * v * e + 250 * dt * dt;
        c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(dt * (3 + 6 * h3) + i); c.scale(1, Math.sin(dt * 9 + i));
        c.fillStyle = kit.HOT[i % 7]; c.fillRect(-8, -5, 16, 10); c.lineWidth = 1.8; c.strokeStyle = kit.INK; c.strokeRect(-8, -5, 16, 10); c.restore();
      }
    }
  }

  // The party room. o: { Sw, bS, cam{z,cx,cy,rot}, punch, energy, arms, syl, crouch, vanish, crowd (false = none), hero ({mood,look,arm,lean,scale}|false),
  // lamp, chairConf, gold, lights, conf, flash, drain, dark, noBursts, shaft }
  function world(c, S, api, kit, o) {
    const { ease, seg, lerp } = api;
    const Sw = o.Sw === undefined ? S : o.Sw, bS = o.bS === undefined ? S : o.bS, M = 'party';
    const g = gS(api, bS), b = api.beat(bS), f = frac(b), pul = Math.exp(-f * 5);
    const cam = o.cam, gold = o.gold || 0;
    c.save();
    c.translate(960, 540); const zp = cam.z * (1 + 0.012 * pul) * (1 + (o.punch || 0)); c.scale(zp, zp); c.rotate(cam.rot || 0); c.translate(-cam.cx, -cam.cy);
    kit.useS(Sw);

    c.fillStyle = '#ffd0e0'; bigRect(c);
    kit.sunburst(c, 860, 440, 0, 2800, { S: Sw, n: 22, spin: 0.28 });
    kit.glow(c, 860, 440, 650, 'rgba(255,255,255,A)', 0.55);

    kit.useS(Sw);
    c.fillStyle = '#fff0c8'; c.beginPath(); kit.wrect(c, -1800, 800, 6000, 1200, 1120, 3, 90); c.fill();
    const bf = Math.floor(b);
    for (let r = 0; r < 4; r++) for (let q = -12; q < 26; q++) {
      const on = ((q + r + bf) & 1) === 0;
      c.fillStyle = on ? 'rgba(255,100,170,.85)' : 'rgba(255,214,60,.8)';
      const y0 = 800 + r * r * 8 + r * 50, hh = 50 + r * 18;
      c.beginPath(); kit.wrect(c, q * 140 - 30, y0, 130 + r * 10, hh - 4, 1130 + r * 40 + q, 1.5, 70); c.fill();
    }
    kit.fillInk(c, () => kit.wrect(c, -1800, 780, 6000, 36, 1121, 2, 100), kit.K('#7c6a5a', 0.45), 3, { rim: false });

    kit.window(c, WIN.x, WIN.y, WIN.w, WIN.h, { mode: M, S: Sw, view: 'party', draw: skyDraw(gold, Sw, kit) });

    kit.rug(c, 1430, 1010, 800, { mode: M, S: Sw });
    kit.desk(c, 1140, 726, 910, { mode: M, S: Sw, mug: true });
    kit.monitor(c, 1685, 730, 270, { mode: M, S: Sw, on: 0 });
    kit.lamp(c, 1230, 722, 250, { mode: M, S: Sw, on: o.lamp || 0 });
    kit.shadow(c, 1430, 1012, 220, 24, 0.2);
    kit.chair(c, 1430, 1012, 430, { mode: M, S: Sw, phi: 0.8, coat: true, confetti: o.chairConf || 0, sway: 0 });
    if (!o.chairLight) {
      const cl = kit.HOT[Math.floor(b / 2 + 4) % 3 === 0 ? 0 : (Math.floor(b / 2) % 3 === 1 ? 2 : 1)];
      kit.glow(c, 1430, 800, 420, kit.rgba(cl, 'A'), 0.14 + 0.1 * pul);
    }

    if (o.lights !== 0) kit.lights(c, -500, -40, 3200, 150, { S: g, mode: M, lit: o.lights === undefined ? 0.9 : o.lights, wave: 0.6, cell: 80, seed: 5, colors: kit.HOT.slice(0, 6) });

    const ns = 16;
    c.save(); c.lineCap = 'round'; c.globalAlpha = 0.9;
    for (let i = 0; i < ns; i++) {
      const x0 = (i + 0.5) / ns * 3000 - 500, ph = Sw * 2 + i;
      c.strokeStyle = kit.HOT[i % 6]; c.lineWidth = 10 + (i % 3) * 3;
      c.beginPath();
      for (let k = -5; k <= 8; k++) {
        const x = x0 + Math.sin(ph + k * 0.7) * 34 * (k / 3), y = -20 + k * (46 + 14 * (i % 3));
        k === -5 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    c.restore();

    kit.useS(Sw);
    kit.tag(c, 900, 72, 0, { mode: M, S: Sw, scale: 1.1, raw: '0', rot: 0.05 * Math.sin(Sw * 1.7) });
    c.strokeStyle = kit.INK; c.lineWidth = 4; c.beginPath(); c.moveTo(1740, -320); c.lineTo(1740, -20); c.stroke();
    kit.discoBall(c, 1740, 190 + 6 * Math.sin(Sw * 2), 78, { S: g, spots: true, bob: false });

    if (o.crowd !== false) {
      const list = crowdList(api, ROWS, -170, 1320, 4000);
      drawCrowd(c, api, kit, list, { bS, S, vS: o.vS, goneAt: o.goneAt, energy: o.energy, arms: o.arms, syl: o.syl, crouch: o.crouch, vanish: o.vanish });
    }
    if (o.hero) {
      const hr = o.hero, ff = frac(b), en = o.energy === undefined ? 1 : o.energy;
      let wk = 0, wPar = 0;
      if (o.syl) o.syl.forEach((ts, i) => { if (S >= ts) { const k = Math.exp(-(S - ts) * 7); if (k > wk) { wk = k; wPar = i; } } });
      const jump = (Math.sin(Math.PI * ff) * 100 * en + wk * 55) * (hr.still ? 0 : 1);
      const sq = (0.22 * Math.exp(-ff * 9) - 0.12 * Math.sin(Math.PI * ff)) * (1 - 0.25 * (o.crouch || 0)) + 0.25 * (o.crouch || 0);
      kit.shadow(c, 640, 1040, 90 - jump * 0.3, 14, 0.3);
      kit.bean(c, 640, 1040 - jump, hr.size || 250, {
        hero: true, S: Sw, seed: 55, mood: hr.mood || 'grin', look: hr.look === undefined ? 0 : hr.look, arm: hr.arm || 'up', squash: hr.still ? 0 : sq,
        bulb: hr.bulb === undefined ? Math.exp(-ff * 4) : hr.bulb, tilt: hr.still ? 0 : 0.08 * Math.sin(b * Math.PI) + 0.14 * wk * (wPar % 2 ? -1 : 1)
      });
    }

    if (!o.noBursts) bursts(c, S, kit, api);
    kit.confetti(c, Sw, 61, { n: o.conf === undefined ? 110 : o.conf, x: -400, y: -200, w: 2800, h: 1500 });

    // syllable sparkles from the hero
    if (o.syl && o.hero) {
      SYL.forEach((ts, i) => {
        const dt = S - ts;
        if (dt < 0 || dt > 0.5) return;
        const k = ease.out(dt / 0.5);
        for (let q = 0; q < 10; q++) {
          const a = TAU * q / 10 + i * 0.4, r = 150 + 330 * k * (0.7 + 0.3 * api.hash(i * 17 + q));
          kit.star(c, 640 + Math.cos(a) * r, 840 + Math.sin(a) * r * 0.8, 26 * (1 - k) + 6, { kind: 'sparkle', col: kit.HOT[(q + i) % 6], S: Sw, rot: a });
        }
      });
    }

    // grade: stepped colour loss, darkening, then morning gold, then the light sources on top
    desat(c, o.drain || 0);
    if (o.dark) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(60,70,110,${o.dark})`; bigRect(c); c.restore(); }
    if (gold > 0) {
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,214,140,${0.85 * gold})`; bigRect(c); c.restore();
      c.save(); c.globalCompositeOperation = 'screen';
      const gr = c.createLinearGradient(0, WIN.y + WIN.h, 0, 1050);
      gr.addColorStop(0, `rgba(255,224,150,${0.3 * gold})`); gr.addColorStop(1, 'rgba(255,224,150,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(WIN.x, WIN.y + WIN.h); c.lineTo(WIN.x + WIN.w, WIN.y + WIN.h); c.lineTo(WIN.x + WIN.w + 520, 1050); c.lineTo(WIN.x + 160, 1050); c.closePath(); c.fill();
      c.restore();
      kit.glow(c, WIN.x + WIN.w * 0.4, WIN.y + WIN.h * 0.55, 760, 'rgba(255,226,150,A)', 0.42 * gold);
      for (let i = 0; i < 26; i++) {
        const px = WIN.x + 120 + ((api.hash(i * 3) * 900 + S * (8 + 9 * api.hash(i)) + Math.sin(S * 0.6 + i) * 20) % 900);
        const py = WIN.y + WIN.h - 60 + ((api.hash(i * 3 + 1) * 380 - S * (6 + 5 * api.hash(i + 3))) % 380 + 380) % 380;
        c.fillStyle = `rgba(255,240,200,${(0.18 + 0.3 * (0.5 + 0.5 * Math.sin(S * 1.3 + i * 1.7))) * gold})`;
        c.beginPath(); c.arc(px, py, 1.8 + 2 * api.hash(i + 9), 0, TAU); c.fill();
      }
    }
    if (o.lamp > 0.02) {
      kit.glow(c, 1325, 500, 520, 'rgba(255,226,150,A)', 0.5 * o.lamp);
      kit.glow(c, 1325, 500, 140, 'rgba(255,244,200,A)', 0.5 * o.lamp, 'source-over');
    }
    if (o.flash) { c.save(); c.fillStyle = `rgba(255,250,236,${o.flash})`; bigRect(c); c.restore(); }
    c.restore();
  }
  W.world = world; W.drawCrowd = drawCrowd; W.crowdList = crowdList; W.gS = gS; W.desat = desat; W.constants = { SYL, FREEZE, GONE, WIN };

  // ---- E9.1: the full party, the 0 on the wall --------------------------------------------------------------
  R('E9.1', (c, shot, S, t, api, kit) => {
    const { ease, lerp, seg } = api, u = S - shot.t0;
    const e = ease.inOut(t);
    const glance = ease.inOut(seg(S, 170.1, 170.7)) * (1 - ease.inOut(seg(S, 171.5, 171.9)));
    world(c, S, api, kit, {
      cam: { z: lerp(0.85, 0.92, e), cx: lerp(950, 1010 + 150 * glance, e), cy: lerp(640, 650, e) },
      energy: 1, arms: 'beat', crouch: ease.in(seg(S, 171.55, 172.0)),
      hero: { mood: glance > 0.5 ? 'split' : 'grin', look: glance, arm: 'up' },
      flash: 0.9 * Math.exp(-u * 11), conf: 120, chairConf: 0.5 * glance + 0.15
    });
  });

  // ---- E9.2: the one whoa-oh answer, seven syllables on the grid ---------------------------------------------
  R('E9.2', (c, shot, S, t, api, kit) => {
    const { ease, lerp } = api;
    let hit = 0, par = 0, idx = -1;
    SYL.forEach((ts, i) => { if (S >= ts) { hit = Math.exp(-(S - ts) * 8); par = i; idx = i; } });
    const build = 0.6 + 0.4 * Math.max(0, idx) / 6;
    world(c, S, api, kit, {
      cam: { z: lerp(0.88, 0.95, ease.inOut(t)), cx: lerp(900, 880, t), cy: lerp(645, 655, t), rot: 0.02 * hit * (par % 2 ? -1 : 1) },
      punch: 0.05 * hit * build, energy: 1.25, arms: 1, syl: SYL,
      hero: { mood: 'grin', look: 0, arm: 'up', size: 290 },
      flash: 0.22 * hit * build, conf: 190, chairConf: 0.2
    });
  });

  // ---- E9.3: colour leaves on the beat, the crowd thins, the 0 stays ------------------------------------------
  R('E9.3', (c, shot, S, t, api, kit) => {
    const { ease, lerp, seg } = api;
    const step = Math.max(0, Math.min(8, Math.floor((S - 175.5) / 0.5) + 1));
    const stepE = 175.5 + (step - 1) * 0.5;
    const tick = step > 0 && step < 8 ? Math.exp(-(S - stepE) * 9) : 0;
    world(c, S, api, kit, {
      cam: { z: lerp(0.95, 0.9, ease.inOut(t)), cx: lerp(880, 990, t), cy: lerp(655, 645, t) },
      energy: 1 - 0.45 * seg(S, 175.5, 179.0), arms: 'beat',
      vanish: { t0: 175.5, t1: 179.0, keep: 0.3 },
      hero: { mood: step >= 5 ? 'flat' : 'grin', look: 0, arm: step >= 6 ? ['down', 'up'] : 'up' },
      drain: 0.115 * step, dark: 0.04 * step + 0.06 * tick, conf: 120, chairConf: 0.3
    });
  });

  // ---- E8.7: the lab woke up a week too late; the party freezes in morning light --------------------------------
  R('E8.7', (c, shot, S, t, api, kit) => {
    const { ease, lerp, seg } = api;
    const k = ease.smooth(seg(S, 179.6, 182.6));
    world(c, S, api, kit, {
      Sw: FREEZE, bS: FREEZE,
      cam: { z: lerp(0.9, 0.95, ease.inOut(t)), cx: lerp(990, 780, ease.inOut(t)), cy: lerp(645, 645, t) },
      energy: 0.55, arms: 'beat', noBursts: true, vanish: { t0: 175.5, t1: 179.0, keep: 0.3 }, vS: 179.5,
      hero: { mood: 'flat', look: 0.3, arm: ['down', 'up'], still: false },
      drain: lerp(0.92, 0.5, k), dark: 0.32 * (1 - k), gold: k, conf: 120, chairConf: 0.3, lights: 0.5
    });
  });

  // ---- E8.8: everyone is gone in one frame, the lamp catches ---------------------------------------------------
  R('E8.8', (c, shot, S, t, api, kit) => {
    const { ease, lerp, seg } = api, ts = S - shot.t0;
    const FL = [[0.25, 0.35], [0.33, 0.0], [0.39, 0.8], [0.44, 0.2], [0.5, 1]];
    let on = 0;
    for (const [tt, v] of FL) if (ts >= tt) on = v;
    if (ts >= 0.5) on = Math.min(1, 0.92 + 0.08 * ease.out(seg(ts, 0.5, 0.9)) + 0.02 * Math.sin(S * 23));
    const gone = S >= GONE;
    world(c, S, api, kit, {
      Sw: FREEZE, bS: FREEZE,
      cam: { z: lerp(0.95, 1.08, ease.inOut(t)), cx: lerp(780, 1250, ease.inOut(t)), cy: lerp(645, 700, ease.inOut(t)) },
      energy: 0.55, arms: 'beat', noBursts: true, vanish: { t0: 175.5, t1: 179.0, keep: 0.3 }, vS: 179.5, goneAt: GONE,
      hero: gone ? false : { mood: 'flat', look: 0.3, arm: ['down', 'up'] },
      drain: 0.5, gold: 1, lamp: on, conf: 120, chairConf: 0.3, lights: 0.5
    });
  });
})();
