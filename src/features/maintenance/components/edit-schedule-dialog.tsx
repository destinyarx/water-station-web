'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { OTHERS_EQUIPMENT } from '../maintenance.constants'
import { editMaintenanceSchema } from '../maintenance.schema'
import type {
  EditMaintenanceInput,
  EditMaintenanceValues,
  MaintenancePriority,
  MaintenanceTaskView,
  OrgUser,
} from '../maintenance.types'
import { useUpdateSchedule } from '../hooks/use-update-schedule'
import { useOrgUsers } from '../hooks/use-org-users'
import {
  AssigneeSelect,
  EquipmentSelect,
  FieldError,
  INPUT_STYLE,
  LABEL_STYLE,
  PrioritySelector,
  RequiredMark,
} from './form-fields'
import { ScheduleFormDialog } from './schedule-form-dialog'

interface EditScheduleDialogProps {
  task: MaintenanceTaskView
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditScheduleDialog({ task, open, onOpenChange }: EditScheduleDialogProps) {
  const mutation = useUpdateSchedule()
  const usersQuery = useOrgUsers()

  function handleOpenChange(next: boolean) {
    onOpenChange(next)
    if (!next) mutation.reset()
  }

  return (
    <ScheduleFormDialog open={open} onOpenChange={handleOpenChange} title="Edit task" description={`${task.recurrenceLabel} • cadence is fixed after creation.`}>
      <EditForm
        task={task}
        isPending={mutation.isPending}
        errorMessage={mutation.isError ? mutation.error.message : undefined}
        usersLoading={usersQuery.isPending}
        users={usersQuery.data ?? []}
        onCancel={() => handleOpenChange(false)}
        onSubmit={(values) =>
          mutation.mutate(
            { scheduleId: task.scheduleId, taskId: task.id, values },
            { onSuccess: () => handleOpenChange(false) },
          )
        }
      />
    </ScheduleFormDialog>
  )
}

function EditForm({
  task,
  isPending,
  errorMessage,
  users,
  usersLoading,
  onSubmit,
  onCancel,
}: {
  task: MaintenanceTaskView
  isPending: boolean
  errorMessage?: string
  users: OrgUser[]
  usersLoading: boolean
  onSubmit: (values: EditMaintenanceValues) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<EditMaintenanceInput, unknown, EditMaintenanceValues>({
      resolver: zodResolver(editMaintenanceSchema),
      defaultValues: {
        title: task.title,
        equipment: task.equipment,
        equipmentOther: task.equipmentOther ?? '',
        priority: task.priority,
        assignedTo: task.assignedTo ?? '',
        notes: task.notes ?? '',
        dueDate: task.dueDate,
      },
    })

  const equipment = watch('equipment')
  const priority = watch('priority')
  const assignedTo = watch('assignedTo')

  const submit = handleSubmit((values) => onSubmit(values))

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={LABEL_STYLE}>Task title <RequiredMark /></label>
          <input disabled={isPending} style={INPUT_STYLE} {...register('title')} />
          {errors.title?.message ? <FieldError message={errors.title.message} /> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={LABEL_STYLE}>Equipment <RequiredMark /></label>
            <EquipmentSelect value={equipment} onChange={(value) => setValue('equipment', value, { shouldValidate: true })} />
            {errors.equipment?.message ? <FieldError message={errors.equipment.message} /> : null}
          </div>
          <div>
            <label style={LABEL_STYLE}>Due date <RequiredMark /></label>
            <input type="date" disabled={isPending} style={INPUT_STYLE} {...register('dueDate')} />
            {errors.dueDate?.message ? <FieldError message={errors.dueDate.message} /> : null}
          </div>
        </div>

        {equipment === OTHERS_EQUIPMENT ? (
          <div>
            <label style={LABEL_STYLE}>Describe the equipment <RequiredMark /></label>
            <input disabled={isPending} style={INPUT_STYLE} {...register('equipmentOther')} />
            {errors.equipmentOther?.message ? <FieldError message={errors.equipmentOther.message} /> : null}
          </div>
        ) : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={LABEL_STYLE}>Priority</label>
            <PrioritySelector value={priority as MaintenancePriority} onChange={(value) => setValue('priority', value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Assigned to</label>
            <AssigneeSelect value={assignedTo ?? ''} onChange={(value) => setValue('assignedTo', value)} users={users} loading={usersLoading} />
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Notes</label>
          <textarea rows={2} disabled={isPending} style={{ ...INPUT_STYLE, resize: 'vertical' }} {...register('notes')} />
        </div>

        {errorMessage ? (
          <p role="alert" style={{ borderRadius: '11px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.06)', padding: '10px 13px', fontSize: '13.5px', color: '#dc2626', margin: 0 }}>{errorMessage}</p>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '18px 26px', borderTop: '1px solid var(--app-border)', background: 'var(--app-surface-2)' }}>
        <button type="button" disabled={isPending} onClick={onCancel} style={{ padding: '11px 20px', borderRadius: '11px', border: '1px solid var(--app-border-strong)', background: 'var(--app-surface)', color: 'var(--app-text-muted)', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        <button type="submit" disabled={isPending} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '11px', border: 'none', background: 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 22px rgba(14,108,196,0.3)' }}>{isPending ? 'Saving…' : 'Save changes'}</button>
      </div>
    </form>
  )
}
