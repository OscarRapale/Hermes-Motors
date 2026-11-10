const { chromium } = require('playwright');
(async () => {
  const [,, url, out, w = '1600', h = '1000'] = process.argv;
  const b = await chromium.launch({ args: process.env.GPU === '1' ? ['--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console.' + m.type() + ':', m.text().slice(0, 300)); });
  const t0 = Date.now();
  await p.goto(url);
  await p.waitForFunction(() => window.__done, null, { timeout: 900000 });
  const info = await p.evaluate(() => window.__done);
  const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  require('fs').writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  console.log(JSON.stringify(info), ((Date.now() - t0) / 1000).toFixed(1) + 's');
  await b.close();
})();
