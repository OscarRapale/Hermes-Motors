// The three reference laps (ARCHITECTURE §7.3): what the autopilot drives when they are recorded.
import type { Style } from './autopilot'

export const REFERENCE_LAPS: { name: string; about: string; seed: number; style: Style }[] = [
  {
    name: 'clean',
    about: 'A good driver: the racing line at 97% of the grip limit, Boost on the straights. Beats the messenger by a few seconds.',
    seed: 1,
    style: { line: true, pace: 0.97, brakeMargin: 0.9, useBoost: true, gains: { offset: 0.05, heading: 8 } },
  },
  {
    name: 'careful',
    about: 'A careful lap: the centre line at 88%, early braking, no Boost. Lands just behind the messenger (the tuning target, D28).',
    seed: 2,
    style: { line: false, pace: 0.88, brakeMargin: 0.7, useBoost: false },
  },
  {
    name: 'wall',
    about: 'Too fast into the fast right-hander after S2: runs wide and hits the wall, then carries on.',
    seed: 3,
    style: { line: false, pace: 0.97, brakeMargin: 0.9, useBoost: true, overcook: { from: 1950, to: 2200, pace: 1.3 } },
  },
]
