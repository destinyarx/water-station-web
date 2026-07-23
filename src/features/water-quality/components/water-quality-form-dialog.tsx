'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { AppModal } from '@/components/app/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { waterQualityFormSchema, validateAttachments } from '../water-quality.schema'
import {
  waterQualityFormDefaults,
  WATER_QUALITY_ACCEPTED_MIME_TYPES,
  deviceTypeValues,
  statusValues,
  suggestedParameterNames,
  waterSourceValues,
} from '../water-quality.constants'
import { toFormValues } from '../water-quality.mapper'
import type {
  TestStatus,
  WaterQualityFormInput,
  WaterQualityFormValues,
  WaterQualityTest,
} from '../water-quality.types'
import { useCreateWaterQualityTest } from '../hooks/use-create-water-quality-test'
import { useUpdateWaterQualityTest } from '../hooks/use-update-water-quality-test'

const ACCEPTED_FILE_TYPES = WATER_QUALITY_ACCEPTED_MIME_TYPES.join(',')

const SECTION_LABEL =
  'text-[11px] font-bold tracking-[0.07em] uppercase text-[var(--app-brand)]'
const FIELD_LABEL =
  'text-[13px] font-semibold text-[var(--app-text)] mb-1.5 block'
const CARD =
  'bg-[var(--app-surface-2)] border border-[var(--app-border)] rounded-[14px] p-[18px] flex flex-col gap-[14px]'

const statusStyles: Record<TestStatus, string> = {
  Passed: 'border-green-500 bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]',
  Warning: 'border-amber-500 bg-[var(--app-chip-amber-bg)] text-[var(--app-chip-amber-text)]',
  Failed: 'border-red-500 bg-[var(--app-chip-red-bg)] text-[var(--app-chip-red-text)]',
  Pending: 'border-[var(--app-border-strong)] bg-[var(--app-chip-gray-bg)] text-[var(--app-chip-gray-text)]',
}

interface WaterQualityFormDialogProps {
  mode: 'add' | 'edit'
  open: boolean
  onClose: () => void
  test?: WaterQualityTest | null
  onDelete?: () => void
}

