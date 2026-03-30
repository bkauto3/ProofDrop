import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// API routes handle their own auth via requireSession() returning 401 JSON.
// Middleware only covers page routes (dashboard) to redirect unauthenticated
// users to the sign-in page before they hit SSR.
// API route auth is handled in each route handler directly.

// IMPORTANT: `secret` must be passed explicitly here. Without it, `withAuth`
// calls getToken() without a secret on the Edge runtime, which causes it to
// return null even when a valid JWT cookie is present — creating an infinite
// redirect loop back to /auth/signin after a successful OAuth callback.
export default withAuth(
  function middleware(_req: NextRequest) {
    return NextResponse.next()
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: '/auth/signin',
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}
