'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '@/features/products/products.keys'

import { deliveryKeys } from '../deliveries.keys'
import { toStatusTransitionItems } from '../deliveries.mapper'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { updateDeliveryStatus } from '../services/delivery-status.service'
import { useClerkSupabase } from './use-clerk-supabase'
import { useDeliveryOwner } from './use-delivery-owner'
import { useProducts } from '@/features/products/hooks/use-products'

export interface UpdateStatusVars {
  delivery: Delivery
  to: DeliveryStatus
  failureRemarks?: string
}

export function useUpdateDeliveryStatus() {
  const client = useClerkSupabase()
  const owner = useDeliveryOwner()
  const { data: products } = useProducts()
  const queryClient = useQueryClient()

  return useMutation<Delivery, Error, UpdateStatusVars>({
    mutationFn: ({ delivery, to, failureRemarks }) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return updateDeliveryStatus(client, {
        deliveryId: delivery.id,
        from: delivery.status,
        to,
        items: toStatusTransitionItems(delivery.items, products ?? []),
        deliveredBy: owner.createdBy,
        failureRemarks,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      // Stock moved — refresh the product catalog too.
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
