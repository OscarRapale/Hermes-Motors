/**
 * Hermes Motors livery tokens. Every colour on the car comes from here, so a new livery is
 * just a new object: geometry, decals and shaders read these keys.
 *
 *   paint      main body colour (60%)
 *   carbon     exposed carbon: floor, wings, halo, lower band (30%)
 *   accent     Redline: wing endplates, slipstream, tyre ring, hub (10%)
 *   ink        marks and car name on the paint
 *   onCarbon   wordmark on the carbon band
 *   onAccent   mark on the red endplates
 */
export type Livery = {
  paint: string
  carbon: string
  accent: string
  ink: string
  onCarbon: string
  onAccent: string
  rim: string
  tyre: string
  metal: string
  steel: string
  light: string
}

/** Race livery (brand book 04): Gallery White over carbon, Redline accents. */
export const FIRST_LIGHT: Livery = {
  paint: '#F4F4F5',
  carbon: '#0E0F11',
  accent: '#D5121E',
  ink: '#0E0F11',
  onCarbon: '#F4F4F5',
  onAccent: '#F4F4F5',
  rim: '#16171A',
  tyre: '#141416',
  metal: '#4B4F57',
  steel: '#6B7078',
  light: '#FF2A35',
}

/** Launch-night livery for the Day One reveal: the same car in Graphite before 06:00. */
export const BEFORE_DAWN: Livery = {
  ...FIRST_LIGHT,
  paint: '#1B1C20',
  ink: '#F4F4F5',
}

export const HERMES_LIVERY = FIRST_LIGHT
export const LIVERIES = { firstLight: FIRST_LIGHT, beforeDawn: BEFORE_DAWN } as const
