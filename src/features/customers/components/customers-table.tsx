'use client'

import type { Customer } from '../customers.types'
import { CustomerRowActions } from './customer-row-actions'

const GRID = 'minmax(200px,1.4fr) 160px max-content minmax(160px,2fr) 64px'

const TH: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--app-text-faint)',
}

/** Formats a customer id into a stable display code, e.g. `#000123`. */
function customerNo(id: number): string {
  return `#${String(id).padStart(6, '0')}`
}

const BusinessIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" /><path d="M15 9h2a2 2 0 0 1 2 2v10" /><path d="M9 7h2M9 11h2M9 15h2" /><path d="M4 21h16" /></svg>
)
const HomeIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10.5V20h12v-9.5" /><path d="M10 20v-5h4v5" /></svg>
)

export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: '820px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', background: 'var(--app-surface-3)' }}>
          <div style={{ ...TH, padding: '12px 22px' }}>Customer</div>
          <div style={{ ...TH, padding: '12px 16px' }}>Type &amp; status</div>
          <div style={{ ...TH, padding: '12px 16px' }}>Contact</div>
          <div style={{ ...TH, padding: '12px 16px' }}>Delivery address</div>
          <div style={{ padding: '12px 22px' }} />
        </div>

        {customers.map((customer) => {
          const isBiz = customer.isBusiness
          const typeBg = isBiz ? 'var(--app-chip-bg)' : 'var(--app-chip-green-bg)'
          const typeText = isBiz ? 'var(--app-brand)' : 'var(--app-chip-green-text)'
          const statusDot = customer.isActive ? '#22c55e' : '#94a3b8'
          const contact = customer.contactNumber?.trim() || '—'
          const address = customer.fullAddress?.trim() || '—'

          return (
            <div
              key={customer.id}
              style={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', borderTop: '1px solid var(--app-border)', opacity: customer.isActive ? 1 : 0.6 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--app-row-hover)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
            >
              {/* Customer */}
              <div style={{ padding: '13px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '13px' }}>
                  <div style={{ position: 'relative', flex: 'none', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--app-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--app-brand)' }}>
                    {isBiz ? BusinessIcon : HomeIcon}
                    <span style={{ position: 'absolute', right: '-1px', bottom: '-1px', width: '12px', height: '12px', borderRadius: '50%', background: statusDot, border: '2px solid var(--app-surface)' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--app-text)' }}>{customer.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--app-text-soft)' }}>{customerNo(customer.id)}</div>
                  </div>
                </div>
              </div>

              {/* Type & status */}
              <div style={{ padding: '13px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, padding: '5px 11px', borderRadius: '999px', background: typeBg, color: typeText }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                    {isBiz ? 'Business' : 'Household'}
                  </span>
                  {customer.isActive ? null : (
                    <span style={{ fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '999px', background: 'var(--app-chip-gray-bg)', color: 'var(--app-chip-gray-text)' }}>Inactive</span>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div style={{ padding: '13px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: contact === '—' ? 'var(--app-text-faint)' : 'var(--app-text-muted)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" style={{ flex: 'none', opacity: 0.7 }}><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
                  {contact}
                </div>
              </div>

              {/* Address */}
              <div style={{ padding: '13px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: address === '—' ? 'var(--app-text-faint)' : 'var(--app-text-muted)', maxWidth: '250px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" style={{ flex: 'none', opacity: 0.7 }}><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '13px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <CustomerRowActions customer={customer} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
