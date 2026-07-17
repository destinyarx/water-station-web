import { describe, expect, it } from 'vitest'

import {
  getDashboardComparisonRanges,
  getDashboardRange,
  getDashboardReferenceDate,
} from '../dashboard.dates'

describe('dashboard calendar ranges', () => {
  it('uses half-open Today and Yesterday ranges', () => {
    expect(getDashboardRange('today', '2026-07-17')).toEqual({
      start: '2026-07-17',
      endExclusive: '2026-07-18',
    })
    expect(getDashboardRange('yesterday', '2026-07-17')).toEqual({
      start: '2026-07-16',
      endExclusive: '2026-07-17',
    })
  })

  it('starts weeks on Monday and includes only the elapsed week', () => {
    expect(getDashboardRange('this_week', '2026-07-19')).toEqual({
      start: '2026-07-13',
      endExclusive: '2026-07-20',
    })
    expect(
      getDashboardComparisonRanges('this_week', '2026-07-19'),
    ).toEqual([
      {
        key: 'previous_period',
        start: '2026-07-06',
        endExclusive: '2026-07-13',
      },
    ])
  })

  it('uses calendar month-to-date across a year boundary', () => {
    expect(getDashboardRange('this_month', '2026-01-03')).toEqual({
      start: '2026-01-01',
      endExclusive: '2026-01-04',
    })
    expect(
      getDashboardComparisonRanges('this_month', '2026-01-03'),
    ).toEqual([
      {
        key: 'previous_period',
        start: '2025-12-01',
        endExclusive: '2025-12-04',
      },
    ])
  })

  it('clamps Today comparison dates to shorter previous months', () => {
    const regularYear = getDashboardComparisonRanges(
      'today',
      '2026-03-31',
    )
    const leapYear = getDashboardComparisonRanges('today', '2024-03-31')

    expect(regularYear[2]).toEqual({
      key: 'previous_month',
      start: '2026-02-28',
      endExclusive: '2026-03-01',
    })
    expect(leapYear[2]).toEqual({
      key: 'previous_month',
      start: '2024-02-29',
      endExclusive: '2024-03-01',
    })
  })

  it('clamps a full month comparison at the previous month end', () => {
    expect(
      getDashboardComparisonRanges('this_month', '2026-03-31'),
    ).toEqual([
      {
        key: 'previous_period',
        start: '2026-02-01',
        endExclusive: '2026-03-01',
      },
    ])
  })

  it('uses the project ISO date convention for a supplied clock', () => {
    expect(
      getDashboardReferenceDate(new Date('2026-07-17T23:59:00.000Z')),
    ).toBe('2026-07-17')
  })
})
