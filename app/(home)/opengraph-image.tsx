import { connection } from 'next/server'
import { ogPreviews } from '@/content/og'
import { phase } from '@/lib/clock/phase'
import { OG_SIZE, renderPreview } from '@/lib/og/preview'

// The home page's link preview (seo.md): the night car before Day One, the day car from 06:00. Decided when
// it's asked for, so it flips with the site; kept an hour at most.
export const alt = 'Hermes Motors: the HM‑27'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  await connection()
  const preview = phase(Date.now()) === 'before' ? ogPreviews.homeNight : ogPreviews.homeDay
  return renderPreview(preview, { 'Cache-Control': 'public, max-age=3600' })
}
