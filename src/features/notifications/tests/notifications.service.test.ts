import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import {
  getUnreadNotificationCount,
  markNotificationRead,
} from '../services/notifications.service'

describe('getUnreadNotificationCount', () => {
  it('uses an exact head count scoped to unread rows', async () => {
    const eq = vi.fn(() => Promise.resolve({ count: 47, error: null }))
    const select = vi.fn(() => ({ eq }))
    const from = vi.fn(() => ({ select }))
    const client = { from } as unknown as SupabaseClient

    await expect(getUnreadNotificationCount(client)).resolves.toBe(47)
    expect(select).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    })
    expect(eq).toHaveBeenCalledWith('is_read', false)
  })

  it('returns zero when PostgREST returns a null count', async () => {
    const eq = vi.fn(() => Promise.resolve({ count: null, error: null }))
    const select = vi.fn(() => ({ eq }))
    const client = {
      from: vi.fn(() => ({ select })),
    } as unknown as SupabaseClient

    await expect(getUnreadNotificationCount(client)).resolves.toBe(0)
  })
})

describe('markNotificationRead', () => {
  it('updates only is_read and requires a returned row', async () => {
    const single = vi.fn(() => Promise.resolve({ data: { id: 9 }, error: null }))
    const select = vi.fn(() => ({ single }))
    const eq = vi.fn(() => ({ select }))
    const update = vi.fn(() => ({ eq }))
    const client = {
      from: vi.fn(() => ({ update })),
    } as unknown as SupabaseClient

    await expect(markNotificationRead(client, 9)).resolves.toBeUndefined()
    expect(update).toHaveBeenCalledWith({ is_read: true })
    expect(eq).toHaveBeenCalledWith('id', 9)
  })
})
