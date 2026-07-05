'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import type { Product, ProductFormValues } from '../products.types'
import { updateProduct } from '../services/products.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

interface UpdateProductInput {
  id: number
  values: ProductFormValues
}

export function useUpdateProduct() {
  const client = useClerkSupabase()
  const queryClient = useQueryClient()

  return useMutation<Product, Error, UpdateProductInput>({
    mutationFn: ({ id, values }) => updateProduct(client, id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product updated.')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
