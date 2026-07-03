import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DELIVERIES_LOAD_ERROR,
  DELIVERY_SCHEDULE_COLUMNS,
  DELIVERY_SCHEDULES_TABLE,
} from '../deliveries.constants'
import { applyLimitPlusOne, DELIVERIES_PAGE_SIZE } from '../deliveries.pagination'
import { deliveryScheduleRowSchema } from '../deliveries.schema'
import type { DeliveryScheduleRow } from '../deliveries.types'

export interface SchedulePage {
  schedules: DeliveryScheduleRow[]
  hasNext: boolean
}

/**
 * Server-paginated list of delivery schedules shown in the schedule dialog,
 * newest first.
 * Org-scoped under RLS; soft-deleted rows excluded. Uses the `pageSize + 1`
 * probe (no count query) to derive `hasNext`.
 */
export async function getSchedules(
  client: SupabaseClient,
  page: number,
  pageSize: number = DELIVERIES_PAGE_SIZE,
): Promise<SchedulePage> {
  const offset = page * pageSize
  const { data, error } = await client
    .from(DELIVERY_SCHEDULES_TABLE)
    .select(DELIVERY_SCHEDULE_COLUMNS)
    .in('recurrence_type', ['weekly', 'monthly', 'custom_dates'])
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) throw new Error(DELIVERIES_LOAD_ERROR)

  const { rows, hasNext } = applyLimitPlusOne(data ?? [], pageSize)
  return {
    schedules: rows.map((schedule) => deliveryScheduleRowSchema.parse(schedule)),
    hasNext,
  }
}
