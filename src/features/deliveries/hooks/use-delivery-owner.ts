'use client'

import { useAuth } from '@clerk/nextjs'

import type { DeliveryOwner } from '../deliveries.types'

export function useDeliveryOwner(): DeliveryOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) {
    return null
  }

  const orgId = Number(organization)
  if (Number.isNaN(orgId)) {
    return null
  }

  return { orgId, createdBy: userId }
}
