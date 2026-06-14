'use client'

import { useMemo, useState } from 'react'
import { ArrowDownUp, Droplets, Package, Search, Waves } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Product } from '../products.types'
import { useProductActor } from '../hooks/use-product-actor'
import { useProducts } from '../hooks/use-products'
import { CreateProductDialog } from './create-product-dialog'
import { ProductsTable } from './products-table'

type ProductSort = 'name' | 'price' | 'stock' | 'createdAt'
const EMPTY_PRODUCTS: Product[] = []

export function ProductsPage() {
  const { data: products, isPending, isError, error } = useProducts()
  const actor = useProductActor()
  const productList = products ?? EMPTY_PRODUCTS
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<ProductSort>('createdAt')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return productList
      .filter((product) =>
        product.productName.toLowerCase().includes(normalizedSearch),
      )
      .toSorted((first, second) => compareProducts(first, second, sortBy))
  }, [productList, searchQuery, sortBy])

  const stockTrackedCount = productList.filter(
    (product) => product.isStockTracked,
  ).length
  const nonStockTrackedCount = productList.length - stockTrackedCount

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="overflow-hidden rounded-3xl border border-[#dcecff] bg-white shadow-[0_16px_44px_rgba(0,48,73,0.08)]">
        <div className="relative p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(0,180,216,0.18),transparent_30%),radial-gradient(circle_at_92%_20%,rgba(0,245,212,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bdefff] bg-[#eef7ff]/80 px-3 py-1 text-sm font-semibold text-[#00677d]">
                <Droplets className="size-4" aria-hidden="true" />
                Refill services and inventory
              </div>
              <div>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#001d34] sm:text-4xl">
                  Products
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#2a4b6a] sm:text-base">
                  Manage refill services, bottled products, containers, and
                  other water station items.
                </p>
              </div>
            </div>
            <CreateProductDialog
              onCreated={() => setStatusMessage('Product created successfully.')}
            />
          </div>
        </div>
      </header>

      {statusMessage ? (
        <div
          role="status"
          className="rounded-2xl border border-[#00f5d4]/30 bg-[#00f5d4]/15 px-4 py-3 text-sm font-semibold text-[#005144]"
        >
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <ProductMetricCard
          label="Active products"
          value={productList.length}
          description="Items available for sales and delivery workflows"
        />
        <ProductMetricCard
          label="Stock tracked"
          value={stockTrackedCount}
          description="Bottles, containers, caps, and other inventory"
        />
        <ProductMetricCard
          label="Not tracked"
          value={nonStockTrackedCount}
          description="Refill services, delivery fees, and service charges"
        />
      </div>

      <div className="rounded-3xl border border-[#dcecff] bg-white/90 p-4 shadow-[0_16px_44px_rgba(0,48,73,0.06)] backdrop-blur-xl sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_auto] lg:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6d797e]"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search product name"
              className="h-11 rounded-xl border-[#dcecff] bg-[#eef7ff]/70 pl-9 text-[#001d34] placeholder:text-[#6d797e] focus-visible:border-[#00b4d8] focus-visible:ring-[#00b4d8]/20"
              aria-label="Search products"
            />
          </div>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as ProductSort)}
            className={cn(
              'h-11 rounded-xl border border-[#dcecff] bg-[#eef7ff]/70 px-3 text-sm text-[#001d34] outline-none transition-[color,box-shadow]',
              'focus:border-[#00b4d8] focus:ring-4 focus:ring-[#00b4d8]/20',
            )}
          >
            <option value="createdAt">Newest first</option>
            <option value="name">Product name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>

          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setSearchQuery('')
              setSortBy('createdAt')
            }}
            className="rounded-xl border border-[#dcecff] bg-white text-[#2a4b6a] hover:bg-[#eef7ff] hover:text-[#00414f]"
          >
            <ArrowDownUp className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      {isPending ? (
        <ProductsLoadingState />
      ) : isError ? (
        <div
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error.message}
        </div>
      ) : productList.length === 0 ? (
        <ProductsEmptyState />
      ) : filteredProducts.length === 0 ? (
        <ProductsNoResultsState />
      ) : (
        <ProductsTable
          products={filteredProducts}
          actor={actor}
          onActionSuccess={setStatusMessage}
        />
      )}
    </section>
  )
}

interface ProductMetricCardProps {
  label: string
  value: number
  description: string
}

function ProductMetricCard({
  label,
  value,
  description,
}: ProductMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#dcecff] bg-white/85 p-5 shadow-[0_12px_32px_rgba(0,48,73,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#2a4b6a]">{label}</p>
          <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-[#001d34]">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-[#e8fbff] text-[#00b4d8]">
          <Package className="size-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-5 text-[#2a4b6a]">{description}</p>
    </article>
  )
}

function ProductsLoadingState() {
  return (
    <div className="rounded-3xl border border-[#dcecff] bg-white/90 p-4 shadow-[0_16px_44px_rgba(0,48,73,0.06)]">
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-2xl bg-[#eef7ff]/70 p-4 md:grid-cols-[1.4fr_0.8fr_0.9fr_0.7fr_0.8fr_auto]"
          >
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white" />
            <div className="h-10 animate-pulse rounded-xl bg-white md:w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-[#9adff1] bg-[#eef7ff]/70 p-10 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-[#00b4d8] shadow-[0_12px_32px_rgba(0,48,73,0.08)]">
        <Waves className="size-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-heading text-xl font-semibold text-[#001d34]">
        No products yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#2a4b6a]">
        Start by adding your first refill service, bottled water, or container
        product.
      </p>
    </div>
  )
}

function ProductsNoResultsState() {
  return (
    <div className="rounded-3xl border border-[#dcecff] bg-white p-8 text-center">
      <h2 className="font-heading text-lg font-semibold text-[#001d34]">
        No matching products
      </h2>
      <p className="mt-2 text-sm text-[#2a4b6a]">
        Try a different product name or reset sorting.
      </p>
    </div>
  )
}

function compareProducts(
  first: Product,
  second: Product,
  sortBy: ProductSort,
): number {
  if (sortBy === 'name') {
    return first.productName.localeCompare(second.productName)
  }

  if (sortBy === 'price') {
    return first.price - second.price
  }

  if (sortBy === 'stock') {
    return first.stock - second.stock
  }

  return (
    new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  )
}
