import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // biarkan semua akses publik kecuali /admin
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/admin')) {
    const supabaseSession = req.cookies.get('sb-access-token')
    if (!supabaseSession) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}
