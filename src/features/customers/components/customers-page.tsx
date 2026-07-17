'use client'

import { useEffect, useState } from 'react'

import { useCustomers, useCustomerStats } from '../hooks/use-customers'
import { CustomersTable } from './customers-table'
import { CreateCustomerDialog } from './create-customer-dialog'

type CustomerDirectoryFilter = 'all' | 'business' | 'household' | 'inactive'
const PER_PAGE = 6

const FILTERS: ReadonlyArray<{ key: CustomerDirectoryFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'business', label: 'Business' },
  { key: 'household', label: 'Household' },
  { key: 'inactive', label: 'Inactive' },
]

const DropIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14.5a5 5 0 0 0 10 0c0-2.4-2-4.6-5-8-3 3.4-5 5.6-5 8Z" /></svg>
)

export function CustomersPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [directoryFilter, setDirectoryFilter] = useState<CustomerDirectoryFilter>('all')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [search])

  const { data, isPending, isError, error, isFetching } = useCustomers({
    archived: false,
    search: debouncedSearch,
    type: directoryFilter === 'business' || directoryFilter === 'household' ? directoryFilter : 'all',
    status: directoryFilter === 'inactive' ? 'inactive' : 'active',
    page,
    perPage: PER_PAGE,
  })
  const statsQuery = useCustomerStats()
  const customers = data?.rows ?? []
  const total = data?.total ?? 0
  const stats = statsQuery.data ?? { total: 0, business: 0, household: 0 }

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const pageStart = total === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
  const pageEnd = Math.min(safePage * PER_PAGE, total)

  function setFilter(next: CustomerDirectoryFilter) {
    setDirectoryFilter(next)
    setPage(1)
  }

  function clearSearch() {
    setSearch('')
    setDirectoryFilter('all')
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-[1800px] px-7 pb-14 pt-[26px]">
      {/* header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <div className="mb-[9px] inline-flex items-center gap-[7px] text-xs font-bold uppercase tracking-[0.06em] text-[var(--app-brand)]">
            {DropIcon}
            Refill accounts directory
          </div>
          <h1 className="mb-[7px] text-[29px] font-extrabold tracking-[-0.025em] text-[var(--app-text)]">Customers</h1>
          <p className="max-w-[560px] text-[14.5px] leading-[1.55] text-[var(--app-text-muted)]">
            Manage household and business refill accounts — contact details, delivery addresses, and route stops in one clean directory.
          </p>
        </div>
        <AddButton onClick={() => setCreating(true)} />
      </div>

      {/* stat cards */}
      <div className="mb-[18px] grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
        <StatCard label="Total customers" value={stats.total} helper="Across all active refill accounts" accentClass="border-l-[#0a6cc4]" glowClass="bg-sky-400/16" waveClass="fill-sky-400/16" iconClass="bg-[var(--app-chip-bg)] text-[var(--app-brand)]" icon={DropIcon} />
        <StatCard label="Business accounts" value={stats.business} helper="Offices, shops & commercial orders" accentClass="border-l-sky-400" glowClass="bg-sky-400/14" waveClass="fill-sky-400/14" iconClass="bg-[var(--app-chip-bg)] text-[var(--app-brand)]" icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" /><path d="M15 9h2a2 2 0 0 1 2 2v10" /><path d="M9 7h2M9 11h2M9 15h2" /><path d="M4 21h16" /></svg>} />
        <StatCard label="Households" value={stats.household} helper="Individual delivery customers" accentClass="border-l-green-500" glowClass="bg-green-500/14" waveClass="fill-green-500/14" iconClass="bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]" icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>} />
      </div>

      {/* directory card */}
      <div className="overflow-hidden rounded-[20px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)]">
        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-b border-[var(--app-border)] px-[18px] py-4">
          <div className="relative min-w-[230px] max-w-[420px] flex-1">
            <span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[var(--app-text-faint)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer name"
              aria-label="Search customers"
              className="w-full rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-surface-2)] py-2.5 pl-[39px] pr-3.5 text-sm text-[var(--app-text)] outline-none"
            />
          </div>
          <div className="inline-flex gap-[3px] rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-2)] p-1">
            {FILTERS.map((filter) => {
              const on = directoryFilter === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setFilter(filter.key)}
                  className={on
                    ? 'cursor-pointer rounded-[9px] border-0 bg-[var(--app-surface)] px-4 py-2 text-[13.5px] font-bold text-[var(--app-brand)] shadow-[0_1px_4px_rgba(14,108,196,0.16)]'
                    : 'cursor-pointer rounded-[9px] border-0 bg-transparent px-4 py-2 text-[13.5px] font-semibold text-[var(--app-text-soft)]'}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {isPending || statsQuery.isPending ? (
          <LoadingState />
        ) : isError || statsQuery.isError ? (
          <ErrorState
            message={
              error?.message ??
              statsQuery.error?.message ??
              'Unable to load customers.'
            }
          />
        ) : stats.total === 0 && directoryFilter !== 'inactive' ? (
          <EmptyState onAdd={() => setCreating(true)} />
        ) : total === 0 ? (
          <NoResultsState onClear={clearSearch} />
        ) : (
          <>
            <CustomersTable customers={customers} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] px-[22px] py-3.5 text-[13px] text-[var(--app-text-soft)]">
              <span>
                Showing <strong className="font-semibold text-[var(--app-text)]">{pageStart}–{pageEnd}</strong> of {total} customers
                {isFetching ? ' · updating…' : ''}
              </span>
              {pageCount > 1 ? (
                <Pager page={safePage} pageCount={pageCount} onPage={setPage} />
              ) : null}
            </div>
          </>
        )}
      </div>

      <CreateCustomerDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex flex-none cursor-pointer items-center gap-[9px] rounded-xl border-0 bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-[21px] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_22px_rgba(14,108,196,0.28)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      Add Customer
    </button>
  )
}

