'use client'

import { useAuth } from '@clerk/nextjs'

import type { ProductOwner } from '../products.types'

export function useProductOwner(): ProductOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) {
    return null
  }

  return { orgId: organization, createdBy: userId }
}
