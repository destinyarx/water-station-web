import type { DashboardPeriod } from './dashboard.types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  financialsAll: () => [...dashboardKeys.all, 'financials'] as const,
  financials: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.financialsAll(), period, referenceDate] as const,
  operationsAll: () => [...dashboardKeys.all, 'operations'] as const,
  operations: (period: DashboardPeriod, referenceDate: string) =>
    [...dashboardKeys.operationsAll(), period, referenceDate] as const,
}
