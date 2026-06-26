'use client'

import { useMemo, useState } from 'react'

import { expenseCategories } from '../expenses.constants'
import { createExpenseSummary, filterExpenses, pesoFormatter } from '../expenses.summary'
import type { Expense, ExpenseCategory } from '../expenses.types'
import { useExpenses } from '../hooks/use-expenses'
import { CreateExpenseDialog } from './create-expense-dialog'
import { ExpensesTable } from './expenses-table'

const EMPTY: Expense[] = []

export function ExpensesPage() {
  const { data: expenses, isPending, isError, error } = useExpenses()
  const expenseList = expenses ?? EMPTY
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState<ExpenseCategory | 'all'>('all')

  const filtered = useMemo(
    () => filterExpenses(expenseList, { search, category: catFilter }),
    [expenseList, search, catFilter],
  )

  const summary = useMemo(() => createExpenseSummary(expenseList), [expenseList])

  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="max-w-[85vw] mx-auto" style={{ margin: '0 auto', padding: '26px 28px 56px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '9px' }}>Cost tracking</div>
          <h1 style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 7px', color: 'var(--app-text)' }}>Expenses</h1>
          <p style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--app-text-muted)', margin: 0, maxWidth: '560px' }}>
            Track every peso that keeps the station running — utilities, filters, salt, deliveries, and payroll — so you always know your true margins.
          </p>
        </div>
        <CreateExpenseDialog />
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Spent this month */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg,#0b73c8,#075098)', borderRadius: '18px', padding: '20px', boxShadow: '0 14px 30px rgba(14,108,196,0.26)' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-24px', lineHeight: 0, opacity: 0.22 }}>
            <svg width="150" height="90" viewBox="0 0 150 90" preserveAspectRatio="none"><path d="M0 50 C30 30 55 64 85 48 C115 32 135 56 150 44 L150 90 L0 90 Z" fill="#fff" /></svg>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bfe2ff' }}>Spent this month</div>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></svg>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1 }}>{pesoFormatter.format(summary.thisMonth)}</div>
            <div style={{ fontSize: '12.5px', color: '#bfe2ff', marginTop: '10px' }}>{summary.thisMonthLabel} · {summary.thisMonthCount} entries</div>
          </div>
        </div>

        {/* Total recorded */}
        <StatCard
          label="Total recorded"
          iconColor="var(--app-brand)"
          iconBg="var(--app-chip-bg)"
          accentColor="#38bdf8"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M4 5h16M4 12h16M4 19h10" /></svg>}
          value={pesoFormatter.format(summary.totalExpenses)}
          sub={`${expenseList.length} expense entries`}
        />

        {/* Top category */}
        <StatCard
          label="Top category"
          iconColor="#8b5cf6"
          iconBg="rgba(139,92,246,0.14)"
          accentColor="#8b5cf6"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3v9l6 3" /><circle cx="12" cy="12" r="9" /></svg>}
          value={summary.largestCategoryLabel}
          sub={`${pesoFormatter.format(summary.largestCategoryTotal)} spent so far`}
          valueSmall
        />

        {/* Largest expense */}
        <StatCard
          label="Largest expense"
          iconColor="var(--app-chip-amber-text)"
          iconBg="var(--app-chip-amber-bg)"
          accentColor="#f59e0b"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M4 18V8m6 10V5m6 13v-8" /><path d="M3 21h18" /></svg>}
          value={pesoFormatter.format(summary.largestExpense)}
          sub={summary.largestExpenseLabel}
        />
      </div>

      {/* Ledger card */}
      <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--app-shadow-card)' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', padding: '16px 18px', borderBottom: '1px solid var(--app-border)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
            <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses…"
              style={{ width: '100%', padding: '10px 14px 10px 39px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as ExpenseCategory | 'all')}
              style={{ appearance: 'none', padding: '10px 36px 10px 14px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface-2)', color: 'var(--app-text)', fontSize: '13.5px', fontWeight: 600, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
            >
              <option value="all">All categories</option>
              {expenseCategories.map((c) => (
                <option key={c.value} value={c.value}>{c.name}</option>
              ))}
            </select>
            <span style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--app-text-soft)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
        </div>

        {isPending ? (
          <LoadingState />
        ) : isError ? (
          <div role="alert" style={{ padding: '24px', color: '#b91c1c', fontSize: '14px' }}>{error.message}</div>
        ) : expenseList.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <NoResultsState onClear={() => { setSearch(''); setCatFilter('all') }} />
        ) : (
          <>
            <ExpensesTable expenses={filtered} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--app-border)', fontSize: '13px', color: 'var(--app-text-soft)', flexWrap: 'wrap', gap: '10px' }}>
              <span>Showing <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{filtered.length}</strong> of {expenseList.length} expenses</span>
              <span>Filtered total: <strong style={{ color: 'var(--app-text)', fontWeight: 700 }}>{pesoFormatter.format(filteredTotal)}</strong></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  iconColor: string
  iconBg: string
  accentColor: string
  icon: React.ReactNode
  value: string
  sub: string
  valueSmall?: boolean
}

function StatCard({ label, iconColor, iconBg, accentColor, icon, value, sub, valueSmall }: StatCardProps) {
  return (
    <div style={{ background: 'var(--app-surface)', border: `1px solid var(--app-border)`, borderLeft: `3px solid ${accentColor}`, borderRadius: '18px', padding: '20px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-text-faint)', paddingTop: '3px' }}>{label}</div>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: valueSmall ? '21px' : '32px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--app-text)', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '12.5px', color: 'var(--app-text-soft)', marginTop: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '32px 22px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{ height: '52px', borderRadius: '8px', background: 'var(--app-surface-2)', marginBottom: '8px', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ padding: '62px 24px', textAlign: 'center' }}>
      <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--app-brand)' }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.2" fill="currentColor" stroke="none" /></svg>
      </div>
      <div style={{ fontSize: '19px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '8px' }}>No expenses recorded yet</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 auto 20px', maxWidth: '380px' }}>Start logging your station&apos;s running costs to see where the money goes each month.</p>
    </div>
  )
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--app-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-text-faint)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
      </div>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No matching expenses</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 0 18px' }}>Try a different keyword or category.</p>
      <button onClick={onClear} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', color: 'var(--app-brand)', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600, padding: '10px 18px', borderRadius: '11px', cursor: 'pointer' }}>
        Clear filters
      </button>
    </div>
  )
}
