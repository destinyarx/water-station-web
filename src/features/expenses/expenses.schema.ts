import { z } from 'zod'

import {
  expenseCategoryValues,
  paymentMethodValues,
} from './expenses.constants'

export const expenseCategorySchema = z.enum(expenseCategoryValues)

export const paymentMethodSchema = z.enum(paymentMethodValues)

/**
 * Shape of a `public.expenses` row as returned by Supabase/PostgREST.
 * Mirrors the schema in `docs/specs/expenses/DESCRIPTION.md`.
 */
export const expenseRowSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1).max(100),
  amount: z.coerce.number().positive(),
  category: expenseCategorySchema,
  category_other: z.string().max(50).nullable(),
  payment_method: paymentMethodSchema,
  payment_method_other: z.string().max(50).nullable(),
  description: z.string().max(255).nullable(),
  date_incurred: z.string().min(1),
  references_number: z.string().max(100).nullable(),
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

function optionalText(max: number, message: string) {
  return z.string().trim().max(max, message).optional()
}

function amountField() {
  return z.preprocess((value) => {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed === '') return undefined
      const parsed = Number(trimmed)
      return Number.isNaN(parsed) ? trimmed : parsed
    }
    return value
  }, z.number({ message: 'Amount is required.' }).positive('Amount must be greater than 0.'))
}

export const expenseFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Expense name is required.')
      .max(100, 'Expense name must be 100 characters or fewer.'),
    amount: amountField(),
    category: expenseCategorySchema,
    categoryOther: optionalText(
      50,
      'Category details must be 50 characters or fewer.',
    ),
    paymentMethod: paymentMethodSchema,
    paymentMethodOther: optionalText(
      50,
      'Payment method details must be 50 characters or fewer.',
    ),
    description: optionalText(
      255,
      'Description must be 255 characters or fewer.',
    ),
    dateIncurred: z.string().min(1, 'Expense date is required.'),
    referencesNumber: optionalText(
      100,
      'Reference number must be 100 characters or fewer.',
    ),
  })
  .superRefine((values, context) => {
    if (values.category === 'other' && !values.categoryOther?.trim()) {
      context.addIssue({
        code: 'custom',
        path: ['categoryOther'],
        message: 'Category details are required when category is Other.',
      })
    }

    if (
      values.paymentMethod === 'other' &&
      !values.paymentMethodOther?.trim()
    ) {
      context.addIssue({
        code: 'custom',
        path: ['paymentMethodOther'],
        message:
          'Payment method details are required when payment method is Other.',
      })
    }
  })
