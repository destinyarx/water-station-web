/** Supabase tables backing the maintenance feature. */
export const MAINTENANCE_SCHEDULES_TABLE = 'maintenance_schedules'
export const MAINTENANCE_TASKS_TABLE = 'maintenance_tasks'
export const USERS_TABLE = 'users'

/** Columns selected for a schedule row, matching `maintenanceScheduleRowSchema`. */
export const MAINTENANCE_SCHEDULE_COLUMNS =
  'id, title, equipment, equipment_other, priority, recurrence_type, weekdays, times_per_week, notes, is_active, org_id, created_by, created_at, updated_at, deleted_at'

/** Columns selected for an occurrence row, matching `maintenanceTaskRowSchema`. */
export const MAINTENANCE_TASK_COLUMNS =
  'id, schedule_id, due_date, status, assigned_to, completed_at, completed_by, org_id, created_by, created_at, updated_at, deleted_at'

/** Columns selected for the assignee picker, matching `orgUserRowSchema`. */
export const ORG_USER_COLUMNS = 'clerk_id, name'

/** User-facing error messages (raw DB errors are never surfaced). */
export const MAINTENANCE_LOAD_ERROR =
  'Unable to load maintenance schedules. Please try again.'
export const MAINTENANCE_SAVE_ERROR =
  'Unable to save this maintenance task. Please try again.'
export const MAINTENANCE_DELETE_ERROR =
  'Unable to delete this maintenance task. Please try again.'
export const MAINTENANCE_STATUS_ERROR =
  'Unable to update this schedule. Please try again.'
export const MAINTENANCE_COMPLETE_ERROR =
  'Unable to complete this task. Please try again.'
export const ORG_USERS_LOAD_ERROR =
  'Unable to load your team. Please try again.'

/** Sentinel equipment value that unlocks the free-text description field. */
export const OTHERS_EQUIPMENT = 'Others'

/** Known equipment in a water refilling station (see research.md). */
export const EQUIPMENT_OPTIONS = [
  'Sediment Pre-Filter',
  'Carbon Filter',
  'RO Membrane System',
  'UV Sterilizer',
  'Ozone Generator',
  'Storage Tank',
  'Softener / Brine Tank',
  'Water Pump',
  'Bottle Washer',
  'Dispensing Station',
  OTHERS_EQUIPMENT,
] as const

/** ISO weekday (1=Mon..7=Sun) labels for the weekly picker. */
export const WEEKDAYS: ReadonlyArray<{ value: number; short: string; long: string }> = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 7, short: 'Sun', long: 'Sunday' },
]

/** Weekly frequency choices: label → required number of selected weekdays. */
export const WEEKLY_FREQUENCIES: ReadonlyArray<{ times: number; label: string }> = [
  { times: 1, label: 'Once' },
  { times: 2, label: 'Twice' },
  { times: 3, label: 'Thrice' },
]

/** A pending occurrence shows a countdown only within this many days. */
export const UPCOMING_COUNTDOWN_MAX = 3

/** Days ahead counted as "due this week" for the stat card. */
export const DUE_WEEK_DAYS = 7
