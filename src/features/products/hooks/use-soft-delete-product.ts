'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import { softDeleteProduct } from '../services/products.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

export function useSoftDeleteProduct() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (id) => softDeleteProduct(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product deleted.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
