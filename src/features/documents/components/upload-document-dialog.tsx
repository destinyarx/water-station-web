'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { AppModal } from '@/components/app/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { documentFormSchema } from '../documents.schema'
import type { DocumentFormInput, DocumentFormValues } from '../documents.types'
import {
  DOCUMENT_FORM_DEFAULTS,
  DOCUMENT_TYPES,
  documentCategoryValues,
  type DocumentCategory,
} from '../documents.constants'
import { useCreateDocument } from '../hooks/use-create-document'
import { useDocumentOwner } from '../hooks/use-document-owner'
import { VisibilityToggle } from './visibility-toggle'

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif'

interface UploadDocumentDialogProps {
  open: boolean
  onClose: () => void
}

export function UploadDocumentDialog({ open, onClose }: UploadDocumentDialogProps) {
  const owner = useDocumentOwner()
  const { mutate, isPending } = useCreateDocument(owner)

  // ponytail: file is selected client-side only — storage upload isn't wired yet
  // (no bucket / file-path column). Upgrade path: upload to Supabase Storage on
  // submit and persist the path alongside the row.
  const [file, setFile] = useState<File | null>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<DocumentFormInput, unknown, DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: DOCUMENT_FORM_DEFAULTS,
  })

  const selectedCategory = watch('category') as DocumentCategory | ''
  const docTypeOptions = selectedCategory ? (DOCUMENT_TYPES[selectedCategory] ?? []) : []

  useEffect(() => {
    if (!open) {
      reset(DOCUMENT_FORM_DEFAULTS)
      setFile(null)
    }
  }, [open, reset])

  function onSubmit(values: DocumentFormValues) {
    mutate(values, {
      onSuccess: () => {
        onClose()
        reset(DOCUMENT_FORM_DEFAULTS)
        setFile(null)
      },
    })
  }

  return (
    <AppModal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Upload document"
      description="Max 2 MB · PNG, JPG, WEBP, GIF"
      size="md"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M12 18v-6M9 15l3-3 3 3" />
        </svg>
      }
    >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* Image picker — click or drop to attach an image */}
          {file && previewUrl ? (
            <div className="flex items-center gap-3 border border-[var(--app-border)] rounded-[14px] p-3 bg-[var(--app-surface-2)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={file.name}
                className="w-14 h-14 rounded-[10px] object-cover flex-none border border-[var(--app-border)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--app-text)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--app-text-faint)] mt-0.5">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="flex-none text-xs font-semibold text-[var(--app-brand)] hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const dropped = e.dataTransfer.files?.[0]
                if (dropped && dropped.type.startsWith('image/')) setFile(dropped)
              }}
              className="block cursor-pointer border-2 border-dashed border-[var(--app-border-strong)] rounded-[14px] p-7 text-center bg-[var(--app-surface-2)] hover:border-[var(--app-brand)] transition-colors"
            >
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={(e) => {
                  const picked = e.target.files?.[0]
                  if (picked) setFile(picked)
                }}
              />
              <div className="w-12 h-12 rounded-[14px] bg-[var(--app-chip-bg)] flex items-center justify-center mx-auto mb-3 text-[var(--app-brand)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[var(--app-text-soft)]">Click or drop an image to attach</p>
              <p className="text-xs text-[var(--app-text-faint)] mt-1">PNG, JPG, WEBP or GIF</p>
            </label>
          )}

          {/* Document info */}
          <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-[14px] p-[18px] flex flex-col gap-[14px]">
            <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)]">Document info</p>

            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                {...register('title')}
                placeholder="e.g. June 2026 Electricity Bill"
                className={cn(errors.title && 'border-destructive')}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">Description</Label>
              <textarea
                {...register('description')}
                placeholder="Brief notes about this document…"
                rows={2}
                style={{ width: '100%', padding: '10px 13px', border: '1px solid var(--app-border-strong)', borderRadius: '11px', background: 'var(--app-surface)', color: 'var(--app-text)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-2 gap-[14px]">
            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <select
                    {...field}
                    className={cn(
                      'w-full px-3 py-[11px] border rounded-[11px] bg-[var(--app-surface)] text-[var(--app-text)] text-[13.5px] font-[inherit] outline-none cursor-pointer',
                      errors.category ? 'border-destructive' : 'border-[var(--app-border-strong)]',
                    )}
                  >
                    <option value="">Select category…</option>
                    {documentCategoryValues.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              />
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">Document type</Label>
              <Controller
                control={control}
                name="documentType"
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={!selectedCategory}
                    className="w-full px-3 py-[11px] border border-[var(--app-border-strong)] rounded-[11px] bg-[var(--app-surface)] text-[var(--app-text)] text-[13.5px] font-[inherit] outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select type…</option>
                    {docTypeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>

          {/* Date + Amount */}
          <div className="grid grid-cols-2 gap-[14px]">
            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">Document date</Label>
              <Input type="date" {...register('documentDate')} />
            </div>
            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
                Amount (₱){' '}
                <span className="text-[var(--app-text-faint)] font-normal">optional</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[var(--app-text-soft)] text-sm">₱</span>
                <Input {...register('amount')} placeholder="0.00" className="pl-6" />
              </div>
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Expiry date */}
          <div>
            <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
              Expiry date{' '}
              <span className="text-[var(--app-text-faint)] font-normal">optional — for permits &amp; certificates</span>
            </Label>
            <Input type="date" {...register('expiryDate')} />
          </div>

          {/* Visibility toggle */}
          <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-[14px] p-[16px] pb-[18px]">
            <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)] mb-3">Visibility</p>
            <Controller
              control={control}
              name="visibility"
              render={({ field }) => (
                <VisibilityToggle value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--app-border)]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="gap-2"
              style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {isPending ? 'Saving…' : 'Save document'}
            </Button>
          </div>
        </form>
    </AppModal>
  )
}
