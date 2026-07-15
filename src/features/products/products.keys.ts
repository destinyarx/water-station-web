/** Filters that scope the active product list query. */
export interface ProductFilters {
  deleted: boolean
  search: string
  category: 'all' | 'refillable' | 'stocked' | 'discontinued'
  page: number
  perPage: number
}

/** Query-key factory for the products feature. Keys are always arrays. */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  options: () => [...productKeys.all, 'options'] as const,
  stats: () => [...productKeys.all, 'stats'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
}
