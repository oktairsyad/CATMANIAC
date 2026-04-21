import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { questionId, jawaban } = await request.json()

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, ends_at, status')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
  if (session.status !== 'active') return NextResponse.json({ error: 'Session tidak aktif' }, { status: 400 })
  if (new Date(session.ends_at) < new Date()) return NextResponse.json({ error: 'Waktu habis' }, { status: 400 })

  const { error } = await supabase
    .from('exam_answers')
    .upsert(
      { session_id: sessionId, question_id: questionId, jawaban, answered_at: new Date().toISOString() },
      { onConflict: 'session_id,question_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
