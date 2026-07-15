'use client'

import { SignUpButton } from '@clerk/nextjs'

const VALUE_PILLARS = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M5 8l7-5 7 5M5 8v9l7 4 7-4V8" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
    title: 'Nothing slips through',
    desc: 'Every refill, container and deposit is tracked — no more guessing what went out the door.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#fff" strokeWidth="1.8" /><path d="M12 7v5l3.5 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    title: 'Less time on paperwork',
    desc: 'Logging a sale or delivery takes seconds, so staff spend their shift serving customers.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 18V7m6 11V4m6 14v-8m4 8H2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    title: 'Know your real profit',
    desc: 'Sales against expenses, side by side, so you always know where your margins stand.',
  },
]

const PRICING = [
  {
    name: 'Starter',
    sub: 'For a single counter',
    cta: 'Get Started for Free',
    features: ['Refill & sales logging', 'Up to 100 customers', 'Basic daily reports'],
    featured: false,
  },
  {
    name: 'Station',
    sub: 'Counter + deliveries',
    cta: 'Choose This Plan',
    features: ['Everything in Starter', 'Delivery scheduling & routes', 'Container & deposit tracking', 'Expense & profit reports'],
    featured: true,
  },
  {
    name: 'Multi-branch',
    sub: 'For growing operations',
    cta: 'Get Started for Free',
    features: ['Everything in Station', 'Multiple locations', 'Staff roles & permissions', 'Maintenance scheduling'],
    featured: false,
  },
]

export function CtaBand() {
  return (
    <>
      {/* Value band */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#0a6cc4,#075098)', padding: '60px 0' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.18, background: 'radial-gradient(circle at 18% 120%, #7dd3fc, transparent 45%), radial-gradient(circle at 82% -20%, #38bdf8, transparent 45%)' }} />
        <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9fd3ff', marginBottom: '10px' }}>Why stations switch to AquaFlow</div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 36px' }}>Built to keep your water business flowing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', textAlign: 'left' }}>
            {VALUE_PILLARS.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '18px', padding: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '13px', background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>{icon}</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{title}</div>
                <div style={{ fontSize: '14px', color: '#cfe8ff', lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '1300px', margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 32px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'var(--lp-text)' }}>Simple pricing, clear as water</h2>
          <p style={{ fontSize: '17px', color: 'var(--lp-text-muted)', margin: 0, lineHeight: 1.6 }}>Pick the tier that fits your station. Everything is free while we launch.</p>
        </div>

        {/* Launch announcement banner */}
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto 44px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(10,108,196,0.12))',
            border: '1px solid rgba(10,108,196,0.28)',
            borderRadius: '20px',
            padding: '26px 32px',
            textAlign: 'center',
          }}
        >


          <div className="flex flex-row justify-start items-center gap-3">
            <div className="w-1/3 flex justify-end">
              <div style={{ display: 'inline-flex', gap: '7px', background: 'var(--lp-brand-text)', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '999px', marginBottom: '14px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 5.8L20 9.2l-4.4 3.8L17 19l-5-3.2L7 19l1.4-6L4 9.2l5.6-1.4L12 2z" fill="#fff" /></svg>
                Launch offer
              </div>
            </div>

            <h3 className="w-2/3 text-left" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.01em', margin: '0 0 8px', color: 'var(--lp-text)' }}>All Plans Are Free During Launch</h3>
          </div>

          <p style={{ fontSize: '15px', color: 'var(--lp-text-muted)', margin: 0, lineHeight: 1.6 }}>Enjoy access to all available features at no cost during our launch period. Paid pricing may be introduced in the future, and users will be notified before any changes take effect.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', alignItems: 'stretch' }}>
          {PRICING.map(({ name, sub, cta, features, featured }) => (
            <div
              key={name}
              style={{
                background: featured ? 'linear-gradient(170deg,#0a6cc4,#075098)' : 'var(--lp-surface)',
                borderRadius: '20px',
                padding: '30px',
                border: featured ? 'none' : '1px solid var(--lp-border-strong)',
                boxShadow: featured ? '0 24px 60px rgba(14,108,196,0.3)' : 'none',
                position: 'relative',
                transform: featured ? 'translateY(-10px)' : undefined,
              }}
            >
              {featured && <div style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '5px 11px', borderRadius: '999px' }}>RECOMMENDED</div>}
              <div style={{ display: 'inline-block', background: featured ? 'rgba(255,255,255,0.16)' : 'rgba(10,108,196,0.1)', color: featured ? '#eaf6ff' : 'var(--lp-brand-text)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', marginBottom: '14px' }}>Free During Launch</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: featured ? '#bfe2ff' : 'var(--lp-brand-text)', marginBottom: '6px' }}>{name}</div>
              <div style={{ fontSize: '38px', fontWeight: 800, color: featured ? '#fff' : 'var(--lp-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>FREE</div>
              <div style={{ fontSize: '13px', color: featured ? '#bfe2ff' : 'var(--lp-text-soft)', marginBottom: '4px' }}>During the launch period</div>
              <div style={{ fontSize: '14px', color: featured ? '#bfe2ff' : 'var(--lp-text-soft)', marginBottom: '22px' }}>{sub}</div>
              <SignUpButton mode="redirect">
                <button
                  type="button"
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '22px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    fontWeight: featured ? 700 : 600,
                    cursor: 'pointer',
                    ...(featured
                      ? { background: '#fff', color: '#0a6cc4', border: 'none' }
                      : { background: 'transparent', color: 'var(--lp-brand-text)', border: '1.5px solid var(--lp-brand-text)' }),
                  }}
                >
                  {cta}
                </button>
              </SignUpButton>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '14px', color: featured ? '#eaf6ff' : 'var(--lp-text-muted)' }}>
                {features.map((f) => <div key={f}>✓ {f}</div>)}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--lp-text-soft)', margin: '28px auto 0', maxWidth: '640px', lineHeight: 1.6 }}>
          No payment required. No credit card needed. Future pricing will be announced in advance.
        </p>
      </section>

      {/* Final CTA */}
      <section style={{ maxWidth: '1300px', margin: '0 auto 80px', padding: '0 32px' }}>
        <div style={{ position: 'relative', background: 'linear-gradient(135deg,#38bdf8,#0a6cc4)', borderRadius: '28px', padding: '58px 48px', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'radial-gradient(60% 100% at 50% 100%, rgba(255,255,255,0.25), transparent)' }} />
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Ready to clear up your station?</h2>
          <p style={{ fontSize: '18px', color: '#eaf6ff', margin: '0 auto 28px', maxWidth: '520px' }}>Join hundreds of refilling stations running calmer, cleaner days with AquaFlow.</p>
          <SignUpButton mode="redirect">
            <button type="button" style={{ background: '#fff', color: '#0a6cc4', fontSize: '16px', fontWeight: 700, padding: '15px 34px', borderRadius: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 14px 30px rgba(0,0,0,0.18)', fontFamily: 'inherit' }}>
              Start for Free
            </button>
          </SignUpButton>
        </div>
      </section>
    </>
  )
}
