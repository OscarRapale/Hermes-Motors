// The specs section (docs/content/copy.md → Specs — five chapters; docs/design/03-specs.md).
// Numbers come from content/facts.ts. Michroma headlines in capitals; the middle line is dimmed.

import { rules } from '@/content/facts'

const n = (v: number) => v.toLocaleString('en-US')

export type SpecFigure = {
  value: number
  decimals?: number
  unit: string
  label: string
  /** Sealed until First Light (Decision D19): one of the Before Dawn panel's five figures. */
  sealed?: boolean
}

/** Anchor keys in content/specs-layout.json (frame pixels, per frame). */
export type AnchorKey = 'frontWing' | 'rearWing' | 'halo' | 'wheel' | 'floor' | 'power'

export type Callout = {
  anchor: AnchorKey
  text: string
  /** Shortened chip for phones (copy.md) */
  phone: string
  /** Where the chip sits relative to its dot (03-specs → Callouts) */
  place: 'above' | 'below' | 'aboveRight'
  /** Phone placement when it differs */
  placePhone?: 'above' | 'below' | 'belowRight'
  /** Names a sealed figure: hidden at night (Decision D19) */
  sealed?: boolean
}

export type Chapter = {
  number: string
  label: string
  rail: string
  headline: readonly [string, string, string]
  body: string
  /** Night version (Decision D21, placeholder copy): chapter 5's headline and body are its sealed numbers. */
  night?: { headline: readonly [string, string, string]; body: string }
  figures: readonly SpecFigure[]
  carAlt: string
  callouts: readonly Callout[]
}

