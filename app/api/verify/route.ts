import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { computeReceiptId, computeBundleHash } from '@/lib/receipt-id'
import { getOptionalSession } from '@/lib/auth-helpers'
import { verifyAIVSBundle } from '@protocol-factory/protocol-verifier'
import type { AIVSBundle } from '@protocol-factory/protocol-verifier'
import { dispatchWebhookEvent } from '@/lib/webhook-dispatcher'

// In-memory rate limiting store: key -> { count, resetAt }
// Used only for anonymous requests. Authenticated requests use DB-backed monthly quotas.
// WARNING: per-process — resets on serverless cold starts. Acceptable for anon abuse prevention.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  // Use the LEFTMOST IP ([0]) — it is the original client address set by the
  // upstream load balancer and cannot be spoofed by the client. Using .at(-1)
  // (rightmost) would let an attacker inject an arbitrary IP via the header.
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return `anon:${ip}`
}

// Maximum number of keys to keep in the in-memory rate-limit store.
// Prevents unbounded memory growth when serverless instances handle many unique IPs.
const RATE_LIMIT_MAX_SIZE = 1000

function checkAnonRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || entry.resetAt < now) {
    // Evict oldest entry when at capacity to keep memory bounded
    if (!entry && rateLimitStore.size >= RATE_LIMIT_MAX_SIZE) {
      const oldestKey = rateLimitStore.keys().next().value
      if (oldestKey !== undefined) rateLimitStore.delete(oldestKey)
    }
    rateLimitStore.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

// Monthly verification limits per subscription tier.
const MONTHLY_LIMITS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: Infinity, // unlimited
  enterprise: Infinity,
}

interface QuotaUser {
  id: string
  subscription_tier: string
  monthly_verifications: number
  verification_month: string
}

/**
 * Checks and atomically increments the monthly verification counter for an
 * authenticated user. Returns an error string if the quota is exceeded,
 * a 'service_unavailable' sentinel if the DB is unreachable, or null if
 * the request is allowed.
 *
 * The check and increment are collapsed into a single atomic SQL statement to
 * eliminate the TOCTOU race condition present in a separate read-then-write
 * pattern. The month-reset logic is handled inside the CASE expression so
 * no separate reset UPDATE is needed.
 */
async function checkAndIncrementQuota(
  email: string
): Promise<string | null | 'service_unavailable'> {
  const sql = getDb()
  const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

  // First resolve the user to get id and subscription_tier.
  let user: QuotaUser | undefined
  try {
    const rows = (await sql`
      SELECT id, subscription_tier, monthly_verifications, verification_month
      FROM users WHERE email = ${email} LIMIT 1
    `) as QuotaUser[]
    user = rows[0]
  } catch (err) {
    console.error('[verify] quota check error (user lookup):', err)
    return 'service_unavailable'
  }

  if (!user) return 'User not found.'

  const limit = MONTHLY_LIMITS[user.subscription_tier] ?? MONTHLY_LIMITS.free

  if (limit === Infinity) {
    // Unlimited tier — still bump the counter for analytics but never block.
    try {
      await sql`
        UPDATE users
        SET monthly_verifications = CASE
            WHEN verification_month = ${currentMonth} THEN monthly_verifications + 1
            ELSE 1
          END,
          verification_month = ${currentMonth}
        WHERE id = ${user.id}
      `
    } catch (err) {
      console.error('[verify] quota increment error (unlimited tier):', err)
      // Fail closed: if we can't record usage we shouldn't proceed.
      return 'service_unavailable'
    }
    return null
  }

  // Atomically check + increment in one statement.
  // The WHERE clause enforces the quota: the UPDATE only proceeds when
  // (a) we are still in the same month AND usage is below the limit, OR
  // (b) the month has rolled over (treating it as 0 used + this one).
  // If no row is returned the user has exceeded their quota.
  try {
    const updated = (await sql`
      UPDATE users
      SET monthly_verifications = CASE
          WHEN verification_month = ${currentMonth} THEN monthly_verifications + 1
          ELSE 1
        END,
        verification_month = ${currentMonth}
      WHERE id = ${user.id}
        AND (
          verification_month != ${currentMonth}
          OR monthly_verifications < ${limit}
        )
      RETURNING id, monthly_verifications, subscription_tier
    `) as { id: string; monthly_verifications: number; subscription_tier: string }[]

    if (!updated[0]) {
      // No row updated — quota exceeded for the current month.
      return `Monthly verification limit reached (${limit} for ${user.subscription_tier} plan). Upgrade your plan or wait until next month.`
    }

    return null
  } catch (err) {
    console.error('[verify] quota check error (atomic update):', err)
    // Fail closed: surface a 503 rather than letting requests through
    // when the database is unavailable.
    return 'service_unavailable'
  }
}

