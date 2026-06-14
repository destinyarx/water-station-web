import { describe, it, expect, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { archiveCustomer } from '../services/customers.service'

interface QueryResult {
  error: { message: string } | null
}

function createArchiveClient(result: QueryResult) {
  const is = vi.fn(() => Promise.resolve(result))
  const eq = vi.fn(() => ({ is }))
  const update = vi.fn((_payload: Record<string, unknown>) => ({ eq }))
  const del = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ update, delete: del }))
  const client = { from } as unknown as SupabaseClient
  return { client, from, update, del, eq, is }
}

describe('archiveCustomer', () => {
  it('soft-deletes by setting deleted_at, never hard-deleting the row', async () => {
    const { client, update, del } = createArchiveClient({ error: null })

    await archiveCustomer(client, 42)

    expect(del).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledTimes(1)
    const payload = update.mock.calls[0][0]
    expect(payload.deleted_at).not.toBeNull()
    expect(payload.deleted_at).toBeTruthy()
  })

  it('scopes the archive to the id and only currently-active rows', async () => {
    const { client, eq, is } = createArchiveClient({ error: null })

    await archiveCustomer(client, 42)

    expect(eq).toHaveBeenCalledWith('id', 42)
    expect(is).toHaveBeenCalledWith('deleted_at', null)
  })

  it('throws a user-friendly error when the archive fails', async () => {
    const { client } = createArchiveClient({
      error: { message: 'row-level security violation' },
    })

    await expect(archiveCustomer(client, 42)).rejects.toThrow(
      'Unable to archive customer. Please try again.',
    )
  })
})