export const chapters: readonly Chapter[] = [
  {
    number: '01',
    label: 'THE CAR',
    rail: '01 THE CAR',
    headline: ['EVERY PART', 'CARRIES THE', 'MESSAGE.'],
    body: 'Shorter, narrower and lighter than the cars before it, built to the 2026 rules. Keep scrolling and it comes apart.',
    figures: [
      { value: rules.minMassKg, unit: 'KG', label: 'MINIMUM MASS', sealed: true },
      { value: rules.wheelbaseMm, unit: 'MM', label: 'WHEELBASE' },
    ],
    carAlt: `The HM‑27 in one piece, its ${n(rules.wheelbaseMm)} mm wheelbase marked on the ground`,
    callouts: [], // chapter 1 draws the wheelbase line instead (wheelbase below)
  },
  {
    number: '02',
    label: 'ACTIVE AERO',
    rail: '02 ACTIVE AERO',
    headline: ['AIR THAT', 'CHANGES', 'SHAPE.'],
    body: 'Both wings move. Straight mode opens them to cut drag; corner mode closes them for grip. No DRS, and no waiting for a gap.',
    figures: [
      { value: rules.aeroModes, unit: 'MODES', label: 'STRAIGHT AND CORNER' },
      {
        value: rules.frontWingElements + rules.rearWingElements,
        unit: 'ELEMENTS',
        label: `${rules.frontWingElements} FRONT, ${rules.rearWingElements} REAR`,
      },
    ],
    carAlt: 'The HM‑27 with its front wing pulled forward and its rear wing lifted back',
    callouts: [
      {
        anchor: 'frontWing',
        text: `FRONT WING · ${rules.frontWingElements} MOVING ELEMENTS`,
        phone: `FRONT WING · ${rules.frontWingElements}`,
        place: 'below',
      },
      {
        anchor: 'rearWing',
        text: `REAR WING · ${rules.rearWingElements} MOVING ELEMENTS`,
        phone: `REAR WING · ${rules.rearWingElements}`,
        place: 'aboveRight',
        placePhone: 'belowRight',
      },
    ],
  },
  {
    number: '03',
    label: 'HALO',
    rail: '03 HALO',
    headline: ['A RING OF', `GRADE ${rules.haloGrade}`, 'TITANIUM.'],
    body: `It sits over the driver's head and has to hold ${rules.haloLoadKn} kN, about ${rules.haloLoadTonnes} tonnes, pressed from above or from the side.`,
    figures: [
      { value: rules.haloLoadKn, unit: 'kN', label: 'TESTED LOAD, ABOVE AND SIDE' },
      { value: rules.haloHoldS, unit: 'S', label: 'HELD FROM ABOVE' },
    ],
    carAlt: 'The halo lifted clear of the cockpit',
    callouts: [
      { anchor: 'halo', text: `HALO · GRADE ${rules.haloGrade} TITANIUM`, phone: 'HALO', place: 'above', placePhone: 'below' },
    ],
  },
  {
    number: '04',
    label: 'FLOOR & WHEELS',
    rail: '04 FLOOR & WHEELS',
    headline: ['WHERE IT', 'MEETS THE', 'TRACK.'],
    body: `A flat floor replaces the venturi tunnels of the last generation. The tyres are narrower, ${rules.frontTyreNarrowerMm} mm at the front and ${rules.rearTyreNarrowerMm} mm at the rear, still on ${rules.rimInches}-inch rims.`,
    figures: [
      { value: rules.rimInches, unit: 'IN', label: 'RIMS' },
      { value: rules.rearTyreNarrowerMm, unit: 'MM', label: 'NARROWER REAR TYRES' },
    ],
    carAlt: 'Body and wheels lifted off the floor, every part apart',
    callouts: [
      { anchor: 'wheel', text: `${rules.rimInches}-INCH RIMS`, phone: `${rules.rimInches}-INCH RIMS`, place: 'above', placePhone: 'below' },
      { anchor: 'floor', text: 'FLAT FLOOR', phone: 'FLAT FLOOR', place: 'above' },
    ],
  },
  {
    number: '05',
    label: 'POWER',
    rail: '05 POWER',
    headline: [`${n(rules.systemPowerHp)} HP.`, 'HALF OF IT', 'ELECTRIC.'],
    body: `A ${rules.engineLitres}-litre V6 turbo makes ${rules.combustionKw} kW and the electric motor ${rules.mgukKw} kW, on ${rules.sustainableFuelPct}% sustainable fuel. Every lap it recovers ${rules.energyPerLapMj} MJ to spend again.`,
    night: {
      headline: ['THE NUMBER', 'ARRIVES AT', '06:00.'],
      body: `A ${rules.engineLitres}-litre V6 turbo and an electric motor, on ${rules.sustainableFuelPct}% sustainable fuel. What they make together stays sealed until first light.`,
    },
    figures: [], // chapter 5 shows the power panel
    carAlt: 'The HM‑27 back in one piece',
    callouts: [
      {
        anchor: 'power',
        text: `${n(rules.systemPowerKw)} kW · V6 + ELECTRIC`,
        phone: `${n(rules.systemPowerKw)} kW`,
        place: 'above',
        sealed: true,
      },
    ],
  },
]

/** Chapter 1's wheelbase line and chip (anchors wbFront → wbRear). */
export const wheelbase = {
  text: `${n(rules.wheelbaseMm)} MM WHEELBASE`,
  phone: `${n(rules.wheelbaseMm)} MM`,
}

/** Chapter 5's power panel (board 11). */
export const powerPanel = {
  title: 'SYSTEM POWER',
  value: rules.systemPowerKw,
  unit: 'kW',
  /** The split bar, combustion | electric, in % of system power */
  split: [(100 * rules.combustionKw) / rules.systemPowerKw, (100 * rules.mgukKw) / rules.systemPowerKw] as const,
  combustion: `V6 TURBO · ${rules.combustionKw} kW`,
  electric: `ELECTRIC · ${rules.mgukKw} kW`,
  energy: { value: rules.energyPerLapMj, decimals: 1, unit: 'MJ', label: 'RECOVERED PER LAP' },
  fuel: { value: rules.sustainableFuelPct, unit: '%', label: 'SUSTAINABLE FUEL' },
}

export const specsCopy = {
  sectionLabel: 'HM‑27 specification',
  railLabel: 'Spec chapters',
  play: 'Play the scroll',
  pause: 'Pause',
  playPhone: 'Play all chapters',
  cta: 'Take it for a test drive',
  sealed: 'SEALED UNTIL 06:00',
  of: '/ 05',
} as const
