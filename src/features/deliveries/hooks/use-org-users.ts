'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { deliveryKeys } from '../deliveries.keys'
import type { OrgUser } from '../deliveries.types'
import { getOrgUsers } from '../services/delivery-schedule.service'
import { useDeliveryOwner } from './use-delivery-owner'

export function useOrgUsers(): UseQueryResult<OrgUser[], Error> {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()

  return useQuery<OrgUser[], Error>({
    queryKey: deliveryKeys.orgUsers(),
    queryFn: () => getOrgUsers(client, owner!.orgId),
    enabled: owner != null,
  })
}
