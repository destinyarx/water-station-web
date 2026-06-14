'use client'

import { useAuth } from '@clerk/nextjs'

import type { ProductActor } from '../products.guards'

export function useProductActor(): ProductActor | null {
  const { userId, sessionClaims } = useAuth()

  if (!userId || sessionClaims?.is_owner == null) {
    return null
  }

  return { userId, isOwner: sessionClaims.is_owner }
}
