'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { maintenanceKeys } from '../maintenance.keys'
import type { MaintenanceTaskView } from '../maintenance.types'
import { cancelTask } from '../services/maintenance.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'
import { useMaintenanceOwner } from './use-maintenance-owner'

/** Cancels one occurrence and preserves the recurring schedule. */
export function useCancelTask(): UseMutationResult<void, Error, MaintenanceTaskView> {
  const client = useClerkSupabase()
  const owner = useMaintenanceOwner()
  const queryClient = useQueryClient()

  return useMutation<void, Error, MaintenanceTaskView>({
    mutationFn: (task) => {
      if (!owner) throw new Error('Your station context is missing. Please sign in again.')
      return cancelTask(client, task, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success('Maintenance occurrence cancelled.')
    },
    onError: (error) => toast.error(error.message),
  })
}
