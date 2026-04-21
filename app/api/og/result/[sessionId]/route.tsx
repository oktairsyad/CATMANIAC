import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const admin = createAdminClient()

  const { data: result } = await admin
    .from('exam_results')
    .select('skor_twk, skor_tiu, skor_tkp, skor_total, lulus_total, lulus_twk, lulus_tiu, lulus_tkp')
    .eq('session_id', sessionId)
    .single()

  if (!result) return new Response('Not found', { status: 404 })

  const lulus = result.lulus_total
  const bgColor = lulus ? '#14532d' : '#7f1d1d'
  const accentColor = lulus ? '#22c55e' : '#ef4444'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          fontFamily: 'Arial, sans-serif',
          padding: 0,
        }}
      >
        {/* Header */}
        <div style={{ background: '#1e3a8a', padding: '32px 48px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>SIMULASI CAT CPNS</div>
            <div style={{ fontSize: 14, color: '#93c5fd', letterSpacing: 2, marginTop: 4 }}>CAT MANIAC · LATIHAN CPNS</div>
          </div>
        </div>

        {/* Verdict */}
        <div style={{ background: bgColor, padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, color: '#fff', opacity: 0.8 }}>Hasil Simulasi SKD</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: accentColor, lineHeight: 1 }}>
              {lulus ? 'LULUS' : 'BELUM'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 18, color: '#fff', opacity: 0.7 }}>Total Nilai</div>
            <div style={{ fontSize: 80, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{result.skor_total}</div>
            <div style={{ fontSize: 18, color: '#fff', opacity: 0.5 }}>passing grade 311</div>
          </div>
        </div>

        {/* Score breakdown */}
        <div style={{ flex: 1, display: 'flex', padding: '32px 48px', gap: 24, background: '#0f172a' }}>
          {[
            { label: 'TWK', val: result.skor_twk, max: 150, passing: 65, lulus: result.lulus_twk },
            { label: 'TIU', val: result.skor_tiu, max: 175, passing: 80, lulus: result.lulus_tiu },
            { label: 'TKP', val: result.skor_tkp, max: 175, passing: 143, lulus: result.lulus_tkp },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#1e293b', borderRadius: 12, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#94a3b8', letterSpacing: 2 }}>{s.label}</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: s.lulus ? '#22c55e' : '#ef4444', lineHeight: 1.1, marginTop: 8 }}>{s.val}</div>
              <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>/ {s.max}</div>
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 700, color: s.lulus ? '#22c55e' : '#ef4444', background: s.lulus ? '#14532d' : '#7f1d1d', padding: '4px 14px', borderRadius: 20 }}>
                {s.lulus ? '✓ LULUS' : '✗ BELUM'} · PG {s.passing}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ background: '#1e293b', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, color: '#64748b' }}>catmaniac.id · Simulasi CAT CPNS</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>#{sessionId.slice(0, 8).toUpperCase()}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
