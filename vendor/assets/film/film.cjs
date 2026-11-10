// Draws the First Light film's scenes from film.html, one JPEG per frame, then encodes each scene to its own MP4.
// usage: node film.cjs <scene> [<scene> ...]   scenes: dawn count reveal apart end   (or: frames <scene> <f> for one check frame)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const S = '/tmp/claude-0/-home-claude/8daa4172-7fb4-5970-8668-08bf2ab63a0a/scratchpad';
const FILM = S + '/film';
const FS = S + '/preview/node_modules';
const url = (p) => 'file://' + p;
const pad = (n) => String(n).padStart(4, '0');
const face = (fam, f, w) => `@font-face{font-family:'${fam}';src:url('file://${f}') format('woff2');font-weight:${w};font-display:block}`;
const FONTS = [
  face('Michroma', `${FS}/@fontsource/michroma/files/michroma-latin-400-normal.woff2`, '400'),
  face('Geist', `${FS}/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2`, '100 900'),
  face('Geist Mono', `${FS}/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2`, '100 900'),
].join('');

const LEN = { dawn: 120, count: 120, reveal: 180, apart: 135, end: 165 };
function options(scene) {
  if (scene === 'count') return { night: url(S + '/car/landing/hm27-landing-night.webp') };
  if (scene === 'reveal') return { shots: Array.from({ length: 180 }, (_, i) => url(`${FILM}/orbit/f${pad(i)}.jpg`)), under: url(`${FILM}/scenes/count/f0119.jpg`) };
  if (scene === 'apart') {
    // hold, open over 42 frames, hold open, close over 17, hold closed
    const seq = [].concat(Array(10).fill(0), Array.from({ length: 42 }, (_, i) => i), Array(36).fill(41), Array.from({ length: 17 }, (_, i) => 42 + i), Array(30).fill(58));
    return { shots: seq.map((k) => url(`${FILM}/explode/f${pad(k)}.jpg`)), under: url(`${FILM}/scenes/reveal/f0179.jpg`) };
  }
  if (scene === 'end') return { under: url(`${FILM}/scenes/apart/f0134.jpg`) };
  return {};
}

(async () => {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(url(FILM + '/film.html'));
  await page.evaluate((css) => { document.getElementById('fonts').textContent = css; return document.fonts.ready; }, FONTS);
  await page.evaluate(() => Promise.all(['400 20px Michroma', '400 20px Geist', '400 20px "Geist Mono"'].map((f) => document.fonts.load(f))));
  if (args[0] === 'frames') {
    const [, scene, ...fs_] = args;
    for (const f of fs_.map(Number)) {
      await page.evaluate(([s, f, o]) => window.render(s, f, o), [scene, f, options(scene)]);
      await page.screenshot({ path: `${FILM}/check-${scene}-${pad(f)}.jpg`, type: 'jpeg', quality: 92 });
    }
    await browser.close();
    return;
  }
  for (const scene of args) {
    const dir = `${FILM}/scenes/${scene}`;
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const opt = options(scene);
    const t0 = Date.now();
    for (let f = 0; f < LEN[scene]; f++) {
      await page.evaluate(([s, f, o]) => window.render(s, f, o), [scene, f, opt]);
      await page.screenshot({ path: `${dir}/f${pad(f)}.jpg`, type: 'jpeg', quality: 92 });
    }
    const tmp = `${FILM}/scenes/${scene}.tmp.mp4`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${dir}/f%04d.jpg`, '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-r', '30', tmp]);
    fs.renameSync(tmp, `${FILM}/scenes/${scene}.mp4`);
    console.log(scene, LEN[scene], 'frames', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  await browser.close();
})();
