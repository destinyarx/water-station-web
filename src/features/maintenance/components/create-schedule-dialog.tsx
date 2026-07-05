'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { OTHERS_EQUIPMENT } from '../maintenance.constants'
import { createMaintenanceSchema } from '../maintenance.schema'
import { todayIso } from '../maintenance.view'
import type {
  CreateMaintenanceInput,
  CreateMaintenanceValues,
  MaintenancePriority,
} from '../maintenance.types'
import { useCreateSchedule } from '../hooks/use-create-schedule'
import { useOrgUsers } from '../hooks/use-org-users'
import {
  AssigneeSelect,
  EquipmentSelect,
  FieldError,
  INPUT_STYLE,
  LABEL_STYLE,
  PrioritySelector,
  RequiredMark,
  WeekdayPicker,
} from './form-fields'
import { MultiDateCalendarPopover } from './multi-date-calendar'
import { ScheduleFormDialog } from './schedule-form-dialog'
import { SaveConfirmDialog } from '@/components/app/save-confirm-dialog'
import { useSubmitConfirm } from '@/components/app/use-submit-confirm'

interface CreateScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RECURRENCE_PILLS: ReadonlyArray<{ value: CreateMaintenanceValues['recurrenceType']; label: string }> = [
  { value: 'one_time', label: 'One-time' },
  { value: 'everyday', label: 'Everyday' },
  { value: 'weekly', label: 'Weekly' },
]

const DEFAULTS: CreateMaintenanceInput = {
  title: '', equipment: '', equipmentOther: '', priority: 'medium', assignedTo: '', notes: '',
  recurrenceType: 'everyday', weekdays: [], startDate: todayIso(), dates: [],
}

export function CreateScheduleDialog({ open, onOpenChange }: CreateScheduleDialogProps) {
  const mutation = useCreateSchedule()
  const usersQuery = useOrgUsers()
  const confirm = useSubmitConfirm<CreateMaintenanceValues>()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<CreateMaintenanceInput, unknown, CreateMaintenanceValues>({
      resolver: zodResolver(createMaintenanceSchema),
      defaultValues: DEFAULTS,
    })

  const equipment = watch('equipment')
  const priority = watch('priority')
  const assignedTo = watch('assignedTo')
  const recurrenceType = watch('recurrenceType')
  const weekdays = watch('weekdays') ?? []
  const dates = watch('dates') ?? []

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) {
      mutation.reset()
      reset(DEFAULTS)
    }
  }

  const submit = handleSubmit((values) => confirm.request(values))

  function runMutation() {
    if (!confirm.pending) return
    mutation.mutate(confirm.pending, {
      onSuccess: () => {
        confirm.reset()
        handleOpenChange(false)
      },
    })
  }

  const isPending = mutation.isPending

  return (
    <>
      <SaveConfirmDialog
        open={confirm.isOpen}
        onOpenChange={(next) => {
          if (!next) {
            confirm.reset()
            mutation.reset()
          }
        }}
        mode="create"
        entityLabel="maintenance task"
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        onConfirm={runMutation}
      />
      <ScheduleFormDialog open={open} onOpenChange={handleOpenChange} title="Schedule Task" description="Plan recurring or one-time equipment upkeep.">
      <form onSubmit={submit} noValidate>
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={LABEL_STYLE}>Task title <RequiredMark /></label>
            <input placeholder="e.g. Replace RO membrane" disabled={isPending} style={INPUT_STYLE} {...register('title')} />
            {errors.title?.message ? <FieldError message={errors.title.message} /> : null}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={LABEL_STYLE}>Equipment <RequiredMark /></label>
              <EquipmentSelect value={equipment} onChange={(value) => setValue('equipment', value, { shouldValidate: true })} />
              {errors.equipment?.message ? <FieldError message={errors.equipment.message} /> : null}
            </div>
            <div>
              <label style={LABEL_STYLE}>Assigned to</label>
              <AssigneeSelect value={assignedTo ?? ''} onChange={(value) => setValue('assignedTo', value)} users={usersQuery.data ?? []} loading={usersQuery.isPending} />
            </div>
          </div>

          {equipment === OTHERS_EQUIPMENT ? (
            <div>
              <label style={LABEL_STYLE}>Describe the equipment <RequiredMark /></label>
              <input placeholder="e.g. Chiller compressor" disabled={isPending} style={INPUT_STYLE} {...register('equipmentOther')} />
              {errors.equipmentOther?.message ? <FieldError message={errors.equipmentOther.message} /> : null}
            </div>
          ) : null}

          <div>
            <label style={LABEL_STYLE}>Priority</label>
            <PrioritySelector value={priority as MaintenancePriority} onChange={(value) => setValue('priority', value)} />
          </div>

          {/* recurrence */}
          <div style={{ background: 'var(--app-surface-2)', border: '1px solid var(--app-border)', borderRadius: '14px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7c3aed' }}><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--app-text)' }}>Recurrence</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {RECURRENCE_PILLS.map((pill) => {
                const on = recurrenceType === pill.value
                return (
                  <button key={pill.value} type="button" onClick={() => setValue('recurrenceType', pill.value, { shouldValidate: true })} style={{ padding: '8px 16px', border: `1.5px solid ${on ? '#8b5cf6' : 'var(--app-border-strong)'}`, borderRadius: '999px', background: on ? 'rgba(139,92,246,0.13)' : 'var(--app-surface)', color: on ? '#7c3aed' : 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}>
                    {pill.label}
                  </button>
                )
              })}
            </div>

            {recurrenceType === 'weekly' ? (
              <div style={{ marginBottom: '14px' }}>
                <WeekdayPicker weekdays={weekdays} onChange={(next) => setValue('weekdays', next, { shouldValidate: true })} />
                {errors.weekdays?.message ? <FieldError message={errors.weekdays.message} /> : null}
              </div>
            ) : null}

            {recurrenceType === 'one_time' ? (
              <div>
                <label style={LABEL_STYLE}>Pick date(s) <RequiredMark /></label>
                <MultiDateCalendarPopover value={dates} onChange={(next) => setValue('dates', next, { shouldValidate: true })} disabled={isPending} />
                <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '8px' }}>{dates.length} date{dates.length === 1 ? '' : 's'} selected.</div>
                {errors.dates?.message ? <FieldError message={errors.dates.message} /> : null}
              </div>
            ) : (
              <div>
                <label style={LABEL_STYLE}>Start date <RequiredMark /></label>
                <input type="date" min={todayIso()} disabled={isPending} style={INPUT_STYLE} {...register('startDate')} />
                {errors.startDate?.message ? <FieldError message={errors.startDate.message} /> : null}
              </div>
            )}
          </div>

          <div>
            <label style={LABEL_STYLE}>Notes</label>
            <textarea rows={2} placeholder="Anything the staff should know…" disabled={isPending} style={{ ...INPUT_STYLE, resize: 'vertical' }} {...register('notes')} />
          </div>

          {mutation.isError ? (
            <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626', margin: 0 }}>{mutation.error.message}</p>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '18px 26px', borderTop: '1px solid var(--app-border)', background: 'var(--app-surface-2)' }}>
          <button type="button" disabled={isPending} onClick={() => handleOpenChange(false)} style={{ padding: '11px 20px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '11px', border: 'none', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}>{isPending ? 'Saving…' : 'Schedule Task'}</button>
        </div>
      </form>
      </ScheduleFormDialog>
    </>
  )
}
