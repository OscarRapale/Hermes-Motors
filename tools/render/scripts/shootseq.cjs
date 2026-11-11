// Renders a sequence of explode values in one page load and saves each frame plus the camera and part positions.
// usage: node shootseq.cjs "<harness url>" <outDir> <e0,e1,...> [width] [height]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, url, outDir, list, w = '1600', h = '1000'] = process.argv;
  const values = list.split(',').map(Number);
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ args: process.env.GPU === '1' ? ['--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  p.on('pageerror', (e) => console.log('pageerror:', e.message));
  p.on('console', (m) => { if (m.type() === 'error') console.log('console.error:', m.text().slice(0, 300)); });
  const t0 = Date.now();
  await p.goto(url);
  await p.waitForFunction(() => window.__done, null, { timeout: 900000 });
  console.log('loaded in', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  const meta = [];
  for (let i = 0; i < values.length; i++) {
    const t1 = Date.now();
    await p.evaluate((e) => window.__setExplode(e), values[i]);
    await p.waitForFunction(() => window.__done, null, { timeout: 900000 });
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    const file = `${outDir}/f${String(i).padStart(2, '0')}.png`;
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
    const info = await p.evaluate(() => {
      const { scene, camera, size } = window.__three();
      const V = camera.position.constructor;
      const parts = {};
      for (const name of ['Body', 'Halo', 'FrontWing', 'RearWing', 'Floor', 'Suspension', 'Wheel_FL', 'Wheel_FR', 'Wheel_RL', 'Wheel_RR']) {
        const g = scene.getObjectByName(name);
        if (!g) continue;
        g.updateWorldMatrix(true, true);
        const min = new V(Infinity, Infinity, Infinity), max = new V(-Infinity, -Infinity, -Infinity);
        g.traverse((o) => {
          if (!o.isMesh || o.name.startsWith('Decal_')) return;
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          const bb = o.geometry.boundingBox;
          for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) {
            const v = new V(x, y, z).applyMatrix4(o.matrixWorld);
            min.min(v); max.max(v);
          }
        });
        parts[name] = { min: min.toArray(), max: max.toArray(), origin: new V().setFromMatrixPosition(g.matrixWorld).toArray() };
      }
      camera.updateMatrixWorld();
      return { parts, view: Array.from(camera.matrixWorldInverse.elements), proj: Array.from(camera.projectionMatrix.elements), w: size.width, h: size.height, pos: camera.position.toArray() };
    });
    meta.push({ i, e: values[i], ...info });
    console.log(file, ((Date.now() - t1) / 1000).toFixed(1) + 's');
  }
  fs.writeFileSync(`${outDir}/meta.json`, JSON.stringify(meta));
  await b.close();
})();
