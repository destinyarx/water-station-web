import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  PRODUCT_COLUMNS,
  PRODUCT_DELETE_ERROR,
  PRODUCT_NOT_PERMITTED_ERROR,
  PRODUCT_SAVE_ERROR,
  PRODUCTS_LOAD_ERROR,
  PRODUCTS_TABLE,
} from '../products.constants'
import { toInsertRow, toProduct, toUpdateRow } from '../products.mapper'
import { productRowSchema } from '../products.schema'
import type {
  Product,
  ProductPage,
  ProductStats,
  ProductFormValues,
  ProductOwner,
} from '../products.types'
import type { ProductFilters } from '../products.keys'
import { LOW_STOCK_THRESHOLD } from '../products.constants'

const productRowsSchema = z.array(productRowSchema)

export async function getActiveProducts(
  client: SupabaseClient,
  filters: ProductFilters,
): Promise<ProductPage> {
  let query = client
    .from(PRODUCTS_TABLE)
    .select(PRODUCT_COLUMNS, { count: 'exact' })
    .is('deleted_at', null)

  const search = filters.search.trim()
  if (search) {
    query = query.or(`product_name.ilike.%${search}%,descriptions.ilike.%${search}%`)
  }

  if (filters.category === 'refillable') query = query.eq('is_stock_tracked', false)
  if (filters.category === 'stocked') query = query.eq('is_stock_tracked', true)
  if (filters.category === 'discontinued') query = query.eq('is_active', false)

  const from = (filters.page - 1) * filters.perPage
  const to = from + filters.perPage - 1
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(PRODUCTS_LOAD_ERROR)
  }

  const rows = productRowsSchema.parse(data ?? [])
  return { products: rows.map(toProduct), total: count ?? 0 }
}

export async function getProductOptions(client: SupabaseClient): Promise<Product[]> {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .select(PRODUCT_COLUMNS)
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('product_name', { ascending: true })
    .limit(500)

  if (error) throw new Error(PRODUCTS_LOAD_ERROR)
  return productRowsSchema.parse(data ?? []).map(toProduct)
}

export async function getProductStats(client: SupabaseClient): Promise<ProductStats> {
  const results = await Promise.all([
    client.from(PRODUCTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null),
    client.from(PRODUCTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
    client.from(PRODUCTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_stock_tracked', true),
    client.from(PRODUCTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true).eq('is_stock_tracked', true).gt('stock', 0).lte('stock', LOW_STOCK_THRESHOLD),
    client.from(PRODUCTS_TABLE).select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true).eq('is_stock_tracked', true).eq('stock', 0),
  ])
  if (results.some(({ error }) => error)) throw new Error(PRODUCTS_LOAD_ERROR)
  const [total, active, stockTracked, low, out] = results.map(({ count }) => count ?? 0)
  return { total, active, stockTracked, low, out }
}

export async function createProduct(
  client: SupabaseClient,
  values: ProductFormValues,
  owner: ProductOwner,
): Promise<Product> {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .insert(toInsertRow(values, owner))
    .select(PRODUCT_COLUMNS)
    .single()

  if (error) {
    throw new Error(PRODUCT_SAVE_ERROR)
  }

  return toProduct(productRowSchema.parse(data))
}

export async function updateProduct(
  client: SupabaseClient,
  id: number,
  values: ProductFormValues,
): Promise<Product> {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .update(toUpdateRow(values))
    .eq('id', id)
    .is('deleted_at', null)
    .select(PRODUCT_COLUMNS)
    .single()

  if (error) {
    throw new Error(PRODUCT_SAVE_ERROR)
  }

  return toProduct(productRowSchema.parse(data))
}

export async function softDeleteProduct(
  client: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await client
    .from(PRODUCTS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    throw new Error(PRODUCT_DELETE_ERROR)
  }
}

/**
 * Toggles a product's active/discontinued status. Independent of soft-delete:
 * the row stays in the active list either way (it is only hidden by
 * `deleted_at`). The `deleted_at is null` filter keeps archived rows untouched.
 */
export async function setProductStatus(
  client: SupabaseClient,
  id: number,
  isActive: boolean,
): Promise<void> {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .update({ is_active: isActive })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')

  if (error) {
    throw new Error(PRODUCT_SAVE_ERROR)
  }

  if (!data?.length) {
    throw new Error(PRODUCT_NOT_PERMITTED_ERROR)
  }
}
