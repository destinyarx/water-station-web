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
  notes: z.string().max(500).nullable(),
  delivered_by: z.string().max(255).nullable(),
  org_id: z.number().int(),
  created_by: z.string().max(255),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  deleted_at: z.string().nullable(),
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
