'use client'

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { createSchedule } from '../services/maintenance.service'
import { maintenanceKeys } from '../maintenance.keys'
import type { CreateMaintenanceValues, MaintenanceScheduleRow } from '../maintenance.types'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useMaintenanceOwner } from './use-maintenance-owner'
import { toast } from '@/stores/toast-store'

/** Creates a schedule + its occurrences and refreshes the board on success. */
export function useCreateSchedule(): UseMutationResult<
  MaintenanceScheduleRow,
  Error,
  CreateMaintenanceValues
> {
  const client = useClerkSupabase()
  const owner = useMaintenanceOwner()
  const queryClient = useQueryClient()

  return useMutation<MaintenanceScheduleRow, Error, CreateMaintenanceValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error('Your station context is missing. Please sign in again.')
      }
      return createSchedule(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success('Maintenance task scheduled.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
