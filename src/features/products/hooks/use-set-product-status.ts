'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import { setProductStatus } from '../services/products.service'
import { useClerkSupabase } from './use-clerk-supabase'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
