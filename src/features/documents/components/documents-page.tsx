'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { Document } from '../documents.types'
import { useDocuments, useDocumentStats } from '../hooks/use-documents'
import { UploadDocumentDialog } from './upload-document-dialog'
import { EditDocumentDialog } from './edit-document-dialog'
import { DeleteDocumentDialog } from './delete-document-dialog'
import { DocumentRowActions } from './document-row-actions'

type VisFilter = 'all' | 'mine' | 'private'
type DocStatus = 'expired' | 'expiring' | 'approved' | 'uploaded'

const CATEGORY_OPTIONS = [
  'Business Permits',
  'Tax & BIR Documents',
  'Water Quality Tests',
  'Sanitary & Health',
  'Sales & Customer Receipts',
  'Expenses & Supplier',
  'Equipment & Maintenance',
  'Delivery & Vehicle',
  'Employee Documents',
  'Other',
]

function getFileExt(originalName: string | null): string {
  if (!originalName) return '—'
  const parts = originalName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase().slice(0, 4) : '—'
}

function getFileIconColors(ext: string): { bg: string; color: string } {
  if (ext === 'PDF') return { bg: 'rgba(220,38,38,0.1)', color: '#dc2626' }
  if (ext === 'JPG' || ext === 'PNG' || ext === 'GIF') return { bg: 'rgba(34,197,94,0.1)', color: '#15803d' }
  if (ext === 'XLSX' || ext === 'CSV') return { bg: 'rgba(34,197,94,0.12)', color: '#166534' }
  if (ext === 'DOCX' || ext === 'DOC') return { bg: 'rgba(59,130,246,0.1)', color: '#1d4ed8' }
  return { bg: 'var(--app-chip-bg)', color: 'var(--app-brand)' }
}

function getDocStatus(doc: Document, today: Date): DocStatus {
  if (doc.expiryDate) {
    const expiry = new Date(doc.expiryDate)
    if (expiry < today) return 'expired'
    const in30 = new Date(today)
    in30.setDate(in30.getDate() + 30)
    if (expiry <= in30) return 'expiring'
  }
  return doc.isApproved ? 'approved' : 'uploaded'
}

