'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setScheduleStatus } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import { useClerkSupabase } from './use-clerk-supabase'

interface SetScheduleStatusInput {
  scheduleId: number
  isActive: boolean
}

/** Toggles a schedule active/inactive and refreshes the board. */
export function useSetScheduleStatus() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, SetScheduleStatusInput>({
    mutationFn: ({ scheduleId, isActive }) => setScheduleStatus(client, scheduleId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
    },
  })
}
