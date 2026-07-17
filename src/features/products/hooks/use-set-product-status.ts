'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { dashboardKeys } from '@/features/dashboard'

import { productKeys } from '../products.keys'
import { setProductStatus } from '../services/products.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

interface SetProductStatusInput {
  id: number
  isActive: boolean
}

/** Marks a product active/discontinued and refreshes the catalog on success. */
export function useSetProductStatus() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, SetProductStatusInput>({
    mutationFn: ({ id, isActive }) => setProductStatus(client, id, isActive),
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.operationsAll() })
      toast.success(isActive ? 'Product set as active.' : 'Product discontinued.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
