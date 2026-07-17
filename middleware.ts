import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/p/', '/api/webhooks/']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const isPublicRoute = PUBLIC_ROUTES.some((r) => req.nextUrl.pathname.startsWith(r))

  let session = null
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    session = data.session
  } catch {
    if (!isPublicRoute) {
      const response = NextResponse.redirect(new URL('/login', req.url))
      req.cookies.getAll().forEach(c => {
        if (c.name.startsWith('sb-')) response.cookies.delete(c.name)
      })
      return response
    }
    return res
  }

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
