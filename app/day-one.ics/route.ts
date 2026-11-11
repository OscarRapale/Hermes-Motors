import { calendarCopy } from '@/content/copy/landing'
import { buildIcs } from '@/lib/calendar/ics'
import { DAY_ONE_MS } from '@/lib/clock/phase'
import { siteUrl } from '@/lib/site'

// "Be here at 06:00": the DAY_ONE reveal as a calendar event (ARCHITECTURE §5). Static: built once,
// works without JavaScript. 30 minutes is a placeholder length for the live reveal.
export function GET() {
  const body = buildIcs({
    uid: `first-light-${DAY_ONE_MS}@hermes-motors`,
    start: DAY_ONE_MS,
    durationMinutes: 30,
    title: calendarCopy.title,
    description: calendarCopy.description,
    url: siteUrl(),
  })
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${calendarCopy.filename}"`,
    },
  })
}
