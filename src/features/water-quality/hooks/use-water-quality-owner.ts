'use client'

import { useAuth } from '@clerk/nextjs'

import type { WaterQualityOwner } from '../water-quality.types'

/**
 * Resolves the current tenant + creator from the Clerk session. `createdBy` is
 * the Clerk user id (`sub`); `orgId` is the `organization` custom claim. Returns
 * null when either is missing so callers can block the write — RLS remains the
 * authoritative check.
 */
export function useWaterQualityOwner(): WaterQualityOwner | null {
  const { userId, sessionClaims } = useAuth()

  const organization = sessionClaims?.organization
  if (!userId || organization == null) {
    return null
  }

  return { orgId: organization, createdBy: userId }
}
