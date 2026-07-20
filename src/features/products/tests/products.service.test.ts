import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  createProduct,
  getActiveProducts,
  setProductStatus,
  softDeleteProduct,
  updateProduct,
} from '../services/products.service'
import type { ProductFormValues } from '../products.types'

interface QueryResult {
  data?: unknown
  error: { message: string } | null
  count?: number | null
}

const row = {
  id: 42,
  product_name: 'Bottled Water 500ml',
  price: 15,
  is_stock_tracked: true,
  stock: 120,
  descriptions: 'Retail bottle',
  is_active: true,
  org_id: '00000000-0000-4000-8000-000000000007',
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

const owner = { orgId: '00000000-0000-4000-8000-000000000007', createdBy: 'user_2abcDEF' }

function createListClient(result: QueryResult) {
  const range = vi.fn(() => Promise.resolve(result))
  const order = vi.fn(() => ({ range }))
  // `eq` is chainable so category filters (is_active, is_stock_tracked) can stack.
  const eq = vi.fn(() => ({ order, eq }))
  const or = vi.fn(() => ({ order, eq }))
  const is = vi.fn(() => ({ order, eq, or }))
  const select = vi.fn(() => ({ is }))
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, select, is, order, range, eq, or }
}

const filters = { deleted: false, search: '', category: 'all' as const, page: 1, perPage: 10 }

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

function createStatusClient(result: QueryResult) {
  const select = vi.fn(() => Promise.resolve(result))
  const is = vi.fn(() => ({ select }))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, eq, is, select }
}

describe('getActiveProducts', () => {
  it('returns active products mapped to the display model', async () => {
    const { client } = createListClient({ data: [row], error: null, count: 1 })

    const page = await getActiveProducts(client, filters)

    expect(page.total).toBe(1)
    expect(page.products[0]).toMatchObject({
      id: 42,
      productName: 'Bottled Water 500ml',
      isStockTracked: true,
      stock: 120,
    })
  })

  it('excludes soft-deleted rows and sorts newest products first', async () => {
    const { client, is, order } = createListClient({ data: [], error: null })

    await getActiveProducts(client, filters)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('throws a user-friendly error when the list query fails', async () => {
    const { client } = createListClient({
      data: null,
      error: { message: 'permission denied' },
    })

    await expect(getActiveProducts(client, filters)).rejects.toThrow(
      'Unable to load products. Please try again.',
    )
  })

  it('excludes discontinued products from the All / Refill / Bottled filters', async () => {
    for (const category of ['all', 'refillable', 'stocked'] as const) {
      const { client, eq } = createListClient({ data: [], error: null })
      await getActiveProducts(client, { ...filters, category })
      expect(eq).toHaveBeenCalledWith('is_active', true)
    }
  })

  it('shows only discontinued products in the Discontinued filter', async () => {
    const { client, eq } = createListClient({ data: [], error: null })
    await getActiveProducts(client, { ...filters, category: 'discontinued' })
    expect(eq).toHaveBeenCalledWith('is_active', false)
    expect(eq).not.toHaveBeenCalledWith('is_active', true)
  })
})

describe('createProduct', () => {
  it('inserts a product with owner fields and returns the saved record', async () => {
    const { client, insert } = createInsertClient({ data: row, error: null })

    const product = await createProduct(client, values, owner)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: '00000000-0000-4000-8000-000000000007', created_by: 'user_2abcDEF' }),
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

    expect(update).toHaveBeenCalledWith(expect.not.objectContaining({ updated_at: expect.anything() }))
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

describe('setProductStatus', () => {
  it('discontinues an active product and requires the updated row to be returned', async () => {
    const { client, update, eq, is, select } = createStatusClient({
      data: [{ id: 42 }],
      error: null,
    })

    await setProductStatus(client, 42, false)

    expect(update).toHaveBeenCalledWith({ is_active: false })
    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(select).toHaveBeenCalledWith('id')
  })

  it('reports a safe save error when Supabase rejects the status update', async () => {
    const { client } = createStatusClient({
      data: null,
      error: { message: 'permission denied for schema private' },
    })

    await expect(setProductStatus(client, 42, false)).rejects.toThrow(
      'Unable to save product. Please try again.',
    )
  })

  it('does not report success when no permitted product was updated', async () => {
    const { client } = createStatusClient({ data: [], error: null })

    await expect(setProductStatus(client, 42, false)).rejects.toThrow(
      'Nothing was changed. This product may have been archived, or you may only change products you created.',
    )
  })
})
