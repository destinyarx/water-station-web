import { describe, expect, it } from 'vitest'

import { expenseFormSchema } from '../expenses.schema'

const validInput = {
  name: 'Membrane replacement',
  amount: '1250.50',
  category: 'machine_maintenance_repairs',
  categoryOther: '',
  paymentMethod: 'gcash',
  paymentMethodOther: '',
  description: 'Filter housing parts',
  dateIncurred: '2026-06-13',
  referencesNumber: 'GCASH-123',
}

describe('expenseFormSchema', () => {
  it('accepts a fully populated valid expense', () => {
    const result = expenseFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('parses amount strings into numbers', () => {
    const result = expenseFormSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.amount).toBe(1250.5)
    }
  })

  it('rejects an empty expense name', () => {
    const result = expenseFormSchema.safeParse({ ...validInput, name: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects a non-positive amount', () => {
    const result = expenseFormSchema.safeParse({ ...validInput, amount: '0' })
    expect(result.success).toBe(false)
  })

  it('requires category_other when category is other', () => {
    const result = expenseFormSchema.safeParse({
      ...validInput,
      category: 'other',
      categoryOther: '',
    })
    expect(result.success).toBe(false)
  })

  it('requires payment_method_other when payment method is other', () => {
    const result = expenseFormSchema.safeParse({
      ...validInput,
      paymentMethod: 'other',
      paymentMethodOther: '',
    })
    expect(result.success).toBe(false)
  })

  it('keeps reference number optional', () => {
    const result = expenseFormSchema.safeParse({
      ...validInput,
      referencesNumber: '',
    })
    expect(result.success).toBe(true)
  })
})
