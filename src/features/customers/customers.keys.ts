/** Filters that scope the active customer list query. */
export interface CustomerFilters {
  archived: false
  search: string
  type: 'all' | 'business' | 'household'
  status: 'active' | 'inactive'
  page: number
  perPage: number
}

/**
 * Query-key factory for the customers feature. Keys are always arrays so
 * TanStack Query can scope invalidation (e.g. invalidate `lists()` after a
 * mutation without touching unrelated detail queries).
 */
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
  options: () => [...customerKeys.all, 'options'] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
}
