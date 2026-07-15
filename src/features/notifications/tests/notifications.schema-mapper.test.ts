import { describe, expect, it } from 'vitest'

import { toNotification } from '../notifications.mapper'
import { notificationRowSchema } from '../notifications.schema'

describe('notification schema and mapper', () => {
  it('strips realtime-only fields and maps read state', () => {
    const row = notificationRowSchema.parse({ id: 1, title: 'Delivery due', message: 'Today', type: 'delivery', is_read: false, created_at: '2026-07-15T00:00:00Z', org_id: 'ignored' })
    expect(row).not.toHaveProperty('org_id')
    expect(toNotification(row)).toMatchObject({ id: 1, isRead: false })
  })
})
