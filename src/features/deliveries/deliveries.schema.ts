import { z } from 'zod'

function optionalNumber(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return undefined
    const parsed = Number(trimmed)
    return Number.isNaN(parsed) ? value : parsed
  }

  return value
}

function trimmedOptionalString(maxLength: number): z.ZodPipe<z.ZodString, z.ZodTransform<string, string>> {
  return z
    .string()
    .max(maxLength)
    .transform((value) => value.trim())
}

function isDateOnOrAfterToday(value: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return value >= today
}

export const deliveryRecurrenceTypeSchema = z.enum([
  'one_time',
  'weekly',
  'monthly',
  'custom_dates',
])

export const deliveryScheduleStatusSchema = z.enum([
  'active',
  'paused',
  'ended',
])

export const deliveryStatusSchema = z.enum([
  'pending',
  'for_delivery',
  'completed',
  'failed',
  'cancelled',
])

export const deliveryScheduleModeSchema = z.enum([
  'recurring_route',
  'custom_dates',
])

export const deliveryScheduleRowSchema = z.object({
  id: z.number().int(),
  customer_id: z.number().int().nullable(),
  guest_name: z.string().max(100).nullable(),
  guest_contact: z.string().max(15).nullable(),
  guest_address: z.string().max(255).nullable(),
  recurrence_type: deliveryRecurrenceTypeSchema,
  start_date: z.string().nullable(),
  delivery_date: z.string().nullable(),
  weekdays: z.array(z.number().int()).nullable(),
  interval_weeks: z.number().int().nullable(),
  day_of_month: z.number().int().nullable(),
  interval_months: z.number().int().nullable(),
  end_date: z.string().nullable(),
  status: deliveryScheduleStatusSchema,
  notes: z.string().max(500).nullable(),
  assigned_to: z.string().max(255).nullable().default(null),
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

export const deliveryRowSchema = z.object({
  id: z.number().int(),
  schedule_id: z.number().int(),
  delivery_date: z.string(),
  status: deliveryStatusSchema,
  failure_remarks: z.string().max(500).nullable(),
  cancellation_remarks: z.string().max(500).nullable().default(null),
  notes: z.string().max(500).nullable(),
  assigned_to: z.string().max(255).nullable().default(null),
  delivered_by: z.string().max(255).nullable(),
  completed_at: z.string().nullable(),
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
})

// Rows from `v_current_deliveries`: a delivery row without `deleted_at`.
export const currentDeliveryRowSchema = deliveryRowSchema.omit({
  deleted_at: true,
})

export const deliveryItemRowSchema = z.object({
  id: z.number().int(),
  delivery_id: z.number().int(),
  product_id: z.number().int(),
  product_name: z.string().min(1).max(255),
  unit_price: z.coerce.number().min(0),
  quantity: z.coerce.number().positive(),
  org_id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
})

export const deliveryScheduleDateRowSchema = z.object({
  id: z.number().int(),
  schedule_id: z.number().int(),
  delivery_date: z.string(),
  org_id: z.number().int(),
  created_at: z.string(),
})

export const orgUserRowSchema = z.object({
  clerk_id: z.string().max(255),
  name: z.string().nullable(),
})

export const deliveryFormItemSchema = z.object({
  productId: z.preprocess(
    optionalNumber,
    z.number({ message: 'Product is required.' }).int().positive(),
  ),
  productName: z.string().trim().min(1).max(255),
  quantity: z.preprocess(
    optionalNumber,
    z.number({ message: 'Quantity is required.' }).positive(),
  ),
  unitPrice: z.preprocess(
    optionalNumber,
    z.number({ message: 'Unit price is required.' }).min(0),
  ),
})

export const deliveryEditFormSchema = z.object({
  deliveryDate: z
    .string()
    .min(1, 'Delivery date is required.')
    .refine(isDateOnOrAfterToday, 'Delivery date cannot be in the past.'),
  items: z
    .array(deliveryFormItemSchema)
    .min(1, 'Add at least one product or refill service.'),
  notes: trimmedOptionalString(500),
})

export const deliveryScheduleFormSchema = z
  .object({
    targetType: z.enum(['customer', 'guest']),
    customerId: z.preprocess(optionalNumber, z.number().int().positive().optional()),
    guestName: trimmedOptionalString(100),
    guestContact: trimmedOptionalString(15),
    guestAddress: trimmedOptionalString(255),
    weekdays: z
      .array(z.number().int().min(1).max(7))
      .min(1, 'Pick at least one weekday.'),
    intervalWeeks: z.preprocess(
      optionalNumber,
      z.number({ message: 'Interval is required.' }).int().min(1).max(12),
    ),
    startDate: z
      .string()
      .min(1, 'Start date is required.')
      .refine(isDateOnOrAfterToday, 'Start date cannot be in the past.'),
    endDate: z
      .string()
      .transform((value) => value.trim())
      .transform((value) => (value === '' ? null : value))
      .nullable(),
    items: z
      .array(deliveryFormItemSchema)
      .min(1, 'Add at least one product or refill service.'),
    notes: trimmedOptionalString(500),
    assignedTo: z.string().max(255).default(''),
  })
  .superRefine((values, ctx) => {
    if (values.targetType === 'customer') {
      if (values.customerId == null) {
        ctx.addIssue({ code: 'custom', path: ['customerId'], message: 'Select a customer.' })
      }
      if (values.guestName.trim() !== '') {
        ctx.addIssue({
          code: 'custom',
          path: ['guestName'],
          message: 'Guest name must be empty for customer schedules.',
        })
      }
    }

    if (values.targetType === 'guest') {
      if (values.guestName.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['guestName'], message: 'Guest name is required.' })
      }
      if (values.customerId != null) {
        ctx.addIssue({
          code: 'custom',
          path: ['customerId'],
          message: 'Customer must be empty for guest schedules.',
        })
      }
    }

    if (values.endDate != null && values.endDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date cannot be before the start date.',
      })
    }
  })

