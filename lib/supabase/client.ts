import { createBrowserClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error(
    `Supabase env vars missing.\n` +
    `NEXT_PUBLIC_SUPABASE_URL: ${url ?? 'undefined'}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anon ? 'set' : 'undefined'}`
  )
}

export function createClient() {
  return createBrowserClient(url, anon)
}
