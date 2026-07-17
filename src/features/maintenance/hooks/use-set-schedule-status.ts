'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { setScheduleStatus } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

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
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success(isActive ? 'Schedule set as active.' : 'Schedule set as inactive.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
