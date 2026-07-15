/** Filters that scope the maintenance list query. */
export interface MaintenanceFilters {
  showInactive: boolean
}

/** Array query-key factory for the maintenance feature. */
export const maintenanceKeys = {
  all: ['maintenance'] as const,
  lists: () => [...maintenanceKeys.all, 'list'] as const,
  list: (filters: MaintenanceFilters) => [...maintenanceKeys.lists(), filters] as const,
  history: () => [...maintenanceKeys.all, 'history'] as const,
  historyPage: (page: number) => [...maintenanceKeys.history(), page] as const,
  orgUsers: () => [...maintenanceKeys.all, 'org-users'] as const,
}
