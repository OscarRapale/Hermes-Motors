import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Team } from '@/components/pages/Team/Team'
import { teamCopy } from '@/content/copy/pages/team'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.team.title }, description: seo.team.description }

export default function TeamPage() {
  return (
    <>
      <PageHero eyebrow={teamCopy.eyebrow} headline={teamCopy.headline} intro={teamCopy.intro} />
      <Team />
    </>
  )
}
