'use client'

import { useMemo, useState } from 'react'

import { DUE_WEEK_DAYS } from '../maintenance.constants'
import type { MaintenanceTaskView } from '../maintenance.types'
import { dayDiff, todayIso } from '../maintenance.view'
import { useMaintenanceTasks } from '../hooks/use-maintenance-tasks'
import { CreateScheduleDialog } from './create-schedule-dialog'
import { MaintenanceTaskCard } from './maintenance-task-card'

type StatusFilter = 'all' | 'upcoming' | 'overdue' | 'completed'

const FILTERS: ReadonlyArray<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'completed', label: 'Completed' },
]

function matchesFilter(task: MaintenanceTaskView, filter: StatusFilter): boolean {
  if (filter === 'all') return task.displayStatus !== 'completed'
  return task.displayStatus === filter
}

export function MaintenancePage() {
  const { views, isPending, isError, error } = useMaintenanceTasks()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [showInactive, setShowInactive] = useState(false)
  const [creating, setCreating] = useState(false)
  const today = todayIso()
  const month = today.slice(0, 7)

  const metrics = useMemo(() => {
    const active = views.filter((v) => v.isScheduleActive)
    return {
      dueWeek: active.filter((v) => {
        const d = dayDiff(today, v.dueDate)
        return v.displayStatus === 'upcoming' && d >= 0 && d <= DUE_WEEK_DAYS
      }).length,
      overdue: active.filter((v) => v.displayStatus === 'overdue').length,
      doneMonth: views.filter((v) => v.displayStatus === 'completed' && v.dueDate.startsWith(month)).length,
      recurring: active.filter((v) => v.isRecurring).length,
    }
  }, [views, today, month])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return views
      .filter((v) => (showInactive ? true : v.isScheduleActive))
      .filter((v) => matchesFilter(v, filter))
      .filter((v) => {
        if (!q) return true
        const equip = (v.equipmentOther ?? v.equipment).toLowerCase()
        return v.title.toLowerCase().includes(q) || equip.includes(q) || v.assigneeName.toLowerCase().includes(q)
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [views, search, filter, showInactive])

  return (
    <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '26px 28px 56px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-brand)', marginBottom: '9px' }}>Equipment upkeep</div>
          <h1 style={{ fontSize: '29px', fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 7px', color: 'var(--app-text)' }}>Maintenance schedule</h1>
          <p style={{ fontSize: '14.5px', lineHeight: 1.55, color: 'var(--app-text-muted)', margin: 0, maxWidth: '560px' }}>
            Keep filters, pumps, and tanks on schedule. Plan recurring upkeep, assign staff, and tick tasks off as they&rsquo;re done.
          </p>
        </div>
        <AddButton onClick={() => setCreating(true)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '16px', marginBottom: '26px' }}>
        <StatCard label="Due this week" value={metrics.dueWeek} accent="#38bdf8" iconBg="var(--app-chip-bg)" iconColor="var(--app-brand)" icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>} />
        <StatCard label="Overdue" value={metrics.overdue} accent={metrics.overdue > 0 ? '#ef4444' : 'var(--app-border)'} numColor={metrics.overdue > 0 ? 'var(--app-chip-red-text)' : 'var(--app-text)'} iconBg={metrics.overdue > 0 ? 'var(--app-chip-red-bg)' : 'var(--app-chip-gray-bg)'} iconColor={metrics.overdue > 0 ? 'var(--app-chip-red-text)' : 'var(--app-text-faint)'} icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d="M10.3 4.3l-8 13.4A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>} />
        <StatCard label="Done this month" value={metrics.doneMonth} accent="#22c55e" iconBg="var(--app-chip-green-bg)" iconColor="var(--app-chip-green-text)" icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>} />
        <StatCard label="Recurring" value={metrics.recurring} accent="#8b5cf6" iconBg="rgba(139,92,246,0.13)" iconColor="#7c3aed" icon={<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '230px', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-faint)', pointerEvents: 'none' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
          </span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks…"
            aria-label="Search maintenance tasks"
            style={{ width: '100%', padding: '10px 14px 10px 39px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', padding: '4px', gap: '3px', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '12px', flexWrap: 'wrap' }}>
            {FILTERS.map((item) => {
              const on = filter === item.key
              return (
                <button key={item.key} type="button" onClick={() => setFilter(item.key)} style={{ padding: '8px 15px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13.5px', fontWeight: on ? 700 : 600, background: on ? 'var(--app-surface-2)' : 'transparent', color: on ? 'var(--app-brand)' : 'var(--app-text-soft)', boxShadow: on ? '0 1px 4px rgba(14,108,196,0.16)' : 'none' }}>
                  {item.label}
                </button>
              )
            })}
          </div>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--app-text-soft)', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--app-brand)', cursor: 'pointer' }} />
            Show inactive
          </label>
        </div>
      </div>

      {isPending ? (
        <LoadingList />
      ) : isError ? (
        <div role="alert" style={{ borderRadius: '16px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '16px 18px', fontSize: '14px', color: '#dc2626' }}>{error?.message ?? 'Something went wrong.'}</div>
      ) : views.length === 0 ? (
        <EmptyState onAdd={() => setCreating(true)} />
      ) : filtered.length === 0 ? (
        <NoResultsState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((task) => (
            <MaintenanceTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <CreateScheduleDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="text-[14.5px]" type="button" onClick={onClick} style={{ flex: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '9px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 600, padding: '12px 21px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.28)' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      Schedule Task
    </button>
  )
}

interface StatCardProps {
  label: string
  value: number
  accent: string
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  numColor?: string
}

function StatCard({ label, value, accent, iconBg, iconColor, icon, numColor }: StatCardProps) {
  return (
    <div style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderLeft: `3px solid ${accent}`, borderRadius: '18px', padding: '20px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--app-text-faint)', paddingTop: '3px', lineHeight: 1.3 }}>{label}</div>
        <div style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '10px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: numColor ?? 'var(--app-text)' }}>{value}</div>
    </div>
  )
}

function LoadingList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} style={{ height: '74px', borderRadius: '15px', border: '1px solid var(--app-border)', background: 'var(--app-surface-2)' }} />
      ))}
    </div>
  )
}

function NoResultsState() {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '18px' }}>
      <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No matching tasks</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: 0 }}>Try a different search or switch the filter above.</p>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ padding: '58px 24px', textAlign: 'center', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '18px' }}>
      <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: 'var(--app-brand)' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M14.7 6.3a3.7 3.7 0 0 0-4.9 4.6L4 16.7 7.3 20l5.8-5.8a3.7 3.7 0 0 0 4.6-4.9l-2.4 2.4-2-2 2.4-2.4Z" /></svg>
      </div>
      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--app-text)', marginBottom: '6px' }}>No maintenance scheduled yet</div>
      <p style={{ fontSize: '14px', color: 'var(--app-text-muted)', margin: '0 auto 18px', maxWidth: '360px' }}>Schedule your first task — RO membrane swaps, filter changes, tank sanitation, and more.</p>
      <button type="button" onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, padding: '12px 22px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 24px rgba(14,108,196,0.3)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Schedule Task
      </button>
    </div>
  )
}
