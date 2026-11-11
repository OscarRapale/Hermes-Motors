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
} as const

/** §B The HM-27's own figures: fictional, set by the brand; never present them as rules. */
export const hm27 = {
  zeroToHundredS: 2.6,
  topSpeedKmh: 352,
} as const

/** §C The test drive: the messenger (the test driver's ghost). Times in milliseconds. */
export const messenger = {
  lapMs: 71_906,
  sectorsMs: [19_420, 26_411, 26_075],
} as const
