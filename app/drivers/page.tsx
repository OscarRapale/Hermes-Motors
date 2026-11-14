import type { Metadata } from 'next'
import { PageHero } from '@/components/pages/PageHero/PageHero'
import { Drivers } from '@/components/pages/Drivers/Drivers'
import { driversCopy } from '@/content/copy/pages/drivers'
import { seo } from '@/content/seo'

export const metadata: Metadata = { title: { absolute: seo.drivers.title }, description: seo.drivers.description }

export default function DriversPage() {
  return (
    <>
      <PageHero eyebrow={driversCopy.eyebrow} {...driversCopy.day} night={driversCopy.night} />
      <Drivers />
    </>
  )
}
