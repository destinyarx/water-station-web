import type {
  DeliveryRecurrenceType,
  DeliveryScheduleRow,
} from './deliveries.types'

/** The recurrence fields a generator needs, decoupled from the DB row shape. */
export interface RecurrenceRule {
  recurrenceType: DeliveryRecurrenceType
  weekdays: number[] | null
  intervalWeeks: number | null
  startDate: string | null
  endDate: string | null
}

/** Projects a schedule row onto the minimal rule the generator consumes. */
export function toRecurrenceRule(schedule: DeliveryScheduleRow): RecurrenceRule {
  return {
    recurrenceType: schedule.recurrence_type,
    weekdays: schedule.weekdays,
    intervalWeeks: schedule.interval_weeks,
    startDate: schedule.start_date,
    endDate: schedule.end_date,
  }
}

const MS_PER_DAY = 86_400_000

function parseUtc(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getTime()
}

function toIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
function isoWeekday(time: number): number {
  return ((new Date(time).getUTCDay() + 6) % 7) + 1
}

/** Midnight (UTC) of the Monday in this date's ISO week. */
function mondayOf(time: number): number {
  return time - (isoWeekday(time) - 1) * MS_PER_DAY
}

/**
 * Expands a recurrence rule into concrete due dates (`YYYY-MM-DD`), inclusive of
 * `fromDate` and `horizon`. Pure. Only `weekly` is wired today; weekday
 * selection, `interval_weeks` skipping (phase-anchored to `start_date`), and
 * `end_date` cutoff all flow through this one loop so monthly can join later.
 */
export function dueDatesFor(
  rule: RecurrenceRule,
  fromDate: string,
  horizon: string,
): string[] {
  if (rule.recurrenceType !== 'weekly') return []

  const weekdays = rule.weekdays ?? []
  if (weekdays.length === 0) return []

  const interval = rule.intervalWeeks && rule.intervalWeeks > 0 ? rule.intervalWeeks : 1
  const start = rule.startDate ? parseUtc(rule.startDate) : parseUtc(fromDate)
  const anchorMonday = mondayOf(start)

  const begin = Math.max(parseUtc(fromDate), start)
  const horizonEnd = parseUtc(horizon)
  const end = rule.endDate
    ? Math.min(horizonEnd, parseUtc(rule.endDate))
    : horizonEnd

  const dates: string[] = []
  for (let day = begin; day <= end; day += MS_PER_DAY) {
    if (!weekdays.includes(isoWeekday(day))) continue

    const weeksFromAnchor = Math.round((mondayOf(day) - anchorMonday) / (7 * MS_PER_DAY))
    if (weeksFromAnchor % interval !== 0) continue

    dates.push(toIso(day))
  }

  return dates
}
