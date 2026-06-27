'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getMaintenanceBoard } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import { buildTaskViews, todayIso } from '../maintenance.view'
import type { MaintenanceTaskView, OrgUser } from '../maintenance.types'
import { useClerkSupabase } from './use-clerk-supabase'
import { useOrgUsers } from './use-org-users'

const EMPTY_USERS: OrgUser[] = []

export interface MaintenanceTasksResult {
  views: MaintenanceTaskView[]
  isPending: boolean
  isError: boolean
  error: Error | null
}

/**
 * Loads the maintenance board (schedules + occurrences) and resolves it into
 * joined task views. Assignee names come from the org-users query. Filtering by
 * `showInactive`/search/status happens in the page.
 */
export function useMaintenanceTasks(): MaintenanceTasksResult {
  const client = useClerkSupabase()
  const usersQuery = useOrgUsers()

  const boardQuery = useQuery({
    queryKey: maintenanceKeys.lists(),
    queryFn: () => getMaintenanceBoard(client),
  })

  const views = useMemo(() => {
    if (!boardQuery.data) return []
    return buildTaskViews(
      boardQuery.data.tasks,
      boardQuery.data.schedules,
      usersQuery.data ?? EMPTY_USERS,
      todayIso(),
    )
  }, [boardQuery.data, usersQuery.data])

  return {
    views,
    isPending: boardQuery.isPending,
    isError: boardQuery.isError,
    error: boardQuery.error,
  }
}
