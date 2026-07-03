'use client'

import { useState } from 'react'

import { AppModal } from '@/components/app/app-modal'
import type { Customer } from '@/features/customers/customers.types'
import type { Product } from '@/features/products/products.types'
import type {
  OrgUser,
  UnifiedDeliveryFormValues,
} from '../deliveries.types'
import { useCreateUnifiedDelivery } from '../hooks/use-create-unified-delivery'
import { UnifiedDeliveryForm } from './unified-delivery-form'

interface CreateUnifiedDeliveryDialogProps {
  customers: Customer[]
  products: Product[]
  users: OrgUser[]
  usersLoading: boolean
  disabled?: boolean
  onCreated?: () => void
}

const TRUCK_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round">
    <path d="M3 6.5h10v9H3z" />
    <path d="M13 9.5h3.6l3.4 3.3v2.7H13z" />
    <circle cx="7" cy="17.5" r="1.7" />
    <circle cx="17" cy="17.5" r="1.7" />
  </svg>
)

export function CreateUnifiedDeliveryDialog({
  customers,
  products,
  users,
  usersLoading,
  disabled = false,
  onCreated,
}: CreateUnifiedDeliveryDialogProps) {
  const [open, setOpen] = useState(false)
  const mutation = useCreateUnifiedDelivery()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) mutation.reset()
  }

  function handleSubmit(values: UnifiedDeliveryFormValues) {
    mutation.mutate(values, {
      onSuccess: () => {
        handleOpenChange(false)
        onCreated?.()
      },
    })
  }

  return (
    <>
      {/* trigger button — gradient matching HTML design */}
      <button
        data-create-delivery
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: disabled ? 'var(--app-text-faint)' : 'linear-gradient(150deg,#3fb0f0,#0a6cc4)', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14.5px', fontWeight: 600, padding: '12px 21px', borderRadius: '12px', cursor: disabled ? 'default' : 'pointer', boxShadow: disabled ? 'none' : '0 10px 22px rgba(14,108,196,0.28)', whiteSpace: 'nowrap' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Schedule delivery
      </button>

      <AppModal
        open={open}
        onOpenChange={handleOpenChange}
        title="Schedule delivery"
        description="Set a recurring weekly route or pick exact delivery dates."
        icon={TRUCK_ICON}
        maxWidth="660px"
        bodyPadding="22px 26px 0"
      >
        <div style={{ maxHeight: '62vh', overflowY: 'auto', paddingBottom: '22px' }}>
          <UnifiedDeliveryForm
            customers={customers}
            products={products}
            users={users}
            usersLoading={usersLoading}
            onSubmit={handleSubmit}
            isPending={mutation.isPending}
            errorMessage={mutation.isError ? mutation.error.message : undefined}
            onCancel={() => handleOpenChange(false)}
          />
        </div>
      </AppModal>
    </>
  )
}
