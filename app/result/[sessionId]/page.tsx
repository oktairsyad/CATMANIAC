import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CW, CWHeader, CWFooter, CWPanel, CWInfoRow } from '@/components/cw-shared'
import { LogoutButton } from '@/components/logout-button'

const PASSING = { TWK: 65, TIU: 80, TKP: 143, TOTAL: 311 }
const MAX = { TWK: 150, TIU: 175, TKP: 175, TOTAL: 500 }

function ScoreRow({ label, val, max, passing }: { label: string; val: number; max: number; passing: number }) {
  const passed = val >= passing
  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${CW.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div style={{ fontSize: 13, color: CW.ink }}>{label}</div>
        <div style={{ fontSize: 13, color: CW.ink }}>
          <span style={{ fontWeight: 700, color: passed ? CW.green : CW.red, fontSize: 16 }}>{val}</span>
          <span style={{ color: CW.inkMuted }}> / {max}</span>
          <span style={{ marginLeft: 12, fontSize: 11, fontWeight: 700, color: passed ? CW.green : CW.red, padding: '2px 8px', background: passed ? '#dcfce7' : '#fee2e2', borderRadius: 2 }}>
            {passed ? 'LULUS' : 'TIDAK LULUS'} (PG: {passing})
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: '#f1f1f4', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: passed ? CW.green : CW.red }} />
      </div>
    </div>
  )
}

function getWeakAreas(detail: Record<string, unknown> | null, twk: number, tiu: number, tkp: number) {
  const areas: { area: string; status: string; color: string }[] = [
    { area: 'TWK · Nasionalisme & Kebangsaan', status: twk >= 100 ? 'Kuat' : twk >= 65 ? 'Cukup' : 'Lemah', color: twk >= 100 ? CW.green : twk >= 65 ? CW.amber : CW.red },
    { area: 'TWK · Pancasila & UUD 1945', status: twk >= 110 ? 'Kuat' : twk >= 65 ? 'Cukup' : 'Lemah', color: twk >= 110 ? CW.green : twk >= 65 ? CW.amber : CW.red },
    { area: 'TIU · Deret & Logika Angka', status: tiu >= 120 ? 'Kuat' : tiu >= 80 ? 'Cukup' : 'Lemah', color: tiu >= 120 ? CW.green : tiu >= 80 ? CW.amber : CW.red },
    { area: 'TIU · Analitis & Verbal', status: tiu >= 130 ? 'Kuat' : tiu >= 80 ? 'Cukup' : 'Lemah', color: tiu >= 130 ? CW.green : tiu >= 80 ? CW.amber : CW.red },
    { area: 'TKP · Pelayanan Publik', status: tkp >= 160 ? 'Kuat' : tkp >= 143 ? 'Cukup' : 'Lemah', color: tkp >= 160 ? CW.green : tkp >= 143 ? CW.amber : CW.red },
    { area: 'TKP · Jejaring & Adaptasi', status: tkp >= 155 ? 'Kuat' : tkp >= 143 ? 'Cukup' : 'Lemah', color: tkp >= 155 ? CW.green : tkp >= 143 ? CW.amber : CW.red },
  ]
  return areas
}

