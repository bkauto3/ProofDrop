import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { generateApiKey } from '@/lib/api-keys'

interface UserRow {
  id: string
  subscription_tier: string
}

interface ApiKeyRow {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at: string | null
  expires_at: string | null
  revoked_at: string | null
}

/** Resolve session → user row, enforcing Pro/Enterprise tier. */
async function resolveProUser(
  sql: ReturnType<typeof getDb>
): Promise<{ user: UserRow } | NextResponse> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = (await sql`
    SELECT id, subscription_tier FROM users WHERE email = ${session.user.email} LIMIT 1
  `) as UserRow[]

  if (!rows[0]) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const user = rows[0]
  if (user.subscription_tier !== 'pro' && user.subscription_tier !== 'enterprise') {
    return NextResponse.json(
      { error: 'API access requires Pro plan' },
      { status: 403 }
    )
  }

  return { user }
}

/** GET /api/keys — list caller's API keys (never returns hashes). */
export async function GET(_req: NextRequest) {
  try {
    const sql = getDb()
    const result = await resolveProUser(sql)
    if (result instanceof NextResponse) return result
    const { user } = result

    const keys = (await sql`
      SELECT id, name, key_prefix, created_at, last_used_at, expires_at, revoked_at
      FROM api_keys
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 100
    `) as ApiKeyRow[]

    return NextResponse.json({ keys })
  } catch (err) {
    console.error('[api/keys GET] error:', err)
    return NextResponse.json({ error: 'Failed to list API keys.' }, { status: 500 })
  }
}

/** POST /api/keys — create a new API key. Returns full key ONCE. */
export async function POST(req: NextRequest) {
  try {
    const sql = getDb()
    const result = await resolveProUser(sql)
    if (result instanceof NextResponse) return result
    const { user } = result

    const body = (await req.json().catch(() => ({}))) as { name?: unknown }
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'name is required.' }, { status: 400 })
    }
    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Key name must be 255 characters or less.' },
        { status: 400 }
      )
    }

    // Enforce a per-user limit of 10 active (non-revoked) API keys
    const [countRow] = (await sql`
      SELECT COUNT(*)::int AS count FROM api_keys
      WHERE user_id = ${user.id} AND revoked_at IS NULL
    `) as { count: number }[]
    if ((countRow?.count ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 active API keys allowed.' },
        { status: 409 }
      )
    }

    const { key, hash, prefix } = generateApiKey()

    const rows = (await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
      VALUES (${user.id}, ${name}, ${hash}, ${prefix})
      RETURNING id, name, key_prefix, created_at
    `) as { id: string; name: string; key_prefix: string; created_at: string }[]

    const created = rows[0]

    // Return the plaintext key exactly once — it is never stored
    return NextResponse.json(
      {
        id: created.id,
        name: created.name,
        key,           // full plaintext key — shown only at creation time
        prefix: created.key_prefix,
        created_at: created.created_at,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[api/keys POST] error:', err)
    return NextResponse.json({ error: 'Failed to create API key.' }, { status: 500 })
  }
}
