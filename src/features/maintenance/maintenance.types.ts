import type { z } from 'zod'

import type {
  createMaintenanceSchema,
  editMaintenanceSchema,
  maintenancePrioritySchema,
  maintenanceRecurrenceSchema,
  maintenanceScheduleRowSchema,
  maintenanceTaskRowSchema,
  maintenanceTaskStatusSchema,
  orgUserRowSchema,
} from './maintenance.schema'

export type MaintenancePriority = z.infer<typeof maintenancePrioritySchema>
export type MaintenanceRecurrence = z.infer<typeof maintenanceRecurrenceSchema>
export type MaintenanceTaskStatus = z.infer<typeof maintenanceTaskStatusSchema>

export type MaintenanceScheduleRow = z.infer<typeof maintenanceScheduleRowSchema>
export type MaintenanceTaskRow = z.infer<typeof maintenanceTaskRowSchema>
export type OrgUserRow = z.infer<typeof orgUserRowSchema>

export type CreateMaintenanceInput = z.input<typeof createMaintenanceSchema>
export type CreateMaintenanceValues = z.output<typeof createMaintenanceSchema>
export type EditMaintenanceInput = z.input<typeof editMaintenanceSchema>
export type EditMaintenanceValues = z.output<typeof editMaintenanceSchema>

export interface MaintenanceOwner {
  orgId: string
  createdBy: string
}

/** A staff member option for the assignee picker. */
export interface OrgUser {
  clerkId: string
  name: string
}

/** Derived UI status of a single occurrence. */
export type TaskDisplayStatus = 'completed' | 'overdue' | 'upcoming'

/**
 * One occurrence joined with its parent schedule, plus all UI-derived fields.
 * This is what the list renders — assembled in `maintenance.view`.
 */
export interface MaintenanceTaskView {
  id: number
  scheduleId: number
  title: string
  equipment: string
  equipmentOther: string | null
  priority: MaintenancePriority
  recurrenceType: MaintenanceRecurrence
  weekdays: number[] | null
  timesPerWeek: number | null
  notes: string | null
  isScheduleActive: boolean

  dueDate: string
  status: MaintenanceTaskStatus
  assignedTo: string | null
  assigneeName: string

  displayStatus: TaskDisplayStatus
  isRecurring: boolean
  recurrenceLabel: string
  dueLabel: string
}
