import { describe, expect, it } from 'vitest'

import {
  canDeleteWaterQualityTest,
  canEditWaterQualityTest,
} from '../water-quality.guards'
import type { WaterQualityTest } from '../water-quality.types'

function makeTest(overrides: Partial<WaterQualityTest> = {}): WaterQualityTest {
  return {
    id: 1,
    orgId: 'org',
    createdBy: 'user_creator',
    createdByName: null,
    testDate: '2026-07-20',
    waterSource: 'Filtered',
    method: 'lab',
    status: 'Passed',
    labName: null,
    reportNo: null,
    reportDate: null,
    deviceType: null,
    deviceModel: null,
    testedAt: null,
    testedBy: null,
    parameters: [],
    documentIds: [],
    remarks: null,
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: null,
    deletedAt: null,
    ...overrides,
  }
}

describe('canEditWaterQualityTest', () => {
  it('allows the creator', () => {
    expect(
      canEditWaterQualityTest(makeTest(), {
        userId: 'user_creator',
        isOwner: false,
      }),
    ).toBe(true)
  })

  it('allows an owner/admin who is not the creator', () => {
    expect(
      canEditWaterQualityTest(makeTest(), { userId: 'user_other', isOwner: true }),
    ).toBe(true)
  })

  it('blocks a non-owner who is not the creator', () => {
    expect(
      canEditWaterQualityTest(makeTest(), {
        userId: 'user_other',
        isOwner: false,
      }),
    ).toBe(false)
  })

  it('blocks when there is no actor', () => {
    expect(canEditWaterQualityTest(makeTest(), null)).toBe(false)
  })

  it('blocks editing a soft-deleted test', () => {
    expect(
      canEditWaterQualityTest(makeTest({ deletedAt: '2026-07-21T00:00:00Z' }), {
        userId: 'user_creator',
        isOwner: true,
      }),
    ).toBe(false)
  })
})

describe('canDeleteWaterQualityTest', () => {
  it('matches edit authorization', () => {
    const actor = { userId: 'user_creator', isOwner: false }
    expect(canDeleteWaterQualityTest(makeTest(), actor)).toBe(true)
    expect(
      canDeleteWaterQualityTest(makeTest(), { userId: 'x', isOwner: false }),
    ).toBe(false)
  })
})
