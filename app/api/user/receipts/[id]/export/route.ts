import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getDb } from '@/lib/db'
import { validateReceiptId } from '@/lib/receipt-id'

interface UserRow {
  id: string
  subscription_tier: string
}

interface ReceiptRow {
  id: string
  bundle_hash: string
  status: string
  summary: unknown
  parties: unknown
  timestamps: unknown
  verifier_version: string
  created_at: string
}

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { id } = await params

  if (!validateReceiptId(id)) {
    return NextResponse.json({ error: 'Invalid receipt ID format.' }, { status: 400 })
  }

  const email = session.user!.email!

  try {
    const sql = getDb()

    const userRows = (await sql`
      SELECT id, subscription_tier FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    if (user.subscription_tier === 'free') {
      return NextResponse.json(
        { error: 'Export requires a Starter or Pro subscription.' },
        { status: 403 }
      )
    }

    const receipts = (await sql`
      SELECT id, bundle_hash, status, summary, parties, timestamps, verifier_version, created_at
      FROM receipts
      WHERE id = ${id} AND user_id = ${user.id}
      LIMIT 1
    `) as ReceiptRow[]

    if (!receipts[0]) {
      return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 })
    }

    const jsonStr = JSON.stringify(receipts[0], null, 2)

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="receipt-${id}.json"`,
      },
    })
  } catch (err) {
    console.error('[user/receipts/export] DB error:', err)
    return NextResponse.json({ error: 'Failed to export receipt.' }, { status: 500 })
  }
}
