'use client'

import { useAuth } from '@clerk/nextjs'

import { canAccessAquaflowAi } from '../aquaflow-ai.guards'
import type { AiOwner } from '../aquaflow-ai.types'

export interface AquaflowAiAccess {
  /** True only for a registered owner session. */
  canAccess: boolean
  /** Resolved owner identity for writes, or null if not accessible. */
  owner: AiOwner | null
}

export function useAquaflowAiAccess(): AquaflowAiAccess {
  const { userId, sessionClaims } = useAuth()
  const canAccess = canAccessAquaflowAi(sessionClaims)

  if (!canAccess || !userId || sessionClaims?.organization == null) {
    return { canAccess: false, owner: null }
  }

  return {
    canAccess: true,
    owner: { orgId: sessionClaims.organization, createdBy: userId },
  }
}
