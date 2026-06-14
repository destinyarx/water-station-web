import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  CUSTOMERS_LOAD_ERROR,
  CUSTOMERS_TABLE,
  CUSTOMER_COLUMNS,
  CUSTOMER_SAVE_ERROR,
  CUSTOMER_ARCHIVE_ERROR,
} from '../customers.constants'
import { customerRowSchema } from '../customers.schema'
import { toCustomer, toInsertRow, toUpdateRow } from '../customers.mapper'
import type {
  Customer,
  CustomerFormValues,
  CustomerOwner,
} from '../customers.types'

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

/**
 * Inserts a new customer for the current tenant and returns the saved record.
 *
 * Tenant (`org_id`) and creator (`created_by`) are taken from the resolved
 * Clerk identity in `owner`, never from form input; RLS independently rejects
 * any insert whose `org_id`/`created_by` do not match the caller's JWT. Raw
 * database errors are never surfaced to the UI.
 */
export async function createCustomer(
  client: SupabaseClient,
  values: CustomerFormValues,
  owner: CustomerOwner,
): Promise<Customer> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .insert(toInsertRow(values, owner))
    .select(CUSTOMER_COLUMNS)
    .single()

  if (error) {
    throw new Error(CUSTOMER_SAVE_ERROR)
  }

  return toCustomer(customerRowSchema.parse(data))
}

/**
 * Archives a customer by stamping `deleted_at` (soft delete) — the row is never
 * hard-deleted, so it stays queryable for audit/reporting. The `deleted_at is
 * null` filter makes the operation idempotent and avoids re-archiving; RLS
 * blocks cross-tenant archives even when the id is known.
 */
export async function archiveCustomer(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client
    .from(CUSTOMERS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    throw new Error(CUSTOMER_ARCHIVE_ERROR)
  }
}

/**
 * Loads a single customer by id, scoped to the caller's tenant by RLS. Returns
 * null when no matching row is visible (wrong tenant or nonexistent id) so the
 * caller can render a not-found state instead of leaking existence.
 */
export async function getCustomerById(
  client: SupabaseClient,
  id: number,
): Promise<Customer | null> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .select(CUSTOMER_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(CUSTOMERS_LOAD_ERROR)
  }

  if (!data) {
    return null
  }

  return toCustomer(customerRowSchema.parse(data))
}

/**
 * Updates an existing customer and returns the saved record. The `deleted_at is
 * null` filter blocks edits to archived rows (no restore flow yet); RLS blocks
 * cross-tenant edits even when the id is known. Raw errors are never surfaced.
 */
export async function updateCustomer(
  client: SupabaseClient,
  id: number,
  values: CustomerFormValues,
): Promise<Customer> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .update(toUpdateRow(values))
    .eq('id', id)
    .is('deleted_at', null)
    .select(CUSTOMER_COLUMNS)
    .single()

  if (error) {
    throw new Error(CUSTOMER_SAVE_ERROR)
  }

  return toCustomer(customerRowSchema.parse(data))
}
