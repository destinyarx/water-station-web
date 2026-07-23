'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/app/confirm-dialog'

import { useWaterQualityTests, useWaterQualityStats } from '../hooks/use-water-quality'
import { useWaterQualityActor } from '../hooks/use-water-quality-actor'
import { useDeleteWaterQualityTest } from '../hooks/use-delete-water-quality-test'
import { canEditWaterQualityTest } from '../water-quality.guards'
import type { TestMethod, TestStatus, WaterQualityTest } from '../water-quality.types'
import { WaterQualityFormDialog } from './water-quality-form-dialog'
import { WaterQualityDetailDialog } from './water-quality-detail-dialog'
import { WaterQualityRowActions } from './water-quality-row-actions'

type MethodFilter = 'all' | TestMethod
type StatusFilter = 'all' | TestStatus

// min-w keeps the columns readable on a 6" phone; the table scrolls horizontally instead of squashing.
const GRID = 'grid-cols-[1.4fr_1fr_1fr_1.2fr_110px_52px] min-w-[760px]'

const statusChip: Record<TestStatus, string> = {
  Passed: 'bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]',
  Warning: 'bg-[var(--app-chip-amber-bg)] text-[var(--app-chip-amber-text)]',
  Failed: 'bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]',
  Pending: 'bg-[var(--app-chip-gray-bg)] text-[var(--app-chip-gray-text)]',
}

