import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getDb } from '@/lib/db'

interface ReceiptRow {
  id: string
  bundle_hash: string
  status: string
  created_at: string
  summary: unknown
}

interface UserRow {
  id: string
  subscription_tier: string
}

export async function GET(req: NextRequest) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const email = session.user!.email!
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = 20
  const offset = (page - 1) * limit

  try {
    const sql = getDb()

    const userRows = (await sql`
      SELECT id, subscription_tier FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    if (!userRows[0]) {
      return NextResponse.json({ receipts: [], total: 0, page, pages: 0 })
    }

    const userId = userRows[0].id
    const isFree = userRows[0].subscription_tier === 'free'

    // Free tier: only show receipts from the last 30 days
    const dateFilter = isFree
      ? sql`AND created_at >= NOW() - INTERVAL '30 days'`
      : sql``

    const [countRows, receipts] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM receipts WHERE user_id = ${userId} ${dateFilter}`,
      sql`
        SELECT id, bundle_hash, status, created_at, summary
        FROM receipts
        WHERE user_id = ${userId} ${dateFilter}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
    ]) as [{ count: string }[], ReceiptRow[]]

    const total = parseInt(countRows[0]?.count ?? '0', 10)
    const pages = Math.ceil(total / limit)

    return NextResponse.json({ receipts, total, page, pages })
  } catch (err) {
    console.error('[user/receipts] DB error:', err)
    return NextResponse.json({ error: 'Failed to fetch receipts.' }, { status: 500 })
  }
}
