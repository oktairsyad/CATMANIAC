export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY

  return Response.json({
    NEXT_PUBLIC_SUPABASE_URL: url ? `✓ set (${url.slice(0, 30)}...)` : '✗ MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ? `✓ set (${anon.slice(0, 10)}...)` : '✗ MISSING',
    SUPABASE_SERVICE_ROLE_KEY: svc ? `✓ set (${svc.slice(0, 10)}...)` : '✗ MISSING',
  })
}
