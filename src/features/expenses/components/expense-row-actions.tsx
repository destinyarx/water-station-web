'use client'

import { useEffect, useRef, useState } from 'react'

import type { Expense } from '../expenses.types'
import { DeleteExpenseDialog } from './delete-expense-dialog'
import { DuplicateExpenseDialog } from './duplicate-expense-dialog'
import { EditExpenseDialog } from './edit-expense-dialog'

export function ExpenseRowActions({ expense }: { expense: Expense }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Actions"
        onClick={() => setMenuOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '9px',
          border: `1px solid ${menuOpen ? 'var(--app-brand-soft)' : 'var(--app-border-strong)'}`,
          background: menuOpen ? 'var(--app-chip-bg)' : 'var(--app-surface)',
          color: menuOpen ? 'var(--app-brand)' : 'var(--app-text-soft)',
          cursor: 'pointer',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="19" r="1.7" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60 }} />
          <div
            ref={menuRef}
            style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              zIndex: 61,
              width: '194px',
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border-strong)',
              borderRadius: '13px',
              boxShadow: '0 18px 44px rgba(7,40,70,0.22)',
              padding: '6px',
              animation: 'popIn .14s ease',
            }}
          >
            <MenuBtn
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" style={{ color: 'var(--app-brand)' }}><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>}
              label="Edit expense"
              onClick={() => { setMenuOpen(false); setEditing(true) }}
            />
            <MenuBtn
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" style={{ color: 'var(--app-text-soft)' }}><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M5 16V5a2 2 0 0 1 2-2h9" /></svg>}
              label="Duplicate"
              onClick={() => { setMenuOpen(false); setDuplicating(true) }}
            />
            <div style={{ height: '1px', background: 'var(--app-border)', margin: '5px 4px' }} />
            <MenuBtn
              icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>}
              label="Delete expense"
              onClick={() => { setMenuOpen(false); setDeleting(true) }}
              danger
            />
          </div>
        </>
      )}

      <EditExpenseDialog expense={expense} open={editing} onOpenChange={setEditing} />
      <DuplicateExpenseDialog expense={expense} open={duplicating} onOpenChange={setDuplicating} />
      <DeleteExpenseDialog expense={expense} open={deleting} onOpenChange={setDeleting} />
    </div>
  )
}

function MenuBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        width: '100%',
        padding: '10px 11px',
        border: 'none',
        background: hovered ? (danger ? 'rgba(220,38,38,0.09)' : 'var(--app-surface-2)') : 'transparent',
        borderRadius: '9px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '13.5px',
        fontWeight: 500,
        color: danger ? '#dc2626' : 'var(--app-text)',
        textAlign: 'left',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
