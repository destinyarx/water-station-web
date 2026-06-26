export const DELIVERIES_PAGE_SIZE = 10

export interface Paged<T> {
  rows: T[]
  hasNext: boolean
}

/**
 * Prev/next pagination without a count query: fetch `pageSize + 1` rows, and if
 * the probe row came back there is another page. Drops the probe before render.
 */
export function applyLimitPlusOne<T>(rows: T[], pageSize: number): Paged<T> {
  const hasNext = rows.length > pageSize
  return { rows: hasNext ? rows.slice(0, pageSize) : rows, hasNext }
}
