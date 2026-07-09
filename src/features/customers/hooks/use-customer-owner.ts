'use client'

import { useAuth } from '@clerk/nextjs'

import type { CustomerOwner } from '../customers.types'

/**
 * Resolves the current tenant + creator from the Clerk session. `createdBy` is
 * the Clerk user id (`sub`); `orgId` is the `organization` custom claim, which
 * holds the `organizations.id` uuid. Returns null when either is missing so
 * callers can block the write — RLS is still the authoritative check.
 */
export function useCustomerOwner(): CustomerOwner | null {
  const { userId, sessionClaims } = useAuth()

  const organization = sessionClaims?.organization
  if (!userId || organization == null) {
    return null
  }

  return { orgId: organization, createdBy: userId }
}
