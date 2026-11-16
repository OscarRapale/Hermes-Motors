// The site's sound (ARCHITECTURE §7.7): one AudioContext, made the first time something plays; a master
// gain that follows the sound preference; a bus for music and one for effects. Files are fetched the first
// time they're needed and kept. Browsers allow sound only after the visitor has clicked, tapped or pressed
// a key on the page, so nothing here tries before that. Browser only.

import { soundOn, subscribeSound } from './prefs'

export type Bus = 'music' | 'sfx'

/** How quickly gains move: a click-free fade, in seconds (time constant of setTargetAtTime) */
const RAMP_S = 0.04

type Graph = { ctx: AudioContext; master: GainNode; buses: Record<Bus, GainNode> }

let graph: Graph | null = null
const files = new Map<string, Promise<ArrayBuffer>>()
const decoded = new Map<string, Promise<AudioBuffer>>()

export const audioSupported = () => typeof window !== 'undefined' && typeof window.AudioContext === 'function'

/** The browser will play sound on this page: the visitor has clicked, tapped or pressed a key on it. */
export function audioAllowed(): boolean {
  if (!audioSupported()) return false
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
  return activation ? activation.hasBeenActive : graph?.ctx.state === 'running'
}

function ramp(param: AudioParam, to: number, ctx: AudioContext) {
  param.cancelScheduledValues(ctx.currentTime)
  param.setTargetAtTime(to, ctx.currentTime, RAMP_S)
}

function onVisibility() {
  if (!graph) return
  if (document.hidden) void graph.ctx.suspend().catch(() => {})
  else void graph.ctx.resume().catch(() => {})
}

/** The graph, made on first use; null without Web Audio or before the visitor has interacted. */
function context(): Graph | null {
  if (!audioAllowed()) return null
  if (!graph) {
    const ctx = new AudioContext({ latencyHint: 'interactive' })
    const master = ctx.createGain()
    master.gain.value = soundOn() ? 1 : 0
    master.connect(ctx.destination)
    const bus = () => {
      const g = ctx.createGain()
      g.connect(master)
      return g
    }
    graph = { ctx, master, buses: { music: bus(), sfx: bus() } }
    subscribeSound(() => graph && ramp(graph.master.gain, soundOn() ? 1 : 0, graph.ctx))
    document.addEventListener('visibilitychange', onVisibility)
  }
  if (graph.ctx.state === 'suspended' && !document.hidden) void graph.ctx.resume().catch(() => {})
  return graph
}

/** Start downloading a file without playing it (no AudioContext needed). */
export function preload(src: string): Promise<ArrayBuffer> {
  if (!files.has(src)) {
    const p = fetch(src).then((r) => {
      if (!r.ok) throw new Error(`${src}: ${r.status}`)
      return r.arrayBuffer()
    })
    p.catch(() => files.delete(src)) // let a later call try again
    files.set(src, p)
  }
  return files.get(src)!
}

function buffer(g: Graph, src: string): Promise<AudioBuffer> {
  if (!decoded.has(src)) {
    // decodeAudioData detaches the bytes it's given: decode a copy, so preload's cache stays usable
    const p = preload(src).then((bytes) => g.ctx.decodeAudioData(bytes.slice(0)))
    p.catch(() => decoded.delete(src))
    decoded.set(src, p)
  }
  return decoded.get(src)!
}

export type Voice = {
  /** Playback speed and pitch together (1 = as recorded) */
  setRate(rate: number): void
  setGain(gain: number): void
  /** Fade out over `fadeS` seconds and stop */
  stop(fadeS?: number): void
}

const SILENT: Voice = { setRate() {}, setGain() {}, stop() {} }

type PlayOptions = { bus?: Bus; gain?: number; rate?: number; loop?: boolean }

/**
 * Play a file once, or looped. Resolves to a handle (a silent one when sound can't play: no Web Audio,
 * no interaction yet, or the file failed). One-shots are skipped while sound is off; loops play into the
 * muted master, so turning sound back on mid-lap brings them in.
 */
export async function play(src: string, { bus = 'sfx', gain = 1, rate = 1, loop = false }: PlayOptions = {}): Promise<Voice> {
  const g = context()
  if (!g || (!loop && !soundOn())) return SILENT
  let buf: AudioBuffer
  try {
    buf = await buffer(g, src)
  } catch {
    return SILENT
  }
  const { ctx } = g
  const source = ctx.createBufferSource()
  source.buffer = buf
  source.loop = loop
  source.playbackRate.value = rate
  const level = ctx.createGain()
  level.gain.value = gain
  source.connect(level).connect(g.buses[bus])
  source.start()
  let stopped = false
  source.onended = () => {
    stopped = true
    level.disconnect()
  }
  return {
    setRate: (r) => !stopped && ramp(source.playbackRate, r, ctx),
    setGain: (v) => !stopped && ramp(level.gain, v, ctx),
    stop: (fadeS = 0.08) => {
      if (stopped) return
      stopped = true
      level.gain.cancelScheduledValues(ctx.currentTime)
      level.gain.setTargetAtTime(0, ctx.currentTime, fadeS / 4)
      source.stop(ctx.currentTime + fadeS)
    },
  }
}

/** Set a bus's level (e.g. the music under the engine) */
export function setBusGain(bus: Bus, gain: number): void {
  if (graph) ramp(graph.buses[bus].gain, gain, graph.ctx)
}