interface StatCardProps {
  label: string
  value: number
  helper: string
  accentClass: string
  glowClass: string
  waveClass: string
  iconClass: string
  icon: React.ReactNode
}

function StatCard({ label, value, helper, accentClass, glowClass, waveClass, iconClass, icon }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-l-[3px] border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-[15px] shadow-[var(--app-shadow-card)] ${accentClass}`}>
      <div className={`pointer-events-none absolute -right-5 -top-[22px] h-[86px] w-[86px] rounded-full blur-xl ${glowClass}`} />
      <div className="pointer-events-none absolute -bottom-px left-0 right-0 leading-none opacity-60">
        <svg viewBox="0 0 320 36" width="100%" height="20" preserveAspectRatio="none"><path d="M0 20 C50 6 92 30 160 20 C224 11 272 28 320 16 L320 36 L0 36 Z" className={waveClass} /></svg>
      </div>
      <div className="relative flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--app-text-faint)]">{label}</div>
          <div className="mt-2 text-[26px] font-extrabold leading-none tracking-[-0.03em] text-[var(--app-text)]">{value}</div>
        </div>
        <div className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[11px] ${iconClass}`}>{icon}</div>
      </div>
      <div className="relative mt-2 text-xs text-[var(--app-text-soft)]">{helper}</div>
    </div>
  )
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-muted)] disabled:text-[var(--app-text-faint)]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => {
        const on = n === page
        return (
          <button key={n} type="button" onClick={() => onPage(n)} className={on ? 'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-brand-soft)] bg-[var(--app-chip-bg)] px-[7px] text-[13px] font-bold text-[var(--app-brand)]' : 'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-[7px] text-[13px] font-medium text-[var(--app-text-muted)]'}>
            {n}
          </button>
        )
      })}
      <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPage(page + 1)} className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[9px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-muted)] disabled:text-[var(--app-text-faint)]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-[18px]">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="mb-2.5 h-14 animate-pulse rounded-xl bg-[var(--app-surface-2)]" />
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="m-[18px] rounded-[14px] border border-red-600/30 bg-red-600/6 px-[18px] py-4 text-sm text-red-600">
      {message}
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="px-6 py-[58px] text-center">
      <div className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center rounded-[18px] bg-[var(--app-surface-2)] text-[var(--app-text-faint)]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
      </div>
      <div className="mb-1.5 text-[17px] font-bold text-[var(--app-text)]">No matching customers</div>
      <p className="mb-[18px] text-sm text-[var(--app-text-muted)]">Try a different name, phone number, or barangay — or clear the filters to see everyone.</p>
      <button type="button" onClick={onClear} className="inline-flex cursor-pointer items-center gap-2 rounded-[11px] border border-[var(--app-border-strong)] bg-[var(--app-surface)] px-[18px] py-2.5 text-[13.5px] font-semibold text-[var(--app-brand)]">Clear search &amp; filters</button>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="px-6 py-[58px] text-center">
      <div className="mx-auto mb-[18px] flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-[var(--app-chip-bg)] text-[var(--app-brand)]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14.5a5 5 0 0 0 10 0c0-2.4-2-4.6-5-8-3 3.4-5 5.6-5 8Z" /></svg>
      </div>
      <div className="mb-1.5 text-lg font-bold text-[var(--app-text)]">No customers yet</div>
      <p className="mx-auto mb-[18px] max-w-[360px] text-sm text-[var(--app-text-muted)]">Add your first refill customer to start tracking deliveries, container returns, and route stops.</p>
      <button type="button" onClick={onAdd} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-0 bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-[22px] py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,108,196,0.3)]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add Customer
      </button>
    </div>
  )
}
