// Sound on or off, for the whole site (ARCHITECTURE §7.7). On unless the visitor turns it off; only "off"
// is stored (localStorage), so a visitor who never touches it stores nothing.

export const SOUND_KEY = 'hermes.sound'

const listeners = new Set<() => void>()
let cached: boolean | null = null

export function soundOn(): boolean {
  if (cached === null) {
    try {
      cached = localStorage.getItem(SOUND_KEY) !== 'off'
    } catch {
      cached = true // private mode or storage blocked: on, and not remembered
    }
  }
  return cached
}

export function setSoundOn(on: boolean): void {
  cached = on
  try {
    if (on) localStorage.removeItem(SOUND_KEY)
    else localStorage.setItem(SOUND_KEY, 'off')
  } catch {
    // not remembered, still applied
  }
  listeners.forEach((l) => l())
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Tests only: forget the cached value. */
export function resetSoundForTests(): void {
  cached = null
  listeners.clear()
}
