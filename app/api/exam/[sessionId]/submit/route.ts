import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateScore } from '@/lib/exam/score'
import { NextResponse } from 'next/server'
import { AnswerOption } from '@/types/exam'

export async function POST(
  _: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, status, question_ids')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })
  if (session.status === 'submitted') {
    // Sudah disubmit sebelumnya, redirect ke result
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  // Fetch questions WITH jawaban_benar — hanya di server
  const { data: questions } = await admin
    .from('question_bank')
    .select('id, tipe, jawaban_benar')
    .in('id', session.question_ids)

  // Fetch answers milik user
  const { data: answerRows } = await supabase
    .from('exam_answers')
    .select('question_id, jawaban')
    .eq('session_id', session.id)

  const answers = Object.fromEntries(
    (answerRows ?? []).map(a => [a.question_id, a.jawaban as AnswerOption])
  )

  const score = calculateScore(questions ?? [], answers)

  // Update session + insert result
  await admin.from('exam_sessions').update({
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }).eq('id', session.id)

  await admin.from('exam_results').insert({
    session_id: session.id,
    user_id: user.id,
    ...score,
  })

  return NextResponse.json({ ok: true, score })
}
