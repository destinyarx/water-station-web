'use client'

import { useMemo } from 'react'

import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import type { Delivery, DeliveryStatus, OrgUser } from '../deliveries.types'
import { DeliveryStatusMenu } from './delivery-status-menu'

interface DeliveriesTableProps {
  deliveries: Delivery[]
  customers?: Customer[]
  products?: Product[]
  users?: OrgUser[]
  onStatusChanged?: (message: string) => void
  onStatusError?: (message: string) => void
  onEdit?: (delivery: Delivery) => void
}

const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_STYLE: Record<DeliveryStatus, { bg: string; text: string }> = {
  pending: { bg: 'var(--app-chip-amber-bg)', text: 'var(--app-chip-amber-text)' },
  for_delivery: { bg: 'var(--app-chip-bg)', text: 'var(--app-brand)' },
  completed: { bg: 'var(--app-chip-green-bg)', text: 'var(--app-chip-green-text)' },
  failed: { bg: 'var(--app-chip-red-bg)', text: 'var(--app-chip-red-text)' },
  cancelled: { bg: 'var(--app-chip-gray-bg)', text: 'var(--app-chip-gray-text)' },
}

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pending: 'Pending',
  for_delivery: 'In progress',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function weekdayLabel(days: number[]): string {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_SHORT[d - 1])
    .join(', ')
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

