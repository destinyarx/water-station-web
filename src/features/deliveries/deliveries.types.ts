import type { z } from 'zod'

import type {
  deliveryFormItemSchema,
  deliveryFormSchema,
  deliveryItemRowSchema,
  deliveryRecurrenceTypeSchema,
  deliveryRowSchema,
  deliveryScheduleRowSchema,
  deliveryScheduleStatusSchema,
  deliveryStatusSchema,
} from './deliveries.schema'

export type DeliveryRecurrenceType = z.infer<typeof deliveryRecurrenceTypeSchema>
export type DeliveryScheduleStatus = z.infer<typeof deliveryScheduleStatusSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>

export type DeliveryScheduleRow = z.infer<typeof deliveryScheduleRowSchema>
export type DeliveryRow = z.infer<typeof deliveryRowSchema>
export type DeliveryItemRow = z.infer<typeof deliveryItemRowSchema>

export type DeliveryFormInput = z.input<typeof deliveryFormSchema>
export type DeliveryFormValues = z.output<typeof deliveryFormSchema>
export type DeliveryFormItem = z.output<typeof deliveryFormItemSchema>

export interface DeliveryOwner {
  orgId: number
  createdBy: string
}

export interface DeliveryScheduleInsert {
  customer_id: number | null
  guest_name: string | null
  guest_contact: string | null
  guest_address: string | null
  recurrence_type: 'one_time'
  delivery_date: string
  start_date: null
  weekdays: null
  interval_weeks: null
  day_of_month: null
  interval_months: null
  end_date: null
  status: 'active'
  notes: string | null
  org_id: number
  created_by: string
}

export interface DeliveryInsert {
  schedule_id: number
  delivery_date: string
  status: 'pending'
  notes: string | null
  org_id: number
  created_by: string
}

export interface DeliveryItemInsert {
  delivery_id: number
  product_id: number
  product_name: string
  unit_price: number
  quantity: number
  org_id: number
}

export interface DeliveryItem {
  id: number
  deliveryId: number
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  orgId: number
  createdAt: string
  updatedAt: string | null
}

export interface Delivery {
  id: number
  scheduleId: number
  deliveryDate: string
  status: DeliveryStatus
  failureRemarks: string | null
  notes: string | null
  deliveredBy: string | null
  orgId: number
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  items: DeliveryItem[]
  total: number
}
