import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { encodeWav, normalise, seamlessLoop, toMono } from '@/lib/audio/loop'
import { resetSoundForTests, setSoundOn, SOUND_KEY, soundOn, subscribeSound } from '@/lib/audio/prefs'
import { SOUNDS } from '@/lib/audio/sounds'

describe('seamlessLoop', () => {
  // a ramp: every sample differs from its neighbour by exactly 1/1000
  const ramp = Float32Array.from({ length: 1000 }, (_, i) => i / 1000)

  it('keeps the stretch outside the crossfade as recorded', () => {
    const loop = seamlessLoop(ramp, 100, 600, 50)
    expect(loop.length).toBe(500)
    expect(loop[50]).toBeCloseTo(ramp[150]!, 6)
    expect(loop[499]).toBeCloseTo(ramp[599]!, 6)
  })

  it('runs the last sample on into the first: the loop point has no jump', () => {
    // a sine whose period doesn't divide the loop length: cut plainly, the wrap jumps
    const sine = Float32Array.from({ length: 4000 }, (_, i) => Math.sin(i / 7.3))
    const plain = sine.slice(500, 3000)
    const loop = seamlessLoop(sine, 500, 3000, 400)
    const step = (a: Float32Array) => Math.abs(a[0]! - a[a.length - 1]!)
    const typical = Math.abs(Math.sin(1 / 7.3)) // the largest step between neighbours in the sine
    expect(step(plain)).toBeGreaterThan(typical)
    expect(step(loop)).toBeLessThanOrEqual(typical + 1e-6)
  })

  it('refuses a stretch that runs past the recording', () => {
    expect(() => seamlessLoop(ramp, 0, 990, 50)).toThrow(RangeError)
    expect(() => seamlessLoop(ramp, 0, 100, 0)).toThrow(RangeError)
  })
})

describe('toMono, normalise, encodeWav', () => {
  it('averages channels', () => {
    expect([...toMono([Float32Array.of(1, 0), Float32Array.of(0, 0.5)])]).toEqual([0.5, 0.25])
  })

  it('scales the peak', () => {
    const out = normalise(Float32Array.of(0.1, -0.5, 0.25), 0.9)
    expect(Math.max(...out.map(Math.abs))).toBeCloseTo(0.9, 6)
    expect(normalise(new Float32Array(3), 0.9)).toEqual(new Float32Array(3))
  })

  it('writes a 16-bit mono WAV header and clamps', () => {
    const wav = encodeWav(Float32Array.of(0, 1, -1, 2), 32_000)
    const v = new DataView(wav.buffer)
    const text = (at: number) => String.fromCharCode(...wav.subarray(at, at + 4))
    expect([text(0), text(8), text(12), text(36)]).toEqual(['RIFF', 'WAVE', 'fmt ', 'data'])
    expect(v.getUint16(22, true)).toBe(1) // mono
    expect(v.getUint32(24, true)).toBe(32_000)
    expect(v.getUint16(34, true)).toBe(16)
    expect(v.getUint32(40, true)).toBe(8)
    expect([1, 2, 3].map((i) => v.getInt16(44 + i * 2, true))).toEqual([0x7fff, -0x7fff, 0x7fff])
  })
})

describe('the sound preference', () => {
  let store: Map<string, string>
  beforeEach(() => {
    store = new Map()
    globalThis.localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    } as Storage
    resetSoundForTests()
  })
  afterEach(() => {
    // @ts-expect-error -- remove the stub
    delete globalThis.localStorage
    resetSoundForTests()
  })

  it('is on by default and stores nothing', () => {
    expect(soundOn()).toBe(true)
    expect(store.size).toBe(0)
  })

  it('remembers off, forgets it when turned back on, and tells listeners', () => {
    const heard: boolean[] = []
    subscribeSound(() => heard.push(soundOn()))
    setSoundOn(false)
    expect(store.get(SOUND_KEY)).toBe('off')
    resetSoundForTests()
    expect(soundOn()).toBe(false) // read back from storage
    subscribeSound(() => heard.push(soundOn()))
    setSoundOn(true)
    expect(store.has(SOUND_KEY)).toBe(false)
    expect(heard).toEqual([false, true])
  })

  it('stays on, unremembered, when storage throws', () => {
    globalThis.localStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    } as unknown as Storage
    expect(soundOn()).toBe(true)
    setSoundOn(false)
    expect(soundOn()).toBe(false)
  })
})

describe('the sound files', () => {
  it('are in public/, small, and the engine loop is the mono WAV the assets script writes', () => {
    for (const src of Object.values(SOUNDS)) expect(statSync(join(process.cwd(), 'public', src)).size).toBeLessThan(200 * 1024)
    const wav = readFileSync(join(process.cwd(), 'public', SOUNDS.engine))
    expect(wav.toString('latin1', 0, 4)).toBe('RIFF')
    expect(wav.readUInt16LE(22)).toBe(1)
    expect(wav.readUInt32LE(40) / 2 / wav.readUInt32LE(24)).toBeCloseTo(2.6, 2) // 2.6 s
  })
})
