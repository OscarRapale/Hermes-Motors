// Numbers from docs/content/facts.md, with their section. Every figure on the site comes from here.

/** §A From the 2026 technical rules (sourced in facts.md). */
export const rules = {
  /** Power unit output: combustion ~400 kW + MGU-K 350 kW (Honda); 1 kW = 1.341 hp */
  systemPowerKw: 750,
  systemPowerHp: 1006,
  combustionKw: 400,
  mgukKw: 350,
  /** "almost equally" (Honda): shown as 50/50 */
  splitLabel: '50/50',
  minMassKg: 768,
  wheelbaseMm: 3400,
  energyPerLapMj: 8.5,
  sustainableFuelPct: 100,
  /** Active aero: Straight and Corner modes; moving elements front 2, rear 3 */
  aeroModes: 2,
  frontWingElements: 2,
  rearWingElements: 3,
  /** Halo: grade 5 titanium, 125 kN (about 12 tonnes) from above for 5 s, and from the side */
  haloLoadKn: 125,
  haloLoadTonnes: 12,
  haloHoldS: 5,
  haloGrade: 5,
  /** Tyres: 25 mm narrower front, 30 mm rear; 18-inch rims */
  rimInches: 18,
  frontTyreNarrowerMm: 25,
  rearTyreNarrowerMm: 30,
  /** "1.6-litre V6 turbo" */
  engineLitres: 1.6,
} as const

/** §B The HM-27's own figures: fictional, set by the brand; never present them as rules. */
export const hm27 = {
  zeroToHundredS: 2.6,
  topSpeedKmh: 352,
  /** Overall length of the model, mm (§B: 5.54 m) */
  lengthMm: 5540,
  /** The Store's die-cast: 1:18, 31 cm long (§B) */
  scaleModel: { scale: 18, lengthCm: 31 },
} as const

/** §C The test drive: the messenger (the test driver's ghost). Times in milliseconds. */
export const messenger = {
  lapMs: 71_906,
  sectorsMs: [19_420, 26_411, 26_075],
} as const
