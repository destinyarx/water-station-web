import type { DeliveryStatus } from './deliveries.types'

/** A delivery line as far as stock movement is concerned. */
export interface StatusTransitionItem {
  productId: number
  productName: string
  quantity: number
  isStockTracked: boolean
}

/** A single product's stock change: negative deducts, positive restores. */
export interface StockDelta {
  productId: number
  delta: number
}

/** What a legal status change implies for stock and the derived fields. */
export interface LegalTransition {
  legal: true
  /** Only stock-tracked items with a non-zero movement. */
  stockDeltas: StockDelta[]
  /** `set` stamps `completed_at = now()`, `clear` nulls it. */
  completedAt: 'set' | 'clear'
  /** `require` needs non-empty remarks, `clear` nulls them. */
  failureRemarks: 'require' | 'clear'
  /** `require` needs non-empty remarks, `clear` nulls them. */
  cancellationRemarks: 'require' | 'clear'
  /** Stamp `delivered_by` with the acting user (entering `for_delivery`). */
  stampDeliveredBy: boolean
  /** Whether the occurrence is editable once it lands on the new status. */
  editableAfter: boolean
}

export type ResolvedTransition = LegalTransition | { legal: false }

/**
 * Legal next statuses per current status. Core flow is pending -> for_delivery
 * -> completed/failed, with cancelled as a terminal side exit.
 */
const LEGAL_NEXT: Record<DeliveryStatus, readonly DeliveryStatus[]> = {
  pending: ['for_delivery', 'cancelled'],
  for_delivery: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
}

/** Statuses reachable from `from` (forward and revert edges). */
export function legalNextStatuses(
  from: DeliveryStatus,
): readonly DeliveryStatus[] {
  return LEGAL_NEXT[from]
}

/** Stock is "out" while a delivery is dispatched or completed. */
function isStockOut(status: DeliveryStatus): boolean {
  return status === 'for_delivery' || status === 'completed'
}

/**
 * Resolves a delivery status change into its stock movement and derived field
 * effects. Pure: forward and revert transitions both flow through the same
 * class comparison (ADR 0003). Stock moves only for `is_stock_tracked` items.
 */
export function resolveStatusTransition(
  from: DeliveryStatus,
  to: DeliveryStatus,
  items: StatusTransitionItem[],
): ResolvedTransition {
  if (!LEGAL_NEXT[from].includes(to)) {
    return { legal: false }
  }

  const wasOut = isStockOut(from)
  const isOut = isStockOut(to)
  // in -> out deducts, out -> in restores, same class moves nothing.
  const direction = wasOut === isOut ? 0 : isOut ? -1 : 1

  const stockDeltas: StockDelta[] =
    direction === 0
      ? []
      : items
          .filter((item) => item.isStockTracked)
          .map((item) => ({
            productId: item.productId,
            delta: direction * item.quantity,
          }))

  return {
    legal: true,
    stockDeltas,
    completedAt: to === 'completed' ? 'set' : 'clear',
    failureRemarks: to === 'failed' ? 'require' : 'clear',
    cancellationRemarks: to === 'cancelled' ? 'require' : 'clear',
    stampDeliveredBy: to === 'for_delivery',
    editableAfter: false,
  }
}
