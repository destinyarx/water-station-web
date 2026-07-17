import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { cancelTask } from '../services/maintenance.service'
import type { MaintenanceTaskView } from '../maintenance.types'

const recurringTask: MaintenanceTaskView = {
  id: 12,
  scheduleId: 4,
  title: 'Sanitize tank',
  equipment: 'Storage Tank',
  equipmentOther: null,
  priority: 'high',
  recurrenceType: 'weekly',
  weekdays: [1, 4],
  timesPerWeek: 2,
  notes: null,
  isScheduleActive: true,
  dueDate: '2026-07-16',
  status: 'pending',
  assignedTo: 'user_staff',
  assigneeName: 'Ana',
  displayStatus: 'upcoming',
  isRecurring: true,
  recurrenceLabel: 'Twice a week',
  dueLabel: 'Due today',
}

function createClient(updateResult: { data: Array<{ id: number }>; error: { code?: string } | null }) {
  const select = vi.fn(() => Promise.resolve(updateResult))
  const is = vi.fn(() => ({ select }))
  const eq = vi.fn(() => ({ eq, is }))
  const update = vi.fn((payload: Record<string, unknown>) => {
    void payload
    return { eq }
  })
  const insert = vi.fn(() => Promise.resolve({ error: null }))
  const client = { from: vi.fn(() => ({ update, insert })) } as unknown as SupabaseClient
  return { client, update, insert, eq }
}

describe('cancelTask', () => {
  it('cancels only the current occurrence and rolls a recurring schedule forward', async () => {
    const { client, update, insert, eq } = createClient({ data: [{ id: 12 }], error: null })

    await cancelTask(client, recurringTask, {
      orgId: '00000000-0000-4000-8000-000000000001',
      createdBy: 'user_staff',
    })

    expect(update.mock.calls[0][0]).toMatchObject({ status: 'cancelled' })
    expect(eq).toHaveBeenCalledWith('status', 'pending')
    expect(insert).toHaveBeenCalledWith({
      schedule_id: 4,
      due_date: '2026-07-20',
      status: 'pending',
      assigned_to: 'user_staff',
      org_id: '00000000-0000-4000-8000-000000000001',
      created_by: 'user_staff',
    })
  })

  it('does not create a future occurrence for a one-time task', async () => {
    const { client, insert } = createClient({ data: [{ id: 12 }], error: null })

    await cancelTask(client, {
      ...recurringTask,
      recurrenceType: 'one_time',
      weekdays: null,
      timesPerWeek: null,
      isRecurring: false,
    }, {
      orgId: '00000000-0000-4000-8000-000000000001',
      createdBy: 'user_staff',
    })

    expect(insert).not.toHaveBeenCalled()
  })

  it('does not roll forward when RLS matches no occurrence', async () => {
    const { client, insert } = createClient({ data: [], error: null })

    await expect(cancelTask(client, recurringTask, {
      orgId: '00000000-0000-4000-8000-000000000001',
      createdBy: 'user_staff',
    })).rejects.toThrow('Nothing was changed.')
    expect(insert).not.toHaveBeenCalled()
  })
})
