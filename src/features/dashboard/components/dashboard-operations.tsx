import Link from 'next/link'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  ArrowRight,
  CircleCheck,
  PackageCheck,
  Route,
  TriangleAlert,
  Wrench,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type {
  DashboardDeliveryQueueItem,
  DashboardLowStockItem,
  DashboardMaintenanceItem,
  DashboardOperations,
} from '../dashboard.types'
import {
  formatDeliveryStatus,
  formatMaintenanceDueDate,
} from '../dashboard.view'
import {
  DashboardPanelSkeleton,
  ErrorPanel,
  PanelEmpty,
  PanelShell,
  SectionNotice,
} from './dashboard-ui'

type DashboardOperationsSectionProps = {
  query: UseQueryResult<DashboardOperations, Error>
  referenceDate: string
}

export function DashboardOperationsSection({
  query,
  referenceDate,
}: DashboardOperationsSectionProps) {
  if (query.isPending && !query.data) {
    return (
      <section aria-label="Loading station operations" className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        <DashboardPanelSkeleton />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <DashboardPanelSkeleton compact />
          <DashboardPanelSkeleton compact />
        </div>
      </section>
    )
  }

  if (query.isError && !query.data) {
    return (
      <ErrorPanel
        title="Station operations are unavailable"
        message={query.error.message}
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (!query.data) return null

  return (
    <section aria-label="Station operations" className="flex flex-col gap-4">
      {query.isError ? (
        <ErrorPanel
          title="Station operations may be out of date"
          message={query.error.message}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {!query.data.hasAnyOperationalActivity ? (
        <SectionNotice
          title="Your operations board is ready"
          description="Create a product, delivery, or maintenance schedule to populate today’s station cockpit."
        />
      ) : null}

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        <DeliveryQueuePanel deliveries={query.data.deliveryQueue} />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <LowStockPanel products={query.data.lowStock} />
          <MaintenancePanel
            tasks={query.data.maintenanceDue}
            referenceDate={referenceDate}
          />
        </div>
      </div>
    </section>
  )
}

function PanelLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className="shrink-0 border-(--app-border-strong) bg-(--app-surface-2) text-(--app-brand) hover:bg-(--app-chip-bg) hover:text-(--app-brand)"
    >
      <Link href={href}>
        {label}
        <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </Link>
    </Button>
  )
}

export function DeliveryQueuePanel({
  deliveries,
}: {
  deliveries: DashboardDeliveryQueueItem[]
}) {
  return (
    <PanelShell
      title="Today’s delivery queue"
      description="Current stops ordered with unfinished work first"
      action={<PanelLink href="/deliveries" label="View deliveries" />}
    >
      {deliveries.length === 0 ? (
        <PanelEmpty
          title="No deliveries scheduled today"
          description="New or recurring delivery occurrences for today will appear here."
          icon={<Route aria-hidden="true" />}
        />
      ) : (
        <ul className="divide-y divide-(--app-border)">
          {deliveries.map((delivery) => (
            <li
              key={delivery.deliveryId}
              className="flex items-center gap-3 px-4 py-3.5 sm:px-5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--app-chip-bg) text-xs font-extrabold text-(--app-brand)">
                {initialsFor(delivery.recipient)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-(--app-text)">
                  {delivery.recipient}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-(--app-text-soft)">
                  {delivery.itemSummary}
                  {delivery.assignee ? ` • ${delivery.assignee}` : ''}
                </p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold',
                  deliveryStatusClass(delivery.status),
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {formatDeliveryStatus(delivery.status)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

export function LowStockPanel({ products }: { products: DashboardLowStockItem[] }) {
  return (
    <PanelShell
      title="Low Stock"
      description="Stock-tracked products at 10 units or fewer"
      action={<PanelLink href="/products" label="Products" />}
    >
      {products.length === 0 ? (
        <PanelEmpty
          title="Stock levels look healthy"
          description="No active stock-tracked product is currently at or below the alert threshold."
          icon={<PackageCheck aria-hidden="true" />}
        />
      ) : (
        <ul className="flex flex-col gap-3 p-4 sm:p-5">
          {products.map((product) => {
            const isOut = product.stock === 0
            const percentage = Math.min(100, (product.stock / 10) * 100)
            return (
              <li key={product.productId}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="truncate text-xs font-semibold text-(--app-text)">
                    {product.productName}
                  </p>
                  <span
                    className={cn(
                      'shrink-0 text-[11px] font-extrabold',
                      isOut
                        ? 'text-(--app-chip-red-text)'
                        : 'text-(--app-chip-amber-text)',
                    )}
                  >
                    {isOut ? 'Out' : `${product.stock} left`}
                  </span>
                </div>
                <svg
                  className="h-1.5 w-full"
                  viewBox="0 0 100 6"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`${product.productName} has ${product.stock} units in stock`}
                >
                  <rect
                    width="100"
                    height="6"
                    rx="3"
                    fill="var(--app-border)"
                  />
                  <rect
                    width={percentage}
                    height="6"
                    rx="3"
                    fill={isOut ? '#ef4444' : '#f59e0b'}
                  />
                </svg>
              </li>
            )
          })}
        </ul>
      )}
    </PanelShell>
  )
}

export function MaintenancePanel({
  tasks,
  referenceDate,
}: {
  tasks: DashboardMaintenanceItem[]
  referenceDate: string
}) {
  return (
    <PanelShell
      title="Maintenance Due"
      description="Overdue or due within the next seven days"
      action={<PanelLink href="/maintenances" label="Maintenance" />}
    >
      {tasks.length === 0 ? (
        <PanelEmpty
          title="No maintenance due soon"
          description="Pending maintenance work will surface here as its due date approaches."
          icon={<CircleCheck aria-hidden="true" />}
        />
      ) : (
        <ul className="divide-y divide-(--app-border)">
          {tasks.map((task) => (
            <li
              key={task.taskId}
              className="flex items-center gap-3 px-4 py-3 sm:px-5"
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-[10px]',
                  task.isOverdue
                    ? 'bg-(--app-chip-red-bg) text-(--app-chip-red-text)'
                    : 'bg-(--app-chip-bg) text-(--app-brand)',
                )}
              >
                {task.isOverdue ? (
                  <TriangleAlert className="size-4" aria-hidden="true" />
                ) : (
                  <Wrench className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-(--app-text)">
                  {task.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-(--app-text-soft)">
                  {task.equipment}
                  {task.assignee ? ` • ${task.assignee}` : ''}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-right text-[10px] font-extrabold',
                  task.isOverdue
                    ? 'text-(--app-chip-red-text)'
                    : 'text-(--app-brand)',
                )}
              >
                {formatMaintenanceDueDate(
                  task.dueDate,
                  referenceDate,
                  task.isOverdue,
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  )
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

function deliveryStatusClass(
  status: DashboardDeliveryQueueItem['status'],
): string {
  switch (status) {
    case 'completed':
      return 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)'
    case 'for_delivery':
      return 'bg-(--app-chip-violet-bg) text-(--app-chip-violet-text)'
    case 'failed':
    case 'cancelled':
      return 'bg-(--app-chip-red-bg) text-(--app-chip-red-text)'
    case 'pending':
      return 'bg-(--app-chip-gray-bg) text-(--app-chip-gray-text)'
  }
}
