import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  CUSTOMERS_LOAD_ERROR,
  CUSTOMERS_TABLE,
  CUSTOMER_COLUMNS,
} from '../customers.constants'
import { customerRowSchema } from '../customers.schema'
import { toCustomer } from '../customers.mapper'
import type { Customer } from '../customers.types'

const customerRowsSchema = z.array(customerRowSchema)

/**
 * Loads the active (non-archived) customers visible to the current user.
 *
 * Tenant isolation is enforced by Supabase RLS, not this query — the
 * `deleted_at is null` filter only hides archived rows from the active list.
 * Raw database errors are never surfaced to the UI.
 */
export async function getActiveCustomers(
  client: SupabaseClient,
): Promise<Customer[]> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .select(CUSTOMER_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(CUSTOMERS_LOAD_ERROR)
  }

  const rows = customerRowsSchema.parse(data ?? [])
  return rows.map(toCustomer)
}
