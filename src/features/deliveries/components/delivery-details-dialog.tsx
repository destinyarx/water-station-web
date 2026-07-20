'use client'

import {
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Clock3,
  MapPin,
  PackageOpen,
  Phone,
  RefreshCw,
  StickyNote,
  Truck,
  UserRound,
} from 'lucide-react'

import { AppModal } from '@/components/app/app-modal'
import type { Customer } from '@/features/customers/customers.types'
import { cn } from '@/lib/utils'
import { pesoFormatter } from '../deliveries.constants'
import type { Delivery, DeliveryStatus, OrgUser } from '../deliveries.types'

interface DeliveryDetailsDialogProps {
  delivery: Delivery | null
  customer?: Customer
  assignee?: OrgUser
  deliveredBy?: OrgUser
  onOpenChange: (open: boolean) => void
}

const DETAILS_ICON = <ClipboardList className="size-5 text-white" />

// Product-type icons, matching the Products catalog: refill = jug, bottled = bottle.
const ItemJugIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M9 2.5h6v2l-1.2 1.5h-3.6L9 4.5v-2Z" /><path d="M8 6h8a1 1 0 0 1 1 1v12.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z" /><path d="M9.5 13.5a2.6 2.6 0 0 1 4.6-1.3M14.5 14.5a2.6 2.6 0 0 1-4.6 1.3" /></svg>
)
const ItemBottleIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M10 2.5h4v1.6l1 1v1.8l-1 1v1l1 1v8.1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8.1l1-1v-1l-1-1V6.7l1-1V2.5Z" /><path d="M9 14.5h6" /></svg>
)

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  for_delivery: 'In progress',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export function DeliveryDetailsDialog({
  delivery,
  customer,
  assignee,
  deliveredBy,
  onOpenChange,
}: DeliveryDetailsDialogProps) {
  if (!delivery) return null

  const info = delivery.scheduleInfo
  const isGuest = info?.customerId == null
  const recipientName = customer?.name ?? info?.guestName ?? 'Unknown recipient'
  const recipientAddress = customer?.fullAddress ?? info?.guestAddress ?? null
  const recipientContact = customer?.contactNumber ?? info?.guestContact ?? null
  const totalUnits = delivery.items.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const reason =
    delivery.status === 'failed'
      ? delivery.failureRemarks
      : delivery.status === 'cancelled'
        ? delivery.cancellationRemarks
        : null

  return (
    <AppModal
      open
      onOpenChange={onOpenChange}
      title="Delivery details"
      description={`Delivery #${delivery.id} · View only`}
      icon={DETAILS_ICON}
      maxWidth="940px"
      bodyPadding="0"
    >
      <div className="max-h-[74vh] overflow-y-auto px-5 py-5 pr-7 [scrollbar-gutter:stable] sm:px-6 sm:pr-8">
        {/* ocean hero — recipient, status, and total on a branded gradient */}
        <div
          className="relative mb-5 flex flex-wrap items-start justify-between gap-4 overflow-hidden rounded-2xl p-5 sm:p-6"
          style={{ background: 'linear-gradient(150deg,#0b73c8,#075098)', boxShadow: '0 14px 30px rgba(14,108,196,0.26)' }}
        >
          <div className="pointer-events-none absolute right-0 bottom-0 leading-none opacity-25" aria-hidden="true">
            <svg width="230" height="92" viewBox="0 0 230 92" preserveAspectRatio="none">
              <path d="M0 52 C45 32 80 66 125 50 C170 34 200 60 230 46 L230 92 L0 92 Z" fill="#fff" />
              <path d="M0 66 C50 50 85 76 135 62 C180 50 205 70 230 62 L230 92 L0 92 Z" fill="#fff" opacity="0.5" />
            </svg>
          </div>
          <div className="relative min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <HeroStatusBadge status={delivery.status} />
              <span className="rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
                {isGuest
                  ? 'Guest'
                  : customer?.isBusiness
                    ? 'Business'
                    : 'Household'}
              </span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight text-white">
              {recipientName}
            </h3>
            <p className="mt-1 text-sm text-white/75">
              {formatScheduleLabel(delivery)}
            </p>
          </div>

          <div className="relative shrink-0 text-left sm:text-right">
            <p className="text-[10px] font-bold tracking-[0.08em] text-white/70 uppercase">
              Delivery total
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-white">
              {pesoFormatter.format(delivery.total)}
            </p>
            <p className="mt-1 text-xs text-white/75">
              {formatItemSummary(delivery.items.length, totalUnits)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <section className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 shadow-(--app-shadow-card) sm:p-5">
            <SectionHeading icon={UserRound} title="Recipient" />
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailField label="Name" value={recipientName} />
              <DetailField
                label="Source"
                value={isGuest ? 'Guest delivery' : 'Customer record'}
              />
              <DetailField
                icon={Phone}
                label="Contact"
                value={recipientContact ?? 'Not provided'}
              />
              <DetailField
                icon={MapPin}
                label="Address"
                value={recipientAddress ?? 'Not provided'}
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 shadow-(--app-shadow-card) sm:p-5">
            <SectionHeading icon={CalendarDays} title="Schedule & assignment" />
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <DetailField
                icon={CalendarDays}
                label="Scheduled for"
                value={formatDate(delivery.deliveryDate)}
              />
              <DetailField
                icon={RefreshCw}
                label="Schedule type"
                value={formatScheduleLabel(delivery)}
              />
              <DetailField
                icon={UserRound}
                label="Assigned to"
                value={assignee?.name ?? 'Unassigned'}
              />
              <DetailField
                icon={Truck}
                label="Dispatched by"
                value={deliveredBy?.name ?? (delivery.deliveredBy ? 'Team member' : 'Not dispatched')}
              />
            </dl>
          </section>
        </div>

        <section className="mt-4 overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface) shadow-(--app-shadow-card)">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--app-border) px-4 py-4 sm:px-5">
            <SectionHeading icon={PackageOpen} title="Delivery items" />
            <span className="rounded-lg bg-(--app-chip-gray-bg) px-2.5 py-1 text-xs font-bold text-(--app-chip-gray-text)">
              {formatItemSummary(delivery.items.length, totalUnits)}
            </span>
          </div>

          {delivery.items.length > 0 ? (
            <ul className="grid gap-2 p-3 sm:p-4">
              {delivery.items.map((item) => (
                <li
                  key={item.id}
                  className="grid gap-3 rounded-xl bg-(--app-surface-2) px-3.5 py-3 sm:grid-cols-[minmax(0,1fr)_90px_120px_120px] sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                      style={
                        item.isStockTracked
                          ? { background: 'var(--app-chip-green-bg)', color: 'var(--app-chip-green-text)' }
                          : { background: 'var(--app-chip-bg)', color: 'var(--app-brand)' }
                      }
                    >
                      {item.isStockTracked ? ItemBottleIcon : ItemJugIcon}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-(--app-text)">
                        {item.productName}
                      </span>
                      <span className="mt-0.5 block text-xs text-(--app-text-soft)">
                        {item.isStockTracked ? 'Bottled / stocked' : 'Refill service'}
                      </span>
                    </span>
                  </div>
                  <ItemValue label="Quantity" value={formatUnits(item.quantity)} />
                  <ItemValue
                    label="Unit price"
                    value={pesoFormatter.format(item.unitPrice)}
                  />
                  <ItemValue
                    label="Line total"
                    value={pesoFormatter.format(item.lineTotal)}
                    emphasized
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-(--app-text-soft)">
              No items were recorded for this delivery.
            </p>
          )}
        </section>

        {reason ? (
          <section className="mt-4 flex items-start gap-3 rounded-2xl bg-(--app-chip-red-bg) p-4 text-(--app-chip-red-text)">
            <CircleAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">
                {delivery.status === 'failed'
                  ? 'Failure reason'
                  : 'Cancellation reason'}
              </p>
              <p className="mt-1 text-sm leading-6">{reason}</p>
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
          <section className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:p-5">
            <SectionHeading icon={StickyNote} title="Delivery notes" />
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-(--app-text-soft)">
              {delivery.notes?.trim() || 'No delivery notes were added.'}
            </p>
          </section>

          <section className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 sm:p-5">
            <SectionHeading icon={Clock3} title="Record timeline" />
            <dl className="mt-4 grid gap-3">
              <DetailField
                label="Created"
                value={formatDateTime(delivery.createdAt)}
              />
              <DetailField
                label="Last updated"
                value={
                  delivery.updatedAt
                    ? formatDateTime(delivery.updatedAt)
                    : 'No updates yet'
                }
              />
              {delivery.completedAt ? (
                <DetailField
                  label="Completed"
                  value={formatDateTime(delivery.completedAt)}
                />
              ) : null}
            </dl>
          </section>
        </div>
      </div>
    </AppModal>
  )
}

const STATUS_DOT: Record<DeliveryStatus, string> = {
  pending: '#fbbf24',
  for_delivery: '#7dd3fc',
  completed: '#34d399',
  failed: '#f87171',
  cancelled: '#cbd5e1',
}

/** Frosted status pill for the gradient hero — a status-colored dot on white. */
function HeroStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
      <span className="size-1.5 rounded-full" style={{ background: STATUS_DOT[status] }} />
      {STATUS_LABEL[status]}
    </span>
  )
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof ClipboardList
  title: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-(--app-chip-bg) text-(--app-brand)">
        <Icon className="size-4" />
      </span>
      <h4 className="text-sm font-bold text-(--app-text)">{title}</h4>
    </div>
  )
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof ClipboardList
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl bg-(--app-surface-2) px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.08em] text-(--app-text-faint) uppercase">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </dt>
      <dd className="mt-1.5 wrap-break-word text-sm font-semibold text-(--app-text)">
        {value}
      </dd>
    </div>
  )
}

