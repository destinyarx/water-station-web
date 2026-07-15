'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { canManageProduct, type ProductActor } from '../products.guards'
import type { Product } from '../products.types'
import { useSetProductStatus } from '../hooks/use-set-product-status'
import { DeleteProductDialog } from './delete-product-dialog'
import { EditProductDialog } from './edit-product-dialog'

interface ProductRowActionsProps {
  product: Product
  actor: ProductActor | null
  onActionSuccess?: (message: string) => void
}

/** Card kebab menu for a product: edit, discontinue/reactivate, delete. */
export function ProductRowActions({ product, actor, onActionSuccess }: ProductRowActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const statusMutation = useSetProductStatus()
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null)

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

  // The card and its banner both clip overflow, so an in-flow menu gets sliced
  // at the banner's edge. Portal it to the body and pin it to the button.
  useLayoutEffect(() => {
    if (!menuOpen) return
    function place() {
      const rect = btnRef.current?.getBoundingClientRect()
      if (rect) setAnchor({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [menuOpen])

  if (!canManageProduct(product, actor)) return null

  function toggleStatus() {
    setMenuOpen(false)
    statusMutation.mutate(
      { id: product.id, isActive: !product.isActive },
      { onSuccess: () => onActionSuccess?.(product.isActive ? 'Product discontinued.' : 'Product reactivated.') },
    )
  }

  return (
    <div style={{ position: 'absolute', top: '9px', right: '9px', zIndex: 5 }}>
      <button
        ref={btnRef}
        type="button"
        aria-label="Product actions"
        onClick={() => setMenuOpen((open) => !open)}
        style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#0c2a3e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.14)' }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
      </button>

      {menuOpen && anchor ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: anchor.top, right: anchor.right, zIndex: 61, width: '210px', background: 'var(--app-surface)', border: '1px solid var(--app-border-strong)', borderRadius: '13px', boxShadow: '0 18px 44px rgba(7,40,70,0.22)', padding: '6px', animation: 'popIn .14s ease' }}
        >
          <MenuBtn
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" style={{ color: 'var(--app-brand)' }}><path d="M14.5 5.5l4 4M4 20l1-4.2L16 4.8a1.6 1.6 0 0 1 2.2 0l1 1a1.6 1.6 0 0 1 0 2.2L8.2 19 4 20Z" /></svg>}
            label="Edit product"
            onClick={() => { setMenuOpen(false); setEditing(true) }}
          />
          <MenuBtn
            icon={
              product.isActive ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ color: 'var(--app-chip-gray-text)' }}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5v5M14.5 9.5v5" /></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--app-chip-green-text)' }}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.3 2.3 4.4-4.7" /></svg>
              )
            }
            label={product.isActive ? 'Discontinue' : 'Reactivate'}
            disabled={statusMutation.isPending}
            onClick={toggleStatus}
          />
          <div style={{ height: '1px', background: 'var(--app-border)', margin: '5px 4px' }} />
          <MenuBtn
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>}
            label="Delete product"
            onClick={() => { setMenuOpen(false); setDeleting(true) }}
            danger
          />
        </div>,
        document.body,
      ) : null}

      <EditProductDialog product={product} open={editing} onOpenChange={setEditing} onUpdated={() => onActionSuccess?.('Product updated successfully.')} />
      <DeleteProductDialog product={product} open={deleting} onOpenChange={setDeleting} onDeleted={() => onActionSuccess?.('Product deleted successfully.')} />
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
