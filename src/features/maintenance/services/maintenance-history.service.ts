import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  MAINTENANCE_HISTORY_COLUMNS,
  MAINTENANCE_HISTORY_PAGE_SIZE,
  MAINTENANCE_LOAD_ERROR,
  MAINTENANCE_TASKS_TABLE,
} from '../maintenance.constants'
import { maintenanceHistoryRowSchema } from '../maintenance.schema'
import type { MaintenanceHistoryRow } from '../maintenance.types'

const historyRowsSchema = z.array(maintenanceHistoryRowSchema)

export interface MaintenanceHistoryPage {
  rows: MaintenanceHistoryRow[]
  hasNext: boolean
}

/**
 * Reads one page of completed occurrences, most recently completed first.
 * Server-paginated with the same limit-plus-one probe the delivery history
 * uses, so the board never has to hold finished work in memory. Org-scoped by
 * RLS; soft-deleted rows excluded.
 */
export async function getMaintenanceHistory(
  client: SupabaseClient,
  page: number,
  pageSize: number = MAINTENANCE_HISTORY_PAGE_SIZE,
): Promise<MaintenanceHistoryPage> {
  const offset = page * pageSize
  const { data, error } = await client
    .from(MAINTENANCE_TASKS_TABLE)
    .select(MAINTENANCE_HISTORY_COLUMNS)
    .eq('status', 'completed')
    .is('deleted_at', null)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('due_date', { ascending: false })
    .range(offset, offset + pageSize)

  if (error) throw new Error(MAINTENANCE_LOAD_ERROR)

  const parsed = historyRowsSchema.parse(data ?? [])
  const hasNext = parsed.length > pageSize

  return { rows: hasNext ? parsed.slice(0, pageSize) : parsed, hasNext }
}
