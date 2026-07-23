'use client'

import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

import { waterQualityKeys, type WaterQualityFilters } from '../water-quality.keys'
import {
  getActiveTests,
  getWaterQualityStats,
} from '../services/water-quality.service'
import type {
  WaterQualityPage,
  WaterQualityStats,
} from '../water-quality.types'

export function useWaterQualityTests(
  filters: WaterQualityFilters,
): UseQueryResult<WaterQualityPage, Error> {
  const client = useClerkSupabase()

  return useQuery<WaterQualityPage, Error>({
    queryKey: waterQualityKeys.list(filters),
    queryFn: () => getActiveTests(client, filters),
    placeholderData: keepPreviousData,
  })
}

export function useWaterQualityStats(): UseQueryResult<
  WaterQualityStats,
  Error
> {
  const client = useClerkSupabase()

  return useQuery<WaterQualityStats, Error>({
    queryKey: waterQualityKeys.stats(),
    queryFn: () => getWaterQualityStats(client),
  })
}
