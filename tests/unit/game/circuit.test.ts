import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { messenger } from '@/content/facts'
import { WALL, circuit } from '@/lib/game/circuit'
import { MAP_POINTS, MESSENGER_KMH } from '@/lib/game/data'
import { GHOST_HIDDEN_S, gapAt, ghostPose, ghostSpeed, ghostVisible } from '@/lib/game/ghost'
import { circuitLayout, corners, forBuilder, kerbs, runoff } from '@/lib/game/layout'

const c = circuit()
const LAP = messenger.lapMs / 1000

describe('the data (ARCHITECTURE §7.1)', () => {
  it('is the prototype’s circuit map and the messenger’s speeds, unchanged', () => {
    const html = readFileSync(join(__dirname, '../../../docs/design/prototypes/TestDrive-Lap.dc.html'), 'utf8')
    expect(MAP_POINTS).toEqual(JSON.parse(html.match(/this\.PTS = (\[\[.*?\]\])/)![1]))
    expect(MESSENGER_KMH).toEqual(JSON.parse(html.match(/this\.SPD = (\[.*?\])/)![1]))
    expect(MAP_POINTS).toHaveLength(120)
    expect(MESSENGER_KMH).toHaveLength(120)
  })
})

describe('the circuit', () => {
  it('is scaled so the messenger’s speeds integrate to his lap: 3,119 m (facts.md §C)', () => {
    expect(c.ghostTimes.at(-1)).toBeCloseTo(LAP, 9)
    expect(c.scale).toBeCloseTo(3.975, 3)
    expect(c.length).toBeGreaterThan(3118.5)
    expect(c.length).toBeLessThan(3119.5)
    for (let i = 1; i < c.ghostTimes.length; i++) expect(c.ghostTimes[i]).toBeGreaterThan(c.ghostTimes[i - 1])
  })

  it('puts the sector lines where he passes 19.420 and 45.831 s: about a third and two thirds round', () => {
    const [s1, s2] = messenger.sectorsMs.map((ms) => ms / 1000)
    expect(c.ghostTimeAt(c.sectors[0])).toBeCloseTo(s1, 9)
    expect(c.ghostTimeAt(c.sectors[1])).toBeCloseTo(s1 + s2, 9)
    expect(Math.abs(c.sectors[0] - c.length / 3)).toBeLessThan(3)
    expect(Math.abs(c.sectors[1] - (2 * c.length) / 3)).toBeLessThan(3)
  })

  it('starts at the origin heading +Z, down the bottom straight', () => {
    const start = c.frameAt(0)
    expect(Math.hypot(start.x, start.z)).toBeLessThan(1e-9)
    expect(Math.abs(start.heading)).toBeLessThan(0.02)
    const on = c.frameAt(300)
    expect(Math.abs(on.x)).toBeLessThan(0.5)
    expect(on.z).toBeCloseTo(300, 0)
  })

  it('is closed and continuous, and turns once round', () => {
    const a = c.frameAt(0)
    const b = c.frameAt(c.length)
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(1e-9)
    let turned = 0
    let prev = c.frameAt(0)
    for (let s = 1; s <= Math.ceil(c.length); s++) {
      const f = c.frameAt(s)
      expect(Math.hypot(f.x - prev.x, f.z - prev.z)).toBeLessThan(1.001)
      turned += Math.atan2(Math.sin(f.heading - prev.heading), Math.cos(f.heading - prev.heading))
      prev = f
    }
    expect(Math.abs(turned)).toBeCloseTo(2 * Math.PI, 2)
  })

  it('leaves room for the walls: no corner tighter than the wall offset, no two parts of the lap closer than two walls', () => {
    let maxK = 0
    for (let s = 0; s < c.length; s += 0.5) maxK = Math.max(maxK, Math.abs(c.frameAt(s).curvature))
    expect(1 / maxK).toBeGreaterThan(3 * WALL)
    const pts = Array.from({ length: Math.floor(c.length / 4) }, (_, i) => c.frameAt(i * 4))
    let closest = Infinity
    for (let i = 0; i < pts.length; i++)
      for (let j = i + 1; j < pts.length; j++) {
        const along = Math.min(j - i, pts.length - (j - i)) * 4
        if (along > 200) closest = Math.min(closest, Math.hypot(pts[i].x - pts[j].x, pts[i].z - pts[j].z))
      }
    expect(closest).toBeGreaterThan(2 * WALL)
  })

  it('puts positive offsets on the driver’s left (+X when facing +Z, as in ProvingGround)', () => {
    const p = c.toWorld(100, 5)
    expect(p.x).toBeCloseTo(5, 3)
    expect(p.z).toBeCloseTo(100, 3)
  })
})

