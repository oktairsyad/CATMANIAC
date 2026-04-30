import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET /api/auth/username?username=xxx — check if username is taken
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')?.toLowerCase().trim()
  if (!username) return NextResponse.json({ taken: false })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  return NextResponse.json({ taken: !!data })
}

// POST /api/auth/username — resolve username → email for login
export async function POST(req: Request) {
  const { username } = await req.json()
  if (!username) return NextResponse.json({ error: 'Username diperlukan' }, { status: 400 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('email')
    .eq('username', username.toLowerCase().trim())
    .maybeSingle()

  if (!data?.email) {
    return NextResponse.json({ error: 'Username tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ email: data.email })
}
