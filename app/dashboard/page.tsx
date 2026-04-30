import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>
}) {
  const { payment } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, historyRes] = await Promise.all([
    supabase.from('profiles').select('full_name, credits').eq('id', user.id).single(),
    supabase
      .from('exam_results')
      .select('session_id, skor_total, lulus_total, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileRes.data
  const history = historyRes.data ?? []

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {payment === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            Pembayaran berhasil! Kredit sudah ditambahkan ke akun kamu.
          </div>
        )}
        {payment === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
            Pembayaran sedang diproses. Kredit akan ditambahkan otomatis setelah konfirmasi.
          </div>
        )}

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Halo, {profile?.full_name || user.email?.split('@')[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">Siap latihan hari ini?</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/buy"
              className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              + Beli Kredit
            </a>
            <LogoutButton variant="light" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Kredit Tryout</p>
            <p className="text-4xl font-black text-blue-600 mt-1">{profile?.credits ?? 0}</p>
            {(profile?.credits ?? 0) === 0 && (
              <a href="/buy" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                Beli sekarang →
              </a>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Tryout Selesai</p>
            <p className="text-4xl font-black text-gray-900 mt-1">{history.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Skor Tertinggi</p>
            <p className="text-4xl font-black text-gray-900 mt-1">
              {history.length > 0 ? Math.max(...history.map(h => h.skor_total)) : '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start tryout */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Mulai Tryout</h2>
            <p className="text-gray-500 text-sm mb-4">100 soal · 100 menit · TWK + TIU + TKP</p>
            {(profile?.credits ?? 0) > 0 ? (
              <a
                href="/tryout"
                className="inline-block bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
              >
                Mulai Tryout →
              </a>
            ) : (
              <a
                href="/buy"
                className="inline-block bg-gray-100 text-gray-600 rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-gray-200 transition"
              >
                Beli Kredit Dulu →
              </a>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Tryout</h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada tryout yang selesai.</p>
            ) : (
              <div className="space-y-2.5">
                {history.map(h => (
                  <a
                    key={h.session_id}
                    href={`/result/${h.session_id}`}
                    className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1.5 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Skor {h.skor_total}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      h.lulus_total
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {h.lulus_total ? 'LULUS' : 'BELUM'}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
