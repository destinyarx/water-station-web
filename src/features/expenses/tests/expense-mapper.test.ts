import { describe, expect, it } from 'vitest'

import { toExpense, toFormValues, toInsertRow, toUpdateRow } from '../expenses.mapper'
import type { ExpenseFormValues, ExpenseRow } from '../expenses.types'

const owner = { orgId: 7, createdBy: 'user_2abcDEF' }

const row: ExpenseRow = {
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
  org_id: 7,
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
  referencesNumber: '',
}

describe('expense mappers', () => {
  it('maps a database row to the display model', () => {
    const expense = toExpense(row)

    expect(expense).toMatchObject({
      id: 42,
      name: 'Membrane replacement',
      amount: 1250.5,
      categoryLabel: 'Machine Maintenance & Repairs',
      paymentMethodLabel: 'GCash',
      orgId: 7,
      createdBy: 'user_2abcDEF',
    })
  })

  it('uses other text as the readable label when present', () => {
    const expense = toExpense({
      ...row,
      category: 'other',
      category_other: 'Water permit desk fee',
      payment_method: 'other',
      payment_method_other: 'Owner advance',
    })

    expect(expense.categoryLabel).toBe('Water permit desk fee')
    expect(expense.paymentMethodLabel).toBe('Owner advance')
  })

  it('maps form values to an insert row with owner fields', () => {
    const insert = toInsertRow(values, owner)

    expect(insert).toMatchObject({
      name: 'Membrane replacement',
      amount: 1250.5,
      category: 'machine_maintenance_repairs',
      category_other: null,
      payment_method: 'gcash',
      payment_method_other: null,
      description: 'Filter housing parts',
      references_number: null,
      org_id: 7,
      created_by: 'user_2abcDEF',
    })
  })

  it('maps a display model back to editable form values', () => {
    const formValues = toFormValues(toExpense(row))
    expect(formValues).toMatchObject({
      name: 'Membrane replacement',
      amount: 1250.5,
      category: 'machine_maintenance_repairs',
      paymentMethod: 'gcash',
      referencesNumber: 'GCASH-123',
    })
  })

  it('omits owner fields from update payloads', () => {
    const update = toUpdateRow(values)

    expect(Object.keys(update)).not.toContain('org_id')
    expect(Object.keys(update)).not.toContain('created_by')
    expect(update.updated_at).toBeTruthy()
  })
})
