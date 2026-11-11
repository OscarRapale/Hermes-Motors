import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// `npm run laps:record` (mode "record") runs only the recorder that writes the reference laps
// (tests/unit/game/laps/); every other run replays them and never rewrites them.
export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: mode === 'record' ? ['tests/unit/game/laps.record.ts'] : ['tests/unit/**/*.test.ts'],
  },
}))
