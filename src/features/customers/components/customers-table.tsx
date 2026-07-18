'use client'

import type { Customer } from '../customers.types'
import { CustomerRowActions } from './customer-row-actions'

const GRID = 'grid-cols-[minmax(200px,1.4fr)_160px_170px_minmax(160px,2fr)_64px]'
const TH = 'text-[11px] font-bold tracking-[0.05em] uppercase text-[var(--app-text-faint)]'

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
    <div className="overflow-x-auto">
      <div className="min-w-[820px]">
        <div className={`grid items-center bg-[var(--app-surface-3)] ${GRID}`}>
          <div className={`${TH} px-[22px] py-3`}>Customer</div>
          <div className={`${TH} px-4 py-3`}>Type &amp; status</div>
          <div className={`${TH} px-4 py-3`}>Contact</div>
          <div className={`${TH} px-4 py-3`}>Delivery address</div>
          <div className="px-[22px] py-3" />
        </div>

        {customers.map((customer) => {
          const isBiz = customer.isBusiness
          const contact = customer.contactNumber?.trim() || '—'
          const address = customer.fullAddress?.trim() || '—'

          return (
            <div
              key={customer.id}
              className={`${GRID} ${customer.isActive
                ? 'grid items-center border-t border-[var(--app-border)] transition-colors hover:bg-[var(--app-row-hover)]'
                : 'grid items-center border-l-[3px] border-t border-l-[var(--app-text-faint)] border-t-[var(--app-border)] bg-[var(--app-surface-2)] opacity-75 transition-colors hover:opacity-90'}`}
            >
              <div className="px-[22px] py-[13px]">
                <div className="flex items-center gap-[13px]">
                  <div className="relative flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--app-chip-bg)] text-[var(--app-brand)]">
                    {isBiz ? BusinessIcon : HomeIcon}
                    <span className={`absolute -bottom-px -right-px h-3 w-3 rounded-full border-2 border-[var(--app-surface)] ${customer.isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-[var(--app-text)]">
                      {customer.isActive ? null : (
                        <svg aria-label="Inactive customer" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-none text-[var(--app-text-faint)]"><circle cx="12" cy="12" r="9" /><path d="M9.5 9v6M14.5 9v6" /></svg>
                      )}
                      <span className="truncate">{customer.name}</span>
                    </div>
                    <div className="text-xs text-[var(--app-text-soft)]">{customerNo(customer.id)}</div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-[13px]">
                <div className="flex flex-wrap items-center gap-[7px]">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-[11px] py-[5px] text-[12.5px] font-semibold ${isBiz ? 'bg-[var(--app-chip-bg)] text-[var(--app-brand)]' : 'bg-[var(--app-chip-green-bg)] text-[var(--app-chip-green-text)]'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {isBiz ? 'Business' : 'Household'}
                  </span>
                </div>
              </div>

              <div className="px-4 py-[13px]">
                <div className={`flex min-w-0 items-center gap-2 text-[13.5px] ${contact === '—' ? 'text-[var(--app-text-faint)]' : 'text-[var(--app-text-muted)]'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" className="flex-none opacity-70"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
                  <span className="truncate whitespace-nowrap">{contact}</span>
                </div>
              </div>

              <div className="px-4 py-[13px]">
                <div className={`flex max-w-[250px] items-center gap-2 text-[13.5px] ${address === '—' ? 'text-[var(--app-text-faint)]' : 'text-[var(--app-text-muted)]'}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" className="flex-none opacity-70"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
                  <span className="truncate whitespace-nowrap">{address}</span>
                </div>
              </div>

              <div className="px-[22px] py-[13px]">
                <div className="flex justify-end"><CustomerRowActions customer={customer} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
