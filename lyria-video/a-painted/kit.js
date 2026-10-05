// Style A drawing kit, "painted stage": warm gouache/watercolour picture-book pieces extracted from fragment.js.
// Classic script, exposes window.KIT. Every function is a pure function of its arguments:
// no Math.random/Date, no state between frames. Jitter ("boil") is a hash of (seed, floor(S*12)), so pass opts.S.
// If a piece gets no S it draws still (frame 0), which is still deterministic.
(function () {
  'use strict';
  const W = 1920, H = 1080, TAU = Math.PI * 2;
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
  const BEAT = 0.5108, ANCHOR = 54.13;

  // ---------- palettes ----------
  // bg = wall/base colour, ink = outline colour, paper = light text/note colour, accent / accent2 = the two
  // signature colours of the mode, dim = secondary wall tint (used for the washes), floor = ground colour,
  // dk = how far lit objects are pulled toward navy (0 bright .. .55 night), vig = vignette colour at the edges,
  // lits = colours the sung lyric word cycles through, glass = what shows through a window.
  const MODES = {
    night: { bg: '#0d2b33', ink: INK, paper: '#f6ecd4', accent: '#d9993a', accent2: '#2b7f84', dim: '#164650', floor: '#0a2127', dk: 0.55, vig: 'rgba(4,16,24,.6)', lits: ['#f0c24a', '#e99aa8', '#8cc7a1', '#ff8f6b'], glass: 'night', dark: true },
    teal: { bg: '#1f5d66', ink: INK, paper: '#f6ecd4', accent: '#d9993a', accent2: '#8cc7a1', dim: '#2b7f84', floor: '#143f47', dk: 0.3, vig: 'rgba(6,22,30,.5)', lits: ['#f0c24a', '#e99aa8', '#8cc7a1', '#ff8f6b'], glass: 'night', dark: true },
    dawn: { bg: '#f1dcae', ink: INK, paper: '#fbf2d8', accent: '#d8503b', accent2: '#d9993a', dim: '#e8c68a', floor: '#c9a574', dk: 0.05, vig: 'rgba(120,84,60,.42)', lits: ['#d8503b', '#2a6c72', '#d9993a', '#d9728a'], glass: 'dawn' },
    day: { bg: '#f0dfba', ink: INK, paper: '#faf3df', accent: '#d8503b', accent2: '#2b7f84', dim: '#dcc596', floor: '#3b7f7c', dk: 0, vig: 'rgba(120,84,60,.42)', lits: ['#d8503b', '#2a6c72', '#d9993a', '#d9728a'], glass: 'day' },
    dusk: { bg: '#dcb585', ink: INK, paper: '#f4e6c8', accent: '#d8503b', accent2: '#a86b3a', dim: '#c28e62', floor: '#7a5a48', dk: 0.2, vig: 'rgba(70,40,40,.5)', lits: ['#d8503b', '#2a6c72', '#ecc87c', '#d9728a'], glass: 'dusk' },
    party: { bg: '#ffd0e0', ink: INK, paper: '#fff6df', accent: '#e5239b', accent2: '#ffd62e', dim: '#ffb0d0', floor: '#fff0c8', dk: 0.1, vig: 'rgba(150,50,90,.3)', lits: ['#ffd62e', '#2fb4ff', '#e5239b', '#8be04a', '#d8503b'], glass: 'party', sticker: true },
    'party-night': { bg: '#3a1745', ink: INK, paper: '#fff0e6', accent: '#ff4fb0', accent2: '#ffd62e', dim: '#5a2268', floor: '#2a1034', dk: 0.3, vig: 'rgba(24,6,34,.55)', lits: ['#ffd62e', '#2fb4ff', '#ff4fb0', '#8be04a', '#ff8a3d'], glass: 'party', sticker: true, dark: true },
    grey: { bg: '#cfcbc0', ink: INK, paper: '#ece8dc', accent: '#ff8a3d', accent2: '#8d897f', dim: '#b9b5aa', floor: '#9d998f', dk: 0.1, vig: 'rgba(70,66,60,.45)', lits: ['#ff8a3d', '#6d6a63', '#ff8a3d', '#8d897f'], glass: 'grey' },
    gold: { bg: '#f6dc9a', ink: INK, paper: '#fff4d2', accent: '#d9993a', accent2: '#ecc87c', dim: '#f0c874', floor: '#c89a5c', dk: 0, vig: 'rgba(150,100,40,.38)', lits: ['#d8503b', '#2a6c72', '#d9993a', '#d9728a'], glass: 'gold' },
    ink: { bg: '#17141c', ink: INK, paper: '#f6ecd4', accent: '#ff8a3d', accent2: '#d9a07a', dim: '#241f2b', floor: '#100e14', dk: 0.6, vig: 'rgba(0,0,0,.6)', lits: ['#ff8a3d', '#f6ecd4', '#ff8a3d', '#d9a07a'], glass: 'night', dark: true }
  };
  const pal = m => MODES[m] || MODES.day;

  // ---------- state-free helpers (F is rewritten at the top of every piece) ----------
  let F = 0;
  const useS = S => { F = S === undefined ? 0 : Math.floor(S * 12 + 1e-6); };
  function h1(n) { let h = (n | 0) * 2654435761 >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return (h >>> 0) / 4294967296; }
  const hz = (id, i) => h1(id * 977 + i * 131 + F * 7919);
  const jt = (id, i, amt) => (hz(id, i) - 0.5) * 2 * amt;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (x, a, b) => clamp((x - a) / (b - a));
  const eOut = k => 1 - Math.pow(1 - k, 3);
  const eIn = k => k * k * k;
  const eSmooth = k => k * k * (3 - 2 * k);
  const eBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  const beat = S => (S - ANCHOR) / BEAT;
  const pulse = (S, k = 5) => { const b = beat(S); return Math.exp(-(b - Math.floor(b)) * k); };
  function boil(S, seed, fps) { return h1(seed * 7919 + Math.floor(S * (fps || 12)) * 131) * 2 - 1; }

  function rgbOf(h) {
    if (h[0] === '#') return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const m = /(\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(h);
    return m ? [+m[1], +m[2], +m[3]] : [128, 128, 128];
  }
  function mix(a, b, k) {
    const A = rgbOf(a), B = rgbOf(b);
    return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`;
  }
  const NAVY = '#102238';
  const K = (h, k) => mix(h, NAVY, k);
  const tone = (h, mode, f) => mix(h, NAVY, pal(mode).dk * (f === undefined ? 0.65 : f));
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const rgba = (h, a) => { const r = rgbOf(h); return `rgba(${r[0]},${r[1]},${r[2]},${a})`; };

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
      const a = i / n * TAU;
      const x = Math.cos(a) * rx + jt(id, 2 * i, amt), y = Math.sin(a) * ry + jt(id, 2 * i + 1, amt);
      p.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    }
    smoothClosed(c, p);
  }
  function wrect(c, x, y, w, h, id, amt, step) {
    amt = amt === undefined ? 2 : amt; step = step || 46;
    const nx = Math.max(1, Math.round(Math.abs(w) / step)), ny = Math.max(1, Math.round(Math.abs(h) / step));
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
  // col: hex or an 'rgba(r,g,b,A)' template; A is replaced by a
  function glow(c, x, y, r, col, a, comp) {
    if (col[0] === '#') col = rgba(col, 'A');
    c.save(); c.globalCompositeOperation = comp || 'screen';
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  }
  function shadow(c, x, y, rx, ry, a) {
    c.save(); c.fillStyle = `rgba(10,5,20,${a === undefined ? 0.32 : a})`;
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); c.restore();
  }
  function wobLine(c, x1, y1, x2, y2, S, seed, amp, segs) {
    amp = amp === undefined ? 3 : amp; segs = segs || 7;
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    c.beginPath();
    for (let i = 0; i <= segs; i++) {
      const k = i / segs, w = (i === 0 || i === segs) ? 0 : boil(S || 0, seed + i, 12) * amp;
      const x = x1 + dx * k + nx * w, y = y1 + dy * k + ny * w;
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
  function wobRect(c, x, y, w, h, S, seed, amp) {
    wobLine(c, x, y, x + w, y, S, seed, amp); wobLine(c, x + w, y, x + w, y + h, S, seed + 11, amp);
    wobLine(c, x + w, y + h, x, y + h, S, seed + 23, amp); wobLine(c, x, y + h, x, y, S, seed + 37, amp);
  }
  // hand-lettered word with ink outline. align centre.
  function letter(c, text, x, y, size, fill, o) {
    o = o || {};
    c.save();
    c.font = size + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
    if (o.sticker) { c.lineWidth = size * 0.3; c.strokeStyle = '#fff6df'; c.strokeText(text, x, y); }
    c.lineWidth = size * (o.sticker ? 0.12 : 0.1); c.strokeStyle = INK; c.strokeText(text, x, y);
    c.fillStyle = fill; c.fillText(text, x, y);
    c.restore();
  }

  // ---------- frame (background) and post (grain + vignette) ----------
  let GRAIN = null;
  function grainTile() {
    if (GRAIN) return GRAIN;
    const g = document.createElement('canvas'); g.width = g.height = 512;
    const gc = g.getContext('2d'), id = gc.createImageData(512, 512);
    let a = 77 + 0x6D2B79F5;
    const r = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let i = 0; i < 512 * 512; i++) {
      const n = r(), v = 255 - Math.round(n * n * 30);
      id.data[i * 4] = v; id.data[i * 4 + 1] = v - 2; id.data[i * 4 + 2] = v - 6; id.data[i * 4 + 3] = 255;
    }
    gc.putImageData(id, 0, 0);
    for (let i = 0; i < 380; i++) {
      const x = 20 + r() * 470, y = 20 + r() * 470, an = r() * 6.28, L = 6 + r() * 16;
      gc.strokeStyle = `rgba(110,80,50,${0.03 + r() * 0.05})`; gc.lineWidth = 1;
      gc.beginPath(); gc.moveTo(x, y); gc.quadraticCurveTo(x + Math.cos(an) * L, y + Math.sin(an) * L, x + Math.cos(an + 0.5) * L * 1.6, y + Math.sin(an + 0.5) * L * 1.6); gc.stroke();
    }
    for (let i = 0; i < 26; i++) {
      const x = 90 + r() * 330, y = 90 + r() * 330, rr = 40 + r() * 70;
      const gr = gc.createRadialGradient(x, y, 0, x, y, rr);
      gr.addColorStop(0, 'rgba(150,110,70,.045)'); gr.addColorStop(1, 'rgba(150,110,70,0)');
      gc.fillStyle = gr; gc.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    GRAIN = g; return g;
  }
  function post(c, mode) {
    const P = pal(mode);
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.fillStyle = c.createPattern(grainTile(), 'repeat'); c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(960, 540, 480, 960, 540, 1250);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, P.vig);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
  }
  // paper + gouache wall: base colour with soft translucent blobs of the dim tone. Static (no S).
  function frame(c, mode) {
    useS();
    const P = pal(mode);
    c.fillStyle = P.bg; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) {
      c.globalAlpha = 0.55; c.fillStyle = i % 2 ? P.dim : mix(P.dim, P.bg, 0.45);
      c.beginPath(); blob(c, 80 + i * 250, 260 + (i % 3) * 150, 300, 230, 100 + i, 7, 12); c.fill();
    }
    c.globalAlpha = 1;
    return P;
  }
  // ground: painted floor band from y down, with a skirting board
  function floor(c, mode, o) {
    o = o || {}; useS();
    const P = pal(mode), y = o.y === undefined ? 800 : o.y;
    const col = o.color || P.floor;
    c.fillStyle = col; c.beginPath(); wrect(c, -60, y, W + 120, H - y + 80, 1120, 3, 90); c.fill();
    if (o.planks !== false) {
      c.strokeStyle = rgba(INK, 0.22); c.lineWidth = 3; c.lineCap = 'round';
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-20, y + 50 + i * 60); c.lineTo(W + 20, y + 50 + i * 60 + jt(i, 3, 3)); c.stroke(); }
    }
    if (o.skirting !== false) fillInk(c, () => wrect(c, -60, y - 22, W + 120, 36, 1121, 2, 100), K(mix(col, '#ffffff', 0.12), P.dk * 0.5), 3, { rim: false });
  }
  function rug(c, x, y, w, o) {
    o = o || {}; useS(o.S);
    const m = o.mode;
    fillInk(c, () => blob(c, x, y, w / 2, w * 0.075, 1180, 3, 16), K(o.color || '#a26a6a', pal(m).dk * 0.8), 3.4);
    fillInk(c, () => blob(c, x, y, w * 0.39, w * 0.048, 1181, 2, 14), K('#bd8c80', pal(m).dk * 0.8), 0, { rim: false });
  }

  // ---------- caption (the lyric) ----------
  // bottom zone only (roughly y 900..1080). Words are cream, the sung word lights up in a mode colour.
  function caption(c, line, S, api, mode) {
    post(c, mode);
    if (!line) return;
    useS(S);
    const P = pal(mode), ws = line.words, n = ws.length;
    const w0 = ws[0].s - 0.35, wEnd = ws[n - 1].e;
    const appear = seg(S, w0, w0 + 0.22);
    const shrink = 1 - eIn(seg(S, wEnd + 0.2, wEnd + 0.5));
    if (appear <= 0.001 || shrink <= 0.02) return;
    // scrim keeps the lettering readable over busy pictures
    c.save();
    const sg = c.createLinearGradient(0, 880, 0, H);
    sg.addColorStop(0, 'rgba(20,12,28,0)'); sg.addColorStop(1, `rgba(20,12,28,${(P.dark ? 0.32 : 0.2) * appear * shrink})`);
    c.fillStyle = sg; c.fillRect(0, 880, W, 200);
    c.restore();
    let size = 84;
    const gapF = 0.42;
    c.save();
    c.textBaseline = 'alphabetic'; c.textAlign = 'center'; c.lineJoin = 'round';
    const measure = sz => { c.font = sz + 'px ' + FONT; return ws.map(w => c.measureText(w.w).width); };
    let widths = measure(size);
    const sumOf = (arr, g) => arr.reduce((a, b) => a + b, 0) + g * (arr.length - 1);
    let rows = [ws.map((_, i) => i)];
    let tot = sumOf(widths, size * gapF);
    if (tot > 1728 / 0.72 && n >= 5) {
      size = 70; widths = measure(size);
      let acc = 0, split = 1; const half = sumOf(widths, size * gapF) / 2;
      for (let i = 0; i < n; i++) { acc += widths[i] + size * gapF; if (acc >= half) { split = Math.max(1, Math.min(n - 1, i + 1)); break; } }
      rows = [ws.slice(0, split).map((_, i) => i), ws.slice(split).map((_, i) => i + split)];
    }
    const gap = size * gapF;
    const baseY = rows.length === 1 ? 1006 : 962;
    const lh = size * 1.0;
    rows.forEach((r, ri) => {
      const rw = sumOf(r.map(i => widths[i]), gap);
      const fit = Math.min(1, 1728 / rw);
      let x = 960 - rw * fit / 2;
      const y = baseY + ri * lh;
      r.forEach(wi => {
        const w = ws[wi], wd = widths[wi] * fit, cx = x + wd / 2;
        x += (widths[wi] + gap) * fit;
        const since = S - w.s, sung = since >= 0;
        const sc = (sung ? 1 + 0.14 * Math.exp(-since * 9) : 1) * (0.7 + 0.3 * eBack(appear)) * shrink;
        const hop = sung ? -size * 0.2 * Math.sin(Math.PI * seg(S, w.s, w.s + 0.32)) : 0;
        const rot = (h1(900 + wi * 3 + n * 40) - 0.5) * 0.05;
        const lit = P.lits[wi % P.lits.length];
        const wp = api.wordProgress(w, S);
        c.save();
        c.globalAlpha = appear;
        c.translate(cx, y + hop); c.rotate(rot); c.scale(fit * sc, fit * sc);
        c.font = size + 'px ' + FONT;
        if (P.sticker) { c.lineWidth = size * 0.3; c.strokeStyle = '#fff6df'; c.strokeText(w.w, 0, 0); }
        c.lineWidth = size * (P.sticker ? 0.12 : 0.1); c.strokeStyle = INK; c.strokeText(w.w, 0, 0);
        c.fillStyle = sung ? '#fbf3dc' : (P.dark ? 'rgba(246,236,212,.55)' : 'rgba(251,243,220,.78)'); c.fillText(w.w, 0, 0);
        if (wp > 0) {
          const half = widths[wi] / 2;
          wash(c, lit, 0.35, () => blob(c, 0, -size * 0.28, half * Math.min(1, wp * 2.2) * 0.9, size * 0.34, wi + 50 + n * 20, 4, 10));
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

  // ---------- beans ----------
  function autoBlink(S, seed) {
    if (!S) return 0;
    const per = 2.6 + 1.7 * h1(seed * 13 + 1), ph = (S + h1(seed * 13 + 2) * per) % per;
    return ph < 0.15 ? Math.sin(Math.PI * ph / 0.15) : 0;
  }
  // size = body height in px (about 88 at scale 1). (x,y) = FEET centre (origin:'center' = body centre).
  // squash > 0 flattens (wider), < 0 stretches (taller); the foot point stays put.
  function bean(c, x, y, size, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S;
    const s = size / 88, seed = o.seed === undefined ? 1 : o.seed, id = seed;
    const hero = !!o.hero, acc = o.acc || {};
    let col = o.body || (hero ? PAL.tomato : PAL.teal2);
    if (o.drain) col = mix(col, '#8c8a88', o.drain);
    const sy = 1 - (o.squash || 0), sx = Math.pow(sy, -0.6);
    const mood = o.mood || 'smile';
    const look = o.look || 0, lookY = o.lookY || 0;
    const lw = 2.6;
    c.save();
    c.translate(x, o.origin === 'center' ? y + 46 * s : y);
    if (o.tilt) c.rotate(o.tilt);
    c.scale(sx * s * (o.flip ? -1 : 1), sy * s);

    // arms
    let nL = 'down', nR = 'down';
    if (Array.isArray(o.arm)) { nL = o.arm[0]; nR = o.arm[1]; }
    else if (o.arm === 'wave' || o.arm === 'point') nR = o.arm;
    else if (o.arm) nL = nR = o.arm;
    const angR = nm => {
      if (nm === 'up') return -0.84;
      if (nm === 'wave') return -0.75 + 0.5 * Math.sin(S * 13 + seed);
      if (nm === 'point') return 0.08 + (o.pointUp || 0);
      return 1.14;
    };
    const aL = o.armL !== undefined ? o.armL : Math.PI - angR(nL);
    const aR = o.armR !== undefined ? o.armR : angR(nR);
    const arm = (sg, a, len) => {
      const sxp = sg * 29, syp = -44;
      c.lineCap = 'round';
      c.beginPath(); c.moveTo(sxp, syp); c.lineTo(sxp + Math.cos(a) * len, syp + Math.sin(a) * len);
      c.lineWidth = 13; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 8; c.strokeStyle = col; c.stroke();
    };
    if (acc.cape) {
      const fl = Math.sin(S * 7 + seed) * 6 + boil(S, seed + 5) * 4;
      c.beginPath(); c.moveTo(-26, -76); c.quadraticCurveTo(-58 - fl, -40, -66 - fl * 1.5, 2); c.lineTo(66 + fl * 1.5, 2); c.quadraticCurveTo(58 + fl, -40, 26, -76); c.closePath();
      c.fillStyle = acc.cape; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
    }
    const holding = nL === 'hold' || nR === 'hold';
    if (!holding) { arm(-1, aL, nL === 'point' ? 34 : 26); arm(1, aR, nR === 'point' ? 34 : 26); }
    // legs
    const wl = o.walk ? Math.sin(S * 11 + seed) : 0;
    const leg = (lxp, lift) => fillInk(c, () => blob(c, lxp, -7 - Math.max(0, lift) * 7, 10, 8, id * 3 + (lxp > 0 ? 1 : 0), 0.8, 8), col, lw, { rim: false });
    leg(-15, wl); leg(15, -wl);
    // antenna
    if (hero || o.antenna) {
      const sw = o.sway !== undefined ? o.sway : Math.sin(S * 5 + seed) * 0.5;
      const bulb = o.bulb !== undefined ? o.bulb : (hero ? pulse(S, 4) : 0);
      c.beginPath(); c.moveTo(0, -84); c.quadraticCurveTo(sw * 5, -100, sw * 12, -116);
      c.lineWidth = 3.2; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(sw * 12, -121, 7 + bulb * 3, 0, TAU);
      c.fillStyle = typeof o.antenna === 'string' ? o.antenna : '#f0c24a'; c.fill(); c.lineWidth = 2.4; c.stroke();
      if (bulb > 0.05) glow(c, sw * 12, -121, 26, '#ffe08a', 0.55 * bulb);
    }
    // body
    const band = o.band === false ? null : (o.band || (hero ? '#f6ecd4' : null));
    fillInk(c, () => blob(c, 0, -46, 34, 42, id, 1.5, 13, 0.05), col, lw, {
      rimW: 9,
      inside: cc => {
        if (band) {
          cc.beginPath(); cc.moveTo(-40, -72); cc.quadraticCurveTo(0, -66, 40, -72);
          cc.lineWidth = 9; cc.strokeStyle = band; cc.stroke();
        }
        cc.fillStyle = 'rgba(255,255,255,.2)';
        cc.beginPath(); cc.ellipse(-12, -64, 9, 16, -0.4, 0, TAU); cc.fill();
        cc.fillStyle = 'rgba(255,246,220,.28)';
        cc.beginPath(); cc.ellipse(3, -24, 20, 13, 0, 0, TAU); cc.fill();
      }
    });

    // face
    const ex = 12, ey = -58 + lookY * 3, lx = look;
    const blink = o.blink !== undefined ? o.blink : (mood === 'asleep' ? 0 : autoBlink(S, seed));
    c.fillStyle = 'rgba(230,90,110,.45)';
    c.beginPath(); c.arc(-21 + lx * 3, -46, 6.5, 0, TAU); c.moveTo(27.5 + lx * 3, -46); c.arc(21 + lx * 3, -46, 6.5, 0, TAU); c.fill();
    const eyeDot = (px, r) => {
      c.fillStyle = INK; c.beginPath(); c.ellipse(px, ey, r, r * (1 - blink * 0.85), 0, 0, TAU); c.fill();
      if (!blink) { c.fillStyle = '#fff'; c.beginPath(); c.arc(px + 1.8, ey - 1.8, 1.7, 0, TAU); c.fill(); }
    };
    const eyeArc = (px, up) => {
      c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round';
      c.beginPath();
      if (up) c.arc(px, ey + 2, 5.5, Math.PI * 1.1, Math.PI * 1.9); else c.arc(px, ey - 2, 5.5, Math.PI * 0.1, Math.PI * 0.9);
      c.stroke();
    };
    const brow = (px, sg, tilt, raise) => {
      c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round';
      c.beginPath(); c.moveTo(px - 7 * sg - 0, ey - 11 - raise + tilt * sg * -1); c.lineTo(px + 7 * sg, ey - 11 - raise - tilt * sg * -1); c.stroke();
    };
    const mouth = (m, mx) => {
      if (m === 'grin') {
        c.beginPath(); c.moveTo(-10 + mx, -45); c.quadraticCurveTo(mx, -28, 10 + mx, -45); c.closePath();
        c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke();
        c.fillStyle = '#e8737f'; c.beginPath(); c.ellipse(mx, -34, 4.5, 2.6, 0, 0, TAU); c.fill();
      } else if (m === 'o') {
        c.beginPath(); c.ellipse(mx, -38, 6, 8, 0, 0, TAU); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = INK; c.stroke();
      } else if (m === 'smile') {
        c.beginPath(); c.moveTo(-7 + mx, -42); c.quadraticCurveTo(mx, -34, 7 + mx, -42); c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      } else if (m === 'frown') {
        c.beginPath(); c.moveTo(-8 + mx, -37); c.quadraticCurveTo(-3 + mx, -43, 0 + mx, -39); c.quadraticCurveTo(4 + mx, -35, 8 + mx, -40);
        c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      } else if (m === 'tiny') {
        c.beginPath(); c.ellipse(mx, -39, 3 + 1.2 * Math.sin(S * 2.2 + seed), 3.4, 0, 0, TAU); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      } else {
        c.beginPath(); c.moveTo(-6 + mx, -39); c.lineTo(6 + mx, -39); c.lineWidth = 3; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      }
    };
    const faceFor = m => {
      const mx = lx * 4;
      const e1 = -ex + lx * 5, e2 = ex + lx * 5;
      if (m === 'grin' || m === 'smile' || m === 'flat') {
        if (!acc.shades) { eyeDot(e1, 5); eyeDot(e2, 5); }
        mouth(m, mx);
      } else if (m === 'gasp') {
        if (!acc.shades) { eyeDot(e1, 6.6); eyeDot(e2, 6.6); }
        brow(e1, 1, 0, 4); brow(e2, -1, 0, 4);
        mouth('o', mx);
      } else if (m === 'worry') {
        if (!acc.shades) { eyeDot(e1, 5); eyeDot(e2, 5); }
        brow(e1, 1, 3, 1); brow(e2, -1, 3, 1);
        mouth('frown', mx);
      } else if (m === 'asleep') {
        eyeArc(e1, false); eyeArc(e2, false);
        mouth('tiny', mx);
      } else if (m === 'wink') {
        eyeDot(e1, 5); eyeArc(e2, true);
        mouth('grin', mx);
      } else if (m === 'happy') {
        eyeArc(e1, true); eyeArc(e2, true);
        mouth('grin', mx);
      }
    };
    if (mood === 'split') {
      c.save(); c.beginPath(); c.rect(-100, -140, 100, 180); c.clip(); faceFor('grin'); c.restore();
      c.save(); c.beginPath(); c.rect(0, -140, 100, 180); c.clip(); faceFor('worry');
      c.fillStyle = 'rgba(70,90,140,.22)'; c.beginPath(); blob(c, 0, -46, 34, 42, id, 1.5, 13, 0.05); c.fill(); c.restore();
      c.strokeStyle = 'rgba(43,34,51,.35)'; c.lineWidth = 2; c.setLineDash([4, 5]);
      c.beginPath(); c.moveTo(0, -86); c.lineTo(0, -6); c.stroke(); c.setLineDash([]);
    } else faceFor(mood);

    // accessories
    if (acc.glasses) {
      c.lineWidth = 2.6; c.strokeStyle = INK;
      for (const sg of [-1, 1]) { c.beginPath(); c.arc(sg * ex + lx * 5, ey, 9.5, 0, TAU); c.fillStyle = 'rgba(255,255,255,.35)'; c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(-ex + 9.5 + lx * 5, ey); c.lineTo(ex - 9.5 + lx * 5, ey); c.stroke();
    }
    if (acc.shades) {
      c.fillStyle = '#1c1822'; c.lineWidth = 2.4; c.strokeStyle = INK; c.lineJoin = 'round';
      for (const sg of [-1, 1]) { c.beginPath(); c.roundRect(sg * ex + lx * 5 - 10.5, ey - 6.5, 21, 14, 5); c.fill(); c.stroke(); }
      c.beginPath(); c.moveTo(-ex + 10.5 + lx * 5, ey - 2); c.lineTo(ex - 10.5 + lx * 5, ey - 2); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath();
      for (const sg of [-1, 1]) { c.moveTo(sg * ex + lx * 5 - 6, ey - 3); c.lineTo(sg * ex + lx * 5 - 2, ey - 3); }
      c.stroke();
    }
    if (acc.mustache) {
      const mc = typeof acc.mustache === 'string' ? acc.mustache : '#5a3a28';
      const mx = lx * 4;
      for (const sg of [-1, 1]) fillInk(c, () => {
        c.moveTo(mx, -47); c.quadraticCurveTo(mx + sg * 9, -54, mx + sg * 19, -45); c.quadraticCurveTo(mx + sg * 22, -41, mx + sg * 17, -40);
        c.quadraticCurveTo(mx + sg * 10, -45, mx, -43); c.closePath();
      }, mc, 2, { rim: false });
    }
    if (acc.tie) {
      const tc = typeof acc.tie === 'string' ? acc.tie : acc.tie.col, ts = typeof acc.tie === 'string' ? 1 : (acc.tie.size || 1);
      c.save(); c.translate(0, -29); c.scale(ts, ts);
      fillInk(c, () => { c.moveTo(-3, 18); c.lineTo(-8, 38); c.lineTo(0, 46); c.lineTo(8, 38); c.lineTo(3, 18); c.closePath(); }, tc, 2.2, { rim: false });
      fillInk(c, () => { c.moveTo(-6, 4); c.lineTo(6, 4); c.lineTo(4, 16); c.lineTo(-4, 16); c.closePath(); }, tc, 2.2, { rim: false });
      c.restore();
    }
    if (acc.battery !== undefined && acc.battery !== false) {
      const lv = clamp(acc.battery), low = lv < 0.3, flash = low ? (Math.sin(S * 9) > 0 ? 1 : 0.35) : 1;
      c.save(); c.translate(0, -17);
      fillInk(c, () => c.roundRect(-15, -7, 30, 14, 3), '#f6ecd4', 2.2, { rim: false });
      c.fillStyle = INK; c.fillRect(15, -3, 3.5, 6);
      c.globalAlpha = flash; c.fillStyle = low ? PAL.tomato : (lv < 0.6 ? PAL.straw : PAL.sage);
      c.beginPath(); c.roundRect(-12.5, -4.5, Math.max(2, 25 * lv), 9, 2); c.fill(); c.restore();
    }
    if (acc.badge) {
      c.save(); c.translate(-20, -27); c.rotate(-0.1);
      fillInk(c, () => c.roundRect(-11, -9, 23, 18, 3), typeof acc.badge === 'string' ? acc.badge : '#fbf3dc', 2, { rim: false });
      c.strokeStyle = 'rgba(43,34,51,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, -2); c.lineTo(7, -2); c.moveTo(-7, 4); c.lineTo(3, 4); c.stroke();
      c.restore();
    }
    if (acc.hardhat) {
      const hc = typeof acc.hardhat === 'string' ? acc.hardhat : '#f2c230';
      fillInk(c, () => { c.moveTo(-31, -78); c.quadraticCurveTo(-30, -108, 0, -108); c.quadraticCurveTo(30, -108, 31, -78); c.closePath(); }, hc, 2.6, { rim: false });
      fillInk(c, () => c.roundRect(-38, -82, 76, 9, 4), mix(hc, '#a06a10', 0.25), 2.4, { rim: false });
      c.strokeStyle = 'rgba(43,34,51,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -107); c.lineTo(0, -83); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(-13, -96, 5, 9, -0.4, 0, TAU); c.fill();
    }
    if (holding) {
      for (const sg of [-1, 1]) {
        c.lineCap = 'round'; c.beginPath(); c.moveTo(sg * 29, -44); c.lineTo(sg * 10, -26);
        c.lineWidth = 13; c.strokeStyle = INK; c.stroke(); c.lineWidth = 8; c.strokeStyle = col; c.stroke();
      }
    }
    c.restore();
  }

  // cheap crowd bean: two or three fills, no wobble.
  function cheap(c, x, y, s, col, sy, look, tilt, o) {
    const sx = Math.pow(sy, -0.6);
    const rx = 31 * s * sx, ry = 41 * s * sy, cy = y - 44 * s * sy;
    c.fillStyle = col;
    c.beginPath(); c.ellipse(x, cy, rx, ry, tilt || 0, 0, TAU); c.fill();
    c.lineWidth = Math.max(1.6, 2.6 * s); c.strokeStyle = INK; c.stroke();
    const ey = cy - 12 * s * sy, ex = 11 * s * sx, lo = (look || 0) * 5 * s;
    const md = o.mood;
    c.lineCap = 'round';
    if (md === 'asleep') {
      c.lineWidth = Math.max(1.6, 2.8 * s); c.beginPath();
      c.arc(x - ex + lo, ey - 2 * s, 5 * s, 0.1 * Math.PI, 0.9 * Math.PI); c.moveTo(x + ex + lo + 5 * s * Math.cos(0.1 * Math.PI), ey - 2 * s + 5 * s * Math.sin(0.1 * Math.PI));
      c.arc(x + ex + lo, ey - 2 * s, 5 * s, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
    } else if (o.happy) {
      c.lineWidth = Math.max(1.8, 3 * s); c.beginPath();
      c.arc(x - ex + lo, ey + 2 * s, 5 * s, 3.5, 5.9); c.moveTo(x + ex + lo + 5 * s * Math.cos(3.5), ey + 2 * s + 5 * s * Math.sin(3.5));
      c.arc(x + ex + lo, ey + 2 * s, 5 * s, 3.5, 5.9); c.stroke();
    } else {
      const r = md === 'gasp' ? 6.4 * s : 5 * s;
      c.fillStyle = INK; c.beginPath();
      c.arc(x - ex + lo, ey, r, 0, TAU); c.moveTo(x + ex + lo + r, ey); c.arc(x + ex + lo, ey, r, 0, TAU); c.fill();
    }
    if (md === 'worry') {
      c.lineWidth = Math.max(1.4, 2.4 * s); c.strokeStyle = INK; c.beginPath();
      c.moveTo(x - ex + lo - 6 * s, ey - 9 * s); c.lineTo(x - ex + lo + 5 * s, ey - 13 * s);
      c.moveTo(x + ex + lo + 6 * s, ey - 9 * s); c.lineTo(x + ex + lo - 5 * s, ey - 13 * s); c.stroke();
    }
    c.fillStyle = 'rgba(240,100,120,.42)';
    c.beginPath(); c.arc(x - 20 * s * sx + lo * 0.5, cy + 2 * s, 5 * s, 0, TAU); c.moveTo(x + 20 * s * sx + lo * 0.5 + 5 * s, cy + 2 * s); c.arc(x + 20 * s * sx + lo * 0.5, cy + 2 * s, 5 * s, 0, TAU); c.fill();
    const mx = lo * 0.6;
    if (md === 'grin' || md === 'dance' || o.mouth) {
      c.beginPath(); c.moveTo(x - 8 * s + mx, cy + 2 * s); c.quadraticCurveTo(x + mx, cy + 16 * s, x + 8 * s + mx, cy + 2 * s); c.closePath();
      c.fillStyle = '#5a1d2c'; c.fill();
    } else if (md === 'gasp') {
      c.beginPath(); c.ellipse(x + mx, cy + 8 * s, 4.5 * s, 6 * s, 0, 0, TAU); c.fillStyle = '#5a1d2c'; c.fill();
    } else if (md === 'worry') {
      c.lineWidth = Math.max(1.4, 2.4 * s); c.strokeStyle = INK; c.beginPath(); c.moveTo(x - 6 * s + mx, cy + 9 * s); c.quadraticCurveTo(x + mx, cy + 4 * s, x + 6 * s + mx, cy + 9 * s); c.stroke();
    } else if (md === 'flat') {
      c.lineWidth = Math.max(1.4, 2.4 * s); c.strokeStyle = INK; c.beginPath(); c.moveTo(x - 5 * s + mx, cy + 7 * s); c.lineTo(x + 5 * s + mx, cy + 7 * s); c.stroke();
    } else if (md !== 'asleep') {
      c.lineWidth = Math.max(1.4, 2.4 * s); c.strokeStyle = INK; c.beginPath(); c.moveTo(x - 5 * s + mx, cy + 5 * s); c.quadraticCurveTo(x + mx, cy + 10 * s, x + 5 * s + mx, cy + 5 * s); c.stroke();
    }
    if (o.arms !== undefined && o.arms !== null) {
      const a = o.arms; // 0 down .. 1 up
      for (const sg of [-1, 1]) {
        const ang = sg < 0 ? Math.PI - (1.14 - 2.08 * a) : (1.14 - 2.08 * a);
        const x0 = x + sg * 29 * s * sx, y0 = cy + 2 * s * sy, L = 27 * s;
        c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + Math.cos(ang) * L, y0 + Math.sin(ang) * L);
        c.lineWidth = 12 * s; c.strokeStyle = INK; c.stroke();
        c.lineWidth = 7.5 * s; c.strokeStyle = col; c.stroke();
      }
    }
    if (o.antenna) {
      c.beginPath(); c.moveTo(x, cy - ry); c.lineTo(x + 4 * s, cy - ry - 24 * s);
      c.lineWidth = 3 * s; c.strokeStyle = INK; c.stroke();
      c.beginPath(); c.arc(x + 4 * s, cy - ry - 28 * s, 6.5 * s, 0, TAU); c.fillStyle = o.antenna; c.fill(); c.lineWidth = 2 * s; c.stroke();
    }
    if (o.band) {
      c.save(); c.beginPath(); c.ellipse(x, cy, rx, ry, tilt || 0, 0, TAU); c.clip();
      c.beginPath(); c.moveTo(x - rx, cy - ry * 0.42); c.lineTo(x + rx, cy - ry * 0.46);
      c.lineWidth = 8 * s; c.strokeStyle = o.band; c.stroke(); c.restore();
    }
  }

  // rows of cheap beans from back (y) to front (y+h). (x,y,w,h) = the ground patch the feet stand on.
  // o: { n, rows, seed, S, mood: smile|grin|gasp|worry|flat|asleep|dance, look, target:{x}, scale, bounce 0..1,
  //      palette:[hex], reveal 0..1, drain 0..1, hero: true|{x,y,size,mood,...bean opts}, antennas 0..1 }
  function crowd(c, o) {
    useS(o.S);
    const S = o.S === undefined ? 0 : o.S;
    const n = o.n || 40, rows = Math.max(1, o.rows || Math.max(1, Math.round(Math.sqrt(n * o.h / o.w * 1.5))));
    const seed = o.seed || 1, mood = o.mood || 'smile';
    const perRow = Math.ceil(n / rows);
    const pal0 = o.palette || (mood === 'dance' ? BHOT : BEANCOLS);
    const auto = clamp((o.w / perRow) / 58, 0.18, 3);
    const base = o.scale || auto;
    const bounce = o.bounce === undefined ? 1 : o.bounce;
    const b = beat(S);
    const dance = mood === 'dance';
    let i = 0;
    for (let r = 0; r < rows && i < n; r++) {
      const dep = rows > 1 ? r / (rows - 1) : 1;
      const yr = o.y + (rows > 1 ? o.h * dep : o.h);
      const sr = base * (0.78 + 0.22 * dep);
      const cnt = Math.min(perRow, n - i);
      for (let j = 0; j < cnt; j++, i++) {
        const hh = h1(seed * 4001 + i * 7 + 1);
        let vis = 1;
        if (o.reveal !== undefined) { const th = hh * 0.85; const p = seg(o.reveal, th, th + 0.15); if (p <= 0) continue; vis = eBack(p); }
        const bx = o.x + (j + 0.5 + (r % 2) * 0.4 - 0.2) / cnt * o.w + (h1(seed * 4001 + i * 7 + 2) - 0.5) * 0.35 * (o.w / cnt);
        const by = yr + (h1(seed * 4001 + i * 7 + 3) - 0.5) * Math.min(14, o.h / rows * 0.3);
        const ph = b + hh * 0.3, f = ph - Math.floor(ph);
        let sy = 1 - bounce * (0.09 * Math.exp(-f * 7) - 0.03 * Math.sin(Math.PI * f));
        let jump = 0, arms;
        if (dance) { jump = Math.sin(Math.PI * f) * 36 * sr * bounce; sy = 1 - bounce * (0.2 * Math.exp(-f * 9) - 0.1 * Math.sin(Math.PI * f)); arms = Math.min(1, Math.sin(Math.PI * f) * 1.4); }
        sy *= 0.4 + 0.6 * vis;
        let look = o.look || 0;
        if (o.target) look = clamp((o.target.x - bx) / 420, -1, 1);
        const col = pal0[Math.floor(h1(seed * 4001 + i * 7 + 4) * pal0.length * 0.999)];
        cheap(c, bx, by - jump, sr * (0.35 + 0.65 * vis), o.drain ? mix(col, '#8c8a88', o.drain) : col, sy, look, dance ? Math.sin(b * Math.PI + hh * 6) * 0.07 : look * 0.1, {
          mood: mood === 'dance' ? 'grin' : mood, happy: dance && f < 0.5, arms,
          antenna: hh < (o.antennas === undefined ? 0.1 : o.antennas) ? PAL.straw : undefined,
          band: h1(seed * 4001 + i * 7 + 5) < 0.12 ? '#f6ecd4' : undefined
        });
      }
    }
    if (o.hero) {
      const hr = o.hero === true ? {} : o.hero;
      bean(c, hr.x !== undefined ? hr.x : o.x + o.w / 2, hr.y !== undefined ? hr.y : o.y + o.h + 30, hr.size || base * 150,
        Object.assign({ hero: true, S: o.S, mood: dance ? 'happy' : 'smile', arm: dance ? 'up' : 'down' }, hr, { size: undefined }));
    }
  }

  // ---------- place pieces ----------
  // s = chair height (back top to floor); (x,y) = floor centre under the chair.
  function chair(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const mode = o.mode, dk = pal(mode).dk, k = s / 430;
    const phi = o.phi === undefined ? 0.45 : o.phi, sway = o.sway || 0;
    const cx = 1300, cs = Math.cos(phi), sn = Math.sin(phi), kw = 0.6 + 0.4 * Math.abs(cs);
    c.save(); c.translate(x, y); c.scale(k, k); c.translate(-1300, -1012);
    const T = (h, f) => K(h, dk * f);
    const col = T('#4f6b7a', 0.65), colL = T('#6a8796', 0.65), dkc = T('#35505d', 0.65);
    const tips = [];
    for (let q = 0; q < 5; q++) { const a = phi + q * TAU / 5; tips.push({ x: cx + Math.cos(a) * 120, y: 1000 + Math.sin(a) * 24 }); }
    tips.sort((a, b) => a.y - b.y);
    c.lineCap = 'round';
    tips.forEach(p => {
      c.beginPath(); c.moveTo(cx, 970); c.lineTo(p.x, p.y); c.lineWidth = 17; c.strokeStyle = INK; c.stroke();
      c.lineWidth = 11; c.strokeStyle = dkc; c.stroke();
    });
    tips.forEach(p => { fillInk(c, () => blob(c, p.x, p.y + 12, 14, 13, 1000 + Math.round(p.x), 0.8, 8), '#2a2f36', 2.4, { rim: false }); });
    fillInk(c, () => wrect(c, cx - 11, 880, 22, 100, 1010, 1, 50), dkc, 2.6, { rim: false });
    const srx = 112 * (0.7 + 0.3 * Math.abs(cs));
    fillInk(c, () => blob(c, cx, 872, srx, 30, 1020, 1.4, 14), dkc, 3);
    fillInk(c, () => blob(c, cx, 856, srx, 30, 1021, 1.4, 14), colL, 3.2);
    const bx = cx + sn * 58, bw = 206 * kw;
    c.beginPath(); c.moveTo(cx, 850); c.quadraticCurveTo((cx + bx) / 2, 830, bx, 800); c.lineWidth = 24; c.strokeStyle = INK; c.stroke(); c.lineWidth = 17; c.strokeStyle = dkc; c.stroke();
    fillInk(c, () => wrect(c, bx - bw / 2, 585, bw, 235, 1030, 2, 50), col, 3.6);
    wash(c, '#9fb8c4', 0.5, () => wrect(c, bx - bw / 2 + 14, 600, bw * 0.3, 190, 1031, 2, 60));
    if (o.coat !== false) {
      const L = bx - bw / 2, R = bx + bw / 2, coat = T('#efe7d2', 0.5), coatD = T('#d5cab0', 0.5);
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
      c.beginPath(); c.moveTo(bx + 50, 722); c.lineTo(bx + 52, 696); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4; c.strokeStyle = T('#4a7fc0', 0.65); c.stroke();
    }
    if (o.confetti) {
      const nn = Math.round(46 * clamp(o.confetti));
      for (let q = 0; q < nn; q++) {
        const onSeat = q % 3 === 0;
        const px = onSeat ? cx + (h1(q * 5 + 1) - 0.5) * 190 : bx + (h1(q * 5 + 2) - 0.5) * 220;
        const py = onSeat ? 846 + (h1(q * 5 + 3) - 0.5) * 20 : 590 + h1(q * 5 + 4) * 210;
        c.save(); c.translate(px, py); c.rotate(h1(q * 5 + 5) * TAU); c.scale(1, 0.5 + 0.5 * h1(q + 9));
        c.fillStyle = HOT[q % 7]; c.fillRect(-8, -5, 16, 10); c.lineWidth = 1.8; c.strokeStyle = INK; c.strokeRect(-8, -5, 16, 10); c.restore();
      }
    }
    c.restore();
  }

  // s = lamp height (base to top of shade). (x,y) = base centre. on = 0..1 brightness.
  function lamp(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, k = s / 250, on = o.on === true ? 1 : (o.on || 0);
    c.save(); c.translate(x, y); c.scale(k, k); c.translate(-1100, -722);
    const T = h => K(h, dk * 0.65);
    if (on > 0.01 && o.cone !== false) {
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = `rgba(255,214,130,${0.2 * on})`;
      c.beginPath(); c.moveTo(1160, 520); c.lineTo(1235, 500); c.lineTo(1235 + (o.reach || 520) * 0.7, 722 + 90); c.lineTo(1050 - (o.reach || 520) * 0.2, 722 + 90); c.closePath(); c.fill(); c.restore();
      glow(c, 1195, 520, 240, 'rgba(255,214,130,A)', 0.55 * on);
    }
    fillInk(c, () => blob(c, 1100, 722, 54, 12, 1230, 1, 10), T('#59666e'), 3, { rim: false });
    c.lineCap = 'round'; c.beginPath(); c.moveTo(1100, 716); c.lineTo(1140, 580); c.lineTo(1185, 482);
    c.lineWidth = 14; c.strokeStyle = INK; c.stroke(); c.lineWidth = 8; c.strokeStyle = T('#7d8a92'); c.stroke();
    c.save(); c.translate(1195, 484); c.rotate(0.55);
    fillInk(c, () => smoothClosed(c, [[-58, 34], [-30, -10], [30, -12], [58, 34], [0, 44]].map((p, i) => [p[0] + jt(1240, i * 2, 1.5), p[1] + jt(1240, i * 2 + 1, 1.5)])), on > 0.01 ? mix(T('#5d6d63'), '#e8b45a', on * 0.7) : T('#5d6d63'), 3.4);
    fillInk(c, () => blob(c, 0, 40, 46, 9, 1241, 1, 10), on > 0.01 ? mix('#c9c2a4', '#fff0b0', on) : T('#c9c2a4'), 2.4, { rim: false });
    c.restore();
    c.restore();
  }

  // s = screen width. (x,y) = bottom centre of the stand. on 0..1, face: 'sleep'|'smile'|null, color = screen light
  function monitor(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, dk = pal(o.mode).dk, k = s / 270, on = o.on === true ? 1 : (o.on || 0);
    const T = (h, f) => K(h, dk * (f === undefined ? 0.65 : f));
    c.save(); c.translate(x, y); c.scale(k, k); c.translate(-1555, -730);
    fillInk(c, () => wrect(c, 1540, 690, 30, 38, 1220, 1, 40), T('#6c7a82'), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1490, 712, 130, 18, 1221, 1.2, 40), T('#6c7a82'), 2.6, { rim: false });
    fillInk(c, () => wrect(c, 1420, 520, 270, 176, 1222, 2, 70), T('#7d8c94'), 3.6);
    const screen = on > 0.01 ? mix('#17262d', o.color || '#7fd3e8', on * 0.85) : T('#17262d', 0.25);
    fillInk(c, () => wrect(c, 1436, 536, 238, 144, 1223, 1.6, 70), screen, 0, { rim: false });
    if (o.face) {
      c.strokeStyle = on > 0.01 ? INK : 'rgba(160,210,220,.55)'; c.lineWidth = 6; c.lineCap = 'round';
      c.beginPath();
      if (o.face === 'sleep') { c.arc(1505, 596, 14, 0.1 * Math.PI, 0.9 * Math.PI); c.moveTo(1633, 596); c.arc(1618, 596, 14, 0.1 * Math.PI, 0.9 * Math.PI); }
      else { c.arc(1505, 596, 13, 1.15 * Math.PI, 1.85 * Math.PI); c.moveTo(1631, 596); c.arc(1618, 596, 13, 1.15 * Math.PI, 1.85 * Math.PI); }
      c.stroke();
      c.beginPath();
      if (o.face === 'sleep') c.ellipse(1562, 640, 6, 5 + Math.sin(S * 2) * 1.5, 0, 0, TAU); else { c.moveTo(1540, 630); c.quadraticCurveTo(1562, 656, 1584, 630); }
      c.stroke();
    }
    if (on > 0.01) glow(c, 1555, 608, 330, rgba(o.color || '#7fd3e8', 'A'), 0.28 * on);
    c.strokeStyle = 'rgba(180,220,230,.12)'; c.lineWidth = 22; c.beginPath(); c.moveTo(1460, 676); c.lineTo(1540, 540); c.stroke();
    const led = o.led !== undefined ? o.led : (on > 0.01 ? 0 : 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(S * 1.6)));
    if (led > 0.01) { c.fillStyle = `rgba(255,140,90,${led})`; c.beginPath(); c.arc(1668, 689, 4.5, 0, TAU); c.fill(); glow(c, 1668, 689, 26, 'rgba(255,140,90,A)', 0.5 * led); }
    c.restore();
  }

  // s = desk width. (x,y) = top-left corner of the tabletop. open = top drawer pulled out 0..1. mug: draws the mug
  function desk(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, k = s / 910, open = o.open || 0;
    const T = (h, f) => K(h, dk * (f === undefined ? 0.65 : f));
    const wood = T('#a37a4a'), woodD = T('#7e5b36');
    c.save(); c.translate(x, y); c.scale(k, k); c.translate(-1010, -726);
    fillInk(c, () => wrect(c, 1060, 748, 780, 252, 1200, 2, 90), K('#2d2630', dk * 0.3), 3, { rim: false });
    fillInk(c, () => wrect(c, 1010, 726, 910, 30, 1201, 2, 90), wood, 3.6);
    fillInk(c, () => wrect(c, 1020, 756, 50, 250, 1202, 1.6, 90), woodD, 3.4);
    fillInk(c, () => wrect(c, 1700, 756, 210, 250, 1203, 1.6, 90), woodD, 3.4);
    if (o.drawers !== false) for (let q = 0; q < 3; q++) {
      const dx = q === 0 ? -150 * open : 0;
      if (q === 0 && open > 0.02) fillInk(c, () => wrect(c, 1714, 770, 182, 68, 1219, 1, 60), K('#1d1620', 0), 0, { rim: false });
      fillInk(c, () => wrect(c, 1714 + dx, 770 + q * 78, 182, 68, 1210 + q, 1.2, 60), wood, 2.8, { rim: false });
      c.beginPath(); c.arc(1805 + dx, 804 + q * 78, 8, 0, TAU); c.fillStyle = T('#d2b27a'); c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    }
    if (o.mug) {
      fillInk(c, () => wrect(c, 1738, 668, 56, 60, 1250, 1.2, 30), T('#e9e0c8'), 3.2);
      c.beginPath(); c.arc(1800, 698, 15, -1.4, 1.4); c.lineWidth = 9; c.strokeStyle = INK; c.stroke(); c.lineWidth = 4; c.strokeStyle = T('#e9e0c8'); c.stroke();
      fillInk(c, () => blob(c, 1766, 670, 26, 6, 1251, 0.8, 8), T('#5a4033'), 2, { rim: false });
    }
    c.restore();
  }

  function glassView(c, v, x, y, w, h, S, light) {
    if (v === 'night') {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#0a2230'); g.addColorStop(1, '#1b4a58');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      glow(c, x + w * 0.72, y + h * 0.3, w * 0.38, 'rgba(244,232,192,A)', 0.25);
      fillInk(c, () => blob(c, x + w * 0.72, y + h * 0.3, w * 0.085, w * 0.085, 301, 2, 14), '#f4e8c0', 3);
      wash(c, '#d8c58a', 0.4, () => blob(c, x + w * 0.705, y + h * 0.34, w * 0.028, w * 0.02, 302, 2, 8));
      for (let i = 0; i < 12; i++) {
        const sx = x + 30 + h1(i * 5) * (w - 60), sy = y + 24 + h1(i * 5 + 1) * h * 0.55, tw = 0.5 + 0.5 * Math.sin(S * 3 + i * 2), r = 5 + 4 * h1(i + 3);
        c.strokeStyle = `rgba(246,236,212,${0.3 + 0.5 * tw})`; c.lineWidth = 3; c.lineCap = 'round';
        c.beginPath(); c.moveTo(sx - r, sy); c.lineTo(sx + r, sy); c.moveTo(sx, sy - r); c.lineTo(sx, sy + r); c.stroke();
      }
      c.fillStyle = '#0b2228'; c.beginPath(); wrect(c, x - 20, y + h * 0.82, w + 40, h * 0.3, 1330, 5, 80); c.fill();
    } else if (v === 'party') {
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2a2f7a'); g.addColorStop(1, '#e5239b');
      c.fillStyle = g; c.fillRect(x, y, w, h);
      const col2 = ['#2fb4ff', '#e5239b', '#ffd62e'];
      for (let q = 0; q < 4; q++) {
        const ph = ((S * 0.5 + q * 0.25) % 1), fx = x + w * 0.16 + q * w * 0.24, fy = y + h * 0.27 + (q % 2) * h * 0.19;
        c.strokeStyle = col2[q % 3]; c.lineWidth = 6; c.lineCap = 'round'; c.globalAlpha = 1 - ph;
        for (let r = 0; r < 12; r++) { const a = r / 12 * TAU; c.beginPath(); c.moveTo(fx + Math.cos(a) * ph * 40, fy + Math.sin(a) * ph * 40); c.lineTo(fx + Math.cos(a) * (ph * 80 + 20), fy + Math.sin(a) * (ph * 80 + 20)); c.stroke(); }
        c.globalAlpha = 1;
      }
    } else {
      const sky = { dawn: ['#f7d9a0', '#f3a97a'], day: ['#bfe3e8', '#f2e9c9'], dusk: ['#c9704f', '#f0b070'], gold: ['#ffe9a6', '#ffc56a'], grey: ['#d9d6cd', '#c9c5ba'] }[v] || ['#bfe3e8', '#f2e9c9'];
      const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
      c.fillStyle = g; c.fillRect(x, y, w, h);
      if (v === 'gold' || v === 'dawn' || v === 'dusk') {
        const sx = x + w * 0.3, sy = y + h * (v === 'dusk' ? 0.55 : 0.62);
        glow(c, sx, sy, w * 0.6, 'rgba(255,240,170,A)', 0.8);
        fillInk(c, () => blob(c, sx, sy, w * 0.07, w * 0.07, 310, 2, 14), '#fff3b8', 3);
      }
      c.fillStyle = v === 'grey' ? '#a8a49a' : 'rgba(120,90,70,.35)';
      c.beginPath(); wrect(c, x - 20, y + h * 0.78, w + 40, h * 0.4, 1331, 5, 80); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)';
      c.beginPath(); blob(c, x + w * 0.72, y + h * 0.26, w * 0.12, h * 0.07, 311, 4, 10); c.fill();
    }
    if (light) glow(c, x + w / 2, y + h / 2, w * 0.7, 'rgba(255,230,160,A)', 0.2 * light);
  }

  // (x,y,w,h) = the glass. view: night|dawn|day|dusk|gold|party|grey|dark (default from mode); draw(ctx,x,y,w,h) overrides.
  // light 0..1 throws a beam of light down onto the floor (beamTo = floor y).
  function windowP(c, x, y, w, h, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, P = pal(o.mode), dk = P.dk, v = o.view || P.glass;
    const fr = clamp(28 * w / 860, 12, 40);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    if (o.draw) o.draw(c, x, y, w, h);
    else if (v === 'dark') { c.fillStyle = '#0b1c22'; c.fillRect(x, y, w, h); }
    else glassView(c, v, x, y, w, h, S, o.light || 0);
    c.restore();
    if (o.light) {
      const L = o.light, to = o.beamTo || 1080;
      c.save(); c.globalCompositeOperation = 'screen';
      const lg = c.createLinearGradient(0, y + h, 0, to);
      lg.addColorStop(0, `rgba(255,214,140,${0.22 * L})`); lg.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = lg; c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w + (to - y - h) * 0.55, to); c.lineTo(x + (to - y - h) * 0.4, to); c.closePath(); c.fill();
      c.restore();
    }
    const wf = () => { wrect(c, x - fr, y - fr, w + fr * 2, h + fr * 2, 1140, 2, 110); wrect(c, x + w, y, -w, h, 1141, 0, 110); };
    c.beginPath(); wf(); c.save(); c.fillStyle = K('#a88255', dk * 0.65); c.fill('evenodd');
    c.clip('evenodd'); c.globalCompositeOperation = 'multiply'; c.lineWidth = fr * 0.6; c.strokeStyle = 'rgba(70,40,30,.3)'; c.stroke(); c.restore();
    c.beginPath(); wf(); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    if (o.mullions) {
      c.fillStyle = K('#a88255', dk * 0.65);
      fillInk(c, () => wrect(c, x + w / 2 - 6, y, 12, h, 1143, 1, 100), K('#a88255', dk * 0.65), 3, { rim: false });
      fillInk(c, () => wrect(c, x, y + h / 2 - 6, w, 12, 1144, 1, 100), K('#a88255', dk * 0.65), 3, { rim: false });
    }
    fillInk(c, () => wrect(c, x - fr * 1.6, y + h + fr, w + fr * 3.2, fr * 1.1, 1142, 2, 90), K('#b99464', dk * 0.65), 3.4);
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 36 * w / 860;
    c.beginPath(); c.moveTo(x + w * 0.14, y + h); c.lineTo(x + w * 0.38, y); c.stroke(); c.restore();
    if (o.plant !== false) {
      const pk = w / 860, px = x + w * 0.09, py = y + h;
      fillInk(c, () => wrect(c, px - 35 * pk, py - 40 * pk, 70 * pk, 68 * pk, 1150, 1.5, 40), K('#c1704f', dk * 0.65), 3);
      for (let q = 0; q < 5; q++) fillInk(c, () => blob(c, px + (q - 2) * 20 * pk, py - 74 * pk - (q % 2) * 16 * pk, 14 * pk, 40 * pk, 1160 + q, 1.2, 8, (q - 2) * 0.35), K('#6aa07a', dk * 0.65), 2.6, { rim: false });
    }
  }

  // The human place, laid out in full-frame coordinates exactly like the approved fragment room:
  // window left (90,250,860x484), clock, desk right with sleeping monitor + lamp + mug, chair at x 1300.
  // o: { mode, S, phi (chair swivel), lamp 0..1, monitor 0..1, coat, confetti 0..1, sway, view, windowDraw, light 0..1,
  //      zzz 0..1, dust 0..1, clock, dim 0..1 (cool night tint), mug, drawer, led (standby LED 0..1) }
  function humanRoom(c, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, mode = o.mode || 'night', P = pal(mode), dk = P.dk;
    const warm = mode === 'gold' || mode === 'dawn' || mode === 'day';
    const wallC = K(warm ? '#f2dfae' : '#cfd9d2', dk), wall2 = K(warm ? '#e6c98e' : '#b8c9c6', dk), wall3 = K('#d8cdb4', dk);
    c.fillStyle = wallC; c.fillRect(-60, -60, 2040, 900);
    for (let i = 0; i < 8; i++) { c.globalAlpha = 0.5; c.fillStyle = i % 2 ? wall2 : wall3; c.beginPath(); blob(c, -100 + i * 300, 250 + (i % 3) * 140, 280, 200, 1100 + i, 5, 12); c.fill(); }
    c.globalAlpha = 1;
    c.fillStyle = K('#a98466', dk); c.beginPath(); wrect(c, -60, 800, 2040, 340, 1120, 3, 90); c.fill();
    c.strokeStyle = K('#5e4633', dk); c.globalAlpha = 0.5; c.lineWidth = 3;
    for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-60, 850 + i * 60); c.lineTo(1980, 850 + i * 60 + jt(i, 3, 3)); c.stroke(); }
    c.globalAlpha = 1;
    fillInk(c, () => wrect(c, -60, 780, 2040, 36, 1121, 2, 100), K('#7c6a5a', dk), 3, { rim: false });
    windowP(c, 90, 250, 860, 484, { mode, S, view: o.view, draw: o.windowDraw, light: o.light, beamTo: 1080 });
    if (o.clock !== false) {
      fillInk(c, () => blob(c, 1120, 340, 62, 62, 1170, 1.4, 16), K('#efe6cf', dk * 0.6), 3.4);
      c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round';
      for (let q = 0; q < 12; q++) { const a = q / 12 * TAU; c.beginPath(); c.moveTo(1120 + Math.cos(a) * 49, 340 + Math.sin(a) * 49); c.lineTo(1120 + Math.cos(a) * 55, 340 + Math.sin(a) * 55); c.stroke(); }
      c.lineWidth = 4.5; c.beginPath(); c.moveTo(1120, 340); c.lineTo(1144, 320); c.moveTo(1120, 340); c.lineTo(1114, 378); c.stroke();
    }
    rug(c, 1300, 1010, 800, { mode, S });
    desk(c, 1010, 726, 910, { mode, S, mug: o.mug !== false, open: o.drawer || 0 });
    monitor(c, 1555, 730, 270, { mode, S, on: o.monitor || 0, face: o.monitorFace, color: o.monitorColor, led: o.led });
    lamp(c, 1100, 722, 250, { mode, S, on: o.lamp || 0 });
    shadow(c, 1300, 1012, 220, 24, 0.2);
    chair(c, 1300, 1012, 430, { mode, S, phi: o.phi, coat: o.coat, confetti: o.confetti, sway: o.sway });
    if (o.dust) {
      c.save();
      for (let i = 0; i < 46; i++) {
        const x0 = h1(i * 3), y0 = h1(i * 3 + 1), sp = 0.01 + 0.02 * h1(i * 3 + 2);
        const px = 120 + ((x0 * 1500 + S * (6 + 8 * h1(i)) + Math.sin(S * 0.5 + i) * 30) % 1500);
        const py = 300 + ((y0 * 650 - S * sp * 220 + 650 * 10) % 650);
        c.fillStyle = `rgba(255,236,190,${(0.22 + 0.3 * (0.5 + 0.5 * Math.sin(S * 1.1 + i * 1.7))) * o.dust})`;
        c.beginPath(); c.arc(px, py, 1.6 + 2 * h1(i + 9), 0, TAU); c.fill();
      }
      c.restore();
    }
    if (o.zzz) zzz(c, 1560, 420, 100, { S, alpha: o.zzz });
    if (o.dim) {
      c.save(); c.globalCompositeOperation = 'multiply';
      c.fillStyle = `rgba(${Math.round(255 - 70 * o.dim)},${Math.round(255 - 50 * o.dim)},${Math.round(255 - 20 * o.dim)},1)`;
      c.fillRect(-60, -60, 2040, 1200); c.restore();
    }
  }

  // a server box: front panel with a face and LEDs. leds = array of 6 values 0..1 (default: slow random flicker)
  function serverBox(c, x, y, w, h, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, mood = o.mood || 0, id = (o.seed || 1) * 31, stripe = o.stripe || PAL.sage;
    fillInk(c, () => wrect(c, x, y, w, h, id, 2.2, 50), '#e8dbb8', 3.4);
    fillInk(c, () => wrect(c, x + 8, y + 8, 22, h - 16, id + 5, 1.2, 60), stripe, 2.2, { rim: false });
    const ey = y + h * 0.45, mx = x + w * 0.3;
    for (const ex of [mx, mx + 50]) {
      c.beginPath();
      if (mood === 2) {
        c.moveTo(ex - 8, ey - 8); c.lineTo(ex + 8, ey + 8); c.moveTo(ex + 8, ey - 8); c.lineTo(ex - 8, ey + 8);
        c.lineWidth = 4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      } else if (mood === 3) {
        c.arc(ex, ey, 9, 0.1 * Math.PI, 0.9 * Math.PI); c.lineWidth = 4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke();
      } else {
        const r = mood === 1 ? 14 : 10;
        c.ellipse(ex, ey, r, r, 0, 0, TAU); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
        c.beginPath(); c.arc(ex - 2 + (mood === 1 ? -3 : -1), ey, r * 0.45, 0, TAU); c.fillStyle = INK; c.fill();
      }
    }
    c.beginPath();
    const mcx = mx + 25;
    if (mood === 1) { c.ellipse(mcx, ey + 32, 7, 9, 0, 0, TAU); c.fillStyle = '#5a1d2c'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke(); }
    else if (mood === 2) { c.moveTo(mcx - 15, ey + 36); c.quadraticCurveTo(mcx, ey + 24, mcx + 15, ey + 36); c.lineWidth = 3.4; c.strokeStyle = INK; c.stroke(); }
    else if (mood === 3) { c.moveTo(mcx - 6, ey + 28); c.lineTo(mcx + 6, ey + 28); c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); }
    else { c.moveTo(mcx - 13, ey + 26); c.quadraticCurveTo(mcx, ey + 40, mcx + 13, ey + 26); c.lineWidth = 3.4; c.strokeStyle = INK; c.lineCap = 'round'; c.stroke(); }
    const fl = Math.floor(S * 6);
    for (let j = 0; j < 6; j++) {
      let lv;
      if (o.leds) lv = o.leds[j] || 0; else lv = mood === 2 ? ((j + fl) % 2 === 0 ? 1 : 0) : (h1(id + j + fl * 13) > 0.4 ? 1 : 0);
      const col = mood === 2 ? PAL.tomato : (o.ledCol || [PAL.sage, PAL.straw, PAL.rose][j % 3]);
      const px = x + w - 150 + j * 22, py = y + h * 0.3;
      c.beginPath(); c.arc(px, py, 6.2, 0, TAU);
      c.fillStyle = lv > 0.02 ? mix('#8f866e', col, clamp(lv)) : '#8f866e'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      if (lv > 0.02) glow(c, px, py, 26 + 10 * lv, rgba(col, 'A'), 0.35 * lv);
    }
    c.beginPath();
    for (let j = 0; j < 4; j++) { c.moveTo(x + w - 150, y + h * 0.55 + j * 11); c.lineTo(x + w - 30, y + h * 0.55 + j * 11 + jt(id, j, 1.5)); }
    c.lineWidth = 2.6; c.strokeStyle = 'rgba(43,34,51,.55)'; c.lineCap = 'round'; c.stroke();
  }

  // s = rack height. (x,y) = bottom centre on the floor. part: 'all' | 'back' | 'front' (draw a bean between 'back'
  // and 'front' to have it pop out of a box). o.boxes = [{mood,leds,dx,dy,rot,hide,lid}] top to bottom (3 boxes).
  // returns { boxes:[{x,y,w,h,top,cx}], w, top } in world coords (before tilt).
  function rack(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const k = s / 500, part = o.part || 'all', dk = pal(o.mode).dk;
    const bxs = o.boxes || [];
    const tilt = o.tilt || 0;
    const wx = x - 195 * k;
    const lay = { boxes: [0, 1, 2].map(i => ({ x: wx + 20 * k, y: y - (475 - 160 * i) * k, w: 350 * k, h: 140 * k, cx: x, top: y - (475 - 160 * i) * k })), w: 390 * k, top: y - s };
    if (part !== 'front') shadow(c, x, y + 8 * k, 220 * k, 22 * k, 0.4);
    c.save();
    c.translate(x + 195 * k, y); c.rotate(tilt); c.translate(-(x + 195 * k), -y);
    c.translate(x, y); c.scale(k, k); c.translate(-1205, -830);
    if (part !== 'front') {
      fillInk(c, () => wrect(c, 1010, 330, 390, 500, 320, 3, 70), K('#12353c', dk * 0.2), 4);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(1030, 345, 350, 470);
      // lids hinge up from the top edge of a box; drawn here so a bean in front of the back panel stays in front of the lid
      [355, 515, 675].forEach((yb, i) => {
        const b = bxs[i] || {}; if (!b.lid || b.hide) return;
        const L = clamp(b.lid), hl = 74 * Math.sin(L * 1.45), y0 = yb + (b.dy || 0);
        if (hl < 2) return;
        fillInk(c, () => { c.moveTo(1030, y0); c.lineTo(1380, y0); c.lineTo(1366, y0 - hl); c.lineTo(1044, y0 - hl); c.closePath(); }, '#cdbf94', 3.2, { rim: false });
        c.fillStyle = 'rgba(43,34,51,.18)'; c.fillRect(1050, y0 - hl + 8, 300, Math.max(0, hl * 0.3));
      });
    }
    if (part !== 'back') {
      const ys = [355, 515, 675], stripes = [PAL.ochre, PAL.rose, PAL.sage];
      for (let i = 2; i >= 0; i--) {
        const b = bxs[i] || {};
        if (b.hide) continue;
        c.save();
        if (b.dx || b.dy) c.translate(b.dx || 0, b.dy || 0);
        if (b.rot) { c.translate(1205, ys[i] + 70); c.rotate(b.rot); c.translate(-1205, -ys[i] - 70); }
        serverBox(c, 1030, ys[i], 350, 140, { S: o.S, mood: b.mood || 0, leds: b.leds, seed: 10 + i, stripe: stripes[i], ledCol: b.ledCol });
        c.restore();
      }
    }
    c.restore();
    if (o.sparks) {
      const sp = clamp(o.sparks);
      for (let q = 0; q < 14; q++) {
        const ph = (o.S * 1.4 + h1(q) * 3) % 1, a = -Math.PI * 0.95 + h1(q + 40) * Math.PI * 0.9;
        const px = x + Math.cos(a) * ph * 160 * k, py = y - s * 0.96 + Math.sin(a) * ph * 160 * k + 120 * ph * ph * k;
        const L = (7 + 9 * h1(q + 80)) * (1 - ph) * sp;
        c.strokeStyle = q % 3 ? '#ffd873' : PAL.tomato; c.lineWidth = 4; c.lineCap = 'round';
        c.beginPath(); c.moveTo(px - L, py); c.lineTo(px + L, py); c.moveTo(px, py - L); c.lineTo(px, py + L); c.stroke();
      }
    }
    return lay;
  }

  // (x,y,w,h) = outer frame. notes = count or [{x,y,col,rot,k}] where x,y are 0..1 inside the cork, k = pop-in 0..1
  function corkboard(c, x, y, w, h, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, seed = o.seed || 1, ft = Math.min(w, h) * 0.09;
    const T = (hh, f) => K(hh, dk * (f === undefined ? 0.65 : f));
    fillInk(c, () => wrect(c, x, y, w, h, 910, 3, 70), T('#dcae6e'), 3, { rimW: 16 });
    c.fillStyle = 'rgba(150,100,50,.25)';
    for (let q = 0; q < 70; q++) { c.beginPath(); c.arc(x + ft * 0.5 + h1(q + seed) * (w - ft), y + ft * 0.5 + h1(q + 99 + seed) * (h - ft), 2 + h1(q + 5) * 3, 0, TAU); c.fill(); }
    const wood = T('#a3703a');
    fillInk(c, () => wrect(c, x - ft * 0.2, y - ft * 0.2, w + ft * 0.4, ft, 900, 1.8, 60), wood, 3.4);
    fillInk(c, () => wrect(c, x - ft * 0.2, y + h - ft * 0.8, w + ft * 0.4, ft, 901, 1.8, 60), wood, 3.4);
    fillInk(c, () => wrect(c, x - ft * 0.2, y - ft * 0.2, ft, h + ft * 0.4, 902, 1.8, 60), wood, 3.4);
    fillInk(c, () => wrect(c, x + w - ft * 0.8, y - ft * 0.2, ft, h + ft * 0.4, 903, 1.8, 60), wood, 3.4);
    const cols = ['#f2cf5b', '#e99aa8', '#9fd0cf', '#c7e3a6'];
    let list = o.notes;
    if (typeof list === 'number') list = Array.from({ length: list }, (_, i) => ({ x: 0.1 + ((i * 0.37 + h1(i + seed) * 0.3) % 0.8), y: 0.2 + ((Math.floor(i / 4) * 0.33 + h1(i + 7 + seed) * 0.12) % 0.65), col: cols[i % 4], rot: (h1(i + 3) - 0.5) * 0.14 }));
    const ns = Math.min(w, h) * 0.3;
    (list || []).forEach((n, i) => {
      const kk = n.k === undefined ? 1 : eBack(clamp(n.k));
      if (kk <= 0) return;
      c.save(); c.translate(x + ft + n.x * (w - ft * 2), y + ft + n.y * (h - ft * 2)); c.rotate((n.rot || 0) + (1 - kk) * 0.5); c.scale(kk, kk);
      fillInk(c, () => wrect(c, -ns * 0.5, -ns * 0.42, ns, ns * 0.84, 920 + i, 1.6, 50), n.col || cols[i % 4], 2.6);
      c.strokeStyle = 'rgba(43,34,51,.5)'; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); for (let q = 0; q < 3; q++) { c.moveTo(-ns * 0.34, -ns * 0.18 + q * ns * 0.2); c.quadraticCurveTo(-ns * 0.08, -ns * 0.26 + q * ns * 0.2, ns * (0.3 - q * 0.08), -ns * 0.16 + q * ns * 0.2); } c.stroke();
      c.beginPath(); c.arc(0, -ns * 0.36, 6, 0, TAU); c.fillStyle = PAL.tomato; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
      c.restore();
    });
  }

  // manila folder. (x,y) = bottom centre, s = width. open 0..1 lifts the flap, glow lights the tag.
  function folder(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, col = o.color || '#e3b86a', hh = s * 0.72, open = o.open || 0;
    c.save(); c.translate(x, y);
    fillInk(c, () => wrect(c, -s / 2, -hh, s, hh, 1400, 1.6, 50), K(col, dk * 0.5), 3.2);
    fillInk(c, () => wrect(c, -s / 2, -hh - s * 0.1, s * 0.38, s * 0.12, 1401, 1.2, 50), K(mix(col, '#c9923a', 0.3), dk * 0.5), 3, { rim: false });
    c.save(); c.translate(-s / 2, -hh * 0.05); c.scale(1, 1 - open * 1.6);
    fillInk(c, () => wrect(c, 0, -hh * 0.55, s, hh * 0.55, 1402, 1.4, 50), K(mix(col, '#ffffff', 0.12), dk * 0.5), 3, { rim: false });
    c.restore();
    const g = o.glow || 0;
    fillInk(c, () => wrect(c, -s * 0.2, -hh * 0.42, s * 0.4, hh * 0.18, 1403, 1, 40), g > 0.02 ? mix('#fbf3dc', '#ffe08a', g) : '#fbf3dc', 2.4, { rim: false });
    if (g > 0.02) glow(c, 0, -hh * 0.33, s * 0.7, 'rgba(255,224,130,A)', 0.7 * g);
    c.restore();
  }

  // s = door height. (x,y) = bottom centre. open 0..1, slam = seconds since the slam (shakes + puff), glow = light behind
  function door(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, col = o.color || PAL.teal2, open = o.open || 0, w = s * 0.5;
    let shx = 0;
    if (o.slam !== undefined && o.slam >= 0) shx = 12 * (s / 500) * Math.exp(-o.slam * 11) * Math.sin(o.slam * 85);
    c.save(); c.translate(x + shx, y);
    fillInk(c, () => wrect(c, -w / 2 - 16, -s - 16, w + 32, s + 16, 1500, 2, 60), K('#caa05a', dk * 0.6), 3.4);
    const inter = o.glow ? mix('#ffe8a0', '#fff6d0', 0.3) : K('#1d1620', 0);
    fillInk(c, () => wrect(c, -w / 2, -s, w, s, 1501, 1.4, 60), open > 0.02 ? inter : K(col, dk * 0.6), 3.4, { rim: open <= 0.02 });
    if (open > 0.02) {
      if (o.glow) glow(c, 0, -s * 0.5, s * 0.7, 'rgba(255,230,150,A)', 0.55 * open);
      const lw = w * Math.cos(open * 1.25);
      c.save(); c.beginPath(); c.moveTo(-w / 2, -s); c.lineTo(-w / 2 + lw, -s + (w - lw) * 0.18); c.lineTo(-w / 2 + lw, -(w - lw) * 0.18); c.lineTo(-w / 2, 0); c.closePath();
      c.fillStyle = K(mix(col, '#000000', 0.12), dk * 0.6); c.fill(); c.lineWidth = 3.4; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); c.restore();
    } else {
      c.strokeStyle = 'rgba(43,34,51,.4)'; c.lineWidth = 3; c.lineJoin = 'round';
      c.beginPath(); c.roundRect(-w * 0.34, -s * 0.9, w * 0.68, s * 0.36, 5); c.roundRect(-w * 0.34, -s * 0.48, w * 0.68, s * 0.4, 5); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.roundRect(-w * 0.34, -s * 0.9, w * 0.2, s * 0.36, 5); c.fill();
      c.beginPath(); c.arc(w * 0.32, -s * 0.46, s * 0.026, 0, TAU); c.fillStyle = K('#e8c870', dk * 0.5); c.fill(); c.lineWidth = 2.6; c.strokeStyle = INK; c.stroke();
    }
    if (o.slam !== undefined && o.slam >= 0 && o.slam < 0.28) {
      const p = o.slam / 0.28; c.globalAlpha = 1 - p; c.strokeStyle = 'rgba(43,34,51,.7)'; c.lineWidth = 5; c.lineCap = 'round';
      for (let q = 0; q < 4; q++) {
        const sd = q < 2 ? -1 : 1, yy = -s * (0.3 + 0.35 * (q % 2)), d = w / 2 + 30 + 40 * p;
        c.beginPath(); c.moveTo(sd * d, yy); c.lineTo(sd * (d + 26 + 18 * p), yy + (q % 2 ? -10 : 10)); c.stroke();
      }
      c.globalAlpha = 1;
    }
    c.restore();
  }

  // generic cosy house (no marks). s = house height (ground to roof tip), (x,y) = ground centre. lit 0..1 (or [a,b])
  function house(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, dk = pal(o.mode).dk, k = s / 420;
    const lit = Array.isArray(o.lit) ? o.lit : [o.lit || 0, o.lit || 0];
    c.save(); c.translate(x, y); c.scale(k, k);
    shadow(c, 0, 8, 270, 20, 0.28);
    fillInk(c, () => wrect(c, 130, -430, 60, 150, 1600, 1.4, 50), K('#b5654a', dk * 0.6), 3);
    fillInk(c, () => wrect(c, -250, -260, 500, 260, 1601, 2.2, 90), K(o.wall || '#f0dcb4', dk * 0.6), 3.6);
    fillInk(c, () => smoothClosed(c, [[-290, -250], [-200, -300], [0, -420], [200, -300], [290, -250], [250, -230], [-250, -230]].map((p, i) => [p[0] + jt(1602, i * 2, 2), p[1] + jt(1602, i * 2 + 1, 2)])), K(o.roof || '#c1604a', dk * 0.6), 3.6);
    const win = (wx, wy, L, id) => {
      fillInk(c, () => wrect(c, wx - 52, wy - 52, 104, 104, 1610 + id, 1.2, 50), K('#a88255', dk * 0.6), 3.2);
      fillInk(c, () => wrect(c, wx - 40, wy - 40, 80, 80, 1620 + id, 1, 50), L > 0.02 ? mix('#2a3f4a', '#ffd98a', L) : K('#2a3f4a', dk * 0.3), 2.4, { rim: false });
      if (L > 0.02) {
        glow(c, wx, wy, 130, 'rgba(255,214,130,A)', 0.5 * L);
        c.save(); c.globalAlpha = L; c.fillStyle = 'rgba(160,90,40,.5)';
        c.beginPath(); c.roundRect(wx - 28, wy + 12, 30, 28, 4); c.fill();
        c.beginPath(); c.moveTo(wx + 14, wy + 40); c.lineTo(wx + 14, wy + 0); c.lineWidth = 4; c.strokeStyle = 'rgba(160,90,40,.6)'; c.stroke(); c.restore();
      }
      c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(wx, wy - 40); c.lineTo(wx, wy + 40); c.moveTo(wx - 40, wy); c.lineTo(wx + 40, wy); c.stroke();
    };
    win(-150, -150, lit[0], 0); win(150, -150, lit[1], 1);
    fillInk(c, () => wrect(c, -42, -140, 84, 140, 1630, 1.2, 60), K('#7a4a32', dk * 0.6), 3.4);
    c.beginPath(); c.arc(24, -68, 5, 0, TAU); c.fillStyle = '#e8c870'; c.fill(); c.lineWidth = 2; c.strokeStyle = INK; c.stroke();
    fillInk(c, () => wrect(c, -70, -8, 140, 14, 1631, 1, 60), K('#d9c9a0', dk * 0.6), 2.6, { rim: false });
    if (o.smoke) for (let q = 0; q < 3; q++) {
      const ph = (S * 0.4 + q / 3) % 1; c.globalAlpha = 0.5 * (1 - ph);
      fillInk(c, () => blob(c, 160 + Math.sin(ph * 5 + q) * 14, -450 - ph * 120, 18 + 20 * ph, 15 + 18 * ph, 1640 + q, 2, 8), '#d9d4c6', 2.2, { rim: false });
    }
    c.globalAlpha = 1;
    c.restore();
  }

  // an access key lying around. s = length. rot radians. glint: a sparkle
  function keyGlyph(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const col = o.color || '#e8b44a', k = s / 120;
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(k, k);
    fillInk(c, () => wrect(c, -4, -7, 74, 14, 1700, 1, 30), col, 3, { rim: false });
    fillInk(c, () => wrect(c, 44, 5, 10, 18, 1701, 0.8, 30), col, 2.6, { rim: false });
    fillInk(c, () => wrect(c, 60, 5, 10, 14, 1702, 0.8, 30), col, 2.6, { rim: false });
    fillInk(c, () => blob(c, -30, 0, 30, 30, 1703, 1.2, 12), col, 3.2, { inside: cc => { cc.fillStyle = 'rgba(255,255,255,.3)'; cc.beginPath(); cc.ellipse(-40, -12, 8, 14, -0.5, 0, TAU); cc.fill(); } });
    c.beginPath(); c.arc(-30, 0, 10, 0, TAU); c.fillStyle = 'rgba(43,34,51,.8)'; c.fill();
    c.restore();
    if (o.glint) star(c, x + (s * 0.35) * Math.cos(o.rot || 0) - s * 0.2, y - s * 0.3, s * 0.12, { kind: 'sparkle', S: o.S });
  }

  // paper plane. s = length. fold 0..1 (0 = flat sheet), rot radians
  function plane(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const f = o.fold === undefined ? 1 : clamp(o.fold), col = o.color || '#fbf3dc', k = s / 2;
    const lerpP = (a, b) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
    const L = [lerpP([-0.7, -0.5], [1, 0]), lerpP([0.7, -0.5], [-1, -0.62]), lerpP([0.7, 0], [-0.86, -0.04]), lerpP([-0.7, 0], [-0.86, -0.04])];
    const R = [lerpP([-0.7, 0], [1, 0]), lerpP([0.7, 0], [-0.86, 0.04]), lerpP([0.7, 0.5], [-1, 0.56]), lerpP([-0.7, 0.5], [-0.86, 0.04])];
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(k, k);
    const poly = (p, fill) => { c.beginPath(); p.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.fillStyle = fill; c.fill(); c.lineWidth = 3 / k; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); };
    poly(R, mix(col, '#a9a08a', 0.35 * f));
    poly(L, col);
    if (f > 0.5) { c.beginPath(); c.moveTo(1, 0); c.lineTo(-0.86, 0.04); c.lineTo(-0.92, 0.26); c.closePath(); c.fillStyle = mix(col, '#a9a08a', 0.5); c.fill(); c.lineWidth = 3 / k; c.stroke(); }
    c.restore();
  }

  function paperFace(c, w, h, word, col, down, o) {
    fillInk(c, () => wrect(c, -w / 2, -h / 2, w, h, 1800, 2, 60), col, 3.6);
    letter(c, word, 0, h * 0.18, h * (word.length > 3 ? 0.46 : 0.58), '#fbf3dc', o);
  }
  // voting paddle. (x,y) = hand position (bottom of the face), s = face width. word HOLD|GO. down 0..1 lowers it.
  function paddle(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const word = o.word || 'HOLD', dk = pal(o.mode).dk, down = clamp(o.down || 0);
    const col = word === 'GO' ? '#3f9a64' : PAL.tomato;
    c.save(); c.translate(x, y); c.rotate(down * 0.9);
    c.lineCap = 'round'; c.beginPath(); c.moveTo(0, s * 0.5); c.lineTo(0, -s * 0.2); c.lineWidth = s * 0.1; c.strokeStyle = INK; c.stroke(); c.lineWidth = s * 0.055; c.strokeStyle = K('#c8964f', dk * 0.5); c.stroke();
    c.translate(0, -s * 0.2 - s * 0.36);
    paperFace(c, s, s * 0.72, word, K(col, dk * 0.4), down);
    c.restore();
  }
  // roadside sign on a post. s = total height, (x,y) = post base. flip 0..1 flips HOLD to GO (turns about the post)
  function sign(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const dk = pal(o.mode).dk, f = clamp(o.flip || 0);
    const fw = s * 0.62, fh = s * 0.4;
    c.save(); c.translate(x, y);
    shadow(c, 0, 4, s * 0.16, s * 0.025, 0.3);
    fillInk(c, () => wrect(c, -s * 0.03, -s * 0.72, s * 0.06, s * 0.72, 1810, 1, 60), K('#8c6a46', dk * 0.5), 3, { rim: false });
    c.translate(0, -s * 0.72 - fh * 0.1);
    const ang = f * Math.PI, sxv = Math.cos(ang);
    const word = ang < Math.PI / 2 ? 'HOLD' : 'GO';
    c.scale(Math.abs(sxv) < 0.04 ? 0.04 : Math.abs(sxv), 1 + 0.05 * Math.sin(ang));
    paperFace(c, fw, fh, word, K(word === 'GO' ? '#3f9a64' : PAL.tomato, dk * 0.4), 0);
    c.restore();
  }

  // the painted number tag that hangs from a nail. (x,y) = the nail; scale; value formatted with commas, raw overrides
  function tag(c, x, y, value, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, sc = o.scale === undefined ? 1 : o.scale, dk = pal(o.mode).dk;
    const txt = o.raw !== undefined ? String(o.raw) : fmt(value);
    const sw = o.rot !== undefined ? o.rot : 0.05 * Math.sin(S * 3.1);
    const colr = o.color || (value >= 1200 ? PAL.tomato : '#2a6c72');
    c.save(); c.translate(x, y); c.rotate(sw); c.scale(sc, sc);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 48); c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    c.translate(0, -20);
    fillInk(c, () => wrect(c, -190, 20, 380, 168, 940, 2.4, 64), K('#f8eed6', dk * 0.3), 4);
    wash(c, '#e9c98a', 0.5, () => wrect(c, -190, 20, 380, 168, 941, 4, 64));
    c.beginPath(); c.arc(0, 38, 8, 0, TAU); c.fillStyle = '#7c5a36'; c.fill(); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
    c.font = '116px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    const wdt = c.measureText(txt).width, fit = Math.min(1, 340 / wdt);
    c.save(); c.translate(0, 156); c.scale(fit, fit);
    c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = INK; c.strokeText(txt, 0, 0);
    c.fillStyle = colr; c.fillText(txt, 0, 0); c.restore();
    c.restore();
  }

  // painted string-lights / lantern grid, the stand-in for a dot matrix. lit = 0..1 share lit, wave = 0..1 travelling pulse.
  // returns { cols, rows, cell:[x,y] list }
  function lights(c, x, y, w, h, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, P = pal(o.mode), lit = o.lit === undefined ? 1 : o.lit, wave = o.wave || 0;
    const cell = o.cell || 56, cols = Math.max(2, Math.round(w / cell)), rows = Math.max(1, Math.round(h / cell));
    const cw = w / cols, rh = h / rows, b = beat(S), sag = Math.min(18, cw * 0.3);
    const cols0 = o.colors || (P.dark ? BHOT : HOT.slice(0, 6));
    const cells = [];
    for (let r = 0; r < rows; r++) {
      const yy = y + (r + 0.25) * rh;
      c.strokeStyle = rgba(INK, 0.75); c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + w / 2, yy + sag * 2, x + w, yy); c.stroke();
      for (let q = 0; q < cols; q++) {
        const i = r * cols + q, t = (q + 0.5) / cols;
        const px = x + t * w, sy = yy + 2 * t * (1 - t) * sag * 2, py = sy + rh * 0.3 + 4 * Math.sin(S * 2 + i);
        const base = h1(i * 3 + (o.seed || 1)) < lit ? 1 : 0;
        const wv = 0.5 + 0.5 * Math.sin(TAU * (t * 2 - b * 0.5 + r * 0.1));
        const L = clamp(base * (1 - wave) + wv * wave * (base ? 1 : 0.9));
        const colr = cols0[(q + r * 2) % cols0.length];
        cells.push([px, py]);
        c.beginPath(); c.moveTo(px, sy); c.lineTo(px, py - 4); c.lineWidth = 2.4; c.strokeStyle = INK; c.stroke();
        const rr = Math.min(cw, rh) * 0.26;
        const off = P.dark ? '#4a3a44' : '#cfc5a8';
        fillInk(c, () => blob(c, px, py + rr * 0.9, rr, rr * 1.15, 1900 + i, 1.2, 9), L > 0.05 ? mix(off, colr, L) : off, 2.4, { rim: L < 0.05 });
        if (L > 0.05) glow(c, px, py + rr * 0.9, rr * 3, rgba(colr, 'A'), 0.45 * L);
      }
    }
    return { cols, rows, cells };
  }

  // ---------- atmosphere ----------
  // s = cloud scale (1 ~ 124 px wide). z letters float up out of the cloud.
  function zzz(c, x, y, s, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, alpha = o.alpha === undefined ? 1 : o.alpha;
    const k = (s || 100) / 100;
    c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(k, k);
    const bx = 0, by = 0 + Math.sin(S * 0.9) * 4;
    if (o.cloud !== false) {
      c.fillStyle = o.dark === false ? 'rgba(80,60,90,.16)' : 'rgba(240,235,220,.17)';
      c.beginPath(); [[0, 0, 62], [-52, 14, 42], [54, 16, 44], [-18, -34, 40], [30, -30, 38]].forEach(p => { c.moveTo(bx + p[0] + p[2], by + p[1]); c.arc(bx + p[0], by + p[1], p[2], 0, TAU); }); c.fill();
    }
    for (let q = 0; q < 3; q++) {
      const ph = ((S * 0.2 + q / 3) % 1), sz = 10 + q * 5 + ph * 6;
      const zx = bx - 24 + q * 22 + Math.sin(S * 1.2 + q) * 8, zy = by + 30 - ph * 150;
      c.save(); c.globalAlpha = alpha * Math.sin(Math.PI * ph);
      c.translate(zx, zy); c.rotate(-0.15 + 0.1 * q);
      c.beginPath(); c.moveTo(-sz, -sz); c.lineTo(sz, -sz); c.lineTo(-sz, sz); c.lineTo(sz, sz);
      c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = sz * 0.5; c.strokeStyle = INK; c.stroke();
      c.lineWidth = sz * 0.28; c.strokeStyle = '#f3ead2'; c.stroke();
      c.restore();
    }
    c.restore();
  }

  // falling confetti in the box (x,y,w,h) (default: the frame). still = static scatter
  function confetti(c, S, seed, o) {
    o = o || {}; seed = seed || 1;
    const n = o.n === undefined ? 90 : o.n, X = o.x === undefined ? -100 : o.x, Y = o.y === undefined ? -110 : o.y;
    const Wd = o.w === undefined ? 2120 : o.w, Ht = o.h === undefined ? 1300 : o.h, cols = o.colors || HOT;
    const a = o.alpha === undefined ? 1 : o.alpha, T = o.still ? 0 : S;
    c.save(); c.globalAlpha = a;
    for (let i = 0; i < n; i++) {
      const hx = h1(seed * 101 + i * 3), hy = h1(seed * 101 + i * 3 + 1), hs = h1(seed * 101 + i * 3 + 2);
      const x = X + hx * Wd + Math.sin(T * 2 + i) * 30, sp = 140 + 160 * hs;
      const yy = Y + ((hy * Ht + T * sp) % Ht);
      c.save(); c.translate(x, yy); c.rotate(T * (2 + 3 * hx) + i); c.scale(1, o.still ? 0.5 + 0.5 * hs : Math.sin(T * 6 + i));
      c.fillStyle = cols[i % cols.length]; c.fillRect(-7, -4, 14, 8);
      c.lineWidth = 1.6; c.strokeStyle = INK; c.strokeRect(-7, -4, 14, 8); c.restore();
    }
    c.restore();
  }

  // rays from (x,y). r0 = clear centre, r1 = reach. colours alternate. spin = rad/s
  function sunburst(c, x, y, r0, r1, o) {
    o = o || {}; const S = o.S === undefined ? 0 : o.S, n = o.n || 22, cols = o.colors || ['rgba(255,120,190,.5)', 'rgba(255,214,46,.55)'];
    const rs = S * (o.spin === undefined ? 0.28 : o.spin);
    c.save(); c.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    for (let i = 0; i < n; i++) {
      const a0 = rs + i / n * TAU, a1 = rs + (i + 0.5) / n * TAU;
      c.fillStyle = cols[i % cols.length];
      c.beginPath(); c.moveTo(x + Math.cos(a0) * r0, y + Math.sin(a0) * r0); c.lineTo(x + Math.cos(a0) * r1, y + Math.sin(a0) * r1); c.lineTo(x + Math.cos(a1) * r1, y + Math.sin(a1) * r1); c.lineTo(x + Math.cos(a1) * r0, y + Math.sin(a1) * r0); c.closePath(); c.fill();
    }
    c.restore();
  }

  // kind 'star' (painted, 5 points) or 'sparkle' (four-point cross)
  function star(c, x, y, r, o) {
    o = o || {}; useS(o.S); const S = o.S === undefined ? 0 : o.S;
    const col = o.col || '#ffd62e', rot = (o.rot || 0) + (o.spin ? S * o.spin : 0);
    const tw = o.twinkle ? 0.8 + 0.2 * Math.sin(S * 6 + (o.seed || 0)) : 1;
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(tw, tw);
    if (o.kind === 'sparkle') {
      c.strokeStyle = col; c.lineWidth = Math.max(3, r * 0.22); c.lineCap = 'round';
      c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke();
    } else {
      fillInk(c, () => smoothClosed(c, Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + i / 10 * TAU, rr = i % 2 ? r * 0.5 : r;
        return [Math.cos(a) * rr + jt(1950, i * 2, r * 0.03), Math.sin(a) * rr + jt(1950, i * 2 + 1, r * 0.03)];
      })), col, Math.max(2.4, r * 0.08), { rim: true, rimW: r * 0.3 });
    }
    c.restore();
  }

  // dream/thought bubble. (x,y,w,h) = the main cloud. tail = {x,y} the little circles head toward. returns the inner centre
  function bubble(c, x, y, w, h, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, bob = Math.sin(S * 1.4 + (o.seed || 0)) * 4;
    const cx = x + w / 2, cy = y + h / 2 + bob;
    const lobes = [];
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; lobes.push([cx + Math.cos(a) * w * 0.34, cy + Math.sin(a) * h * 0.32, Math.min(w, h) * (0.22 + 0.04 * h1(i + 5))]); }
    lobes.push([cx, cy, Math.min(w, h) * 0.42]);
    const tails = [];
    if (o.tail) for (let i = 0; i < 3; i++) { const k = 0.55 + i * 0.2; tails.push([lerp(cx, o.tail.x, k) + (i ? 0 : 0), lerp(cy, o.tail.y, k), 20 - i * 5]); }
    const all = lobes.concat(tails);
    c.save();
    c.fillStyle = INK; for (const l of all) { c.beginPath(); c.arc(l[0], l[1], l[2] + 3, 0, TAU); c.fill(); }
    c.fillStyle = o.color || '#fbf3dc'; for (const l of all) { c.beginPath(); c.arc(l[0], l[1], l[2], 0, TAU); c.fill(); }
    c.restore();
    return { cx, cy, w: w * 0.62, h: h * 0.6 };
  }

  // hanging mirror ball. (x,y) = ball centre, r = radius. string goes up off the top. spots: coloured light flecks
  function discoBall(c, x, y, r, o) {
    o = o || {}; useS(o.S);
    const S = o.S === undefined ? 0 : o.S, by = y + (o.bob === false ? 0 : 6 * Math.sin(S * 2));
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, -20); c.lineTo(x, by - r); c.stroke();
    fillInk(c, () => blob(c, x, by, r, r, 2000, 1.6, 16), '#c9d6e8', 3.6, {
      inside: cc => {
        cc.strokeStyle = 'rgba(43,34,51,.35)'; cc.lineWidth = 2;
        for (let k = -3; k <= 3; k++) { cc.beginPath(); cc.ellipse(x, by, Math.abs(Math.cos(k * 0.45 + S * 1.3)) * r + 1, r, 0, 0, TAU); cc.stroke(); }
        for (let k = -3; k <= 3; k++) { cc.beginPath(); cc.moveTo(x - r, by + k * r * 0.28); cc.lineTo(x + r, by + k * r * 0.28); cc.stroke(); }
        cc.fillStyle = 'rgba(255,255,255,.7)'; cc.beginPath(); cc.ellipse(x - r * 0.3, by - r * 0.33, r * 0.2, r * 0.28, -0.5, 0, TAU); cc.fill();
      }
    });
    if (o.spots) for (let k = 0; k < 14; k++) {
      const a = S * 0.6 + k * 0.45, d = 340 + 520 * h1(k + 77);
      glow(c, x + Math.cos(a) * d * 1.5 - 500, by + 430 + Math.sin(a * 1.3) * 300, 70 + 30 * h1(k), rgba(HOT[k % 6], 'A'), 0.5 * (0.5 + 0.5 * pulse(S, 5)));
    }
  }

  // big lettered sticker word (lyric words only!). Same hand as the caption.
  function sticker(c, text, x, y, o) {
    o = o || {}; useS(o.S);
    c.save(); c.translate(x, y); c.rotate(o.rot || 0); c.scale(o.scale || 1, o.scale || 1);
    letter(c, text, 0, 0, o.size || 120, o.col || '#ffd62e', { sticker: o.sticker !== false });
    c.restore();
  }

  window.KIT = {
    W, H, INK, PAPER, FONT, PAL, BEANCOLS, HOT, BHOT, MODES,
    // helpers
    h1, boil, mix, rgba, fmt, clamp, lerp, seg, beat, pulse, tone, K, useS, wobLine, wobRect,
    // painting primitives (jitter follows useS / opts.S)
    blob, wrect, smoothClosed, fillInk, wash, glow, shadow, letter,
    // frame
    frame, post, caption, floor, rug,
    // agents
    bean, crowd, cheap,
    // place
    chair, lamp, monitor, desk, window: windowP, humanRoom, rack, serverBox, corkboard, folder, door, house, keyGlyph, plane, paddle, sign,
    // counting
    tag, lights,
    // atmosphere
    zzz, confetti, sunburst, star, bubble, discoBall, sticker
  };
})();
