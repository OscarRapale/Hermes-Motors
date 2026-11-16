import { ogPreviews } from '@/content/og'
import { OG_SIZE, renderPreview } from '@/lib/og/preview'

// /credits: its link preview (content/og.ts), drawn at build time
export const alt = ogPreviews.credits.alt
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderPreview(ogPreviews.credits)
}
