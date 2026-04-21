'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TryoutPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function startExam() {
    setLoading(true)
    const res = await fetch('/api/exam/start', { method: 'POST' })
    const data = await res.json()
    if (data.sessionId) router.push(`/exam/${data.sessionId}`)
    else {
      alert(data.error ?? 'Gagal memulai tryout')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tryout SKD CPNS</h1>
        <p className="text-gray-500 mb-8">Simulasi CAT paling mirip aslinya</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Tryout SKD Lengkap</h2>
              <p className="text-sm text-gray-500 mt-1">TWK + TIU + TKP</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Beta Gratis</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Jumlah Soal', value: '100' },
              { label: 'Waktu', value: '100 menit' },
              { label: 'Passing Grade', value: '311' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
            {[
              { label: 'TWK', soal: 30, passing: 65, color: 'blue' },
              { label: 'TIU', soal: 35, passing: 80, color: 'green' },
              { label: 'TKP', soal: 35, passing: 143, color: 'orange' },
            ].map(item => (
              <div key={item.label} className={`rounded-xl p-3 ${
                item.color === 'blue' ? 'bg-blue-50' :
                item.color === 'green' ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                <p className={`font-bold text-base ${
                  item.color === 'blue' ? 'text-blue-700' :
                  item.color === 'green' ? 'text-green-700' : 'text-orange-700'
                }`}>{item.label}</p>
                <p className="text-gray-500 text-xs">{item.soal} soal</p>
                <p className="text-gray-500 text-xs">PG: {item.passing}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startExam}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Menyiapkan soal...' : 'Mulai Tryout Sekarang'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Soal diacak otomatis · Timer berjalan di server · Tidak bisa di-pause
        </p>
      </div>
    </div>
  )
}
