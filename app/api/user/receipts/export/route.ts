import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getDb } from '@/lib/db'

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

export async function GET() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
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

    if (user.subscription_tier === 'free' || user.subscription_tier === 'starter') {
      return NextResponse.json(
        { error: 'Bulk export requires Pro plan' },
        { status: 403 }
      )
    }

    const EXPORT_LIMIT = 10000
    const receipts = (await sql`
      SELECT id, bundle_hash, status, summary, parties, timestamps, verifier_version, created_at
      FROM receipts
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT ${EXPORT_LIMIT + 1}
    `) as ReceiptRow[]

    // Check whether the result was truncated by the limit
    const truncated = receipts.length > EXPORT_LIMIT
    const exportRows = truncated ? receipts.slice(0, EXPORT_LIMIT) : receipts

    const payload = {
      _meta: {
        count: exportRows.length,
        truncated,
        ...(truncated && {
          message: `Export limited to ${EXPORT_LIMIT} most recent receipts. Contact support for full data export.`,
        }),
      },
      receipts: exportRows,
    }

    const jsonStr = JSON.stringify(payload, null, 2)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="proofdrop-receipts-${Date.now()}.json"`,
    }
    if (truncated) {
      headers['X-ProofDrop-Truncated'] = 'true'
    }

    return new NextResponse(jsonStr, {
      status: 200,
      headers,
    })
  } catch (err) {
    console.error('[user/receipts/bulk-export] DB error:', err)
    return NextResponse.json({ error: 'Failed to export receipts.' }, { status: 500 })
  }
}
