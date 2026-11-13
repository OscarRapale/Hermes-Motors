// The test drive's layouts, as media queries (the CSS repeats them; keep the two in step).

import { useSyncExternalStore } from 'react'

/** A touch-first device held upright: the rotate screen (board 15). Never forced, just waited for */
export const ROTATE_QUERY = '(hover: none) and (pointer: coarse) and (orientation: portrait)'
/** The compact HUD (board 16): landscape phones, and any window too small for board 13's panels */
export const COMPACT_QUERY = '(max-width: 999.98px), (max-height: 499.98px)'

/** Whether a media query matches now, kept current; false on the server and before hydration */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
