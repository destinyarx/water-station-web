import type { z } from 'zod'

import type {
  deliveryEditFormSchema,
  deliveryFormItemSchema,
  deliveryFormSchema,
  deliveryItemRowSchema,
  deliveryRecurrenceTypeSchema,
  deliveryRowSchema,
  deliveryScheduleDateRowSchema,
  deliveryScheduleFormSchema,
  deliveryScheduleModeSchema,
  deliveryScheduleRowSchema,
  deliveryScheduleStatusSchema,
  deliveryStatusSchema,
  orgUserRowSchema,
  unifiedDeliveryFormSchema,
} from './deliveries.schema'

export type DeliveryRecurrenceType = z.infer<typeof deliveryRecurrenceTypeSchema>
export type DeliveryScheduleStatus = z.infer<typeof deliveryScheduleStatusSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
export type DeliveryScheduleMode = z.infer<typeof deliveryScheduleModeSchema>

export type DeliveryScheduleRow = z.infer<typeof deliveryScheduleRowSchema>
export type DeliveryRow = z.infer<typeof deliveryRowSchema>
export type DeliveryItemRow = z.infer<typeof deliveryItemRowSchema>
export type DeliveryScheduleDateRow = z.infer<typeof deliveryScheduleDateRowSchema>
export type OrgUserRow = z.infer<typeof orgUserRowSchema>

export type DeliveryFormInput = z.input<typeof deliveryFormSchema>
export type DeliveryFormValues = z.output<typeof deliveryFormSchema>
export type DeliveryFormItem = z.output<typeof deliveryFormItemSchema>

export type DeliveryEditFormInput = z.input<typeof deliveryEditFormSchema>
export type DeliveryEditFormValues = z.output<typeof deliveryEditFormSchema>

export type DeliveryScheduleFormInput = z.input<typeof deliveryScheduleFormSchema>
export type DeliveryScheduleFormValues = z.output<typeof deliveryScheduleFormSchema>
export type UnifiedDeliveryFormInput = z.input<typeof unifiedDeliveryFormSchema>
export type UnifiedDeliveryFormValues = z.output<typeof unifiedDeliveryFormSchema>

export interface OrgUser {
  clerkId: string
  name: string
}

export interface DeliveryOwner {
  orgId: number
  createdBy: string
}

export interface DeliveryScheduleInsert {
  customer_id: number | null
  guest_name: string | null
  guest_contact: string | null
  guest_address: string | null
  recurrence_type: 'one_time' | 'custom_dates'
  delivery_date: string | null
  start_date: string | null
  weekdays: null
  interval_weeks: null
  day_of_month: null
  interval_months: null
  end_date: null
  status: 'active'
  notes: string | null
  assigned_to: string | null
  org_id: number
  created_by: string
}

export interface DeliveryWeeklyScheduleInsert {
  customer_id: number | null
  guest_name: string | null
  guest_contact: string | null
  guest_address: string | null
  recurrence_type: 'weekly'
  delivery_date: null
  start_date: string
  weekdays: number[]
  interval_weeks: number
  day_of_month: null
  interval_months: null
  end_date: string | null
  status: 'active'
  notes: string | null
  assigned_to: string | null
  org_id: number
  created_by: string
}

export interface DeliveryScheduleDateInsert {
  schedule_id: number
  delivery_date: string
  org_id: number
}

export interface DeliveryScheduleItemInsert {
  schedule_id: number
  product_id: number
  quantity: number
  unit_price: number | null
  org_id: number
}

export interface DeliveryInsert {
  schedule_id: number
  delivery_date: string
  status: 'pending'
  notes: string | null
  assigned_to: string | null
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

export interface DeliveryScheduleInfo {
  customerId: number | null
  guestName: string | null
  guestAddress: string | null
  recurrenceType: DeliveryRecurrenceType
  weekdays: number[] | null
  intervalWeeks: number | null
}

export interface Delivery {
  id: number
  scheduleId: number
  deliveryDate: string
  status: DeliveryStatus
  failureRemarks: string | null
  cancellationRemarks: string | null
  notes: string | null
  assignedTo: string | null
  deliveredBy: string | null
  completedAt: string | null
  orgId: number
  createdBy: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  items: DeliveryItem[]
  total: number
  scheduleInfo?: DeliveryScheduleInfo
}
