import type { Metadata } from 'next'
import { Doc } from '@/components/pages/Doc/Doc'
import { creditsCopy } from '@/content/copy/pages/legal'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.credits.title }, description: seo.credits.description }

export default function CreditsPage() {
  return <Doc copy={creditsCopy} />
}
