import type { Customer } from './customers.types'

/**
 * Whether a customer may be edited. Archived customers (non-null `deletedAt`)
 * are read-only until a future restore flow exists — the UI hides the edit
 * action and the service refuses the update. RLS remains the authoritative
 * tenant check; this guard only encodes the archive rule.
 */
export function canEditCustomer(customer: Customer): boolean {
  return customer.deletedAt === null
}
