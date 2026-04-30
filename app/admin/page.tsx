import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { CW, CWHeader, CWFooter, CWPanel } from '@/components/cw-shared'

export default async function AdminPage() {
  // 1. Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Check role — only allow admins
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // 3. Fetch all users via admin client (bypasses RLS)
  const admin = createAdminClient()
  const { data: users } = await admin
    .from('profiles')
    .select('id, email, full_name, credits, role, created_at')
    .order('created_at', { ascending: false })

  const { data: sessionCounts } = await admin
    .from('exam_sessions')
    .select('user_id')

  const sessionsByUser: Record<string, number> = {}
  for (const s of sessionCounts ?? []) {
    sessionsByUser[s.user_id] = (sessionsByUser[s.user_id] ?? 0) + 1
  }

  const totalUsers = users?.length ?? 0
  const totalSessions = sessionCounts?.length ?? 0
  const adminCount = users?.filter(u => u.role === 'admin').length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact />

      <div style={{ flex: 1, padding: '22px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: CW.navyDark }}>ADMIN DASHBOARD</div>
            <div style={{ fontSize: 12, color: CW.inkMuted, marginTop: 2 }}>Login sebagai: {profile.full_name || user.email}</div>
          </div>
          <a href="/dashboard" style={{ fontSize: 12, color: CW.blue, textDecoration: 'none' }}>← Kembali</a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Pengguna', val: totalUsers, color: CW.blue },
            { label: 'Total Sesi Tryout', val: totalSessions, color: CW.green },
            { label: 'Admin', val: adminCount, color: CW.amber },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: '#fff', border: `1px solid ${CW.border}`, borderRadius: 3, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: CW.inkMuted, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color, marginTop: 4 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* User table */}
        <CWPanel title={`Daftar Pengguna (${totalUsers})`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: CW.bg }}>
                  {['Email', 'Nama', 'Role', 'Kredit', 'Sesi', 'Daftar'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: CW.inkMuted, borderBottom: `1px solid ${CW.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u, i) => (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : CW.bg }}>
                    <td style={{ padding: '8px 12px', color: CW.ink, borderBottom: `1px solid ${CW.border}` }}>{u.email}</td>
                    <td style={{ padding: '8px 12px', color: CW.ink, borderBottom: `1px solid ${CW.border}` }}>{u.full_name || '—'}</td>
                    <td style={{ padding: '8px 12px', borderBottom: `1px solid ${CW.border}` }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 2,
                        background: u.role === 'admin' ? '#fef3c7' : '#f1f5f9',
                        color: u.role === 'admin' ? CW.amber : CW.inkMuted,
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: CW.ink, borderBottom: `1px solid ${CW.border}`, textAlign: 'center' }}>{u.credits}</td>
                    <td style={{ padding: '8px 12px', color: CW.ink, borderBottom: `1px solid ${CW.border}`, textAlign: 'center' }}>{sessionsByUser[u.id] ?? 0}</td>
                    <td style={{ padding: '8px 12px', color: CW.inkMuted, borderBottom: `1px solid ${CW.border}`, whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CWPanel>

      </div>

      <CWFooter />
    </div>
  )
}