export function WaterQualityFormDialog({
  mode,
  open,
  onClose,
  test,
  onDelete,
}: WaterQualityFormDialogProps) {
  const createMutation = useCreateWaterQualityTest()
  const updateMutation = useUpdateWaterQualityTest()
  const isPending =
    mode === 'add' ? createMutation.isPending : updateMutation.isPending

  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<WaterQualityFormInput, unknown, WaterQualityFormValues>({
    resolver: zodResolver(waterQualityFormSchema),
    defaultValues: waterQualityFormDefaults(),
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'parameters' })
  const method = watch('method')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && test) {
      reset(toFormValues(test))
    } else {
      reset(waterQualityFormDefaults())
    }
    setFiles([])
    setFileError(null)
  }, [open, mode, test, reset])

  function addFiles(picked: FileList | null): void {
    if (!picked || picked.length === 0) return
    const next = [...files, ...Array.from(picked)]
    const error = validateAttachments(next)
    if (error) {
      setFileError(error)
      return
    }
    setFiles(next)
    setFileError(null)
  }

  function removeFile(index: number): void {
    setFiles((current) => current.filter((_, i) => i !== index))
    setFileError(null)
  }

  function onSubmit(values: WaterQualityFormValues): void {
    const error = validateAttachments(files)
    if (error) {
      setFileError(error)
      return
    }

    if (mode === 'add') {
      createMutation.mutate(
        { values, files },
        { onSuccess: () => onClose() },
      )
    } else if (test) {
      updateMutation.mutate(
        { id: test.id, input: { values, files } },
        { onSuccess: () => onClose() },
      )
    }
  }

  return (
    <AppModal
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title={mode === 'add' ? 'Add test result' : 'Edit test result'}
      description="Record a water quality test — status is set here, not derived."
      maxWidth="640px"
      icon={
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" />
          <path d="M9 15c1 1 2 1.4 3 1.4" />
        </svg>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-1">
        {/* BASIC INFORMATION */}
        <section className={CARD}>
          <p className={SECTION_LABEL}>Basic information</p>
          <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-[14px]">
            <div className="min-w-0">
              <Label className={FIELD_LABEL}>
                Test date <span className="text-destructive">*</span>
              </Label>
              <Input type="date" {...register('testDate')} className={cn('w-full', errors.testDate && 'border-destructive')} />
              {errors.testDate && <p className="text-xs text-destructive mt-1">{errors.testDate.message}</p>}
            </div>
            <div className="min-w-0">
              <Label className={FIELD_LABEL}>
                Overall result <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div className="grid grid-cols-4 gap-1.5">
                    {statusValues.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => field.onChange(status)}
                        className={cn(
                          'px-1 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors text-center truncate',
                          field.value === status
                            ? statusStyles[status]
                            : 'border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-soft)]',
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>
          </div>
          <div>
            <Label className={FIELD_LABEL}>
              Water source <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="waterSource"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {waterSourceValues.map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => field.onChange(source)}
                      className={cn(
                        'px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors',
                        field.value === source
                          ? 'border-[var(--app-brand)] bg-[var(--app-chip-bg)] text-[var(--app-brand)]'
                          : 'border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-soft)]',
                      )}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </section>

        {/* TESTING METHOD */}
        <section className={CARD}>
          <p className={SECTION_LABEL}>Testing method</p>
          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {([['lab', 'Laboratory'], ['device', 'In-house device']] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'rounded-[12px] border p-3 text-left transition-colors',
                      field.value === value
                        ? 'border-[var(--app-brand)] bg-[var(--app-chip-bg)]'
                        : 'border-[var(--app-border-strong)] bg-[var(--app-surface)]',
                    )}
                  >
                    <span className="text-[13.5px] font-semibold text-[var(--app-text)]">{label}</span>
                  </button>
                ))}
              </div>
            )}
          />

          {method === 'lab' ? (
            <div className="grid grid-cols-2 gap-[14px]">
              <div>
                <Label className={FIELD_LABEL}>Laboratory name <span className="text-destructive">*</span></Label>
                <Input {...register('labName')} placeholder="e.g. AquaLab Inc." className={cn(errors.labName && 'border-destructive')} />
                {errors.labName && <p className="text-xs text-destructive mt-1">{errors.labName.message}</p>}
              </div>
              <div>
                <Label className={FIELD_LABEL}>Report no. <span className="text-destructive">*</span></Label>
                <Input {...register('reportNo')} placeholder="e.g. WQ-2026-011" className={cn(errors.reportNo && 'border-destructive')} />
                {errors.reportNo && <p className="text-xs text-destructive mt-1">{errors.reportNo.message}</p>}
              </div>
              <div>
                <Label className={FIELD_LABEL}>Report date</Label>
                <Input type="date" {...register('reportDate')} />
              </div>
              <div>
                <Label className={FIELD_LABEL}>Tested by <span className="text-destructive">*</span></Label>
                <Input {...register('testedBy')} placeholder="e.g. Maria Santos" className={cn(errors.testedBy && 'border-destructive')} />
                {errors.testedBy && <p className="text-xs text-destructive mt-1">{errors.testedBy.message}</p>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[14px]">
              <div>
                <Label className={FIELD_LABEL}>Device used <span className="text-destructive">*</span></Label>
                <Controller
                  control={control}
                  name="deviceType"
                  render={({ field }) => (
                    <select
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      className="w-full px-3 py-[11px] border border-[var(--app-border-strong)] rounded-[11px] bg-[var(--app-surface)] text-[var(--app-text)] text-[13.5px] font-[inherit] outline-none cursor-pointer"
                    >
                      {deviceTypeValues.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div>
                <Label className={FIELD_LABEL}>Device model</Label>
                <Input {...register('deviceModel')} placeholder="e.g. HM-500" className={cn(errors.deviceModel && 'border-destructive')} />
                {errors.deviceModel && <p className="text-xs text-destructive mt-1">{errors.deviceModel.message}</p>}
              </div>
              <div>
                <Label className={FIELD_LABEL}>Tested at <span className="text-destructive">*</span></Label>
                <Input type="datetime-local" {...register('testedAt')} className={cn(errors.testedAt && 'border-destructive')} />
                {errors.testedAt && <p className="text-xs text-destructive mt-1">{errors.testedAt.message}</p>}
              </div>
              <div>
                <Label className={FIELD_LABEL}>Tested by <span className="text-destructive">*</span></Label>
                <Input {...register('testedBy')} placeholder="e.g. Juan dela Cruz" className={cn(errors.testedBy && 'border-destructive')} />
                {errors.testedBy && <p className="text-xs text-destructive mt-1">{errors.testedBy.message}</p>}
              </div>
            </div>
          )}
        </section>

        {/* PARAMETERS */}
        <section className={CARD}>
          <div className="flex items-center justify-between">
            <p className={SECTION_LABEL}>Parameters</p>
            <button
              type="button"
              onClick={() => append({ name: '', value: '', unit: '', refRange: '' })}
              className="text-[12.5px] font-semibold text-[var(--app-brand)] hover:underline"
            >
              + Add parameter
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {suggestedParameterNames.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => append({ name, value: '', unit: '', refRange: '' })}
                className="px-2.5 py-1 rounded-full text-[12px] font-medium border border-[var(--app-border-strong)] bg-[var(--app-surface)] text-[var(--app-text-soft)] hover:border-[var(--app-brand)]"
              >
                + {name}
              </button>
            ))}
          </div>

          {fields.length === 0 ? (
            <p className="text-[12.5px] text-[var(--app-text-soft)]">
              No parameters yet — pick a suggested one above, or add a custom parameter.
            </p>
          ) : null}

          {fields.map((param, index) => (
            <div key={param.id} className="rounded-[12px] border border-[var(--app-border)] bg-[var(--app-surface)] p-3">
              <div className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_0.8fr_1fr_auto] gap-2 items-start">
                <div className="col-span-2 sm:col-span-1">
                  <Input {...register(`parameters.${index}.name`)} placeholder="Name" className={cn('h-9', errors.parameters?.[index]?.name && 'border-destructive')} />
                </div>
                <Input {...register(`parameters.${index}.value`)} placeholder="Value" className={cn('h-9', errors.parameters?.[index]?.value && 'border-destructive')} />
                <Input {...register(`parameters.${index}.unit`)} placeholder="Unit" className="h-9" />
                <Input {...register(`parameters.${index}.refRange`)} placeholder="Ref range" className="h-9" />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label="Remove parameter"
                  className="h-9 w-9 flex items-center justify-center rounded-[9px] border border-[var(--app-border-strong)] text-[var(--app-text-faint)] hover:text-destructive disabled:opacity-40"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
                </button>
              </div>
              {errors.parameters?.[index]?.name && <p className="text-xs text-destructive mt-1">{errors.parameters[index]?.name?.message}</p>}
              {errors.parameters?.[index]?.value && <p className="text-xs text-destructive mt-1">{errors.parameters[index]?.value?.message}</p>}
            </div>
          ))}
          {typeof errors.parameters?.message === 'string' && (
            <p className="text-xs text-destructive">{errors.parameters.message}</p>
          )}
        </section>

        {/* ATTACHMENTS */}
        <section className={CARD}>
          <p className={SECTION_LABEL}>Attachments</p>
          <p className="text-[12px] text-[var(--app-text-soft)] -mt-2">
            Optional — lab report or photos. PDF/PNG/JPG/WEBP, under 3MB combined.
            {mode === 'edit' && test && test.documentIds.length > 0
              ? ` ${test.documentIds.length} already attached.`
              : ''}
          </p>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3 border border-[var(--app-border)] rounded-[12px] p-2.5 bg-[var(--app-surface)]">
              <span className="text-[12.5px] font-semibold text-[var(--app-text)] truncate flex-1">{file.name}</span>
              <span className="text-[11.5px] text-[var(--app-text-faint)]">{(file.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => removeFile(index)} className="text-[12px] font-semibold text-[var(--app-brand)] hover:underline">Remove</button>
            </div>
          ))}
          <label className="block cursor-pointer border-2 border-dashed border-[var(--app-border-strong)] rounded-[12px] p-4 text-center bg-[var(--app-surface)] hover:border-[var(--app-brand)] transition-colors">
            <input type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <span className="text-[13px] font-semibold text-[var(--app-text-soft)]">Click to attach files</span>
          </label>
          {fileError && <p role="alert" className="text-xs text-destructive">{fileError}</p>}
        </section>

        {/* REMARKS */}
        <div>
          <Label className={FIELD_LABEL}>Remarks</Label>
          <textarea
            {...register('remarks')}
            rows={2}
            placeholder="Optional notes…"
            className="w-full px-[13px] py-2.5 border border-[var(--app-border-strong)] rounded-[11px] bg-[var(--app-surface)] text-[var(--app-text)] text-sm font-[inherit] outline-none resize-y"
          />
        </div>

        {/* Danger zone (edit only) */}
        {mode === 'edit' && onDelete ? (
          <div className="rounded-[14px] border border-red-500/30 bg-red-500/5 p-[18px]">
            <p className="text-[13px] font-semibold text-[var(--app-text)]">Delete this test?</p>
            <p className="text-[12.5px] text-[var(--app-text-soft)] mt-1 mb-3">
              This removes the test from your records. Mirrored files remain in Documents.
            </p>
            <Button type="button" variant="outline" onClick={onDelete} className="border-red-500/40 text-destructive hover:bg-red-500/10">
              Delete test result
            </Button>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--app-border)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button
            type="submit"
            disabled={isPending}
            style={{ background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}
          >
            {isPending ? 'Saving…' : mode === 'add' ? 'Save test result' : 'Save changes'}
          </Button>
        </div>
      </form>
    </AppModal>
  )
}
