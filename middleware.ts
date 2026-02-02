import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value
    const { pathname } = request.nextUrl

    // Protected routes: /dashboard
    if (pathname.startsWith('/dashboard')) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Auth routes: /login
    if (pathname === '/login') {
        if (authToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Root route: Redirect to login (or dashboard if logged in, handled by /login logic above if we redirect there)
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
