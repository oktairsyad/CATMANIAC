'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Question, AnswerOption } from '@/types/exam'
import { CW, CWHeader, CWFooter, CWPanel, CWInfoRow } from '@/components/cw-shared'

type Status = 'loading' | 'active' | 'submitting' | 'submitted' | 'expired'

const SUBTEST_LABEL: Record<string, string> = {
  TWK: 'Tes Wawasan Kebangsaan — TWK',
  TIU: 'Tes Intelegensi Umum — TIU',
  TKP: 'Tes Karakteristik Pribadi — TKP',
}

export default function ExamPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, AnswerOption>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [endsAt, setEndsAt] = useState<Date | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const submittedRef = useRef(false)
  const submitFnRef = useRef<() => void>(() => {})

  const submitExam = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setStatus('submitting')
    await fetch(`/api/exam/${sessionId}/submit`, { method: 'POST' })
    router.push(`/result/${sessionId}`)
  }, [sessionId, router])

  submitFnRef.current = submitExam

  useEffect(() => {
    // get user info from Supabase client
    import('@/lib/supabase/client').then(({ createClient }) => {
      const sb = createClient()
      sb.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUserEmail(data.user.email ?? '')
          sb.from('profiles').select('full_name').eq('id', data.user.id).single()
            .then(({ data: p }) => setUserName(p?.full_name || data.user.email?.split('@')[0] || ''))
        }
      })
    })
  }, [])

  useEffect(() => {
    fetch(`/api/exam/${sessionId}/questions`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/dashboard'); return }
        setQuestions(data.questions)
        setAnswers(data.answers ?? {})
        setEndsAt(new Date(data.session.ends_at))
        if (data.session.status !== 'active') {
          if (data.session.status === 'submitted') router.push(`/result/${sessionId}`)
          else setStatus(data.session.status)
        } else {
          setStatus('active')
        }
      })
  }, [sessionId, router])

  useEffect(() => {
    if (!endsAt || status !== 'active') return
    const tick = () => {
      const rem = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000))
      setRemaining(rem)
      if (rem === 0) submitFnRef.current()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt, status])

  const selectAnswer = async (answer: AnswerOption) => {
    const q = questions[currentIdx]
    if (!q || status !== 'active') return
    setAnswers(prev => ({ ...prev, [q.id]: answer }))
    fetch(`/api/exam/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: q.id, jawaban: answer }),
    })
  }

  const toggleFlag = () => {
    const q = questions[currentIdx]
    if (!q) return
    setFlagged(prev => { const n = new Set(prev); n.has(q.id) ? n.delete(q.id) : n.add(q.id); return n })
  }

  const handleSelesai = () => {
    const unanswered = questions.length - Object.keys(answers).length
    const msg = `PERHATIAN!!!\n\nSOAL BELUM DIJAWAB: ${unanswered}\n\nApakah Anda ingin mengakhiri simulasi ujian ini?\n\nJika "Ya" maka Anda sudah dinyatakan selesai dan tidak bisa memperbaiki jawaban.\nJika "Tidak" maka Anda akan kembali ke lembar kerja.`
    if (confirm(msg)) submitExam()
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: `3px solid ${CW.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: CW.inkMuted, fontSize: 13 }}>Memuat soal...</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  const q = questions[currentIdx]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const hours = Math.floor(remaining / 3600)
  const timeStr = remaining >= 3600
    ? `${String(hours).padStart(2,'0')}:${String(Math.floor((remaining%3600)/60)).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  const isUrgent = remaining < 300

  const optionKeys: AnswerOption[] = ['a', 'b', 'c', 'd', 'e']

  function cleanOption(text: string | null | undefined, soal: string): string | null {
    if (!text || !text.trim()) return null
    if (text.trim() === soal.trim()) return null  // duplicate of question text
    return text.trim()
  }

  const optionMap: Record<AnswerOption, string | null> = {
    a: cleanOption(q?.opsi_a, q?.soal_text ?? ''),
    b: cleanOption(q?.opsi_b, q?.soal_text ?? ''),
    c: cleanOption(q?.opsi_c, q?.soal_text ?? ''),
    d: cleanOption(q?.opsi_d, q?.soal_text ?? ''),
    e: cleanOption(q?.opsi_e, q?.soal_text ?? ''),
  }

  return (
    <div style={{ minHeight: '100vh', background: CW.bg, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
      <CWHeader compact />

      {/* Stats bar */}
      <div style={{ display: 'flex', background: '#fff', borderBottom: `1px solid ${CW.border}`, flexShrink: 0 }}>
        {[
          { label: 'Batas Waktu', value: `${String(mins + hours * 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`, color: isUrgent ? CW.red : CW.ink },
          { label: 'Jumlah Soal', value: String(questions.length), color: CW.ink },
          { label: 'Dijawab', value: String(answeredCount), color: CW.green },
          { label: 'Belum Dijawab', value: String(unansweredCount), color: CW.red },
        ].map(cell => (
          <div key={cell.label} style={{ flex: 1, padding: '10px 14px', textAlign: 'center', borderRight: `1px solid ${CW.border}` }}>
            <div style={{ fontSize: 12, color: cell.color, fontWeight: 700, lineHeight: 1.1 }}>{cell.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: cell.color, fontFamily: 'Arial, sans-serif', marginTop: 2 }}>{cell.value}</div>
          </div>
        ))}
        <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
          <button
            onClick={handleSelesai}
            disabled={status === 'submitting'}
            style={{ background: '#1f1f1f', color: '#fff', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 3, opacity: status === 'submitting' ? 0.5 : 1 }}
          >
            {status === 'submitting' ? 'Mengirim...' : 'Selesai Ujian'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px 22px', overflowY: 'auto', paddingBottom: 60 }}>
        {/* Info panel */}
        <CWPanel>
          <CWInfoRow label="Nama Peserta" value={userName || '—'} />
          <CWInfoRow label="Email" value={userEmail || '—'} valueColor={CW.blue} />
          <div style={{ fontSize: 14, fontWeight: 700, color: CW.ink, marginTop: 6 }}>
            {q ? SUBTEST_LABEL[q.tipe] : ''}
          </div>
        </CWPanel>

        {/* Question */}
        {q && (
          <CWPanel>
            <div style={{ fontSize: 14, fontWeight: 700, color: CW.ink, marginBottom: 10 }}>
              Soal No. {currentIdx + 1}
            </div>
            <div style={{ fontSize: 13.5, color: CW.ink, lineHeight: 1.7, marginBottom: 14 }}>
              {q.soal_text}
            </div>
            <div>
              {optionKeys.map(opt => {
                const text = optionMap[opt]
                if (!text) return null
                const selected = answers[q.id] === opt
                return (
                  <label
                    key={opt}
                    onClick={() => selectAnswer(opt)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '6px 0', cursor: 'pointer', fontSize: 13.5, lineHeight: 1.6 }}
                  >
                    <span style={{ width: 15, height: 15, border: `2px solid ${selected ? CW.blue : '#9ca3af'}`, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3, background: '#fff' }}>
                      {selected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: CW.blue }} />}
                    </span>
                    <span style={{ color: selected ? CW.blue : CW.ink, fontWeight: selected ? 600 : 400 }}>
                      {opt.toUpperCase()}. {text}
                    </span>
                  </label>
                )
              })}
            </div>
          </CWPanel>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => {
              selectAnswer(answers[q?.id ?? ''] ?? optionKeys.find(o => optionMap[o]) ?? 'a')
              setCurrentIdx(i => Math.min(questions.length - 1, i + 1))
            }}
            disabled={!q || status !== 'active'}
            style={{ background: CW.blue, color: '#fff', border: `1px solid ${CW.blue}`, borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Simpan dan Lanjutkan
          </button>
          <button
            onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
            style={{ background: '#3b82f6', color: '#fff', border: '1px solid #3b82f6', borderRadius: 3, padding: '9px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Lewatkan soal ini
          </button>
          <button
            onClick={toggleFlag}
            style={{ background: flagged.has(q?.id ?? '') ? '#fef3c7' : '#fff', color: flagged.has(q?.id ?? '') ? '#92400e' : CW.inkMuted, border: `1px solid ${flagged.has(q?.id ?? '') ? '#f59e0b' : CW.borderDark}`, borderRadius: 3, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}
          >
            ⚑ {flagged.has(q?.id ?? '') ? 'Ragu-ragu' : 'Tandai ragu'}
          </button>
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(i => i - 1)}
              style={{ background: '#fff', color: CW.ink, border: `1px solid ${CW.borderDark}`, borderRadius: 3, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}
            >
              ← Sebelumnya
            </button>
          )}
        </div>

        {/* Nav grid — full 100, CAT style */}
        <div style={{ background: '#fff', border: `1px solid ${CW.border}`, borderRadius: 3, padding: 16 }}>
          <div style={{ textAlign: 'center', fontSize: 12, color: CW.ink, marginBottom: 10 }}>
            <span style={{ color: CW.green, fontWeight: 700 }}>Hijau : Dijawab</span>
            <span style={{ margin: '0 16px', color: CW.inkMuted }}>·</span>
            <span style={{ color: CW.red, fontWeight: 700 }}>Merah : Belum dijawab</span>
            {flagged.size > 0 && (
              <>
                <span style={{ margin: '0 16px', color: CW.inkMuted }}>·</span>
                <span style={{ color: CW.amber, fontWeight: 700 }}>⚑ Ragu-ragu</span>
              </>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 3 }}>
            {questions.map((item, i) => {
              const isAnswered = !!answers[item.id]
              const isFlagged = flagged.has(item.id)
              const isCurrent = i === currentIdx
              const bg = isCurrent ? CW.navy : isAnswered ? CW.green : '#fff'
              const fg = isCurrent || isAnswered ? '#fff' : CW.red
              const border = isCurrent ? `2px solid ${CW.amber}` : isAnswered ? `1px solid ${CW.green}` : `1px solid ${CW.red}`
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIdx(i)}
                  title={`Soal ${i + 1}`}
                  style={{ position: 'relative', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, color: fg, border, borderRadius: 2, fontSize: 10, fontWeight: 700, cursor: 'pointer', textDecoration: isAnswered || isCurrent ? 'none' : 'underline' }}
                >
                  {i + 1}
                  {isFlagged && <span style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, background: CW.amber, borderRadius: '50%' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timer — fixed bottom-right, CAT signature */}
      <div style={{ position: 'fixed', bottom: 34, right: 0, background: isUrgent ? '#7f1d1d' : '#1f1f1f', color: isUrgent ? '#fca5a5' : '#fff', fontFamily: 'Consolas, "Courier New", monospace', fontSize: 26, fontWeight: 700, padding: '8px 18px', letterSpacing: 2, zIndex: 50 }}>
        {timeStr}
      </div>

      <CWFooter />
    </div>
  )
}
