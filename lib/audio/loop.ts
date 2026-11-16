// Pure sample maths for the sound files (ARCHITECTURE §7.7). No imports, so `npm run assets` can load it
// from Node directly (type stripping) as well as the tests.

/** Average the channels into one. */
export function toMono(channels: readonly Float32Array[]): Float32Array {
  if (channels.length === 1) return channels[0]!.slice()
  const out = new Float32Array(channels[0]!.length)
  for (const ch of channels) for (let i = 0; i < out.length; i++) out[i]! += ch[i]! / channels.length
  return out
}

/**
 * A stretch of a recording made into a loop with no seam: [start, end) plays, and the `fade` samples
 * after `end` are blended into its first `fade` samples with an equal-power crossfade, so the last sample
 * runs straight on into the first. Needs `end + fade` samples of source.
 */
export function seamlessLoop(samples: Float32Array, start: number, end: number, fade: number): Float32Array {
  if (start < 0 || end + fade > samples.length || fade <= 0 || fade > end - start) {
    throw new RangeError(`seamlessLoop: [${start}, ${end}) + ${fade} doesn't fit ${samples.length} samples`)
  }
  const out = samples.slice(start, end)
  for (let i = 0; i < fade; i++) {
    const t = (i + 0.5) / fade
    const into = Math.sin((t * Math.PI) / 2) // the loop's own start fades in…
    const away = Math.cos((t * Math.PI) / 2) // …as the run-on past its end fades out
    out[i] = samples[start + i]! * into + samples[end + i]! * away
  }
  return out
}

/** Scale so the loudest sample sits at `peak` (0…1). */
export function normalise(samples: Float32Array, peak: number): Float32Array {
  let max = 0
  for (const s of samples) max = Math.max(max, Math.abs(s))
  if (max === 0) return samples.slice()
  const k = peak / max
  return samples.map((s) => s * k)
}

/** 16-bit PCM WAV, mono. */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2)
  const v = new DataView(bytes.buffer)
  const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)))
  text(0, 'RIFF')
  v.setUint32(4, 36 + samples.length * 2, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  v.setUint32(16, 16, true) // chunk size
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, 1, true) // mono
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true) // bytes per second
  v.setUint16(32, 2, true) // block align
  v.setUint16(34, 16, true) // bits per sample
  text(36, 'data')
  v.setUint32(40, samples.length * 2, true)
  samples.forEach((s, i) => v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, s)) * 0x7fff), true))
  return bytes
}
