const BUBBLES = [
  { left: '12%', size: 14, delay: '0.4s', dur: '9s' },
  { left: '24%', size: 9, delay: '2.1s', dur: '11s' },
  { left: '38%', size: 18, delay: '1.2s', dur: '13s' },
  { left: '61%', size: 11, delay: '3.4s', dur: '10s' },
  { left: '73%', size: 15, delay: '0.9s', dur: '12s' },
  { left: '88%', size: 8, delay: '2.7s', dur: '9.5s' },
]

/** Decorative ocean layers (glow blobs, rising bubbles, drifting waves) shared by
 * the public auth/registration surfaces. Purely presentational. */
export function OceanBackdrop() {
  return (
    <>
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="absolute -top-40 right-[6%] h-120 w-120 rounded-full bg-[image:var(--lp-hero-glow)] animate-[caustic_11s_ease-in-out_infinite]" />
        <div className="absolute top-15 -left-17.5 h-85 w-85 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.40),transparent_68%)] blur-lg animate-[caustic_14s_ease-in-out_infinite_reverse]" />
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="absolute bottom-0 rounded-full bg-[radial-gradient(circle_at_32%_30%,#ffffff,rgba(186,230,253,0.5))] shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
            // ponytail: per-bubble geometry is runtime data — Tailwind can't express dynamic values
            style={{
              left: b.left,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animation: `bubbleRise ${b.dur} ease-in ${b.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Bottom waves */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px z-[1] leading-none" aria-hidden>
        <div className="absolute bottom-0 left-0 w-[200%] animate-[waveDrift2_18s_linear_infinite]">
          <svg viewBox="0 0 1440 220" width="100%" preserveAspectRatio="none" className="block h-[clamp(150px,24vh,240px)]">
            <path d="M0 110 C180 30 360 170 540 125 C720 80 900 0 1080 45 C1260 95 1350 140 1440 118 L1440 220 L0 220 Z" fill="var(--lp-wave-1)" opacity="0.55" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-[200%] animate-[waveDrift_14s_linear_infinite]">
          <svg viewBox="0 0 1440 220" width="100%" preserveAspectRatio="none" className="block h-[clamp(130px,21vh,210px)]">
            <path d="M0 140 C200 80 380 185 600 148 C820 110 1000 45 1200 92 C1320 122 1390 148 1440 138 L1440 220 L0 220 Z" fill="var(--lp-wave-2)" opacity="0.5" />
          </svg>
        </div>
      </div>
    </>
  )
}
