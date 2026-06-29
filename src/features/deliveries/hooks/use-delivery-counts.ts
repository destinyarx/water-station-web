'use client'

import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import {
  getDeliveryQueueCounts,
  type DeliveryQueueCounts,
} from '../services/delivery-counts.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useDeliveryCounts(): UseQueryResult<DeliveryQueueCounts, Error> {
  const client = useClerkSupabase()

  return useQuery<DeliveryQueueCounts, Error>({
    queryKey: deliveryKeys.counts(),
    queryFn: () => getDeliveryQueueCounts(client),
  })
}
