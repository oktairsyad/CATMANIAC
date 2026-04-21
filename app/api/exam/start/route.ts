import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [twkRes, tiuRes, tkpRes] = await Promise.all([
    supabase.from('question_bank').select('id').eq('tipe', 'TWK'),
    supabase.from('question_bank').select('id').eq('tipe', 'TIU'),
    supabase.from('question_bank').select('id').eq('tipe', 'TKP'),
  ])

  const questionIds = [
    ...pickRandom(twkRes.data?.map(q => q.id) ?? [], 30),
    ...pickRandom(tiuRes.data?.map(q => q.id) ?? [], 35),
    ...pickRandom(tkpRes.data?.map(q => q.id) ?? [], 35),
  ]

  if (questionIds.length !== 100) {
    return NextResponse.json({ error: 'Bank soal tidak cukup' }, { status: 500 })
  }

  const endsAt = new Date(Date.now() + 100 * 60 * 1000)

  // Atomic: kurangi 1 kredit + buat session via RPC
  const { data: sessionId, error } = await supabase.rpc('start_exam_with_credit', {
    p_user_id: user.id,
    p_ends_at: endsAt.toISOString(),
    p_question_ids: questionIds,
  })

  if (error) {
    if (error.message.includes('Kredit tidak cukup')) {
      return NextResponse.json(
        { error: 'Kredit habis. Silakan beli paket tryout dulu.', code: 'NO_CREDITS' },
        { status: 402 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sessionId })
}
