import type { Product } from '@/features/products/products.types'

import type { StatusTransitionItem } from './deliveries.transitions'
import type {
  Delivery,
  DeliveryFormValues,
  DeliveryInsert,
  DeliveryItem,
  DeliveryItemInsert,
  DeliveryItemRow,
  DeliveryOwner,
  DeliveryRow,
  DeliveryScheduleFormValues,
  DeliveryScheduleInsert,
  DeliveryScheduleItemInsert,
  DeliveryWeeklyScheduleInsert,
} from './deliveries.types'

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function toScheduleInsertRow(
  values: DeliveryFormValues,
  owner: DeliveryOwner,
): DeliveryScheduleInsert {
  const isCustomerDelivery = values.targetType === 'customer'

  return {
    customer_id: isCustomerDelivery ? values.customerId ?? null : null,
    guest_name: isCustomerDelivery ? null : emptyToNull(values.guestName),
    guest_contact: isCustomerDelivery ? null : emptyToNull(values.guestContact),
    guest_address: isCustomerDelivery ? null : emptyToNull(values.guestAddress),
    recurrence_type: 'one_time',
    delivery_date: values.deliveryDate,
    start_date: null,
    weekdays: null,
    interval_weeks: null,
    day_of_month: null,
    interval_months: null,
    end_date: null,
    status: 'active',
    notes: emptyToNull(values.notes),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

export function toWeeklyScheduleInsertRow(
  values: DeliveryScheduleFormValues,
  owner: DeliveryOwner,
): DeliveryWeeklyScheduleInsert {
  const isCustomerDelivery = values.targetType === 'customer'

  return {
    customer_id: isCustomerDelivery ? values.customerId ?? null : null,
    guest_name: isCustomerDelivery ? null : emptyToNull(values.guestName),
    guest_contact: isCustomerDelivery ? null : emptyToNull(values.guestContact),
    guest_address: isCustomerDelivery ? null : emptyToNull(values.guestAddress),
    recurrence_type: 'weekly',
    delivery_date: null,
    start_date: values.startDate,
    weekdays: values.weekdays,
    interval_weeks: values.intervalWeeks,
    day_of_month: null,
    interval_months: null,
    end_date: values.endDate,
    status: 'active',
    notes: emptyToNull(values.notes),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

export function toScheduleItemInsertRows(
  scheduleId: number,
  values: Pick<DeliveryScheduleFormValues, 'items'>,
  owner: DeliveryOwner,
): DeliveryScheduleItemInsert[] {
  return values.items.map((item) => ({
    schedule_id: scheduleId,
    product_id: item.productId,
    quantity: item.quantity,
    // ponytail: snapshot the form price as the override; null-fallback path lives
    // in the materializer for schedules created elsewhere.
    unit_price: item.unitPrice,
    org_id: owner.orgId,
  }))
}

export function toDeliveryInsertRow(
  scheduleId: number,
  values: DeliveryFormValues,
  owner: DeliveryOwner,
): DeliveryInsert {
  return {
    schedule_id: scheduleId,
    delivery_date: values.deliveryDate,
    status: 'pending',
    notes: emptyToNull(values.notes),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

export function toDeliveryItemInsertRows(
  deliveryId: number,
  values: Pick<DeliveryFormValues, 'items'>,
  owner: DeliveryOwner,
): DeliveryItemInsert[] {
  return values.items.map((item) => ({
    delivery_id: deliveryId,
    product_id: item.productId,
    product_name: item.productName.trim(),
    unit_price: item.unitPrice,
    quantity: item.quantity,
    org_id: owner.orgId,
  }))
}

export function toDeliveryItem(row: DeliveryItemRow): DeliveryItem {
  const lineTotal = row.quantity * row.unit_price

  return {
    id: row.id,
    deliveryId: row.delivery_id,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    lineTotal,
    orgId: row.org_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toDelivery(
  row: DeliveryRow,
  itemRows: DeliveryItemRow[] = [],
): Delivery {
  const items = itemRows.map(toDeliveryItem)

  return {
    id: row.id,
    scheduleId: row.schedule_id,
    deliveryDate: row.delivery_date,
    status: row.status,
    failureRemarks: row.failure_remarks,
    notes: row.notes,
    deliveredBy: row.delivered_by,
    completedAt: row.completed_at,
    orgId: row.org_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
    items,
    total: items.reduce((sum, item) => sum + item.lineTotal, 0),
  }
}

export function toStatusTransitionItems(
  items: Pick<DeliveryItem, 'productId' | 'productName' | 'quantity'>[],
  products: Pick<Product, 'id' | 'isStockTracked'>[],
): StatusTransitionItem[] {
  const trackedById = new Map(products.map((p) => [p.id, p.isStockTracked]))
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    // ponytail: missing/soft-deleted product → untracked; can't deduct what we can't see.
    isStockTracked: trackedById.get(item.productId) ?? false,
  }))
}
