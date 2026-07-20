'use client'

import { useEffect, useState } from 'react'

import { AquaProgressBar, AquaSkeleton } from '@/components/app/loading'
import { cn } from '@/lib/utils'

import { useProductActor } from '../hooks/use-product-actor'
import { useProducts, useProductStats } from '../hooks/use-products'
import { LOW_STOCK_THRESHOLD } from '../products.constants'
import type { Product } from '../products.types'
import { CreateProductDialog } from './create-product-dialog'
import { ProductsGrid } from './products-table'

type ProductFilter = 'all' | 'refillable' | 'stocked' | 'discontinued'
type StatTone = 'brand' | 'green' | 'amber' | 'red'

const EMPTY_PRODUCTS: Product[] = []
const PER_PAGE = 10

const FILTERS: ReadonlyArray<{ key: ProductFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'refillable', label: 'Refill services' },
  { key: 'stocked', label: 'Bottled / stocked' },
  { key: 'discontinued', label: 'Discontinued' },
]

export function ProductsPage() {
  const actor = useProductActor()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filter, setFilter] = useState<ProductFilter>('all')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const productsQuery = useProducts({ deleted: false, search: debouncedSearch, category: filter, page, perPage: PER_PAGE })
  const statsQuery = useProductStats()
  const products = productsQuery.data?.products ?? EMPTY_PRODUCTS
  const total = productsQuery.data?.total ?? 0
  const metrics = statsQuery.data ?? { total: 0, active: 0, stockTracked: 0, low: 0, out: 0 }
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const pageStart = total === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
  const pageEnd = Math.min(safePage * PER_PAGE, total)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(id)
  }, [search])

  function chooseFilter(next: ProductFilter) {
    setFilter(next)
    setPage(1)
  }

  function pct(part: number, whole: number): string {
    return `${Math.min(100, Math.round((part / Math.max(whole, 1)) * 100))}%`
  }

  return (
    <div className="mx-auto max-w-450 px-7 pt-6.5 pb-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-2.25 text-xs font-bold tracking-[0.08em] text-(--app-brand) uppercase">Catalog &amp; inventory</div>
          <h1 className="mb-1.75 text-[29px] font-extrabold tracking-[-0.025em] text-(--app-text)">Products</h1>
          <p className="max-w-140 text-[14.5px] leading-[1.55] text-(--app-text-muted)">
            Manage your refill services and bottled-water stock in one place — prices, inventory levels, and what&rsquo;s available today.
          </p>
        </div>
        <AddButton onClick={() => setCreating(true)} />
      </div>

      {statusMessage ? (
        <div role="status" className="mb-4.5 rounded-xl bg-(--app-chip-green-bg) px-3.5 py-2.5 text-[13.5px] font-semibold text-(--app-chip-green-text)">
          {statusMessage}
        </div>
      ) : null}

      <div className="mb-4.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
        <StatCard
          label="Total products"
          value={metrics.total}
          helper="In your catalog"
          tone="brand"
          barWidth="100%"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c3.5 4.5 5.5 7 5.5 9.8a5.5 5.5 0 1 1-11 0C6.5 10 8.5 7.5 12 3Z" /></svg>}
        />
        <StatCard
          label="Active"
          value={metrics.active}
          helper="Available to staff today"
          tone="green"
          barWidth={pct(metrics.active, metrics.total)}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>}
        />
        <StatCard
          label="Low stock"
          value={metrics.low}
          helper={`Under ${LOW_STOCK_THRESHOLD} units remaining`}
          tone="amber"
          inactive={metrics.low === 0}
          valueAccent
          barWidth={metrics.low > 0 ? pct(metrics.low, metrics.stockTracked) : '0%'}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M10.3 4.3l-8 13.4A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>}
        />
        <StatCard
          label="Out of stock"
          value={metrics.out}
          helper="Stocked products at zero"
          tone="red"
          inactive={metrics.out === 0}
          valueAccent
          barWidth={metrics.out > 0 ? pct(metrics.out, metrics.stockTracked) : '0%'}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>}
        />
      </div>

      <div className="mb-4.5 flex flex-wrap items-center justify-between gap-3.5">
        <div className="relative min-w-57.5 max-w-100 flex-1">
          <span className="pointer-events-none absolute top-1/2 left-3.25 -translate-y-1/2 text-(--app-text-faint)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
          </span>
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full rounded-[11px] border border-(--app-border-strong) bg-(--app-surface) py-2.5 pr-3.5 pl-9.75 text-sm text-(--app-text) outline-none"
          />
        </div>
        <div className="inline-flex flex-wrap gap-0.75 rounded-xl border border-(--app-border) bg-(--app-surface) p-1">
          {FILTERS.map((item) => {
            const on = filter === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => chooseFilter(item.key)}
                className={cn(
                  'cursor-pointer rounded-[9px] px-4 py-2 text-[13.5px] font-semibold text-(--app-text-soft)',
                  on && 'bg-(--app-surface-2) font-bold text-(--app-brand) shadow-[0_1px_4px_rgba(14,108,196,0.16)]',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {productsQuery.isPending || statsQuery.isPending ? (
        <LoadingGrid />
      ) : productsQuery.isError || statsQuery.isError ? (
        <div role="alert" className="rounded-2xl border border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.06)] px-4.5 py-4 text-sm text-[#dc2626]">
          {productsQuery.error?.message ?? statsQuery.error?.message}
        </div>
      ) : metrics.total === 0 ? (
        <EmptyState onAdd={() => setCreating(true)} />
      ) : total === 0 ? (
        <NoResultsState />
      ) : (
        <>
          {productsQuery.isFetching && !productsQuery.isPending ? (
            <AquaProgressBar className="mb-3 rounded-full" />
          ) : null}
          <ProductsGrid products={products} actor={actor} onActionSuccess={setStatusMessage} />
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4.5 text-[13px] text-(--app-text-soft)">
            <span>
              Showing <strong className="font-semibold text-(--app-text)">{pageStart}–{pageEnd}</strong> of {total} products{productsQuery.isFetching ? ' · Updating…' : ''}
            </span>
            {pageCount > 1 ? <Pager page={safePage} pageCount={pageCount} onPage={setPage} /> : null}
          </div>
        </>
      )}

      <CreateProductDialog open={creating} onOpenChange={setCreating} onCreated={() => setStatusMessage('Product created successfully.')} />
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex flex-none cursor-pointer items-center gap-2.25 rounded-xl bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-5.25 py-3 text-[14.5px] font-semibold whitespace-nowrap text-white shadow-[0_10px_22px_rgba(14,108,196,0.28)]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      Add product
    </button>
  )
}

interface StatCardProps {
  label: string
  value: number
  helper: string
  tone: StatTone
  barWidth: string
  icon: React.ReactNode
  inactive?: boolean
  valueAccent?: boolean
}

const statToneClasses: Record<StatTone, { border: string; bar: string; icon: string; value: string }> = {
  brand: {
    border: 'border-l-[#38bdf8]',
    bar: 'bg-[#38bdf8]',
    icon: 'bg-(--app-chip-bg) text-(--app-brand)',
    value: 'text-(--app-brand)',
  },
  green: {
    border: 'border-l-[#22c55e]',
    bar: 'bg-[#22c55e]',
    icon: 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)',
    value: 'text-(--app-chip-green-text)',
  },
  amber: {
    border: 'border-l-[#f59e0b]',
    bar: 'bg-[#f59e0b]',
    icon: 'bg-(--app-chip-amber-bg) text-(--app-chip-amber-text)',
    value: 'text-(--app-chip-amber-text)',
  },
  red: {
    border: 'border-l-[#ef4444]',
    bar: 'bg-[#ef4444]',
    icon: 'bg-(--app-chip-red-bg) text-(--app-chip-red-text)',
    value: 'text-(--app-chip-red-text)',
  },
}

function StatCard({ label, value, helper, tone, barWidth, icon, inactive = false, valueAccent = false }: StatCardProps) {
  const toneClasses = statToneClasses[tone]

  return (
    <div
      className={cn(
        'rounded-2xl border border-l-[3px] border-y-(--app-border) border-r-(--app-border) bg-(--app-surface) px-4 py-3.75 shadow-(--app-shadow-card)',
        inactive ? 'border-l-(--app-border)' : toneClasses.border,
      )}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2.5">
        <div className="pt-0.5 text-[10.5px] leading-[1.3] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">{label}</div>
        <div
          className={cn(
            'flex size-7 flex-none items-center justify-center rounded-[9px]',
            inactive ? 'bg-(--app-chip-gray-bg) text-(--app-text-faint)' : toneClasses.icon,
          )}
        >
          {icon}
        </div>
      </div>
      <div
        className={cn(
          'mb-2.25 text-[25px] leading-none font-extrabold tracking-[-0.03em] text-(--app-text)',
          valueAccent && !inactive && toneClasses.value,
        )}
      >
        {value}
      </div>
      <div className="mb-2 h-0.75 overflow-hidden rounded-full bg-(--app-border)">
        <div
          // ponytail: the progress width is calculated from live product metrics.
          style={{ width: barWidth }}
          className={cn('h-full rounded-full', inactive ? 'bg-(--app-border)' : toneClasses.bar)}
        />
      </div>
      <div className="text-xs text-(--app-text-soft)">{helper}</div>
    </div>
  )
}

interface PagerProps {
  page: number
  pageCount: number
  onPage: (page: number) => void
}

function Pager({ page, pageCount, onPage }: PagerProps) {
  const arrowClassName = 'inline-flex size-8 cursor-pointer items-center justify-center rounded-[9px] border border-(--app-border-strong) bg-(--app-surface) disabled:cursor-not-allowed disabled:text-(--app-text-faint)'

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={cn(arrowClassName, page > 1 && 'text-(--app-text-muted)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => {
        const selected = number === page
        return (
          <button
            key={number}
            type="button"
            onClick={() => onPage(number)}
            className={cn(
              'inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-[9px] border border-(--app-border-strong) bg-(--app-surface) px-1.75 text-[13px] font-medium text-(--app-text-muted)',
              selected && 'border-(--app-brand-soft) bg-(--app-chip-bg) font-bold text-(--app-brand)',
            )}
          >
            {number}
          </button>
        )
      })}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        className={cn(arrowClassName, page < pageCount && 'text-(--app-text-muted)')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <AquaSkeleton key={index} className="h-57.5 rounded-2xl border border-(--app-border)" />
      ))}
    </div>
  )
}

function NoResultsState() {
  return (
    <div className="rounded-[18px] border border-(--app-border) bg-(--app-surface) px-6 py-14.5 text-center">
      <div className="mb-1.5 text-[17px] font-bold text-(--app-text)">No matching products</div>
      <p className="text-sm text-(--app-text-muted)">Try a different name or switch the filter above.</p>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-[18px] border border-(--app-border) bg-(--app-surface) px-6 py-14.5 text-center">
      <div className="mx-auto mb-4.5 flex size-17 items-center justify-center rounded-[20px] bg-(--app-chip-bg) text-(--app-brand)">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
      </div>
      <div className="mb-1.5 text-lg font-bold text-(--app-text)">No products yet</div>
      <p className="mx-auto mb-4.5 max-w-90 text-sm text-(--app-text-muted)">Start by adding your first refill service, bottled water, or container product.</p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-5.5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,108,196,0.3)]"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add product
      </button>
    </div>
  )
}
