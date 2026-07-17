'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

import { dashboardKeys } from '../dashboard.keys'
import {
  getDashboardFinancials,
  getDashboardOperations,
} from '../services/dashboard.service'
import type {
  DashboardFinancials,
  DashboardOperations,
  DashboardPeriod,
} from '../dashboard.types'

export const DASHBOARD_STALE_TIME = 60_000

export function dashboardFinancialsQueryOptions(
  client: SupabaseClient,
  period: DashboardPeriod,
  referenceDate: string,
) {
  return queryOptions({
    queryKey: dashboardKeys.financials(period, referenceDate),
    queryFn: () => getDashboardFinancials(client, period, referenceDate),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: keepPreviousData,
  })
}

export function dashboardOperationsQueryOptions(
  client: SupabaseClient,
  period: DashboardPeriod,
  referenceDate: string,
) {
  return queryOptions({
    queryKey: dashboardKeys.operations(period, referenceDate),
    queryFn: () => getDashboardOperations(client, period, referenceDate),
    staleTime: DASHBOARD_STALE_TIME,
    placeholderData: keepPreviousData,
  })
}

export function shouldEnableDashboardFinancials(
  isReady: boolean,
  isOwner: boolean,
): boolean {
  return isReady && isOwner
}

export function useDashboardFinancials(
  period: DashboardPeriod,
  referenceDate: string,
  isReady: boolean,
  isOwner: boolean,
): UseQueryResult<DashboardFinancials, Error> {
  const client = useClerkSupabase()

  return useQuery({
    ...dashboardFinancialsQueryOptions(client, period, referenceDate),
    enabled: shouldEnableDashboardFinancials(isReady, isOwner),
  })
}

export function useDashboardOperations(
  period: DashboardPeriod,
  referenceDate: string,
  isReady: boolean,
): UseQueryResult<DashboardOperations, Error> {
  const client = useClerkSupabase()

  return useQuery({
    ...dashboardOperationsQueryOptions(client, period, referenceDate),
    enabled: isReady,
  })
}
