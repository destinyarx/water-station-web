import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  CUSTOMERS_LOAD_ERROR,
  CUSTOMERS_TABLE,
  CUSTOMER_COLUMNS,
  CUSTOMER_SAVE_ERROR,
  CUSTOMER_ARCHIVE_ERROR,
  CUSTOMER_NOT_PERMITTED_ERROR,
  CUSTOMER_STATUS_ERROR,
} from '../customers.constants'
import { customerRowSchema } from '../customers.schema'
import { toCustomer, toInsertRow, toUpdateRow } from '../customers.mapper'
import type {
  Customer,
  CustomerFormValues,
  CustomerOwner,
  CustomerPage,
  CustomerStats,
} from '../customers.types'
import type { CustomerFilters } from '../customers.keys'

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
  filters: CustomerFilters,
): Promise<CustomerPage> {
  const page = Math.max(1, filters.page)
  const perPage = Math.max(1, filters.perPage)
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = client
    .from(CUSTOMERS_TABLE)
    .select(CUSTOMER_COLUMNS, { count: 'exact' })
    .is('deleted_at', null)

  const search = filters.search.trim()
  if (search !== '') {
    query = query.ilike('name', `%${search}%`)
  }

  if (filters.type !== 'all') {
    query = query.eq('is_business', filters.type === 'business')
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(CUSTOMERS_LOAD_ERROR)
  }

  const rows = customerRowsSchema.parse(data ?? [])
  return { rows: rows.map(toCustomer), total: count ?? 0 }
}

/** Loads unfiltered customer options for delivery/customer selectors. */
export async function getCustomerOptions(
  client: SupabaseClient,
): Promise<Customer[]> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .select(CUSTOMER_COLUMNS)
    .is('deleted_at', null)
    .order('name', { ascending: true })
    .limit(500)

  if (error) throw new Error(CUSTOMERS_LOAD_ERROR)

  return customerRowsSchema.parse(data ?? []).map(toCustomer)
}

/** Loads exact active customer counts independently of the current page. */
export async function getCustomerStats(
  client: SupabaseClient,
): Promise<CustomerStats> {
  const countOptions = { count: 'exact' as const, head: true }
  const base = () =>
    client
      .from(CUSTOMERS_TABLE)
      .select('id', countOptions)
      .is('deleted_at', null)

  const [totalResult, businessResult, householdResult] = await Promise.all([
    base(),
    base().eq('is_business', true),
    base().eq('is_business', false),
  ])

  if (
    totalResult.error ||
    businessResult.error ||
    householdResult.error
  ) {
    throw new Error(CUSTOMERS_LOAD_ERROR)
  }

  return {
    total: totalResult.count ?? 0,
    business: businessResult.count ?? 0,
    household: householdResult.count ?? 0,
  }
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
 * Toggles a customer's active/inactive status. Independent of archive: the row
 * stays in the active list either way (only `deleted_at` hides it). The
 * `deleted_at is null` filter leaves archived rows untouched; RLS blocks
 * cross-tenant updates.
 */
export async function setCustomerStatus(
  client: SupabaseClient,
  id: number,
  isActive: boolean,
): Promise<void> {
  const { data, error } = await client
    .from(CUSTOMERS_TABLE)
    .update({ is_active: isActive })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')

  if (error) {
    throw new Error(CUSTOMER_STATUS_ERROR)
  }

  if (!data?.length) {
    throw new Error(CUSTOMER_NOT_PERMITTED_ERROR)
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
