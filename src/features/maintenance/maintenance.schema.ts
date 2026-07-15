import { z } from 'zod'

import { EQUIPMENT_OPTIONS, OTHERS_EQUIPMENT } from './maintenance.constants'

function isDateOnOrAfterToday(value: string): boolean {
  return value >= new Date().toISOString().slice(0, 10)
}

export const maintenancePrioritySchema = z.enum(['low', 'medium', 'high'])
export const maintenanceRecurrenceSchema = z.enum(['one_time', 'everyday', 'weekly'])
export const maintenanceTaskStatusSchema = z.enum(['pending', 'completed'])

/** A row from `maintenance_schedules`. */
export const maintenanceScheduleRowSchema = z.object({
  id: z.number().int(),
  title: z.string().max(120),
  equipment: z.string().max(60),
  equipment_other: z.string().max(120).nullable(),
  priority: maintenancePrioritySchema,
  recurrence_type: maintenanceRecurrenceSchema,
  weekdays: z.array(z.number().int()).nullable(),
  times_per_week: z.number().int().nullable(),
  notes: z.string().max(500).nullable(),
  is_active: z.boolean(),
  org_id: z.string().uuid(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

/** A row from `maintenance_tasks`. */
export const maintenanceTaskRowSchema = z.object({
  id: z.number().int(),
  schedule_id: z.number().int(),
  due_date: z.string(),
  status: maintenanceTaskStatusSchema,
  assigned_to: z.string().max(255).nullable(),
  completed_at: z.string().nullable(),
  completed_by: z.string().max(255).nullable(),
  org_id: z.string().uuid(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

/**
 * A completed occurrence joined to its parent schedule, as read by the history
 * modal. Narrower than `maintenanceTaskRowSchema` — history is read-only.
 */
export const maintenanceHistoryRowSchema = z.object({
  id: z.number().int(),
  due_date: z.string(),
  completed_at: z.string().nullable(),
  completed_by: z.string().max(255).nullable(),
  assigned_to: z.string().max(255).nullable(),
  schedule: z.object({
    title: z.string().max(120),
    equipment: z.string().max(60),
    equipment_other: z.string().max(120).nullable(),
    priority: maintenancePrioritySchema,
  }),
})

/** A co-member option for the assignee picker. */
export const orgUserRowSchema = z.object({
  clerk_id: z.string().max(255),
  name: z.string().nullable(),
})

const equipmentSchema = z
  .string()
  .min(1, 'Choose the equipment.')
  .refine(
    (value) => (EQUIPMENT_OPTIONS as readonly string[]).includes(value),
    'Choose a valid equipment option.',
  )

const baseFields = {
  title: z.string().trim().min(1, 'Give this task a title.').max(120),
  equipment: equipmentSchema,
  equipmentOther: z.string().trim().max(120).default(''),
  priority: maintenancePrioritySchema,
  assignedTo: z.string().max(255).default(''),
  notes: z.string().trim().max(500).default(''),
}

function requireOtherDescription(
  values: { equipment: string; equipmentOther: string },
  ctx: z.RefinementCtx,
): void {
  if (values.equipment === OTHERS_EQUIPMENT && values.equipmentOther.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['equipmentOther'],
      message: 'Describe the equipment.',
    })
  }
}

/** Create form: full recurrence rule + the occurrence date(s). */
export const createMaintenanceSchema = z
  .object({
    ...baseFields,
    recurrenceType: maintenanceRecurrenceSchema,
    weekdays: z.array(z.number().int().min(1).max(7)).default([]),
    timesPerWeek: z.number().int().min(1).max(3).optional(),
    startDate: z.string().default(''),
    dates: z.array(z.string()).default([]),
  })
  .superRefine((values, ctx) => {
    requireOtherDescription(values, ctx)

    if (values.recurrenceType === 'one_time') {
      if (values.dates.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['dates'], message: 'Pick at least one date.' })
      }
      return
    }

    // everyday / weekly both need a start date.
    if (!values.startDate) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Pick a start date.' })
    } else if (!isDateOnOrAfterToday(values.startDate)) {
      ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date cannot be in the past.' })
    }

    if (values.recurrenceType === 'weekly') {
      const count = values.weekdays.length
      if (count < 1 || count > 3) {
        ctx.addIssue({ code: 'custom', path: ['weekdays'], message: 'Pick 1 to 3 weekdays.' })
      }
      if (values.timesPerWeek != null && values.timesPerWeek !== count) {
        ctx.addIssue({
          code: 'custom',
          path: ['weekdays'],
          message: `Pick exactly ${values.timesPerWeek} weekday${values.timesPerWeek === 1 ? '' : 's'}.`,
        })
      }
    }
  })

/** Edit form: descriptive fields + this occurrence's date & assignee. */
export const editMaintenanceSchema = z
  .object({
    ...baseFields,
    dueDate: z
      .string()
      .min(1, 'Pick a date.')
      .refine(isDateOnOrAfterToday, 'Date cannot be in the past.'),
  })
  .superRefine(requireOtherDescription)
