// Renders the gantry sign (HERMES PROVING GROUND) to a PNG with the brand font.
// usage: node scripts/sign.cjs ../../public/track/sign.png
const { chromium } = require('playwright');
(async () => {
  const [,, out] = process.argv;
  const FONT = require.resolve('@fontsource/michroma/files/michroma-latin-400-normal.woff2');
  const html = `<!doctype html><html><head><style>
@font-face{font-family:'Michroma';src:url('${require('url').pathToFileURL(FONT).href}') format('woff2')}
html,body{margin:0}
.s{width:2048px;height:128px;background:#16171A;display:flex;align-items:center;gap:34px;padding:0 48px;box-sizing:border-box;position:relative}
.s::after{content:'';position:absolute;left:0;right:0;bottom:0;height:10px;background:#D5121E}
.t{font-family:'Michroma';font-size:46px;letter-spacing:.34em;color:#F4F4F5;white-space:nowrap}
</style></head><body><div class="s"><svg viewBox="0 0 120 80" width="126" height="84"><path d="M50,72 L64,72 L80,8 L66,8 Z M78,72 L92,72 L108,8 L94,8 Z M70,46 L86,46 L88.5,36 L72.5,36 Z" fill="#F4F4F5"/><path d="M59,23 L57,32 L13,18 L6,10 Z M55.5,38 L53.5,46.5 L20,35.5 L14,27.5 Z M52,53 L50,61 L29,53.5 L24,45.5 Z" fill="#D5121E"/></svg><span class="t">HERMES PROVING GROUND</span></div></body></html>`;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2048, height: 128 } });
  await p.setContent(html);
  await p.evaluate(() => document.fonts.ready);
  await p.locator('.s').screenshot({ path: out });
  await b.close();
})();
