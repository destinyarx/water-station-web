import type { TestMethod, TestStatus } from './water-quality.types'

/** Filters that scope the water quality test list query. */
export interface WaterQualityFilters {
  search: string
  method: 'all' | TestMethod
  status: 'all' | TestStatus
  page: number
  perPage: number
}

/**
 * Query-key factory for the water quality feature. Keys are always arrays so
 * TanStack Query can scope invalidation (e.g. invalidate `lists()` after a
 * mutation without touching the stats or detail queries).
 */
export const waterQualityKeys = {
  all: ['water-quality'] as const,
  lists: () => [...waterQualityKeys.all, 'list'] as const,
  list: (filters: WaterQualityFilters) =>
    [...waterQualityKeys.lists(), filters] as const,
  stats: () => [...waterQualityKeys.all, 'stats'] as const,
  details: () => [...waterQualityKeys.all, 'detail'] as const,
  detail: (id: number) => [...waterQualityKeys.details(), id] as const,
}
