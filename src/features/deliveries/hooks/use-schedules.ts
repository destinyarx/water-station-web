'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import {
  getSchedules,
  type SchedulePage,
} from '../services/delivery-schedule-list.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useSchedules(
  page: number,
  enabled: boolean,
): UseQueryResult<SchedulePage, Error> {
  const client = useClerkSupabase()

  return useQuery<SchedulePage, Error>({
    queryKey: deliveryKeys.schedulesPage(page),
    queryFn: () => getSchedules(client, page),
    enabled,
    placeholderData: keepPreviousData,
  })
}
