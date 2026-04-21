import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CW, CWHeader, CWFooter, CWLogo } from '@/components/cw-shared'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact={false} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>

        <CWLogo size={88} />

        <h1 style={{ fontSize: 28, fontWeight: 900, color: CW.navyDark, marginTop: 20, marginBottom: 6, fontFamily: '"Times New Roman", Georgia, serif', letterSpacing: 0.5 }}>
          CAT MANIAC
        </h1>
        <p style={{ fontSize: 14, color: CW.inkMuted, marginBottom: 32, letterSpacing: 1 }}>
          SIMULASI TRYOUT SKD CPNS · PERSIAPAN TERBAIK UNTUK CPNS 2026
        </p>

        <div style={{ background: '#fff', border: `1px solid ${CW.border}`, borderRadius: 4, padding: '28px 32px', maxWidth: 480, width: '100%', marginBottom: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
            {[
              { val: '408', label: 'Bank Soal' },
              { val: '100', label: 'Soal / Sesi' },
              { val: '90', label: 'Menit' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: CW.blue }}>{val}</div>
                <div style={{ fontSize: 11, color: CW.inkMuted, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '✓', text: 'Soal TWK, TIU, TKP sesuai standar BKN' },
              { icon: '✓', text: 'Timer real-time seperti CAT sesungguhnya' },
              { icon: '✓', text: 'Hasil & diagnostic area lemah langsung tampil' },
              { icon: '✓', text: 'Share hasil ke TikTok / Instagram' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 10, fontSize: 13, color: CW.ink, textAlign: 'left' }}>
                <span style={{ color: CW.green, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="/auth/login"
            style={{ background: CW.blue, color: '#fff', padding: '12px 32px', borderRadius: 3, fontSize: 14, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.5 }}
          >
            MULAI GRATIS →
          </a>
          <a
            href="/auth/login"
            style={{ background: '#fff', color: CW.ink, padding: '12px 24px', borderRadius: 3, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: `1px solid ${CW.borderDark}` }}
          >
            Sudah punya akun? Login
          </a>
        </div>

        <p style={{ marginTop: 20, fontSize: 11.5, color: CW.inkMuted }}>
          Gratis 3 sesi tryout untuk akun baru · Tanpa kartu kredit
        </p>
      </div>

      <CWFooter />
    </div>
  )
}
