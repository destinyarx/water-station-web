import type {
  Product,
  ProductFormValues,
  ProductInsert,
  ProductOwner,
  ProductRow,
  ProductUpdate,
} from './products.types'

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    productName: row.product_name,
    price: row.price,
    isStockTracked: row.is_stock_tracked,
    stock: row.stock,
    description: row.descriptions,
    isActive: row.is_active,
    orgId: row.org_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  }
}

export function toInsertRow(
  values: ProductFormValues,
  owner: ProductOwner,
): ProductInsert {
  return {
    product_name: values.productName.trim(),
    price: values.price,
    is_stock_tracked: values.isStockTracked,
    stock: values.isStockTracked ? values.stock : 0,
    descriptions: emptyToNull(values.description),
    org_id: owner.orgId,
    created_by: owner.createdBy,
  }
}

export function toUpdateRow(values: ProductFormValues): ProductUpdate {
  return {
    product_name: values.productName.trim(),
    price: values.price,
    is_stock_tracked: values.isStockTracked,
    stock: values.isStockTracked ? values.stock : 0,
    descriptions: emptyToNull(values.description),
    updated_at: new Date().toISOString(),
  }
}

export function toFormValues(product: Product): ProductFormValues {
  return {
    productName: product.productName,
    price: product.price,
    isStockTracked: product.isStockTracked,
    stock: product.isStockTracked ? product.stock : 0,
    description: product.description ?? '',
  }
}