function ItemValue({
  label,
  value,
  emphasized = false,
}: {
  label: string
  value: string
  emphasized?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
      <span className="text-[10px] font-bold tracking-[0.06em] text-(--app-text-faint) uppercase sm:block">
        {label}
      </span>
      <span
        className={cn(
          'text-sm text-(--app-text) sm:mt-1 sm:block',
          emphasized ? 'font-extrabold' : 'font-semibold',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function formatScheduleLabel(delivery: Delivery): string {
  const info = delivery.scheduleInfo
  if (info?.recurrenceType === 'weekly') {
    const days = (info.weekdays ?? [])
      .slice()
      .sort((a, b) => a - b)
      .map((day) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1])
      .filter((day): day is string => Boolean(day))
      .join(', ')
    const interval = info.intervalWeeks === 2 ? 'every 2 weeks' : 'weekly'
    return days ? `Recurring route · ${days} · ${interval}` : 'Recurring route'
  }

  return info?.recurrenceType === 'custom_dates'
    ? 'Custom-date delivery'
    : 'One-time delivery'
}

function formatItemSummary(itemCount: number, units: number): string {
  return `${itemCount} ${itemCount === 1 ? 'item' : 'items'} (${formatUnits(units)})`
}

function formatUnits(quantity: number): string {
  return `${quantity} ${quantity === 1 ? 'unit' : 'units'}`
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(value))
}
