'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import {
  getCurrentDeliveries,
  type CurrentQueuePage,
} from '../services/delivery-queue.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useCurrentDeliveries(
  page: number,
): UseQueryResult<CurrentQueuePage, Error> {
  const client = useClerkSupabase()

  return useQuery<CurrentQueuePage, Error>({
    queryKey: deliveryKeys.queuePage(page),
    queryFn: () => getCurrentDeliveries(client, page),
    placeholderData: keepPreviousData,
  })
}
