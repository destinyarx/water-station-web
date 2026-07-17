'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

import { getDashboardReferenceDate, formatDashboardRange } from '../dashboard.dates'
import type {
  DashboardChartPeriod,
  DashboardPeriod,
} from '../dashboard.types'
import { getDashboardGreeting } from '../dashboard.view'
import {
  useDashboardFinancials,
  useDashboardOperations,
} from '../hooks/use-dashboard'
import { DashboardFinancialsSection } from './dashboard-financials'
import { DashboardHeader } from './dashboard-header'
import { DashboardKpis } from './dashboard-kpis'
import { DashboardOperationsSection } from './dashboard-operations'
import { DashboardKpiSkeleton, SectionNotice } from './dashboard-ui'

export function DashboardPage() {
  const { isLoaded, sessionClaims } = useAuth()
  const [period, setPeriod] = useState<DashboardPeriod>('today')
  const [chartPeriod, setChartPeriod] =
    useState<DashboardChartPeriod>('weekly')
  const [referenceDate] = useState(() => getDashboardReferenceDate())

  const isOwner = sessionClaims?.is_owner === true
  const hasOrganization = Boolean(sessionClaims?.organization)
  const isReady = isLoaded && hasOrganization

  const financialsQuery = useDashboardFinancials(
    period,
    referenceDate,
    isReady,
    isOwner,
  )
  const operationsQuery = useDashboardOperations(
    period,
    referenceDate,
    isReady,
  )
  const chartFinancialsQuery = useDashboardFinancials(
    chartPeriod === 'weekly' ? 'this_week' : 'this_month',
    referenceDate,
    isReady,
    isOwner,
  )
  const todayFinancialsQuery = useDashboardFinancials(
    'today',
    referenceDate,
    isReady && period === 'yesterday',
    isOwner,
  )
  const todayOperationsQuery = useDashboardOperations(
    'today',
    referenceDate,
    isReady && period === 'yesterday',
  )

  const userName = sessionClaims?.name?.trim().split(/\s+/)[0] || 'there'
  const stationName =
    sessionClaims?.organization_name?.trim() || 'Your water station'
  const isRefreshing =
    (financialsQuery.isFetching && !financialsQuery.isPending) ||
    (operationsQuery.isFetching && !operationsQuery.isPending) ||
    (chartFinancialsQuery.isFetching && !chartFinancialsQuery.isPending) ||
    (todayFinancialsQuery.isFetching && !todayFinancialsQuery.isPending) ||
    (todayOperationsQuery.isFetching && !todayOperationsQuery.isPending)

  if (isLoaded && !hasOrganization) {
    return (
      <main className="mx-auto w-full max-w-300 px-4 py-5 sm:px-6 sm:py-7 lg:px-7">
        <SectionNotice
          title="Choose a water station to continue"
          description="Dashboard data is scoped to the active Clerk organization. Select a station, then reload this page."
        />
      </main>
    )
  }

  return (
    <main className="mx-auto flex w-full max-w-300 flex-col gap-5 px-4 py-5 pb-14 sm:px-6 sm:py-7 lg:px-7">
      <DashboardHeader
        greeting={getDashboardGreeting()}
        name={userName}
        stationName={stationName}
        rangeLabel={formatDashboardRange(period, referenceDate)}
        period={period}
        isRefreshing={isRefreshing}
        onPeriodChange={setPeriod}
      />

      {!isReady ||
      (operationsQuery.isPending &&
        (!isOwner || financialsQuery.isPending)) ? (
        <DashboardKpiSkeleton count={isOwner ? 4 : 3} />
      ) : (
        <DashboardKpis
          period={period}
          financials={isOwner ? financialsQuery.data : undefined}
          operations={operationsQuery.data}
          todayFinancials={
            isOwner && period === 'yesterday'
              ? todayFinancialsQuery.data
              : undefined
          }
          todayOperations={
            period === 'yesterday' ? todayOperationsQuery.data : undefined
          }
        />
      )}

      {isOwner ? (
        <DashboardFinancialsSection
          query={financialsQuery}
          chartQuery={chartFinancialsQuery}
          chartPeriod={chartPeriod}
          onChartPeriodChange={setChartPeriod}
        />
      ) : null}

      <DashboardOperationsSection
        query={operationsQuery}
        referenceDate={referenceDate}
      />
    </main>
  )
}
