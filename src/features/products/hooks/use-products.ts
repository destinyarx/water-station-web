'use client'

import { useQuery } from '@tanstack/react-query'

import { keepPreviousData } from '@tanstack/react-query'
import { productKeys, type ProductFilters } from '../products.keys'
import type { Product, ProductPage, ProductStats } from '../products.types'
import { getActiveProducts, getProductOptions, getProductStats } from '../services/products.service'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'

export function useProducts(filters: ProductFilters) {
  const client = useClerkSupabase()

  return useQuery<ProductPage, Error>({
    queryKey: productKeys.list(filters),
    queryFn: () => getActiveProducts(client, filters),
    placeholderData: keepPreviousData,
  })
}

export function useProductOptions() {
  const client = useClerkSupabase()
  return useQuery<Product[], Error>({ queryKey: productKeys.options(), queryFn: () => getProductOptions(client) })
}

export function useProductStats() {
  const client = useClerkSupabase()
  return useQuery<ProductStats, Error>({ queryKey: productKeys.stats(), queryFn: () => getProductStats(client) })
}
