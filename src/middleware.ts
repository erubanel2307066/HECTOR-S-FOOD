import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    if (!token || token.length < 10) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login') {
    const token = req.cookies.get('admin_session')?.value
    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
