import { dueDatesFor, toRecurrenceRule } from './deliveries.recurrence'
import type { DeliveryScheduleRow } from './deliveries.types'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Display name: the resolved customer name, else the guest name. */
export function scheduleRecipient(
  schedule: DeliveryScheduleRow,
  customerName: string | null,
): string {
  return customerName ?? schedule.guest_name ?? 'Unknown recipient'
}

/** Human-readable recurrence rule, e.g. `Weekly · Mon, Thu`. */
export function recurrenceSummary(schedule: DeliveryScheduleRow): string {
  if (schedule.recurrence_type === 'custom_dates') return 'Custom dates'
  if (schedule.recurrence_type === 'one_time') return 'One-time'
  if (schedule.recurrence_type !== 'weekly') return 'Monthly'

  const days = (schedule.weekdays ?? [])
    .map((day) => WEEKDAY_LABELS[day - 1])
    .filter(Boolean)
    .join(', ')
  const interval = schedule.interval_weeks ?? 1
  const cadence = interval > 1 ? `Every ${interval} weeks` : 'Weekly'

  return days ? `${cadence} · ${days}` : cadence
}

/** Nearest generated occurrence on/after `today`, within `horizonDays`. */
export function nextUpcomingDate(
  schedule: DeliveryScheduleRow,
  today: string,
  horizonDays: number,
): string | null {
  if (schedule.recurrence_type === 'custom_dates') {
    return schedule.delivery_date != null && schedule.delivery_date >= today
      ? schedule.delivery_date
      : null
  }

  const dates = dueDatesFor(
    toRecurrenceRule(schedule),
    today,
    addDays(today, horizonDays),
  )
  return dates[0] ?? null
}
