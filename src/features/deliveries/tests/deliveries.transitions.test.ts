import { describe, expect, it } from 'vitest'

import {
  legalNextStatuses,
  resolveStatusTransition,
} from '../deliveries.transitions'
import type {
  LegalTransition,
  StatusTransitionItem,
} from '../deliveries.transitions'
import type { DeliveryStatus } from '../deliveries.types'

const tracked: StatusTransitionItem[] = [
  { productId: 10, productName: 'Bottle', quantity: 3, isStockTracked: true },
  { productId: 20, productName: 'Refill', quantity: 5, isStockTracked: false },
]

describe('resolveStatusTransition', () => {
  it('deducts stock for tracked items when dispatching a pending delivery', () => {
    const result = resolveStatusTransition('pending', 'for_delivery', tracked)

    expect(result).toMatchObject({ legal: true })
    if (!result.legal) return
    expect(result.stockDeltas).toEqual([{ productId: 10, delta: -3 }])
    expect(result.stampDeliveredBy).toBe(true)
  })

  it('rejects illegal edges (e.g. pending -> completed)', () => {
    expect(resolveStatusTransition('pending', 'completed', tracked)).toEqual({
      legal: false,
    })
    expect(resolveStatusTransition('completed', 'failed', tracked)).toEqual({
      legal: false,
    })
    expect(resolveStatusTransition('pending', 'pending', tracked)).toEqual({
      legal: false,
    })
  })

  it('never moves stock for non-stock-tracked products', () => {
    const onlyServices: StatusTransitionItem[] = [
      { productId: 20, productName: 'Refill', quantity: 5, isStockTracked: false },
    ]
    const result = resolveStatusTransition('pending', 'for_delivery', onlyServices)
    if (!result.legal) throw new Error('expected legal')
    expect(result.stockDeltas).toEqual([])
  })

  // Every legal edge of the forward delivery lifecycle: stock direction + derived fields.
  // delta is per the single tracked item (qty 3); restore = +3, deduct = -3.
  type Expected = Pick<
    LegalTransition,
    | 'completedAt'
    | 'failureRemarks'
    | 'cancellationRemarks'
    | 'stampDeliveredBy'
    | 'editableAfter'
  > & { delta: number }

  const cases: Array<[DeliveryStatus, DeliveryStatus, Expected]> = [
    ['pending', 'for_delivery', { delta: -3, completedAt: 'clear', failureRemarks: 'clear', cancellationRemarks: 'clear', stampDeliveredBy: true, editableAfter: false }],
    ['pending', 'cancelled', { delta: 0, completedAt: 'clear', failureRemarks: 'clear', cancellationRemarks: 'require', stampDeliveredBy: false, editableAfter: false }],
    ['for_delivery', 'completed', { delta: 0, completedAt: 'set', failureRemarks: 'clear', cancellationRemarks: 'clear', stampDeliveredBy: false, editableAfter: false }],
    ['for_delivery', 'failed', { delta: 3, completedAt: 'clear', failureRemarks: 'require', cancellationRemarks: 'clear', stampDeliveredBy: false, editableAfter: false }],
    ['for_delivery', 'cancelled', { delta: 3, completedAt: 'clear', failureRemarks: 'clear', cancellationRemarks: 'require', stampDeliveredBy: false, editableAfter: false }],
  ]

  it.each(cases)('%s -> %s applies the lifecycle effects', (from, to, expected) => {
    const result = resolveStatusTransition(from, to, tracked)
    if (!result.legal) throw new Error(`expected ${from} -> ${to} legal`)

    const expectedDeltas =
      expected.delta === 0 ? [] : [{ productId: 10, delta: expected.delta }]
    expect(result.stockDeltas).toEqual(expectedDeltas)
    expect(result.completedAt).toBe(expected.completedAt)
    expect(result.failureRemarks).toBe(expected.failureRemarks)
    expect(result.cancellationRemarks).toBe(expected.cancellationRemarks)
    expect(result.stampDeliveredBy).toBe(expected.stampDeliveredBy)
    expect(result.editableAfter).toBe(expected.editableAfter)
  })
})

describe('legalNextStatuses', () => {
  it('lists the reachable statuses for the current status', () => {
    expect(legalNextStatuses('pending')).toEqual(['for_delivery', 'cancelled'])
    expect(legalNextStatuses('for_delivery')).toEqual([
      'completed',
      'failed',
      'cancelled',
    ])
    expect(legalNextStatuses('completed')).toEqual([])
    expect(legalNextStatuses('failed')).toEqual([])
    expect(legalNextStatuses('cancelled')).toEqual([])
  })

  it('only offers reachable statuses (every entry resolves legal)', () => {
    for (const next of legalNextStatuses('completed')) {
      expect(resolveStatusTransition('completed', next, tracked).legal).toBe(true)
    }
  })
})
