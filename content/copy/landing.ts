// Landing hero copy (docs/content/copy.md → Landing — Before Dawn / First Light).
// Michroma headlines in capitals; arrays are the three lines, the middle one dimmed.

import { hm27, rules } from '@/content/facts'

export const beforeDawn = {
  outline: '06:00',
  carChip: 'THE HM‑27 WAKES AT 06:00',
  carAlt: 'The HM‑27 before dawn: a graphite car in the dark, lit from behind by a red glow',
  eyebrow: 'BEFORE DAWN · DAY ONE',
  headline: ['A MESSAGE', 'IS ON ITS', 'WAY.'] as const,
  body: 'At 06:00 the HM‑27 meets first light, streamed live from the Proving Ground. Until then, it waits in the dark.',
  ctaCalendar: 'Be here at 06:00',
  ctaManifesto: 'Read the manifesto',
  panel: {
    nightMode: 'NIGHT MODE',
    until: 'UNTIL FIRST LIGHT',
    timerLabel: 'Time until first light',
    days: 'DAYS', // new: the long countdown (Decision D17)
    caption: '06:00 at the Proving Ground · streamed live',
    sealedTitle: 'SEALED UNTIL 06:00',
    sealedRows: ['0–100 KM/H', 'TOP SPEED', 'SYSTEM POWER', 'MIN. MASS', 'ELECTRIC · MGU-K'] as const,
    feather: 'One feather tonight. The rest at first light.',
  },
} as const

/** new: what the timer announces to screen readers once a minute (02-landing → Accessibility). */
export function countdownAnnouncement(days: number, hours: number, minutes: number): string {
  const unit = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  const parts = [
    days > 0 ? unit(days, 'day', 'days') : null,
    unit(hours, 'hour', 'hours'),
    unit(minutes, 'minute', 'minutes'),
  ].filter(Boolean)
  return `${parts.join(', ')} until first light`
}

export const firstLight = {
  outline: 'HM-27',
  carAlt:
    'The HM‑27 in the First Light race livery: Gallery White over carbon, red wing tips, red slipstream on the sidepod, the winged H on the engine cover',
  eyebrow: 'LIVE FROM THE PROVING GROUND',
  headline: ['SPEED IS', 'THE', 'MESSAGE.'] as const,
  body: 'Our first Grand Prix car. 1,006 horsepower, half of it electric. Built for the 2027 grid.',
  ctaDrive: 'Beat the messenger',
  ctaExplore: 'Explore the car',
} as const

const n = (v: number) => v.toLocaleString('en-US')

/** First Light dashboard (copy.md; numbers from content/facts.ts). */
export const dashboard = {
  ignite: 'Start engine and replay the ignition sequence',
  unitsLabel: 'Power units', // new
  hp: 'HP',
  kw: 'kW',
  dials: {
    zeroToHundred: {
      caption: '0–100 KM/H',
      unit: 'SEC',
      label: `0 to 100 kilometres per hour in ${hm27.zeroToHundredS} seconds`, // new: role="img" label
    },
    topSpeed: { caption: 'TOP SPEED', unit: 'KM/H', label: `Top speed ${n(hm27.topSpeedKmh)} kilometres per hour` },
    power: {
      caption: 'SYSTEM POWER',
      unitHp: 'HP',
      unitKw: 'KW',
      subHp: `${n(rules.systemPowerKw)} KW · ${rules.splitLabel}`,
      subKw: `≈ ${n(rules.systemPowerHp)} HP · ${rules.splitLabel}`,
      label: `System power ${n(rules.systemPowerHp)} horsepower, ${n(rules.systemPowerKw)} kilowatts`,
    },
    minMass: { caption: 'MIN. MASS', unit: 'KG', label: `Minimum mass ${n(rules.minMassKg)} kilograms` },
    mguk: { caption: 'ELECTRIC · MGU-K', unit: 'KW', label: `Electric motor ${n(rules.mgukKw)} kilowatts` },
  },
} as const

/** Hotspots on the day still (desktop), each linking to its specs chapter (M2 sets the anchors). */
export const hotspots = [
  { label: 'ACTIVE AERO', name: 'Active aero', chapter: 2 },
  { label: 'HALO', name: 'Halo and cockpit', chapter: 3 },
  { label: `${n(rules.systemPowerKw)} kW POWER UNIT`, name: 'Power unit', chapter: 5 },
] as const

/** The "Be here at 06:00" calendar file (copy.md, new). */
export const calendarCopy = {
  title: 'Hermes Motors · First Light',
  description: 'The HM‑27 is revealed at 06:00 at the Proving Ground. Speed is the message.',
  filename: 'hermes-motors-first-light.ics',
} as const
