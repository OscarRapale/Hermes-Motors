'use client'

import { useCallback, useEffect, useRef } from 'react'
import { audioAllowed, play, preload, SOUNDS, track, type Track, type Voice } from '@/lib/audio'
import { engineNote } from '@/lib/drive/sound'
import type { Input, RaceState } from '@/lib/game/race'

/** The engine over the music (ARCHITECTURE §7.7): the music sits well under it */
const ENGINE_GAIN = 0.55
const MUSIC_GAIN = 0.4
const MUSIC_IN_S = 1.5
const MUSIC_OUT_S = 2.5

/**
 * The test drive's sound: the engine loop (rate and level from `engineNote` every HUD tick) and the
 * soundtrack. Both start at the first tick after the visitor has interacted with the page (browsers allow
 * sound only then): the Start button, a key, a tap. Pause fades both out, the finish fades them, leaving
 * the drive stops them.
 */
export function useDriveSound() {
  const engine = useRef<Voice | null>(null)
  const starting = useRef(false)
  const music = useRef<Track | null>(null)
  const finished = useRef(false)

  // the loop is small: fetch it with the page (no AudioContext needed for that)
  useEffect(() => {
    preload(SOUNDS.engine).catch(() => {})
    return () => {
      engine.current?.stop()
      music.current?.stop()
      engine.current = null
      music.current = null
    }
  }, [])

  /** Every HUD tick while the race runs */
  const update = useCallback((state: RaceState, input: Input) => {
    if (!engine.current && !starting.current && audioAllowed()) {
      starting.current = true
      void play(SOUNDS.engine, { loop: true, gain: 0 }).then((v) => {
        engine.current = v
        starting.current = false
      })
      music.current ??= track(SOUNDS.music, { gain: MUSIC_GAIN })
      if (!state.result) music.current.play(MUSIC_IN_S)
    }
    const note = engineNote(state, input)
    engine.current?.setRate(note.rate)
    engine.current?.setGain(note.gain * ENGINE_GAIN)
    if (state.result && !finished.current) {
      finished.current = true
      music.current?.pause(MUSIC_OUT_S)
    }
  }, [])

  const pause = useCallback(() => {
    engine.current?.setGain(0)
    music.current?.pause()
  }, [])

  const resume = useCallback(() => {
    if (!finished.current) music.current?.play(0.6)
  }, [])

  /** A new attempt: the music comes back in under the grid */
  const restart = useCallback(() => {
    finished.current = false
    music.current?.play(MUSIC_IN_S)
  }, [])

  return { update, pause, resume, restart }
}
