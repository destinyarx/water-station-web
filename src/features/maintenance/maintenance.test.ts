import { describe, expect, it } from 'vitest'

import { createMaintenanceSchema } from './maintenance.schema'
import { firstDueDate, isoWeekday, nextDueDate } from './maintenance.recurrence'
import { dueLabelFor, statusOf } from './maintenance.view'

describe('recurrence', () => {
  it('maps ISO weekdays (Mon=1..Sun=7)', () => {
    expect(isoWeekday('2026-06-29')).toBe(1) // Monday
    expect(isoWeekday('2026-06-28')).toBe(7) // Sunday
  })

  it('everyday starts on the chosen day and rolls +1', () => {
    expect(firstDueDate('everyday', '2026-06-27', [])).toBe('2026-06-27')
    expect(nextDueDate('everyday', '2026-06-27', [])).toBe('2026-06-28')
  })

  it('weekly first-due lands on the earliest selected weekday on/after start', () => {
    // 2026-06-27 is a Saturday(6); next Monday(1)/Wednesday(3) -> Mon 2026-06-29
    expect(firstDueDate('weekly', '2026-06-27', [1, 3])).toBe('2026-06-29')
  })

  it('weekly next-due jumps to the following selected weekday', () => {
    // from Monday 2026-06-29 with Mon+Wed -> Wed 2026-07-01
    expect(nextDueDate('weekly', '2026-06-29', [1, 3])).toBe('2026-07-01')
  })

  it('one-time never rolls forward', () => {
    expect(nextDueDate('one_time', '2026-06-27', [])).toBeNull()
  })
})

describe('view status + due label', () => {
  const today = '2026-06-27'

  it('derives display status', () => {
    expect(statusOf({ status: 'completed', due_date: '2026-06-20' }, today)).toBe('completed')
    expect(statusOf({ status: 'pending', due_date: '2026-06-20' }, today)).toBe('overdue')
    expect(statusOf({ status: 'pending', due_date: '2026-07-10' }, today)).toBe('upcoming')
  })

  it('labels the due chip per the 3-day countdown rule', () => {
    expect(dueLabelFor('completed', -5, '2026-06-22')).toBe('Completed')
    expect(dueLabelFor('overdue', -1, '2026-06-26')).toBe('Overdue 1 day')
    expect(dueLabelFor('overdue', -3, '2026-06-24')).toBe('Overdue 3 days')
    expect(dueLabelFor('upcoming', 0, today)).toBe('Due today')
    expect(dueLabelFor('upcoming', 1, '2026-06-28')).toBe('Tomorrow')
    expect(dueLabelFor('upcoming', 3, '2026-06-30')).toBe('In 3 days')
    expect(dueLabelFor('upcoming', 7, '2026-07-04')).toBe('Jul 4, 2026') // beyond 3 days -> date
  })
})

describe('weekly count refinement', () => {
  const base = {
    title: 'Backwash filter',
    equipment: 'Sediment Pre-Filter',
    priority: 'medium' as const,
    recurrenceType: 'weekly' as const,
    startDate: '2099-01-01',
  }

  it('accepts 1-3 selected weekdays', () => {
    expect(createMaintenanceSchema.safeParse({ ...base, weekdays: [1, 3] }).success).toBe(true)
  })

  it('rejects 0 or >3 weekdays', () => {
    expect(createMaintenanceSchema.safeParse({ ...base, weekdays: [] }).success).toBe(false)
    expect(createMaintenanceSchema.safeParse({ ...base, weekdays: [1, 2, 3, 4] }).success).toBe(false)
  })

  it('requires the Others description', () => {
    const result = createMaintenanceSchema.safeParse({
      ...base,
      equipment: 'Others',
      weekdays: [1],
    })
    expect(result.success).toBe(false)
  })
})
