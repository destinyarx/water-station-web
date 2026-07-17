import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import type { CustomerFilters } from '../customers.keys'
import { getActiveCustomers } from './customers.service'

interface QueryResult {
  data: unknown
  error: { message: string } | null
  count: number | null
}

const filters: CustomerFilters = {
  archived: false,
  search: '',
  type: 'all',
  status: 'active',
  page: 1,
  perPage: 20,
}

function createMockClient(result: QueryResult) {
  type Builder = {
    is: ReturnType<typeof vi.fn>
    ilike: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    range: ReturnType<typeof vi.fn>
  }

  const builder: Builder = {
    is: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => Promise.resolve(result)),
  }
  const select = vi.fn(() => builder)
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, select, ...builder }
}

const dbRow = {
  id: 42,
  name: 'Crystal Springs',
  is_business: true,
  contact_number: '09171234567',
  facebook_url: null,
  latitude: null,
  longitude: null,
  street_address: '123 Main St',
  barangay: 'San Antonio',
  municipality: 'Pasig',
  province: 'Metro Manila',
  full_address: null,
  is_active: true,
  org_id: '00000000-0000-4000-8000-000000000007',
  created_by: 'user_2abcDEF',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

describe('getActiveCustomers', () => {
  it('returns mapped rows and the exact server total', async () => {
    const { client } = createMockClient({
      data: [dbRow],
      error: null,
      count: 31,
    })

    const page = await getActiveCustomers(client, filters)

    expect(page.total).toBe(31)
    expect(page.rows[0]).toMatchObject({
      id: dbRow.id,
      name: 'Crystal Springs',
      isBusiness: true,
      fullAddress: '123 Main St, San Antonio, Pasig, Metro Manila',
    })
  })

  it('applies active filtering, server search/type filters, and range math', async () => {
    const { client, is, ilike, eq, range } = createMockClient({
      data: [],
      error: null,
      count: 0,
    })

    await getActiveCustomers(client, {
      ...filters,
      search: 'Spring',
      type: 'business',
      page: 2,
    })

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(eq).toHaveBeenCalledWith('is_active', true)
    expect(ilike).toHaveBeenCalledWith('name', '%Spring%')
    expect(eq).toHaveBeenCalledWith('is_business', true)
    expect(range).toHaveBeenCalledWith(20, 39)
  })

  it('loads only inactive customers for the Inactive directory filter', async () => {
    const { client, eq } = createMockClient({ data: [], error: null, count: 0 })

    await getActiveCustomers(client, { ...filters, status: 'inactive' })

    expect(eq).toHaveBeenCalledWith('is_active', false)
  })

  it('returns an empty page when there are no customers', async () => {
    const { client } = createMockClient({
      data: [],
      error: null,
      count: null,
    })

    await expect(getActiveCustomers(client, filters)).resolves.toEqual({
      rows: [],
      total: 0,
    })
  })

  it('throws a user-friendly error when the query fails', async () => {
    const { client } = createMockClient({
      data: null,
      error: { message: 'permission denied for table customers' },
      count: null,
    })

    await expect(getActiveCustomers(client, filters)).rejects.toThrow(
      'Unable to load customers. Please try again.',
    )
  })
})
