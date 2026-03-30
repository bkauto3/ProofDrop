import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

interface UserRow {
  id: string
  subscription_tier: string
}

interface ApiKeyOwnerRow {
  user_id: string
  revoked_at: string | null
}

/** DELETE /api/keys/[id] — revoke an API key the caller owns. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sql = getDb()

    // Resolve the calling user
    const userRows = (await sql`
      SELECT id, subscription_tier FROM users WHERE email = ${session.user.email} LIMIT 1
    `) as UserRow[]

    if (!userRows[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userRows[0]

    if (user.subscription_tier !== 'pro' && user.subscription_tier !== 'enterprise') {
      return NextResponse.json(
        { error: 'API access requires Pro plan' },
        { status: 403 }
      )
    }

    // Verify the key exists and belongs to this user
    const keyRows = (await sql`
      SELECT user_id, revoked_at FROM api_keys WHERE id = ${id} LIMIT 1
    `) as ApiKeyOwnerRow[]

    if (!keyRows[0]) {
      return NextResponse.json({ error: 'API key not found.' }, { status: 404 })
    }

    if (keyRows[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    if (keyRows[0].revoked_at !== null) {
      return NextResponse.json({ error: 'API key already revoked.' }, { status: 409 })
    }

    await sql`
      UPDATE api_keys
      SET revoked_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('[api/keys/[id] DELETE] error:', err)
    return NextResponse.json({ error: 'Failed to revoke API key.' }, { status: 500 })
  }
}
