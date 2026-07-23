'use client'

import { AppModal } from '@/components/app/app-modal'
import { useClerkSupabase } from '@/hooks/use-clerk-supabase'
import { toast } from '@/stores/toast-store'

import { createAttachmentSignedUrl } from '../services/water-quality.service'
import type { TestStatus, WaterQualityTest } from '../water-quality.types'

/** Highlight banner colours — the overall result is the headline of this modal. */
const statusBanner: Record<TestStatus, string> = {
  Passed: 'bg-[linear-gradient(150deg,#22a95f,#128046)] shadow-[0_12px_26px_rgba(18,128,70,0.28)]',
  Warning: 'bg-[linear-gradient(150deg,#e0a800,#b45309)] shadow-[0_12px_26px_rgba(180,83,9,0.28)]',
  Failed: 'bg-[linear-gradient(150deg,#e0483a,#b3261a)] shadow-[0_12px_26px_rgba(179,38,26,0.28)]',
  Pending: 'bg-[linear-gradient(150deg,#5b7285,#3f5568)] shadow-[0_12px_26px_rgba(63,85,104,0.26)]',
}

const statusCaption: Record<TestStatus, string> = {
  Passed: 'All recorded readings met the standard.',
  Warning: 'Readings need attention — review below.',
  Failed: 'This test did not meet the standard.',
  Pending: 'Result not evaluated yet.',
}

function StatusIcon({ status }: { status: TestStatus }) {
  const path =
    status === 'Passed'
      ? 'M20 6 9 17l-5-5'
      : status === 'Failed'
        ? 'M18 6 6 18M6 6l12 12'
        : status === 'Warning'
          ? 'M12 3 2 20h20L12 3ZM12 9v5M12 17.5v.01'
          : 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--app-border)] last:border-0">
      <span className="text-[12.5px] text-[var(--app-text-soft)]">{label}</span>
      <span className="text-[13px] font-semibold text-[var(--app-text)] text-right">{value ?? '—'}</span>
    </div>
  )
}

function ActivityRow({ label, who, when }: { label: string; who: string | null; when: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3.5 py-2.5">
      <span className="text-[12.5px] font-semibold text-[var(--app-text)]">
        {label}
        {who ? <span className="font-normal text-[var(--app-text-soft)]"> by {who}</span> : null}
      </span>
      <span className="text-[12px] text-[var(--app-text-faint)]">{when}</span>
    </div>
  )
}

interface WaterQualityDetailDialogProps {
  test: WaterQualityTest | null
  onClose: () => void
  onEdit: (test: WaterQualityTest) => void
  canEdit: boolean
}

