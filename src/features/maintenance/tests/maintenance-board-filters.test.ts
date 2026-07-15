import { describe, expect, it } from 'vitest'

import { matchesFilter } from '../components/maintenance-page'
import { buildHistoryEntries } from '../maintenance.view'
import type { MaintenanceHistoryRow, MaintenanceTaskView } from '../maintenance.types'

function task(over: Partial<MaintenanceTaskView>): MaintenanceTaskView {
  return {
    id: 1,
    scheduleId: 1,
    title: 'Swap RO membrane',
    equipment: 'RO unit',
    equipmentOther: null,
    priority: 'medium',
    recurrenceType: 'weekly',
    weekdays: [1],
    timesPerWeek: 1,
    notes: null,
    isScheduleActive: true,
    dueDate: '2026-07-20',
    status: 'pending',
    assignedTo: null,
    assigneeName: 'Unassigned',
    displayStatus: 'upcoming',
    isRecurring: true,
    recurrenceLabel: 'Once a week',
    dueLabel: 'In 5 days',
    ...over,
  }
}

describe('matchesFilter', () => {
  it('All shows pending work on active schedules only', () => {
    expect(matchesFilter(task({ displayStatus: 'upcoming' }), 'all')).toBe(true)
    expect(matchesFilter(task({ displayStatus: 'overdue' }), 'all')).toBe(true)
  })

  it('All excludes completed work — that lives in the history modal', () => {
    expect(matchesFilter(task({ displayStatus: 'completed' }), 'all')).toBe(false)
  })

  it('All excludes paused schedules — those are behind the Inactive tab', () => {
    expect(matchesFilter(task({ isScheduleActive: false }), 'all')).toBe(false)
  })

  it('Inactive shows pending work on paused schedules, and nothing else', () => {
    expect(matchesFilter(task({ isScheduleActive: false }), 'inactive')).toBe(true)
    expect(matchesFilter(task({ isScheduleActive: true }), 'inactive')).toBe(false)
    // A finished task on a paused schedule is still history, not a to-do.
    expect(
      matchesFilter(task({ isScheduleActive: false, displayStatus: 'completed' }), 'inactive'),
    ).toBe(false)
  })

  it('Upcoming and Overdue stay scoped to active schedules', () => {
    expect(matchesFilter(task({ displayStatus: 'upcoming' }), 'upcoming')).toBe(true)
    expect(matchesFilter(task({ displayStatus: 'overdue' }), 'upcoming')).toBe(false)
    expect(
      matchesFilter(task({ displayStatus: 'overdue', isScheduleActive: false }), 'overdue'),
    ).toBe(false)
  })
})

describe('buildHistoryEntries', () => {
  const row: MaintenanceHistoryRow = {
    id: 7,
    due_date: '2026-07-01',
    completed_at: '2026-07-03T02:00:00.000Z',
    completed_by: 'user_staff',
    assigned_to: 'user_staff',
    schedule: {
      title: 'Sanitize tank',
      equipment: 'Others',
      equipment_other: 'Backwash valve',
      priority: 'high',
    },
  }

  it('resolves names and prefers the equipment override', () => {
    const [entry] = buildHistoryEntries([row], [{ clerkId: 'user_staff', name: 'Ana' }])
    expect(entry.completedByName).toBe('Ana')
    expect(entry.assigneeName).toBe('Ana')
    expect(entry.equipmentLabel).toBe('Backwash valve')
    expect(entry.completedLabel).toBe('Jul 3, 2026')
  })

  it('labels an unknown completer as Unknown, not Unassigned', () => {
    const [entry] = buildHistoryEntries([row], [])
    expect(entry.completedByName).toBe('Unknown')
    expect(entry.assigneeName).toBe('Unassigned')
  })

  it('falls back to the due date when completed_at is missing', () => {
    const [entry] = buildHistoryEntries([{ ...row, completed_at: null }], [])
    expect(entry.completedLabel).toBe('Jul 1, 2026')
  })
})
