import { BarChart3, PackageSearch, PieChart } from 'lucide-react'

import type { UseQueryResult } from '@tanstack/react-query'

import { cn } from '@/lib/utils'

import type {
  DashboardChartBucket,
  DashboardChartPeriod,
  DashboardFinancials,
  DashboardSalesMixItem,
  DashboardTopProduct,
} from '../dashboard.types'
import {
  aggregateDashboardChartBuckets,
  dashboardChartPeriodOptions,
  formatDashboardCompactMoney,
  formatDashboardMoney,
  formatDashboardQuantity,
} from '../dashboard.view'
import {
  DashboardPanelSkeleton,
  ErrorPanel,
  PanelEmpty,
  PanelShell,
  SectionNotice,
} from './dashboard-ui'

type DashboardFinancialsSectionProps = {
  query: UseQueryResult<DashboardFinancials, Error>
  chartQuery: UseQueryResult<DashboardFinancials, Error>
  chartPeriod: DashboardChartPeriod
  onChartPeriodChange: (period: DashboardChartPeriod) => void
}

export function DashboardFinancialsSection({
  query,
  chartQuery,
  chartPeriod,
  onChartPeriodChange,
}: DashboardFinancialsSectionProps) {
  if (query.isPending && !query.data) {
    return (
      <section aria-label="Loading financial dashboard" className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.8fr)]">
        <DashboardPanelSkeleton />
        <DashboardPanelSkeleton />
      </section>
    )
  }

  if (query.isError && !query.data) {
    return (
      <ErrorPanel
        title="Financial insights are unavailable"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (!query.data) return null

  const data = query.data
  const selectedPeriodIsEmpty =
    data.deliverySales.value === 0 && data.expenses.value === 0

  return (
    <section aria-label="Owner financial insights" className="flex flex-col gap-4">
      {query.isError ? (
        <ErrorPanel
          title="Financial insights may be out of date"
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!data.hasAnyFinancialActivity ? (
        <SectionNotice
          title="No financial activity recorded yet"
          description="Complete a delivery or record an expense to begin building the station’s financial view."
        />
      ) : selectedPeriodIsEmpty ? (
        <SectionNotice
          title="No financial activity in this coverage"
          description="Choose another period to review earlier completed-delivery sales or expenses."
        />
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.8fr)]">
        <SalesExpensesQueryPanel
          query={chartQuery}
          period={chartPeriod}
          onPeriodChange={onChartPeriodChange}
        />
        <SalesMixChart items={data.salesMix} />
      </div>

      <TopProductsPanel products={data.topProducts} />
    </section>
  )
}

function SalesExpensesQueryPanel({
  query,
  period,
  onPeriodChange,
}: {
  query: UseQueryResult<DashboardFinancials, Error>
  period: DashboardChartPeriod
  onPeriodChange: (period: DashboardChartPeriod) => void
}) {
  if (query.isPending && !query.data) {
    return <DashboardPanelSkeleton />
  }

  if (query.isError && !query.data) {
    return (
      <ErrorPanel
        title="Sales and expenses are unavailable"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (!query.data) return null

  return (
    <SalesExpensesChart
      buckets={query.data.chart}
      salesTotal={query.data.deliverySales.value}
      expenseTotal={query.data.expenses.value}
      chartPeriod={period}
      onChartPeriodChange={onPeriodChange}
    />
  )
}

export function SalesExpensesChart({
  buckets,
  salesTotal,
  expenseTotal,
  chartPeriod = 'weekly',
  onChartPeriodChange,
}: {
  buckets: DashboardChartBucket[]
  salesTotal: number
  expenseTotal: number
  chartPeriod?: DashboardChartPeriod
  onChartPeriodChange?: (period: DashboardChartPeriod) => void
}) {
  const displayedBuckets = aggregateDashboardChartBuckets(
    buckets,
    chartPeriod,
  )
  const chartWidth = Math.max(360, displayedBuckets.length * 46)
  const chartHeight = 220
  const plotTop = 12
  const plotBottom = 184
  const plotHeight = plotBottom - plotTop
  const groupWidth = chartWidth / Math.max(displayedBuckets.length, 1)
  const barWidth = Math.min(13, groupWidth / 3)
  const maximum = Math.max(
    0,
    ...displayedBuckets.flatMap((bucket) => [bucket.sales, bucket.expenses]),
  )

  function handleChartPeriodChange(value: string): void {
    if (!onChartPeriodChange) return
    if (value === 'weekly' || value === 'monthly') {
      onChartPeriodChange(value)
    }
  }

  return (
    <PanelShell
      title="Sales versus expenses"
      description={
        chartPeriod === 'monthly'
          ? 'Whole month-to-date delivery sales and recorded expenses'
          : 'Completed-delivery sales and recorded expenses by day this week'
      }
      action={
        onChartPeriodChange ? (
          <label className="relative shrink-0">
            <span className="sr-only">Sales versus expenses coverage</span>
            <select
              value={chartPeriod}
              onChange={(event) =>
                handleChartPeriodChange(event.target.value)
              }
              className="h-8 cursor-pointer appearance-none rounded-lg border border-(--app-border-strong) bg-(--app-surface-2) py-1 pr-8 pl-3 text-[11px] font-bold text-(--app-text) outline-none focus:border-(--app-brand)"
            >
              {dashboardChartPeriodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-(--app-text-soft)"
            >
              ▾
            </span>
          </label>
        ) : undefined
      }
    >
      <div className="px-4 pt-4 sm:px-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-(--app-chip-bg) px-3 py-1.5 text-[11px] font-bold text-(--app-brand)">
            <span className="size-2 rounded-full bg-[#0a6cc4]" />
            Sales {formatDashboardMoney(salesTotal)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-(--app-chip-amber-bg) px-3 py-1.5 text-[11px] font-bold text-(--app-chip-amber-text)">
            <span className="size-2 rotate-45 bg-[#f59e0b]" />
            Expenses {formatDashboardMoney(expenseTotal)}
          </span>
        </div>
      </div>

      {maximum === 0 ? (
        <PanelEmpty
          title="No chart activity"
          description="There are no completed-delivery sales or recorded expenses in this coverage."
          icon={<BarChart3 aria-hidden="true" />}
        />
      ) : (
        <div className="overflow-x-auto px-3 pb-3 sm:px-4">
          <svg
            className="h-56 min-w-full"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-labelledby="sales-expenses-chart-title sales-expenses-chart-description"
          >
            <title id="sales-expenses-chart-title">
              Sales versus expenses
            </title>
            <desc id="sales-expenses-chart-description">
              {displayedBuckets
                .map(
                  (bucket) =>
                    `${bucket.label}: ${formatDashboardMoney(bucket.sales)} sales and ${formatDashboardMoney(bucket.expenses)} expenses`,
                )
                .join('. ')}
            </desc>
            {[0, 0.5, 1].map((ratio) => {
              const y = plotTop + plotHeight * ratio
              return (
                <line
                  key={ratio}
                  x1="0"
                  x2={chartWidth}
                  y1={y}
                  y2={y}
                  stroke="var(--app-border)"
                  strokeDasharray="4 5"
                />
              )
            })}
            {displayedBuckets.map((bucket, index) => {
              const salesHeight = (bucket.sales / maximum) * plotHeight
              const expenseHeight = (bucket.expenses / maximum) * plotHeight
              const center = groupWidth * index + groupWidth / 2
              return (
                <g key={bucket.key}>
                  <rect
                    x={center - barWidth - 2}
                    y={plotBottom - salesHeight}
                    width={barWidth}
                    height={salesHeight}
                    rx="4"
                    fill="#0a6cc4"
                    tabIndex={0}
                    aria-label={`${bucket.label} sales ${formatDashboardMoney(bucket.sales)}`}
                  >
                    <title>
                      {bucket.label} sales:{' '}
                      {formatDashboardMoney(bucket.sales)}
                    </title>
                  </rect>
                  <rect
                    x={center + 2}
                    y={plotBottom - expenseHeight}
                    width={barWidth}
                    height={expenseHeight}
                    rx="2"
                    fill="#f59e0b"
                    tabIndex={0}
                    aria-label={`${bucket.label} expenses ${formatDashboardMoney(bucket.expenses)}`}
                  >
                    <title>
                      {bucket.label} expenses:{' '}
                      {formatDashboardMoney(bucket.expenses)}
                    </title>
                  </rect>
                  <text
                    x={center}
                    y="207"
                    textAnchor="middle"
                    fill="var(--app-text-soft)"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {bucket.label.replace(/^[A-Za-z]{3} /, '')}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      <table className="sr-only">
        <caption>Sales and expenses values by date</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Delivery sales</th>
            <th scope="col">Expenses</th>
          </tr>
        </thead>
        <tbody>
          {displayedBuckets.map((bucket) => (
            <tr key={bucket.key}>
              <th scope="row">{bucket.label}</th>
              <td>{formatDashboardMoney(bucket.sales)}</td>
              <td>{formatDashboardMoney(bucket.expenses)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
  )
}

export function SalesMixChart({ items }: { items: DashboardSalesMixItem[] }) {
  const refill = items.find((item) => item.kind === 'refill_service')
  const stocked = items.find(
    (item) => item.kind === 'stock_tracked_product',
  )
  const total = (refill?.revenue ?? 0) + (stocked?.revenue ?? 0)
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const refillLength = ((refill?.percentage ?? 0) / 100) * circumference
  const stockedLength = ((stocked?.percentage ?? 0) / 100) * circumference

  return (
    <PanelShell
      title="Sales mix"
      description="Revenue by delivery-item classification"
    >
      {total === 0 ? (
        <PanelEmpty
          title="No sales mix yet"
          description="Completed delivery items will appear here once this coverage has sales."
          icon={<PieChart aria-hidden="true" />}
        />
      ) : (
        <div className="flex flex-col items-center px-5 py-5">
          <svg
            className="size-40"
            viewBox="0 0 120 120"
            role="img"
            aria-label={`Sales mix: ${Math.round(refill?.percentage ?? 0)} percent refill services and ${Math.round(stocked?.percentage ?? 0)} percent stock-tracked products`}
          >
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--app-border)"
              strokeWidth="14"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#0a6cc4"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${refillLength} ${circumference}`}
              transform="rotate(-90 60 60)"
            >
              <title>
                Refill services {Math.round(refill?.percentage ?? 0)}%
              </title>
            </circle>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${stockedLength} ${circumference}`}
              strokeDashoffset={-refillLength}
              transform="rotate(-90 60 60)"
            >
              <title>
                Stock-tracked products {Math.round(stocked?.percentage ?? 0)}%
              </title>
            </circle>
            <text
              x="60"
              y="56"
              textAnchor="middle"
              fill="var(--app-text-soft)"
              fontSize="8"
              fontWeight="600"
            >
              TOTAL
            </text>
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fill="var(--app-text)"
              fontSize="12"
              fontWeight="800"
            >
              {formatDashboardCompactMoney(total)}
            </text>
          </svg>

          <div className="mt-4 w-full border-t border-(--app-border) pt-4">
            <MixLegendRow
              markerClass="rounded-full bg-[#0a6cc4]"
              label="Refill services"
              revenue={refill?.revenue ?? 0}
              percentage={refill?.percentage ?? 0}
            />
            <MixLegendRow
              markerClass="rotate-45 bg-[#22c55e]"
              label="Stock-tracked products"
              revenue={stocked?.revenue ?? 0}
              percentage={stocked?.percentage ?? 0}
              className="mt-3"
            />
          </div>
        </div>
      )}
    </PanelShell>
  )
}

function MixLegendRow({
  markerClass,
  label,
  revenue,
  percentage,
  className,
}: {
  markerClass: string
  label: string
  revenue: number
  percentage: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={`size-2.5 shrink-0 ${markerClass}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-(--app-text)">
          {label}
        </p>
        <p className="text-[10px] text-(--app-text-soft)">
          {formatDashboardMoney(revenue)}
        </p>
      </div>
      <span className="text-xs font-extrabold text-(--app-text)">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}

function TopProductsPanel({
  products,
}: {
  products: DashboardTopProduct[]
}) {
  return (
    <PanelShell
      title="Top five products"
      description="Ranked by units sold, then revenue and product name"
    >
      {products.length === 0 ? (
        <PanelEmpty
          title="No top products in this coverage"
          description="Products appear after delivery items are completed in the selected period."
          icon={<PackageSearch aria-hidden="true" />}
        />
      ) : (
        <ol className="divide-y divide-(--app-border) px-4 sm:px-5">
          {products.map((product) => (
            <li
              key={product.productId}
              className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3 py-3.5 sm:grid-cols-[32px_minmax(150px,0.8fr)_minmax(160px,1fr)_100px]"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-(--app-chip-bg) text-xs font-extrabold text-(--app-brand)">
                {product.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-(--app-text)">
                  {product.productName}
                </p>
                <p className="mt-0.5 text-[11px] text-(--app-text-soft)">
                  {formatDashboardQuantity(product.units)} units
                </p>
              </div>
              <svg
                className="col-start-2 h-2 w-full sm:col-start-auto"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${Math.round(product.relativePercentage)} percent relative to the leading product`}
              >
                <rect
                  x="0"
                  y="1"
                  width="100"
                  height="6"
                  rx="3"
                  fill="var(--app-border)"
                />
                <rect
                  x="0"
                  y="1"
                  width={Math.max(0, Math.min(100, product.relativePercentage))}
                  height="6"
                  rx="3"
                  fill="#0a6cc4"
                />
              </svg>
              <p className="col-start-2 text-left text-[13px] font-extrabold text-(--app-text) sm:col-start-auto sm:text-right">
                {formatDashboardMoney(product.revenue)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </PanelShell>
  )
}
