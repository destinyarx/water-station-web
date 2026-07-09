'use client'

import { useAuth } from '@clerk/nextjs'

import type { DeliveryOwner } from '../deliveries.types'

export function useDeliveryOwner(): DeliveryOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) {
    return null
  }

  return { orgId: organization, createdBy: userId }
}
