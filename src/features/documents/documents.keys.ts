export interface DocumentFilters {
  active: boolean
  search: string
  category: string
  visibility: 'all' | 'mine' | 'private'
  currentUserId: string
  page: number
  perPage: number
}

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentKeys.lists(), filters] as const,
  stats: () => [...documentKeys.all, 'stats'] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
}
