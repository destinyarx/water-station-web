import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CancelDeliveryDialog } from '../components/cancel-delivery-dialog'
import { DeliveryDetailsDialog } from '../components/delivery-details-dialog'
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

describe('DeliveryDetailsDialog', () => {
  it('renders the full view-only item and recipient snapshot', () => {
    const detailedDelivery = {
      ...delivery,
      notes: 'Leave the containers at the receiving desk.',
      assignedTo: 'user_driver',
      items: [
        {
          id: 501,
          deliveryId: delivery.id,
          productId: 12,
          productName: '5 Gallon Refill',
          unitPrice: 35,
          quantity: 20,
          isStockTracked: false,
          lineTotal: 700,
          orgId: delivery.orgId,
          createdAt: delivery.createdAt,
          updatedAt: null,
        },
      ],
      total: 700,
      scheduleInfo: {
        customerId: null,
        guestName: 'Harbor View Office',
        guestContact: '09171234567',
        guestAddress: 'Pier 4, Cebu City',
        recurrenceType: 'custom_dates',
        weekdays: null,
        intervalWeeks: null,
      },
    } satisfies Delivery

    const html = renderToStaticMarkup(
      <DeliveryDetailsDialog
        delivery={detailedDelivery}
        assignee={{ clerkId: 'user_driver', name: 'Mia Santos' }}
        onOpenChange={vi.fn()}
      />,
    )

    expect(html).toContain('Delivery details')
    expect(html).toContain('View only')
    expect(html).toContain('Harbor View Office')
    expect(html).toContain('09171234567')
    expect(html).toContain('5 Gallon Refill')
    expect(html).toContain('1 item (20 units)')
    expect(html).toContain('Mia Santos')
    expect(html).toContain('Leave the containers at the receiving desk.')
  })
})
