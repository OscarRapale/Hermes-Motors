/** 71906 → "1:11.906" (m:ss.mmm). */
export function formatLapTime(ms: number): string {
  const total = Math.round(ms)
  const m = Math.floor(total / 60_000)
  const s = Math.floor((total % 60_000) / 1000)
  const milli = total % 1000
  return `${m}:${String(s).padStart(2, '0')}.${String(milli).padStart(3, '0')}`
}