const heroGradient: Record<TestStatus, string> = {
  Passed: 'bg-[linear-gradient(150deg,#22a95f,#128046)]',
  Warning: 'bg-[linear-gradient(150deg,#e0a800,#b45309)]',
  Failed: 'bg-[linear-gradient(150deg,#e0483a,#b3261a)]',
  Pending: 'bg-[linear-gradient(150deg,#5b7285,#3f5568)]',
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

interface StatChipProps {
  label: string
  value: string | number
  helper: string
  accentClass: string
  chipClass: string
  bar?: number
  isLoading: boolean
}

function StatChip({ label, value, helper, accentClass, chipClass, bar, isLoading }: StatChipProps) {
  return (
    <article className={`rounded-[16px] border border-l-[3px] border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-[15px] shadow-[var(--app-shadow-card)] ${accentClass}`}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-[var(--app-text-faint)]">{label}</p>
        <div className={`flex h-7 w-7 items-center justify-center rounded-[9px] ${chipClass}`}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
        </div>
      </div>
      <p className="text-[25px] font-extrabold tracking-[-0.03em] leading-none text-[var(--app-text)]">
        {isLoading ? <span className="text-[var(--app-text-faint)]">—</span> : value}
      </p>
      {typeof bar === 'number' ? (
        <div className="h-[3px] rounded-full bg-[var(--app-border)] overflow-hidden mt-2 mb-2">
          <div className="h-full rounded-full bg-[var(--app-brand)]" style={{ width: `${Math.min(100, bar)}%` }} />
        </div>
      ) : null}
      <p className="text-[12px] text-[var(--app-text-soft)] mt-[7px]">{helper}</p>
    </article>
  )
}

export function WaterQualityPage() {
  const actor = useWaterQualityActor()

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WaterQualityTest | null>(null)
  const [viewTarget, setViewTarget] = useState<WaterQualityTest | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WaterQualityTest | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [method, setMethod] = useState<MethodFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const perPage = 20

  const deleteMutation = useDeleteWaterQualityTest()

  const testsQuery = useWaterQualityTests({ search: debouncedSearch, method, status, page, perPage })
  const statsQuery = useWaterQualityStats()

  const tests = testsQuery.data?.tests ?? []
  const total = testsQuery.data?.total ?? 0
  const stats = statsQuery.data
  const pageCount = Math.max(1, Math.ceil(total / perPage))

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => window.clearTimeout(id)
  }, [search])

  const methodFilters: { key: MethodFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'lab', label: 'Laboratory' },
    { key: 'device', label: 'In-house Device' },
  ]
  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'Passed', label: 'Passed' },
    { key: 'Failed', label: 'Failed' },
    { key: 'Warning', label: 'Warning' },
  ]

  const latest = stats?.latest ?? null
  const heroStatus: TestStatus = latest?.status ?? 'Pending'

  return (
    <div className="min-h-screen bg-[var(--app-page-bg)]">
      <div className="max-w-[1160px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--app-text)] leading-tight">Water Quality</h1>
            <p className="text-[14px] text-[var(--app-text-soft)] mt-1">
              Record, monitor, and audit your station&apos;s water quality tests and compliance.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="flex-none gap-2 bg-[linear-gradient(150deg,#3fb0f0,#0a6cc4)] px-5 shadow-[0_10px_22px_rgba(14,108,196,0.3)]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add Test Result
          </Button>
        </div>

        {/* Stat cards */}
        <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
          {/* Latest result hero — color follows status */}
          <article className={`relative overflow-hidden rounded-[16px] px-4 py-[15px] shadow-[0_14px_30px_rgba(14,108,196,0.24)] ${heroGradient[heroStatus]}`}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-white/80">Latest Result</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-white/20 text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
            </div>
            <p className="text-[25px] font-extrabold tracking-[-0.03em] leading-none text-white">
              {statsQuery.isPending ? '—' : latest ? latest.status : 'No tests'}
            </p>
            <p className="text-[12px] text-white/85 mt-[7px]">
              {latest ? `${latest.method === 'lab' ? 'Laboratory' : 'In-house Device'} · ${formatDate(latest.testDate)}` : 'Add your first test result'}
            </p>
          </article>

          <StatChip
            label="Tests this Month"
            value={stats?.testsThisMonth ?? 0}
            helper="Recorded this month"
            accentClass="border-l-[var(--app-brand)]"
            chipClass="bg-[var(--app-chip-bg)] text-[var(--app-brand)]"
            isLoading={statsQuery.isPending}
          />
          <StatChip
            label="Failed"
            value={stats?.failedThisMonth ?? 0}
            helper="Failed this month"
            accentClass={(stats?.failedThisMonth ?? 0) > 0 ? 'border-l-red-500' : 'border-l-[var(--app-border)]'}
            chipClass={(stats?.failedThisMonth ?? 0) > 0 ? 'bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]' : 'bg-[var(--app-chip-gray-bg)] text-[var(--app-text-faint)]'}
            isLoading={statsQuery.isPending}
          />
          <StatChip
            label="Pass Rate"
            value={`${stats?.passRate ?? 0}%`}
            helper="Passed of all evaluated tests"
            accentClass="border-l-green-500"
            chipClass="bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]"
            bar={stats?.passRate ?? 0}
            isLoading={statsQuery.isPending}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-55">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-faint)] pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></svg>
            </span>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by lab, tester, report no…" className="pl-9" />
          </div>

          <div className="inline-flex p-1 gap-0.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px]">
            {methodFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => { setMethod(filter.key); setPage(1) }}
                className={cn(
                  'px-3.5 py-1.5 rounded-[9px] text-[13px] font-semibold transition-colors border-none',
                  method === filter.key ? 'bg-[var(--app-brand)] text-white shadow-sm' : 'bg-transparent text-[var(--app-text-soft)] hover:text-[var(--app-text)]',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="inline-flex p-1 gap-0.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px]">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => { setStatus(filter.key); setPage(1) }}
                className={cn(
                  'px-3 py-1.5 rounded-[9px] text-[13px] font-semibold transition-colors border-none',
                  status === filter.key ? 'bg-[var(--app-brand)] text-white shadow-sm' : 'bg-transparent text-[var(--app-text-soft)] hover:text-[var(--app-text)]',
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[18px] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[0_6px_22px_rgba(20,100,180,0.06)]">
          <div className="overflow-x-auto">
          <div className={`grid border-b border-[var(--app-border)] bg-[var(--app-surface-2)] px-[18px] ${GRID}`}>
            {['Test', 'Source', 'Method', 'Tested by', 'Status', ''].map((col, i) => (
              <div key={i} className="px-2.5 py-3 text-[11.5px] font-bold tracking-[0.06em] uppercase text-[var(--app-text-faint)]">{col}</div>
            ))}
          </div>

          {testsQuery.isLoading && (
            <div className="divide-y divide-[var(--app-border)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`grid animate-pulse px-[18px] py-4 ${GRID}`}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <div key={j} className="px-2.5 py-1"><div className="h-3 rounded bg-[var(--app-border)] w-3/4" /></div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {testsQuery.isError && (
            <div className="py-16 text-center">
              <p className="text-[15px] font-semibold text-[var(--app-text)]">Failed to load water quality tests</p>
              <p className="text-[13px] text-[var(--app-text-soft)] mt-1">Check your connection and try again.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => testsQuery.refetch()}>Retry</Button>
            </div>
          )}

          {!testsQuery.isLoading && !testsQuery.isError && tests.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-[16px] bg-[var(--app-chip-bg)] flex items-center justify-center mx-auto mb-4 text-[var(--app-brand)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
              </div>
              <p className="text-[15px] font-semibold text-[var(--app-text)]">No water quality tests yet</p>
              <p className="text-[13px] text-[var(--app-text-soft)] mt-1">
                {search || method !== 'all' || status !== 'all' ? 'Try adjusting your filters.' : 'Add your first test result to get started.'}
              </p>
            </div>
          )}

          {!testsQuery.isLoading && !testsQuery.isError && tests.length > 0 && (
            <div className="divide-y divide-[var(--app-border)]">
              {tests.map((test) => (
                <div key={test.id} className={`grid items-center px-[18px] transition-colors hover:bg-[var(--app-surface-2)] ${GRID}`}>
                  <button type="button" onClick={() => setViewTarget(test)} className="flex items-center gap-2.5 px-2.5 py-3.5 text-left min-w-0">
                    <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-[10px] ${statusChip[test.status]}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" /></svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-[var(--app-text)] truncate">{formatDate(test.testDate)}</span>
                      <span className="block text-[11.5px] text-[var(--app-text-faint)] mt-0.5">
                        Test #{test.id}
                        {test.parameters.length > 0 ? ` · ${test.parameters.length} param${test.parameters.length === 1 ? '' : 's'}` : ''}
                      </span>
                    </span>
                  </button>
                  <div className="px-2.5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-2)] px-2.5 py-1 text-[12px] font-medium text-[var(--app-text-soft)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-brand)]" />
                      <span className="truncate">{test.waterSource}</span>
                    </span>
                  </div>
                  <div className="px-2.5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--app-text-soft)]">
                      {test.method === 'lab' ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v6.5L4.5 18A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.8-3L15 9.5V3M8 3h8M7.5 14h9" /></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M9 6.5h6M9 10h6" /></svg>
                      )}
                      <span className="truncate">{test.method === 'lab' ? 'Laboratory' : 'In-house Device'}</span>
                    </span>
                  </div>
                  <div className="px-2.5 py-3.5 flex items-center gap-2 min-w-0">
                    {test.testedBy ? (
                      <>
                        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--app-chip-bg)] text-[10.5px] font-bold uppercase text-[var(--app-brand)]">
                          {test.testedBy.trim().charAt(0)}
                        </span>
                        <span className="text-[13px] text-[var(--app-text-soft)] truncate">{test.testedBy}</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-[var(--app-text-faint)]">—</span>
                    )}
                  </div>
                  <div className="px-2.5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-semibold ${statusChip[test.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {test.status}
                    </span>
                  </div>
                  <div className="px-2 py-3.5 flex items-center justify-center">
                    <WaterQualityRowActions
                      test={test}
                      actor={actor}
                      onView={setViewTarget}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          {total > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-[var(--app-border)] text-[13px] text-[var(--app-text-soft)]">
              <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}{testsQuery.isFetching ? ' · Updating…' : ''}</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <WaterQualityFormDialog mode="add" open={addOpen} onClose={() => setAddOpen(false)} />
      <WaterQualityFormDialog
        mode="edit"
        open={editTarget !== null}
        test={editTarget}
        onClose={() => setEditTarget(null)}
        onDelete={() => {
          const target = editTarget
          setEditTarget(null)
          setDeleteTarget(target)
        }}
      />
      <WaterQualityDetailDialog
        test={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={(test) => { setViewTarget(null); setEditTarget(test) }}
        canEdit={viewTarget ? canEditWaterQualityTest(viewTarget, actor) : false}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(next) => { if (!next) setDeleteTarget(null) }}
        title="Delete test result?"
        description="This removes the test from your records. Mirrored files remain in Documents."
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={deleteMutation.isPending}
        variant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </div>
  )
}
