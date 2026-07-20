'use client'

import { cn } from '@/lib/utils'

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

function stockBadge(stock: number): { label: string; className: string } {
  if (stock === 0) {
    return {
      label: 'Out of stock',
      className: 'bg-(--app-chip-red-bg) text-(--app-chip-red-text)',
    }
  }

  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: `Low · ${stock} left`,
      className: 'bg-(--app-chip-amber-bg) text-(--app-chip-amber-text)',
    }
  }

  return {
    label: `${stock} in stock`,
    className: 'bg-(--app-chip-green-bg) text-(--app-chip-green-text)',
  }
}

export function ProductsGrid({ products, actor, onActionSuccess }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-4">
      {products.map((product) => {
        const refillable = !product.isStockTracked
        const discontinued = !product.isActive
        const imageClassName = discontinued
          ? 'bg-[image:var(--app-card-disc-bg)]'
          : refillable
            ? 'bg-[image:var(--app-card-refill-bg)]'
            : 'bg-[image:var(--app-card-stock-bg)]'
        const productTypeClassName = refillable
          ? 'text-(--app-brand)'
          : 'text-(--app-chip-green-text)'
        const tagLabel = refillable ? 'Refill service' : 'Bottled'
        const badge = refillable ? null : stockBadge(product.stock)

        return (
          <div
            key={product.id}
            className={cn(
              'relative flex flex-col overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-surface) shadow-(--app-shadow-card)',
              discontinued && 'opacity-[0.62]',
            )}
          >
            <div className={cn('relative h-26 overflow-hidden', imageClassName)}>
              <div className="absolute inset-x-0 bottom-0 leading-none opacity-50">
                <svg viewBox="0 0 220 40" width="100%" height="34" preserveAspectRatio="none">
                  <path
                    className={refillable ? 'fill-[#7fd1f7]' : 'fill-[#7bdcab]'}
                    d="M0 22 C40 8 70 30 110 22 C150 14 180 30 220 18 L220 40 L0 40 Z"
                  />
                </svg>
              </div>
              <div className="absolute inset-x-0 bottom-0 leading-none opacity-40">
                <svg viewBox="0 0 220 40" width="100%" height="26" preserveAspectRatio="none">
                  <path className="fill-white" d="M0 28 C50 18 80 34 130 26 C170 20 195 32 220 26 L220 40 L0 40 Z" />
                </svg>
              </div>

              <div className="absolute flex flex-row items-start gap-2.5 pt-2 pl-2">
                <div
                  className={cn(
                    'flex size-13.5 items-center justify-center rounded-[15px] bg-white/86 shadow-[0_8px_18px_rgba(7,40,70,0.16)]',
                    productTypeClassName,
                  )}
                >
                  {refillable ? RefillIcon : BottleIcon}
                </div>
                <span
                  className={cn(
                    'inline-flex h-fit w-fit shrink-0 self-start rounded-full bg-white/86 px-2.25 py-0.75 text-[10px] leading-none font-bold tracking-[0.04em] whitespace-nowrap uppercase',
                    productTypeClassName,
                  )}
                >
                  {tagLabel}
                </span>
              </div>

              {discontinued ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,21,33,0.42)]">
                  <span className="rounded-full bg-black/50 px-3 py-1.25 text-[10.5px] font-bold tracking-[0.08em] text-white uppercase">
                    Discontinued
                  </span>
                </div>
              ) : null}

              <ProductRowActions product={product} actor={actor} onActionSuccess={onActionSuccess} />
            </div>

            <div className="flex flex-1 flex-col px-4 pt-3.5 pb-3.75">
              <div className="mb-1.25 truncate text-[14.5px] leading-[1.3] font-bold text-(--app-text)">
                {product.productName}
              </div>
              <p className="mb-3.5 line-clamp-2 min-h-9.25 text-[12.5px] leading-[1.5] text-(--app-text-muted)">
                {product.description?.trim() || 'No description added.'}
              </p>
              <div className="mt-auto flex items-end justify-between gap-2 border-t border-(--app-border) pt-3.25">
                <div>
                  <div className="mb-0.5 text-[9.5px] font-bold tracking-[0.07em] text-(--app-text-faint) uppercase">Price</div>
                  <div className="text-[19px] leading-none font-extrabold tracking-[-0.02em] text-(--app-text)">₱{priceFormatter.format(product.price)}</div>
                </div>
                {badge ? (
                  <span className={cn('inline-flex items-center gap-1.25 rounded-[9px] px-2.5 py-1.25 text-[11.5px] font-bold', badge.className)}>
                    <span className="size-1.5 rounded-full bg-current" />
                    {badge.label}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.25 rounded-[9px] bg-(--app-chip-bg) px-2.5 py-1.25 text-[11.5px] font-bold text-(--app-brand)">
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