export default async function ResultPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [resultRes, profileRes] = await Promise.all([
    supabase.from('exam_results').select('*').eq('session_id', sessionId).eq('user_id', user.id).single(),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  const result = resultRes.data
  const userName = profileRes.data?.full_name || user.email?.split('@')[0] || '—'

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
        <CWHeader compact right={<LogoutButton />} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${CW.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: CW.inkMuted, fontSize: 13 }}>Menghitung hasil...</p>
            <a href={`/result/${sessionId}`} style={{ display: 'inline-block', marginTop: 12, fontSize: 12, color: CW.blue }}>Refresh halaman</a>
          </div>
        </div>
        <CWFooter />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const lulus = result.lulus_total
  const totalColor = lulus ? CW.green : CW.red
  const weakAreas = getWeakAreas(result.detail, result.skor_twk, result.skor_tiu, result.skor_tkp)
  const shareUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'https://' + process.env.NEXT_PUBLIC_SUPABASE_URL.split('https://')[1]?.split('.')[0] + '.vercel.app' : ''}/result/${sessionId}`

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact right={<LogoutButton />} />

      <div style={{ flex: 1, padding: '22px 32px', overflowY: 'auto', maxWidth: 860, margin: '0 auto', width: '100%' }}>

        <CWPanel title="Informasi Ujian">
          <CWInfoRow label="Nama Ujian" value="SIMULASI TRYOUT SKD CPNS" />
          <CWInfoRow label="Tanggal" value={new Date(result.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        </CWPanel>

        <CWPanel title="Informasi Peserta">
          <CWInfoRow label="Nama Lengkap" value={userName} />
          <CWInfoRow label="Email" value={user.email ?? '—'} valueColor={CW.blue} />
        </CWPanel>

        <CWPanel title="Hasil Skor">
          <ScoreRow label="Nilai TWK — Tes Wawasan Kebangsaan" val={result.skor_twk} max={MAX.TWK} passing={PASSING.TWK} />
          <ScoreRow label="Nilai TIU — Tes Intelegensi Umum" val={result.skor_tiu} max={MAX.TIU} passing={PASSING.TIU} />
          <ScoreRow label="Nilai TKP — Tes Karakteristik Pribadi" val={result.skor_tkp} max={MAX.TKP} passing={PASSING.TKP} />

          <div style={{ padding: '16px 0 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: CW.ink }}>NILAI TOTAL</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: totalColor, fontFamily: 'Georgia, serif' }}>
              {result.skor_total}<span style={{ fontSize: 14, color: CW.inkMuted, fontWeight: 400 }}> / {MAX.TOTAL}</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: lulus ? CW.green : CW.red, fontWeight: 600, background: lulus ? '#dcfce7' : '#fee2e2', padding: '10px 14px', borderRadius: 2, marginTop: 8, lineHeight: 1.6 }}>
            {lulus
              ? `✓ SELAMAT! Anda memenuhi semua ambang batas SKD. Total ${result.skor_total} ≥ ${PASSING.TOTAL}.`
              : `⚠ Belum memenuhi semua ambang batas SKD. ${!result.lulus_twk ? `TWK kurang ${PASSING.TWK - result.skor_twk} poin. ` : ''}${!result.lulus_tiu ? `TIU kurang ${PASSING.TIU - result.skor_tiu} poin. ` : ''}${!result.lulus_tkp ? `TKP kurang ${PASSING.TKP - result.skor_tkp} poin.` : ''}`
            }
          </div>
        </CWPanel>

        <CWPanel title="Diagnostic — Area yang Perlu Latihan">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
            {weakAreas.map(({ area, status, color }) => (
              <div key={area} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: `1px solid ${CW.border}`, background: '#fafafa', borderRadius: 2 }}>
                <span style={{ color: CW.ink }}>{area}</span>
                <span style={{ color, fontWeight: 700 }}>{status}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: CW.inkMuted, marginTop: 10, lineHeight: 1.5 }}>
            * Diagnostic didasarkan pada perkiraan distribusi skor per kategori. Fokus latihan pada area "Lemah" terlebih dahulu.
          </p>
        </CWPanel>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href="/tryout"
            style={{ background: '#1f1f1f', color: '#fff', border: 'none', borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
          >
            Ulangi Simulasi
          </a>
          <a
            href={`/api/og/result/${sessionId}`}
            target="_blank"
            style={{ background: CW.blue, color: '#fff', border: `1px solid ${CW.blue}`, borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
          >
            Bagikan ke TikTok / IG
          </a>
          <a
            href="/dashboard"
            style={{ background: '#fff', color: CW.ink, border: `1px solid ${CW.borderDark}`, borderRadius: 3, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' }}
          >
            Dashboard
          </a>
        </div>

      </div>

      <CWFooter />
    </div>
  )
}
