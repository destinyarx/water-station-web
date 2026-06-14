import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  EXPENSE_COLUMNS,
  EXPENSE_DELETE_ERROR,
  EXPENSE_SAVE_ERROR,
  EXPENSES_LOAD_ERROR,
  EXPENSES_TABLE,
} from '../expenses.constants'
import { toExpense, toInsertRow, toUpdateRow } from '../expenses.mapper'
import { expenseRowSchema } from '../expenses.schema'
import type {
  Expense,
  ExpenseFormValues,
  ExpenseOwner,
} from '../expenses.types'

const expenseRowsSchema = z.array(expenseRowSchema)

/**
 * Loads active expenses visible to the current user. Station isolation is
 * enforced by Supabase RLS; the `deleted_at is null` filter only hides rows
 * from the default active list.
 */
export async function getActiveExpenses(
  client: SupabaseClient,
): Promise<Expense[]> {
  const { data, error } = await client
    .from(EXPENSES_TABLE)
    .select(EXPENSE_COLUMNS)
    .is('deleted_at', null)
    .order('date_incurred', { ascending: false })

  if (error) {
    throw new Error(EXPENSES_LOAD_ERROR)
  }

  const rows = expenseRowsSchema.parse(data ?? [])
  return rows.map(toExpense)
}

/**
 * Inserts a new expense for the current station. `org_id` and `created_by`
 * come from the authenticated identity, never from form input.
 */
export async function createExpense(
  client: SupabaseClient,
  values: ExpenseFormValues,
  owner: ExpenseOwner,
): Promise<Expense> {
  const { data, error } = await client
    .from(EXPENSES_TABLE)
    .insert(toInsertRow(values, owner))
    .select(EXPENSE_COLUMNS)
    .single()

  if (error) {
    throw new Error(EXPENSE_SAVE_ERROR)
  }

  return toExpense(expenseRowSchema.parse(data))
}

/** Updates an active expense and returns the saved row. */
export async function updateExpense(
  client: SupabaseClient,
  id: number,
  values: ExpenseFormValues,
): Promise<Expense> {
  const { data, error } = await client
    .from(EXPENSES_TABLE)
    .update(toUpdateRow(values))
    .eq('id', id)
    .is('deleted_at', null)
    .select(EXPENSE_COLUMNS)
    .single()

  if (error) {
    throw new Error(EXPENSE_SAVE_ERROR)
  }

  return toExpense(expenseRowSchema.parse(data))
}

/** Soft-deletes an active expense by stamping `deleted_at`. */
export async function softDeleteExpense(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client
    .from(EXPENSES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    throw new Error(EXPENSE_DELETE_ERROR)
  }
}
