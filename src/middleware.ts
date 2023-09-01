import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs'
import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/sso-callback(.*)',
    '/api/uploadthing(.*)',
  ],
  async afterAuth(auth, req) {
    if (auth.isPublicRoute) {
      return NextResponse.next()
    }

    const url = new URL(req.nextUrl.origin)

    if (!auth.userId) {
      url.pathname = '/sign-in'
      return NextResponse.redirect(url)
    }

    const user = await clerkClient.users.getUser(auth.userId)

    if (!user) {
      throw new Error('User not found.')
    }
  },
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
}
