import type { z } from 'zod'

import type {
  expenseCategories,
  paymentMethods,
} from './expenses.constants'
import type { expenseFormSchema, expenseRowSchema } from './expenses.schema'

export type ExpenseCategory = (typeof expenseCategories)[number]['value']
export type PaymentMethod = (typeof paymentMethods)[number]['value']

/** A raw `public.expenses` row as validated from Supabase. */
export type ExpenseRow = z.infer<typeof expenseRowSchema>

/** Raw field values the expense form holds before Zod transforms them. */
export type ExpenseFormInput = z.input<typeof expenseFormSchema>

/** Validated values produced by the create/edit expense form. */
export type ExpenseFormValues = z.output<typeof expenseFormSchema>

/**
 * Ownership context resolved from the Clerk identity, applied by the service
 * layer. Never sourced from form input so a client cannot spoof station scope.
 */
export interface ExpenseOwner {
  orgId: number
  createdBy: string
}

/** Snake_case payload inserted into `public.expenses`. */
export interface ExpenseInsert {
  name: string
  amount: number
  category: ExpenseCategory
  category_other: string | null
  payment_method: PaymentMethod
  payment_method_other: string | null
  description: string | null
  date_incurred: string
  references_number: string | null
  org_id: number
  created_by: string
}

/** Snake_case payload sent in an expense update. */
export interface ExpenseUpdate {
  name: string
  amount: number
  category: ExpenseCategory
  category_other: string | null
  payment_method: PaymentMethod
  payment_method_other: string | null
  description: string | null
  date_incurred: string
  references_number: string | null
  updated_at: string
}

/** Display model consumed by the UI. */
export interface Expense {
  id: number
  name: string
  amount: number
  category: ExpenseCategory
  categoryLabel: string
  categoryOther: string | null
  paymentMethod: PaymentMethod
  paymentMethodLabel: string
  paymentMethodOther: string | null
  description: string | null
  dateIncurred: string
  referencesNumber: string | null
  orgId: number
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
