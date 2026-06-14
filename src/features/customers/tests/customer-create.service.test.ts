import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createCustomer } from '../services/customers.service'
import type { CustomerFormValues } from '../customers.types'

interface QueryResult {
  data: unknown
  error: { message: string } | null
}

function createMockClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const insert = vi.fn(() => ({ select }))
  const from = vi.fn(() => ({ insert }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, insert, select, single }
}

const owner = { orgId: 7, createdBy: 'user_2abcDEF' }

const values: CustomerFormValues = {
  name: 'Crystal Springs',
  isBusiness: true,
  contactNumber: '09171234567',
  facebookUrl: '',
  streetAddress: '123 Main St',
  barangay: 'San Antonio',
  municipality: 'Pasig',
  province: 'Metro Manila',
  latitude: undefined,
  longitude: undefined,
}

const createdRow = {
  id: 99,
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
  full_address: '123 Main St, San Antonio, Pasig, Metro Manila',
  org_id: 7,
  created_by: 'user_2abcDEF',
  created_at: '2026-06-12T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

describe('createCustomer', () => {
  it('inserts the customer and returns the mapped display model', async () => {
    const { client } = createMockClient({ data: createdRow, error: null })

    const customer = await createCustomer(client, values, owner)

    expect(customer).toMatchObject({
      id: 99,
      name: 'Crystal Springs',
      isBusiness: true,
      orgId: 7,
      createdBy: 'user_2abcDEF',
    })
  })

  it('sets org_id and created_by from the owner, not from form input', async () => {
    const { client, insert } = createMockClient({
      data: createdRow,
      error: null,
    })

    await createCustomer(client, values, owner)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ org_id: 7, created_by: 'user_2abcDEF' }),
    )
  })

  it('throws a user-friendly error when the insert fails', async () => {
    const { client } = createMockClient({
      data: null,
      error: { message: 'new row violates row-level security policy' },
    })

    await expect(createCustomer(client, values, owner)).rejects.toThrow(
      'Unable to save customer. Please try again.',
    )
  })
})
