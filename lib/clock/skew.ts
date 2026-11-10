/**
 * Device clock error, from one round trip to /api/now (ARCHITECTURE §4.3):
 * skew = server − (sent + received) / 2. Corrected time = Date.now() + skew.
 */
export function computeSkew(sent: number, received: number, server: number): number {
  return Math.round(server - (sent + received) / 2)
}
