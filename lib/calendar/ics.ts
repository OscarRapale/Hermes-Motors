// A one-event iCalendar file (RFC 5545): CRLF line endings, escaped text, lines folded at 75 octets.

export type CalendarEvent = {
  uid: string
  start: number // epoch ms
  durationMinutes: number
  title: string
  description: string
  url: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 1802080800000 → "20270214T100000Z" */
export function icsDate(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

export function escapeText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Folds a content line so no physical line exceeds 75 octets (UTF-8), without splitting a character. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder()
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    const limit = out.length === 0 ? 75 : 74 // continuation lines start with a space
    if (bytes + size > limit) {
      out.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  out.push(current)
  return out.join('\r\n ')
}

export function buildIcs(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hermes Motors//First Light//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    // The file is generated at build time; stamping it with the event's own start keeps it stable.
    `DTSTAMP:${icsDate(event.start)}`,
    `DTSTART:${icsDate(event.start)}`,
    `DTEND:${icsDate(event.start + event.durationMinutes * 60_000)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
