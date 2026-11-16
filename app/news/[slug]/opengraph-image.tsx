import { stories } from '@/content/news/stories'
import { storyPreview } from '@/content/og'
import { OG_SIZE, renderPreview } from '@/lib/og/preview'

// A story's link preview: its own headline and art, drawn at build time for every slug
export const alt = 'A story from the Proving Ground'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = stories.find((s) => s.slug === slug) ?? stories[0]
  return renderPreview(storyPreview(story))
}
