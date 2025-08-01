import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/bookings',
  '/messages',
  '/api/bookings',
  '/api/messages',
  '/api/reviews',
  '/api/workers/profile',
]

const adminRoutes = [
  '/admin',
  '/api/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const payload = verifyToken(token)
    if (!payload) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin access
    if (isAdminRoute && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/') && token) {
    const payload = verifyToken(token)
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/bookings/:path*',
    '/messages/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/api/bookings/:path*',
    '/api/messages/:path*',
    '/api/reviews/:path*',
    '/api/workers/profile/:path*',
    '/api/admin/:path*',
  ],
}