describe('the messenger (ARCHITECTURE §7.2)', () => {
  it('maps time to distance and back', () => {
    for (const s of [0, 10, 777, 1500, 2999, c.length]) expect(c.ghostDistanceAt(c.ghostTimeAt(s))).toBeCloseTo(s, 6)
    expect(c.ghostDistanceAt(-1)).toBe(0)
    expect(c.ghostDistanceAt(LAP + 5)).toBeCloseTo(c.length, 6)
  })

  it('rides the centre line, at his mean speed per map segment', () => {
    const p = ghostPose(c, 0)
    expect(Math.hypot(p.x, p.z)).toBeLessThan(1e-9)
    const t = 33.3
    const f = c.frameAt(c.ghostDistanceAt(t))
    expect(ghostPose(c, t)).toEqual({ x: f.x, z: f.z, heading: f.heading })
    expect(ghostSpeed(c, 0.1)).toBeCloseTo((MESSENGER_KMH[0] + MESSENGER_KMH[1]) / 2 / 3.6, 6)
  })

  it('is hidden for the first half second and after the finish', () => {
    expect(ghostVisible(GHOST_HIDDEN_S - 0.01, false)).toBe(false)
    expect(ghostVisible(GHOST_HIDDEN_S, false)).toBe(true)
    expect(ghostVisible(40, true)).toBe(false)
  })

  it('gives the live gap: positive behind him, negative ahead', () => {
    const s = 1500
    const his = c.ghostTimeAt(s)
    expect(gapAt(c, s, his + 0.25)).toBeCloseTo(0.25, 9)
    expect(gapAt(c, s, his - 0.1)).toBeCloseTo(-0.1, 9)
  })
})

describe('the layout for ProvingGround', () => {
  const list = corners(c)

  it('finds the corners: kerbs on the six tight ones, run-off outside the two fast sweepers', () => {
    expect(list).toHaveLength(8)
    expect(list.filter((k) => k.apex)).toHaveLength(6)
    const k = kerbs(c, list)
    expect(k).toHaveLength(12)
    for (const corner of list.filter((x) => x.apex)) {
      expect(k.some((span) => span.side === corner.turns && span.from === corner.apex![0])).toBe(true) // apex: inside
    }
    const r = runoff(c, list)
    expect(r).toHaveLength(2)
    for (const span of [...k, ...r]) {
      expect(span.from).toBeGreaterThanOrEqual(0)
      expect(span.to).toBeLessThanOrEqual(c.length)
      expect(span.to).toBeGreaterThan(span.from)
    }
  })

  it('hands three.js evenly spaced points: its road lies on our centre line, and kerbs land where we put them', () => {
    const layout = circuitLayout(c)
    expect(layout.closed).toBe(true)
    expect(layout.walls).toEqual({ left: WALL, right: -WALL })
    const curve = new THREE.CatmullRomCurve3(layout.points.map((p) => new THREE.Vector3(...p)), true, 'centripetal')
    const len = curve.getLength()
    expect(Math.abs(len - c.length) / c.length).toBeLessThan(0.001) // three measures from 200 chords
    // the same line: every point of three's curve is on ours (searching ±6 m along it)
    for (let d = 0; d < len; d += 37) {
      const p = curve.getPointAt(d / len)
      let near = Infinity
      for (let s = d - 6; s <= d + 6; s += 0.05) {
        const f = c.frameAt(s)
        near = Math.min(near, Math.hypot(p.x - f.x, p.z - f.z))
      }
      expect(near).toBeLessThan(0.1)
    }
    // spans rescaled into three's metres land on our distances
    const built = forBuilder(layout, len, c.length)
    for (const [ours, theirs] of layout.kerbs.map((k, i) => [k, built.kerbs[i]] as const)) {
      const p = curve.getPointAt(theirs.from / len)
      const f = c.frameAt(ours.from)
      expect(Math.hypot(p.x - f.x, p.z - f.z)).toBeLessThan(0.5)
    }
  })
})
