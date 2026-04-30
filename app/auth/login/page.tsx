'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CW, CWHeader, CWFooter } from '@/components/cw-shared'

function Input({ placeholder, value, onChange, type = 'text' }: {
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: '100%', padding: '8px 11px', border: `1px solid ${CW.borderDark}`, borderRadius: 3, fontSize: 13, color: CW.ink, background: '#fff', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
      onFocus={e => e.target.style.borderColor = CW.blue}
      onBlur={e => e.target.style.borderColor = CW.borderDark}
    />
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setMessage('Cek email Anda untuk konfirmasi pendaftaran.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError('Email atau password salah.')
        else router.push('/dashboard')
      }
    } catch (err) {
      setError('Koneksi gagal. Coba refresh halaman dan ulangi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact={false} />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: 440 }}>
          <div style={{ background: CW.blue, color: '#fff', padding: '10px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.3, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
            {isSignUp ? 'DAFTAR PESERTA SIMULASI' : 'LOGIN PESERTA SIMULASI'}
          </div>
          <div style={{ background: '#fff', padding: '26px 28px', border: `1px solid ${CW.border}`, borderTop: 'none' }}>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Email', el: <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /> },
                { label: 'Password', el: <Input type="password" placeholder="Password (min. 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} /> },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 12 }}>
                  <div style={{ width: 82, fontSize: 13, fontWeight: 700, color: CW.ink, flexShrink: 0 }}>{row.label}</div>
                  <div style={{ flex: 1 }}>{row.el}</div>
                </div>
              ))}

              {error && (
                <div style={{ background: '#fee2e2', color: CW.red, padding: '8px 12px', fontSize: 12, borderRadius: 2, marginBottom: 12 }}>
                  {error}
                </div>
              )}
              {message && (
                <div style={{ background: '#dcfce7', color: CW.green, padding: '8px 12px', fontSize: 12, borderRadius: 2, marginBottom: 12 }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingLeft: 94 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: loading ? '#9ca3af' : CW.blue, color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Memproses...' : isSignUp ? 'DAFTAR' : 'LOGIN'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
                  style={{ background: '#1f1f1f', color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  {isSignUp ? 'Sudah Punya Akun ▾' : 'Daftar Gratis ▾'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <CWFooter />
    </div>
  )
}
