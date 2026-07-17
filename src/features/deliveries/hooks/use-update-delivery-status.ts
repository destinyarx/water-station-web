'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'
import { productKeys } from '@/features/products/products.keys'

import { deliveryKeys } from '../deliveries.keys'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { updateDeliveryStatus } from '../services/delivery-status.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export interface UpdateStatusVars {
  delivery: Delivery
  to: DeliveryStatus
  failureRemarks?: string
  cancellationRemarks?: string
}

export function useUpdateDeliveryStatus() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Delivery, Error, UpdateStatusVars>({
    mutationFn: ({ delivery, to, failureRemarks, cancellationRemarks }) => {
      return updateDeliveryStatus(client, {
        deliveryId: delivery.id,
        from: delivery.status,
        to,
        failureRemarks,
        cancellationRemarks,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all })
      // Stock moved — refresh the product catalog too.
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.financialsAll() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
    },
  })
}
