const TRUST_NAMES = ['PureDrop', 'CrystalSprings', 'AquaBella', 'BlueWell', 'H2Go Station']

const HOW_STEPS = [
  { n: '1', title: 'Customer drops off', desc: 'Scan their container, confirm size and deposit in seconds.' },
  { n: '2', title: 'Refill & ring up', desc: 'Log gallons, auto-price the refill and take payment at the POS.' },
  { n: '3', title: 'Schedule delivery', desc: 'Add bulk orders to a driver\'s route with a tap.' },
  { n: '4', title: 'Close the day', desc: 'Reconcile sales vs. expenses and see tomorrow\'s tasks.' },
]

export function ProblemSection() {
  return (
    <>
      {/* Trust strip */}
      {/* <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 32px 40px' }}>
        <div style={{ textAlign: 'center', color: 'var(--lp-text-faint)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '22px' }}>Trusted by neighborhood refilling stations</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', opacity: 0.7 }}>
          {TRUST_NAMES.map((name) => (
            <span key={name} style={{ fontWeight: 700, fontSize: '19px', color: 'var(--lp-text-muted)' }}>{name}</span>
          ))}
        </div>
      </section> */}

      {/* How it works */}
      <section id="workflow" style={{ background: 'var(--lp-section-soft)', padding: '70px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 48px' }}>
            <h2 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px', color: 'var(--lp-text)' }}>From counter to customer, one flow</h2>
            <p style={{ fontSize: '17px', color: 'var(--lp-text-muted)', margin: 0, lineHeight: 1.6 }}>A workday at the station, handled step by step.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '20px' }}>
            {HOW_STEPS.map(({ n, title, desc }) => (
              <div key={n} style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'var(--lp-surface)', boxShadow: '0 10px 24px rgba(14,108,196,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '22px', fontWeight: 800, color: 'var(--lp-brand-text)' }}>{n}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 8px', color: 'var(--lp-text)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--lp-text-muted)', lineHeight: 1.55, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
