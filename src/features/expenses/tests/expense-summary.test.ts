import { describe, expect, it } from 'vitest'

import {
  createExpenseSummary,
  filterExpenses,
} from '../expenses.summary'
import type { Expense } from '../expenses.types'

const baseExpense: Expense = {
  id: 1,
  name: 'Membrane replacement',
  amount: 1000,
  category: 'machine_maintenance_repairs',
  categoryLabel: 'Machine Maintenance & Repairs',
  categoryOther: null,
  paymentMethod: 'gcash',
  paymentMethodLabel: 'GCash',
  paymentMethodOther: null,
  description: 'Filter housing parts',
  dateIncurred: '2026-06-13',
  referencesNumber: 'GCASH-123',
  orgId: 7,
  createdBy: 'user_2abcDEF',
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
}

describe('filterExpenses', () => {
  it('searches by name, description, and reference number', () => {
    const expenses: Expense[] = [
      baseExpense,
      {
        ...baseExpense,
        id: 2,
        name: 'Facility rent',
        description: null,
        referencesNumber: null,
      },
    ]

    expect(filterExpenses(expenses, { search: 'gcash-123' })).toHaveLength(1)
    expect(filterExpenses(expenses, { search: 'housing' })).toHaveLength(1)
    expect(filterExpenses(expenses, { search: 'rent' })).toHaveLength(1)
  })

  it('filters by category and payment method', () => {
    const expenses: Expense[] = [
      baseExpense,
      {
        ...baseExpense,
        id: 2,
        category: 'rent_facility',
        paymentMethod: 'cash',
      },
    ]

    expect(
      filterExpenses(expenses, {
        category: 'rent_facility',
        paymentMethod: 'cash',
      }),
    ).toHaveLength(1)
  })
})

describe('createExpenseSummary', () => {
  it('calculates active-only summary values for the current calendar month', () => {
    const expenses: Expense[] = [
      baseExpense,
      { ...baseExpense, id: 2, amount: 500, dateIncurred: '2026-06-10' },
      {
        ...baseExpense,
        id: 3,
        amount: 9999,
        dateIncurred: '2026-05-30',
        deletedAt: '2026-06-10T00:00:00.000Z',
      },
    ]

    const summary = createExpenseSummary(expenses, new Date('2026-06-13'))

    expect(summary.totalExpenses).toBe(1500)
    expect(summary.thisMonth).toBe(1500)
    expect(summary.recentExpenseCount).toBe(2)
    expect(summary.largestCategoryLabel).toBe('Machine Maintenance & Repairs')
  })
})
