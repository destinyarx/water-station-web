'use client'

import { useMemo, useState } from 'react'

import type { Customer } from '../customers.types'
import { useCustomers } from '../hooks/use-customers'
import { CustomersTable } from './customers-table'
import { CreateCustomerDialog } from './create-customer-dialog'

type CustomerTypeFilter = 'all' | 'business' | 'household'
const EMPTY_CUSTOMERS: Customer[] = []
const PER_PAGE = 6

const FILTERS: ReadonlyArray<{ key: CustomerTypeFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'business', label: 'Business' },
  { key: 'household', label: 'Household' },
]

const DropIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14.5a5 5 0 0 0 10 0c0-2.4-2-4.6-5-8-3 3.4-5 5.6-5 8Z" /></svg>
)

export function CustomersPage() {
  const { data, isPending, isError, error } = useCustomers()
  const customers = data ?? EMPTY_CUSTOMERS
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>('all')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)

  const businessCount = customers.filter((c) => c.isBusiness).length
  const householdCount = customers.length - businessCount

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesType =
        typeFilter === 'all' ||
        (typeFilter === 'business' && customer.isBusiness) ||
        (typeFilter === 'household' && !customer.isBusiness)
      if (!matchesType) return false
      if (!q) return true
      const haystack = [customer.name, customer.contactNumber, customer.fullAddress, customer.barangay, customer.municipality]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [customers, search, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1
  const pageEnd = Math.min(safePage * PER_PAGE, filtered.length)

  function setFilter(next: CustomerTypeFilter) {
    setTypeFilter(next)
    setPage(1)
  }

  function clearSearch() {
    setSearch('')
    setTypeFilter('all')
    setPage(1)
  }

  return (
    <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '26px 28px 56px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '9px' }}>
            {DropIcon}
            Refill accounts directory
          </div>
          <h1 style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 7px', color: 'var(--app-text)' }}>Customers</h1>
          <p style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--app-text-muted)', margin: 0, maxWidth: '560px' }}>
            Manage household and business refill accounts — contact details, delivery addresses, and route stops in one clean directory.
          </p>
        </div>
        <AddButton onClick={() => setCreating(true)} />
      </div>

      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '16px', marginBottom: '22px' }}>
        <StatCard label="Total customers" value={customers.length} helper="Across all active refill accounts" accent="#0a6cc4" glow="rgba(56,189,248,0.16)" waveColor="rgba(56,189,248,0.16)" iconBg="var(--app-chip-bg)" iconColor="var(--app-brand)" icon={DropIcon} />
        <StatCard label="Business accounts" value={businessCount} helper="Offices, shops & commercial orders" accent="#38bdf8" glow="rgba(56,189,248,0.14)" waveColor="rgba(56,189,248,0.14)" iconBg="var(--app-chip-bg)" iconColor="var(--app-brand)" icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" /><path d="M15 9h2a2 2 0 0 1 2 2v10" /><path d="M9 7h2M9 11h2M9 15h2" /><path d="M4 21h16" /></svg>} />
        <StatCard label="Households" value={householdCount} helper="Individual delivery customers" accent="#22c55e" glow="rgba(34,197,94,0.14)" waveColor="rgba(34,197,94,0.14)" iconBg="var(--app-chip-green-bg)" iconColor="var(--app-chip-green-text)" icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>} />
      </div>

      {/* directory card */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--app-shadow-card)' }}>
        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px 18px', borderBottom: '1px solid var(--app-border)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '230px', maxWidth: '420px' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search name, phone, or barangay"
              aria-label="Search customers"
              style={{ width: '100%', padding: '10px 14px 10px 39px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'inline-flex', padding: '4px', gap: '3px', background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '12px' }}>
            {FILTERS.map((filter) => {
              const on = typeFilter === filter.key
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setFilter(filter.key)}
                  style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: on ? 700 : 600, background: on ? 'var(--app-surface)' : 'transparent', color: on ? 'var(--app-brand)' : 'var(--app-text-soft)', boxShadow: on ? '0 1px 4px rgba(14,108,196,0.16)' : 'none' }}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        {isPending ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState message={error.message} />
        ) : customers.length === 0 ? (
          <EmptyState onAdd={() => setCreating(true)} />
        ) : filtered.length === 0 ? (
          <NoResultsState onClear={clearSearch} />
        ) : (
          <>
            <CustomersTable customers={pageItems} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--app-border)', fontSize: '13px', color: 'var(--app-text-soft)', flexWrap: 'wrap', gap: '12px' }}>
              <span>
                Showing <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{pageStart}–{pageEnd}</strong> of {filtered.length} customers
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
    <button type="button" onClick={onClick} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14.5px', fontWeight: 600, padding: '12px 21px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.28)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      Add customer
    </button>
  )
}

interface StatCardProps {
  label: string
  value: number
  helper: string
  accent: string
  glow: string
  waveColor: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
}

function StatCard({ label, value, helper, accent, glow, waveColor, iconBg, iconColor, icon }: StatCardProps) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderLeft: `3px solid ${accent}`, borderRadius: '18px', padding: '20px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ position: 'absolute', right: '-24px', top: '-28px', width: '104px', height: '104px', borderRadius: '50%', background: `radial-gradient(circle, ${glow}, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-1px', lineHeight: 0, pointerEvents: 'none', opacity: 0.6 }}>
        <svg viewBox="0 0 320 36" width="100%" height="26" preserveAspectRatio="none"><path d="M0 20 C50 6 92 30 160 20 C224 11 272 28 320 16 L320 36 L0 36 Z" fill={waveColor} /></svg>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--app-text-faint)' }}>{label}</div>
          <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--app-text)', marginTop: '12px' }}>{value}</div>
        </div>
        <div style={{ flex: 'none', width: '42px', height: '42px', borderRadius: '13px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ position: 'relative', fontSize: '12.5px', color: 'var(--app-text-soft)', marginTop: '12px' }}>{helper}</div>
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

function LoadingState() {
  return (
    <div style={{ padding: '18px' }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} style={{ height: '56px', borderRadius: '12px', background: 'var(--app-surface-2)', marginBottom: '10px', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" style={{ margin: '18px', borderRadius: '14px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '16px 18px', fontSize: '14px', color: '#dc2626' }}>
      {message}
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--app-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-text-faint)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
      </div>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No matching customers</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 0 18px' }}>Try a different name, phone number, or barangay — or clear the filters to see everyone.</p>
      <button type="button" onClick={onClear} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', color: 'var(--app-brand)', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, padding: '10px 18px', borderRadius: '11px', cursor: 'pointer' }}>Clear search &amp; filters</button>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center' }}>
      <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-brand)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14.5a5 5 0 0 0 10 0c0-2.4-2-4.6-5-8-3 3.4-5 5.6-5 8Z" /></svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No customers yet</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 auto 18px', maxWidth: '360px' }}>Add your first refill customer to start tracking deliveries, container returns, and route stops.</p>
      <button type="button" onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 24px rgba(14,108,196,0.3)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Add customer
      </button>
    </div>
  )
}
