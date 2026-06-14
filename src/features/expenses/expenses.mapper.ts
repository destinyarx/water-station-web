import {
  expenseCategories,
  paymentMethods,
} from './expenses.constants'
import type {
  Expense,
  ExpenseCategory,
  ExpenseFormValues,
  ExpenseInsert,
  ExpenseOwner,
  ExpenseRow,
  ExpenseUpdate,
  PaymentMethod,
} from './expenses.types'

const categoryLabels = new Map<ExpenseCategory, string>(
  expenseCategories.map((category) => [category.value, category.name]),
)

const paymentMethodLabels = new Map<PaymentMethod, string>(
  paymentMethods.map((method) => [method.value, method.name]),
)

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function categoryLabel(
  category: ExpenseCategory,
  categoryOther: string | null,
): string {
  if (category === 'other' && categoryOther?.trim()) {
    return categoryOther.trim()
  }

  return categoryLabels.get(category) ?? category
}

function paymentLabel(
  paymentMethod: PaymentMethod,
  paymentMethodOther: string | null,
): string {
  if (paymentMethod === 'other' && paymentMethodOther?.trim()) {
    return paymentMethodOther.trim()
  }

  return paymentMethodLabels.get(paymentMethod) ?? paymentMethod
}

/** Maps a validated database row to the camelCase display model. */
export function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category,
    categoryLabel: categoryLabel(row.category, row.category_other),
    categoryOther: row.category_other,
    paymentMethod: row.payment_method,
    paymentMethodLabel: paymentLabel(
      row.payment_method,
      row.payment_method_other,
    ),
    paymentMethodOther: row.payment_method_other,
    description: row.description,
    dateIncurred: row.date_incurred,
    referencesNumber: row.references_number,
    orgId: row.org_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

/** Maps validated form values to a snake_case insert payload. */
export function toInsertRow(
  values: ExpenseFormValues,
  owner: ExpenseOwner,
): ExpenseInsert {
  return {
    name: values.name.trim(),
    amount: values.amount,
    category: values.category,
    category_other: emptyToNull(values.categoryOther),
    payment_method: values.paymentMethod,
    payment_method_other: emptyToNull(values.paymentMethodOther),
    description: emptyToNull(values.description),
    date_incurred: values.dateIncurred,
    references_number: emptyToNull(values.referencesNumber),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

/** Maps a display model back to editable form values. */
export function toFormValues(expense: Expense): ExpenseFormValues {
  return {
    name: expense.name,
    amount: expense.amount,
    category: expense.category,
    categoryOther: expense.categoryOther ?? '',
    paymentMethod: expense.paymentMethod,
    paymentMethodOther: expense.paymentMethodOther ?? '',
    description: expense.description ?? '',
    dateIncurred: expense.dateIncurred,
    referencesNumber: expense.referencesNumber ?? '',
  }
}

/** Maps validated form values to a snake_case update payload. */
export function toUpdateRow(values: ExpenseFormValues): ExpenseUpdate {
  return {
    name: values.name.trim(),
    amount: values.amount,
    category: values.category,
    category_other: emptyToNull(values.categoryOther),
    payment_method: values.paymentMethod,
    payment_method_other: emptyToNull(values.paymentMethodOther),
    description: emptyToNull(values.description),
    date_incurred: values.dateIncurred,
    references_number: emptyToNull(values.referencesNumber),
    updated_at: new Date().toISOString(),
  }
}
