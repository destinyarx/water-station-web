export interface ExpenseFilters {
  active: boolean
  search: string
  category: string
  page: number
  perPage: number
}

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  summary: () => [...expenseKeys.all, 'summary'] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number) => [...expenseKeys.details(), id] as const,
}
