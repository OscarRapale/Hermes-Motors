import { NextResponse, type NextRequest } from 'next/server'
import { storySlugs } from '@/content/news/slugs'
import { parseShared } from '@/lib/game/share'

// Pages that stream can't change their status once they have started, so the addresses that might not
// exist are checked here, before any of it renders, and sent to a path with no page: a real 404 (status
// and page). /drive/r answers only for a lap the game could have made (ARCHITECTURE §7.5); /news/<slug>
// only for a story.
const NOT_FOUND = '/__not-found'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const ok = pathname === '/drive/r' ? parseShared(searchParams) !== null : storySlugs.includes(pathname.slice('/news/'.length))
  return ok ? NextResponse.next() : NextResponse.rewrite(new URL(NOT_FOUND, request.url))
}

export const config = { matcher: ['/drive/r', '/news/:slug'] }
