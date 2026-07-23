import type { DeliveryFormInput, UnifiedDeliveryFormInput } from './deliveries.types'

export const DELIVERY_SCHEDULES_TABLE = 'delivery_schedules'
export const DELIVERIES_TABLE = 'deliveries'
export const DELIVERY_ITEMS_TABLE = 'delivery_items'
export const DELIVERY_SCHEDULE_ITEMS_TABLE = 'delivery_schedule_items'
export const DELIVERY_SCHEDULE_DATES_TABLE = 'delivery_schedule_dates'
export const CURRENT_DELIVERIES_VIEW = 'v_current_deliveries'
export const USERS_TABLE = 'users'

// View columns mirror the delivery row minus `deleted_at` (the view filters it).
export const CURRENT_DELIVERY_COLUMNS =
  'id, schedule_id, delivery_date, status, failure_remarks, cancellation_remarks, notes, assigned_to, delivered_by, completed_at, org_id, created_by, created_at, updated_at'

// Rolling horizon (days) materialized ahead for a weekly schedule.
export const MATERIALIZE_HORIZON_DAYS = 14

export const DELIVERY_SCHEDULE_COLUMNS =
  'id, customer_id, guest_name, guest_contact, guest_address, recurrence_type, start_date, delivery_date, weekdays, interval_weeks, day_of_month, interval_months, end_date, status, completed, notes, assigned_to, org_id, created_by, created_at, updated_at, deleted_at'

export const DELIVERY_COLUMNS =
  'id, schedule_id, delivery_date, status, failure_remarks, cancellation_remarks, notes, assigned_to, delivered_by, completed_at, org_id, created_by, created_at, updated_at, deleted_at'

export const DELIVERY_ITEM_COLUMNS =
  'id, delivery_id, product_id, product_name, unit_price, quantity, is_stock_tracked, org_id, created_at, updated_at'

export const ORG_USER_COLUMNS = 'clerk_id, name'

export const DELIVERIES_LOAD_ERROR =
  'Unable to load deliveries. Please try again.'
export const DELIVERY_SAVE_ERROR =
  'Unable to save delivery. Please try again.'

/** A write that matched no rows: RLS refused it, or the row was archived. */
export const DELIVERY_NOT_PERMITTED_ERROR =
  'Nothing was changed. This schedule may have been archived, or you may not have permission to change it.'

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
  assignedTo: '',
}

export const UNIFIED_DELIVERY_FORM_DEFAULTS: UnifiedDeliveryFormInput = {
  targetType: 'guest',
  customerId: undefined,
  guestName: '',
  guestContact: '',
  guestAddress: '',
  scheduleMode: 'custom_dates',
  weekdays: [],
  intervalWeeks: 1,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  customDates: [new Date().toISOString().slice(0, 10)],
  assignedTo: '',
  items: [],
  notes: '',
}

export const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})
