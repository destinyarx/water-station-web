'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query'

import { getOrgUsers } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import type { OrgUser } from '../maintenance.types'
import { useClerkSupabase } from './use-clerk-supabase'
import { useMaintenanceOwner } from './use-maintenance-owner'

/** Loads the caller's org staff for the assignee picker. */
export function useOrgUsers(): UseQueryResult<OrgUser[], Error> {
  const client = useClerkSupabase()
  const owner = useMaintenanceOwner()

  return useQuery<OrgUser[], Error>({
    queryKey: maintenanceKeys.orgUsers(),
    queryFn: () => getOrgUsers(client, owner!.orgId),
    enabled: owner != null,
  })
}
