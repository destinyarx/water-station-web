'use client'

import { useAuth } from '@clerk/nextjs'

import type { WaterQualityActor } from '../water-quality.guards'

/** Resolves the trusted Clerk identity used by water quality UI permission guards. */
export function useWaterQualityActor(): WaterQualityActor | null {
  const { userId, sessionClaims } = useAuth()

  if (!userId || sessionClaims?.is_owner == null) return null

  return { userId, isOwner: sessionClaims.is_owner }
}
