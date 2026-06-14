import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  createProduct,
  getActiveProducts,
  softDeleteProduct,
  updateProduct,
} from '../services/products.service'
import type { ProductFormValues } from '../products.types'

interface QueryResult {
  data?: unknown
  error: { message: string } | null
}

const row = {
  id: 42,
  product_name: 'Bottled Water 500ml',
  price: 15,
  is_stock_tracked: true,
  stock: 120,
  descriptions: 'Retail bottle',
  org_id: 7,
  created_by: 'user_2abcDEF',
  created_at: '2026-06-13T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const values: ProductFormValues = {
  productName: 'Bottled Water 500ml',
  price: 15,
  isStockTracked: true,
  stock: 120,
  description: 'Retail bottle',
}

const owner = { orgId: 7, createdBy: 'user_2abcDEF' }

function createListClient(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result))
  const is = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ is }))
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, select, is, order }
}

function createInsertClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  const client = { from } as unknown as SupabaseClient
  return { client, insert }
}

function createUpdateClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const is = vi.fn(() => ({ select }))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, eq, is }
}

function createDeleteClient(result: Pick<QueryResult, 'error'>) {
  const is = vi.fn(() => Promise.resolve(result))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update, delete: del }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, del, eq, is }
}

describe('getActiveProducts', () => {
  it('returns active products mapped to the display model', async () => {
    const { client } = createListClient({ data: [row], error: null })

    const products = await getActiveProducts(client)

    expect(products).toHaveLength(1)
    expect(products[0]).toMatchObject({
      id: 42,
      productName: 'Bottled Water 500ml',
      isStockTracked: true,
      stock: 120,
    })
  })

  it('excludes soft-deleted rows and sorts newest products first', async () => {
    const { client, is, order } = createListClient({ data: [], error: null })

    await getActiveProducts(client)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('throws a user-friendly error when the list query fails', async () => {
    const { client } = createListClient({
      data: null,
      error: { message: 'permission denied' },
    })

    await expect(getActiveProducts(client)).rejects.toThrow(
      'Unable to load products. Please try again.',
    )
  })
})

describe('createProduct', () => {
  it('inserts a product with owner fields and returns the saved record', async () => {
    const { client, insert } = createInsertClient({ data: row, error: null })

    const product = await createProduct(client, values, owner)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: 7, created_by: 'user_2abcDEF' }),
    )
    expect(product).toMatchObject({ id: 42, productName: 'Bottled Water 500ml' })
  })
})

describe('updateProduct', () => {
  it('updates an active product and returns the saved row', async () => {
    const { client, update, eq, is } = createUpdateClient({
      data: { ...row, product_name: 'Updated bottle' },
      error: null,
    })

    const product = await updateProduct(client, 42, values)

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ updated_at: expect.any(String) }),
    )
    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(product.productName).toBe('Updated bottle')
  })
})

describe('softDeleteProduct', () => {
  it('soft-deletes by setting deleted_at and never hard-deletes', async () => {
    const { client, update, del, eq, is } = createDeleteClient({ error: null })

    await softDeleteProduct(client, 42)

    expect(del).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted_at: expect.any(String) }),
    )
    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })
})
