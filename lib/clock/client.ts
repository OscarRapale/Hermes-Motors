'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { flipDelay } from './flip'
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

/**
 * A visual transition for theme changes (the Slipstream wipe, components/site/Wipe). It must call
 * `apply` exactly once, at the moment the screen is covered, or at once (reduced motion).
 */
export type ThemeTransition = (to: Theme, apply: () => void) => void
let transition: ThemeTransition | null = null

export function registerThemeTransition(fn: ThemeTransition | null): void {
  transition = fn
}

function update() {
  const next = compute()
  const prev = state
  state = next
  const commit = () => {
    applyToDocument(next)
    if (!prev || prev.phase !== next.phase || prev.theme !== next.theme || prev.previewing !== next.previewing) {
      listeners.forEach((l) => l())
    }
  }
  // Compare with what is painted (the head script's choice before any update), not the last state.
  const painted = document.documentElement.getAttribute('data-theme')
  if (transition && painted && painted !== next.theme) transition(next.theme, commit)
  else commit()
}

/**
 * The live flip (ARCHITECTURE §4.3): one timer to DAY_ONE, in steps of at most 24 days, re-armed
 * after the skew correction and whenever the page becomes visible again.
 */
let flipTimer = 0
function armFlip() {
  window.clearTimeout(flipTimer)
  const delay = flipDelay(now())
  if (delay === null) return
  flipTimer = window.setTimeout(() => {
    update()
    armFlip()
  }, delay)
}

function onVisible() {
  if (document.visibilityState !== 'visible') return
  update()
  armFlip()
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
 * the painted one, the theme changes through the registered transition (the stripe wipe).
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

/**
 * Mounted once in the root layout: runs the skew correction after hydration, then arms the live
 * flip at DAY_ONE and re-checks whenever the tab comes back.
 */
export function ClockSync(): null {
  useEffect(() => {
    void syncClock().then(armFlip)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearTimeout(flipTimer)
    }
  }, [])
  return null
}
