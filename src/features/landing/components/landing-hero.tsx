import Link from 'next/link'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Droplet,
  ReceiptText,
  Route,
  TrendingUp,
} from 'lucide-react'

const TRUST_CHIPS = [
  'No missed delivery slips',
  'Clear daily cash records',
  'Works on any device',
]

const ROUTE_STOPS = [
  { label: 'Household', time: '8:30 AM', status: 'Delivered' },
  { label: 'Office refill', time: '10:15 AM', status: 'Next' },
  { label: 'Restaurant', time: '1:00 PM', status: 'Queued' },
]

export function LandingHero() {
  return (
    <header className="relative overflow-hidden bg-fog">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 -top-32 size-[32rem] rounded-full bg-aqua-light/30 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 size-[30rem] rounded-full bg-aqua-bright/25 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 size-[28rem] rounded-full bg-aqua-mist/45 blur-3xl" />
        <svg
          viewBox="0 0 1200 420"
          className="absolute inset-x-0 top-28 h-[26rem] w-full text-aqua-mid/20"
          preserveAspectRatio="none"
        >
          <path
            className="aqua-flow-line"
            d="M-40 260 C 180 110 340 360 560 200 S 930 90 1240 220"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-28">
        <div>
          <p className="aqua-load aqua-delay-0 inline-flex rounded-full bg-cloud/80 px-4 py-2 font-outfit text-sm font-semibold uppercase tracking-[0.16em] text-aqua-mid shadow-[0_8px_30px_rgba(79,181,232,0.10)] ring-1 ring-[var(--glass-border)] backdrop-blur">
            Transparent records for busy water stations
          </p>
          <h1 className="aqua-load aqua-delay-1 mt-6 max-w-2xl font-outfit text-[clamp(2.5rem,5.8vw,4rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-aqua-deep">
            Run your water refilling station with less paperwork and fewer
            missed deliveries. 
          </h1>
          <p className="aqua-load aqua-delay-2 mt-6 max-w-xl text-[1.125rem] leading-[1.75] text-slate">
            Manage customers, delivery schedules, sales, expenses, and machine
            maintenance in one simple system built for water refilling
            businesses.
          </p>

          <div className="aqua-load aqua-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-aqua-bright px-6 py-3.5 font-outfit text-sm font-bold text-cloud shadow-[0_0_28px_rgba(79,181,232,0.45)] transition-all hover:-translate-y-0.5 hover:bg-aqua-mid hover:shadow-[0_16px_44px_rgba(79,181,232,0.24)]"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex rounded-full border border-[var(--glass-border)] bg-cloud/70 px-6 py-3.5 font-outfit text-sm font-bold text-aqua-deep shadow-[0_8px_30px_rgba(79,181,232,0.08)] backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-cloud"
            >
              View Features
            </a>
          </div>

          <ul className="aqua-load aqua-delay-3 mt-8 grid gap-3 sm:grid-cols-3">
            {TRUST_CHIPS.map((chip) => (
              <li
                key={chip}
                className="flex items-center gap-2 rounded-full bg-cloud/70 px-4 py-2 text-sm font-medium text-slate ring-1 ring-[var(--glass-border)] backdrop-blur"
              >
                <Check className="size-4 text-aqua-bright" />
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="aqua-load aqua-delay-2 relative">
          <div className="aqua-float relative rounded-[2rem] bg-cloud/75 p-5 shadow-[0_26px_80px_rgba(79,181,232,0.22)] ring-1 ring-white/70 backdrop-blur-[18px]">
            <div className="absolute -right-5 -top-6 grid size-20 place-items-center rounded-full bg-aqua-bright text-cloud shadow-[0_0_34px_rgba(79,181,232,0.55)] ring-4 ring-white">
              <Droplet className="size-9" fill="currentColor" />
            </div>

            <div className="rounded-[1.5rem] bg-[var(--navy-dark)] p-5 text-cloud">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-outfit text-sm font-semibold text-aqua-light">
                    Today&apos;s Station Flow
                  </p>
                  <p className="mt-1 text-xs text-aqua-mist/75">
                    Live delivery, sales, and expense control
                  </p>
                </div>
                <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">
                  Organized
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroMetric
                  icon={CalendarCheck}
                  label="Deliveries"
                  value="18"
                />
                <HeroMetric icon={ReceiptText} label="Sales" value="₱8,450" />
                <HeroMetric icon={TrendingUp} label="Net today" value="₱5,920" />
                <HeroMetric icon={Route} label="Routes left" value="4" />
              </div>

              <div className="mt-5 rounded-[1.25rem] bg-white/8 p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <p className="font-outfit text-sm font-semibold">
                    Delivery queue
                  </p>
                  <span className="text-xs text-aqua-light">Route A</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {ROUTE_STOPS.map((stop) => (
                    <li
                      key={stop.label}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm"
                    >
                      <span className="grid size-8 place-items-center rounded-full bg-aqua-bright/20 text-aqua-light">
                        <Droplet className="size-4" />
                      </span>
                      <span>
                        <span className="block font-medium">{stop.label}</span>
                        <span className="text-xs text-aqua-mist/65">
                          {stop.time}
                        </span>
                      </span>
                      <span className="rounded-full bg-cloud/10 px-2.5 py-1 text-xs text-aqua-mist">
                        {stop.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex h-24 items-end gap-2">
                {[44, 68, 52, 88, 64, 78, 58].map((height, index) => (
                  <span
                    key={index}
                    style={{ height: `${height}%` }}
                    className="relative flex-1 rounded-t-full bg-gradient-to-t from-aqua-mid to-aqua-light shadow-[0_0_18px_rgba(124,208,255,0.36)]"
                  >
                    <span className="absolute inset-x-1 top-0 h-px rounded-full bg-cloud/80" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.25rem] bg-white/10 p-4 ring-1 ring-white/10">
      <Icon className="size-5 text-aqua-light" />
      <p className="mt-3 text-xs text-aqua-mist/70">{label}</p>
      <p className="mt-1 font-outfit text-xl font-bold">{value}</p>
    </div>
  )
}
