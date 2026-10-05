// Style A, "painted stage": warm gouache/watercolour picture-book look.
// Pure function of S. All randomness comes from api.hash / api.rng.
(function () {
  'use strict';
  const W = 1920, H = 1080;
  const INK = '#2b2233';
  const PAPER = '#f2e6cc';
  const FONT = '"Marker Felt","Chalkboard SE","Bradley Hand","Comic Sans MS",sans-serif';
  const PAL = {
    deep: '#0d2b33', teal: '#1b5560', teal2: '#2b7f84', ochre: '#d9993a', rose: '#d9728a', tomato: '#d8503b',
    sage: '#8cc7a1', straw: '#ecc87c', cream: '#f6ecd4',
    magenta: '#e5239b', yellow: '#ffd62e', sky: '#2fb4ff', lime: '#8be04a', orange: '#ff8a3d'
  };
  const BEANCOLS = ['#2b7f84', '#d9993a', '#d9728a', '#d8503b', '#8cc7a1', '#ecc87c', '#5aa7a3', '#c9805a'];
  const HOT = ['#e5239b', '#ffd62e', '#2fb4ff', '#d8503b', '#8be04a', '#ff8a3d', '#ffffff'];
  const BHOT = ['#e5239b', '#ffd62e', '#2fb4ff', '#ff5a3c', '#8be04a', '#ff8a3d', '#a56bff'];
  const T = { hush: 5.84, drop: 8.63, human: 6.6 };

  let A = null, F = 0, GRAIN = null, CROWD = null, DK = 0;

  // ---------- helpers ----------
  const hz = (id, i) => A.hash(id * 977 + i * 131 + F * 7919);
  const jt = (id, i, amt) => (hz(id, i) - 0.5) * 2 * amt;
  const hexRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const NAVY = [16, 34, 56];
  function mixTo(h, tgt, k) {
    const a = hexRgb(h);
    return `rgb(${Math.round(a[0] + (tgt[0] - a[0]) * k)},${Math.round(a[1] + (tgt[1] - a[1]) * k)},${Math.round(a[2] + (tgt[2] - a[2]) * k)})`;
  }
  const K = (h, k) => mixTo(h, NAVY, k === undefined ? DK : k);

  function smoothClosed(c, p) {
    const n = p.length;
    c.moveTo((p[n - 1][0] + p[0][0]) / 2, (p[n - 1][1] + p[0][1]) / 2);
    for (let i = 0; i < n; i++) {
      const a = p[i], b = p[(i + 1) % n];
      c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    c.closePath();
  }
  function blob(c, cx, cy, rx, ry, id, amt, n, rot) {
    amt = amt === undefined ? 2 : amt; n = n || 14; rot = rot || 0;
    const p = [], cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const x = Math.cos(a) * rx + jt(id, 2 * i, amt), y = Math.sin(a) * ry + jt(id, 2 * i + 1, amt);
      p.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    }
    smoothClosed(c, p);
  }
  function wrect(c, x, y, w, h, id, amt, step) {
    amt = amt === undefined ? 2 : amt; step = step || 46;
    const nx = Math.max(1, Math.round(w / step)), ny = Math.max(1, Math.round(h / step));
    const pts = [];
    const add = (px, py, key) => pts.push([px, py, key]);
    let k = 0;
    for (let i = 0; i < nx; i++) { if (i === 0) add(x, y, k); add(x + w * i / nx, y, k); k++; }
    for (let i = 0; i < ny; i++) { if (i === 0) add(x + w, y, k); add(x + w, y + h * i / ny, k); k++; }
    for (let i = 0; i < nx; i++) { if (i === 0) add(x + w, y + h, k); add(x + w - w * i / nx, y + h, k); k++; }
    for (let i = 0; i < ny; i++) { if (i === 0) add(x, y + h, k); add(x, y + h - h * i / ny, k); k++; }
    smoothClosed(c, pts.map(q => [q[0] + jt(id, q[2] * 2, amt), q[1] + jt(id, q[2] * 2 + 1, amt)]));
  }
  // fill + watercolour rim + ink outline. pathFn builds the path (called twice with identical jitter).
  function fillInk(c, pathFn, fill, lw, o) {
    o = o || {};
    c.beginPath(); pathFn();
    c.fillStyle = fill; c.fill();
    if (o.rim !== false) {
      c.save(); c.clip();
      c.globalCompositeOperation = 'multiply';
      c.lineWidth = o.rimW || Math.max(6, lw * 3);
      c.strokeStyle = o.rimCol || 'rgba(70,40,50,.32)';
      c.stroke();
      if (o.inside) { c.globalCompositeOperation = 'source-over'; o.inside(c); }
      c.restore();
    }
    if (lw > 0) {
      c.beginPath(); pathFn();
      c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke();
    }
  }
  function wash(c, col, alpha, fn) {
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = alpha; c.fillStyle = col;
    c.beginPath(); fn(); c.fill(); c.restore();
  }
  function glow(c, x, y, r, col, a, comp) {
    c.save(); c.globalCompositeOperation = comp || 'screen';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }
  function shadow(c, x, y, rx, ry, a) {
    c.save(); c.fillStyle = `rgba(10,5,20,${a === undefined ? 0.32 : a})`;
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); c.restore();
  }
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ---------- beans ----------
  // s = 1 => body about 68 wide, 84 tall; (x,y) = feet centre.
  function bean(c, x, y, s, o) {
    o = o || {};
    const sy = o.sy === undefined ? 1 : o.sy, sx = o.sx === undefined ? Math.pow(sy, -0.6) : o.sx;
    const id = o.id || 1, col = o.col || PAL.teal2;
    const lx = o.lx || 0, ly = o.ly || 0;
    const armL = o.armL === undefined ? 2.0 : o.armL, armR = o.armR === undefined ? 1.14 : o.armR;
    c.save();
    c.translate(x, y);
    if (o.rot) c.rotate(o.rot);
    c.scale(sx * s * (o.flip ? -1 : 1), sy * s);
    const lw = 2.6;
    // arms behind body
    const arm = (sx0, a) => {
      const sxp = sx0 * 29, syp = -44, L = 26;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(sxp, syp); c.lineTo(sxp + Math.cos(a) * L, syp + Math.sin(a) * L);
      c.lineWidth = 13; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 8; c.strokeStyle = col; c.stroke();
    };
    arm(-1, armL); arm(1, armR);
    // legs
    const leg = lxp => fillInk(c, () => blob(c, lxp, -7, 10, 8, id * 3 + (lxp > 0 ? 1 : 0), 0.8, 8), col, lw, { rim: false });
    leg(-15); leg(15);
    // antenna
    if (o.antenna) {
      const sw = (o.sway || 0);
      c.beginPath(); c.moveTo(0, -84); c.quadraticCurveTo(sw * 5, -100, sw * 12, -116);
      c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(sw * 12, -121, 7 + (o.bulb || 0) * 3, 0, Math.PI * 2);
      c.fillStyle = o.antenna; c.fill(); c.lineWidth = 2.4; c.stroke();
    }
    // body
    const bodyPath = () => blob(c, 0, -46, 34, 42, id, 1.5, 13, 0.05);
    fillInk(c, bodyPath, col, lw, {
      rimW: 9,
      inside: cc => {
        if (o.band) {
          cc.beginPath(); cc.moveTo(-40, -72); cc.quadraticCurveTo(0, -66, 40, -72);
          cc.lineWidth = 9; cc.strokeStyle = o.band; cc.stroke();
        }
        cc.fillStyle = 'rgba(255,255,255,.2)';
        cc.beginPath(); cc.ellipse(-12, -64, 9, 16, -0.4, 0, Math.PI * 2); cc.fill();
        cc.fillStyle = 'rgba(255,246,220,.28)';
        cc.beginPath(); cc.ellipse(3, -24, 20, 13, 0, 0, Math.PI * 2); cc.fill();
      }
    });
    // face
    const ex = 12, ey = -58 + ly * 3;
    c.fillStyle = 'rgba(230,90,110,.45)';
    c.beginPath(); c.arc(-21 + lx * 3, -46, 6.5, 0, 6.3); c.arc(21 + lx * 3, -46, 6.5, 0, 6.3); c.fill();
    const blink = o.blink || 0;
    if (o.eyes === 'happy') {
      c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round';
      c.beginPath(); c.arc(-ex + lx * 5, ey + 2, 5.5, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.beginPath(); c.arc(ex + lx * 5, ey + 2, 5.5, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    } else if (o.eyes === 'x') {
      c.lineWidth = 3.2; c.strokeStyle = INK;
      for (const sg of [-1, 1]) {
        const px = sg * ex + lx * 5;
        c.beginPath(); c.moveTo(px - 4.5, ey - 4.5); c.lineTo(px + 4.5, ey + 4.5); c.moveTo(px + 4.5, ey - 4.5); c.lineTo(px - 4.5, ey + 4.5); c.stroke();
      }
    } else {
      const r = o.eyes === 'wide' ? 6.4 : 5;
      c.fillStyle = INK;
      c.beginPath(); c.ellipse(-ex + lx * 5, ey, r, r * (1 - blink * 0.85), 0, 0, 6.3); c.ellipse(ex + lx * 5, ey, r, r * (1 - blink * 0.85), 0, 0, 6.3); c.fill();
      if (!blink) {
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(-ex + lx * 5 + 1.8, ey - 1.8, 1.7, 0, 6.3); c.arc(ex + lx * 5 + 1.8, ey - 1.8, 1.7, 0, 6.3); c.fill();
      }
    }
    const m = o.mouth || 'grin', mx = lx * 4;
    if (m === 'grin') {
      c.beginPath(); c.moveTo(-10 + mx, -45); c.quadraticCurveTo(mx, -28, 10 + mx, -45); c.closePath();
      c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
      c.fillStyle = '#e8737f'; c.beginPath(); c.ellipse(mx, -34, 4.5, 2.6, 0, 0, 6.3); c.fill();
    } else if (m === 'o') {
      c.beginPath(); c.ellipse(mx, -38, 5, 6.5, 0, 0, 6.3); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
    } else if (m === 'smile') {
      c.beginPath(); c.moveTo(-7 + mx, -42); c.quadraticCurveTo(mx, -34, 7 + mx, -42); c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
    } else if (m === 'flat') {
      c.beginPath(); c.moveTo(-6 + mx, -39); c.lineTo(6 + mx, -39); c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
    }
    c.restore();
  }

  // cheap crowd bean: two path fills, no wobble.
  function cheap(c, x, y, s, col, sy, look, tilt, o) {
    const sx = Math.pow(sy, -0.6);
    const rx = 31 * s * sx, ry = 41 * s * sy, cy = y - 44 * s * sy;
    c.fillStyle = col;
    c.beginPath(); c.ellipse(x, cy, rx, ry, tilt || 0, 0, 6.283); c.fill();
    c.lineWidth = Math.max(1.6, 2.6 * s); c.strokeStyle = INK; c.stroke();
    const ey = cy - 12 * s * sy, ex = 11 * s * sx, lo = (look || 0) * 5 * s;
    c.fillStyle = INK;
    c.beginPath();
    if (o && o.happy) {
      c.lineWidth = Math.max(1.8, 3 * s); c.lineCap = 'round';
      c.arc(x - ex + lo, ey + 2 * s, 5 * s, 3.5, 5.9); c.moveTo(x + ex + lo + 5 * s * Math.cos(3.5), ey + 2 * s + 5 * s * Math.sin(3.5));
      c.arc(x + ex + lo, ey + 2 * s, 5 * s, 3.5, 5.9); c.stroke();
    } else {
      c.arc(x - ex + lo, ey, 5 * s, 0, 6.3); c.moveTo(x + ex + lo + 5 * s, ey); c.arc(x + ex + lo, ey, 5 * s, 0, 6.3); c.fill();
    }
    c.fillStyle = 'rgba(240,100,120,.42)';
    c.beginPath(); c.arc(x - 20 * s * sx + lo * 0.5, cy + 2 * s, 5 * s, 0, 6.3); c.arc(x + 20 * s * sx + lo * 0.5, cy + 2 * s, 5 * s, 0, 6.3); c.fill();
    if (o && o.mouth) {
      c.beginPath(); c.moveTo(x - 8 * s + lo * 0.6, cy + 2 * s); c.quadraticCurveTo(x + lo * 0.6, cy + 16 * s, x + 8 * s + lo * 0.6, cy + 2 * s); c.closePath();
      c.fillStyle = '#5a1d2c'; c.fill();
    }
    if (o && o.arms !== undefined) {
      const a = o.arms; // 0 down .. 1 up
      c.lineCap = 'round';
      for (const sg of [-1, 1]) {
        const ang = sg < 0 ? Math.PI - (1.14 - 2.08 * a) : (1.14 - 2.08 * a);
        const x0 = x + sg * 29 * s * sx, y0 = cy + 2 * s * sy, L = 27 * s;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(ang) * L, y0 + Math.sin(ang) * L);
        c.lineWidth = 12 * s; c.strokeStyle = INK; c.stroke();
        c.lineWidth = 7.5 * s; c.strokeStyle = col; c.stroke();
      }
    }
    if (o && o.antenna) {
      c.beginPath(); c.moveTo(x, cy - ry); c.lineTo(x + 4 * s, cy - ry - 24 * s);
      c.lineWidth = 3 * s; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(x + 4 * s, cy - ry - 28 * s, 6.5 * s, 0, 6.3); c.fillStyle = o.antenna; c.fill(); c.lineWidth = 2 * s; c.stroke();
    }
    if (o && o.band) {
      c.save(); c.beginPath(); c.ellipse(x, cy, rx, ry, tilt || 0, 0, 6.283); c.clip();
      c.beginPath(); c.moveTo(x - rx, cy - ry * 0.42); c.lineTo(x + rx, cy - ry * 0.46);
      c.lineWidth = 8 * s; c.strokeStyle = o.band; c.stroke(); c.restore();
    }
  }

  // ---------- lettering ----------
  // rows: arrays of word indices. lits: lit colours cycled by word index.
  function lyric(c, S, li, rows, size, y0, lh, lits, o) {
    o = o || {};
    const line = A.lines[li];
    c.save();
    c.font = size + 'px ' + FONT;
    c.textBaseline = 'alphabetic'; c.textAlign = 'center';
    const gap = size * 0.44;
    const layout = rows.map(r => {
      const ws = r.map(i => c.measureText(line.words[i].w).width);
      return { r, ws, tot: ws.reduce((a, b) => a + b, 0) + gap * (r.length - 1) };
    });
    const fit = Math.min(1, 1728 / Math.max.apply(null, layout.map(l => l.tot)));
    const lw0 = line.words[0].s - 0.4, lend = line.words[line.words.length - 1].e + (o.out === undefined ? 0.45 : o.out);
    layout.forEach((L, ri) => {
      let x = 960 - L.tot * fit / 2;
      const y = y0 + ri * lh;
      L.r.forEach((wi, k) => {
        const w = line.words[wi], wd = L.ws[k] * fit;
        const cx = x + wd / 2;
        x += (L.ws[k] + gap) * fit;
        if (o.show && !o.show(wi, S)) return;
        const appear = o.popAt !== undefined ? A.seg(S, o.popAt, o.popAt + (o.popDur || 0.2)) : A.seg(S, lw0, lw0 + 0.2);
        const shrink = o.keep ? 1 : 1 - A.ease.in(A.seg(S, lend, lend + 0.22));
        const al = appear;
        if (al <= 0.001 || shrink <= 0.02) return;
        const since = S - w.s, sung = since >= 0;
        const sc = (sung ? 1 + (o.pop || 0.14) * Math.exp(-since * (o.popDecay || 9)) : 1) * (0.7 + 0.3 * A.ease.back(appear)) * shrink;
        const hop = sung ? -size * 0.2 * Math.sin(Math.PI * A.seg(S, w.s, w.s + 0.32)) : 0;
        const bb = o.beat ? -size * 0.05 * A.pulse(S, 6) : 0;
        const rot = (hz(900 + wi * 3 + li * 40, 0) - 0.5) * 0.06 + (o.tilt || 0) * (wi % 2 ? 1 : -1);
        c.save();
        c.globalAlpha = al;
        c.translate(cx, y + hop + bb);
        c.rotate(rot);
        c.scale(fit * sc, fit * sc);
        const lit = lits[wi % lits.length];
        const wp = A.wordProgress(w, S);
        c.lineJoin = 'round';
        if (o.sticker) { c.lineWidth = size * 0.3; c.strokeStyle = '#fff6df'; c.strokeText(w.w, 0, 0); }
        c.lineWidth = size * (o.sticker ? 0.12 : 0.1); c.strokeStyle = INK; c.strokeText(w.w, 0, 0);
        c.fillStyle = o.dim || 'rgba(246,236,212,.5)'; c.fillText(w.w, 0, 0);
        if (wp > 0) {
          const half = L.ws[k] / 2;
          wash(c, lit, 0.35, () => blob(c, 0, -size * 0.28, half * Math.min(1, wp * 2.2) * 0.9, size * 0.34, wi + 50 + li * 20, 4, 10));
          c.save();
          c.beginPath(); c.rect(-half - 20, -size * 1.2, (half * 2 + 40) * (sung ? Math.min(1, wp * 2.2) : 0), size * 1.6); c.clip();
          c.fillStyle = lit; c.fillText(w.w, 0, 0);
          c.restore();
        }
        c.restore();
      });
    });
    c.restore();
  }

  // ---------- brush wipes ----------
  function bandsPath(c, front, seed) {
    const NB = 22, bh = H / NB + 16;
    for (let i = 0; i < NB; i++) {
      const y = i * (H / NB) - 8, xe = front + (A.hash(i + seed) - 0.5) * 300;
      c.moveTo(-400, y);
      c.lineTo(xe, y + jt(seed, i, 4));
      c.quadraticCurveTo(xe + 36, y + bh / 2, xe - 4, y + bh);
      c.lineTo(-400, y + bh);
      c.closePath();
    }
  }
  function brushWipe(c, front, seed) {
    const NB = 22, bh = H / NB + 16;
    const tones = ['#f2e6cc', '#eedfc0', '#f5ead3', '#ecdcba'];
    for (let i = 0; i < NB; i++) {
      const y = i * (H / NB) - 8, xe = front + (A.hash(i + seed) - 0.5) * 300;
      c.fillStyle = tones[i % 4];
      c.beginPath();
      c.moveTo(-400, y); c.lineTo(xe, y + jt(seed, i, 4));
      c.quadraticCurveTo(xe + 36, y + bh / 2, xe - 4, y + bh); c.lineTo(-400, y + bh); c.closePath(); c.fill();
      c.strokeStyle = tones[(i + 1) % 4]; c.lineWidth = 5; c.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const yy = y + 6 + A.hash(i * 7 + k + seed) * (bh - 12);
        c.beginPath(); c.moveTo(xe - 30, yy); c.lineTo(xe + 40 + A.hash(i * 3 + k) * 130, yy + jt(i, k, 3)); c.stroke();
      }
    }
  }

  // ---------- shot 1: server room ----------
  function serverBox(c, x, y, w, h, i, S, mood, id, stripe) {
    fillInk(c, () => wrect(c, x, y, w, h, id, 2.2, 50), '#e8dbb8', 3.4);
    fillInk(c, () => wrect(c, x + 8, y + 8, 22, h - 16, id + 5, 1.2, 60), stripe, 2.2, { rim: false });
    const ey = y + h * 0.45;
    for (const ex of [x + 80, x + 130]) {
      c.beginPath();
      if (mood === 2) {
        c.moveTo(ex - 8, ey - 8); c.lineTo(ex + 8, ey + 8); c.moveTo(ex + 8, ey - 8); c.lineTo(ex - 8, ey + 8);
        c.lineWidth = 4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      } else {
        const r = mood === 1 ? 14 : 10;
        c.ellipse(ex, ey, r, r, 0, 0, 6.3); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
        c.beginPath(); c.arc(ex - 2 + (mood === 1 ? -3 : -1), ey, r * 0.45, 0, 6.3); c.fillStyle = INK; c.fill();
      }
    }
    c.beginPath();
    if (mood === 1) { c.ellipse(x + 105, ey + 32, 7, 9, 0, 0, 6.3); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); }
    else if (mood === 2) { c.moveTo(x + 90, ey + 36); c.quadraticCurveTo(x + 105, ey + 24, x + 120, ey + 36); c.lineWidth = 3.4; c.strokeStyle = INK; c.stroke(); }
    else { c.moveTo(x + 92, ey + 26); c.quadraticCurveTo(x + 105, ey + 40, x + 118, ey + 26); c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); }
    const fl = Math.floor(S * 6);
    for (let j = 0; j < 6; j++) {
      const on = mood === 2 ? (j + fl) % 2 === 0 : A.hash(i * 17 + j + fl * 13) > 0.4;
      const col = mood === 2 ? PAL.tomato : [PAL.sage, PAL.straw, PAL.rose][j % 3];
      c.beginPath(); c.arc(x + w - 150 + j * 22, y + h * 0.3, 6.2, 0, 6.3);
      c.fillStyle = on ? col : '#8f866e'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      if (on) glow(c, x + w - 150 + j * 22, y + h * 0.3, 26, col.startsWith('#') ? hexA(col) : col, 0.35);
    }
    c.beginPath();
    for (let j = 0; j < 4; j++) { c.moveTo(x + w - 150, y + h * 0.55 + j * 11); c.lineTo(x + w - 30, y + h * 0.55 + j * 11 + jt(id, j, 1.5)); }
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(43,34,51,.55)'; c.lineCap = 'round'; c.stroke();
  }
  function hexA(h) { const a = hexRgb(h); return `rgba(${a[0]},${a[1]},${a[2]},A)`; }

  function serverRoom(c, S, t) {
    const dt = t - 1.48;
    const z = 1 + 0.12 * A.ease.smooth(A.seg(t, 0, 2.95));
    let shx = 0, shy = 0;
    if (dt > 0) { const a = 28 * Math.exp(-dt * 8); shx = a * Math.sin(dt * 70); shy = a * 0.7 * Math.cos(dt * 83); }
    c.save();
    c.translate(960 + shx, 540 + shy); c.scale(z, z); c.translate(-1060, -560);

    // night wall and floor
    c.fillStyle = PAL.deep; c.fillRect(-800, -600, 3600, 2400);
    for (let i = 0; i < 9; i++) {
      c.globalAlpha = 0.55; c.fillStyle = i % 2 ? '#164650' : '#1b5560';
      c.beginPath(); blob(c, 80 + i * 250, 260 + (i % 3) * 150, 300, 230, 100 + i, 7, 12); c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = '#0a2127'; c.beginPath(); wrect(c, -800, 830, 3600, 1200, 200, 3, 80); c.fill();
    c.strokeStyle = 'rgba(246,236,212,.07)'; c.lineWidth = 3;
    for (let i = -6; i < 16; i++) { c.beginPath(); c.moveTo(i * 220, 835); c.lineTo(i * 360 - 700, 1300); c.stroke(); }
    // moon and stars
    glow(c, 1700, 300, 330, 'rgba(244,232,192,A)', 0.22);
    fillInk(c, () => blob(c, 1700, 300, 82, 82, 301, 2.5, 14), '#f4e8c0', 3);
    wash(c, '#d8c58a', 0.4, () => blob(c, 1678, 322, 26, 18, 302, 2, 8));
    for (let i = 0; i < 16; i++) {
      const sx = 200 + A.hash(i * 5) * 1500, sy = 120 + A.hash(i * 5 + 1) * 380, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2);
      c.strokeStyle = `rgba(246,236,212,${0.25 + 0.5 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(sx - 8, sy); c.lineTo(sx + 8, sy); c.moveTo(sx, sy - 8); c.lineTo(sx, sy + 8); c.stroke();
    }
    // cables
    c.lineWidth = 7; c.lineCap = 'round';
    [[PAL.ochre, 300], [PAL.rose, 340], [PAL.sage, 380]].forEach((q, k) => {
      c.strokeStyle = q[0]; c.globalAlpha = 0.6;
      c.beginPath(); c.moveTo(-200, q[1] + 150); c.bezierCurveTo(200, q[1] + 400, 500, q[1] - 80, 880, 820 - k * 14 + jt(k, 0, 2)); c.stroke();
    });
    c.globalAlpha = 1;
    // warm lamp cone
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(236,190,110,.09)';
    c.beginPath(); c.moveTo(1030, -20); c.lineTo(1170, -20); c.lineTo(1650, 830); c.lineTo(520, 830); c.closePath(); c.fill(); c.restore();
    fillInk(c, () => wrect(c, 1020, -40, 160, 74, 310, 2, 40), '#caa05a', 3);

    // rack
    const th = dt < 0 ? 0.012 * Math.sin(t * 46) * A.seg(t, 1.1, 1.48) : 0.09 * (1 - Math.exp(-dt * 30)) + 0.08 * Math.exp(-dt * 5) * Math.sin(dt * 16);
    const mood = dt < -0.35 ? 0 : (dt < 0 ? 1 : 2);
    shadow(c, 1210, 838, 220, 22, 0.4);
    c.save();
    c.translate(1400, 830); c.rotate(th); c.translate(-1400, -830);
    fillInk(c, () => wrect(c, 1010, 330, 390, 500, 320, 3, 70), '#12353c', 4);
    c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(1030, 345, 350, 470);
    // boxes: bottom, middle, then the one that flies off
    serverBox(c, 1030, 675, 350, 140, 2, S, mood, 330, PAL.sage);
    const mdx = dt > 0 ? 80 * A.ease.out(A.seg(dt, 0, 0.35)) : 0;
    c.save(); c.translate(mdx, 0); c.rotate(dt > 0 ? 0.05 * A.ease.out(A.seg(dt, 0, .4)) : 0);
    serverBox(c, 1030, 515, 350, 140, 1, S, mood, 340, PAL.rose);
    c.restore();
    c.save();
    if (dt > 0) {
      const g = 2200, fl = 830 - 355 - 140;
      let dy = 0.5 * g * dt * dt, bounce = 0;
      if (dy > fl) {
        const tl = Math.sqrt(2 * fl / g); dy = fl;
        bounce = 70 * Math.abs(Math.sin((dt - tl) * 7)) * Math.exp(-(dt - tl) * 3.5);
      }
      c.translate(420 * A.ease.out(A.seg(dt, 0, 0.55)), dy - bounce);
      c.translate(1205, 425); c.rotate(1.1 * A.ease.out(A.seg(dt, 0, 0.7))); c.translate(-1205, -425);
    }
    serverBox(c, 1030, 355, 350, 140, 0, S, mood, 350, PAL.ochre);
    c.restore();
    c.restore();

    // smoke
    if (dt > 0.1) for (let k = 0; k < 7; k++) {
      const tk = dt - 0.1 - k * 0.14; if (tk <= 0) continue;
      const a = 0.5 * (1 - A.seg(tk, 0.2, 1.7));
      const px = 1230 + 26 * Math.sin(tk * 3 + k) + k * 16, py = 360 - 120 * tk;
      c.save(); c.globalAlpha = a; fillInk(c, () => blob(c, px, py, 30 + 46 * tk, 26 + 38 * tk, 400 + k, 3, 10), '#8fa3a3', 2.4, { rim: false }); c.restore();
    }
    // splat
    if (dt > -0.02 && dt < 0.55) {
      const r = A.ease.expOut(A.seg(dt, 0, 0.2)), al = 1 - A.seg(dt, 0.18, 0.5);
      c.save(); c.globalAlpha = al;
      const star = (R, id, col, lw) => fillInk(c, () => {
        const p = [];
        for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283, rr = R * r * (i % 2 ? 0.55 : 1.0) * (0.75 + 0.5 * A.hash(id + i)); p.push([1010 + Math.cos(a) * rr, 560 + Math.sin(a) * rr * 0.85]); }
        smoothClosed(c, p);
      }, col, lw, { rim: false });
      star(430, 500, PAL.ochre, 4);
      star(280, 540, PAL.tomato, 3.4);
      star(130, 580, '#f5d98a', 3);
      for (let i = 0; i < 12; i++) {
        const a = A.hash(600 + i) * 6.283, d = (360 + A.hash(620 + i) * 360) * r;
        fillInk(c, () => blob(c, 1010 + Math.cos(a) * d, 560 + Math.sin(a) * d * 0.8, 12 + 12 * A.hash(640 + i), 12, 650 + i, 1.4, 8), i % 2 ? PAL.tomato : PAL.ochre, 2.6, { rim: false });
      }
      c.restore();
    }
    // sparks
    if (dt > 0 && dt < 1.2) for (let k = 0; k < 20; k++) {
      const life = 0.5 + A.hash(700 + k) * 0.6; if (dt > life) continue;
      const a = -Math.PI * 0.95 + A.hash(720 + k) * Math.PI * 1.3, sp = 320 + A.hash(740 + k) * 620;
      const px = 1010 + Math.cos(a) * sp * dt, py = 560 + Math.sin(a) * sp * dt + 1100 * dt * dt;
      const L = (8 + 14 * A.hash(760 + k)) * (1 - dt / life);
      c.strokeStyle = k % 3 ? '#ffd873' : PAL.tomato; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(px - L, py); c.lineTo(px + L, py); c.moveTo(px, py - L); c.lineTo(px, py + L); c.stroke();
    }

    // hero
    let hx = 560, hy = 830, sy = 1, sxx = undefined, armL = 2.0, armR = 1.14, mouth = 'grin', eyes = 'dot', rot = 0;
    const bob = Math.sin(t * 7) * 0.025;
    if (t < 0.45) { sy = 1 + bob; hy -= 0; armL = 2.0 + 0.2 * Math.sin(t * 9); armR = 1.14 - 0.2 * Math.sin(t * 9 + 1); }
    else if (t < 1.1) {
      const u = A.seg(t, 0.45, 1.1); hx = A.lerp(560, 770, A.ease.smooth(u)); hy -= Math.abs(Math.sin(u * 3 * Math.PI)) * 30;
      sy = 1 - 0.07 * Math.cos(u * 6 * Math.PI); armL = 2.0 + 0.5 * Math.sin(u * 18); armR = 1.14 - 0.5 * Math.sin(u * 18);
    } else if (t < 1.4) {
      const u = A.ease.out(A.seg(t, 1.1, 1.38)); hx = 770 - 18 * u; sy = 1 - 0.26 * u; armL = A.lerp(2.0, 2.7, u); armR = A.lerp(1.14, 2.4, u); rot = -0.08 * u;
    } else if (t < 1.48) {
      const u = A.ease.in(A.seg(t, 1.4, 1.48)); hx = A.lerp(752, 868, u); sy = 0.74 + 0.28 * u; sxx = 1.12 + 0.12 * u; armL = armR = 0.1; rot = 0.12; mouth = 'grin';
    } else {
      const u = A.seg(t, 1.48, 1.95);
      hx = 868 - 60 * A.ease.out(u); sy = 1 + 0.08 * Math.sin((t - 1.48) * 22) * Math.exp(-(t - 1.48) * 5);
      rot = 0.12 * (1 - A.ease.out(A.seg(t, 1.48, 1.7)));
      const cheer = A.ease.back(A.seg(t, 1.7, 1.95));
      armL = A.lerp(2.0, -2.3, cheer); armR = A.lerp(0.1, -0.84, cheer);
      eyes = t > 1.7 ? 'happy' : 'dot';
      hy -= t > 1.95 ? Math.abs(Math.sin((t - 1.95) * 8)) * 22 : 0;
      sy *= t > 1.95 ? 1 + 0.05 * Math.sin((t - 1.95) * 16) : 1;
    }
    shadow(c, hx, 836, 90, 14, 0.35);
    bean(c, hx, hy, 2.35, { id: 11, col: PAL.tomato, sy, sx: sxx, armL, armR, mouth, eyes, rot, antenna: '#ffd873', band: '#f6ecd4', lx: 0.6, bulb: A.pulse(S, 4), sway: Math.sin(t * 6) * 0.6 });
    c.restore();

    // darkening vignette tint for the night
    c.save(); c.globalCompositeOperation = 'multiply';
    const g = c.createRadialGradient(960, 520, 300, 960, 540, 1250);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(8,24,32,.55)');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  }

  // ---------- shot 3: the message board and the crowd ----------
  function cont(S, i) { return S; }
  function boardWorld(c, S, o) {
    o = o || {};
    const t = S - 45.5, lookT = o.lookT === undefined ? -1 : o.lookT;
    const cues = A.cues;
    const u = A.ease.smooth(A.seg(t, 3.5, T.hush));
    const z = A.lerp(1.28, 0.86, u), cx = A.lerp(820, 960, u), cy = A.lerp(600, 610, u);
    c.save();
    c.translate(960, 540); c.scale(z, z); c.translate(-cx, -cy);
    // wall + floor
    c.fillStyle = '#ecd9b0'; c.fillRect(-1400, -900, 5200, 1700);
    for (let i = 0; i < 12; i++) {
      c.globalAlpha = 0.5; c.fillStyle = i % 3 === 0 ? '#e8c68a' : (i % 3 === 1 ? '#f0dfba' : '#dcc596');
      c.beginPath(); blob(c, -200 + i * 230, 300 + (i % 4) * 90, 260, 190, 800 + i, 6, 12); c.fill();
    }
    c.globalAlpha = 1;
    c.fillStyle = '#3b7f7c'; c.beginPath(); wrect(c, -1400, 770, 5200, 1400, 830, 4, 100); c.fill();
    wash(c, '#2b6a6a', 0.5, () => wrect(c, -1400, 770, 5200, 40, 831, 3, 100));
    c.strokeStyle = 'rgba(20,50,50,.25)'; c.lineWidth = 3;
    for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-1400, 830 + i * 70); c.lineTo(3800, 830 + i * 70 + jt(i, 0, 3)); c.stroke(); }
    c.fillStyle = '#d9b97f'; c.beginPath(); wrect(c, -1400, 745, 5200, 30, 832, 2, 100); c.fill();

    // hero build timeline
    const pieces = [
      { t0: 3.52, kind: 'bar', x: 560, y: 400, w: 800, h: 30 },
      { t0: 3.62, kind: 'bar', x: 560, y: 700, w: 800, h: 30 },
      { t0: 3.74, kind: 'bar', x: 560, y: 400, w: 30, h: 330 },
      { t0: 3.86, kind: 'bar', x: 1330, y: 400, w: 30, h: 330 },
      { t0: 3.98, kind: 'cork' }
    ];
    const notes = [[680, 480, '#f2cf5b', -0.06], [820, 520, '#e99aa8', 0.05], [960, 470, '#9fd0cf', -0.03], [1110, 540, '#f2cf5b', 0.07], [1230, 480, '#c7e3a6', -0.05], [740, 610, '#9fd0cf', 0.04], [1010, 620, '#e99aa8', -0.04], [1190, 625, '#f2cf5b', 0.03]];
    const hero = { x: 470, y: 790 };
    const hand = { x: hero.x + 70, y: hero.y - 120 };
    const fly = (t0, tx, ty) => {
      const k = A.seg(t, t0, t0 + 0.24), e = A.ease.back(k);
      return { k, x: A.lerp(hand.x, tx, e), y: A.lerp(hand.y, ty, e) - 110 * Math.sin(Math.PI * k), s: 0.5 + 0.5 * A.ease.out(k), r: (1 - k) * 4 };
    };
    pieces.forEach((p, idx) => {
      if (t < p.t0) return;
      if (p.kind === 'bar') {
        const f = fly(p.t0, p.x + p.w / 2, p.y + p.h / 2);
        c.save(); c.translate(f.x, f.y); c.rotate(f.r); c.scale(f.s, f.s);
        fillInk(c, () => wrect(c, -p.w / 2, -p.h / 2, p.w, p.h, 900 + idx, 1.8, 60), '#a3703a', 3.4);
        c.restore();
      } else {
        const k = A.ease.back(A.seg(t, p.t0, p.t0 + 0.3));
        c.save(); c.translate(960, 565); c.scale(k, k);
        fillInk(c, () => wrect(c, -370, -135, 740, 270, 910, 3, 70), '#dcae6e', 3, { rimW: 16 });
        c.fillStyle = 'rgba(150,100,50,.25)';
        for (let q = 0; q < 70; q++) { c.beginPath(); c.arc(-360 + A.hash(q) * 720, -125 + A.hash(q + 99) * 250, 2 + A.hash(q + 5) * 3, 0, 6.3); c.fill(); }
        c.restore();
      }
    });
    notes.forEach((n, idx) => {
      const t0 = 4.1 + idx * 0.08; if (t < t0) return;
      const f = fly(t0, n[0], n[1]);
      c.save(); c.translate(f.x, f.y); c.rotate(n[3] + f.r); c.scale(f.s, f.s);
      fillInk(c, () => wrect(c, -50, -42, 100, 84, 920 + idx, 1.6, 50), n[2], 2.6);
      c.strokeStyle = 'rgba(43,34,51,.5)'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); for (let q = 0; q < 3; q++) { c.moveTo(-34, -18 + q * 20); c.quadraticCurveTo(-8, -26 + q * 20, 30 - q * 8, -16 + q * 20); } c.stroke();
      c.beginPath(); c.arc(0, -36, 6, 0, 6.3); c.fillStyle = PAL.tomato; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      c.restore();
    });

    // crowd (hero is bean 0), painter order by y
    const cnt = CROWD;
    const bi = A.beat(S);
    const lookOf = i => lookT < 0 ? 0 : A.ease.out(A.seg(lookT, 6.64 + cnt.h[i] * 0.55, 6.9 + cnt.h[i] * 0.55));
    for (let n = 0; n < cnt.order.length; n++) {
      const i = cnt.order[n];
      const p = A.seg(S, cnt.ts[i], cnt.ts[i] + 0.3);
      if (p <= 0) continue;
      const e = A.ease.back(p);
      const ph = cnt.h[i] * 6, f = (bi + ph * 0.1) - Math.floor(bi + ph * 0.1);
      const sy = 1 - 0.09 * Math.exp(-f * 7) + 0.03 * Math.sin(Math.PI * f);
      const bx = cnt.sx[i] + (960 - cnt.sx[i]) * 0 , by = cnt.sy[i];
      const sx0 = 960 + (cnt.h[i] - 0.5) * 360, sy0 = 560;
      const k = A.ease.out(p);
      const x = A.lerp(sx0, bx, k), y = A.lerp(sy0, by, k) - 260 * Math.sin(Math.PI * p) * (1 - 0.4 * k);
      const sc = cnt.sc[i] * (0.25 + 0.75 * e);
      const look = lookOf(i);
      const happy = false;
      if (i === 0) continue;
      if (i < 44) {
        bean(c, x, y, sc * 1.0, { id: 20 + i, col: BEANCOLS[cnt.col[i]], sy, lx: look, antenna: i % 9 === 0 ? PAL.straw : undefined, band: i % 7 === 3 ? '#f6ecd4' : undefined, mouth: i % 3 ? 'grin' : 'smile', rot: look * 0.12 });
      } else {
        cheap(c, x, y, sc, BEANCOLS[cnt.col[i]], sy, look, look * 0.12, { mouth: false });
      }
    }
    // hero in front of the left of the board
    {
      const f = (bi) - Math.floor(bi);
      let hop = 0; pieces.concat(notes.map((q, k) => ({ t0: 4.1 + k * 0.08 }))).forEach(p => { const k = A.seg(t, p.t0, p.t0 + 0.2); if (k > 0 && k < 1) hop = Math.max(hop, Math.sin(Math.PI * k) * 26); });
      const throwing = t >= 3.5 && t < 5.0;
      const sy = 1 - 0.1 * Math.exp(-f * 7) + 0.03 * Math.sin(Math.PI * f);
      const look = lookT < 0 ? 0.5 : A.lerp(0.5, 1, A.ease.out(A.seg(lookT, 6.62, 6.9)));
      const arms = throwing ? -2.2 : 2.0;
      const hp = A.ease.back(A.seg(t, 3.3, 3.6));
      shadow(c, hero.x, hero.y + 6, 80, 12, 0.3);
      if (hp > 0) bean(c, hero.x, hero.y - hop, 1.95 * hp, { id: 11, col: PAL.tomato, sy, armL: arms, armR: throwing ? -0.9 : 1.14, antenna: PAL.yellow === 'x' ? 'x' : '#f0c24a', band: '#f6ecd4', lx: look, bulb: A.pulse(S, 4), sway: Math.sin(S * 5) * 0.5, rot: lookT >= 0 ? 0.1 * look : 0, mouth: 'grin' });
    }
    // count tag
    const n = A.count(S);
    if (n > 0) {
      const pop = A.ease.back(A.seg(t, 3.46, 3.7));
      const big = S >= cues.countTo ? 1 + 0.22 * Math.exp(-(S - cues.countTo) * 9) : 1;
      const sw = 0.05 * Math.sin(S * 3.1) + (S > 50 ? 0.02 * (A.pulse(S, 6)) : 0);
      c.save();
      c.translate(1190, 438); c.rotate(sw); c.scale(pop * big, pop * big);
      c.beginPath(); c.moveTo(0, -28); c.lineTo(0, 20); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
      fillInk(c, () => wrect(c, -190, 20, 380, 168, 940, 2.4, 64), '#f8eed6', 4);
      wash(c, '#e9c98a', 0.5, () => wrect(c, -190, 20, 380, 168, 941, 4, 64));
      c.beginPath(); c.arc(0, 38, 8, 0, 6.3); c.fillStyle = '#7c5a36'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
      c.font = '116px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      const txt = fmt(n);
      c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = INK; c.strokeText(txt, 0, 156);
      c.fillStyle = n >= 1200 ? PAL.tomato : '#2a6c72'; c.fillText(txt, 0, 156);
      c.restore();
    }
    c.restore();
    if (o.dim) {
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(${255 - 130 * o.dim},${255 - 100 * o.dim},${255 - 60 * o.dim},1)`;
      c.fillRect(0, 0, W, H); c.restore();
    }
  }

  // ---------- human room ----------
  const WIN = { x: 90, y: 250, w: 860, h: 484 };
  function chairParts(c, S, t, phi, sway) {
    const cx = 1300, cs = Math.cos(phi), sn = Math.sin(phi), kw = 0.6 + 0.4 * Math.abs(cs);
    const col = K('#4f6b7a', 0.35), colL = K('#6a8796', 0.35), dk = K('#35505d', 0.35);
    // base
    const tips = [];
    for (let k = 0; k < 5; k++) { const a = phi + k * Math.PI * 2 / 5; tips.push({ x: cx + Math.cos(a) * 120, y: 1000 + Math.sin(a) * 24 }); }
    tips.sort((a, b) => a.y - b.y);
    c.lineCap = 'round';
    tips.forEach(p => {
      c.beginPath(); c.moveTo(cx, 970); c.lineTo(p.x, p.y); c.lineWidth = 17; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 11; c.strokeStyle = dk; c.stroke();
    });
    tips.forEach(p => { fillInk(c, () => blob(c, p.x, p.y + 12, 14, 13, 1000 + Math.round(p.x), 0.8, 8), '#2a2f36', 2.4, { rim: false }); });
    fillInk(c, () => wrect(c, cx - 11, 880, 22, 100, 1010, 1, 50), dk, 2.6, { rim: false });
    // seat
    const srx = 112 * (0.7 + 0.3 * Math.abs(cs));
    fillInk(c, () => blob(c, cx, 872, srx, 30, 1020, 1.4, 14), dk, 3);
    fillInk(c, () => blob(c, cx, 856, srx, 30, 1021, 1.4, 14), colL, 3.2);
    // back post and back
    const bx = cx + sn * 58, bw = 206 * kw;
    c.beginPath(); c.moveTo(cx, 850); c.quadraticCurveTo((cx + bx) / 2, 830, bx, 800); c.lineWidth = 24; c.strokeStyle = INK; c.stroke(); c.lineWidth = 17; c.strokeStyle = dk; c.stroke();
    fillInk(c, () => wrect(c, bx - bw / 2, 585, bw, 235, 1030, 2, 50), col, 3.6);
    wash(c, '#9fb8c4', 0.5, () => wrect(c, bx - bw / 2 + 14, 600, bw * 0.3, 190, 1031, 2, 60));
    // coat
    const L = bx - bw / 2, R = bx + bw / 2, coat = K('#efe7d2', 0.28), coatD = K('#d5cab0', 0.28);
    const sl = (side, len, dx) => {
      const x0 = side < 0 ? L - 4 : R + 4, x1 = x0 + side * 8 + dx + sway * side * -0.6;
      c.beginPath(); c.moveTo(x0, 618); c.quadraticCurveTo(x0 + side * 22 + dx * 0.4, 740, x1, 618 + len);
      c.lineWidth = 56; c.strokeStyle = INK; c.stroke(); c.lineWidth = 48; c.strokeStyle = coat; c.stroke();
      fillInk(c, () => blob(c, x1, 618 + len + 4, 24, 12, 1050 + side, 1, 8), coatD, 2.6, { rim: false });
    };
    sl(-1, 250, -6); sl(1, 220, 26);
    fillInk(c, () => smoothClosed(c, [
      [L - 14, 604], [bx - 34, 584], [bx, 616], [bx + 34, 584], [R + 14, 604], [R + 20, 700], [R + 12, 800], [bx + 10, 812], [L - 12, 800], [L - 20, 700]
    ].map((p, i) => [p[0] + jt(1060, i * 2, 2), p[1] + jt(1060, i * 2 + 1, 2)])), coat, 3.4, { rim: true, rimCol: 'rgba(110,90,70,.3)' });
    c.strokeStyle = 'rgba(43,34,51,.35)'; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(bx - 40, 640); c.quadraticCurveTo(bx - 50, 720, bx - 30, 790); c.moveTo(bx + 46, 650); c.quadraticCurveTo(bx + 56, 720, bx + 40, 790); c.stroke();
    fillInk(c, () => wrect(c, bx + 18, 715, 56, 52, 1070, 1.2, 30), coatD, 2.4, { rim: false });
    c.beginPath(); c.moveTo(bx + 50, 722); c.lineTo(bx + 52, 696); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4; c.strokeStyle = K('#4a7fc0', 0.35); c.stroke();
  }

  function room(c, S, t, mode, phi, winDraw) {
    const party = mode === 'party';
    const wallDK = party ? 0 : 0.55;
    // wall
    if (!party) { c.fillStyle = K('#cfd9d2', wallDK); c.fillRect(-1000, -600, 4000, 1400); }
    if (!party) {
      for (let i = 0; i < 8; i++) { c.globalAlpha = 0.5; c.fillStyle = i % 2 ? K('#b8c9c6', wallDK) : K('#d8cdb4', wallDK); c.beginPath(); blob(c, -100 + i * 300, 250 + (i % 3) * 140, 280, 200, 1100 + i, 5, 12); c.fill(); }
      c.globalAlpha = 1;
    }
    // floor
    c.fillStyle = party ? '#fff0c8' : K('#a98466', wallDK); c.beginPath(); wrect(c, -1000, 800, 4000, 1000, 1120, 3, 90); c.fill();
    if (party) {
      const b = Math.floor(A.beat(S));
      for (let r = 0; r < 4; r++) for (let q = -4; q < 20; q++) {
        const on = ((q + r + b) & 1) === 0;
        c.fillStyle = on ? 'rgba(255,100,170,.85)' : 'rgba(255,214,60,.8)';
        const y0 = 800 + r * r * 8 + r * 50, hh = 50 + r * 18;
        c.beginPath(); wrect(c, q * 140 - 30, y0, 130 + r * 10, hh - 4, 1130 + r * 40 + q, 1.5, 70); c.fill();
      }
    } else {
      c.strokeStyle = K('#5e4633', wallDK); c.globalAlpha = 0.5; c.lineWidth = 3;
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-1000, 850 + i * 60); c.lineTo(3000, 850 + i * 60 + jt(i, 3, 3)); c.stroke(); }
      c.globalAlpha = 1;
    }
    fillInk(c, () => wrect(c, -1000, 780, 4000, 36, 1121, 2, 100), K('#7c6a5a', party ? 0.45 : wallDK), 3, { rim: false });
    DK = 0.5;
    // window
    c.save();
    c.beginPath(); c.rect(WIN.x, WIN.y, WIN.w, WIN.h); c.clip();
    if (winDraw) winDraw(c);
    c.restore();
    const wf = () => { wrect(c, WIN.x - 28, WIN.y - 28, WIN.w + 56, WIN.h + 56, 1140, 2, 110); wrect(c, WIN.x + WIN.w, WIN.y, -WIN.w, WIN.h, 1141, 0, 110); };
    c.beginPath(); wf(); c.save(); c.fillStyle = K('#a88255'); c.fill('evenodd');
    c.clip('evenodd'); c.globalCompositeOperation = 'multiply'; c.lineWidth = 16; c.strokeStyle = 'rgba(70,40,30,.3)'; c.stroke(); c.restore();
    c.beginPath(); wf(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    fillInk(c, () => wrect(c, WIN.x - 44, WIN.y + WIN.h + 28, WIN.w + 88, 30, 1142, 2, 90), K('#b99464'), 3.4);
    c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 36;
    c.beginPath(); c.moveTo(WIN.x + 120, WIN.y + WIN.h); c.lineTo(WIN.x + 330, WIN.y); c.stroke();
    // plant on sill
    fillInk(c, () => wrect(c, WIN.x + 40, WIN.y + WIN.h - 40, 70, 68, 1150, 1.5, 40), K('#c1704f'), 3);
    for (let k = 0; k < 5; k++) fillInk(c, () => blob(c, WIN.x + 75 + (k - 2) * 20, WIN.y + WIN.h - 74 - (k % 2) * 16, 14, 40, 1160 + k, 1.2, 8, (k - 2) * 0.35), K('#6aa07a'), 2.6, { rim: false });
    // clock (stopped, no digits)
    if (!party) {
    fillInk(c, () => blob(c, 1120, 340, 62, 62, 1170, 1.4, 16), K('#efe6cf'), 3.4);
    c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round';
    for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; c.beginPath(); c.moveTo(1120 + Math.cos(a) * 49, 340 + Math.sin(a) * 49); c.lineTo(1120 + Math.cos(a) * 55, 340 + Math.sin(a) * 55); c.stroke(); }
    c.lineWidth = 4.5; c.beginPath(); c.moveTo(1120, 340); c.lineTo(1120 + 24, 340 - 20); c.moveTo(1120, 340); c.lineTo(1120 - 6, 340 + 38); c.stroke();
    }
    // rug island
    fillInk(c, () => blob(c, 1300, 1010, 400, 62, 1180, 3, 16), K('#a26a6a', party ? 0.4 : 0.5), 3.4);
    fillInk(c, () => blob(c, 1300, 1010, 310, 40, 1181, 2, 14), K('#bd8c80', party ? 0.4 : 0.5), 0, { rim: false });
    // desk
    const wood = K('#a37a4a'), woodD = K('#7e5b36');
    fillInk(c, () => wrect(c, 1060, 748, 780, 252, 1200, 2, 90), K('#2d2630', 0.2), 3, { rim: false });
    fillInk(c, () => wrect(c, 1010, 726, 910, 30, 1201, 2, 90), wood, 3.6);
    fillInk(c, () => wrect(c, 1020, 756, 50, 250, 1202, 1.6, 90), woodD, 3.4);
    fillInk(c, () => wrect(c, 1700, 756, 210, 250, 1203, 1.6, 90), woodD, 3.4);
    for (let k = 0; k < 3; k++) {
      fillInk(c, () => wrect(c, 1714, 770 + k * 78, 182, 68, 1210 + k, 1.2, 60), wood, 2.8, { rim: false });
      c.beginPath(); c.arc(1805, 804 + k * 78, 8, 0, 6.3); c.fillStyle = K('#d2b27a'); c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    }
    // monitor (asleep)
    fillInk(c, () => wrect(c, 1540, 690, 30, 38, 1220, 1, 40), K('#6c7a82'), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1490, 712, 130, 18, 1221, 1.2, 40), K('#6c7a82'), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1420, 520, 270, 176, 1222, 2, 70), K('#7d8c94'), 3.6);
    fillInk(c, () => wrect(c, 1436, 536, 238, 144, 1223, 1.6, 70), K('#17262d', 0.15), 0, { rim: false });
    c.strokeStyle = 'rgba(180,220,230,.12)'; c.lineWidth = 22; c.beginPath(); c.moveTo(1460, 676); c.lineTo(1540, 540); c.stroke();
    // lamp (off)
    fillInk(c, () => blob(c, 1100, 722, 54, 12, 1230, 1, 10), K('#59666e'), 3, { rim: false });
    c.lineCap = 'round'; c.beginPath(); c.moveTo(1100, 716); c.lineTo(1140, 580); c.lineTo(1185, 482);
    c.lineWidth = 14; c.strokeStyle = INK; c.stroke(); c.lineWidth = 8; c.strokeStyle = K('#7d8a92'); c.stroke();
    c.save(); c.translate(1195, 484); c.rotate(0.55);
    fillInk(c, () => smoothClosed(c, [[-58, 34], [-30, -10], [30, -12], [58, 34], [0, 44]].map((p, i) => [p[0] + jt(1240, i * 2, 1.5), p[1] + jt(1240, i * 2 + 1, 1.5)])), K('#5d6d63'), 3.4);
    fillInk(c, () => blob(c, 0, 40, 46, 9, 1241, 1, 10), K('#c9c2a4', 0.3), 2.4, { rim: false });
    c.restore();
    // mug
    fillInk(c, () => wrect(c, 1738, 668, 56, 60, 1250, 1.2, 30), K('#e9e0c8'), 3.2);
    c.beginPath(); c.arc(1800, 698, 15, -1.4, 1.4); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4; c.strokeStyle = K('#e9e0c8'); c.stroke();
    fillInk(c, () => blob(c, 1766, 670, 26, 6, 1251, 0.8, 8), K('#5a4033'), 2, { rim: false });
    // chair
    const sway = !party && t > T.human ? 16 * Math.sin((t - T.human) * 2.6) * Math.exp(-(t - T.human) * 0.5) : 0;
    shadow(c, 1300, 1012, 220, 24, 0.2);
    chairParts(c, S, t, phi, sway);
  }

  function zzz(c, S, t) {
    // sleeping computer cloud
    const alpha = A.seg(t, 6.2, 6.9);
    if (alpha <= 0) return;
    c.save(); c.globalAlpha = alpha;
    const bx = 1560, by = 420 + Math.sin(S * 0.9) * 4;
    c.fillStyle = 'rgba(240,235,220,.17)';
    c.beginPath(); [[0, 0, 62], [-52, 14, 42], [54, 16, 44], [-18, -34, 40], [30, -30, 38]].forEach(p => { c.moveTo(bx + p[0] + p[2], by + p[1]); c.arc(bx + p[0], by + p[1], p[2], 0, 6.3); }); c.fill();
    for (let k = 0; k < 3; k++) {
      const ph = ((S * 0.2 + k / 3) % 1), sz = 10 + k * 5 + ph * 6;
      const zx = bx - 24 + k * 22 + Math.sin(S * 1.2 + k) * 8, zy = by + 30 - ph * 150;
      c.save(); c.globalAlpha = alpha * Math.sin(Math.PI * ph);
      c.translate(zx, zy); c.rotate(-0.15 + 0.1 * k);
      c.beginPath(); c.moveTo(-sz, -sz); c.lineTo(sz, -sz); c.lineTo(-sz, sz); c.lineTo(sz, sz);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = sz * 0.5; c.strokeStyle = INK; c.stroke();
      c.lineWidth = sz * 0.28; c.strokeStyle = '#f3ead2'; c.stroke();
      c.restore();
    }
    c.restore();
  }

  function dust(c, S, t) {
    c.save();
    for (let i = 0; i < 46; i++) {
      const x0 = A.hash(i * 3) , y0 = A.hash(i * 3 + 1), sp = 0.01 + 0.02 * A.hash(i * 3 + 2);
      const x = 120 + ((x0 * 1500 + S * (6 + 8 * A.hash(i)) + Math.sin(S * 0.5 + i) * 30) % 1500);
      const y = 300 + ((y0 * 650 - S * sp * 220 + 650 * 10) % 650);
      const a = 0.22 + 0.3 * (0.5 + 0.5 * Math.sin(S * 1.1 + i * 1.7));
      c.fillStyle = `rgba(255,236,190,${a})`;
      c.beginPath(); c.arc(x, y, 1.6 + 2 * A.hash(i + 9), 0, 6.3); c.fill();
    }
    c.restore();
  }

  function hushShot(c, S, t) {
    const dimK = A.ease.out(A.seg(t, T.hush, T.hush + 0.3));
    const u = A.ease.inOut(A.seg(t, T.hush, 6.56));
    const z0 = 1920 / WIN.w, z = Math.exp(A.lerp(Math.log(z0), 0, u));
    const px = A.lerp(WIN.x + WIN.w / 2, 960, u), py = A.lerp(WIN.y + WIN.h / 2, 540, u);
    const slow = A.ease.smooth(A.seg(t, 6.56, T.drop));
    const push = 1 + 0.05 * slow + 0.05 * A.ease.in(A.seg(t, 8.25, T.drop));
    const qx = A.lerp(px, 1040, slow), qy = A.lerp(py, 600, slow);
    const phi = 0.8 * A.ease.inOut(A.seg(t, T.human, 8.5));
    c.save();
    c.translate(960, 540); c.scale(z * push, z * push); c.translate(-qx, -qy);
    room(c, S, t, 'hush', phi, cc => {
      // frozen crowd world, scaled into the glass
      cc.save();
      cc.translate(WIN.x, WIN.y); cc.scale(WIN.w / W, WIN.w / W);
      cc.beginPath(); cc.rect(0, 0, W, H); cc.clip();
      boardWorld(cc, 51.34, { dim: dimK * 0.4, lookT: t });
      cc.restore();
      cc.save(); cc.globalCompositeOperation = 'screen'; cc.fillStyle = 'rgba(255,230,160,.04)'; cc.fillRect(WIN.x, WIN.y, WIN.w, WIN.h); cc.restore();
    });
    // light from the window
    c.save(); c.globalCompositeOperation = 'screen';
    const lg = c.createLinearGradient(0, WIN.y + WIN.h, 0, 1080);
    lg.addColorStop(0, `rgba(255,214,140,${0.16 * dimK})`); lg.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(WIN.x, 770); c.lineTo(WIN.x + WIN.w, 770); c.lineTo(WIN.x + WIN.w + 420, 1080); c.lineTo(WIN.x + 150, 1080); c.closePath(); c.fill();
    c.restore();
    dust(c, S, t);
    zzz(c, S, t);
    c.restore();
    // cool dim, strongest at the edges
    c.save(); c.globalCompositeOperation = 'multiply';
    c.fillStyle = `rgba(${255 - 70 * dimK},${255 - 50 * dimK},${255 - 20 * dimK},1)`;
    c.fillRect(0, 0, W, H); c.restore();
  }

  // ---------- THE DROP ----------
  function party(c, S, t) {
    const dt = t - T.drop;
    // Post-drop the warp has slope 1, so dt is seconds since the vocal drop in the new song too.
    const Sq = S;
    // kick out at new 63.0: the beat clock freezes on a beat so the beans settle
    const Sb = Math.min(S, 54.13 + 15.52);
    const b = A.beat(Sb), f = b - Math.floor(b);
    const dKO = S - (54.13 + 15.52);
    const pul = dKO >= 0 ? Math.exp(-dKO * 4) : Math.exp(-f * 5);
    const lv = A.ease.smooth(A.seg(dt, 0, 6)), e1 = A.seg(dt, 7.9, 8.6), e2 = A.seg(dt, 12.4, 13.1);
    const hit = (tp, amp, k) => dt >= tp ? amp * Math.exp(-(dt - tp) * (k || 5)) : 0;
    const whip = hit(1.52, 0.17) + hit(7.92, 0.1) + hit(12.4, 0.14);
    const z = 1 + 0.03 * pul + 0.05 * lv + 0.012 * e1 + 0.016 * e2 + whip;
    const wob = (tp, amp) => dt >= tp ? amp * Math.exp(-(dt - tp) * 6) * Math.cos((dt - tp) * 18) : 0;
    const rot = 0.007 * Math.sin(b * Math.PI) + wob(1.52, 0.05) + wob(7.92, 0.025) + wob(12.4, 0.04);
    const shkAt = (tp, amp) => dt >= tp && dt < tp + 0.4 ? amp * Math.exp(-(dt - tp) * 9) : 0;
    const shk = shkAt(0, 14) + shkAt(1.52, 10) + shkAt(12.4, 8);
    // whoa-oh answer: the whole crowd answers each sung syllable
    let wA = 0, wk = 0, wPar = 0;
    [5, 6].forEach(li => {
      const ws = A.lines[li].words, w0 = ws[0].s - 0.1, w1 = ws[ws.length - 1].e + 0.15;
      if (S >= w0 && S <= w1) {
        wA = 1;
        ws.forEach((w, wi) => { if (S >= w.s) { const k = Math.exp(-(S - w.s) * 7); if (k > wk) { wk = k; wPar = wi; } } });
      }
    });
    c.save();
    c.translate(1430 + shk * Math.sin(dt * 90), 760 + shk * Math.cos(dt * 77)); c.rotate(rot); c.scale(z, z); c.translate(-1430, -760);

    // sunburst on the wall
    c.fillStyle = '#ffd0e0'; c.fillRect(-600, -600, 3200, 1500);
    const cxs = 860, cys = 440, nr = 22, rs = Sq * 0.28;
    for (let i = 0; i < nr; i++) {
      const a0 = rs + i / nr * 6.283, a1 = rs + (i + 0.5) / nr * 6.283;
      c.fillStyle = i % 2 ? 'rgba(255,214,46,.55)' : 'rgba(255,120,190,.5)';
      c.beginPath(); c.moveTo(cxs, cys); c.lineTo(cxs + Math.cos(a0) * 2600, cys + Math.sin(a0) * 2600); c.lineTo(cxs + Math.cos(a1) * 2600, cys + Math.sin(a1) * 2600); c.closePath(); c.fill();
    }
    glow(c, cxs, cys, 650, 'rgba(255,255,255,A)', 0.55);

    c.save(); c.translate(130, 0);
    const col2 = ['#2fb4ff', '#e5239b', '#ffd62e'];
    room(c, Sb, t, 'party', 0.8, cc => {
      const g = cc.createLinearGradient(0, WIN.y, 0, WIN.y + WIN.h);
      g.addColorStop(0, '#2a2f7a'); g.addColorStop(1, '#e5239b');
      cc.fillStyle = g; cc.fillRect(WIN.x, WIN.y, WIN.w, WIN.h);
      for (let k = 0; k < 4; k++) {
        const ph = ((Sq * 0.5 + k * 0.25) % 1), fx = WIN.x + 140 + k * 210, fy = WIN.y + 130 + (k % 2) * 90;
        cc.strokeStyle = col2[k % 3]; cc.lineWidth = 6; cc.lineCap = 'round'; cc.globalAlpha = 1 - ph;
        for (let r = 0; r < 12; r++) { const a = r / 12 * 6.283; cc.beginPath(); cc.moveTo(fx + Math.cos(a) * ph * 40, fy + Math.sin(a) * ph * 40); cc.lineTo(fx + Math.cos(a) * (ph * 80 + 20), fy + Math.sin(a) * (ph * 80 + 20)); cc.stroke(); }
        cc.globalAlpha = 1;
      }
    });
    c.restore();

    // streamers from the top
    c.save();
    const ns = 5 + Math.round(5 * lv) + Math.round(3 * e1 + 3 * e2);
    for (let i = 0; i < ns; i++) {
      const x0 = (i + 0.5) / ns * 1900 - 80, ph = Sq * 2 + i;
      c.strokeStyle = HOT[i % 6]; c.lineWidth = 10 + (i % 3) * 3; c.lineCap = 'round'; c.globalAlpha = 0.9;
      c.beginPath(); c.moveTo(x0, -20);
      for (let k = 1; k <= 8; k++) c.lineTo(x0 + Math.sin(ph + k * 0.7) * 34 * (k / 3), -20 + k * (46 + 14 * (i % 3)));
      c.stroke();
    }
    c.restore();
    // disco ball and moving light spots
    {
      const bx = 1740, by = 190 + 6 * Math.sin(Sq * 2);
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(bx, -20); c.lineTo(bx, by - 78); c.stroke();
      fillInk(c, () => blob(c, bx, by, 78, 78, 2000, 1.6, 16), '#c9d6e8', 3.6, {
        inside: cc => {
          cc.strokeStyle = 'rgba(43,34,51,.35)'; cc.lineWidth = 2;
          for (let k = -3; k <= 3; k++) { cc.beginPath(); cc.ellipse(bx, by, Math.abs(Math.cos(k * 0.45 + Sq * 1.3)) * 78 + 1, 78, 0, 0, 6.3); cc.stroke(); }
          for (let k = -3; k <= 3; k++) { cc.beginPath(); cc.moveTo(bx - 78, by + k * 22); cc.lineTo(bx + 78, by + k * 22); cc.stroke(); }
          cc.fillStyle = 'rgba(255,255,255,.7)'; cc.beginPath(); cc.ellipse(bx - 24, by - 26, 16, 22, -0.5, 0, 6.3); cc.fill();
        }
      });
      for (let k = 0; k < 14; k++) {
        const a = Sq * 0.6 + k * 0.45, cl = HOT[k % 6], d = 340 + 520 * A.hash(k + 77);
        glow(c, bx + Math.cos(a) * d * 1.5 - 500, by + 430 + Math.sin(a * 1.3) * 300, 70 + 30 * A.hash(k), hexA(cl), 0.5 * (0.5 + 0.5 * pul));
      }
    }
    // chair gets coloured light only
    {
      const cl = HOT[Math.floor(b / 2 + 4) % 3 === 0 ? 0 : (Math.floor(b / 2) % 3 === 1 ? 2 : 1)];
      glow(c, 1430, 800, 420, hexA(cl), 0.14 + 0.1 * pul);
    }

    // dancing rows
    const bs = CROWD.party;
    bs.order.forEach(i => {
      const ta = bs.ta[i];
      const p = A.seg(dt, ta, ta + 0.28); if (p <= 0) return;
      const ph = (bs.row[i] % 2) * 0.5, ff = (b + ph) - Math.floor(b + ph);
      const jump = Math.sin(Math.PI * ff) * 36 * bs.s[i] * (1 + lv * 0.4 + 0.15 * e2) + wk * 34 * bs.s[i] * (0.6 + 0.4 * bs.h[i]);
      const sy = (1 - 0.2 * Math.exp(-ff * 9) + 0.1 * Math.sin(Math.PI * ff)) * (0.4 + 0.6 * A.ease.back(p));
      const arms = wA ? 1 : Math.min(1, Math.sin(Math.PI * ff) * 1.4);
      const sway = Math.sin(b * Math.PI + bs.h[i] * 6) * 0.07;
      cheap(c, bs.x[i], bs.y[i] - jump, bs.s[i], BHOT[bs.col[i]], sy, Math.sin(b * 1.5 + i) * 0.5, sway, { arms, happy: ff < 0.5, mouth: true, antenna: i % 7 === 0 ? '#ffd62e' : undefined, band: i % 5 === 2 ? '#e5239b' : undefined });
    });
    // the hero, front and centre
    {
      const ph = 0, ff = b - Math.floor(b), jump = Math.sin(Math.PI * ff) * 100 + wk * 40;
      const sy = 1 - 0.22 * Math.exp(-ff * 9) + 0.12 * Math.sin(Math.PI * ff);
      shadow(c, 640, 1040, 90 - jump * 0.3, 14, 0.3);
      const ak = Math.max(wA, dKO > 0 ? A.ease.out(A.seg(dKO, 0.1, 0.5)) : 0, Math.min(1, Math.sin(Math.PI * ff) * 1.5));
      const lean = wA ? 0.14 * (wPar % 2 ? -1 : 1) * (0.5 + 0.5 * wk) : 0;
      bean(c, 640, 1040 - jump, 2.55, {
        id: 11, col: PAL.tomato, sy, armL: A.lerp(2.0, -2.3, ak), armR: A.lerp(1.14, -0.84, ak),
        eyes: 'happy', mouth: 'grin', antenna: '#ffd62e', band: '#ffd62e', bulb: pul, sway: Math.sin(b * Math.PI), rot: Math.sin(b * Math.PI) * 0.08 + lean
      });
    }
    // confetti
    {
      const nc = 70 + Math.round(120 * lv) + (dt > 1.52 ? 40 : 0) + Math.round(50 * e1 + 70 * e2);
      for (let i = 0; i < nc; i++) {
        const x = (A.hash(i * 3) * 2200 - 150 + Math.sin(Sq * 2 + i) * 30);
        const sp = 140 + 160 * A.hash(i * 3 + 1);
        const y = ((A.hash(i * 3 + 2) * 1300 + Sq * sp) % 1300) - 110;
        c.save(); c.translate(x, y); c.rotate(Sq * (2 + 3 * A.hash(i)) + i); c.scale(1, Math.sin(Sq * 6 + i));
        c.fillStyle = HOT[i % 7]; c.fillRect(-7, -4, 14, 8);
        c.lineWidth = 1.6; c.strokeStyle = INK; c.strokeRect(-7, -4, 14, 8); c.restore();
      }
    }
    // beat flash
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,240,200,${0.1 * pul})`; c.fillRect(-100, -100, 2200, 1300); c.restore();
    c.restore();

    // lyrics, huge, in screen space
    const lits = ['#2fb4ff', '#d8503b', '#e5239b', '#ffd62e', '#2fb4ff', '#8be04a', '#d8503b'];
    const fade2 = 1;
    const p1 = A.seg(S, 54.13, 54.25);
    lyric(c, S, 3, [[0, 1, 2, 3], [4, 5, 6]], 176, 215, 190, ['#ffd62e', '#2fb4ff', '#e5239b', '#ffd62e', '#8be04a', '#2fb4ff', '#d8503b'],
      { sticker: true, beat: true, tilt: 0.02, popAt: 54.1, popDur: 0.05, dim: '#efe3c8', out: 1.55 });
    lyric(c, S, 4, [[0, 1, 2, 3], [4, 5, 6]], 176, 215, 190, lits, { sticker: true, beat: true, tilt: 0.02, dim: '#efe3c8', popDur: 0.1, popAt: A.lines[4].words[0].s - 0.05, out: 1.9 });
    const lw = A.lines;
    const whoaRows = [[0, 1, 2, 3], [4, 5, 6]];
    const whoaCols = ['#2fb4ff', '#e5239b', '#ffd62e', '#8be04a', '#ff8a3d', '#2fb4ff', '#e5239b'];
    lyric(c, S, 5, whoaRows, 176, 215, 190, whoaCols, { sticker: true, beat: true, tilt: 0.03, dim: '#efe3c8', popDur: 0.1, pop: 0.32, popDecay: 7, out: -0.05 });
    lyric(c, S, 6, whoaRows, 176, 215, 190, whoaCols, { sticker: true, beat: true, tilt: 0.03, dim: '#efe3c8', popDur: 0.1, popAt: lw[6].words[0].s - 0.28, pop: 0.32, popDecay: 7, out: -0.05 });
    lyric(c, S, 7, [[0, 1, 2], [3, 4, 5, 6]], 176, 215, 190, ['#ffd62e', '#e5239b', '#2fb4ff', '#8be04a', '#ff8a3d', '#ffd62e', '#e5239b'], { sticker: true, tilt: 0.02, dim: '#efe3c8', popDur: 0.08, popAt: lw[7].words[0].s - 0.05, pop: 0.28, keep: true });

    // flash: paper white, then colour
    const fl = dt < 0 ? 0 : (dt < 0.034 ? 1 : 0.45 * (1 - A.seg(dt, 0.034, 0.09))) + (dt >= 1.52 ? 0.3 * Math.exp(-(dt - 1.52) * 9) : 0) + (dt >= 7.92 ? 0.15 * Math.exp(-(dt - 7.92) * 9) : 0) + (dt >= 12.4 ? 0.22 * Math.exp(-(dt - 12.4) * 9) : 0);
    if (fl > 0) { c.save(); c.fillStyle = `rgba(255,252,240,${fl})`; c.fillRect(0, 0, W, H); c.restore(); }
  }

  // ---------- main ----------
  function post(c) {
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(960, 540, 480, 960, 540, 1250);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,84,60,.42)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
  }

  function scraps(c, S, t) {
    for (let i = 0; i < 30; i++) {
      const xs = A.hash(i * 11) * 2000 - 40, ti = 2.3 + (xs + 400) / 2800 * 0.6 + 0.05;
      const k = t - ti; if (k <= 0) continue;
      const y0 = 80 + A.hash(i * 11 + 1) * 800, rest = 960 + A.hash(i * 11 + 2) * 70;
      const y = Math.min(rest, y0 + 900 * k * k);
      const land = y >= rest;
      const col = [PAL.teal2, PAL.ochre, PAL.rose, PAL.sage, '#e8dbb8', PAL.tomato][i % 6];
      const w = 26 + 40 * A.hash(i * 11 + 3), h = 16 + 26 * A.hash(i * 11 + 4);
      c.save(); c.translate(xs, y); c.rotate(land ? A.hash(i + 5) * 0.8 - 0.4 : k * (3 + 4 * A.hash(i)));
      if (i % 5 === 0) { fillInk(c, () => blob(c, 0, 0, 9, 9, 1300 + i, 1, 8), col, 2.4, { rim: false }); }
      else fillInk(c, () => wrect(c, -w / 2, -h / 2, w, h, 1300 + i, 1.4, 30), col, 2.6, { rim: false });
      c.restore();
    }
  }

  window.SCENE = {
    init(api) {
      A = api;
      // paper grain tile
      const g = document.createElement('canvas'); g.width = g.height = 512;
      const gc = g.getContext('2d'), id = gc.createImageData(512, 512), r = api.rng(77);
      for (let i = 0; i < 512 * 512; i++) {
        const n = r(), v = 255 - Math.round(n * n * 30);
        id.data[i * 4] = v; id.data[i * 4 + 1] = v - 2; id.data[i * 4 + 2] = v - 6; id.data[i * 4 + 3] = 255;
      }
      gc.putImageData(id, 0, 0);
      for (let i = 0; i < 380; i++) {
        const x = 20 + r() * 470, y = 20 + r() * 470, a = r() * 6.28, L = 6 + r() * 16;
        gc.strokeStyle = `rgba(110,80,50,${0.03 + r() * 0.05})`; gc.lineWidth = 1;
        gc.beginPath(); gc.moveTo(x, y); gc.quadraticCurveTo(x + Math.cos(a) * L, y + Math.sin(a) * L, x + Math.cos(a + 0.5) * L * 1.6, y + Math.sin(a + 0.5) * L * 1.6); gc.stroke();
      }
      for (let i = 0; i < 26; i++) {
        const x = 90 + r() * 330, y = 90 + r() * 330, rr = 40 + r() * 70;
        const gr = gc.createRadialGradient(x, y, 0, x, y, rr);
        gr.addColorStop(0, 'rgba(150,110,70,.045)'); gr.addColorStop(1, 'rgba(150,110,70,0)');
        gc.fillStyle = gr; gc.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
      GRAIN = g;

      // crowd: positions, spawn times (inverse of api.count), draw order
      const N = 1200, cc = api.cues, cr = api.rng(2024);
      const cnt = { sx: [], sy: [], sc: [], col: [], h: [], ts: [], order: [] };
      for (let i = 0; i < N; i++) {
        const tt = i / N, th = i * 2.39996, rad = Math.sqrt(tt);
        let x = 960 + Math.cos(th) * rad * 1250 + (cr() - 0.5) * 40, y = 960 + Math.sin(th) * rad * 220 + (cr() - 0.5) * 30;
        if (i === 1) { x = 700; y = 880; }
        if (i === 2) { x = 1200; y = 900; }
        y = Math.max(790, y);
        cnt.sx.push(x); cnt.sy.push(y); cnt.sc.push(0.52 + 0.55 * (y - 780) / 420); cnt.col.push(Math.floor(cr() * BEANCOLS.length)); cnt.h.push(cr());
        // spawn time: smallest S where the continuous count reaches i + 1
        const target = Math.log(i + 1) / Math.log(cc.countValue);
        let lo = 0, hi = 1;
        for (let q = 0; q < 24; q++) { const m = (lo + hi) / 2, e = api.ease.smooth(m) * 0.9 + 0.1 * m; if (e < target) lo = m; else hi = m; }
        cnt.ts.push(cc.countFrom + hi * (cc.countTo - cc.countFrom) - 0.05);
      }
      cnt.order = Array.from({ length: N }, (_, i) => i).sort((a, b) => cnt.sy[a] - cnt.sy[b] || a - b);

      // party crowd
      const rows = [{ y: 1040, s: 1.2, n: 8 }, { y: 975, s: 1.06, n: 10 }, { y: 915, s: 0.94, n: 12 }, { y: 862, s: 0.84, n: 14 }, { y: 816, s: 0.74, n: 16 }, { y: 776, s: 0.66, n: 18 }, { y: 748, s: 0.6, n: 22 }];
      const bp = { x: [], y: [], s: [], col: [], h: [], ta: [], row: [], order: [] };
      let idx = 0;
      rows.forEach((rw, ri) => {
        for (let j = 0; j < rw.n; j++) {
          const th = api.hash(500 + idx), x = -20 + (j + 0.5 + (ri % 2) * 0.35) / (rw.n + 0.4) * 1330 + (api.hash(idx) - 0.5) * 30;
          bp.x.push(x); bp.y.push(rw.y + (api.hash(idx + 7) - 0.5) * 12); bp.s.push(rw.s * (0.92 + 0.16 * api.hash(idx + 3)));
          bp.col.push(Math.floor(api.hash(idx + 11) * 6.99)); bp.h.push(api.hash(idx + 13)); bp.row.push(ri);
          bp.ta.push(ri >= 6 ? [4.3, 7.9, 12.4][Math.floor(th * 2.99)] + th * 0.3 : (th < 0.45 ? -0.13 : (th < 0.8 ? (th - 0.45) * 6 : 1.52 + (th - 0.8) * 2.5)));
          idx++;
        }
      });
      bp.order = Array.from({ length: idx }, (_, i) => i).sort((a, b) => bp.y[a] - bp.y[b] || a - b);
      cnt.party = bp;
      CROWD = cnt;
    },

    draw(c, S, api) {
      A = api; F = Math.floor(S * 12 + 1e-6);
      const t = S - api.t0;
      c.fillStyle = PAPER; c.fillRect(0, 0, W, H);
      const lyr = (li, rows, size, y0, lh, lits, o) => lyric(c, S, li, rows, size, y0, lh, lits, o);
      if (t < 2.95) {
        serverRoom(c, S, t);
        if (t > 2.3) brushWipe(c, A.lerp(-420, 2420, A.ease.smooth(A.seg(t, 2.22, 2.85))), 31);
        lyr(0, [[0, 1, 2, 3, 4]], 128, 205, 0, ['#f0c24a', '#e99aa8', '#8cc7a1', '#f0c24a', '#ff8f6b'], { popAt: 45.5, out: 0 });
        if (t > 1.45) {
          const w4 = A.lines[0].words[4];
          if (t < 2.4) { /* "yeah" gets an extra painted pulse via the lettering pop */ }
        }
      }
      if (t >= 2.4 && t < T.hush) {
        if (t >= 2.5 && t < 3.9) scraps(c, S, t);
        if (t >= 3.3 && t < 3.8) {
          c.save(); c.beginPath(); bandsPath(c, A.lerp(-420, 2420, A.ease.out(A.seg(t, 3.3, 3.75))), 57); c.clip();
          boardWorld(c, S);
          c.restore();
        } else if (t >= 3.8) {
          boardWorld(c, S);
        }
        if (t < 3.3) { /* blank paper: scraps only */ }
        // line 2 across the top
        const tc = t < 3.3 ? ['#d8503b', '#2a6c72', '#d9993a', '#d9728a'] : ['#d8503b', '#2a6c72', '#d9993a', '#d9728a'];
        lyr(1, [[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10]], 96, 140, 112, tc, { dim: 'rgba(250,244,226,.7)', keep: true, popAt: 47.7 });
      }
      if (t >= T.hush && t < T.drop) {
        hushShot(c, S, t);
        lyr(2, [[0, 1, 2, 3]], 104, 185, 0, ['#ffe9a8', '#ffe9a8', '#ff9fb2', '#ffe9a8'], { dim: "rgba(246,236,212,.4)", out: -0.1 });
        if (S >= 53.96) {
          // "Yeah," arrives as a pickup in the same place it will hold after the cut
          const w = A.lines[3].words[0], k = A.ease.back(A.seg(S, 53.96, 54.0));
          const sc = (1 + 0.3 * Math.exp(-Math.max(0, S - w.s) * 9)) * k;
          c.save(); c.globalAlpha = 1;
          lyric(c, S, 3, [[0, 1, 2, 3], [4, 5, 6]], 176, 215, 190, ['#ffe9a8'], { sticker: true, popAt: 53.96, show: (wi) => wi === 0, dim: '#efe3c8', tilt: 0.02, popDur: 0.1 });
          c.restore();
        }
      }
      if (t >= T.drop) party(c, S, t);
      post(c);
    }
  };
})();
