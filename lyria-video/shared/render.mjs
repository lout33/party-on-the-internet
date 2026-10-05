// Usage (run from full-video/):
//   node shared/render.mjs stills --style a [--shots A0.1,B4.2 | --t 12,95.5] [--k 0.5] [--out out/a-stills]
//   node shared/render.mjs sheet  --style a [--cols 6] [--out out/a-sheet.jpg]        one tile per shot
//   node shared/render.mjs verify --style a                                           coverage + out-of-order determinism
//   node shared/render.mjs video  --style a [--fps 30] [--from 0 --to 182.1] [--out out/full-a-painted.mp4]
//   node shared/render.mjs sbs                                                        A left, B right, audio once -> out/full-side-by-side.mp4
// Same contract as fragment-test-01-drop/shared/render.mjs, over the complete song (time = absolute song seconds).
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, existsSync, writeFileSync, rmSync, statSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const here = dirname(fileURLToPath(import.meta.url));   // full-video/shared
const root = resolve(here, '..');                        // full-video/
const mode = process.argv[2];
const args = Object.fromEntries(process.argv.slice(3).reduce((a, x, i, arr) => {
  if (x.startsWith('--')) a.push([x.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return a;
}, []));
const NAMES = { a: 'a-painted', b: 'b-engraved' };
const timing = JSON.parse(readFileSync(resolve(here, 'timing.json'), 'utf8'));
const shots = JSON.parse(readFileSync(resolve(root, 'shots.json'), 'utf8')).shots;
const audio = resolve(here, timing.audio);
const dur = timing.t1 - timing.t0;
const fps = Number(args.fps || 30);

if (mode === 'sbs') {
  const out = resolve(root, args.out || 'out/full-side-by-side.mp4');
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', resolve(root, 'out/full-a-painted.mp4'), '-i', resolve(root, 'out/full-b-engraved.mp4'),
    '-filter_complex', '[0:v]scale=960:-1[a];[1:v]scale=960:-1[b];[a][b]hstack=inputs=2[v]', '-map', '[v]', '-map', '0:a',
    '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'copy', out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
  console.log(out);
  process.exit(0);
}

const style = args.style;
if (!['stills', 'sheet', 'verify', 'video'].includes(mode) || !NAMES[style]) { console.error('need mode stills|sheet|verify|video|sbs and --style a|b'); process.exit(1); }
const folder = NAMES[style];
mkdirSync(resolve(root, 'out'), { recursive: true });

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let p = resolve(root, '.' + url);
  if (url === '/stage.html') p = resolve(here, 'stage.html');
  if (url === '/timing.json') p = resolve(here, 'timing.json');
  if (url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (!p.startsWith(root) || !existsSync(p) || statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  const type = p.endsWith('.html') ? 'text/html' : p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') ? 'application/json' : 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const pageErrors = [];
// A not-yet-written section file is a 404; shot-scene.js already tolerates it and render.mjs warns about undrawn shots.
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) pageErrors.push(m.text()); });
page.on('pageerror', e => pageErrors.push(e.message));
await page.goto(`http://127.0.0.1:${port}/stage.html?style=${style}&folder=${folder}`);
await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
const missing = await page.evaluate(() => window.__shotList.filter(s => !window.SHOTS[s.id]).map(s => s.id));
if (args['allow-missing'] !== true && missing.length) console.error(`[warn] shots not drawn yet: ${missing.join(', ')}`);

const frame = (S, type = 'png') => page.evaluate(t => { window.__frame(t); return null; }, S)
  .then(() => page.locator('#c').screenshot(type === 'jpeg' ? { type, quality: 90 } : { type }));
const at = (s, k) => s.t0 + (s.t1 - s.t0) * k;

try {
  if (mode === 'stills') {
    const dir = resolve(root, args.out || `out/${style}-stills`); mkdirSync(dir, { recursive: true });
    const k = Number(args.k ?? 0.5);
    const jobs = args.t ? String(args.t).split(',').map(Number).map(t => [`t${t.toFixed(2)}`, t])
      : (args.shots ? shots.filter(s => String(args.shots).split(',').includes(s.id)) : shots).map(s => [s.id, at(s, k)]);
    for (const [name, S] of jobs) { const f = resolve(dir, `${name}.png`); writeFileSync(f, await frame(S)); console.log(f); }
  } else if (mode === 'sheet') {
    const cols = Number(args.cols || 6), k = Number(args.k ?? 0.5);
    const tmp = resolve(root, `out/.sheet-${style}`); mkdirSync(tmp, { recursive: true });
    for (let i = 0; i < shots.length; i++) writeFileSync(resolve(tmp, `g${String(i).padStart(3, '0')}.png`), await frame(at(shots[i], k)));
    const out = resolve(root, args.out || `out/${style}-sheet.jpg`);
    spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', resolve(tmp, 'g%03d.png'), '-vf', `scale=480:-1,tile=${cols}x${Math.ceil(shots.length / cols)}:padding=6:color=black`, '-frames:v', '1', out], { stdio: 'inherit' });
    rmSync(tmp, { recursive: true, force: true });
    console.log(out);
  } else if (mode === 'verify') {
    const times = shots.flatMap(s => [0.1, 0.5, 0.9].map(k => at(s, k)));
    const hash = png => createHash('sha256').update(png).digest('hex');
    const expected = new Map();
    for (const S of times) expected.set(S, hash(await frame(S)));
    for (const S of [...times].reverse()) if (hash(await frame(S)) !== expected.get(S)) throw new Error(`Frame changes with render order at ${S.toFixed(3)}s`);
    if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join('; ')}`);
    console.log(`PASS (${style}): ${shots.length} shots, ${missing.length} not drawn; ${times.length} frames identical in forward and reverse order`);
  } else if (mode === 'video') {
    const from = Number(args.from ?? 0), to = Number(args.to ?? dur);
    const out = resolve(root, args.out || `out/full-${folder}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'mjpeg', '-i', 'pipe:0',
      '-ss', String(timing.t0 + from), '-t', String(to - from), '-i', audio,
      '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k',
      '-af', `afade=t=in:st=0:d=0.02,afade=t=out:st=${(to - from - 1.6).toFixed(2)}:d=1.6`, '-t', String(to - from), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => { ff.on('error', rej); ff.on('close', c => c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))); });
    const total = Math.round((to - from) * fps);
    try {
      for (let i = 0; i < total; i++) {
        const buf = await frame(from + (i + 0.5) / fps, 'jpeg');
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if (i % (fps * 10) === 0) process.stdout.write(`\r${i}/${total}`);
      }
      ff.stdin.end(); await done;
      if (pageErrors.length) throw new Error(`Page errors: ${pageErrors.join('; ')}`);
      console.log(`\n${out} (${total} frames at ${fps} fps)`);
    } catch (err) { ff.stdin.destroy(); ff.kill(); await done.catch(() => {}); throw err; }
  }
} finally {
  await browser.close();
  server.close();
}
