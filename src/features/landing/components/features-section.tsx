const FEATURES = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3c3 4 5 6.2 5 8.8a5 5 0 1 1-10 0C7 9.2 9 7 12 3Z" fill="#0a6cc4" /></svg>,
    bg: 'var(--lp-chip-bg)',
    title: 'Refill service tracking',
    desc: 'Log every gallon refilled by container size, customer and staff — with automatic pricing and daily totals.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 8h11l3 4v4h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H5V8Z" stroke="#16a34a" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
    bg: '#dcfce7',
    title: 'Delivery scheduling',
    desc: 'Plan routes, assign drivers and track door-to-door deliveries so no customer ever runs dry.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7l8-3 8 3-8 3-8-3Zm0 0v10l8 3 8-3V7" stroke="#0a6cc4" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
    bg: 'var(--lp-chip-bg)',
    title: 'Container pickup & return',
    desc: 'Know exactly which bottles are out, with whom, and when they\'re due back — deposits included.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#16a34a" strokeWidth="1.8" /><path d="M8 12h8M8 16h5M8 8h8" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    bg: '#dcfce7',
    title: 'Bottled-water sales & POS',
    desc: 'Ring up bottled stock, slim cases and dispensers at the counter, with receipts and live inventory.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 19V9m5 10V5m5 14v-7m5 7V8" stroke="#0a6cc4" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    bg: 'var(--lp-chip-bg)',
    title: 'Sales & expense reports',
    desc: 'See daily income against expenses — salt, electricity, filters, fuel — and spot your real margins.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-7 7-2 2m11 0-2-2m-7-7-2-2" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" /></svg>,
    bg: '#dcfce7',
    title: 'Maintenance schedules',
    desc: 'Get reminders to flush membranes, swap filters and sanitize tanks so water quality never slips.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 32px' }}>
      <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 50px' }}>
        <div style={{ color: 'var(--lp-brand-text)', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>Everything in one place</div>
        <h2 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 14px', color: 'var(--lp-text)' }}>Designed around real refill workflows</h2>
        <p style={{ fontSize: '17px', color: 'var(--lp-text-muted)', margin: 0, lineHeight: 1.6 }}>Not a generic dashboard — every screen maps to how water stations actually run, from the front counter to the delivery truck.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
        {FEATURES.map(({ icon, bg, title, desc }) => (
          <div key={title} style={{ background: 'var(--lp-surface)', borderRadius: '20px', padding: '28px', border: '1px solid var(--lp-border)', boxShadow: '0 10px 30px rgba(14,108,196,0.06)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              {icon}
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, margin: '0 0 9px', color: 'var(--lp-text)' }}>{title}</h3>
            <p style={{ fontSize: '15px', color: 'var(--lp-text-muted)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
