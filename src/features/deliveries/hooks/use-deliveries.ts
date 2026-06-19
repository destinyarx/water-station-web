'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type { Delivery } from '../deliveries.types'
import { getActiveDeliveries } from '../services/deliveries.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useDeliveries(): UseQueryResult<Delivery[], Error> {
  const client = useClerkSupabase()

  return useQuery<Delivery[], Error>({
    queryKey: deliveryKeys.list({ deleted: false }),
    queryFn: () => getActiveDeliveries(client),
  })
}