function StatusBadge({ status }: { status: DocStatus }) {
  const styles: Record<DocStatus, { bg: string; color: string; label: string }> = {
    expired:  { bg: 'var(--app-chip-red-bg)',   color: 'var(--app-chip-red-text)',   label: 'Expired' },
    expiring: { bg: 'var(--app-chip-amber-bg)', color: 'var(--app-chip-amber-text)', label: 'Expiring' },
    approved: { bg: 'var(--app-chip-green-bg)', color: 'var(--app-chip-green-text)', label: 'Approved' },
    uploaded: { bg: 'var(--app-chip-bg)',       color: 'var(--app-brand)',            label: 'Uploaded' },
  }
  const s = styles[status]
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-[7px] text-[12px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

interface StatChipProps {
  label: string
  value: number
  helper: string
  accentColor: string
  chipBg?: string
  chipColor?: string
  isLoading?: boolean
  icon: React.ReactNode
}

/** Matches the deliveries board's stat card. */
function StatChip({ label, value, helper, accentColor, chipBg, chipColor, isLoading, icon }: StatChipProps) {
  return (
    <article
      className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[16px] px-4 py-[15px]"
      style={{ borderLeft: `3px solid ${accentColor}`, boxShadow: 'var(--app-shadow-card)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-[var(--app-text-faint)]">
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-[9px] flex items-center justify-center"
          style={{ background: chipBg ?? 'var(--app-chip-bg)', color: chipColor ?? 'var(--app-brand)' }}
        >
          {icon}
        </div>
      </div>
      <p className="text-[25px] font-extrabold tracking-[-0.03em] leading-none text-[var(--app-text)]">
        {isLoading ? <span className="text-[var(--app-text-faint)]">—</span> : value}
      </p>
      <p className="text-[12px] text-[var(--app-text-soft)] mt-[7px]">{helper}</p>
    </article>
  )
}

/** The lead gradient card, mirroring the deliveries board's featured stat. */
function FeaturedStat({ label, value, helper, isLoading, icon }: { label: string; value: number; helper: string; isLoading: boolean; icon: React.ReactNode }) {
  return (
    <article
      className="relative overflow-hidden rounded-[16px] px-4 py-[15px]"
      style={{ background: 'linear-gradient(150deg,#0b73c8,#075098)', boxShadow: '0 14px 30px rgba(14,108,196,0.26)' }}
    >
      <div className="absolute -right-4 -bottom-[22px] leading-none opacity-[0.22]">
        <svg width="150" height="80" viewBox="0 0 150 80" preserveAspectRatio="none">
          <path d="M0 44 C30 26 55 56 85 42 C115 28 135 50 150 40 L150 80 L0 80 Z" fill="#fff" />
        </svg>
      </div>
      <div className="relative">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-[#bfe2ff]">{label}</p>
          <div className="w-7 h-7 rounded-[9px] flex items-center justify-center text-white" style={{ background: 'rgba(255,255,255,0.18)' }}>
            {icon}
          </div>
        </div>
        <p className="text-[25px] font-extrabold tracking-[-0.03em] leading-none text-white">
          {isLoading ? '—' : value}
        </p>
        <p className="text-[12px] text-[#bfe2ff] mt-[7px]">{helper}</p>
      </div>
    </article>
  )
}

export function DocumentsPage() {
  const { userId } = useAuth()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Document | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [visFilter, setVisFilter] = useState<VisFilter>('all')
  const [page, setPage] = useState(1)
  const perPage = 20
  const documentsQuery = useDocuments({ active: true, search: debouncedSearch, category: catFilter, visibility: visFilter, currentUserId: userId ?? '', page, perPage })
  const statsQuery = useDocumentStats()
  const documents = documentsQuery.data?.documents ?? []
  const total = documentsQuery.data?.total ?? 0
  const stats = statsQuery.data ?? { total: 0, privateCount: 0, sharedCount: 0, expiringSoon: 0 }
  const pageCount = Math.max(1, Math.ceil(total / perPage))

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 300)
    return () => window.clearTimeout(id)
  }, [search])

  const visFilters: { key: VisFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'mine', label: 'Mine' },
    { key: 'private', label: 'Private' },
  ]

  return (
    <div className="min-h-screen bg-[var(--app-page-bg)]">
      <div className="max-w-[1200px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--app-text)] leading-tight">Documents</h1>
            <p className="text-[14px] text-[var(--app-text-soft)] mt-1">
              Upload, organize, and manage business permits, receipts, compliance records, and other important files.
            </p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="flex-none gap-2 px-5"
            style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload document
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3.5 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <FeaturedStat
            label="Total Documents"
            value={stats.total}
            helper="Documents in your station"
            isLoading={statsQuery.isPending}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8M16 17H8M10 9H8" />
              </svg>
            }
          />
          <StatChip
            label="Private"
            value={stats.privateCount}
            helper="Visible to uploader only"
            accentColor="#f59e0b"
            chipBg="var(--app-chip-amber-bg)"
            chipColor="var(--app-chip-amber-text)"
            isLoading={statsQuery.isPending}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            }
          />
          <StatChip
            label="Expiring Soon"
            value={stats.expiringSoon}
            helper="Expiring within 30 days"
            accentColor={stats.expiringSoon > 0 ? '#ef4444' : 'var(--app-border)'}
            chipBg={stats.expiringSoon > 0 ? 'var(--app-chip-red-bg)' : 'var(--app-chip-gray-bg)'}
            chipColor={stats.expiringSoon > 0 ? 'var(--app-chip-red-text)' : 'var(--app-text-faint)'}
            isLoading={statsQuery.isPending}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            }
          />
          <StatChip
            label="Shared"
            value={stats.sharedCount}
            helper="Visible to all staff"
            accentColor="#22c55e"
            chipBg="var(--app-chip-green-bg)"
            chipColor="var(--app-chip-green-text)"
            isLoading={statsQuery.isPending}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="2.5" />
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="19" r="2.5" />
                <path d="M8.4 10.9l7.2-4.2M8.4 13.1l7.2 4.2" />
              </svg>
            }
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <div className="relative flex-1 min-w-55 mr-20">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-faint)] pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M20 20l-3.6-3.6" />
              </svg>
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="pl-9"
            />
          </div>

          <select
            value={catFilter}
            onChange={(e) => { setCatFilter(e.target.value); setPage(1) }}
            className="px-3 py-[10px] border border-[var(--app-border-strong)] rounded-[11px] bg-[var(--app-surface)] text-[var(--app-text)] text-[13.5px] font-[inherit] outline-none cursor-pointer"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="inline-flex p-1 gap-0.5 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[12px]">
            {visFilters.map((vf) => (
              <button
                key={vf.key}
                type="button"
                onClick={() => { setVisFilter(vf.key); setPage(1) }}
                className={cn(
                  'px-4 py-1.5 rounded-[9px] text-[13px] font-semibold transition-colors cursor-pointer border-none',
                  visFilter === vf.key
                    ? 'bg-[var(--app-brand)] text-white shadow-sm'
                    : 'bg-transparent text-[var(--app-text-soft)] hover:text-[var(--app-text)]',
                )}
              >
                {vf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-[var(--app-surface)] border border-[var(--app-border)] rounded-[18px] overflow-hidden"
          style={{ boxShadow: '0 6px 22px rgba(20,100,180,0.06)' }}
        >
          {/* Head */}
          <div
            className="grid border-b border-[var(--app-border)] bg-[var(--app-surface-2)] px-[18px]"
            style={{ gridTemplateColumns: '2fr 2.2fr 1.5fr 120px 96px 52px' }}
          >
            {['Title', 'Description', 'Category / Type', 'Date', 'Status', ''].map((col) => (
              <div
                key={col}
                className="px-2.5 py-3 text-[11.5px] font-bold tracking-[0.06em] uppercase text-[var(--app-text-faint)]"
              >
                {col}
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {(documentsQuery.isLoading || statsQuery.isLoading) && (
            <div className="divide-y divide-[var(--app-border)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="grid px-[18px] py-4 animate-pulse"
                  style={{ gridTemplateColumns: '2fr 2.2fr 1.5fr 120px 96px 52px' }}
                >
                  <div className="flex items-center gap-2.5 px-2.5">
                    <div className="w-8 h-8 rounded-[9px] bg-[var(--app-border)]" />
                    <div className="flex-1 h-3 rounded bg-[var(--app-border)]" />
                  </div>
                  <div className="px-2.5 py-1"><div className="h-3 rounded bg-[var(--app-border)] w-4/5" /></div>
                  <div className="px-2.5 py-1"><div className="h-3 rounded bg-[var(--app-border)] w-3/5" /></div>
                  <div className="px-2.5 py-1"><div className="h-3 rounded bg-[var(--app-border)] w-2/3" /></div>
                  <div className="px-2.5 py-1"><div className="h-5 rounded-[7px] bg-[var(--app-border)] w-16" /></div>
                  <div />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {(documentsQuery.isError || statsQuery.isError) && (
            <div className="py-16 text-center">
              <p className="text-[15px] font-semibold text-[var(--app-text)]">Failed to load documents</p>
              <p className="text-[13px] text-[var(--app-text-soft)] mt-1">Check your connection and try again.</p>
            </div>
          )}

          {/* Empty */}
          {!documentsQuery.isLoading && !statsQuery.isLoading && !documentsQuery.isError && !statsQuery.isError && documents.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-[16px] bg-[var(--app-chip-bg)] flex items-center justify-center mx-auto mb-4 text-[var(--app-brand)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <p className="text-[15px] font-semibold text-[var(--app-text)]">No documents found</p>
              <p className="text-[13px] text-[var(--app-text-soft)] mt-1">
                {search || catFilter !== 'all' || visFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Upload your first document to get started.'}
              </p>
            </div>
          )}

          {/* Rows */}
          {!documentsQuery.isLoading && !statsQuery.isLoading && !documentsQuery.isError && !statsQuery.isError && documents.length > 0 && (
            <div className="divide-y divide-[var(--app-border)]">
              {documents.map((doc) => {
                const ext = getFileExt(doc.originalName)
                const { bg: iconBg, color: iconColor } = getFileIconColors(ext)
                const status = getDocStatus(doc, today)

                return (
                  <div
                    key={doc.id}
                    className="grid px-[18px] items-center hover:bg-[var(--app-surface-2)] transition-colors"
                    style={{ gridTemplateColumns: '2fr 2.2fr 1.5fr 120px 96px 52px' }}
                  >
                    {/* Title */}
                    <div className="px-2.5 py-3.5 flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex-none w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[9px] font-extrabold tracking-[0.03em]"
                        style={{ background: iconBg, color: iconColor }}
                      >
                        {ext}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-semibold text-[var(--app-text)] truncate max-w-[160px]">
                            {doc.title}
                          </span>
                          {doc.visibility === 'only_me' && (
                            <span title="Private" className="flex-none text-[var(--app-chip-amber-text)]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="5" y="11" width="14" height="10" rx="2" />
                                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[var(--app-text-faint)] mt-0.5 truncate">
                          {doc.uploaderName ?? doc.createdBy}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="px-2.5 py-3.5 text-[13px] text-[var(--app-text-soft)] line-clamp-2 leading-[1.45]">
                      {doc.description ?? (
                        <span className="text-[var(--app-text-faint)] italic">No description</span>
                      )}
                    </div>

                    {/* Category / Type */}
                    <div className="px-2.5 py-3.5 flex flex-col gap-1">
                      <span className="text-[11px] font-bold tracking-[0.04em] uppercase text-[var(--app-brand)]">
                        {doc.category}
                      </span>
                      {doc.documentType && (
                        <span className="inline-flex items-center text-[12px] font-semibold text-[var(--app-chip-gray-text)] bg-[var(--app-chip-gray-bg)] px-2 py-0.5 rounded-[7px] self-start truncate max-w-[180px]">
                          {doc.documentType}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="px-2.5 py-3.5 text-[13px] text-[var(--app-text-soft)]">
                      {doc.documentDate ? (
                        new Date(doc.documentDate).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      ) : (
                        <span className="text-[var(--app-text-faint)]">—</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="px-2.5 py-3.5">
                      <StatusBadge status={status} />
                    </div>

                    {/* Actions */}
                    <div className="px-2 py-3.5 flex items-center justify-center">
                      <DocumentRowActions
                        doc={doc}
                        onEdit={setEditTarget}
                        onDelete={setDeleteTarget}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {total > 0 ? (
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--app-border)] text-[13px] text-[var(--app-text-soft)]">
              <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}{documentsQuery.isFetching ? ' · Updating…' : ''}</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <UploadDocumentDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <EditDocumentDialog doc={editTarget} onClose={() => setEditTarget(null)} />
      <DeleteDocumentDialog doc={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </div>
  )
}
