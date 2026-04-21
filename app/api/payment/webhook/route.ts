import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(request: Request) {
  const body = await request.json()
  const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

  // Verifikasi signature Midtrans
  const serverKey = process.env.MIDTRANS_SERVER_KEY!
  const expected = createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex')

  if (expected !== signature_key) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const isSuccess =
    transaction_status === 'settlement' ||
    (transaction_status === 'capture' && fraud_status === 'accept')

  const isFailed =
    transaction_status === 'expire' ||
    transaction_status === 'cancel' ||
    transaction_status === 'deny'

  const admin = createAdminClient()

  if (isSuccess) {
    try {
      await admin.rpc('complete_payment', { p_order_id: order_id })
    } catch {
      // Idempotent — already processed
    }
  } else if (isFailed) {
    await admin
      .from('transactions')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('midtrans_order_id', order_id)
      .eq('status', 'pending')
  }

  return NextResponse.json({ ok: true })
}
