import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { isBlockedWebhookUrl } from '@/lib/ssrf-guard'

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

interface RouteParams {
  params: Promise<{ id: string }>
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

/**
 * Resolves webhook by id and verifies ownership.
 * Returns the webhook row or null if not found / not owned by user.
 */
async function getOwnedWebhook(
  webhookId: string,
  userId: string
): Promise<WebhookRow | null> {
  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, url, events, enabled, failure_count, last_triggered_at, created_at
      FROM webhooks
      WHERE id = ${webhookId} AND user_id = ${userId}
      LIMIT 1
    `) as WebhookRow[]
    return rows[0] ?? null
  } catch {
    return null
  }
}

// GET /api/webhooks/[id] — fetch a single webhook (no secret returned)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const user = await getAuthedUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const webhook = await getOwnedWebhook(id, user.id)
  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found.' }, { status: 404 })
  }

  return NextResponse.json(webhook)
}

// PATCH /api/webhooks/[id] — update url, events, and/or enabled (Pro tier required)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params

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

  const webhook = await getOwnedWebhook(id, user.id)
  if (!webhook) {
    return NextResponse.json({ error: 'Webhook not found.' }, { status: 404 })
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

  const patch = body as { url?: unknown; events?: unknown; enabled?: unknown }

  // Validate url if provided — must be a public HTTPS endpoint (SSRF guard)
  if (patch.url !== undefined) {
    if (typeof patch.url !== 'string') {
      return NextResponse.json({ error: '`url` must be a string.' }, { status: 400 })
    }
    if (isBlockedWebhookUrl(patch.url)) {
      return NextResponse.json(
        { error: 'Webhook URL must be a public HTTPS endpoint.' },
        { status: 422 }
      )
    }
  }

  // Validate events if provided — must be from the known allowlist
  if (patch.events !== undefined) {
    if (
      !Array.isArray(patch.events) ||
      !patch.events.every((e) => typeof e === 'string')
    ) {
      return NextResponse.json({ error: '`events` must be an array of strings.' }, { status: 400 })
    }
    if ((patch.events as string[]).length === 0) {
      return NextResponse.json(
        { error: '`events` must contain at least one event.' },
        { status: 400 }
      )
    }
    if (!validateEvents(patch.events as unknown[])) {
      return NextResponse.json(
        { error: `Invalid event type. Allowed: ${[...VALID_WEBHOOK_EVENTS].join(', ')}` },
        { status: 422 }
      )
    }
  }

  // Validate enabled if provided
  if (patch.enabled !== undefined && typeof patch.enabled !== 'boolean') {
    return NextResponse.json({ error: '`enabled` must be a boolean.' }, { status: 400 })
  }

  // At least one field must be present
  if (patch.url === undefined && patch.events === undefined && patch.enabled === undefined) {
    return NextResponse.json(
      { error: 'At least one of `url`, `events`, or `enabled` must be provided.' },
      { status: 400 }
    )
  }

  // Apply updates using current values as fallback
  const newUrl = typeof patch.url === 'string' ? patch.url : webhook.url
  const newEvents = Array.isArray(patch.events) ? (patch.events as string[]) : webhook.events
  const newEnabled = typeof patch.enabled === 'boolean' ? patch.enabled : webhook.enabled

  try {
    const sql = getDb()
    const rows = (await sql`
      UPDATE webhooks
      SET
        url     = ${newUrl},
        events  = ${newEvents},
        enabled = ${newEnabled}
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id, url, events, enabled, failure_count, last_triggered_at, created_at
    `) as WebhookRow[]

    if (!rows[0]) {
      return NextResponse.json({ error: 'Webhook not found.' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (err) {
    console.error('[webhooks/id] PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update webhook.' }, { status: 500 })
  }
}

// DELETE /api/webhooks/[id] — permanently deletes the webhook (Pro tier required)
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

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

  try {
    const sql = getDb()
    const rows = (await sql`
      DELETE FROM webhooks
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING id
    `) as { id: string }[]

    if (!rows[0]) {
      return NextResponse.json({ error: 'Webhook not found.' }, { status: 404 })
    }

    return NextResponse.json({ deleted: true, id: rows[0].id })
  } catch (err) {
    console.error('[webhooks/id] DELETE error:', err)
    return NextResponse.json({ error: 'Failed to delete webhook.' }, { status: 500 })
  }
}
