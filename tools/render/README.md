# Render harness

Copied from `vendor/hermes-hm27/tools/render` (package v2.2). It renders stills, specs frames and
helmet stills from the same components the site uses; see "Re-rendering the images" in
`vendor/hermes-hm27/README.md` for parameters and scripts.

One deliberate change from the package: `npm run sync` copies the components from
`../../components/hermes` (the site's copy) instead of `../../src/hermes`. Models, livery and track
textures come from the site's `public/` (`vite.config.ts` → `publicDir: '../../public'`).

It has its own `package.json` and is excluded from the site's TypeScript, ESLint and build.

```bash
cd tools/render
npm i && npx playwright install chromium
npm run sync
npm run build && npm run serve        # http://127.0.0.1:8766
GPU=1 node scripts/shootapp.cjs "http://127.0.0.1:8766/?view=landing&transparent=1&dpr=2" hero.png 1600 1000
```

Outputs go to `public/images/` as AVIF + WebP (via `npm run assets` or sharp), with the command
noted in `docs/design/assets.md`.
