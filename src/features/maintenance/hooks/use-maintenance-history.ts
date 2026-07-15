'use client'

import { useMemo } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { maintenanceKeys } from '../maintenance.keys'
import { getMaintenanceHistory } from '../services/maintenance-history.service'
import { buildHistoryEntries } from '../maintenance.view'
import type { MaintenanceHistoryEntry, OrgUser } from '../maintenance.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useOrgUsers } from './use-org-users'

const EMPTY_USERS: OrgUser[] = []

export interface MaintenanceHistoryResult {
  entries: MaintenanceHistoryEntry[]
  hasNext: boolean
  isPending: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
}

/**
 * One page of completed occurrences. Only fetches while the modal is open.
 * Assignee names are joined after the query, so the cached page never goes
 * stale against the org-users list.
 */
export function useMaintenanceHistory(
  page: number,
  enabled: boolean,
): MaintenanceHistoryResult {
  const client = useClerkSupabase()
  const usersQuery = useOrgUsers()

  const query = useQuery({
    queryKey: maintenanceKeys.historyPage(page),
    queryFn: () => getMaintenanceHistory(client, page),
    enabled,
    placeholderData: keepPreviousData,
  })

  const entries = useMemo(
    () => buildHistoryEntries(query.data?.rows ?? [], usersQuery.data ?? EMPTY_USERS),
    [query.data, usersQuery.data],
  )

  return {
    entries,
    hasNext: query.data?.hasNext ?? false,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
