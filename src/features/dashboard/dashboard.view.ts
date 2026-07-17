import type {
  DashboardChartBucket,
  DashboardChartPeriod,
  DashboardComparisonKey,
  DashboardDeliveryStatus,
  DashboardPeriod,
  DashboardTrend,
} from './dashboard.types'

const moneyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 2,
})

const compactMoneyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const quantityFormatter = new Intl.NumberFormat('en-PH', {
  maximumFractionDigits: 2,
})

export const dashboardPeriodOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
] as const

export const dashboardChartPeriodOptions = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

const comparisonLabels: Record<DashboardComparisonKey, string> = {
  previous_day: 'yesterday',
  previous_week: 'last week',
  previous_month: 'last month',
  previous_period: 'previous period',
}

const deliveryStatusLabels: Record<DashboardDeliveryStatus, string> = {
  pending: 'Pending',
  for_delivery: 'For delivery',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function formatDashboardMoney(value: number): string {
  return moneyFormatter.format(value)
}

export function formatDashboardCompactMoney(value: number): string {
  return compactMoneyFormatter.format(value)
}

export function formatDashboardQuantity(value: number): string {
  return quantityFormatter.format(value)
}

export function formatDashboardMetricComparison(
  period: DashboardPeriod,
  current: number,
  comparison: number | null | undefined,
  noun: string,
): string | null {
  if (period !== 'today' && period !== 'yesterday') return null
  if (comparison === undefined) return null

  const currentLabel = period
  const comparisonLabel = period === 'today' ? 'yesterday' : 'today'

  if (comparison === null) return 'No comparison data'
  if (comparison === 0 && current === 0) {
    return `No change in ${noun} ${currentLabel} versus ${comparisonLabel}`
  }
  if (comparison === 0) {
    return `New ${noun} ${currentLabel}; none ${comparisonLabel}`
  }

  const percentage = Math.abs(
    Math.round(((current - comparison) / Math.abs(comparison)) * 100),
  )

  if (percentage === 0) {
    return `No change in ${noun} ${currentLabel} versus ${comparisonLabel}`
  }

  const direction = current > comparison ? 'more' : 'fewer'
  return `${percentage}% ${direction} ${noun} ${currentLabel} than ${comparisonLabel}`
}

export function aggregateDashboardChartBuckets(
  buckets: DashboardChartBucket[],
  period: DashboardChartPeriod,
): DashboardChartBucket[] {
  if (period === 'weekly') return buckets

  return [
    buckets.reduce<DashboardChartBucket>(
      (total, bucket) => ({
        ...total,
        sales: total.sales + bucket.sales,
        expenses: total.expenses + bucket.expenses,
      }),
      {
        key: 'month_total',
        label: 'Month to date',
        sales: 0,
        expenses: 0,
      },
    ),
  ]
}

export function formatDashboardTrend(trend: DashboardTrend): string {
  const comparison = comparisonLabels[trend.key]
  if (trend.percentage == null) {
    return `${trend.label} vs ${comparison}`
  }

  const rounded = Math.round(trend.percentage)
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded}% vs ${comparison}`
}

export function formatExpenseTrend(trend: DashboardTrend): string {
  const comparison = comparisonLabels[trend.key]
  if (trend.percentage == null) {
    return `${trend.label} vs ${comparison}`
  }

  const rounded = Math.abs(Math.round(trend.percentage))
  const direction = trend.direction === 'up' ? 'higher' : 'lower'
  return `${rounded}% ${direction} than ${comparison}`
}

export function calculateDashboardTrend(
  key: DashboardComparisonKey,
  current: number,
  baseline: number | null,
): DashboardTrend {
  if (baseline == null) {
    return {
      key,
      current,
      baseline,
      percentage: null,
      direction: 'unavailable',
      label: 'No comparison data',
    }
  }

  if (baseline === 0 && current === 0) {
    return {
      key,
      current,
      baseline,
      percentage: null,
      direction: 'neutral',
      label: 'No change',
    }
  }

  if (baseline === 0) {
    return {
      key,
      current,
      baseline,
      percentage: null,
      direction: current > 0 ? 'up' : 'down',
      label: 'New activity',
    }
  }

  if (current === baseline) {
    return {
      key,
      current,
      baseline,
      percentage: 0,
      direction: 'neutral',
      label: 'No change',
    }
  }

  return {
    key,
    current,
    baseline,
    percentage: ((current - baseline) / Math.abs(baseline)) * 100,
    direction: current > baseline ? 'up' : 'down',
    label: current > baseline ? 'Increase' : 'Decrease',
  }
}

export function getDashboardGreeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function formatDeliveryStatus(status: DashboardDeliveryStatus): string {
  return deliveryStatusLabels[status]
}

export function formatMaintenanceDueDate(
  dueDate: string,
  referenceDate: string,
  isOverdue: boolean,
): string {
  const dayMs = 86_400_000
  const due = new Date(`${dueDate}T00:00:00.000Z`).getTime()
  const reference = new Date(`${referenceDate}T00:00:00.000Z`).getTime()
  const difference = Math.round((due - reference) / dayMs)

  if (isOverdue) {
    const days = Math.abs(difference)
    return `Overdue ${days} day${days === 1 ? '' : 's'}`
  }
  if (difference === 0) return 'Due today'
  if (difference === 1) return 'Tomorrow'
  return `In ${difference} days`
}
