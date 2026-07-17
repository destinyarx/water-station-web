import type {
  DashboardComparisonRange,
  DashboardDateRange,
  DashboardPeriod,
} from './dashboard.types'

const DAY_MS = 86_400_000
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function parseDateKey(value: string): Date {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error('Invalid dashboard date.')
  }

  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime()) || toDateKey(date) !== value) {
    throw new Error('Invalid dashboard date.')
  }

  return date
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDashboardDays(value: string, days: number): string {
  const date = parseDateKey(value)
  return toDateKey(new Date(date.getTime() + days * DAY_MS))
}

function startOfIsoWeek(value: string): string {
  const date = parseDateKey(value)
  const isoDay = date.getUTCDay() === 0 ? 7 : date.getUTCDay()
  return addDashboardDays(value, -(isoDay - 1))
}

function startOfMonth(value: string): string {
  const date = parseDateKey(value)
  date.setUTCDate(1)
  return toDateKey(date)
}

function previousMonthDay(value: string): string {
  const date = parseDateKey(value)
  const targetDay = date.getUTCDate()
  const previousMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1),
  )
  const previousMonthLastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0),
  ).getUTCDate()
  previousMonth.setUTCDate(Math.min(targetDay, previousMonthLastDay))
  return toDateKey(previousMonth)
}

function daysBetween(start: string, endExclusive: string): number {
  return Math.round(
    (parseDateKey(endExclusive).getTime() - parseDateKey(start).getTime()) /
      DAY_MS,
  )
}

export function getDashboardReferenceDate(now = new Date()): string {
  return toDateKey(now)
}

export function getDashboardRange(
  period: DashboardPeriod,
  referenceDate: string,
): DashboardDateRange {
  parseDateKey(referenceDate)

  switch (period) {
    case 'today':
      return {
        start: referenceDate,
        endExclusive: addDashboardDays(referenceDate, 1),
      }
    case 'yesterday':
      return {
        start: addDashboardDays(referenceDate, -1),
        endExclusive: referenceDate,
      }
    case 'this_week':
      return {
        start: startOfIsoWeek(referenceDate),
        endExclusive: addDashboardDays(referenceDate, 1),
      }
    case 'this_month':
      return {
        start: startOfMonth(referenceDate),
        endExclusive: addDashboardDays(referenceDate, 1),
      }
  }
}

export function getDashboardComparisonRanges(
  period: DashboardPeriod,
  referenceDate: string,
): DashboardComparisonRange[] {
  const current = getDashboardRange(period, referenceDate)

  if (period === 'today') {
    const monthDay = previousMonthDay(referenceDate)
    return [
      {
        key: 'previous_day',
        start: addDashboardDays(referenceDate, -1),
        endExclusive: referenceDate,
      },
      {
        key: 'previous_week',
        start: addDashboardDays(referenceDate, -7),
        endExclusive: addDashboardDays(referenceDate, -6),
      },
      {
        key: 'previous_month',
        start: monthDay,
        endExclusive: addDashboardDays(monthDay, 1),
      },
    ]
  }

  if (period === 'yesterday') {
    return [
      {
        key: 'previous_period',
        start: addDashboardDays(referenceDate, -2),
        endExclusive: addDashboardDays(referenceDate, -1),
      },
    ]
  }

  if (period === 'this_week') {
    return [
      {
        key: 'previous_period',
        start: addDashboardDays(current.start, -7),
        endExclusive: addDashboardDays(current.endExclusive, -7),
      },
    ]
  }

  const currentStart = parseDateKey(current.start)
  const previousStart = new Date(
    Date.UTC(currentStart.getUTCFullYear(), currentStart.getUTCMonth() - 1, 1),
  )
  const unclampedEnd = addDashboardDays(
    toDateKey(previousStart),
    daysBetween(current.start, current.endExclusive),
  )

  return [
    {
      key: 'previous_period',
      start: toDateKey(previousStart),
      endExclusive:
        unclampedEnd < current.start ? unclampedEnd : current.start,
    },
  ]
}

export function formatDashboardRange(
  period: DashboardPeriod,
  referenceDate: string,
): string {
  const range = getDashboardRange(period, referenceDate)
  const start = parseDateKey(range.start)
  const end = parseDateKey(addDashboardDays(range.endExclusive, -1))
  const formatter = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  if (range.start === addDashboardDays(range.endExclusive, -1)) {
    return formatter.format(start)
  }

  return `${formatter.format(start)} – ${formatter.format(end)}`
}
