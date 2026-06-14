'use client'

import { useMemo, useState } from 'react'
import { Droplets, Search, UsersRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Customer } from '../customers.types'
import { useCustomers } from '../hooks/use-customers'
import { CustomersTable } from './customers-table'
import { CreateCustomerDialog } from './create-customer-dialog'

type CustomerTypeFilter = 'all' | 'business' | 'individual'
const EMPTY_CUSTOMERS: Customer[] = []

export function CustomersPage() {
  const { data: customers, isPending, isError, error } = useCustomers()
  const customerList = customers ?? EMPTY_CUSTOMERS
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>('all')

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return customerList.filter((customer) => {
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'business' && customer.isBusiness) ||
        (typeFilter === 'individual' && !customer.isBusiness)

      const searchableText = [
        customer.name,
        customer.contactNumber,
        customer.fullAddress,
        customer.barangay,
        customer.municipality,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesType && searchableText.includes(normalizedSearch)
    })
  }, [customerList, searchQuery, typeFilter])

  const businessCount = customerList.filter(
    (customer) => customer.isBusiness
  ).length
  const individualCount = customerList.length - businessCount

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-2xl border border-[#ddebff] bg-white shadow-[0_8px_24px_rgba(0,48,73,0.08)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(0,180,216,0.18),transparent_30%),radial-gradient(circle_at_92%_20%,rgba(0,245,212,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bdefff] bg-[#eef7ff]/80 px-3 py-1 text-sm font-semibold text-[#00677d]">
                <Droplets className="size-4" aria-hidden="true" />
                Active refill customers
              </div>
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#001d34] sm:text-4xl">
                  Customers
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#2a4b6a] sm:text-base">
                  Keep household and business refill accounts easy to scan for
                  delivery calls, address checks, and daily route preparation.
                </p>
              </div>
            </div>
            <CreateCustomerDialog />
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <CustomerMetricCard
          label="Active records"
          value={customerList.length}
          description="Customers available for refill and delivery work"
        />
        <CustomerMetricCard
          label="Business accounts"
          value={businessCount}
          description="Offices, shops, and recurring commercial orders"
        />
        <CustomerMetricCard
          label="Household accounts"
          value={individualCount}
          description="Individual delivery and pickup customers"
        />
      </div>

      <div className="rounded-2xl border border-[#ddebff] bg-white/90 p-4 shadow-[0_8px_24px_rgba(0,48,73,0.08)] backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6d797e]"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search name, phone, barangay, or route area"
              className="h-11 rounded-md border-[#ddebff] bg-[#f0f7ff]/70 pl-9 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-4 focus-visible:ring-[#00b4d8]/20 transition-all duration-200"
              aria-label="Search customers"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <CustomerFilterButton
              active={typeFilter === 'all'}
              onClick={() => setTypeFilter('all')}
            >
              All
            </CustomerFilterButton>
            <CustomerFilterButton
              active={typeFilter === 'business'}
              onClick={() => setTypeFilter('business')}
            >
              Business
            </CustomerFilterButton>
            <CustomerFilterButton
              active={typeFilter === 'individual'}
              onClick={() => setTypeFilter('individual')}
            >
              Household
            </CustomerFilterButton>
          </div>
        </div>
      </div>

      {isPending ? (
        <CustomersLoadingState />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error.message}
        </div>
      ) : customerList.length === 0 ? (
        <CustomersEmptyState />
      ) : filteredCustomers.length === 0 ? (
        <CustomersNoResultsState />
      ) : (
        <CustomersTable customers={filteredCustomers} />
      )}
    </section>
  )
}

type CustomerMetricCardProps = {
  label: string
  value: number
  description: string
}

function CustomerMetricCard({
  label,
  value,
  description,
}: CustomerMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#ddebff] bg-white/85 p-5 shadow-[0_8px_24px_rgba(0,48,73,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2a4b6a]">{label}</p>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-[#001d34]">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
          <UsersRound className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[#2a4b6a]">{description}</p>
    </article>
  )
}

type CustomerFilterButtonProps = {
  active: boolean
  children: string
  onClick: () => void
}

function CustomerFilterButton({
  active,
  children,
  onClick,
}: CustomerFilterButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'rounded-md border border-[#ddebff] bg-white px-3 text-[#2a4b6a] transition-all duration-200 hover:bg-[#f0f7ff] hover:text-[#00414f]',
        active &&
          'border-[#00b4d8] bg-[#00b4d8] text-white shadow-[0_8px_24px_rgba(0,180,216,0.22)] hover:bg-[#00b4d8] hover:text-white'
      )}
    >
      {children}
    </Button>
  )
}

function CustomersLoadingState() {
  return (
    <div className="rounded-2xl border border-[#ddebff] bg-white/90 p-4 shadow-[0_8px_24px_rgba(0,48,73,0.08)]">
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl bg-[#eef7ff]/70 p-4 md:grid-cols-[1.3fr_0.9fr_1.4fr_auto]"
          >
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white md:w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomersEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#ddebff] bg-[#f0f7ff]/70 p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-[0_8px_24px_rgba(0,48,73,0.08)]">
        <Droplets className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-[#001d34]">
        No customers yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#2a4b6a]">
        Add the first refill customer so staff can keep phone numbers,
        addresses, and account type in one place.
      </p>
    </div>
  )
}

function CustomersNoResultsState() {
  return (
    <div className="rounded-2xl border border-[#ddebff] bg-white p-8 text-center shadow-[0_8px_24px_rgba(0,48,73,0.08)]">
      <h2 className="font-heading text-lg font-semibold text-[#001d34]">
        No matching customers
      </h2>
      <p className="mt-2 text-sm text-[#2a4b6a]">
        Try a different name, phone number, barangay, or customer type.
      </p>
    </div>
  )
}
