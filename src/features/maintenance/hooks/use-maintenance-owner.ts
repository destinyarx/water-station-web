'use client'

import { useAuth } from '@clerk/nextjs'

import type { MaintenanceOwner } from '../maintenance.types'

/** Resolves the tenant/creator context from the Clerk session, or null. */
export function useMaintenanceOwner(): MaintenanceOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) return null

  const orgId = Number(organization)
  if (Number.isNaN(orgId)) return null

  return { orgId, createdBy: userId }
}

/** Whether the signed-in user is the station owner (archive permission). */
export function useIsOwner(): boolean {
  const { sessionClaims } = useAuth()
  return sessionClaims?.is_owner === true
}
