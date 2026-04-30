// CAT MANIAC design system — shared components
// Palette: biru navy konservatif, vibe instansi

export const CW = {
  navy: '#1e3a8a',
  navyDark: '#172554',
  blue: '#2563eb',
  blueHover: '#1d4ed8',
  bg: '#f3f1f9',
  panelBg: '#ffffff',
  panelHead: '#f5f5f5',
  border: '#e4e4e7',
  borderDark: '#d4d4d8',
  ink: '#1f2937',
  inkMuted: '#6b7280',
  green: '#16a34a',
  red: '#dc2626',
  amber: '#d97706',
  footerBg: '#a5a0cf',
  footerInk: '#312e81',
}

export function CWBannerPattern() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1000 150" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="cwb1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1e40af" />
          <stop offset="0.6" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#dbeafe" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cwb2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e3a8a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#60a5fa" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="1000" height="150" fill="url(#cwb1)" />
      <polygon points="0,0 180,0 120,150 0,150" fill="#1e40af" opacity="0.5" />
      <polygon points="140,0 320,0 260,150 80,150" fill="#2563eb" opacity="0.35" />
      <polygon points="280,0 460,0 380,150 220,150" fill="#3b82f6" opacity="0.3" />
      <polygon points="420,0 600,0 500,150 360,150" fill="#60a5fa" opacity="0.3" />
      <polygon points="560,0 740,0 640,150 500,150" fill="#93c5fd" opacity="0.35" />
      <polygon points="700,0 880,0 780,150 640,150" fill="#bfdbfe" opacity="0.4" />
      <polygon points="840,0 1000,0 1000,150 780,150" fill="#dbeafe" opacity="0.5" />
      <polygon points="60,0 90,0 40,150 10,150" fill="#ffffff" opacity="0.08" />
      <polygon points="240,0 270,0 220,150 190,150" fill="#ffffff" opacity="0.06" />
    </svg>
  )
}

export function CWLogo({ size = 44 }: { size?: number }) {
  return (
    <img
      src="/logo-cat-maniac.png"
      width={size}
      height={size}
      alt="CAT MANIAC"
      style={{ flexShrink: 0, objectFit: 'contain' }}
    />
  )
}

export function CWHeader({ compact = true, right }: { compact?: boolean; right?: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', height: compact ? 88 : 120, overflow: 'hidden', background: '#e9e7f4', flexShrink: 0 }}>
      <CWBannerPattern />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: compact ? '16px 28px' : '24px 32px', height: '100%' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flexShrink: 0 }}>
          <CWLogo size={compact ? 40 : 50} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: compact ? 18 : 22, fontWeight: 800, color: CW.navyDark, letterSpacing: 0.5, fontFamily: '"Times New Roman", Georgia, serif' }}>
              SIMULASI COMPUTER ASSISTED TEST
            </div>
            <div style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: CW.navy, letterSpacing: 1.5, marginTop: 2, fontFamily: '"Times New Roman", Georgia, serif' }}>
              CAT MANIAC · LATIHAN CPNS
            </div>
          </div>
        </a>
        {right && (
          <div style={{ marginLeft: 'auto' }}>
            {right}
          </div>
        )}
      </div>
    </div>
  )
}

export function CWFooter() {
  return (
    <div style={{ height: 34, background: CW.footerBg, color: CW.footerInk, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>
      PUSAT LATIHAN SIMULASI CAT — CAT MANIAC © 2026
    </div>
  )
}

export function CWPanel({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: CW.panelBg, border: `1px solid ${CW.border}`, borderRadius: 3, marginBottom: 12, ...style }}>
      {title && (
        <div style={{ background: CW.panelHead, padding: '9px 16px', borderBottom: `1px solid ${CW.border}`, fontSize: 13, color: CW.ink }}>
          {title}
        </div>
      )}
      <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
  )
}

export function CWInfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', fontSize: 13, padding: '3px 0', lineHeight: 1.6 }}>
      <div style={{ width: 140, color: CW.ink }}>{label}</div>
      <div style={{ color: CW.ink }}>:&nbsp;&nbsp;<span style={{ color: valueColor || CW.ink }}>{value}</span></div>
    </div>
  )
}
