/** The only easing on the site (00-tokens → Motion): ease-out cubic, `--ease-out` in CSS. */
export const easeOut = (x: number) => 1 - (1 - x) ** 3

/**
 * A CSS time ("450ms", ".45s", "0.45s") in milliseconds. The production CSS minifier rewrites
 * duration tokens (450ms → .45s), so never read one with a bare parseFloat.
 */
export function parseCssTime(value: string, fallback: number): number {
  const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/i.exec(value)
  if (!m) return fallback
  const n = Number(m[1])
  return m[2].toLowerCase() === 's' ? n * 1000 : n
}
