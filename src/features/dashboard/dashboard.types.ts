export type DashboardPeriod =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'

export type DashboardChartPeriod = 'weekly' | 'monthly'

export type DashboardComparisonKey =
  | 'previous_day'
  | 'previous_week'
  | 'previous_month'
  | 'previous_period'

export type DashboardTrendDirection =
  | 'up'
  | 'down'
  | 'neutral'
  | 'unavailable'

export type DashboardTrend = {
  key: DashboardComparisonKey
  current: number
  baseline: number | null
  percentage: number | null
  direction: DashboardTrendDirection
  label: string
}

export type DashboardMetric = {
  value: number
  trends: DashboardTrend[]
}

export type DashboardChartBucket = {
  key: string
  label: string
  sales: number
  expenses: number
}

export type DashboardSalesMixKind =
  | 'refill_service'
  | 'stock_tracked_product'

export type DashboardSalesMixItem = {
  kind: DashboardSalesMixKind
  revenue: number
  percentage: number
}

export type DashboardTopProduct = {
  productId: number
  productName: string
  units: number
  revenue: number
  rank: number
  relativePercentage: number
}

export type DashboardFinancials = {
  period: DashboardPeriod
  referenceDate: string
  hasAnyFinancialActivity: boolean
  deliverySales: DashboardMetric
  expenses: DashboardMetric
  chart: DashboardChartBucket[]
  salesMix: DashboardSalesMixItem[]
  topProducts: DashboardTopProduct[]
}

export type DashboardDeliveryStatus =
  | 'pending'
  | 'for_delivery'
  | 'completed'
  | 'failed'
  | 'cancelled'

export type DashboardDeliveryQueueItem = {
  deliveryId: number
  recipient: string
  itemSummary: string
  assignee: string | null
  status: DashboardDeliveryStatus
  deliveryDate: string
}

export type DashboardLowStockItem = {
  productId: number
  productName: string
  stock: number
}

export type DashboardMaintenanceItem = {
  taskId: number
  title: string
  equipment: string
  dueDate: string
  isOverdue: boolean
  assignee: string | null
}

export type DashboardOperations = {
  period: DashboardPeriod
  referenceDate: string
  hasAnyOperationalActivity: boolean
  pendingDeliveries: DashboardMetric | null
  completedDeliveries: DashboardMetric
  refillUnits: DashboardMetric
  deliveryQueue: DashboardDeliveryQueueItem[]
  lowStock: DashboardLowStockItem[]
  maintenanceDue: DashboardMaintenanceItem[]
}

export type DashboardDateRange = {
  start: string
  endExclusive: string
}

export type DashboardComparisonRange = DashboardDateRange & {
  key: DashboardComparisonKey
}
