'use client'

import { LOW_STOCK_THRESHOLD } from '../products.constants'
import type { ProductActor } from '../products.guards'
import type { Product } from '../products.types'
import { ProductRowActions } from './product-row-actions'

interface ProductsGridProps {
  products: Product[]
  actor: ProductActor | null
  onActionSuccess?: (message: string) => void
}

const priceFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const RefillIcon = (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"><path d="M9 2.5h6v2l-1.2 1.5h-3.6L9 4.5v-2Z" /><path d="M8 6h8a1 1 0 0 1 1 1v12.5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z" /><path d="M9.5 13.5a2.6 2.6 0 0 1 4.6-1.3M14.5 14.5a2.6 2.6 0 0 1-4.6 1.3" /><path d="M14.4 11.4v1.6h-1.6M9.6 16.6V15h1.6" /></svg>
)
const BottleIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"><path d="M10 2.5h4v1.6l1 1v1.8l-1 1v1l1 1v8.1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-8.1l1-1v-1l-1-1V6.7l1-1V2.5Z" /><path d="M9 14.5h6" /></svg>
)

function stockBadge(stock: number): { label: string; color: string; bg: string } {
  if (stock === 0) return { label: 'Out of stock', color: 'var(--app-chip-red-text)', bg: 'var(--app-chip-red-bg)' }
  if (stock <= LOW_STOCK_THRESHOLD) return { label: `Low · ${stock} left`, color: 'var(--app-chip-amber-text)', bg: 'var(--app-chip-amber-bg)' }
  return { label: `${stock} in stock`, color: 'var(--app-chip-green-text)', bg: 'var(--app-chip-green-bg)' }
}

export function ProductsGrid({ products, actor, onActionSuccess }: ProductsGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(236px,1fr))', gap: '16px' }}>
      {products.map((product) => {
        const refillable = !product.isStockTracked
        const discontinued = !product.isActive
        const imgBg = discontinued
          ? 'var(--app-card-disc-bg)'
          : refillable
            ? 'var(--app-card-refill-bg)'
            : 'var(--app-card-stock-bg)'
        const iconColor = refillable ? 'var(--app-brand)' : 'var(--app-chip-green-text)'
        const waveColor = refillable ? '#7fd1f7' : '#7bdcab'
        const tagColor = refillable ? 'var(--app-brand)' : 'var(--app-chip-green-text)'
        const tagLabel = refillable ? 'Refill service' : 'Bottled'
        const badge = refillable ? null : stockBadge(product.stock)

        return (
          <div key={product.id} style={{ position: 'relative', background: 'var(--app-surface)', border: '1px solid var(--app-border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--app-shadow-card)', opacity: discontinued ? 0.62 : 1, display: 'flex', flexDirection: 'column' }}>
            {/* visual */}
            <div style={{ position: 'relative', height: '104px', background: imgBg, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, lineHeight: 0, opacity: 0.5 }}>
                <svg viewBox="0 0 220 40" width="100%" height="34" preserveAspectRatio="none"><path d="M0 22 C40 8 70 30 110 22 C150 14 180 30 220 18 L220 40 L0 40 Z" fill={waveColor} /></svg>
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, lineHeight: 0, opacity: 0.4 }}>
                <svg viewBox="0 0 220 40" width="100%" height="26" preserveAspectRatio="none"><path d="M0 28 C50 18 80 34 130 26 C170 20 195 32 220 26 L220 40 L0 40 Z" fill="#ffffff" /></svg>
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '18px', transform: 'translateY(-58%)', width: '54px', height: '54px', borderRadius: '15px', background: 'rgba(255,255,255,0.86)', boxShadow: '0 8px 18px rgba(7,40,70,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>
                {refillable ? RefillIcon : BottleIcon}
              </div>
              <span style={{ position: 'absolute', top: '11px', left: '18px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: tagColor, background: 'rgba(255,255,255,0.86)', padding: '3px 9px', borderRadius: '999px' }}>{tagLabel}</span>

              {discontinued ? (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,21,33,0.42)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '5px 12px', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Discontinued</span>
                </div>
              ) : null}

              <ProductRowActions product={product} actor={actor} onActionSuccess={onActionSuccess} />
            </div>

            {/* body */}
            <div style={{ padding: '14px 16px 15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--app-text)', lineHeight: 1.3, marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.productName}</div>
              <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--app-text-muted)', margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '37px' }}>{product.description?.trim() || 'No description added.'}</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginTop: 'auto', paddingTop: '13px', borderTop: '1px solid var(--app-border)' }}>
                <div>
                  <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--app-text-faint)', marginBottom: '2px' }}>Price</div>
                  <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--app-text)', lineHeight: 1 }}>₱{priceFormatter.format(product.price)}</div>
                </div>
                {badge ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: badge.color, background: badge.bg, padding: '5px 10px', borderRadius: '9px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {badge.label}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 700, color: 'var(--app-brand)', background: 'var(--app-chip-bg)', padding: '5px 10px', borderRadius: '9px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></svg>
                    Refillable
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
