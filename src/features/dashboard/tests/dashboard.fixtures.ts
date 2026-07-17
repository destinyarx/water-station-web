import type {
  DashboardFinancialsRow,
  DashboardOperationsRow,
} from '../dashboard.schema'

export const financialsRow: DashboardFinancialsRow = {
  period: 'today',
  reference_date: '2026-07-17',
  has_any_financial_activity: true,
  delivery_sales: {
    value: 9240.5,
    trends: [
      {
        key: 'previous_day',
        current: 9240.5,
        baseline: 8000,
        percentage: 15.50625,
        direction: 'up',
        label: 'Increase',
      },
    ],
  },
  expenses: {
    value: 1200,
    trends: [
      {
        key: 'previous_day',
        current: 1200,
        baseline: 900,
        percentage: 33.333333,
        direction: 'up',
        label: 'Increase',
      },
    ],
  },
  chart: [
    {
      key: '2026-07-17',
      label: 'Jul 17',
      sales: 9240.5,
      expenses: 1200,
    },
  ],
  sales_mix: [
    { kind: 'refill_service', revenue: 7000.5, percentage: 75.759 },
    {
      kind: 'stock_tracked_product',
      revenue: 2240,
      percentage: 24.241,
    },
  ],
  top_products: [
    {
      product_id: 10,
      product_name: 'Five-gallon refill',
      units: 42.5,
      revenue: 1275,
      rank: 1,
      relative_percentage: 100,
    },
  ],
}

export const operationsRow: DashboardOperationsRow = {
  period: 'today',
  reference_date: '2026-07-17',
  has_any_operational_activity: true,
  pending_deliveries: { value: 3, trends: [] },
  completed_deliveries: {
    value: 5,
    trends: [
      {
        key: 'previous_day',
        current: 5,
        baseline: 4,
        percentage: 25,
        direction: 'up',
        label: 'Increase',
      },
    ],
  },
  refill_units: {
    value: 58.5,
    trends: [
      {
        key: 'previous_day',
        current: 58.5,
        baseline: 0,
        percentage: null,
        direction: 'up',
        label: 'New activity',
      },
    ],
  },
  delivery_queue: [
    {
      delivery_id: 77,
      recipient: 'Riverside Apartments',
      item_summary: '3× Five-gallon refill',
      assignee: 'Mika Santos',
      status: 'for_delivery',
      delivery_date: '2026-07-17',
    },
  ],
  low_stock: [
    { product_id: 2, product_name: 'Bottled water 1L', stock: 7 },
  ],
  maintenance_due: [
    {
      task_id: 8,
      title: 'Sanitize storage tank',
      equipment: 'Storage Tank',
      due_date: '2026-07-17',
      is_overdue: false,
      assignee: null,
    },
  ],
}
