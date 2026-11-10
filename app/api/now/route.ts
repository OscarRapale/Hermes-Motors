import { connection } from 'next/server'

// Server time for the launch clock's skew correction (ARCHITECTURE §4.3). Never cached.
export async function GET() {
  await connection()
  return Response.json(
    { now: Date.now() },
    { headers: { 'Cache-Control': 'no-store, max-age=0', 'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store' } },
  )
}
