'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import type { Product, ProductFormValues } from '../products.types'
import { createProduct } from '../services/products.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { useProductOwner } from './use-product-owner'

export function useCreateProduct() {
  const client = useClerkSupabase()
  const owner = useProductOwner()
  const queryClient = useQueryClient()

  return useMutation<Product, Error, ProductFormValues>({
    mutationFn: (values) => {
      if (!owner) {
        throw new Error('Unable to resolve the current station user.')
      }

      return createProduct(client, values, owner)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
