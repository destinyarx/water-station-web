'use client'

import { useQuery } from '@tanstack/react-query'

import { productKeys } from '../products.keys'
import type { Product } from '../products.types'
import { getActiveProducts } from '../services/products.service'
import { useClerkSupabase } from './use-clerk-supabase'

export function useProducts() {
  const client = useClerkSupabase()

  return useQuery<Product[], Error>({
    queryKey: productKeys.list({ deleted: false }),
    queryFn: () => getActiveProducts(client),
  })
}
