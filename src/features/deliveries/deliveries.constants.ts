import type { DeliveryFormInput } from './deliveries.types'

export const DELIVERY_SCHEDULES_TABLE = 'delivery_schedules'
export const DELIVERIES_TABLE = 'deliveries'
export const DELIVERY_ITEMS_TABLE = 'delivery_items'
export const DELIVERY_SCHEDULE_ITEMS_TABLE = 'delivery_schedule_items'
export const CURRENT_DELIVERIES_VIEW = 'v_current_deliveries'

// View columns mirror the delivery row minus `deleted_at` (the view filters it).
export const CURRENT_DELIVERY_COLUMNS =
  'id, schedule_id, delivery_date, status, failure_remarks, notes, delivered_by, completed_at, org_id, created_by, created_at, updated_at'

// Rolling horizon (days) materialized ahead for a weekly schedule.
export const MATERIALIZE_HORIZON_DAYS = 14

export const DELIVERY_SCHEDULE_COLUMNS =
  'id, customer_id, guest_name, guest_contact, guest_address, recurrence_type, start_date, delivery_date, weekdays, interval_weeks, day_of_month, interval_months, end_date, status, notes, org_id, created_by, created_at, updated_at, deleted_at'

export const DELIVERY_COLUMNS =
  'id, schedule_id, delivery_date, status, failure_remarks, notes, delivered_by, completed_at, org_id, created_by, created_at, updated_at, deleted_at'

export const DELIVERY_ITEM_COLUMNS =
  'id, delivery_id, product_id, product_name, unit_price, quantity, org_id, created_at, updated_at'

export const DELIVERIES_LOAD_ERROR =
  'Unable to load deliveries. Please try again.'
export const DELIVERY_SAVE_ERROR =
  'Unable to save delivery. Please try again.'

export const DELIVERY_FORM_DEFAULTS: DeliveryFormInput = {
  targetType: 'guest',
  customerId: undefined,
  guestName: '',
  guestContact: '',
  guestAddress: '',
  recurrenceType: 'one_time',
  deliveryDate: new Date().toISOString().slice(0, 10),
  items: [],
  notes: '',
}

export const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})
