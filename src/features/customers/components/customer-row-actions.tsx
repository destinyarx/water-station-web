'use client'

import { useEffect, useRef, useState } from 'react'

import { canEditCustomer } from '../customers.guards'
import type { Customer } from '../customers.types'
import { useSetCustomerStatus } from '../hooks/use-set-customer-status'
import { EditCustomerDialog } from './edit-customer-dialog'
import { ArchiveCustomerDialog } from './archive-customer-dialog'

/** Per-row kebab menu for a customer: edit, toggle active/inactive, archive. */
export function CustomerRowActions({ customer }: { customer: Customer }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const statusMutation = useSetCustomerStatus()

  const canEdit = canEditCustomer(customer)

  useEffect(() => {
    if (!menuOpen) return
    function close(event: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        btnRef.current && !btnRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  function toggleStatus() {
    setMenuOpen(false)
    statusMutation.mutate({ id: customer.id, isActive: !customer.isActive })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Customer actions"
        title="Actions"
        onClick={() => setMenuOpen((open) => !open)}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '9px', border: `1px solid ${menuOpen ? 'var(--app-brand-soft)' : 'var(--app-border-strong)'}`, background: menuOpen ? 'var(--app-chip-bg)' : 'var(--app-surface)', color: menuOpen ? 'var(--app-brand)' : 'var(--app-text-soft)', cursor: 'pointer' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
      </button>

      {menuOpen ? (
        <div
          ref={menuRef}
          style={{ position: 'absolute', right: 0, top: '40px', zIndex: 61, width: '206px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', borderRadius: '13px', boxShadow: '0 18px 44px rgba(7,40,70,0.22)', padding: '6px', animation: 'popIn .14s ease' }}
        >
          <MenuBtn
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" style={{ color: 'var(--app-brand)' }}><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>}
            label="Edit details"
            disabled={!canEdit}
            onClick={() => { setMenuOpen(false); setEditing(true) }}
          />
          <MenuBtn
            icon={
              customer.isActive ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ color: 'var(--app-text-soft)' }}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5v5M14.5 9.5v5" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--app-chip-green-text)' }}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>
              )
            }
            label={customer.isActive ? 'Set as inactive' : 'Set as active'}
            disabled={statusMutation.isPending}
            onClick={toggleStatus}
          />
          <div style={{ height: '1px', background: 'var(--app-border)', margin: '5px 4px' }} />
          <MenuBtn
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" /><path d="M10 12h4" /></svg>}
            label="Archive customer"
            onClick={() => { setMenuOpen(false); setArchiving(true) }}
            danger
          />
        </div>
      ) : null}

      <EditCustomerDialog customer={customer} open={editing} onOpenChange={setEditing} />
      <ArchiveCustomerDialog customer={customer} open={archiving} onOpenChange={setArchiving} />
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '11px', width: '100%', padding: '10px 11px', border: 'none', background: hovered && !disabled ? (danger ? 'rgba(220,38,38,0.09)' : 'var(--app-surface-2)') : 'transparent', borderRadius: '9px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 500, color: danger ? '#dc2626' : 'var(--app-text)', textAlign: 'left' }}
    >
      {icon}
      {label}
    </button>
  )
}
