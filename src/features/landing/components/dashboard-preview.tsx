import { CalendarDays, CircleDollarSign, ReceiptText, Wrench } from 'lucide-react'
import { Reveal } from './reveal'

const STAT_CARDS = [
  { icon: CalendarDays, label: "Today's Deliveries", value: '18' },
  { icon: CircleDollarSign, label: 'Total Sales', value: '₱8,450' },
  {
    icon: ReceiptText,
    label: 'Pending Payments',
    value: '₱1,200',
    tone: 'warning' as const,
  },
  { icon: Wrench, label: 'Upcoming Maintenance', value: '2 tasks' },
]

const WEEKLY_SALES = [
  { day: 'Mon', height: 46 },
  { day: 'Tue', height: 70 },
  { day: 'Wed', height: 54 },
  { day: 'Thu', height: 88 },
  { day: 'Fri', height: 62 },
  { day: 'Sat', height: 96 },
  { day: 'Sun', height: 50 },
]

const RECENT_CUSTOMERS = [
  { name: 'Maria Santos', order: '3 slim gallons', status: 'Paid' as const },
  { name: 'Office Hub Inc.', order: '12 round gallons', status: 'Pending' as const },
  { name: 'Dela Cruz Residence', order: '2 dispensers', status: 'Paid' as const },
]

const EXPENSES = [
  { label: 'Electricity', value: '₱1,800' },
  { label: 'Staff wages', value: '₱3,200' },
  { label: 'Filter replacement', value: '₱950' },
]

export function DashboardPreview() {
  return (
    <section id="preview" className="relative scroll-mt-20 overflow-hidden bg-aqua-mist/45">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-[-7rem] top-16 size-72 rounded-full bg-aqua-light/35 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] size-96 rounded-full bg-aqua-bright/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-outfit text-sm font-bold uppercase tracking-[0.18em] text-aqua-mid">
            Clear records, clearer decisions
          </p>
          <h2 className="mt-3 font-outfit text-[2rem] font-bold tracking-[-0.02em] text-aqua-deep">
            See your whole business at a glance.
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-[1.7] text-slate">
            Know what needs delivery, who still owes, where money went, and how
            the week is performing.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div className="relative rounded-[2rem] bg-cloud/75 p-3 shadow-[0_26px_80px_rgba(79,181,232,0.18)] ring-1 ring-white/80 backdrop-blur-[18px] lg:p-5">
            <div className="overflow-hidden rounded-[1.5rem] bg-cloud">
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--glass-border)] bg-white/70 px-4 py-3">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="size-3 rounded-full bg-[#FF6B6B]" />
                  <span className="size-3 rounded-full bg-[#FFD166]" />
                  <span className="size-3 rounded-full bg-success" />
                </div>
                <span className="rounded-full bg-aqua-mist/60 px-3 py-1 text-xs font-medium text-slate">
                  app.aquaflow.com/dashboard
                </span>
              </div>

              <div className="grid gap-4 bg-[linear-gradient(135deg,#ffffff_0%,#f6fafe_100%)] p-4 lg:grid-cols-12 lg:p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
                  {STAT_CARDS.map(({ icon: Icon, label, value, tone }) => (
                    <div
                      key={label}
                      className="rounded-[1.25rem] bg-cloud p-4 shadow-[0_8px_30px_rgba(79,181,232,0.08)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                          {label}
                        </p>
                        <span className="grid size-9 place-items-center rounded-full bg-aqua-mist/60 text-aqua-mid">
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <p
                        className={
                          tone === 'warning'
                            ? 'mt-3 font-outfit text-2xl font-bold text-[var(--warning)]'
                            : 'mt-3 font-outfit text-2xl font-bold text-aqua-deep'
                        }
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.5rem] bg-cloud p-5 shadow-[0_8px_30px_rgba(79,181,232,0.08)] lg:col-span-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-outfit text-base font-bold text-ink">
                        Weekly Sales
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        Daily income trend from completed deliveries.
                      </p>
                    </div>
                    <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-aqua-deep">
                      +18%
                    </span>
                  </div>
                  <div className="mt-6 flex h-40 items-end gap-2">
                    {WEEKLY_SALES.map((bar) => (
                      <div
                        key={bar.day}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <span
                          style={{ height: `${bar.height}%` }}
                          className="relative w-full rounded-t-full bg-gradient-to-t from-aqua-mid to-aqua-light shadow-[0_0_18px_rgba(79,181,232,0.24)]"
                        >
                          <span className="absolute inset-x-1 top-0 h-px rounded-full bg-cloud" />
                        </span>
                        <span className="text-[0.72rem] font-medium text-slate">
                          {bar.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:col-span-5">
                  <div className="rounded-[1.5rem] bg-cloud p-5 shadow-[0_8px_30px_rgba(79,181,232,0.08)]">
                    <p className="font-outfit text-base font-bold text-ink">
                      Expense Summary
                    </p>
                    <div className="mt-4 grid grid-cols-[5rem_1fr] items-center gap-4">
                      <div className="grid size-20 place-items-center rounded-full bg-[conic-gradient(var(--aqua-bright)_0_48%,var(--warning)_48%_72%,var(--surface-container-high)_72%_100%)]">
                        <div className="grid size-12 place-items-center rounded-full bg-cloud font-outfit text-xs font-bold text-aqua-deep">
                          ₱5.9k
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {EXPENSES.map((expense) => (
                          <li
                            key={expense.label}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="text-slate">{expense.label}</span>
                            <span className="font-semibold text-ink">
                              {expense.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-cloud p-5 shadow-[0_8px_30px_rgba(79,181,232,0.08)]">
                    <p className="font-outfit text-base font-bold text-ink">
                      Recent Customers
                    </p>
                    <ul className="mt-4 space-y-3">
                      {RECENT_CUSTOMERS.map((customer) => (
                        <li
                          key={customer.name}
                          className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-fog px-4 py-3 text-sm"
                        >
                          <span>
                            <span className="block font-semibold text-ink">
                              {customer.name}
                            </span>
                            <span className="text-xs text-slate">
                              {customer.order}
                            </span>
                          </span>
                          <span
                            className={
                              customer.status === 'Paid'
                                ? 'self-center rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-aqua-deep'
                                : 'self-center rounded-full bg-[color-mix(in_srgb,var(--warning)_22%,white)] px-2.5 py-1 text-xs font-bold text-[var(--warning)]'
                            }
                          >
                            {customer.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
