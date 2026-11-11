import { describe, expect, it } from 'vitest'
import layout from '@/content/specs-layout.json'
import { canvasPlacement } from '@/lib/specs/live'

describe('live canvas placement (lines the 3D car up with the frames)', () => {
  it('scales and offsets the render so the crop fills the car box', () => {
    // a 1600 × 1000 render at dpr 2 (3200 × 2000 device px), cropped to (400, 200)–(2800, 1400)
    const p = canvasPlacement({ box: [400, 200, 2800, 1400], dpr: 2, render: [1600, 1000] })
    // crop = 1200 × 600 css px at (200, 100): the canvas is 1600/1200 of the box wide, shifted left
    expect(p.width).toBeCloseTo((100 * 1600) / 1200)
    expect(p.height).toBeCloseTo((100 * 1000) / 600)
    expect(p.left).toBeCloseTo((-100 * 200) / 1200)
    expect(p.top).toBeCloseTo((-100 * 100) / 600)
    // the crop's far corner lands on the box's far corner
    expect(p.left + (p.width * 1400) / 1600).toBeCloseTo(100)
    expect(p.top + (p.height * 700) / 1000).toBeCloseTo(100)
  })

  it('specs-layout.json records the crop, and it matches the frames’ aspect', () => {
    const { box, dpr, render } = layout.crop
    expect(box).toHaveLength(4)
    expect(dpr).toBeGreaterThan(0)
    expect(render).toEqual([1600, 1000])
    const aspect = (box[2] - box[0]) / (box[3] - box[1])
    expect(aspect).toBeCloseTo(layout.size[0] / layout.size[1], 2)
  })
})
