export type QuestionType = 'TWK' | 'TIU' | 'TKP'
export type AnswerOption = 'a' | 'b' | 'c' | 'd' | 'e'

export interface Question {
  id: string
  soal_text: string
  opsi_a: string
  opsi_b: string
  opsi_c: string
  opsi_d: string
  opsi_e: string | null
  tipe: QuestionType
}

export interface ExamSession {
  id: string
  ends_at: string
  status: 'active' | 'submitted' | 'expired'
}

export interface ExamData {
  session: ExamSession
  questions: Question[]
  answers: Record<string, AnswerOption>
}

export interface ScoreResult {
  skor_twk: number
  skor_tiu: number
  skor_tkp: number
  skor_total: number
  lulus_twk: boolean
  lulus_tiu: boolean
  lulus_tkp: boolean
  lulus_total: boolean
}
