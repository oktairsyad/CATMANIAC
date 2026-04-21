import { AnswerOption, ScoreResult } from '@/types/exam'

// Passing grade SKD 2024
const PASSING = { TWK: 65, TIU: 80, TKP: 143 } as const

interface QuestionForScore {
  id: string
  tipe: 'TWK' | 'TIU' | 'TKP'
  jawaban_benar: string
}

export function calculateScore(
  questions: QuestionForScore[],
  answers: Record<string, AnswerOption>
): ScoreResult {
  let twk = 0, tiu = 0, tkp = 0

  for (const q of questions) {
    const answer = answers[q.id]
    if (!answer) continue

    if (q.tipe === 'TWK') {
      if (answer === q.jawaban_benar) twk += 5
    } else if (q.tipe === 'TIU') {
      if (answer === q.jawaban_benar) tiu += 5
    } else {
      // TKP simplified v1: jawaban_benar = 5, opsi lain = 1
      tkp += answer === q.jawaban_benar ? 5 : 1
    }
  }

  return {
    skor_twk: twk,
    skor_tiu: tiu,
    skor_tkp: tkp,
    skor_total: twk + tiu + tkp,
    lulus_twk: twk >= PASSING.TWK,
    lulus_tiu: tiu >= PASSING.TIU,
    lulus_tkp: tkp >= PASSING.TKP,
    lulus_total: twk >= PASSING.TWK && tiu >= PASSING.TIU && tkp >= PASSING.TKP,
  }
}