export const deliveryFormSchema = z
  .object({
    targetType: z.enum(['customer', 'guest']),
    customerId: z.preprocess(optionalNumber, z.number().int().positive().optional()),
    guestName: trimmedOptionalString(100),
    guestContact: trimmedOptionalString(15),
    guestAddress: trimmedOptionalString(255),
    recurrenceType: z.literal('one_time'),
    deliveryDate: z
      .string()
      .min(1, 'Delivery date is required.')
      .refine(isDateOnOrAfterToday, 'Delivery date cannot be in the past.'),
    items: z
      .array(deliveryFormItemSchema)
      .min(1, 'Add at least one product or refill service.'),
    notes: trimmedOptionalString(500),
    assignedTo: z.string().max(255).default(''),
  })
  .superRefine((values, ctx) => {
    if (values.targetType === 'customer') {
      if (values.customerId == null) {
        ctx.addIssue({
          code: 'custom',
          path: ['customerId'],
          message: 'Select a customer.',
        })
      }

      if (values.guestName.trim() !== '') {
        ctx.addIssue({
          code: 'custom',
          path: ['guestName'],
          message: 'Guest name must be empty for customer deliveries.',
        })
      }
    }

    if (values.targetType === 'guest') {
      if (values.guestName.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['guestName'],
          message: 'Guest name is required.',
        })
      }

      if (values.customerId != null) {
        ctx.addIssue({
          code: 'custom',
          path: ['customerId'],
          message: 'Customer must be empty for guest deliveries.',
        })
      }
    }
  })

export const unifiedDeliveryFormSchema = z
  .object({
    targetType: z.enum(['customer', 'guest']),
    customerId: z.preprocess(optionalNumber, z.number().int().positive().optional()),
    guestName: trimmedOptionalString(100),
    guestContact: trimmedOptionalString(15),
    guestAddress: trimmedOptionalString(255),
    scheduleMode: deliveryScheduleModeSchema,
    weekdays: z.array(z.number().int().min(1).max(7)).default([]),
    intervalWeeks: z.preprocess(optionalNumber, z.number().int().min(1).max(2)).default(1),
    startDate: z.string().default(''),
    endDate: z
      .string()
      .transform((value) => value.trim())
      .transform((value) => (value === '' ? null : value))
      .nullable(),
    customDates: z.array(z.string()).default([]),
    assignedTo: z.string().max(255).default(''),
    items: z
      .array(deliveryFormItemSchema)
      .min(1, 'Add at least one product or refill service.'),
    notes: trimmedOptionalString(500),
  })
  .superRefine((values, ctx) => {
    if (values.targetType === 'customer') {
      if (values.customerId == null) {
        ctx.addIssue({ code: 'custom', path: ['customerId'], message: 'Select a customer.' })
      }
      if (values.guestName.trim() !== '') {
        ctx.addIssue({
          code: 'custom',
          path: ['guestName'],
          message: 'Guest name must be empty for customer deliveries.',
        })
      }
    }

    if (values.targetType === 'guest') {
      if (values.guestName.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['guestName'], message: 'Guest name is required.' })
      }
      if (values.customerId != null) {
        ctx.addIssue({
          code: 'custom',
          path: ['customerId'],
          message: 'Customer must be empty for guest deliveries.',
        })
      }
    }

    if (values.scheduleMode === 'recurring_route') {
      if (values.weekdays.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['weekdays'], message: 'Pick at least one weekday.' })
      }
      if (!values.startDate) {
        ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'Start date is required.' })
      } else if (!isDateOnOrAfterToday(values.startDate)) {
        ctx.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: 'Start date cannot be in the past.',
        })
      }
      if (values.endDate != null && values.endDate < values.startDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'End date cannot be before the start date.',
        })
      }
    }

    if (values.scheduleMode === 'custom_dates') {
      const uniqueDates = new Set(values.customDates)
      if (uniqueDates.size === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['customDates'],
          message: 'Pick at least one delivery date.',
        })
      }
      for (const date of uniqueDates) {
        if (!isDateOnOrAfterToday(date)) {
          ctx.addIssue({
            code: 'custom',
            path: ['customDates'],
            message: 'Delivery dates cannot be in the past.',
          })
          break
        }
      }
    }
  })
