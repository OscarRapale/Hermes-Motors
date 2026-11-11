// The First Light ignition (docs/design/11-motion.md): 2600 ms. For the first 42% every needle
// sweeps to full scale and the LEDs light left to right; then the needles settle on their values
// while the LEDs drain and the numbers count up. Ease-out cubic throughout.

import { hm27, rules } from '@/content/facts'
import { easeOut } from '@/lib/motion'

export const IGNITION_MS = 2600
export const SWEEP_SHARE = 0.42
export const DIAL_SWEEP_DEG = 270
export const DIAL_START_DEG = 135
export const DAY_LEDS = 15
/** sessionStorage: the ignition has played once this session (02-landing: once per session). */
export const IGNITED_KEY = 'hermes.ignited'

export { easeOut }

/** Progress t (0…1) → the two phases. */
export function ignitionPhases(t: number): { sweep: number; settle: number } {
  const c = Math.min(1, Math.max(0, t))
  return c < SWEEP_SHARE
    ? { sweep: easeOut(c / SWEEP_SHARE), settle: 0 }
    : { sweep: 1, settle: easeOut((c - SWEEP_SHARE) / (1 - SWEEP_SHARE)) }
}

/** How far round its scale (0…1) a needle is at t, settling on `fraction`. */
export function needleAt(fraction: number, t: number): number {
  const { sweep, settle } = ignitionPhases(t)
  return t < SWEEP_SHARE ? sweep : 1 + (fraction - 1) * settle
}

/** The number shown at t: counts up during the settle. */
export function valueAt(value: number, t: number): number {
  return value * ignitionPhases(t).settle
}

export function dayLedsAt(t: number): number {
  const { sweep, settle } = ignitionPhases(t)
  return Math.round(DAY_LEDS * (t < SWEEP_SHARE ? sweep : 1 - settle))
}

export const needleDeg = (fraction: number) => DIAL_START_DEG + DIAL_SWEEP_DEG * fraction

export type DialId = 'zeroToHundred' | 'topSpeed' | 'power' | 'minMass' | 'mguk'
export type PowerUnit = 'hp' | 'kw'
export type DialReading = { value: number; max: number; decimals: number }

/**
 * Each dial's value (facts.ts) on its scale. The scale maxima are display constants from the
 * prototype (Landing-v2-BeforeDawn renderVals), not facts.
 */
export function dialReading(id: DialId, unit: PowerUnit = 'hp'): DialReading {
  switch (id) {
    case 'zeroToHundred':
      return { value: hm27.zeroToHundredS, max: 5, decimals: 1 }
    case 'topSpeed':
      return { value: hm27.topSpeedKmh, max: 400, decimals: 0 }
    case 'power':
      return unit === 'kw'
        ? { value: rules.systemPowerKw, max: 820, decimals: 0 }
        : { value: rules.systemPowerHp, max: 1100, decimals: 0 }
    case 'minMass':
      return { value: rules.minMassKg, max: 1000, decimals: 0 }
    case 'mguk':
      return { value: rules.mgukKw, max: 400, decimals: 0 }
  }
}

export function formatReading(value: number, decimals: number): string {
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US')
}

/** Dash pattern for ticks every `step` units across the 270-unit scale of a 360-unit circle. */
export function tickDashes(step: number, mark: number): string {
  const count = DIAL_SWEEP_DEG / step
  const parts: string[] = []
  for (let i = 0; i < count; i++) parts.push(`${mark} ${step - mark}`)
  parts.push(`${mark} ${360 - DIAL_SWEEP_DEG - mark}`)
  return parts.join(' ')
}
