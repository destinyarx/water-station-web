import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { isRegistered } from '@/features/registration/registration.guards'
import {
  POST_REGISTRATION_PATH,
  REGISTRATION_REDIRECT_PATH,
} from '@/features/registration/registration.constants'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const isRegistrationRoute = createRouteMatcher([REGISTRATION_REDIRECT_PATH])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  const onPublicRoute = isPublicRoute(req)
  const onRegistrationRoute = isRegistrationRoute(req)
  const registered = isRegistered(sessionClaims)

  if (!registered) {
    if (onRegistrationRoute) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL(REGISTRATION_REDIRECT_PATH, req.url))
  }

  if (onPublicRoute || onRegistrationRoute) {
    return NextResponse.redirect(new URL(POST_REGISTRATION_PATH, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
