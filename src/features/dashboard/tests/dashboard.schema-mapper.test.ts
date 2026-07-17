import { describe, expect, it } from 'vitest'

import {
  toDashboardFinancials,
  toDashboardOperations,
} from '../dashboard.mapper'
import {
  dashboardFinancialsRowSchema,
  dashboardOperationsRowSchema,
} from '../dashboard.schema'
import { financialsRow, operationsRow } from './dashboard.fixtures'

describe('dashboard RPC validation and mapping', () => {
  it('maps financial snake_case fields and preserves decimals', () => {
    const result = toDashboardFinancials(
      dashboardFinancialsRowSchema.parse(financialsRow),
    )

    expect(result.referenceDate).toBe('2026-07-17')
    expect(result.hasAnyFinancialActivity).toBe(true)
    expect(result.deliverySales.value).toBe(9240.5)
    expect(result.topProducts[0]).toMatchObject({
      productId: 10,
      units: 42.5,
      relativePercentage: 100,
    })
  })

  it('maps operational data without creating financial fields', () => {
    const result = toDashboardOperations(
      dashboardOperationsRowSchema.parse(operationsRow),
    )

    expect(result.refillUnits.value).toBe(58.5)
    expect(result.deliveryQueue[0]).toMatchObject({
      deliveryId: 77,
      itemSummary: '3× Five-gallon refill',
    })
    expect(Object.keys(result)).not.toContain('sales')
    expect(Object.keys(result)).not.toContain('expenses')
  })

  it('rejects financial fields added to the operational payload', () => {
    expect(() =>
      dashboardOperationsRowSchema.parse({
        ...operationsRow,
        delivery_sales: { value: 99, trends: [] },
      }),
    ).toThrow()
  })

  it('rejects malformed, unbounded, and invalid-period payloads', () => {
    expect(() =>
      dashboardFinancialsRowSchema.parse({
        ...financialsRow,
        period: 'last_30_days',
      }),
    ).toThrow()
    expect(() =>
      dashboardOperationsRowSchema.parse({
        ...operationsRow,
        delivery_queue: Array.from({ length: 7 }, () =>
          operationsRow.delivery_queue[0],
        ),
      }),
    ).toThrow()
  })

  it('accepts numeric strings returned by Postgres JSON clients', () => {
    const parsed = dashboardFinancialsRowSchema.parse({
      ...financialsRow,
      delivery_sales: {
        ...financialsRow.delivery_sales,
        value: '9240.50',
      },
    })

    expect(parsed.delivery_sales.value).toBe(9240.5)
  })
})