export function WaterQualityDetailDialog({ test, onClose, onEdit, canEdit }: WaterQualityDetailDialogProps) {
  const client = useClerkSupabase()

  if (!test) return null

  async function download(documentId: number): Promise<void> {
    try {
      const url = await createAttachmentSignedUrl(client, documentId)
      window.open(url, '_blank', 'noopener')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to open attachment.')
    }
  }

  const methodLabel = test.method === 'lab' ? 'Laboratory' : 'In-house Device'

  return (
    <AppModal
      open={test !== null}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={methodLabel}
      description={`Test #${test.id} · ${formatDate(test.testDate)}`}
      maxWidth="620px"
    >
      <div className="flex flex-col gap-5 mt-1">
        {/* Overall result — the highlight of this modal */}
        <div className={`flex items-center gap-3.5 rounded-[16px] px-4 py-3.5 text-white ${statusBanner[test.status]}`}>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[13px] bg-white/20">
            <StatusIcon status={test.status} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/80">Overall result</p>
            <p className="text-[24px] font-extrabold leading-none tracking-[-0.02em] mt-1">{test.status}</p>
            <p className="text-[12px] text-white/85 mt-1.5">{statusCaption[test.status]}</p>
          </div>
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(test)}
              className="flex-none rounded-[10px] border border-white/35 bg-white/15 px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-white/25 transition-colors"
            >
              Edit
            </button>
          ) : null}
        </div>

        <section className="rounded-[14px] border border-[var(--app-border)] bg-[var(--app-surface-2)] px-4 py-2">
          <InfoRow label="Test date" value={formatDate(test.testDate)} />
          <InfoRow label="Water source" value={test.waterSource} />
          <InfoRow label="Method" value={methodLabel} />
          {test.method === 'lab' ? (
            <>
              <InfoRow label="Laboratory" value={test.labName} />
              <InfoRow label="Report no." value={test.reportNo} />
              <InfoRow label="Report date" value={test.reportDate ? formatDate(test.reportDate) : null} />
            </>
          ) : (
            <>
              <InfoRow label="Device" value={test.deviceType} />
              <InfoRow label="Model" value={test.deviceModel} />
              <InfoRow label="Tested at" value={test.testedAt ? formatDate(test.testedAt) : null} />
            </>
          )}
          <InfoRow label="Tested by" value={test.testedBy} />
        </section>

        {test.parameters.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between gap-3 mb-2">
              <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)]">Results</p>
              <span className="text-[11.5px] text-[var(--app-text-faint)]">
                {test.parameters.length} {test.parameters.length === 1 ? 'parameter' : 'parameters'}
              </span>
            </div>
            {/* Full-width rows so a single reading never leaves half the modal empty. */}
            <div className="overflow-hidden rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)]">
              <div className="grid grid-cols-[1.2fr_auto] sm:grid-cols-[1.2fr_0.9fr_1fr] gap-3 px-3.5 py-2 bg-[var(--app-surface-2)] border-b border-[var(--app-border)]">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--app-text-faint)]">Parameter</span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--app-text-faint)] text-right sm:text-left">Reading</span>
                <span className="hidden sm:block text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--app-text-faint)]">Reference</span>
              </div>
              <div className="divide-y divide-[var(--app-border)]">
                {test.parameters.map((parameter, index) => (
                  <div key={`${parameter.name}-${index}`} className="grid grid-cols-[1.2fr_auto] sm:grid-cols-[1.2fr_0.9fr_1fr] gap-3 items-center px-3.5 py-2.5">
                    <span className="text-[13px] font-semibold text-[var(--app-text)] truncate">{parameter.name}</span>
                    <span className="text-[15px] font-bold text-[var(--app-text)] text-right sm:text-left tabular-nums">
                      {parameter.value}
                      {parameter.unit ? <span className="text-[11.5px] font-semibold text-[var(--app-text-soft)]"> {parameter.unit}</span> : null}
                    </span>
                    <span className="col-span-2 sm:col-span-1 text-[11.5px] text-[var(--app-text-faint)]">
                      {parameter.refRange ? `Ref ${parameter.refRange}` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {test.documentIds.length > 0 ? (
          <section>
            <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)] mb-2">Attachments</p>
            <div className="flex flex-col gap-2">
              {test.documentIds.map((documentId) => (
                <button
                  key={documentId}
                  type="button"
                  onClick={() => download(documentId)}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-2.5 text-left hover:border-[var(--app-brand)]"
                >
                  <span className="text-[13px] font-semibold text-[var(--app-text)]">Attachment #{documentId}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--app-brand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)] mb-2">Remarks</p>
          <div className="flex gap-3 rounded-[12px] border border-[var(--app-border)] border-l-[3px] border-l-[var(--app-brand)] bg-[var(--app-surface-2)] px-3.5 py-3">
            <svg className="mt-0.5 flex-none text-[var(--app-text-faint)]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
            </svg>
            <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${test.remarks ? 'text-[var(--app-text)]' : 'text-[var(--app-text-faint)] italic'}`}>
              {test.remarks ?? 'No remarks were recorded for this test.'}
            </p>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)] mb-2">Activity</p>
          <div className="rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface-2)] divide-y divide-[var(--app-border)]">
            <ActivityRow
              label="Recorded"
              who={test.createdByName ?? test.createdBy}
              when={formatDate(test.createdAt)}
            />
            {test.updatedAt ? (
              <ActivityRow label="Last updated" who={null} when={formatDate(test.updatedAt)} />
            ) : null}
          </div>
        </section>
      </div>
    </AppModal>
  )
}