export async function POST(req: NextRequest) {
  // Determine auth status
  const session = await getOptionalSession()
  const isAuthed = Boolean(session?.user?.email)

  if (!isAuthed) {
    // Anonymous: IP-based per-minute rate limit (10/min)
    const rlKey = getRateLimitKey(req)
    if (!checkAnonRateLimit(rlKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Sign in for higher limits.' },
        { status: 429 }
      )
    }
  } else {
    // Authenticated: DB-backed monthly quota per tier
    const quotaResult = await checkAndIncrementQuota(session!.user!.email!)
    if (quotaResult === 'service_unavailable') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      )
    }
    if (quotaResult) {
      return NextResponse.json({ error: quotaResult }, { status: 429 })
    }
  }

  // Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 })
  }

  // Serialize the bundle deterministically for hashing
  const bundleStr = JSON.stringify(body)

  // Enforce a 256 KB limit on the serialized bundle to prevent DoS via storage
  // exhaustion. Check after serialization so the limit applies to the stored form.
  const MAX_BUNDLE_BYTES = 262144 // 256 KB
  if (bundleStr.length > MAX_BUNDLE_BYTES) {
    return NextResponse.json(
      { error: `Request body must not exceed ${MAX_BUNDLE_BYTES / 1024} KB.` },
      { status: 413 }
    )
  }
  const receiptId = computeReceiptId(bundleStr)
  const bundleHash = computeBundleHash(bundleStr)

  const sql = getDb()

  // Check idempotency — has this bundle been verified before?
  try {
    const existing = (await sql`
      SELECT id, status FROM receipts WHERE bundle_hash = ${bundleHash} LIMIT 1
    `) as { id: string; status: string }[]

    if (existing[0]) {
      const baseUrl = process.env.NEXTAUTH_URL ?? 'https://proofdrop.pro'
      return NextResponse.json({
        receiptId: existing[0].id,
        status: existing[0].status,
        bundleHash,
        receiptUrl: `${baseUrl}/receipt/${existing[0].id}`,
        cached: true,
      })
    }
  } catch (err) {
    console.error('[verify] DB lookup error:', err)
    return NextResponse.json({ error: 'Database error during lookup.' }, { status: 500 })
  }

  // Run verification
  let verificationResult: Awaited<ReturnType<typeof verifyAIVSBundle>>
  try {
    verificationResult = await verifyAIVSBundle(body as AIVSBundle)
  } catch (err) {
    console.error('[verify] verifyAIVSBundle error:', err)
    // Store as ERROR receipt
    const userId = isAuthed ? await getUserId(session!.user!.email!) : null
    try {
      await storeReceipt(sql, {
        receiptId,
        bundleHash,
        bundleStr,
        status: 'ERROR',
        failureReasons: [],
        verifiedAt: new Date().toISOString(),
        userId,
      })
    } catch (dbErr) {
      console.error('[verify] DB store error:', dbErr)
    }
    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://proofdrop.pro'
    return NextResponse.json({
      receiptId,
      status: 'ERROR',
      bundleHash,
      receiptUrl: `${baseUrl}/receipt/${receiptId}`,
      error: 'Verification engine encountered an error.',
    })
  }

  const status = verificationResult.verified ? 'PASS' : 'FAIL'
  const userId = isAuthed ? await getUserId(session!.user!.email!) : null

  try {
    await storeReceipt(sql, {
      receiptId,
      bundleHash,
      bundleStr,
      status,
      failureReasons: verificationResult.failureReasons,
      verifiedAt: verificationResult.verifiedAt,
      userId,
    })
  } catch (err) {
    console.error('[verify] DB store error:', err)
    return NextResponse.json({ error: 'Failed to store verification result.' }, { status: 500 })
  }

  // Fire-and-forget webhook fanout for authenticated users only.
  // Must not block or affect the response — wrap in try/catch to suppress errors.
  if (userId) {
    try {
      void dispatchWebhookEvent(userId, 'verification.created', {
        receipt_id: receiptId,
        content_hash: bundleHash,
        status,
        created_at: new Date().toISOString(),
      })
    } catch {
      // Intentionally ignored — fanout must never affect the caller's response
    }
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://proofdrop.pro'
  return NextResponse.json({
    receiptId,
    status,
    bundleHash,
    receiptUrl: `${baseUrl}/receipt/${receiptId}`,
    ...(status === 'FAIL' && { failureReasons: verificationResult.failureReasons }),
  })
}

async function getUserId(email: string): Promise<string | null> {
  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `) as { id: string }[]
    return rows[0]?.id ?? null
  } catch {
    return null
  }
}

interface StoreReceiptParams {
  receiptId: string
  bundleHash: string
  bundleStr: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  failureReasons: string[]
  verifiedAt: string
  userId: string | null
}

async function storeReceipt(
  sql: ReturnType<typeof getDb>,
  params: StoreReceiptParams
): Promise<void> {
  const { receiptId, bundleHash, bundleStr, status, failureReasons, verifiedAt, userId } = params
  const sizeBytes = Buffer.byteLength(bundleStr, 'utf8')

  // Insert proof_bundle
  await sql`
    INSERT INTO proof_bundles (bundle_hash, raw_content, size_bytes, user_id)
    VALUES (${bundleHash}, ${bundleStr}::jsonb, ${sizeBytes}, ${userId})
    ON CONFLICT (bundle_hash) DO NOTHING
  `

  // Insert verification_result
  await sql`
    INSERT INTO verification_results (bundle_hash, status, failure_reasons, verified_at, verifier_version)
    VALUES (${bundleHash}, ${status}, ${failureReasons}, ${verifiedAt}, ${'1.0.0'})
  `

  // Build summary JSONB
  const summary = {
    verified: status === 'PASS',
    failureReasons,
    verifiedAt,
  }

  const timestamps = {
    verifiedAt,
    createdAt: new Date().toISOString(),
  }

  // Insert receipt.
  // ON CONFLICT DO UPDATE SET updated_at = NOW() ensures we get a RETURNING row
  // even when the bundle was already stored (concurrent request). We use the
  // returned user_id to verify ownership for idempotency responses.
  await sql`
    INSERT INTO receipts (id, bundle_hash, status, summary, parties, timestamps, verifier_version, user_id)
    VALUES (
      ${receiptId},
      ${bundleHash},
      ${status},
      ${JSON.stringify(summary)}::jsonb,
      ${JSON.stringify({})}::jsonb,
      ${JSON.stringify(timestamps)}::jsonb,
      ${'1.0.0'},
      ${userId}
    )
    ON CONFLICT (bundle_hash) DO UPDATE SET updated_at = NOW()
  `
}
