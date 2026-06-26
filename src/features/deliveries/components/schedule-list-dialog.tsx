'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Customer } from '@/features/customers/customers.types'
import { MATERIALIZE_HORIZON_DAYS } from '../deliveries.constants'
import {
  nextUpcomingDate,
  recurrenceSummary,
  scheduleRecipient,
} from '../deliveries.schedule-view'
import type { DeliveryScheduleRow } from '../deliveries.types'
import { useScheduleStatus } from '../hooks/use-schedule-status'
import { useSchedules } from '../hooks/use-schedules'

interface ScheduleListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
}

export function ScheduleListDialog({
  open,
  onOpenChange,
  customers,
}: ScheduleListDialogProps) {
  const [page, setPage] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const query = useSchedules(page, open)
  const mutation = useScheduleStatus()

  const customerNames = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  )

  const schedules = query.data?.schedules ?? []
  const hasNext = query.data?.hasNext ?? false
  const today = new Date().toISOString().slice(0, 10)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPage(0)
      setMessage(null)
    }
    onOpenChange(next)
  }

  function toggle(schedule: DeliveryScheduleRow) {
    const action = schedule.status === 'active' ? 'pause' : 'resume'
    mutation.mutate(
      { schedule, action },
      {
        onSuccess: () =>
          setMessage(
            action === 'pause'
              ? 'Schedule stopped. Upcoming runs were removed.'
              : 'Schedule resumed. New runs will be generated.',
          ),
        onError: (error) => setMessage(error.message),
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-[#dcecff] bg-white shadow-[0_24px_70px_rgba(0,48,73,0.16)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-2xl font-semibold text-[#001d34]">
            <CalendarClock className="size-6 text-[#00b4d8]" aria-hidden="true" />
            Recurring schedules
          </DialogTitle>
          <DialogDescription className="text-[#2a4b6a]">
            Standing orders that generate deliveries automatically. Stop to pause
            future runs; resume to continue.
          </DialogDescription>
        </DialogHeader>

        {message ? (
          <p
            role="status"
            className="rounded-xl border border-[#bdefff] bg-[#eef7ff] px-3 py-2 text-sm font-semibold text-[#00677d]"
          >
            {message}
          </p>
        ) : null}

        {query.isPending ? (
          <ScheduleSkeleton />
        ) : query.isError ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {query.error.message}
          </p>
        ) : schedules.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#2a4b6a]">
            No recurring schedules yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {schedules.map((schedule) => (
              <li
                key={schedule.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-[#dcecff] bg-white p-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <ScheduleStatusBadge status={schedule.status} />
                    <span className="truncate text-sm font-semibold text-[#001d34]">
                      {scheduleRecipient(
                        schedule,
                        schedule.customer_id != null
                          ? customerNames.get(schedule.customer_id) ?? null
                          : null,
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-[#2a4b6a]">
                    {recurrenceSummary(schedule)}
                  </p>
                  <p className="text-sm text-[#2a4b6a]">
                    Next:{' '}
                    {formatNext(
                      nextUpcomingDate(schedule, today, MATERIALIZE_HORIZON_DAYS),
                      schedule.status,
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => toggle(schedule)}
                  className="h-9 rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
                >
                  {schedule.status === 'active' ? (
                    <>
                      <Pause className="size-4" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Resume
                    </>
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#dcecff] pt-3">
          <p className="text-sm text-[#2a4b6a]">
            Page {page + 1}
            {query.isFetching ? ' · updating…' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || query.isFetching}
              className="h-9 rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
            >
              <ChevronLeft className="size-4" />
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasNext || query.isFetching}
              className="h-9 rounded-xl border-[#bdefff] text-[#00677d] hover:bg-[#eef7ff]"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ScheduleStatusBadge({
  status,
}: {
  status: DeliveryScheduleRow['status']
}) {
  const styles =
    status === 'active'
      ? 'bg-[#00f5d4]/15 text-[#005144]'
      : status === 'paused'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-100 text-slate-600'

  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold capitalize ${styles}`}
    >
      {status}
    </span>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-2xl bg-[#eef7ff]/70"
        />
      ))}
    </div>
  )
}

function formatNext(
  value: string | null,
  status: DeliveryScheduleRow['status'],
): string {
  if (status !== 'active') return 'Paused'
  if (!value) return 'None scheduled'
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
