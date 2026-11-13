// Desktop controls (rules/game.md): W/↑/Right Shift throttle, S/↓/Right Ctrl brake, A/D or ←/→ steer,
// Space Overtake, Left Shift Boost, Esc pause. The right-hand pedals let one hand steer on A/D while the
// other works throttle and brake (Oscar's playtest, 2026-11-12). Keys are read by KeyboardEvent.code, so they sit in the same place on any layout.

import type { Input } from '@/lib/game/race'

const THROTTLE = ['KeyW', 'ArrowUp', 'ShiftRight']
const BRAKE = ['KeyS', 'ArrowDown', 'ControlRight']
const LEFT = ['KeyA', 'ArrowLeft']
const RIGHT = ['KeyD', 'ArrowRight']
const OVERTAKE = ['Space']
const BOOST = ['ShiftLeft']

/** Every key the game owns (the page mustn't scroll or act on them while driving) */
export const GAME_KEYS: ReadonlySet<string> = new Set([...THROTTLE, ...BRAKE, ...LEFT, ...RIGHT, ...OVERTAKE, ...BOOST])
export const PAUSE_KEY = 'Escape'

/** What each control is bound to, in the order the controls sheet lists them */
export const CONTROLS = [
  { id: 'throttle', codes: THROTTLE },
  { id: 'brake', codes: BRAKE },
  { id: 'steer', codes: [...LEFT, ...RIGHT] },
  { id: 'overtake', codes: OVERTAKE },
  { id: 'boost', codes: BOOST },
  { id: 'pause', codes: [PAUSE_KEY] },
] as const

export type ControlId = (typeof CONTROLS)[number]['id']

/** The control a key is bound to, if any */
export const controlFor = (code: string): ControlId | null =>
  CONTROLS.find((c) => (c.codes as readonly string[]).includes(code))?.id ?? null

const any = (held: ReadonlySet<string>, keys: string[]) => keys.some((k) => held.has(k))

/** The input for the keys held now; both steering directions at once cancel out. */
export function inputFromKeys(held: ReadonlySet<string>): Input {
  const left = any(held, LEFT)
  const right = any(held, RIGHT)
  return {
    throttle: any(held, THROTTLE) ? 1 : 0,
    brake: any(held, BRAKE) ? 1 : 0,
    steer: left === right ? 0 : left ? 1 : -1,
    boost: any(held, BOOST),
    overtake: any(held, OVERTAKE),
  }
}
