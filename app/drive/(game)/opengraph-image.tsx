import { ogPreviews } from '@/content/og'
import { OG_SIZE, renderPreview } from '@/lib/og/preview'

// /drive: its link preview (content/og.ts), drawn at build time
export const alt = ogPreviews.drive.alt
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return renderPreview(ogPreviews.drive)
}
