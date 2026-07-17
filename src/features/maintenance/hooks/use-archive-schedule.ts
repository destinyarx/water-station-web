'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { archiveSchedule } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

/** Soft-deletes a schedule (owner-only) and refreshes the board. */
export function useArchiveSchedule(): UseMutationResult<void, Error, number> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (scheduleId) => archiveSchedule(client, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success('Maintenance task deleted.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
