import type { Metadata } from 'next'
import { Doc } from '@/components/pages/Doc/Doc'
import { creditsCopy } from '@/content/copy/pages/legal'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('credits', '/credits')

export default function CreditsPage() {
  return <Doc copy={creditsCopy} />
}
