'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { deliveryKeys } from '../deliveries.keys'
import type {
  DeliveryScheduleRow,
  UnifiedDeliveryFormValues,
} from '../deliveries.types'
import { createUnifiedDeliverySchedule } from '../services/delivery-schedule.service'
import { useDeliveryOwner } from './use-delivery-owner'

export function useCreateUnifiedDelivery() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()

  return useMutation<DeliveryScheduleRow, Error, UnifiedDeliveryFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return createUnifiedDeliverySchedule(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.financialsAll() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
    },
  })
}
