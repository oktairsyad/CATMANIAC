import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session, error } = await supabase
    .from('exam_sessions')
    .select('id, ends_at, status, question_ids')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error || !session) return NextResponse.json({ error: 'Session tidak ditemukan' }, { status: 404 })

  // Auto-expire jika waktu habis
  if (session.status === 'active' && new Date(session.ends_at) < new Date()) {
    await supabase.from('exam_sessions').update({ status: 'expired' }).eq('id', session.id)
    session.status = 'expired'
  }

  // Fetch questions tanpa jawaban_benar
  const { data: questions } = await supabase
    .from('question_bank')
    .select('id, soal_text, opsi_a, opsi_b, opsi_c, opsi_d, opsi_e, tipe')
    .in('id', session.question_ids)

  // Preserve urutan dari question_ids
  const qMap = new Map(questions?.map(q => [q.id, q]))
  const ordered = session.question_ids.map((id: string) => qMap.get(id)).filter(Boolean)

  // Fetch existing answers
  const { data: answerRows } = await supabase
    .from('exam_answers')
    .select('question_id, jawaban')
    .eq('session_id', session.id)

  const answers = Object.fromEntries((answerRows ?? []).map(a => [a.question_id, a.jawaban]))

  return NextResponse.json({
    session: { id: session.id, ends_at: session.ends_at, status: session.status },
    questions: ordered,
    answers,
  })
}
