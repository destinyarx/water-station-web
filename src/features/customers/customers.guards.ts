import type { Customer } from './customers.types'

export interface CustomerActor {
  userId: string
  isOwner: boolean
}

/**
 * Mirrors the verified customer UPDATE policy for UI behavior. Owners may
 * manage any active customer in their organization; staff may manage active
 * customers they created. RLS remains the authoritative security boundary.
 */
export function canEditCustomer(
  customer: Customer,
  actor: CustomerActor | null,
): boolean {
  if (!actor || customer.deletedAt !== null) return false

  return actor.isOwner || customer.createdBy === actor.userId
}
