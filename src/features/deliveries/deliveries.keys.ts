export interface DeliveryFilters {
  deleted: boolean
}

export const deliveryKeys = {
  all: ['deliveries'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (filters: DeliveryFilters) => [...deliveryKeys.lists(), filters] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: number) => [...deliveryKeys.details(), id] as const,
}
