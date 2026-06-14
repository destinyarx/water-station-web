import type { Expense, ExpenseCategory, PaymentMethod } from './expenses.types'

export interface ExpenseFilters {
  search?: string
  category?: ExpenseCategory | 'all'
  paymentMethod?: PaymentMethod | 'all'
  date?: string
}

export interface ExpenseSummary {
  totalExpenses: number
  thisMonth: number
  largestCategoryLabel: string
  recentExpenseCount: number
}

export function filterExpenses(
  expenses: Expense[],
  filters: ExpenseFilters,
): Expense[] {
  const search = filters.search?.trim().toLowerCase() ?? ''

  return expenses.filter((expense) => {
    const matchesSearch =
      search === '' ||
      [expense.name, expense.description, expense.referencesNumber]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)

    const matchesCategory =
      !filters.category ||
      filters.category === 'all' ||
      expense.category === filters.category

    const matchesPayment =
      !filters.paymentMethod ||
      filters.paymentMethod === 'all' ||
      expense.paymentMethod === filters.paymentMethod

    const matchesDate =
      !filters.date || expense.dateIncurred === filters.date

    return matchesSearch && matchesCategory && matchesPayment && matchesDate
  })
}

export function createExpenseSummary(
  expenses: Expense[],
  now: Date = new Date(),
): ExpenseSummary {
  const activeExpenses = expenses.filter((expense) => expense.deletedAt == null)
  const month = now.getMonth()
  const year = now.getFullYear()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const categoryTotals = new Map<string, { label: string; amount: number }>()

  let totalExpenses = 0
  let thisMonth = 0
  let recentExpenseCount = 0

  for (const expense of activeExpenses) {
    totalExpenses += expense.amount

    const expenseDate = new Date(`${expense.dateIncurred}T00:00:00`)
    if (
      expenseDate.getMonth() === month &&
      expenseDate.getFullYear() === year
    ) {
      thisMonth += expense.amount
    }

    if (expenseDate >= sevenDaysAgo && expenseDate <= now) {
      recentExpenseCount += 1
    }

    const existing = categoryTotals.get(expense.category)
    categoryTotals.set(expense.category, {
      label: expense.categoryLabel,
      amount: (existing?.amount ?? 0) + expense.amount,
    })
  }

  const largestCategory = Array.from(categoryTotals.values()).sort(
    (left, right) => right.amount - left.amount,
  )[0]

  return {
    totalExpenses,
    thisMonth,
    largestCategoryLabel: largestCategory?.label ?? 'None',
    recentExpenseCount,
  }
}

export const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})
