import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getActiveCustomers } from './customers.service'

interface QueryResult {
  data: unknown
  error: { message: string } | null
}

function createMockClient(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result))
  const is = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ is }))
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, select, is, order }
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
  it('returns the tenant customers mapped to the display model', async () => {
    const { client } = createMockClient({ data: [dbRow], error: null })

    const customers = await getActiveCustomers(client)

    expect(customers).toHaveLength(1)
    expect(customers[0]).toMatchObject({
      id: dbRow.id,
      name: 'Crystal Springs',
      isBusiness: true,
      fullAddress: '123 Main St, San Antonio, Pasig, Metro Manila',
    })
  })

  it('excludes archived rows by filtering on a null deleted_at', async () => {
    const { client, is } = createMockClient({ data: [], error: null })

    await getActiveCustomers(client)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('returns an empty array when there are no customers', async () => {
    const { client } = createMockClient({ data: [], error: null })

    await expect(getActiveCustomers(client)).resolves.toEqual([])
  })

  it('throws a user-friendly error when the query fails', async () => {
    const { client } = createMockClient({
      data: null,
      error: { message: 'permission denied for table customers' },
    })

    await expect(getActiveCustomers(client)).rejects.toThrow(
      'Unable to load customers. Please try again.',
    )
  })
})
