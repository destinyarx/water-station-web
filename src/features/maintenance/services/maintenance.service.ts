import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

import {
  MAINTENANCE_COMPLETE_ERROR,
  MAINTENANCE_DELETE_ERROR,
  MAINTENANCE_LOAD_ERROR,
  MAINTENANCE_NOT_PERMITTED_ERROR,
  MAINTENANCE_SAVE_ERROR,
  MAINTENANCE_SCHEDULE_COLUMNS,
  MAINTENANCE_SCHEDULES_TABLE,
  MAINTENANCE_STATUS_ERROR,
  MAINTENANCE_TASK_COLUMNS,
  MAINTENANCE_TASKS_TABLE,
  ORG_USERS_LOAD_ERROR,
  ORG_USER_COLUMNS,
  USERS_TABLE,
} from '../maintenance.constants'
import {
  occurrenceDates,
  toOrgUser,
  toScheduleInsertRow,
  toScheduleUpdateRow,
  toTaskInsertRows,
  toTaskUpdateRow,
} from '../maintenance.mapper'
import { nextDueDate } from '../maintenance.recurrence'
import {
  maintenanceScheduleRowSchema,
  maintenanceTaskRowSchema,
  orgUserRowSchema,
} from '../maintenance.schema'
import type {
  CreateMaintenanceValues,
  EditMaintenanceValues,
  MaintenanceOwner,
  MaintenanceScheduleRow,
  MaintenanceTaskRow,
  MaintenanceTaskView,
  OrgUser,
} from '../maintenance.types'

const scheduleRowsSchema = z.array(maintenanceScheduleRowSchema)
const taskRowsSchema = z.array(maintenanceTaskRowSchema)
const orgUserRowsSchema = z.array(orgUserRowSchema)

const UNIQUE_VIOLATION = '23505'

export interface MaintenanceBoard {
  schedules: MaintenanceScheduleRow[]
  tasks: MaintenanceTaskRow[]
}

/**
 * Loads non-archived schedules and occurrences for the caller's tenant (RLS
 * scopes both). The page joins them via `buildTaskViews`; archived schedules'
 * occurrences fall out because their schedule is absent from the result.
 */
export async function getMaintenanceBoard(
  client: SupabaseClient,
): Promise<MaintenanceBoard> {
  const [schedulesRes, tasksRes] = await Promise.all([
    client
      .from(MAINTENANCE_SCHEDULES_TABLE)
      .select(MAINTENANCE_SCHEDULE_COLUMNS)
      .is('deleted_at', null),
    client
      .from(MAINTENANCE_TASKS_TABLE)
      .select(MAINTENANCE_TASK_COLUMNS)
      .is('deleted_at', null)
      .order('due_date', { ascending: true }),
  ])

  if (schedulesRes.error || tasksRes.error) {
    throw new Error(MAINTENANCE_LOAD_ERROR)
  }

  return {
    schedules: scheduleRowsSchema.parse(schedulesRes.data ?? []),
    tasks: taskRowsSchema.parse(tasksRes.data ?? []),
  }
}

/** Lists co-members in the caller's org for the assignee picker. */
export async function getOrgUsers(
  client: SupabaseClient,
  orgId: string,
): Promise<OrgUser[]> {
  const { data, error } = await client
    .from(USERS_TABLE)
    .select(ORG_USER_COLUMNS)
    .eq('org_id', orgId)

  if (error) {
    throw new Error(ORG_USERS_LOAD_ERROR)
  }

  return orgUserRowsSchema.parse(data ?? []).map(toOrgUser)
}

/**
 * Creates a schedule and its occurrence(s): one row per chosen date for
 * `one_time`, or a single `pending` occurrence at the first due date for
 * `everyday`/`weekly`. Tenant/creator come from `owner`, never form input.
 */
export async function createSchedule(
  client: SupabaseClient,
  values: CreateMaintenanceValues,
  owner: MaintenanceOwner,
): Promise<MaintenanceScheduleRow> {
  const { data, error } = await client
    .from(MAINTENANCE_SCHEDULES_TABLE)
    .insert(toScheduleInsertRow(values, owner))
    .select(MAINTENANCE_SCHEDULE_COLUMNS)
    .single()

  if (error) throw new Error(MAINTENANCE_SAVE_ERROR)

  const schedule = maintenanceScheduleRowSchema.parse(data)

  if (occurrenceDates(values).length > 0) {
    const { error: taskError } = await client
      .from(MAINTENANCE_TASKS_TABLE)
      .insert(toTaskInsertRows(schedule.id, values, owner))

    if (taskError) throw new Error(MAINTENANCE_SAVE_ERROR)
  }

  return schedule
}

