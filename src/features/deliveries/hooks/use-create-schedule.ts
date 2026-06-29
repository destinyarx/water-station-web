'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type {
  DeliveryScheduleFormValues,
  DeliveryScheduleRow,
} from '../deliveries.types'
import { createWeeklySchedule } from '../services/delivery-schedule.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useDeliveryOwner } from './use-delivery-owner'

export function useCreateSchedule() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()

  return useMutation<DeliveryScheduleRow, Error, DeliveryScheduleFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return createWeeklySchedule(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    },
  })
}
