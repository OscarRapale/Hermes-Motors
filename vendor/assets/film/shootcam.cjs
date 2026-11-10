// Renders a camera move (and optional explode values) in one page load: one JPEG per frame.
// usage: node shootcam.cjs <url> <outDir> <frames.json> [w] [h] [startIndex]
//   frames.json: [{ "pos": [x,y,z], "look": [x,y,z], "e": 0 }, ...]   (e is optional, default 0)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [url, outDir, framesFile, w = '1920', h = '1080', start = '0'] = process.argv.slice(2);
  const frames = JSON.parse(fs.readFileSync(framesFile, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: process.env.GPU === '1' ? ['--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 200 });
  const t0 = Date.now();
  for (let i = Number(start); i < frames.length; i++) {
    const f = frames[i];
    await page.evaluate(([p, l, e]) => {
      const s = window.__three();
      s.camera.position.set(p[0], p[1], p[2]);
      s.camera.lookAt(l[0], l[1], l[2]);
      s.camera.updateMatrixWorld();
      window.__setExplode(e);
    }, [f.pos, f.look, f.e ?? 0]);
    await page.waitForFunction(() => window.__done, null, { timeout: 600000, polling: 50 });
    // read the canvas directly (preserveDrawingBuffer is on): far faster than a page screenshot under SwiftShader
    const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.95));
    fs.writeFileSync(path.join(outDir, 'f' + String(i).padStart(4, '0') + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    if (i % 10 === 0) console.log('frame', i, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  console.log('done', frames.length, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  await browser.close();
})();
