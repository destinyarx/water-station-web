import Link from 'next/link'
import { Reveal } from './reveal'

export function CtaBand() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-cloud">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-24">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-[var(--navy-dark)] px-6 py-14 text-center shadow-[0_26px_80px_rgba(79,181,232,0.20)] lg:px-12">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -left-16 top-8 size-64 rounded-full bg-aqua-bright/25 blur-3xl" />
            <div className="absolute -right-12 bottom-[-5rem] size-72 rounded-full bg-aqua-light/20 blur-3xl" />
          </div>
          <span className="relative inline-flex rounded-full bg-white/10 px-4 py-1.5 font-outfit text-xs font-bold uppercase tracking-[0.12em] text-aqua-light ring-1 ring-white/10">
            Free to start - affordable monthly plan
          </span>
          <h2 className="relative mx-auto mt-5 max-w-2xl font-outfit text-[2rem] font-bold tracking-[-0.02em] text-cloud">
            Ready to organize your water refilling business?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[1.0625rem] leading-[1.7] text-aqua-mist">
            Start managing customers, deliveries, sales, expenses, and
            maintenance from one simple dashboard.
          </p>
          <Link
            href="/sign-up"
            className="relative mt-8 inline-flex rounded-full bg-cloud px-7 py-3.5 font-outfit text-sm font-bold text-aqua-deep shadow-[0_0_28px_rgba(255,255,255,0.22)] transition-all hover:-translate-y-0.5 hover:bg-aqua-mist"
          >
            Start Managing Now
          </Link>
          <p className="relative mt-4 text-sm text-aqua-light">
            No setup fees - cancel anytime - set up in minutes.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
