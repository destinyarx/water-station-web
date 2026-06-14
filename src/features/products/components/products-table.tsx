import {
  Boxes,
  CalendarDays,
  Droplets,
  Package,
  PhilippinePeso,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { pesoFormatter } from '../products.constants'
import type { ProductActor } from '../products.guards'
import type { Product } from '../products.types'
import { ProductRowActions } from './product-row-actions'

interface ProductsTableProps {
  products: Product[]
  actor: ProductActor | null
  onActionSuccess?: (message: string) => void
}

export function ProductsTable({
  products,
  actor,
  onActionSuccess,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white/95 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
      <div className="border-b border-[#dcecff] bg-[#eef7ff]/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-sm">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#001d34]">
              Product catalog
            </h2>
            <p className="text-sm text-[#2a4b6a]">
              Refill services, bottled products, containers, and fees.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {products.map((product) => (
          <ProductMobileCard
            key={product.id}
            product={product}
            actor={actor}
            onActionSuccess={onActionSuccess}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-[#dcecff] bg-white hover:bg-white">
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Product
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Price
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Stock Tracking
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Stock
              </TableHead>
              <TableHead className="px-5 py-4 text-xs font-bold uppercase tracking-[0.12em] text-[#6d797e]">
                Updated
              </TableHead>
              <TableHead className="px-5 py-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className="border-[#e5f1ff] transition-colors hover:bg-[#eef7ff]/70"
              >
                <TableCell className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProductIcon isStockTracked={product.isStockTracked} />
                    <div>
                      <p className="font-semibold text-[#001d34]">
                        {product.productName}
                      </p>
                      <p className="max-w-xs truncate text-xs text-[#2a4b6a]">
                        {product.description ?? `Product #${product.id}`}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-4 text-sm font-semibold text-[#001d34]">
                  {pesoFormatter.format(product.price)}
                </TableCell>
                <TableCell className="px-5 py-4">
                  <StockTrackingBadge isStockTracked={product.isStockTracked} />
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-[#2a4b6a]">
                  {product.isStockTracked ? product.stock : 'Not tracked'}
                </TableCell>
                <TableCell className="px-5 py-4 text-sm text-[#2a4b6a]">
                  {formatDate(product.updatedAt ?? product.createdAt)}
                </TableCell>
                <TableCell className="px-5 py-4 text-right">
                  <ProductRowActions
                    product={product}
                    actor={actor}
                    onActionSuccess={onActionSuccess}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ProductMobileCard({
  product,
  actor,
  onActionSuccess,
}: {
  product: Product
  actor: ProductActor | null
  onActionSuccess?: (message: string) => void
}) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white p-4 shadow-[0_10px_24px_rgba(0,48,73,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProductIcon isStockTracked={product.isStockTracked} />
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold text-[#001d34]">
              {product.productName}
            </h3>
            <p className="truncate text-xs text-[#2a4b6a]">
              {product.description ?? `Product #${product.id}`}
            </p>
          </div>
        </div>
        <StockTrackingBadge isStockTracked={product.isStockTracked} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-[#2a4b6a]">
        <ProductInfoLine
          icon={PhilippinePeso}
          value={pesoFormatter.format(product.price)}
        />
        <ProductInfoLine
          icon={Boxes}
          value={product.isStockTracked ? String(product.stock) : 'Not tracked'}
        />
        <ProductInfoLine
          icon={CalendarDays}
          value={formatDate(product.updatedAt ?? product.createdAt)}
        />
      </div>

      <div className="mt-4 border-t border-[#e5f1ff] pt-3">
        <ProductRowActions
          product={product}
          actor={actor}
          onActionSuccess={onActionSuccess}
        />
      </div>
    </article>
  )
}

function ProductIcon({ isStockTracked }: { isStockTracked: boolean }) {
  const Icon = isStockTracked ? Package : Droplets

  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
      <Icon className="size-5" aria-hidden="true" />
    </span>
  )
}

function StockTrackingBadge({
  isStockTracked,
}: {
  isStockTracked: boolean
}) {
  return (
    <span className="inline-flex items-center rounded-lg bg-[#00f5d4]/15 px-2.5 py-1 text-xs font-bold text-[#005144]">
      {isStockTracked ? 'Tracked' : 'Not tracked'}
    </span>
  )
}

type ProductInfoLineProps = {
  icon: typeof Package
  value: string
}

function ProductInfoLine({ icon: Icon, value }: ProductInfoLineProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#00b4d8]" aria-hidden="true" />
      <span className="truncate">{value}</span>
    </div>
  )
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
