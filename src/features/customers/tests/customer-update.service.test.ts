import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getCustomerById,
  updateCustomer,
} from '../services/customers.service'
import type { CustomerFormValues } from '../customers.types'

interface QueryResult {
  data: unknown
  error: { message: string } | null
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
  org_id: 7,
  created_by: 'user_2abcDEF',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
}

const values: CustomerFormValues = {
  name: 'Crystal Springs Updated',
  isBusiness: false,
  contactNumber: '',
  facebookUrl: '',
  streetAddress: '',
  barangay: '',
  municipality: '',
  province: '',
  latitude: undefined,
  longitude: undefined,
}

function createGetByIdClient(result: QueryResult) {
  const maybeSingle = vi.fn(() => Promise.resolve(result))
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  const client = { from } as unknown as SupabaseClient
  return { client, select, eq, maybeSingle }
}

function createUpdateClient(result: QueryResult) {
  const single = vi.fn(() => Promise.resolve(result))
  const select = vi.fn(() => ({ single }))
  const is = vi.fn(() => ({ select }))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update }))
  const client = { from } as unknown as SupabaseClient
  return { client, update, eq, is, select, single }
}

describe('getCustomerById', () => {
  it('returns the mapped customer when found', async () => {
    const { client } = createGetByIdClient({ data: dbRow, error: null })
    const customer = await getCustomerById(client, 42)
    expect(customer).toMatchObject({ id: 42, name: 'Crystal Springs' })
  })

  it('returns null when no row is visible to the tenant', async () => {
    const { client } = createGetByIdClient({ data: null, error: null })
    await expect(getCustomerById(client, 999)).resolves.toBeNull()
  })

  it('throws a user-friendly error when the query fails', async () => {
    const { client } = createGetByIdClient({
      data: null,
      error: { message: 'permission denied' },
    })
    await expect(getCustomerById(client, 42)).rejects.toThrow(
      'Unable to load customers. Please try again.',
    )
  })
})

describe('updateCustomer', () => {
  it('updates the customer and returns the mapped record', async () => {
    const { client } = createUpdateClient({
      data: { ...dbRow, name: 'Crystal Springs Updated', is_business: false },
      error: null,
    })
    const customer = await updateCustomer(client, 42, values)
    expect(customer).toMatchObject({
      id: 42,
      name: 'Crystal Springs Updated',
      isBusiness: false,
    })
  })

  it('scopes the update to the id and excludes archived rows', async () => {
    const { client, eq, is } = createUpdateClient({ data: dbRow, error: null })
    await updateCustomer(client, 42, values)
    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('throws a user-friendly error when the update fails', async () => {
    const { client } = createUpdateClient({
      data: null,
      error: { message: 'row-level security violation' },
    })
    await expect(updateCustomer(client, 42, values)).rejects.toThrow(
      'Unable to save customer. Please try again.',
    )
  })
})
