import { describe, expect, it } from 'vitest'
import { calendarCopy, countdownAnnouncement } from '@/content/copy/landing'
import { buildIcs, escapeText, foldLine, icsDate } from '@/lib/calendar/ics'
import { countdownView, LED_COUNT, ledsLit, untilDayOne } from '@/lib/clock/countdown'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { siteUrl } from '@/lib/site'

const HOUR = 3_600_000

describe('countdownView (Decision D17)', () => {
  it('shows one HH:MM:SS line under 100 hours', () => {
    expect(countdownView({ h: 6, m: 48, s: 34 })).toEqual({ days: null, hh: '06', mm: '48', ss: '34' })
    expect(countdownView({ h: 99, m: 59, s: 59 })).toEqual({ days: null, hh: '99', mm: '59', ss: '59' })
  })

  it('splits off the days from 100 hours', () => {
    expect(countdownView({ h: 100, m: 0, s: 0 })).toEqual({ days: 4, hh: '04', mm: '00', ss: '00' })
    expect(countdownView(untilDayOne(DAY_ONE_MS - (96 * 24 + 7) * HOUR - 3 * 60_000 - 9_000))).toEqual({
      days: 96,
      hh: '07',
      mm: '03',
      ss: '09',
    })
  })
})

describe('night LEDs', () => {
  it('stay dark until the last 6 hours, then fill', () => {
    expect(ledsLit(24 * HOUR)).toBe(0)
    expect(ledsLit(6 * HOUR)).toBe(0)
    expect(ledsLit(3 * HOUR)).toBe(8) // half of 15, rounded
    expect(ledsLit(0)).toBe(LED_COUNT)
    expect(ledsLit(-HOUR)).toBe(LED_COUNT)
  })
})

describe('countdownAnnouncement', () => {
  it('reads the time left in words, without zero days', () => {
    expect(countdownAnnouncement(96, 7, 3)).toBe('96 days, 7 hours, 3 minutes until first light')
    expect(countdownAnnouncement(0, 1, 1)).toBe('1 hour, 1 minute until first light')
  })
})

describe('the calendar file', () => {
  const ics = buildIcs({
    uid: 'first-light@test',
    start: DAY_ONE_MS,
    durationMinutes: 30,
    title: calendarCopy.title,
    description: calendarCopy.description,
    url: 'https://hermes-motors.vercel.app',
  })

  it('is one event at DAY_ONE in UTC, 30 minutes long', () => {
    expect(icsDate(DAY_ONE_MS)).toBe('20270214T100000Z')
    expect(ics).toContain('DTSTART:20270214T100000Z\r\n')
    expect(ics).toContain('DTEND:20270214T103000Z\r\n')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
  })

  it('uses CRLF and folds every line at 75 octets', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n')
    for (const line of ics.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
  })

  it('carries the copy-deck title and description (unfolded)', () => {
    const unfolded = ics.replace(/\r\n /g, '')
    expect(unfolded).toContain(`SUMMARY:${calendarCopy.title}`)
    expect(unfolded).toContain(`DESCRIPTION:${escapeText(calendarCopy.description)}`)
  })

  it('escapes text and never splits a character when folding', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
    const folded = foldLine('X'.repeat(73) + '‑‑') // two 3-byte characters across the 75-octet edge
    expect(folded.split('\r\n ').join('')).toBe('X'.repeat(73) + '‑‑')
    for (const part of folded.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
  })
})

describe('siteUrl (Decision D5)', () => {
  it('prefers NEXT_PUBLIC_SITE_URL, then the Vercel production URL, then localhost', () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: 'https://example.com/' })).toBe('https://example.com')
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'hermes-motors.vercel.app' })).toBe('https://hermes-motors.vercel.app')
    expect(siteUrl({})).toBe('http://localhost:3000')
  })
})
