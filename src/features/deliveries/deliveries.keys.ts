export interface DeliveryFilters {
  deleted: boolean
}

export type DeliveryHistoryStatusFilter =
  | 'all'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface DeliveryHistoryFilters {
  page: number
  status: DeliveryHistoryStatusFilter
}

export type DeliveryScheduleStatusFilter = 'all' | 'active' | 'inactive'
export type DeliveryScheduleCustomerTypeFilter =
  | 'all'
  | 'business'
  | 'household'

export interface DeliveryScheduleFilters {
  page: number
  search: string
  status: DeliveryScheduleStatusFilter
  customerType: DeliveryScheduleCustomerTypeFilter
}

export const deliveryKeys = {
  all: ['deliveries'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (filters: DeliveryFilters) => [...deliveryKeys.lists(), filters] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: number) => [...deliveryKeys.details(), id] as const,
  queue: () => [...deliveryKeys.all, 'queue'] as const,
  queuePage: (page: number) => [...deliveryKeys.queue(), page] as const,
  counts: () => [...deliveryKeys.all, 'counts'] as const,
  history: () => [...deliveryKeys.all, 'history'] as const,
  historyPage: (filters: DeliveryHistoryFilters) =>
    [...deliveryKeys.history(), filters] as const,
  schedules: () => [...deliveryKeys.all, 'schedules'] as const,
  schedulesPage: (filters: DeliveryScheduleFilters) =>
    [...deliveryKeys.schedules(), filters] as const,
  orgUsers: () => [...deliveryKeys.all, 'org-users'] as const,
}
