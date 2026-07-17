import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'

import { dashboardKeys } from '../dashboard.keys'
import {
  dashboardFinancialsQueryOptions,
  dashboardOperationsQueryOptions,
  DASHBOARD_STALE_TIME,
  shouldEnableDashboardFinancials,
} from '../hooks/use-dashboard'
import {
  DASHBOARD_FINANCIAL_ACCESS_ERROR,
  DASHBOARD_FINANCIALS_LOAD_ERROR,
  DASHBOARD_MALFORMED_RESPONSE_ERROR,
  getDashboardFinancials,
  getDashboardOperations,
} from '../services/dashboard.service'
import { financialsRow, operationsRow } from './dashboard.fixtures'

function createRpcClient(result: {
  data: unknown
  error: { code: string; message: string } | null
}) {
  const rpc = vi.fn(() => Promise.resolve(result))
  return {
    client: { rpc } as unknown as SupabaseClient,
    rpc,
  }
}

describe('dashboard query keys and access', () => {
  it('isolates both families by period and reference date', () => {
    expect(dashboardKeys.financials('today', '2026-07-17')).toEqual([
      'dashboard',
      'financials',
      'today',
      '2026-07-17',
    ])
    expect(dashboardKeys.operations('this_week', '2026-07-17')).toEqual([
      'dashboard',
      'operations',
      'this_week',
      '2026-07-17',
    ])
    expect(dashboardKeys.financialsAll()).not.toEqual(
      dashboardKeys.operationsAll(),
    )
  })

  it('enables financial queries only for ready owner sessions', () => {
    expect(shouldEnableDashboardFinancials(true, true)).toBe(true)
    expect(shouldEnableDashboardFinancials(true, false)).toBe(false)
    expect(shouldEnableDashboardFinancials(false, true)).toBe(false)
  })

  it('uses a 60-second stale time and previous-data placeholders', () => {
    const { client } = createRpcClient({ data: operationsRow, error: null })
    const financials = dashboardFinancialsQueryOptions(
      client,
      'today',
      '2026-07-17',
    )
    const operations = dashboardOperationsQueryOptions(
      client,
      'today',
      '2026-07-17',
    )

    expect(financials.staleTime).toBe(DASHBOARD_STALE_TIME)
    expect(operations.staleTime).toBe(DASHBOARD_STALE_TIME)
    expect(financials.placeholderData).toBeTypeOf('function')
    expect(operations.placeholderData).toBeTypeOf('function')
  })
})

describe('dashboard RPC services', () => {
  it('calls the financial RPC with only period and reference date', async () => {
    const { client, rpc } = createRpcClient({
      data: financialsRow,
      error: null,
    })

    await expect(
      getDashboardFinancials(client, 'today', '2026-07-17'),
    ).resolves.toMatchObject({ deliverySales: { value: 9240.5 } })
    expect(rpc).toHaveBeenCalledWith('get_dashboard_financials', {
      p_period: 'today',
      p_reference_date: '2026-07-17',
    })
  })

  it('calls the operational RPC with the same bounded parameters', async () => {
    const { client, rpc } = createRpcClient({
      data: operationsRow,
      error: null,
    })

    await expect(
      getDashboardOperations(client, 'today', '2026-07-17'),
    ).resolves.toMatchObject({ refillUnits: { value: 58.5 } })
    expect(rpc).toHaveBeenCalledWith('get_dashboard_operations', {
      p_period: 'today',
      p_reference_date: '2026-07-17',
    })
  })

  it('maps owner denials and ordinary failures to safe errors', async () => {
    const denied = createRpcClient({
      data: null,
      error: { code: '42501', message: 'database details' },
    })
    const failed = createRpcClient({
      data: null,
      error: { code: 'XX000', message: 'database details' },
    })

    await expect(
      getDashboardFinancials(denied.client, 'today', '2026-07-17'),
    ).rejects.toThrow(DASHBOARD_FINANCIAL_ACCESS_ERROR)
    await expect(
      getDashboardFinancials(failed.client, 'today', '2026-07-17'),
    ).rejects.toThrow(DASHBOARD_FINANCIALS_LOAD_ERROR)
  })

  it('fails safely when an RPC response violates the contract', async () => {
    const { client } = createRpcClient({
      data: { period: 'today' },
      error: null,
    })

    await expect(
      getDashboardOperations(client, 'today', '2026-07-17'),
    ).rejects.toThrow(DASHBOARD_MALFORMED_RESPONSE_ERROR)
  })
})
