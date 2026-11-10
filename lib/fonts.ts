import { Geist, Geist_Mono, Michroma } from 'next/font/google'

// Self-hosted at build by next/font (no runtime requests to Google). All three are SIL OFL 1.1.

export const michroma = Michroma({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-michroma',
})

export const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
})

export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
})

export const fontVariables = [michroma.variable, geist.variable, geistMono.variable].join(' ')
