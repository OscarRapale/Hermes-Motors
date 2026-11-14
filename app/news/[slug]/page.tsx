import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Article } from '@/components/news/Article'
import { stories } from '@/content/news/stories'
import { SITE_NAME } from '@/content/seo'

type Props = PageProps<'/news/[slug]'>

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }))
}

const find = (slug: string) => stories.find((s) => s.slug === slug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = find((await params).slug)
  if (!story) return {}
  // seo.md: "<title> · Hermes Motors", and the dek
  return { title: { absolute: `${story.title} · ${SITE_NAME}` }, description: story.dek }
}

export default async function StoryPage({ params }: Props) {
  const story = find((await params).slug)
  if (!story) notFound()
  return <Article story={story} />
}
