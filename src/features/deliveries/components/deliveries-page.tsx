'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, Search, Truck } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { useCustomers } from '@/features/customers/hooks/use-customers'
import { useProducts } from '@/features/products/hooks/use-products'
import { useDeliveries } from '../hooks/use-deliveries'
import type { Delivery, DeliveryStatus } from '../deliveries.types'
import { CreateDeliveryDialog } from './create-delivery-dialog'
import { DeliveriesTable } from './deliveries-table'

const EMPTY_DELIVERIES: Delivery[] = []
const DELIVERY_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'for_delivery', label: 'For delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
] as const
const DATE_SORT_OPTIONS = [
  { value: 'oldest', label: 'Oldest first' },
  { value: 'latest', label: 'Latest first' },
] as const

type DeliveryStatusFilter = DeliveryStatus | 'all'
type DeliveryDateSort = (typeof DATE_SORT_OPTIONS)[number]['value']

export function DeliveriesPage() {
  const deliveriesQuery = useDeliveries()
  const customersQuery = useCustomers()
  const productsQuery = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<DeliveryStatusFilter>('pending')
  const [dateSort, setDateSort] = useState<DeliveryDateSort>('oldest')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const deliveries = deliveriesQuery.data ?? EMPTY_DELIVERIES
  const filteredDeliveries = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return deliveries
      .filter((delivery) =>
        statusFilter === 'all' ? true : delivery.status === statusFilter,
      )
      .filter((delivery) => {
        if (!normalizedSearch) return true

        return (
          delivery.deliveryDate.includes(normalizedSearch) ||
          delivery.status.replace('_', ' ').includes(normalizedSearch) ||
          (delivery.notes?.toLowerCase().includes(normalizedSearch) ?? false) ||
          delivery.items.some((item) =>
            item.productName.toLowerCase().includes(normalizedSearch),
          )
        )
      })
      .sort((first, second) => {
        const comparison = first.deliveryDate.localeCompare(second.deliveryDate)
        return dateSort === 'oldest' ? comparison : -comparison
      })
  }, [dateSort, deliveries, searchQuery, statusFilter])

  const isReferenceLoading = customersQuery.isPending || productsQuery.isPending
  const referenceError = customersQuery.error ?? productsQuery.error

  useEffect(() => {
    if (!toastMessage) return

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null)
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-[#001d34] sm:text-3xl">
            Deliveries
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#2a4b6a]">
            Prepare and track refill delivery runs.
          </p>
        </div>
        <CreateDeliveryDialog
          customers={customersQuery.data ?? []}
          products={productsQuery.data ?? []}
          disabled={isReferenceLoading || Boolean(referenceError)}
          onCreated={() => setToastMessage('Delivery created successfully.')}
        />
      </div>

      {toastMessage ? <DeliveryToast message={toastMessage} /> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <DeliveryMetricCard
          label="Active deliveries"
          value={deliveries.length}
          description="Runs visible in the shared station queue"
        />
        <DeliveryMetricCard
          label="Pending"
          value={
            deliveries.filter((delivery) => delivery.status === 'pending').length
          }
          description="Runs waiting for preparation"
        />
        <DeliveryMetricCard
          label="Reference data"
          value={
            (customersQuery.data?.length ?? 0) +
            (productsQuery.data?.length ?? 0)
          }
          description="Customers and products ready for new deliveries"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white/95 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
        <div className="border-b border-[#dcecff] bg-[#eef7ff]/70 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-sm">
                <Truck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-[#001d34]">
                  Delivery queue
                </h2>
                <p className="text-sm text-[#2a4b6a]">
                  One-time delivery runs ready for preparation and dispatch.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px_150px] lg:min-w-[620px]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6d797e]"
                  aria-hidden="true"
                />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search deliveries..."
                  className="h-10 rounded-xl border-[#dcecff] bg-white pl-9 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
                  aria-label="Search deliveries"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as DeliveryStatusFilter)
                }
                className="h-10 rounded-xl border border-[#dcecff] bg-white px-3 text-sm font-medium text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
                aria-label="Filter deliveries by status"
              >
                {DELIVERY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={dateSort}
                onChange={(event) =>
                  setDateSort(event.target.value as DeliveryDateSort)
                }
                className="h-10 rounded-xl border border-[#dcecff] bg-white px-3 text-sm font-medium text-[#001d34] outline-none focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20"
                aria-label="Sort deliveries by date"
              >
                {DATE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {referenceError ? (
          <ErrorState message={referenceError.message} />
        ) : deliveriesQuery.isPending || isReferenceLoading ? (
          <DeliveriesLoadingState />
        ) : deliveriesQuery.isError ? (
          <ErrorState message={deliveriesQuery.error.message} />
        ) : deliveries.length === 0 ? (
          <DeliveriesEmptyState />
        ) : filteredDeliveries.length === 0 ? (
          <DeliveriesNoResultsState
            statusFilter={statusFilter}
            searchQuery={searchQuery}
          />
        ) : (
          <DeliveriesTable deliveries={filteredDeliveries} />
        )}
      </div>
    </section>
  )
}

function DeliveryToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-[#00f5d4]/30 bg-white px-4 py-3 text-sm font-semibold text-[#005144] shadow-[0_18px_44px_rgba(0,48,73,0.16)]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#00f5d4]/15 text-[#006b5b]">
        <CheckCircle2 className="size-4" aria-hidden="true" />
      </span>
      {message}
    </div>
  )
}

function DeliveryMetricCard({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white/85 p-4 shadow-[0_12px_32px_rgba(0,48,73,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2a4b6a]">{label}</p>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-[#001d34]">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
          <Truck className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[#2a4b6a]">{description}</p>
    </article>
  )
}

function DeliveriesLoadingState() {
  return (
    <div className="p-3">
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl bg-[#eef7ff]/70 p-4 md:grid-cols-[0.8fr_1.5fr_0.7fr_0.7fr_1fr]"
          >
            {Array.from({ length: 5 }, (__, cellIndex) => (
              <div
                key={cellIndex}
                className="h-10 animate-pulse rounded-xl bg-white"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DeliveriesEmptyState() {
  return (
    <div className="p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-[0_12px_32px_rgba(0,48,73,0.08)]">
        <CalendarDays className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-[#001d34]">
        No deliveries yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#2a4b6a]">
        Create the first one-time delivery for a customer or guest recipient.
      </p>
    </div>
  )
}

function DeliveriesNoResultsState({
  statusFilter,
  searchQuery,
}: {
  statusFilter: DeliveryStatusFilter
  searchQuery: string
}) {
  const statusLabel =
    DELIVERY_STATUS_OPTIONS.find((option) => option.value === statusFilter)
      ?.label ?? 'Selected status'

  return (
    <div className="p-8 text-center">
      <h2 className="font-heading text-lg font-semibold text-[#001d34]">
        No matching deliveries
      </h2>
      <p className="mt-2 text-sm text-[#2a4b6a]">
        {searchQuery.trim()
          ? `No ${statusLabel.toLowerCase()} deliveries match that search.`
          : `No ${statusLabel.toLowerCase()} deliveries are available right now.`}
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="m-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {message}
    </div>
  )
}
