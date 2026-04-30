'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CW } from '@/components/cw-shared'

export function LogoutButton({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (variant === 'light') {
    return (
      <button
        onClick={handleLogout}
        className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
      >
        Keluar
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'rgba(255,255,255,0.15)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 3,
        padding: '5px 14px',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: 0.3,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      Keluar
    </button>
  )
}
