import { describe, expect, it } from 'vitest'

import {
  aggregateDashboardChartBuckets,
  calculateDashboardTrend,
  formatDashboardMetricComparison,
  formatDashboardTrend,
  formatMaintenanceDueDate,
} from '../dashboard.view'

describe('dashboard trend presentation', () => {
  it('handles equal zeros without percentages', () => {
    const trend = calculateDashboardTrend('previous_day', 0, 0)
    expect(trend).toMatchObject({
      percentage: null,
      direction: 'neutral',
      label: 'No change',
    })
    expect(formatDashboardTrend(trend)).toBe('No change vs yesterday')
  })

  it('handles a positive value over a zero baseline as new activity', () => {
    const trend = calculateDashboardTrend('previous_week', 5, 0)
    expect(trend).toMatchObject({
      percentage: null,
      direction: 'up',
      label: 'New activity',
    })
    expect(formatDashboardTrend(trend)).not.toMatch(/Infinity|NaN/)
  })

  it('calculates positive and negative percentage changes', () => {
    expect(
      calculateDashboardTrend('previous_period', 150, 100),
    ).toMatchObject({ percentage: 50, direction: 'up' })
    expect(
      calculateDashboardTrend('previous_period', 75, 100),
    ).toMatchObject({ percentage: -25, direction: 'down' })
  })

  it('represents missing comparison data explicitly', () => {
    expect(
      calculateDashboardTrend('previous_month', 10, null),
    ).toMatchObject({
      percentage: null,
      direction: 'unavailable',
      label: 'No comparison data',
    })
  })
})

describe('dashboard KPI comparison copy', () => {
  it('compares Today with Yesterday using percentage language', () => {
    expect(
      formatDashboardMetricComparison('today', 120, 100, 'sales'),
    ).toBe('20% more sales today than yesterday')
    expect(
      formatDashboardMetricComparison('today', 75, 100, 'deliveries'),
    ).toBe('25% fewer deliveries today than yesterday')
  })

  it('compares Yesterday with Today and hides other coverages', () => {
    expect(
      formatDashboardMetricComparison('yesterday', 90, 100, 'refill units'),
    ).toBe('10% fewer refill units yesterday than today')
    expect(
      formatDashboardMetricComparison('this_week', 90, 100, 'sales'),
    ).toBeNull()
  })

  it('does not produce invalid percentages for a zero baseline', () => {
    const result = formatDashboardMetricComparison(
      'today',
      12,
      0,
      'deliveries',
    )
    expect(result).toBe('New deliveries today; none yesterday')
    expect(result).not.toMatch(/Infinity|NaN/)
  })
})

describe('sales-versus-expenses chart coverage', () => {
  const buckets = [
    { key: '2026-07-01', label: 'Jul 1', sales: 100, expenses: 40 },
    { key: '2026-07-02', label: 'Jul 2', sales: 150, expenses: 60 },
  ]

  it('keeps weekly daily buckets', () => {
    expect(aggregateDashboardChartBuckets(buckets, 'weekly')).toEqual(buckets)
  })

  it('combines monthly values into one whole-period bucket', () => {
    expect(aggregateDashboardChartBuckets(buckets, 'monthly')).toEqual([
      {
        key: 'month_total',
        label: 'Month to date',
        sales: 250,
        expenses: 100,
      },
    ])
  })
})

describe('maintenance attention labels', () => {
  it('labels overdue, today, tomorrow, and later due dates', () => {
    expect(
      formatMaintenanceDueDate('2026-07-15', '2026-07-17', true),
    ).toBe('Overdue 2 days')
    expect(
      formatMaintenanceDueDate('2026-07-17', '2026-07-17', false),
    ).toBe('Due today')
    expect(
      formatMaintenanceDueDate('2026-07-18', '2026-07-17', false),
    ).toBe('Tomorrow')
    expect(
      formatMaintenanceDueDate('2026-07-21', '2026-07-17', false),
    ).toBe('In 4 days')
  })
})
