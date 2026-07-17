'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { deliveryKeys } from '../deliveries.keys'
import type { DeliveryScheduleRow } from '../deliveries.types'
import {
  pauseSchedule,
  resumeSchedule,
} from '../services/delivery-schedule-admin.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useDeliveryOwner } from './use-delivery-owner'

interface ScheduleStatusVars {
  schedule: DeliveryScheduleRow
  action: 'pause' | 'resume'
}

export function useScheduleStatus() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()

  return useMutation<void, Error, ScheduleStatusVars>({
    mutationFn: ({ schedule, action }) => {
      const today = new Date().toISOString().slice(0, 10)

      if (action === 'pause') {
        return pauseSchedule(client, schedule.id, today)
      }

      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return resumeSchedule(client, schedule, owner, today)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.financialsAll() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
    },
  })
}
