'use client'

import { SignUpButton } from '@clerk/nextjs'

export function LandingHero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--lp-hero-grad)' }}>
      {/* Water background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-160px', right: '8%', width: '520px', height: '520px', borderRadius: '50%', background: 'var(--lp-hero-glow)', animation: 'caustic 11s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '90px', left: '-60px', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,0.45), transparent 68%)', filter: 'blur(8px)', animation: 'caustic 14s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', left: '42%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', filter: 'blur(6px)', animation: 'caustic 9s ease-in-out infinite' }} />
        {[
          { left: '12%', size: 14, delay: '0.4s', dur: '9s' },
          { left: '22%', size: 9,  delay: '2.1s', dur: '11s' },
          { left: '34%', size: 20, delay: '1.2s', dur: '13s' },
          { left: '58%', size: 11, delay: '3.4s', dur: '10s' },
          { left: '70%', size: 16, delay: '0.9s', dur: '12s' },
          { left: '84%', size: 8,  delay: '2.7s', dur: '9.5s' },
          { left: '91%', size: 13, delay: '4.2s', dur: '14s' },
        ].map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.left,
              bottom: 0,
              width: `${b.size}px`,
              height: `${b.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 32% 30%, #ffffff, rgba(186,230,253,0.5))',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.5)',
              animation: `bubbleRise ${b.dur} ease-in ${b.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Waves */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-1px', zIndex: 1, lineHeight: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', animation: 'waveDrift2 18s linear infinite' }}>
          <svg viewBox="0 0 1440 140" width="100%" height="120" preserveAspectRatio="none">
            <path d="M0 70 C180 20 360 110 540 80 C720 50 900 0 1080 30 C1260 60 1350 90 1440 75 L1440 140 L0 140 Z" fill="var(--lp-wave-1)" opacity="0.55" />
          </svg>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', animation: 'waveDrift 14s linear infinite' }}>
          <svg viewBox="0 0 1440 140" width="100%" height="120" preserveAspectRatio="none">
            <path d="M0 90 C200 50 380 120 600 95 C820 70 1000 30 1200 60 C1320 78 1390 95 1440 88 L1440 140 L0 140 Z" fill="var(--lp-wave-2)" opacity="0.5" />
          </svg>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', animation: 'waveDrift 22s linear infinite' }}>
          <svg viewBox="0 0 1440 120" width="100%" height="96" preserveAspectRatio="none">
            <path d="M0 80 C240 110 420 50 720 70 C1020 90 1200 40 1440 70 L1440 120 L0 120 Z" fill="var(--lp-page-bg)" />
          </svg>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', margin: '0 auto', padding: '80px 32px 130px', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '48px', alignItems: 'center' }}>
        {/* Text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--lp-chip-bg)', color: 'var(--lp-brand-text)', fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '999px', marginBottom: '22px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Built for water refilling stations
          </div>
          <h1 style={{ fontSize: '54px', lineHeight: 1.06, fontWeight: 800, letterSpacing: '-0.025em', margin: '0 0 20px', color: 'var(--lp-text)' }}>
            Run your refill<br />station like{' '}
            <span style={{ background: 'linear-gradient(120deg,#0ea5e9,#38bdf8)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              clear water
            </span>.
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.6, color: 'var(--lp-text-muted)', margin: '0 0 32px', maxWidth: '480px' }}>
            Track refills, container pickups and returns, bottled-water sales, delivery routes and expenses — all in one calm, clean dashboard your staff will actually use.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
            <SignUpButton mode="redirect">
              <button type="button" style={{ background: 'linear-gradient(150deg,#38bdf8,#0a6cc4)', color: '#fff', fontSize: '16px', fontWeight: 600, padding: '15px 30px', borderRadius: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 12px 28px rgba(14,108,196,0.32)', fontFamily: 'inherit' }}>
                Start for Free
              </button>
            </SignUpButton>
            <a href="#dashboard" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '9px', color: 'var(--lp-text)', fontSize: '16px', fontWeight: 600, padding: '15px 18px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--lp-surface)', boxShadow: '0 4px 12px rgba(14,108,196,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#0a6cc4"><path d="M2 1l8 5-8 5V1Z" /></svg>
              </span>
              See it in action
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--lp-text-soft)', fontSize: '14px' }}>
            {['No setup fees', '14-day free trial'].map((txt) => (
              <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#0ea5e9"><path d="M6.5 11L3 7.5l1.2-1.2 2.3 2.3 5-5L12.7 5 6.5 11Z" /></svg>
                {txt}
              </div>
            ))}
          </div>
        </div>

        {/* Hero card */}
        <div style={{ position: 'relative', zIndex: 1, animation: 'floaty 6s ease-in-out infinite' }}>
          <div style={{ background: 'var(--lp-surface)', borderRadius: '22px', padding: '22px', boxShadow: '0 30px 70px rgba(14,108,196,0.18)', border: '1px solid var(--lp-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--lp-text-soft)' }}>{"Today's refills"}</div>
                <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--lp-text)', letterSpacing: '-0.02em' }}>
                  248 <span style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>gal</span>
                </div>
              </div>
              <div style={{ background: 'var(--lp-chip-bg)', color: 'var(--lp-brand-text)', fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '999px' }}>+18% vs yest.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', height: '90px', padding: '8px 0 14px', borderBottom: '1px solid var(--lp-border)' }}>
              {[46, 62, 38, 78, 54, 70, 88].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 || i === 6 ? 'linear-gradient(#38bdf8,#0a6cc4)' : 'linear-gradient(#7dd3fc,#bae6fd)', borderRadius: '6px 6px 0 0' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              {[{ label: 'Containers out', val: '132' }, { label: 'Deliveries due', val: '17' }].map(({ label, val }) => (
                <div key={label} style={{ flex: 1, background: 'var(--lp-surface-2)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--lp-text-soft)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--lp-text)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '-22px', left: '-26px', background: 'var(--lp-surface)', borderRadius: '16px', padding: '13px 16px', boxShadow: '0 16px 36px rgba(14,108,196,0.2)', display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="#16a34a"><path d="M6.5 11L3 7.5l1.2-1.2 2.3 2.3 5-5L12.7 5 6.5 11Z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-text)' }}>Container returned</div>
              <div style={{ fontSize: '11px', color: 'var(--lp-text-soft)' }}>5-gal · Maria&apos;s Eatery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
