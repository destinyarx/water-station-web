'use client'

import { useAuth } from '@clerk/nextjs'

import type { DocumentOwner } from '../documents.types'

export function useDocumentOwner(): DocumentOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) return null

  return { orgId: organization, createdBy: userId }
}
