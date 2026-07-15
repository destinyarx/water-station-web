'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { AppModal } from '@/components/app/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { documentFormSchema } from '../documents.schema'
import type { Document, DocumentFormInput, DocumentFormValues } from '../documents.types'
import { DOCUMENT_TYPES, documentCategoryValues } from '../documents.constants'
import { toFormValues } from '../documents.mapper'
import { useUpdateDocument } from '../hooks/use-update-document'
import { VisibilityToggle } from './visibility-toggle'

interface EditDocumentDialogProps {
  doc: Document | null
  onClose: () => void
}

export function EditDocumentDialog({ doc, onClose }: EditDocumentDialogProps) {
  const { mutate, isPending } = useUpdateDocument()

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<DocumentFormInput, unknown, DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: doc ? toFormValues(doc) : undefined,
  })

  const selectedCategory = watch('category')
  const docTypeOptions = selectedCategory ? (DOCUMENT_TYPES[selectedCategory] ?? []) : []

  useEffect(() => {
    if (doc) reset(toFormValues(doc))
  }, [doc, reset])

  function onSubmit(values: DocumentFormValues) {
    if (!doc) return
    mutate({ id: doc.id, values }, { onSuccess: onClose })
  }

  return (
    <AppModal
      open={doc !== null}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Edit document"
      description={doc?.title}
      size="md"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
        </svg>
      }
    >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          {/* Document info */}
          <div className="bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-[14px] p-[18px] flex flex-col gap-[14px]">
            <p className="text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)]">Document info</p>
            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input {...register('title')} className={cn(errors.title && 'border-destructive')} />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">Description</Label>
              <textarea
                {...register('description')}
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

          {/* Expiry */}
          <div>
            <Label className="text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block">
              Expiry date{' '}
              <span className="text-[var(--app-text-faint)] font-normal">optional</span>
            </Label>
            <Input type="date" {...register('expiryDate')} />
          </div>

          {/* Visibility */}
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
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
    </AppModal>
  )
}
