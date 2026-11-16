'use client'

import { useSyncExternalStore } from 'react'
import { soundOn, subscribeSound } from './prefs'

/** The sound preference, live (the server renders "on"; the toggle corrects itself after hydration). */
export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribeSound, soundOn, () => true)
}
