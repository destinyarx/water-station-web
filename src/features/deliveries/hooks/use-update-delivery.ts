'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type { Delivery, DeliveryEditFormValues } from '../deliveries.types'
import { updateDeliveryOccurrence } from '../services/delivery-edit.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useDeliveryOwner } from './use-delivery-owner'

export interface UpdateDeliveryVars {
  deliveryId: number
  values: DeliveryEditFormValues
}

export function useUpdateDelivery() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()

  return useMutation<Delivery, Error, UpdateDeliveryVars>({
    mutationFn: ({ deliveryId, values }) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return updateDeliveryOccurrence(client, deliveryId, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    },
  })
}
