import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { isBlockedWebhookUrl } from '@/lib/ssrf-guard'

// Allowlist of valid event names. Reject anything not in this set to prevent
// storing arbitrary strings in the events column.
const VALID_WEBHOOK_EVENTS = new Set(['verification.created'])

function validateEvents(events: unknown[]): boolean {
  return events.every((e) => typeof e === 'string' && VALID_WEBHOOK_EVENTS.has(e))
}

interface DbUser {
  id: string
  subscription_tier: string
}

interface WebhookRow {
  id: string
  url: string
  events: string[]
  enabled: boolean
  failure_count: number
  last_triggered_at: string | null
  created_at: string
}

async function getAuthedUser(): Promise<DbUser | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, subscription_tier
      FROM users
      WHERE email = ${session.user.email}
      LIMIT 1
    `) as DbUser[]
    return rows[0] ?? null
  } catch {
    return null
  }
}

// GET /api/webhooks — list all webhooks for the authenticated user
export async function GET(_req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, url, events, enabled, failure_count, last_triggered_at, created_at
      FROM webhooks
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `) as WebhookRow[]

    return NextResponse.json({ webhooks: rows })
  } catch (err) {
    console.error('[webhooks] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch webhooks.' }, { status: 500 })
  }
}

// POST /api/webhooks — create a new webhook (Pro tier required)
export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  // Pro tier gate
  if (user.subscription_tier !== 'pro' && user.subscription_tier !== 'enterprise') {
    return NextResponse.json(
      { error: 'Custom webhooks require Pro plan.' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  const { url, events } = body as { url?: unknown; events?: unknown }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: '`url` is required and must be a string.' }, { status: 400 })
  }

  // Validate and SSRF-guard the URL — must be a public HTTPS endpoint
  if (isBlockedWebhookUrl(url)) {
    return NextResponse.json(
      { error: 'Webhook URL must be a public HTTPS endpoint.' },
      { status: 422 }
    )
  }

  // Validate events array if provided
  let normalizedEvents: string[] = ['verification.created']
  if (events !== undefined) {
    if (!Array.isArray(events) || !events.every((e) => typeof e === 'string')) {
      return NextResponse.json(
        { error: '`events` must be an array of strings.' },
        { status: 400 }
      )
    }
    if (events.length === 0) {
      return NextResponse.json(
        { error: '`events` must contain at least one event.' },
        { status: 400 }
      )
    }
    if (!validateEvents(events)) {
      return NextResponse.json(
        { error: `Invalid event type. Allowed: ${[...VALID_WEBHOOK_EVENTS].join(', ')}` },
        { status: 422 }
      )
    }
    normalizedEvents = events as string[]
  }

  // Generate HMAC secret — shown once, never returned again
  const secret = crypto.randomBytes(32).toString('hex')

  try {
    const sql = getDb()
    const rows = (await sql`
      INSERT INTO webhooks (user_id, url, secret, events)
      VALUES (${user.id}, ${url}, ${secret}, ${normalizedEvents})
      RETURNING id, url, events, enabled, failure_count, last_triggered_at, created_at
    `) as WebhookRow[]

    const created = rows[0]
    return NextResponse.json(
      {
        ...created,
        // Return the secret once — the user must save it immediately
        secret,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[webhooks] POST error:', err)
    return NextResponse.json({ error: 'Failed to create webhook.' }, { status: 500 })
  }
}
