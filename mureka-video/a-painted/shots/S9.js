// Section S9 (185.0-200.31 s), outro and sign-off. New-seconds code (SHOTS_NEW).
// S9.1 the party machinery runs on in the empty room, morning gold; S9.2 the sign-off: one object, the paper plane on the desk
// by the lamp, the day goes out round the lamp; S9.3 the room of A0.1 once more, lamp on, nobody in the chair.
// Uses window.W4H.world from E9.js (the party room) at draw time.
(function () {
  const R = (id, fn) => { window.SHOTS_NEW[id] = fn; };
  const TAU = Math.PI * 2;
  // A0.1 ended on the room at 1.15x with this offset (the same framing E8.7 landed on in v4)
  const END_Z = 1.15, END_TX = -230, END_TY = -122;
  const phiAt = S => 0.45 + 0.07 * Math.sin(S * 0.9);
  const swayAt = S => 6 * Math.sin(S * 1.3);
  const CONF = ['#c9805a', '#d9728a', '#d9993a', '#5aa7a3', '#ecc87c'];

  // camera about a room point: (cx,cy) lands at the frame centre
  const cam = (c, cx, cy, z) => { c.translate(960, 540); c.scale(z, z); c.translate(-cx, -cy); };

  // ---- S9.1: the party goes on without anyone ------------------------------------------------------------------
  R('S9.1', (c, shot, S, t, api, kit) => {
    const { ease, lerp } = api;
    const W = window.W4H, k = ease.inOut(t);
    W.world(c, S, api, kit, {
      Sw: W.constants.FREEZE + (S - shot.t0), bS: S,
      cam: { z: lerp(1.08, 0.85, k), cx: lerp(1250, 950, k), cy: lerp(700, 645, k) },
      punch: 0.012 * api.pulse(S, 6), crowd: false, hero: false,
      drain: 0.5, gold: 1, lamp: 1, conf: 120, chairConf: 0.3, lights: 0.8, flash: 0.1 * api.pulse(S, 8)
    });
  });

  // the empty room in the lit-lamp state shared by S9.2 and S9.3 (room coordinates, before any camera)
  function room(c, S, kit, o) {
    kit.humanRoom(c, {
      mode: o.mode, S, phi: phiAt(S), sway: swayAt(S), lamp: 1, monitor: 0, zzz: 0, dust: 1, dim: o.dim, light: o.light,
      led: 0.5, confetti: o.chairConf, drawer: o.drawer || 0
    });
    kit.confetti(c, S, 9, { n: 16, x: 1020, y: 880, w: 560, h: 110, still: true, colors: CONF, alpha: o.dim > 0.5 ? 0.7 : 1 });
  }

  // ---- S9.2: "Signed: one of the twelve hundred." --------------------------------------------------------------
  R('S9.2', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const k = ease.inOut(seg(S, 191.0, 196.0));
    const dusk = ease.smooth(seg(S, 192.9, 195.5));
    c.save();
    cam(c, lerp(1085, 1290, k), lerp(690, 780, k), lerp(2.3, 1.7, k));
    room(c, S, kit, { mode: 'gold', dim: 0.85 * dusk, light: 1 - 0.6 * dusk, chairConf: 0.45, drawer: 0.16 });
    // the plane, flat on the desk next to the lamp
    const PX = 1160, PY = 718;
    kit.shadow(c, PX + 4, PY + 6, 62, 8, 0.26);
    kit.plane(c, PX, PY - 20, 104, { S, rot: -0.12, fold: 1, color: kit.K('#fbf3dc', 0.1 + 0.3 * dusk) });
    // lamp light stays while the daylight leaves
    kit.glow(c, 1195, 500, 520, 'rgba(255,226,150,A)', 0.35 + 0.3 * dusk);
    kit.glow(c, 1195, 500, 140, 'rgba(255,244,200,A)', 0.4, 'source-over');
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,214,130,${0.1 + 0.08 * dusk})`;
    c.beginPath(); c.moveTo(1170, 520); c.lineTo(1250, 500); c.lineTo(1500, 840); c.lineTo(1020, 840); c.closePath(); c.fill(); c.restore();
    c.restore();
    const dip = ease.in(seg(S, 195.55, 196.0));
    if (dip > 0.001) { c.fillStyle = `rgba(6,14,18,${dip})`; c.fillRect(0, 0, 1920, 1080); }
  });

  // ---- S9.3: the room of A0.1, now with the lamp on ------------------------------------------------------------
  R('S9.3', (c, shot, S, t, api, kit) => {
    const { ease, seg, lerp } = api;
    const k = ease.inOut(t);
    const cxE = (960 - END_TX) / END_Z, cyE = (540 - END_TY) / END_Z;     // room point at the centre of the A0.1 end frame
    c.save();
    cam(c, lerp(cxE, 1300, k), lerp(cyE, 745, k), lerp(END_Z, 1.4, k));
    room(c, S, kit, { mode: 'night', dim: 0.8, light: 0.4, chairConf: 0.4 });
    kit.glow(c, 1195, 500, 560, 'rgba(255,226,150,A)', 0.55);
    kit.glow(c, 1195, 500, 150, 'rgba(255,244,200,A)', 0.5, 'source-over');
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,214,130,0.1)';
    c.beginPath(); c.moveTo(1170, 520); c.lineTo(1250, 500); c.lineTo(1500, 840); c.lineTo(1020, 840); c.closePath(); c.fill(); c.restore();
    kit.glow(c, 1300, 760, 360, 'rgba(255,214,140,A)', 0.14);
    c.restore();
    const up = 1 - ease.out(seg(S, 196.0, 196.7));
    if (up > 0.001) { c.fillStyle = `rgba(6,14,18,${up})`; c.fillRect(0, 0, 1920, 1080); }
  });
})();
