import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Team } from '@/components/pages/Team/Team'
import { teamCopy } from '@/content/copy/pages/team'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('team', '/team')

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow={teamCopy.eyebrow} headline={teamCopy.headline} intro={teamCopy.intro} />
      <Team />
    </>
  )
}
