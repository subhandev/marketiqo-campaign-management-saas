import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  if (pathname === '/') {
    const target = userId ? '/dashboard' : '/sign-in'
    return NextResponse.redirect(new URL(target, req.url))
  }

  if (!isPublicRoute(req) && !userId) {
    // API routes should not redirect (redirect bodies are empty → `response.json()` crashes).
    // Let API handlers return proper JSON 401s instead.
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