export function DeliveriesTable({
  deliveries,
  customers = [],
  products = [],
  users = [],
  onStatusChanged,
  onStatusError,
  onEdit,
}: DeliveriesTableProps) {
  const customerById = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  )
  const userById = useMemo(
    () => new Map(users.map((u) => [u.clerkId, u])),
    [users],
  )

  // For mobile: show cards
  return (
    <>
      {/* Mobile cards */}
      <div style={{ display: 'none' }} className="md:hidden block">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
          {deliveries.map((delivery) => (
            <DeliveryMobileCard
              key={delivery.id}
              delivery={delivery}
              customerById={customerById}
              userById={userById}
              onStatusChanged={onStatusChanged}
              onStatusError={onStatusError}
              onEdit={onEdit}
            />
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div style={{ overflowX: 'auto' }} className="hidden md:block">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
          <thead>
            <tr style={{ background: 'var(--app-surface-3)' }}>
              {['Customer', 'Schedule', 'Items', 'Assigned', 'Status', ''].map((h) => (
                <th
                  key={h}
                  style={{ textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--app-text-faint)', padding: h === '' ? '12px 22px' : '12px 16px', paddingLeft: h === 'Customer' ? '22px' : undefined }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <DeliveryRow
                key={delivery.id}
                delivery={delivery}
                customerById={customerById}
                userById={userById}
                onStatusChanged={onStatusChanged}
                onStatusError={onStatusError}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--app-border)', fontSize: '13px', color: 'var(--app-text-soft)' }}>
          <span>
            Showing <strong style={{ color: 'var(--app-text)', fontWeight: 600 }}>{deliveries.length}</strong> {deliveries.length === 1 ? 'delivery' : 'deliveries'}
          </span>
        </div>
      </div>
    </>
  )
}

function DeliveryRow({
  delivery,
  customerById,
  userById,
  onStatusChanged,
  onStatusError,
  onEdit,
}: {
  delivery: Delivery
  customerById: Map<number, Customer>
  userById: Map<string, OrgUser>
  onStatusChanged?: (msg: string) => void
  onStatusError?: (msg: string) => void
  onEdit?: (d: Delivery) => void
}) {
  const info = delivery.scheduleInfo
  const isGuest = !info?.customerId
  const customer = info?.customerId ? customerById.get(info.customerId) : undefined
  const recipientName = customer?.name ?? info?.guestName ?? 'Unknown'
  const recipientAddress = customer?.fullAddress ?? info?.guestAddress ?? null

  const nameInitials = initials(recipientName)
  const isRecurring = info?.recurrenceType === 'weekly'
  const recurrenceLabel = isRecurring && info?.weekdays
    ? weekdayLabel(info.weekdays) + (info.intervalWeeks === 2 ? ' · 2wk' : '')
    : null

  const assignee = delivery.assignedTo ? userById.get(delivery.assignedTo) : undefined
  const assigneeName = assignee?.name || 'Unassigned'
  const assigneeInitials = assignee ? initials(assignee.name) : '—'

  const itemCount = delivery.items.length
  const statusStyle = STATUS_STYLE[delivery.status]

  return (
    <tr
      style={{ borderTop: '1px solid var(--app-border)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--app-row-hover)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '' }}
    >
      {/* Customer */}
      <td style={{ padding: '13px 16px 13px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flexShrink: 0, width: '38px', height: '38px', borderRadius: '11px', background: isGuest ? 'var(--app-chip-gray-bg)' : 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isGuest ? 'var(--app-chip-gray-text)' : 'var(--app-brand)', fontSize: '13px', fontWeight: 700 }}>
            {nameInitials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--app-text)' }}>{recipientName}</span>
              {isGuest && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--app-chip-gray-text)', background: 'var(--app-chip-gray-bg)', padding: '2px 7px', borderRadius: '999px' }}>GUEST</span>
              )}
            </div>
            {recipientAddress && (
              <div style={{ fontSize: '12px', color: 'var(--app-text-soft)', marginTop: '1px', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {recipientAddress}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Schedule */}
      <td style={{ padding: '13px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--app-text)' }}>{formatDate(delivery.deliveryDate)}</span>
          {isRecurring && recurrenceLabel && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', fontWeight: 700, color: '#8b5cf6', background: 'rgba(139,92,246,0.14)', padding: '2px 7px', borderRadius: '999px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
              {recurrenceLabel}
            </span>
          )}
        </div>
      </td>

      {/* Items */}
      <td style={{ padding: '13px 16px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--app-text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" style={{ opacity: 0.75 }}><path d="M9 2.5h6v2l-1 1.3h-4L9 4.5v-2Z" /><path d="M8 5.8h8a1 1 0 0 1 1 1V20a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V6.8a1 1 0 0 1 1-1Z" /></svg>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </td>

      {/* Assigned */}
      <td style={{ padding: '13px 16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--app-text-muted)' }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg,#7dd3fc,#0a6cc4)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5px', fontWeight: 700, flexShrink: 0 }}>
            {assigneeInitials === '—' ? '?' : assigneeInitials}
          </span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{assigneeName}</span>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '13px 16px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontWeight: 700, padding: '6px 11px', borderRadius: '999px', background: statusStyle.bg, color: statusStyle.text, whiteSpace: 'nowrap' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
          {STATUS_LABEL[delivery.status]}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '13px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DeliveryStatusMenu
            delivery={delivery}
            recipientName={recipientName}
            recipientSource={isGuest ? 'guest' : 'record'}
            recipientAddress={recipientAddress}
            onChanged={onStatusChanged}
            onError={onStatusError}
            onEdit={onEdit}
          />
        </div>
      </td>
    </tr>
  )
}

function DeliveryMobileCard({
  delivery,
  customerById,
  userById,
  onStatusChanged,
  onStatusError,
  onEdit,
}: {
  delivery: Delivery
  customerById: Map<number, Customer>
  userById: Map<string, OrgUser>
  onStatusChanged?: (msg: string) => void
  onStatusError?: (msg: string) => void
  onEdit?: (d: Delivery) => void
}) {
  const info = delivery.scheduleInfo
  const isGuest = !info?.customerId
  const customer = info?.customerId ? customerById.get(info.customerId) : undefined
  const recipientName = customer?.name ?? info?.guestName ?? 'Unknown'

  const assignee = delivery.assignedTo ? userById.get(delivery.assignedTo) : undefined
  const assigneeName = assignee?.name || 'Unassigned'

  const statusStyle = STATUS_STYLE[delivery.status]

  return (
    <article style={{ borderRadius: '16px', border: '1px solid var(--app-border)', background: 'var(--app-surface)', padding: '14px 16px', boxShadow: 'var(--app-shadow-card)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--app-text)' }}>{recipientName}</span>
            {isGuest && <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--app-chip-gray-text)', background: 'var(--app-chip-gray-bg)', padding: '2px 6px', borderRadius: '999px' }}>GUEST</span>}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--app-text-soft)', marginTop: '3px' }}>{formatDate(delivery.deliveryDate)}</div>
        </div>
        <DeliveryStatusMenu
          delivery={delivery}
          recipientName={recipientName}
          recipientSource={isGuest ? 'guest' : 'record'}
          recipientAddress={
            info?.customerId
              ? customerById.get(info.customerId)?.fullAddress
              : info?.guestAddress
          }
          onChanged={onStatusChanged}
          onError={onStatusError}
          onEdit={onEdit}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', fontWeight: 700, padding: '5px 10px', borderRadius: '999px', background: statusStyle.bg, color: statusStyle.text }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
          {STATUS_LABEL[delivery.status]}
        </span>
        <span style={{ fontSize: '12.5px', color: 'var(--app-text-muted)' }}>{delivery.items.length} {delivery.items.length === 1 ? 'item' : 'items'}</span>
        <span style={{ fontSize: '12.5px', color: 'var(--app-text-muted)' }}>{assigneeName}</span>
      </div>
    </article>
  )
}
