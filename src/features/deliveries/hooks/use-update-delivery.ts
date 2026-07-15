'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type { Delivery, DeliveryEditFormValues } from '../deliveries.types'
import { updateDeliveryOccurrence } from '../services/delivery-edit.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export interface UpdateDeliveryVars {
  deliveryId: number
  values: DeliveryEditFormValues
}

export function useUpdateDelivery() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Delivery, Error, UpdateDeliveryVars>({
    mutationFn: ({ deliveryId, values }) => updateDeliveryOccurrence(client, deliveryId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    },
  })
}
