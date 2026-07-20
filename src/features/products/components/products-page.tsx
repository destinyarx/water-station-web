'use client'

import { useEffect, useState } from 'react'

import { AquaProgressBar, AquaSkeleton } from '@/components/app/loading'
import { LOW_STOCK_THRESHOLD } from '../products.constants'
import type { Product } from '../products.types'
import { useProductActor } from '../hooks/use-product-actor'
import { useProducts, useProductStats } from '../hooks/use-products'
import { CreateProductDialog } from './create-product-dialog'
import { ProductsGrid } from './products-table'

type ProductFilter = 'all' | 'refillable' | 'stocked' | 'discontinued'
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
    const id = window.setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
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
    <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '26px 28px 56px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '9px' }}>Catalog &amp; inventory</div>
          <h1 style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 7px', color: 'var(--app-text)' }}>Products</h1>
          <p style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--app-text-muted)', margin: 0, maxWidth: '560px' }}>
            Manage your refill services and bottled-water stock in one place — prices, inventory levels, and what&rsquo;s available today.
          </p>
        </div>
        <AddButton onClick={() => setCreating(true)} />
      </div>

      {statusMessage ? (
        <div role="status" style={{ marginBottom: '18px', borderRadius: '12px', background: 'var(--app-chip-green-bg)', color: 'var(--app-chip-green-text)', padding: '10px 14px', fontSize: '13.5px', fontWeight: 600 }}>
          {statusMessage}
        </div>
      ) : null}

      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', marginBottom: '18px' }}>
        <StatCard label="Total products" value={metrics.total} helper="In your catalog" accent="#38bdf8" barWidth="100%" iconBg="var(--app-chip-bg)" iconColor="var(--app-brand)" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c3.5 4.5 5.5 7 5.5 9.8a5.5 5.5 0 1 1-11 0C6.5 10 8.5 7.5 12 3Z" /></svg>} />
        <StatCard label="Active" value={metrics.active} helper="Available to staff today" accent="#22c55e" numColor="var(--app-text)" barWidth={pct(metrics.active, metrics.total)} iconBg="var(--app-chip-green-bg)" iconColor="var(--app-chip-green-text)" icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>} />
        <StatCard label="Low stock" value={metrics.low} helper={`Under ${LOW_STOCK_THRESHOLD} units remaining`} accent={metrics.low > 0 ? '#f59e0b' : 'var(--app-border)'} numColor={metrics.low > 0 ? 'var(--app-chip-amber-text)' : 'var(--app-text)'} barWidth={metrics.low > 0 ? pct(metrics.low, metrics.stockTracked) : '0%'} iconBg={metrics.low > 0 ? 'var(--app-chip-amber-bg)' : 'var(--app-chip-gray-bg)'} iconColor={metrics.low > 0 ? 'var(--app-chip-amber-text)' : 'var(--app-text-faint)'} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M10.3 4.3l-8 13.4A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>} />
        <StatCard label="Out of stock" value={metrics.out} helper="Stocked products at zero" accent={metrics.out > 0 ? '#ef4444' : 'var(--app-border)'} numColor={metrics.out > 0 ? 'var(--app-chip-red-text)' : 'var(--app-text)'} barWidth={metrics.out > 0 ? pct(metrics.out, metrics.stockTracked) : '0%'} iconBg={metrics.out > 0 ? 'var(--app-chip-red-bg)' : 'var(--app-chip-gray-bg)'} iconColor={metrics.out > 0 ? 'var(--app-chip-red-text)' : 'var(--app-text-faint)'} icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>} />
      </div>

      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '230px', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
          </span>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            placeholder="Search products…"
            aria-label="Search products"
            style={{ width: '100%', padding: '10px 14px 10px 39px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'inline-flex', padding: '4px', gap: '3px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '12px', flexWrap: 'wrap' }}>
          {FILTERS.map((item) => {
            const on = filter === item.key
            return (
              <button key={item.key} type="button" onClick={() => chooseFilter(item.key)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: on ? 700 : 600, background: on ? 'var(--app-surface-2)' : 'transparent', color: on ? 'var(--app-brand)' : 'var(--app-text-soft)', boxShadow: on ? '0 1px 4px rgba(14,108,196,0.16)' : 'none' }}>
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {productsQuery.isPending || statsQuery.isPending ? (
        <LoadingGrid />
      ) : productsQuery.isError || statsQuery.isError ? (
        <div role="alert" style={{ borderRadius: '16px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '16px 18px', fontSize: '14px', color: '#dc2626' }}>{productsQuery.error?.message ?? statsQuery.error?.message}</div>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 4px 0', fontSize: '13px', color: 'var(--app-text-soft)', flexWrap: 'wrap', gap: '12px' }}>
            <span>
              Showing <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{pageStart}–{pageEnd}</strong> of {total} products{productsQuery.isFetching ? ' · Updating…' : ''}
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
    <button type="button" onClick={onClick} style={{ flex: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14.5px', fontWeight: 600, padding: '12px 21px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.28)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      Add product
    </button>
  )
}

interface StatCardProps {
  label: string
  value: number
  helper: string
  accent: string
  barWidth: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  numColor?: string
}

function StatCard({ label, value, helper, accent, barWidth, iconBg, iconColor, icon, numColor }: StatCardProps) {
  return (
    <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderLeft: `3px solid ${accent}`, borderRadius: '16px', padding: '15px 16px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
        <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-text-faint)', paddingTop: '2px', lineHeight: 1.3 }}>{label}</div>
        <div style={{ flex: 'none', width: '28px', height: '28px', borderRadius: '9px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '25px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: numColor ?? 'var(--app-text)', marginBottom: '9px' }}>{value}</div>
      <div style={{ height: '3px', background: 'var(--app-border)', borderRadius: '99px', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: barWidth, background: accent, borderRadius: '99px' }} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--app-text-soft)' }}>{helper}</div>
    </div>
  )
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  const arrowBtn: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '9px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', cursor: 'pointer' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} style={{ ...arrowBtn, color: page <= 1 ? 'var(--app-text-faint)' : 'var(--app-text-muted)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => {
        const on = n === page
        return (
          <button key={n} type="button" onClick={() => onPage(n)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '32px', height: '32px', padding: '0 7px', borderRadius: '9px', border: `1px solid ${on ? 'var(--app-brand-soft)' : 'var(--app-border-strong)'}`, background: on ? 'var(--app-chip-bg)' : 'var(--app-surface)', color: on ? 'var(--app-brand)' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '13px', fontWeight: on ? 700 : 500, cursor: 'pointer' }}>
            {n}
          </button>
        )
      })}
      <button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPage(page + 1)} style={{ ...arrowBtn, color: page >= pageCount ? 'var(--app-text-faint)' : 'var(--app-text-muted)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(236px,1fr))', gap: '16px' }}>
      {Array.from({ length: 8 }, (_, index) => (
        <AquaSkeleton key={index} className="rounded-2xl border border-(--app-border)" style={{ height: '230px' }} />
      ))}
    </div>
  )
}

function NoResultsState() {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '18px' }}>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No matching products</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: 0 }}>Try a different name or switch the filter above.</p>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '18px' }}>
      <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-brand)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No products yet</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 auto 18px', maxWidth: '360px' }}>Start by adding your first refill service, bottled water, or container product.</p>
      <button type="button" onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 24px rgba(14,108,196,0.3)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add product
      </button>
    </div>
  )
}
