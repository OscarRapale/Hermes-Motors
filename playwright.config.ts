import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const isCI = !!process.env.CI
const WEBGL = /\.webgl\.spec\.ts$/

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  // ARCHITECTURE §2: desktop Chrome, Pixel 7, iPhone 14 landscape. The live 3D tests (*.webgl.spec.ts)
  // draw WebGL in software, seconds per frame: they run on desktop only, after the others, so they
  // don't starve the timing of the rest.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: WEBGL },
    { name: 'pixel-7', use: { ...devices['Pixel 7'] }, testIgnore: WEBGL },
    { name: 'iphone-14-landscape', use: { ...devices['iPhone 14 landscape'] }, testIgnore: WEBGL },
    {
      name: 'webgl',
      use: { ...devices['Desktop Chrome'] },
      testMatch: WEBGL,
      dependencies: ['desktop', 'pixel-7', 'iphone-14-landscape'],
    },
  ],
  // CI builds in an earlier step; locally `npm run e2e` builds first.
  webServer: {
    command: isCI ? `npm run start -- -p ${PORT}` : `npm run build && npm run start -- -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
