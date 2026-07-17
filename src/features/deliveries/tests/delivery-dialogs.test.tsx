import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CancelDeliveryDialog } from '../components/cancel-delivery-dialog'
import { DeliveryStatusConfirmationDialog } from '../components/delivery-status-confirmation-dialog'
import type { Delivery } from '../deliveries.types'

const delivery = {
  id: 77,
  scheduleId: 99,
  deliveryDate: '2026-07-18',
  status: 'pending',
  failureRemarks: null,
  cancellationRemarks: null,
  notes: null,
  assignedTo: null,
  deliveredBy: null,
  completedAt: null,
  orgId: '00000000-0000-4000-8000-000000000321',
  createdBy: 'user_123',
  createdAt: '2026-07-18T00:00:00.000Z',
  updatedAt: null,
  deletedAt: null,
  items: [],
  total: 0,
} satisfies Delivery

describe('CancelDeliveryDialog', () => {
  it('renders its explanation and required cancellation reason field together', () => {
    const html = renderToStaticMarkup(
      <CancelDeliveryDialog
        open
        onOpenChange={vi.fn()}
        isPending={false}
        onConfirm={vi.fn()}
      />,
    )

    expect(html).toContain('Record why this delivery is cancelled')
    expect(html).toContain('id="cancellation-remarks"')
    expect(html).toContain('Keep delivery')
    expect(html).toContain('Cancel delivery')
  })
})

describe('DeliveryStatusConfirmationDialog', () => {
  it('uses status-specific copy and concise record recipient details', () => {
    const html = renderToStaticMarkup(
      <DeliveryStatusConfirmationDialog
        open
        onOpenChange={vi.fn()}
        delivery={delivery}
        recipient={{
          name: 'Riverside Apartments',
          source: 'record',
          address: 'Poblacion, Cebu',
        }}
        status="for_delivery"
        isPending={false}
        onConfirm={vi.fn()}
      />,
    )

    expect(html).toContain('Mark delivery in progress?')
    expect(html).toContain('Stock-tracked items will be deducted')
    expect(html).toContain('From records')
    expect(html).toContain('Riverside Apartments')
    expect(html).toContain('Poblacion, Cebu')
    expect(html).toContain('Start delivery')
  })
})
