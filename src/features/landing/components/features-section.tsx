import {
  Users,
  CalendarClock,
  LineChart,
  Wallet,
  Wrench,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from './reveal'

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Users,
    title: 'Customer Management',
    description:
      'Store customer details, addresses, contact numbers, order history, and payment status in one organized place.',
  },
  {
    icon: CalendarClock,
    title: 'Delivery Scheduling',
    description:
      'Plan daily and recurring deliveries for households, offices, restaurants, and regular customers.',
  },
  {
    icon: LineChart,
    title: 'Sales Tracking',
    description:
      'Monitor daily sales, paid and unpaid orders, and total income with clear reports.',
  },
  {
    icon: Wallet,
    title: 'Expense Management',
    description:
      'Track bills, staff expenses, delivery costs, repairs, and other business expenses.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Scheduling',
    description:
      'Schedule machine cleaning, filter replacement, preventive maintenance, and repair reminders.',
  },
  {
    icon: LayoutGrid,
    title: 'Dashboard Overview',
    description:
      "See today's deliveries, sales, expenses, pending payments, and upcoming maintenance at a glance.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 bg-fog">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-outfit text-sm font-bold uppercase tracking-[0.18em] text-aqua-mid">
            From notebook to clean dashboard
          </p>
          <h2 className="mt-3 font-outfit text-[2rem] font-bold tracking-[-0.02em] text-aqua-deep">
            Everything your station needs, in one dashboard.
          </h2>
          <p className="mt-4 text-base leading-[1.7] text-slate">
            A focused operating system for deliveries, collections, expenses,
            and decisions.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Reveal
              key={title}
              className="group relative overflow-hidden rounded-[1.5rem] bg-cloud p-6 shadow-[0_8px_30px_rgba(79,181,232,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_22px_54px_rgba(79,181,232,0.18)]"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 size-28 rounded-full bg-aqua-mist/45 blur-2xl transition-transform duration-300 group-hover:scale-125"
              />
              <span className="relative grid size-14 place-items-center rounded-full bg-aqua-mist/70 text-aqua-mid ring-4 ring-cloud shadow-[0_10px_30px_rgba(79,181,232,0.16)]">
                <Icon className="size-6" />
              </span>
              <h3 className="relative mt-5 font-outfit text-[1.25rem] font-bold text-aqua-deep">
                {title}
              </h3>
              <p className="relative mt-2 text-sm leading-[1.75] text-slate">
                {description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
