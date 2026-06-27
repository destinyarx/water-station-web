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
    price: 'Free',
    sub: 'For a single counter',
    cta: 'Get started',
    ctaVariant: 'outline' as const,
    features: ['Refill & sales logging', 'Up to 100 customers', 'Basic daily reports'],
    featured: false,
  },
  {
    name: 'Station',
    price: '₱ ???',
    priceSub: '/mo',
    sub: 'Counter + deliveries',
    cta: 'Start free trial',
    ctaVariant: 'solid' as const,
    features: ['Everything in Starter', 'Delivery scheduling & routes', 'Container & deposit tracking', 'Expense & profit reports'],
    featured: true,
  },
  {
    name: 'Multi-branch',
    price: '₱ ?,???',
    priceSub: '/mo',
    sub: 'For growing operations',
    cta: 'Talk to us',
    ctaVariant: 'outline' as const,
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
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'var(--lp-text)' }}>Simple pricing, clear as water</h2>
          <p style={{ fontSize: '17px', color: 'var(--lp-text-muted)', margin: 0, lineHeight: 1.6 }}>Start free. Upgrade when your station grows.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px', alignItems: 'stretch' }}>
          {PRICING.map(({ name, price, priceSub, sub, cta, features, featured }) => (
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
              <div style={{ fontSize: '15px', fontWeight: 700, color: featured ? '#bfe2ff' : 'var(--lp-brand-text)', marginBottom: '6px' }}>{name}</div>
              <div style={{ fontSize: '38px', fontWeight: 800, color: featured ? '#fff' : 'var(--lp-text)', letterSpacing: '-0.02em' }}>
                {price}{priceSub && <span style={{ fontSize: '15px', fontWeight: 500, color: featured ? '#bfe2ff' : 'var(--lp-text-soft)' }}>{priceSub}</span>}
              </div>
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
