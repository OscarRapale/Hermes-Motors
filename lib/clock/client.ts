'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { DAY_ONE_MS, isPreviewing, phase, resolveTheme, type Phase, type Theme } from './phase'
import { readPreview, writePreview } from './preview'
import { computeSkew } from './skew'

/**
 * The launch clock in the browser (ARCHITECTURE §4.3–4.4). The inline head script paints the
 * first state; this store takes over after hydration: it corrects the device clock once with
 * /api/now and owns the preview toggle. Components read it with useClock(); colours never
 * depend on it (they come from CSS on <html data-theme>).
 */

export type ClockState = {
  phase: Phase
  theme: Theme
  previewing: boolean
}

let skew = 0
let state: ClockState | null = null
let synced: Promise<void> | null = null
const listeners = new Set<() => void>()

/** Date.now() corrected for the device's clock error. */
export function now(): number {
  return Date.now() + skew
}

function compute(): ClockState {
  const p = phase(now(), DAY_ONE_MS)
  let preview = readPreview()
  if (preview !== null && !isPreviewing(p, preview)) {
    // The real phase caught up with the preview: nothing left to preview.
    preview = null
    writePreview(null)
  }
  return { phase: p, theme: resolveTheme(p, preview), previewing: preview !== null }
}

function applyToDocument(s: ClockState) {
  const html = document.documentElement
  html.setAttribute('data-phase', s.phase)
  html.setAttribute('data-theme', s.theme)
  html.toggleAttribute('data-preview', s.previewing)
}

function update() {
  const next = compute()
  const prev = state
  state = next
  applyToDocument(next)
  if (!prev || prev.phase !== next.phase || prev.theme !== next.theme || prev.previewing !== next.previewing) {
    listeners.forEach((l) => l())
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): ClockState {
  if (!state) state = compute()
  return state
}

// The server can't know the visitor's clock; it renders the Before Dawn state and CSS shows the
// right theme from the first paint. useSyncExternalStore swaps in the real state after hydration.
const SERVER_STATE: ClockState = { phase: 'before', theme: 'night', previewing: false }
function getServerSnapshot(): ClockState {
  return SERVER_STATE
}

/**
 * Fetch /api/now once per page load and correct the clock. If the corrected phase differs from
 * the painted one, the document updates at once (M1 adds the stripe wipe here).
 */
export function syncClock(): Promise<void> {
  if (!synced) {
    synced = (async () => {
      try {
        const sent = Date.now()
        const res = await fetch('/api/now', { cache: 'no-store' })
        const received = Date.now()
        if (!res.ok) return
        const body: unknown = await res.json()
        const server = (body as { now?: unknown }).now
        if (typeof server === 'number' && Number.isFinite(server)) skew = computeSkew(sent, received, server)
      } catch {
        // Offline or blocked: keep the device clock.
      }
      update()
    })()
  }
  return synced
}

/** Header sun/moon: preview the other state, or return to the real one. */
export function togglePreview(): void {
  const current = getSnapshot()
  writePreview(current.previewing ? null : current.theme === 'night' ? 'day' : 'night')
  update()
}

export function useClock(): ClockState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** Mounted once in the root layout: runs the skew correction after hydration. */
export function ClockSync(): null {
  useEffect(() => {
    void syncClock()
  }, [])
  return null
}
