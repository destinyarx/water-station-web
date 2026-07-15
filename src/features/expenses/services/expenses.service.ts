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
  ExpensePage,
  ExpenseFormValues,
  ExpenseOwner,
} from '../expenses.types'
import type { ExpenseFilters } from '../expenses.keys'
import type { ExpenseSummary } from '../expenses.summary'
import { expenseCategories } from '../expenses.constants'

const expenseSummaryRowSchema = z.object({
  total_expenses: z.coerce.number(),
  this_month: z.coerce.number(),
  this_month_count: z.coerce.number().int(),
  largest_category: z.string().nullable(),
  largest_category_total: z.coerce.number(),
  largest_expense: z.coerce.number(),
  largest_expense_label: z.string().nullable(),
  recent_expense_count: z.coerce.number().int(),
})

const expenseRowsSchema = z.array(expenseRowSchema)

/**
 * Loads active expenses visible to the current user. Station isolation is
 * enforced by Supabase RLS; the `deleted_at is null` filter only hides rows
 * from the default active list.
 */
export async function getActiveExpenses(
  client: SupabaseClient,
  filters: ExpenseFilters,
): Promise<ExpensePage> {
  let query = client
    .from(EXPENSES_TABLE)
    .select(EXPENSE_COLUMNS, { count: 'exact' })
    .is('deleted_at', null)

  const search = filters.search.trim()
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,references_number.ilike.%${search}%`)
  if (filters.category !== 'all') query = query.eq('category', filters.category)

  const from = (filters.page - 1) * filters.perPage
  const { data, error, count } = await query
    .order('date_incurred', { ascending: false })
    .range(from, from + filters.perPage - 1)

  if (error) {
    throw new Error(EXPENSES_LOAD_ERROR)
  }

  const rows = expenseRowsSchema.parse(data ?? [])
  return { expenses: rows.map(toExpense), total: count ?? 0 }
}

export async function getExpenseSummary(client: SupabaseClient): Promise<ExpenseSummary> {
  const { data, error } = await client.rpc('get_expense_summary')
  if (error) throw new Error(EXPENSES_LOAD_ERROR)
  const raw = Array.isArray(data) ? data[0] : data
  const row = expenseSummaryRowSchema.parse(raw)
  const largestCategoryLabel = expenseCategories.find(({ value }) => value === row.largest_category)?.name ?? row.largest_category ?? 'None'
  const now = new Date()
  return {
    totalExpenses: row.total_expenses,
    thisMonth: row.this_month,
    thisMonthCount: row.this_month_count,
    thisMonthLabel: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    largestCategoryLabel,
    largestCategoryTotal: row.largest_category_total,
    largestExpense: row.largest_expense,
    largestExpenseLabel: row.largest_expense_label ?? 'No expenses yet',
    recentExpenseCount: row.recent_expense_count,
  }
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
