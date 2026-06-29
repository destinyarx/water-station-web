'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import {
  getDeliveryHistory,
  type DeliveryHistoryPage,
} from '../services/delivery-history.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useDeliveryHistory(
  page: number,
  enabled: boolean,
): UseQueryResult<DeliveryHistoryPage, Error> {
  const client = useClerkSupabase()

  return useQuery<DeliveryHistoryPage, Error>({
    queryKey: deliveryKeys.historyPage(page),
    queryFn: () => getDeliveryHistory(client, page),
    enabled,
    placeholderData: keepPreviousData,
  })
}
