import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getDb } from '@/lib/db'

interface UserRow {
  id: string
  email: string
  name: string | null
  image: string | null
  subscription_tier: string
  monthly_verifications: number
  verification_month: string
  created_at: string
}

const MONTHLY_LIMITS: Record<string, number | null> = {
  free: 10,
  starter: 100,
  pro: null,       // unlimited
  enterprise: null,
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
      SELECT id, email, name, image, subscription_tier, monthly_verifications, verification_month, created_at
      FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    if (!userRows[0]) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    const user = userRows[0]
    const limit = MONTHLY_LIMITS[user.subscription_tier] ?? MONTHLY_LIMITS.free

    return NextResponse.json({
      user,
      usage: {
        verifications_this_month: user.monthly_verifications,
        monthly_limit: limit,
        unlimited: limit === null,
      },
    })
  } catch (err) {
    console.error('[user/account] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch account.' }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const email = session.user!.email!

  try {
    const sql = getDb()
    await sql`DELETE FROM users WHERE email = ${email}`
    return NextResponse.json({ success: true, message: 'Account deleted successfully.' })
  } catch (err) {
    console.error('[user/account] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 })
  }
}
