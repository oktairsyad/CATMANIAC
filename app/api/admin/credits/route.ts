import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 3. Parse body
  const { identifier, amount } = await req.json()
  if (!identifier || !amount || amount <= 0) {
    return NextResponse.json({ error: 'identifier dan amount diperlukan' }, { status: 400 })
  }

  // 4. Find target user by email or username
  const admin = createAdminClient()
  const isEmail = identifier.includes('@')

  const { data: target } = await admin
    .from('profiles')
    .select('id, email, username, credits')
    .eq(isEmail ? 'email' : 'username', isEmail ? identifier : identifier.toLowerCase().trim())
    .maybeSingle()

  if (!target) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }

  // 5. Add credits
  const { data: updated, error } = await admin
    .from('profiles')
    .update({ credits: target.credits + amount })
    .eq('id', target.id)
    .select('credits')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    email: target.email,
    username: target.username,
    credits: updated.credits,
  })
}
