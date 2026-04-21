'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: (r: unknown) => void
        onPending: (r: unknown) => void
        onError: (r: unknown) => void
        onClose: () => void
      }) => void
    }
  }
}

const PACKAGES = [
  { id: 'pkg-3', credits: 3, price: 29000, label: 'Paket Hemat', per: '~Rp9.700/tryout' },
  { id: 'pkg-10', credits: 10, price: 79000, label: 'Paket Standar', per: '~Rp7.900/tryout', popular: true },
  { id: 'pkg-25', credits: 25, price: 149000, label: 'Paket Premium', per: '~Rp5.960/tryout' },
]

export default function BuyPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [snapReady, setSnapReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    const script = document.createElement('script')
    script.src = isProd
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'
    if (clientKey) script.setAttribute('data-client-key', clientKey)
    script.onload = () => setSnapReady(true)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  async function handleBuy(packageId: string) {
    if (!snapReady) { alert('Halaman belum siap, coba lagi sebentar.'); return }
    setLoading(packageId)

    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    })
    const data = await res.json()

    if (!data.token) {
      alert(data.error ?? 'Gagal membuat transaksi')
      setLoading(null)
      return
    }

    window.snap.pay(data.token, {
      onSuccess: () => {
        router.push('/dashboard?payment=success')
      },
      onPending: () => {
        router.push('/dashboard?payment=pending')
      },
      onError: () => {
        alert('Pembayaran gagal. Silakan coba lagi.')
        setLoading(null)
      },
      onClose: () => {
        setLoading(null)
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Beli Kredit Tryout</h1>
        <p className="text-gray-500 text-sm mb-8">1 kredit = 1 sesi tryout (100 soal, 100 menit)</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col relative ${
                pkg.popular ? 'border-blue-500 shadow-md' : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Terpopuler
                </span>
              )}
              <p className="font-semibold text-gray-900 mb-1">{pkg.label}</p>
              <p className="text-4xl font-black text-gray-900 my-3">{pkg.credits}
                <span className="text-base font-normal text-gray-500 ml-1">kredit</span>
              </p>
              <p className="text-xs text-gray-400 mb-4">{pkg.per}</p>
              <p className="text-xl font-bold text-blue-600 mb-5">
                Rp{pkg.price.toLocaleString('id-ID')}
              </p>
              <button
                onClick={() => handleBuy(pkg.id)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition mt-auto ${
                  pkg.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                {loading === pkg.id ? 'Memproses...' : 'Beli Sekarang'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Pembayaran aman via Midtrans · Transfer bank, GoPay, OVO, QRIS tersedia
        </p>
      </div>
    </div>
  )
}
