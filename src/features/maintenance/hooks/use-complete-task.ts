'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { completeTask } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import type { MaintenanceTaskView } from '../maintenance.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useMaintenanceOwner } from './use-maintenance-owner'
import { toast } from '@/stores/toast-store'

/** Completes (or re-opens a one-time) occurrence; rolls recurring ones forward. */
export function useCompleteTask(): UseMutationResult<void, Error, MaintenanceTaskView> {
  const client = useClerkSupabase()
  const owner = useMaintenanceOwner()
  const queryClient = useQueryClient()

  return useMutation<void, Error, MaintenanceTaskView>({
    mutationFn: (task) => {
      if (!owner) {
        throw new Error('Your station context is missing. Please sign in again.')
      }
      return completeTask(client, task, owner)
    },
    onSuccess: (_data, task) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success(task.displayStatus === 'completed' ? 'Task reopened.' : 'Task marked complete.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
