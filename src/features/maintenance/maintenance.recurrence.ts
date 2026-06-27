import type { MaintenanceRecurrence } from './maintenance.types'

const MS_PER_DAY = 86_400_000

function parseUtc(iso: string): number {
  return new Date(`${iso}T00:00:00.000Z`).getTime()
}

function toIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(iso: string): number {
  return ((new Date(`${iso}T00:00:00.000Z`).getUTCDay() + 6) % 7) + 1
}

/**
 * The first occurrence date for a new schedule. `everyday` starts on the chosen
 * day; `weekly` starts on the earliest selected weekday on or after it. Pure.
 */
export function firstDueDate(
  recurrenceType: MaintenanceRecurrence,
  startDate: string,
  weekdays: number[],
): string {
  if (recurrenceType === 'everyday') return startDate
  // weekly: scan forward up to 7 days for the first matching weekday.
  const start = parseUtc(startDate)
  for (let offset = 0; offset < 7; offset += 1) {
    const day = start + offset * MS_PER_DAY
    if (weekdays.includes(isoWeekday(toIso(day)))) return toIso(day)
  }
  return startDate
}

/**
 * The next occurrence strictly after `fromDate` for a recurring schedule.
 * `everyday` = +1 day; `weekly` = the next selected weekday. Returns null for
 * non-recurring types (one-time schedules do not roll forward). Pure.
 */
export function nextDueDate(
  recurrenceType: MaintenanceRecurrence,
  fromDate: string,
  weekdays: number[],
): string | null {
  if (recurrenceType === 'everyday') {
    return toIso(parseUtc(fromDate) + MS_PER_DAY)
  }
  if (recurrenceType === 'weekly') {
    const from = parseUtc(fromDate)
    for (let offset = 1; offset <= 7; offset += 1) {
      const day = from + offset * MS_PER_DAY
      if (weekdays.includes(isoWeekday(toIso(day)))) return toIso(day)
    }
  }
  return null
}
