import type { Metadata } from 'next'
import { Hero } from '@/components/landing/Hero/Hero'
import { Specs } from '@/components/specs/Specs/Specs'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata('home', '/')

// The landing page (ARCHITECTURE §5–6): the hero, then the specs section; the drive band follows.
export default function Home() {
  return (
    <>
      <Hero />
      <Specs />
    </>
  )
}
