import { z } from 'zod'

export const dashboardPeriodSchema = z.enum([
  'today',
  'yesterday',
  'this_week',
  'this_month',
])

export const dashboardDateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)

const dashboardComparisonKeySchema = z.enum([
  'previous_day',
  'previous_week',
  'previous_month',
  'previous_period',
])

const finiteNumberSchema = z.coerce.number().finite()
const nonNegativeNumberSchema = finiteNumberSchema.nonnegative()

export const dashboardTrendRowSchema = z
  .object({
    key: dashboardComparisonKeySchema,
    current: nonNegativeNumberSchema,
    baseline: nonNegativeNumberSchema.nullable(),
    percentage: finiteNumberSchema.nullable(),
    direction: z.enum(['up', 'down', 'neutral', 'unavailable']),
    label: z.string().min(1),
  })
  .strict()

export const dashboardMetricRowSchema = z
  .object({
    value: nonNegativeNumberSchema,
    trends: z.array(dashboardTrendRowSchema),
  })
  .strict()

const dashboardChartBucketRowSchema = z
  .object({
    key: dashboardDateKeySchema,
    label: z.string().min(1),
    sales: nonNegativeNumberSchema,
    expenses: nonNegativeNumberSchema,
  })
  .strict()

const dashboardSalesMixRowSchema = z
  .object({
    kind: z.enum(['refill_service', 'stock_tracked_product']),
    revenue: nonNegativeNumberSchema,
    percentage: nonNegativeNumberSchema.max(100),
  })
  .strict()

const dashboardTopProductRowSchema = z
  .object({
    product_id: z.coerce.number().int().positive(),
    product_name: z.string().min(1),
    units: nonNegativeNumberSchema,
    revenue: nonNegativeNumberSchema,
    rank: z.coerce.number().int().min(1).max(5),
    relative_percentage: nonNegativeNumberSchema.max(100),
  })
  .strict()

export const dashboardFinancialsRowSchema = z
  .object({
    period: dashboardPeriodSchema,
    reference_date: dashboardDateKeySchema,
    has_any_financial_activity: z.boolean(),
    delivery_sales: dashboardMetricRowSchema,
    expenses: dashboardMetricRowSchema,
    chart: z.array(dashboardChartBucketRowSchema),
    sales_mix: z.array(dashboardSalesMixRowSchema).length(2),
    top_products: z.array(dashboardTopProductRowSchema).max(5),
  })
  .strict()

const dashboardDeliveryQueueRowSchema = z
  .object({
    delivery_id: z.coerce.number().int().positive(),
    recipient: z.string().min(1),
    item_summary: z.string().min(1),
    assignee: z.string().nullable(),
    status: z.enum([
      'pending',
      'for_delivery',
      'completed',
      'failed',
      'cancelled',
    ]),
    delivery_date: dashboardDateKeySchema,
  })
  .strict()

const dashboardLowStockRowSchema = z
  .object({
    product_id: z.coerce.number().int().positive(),
    product_name: z.string().min(1),
    stock: z.coerce.number().int().nonnegative(),
  })
  .strict()

const dashboardMaintenanceRowSchema = z
  .object({
    task_id: z.coerce.number().int().positive(),
    title: z.string().min(1),
    equipment: z.string().min(1),
    due_date: dashboardDateKeySchema,
    is_overdue: z.boolean(),
    assignee: z.string().nullable(),
  })
  .strict()

export const dashboardOperationsRowSchema = z
  .object({
    period: dashboardPeriodSchema,
    reference_date: dashboardDateKeySchema,
    has_any_operational_activity: z.boolean(),
    pending_deliveries: dashboardMetricRowSchema.nullable(),
    completed_deliveries: dashboardMetricRowSchema,
    refill_units: dashboardMetricRowSchema,
    delivery_queue: z.array(dashboardDeliveryQueueRowSchema).max(6),
    low_stock: z.array(dashboardLowStockRowSchema).max(5),
    maintenance_due: z.array(dashboardMaintenanceRowSchema).max(5),
  })
  .strict()

export type DashboardFinancialsRow = z.infer<
  typeof dashboardFinancialsRowSchema
>
export type DashboardOperationsRow = z.infer<
  typeof dashboardOperationsRowSchema
>
export type DashboardMetricRow = z.infer<typeof dashboardMetricRowSchema>
