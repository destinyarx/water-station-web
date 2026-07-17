import { CheckCheck, Clock3, Droplets, PhilippinePeso } from 'lucide-react'

import type {
  DashboardFinancials,
  DashboardMetric,
  DashboardOperations,
  DashboardPeriod,
} from '../dashboard.types'
import {
  formatDashboardMetricComparison,
  formatDashboardMoney,
  formatDashboardQuantity,
} from '../dashboard.view'
import { StatCard } from './dashboard-ui'

type DashboardKpisProps = {
  period: DashboardPeriod
  financials?: DashboardFinancials
  operations?: DashboardOperations
  todayFinancials?: DashboardFinancials
  todayOperations?: DashboardOperations
}

export function DashboardKpis({
  period,
  financials,
  operations,
  todayFinancials,
  todayOperations,
}: DashboardKpisProps) {
  return (
    <section
      aria-label="Dashboard key metrics"
      className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5"
    >
      {financials ? (
        <StatCard
          label="Delivery sales"
          value={formatDashboardMoney(financials.deliverySales.value)}
          helper="Recognized from completed deliveries"
          comparison={comparisonFor(
            period,
            financials.deliverySales,
            todayFinancials?.deliverySales,
            'sales',
          )}
          icon={<PhilippinePeso aria-hidden="true" />}
          featured
        />
      ) : null}

      {period === 'today' && operations?.pendingDeliveries ? (
        <StatCard
          label="Pending deliveries"
          value={formatDashboardQuantity(
            operations.pendingDeliveries.value,
          )}
          helper="Scheduled and waiting today"
          icon={<Clock3 aria-hidden="true" />}
          tone="amber"
        />
      ) : null}

      {operations ? (
        <StatCard
          label="Completed deliveries"
          value={formatDashboardQuantity(
            operations.completedDeliveries.value,
          )}
          helper="Completed within this coverage"
          comparison={comparisonFor(
            period,
            operations.completedDeliveries,
            todayOperations?.completedDeliveries,
            'deliveries',
          )}
          icon={<CheckCheck aria-hidden="true" />}
          tone="green"
        />
      ) : null}

      {operations ? (
        <StatCard
          label="Refill units"
          value={formatDashboardQuantity(operations.refillUnits.value)}
          helper="Non-stock-tracked completed units"
          comparison={comparisonFor(
            period,
            operations.refillUnits,
            todayOperations?.refillUnits,
            'refill units',
          )}
          icon={<Droplets aria-hidden="true" />}
          tone="violet"
        />
      ) : null}
    </section>
  )
}

function comparisonFor(
  period: DashboardPeriod,
  metric: DashboardMetric,
  todayMetric: DashboardMetric | undefined,
  noun: string,
): string | null {
  const comparison =
    period === 'today'
      ? metric.trends.find((trend) => trend.key === 'previous_day')?.baseline
      : period === 'yesterday'
        ? todayMetric?.value
        : undefined

  return formatDashboardMetricComparison(
    period,
    metric.value,
    comparison,
    noun,
  )
}
