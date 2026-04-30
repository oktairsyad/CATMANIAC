'use client'

import { useState } from 'react'
import { CW } from '@/components/cw-shared'

export function AddCreditForm() {
  const [identifier, setIdentifier] = useState('')
  const [amount, setAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identifier.trim() || amount <= 0) return
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), amount }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, message: data.error ?? 'Gagal menambah kredit' })
      } else {
        setResult({
          success: true,
          message: `Berhasil! ${data.email} (${data.username ?? '—'}) sekarang punya ${data.credits} kredit.`,
        })
        setIdentifier('')
        setAmount(1)
      }
    } catch {
      setResult({ success: false, message: 'Koneksi gagal.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${CW.border}`, borderRadius: 3, marginBottom: 20 }}>
      <div style={{ background: CW.panelHead, padding: '9px 16px', borderBottom: `1px solid ${CW.border}`, fontSize: 13, fontWeight: 700, color: CW.ink }}>
        Tambah Kredit Pengguna
      </div>
      <div style={{ padding: '18px 20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: CW.inkMuted, marginBottom: 5, letterSpacing: 0.5 }}>
              EMAIL ATAU USERNAME
            </label>
            <input
              type="text"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="user@email.com atau username123"
              required
              style={{ width: '100%', padding: '8px 11px', border: `1px solid ${CW.borderDark}`, borderRadius: 3, fontSize: 13, color: CW.ink, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: CW.inkMuted, marginBottom: 5, letterSpacing: 0.5 }}>
              JUMLAH
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              required
              style={{ width: '100%', padding: '8px 11px', border: `1px solid ${CW.borderDark}`, borderRadius: 3, fontSize: 13, color: CW.ink, background: '#fff', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#9ca3af' : CW.green, color: '#fff', border: 'none', borderRadius: 3, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
          >
            {loading ? 'Menyimpan...' : '+ Tambah Kredit'}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 2, fontSize: 12.5, background: result.success ? '#dcfce7' : '#fee2e2', color: result.success ? CW.green : CW.red }}>
            {result.message}
          </div>
        )}
      </div>
    </div>
  )
}
