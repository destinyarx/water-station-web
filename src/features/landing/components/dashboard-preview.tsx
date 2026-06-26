export function DashboardPreview() {
  return (
    <section id="dashboard" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.92fr 1.08fr', gap: '54px', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'var(--lp-brand-text)', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '12px' }}>The dashboard</div>
          <h2 style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', color: 'var(--lp-text)' }}>Your whole station at a glance</h2>
          <p style={{ fontSize: '17px', color: 'var(--lp-text-muted)', lineHeight: 1.6, margin: '0 0 26px' }}>Open the app and instantly see refills, deliveries, low stock and overdue containers — color-coded so anyone on shift knows what needs attention.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Live refill & sales totals', sub: 'Updated the moment a transaction is logged.' },
              { title: 'Overdue container alerts', sub: 'Chase deposits before they walk out the door.' },
              { title: 'Maintenance reminders', sub: 'Filter and membrane swaps, never missed.' },
            ].map(({ title, sub }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--lp-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="#0a6cc4"><path d="M6.5 11L3 7.5l1.2-1.2 2.3 2.3 5-5L12.7 5 6.5 11Z" /></svg>
                </div>
                <div>
                  <strong style={{ color: 'var(--lp-text)', fontSize: '15px' }}>{title}</strong>
                  <div style={{ color: 'var(--lp-text-muted)', fontSize: '14px' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mock dashboard */}
        <div style={{ background: 'var(--lp-surface)', borderRadius: '24px', padding: '10px', boxShadow: '0 40px 90px rgba(14,108,196,0.2)', border: '1px solid var(--lp-border)' }}>
          <div style={{ display: 'flex', borderRadius: '18px', overflow: 'hidden', minHeight: '380px' }}>
            {/* Sidebar mock */}
            <div style={{ width: '64px', background: 'linear-gradient(180deg,#0a6cc4,#075098)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 0', gap: '18px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 3c3 4 5 6.2 5 8.8a5 5 0 1 1-10 0C7 9.2 9 7 12 3Z" fill="#fff" /></svg>
              </div>
              {[
                <g key="dash"><rect x="3" y="3" width="7.5" height="7.5" rx="1.6" fill="#fff" opacity="0.9" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" fill="#7dd3fc" opacity="0.7" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" fill="#7dd3fc" opacity="0.7" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" fill="#7dd3fc" opacity="0.7" /></g>,
                <path key="truck" d="M5 8h11l3 4v4h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H5V8Z" stroke="#cfe8ff" strokeWidth="1.6" strokeLinejoin="round" />,
                <path key="chart" d="M4 19V9m5 10V5m5 14v-7m5 7V8" stroke="#cfe8ff" strokeWidth="1.6" strokeLinecap="round" />,
                <g key="report"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#cfe8ff" strokeWidth="1.6" /><path d="M8 9h8M8 13h5" stroke="#cfe8ff" strokeWidth="1.6" strokeLinecap="round" /></g>,
              ].map((paths, i) => (
                <div key={i} style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">{paths}</svg>
                </div>
              ))}
            </div>
            {/* Main mock */}
            <div style={{ flex: 1, background: 'var(--lp-surface-2)', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--lp-text)' }}>Station Overview</div>
                  <div style={{ fontSize: '12px', color: 'var(--lp-text-soft)' }}>Tuesday, June 22</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ background: 'var(--lp-surface)', border: '1px solid var(--lp-border)', borderRadius: '9px', padding: '7px 12px', fontSize: '12px', color: 'var(--lp-text-muted)', fontWeight: 500 }}>This week ▾</div>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg,#7dd3fc,#0a6cc4)' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '11px', marginBottom: '14px' }}>
                {[{ label: 'Refills today', val: '248', badge: '▲ 18%', color: '#16a34a' }, { label: 'Sales', val: '₱8,420', badge: '▲ 9%', color: '#16a34a' }, { label: 'Overdue jugs', val: '23', badge: 'needs follow-up', color: '#e0792b' }].map(({ label, val, badge, color }) => (
                  <div key={label} style={{ background: 'var(--lp-surface)', borderRadius: '13px', padding: '13px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--lp-text-soft)', marginBottom: '5px' }}>{label}</div>
                    <div style={{ fontSize: '21px', fontWeight: 800, color: color === '#16a34a' ? 'var(--lp-text)' : color }}>{val}</div>
                    <div style={{ fontSize: '10px', color, fontWeight: 600 }}>{badge}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--lp-surface)', borderRadius: '13px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--lp-text)', marginBottom: '11px' }}>Upcoming deliveries</div>
                {[
                  { dot: '#22c55e', name: 'Sunrise Café · 8× 5-gal', time: '9:30 AM', timeColor: 'var(--lp-text-soft)' },
                  { dot: '#38bdf8', name: 'Riverside Apt 4B · 3× 5-gal', time: '11:00 AM', timeColor: 'var(--lp-text-soft)' },
                  { dot: '#e0792b', name: 'Dela Cruz Store · 12× 5-gal', time: 'overdue', timeColor: '#e0792b' },
                ].map(({ dot, name, time, timeColor }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }} />
                      <span style={{ fontSize: '12px', color: 'var(--lp-text)', fontWeight: 500 }}>{name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: timeColor, fontWeight: timeColor !== 'var(--lp-text-soft)' ? 600 : 400 }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