/**
 * Edits a task: descriptive fields on the parent schedule + this occurrence's
 * date and assignee. Recurrence/cadence is fixed at creation and not editable.
 */
export async function updateSchedule(
  client: SupabaseClient,
  scheduleId: number,
  taskId: number,
  values: EditMaintenanceValues,
): Promise<void> {
  const { data: scheduleRows, error: scheduleError } = await client
    .from(MAINTENANCE_SCHEDULES_TABLE)
    .update(toScheduleUpdateRow(values))
    .eq('id', scheduleId)
    .is('deleted_at', null)
    .select('id')

  if (scheduleError) throw new Error(MAINTENANCE_SAVE_ERROR)
  if (!scheduleRows?.length) throw new Error(MAINTENANCE_NOT_PERMITTED_ERROR)

  const { data: taskRows, error: taskError } = await client
    .from(MAINTENANCE_TASKS_TABLE)
    .update(toTaskUpdateRow(values))
    .eq('id', taskId)
    .is('deleted_at', null)
    .select('id')

  if (taskError) throw new Error(MAINTENANCE_SAVE_ERROR)
  if (!taskRows?.length) throw new Error(MAINTENANCE_NOT_PERMITTED_ERROR)
}

/** Soft-deletes a whole schedule (owner-only, enforced by RLS). */
export async function archiveSchedule(
  client: SupabaseClient,
  scheduleId: number,
): Promise<void> {
  const stamp = new Date().toISOString()
  const { error } = await client
    .from(MAINTENANCE_SCHEDULES_TABLE)
    .update({ deleted_at: stamp })
    .eq('id', scheduleId)
    .is('deleted_at', null)

  if (error) throw new Error(MAINTENANCE_DELETE_ERROR)
}

/** Toggles a schedule active/inactive (independent of archive). */
export async function setScheduleStatus(
  client: SupabaseClient,
  scheduleId: number,
  isActive: boolean,
): Promise<void> {
  const { data, error } = await client
    .from(MAINTENANCE_SCHEDULES_TABLE)
    .update({ is_active: isActive })
    .eq('id', scheduleId)
    .is('deleted_at', null)
    .select('id')

  if (error) throw new Error(MAINTENANCE_STATUS_ERROR)
  if (!data?.length) throw new Error(MAINTENANCE_NOT_PERMITTED_ERROR)
}

/**
 * Completes (or, for one-time tasks, re-opens) an occurrence. Completing a
 * recurring occurrence stamps it done and inserts the next `pending` occurrence
 * at the next due date; the unique `(schedule_id, due_date)` index makes a
 * concurrent double-complete idempotent. See ADR 0006.
 */
export async function completeTask(
  client: SupabaseClient,
  task: MaintenanceTaskView,
  owner: MaintenanceOwner,
): Promise<void> {
  // One-time + already done → re-open (the design allows un-checking).
  if (task.status === 'completed' && !task.isRecurring) {
    const { data, error } = await client
      .from(MAINTENANCE_TASKS_TABLE)
      .update({ status: 'pending', completed_at: null, completed_by: null })
      .eq('id', task.id)
      .is('deleted_at', null)
      .select('id')
    if (error) throw new Error(MAINTENANCE_COMPLETE_ERROR)
    if (!data?.length) throw new Error(MAINTENANCE_NOT_PERMITTED_ERROR)
    return
  }

  if (task.status === 'completed') return // recurring history row — no-op

  const now = new Date().toISOString()
  const { data, error } = await client
    .from(MAINTENANCE_TASKS_TABLE)
    .update({ status: 'completed', completed_at: now, completed_by: owner.createdBy })
    .eq('id', task.id)
    .is('deleted_at', null)
    .select('id')

  if (error) throw new Error(MAINTENANCE_COMPLETE_ERROR)
  // Must throw before roll-forward: a refused completion that still inserted the
  // next occurrence would leave two pending tasks and break ADR 0006's invariant.
  if (!data?.length) throw new Error(MAINTENANCE_NOT_PERMITTED_ERROR)

  if (!task.isRecurring) return

  const next = nextDueDate(task.recurrenceType, task.dueDate, task.weekdays ?? [])
  if (!next) return

  const { error: insertError } = await client.from(MAINTENANCE_TASKS_TABLE).insert({
    schedule_id: task.scheduleId,
    due_date: next,
    status: 'pending',
    assigned_to: task.assignedTo,
    org_id: owner.orgId,
    created_by: owner.createdBy,
  })

  // A concurrent complete may have already created the next occurrence.
  if (insertError && insertError.code !== UNIQUE_VIOLATION) {
    throw new Error(MAINTENANCE_COMPLETE_ERROR)
  }
}
