import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { toDashboardFinancials, toDashboardOperations } from '../dashboard.mapper'
import { DashboardKpis } from '../components/dashboard-kpis'
import {
  SalesExpensesChart,
  SalesMixChart,
} from '../components/dashboard-financials'
import {
  DeliveryQueuePanel,
  LowStockPanel,
  MaintenancePanel,
} from '../components/dashboard-operations'
import { financialsRow, operationsRow } from './dashboard.fixtures'

const financials = toDashboardFinancials(financialsRow)
const operations = toDashboardOperations(operationsRow)

describe('dashboard role and period composition', () => {
  it('renders the Today-only pending card and owner sales card', () => {
    const html = renderToStaticMarkup(
      <DashboardKpis
        period="today"
        financials={financials}
        operations={operations}
      />,
    )

    expect(html).toContain('Delivery sales')
    expect(html).toContain('Pending deliveries')
    expect(html).toContain('Refill units')
    expect(html).toContain('16% more sales today than yesterday')
    expect(html).toContain('25% more deliveries today than yesterday')
    expect(html).toContain('New refill units today; none yesterday')
    expect(html).not.toContain('last week')
    expect(html).not.toContain('last month')
  })

  it('removes pending and financial cards for a staff non-Today layout', () => {
    const html = renderToStaticMarkup(
      <DashboardKpis period="this_week" operations={operations} />,
    )

    expect(html).not.toContain('Delivery sales')
    expect(html).not.toContain('Pending deliveries')
    expect(html).toContain('Completed deliveries')
  })
})

describe('accessible dashboard charts', () => {
  it('renders chart descriptions, focusable values, and a screen-reader table', () => {
    const html = renderToStaticMarkup(
      <SalesExpensesChart
        buckets={financials.chart}
        salesTotal={financials.deliverySales.value}
        expenseTotal={financials.expenses.value}
      />,
    )

    expect(html).toContain('aria-labelledby="sales-expenses-chart-title sales-expenses-chart-description"')
    expect(html).toContain('<table class="sr-only">')
    expect(html).toContain('Jul 17 sales')
    expect(html).toContain('Jul 17 expenses')
  })

  it('shows a true zero-mix state instead of an artificial split', () => {
    const html = renderToStaticMarkup(
      <SalesMixChart
        items={financials.salesMix.map((item) => ({
          ...item,
          revenue: 0,
          percentage: 0,
        }))}
      />,
    )

    expect(html).toContain('No sales mix yet')
    expect(html).not.toContain('50%')
  })

  it('renders Monthly as one aggregated chart bucket with its own selector', () => {
    const html = renderToStaticMarkup(
      <SalesExpensesChart
        buckets={[
          { key: '2026-07-01', label: 'Jul 1', sales: 100, expenses: 40 },
          { key: '2026-07-02', label: 'Jul 2', sales: 150, expenses: 60 },
        ]}
        salesTotal={250}
        expenseTotal={100}
        chartPeriod="monthly"
        onChartPeriodChange={() => undefined}
      />,
    )

    expect(html).toContain('Sales versus expenses coverage')
    expect(html).toContain('Month to date sales')
    expect(html).not.toContain('Jul 1 sales')
    expect(html).not.toContain('Jul 2 sales')
  })
})

describe('operational panel states', () => {
  it('renders populated queue, stock, and maintenance previews', () => {
    const html = [
      renderToStaticMarkup(
        <DeliveryQueuePanel deliveries={operations.deliveryQueue} />,
      ),
      renderToStaticMarkup(<LowStockPanel products={operations.lowStock} />),
      renderToStaticMarkup(
        <MaintenancePanel
          tasks={operations.maintenanceDue}
          referenceDate="2026-07-17"
        />,
      ),
    ].join('')

    expect(html).toContain('Riverside Apartments')
    expect(html).toContain('7 left')
    expect(html).toContain('Due today')
  })

  it('uses panel-specific empty messages', () => {
    const html = [
      renderToStaticMarkup(<DeliveryQueuePanel deliveries={[]} />),
      renderToStaticMarkup(<LowStockPanel products={[]} />),
      renderToStaticMarkup(
        <MaintenancePanel tasks={[]} referenceDate="2026-07-17" />,
      ),
    ].join('')

    expect(html).toContain('No deliveries scheduled today')
    expect(html).toContain('Stock levels look healthy')
    expect(html).toContain('No maintenance due soon')
  })
})
