'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type { DeliveryScheduleFilters } from '../deliveries.keys'
import {
  getSchedules,
  type SchedulePage,
} from '../services/delivery-schedule-list.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useSchedules(
  filters: DeliveryScheduleFilters,
  enabled: boolean,
): UseQueryResult<SchedulePage, Error> {
  const client = useClerkSupabase()

  return useQuery<SchedulePage, Error>({
    queryKey: deliveryKeys.schedulesPage(filters),
    queryFn: () => getSchedules(client, filters),
    enabled,
    placeholderData: keepPreviousData,
  })
}
