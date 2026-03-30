import crypto from 'crypto'
import { getDb } from './db'
import { isBlockedWebhookUrl } from './ssrf-guard'

export interface WebhookPayload {
  id: string           // unique delivery ID
  event: string        // e.g. "verification.created"
  created_at: string   // ISO timestamp
  data: Record<string, unknown>
}

interface WebhookRow {
  id: string
  url: string
  secret: string
  events: string[]
  enabled: boolean
  failure_count: number
}

/**
 * Attempts a single HTTP delivery of a webhook payload to the given endpoint.
 * Retries once after 1 second on network error (not on 4xx responses).
 * Updates failure_count / last_failure_at / last_failure_reason on failure.
 * Resets failure_count and updates last_triggered_at on success.
 * Auto-disables the endpoint when failure_count reaches 5.
 */
async function deliverWebhook(webhook: WebhookRow, payload: WebhookPayload): Promise<void> {
  // Second line of SSRF defence: re-validate the stored URL at delivery time in
  // case a URL was persisted before the guard was deployed, or a DB value was
  // tampered with directly.
  if (isBlockedWebhookUrl(webhook.url)) {
    console.error('[webhook-dispatcher] blocked SSRF attempt for webhook', webhook.id, webhook.url)
    return
  }

  const sql = getDb()
  const body = JSON.stringify(payload)

  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex')

  async function attempt(): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5_000)
    try {
      const res = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ProofDrop-Signature': `sha256=${signature}`,
          'X-ProofDrop-Event': payload.event,
          'X-ProofDrop-Delivery': payload.id,
        },
        body,
        signal: controller.signal,
      })
      return res
    } finally {
      clearTimeout(timer)
    }
  }

  let res: Response
  let networkError: unknown = null

  try {
    res = await attempt()
  } catch (err) {
    networkError = err
    // One retry after 1 second on network / timeout error
    await new Promise((resolve) => setTimeout(resolve, 1_000))
    try {
      res = await attempt()
      networkError = null
    } catch (retryErr) {
      networkError = retryErr
    }
  }

  if (networkError) {
    // Both attempts failed — record failure
    const reason =
      networkError instanceof Error ? networkError.message : String(networkError)
    const newCount = webhook.failure_count + 1
    const shouldDisable = newCount >= 5

    try {
      await sql`
        UPDATE webhooks
        SET
          failure_count         = ${newCount},
          last_failure_at       = NOW(),
          last_failure_reason   = ${reason},
          enabled               = ${shouldDisable ? false : webhook.enabled}
        WHERE id = ${webhook.id}
      `
    } catch (dbErr) {
      console.error('[webhook-dispatcher] DB update (failure) error:', dbErr)
    }
    return
  }

  // res is guaranteed assigned here — network errors are handled above
  const httpRes = res!

  if (!httpRes.ok) {
    // 4xx / 5xx — record failure, no retry
    const reason = `HTTP ${httpRes.status} ${httpRes.statusText}`
    const newCount = webhook.failure_count + 1
    const shouldDisable = newCount >= 5

    try {
      await sql`
        UPDATE webhooks
        SET
          failure_count         = ${newCount},
          last_failure_at       = NOW(),
          last_failure_reason   = ${reason},
          enabled               = ${shouldDisable ? false : webhook.enabled}
        WHERE id = ${webhook.id}
      `
    } catch (dbErr) {
      console.error('[webhook-dispatcher] DB update (http error) error:', dbErr)
    }
    return
  }

  // Success
  try {
    await sql`
      UPDATE webhooks
      SET
        failure_count       = 0,
        last_triggered_at   = NOW()
      WHERE id = ${webhook.id}
    `
  } catch (dbErr) {
    console.error('[webhook-dispatcher] DB update (success) error:', dbErr)
  }
}

/**
 * Called after a verification succeeds. Fans out to all user's enabled
 * webhooks that subscribe to the given event. Fire-and-forget — does not
 * block the calling response. Handles retries and failure tracking internally.
 */
export async function dispatchWebhookEvent(
  userId: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  let webhooks: WebhookRow[]

  try {
    const sql = getDb()
    webhooks = (await sql`
      SELECT id, url, secret, events, enabled, failure_count
      FROM webhooks
      WHERE user_id = ${userId}
        AND enabled = true
        AND events @> ARRAY[${event}]::text[]
    `) as WebhookRow[]
  } catch (err) {
    console.error('[webhook-dispatcher] DB query error:', err)
    return
  }

  if (!webhooks.length) return

  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    event,
    created_at: new Date().toISOString(),
    data,
  }

  // Fire-and-forget: do not await individual deliveries so the caller is not blocked.
  // Promise.allSettled ensures all are initiated without throwing.
  void Promise.allSettled(webhooks.map((wh) => deliverWebhook(wh, payload)))
}
