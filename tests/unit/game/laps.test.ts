import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { messenger } from '@/content/facts'
import { circuit } from '@/lib/game/circuit'
import { replay, type InputLog } from '@/lib/game/replay'

// The reference laps (ARCHITECTURE §7.3), recorded by `npm run laps:record`: CI keeps their times, so a
// change to the physics or the tuning shows up here, and is re-recorded on purpose.

type Recorded = InputLog & { name: string; expected: { lapMs: number; sectorsMs: number[]; wallHits: number } }

const dir = join(__dirname, 'laps')
const laps: Recorded[] = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')))
const lap = (name: string) => laps.find((l) => l.name === name)!
const c = circuit()

describe('the reference laps', () => {
  it('are all there', () => {
    expect(laps.map((l) => l.name).sort()).toEqual(['careful', 'clean', 'wall'])
  })

  it.each(['clean', 'careful', 'wall'])('%s replays to its recorded times', (name) => {
    const { expected, seed, frames } = lap(name)
    const end = replay(c, { seed, frames })
    expect(end.result).not.toBeNull()
    expect(end.result!.lapMs).toBe(expected.lapMs)
    expect(end.result!.sectorsMs).toEqual(expected.sectorsMs)
    expect(end.car.wallHits).toBe(expected.wallHits)
  })

  it('a careful lap lands just behind the messenger, a clean one beats him by 2–5 s (the tuning target, D28)', () => {
    const careful = lap('careful').expected.lapMs - messenger.lapMs
    expect(careful).toBeGreaterThanOrEqual(0)
    expect(careful).toBeLessThanOrEqual(800)
    const clean = messenger.lapMs - lap('clean').expected.lapMs
    expect(clean).toBeGreaterThanOrEqual(2000)
    expect(clean).toBeLessThanOrEqual(5000)
  })

  it('a careful lap is slower, and so is one that hits the wall', () => {
    expect(lap('careful').expected.lapMs).toBeGreaterThan(lap('clean').expected.lapMs + 2000)
    expect(lap('wall').expected.wallHits).toBeGreaterThan(0)
    expect(lap('wall').expected.lapMs).toBeGreaterThan(lap('clean').expected.lapMs)
  })

  it('replays the same, every time (deterministic)', () => {
    const { seed, frames } = lap('wall')
    expect(replay(c, { seed, frames })).toEqual(replay(c, { seed, frames }))
  })
})
