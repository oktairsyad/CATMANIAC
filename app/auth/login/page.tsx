'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CW, CWHeader, CWFooter } from '@/components/cw-shared'

// ── Eye icons ────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ── Shared input with optional right button ───────────────────────────────────
function Field({
  label, type = 'text', value, onChange, placeholder, right, hint,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  right?: React.ReactNode
  hint?: { text: string; ok: boolean } | null
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14, gap: 12 }}>
      <div style={{ width: 118, fontSize: 13, fontWeight: 700, color: CW.ink, flexShrink: 0, lineHeight: 1.3 }}>{label}</div>
      <div style={{ flex: 1 }}>
        <div style={{ position: 'relative' }}>
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: '100%', padding: right ? '8px 36px 8px 11px' : '8px 11px', border: `1px solid ${hint ? (hint.ok ? CW.green : CW.red) : CW.borderDark}`, borderRadius: 3, fontSize: 13, color: CW.ink, background: '#fff', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
          />
          {right && (
            <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: CW.inkMuted, display: 'flex', alignItems: 'center' }}>
              {right}
            </div>
          )}
        </div>
        {hint && (
          <div style={{ fontSize: 11, color: hint.ok ? CW.green : CW.red, marginTop: 3 }}>{hint.text}</div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  // Login fields
  const [loginId, setLoginId] = useState('')       // email or username
  const [loginPw, setLoginPw] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)

  // Register fields
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPw, setRegPw] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [showRegPw, setShowRegPw] = useState(false)
  const [showRegConfirm, setShowRegConfirm] = useState(false)
  const [usernameHint, setUsernameHint] = useState<{ text: string; ok: boolean } | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Username uniqueness check (on blur)
  const checkUsername = useCallback(async (value: string) => {
    const cleaned = value.toLowerCase().trim()
    if (!cleaned) { setUsernameHint(null); return }
    if (!/^[a-z0-9_]{3,20}$/.test(cleaned)) {
      setUsernameHint({ text: '3–20 karakter, huruf/angka/underscore saja.', ok: false })
      return
    }
    setCheckingUsername(true)
    const res = await fetch(`/api/auth/username?username=${cleaned}`)
    const { taken } = await res.json()
    setUsernameHint(taken
      ? { text: 'Username sudah dipakai.', ok: false }
      : { text: 'Username tersedia.', ok: true }
    )
    setCheckingUsername(false)
  }, [])

  // Password match hint
  const confirmHint = regConfirm
    ? regConfirm === regPw
      ? { text: 'Password cocok.', ok: true }
      : { text: 'Password tidak sama.', ok: false }
    : null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      let email = loginId.trim()

      // Resolve username → email
      if (!email.includes('@')) {
        const res = await fetch('/api/auth/username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email }),
        })
        const data = await res.json()
        if (!data.email) { setError('Username tidak ditemukan.'); setLoading(false); return }
        email = data.email
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password: loginPw })
      if (error) setError('Email/username atau password salah.')
      else router.push('/dashboard')
    } catch {
      setError('Koneksi gagal. Coba refresh halaman.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const username = regUsername.toLowerCase().trim()
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setError('Username tidak valid (3–20 karakter, huruf/angka/underscore).')
      return
    }
    if (usernameHint && !usernameHint.ok) {
      setError('Username tidak tersedia.')
      return
    }
    if (regPw !== regConfirm) {
      setError('Password tidak sama.')
      return
    }
    if (regPw.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPw,
        options: { data: { username } },
      })
      if (error) setError(error.message)
      else setMessage('Cek email Anda untuk konfirmasi pendaftaran.')
    } catch {
      setError('Koneksi gagal. Coba refresh halaman.')
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setIsSignUp(!isSignUp)
    setError(''); setMessage('')
  }

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact={false} />

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: 480 }}>
          <div style={{ background: CW.blue, color: '#fff', padding: '10px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 0.3, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
            {isSignUp ? 'DAFTAR PESERTA SIMULASI' : 'LOGIN PESERTA SIMULASI'}
          </div>
          <div style={{ background: '#fff', padding: '26px 28px', border: `1px solid ${CW.border}`, borderTop: 'none' }}>

            {/* ── LOGIN ── */}
            {!isSignUp && (
              <form onSubmit={handleLogin}>
                <Field
                  label="Email / Username"
                  value={loginId}
                  onChange={setLoginId}
                  placeholder="email@contoh.com atau username"
                />
                <Field
                  label="Password"
                  type={showLoginPw ? 'text' : 'password'}
                  value={loginPw}
                  onChange={setLoginPw}
                  placeholder="Password"
                  right={<span onClick={() => setShowLoginPw(v => !v)}><EyeIcon open={showLoginPw} /></span>}
                />
                {error && <Alert type="error">{error}</Alert>}
                <Buttons loading={loading} isSignUp={false} onSwitch={switchMode} />
              </form>
            )}

            {/* ── REGISTER ── */}
            {isSignUp && (
              <form onSubmit={handleRegister}>
                <Field
                  label="Username"
                  value={regUsername}
                  onChange={v => { setRegUsername(v); setUsernameHint(null) }}
                  placeholder="contoh: budi_santoso (3–20 karakter)"
                  hint={checkingUsername ? { text: 'Mengecek...', ok: true } : usernameHint}
                  right={
                    regUsername.length >= 3
                      ? <span
                          onClick={() => checkUsername(regUsername)}
                          style={{ fontSize: 10, fontWeight: 700, color: CW.blue, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          Cek
                        </span>
                      : undefined
                  }
                />
                <Field
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={setRegEmail}
                  placeholder="email@contoh.com"
                />
                <Field
                  label="Password"
                  type={showRegPw ? 'text' : 'password'}
                  value={regPw}
                  onChange={setRegPw}
                  placeholder="Minimal 6 karakter"
                  right={<span onClick={() => setShowRegPw(v => !v)}><EyeIcon open={showRegPw} /></span>}
                />
                <Field
                  label="Konfirmasi PW"
                  type={showRegConfirm ? 'text' : 'password'}
                  value={regConfirm}
                  onChange={setRegConfirm}
                  placeholder="Ulangi password"
                  hint={confirmHint}
                  right={<span onClick={() => setShowRegConfirm(v => !v)}><EyeIcon open={showRegConfirm} /></span>}
                />
                {error && <Alert type="error">{error}</Alert>}
                {message && <Alert type="success">{message}</Alert>}
                <Buttons loading={loading} isSignUp={true} onSwitch={switchMode} />
              </form>
            )}

          </div>
        </div>
      </div>

      <CWFooter />
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Alert({ type, children }: { type: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <div style={{ background: type === 'error' ? '#fee2e2' : '#dcfce7', color: type === 'error' ? CW.red : CW.green, padding: '8px 12px', fontSize: 12, borderRadius: 2, marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Buttons({ loading, isSignUp, onSwitch }: { loading: boolean; isSignUp: boolean; onSwitch: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingLeft: 130 }}>
      <button
        type="submit"
        disabled={loading}
        style={{ background: loading ? '#9ca3af' : CW.blue, color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Memproses...' : isSignUp ? 'DAFTAR' : 'LOGIN'}
      </button>
      <button
        type="button"
        onClick={onSwitch}
        style={{ background: '#1f1f1f', color: '#fff', border: 'none', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
      >
        {isSignUp ? 'Sudah Punya Akun ▾' : 'Daftar Gratis ▾'}
      </button>
    </div>
  )
}
