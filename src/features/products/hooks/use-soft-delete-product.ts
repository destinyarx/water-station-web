'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import { softDeleteProduct } from '../services/products.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useSoftDeleteProduct() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id) => softDeleteProduct(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
