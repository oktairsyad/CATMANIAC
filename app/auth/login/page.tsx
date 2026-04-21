'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CW, CWHeader, CWFooter } from '@/components/cw-shared'

// CWInput needs to be exported from cw-shared — using local version here
function Input({ placeholder, value, onChange, type = 'text' }: { placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
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
    setLoading(true); setError(''); setMessage('')
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Cek email Anda untuk konfirmasi pendaftaran.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email atau password salah.')
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/auth/callback` } })
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

              {error && <div style={{ background: '#fee2e2', color: CW.red, padding: '8px 12px', fontSize: 12, borderRadius: 2, marginBottom: 12 }}>{error}</div>}
              {message && <div style={{ background: '#dcfce7', color: CW.green, padding: '8px 12px', fontSize: 12, borderRadius: 2, marginBottom: 12 }}>{message}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingLeft: 94 }}>
                <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : CW.blue, color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Memproses...' : isSignUp ? 'DAFTAR' : 'LOGIN'}
                </button>
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }} style={{ background: '#1f1f1f', color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  {isSignUp ? 'Sudah Punya Akun ▾' : 'Daftar Gratis ▾'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${CW.border}`, paddingLeft: 94 }}>
              <button onClick={handleGoogle} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${CW.borderDark}`, borderRadius: 3, padding: '8px 14px', fontSize: 13, cursor: 'pointer', color: CW.ink }}>
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.175 0 7.548 0 9s.348 2.825.957 4.038l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 6.294C4.672 4.167 6.656 3.58 9 3.58z"/>
                </svg>
                Masuk dengan Google
              </button>
            </div>
          </div>
        </div>
      </div>

      <CWFooter />
    </div>
  )
}
