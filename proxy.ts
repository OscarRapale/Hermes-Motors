import { NextResponse, type NextRequest } from 'next/server'
import { parseShared } from '@/lib/game/share'

// /drive/r answers only for a lap the game could have made (ARCHITECTURE §7.5). The page streams, so it
// can't change its status once it has started: an invalid link is sent to a path with no page, which is a
// real 404 (status and page) before any of it renders.
export function proxy(request: NextRequest) {
  if (parseShared(request.nextUrl.searchParams)) return NextResponse.next()
  return NextResponse.rewrite(new URL('/drive/r/not-a-lap', request.url))
}

export const config = { matcher: '/drive/r' }
