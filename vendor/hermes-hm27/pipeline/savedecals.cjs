const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, url, dir] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto(url); await p.waitForFunction(() => window.__done, null, { timeout: 60000 });
  const d = await p.evaluate(() => window.__decals);
  const meta = {};
  for (const [k, v] of Object.entries(d)) { fs.writeFileSync(`${dir}/${k}.png`, Buffer.from(v.url.split(',')[1], 'base64')); meta[k] = { w: v.w, h: v.h, aspect: +v.aspect.toFixed(4) }; }
  fs.writeFileSync(`${dir}/decals.json`, JSON.stringify(meta, null, 2)); console.log(JSON.stringify(meta));
  await b.close();
})();
