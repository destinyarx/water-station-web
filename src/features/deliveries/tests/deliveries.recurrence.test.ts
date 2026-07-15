import { describe, expect, it } from 'vitest'

import { dueDatesFor, type RecurrenceRule } from '../deliveries.recurrence'

// June 2026: the 1st, 8th, 15th, 22nd are Mondays; the 3rd, 10th, 17th Wednesdays.
function weekly(overrides: Partial<RecurrenceRule>): RecurrenceRule {
  return {
    recurrenceType: 'weekly',
    weekdays: [1],
    intervalWeeks: 1,
    dayOfMonth: null,
    intervalMonths: null,
    startDate: '2026-06-01',
    endDate: null,
    ...overrides,
  }
}

function monthly(overrides: Partial<RecurrenceRule>): RecurrenceRule {
  return {
    recurrenceType: 'monthly',
    weekdays: null,
    intervalWeeks: null,
    dayOfMonth: 31,
    intervalMonths: 1,
    startDate: '2026-01-01',
    endDate: null,
    ...overrides,
  }
}

describe('dueDatesFor', () => {
  it('lists every selected weekday within the horizon', () => {
    expect(
      dueDatesFor(weekly({ weekdays: [1, 3] }), '2026-06-01', '2026-06-12'),
    ).toEqual(['2026-06-01', '2026-06-03', '2026-06-08', '2026-06-10'])
  })

  it('skips weeks per interval_weeks, anchored to start_date', () => {
    expect(
      dueDatesFor(
        weekly({ weekdays: [1, 3], intervalWeeks: 2 }),
        '2026-06-01',
        '2026-06-17',
      ),
    ).toEqual(['2026-06-01', '2026-06-03', '2026-06-15', '2026-06-17'])
  })

  it('never emits dates before start_date even if fromDate is earlier', () => {
    expect(
      dueDatesFor(
        weekly({ startDate: '2026-06-08' }),
        '2026-06-01',
        '2026-06-22',
      ),
    ).toEqual(['2026-06-08', '2026-06-15', '2026-06-22'])
  })

  it('stops at end_date', () => {
    expect(
      dueDatesFor(
        weekly({ endDate: '2026-06-15' }),
        '2026-06-01',
        '2026-06-30',
      ),
    ).toEqual(['2026-06-01', '2026-06-08', '2026-06-15'])
  })

  it('is bounded by the horizon', () => {
    expect(dueDatesFor(weekly({}), '2026-06-01', '2026-06-09')).toEqual([
      '2026-06-01',
      '2026-06-08',
    ])
  })

  it('clamps monthly dates to 28, 29, 30, and 31-day month ends', () => {
    expect(
      dueDatesFor(monthly({}), '2026-01-01', '2026-04-30'),
    ).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])

    expect(
      dueDatesFor(
        monthly({ startDate: '2028-01-01' }),
        '2028-01-01',
        '2028-03-31',
      ),
    ).toEqual(['2028-01-31', '2028-02-29', '2028-03-31'])
  })

  it('anchors monthly intervals to start_date', () => {
    expect(
      dueDatesFor(
        monthly({ intervalMonths: 2, startDate: '2026-01-15' }),
        '2026-01-01',
        '2026-07-31',
      ),
    ).toEqual(['2026-01-31', '2026-03-31', '2026-05-31', '2026-07-31'])
  })

  it('applies monthly start, from-date, horizon, and end-date boundaries', () => {
    expect(
      dueDatesFor(
        monthly({ dayOfMonth: 10, startDate: '2026-01-20' }),
        '2026-01-01',
        '2026-03-31',
      ),
    ).toEqual(['2026-02-10', '2026-03-10'])

    expect(
      dueDatesFor(
        monthly({ dayOfMonth: 15, endDate: '2026-03-14' }),
        '2026-02-16',
        '2026-06-30',
      ),
    ).toEqual([])
  })

  it('returns nothing for unsupported rules or empty weekly weekdays', () => {
    expect(
      dueDatesFor(weekly({ recurrenceType: 'one_time' }), '2026-06-01', '2026-06-30'),
    ).toEqual([])
    expect(
      dueDatesFor(weekly({ weekdays: [] }), '2026-06-01', '2026-06-30'),
    ).toEqual([])
    expect(
      dueDatesFor(weekly({ weekdays: null }), '2026-06-01', '2026-06-30'),
    ).toEqual([])
  })
})
