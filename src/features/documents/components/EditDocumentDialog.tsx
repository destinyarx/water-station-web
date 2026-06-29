'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { documentFormSchema } from '../documents.schema'
import type { Document, DocumentFormInput, DocumentFormValues } from '../documents.types'
import { DOCUMENT_TYPES, documentCategoryValues, type DocumentCategory } from '../documents.constants'
import { toFormValues } from '../documents.mapper'
import { useUpdateDocument } from '../hooks/use-update-document'

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

  const selectedCategory = watch('category') as DocumentCategory | ''
  const docTypeOptions = selectedCategory ? (DOCUMENT_TYPES[selectedCategory] ?? []) : []

  useEffect(() => {
    if (doc) reset(toFormValues(doc))
  }, [doc, reset])

  function onSubmit(values: DocumentFormValues) {
    if (!doc) return
    mutate({ id: doc.id, values }, { onSuccess: onClose })
  }

  return (
    <Dialog open={doc !== null} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex-none w-11 h-11 rounded-[13px] flex items-center justify-center"
              style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', boxShadow: '0 8px 20px rgba(14,108,196,0.28)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
              </svg>
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold text-[var(--app-text)]">Edit document</DialogTitle>
              <p className="text-[13px] text-[var(--app-text-soft)] mt-0.5 truncate max-w-[280px]">{doc?.title}</p>
            </div>
          </div>
        </DialogHeader>

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
                <div className="flex gap-2.5">
                  {(['all', 'only_me'] as const).map((v) => {
                    const isSelected = field.value === v
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => field.onChange(v)}
                        className={cn(
                          'flex-1 flex items-center gap-2.5 px-3.5 py-3 rounded-[11px] border-2 text-left transition-colors',
                          isSelected
                            ? 'border-[var(--app-brand)] bg-[var(--app-chip-bg)]'
                            : 'border-[var(--app-border)] bg-[var(--app-surface)]',
                        )}
                      >
                        <div
                          className={cn(
                            'flex-none w-8 h-8 rounded-[9px] flex items-center justify-center',
                            isSelected
                              ? 'bg-[var(--app-brand)] text-white'
                              : 'bg-[var(--app-surface-2)] text-[var(--app-text-soft)]',
                          )}
                        >
                          {v === 'all' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="8" r="3" />
                              <path d="M3.5 19c0-3 2.4-4.8 5.5-4.8s5.5 1.8 5.5 4.8" />
                              <path d="M15.5 5a3 3 0 0 1 0 5.6M17.2 19c0-2.1-.7-3.5-1.9-4.4" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="5" y="11" width="14" height="10" rx="2" />
                              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={cn('text-[13.5px] font-semibold leading-tight', isSelected ? 'text-[var(--app-brand)]' : 'text-[var(--app-text)]')}>
                            {v === 'all' ? 'All staff' : 'Just me'}
                          </p>
                          <p className="text-[11.5px] text-[var(--app-text-soft)] mt-0.5">
                            {v === 'all' ? 'Everyone in this workspace can view' : 'Hidden from other staff members'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
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
      </DialogContent>
    </Dialog>
  )
}
