// Desktop controls (rules/game.md): W/↑ throttle, S/↓ brake, A/D or ←/→ steer, Space Overtake, Shift Boost,
// Esc pause. Keys are read by KeyboardEvent.code, so they sit in the same place on any layout.

import type { Input } from '@/lib/game/race'

const THROTTLE = ['KeyW', 'ArrowUp']
const BRAKE = ['KeyS', 'ArrowDown']
const LEFT = ['KeyA', 'ArrowLeft']
const RIGHT = ['KeyD', 'ArrowRight']
const OVERTAKE = ['Space']
const BOOST = ['ShiftLeft', 'ShiftRight']

/** Every key the game owns (the page mustn't scroll or act on them while driving) */
export const GAME_KEYS: ReadonlySet<string> = new Set([...THROTTLE, ...BRAKE, ...LEFT, ...RIGHT, ...OVERTAKE, ...BOOST])
export const PAUSE_KEY = 'Escape'

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
