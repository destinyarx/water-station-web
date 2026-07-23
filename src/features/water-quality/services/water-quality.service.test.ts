import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import type { WaterQualityFilters } from '../water-quality.keys'
import { getActiveTests } from './water-quality.service'

interface QueryResult {
  data: unknown
  error: { message: string } | null
  count: number | null
}

const filters: WaterQualityFilters = {
  search: '',
  method: 'all',
  status: 'all',
  page: 1,
  perPage: 20,
}

function createMockClient(result: QueryResult) {
  const builder = {
    is: vi.fn(() => builder),
    or: vi.fn(() => builder),
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
  id: 1001,
  org_id: '00000000-0000-4000-8000-000000000007',
  created_by: 'user_2abcDEF',
  test_date: '2026-07-20',
  water_source: 'Filtered',
  method: 'lab',
  status: 'Passed',
  lab_name: 'AquaLab Inc.',
  report_no: 'WQ-2026-011',
  report_date: '2026-07-19',
  device_type: null,
  device_model: null,
  tested_at: null,
  tested_by: 'Maria Santos',
  parameters: [{ name: 'pH Level', value: '7.2', unit: null, refRange: '6.5 - 8.5' }],
  document_ids: [5],
  remarks: null,
  created_at: '2026-07-20T00:00:00.000Z',
  updated_at: null,
  deleted_at: null,
  creator: { name: 'Maria Santos' },
}

describe('getActiveTests', () => {
  it('returns mapped tests and the exact server total', async () => {
    const { client } = createMockClient({ data: [dbRow], error: null, count: 12 })

    const page = await getActiveTests(client, filters)

    expect(page.total).toBe(12)
    expect(page.tests[0]).toMatchObject({
      id: 1001,
      status: 'Passed',
      method: 'lab',
      createdByName: 'Maria Santos',
      documentIds: [5],
    })
  })

  it('excludes soft-deleted rows and orders newest test first', async () => {
    const { client, is, order } = createMockClient({
      data: [],
      error: null,
      count: 0,
    })

    await getActiveTests(client, filters)

    expect(is).toHaveBeenCalledWith('deleted_at', null)
    expect(order).toHaveBeenCalledWith('test_date', { ascending: false })
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('applies method, status, search filters and range math', async () => {
    const { client, or, eq, range } = createMockClient({
      data: [],
      error: null,
      count: 0,
    })

    await getActiveTests(client, {
      ...filters,
      search: 'AquaLab',
      method: 'lab',
      status: 'Failed',
      page: 2,
    })

    expect(eq).toHaveBeenCalledWith('method', 'lab')
    expect(eq).toHaveBeenCalledWith('status', 'Failed')
    expect(or).toHaveBeenCalledWith(
      'remarks.ilike.%AquaLab%,lab_name.ilike.%AquaLab%,tested_by.ilike.%AquaLab%,report_no.ilike.%AquaLab%,water_source.ilike.%AquaLab%',
    )
    expect(range).toHaveBeenCalledWith(20, 39)
  })

  it('returns an empty page when there are no tests', async () => {
    const { client } = createMockClient({ data: [], error: null, count: null })

    await expect(getActiveTests(client, filters)).resolves.toEqual({
      tests: [],
      total: 0,
    })
  })

  it('throws a user-friendly error when the query fails', async () => {
    const { client } = createMockClient({
      data: null,
      error: { message: 'permission denied' },
      count: null,
    })

    await expect(getActiveTests(client, filters)).rejects.toThrow(
      'Unable to load water quality tests. Please try again.',
    )
  })
})
