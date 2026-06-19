'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deliveryKeys } from '../deliveries.keys'
import type { Delivery, DeliveryFormValues } from '../deliveries.types'
import { createOneTimeDelivery } from '../services/deliveries.service'
import { useClerkSupabase } from './use-clerk-supabase'
import { useDeliveryOwner } from './use-delivery-owner'

export function useCreateDelivery() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const queryClient = useQueryClient()

  return useMutation<Delivery, Error, DeliveryFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return createOneTimeDelivery(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
    },
  })
}
