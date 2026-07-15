'use client'

import { useAuth } from '@clerk/nextjs'

import type { CustomerActor } from '../customers.guards'

/** Resolves the trusted Clerk identity used by customer UI permission guards. */
export function useCustomerActor(): CustomerActor | null {
  const { userId, sessionClaims } = useAuth()

  if (!userId || sessionClaims?.is_owner == null) return null

  return { userId, isOwner: sessionClaims.is_owner }
}
