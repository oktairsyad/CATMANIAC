import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load .env.local manual (tanpa dotenv dependency)
const envPath = join(dirname(fileURLToPath(import.meta.url)), '../.env.local')
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const [key, ...val] = line.split('=')
  if (key && val.length) process.env[key.trim()] = val.join('=').trim()
})

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourceFile = process.argv[2] || join(__dirname, '../../bank soal cat/soal_master.json')

const raw = JSON.parse(readFileSync(sourceFile, 'utf-8'))

function transform(q) {
  return {
    soal_text: q.question.trim(),
    opsi_a: q.options.A?.trim() || '',
    opsi_b: q.options.B?.trim() || '',
    opsi_c: q.options.C?.trim() || '',
    opsi_d: q.options.D?.trim() || '',
    opsi_e: q.options.E?.trim() || null,
    jawaban_benar: q.answer.toLowerCase(),
    tipe: q.category,
    // TKP: jawaban_benar = opsi terbaik (skor 5), opsi lain = 1 (simplified v1)
    bobot_tkp: q.category === 'TKP' ? 5 : null,
    tingkat_kesulitan: 2,
  }
}

async function importSoal() {
  const rows = raw.map(transform)
  console.log(`Mengimport ${rows.length} soal ke Supabase...`)

  const BATCH = 50
  let inserted = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('question_bank').insert(batch)
    if (error) {
      console.error(`Batch ${i}–${i + BATCH} gagal:`, error.message)
      process.exit(1)
    }
    inserted += batch.length
    console.log(`  ✓ ${inserted}/${rows.length}`)
  }

  console.log(`\nSelesai! ${inserted} soal berhasil masuk ke Supabase.`)
}

importSoal()
