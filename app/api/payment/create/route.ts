import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const PACKAGES: Record<string, { credits: number; price: number; name: string }> = {
  'pkg-3': { credits: 3, price: 29000, name: 'Paket Hemat (3 Tryout)' },
  'pkg-10': { credits: 10, price: 79000, name: 'Paket Standar (10 Tryout)' },
  'pkg-25': { credits: 25, price: 149000, name: 'Paket Premium (25 Tryout)' },
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { packageId } = await request.json()
  const pkg = PACKAGES[packageId]
  if (!pkg) return NextResponse.json({ error: 'Paket tidak valid' }, { status: 400 })

  const orderId = `ORDER-${user.id.slice(0, 8)}-${Date.now()}`

  const admin = createAdminClient()
  await admin.from('transactions').insert({
    user_id: user.id,
    midtrans_order_id: orderId,
    amount: pkg.price,
    credits_purchased: pkg.credits,
    status: 'pending',
  })

  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true'
  const snapUrl = isProd
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  const res = await fetch(snapUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(serverKey + ':').toString('base64')}`,
    },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: pkg.price },
      customer_details: { email: user.email },
      item_details: [{ id: packageId, price: pkg.price, quantity: 1, name: pkg.name }],
    }),
  })

  const data = await res.json()
  if (!data.token) return NextResponse.json({ error: 'Gagal membuat transaksi Midtrans' }, { status: 500 })

  return NextResponse.json({ token: data.token, orderId })
}
