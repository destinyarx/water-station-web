import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  createExpense,
  getActiveExpenses,
  softDeleteExpense,
  updateExpense,
} from '../services/expenses.service'
import type { ExpenseFormValues } from '../expenses.types'

interface QueryResult {
  data?: unknown
  error: { message: string } | null
}

const row = {
  id: 42,
  name: 'Membrane replacement',
  amount: 1250.5,
  category: 'machine_maintenance_repairs',
  category_other: null,
  payment_method: 'gcash',
  payment_method_other: null,
  description: 'Filter housing parts',
  date_incurred: '2026-06-13',
  references_number: 'GCASH-123',
  org_id: '00000000-0000-4000-8000-000000000007',
  created_by: 'user_2abcDEF',
  created_at: '2026-06-13T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const values: ExpenseFormValues = {
  name: 'Membrane replacement',
  amount: 1250.5,
  category: 'machine_maintenance_repairs',
  categoryOther: '',
  paymentMethod: 'gcash',
  paymentMethodOther: '',
  description: 'Filter housing parts',
  dateIncurred: '2026-06-13',
  referencesNumber: 'GCASH-123',
}

const owner = { orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_2abcDEF' }

function createListClient(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result))
  const is = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ is }))
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, select, is, order }
}

function createInsertClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  const client = { from } as unknown as SupabaseClient
  return { client, insert }
}

function createUpdateClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const is = vi.fn(() => ({ select }))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, eq, is }
}

function createDeleteClient(result: Pick<QueryResult, 'error'>) {
  const is = vi.fn(() => Promise.resolve(result))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update, delete: del }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, del, eq, is }
}

describe('getActiveExpenses', () => {
  it('returns active expenses mapped to the display model', async () => {
    const { client } = createListClient({ data: [row], error: null })

    const expenses = await getActiveExpenses(client)

    expect(expenses).toHaveLength(1)
    expect(expenses[0]).toMatchObject({
      id: 42,
      name: 'Membrane replacement',
      categoryLabel: 'Machine Maintenance & Repairs',
      paymentMethodLabel: 'GCash',
    })
  })

  it('excludes soft-deleted rows and sorts by recent expense date first', async () => {
    const { client, is, order } = createListClient({ data: [], error: null })

    await getActiveExpenses(client)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(order).toHaveBeenCalledWith('date_incurred', { ascending: false })
  })

  it('throws a user-friendly error when the list query fails', async () => {
    const { client } = createListClient({
      data: null,
      error: { message: 'permission denied' },
    })

    await expect(getActiveExpenses(client)).rejects.toThrow(
      'Unable to load expenses. Please try again.',
    )
  })
})

describe('createExpense', () => {
  it('inserts an expense with owner fields and returns the saved record', async () => {
    const { client, insert } = createInsertClient({ data: row, error: null })

    const expense = await createExpense(client, values, owner)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: '00000000-0000-4000-8000-000000000007', created_by: 'user_2abcDEF' }),
    )
    expect(expense).toMatchObject({ id: 42, name: 'Membrane replacement' })
  })

  it('throws a user-friendly error when insert fails', async () => {
    const { client } = createInsertClient({
      data: null,
      error: { message: 'RLS violation' },
    })

    await expect(createExpense(client, values, owner)).rejects.toThrow(
      'Unable to save expense. Please try again.',
    )
  })
})

describe('updateExpense', () => {
  it('updates an active expense and returns the saved record', async () => {
    const { client, eq, is } = createUpdateClient({
      data: { ...row, name: 'Updated expense' },
      error: null,
    })

    const expense = await updateExpense(client, 42, values)

    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(expense.name).toBe('Updated expense')
  })
})

describe('softDeleteExpense', () => {
  it('soft-deletes by setting deleted_at and never hard-deletes', async () => {
    const { client, update, del, eq, is } = createDeleteClient({ error: null })

    await softDeleteExpense(client, 42)

    expect(del).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) }),
    )
    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })
})
