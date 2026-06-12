import {
  PackageX,
  ListX,
  ReceiptText,
  FileWarning,
  AlertTriangle,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from './reveal'

const PAIN_POINTS: { icon: LucideIcon; label: string }[] = [
  { icon: PackageX, label: 'Missed or forgotten deliveries' },
  { icon: ListX, label: 'Manual, scattered customer lists' },
  { icon: ReceiptText, label: 'Untracked or unpaid payments' },
  { icon: FileWarning, label: 'Messy, hard-to-read sales records' },
  { icon: AlertTriangle, label: 'Unexpected machine maintenance issues' },
  { icon: UsersRound, label: 'Hard to monitor staff & daily operations' },
]

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-cloud">
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-px w-[min(1200px,calc(100%-48px))] -translate-x-1/2 bg-gradient-to-r from-transparent via-hairline to-transparent"
      />
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-outfit text-sm font-bold uppercase tracking-[0.18em] text-aqua-mid">
            The daily struggle
          </p>
          <h2 className="mt-3 font-outfit text-[2rem] font-bold tracking-[-0.02em] text-aqua-deep">
            Running a refilling station shouldn&apos;t feel this messy.
          </h2>
          <p className="mt-4 text-base leading-[1.7] text-slate">
            Paper notebooks and chat threads make small mistakes expensive.
            AquaFlow keeps the day visible before issues pile up.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map(({ icon: Icon, label }) => (
            <Reveal
              key={label}
              className="group flex items-center gap-4 rounded-[1.5rem] bg-[var(--surface-container-low)] px-5 py-4 shadow-[0_8px_30px_rgba(79,181,232,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:bg-cloud hover:shadow-[0_16px_44px_rgba(79,181,232,0.14)]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-cloud text-slate shadow-[0_8px_24px_rgba(24,28,31,0.06)] transition-colors group-hover:text-aqua-mid">
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-semibold leading-[1.5] text-ink">
                {label}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
