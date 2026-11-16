// /press (board 30; copy.md → Pages → Press kit: verbatim from the board). Figures from content/facts.ts.

import { driveCopy } from '@/content/copy/drive'
import { drivers } from '@/content/drivers'
import { messenger, rules } from '@/content/facts'
import { season } from '@/content/season'
import { formatLap } from '@/lib/game/timing'

const n = (v: number) => v.toLocaleString('en-US')

export const pressCopy = {
  eyebrow: 'PRESS · DAY ONE EDITION',
  headline: ['PRESS KIT.', 'DAY ONE.'],
  intro: 'Renders, the mark, the First Light film and the facts, ready to publish. Everything is free for editorial use; the car images need one credit line.',
  download: 'Download everything',
  /** new: the zip's name and size, for screen readers */
  downloadLabel: (size: string) => `Download everything: the press kit, ZIP, ${size}`,
  /** before Day One (hidden after, like the other locked labels) */
  embargo: 'EMBARGO UNTIL 06:00 · DAY ONE',

  images: {
    title: 'IMAGES · PNG, 2400 × 1500',
    list: [
      { title: 'First Light, three-quarter', file: 'hm27-first-light.png', alt: 'The HM‑27 in the First Light livery, front three-quarter view', ground: 'light', fit: 'cover' },
      { title: 'Before Dawn', file: 'hm27-before-dawn.png', alt: 'The HM‑27 in graphite, in the dark', ground: 'dark', fit: 'cover' },
      { title: 'Taken apart', file: 'hm27-exploded.png', alt: 'The HM‑27 with wings, halo, body and wheels lifted apart', ground: 'light', fit: 'cover' },
      { title: 'Side', file: 'hm27-side.png', alt: 'The HM‑27 from the side', ground: 'light', fit: 'contain' },
      { title: 'Rear', file: 'hm27-rear.png', alt: 'The HM‑27 from behind, the rear wing and diffuser', ground: 'light', fit: 'cover' },
      { title: 'Test-drive car', file: 'hm27-game-lod.png', alt: 'The lighter test-drive version of the HM‑27', ground: 'light', fit: 'cover' },
    ],
    /** new */
    downloadLabel: (title: string, size: string) => `Download ${title}, PNG, ${size}`,
  },

  mark: {
    title: 'THE MARK · SVG AND PNG',
    tiles: [
      { label: 'The mark, in colour', file: 'mark', ground: 'white' },
      { label: 'The mark, reversed', file: 'mark-reversed', ground: 'carbon' },
      { label: 'The mark, white on Redline', file: 'mark-white', ground: 'redline' },
      { label: 'The lock-up: the mark and the wordmark', file: 'lockup', ground: 'white' },
    ],
    note: 'Keep the 14° lean and clear space of one feather around the mark. Never recolour the feathers.',
    /** new */
    svg: 'SVG',
    png: 'PNG',
    fileLabel: (label: string, format: string) => `${label}, ${format}`,
  },

  film: {
    title: 'FILM · MP4, 1080P',
    label: 'FIRST LIGHT · 0:24',
    note: 'Silent, 16:9. From the countdown to the car, apart and back together.',
    /** new */
    videoLabel: 'First Light: the film, 24 seconds, silent',
    download: 'Download the film',
  },

  facts: {
    title: 'FACT SHEET',
    rows: [
      ['TEAM', 'Hermes Motors'],
      ['CAR', 'HM‑27'],
      ['DEBUT', `2027 season, ${season.rounds.length} rounds`],
      ['POWER', `${rules.systemPowerKw} kW · ${n(rules.systemPowerHp)} hp`],
      ['SPLIT', `V6 ${rules.combustionKw} kW · electric ${rules.mgukKw} kW`],
      ['MIN. MASS', `${rules.minMassKg} kg`],
      ['WHEELBASE', `${n(rules.wheelbaseMm)} mm`],
    ] as const,
    drivers: {
      label: 'DRIVERS',
      day: drivers.map((d) => `#${d.number} ${d.name}`).join(' · '),
      /** new: sealed until 06:00, as on the Drivers page */
      night: 'Revealed at 06:00',
    },
    testDriver: ['TEST DRIVER', `The messenger · ${formatLap(messenger.lapMs)}`] as const,
  },

  boilerplate: {
    title: 'ABOUT HERMES MOTORS · BOILERPLATE',
    text: `Hermes Motors is a new Grand Prix team that debuts in the 2027 season with the HM‑27, a car built to the 2026 rules: ${n(rules.systemPowerHp)} horsepower, half of it electric, and active aerodynamics front and rear. The team revealed the car at 06:00 on Day One at its Proving Ground, where the public can race the test driver’s lap online. Speed is the message.`,
    copy: 'COPY',
    copied: 'COPIED',
    /** new: the button's name */
    copyLabel: 'Copy the boilerplate',
    editors:
      'A note for editors: Hermes Motors is a fictional team, created as a design and development portfolio project. It is not affiliated with Formula 1, the FIA, Porsche or Hermès.',
  },

  credit: {
    title: 'CREDIT FOR CAR IMAGES',
    line: driveCopy.card.credit,
    note: 'Run this line with every render or film frame you publish.',
  },

  office: {
    title: 'PRESS OFFICE',
    body: 'Interviews, the Proving Ground, accreditation.',
    cta: 'Write to us',
  },
} as const
