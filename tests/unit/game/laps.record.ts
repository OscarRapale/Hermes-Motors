// Records the reference laps: `npm run laps:record`. Run it only when the physics or tuning change on
// purpose, and say so in the PR; the replay test then holds the new times.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { it } from 'vitest'
import { circuit } from '@/lib/game/circuit'
import { replay } from '@/lib/game/replay'
import { drive } from './autopilot'
import { REFERENCE_LAPS } from './reference-laps'

it('records the reference laps', () => {
  const c = circuit()
  for (const lap of REFERENCE_LAPS) {
    const log = drive(c, lap.style, lap.seed)
    const end = replay(c, log)
    if (!end.result) throw new Error(`${lap.name}: the lap didn't finish`)
    const expected = { lapMs: end.result.lapMs, sectorsMs: end.result.sectorsMs, wallHits: end.car.wallHits }
    const body = JSON.stringify({ name: lap.name, about: lap.about, expected, seed: log.seed, frames: log.frames })
    writeFileSync(join(__dirname, 'laps', `${lap.name}.json`), body + '\n')
    console.log(lap.name, expected)
  }
})
