import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value
    const { pathname } = request.nextUrl

    // 1. User is on /login page
    if (pathname === '/login') {
        if (authToken) {
            // If logged in, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        // If not logged in, allow access to /login
        return NextResponse.next()
    }

    // 2. User is on any other page (protected)
    if (!authToken) {
        // If not logged in, redirect to login
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Authenticated user accessing protected page
    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
