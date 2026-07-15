import type {
  DeliveryRecurrenceType,
  DeliveryScheduleRow,
} from './deliveries.types'

/** The recurrence fields a generator needs, decoupled from the DB row shape. */
export interface RecurrenceRule {
  recurrenceType: DeliveryRecurrenceType
  weekdays: number[] | null
  intervalWeeks: number | null
  dayOfMonth: number | null
  intervalMonths: number | null
  startDate: string | null
  endDate: string | null
}

/** Projects a schedule row onto the minimal rule the generator consumes. */
export function toRecurrenceRule(schedule: DeliveryScheduleRow): RecurrenceRule {
  return {
    recurrenceType: schedule.recurrence_type,
    weekdays: schedule.weekdays,
    intervalWeeks: schedule.interval_weeks,
    dayOfMonth: schedule.day_of_month,
    intervalMonths: schedule.interval_months,
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

function daysInUtcMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

function monthsBetween(anchor: Date, candidate: Date): number {
  return (
    (candidate.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    candidate.getUTCMonth() -
    anchor.getUTCMonth()
  )
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
 * `fromDate` and `horizon`. Pure. Weekly and monthly interval calculations are
 * phase-anchored to `start_date`; monthly days clamp to the target month end.
 */
export function dueDatesFor(
  rule: RecurrenceRule,
  fromDate: string,
  horizon: string,
): string[] {
  const start = rule.startDate ? parseUtc(rule.startDate) : parseUtc(fromDate)
  const begin = Math.max(parseUtc(fromDate), start)
  const horizonEnd = parseUtc(horizon)
  const end = rule.endDate
    ? Math.min(horizonEnd, parseUtc(rule.endDate))
    : horizonEnd

  if (begin > end) return []

  if (rule.recurrenceType === 'monthly') {
    const dayOfMonth = rule.dayOfMonth
    if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31) return []

    const interval =
      rule.intervalMonths && rule.intervalMonths > 0
        ? rule.intervalMonths
        : 1
    const anchor = new Date(start)
    const beginDate = new Date(begin)
    const endDate = new Date(end)
    const dates: string[] = []

    for (
      let cursor = new Date(
        Date.UTC(beginDate.getUTCFullYear(), beginDate.getUTCMonth(), 1),
      );
      cursor <= endDate;
      cursor = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
      )
    ) {
      const monthOffset = monthsBetween(anchor, cursor)
      if (monthOffset < 0 || monthOffset % interval !== 0) continue

      const year = cursor.getUTCFullYear()
      const month = cursor.getUTCMonth()
      const clampedDay = Math.min(dayOfMonth, daysInUtcMonth(year, month))
      const candidate = Date.UTC(year, month, clampedDay)
      if (candidate < begin || candidate > end) continue

      dates.push(toIso(candidate))
    }

    return dates
  }

  if (rule.recurrenceType !== 'weekly') return []

  const weekdays = rule.weekdays ?? []
  if (weekdays.length === 0) return []

  const interval = rule.intervalWeeks && rule.intervalWeeks > 0 ? rule.intervalWeeks : 1
  const anchorMonday = mondayOf(start)

  const dates: string[] = []
  for (let day = begin; day <= end; day += MS_PER_DAY) {
    if (!weekdays.includes(isoWeekday(day))) continue

    const weeksFromAnchor = Math.round((mondayOf(day) - anchorMonday) / (7 * MS_PER_DAY))
    if (weeksFromAnchor % interval !== 0) continue

    dates.push(toIso(day))
  }

  return dates
}
