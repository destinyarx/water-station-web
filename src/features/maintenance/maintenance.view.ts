import { UPCOMING_COUNTDOWN_MAX, WEEKLY_FREQUENCIES } from './maintenance.constants'
import type {
  MaintenanceHistoryEntry,
  MaintenanceHistoryRow,
  MaintenanceScheduleRow,
  MaintenanceTaskRow,
  MaintenanceTaskView,
  OrgUser,
  TaskDisplayStatus,
} from './maintenance.types'

const MS_PER_DAY = 86_400_000

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Whole days from `today` to `dueDate` (negative = overdue). Pure. */
export function dayDiff(today: string, dueDate: string): number {
  const a = new Date(`${today}T00:00:00.000Z`).getTime()
  const b = new Date(`${dueDate}T00:00:00.000Z`).getTime()
  return Math.round((b - a) / MS_PER_DAY)
}

export function statusOf(
  task: Pick<MaintenanceTaskRow, 'status' | 'due_date'>,
  today: string,
): TaskDisplayStatus {
  if (task.status === 'completed') return 'completed'
  return dayDiff(today, task.due_date) < 0 ? 'overdue' : 'upcoming'
}

/**
 * The due-chip label (feature 008, overrides the design mockup): a countdown
 * only within 3 days, "Tomorrow"/"Due today" for the near edges, otherwise the
 * formatted date. Pure.
 */
export function dueLabelFor(
  displayStatus: TaskDisplayStatus,
  diff: number,
  dueDate: string,
): string {
  if (displayStatus === 'completed') return 'Completed'
  if (displayStatus === 'overdue') {
    const n = Math.abs(diff)
    return `Overdue ${n} day${n === 1 ? '' : 's'}`
  }
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= UPCOMING_COUNTDOWN_MAX) return `In ${diff} days`
  return formatDate(dueDate)
}

export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function recurrenceLabel(
  schedule: Pick<MaintenanceScheduleRow, 'recurrence_type' | 'weekdays'>,
): string {
  if (schedule.recurrence_type === 'everyday') return 'Daily'
  if (schedule.recurrence_type === 'weekly') {
    const count = schedule.weekdays?.length ?? 0
    const freq = WEEKLY_FREQUENCIES.find((f) => f.times === count)
    return freq ? `${freq.label} a week` : 'Weekly'
  }
  return 'One-time'
}

function assigneeName(
  clerkId: string | null,
  byId: Map<string, OrgUser>,
  fallback = 'Unassigned',
): string {
  if (!clerkId) return fallback
  const user = byId.get(clerkId)
  return user && user.name ? user.name : fallback
}

/**
 * Joins each non-archived occurrence with its (non-archived) schedule and
 * resolves the assignee name. Occurrences whose schedule is missing (archived)
 * are dropped. Pure — sorting/filtering happen in the page. `today` injected for
 * testability.
 */
export function buildTaskViews(
  tasks: MaintenanceTaskRow[],
  schedules: MaintenanceScheduleRow[],
  users: OrgUser[],
  today: string,
): MaintenanceTaskView[] {
  const scheduleById = new Map(schedules.map((s) => [s.id, s]))
  const userById = new Map(users.map((u) => [u.clerkId, u]))

  const views: MaintenanceTaskView[] = []
  for (const task of tasks) {
    const schedule = scheduleById.get(task.schedule_id)
    if (!schedule) continue

    const displayStatus = statusOf(task, today)
    const diff = dayDiff(today, task.due_date)

    views.push({
      id: task.id,
      scheduleId: schedule.id,
      title: schedule.title,
      equipment: schedule.equipment,
      equipmentOther: schedule.equipment_other,
      priority: schedule.priority,
      recurrenceType: schedule.recurrence_type,
      weekdays: schedule.weekdays,
      timesPerWeek: schedule.times_per_week,
      notes: schedule.notes,
      isScheduleActive: schedule.is_active,
      dueDate: task.due_date,
      status: task.status,
      assignedTo: task.assigned_to,
      assigneeName: assigneeName(task.assigned_to, userById),
      displayStatus,
      isRecurring: schedule.recurrence_type !== 'one_time',
      recurrenceLabel: recurrenceLabel(schedule),
      dueLabel: dueLabelFor(displayStatus, diff, task.due_date),
    })
  }

  return views
}

/**
 * Resolves history rows into what the modal renders: the schedule's labels plus
 * assignee/completer names. Names are joined here rather than in the query so
 * they never cache against a stale org-users list. Pure.
 */
export function buildHistoryEntries(
  rows: MaintenanceHistoryRow[],
  users: OrgUser[],
): MaintenanceHistoryEntry[] {
  const userById = new Map(users.map((u) => [u.clerkId, u]))
  return rows.map((row) => {
    const status = row.status === 'cancelled' ? 'cancelled' : 'completed'
    const actionDate = status === 'completed' ? row.completed_at : row.updated_at

    return {
      id: row.id,
      title: row.schedule.title,
      equipmentLabel: row.schedule.equipment_other ?? row.schedule.equipment,
      priority: row.schedule.priority,
      dueDate: row.due_date,
      status,
      actionLabel: actionDate
        ? formatDate(actionDate.slice(0, 10))
        : formatDate(row.due_date),
      completedByName: assigneeName(row.completed_by, userById, 'Unknown'),
      assigneeName: assigneeName(row.assigned_to, userById),
    }
  })
}
