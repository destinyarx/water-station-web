const FOOTER_COLS = [
  { heading: 'Product', links: [{ label: 'Features', href: '#' }, { label: 'Pricing', href: '#' }, { label: 'Dashboard', href: '#' }] },
  { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Contact', href: '#' }] },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms and Conditions', href: '/terms-and-conditions' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--lp-border-strong)', padding: '48px 32px 36px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(150deg,#38bdf8,#0a6cc4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24"><path d="M12 2.5c4 5 6.5 8 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.5 8 7.5 12 2.5Z" fill="#fff" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--lp-text)' }}>AquaFlow</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--lp-text-soft)', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>Management software made for water refilling stations — pure, simple, and built around how you really work.</p>
        </div>
        {FOOTER_COLS.map(({ heading, links }) => (
          <div key={heading}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--lp-text)', marginBottom: '14px' }}>{heading}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              {links.map((link) => (
                <a key={link.label} href={link.href} style={{ textDecoration: 'none', color: 'var(--lp-text-soft)' }}>{link.label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: '1200px', margin: '32px auto 0', paddingTop: '24px', borderTop: '1px solid var(--lp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--lp-text-faint)' }}>
        <span>© 2026 AquaFlow. All rights reserved.</span>
        <span>Made for clean water businesses 💧</span>
      </div>
    </footer>
  )
}
