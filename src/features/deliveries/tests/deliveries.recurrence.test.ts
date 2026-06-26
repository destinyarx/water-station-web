import { describe, expect, it } from 'vitest'

import { dueDatesFor, type RecurrenceRule } from '../deliveries.recurrence'

// June 2026: the 1st, 8th, 15th, 22nd are Mondays; the 3rd, 10th, 17th Wednesdays.
function weekly(overrides: Partial<RecurrenceRule>): RecurrenceRule {
  return {
    recurrenceType: 'weekly',
    weekdays: [1],
    intervalWeeks: 1,
    startDate: '2026-06-01',
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

  it('returns nothing for non-weekly rules or empty weekdays', () => {
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
