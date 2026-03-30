import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { validateReceiptId } from '@/lib/receipt-id'

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

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  if (!validateReceiptId(id)) {
    return NextResponse.json({ error: 'Invalid receipt ID format.' }, { status: 400 })
  }

  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, bundle_hash, status, summary, parties, timestamps, verifier_version, created_at
      FROM receipts
      WHERE id = ${id}
      LIMIT 1
    `) as ReceiptRow[]

    if (!rows[0]) {
      return NextResponse.json({ error: 'Receipt not found.' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[receipts/id] DB error:', err)
    return NextResponse.json({ error: 'Failed to fetch receipt.' }, { status: 500 })
  }
}
