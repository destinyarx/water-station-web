import type {
  DashboardFinancialsRow,
  DashboardMetricRow,
  DashboardOperationsRow,
} from './dashboard.schema'
import type {
  DashboardFinancials,
  DashboardMetric,
  DashboardOperations,
} from './dashboard.types'

function toDashboardMetric(row: DashboardMetricRow): DashboardMetric {
  return {
    value: row.value,
    trends: row.trends.map((trend) => ({
      key: trend.key,
      current: trend.current,
      baseline: trend.baseline,
      percentage: trend.percentage,
      direction: trend.direction,
      label: trend.label,
    })),
  }
}

export function toDashboardFinancials(
  row: DashboardFinancialsRow,
): DashboardFinancials {
  return {
    period: row.period,
    referenceDate: row.reference_date,
    hasAnyFinancialActivity: row.has_any_financial_activity,
    deliverySales: toDashboardMetric(row.delivery_sales),
    expenses: toDashboardMetric(row.expenses),
    chart: row.chart.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      sales: bucket.sales,
      expenses: bucket.expenses,
    })),
    salesMix: row.sales_mix.map((item) => ({
      kind: item.kind,
      revenue: item.revenue,
      percentage: item.percentage,
    })),
    topProducts: row.top_products.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      units: product.units,
      revenue: product.revenue,
      rank: product.rank,
      relativePercentage: product.relative_percentage,
    })),
  }
}

export function toDashboardOperations(
  row: DashboardOperationsRow,
): DashboardOperations {
  return {
    period: row.period,
    referenceDate: row.reference_date,
    hasAnyOperationalActivity: row.has_any_operational_activity,
    pendingDeliveries: row.pending_deliveries
      ? toDashboardMetric(row.pending_deliveries)
      : null,
    completedDeliveries: toDashboardMetric(row.completed_deliveries),
    refillUnits: toDashboardMetric(row.refill_units),
    deliveryQueue: row.delivery_queue.map((delivery) => ({
      deliveryId: delivery.delivery_id,
      recipient: delivery.recipient,
      itemSummary: delivery.item_summary,
      assignee: delivery.assignee,
      status: delivery.status,
      deliveryDate: delivery.delivery_date,
    })),
    lowStock: row.low_stock.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      stock: product.stock,
    })),
    maintenanceDue: row.maintenance_due.map((task) => ({
      taskId: task.task_id,
      title: task.title,
      equipment: task.equipment,
      dueDate: task.due_date,
      isOverdue: task.is_overdue,
      assignee: task.assignee,
    })),
  }
}
