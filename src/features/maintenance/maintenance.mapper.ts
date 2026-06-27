import { OTHERS_EQUIPMENT } from './maintenance.constants'
import { firstDueDate } from './maintenance.recurrence'
import type {
  CreateMaintenanceValues,
  EditMaintenanceValues,
  MaintenanceOwner,
  MaintenanceRecurrence,
  MaintenancePriority,
  OrgUser,
  OrgUserRow,
} from './maintenance.types'

export interface MaintenanceScheduleInsert {
  title: string
  equipment: string
  equipment_other: string | null
  priority: MaintenancePriority
  recurrence_type: MaintenanceRecurrence
  weekdays: number[] | null
  times_per_week: number | null
  notes: string | null
  is_active: true
  org_id: number
  created_by: string
}

export interface MaintenanceTaskInsert {
  schedule_id: number
  due_date: string
  status: 'pending'
  assigned_to: string | null
  org_id: number
  created_by: string
}

function nullableText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toScheduleInsertRow(
  values: CreateMaintenanceValues,
  owner: MaintenanceOwner,
): MaintenanceScheduleInsert {
  const weekly = values.recurrenceType === 'weekly'
  return {
    title: values.title.trim(),
    equipment: values.equipment,
    equipment_other:
      values.equipment === OTHERS_EQUIPMENT ? nullableText(values.equipmentOther) : null,
    priority: values.priority,
    recurrence_type: values.recurrenceType,
    weekdays: weekly ? values.weekdays : null,
    times_per_week: weekly ? values.weekdays.length : null,
    notes: nullableText(values.notes),
    is_active: true,
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

/** The occurrence dates a new schedule materializes up front. */
export function occurrenceDates(values: CreateMaintenanceValues): string[] {
  if (values.recurrenceType === 'one_time') {
    return [...new Set(values.dates)].sort()
  }
  return [firstDueDate(values.recurrenceType, values.startDate, values.weekdays)]
}

export function toTaskInsertRows(
  scheduleId: number,
  values: CreateMaintenanceValues,
  owner: MaintenanceOwner,
): MaintenanceTaskInsert[] {
  const assignedTo = nullableText(values.assignedTo)
  return occurrenceDates(values).map((due_date) => ({
    schedule_id: scheduleId,
    due_date,
    status: 'pending',
    assigned_to: assignedTo,
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }))
}

export function toScheduleUpdateRow(values: EditMaintenanceValues): {
  title: string
  equipment: string
  equipment_other: string | null
  priority: MaintenancePriority
  notes: string | null
  updated_at: string
} {
  return {
    title: values.title.trim(),
    equipment: values.equipment,
    equipment_other:
      values.equipment === OTHERS_EQUIPMENT ? nullableText(values.equipmentOther) : null,
    priority: values.priority,
    notes: nullableText(values.notes),
    updated_at: new Date().toISOString(),
  }
}

export function toTaskUpdateRow(values: EditMaintenanceValues): {
  due_date: string
  assigned_to: string | null
  updated_at: string
} {
  return {
    due_date: values.dueDate,
    assigned_to: nullableText(values.assignedTo),
    updated_at: new Date().toISOString(),
  }
}

export function toOrgUser(row: OrgUserRow): OrgUser {
  return { clerkId: row.clerk_id, name: row.name ?? '' }
}
