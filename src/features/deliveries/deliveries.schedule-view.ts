import { dueDatesFor, toRecurrenceRule } from './deliveries.recurrence'
import type {
  Delivery,
  DeliveryScheduleListItem,
  DeliveryScheduleRow,
} from './deliveries.types'

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

export type ScheduleTiming =
  | { kind: 'current'; date: string }
  | { kind: 'next'; date: string }
  | { kind: 'empty'; date: null }

/** Current due work takes priority; otherwise show the nearest future run. */
export function scheduleTiming(item: DeliveryScheduleListItem): ScheduleTiming {
  if (item.currentDeliveryDate != null) {
    return { kind: 'current', date: item.currentDeliveryDate }
  }

  if (item.nextDeliveryDate != null) {
    return { kind: 'next', date: item.nextDeliveryDate }
  }

  return { kind: 'empty', date: null }
}

/** Cross-status terminal event timestamp used by the history presentation. */
export function deliveryTerminalTimestamp(delivery: Delivery): string {
  return (
    delivery.updatedAt ??
    delivery.completedAt ??
    `${delivery.deliveryDate}T00:00:00`
  )
}
