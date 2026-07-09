'use client'

import { useAuth } from '@clerk/nextjs'

import type { ExpenseOwner } from '../expenses.types'

export function useExpenseOwner(): ExpenseOwner | null {
  const { userId, sessionClaims } = useAuth()
  const organization = sessionClaims?.organization

  if (!userId || organization == null) {
    return null
  }

  return { orgId: organization, createdBy: userId }
}
