import type { SupabaseClient } from '@supabase/supabase-js'

import {
  dashboardFinancialsRowSchema,
  dashboardOperationsRowSchema,
} from '../dashboard.schema'
import {
  toDashboardFinancials,
  toDashboardOperations,
} from '../dashboard.mapper'
import type {
  DashboardFinancials,
  DashboardOperations,
  DashboardPeriod,
} from '../dashboard.types'

export const DASHBOARD_FINANCIALS_LOAD_ERROR =
  'Unable to load financial insights. Please try again.'
export const DASHBOARD_OPERATIONS_LOAD_ERROR =
  'Unable to load station operations. Please try again.'
export const DASHBOARD_MALFORMED_RESPONSE_ERROR =
  'Dashboard data could not be verified. Please retry.'
export const DASHBOARD_FINANCIAL_ACCESS_ERROR =
  'Financial insights are available to station owners only.'

type DashboardRpcParameters = {
  p_period: DashboardPeriod
  p_reference_date: string
}

function rpcParameters(
  period: DashboardPeriod,
  referenceDate: string,
): DashboardRpcParameters {
  return {
    p_period: period,
    p_reference_date: referenceDate,
  }
}

export async function getDashboardFinancials(
  client: SupabaseClient,
  period: DashboardPeriod,
  referenceDate: string,
): Promise<DashboardFinancials> {
  const { data, error } = await client.rpc(
    'get_dashboard_financials',
    rpcParameters(period, referenceDate),
  )

  if (error) {
    if (error.code === '42501') {
      throw new Error(DASHBOARD_FINANCIAL_ACCESS_ERROR)
    }
    throw new Error(DASHBOARD_FINANCIALS_LOAD_ERROR)
  }

  const parsed = dashboardFinancialsRowSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(DASHBOARD_MALFORMED_RESPONSE_ERROR)
  }

  return toDashboardFinancials(parsed.data)
}

export async function getDashboardOperations(
  client: SupabaseClient,
  period: DashboardPeriod,
  referenceDate: string,
): Promise<DashboardOperations> {
  const { data, error } = await client.rpc(
    'get_dashboard_operations',
    rpcParameters(period, referenceDate),
  )

  if (error) {
    throw new Error(DASHBOARD_OPERATIONS_LOAD_ERROR)
  }

  const parsed = dashboardOperationsRowSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(DASHBOARD_MALFORMED_RESPONSE_ERROR)
  }

  return toDashboardOperations(parsed.data)
}
