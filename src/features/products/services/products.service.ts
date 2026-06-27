import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  PRODUCT_COLUMNS,
  PRODUCT_DELETE_ERROR,
  PRODUCT_SAVE_ERROR,
  PRODUCTS_LOAD_ERROR,
  PRODUCTS_TABLE,
} from '../products.constants'
import { toInsertRow, toProduct, toUpdateRow } from '../products.mapper'
import { productRowSchema } from '../products.schema'
import type {
  Product,
  ProductFormValues,
  ProductOwner,
} from '../products.types'

const productRowsSchema = z.array(productRowSchema)

export async function getActiveProducts(
  client: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await client
    .from(PRODUCTS_TABLE)
    .select(PRODUCT_COLUMNS)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(PRODUCTS_LOAD_ERROR)
  }

  const rows = productRowsSchema.parse(data ?? [])
  return rows.map(toProduct)
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
  const { error } = await client
    .from(PRODUCTS_TABLE)
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    throw new Error(PRODUCT_SAVE_ERROR)
  }
}
