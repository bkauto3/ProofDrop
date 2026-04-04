import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'
import { z } from 'zod'

// Canonical price ID list. Server-side env vars (no NEXT_PUBLIC_ prefix) are
// preferred — they never get embedded in client bundles. NEXT_PUBLIC_ variants
// are accepted as a fallback so that environments that only set the public form
// still work correctly.
const PRICE_ENV_KEYS = [
  'STRIPE_STARTER_MONTHLY_PRICE_ID',
  'STRIPE_STARTER_ANNUAL_PRICE_ID',
  'STRIPE_PRO_MONTHLY_PRICE_ID',
  'STRIPE_PRO_ANNUAL_PRICE_ID',
]

function getAllowedPriceIds(): Set<string> {
  const ids = PRICE_ENV_KEYS.flatMap(k => [
    process.env[k],
    process.env[`NEXT_PUBLIC_${k}`],
  ]).filter((id): id is string => typeof id === 'string' && id.length > 0)
  return new Set(ids)
}

const bodySchema = z.object({
  priceId: z.string().min(1),
})

interface UserRow {
  id: string
  stripe_customer_id: string | null
}

// Max checkout session initiations per user per sliding 1-hour window.
// The checkout idempotency key already deduplicates same-plan attempts,
// so this limit only triggers if a user rapidly cycles through all plans
// or a session is compromised. Stripe's own rate limit (100 req/s) is the
// downstream backstop; this guard protects our DB and Stripe dashboard.
const CHECKOUT_RATE_LIMIT = 10

export async function POST(req: NextRequest) {
  // ── Auth gate ─────────────────────────────────────────────────────────────
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  // ── Input validation ──────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'priceId is required.' }, { status: 400 })
  }

  const { priceId } = parsed.data

  // ── Price ID allowlist ────────────────────────────────────────────────────
  // Validates the submitted price against server-configured values so an
  // attacker cannot substitute an arbitrary Stripe price.
  const allowedPriceIds = getAllowedPriceIds()
  if (allowedPriceIds.size === 0) {
    console.error('[stripe/checkout] No allowed price IDs configured — set STRIPE_*_PRICE_ID env vars')
    return NextResponse.json({ error: 'Pricing configuration error.' }, { status: 500 })
  }
  if (!allowedPriceIds.has(priceId)) {
    return NextResponse.json({ error: 'Invalid price ID.' }, { status: 400 })
  }

  const email = session.user!.email!
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://proofdrop.pro'

  try {
    const stripe = getStripe()
    const sql = getDb()

    // ── Get or create Stripe customer ─────────────────────────────────────
    const userRows = (await sql`
      SELECT id, stripe_customer_id FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // ── Rate limiting ─────────────────────────────────────────────────────
    // Count checkout session creations for this user in the last hour.
    // Uses processed_stripe_events as a lightweight audit log — no new table needed.
    // We track checkout initiations separately via a naming convention.
    const recentRows = (await sql`
      SELECT COUNT(*) AS cnt
      FROM processed_stripe_events
      WHERE stripe_event_id LIKE ${'checkout-init-' + user.id + '-%'}
        AND processed_at > NOW() - INTERVAL '1 hour'
    `) as { cnt: string }[]

    const recentCount = parseInt(recentRows[0]?.cnt ?? '0', 10)
    if (recentCount >= CHECKOUT_RATE_LIMIT) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please try again later.' },
        { status: 429 },
      )
    }

    // Record this initiation attempt (non-blocking — use ON CONFLICT to handle
    // the tiny race window where two concurrent requests pass the check above).
    const initiationKey = `checkout-init-${user.id}-${Date.now()}`
    await sql`
      INSERT INTO processed_stripe_events (stripe_event_id, event_type)
      VALUES (${initiationKey}, 'checkout.initiation')
      ON CONFLICT (stripe_event_id) DO NOTHING
    `

    let customerId = user.stripe_customer_id

    if (!customerId) {
      // Idempotency key prevents duplicate customers if the request is retried
      // before the DB write completes (e.g. network timeout after create).
      const customer = await stripe.customers.create(
        { email, metadata: { userId: user.id } },
        { idempotencyKey: `customer-create-${user.id}` },
      )
      customerId = customer.id
      await sql`
        UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}
      `
    }

    // ── Create checkout session ───────────────────────────────────────────
    // Idempotency key: scoped to user + price so that double-clicks or
    // network retries return the same open session rather than creating
    // duplicates. The key naturally expires after 24 h (Stripe's idempotency
    // window), which aligns with the session's own 24-hour lifetime.
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        customer: customerId,
        mode: 'subscription',
        // Omitting payment_method_types lets Stripe Checkout automatically
        // show all payment methods enabled on the account (cards, Link, Apple
        // Pay, Google Pay, etc.) rather than limiting to card-only.
        // payment_method_configuration can be used for fine-grained control
        // if needed in the future without touching code.
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard?checkout=success`,
        cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
        allow_promotion_codes: true,
      },
      { idempotencyKey: `checkout-session-${user.id}-${priceId}` },
    )

    if (!checkoutSession.url) {
      console.error('[stripe/checkout] session created but url is null:', checkoutSession.id)
      return NextResponse.json({ error: 'Checkout session missing redirect URL.' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    // Log the full error server-side; return a generic message to the client
    // so internal details (customer IDs, etc.) are never exposed.
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
