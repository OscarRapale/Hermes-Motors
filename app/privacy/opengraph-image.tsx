import { ogPreviews } from '@/content/og'
import { OG_SIZE, renderPreview } from '@/lib/og/preview'

// /privacy: its link preview (content/og.ts), drawn at build time
export const alt = ogPreviews.privacy.alt
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderPreview(ogPreviews.privacy)
}
