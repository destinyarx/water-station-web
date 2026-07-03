'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { updateSchedule } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import type { EditMaintenanceValues } from '../maintenance.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export interface UpdateScheduleInput {
  scheduleId: number
  taskId: number
  values: EditMaintenanceValues
}

/** Edits a task (schedule descriptive fields + this occurrence). */
export function useUpdateSchedule(): UseMutationResult<void, Error, UpdateScheduleInput> {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdateScheduleInput>({
    mutationFn: ({ scheduleId, taskId, values }) =>
      updateSchedule(client, scheduleId, taskId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      toast.success('Task updated.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
