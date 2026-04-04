import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  // ── Signature verification ────────────────────────────────────────────────
  // Must happen before any DB access. Uses req.text() (raw body string) which
  // Next.js App Router preserves byte-for-byte — no body parser interference.
  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
  }

  const sql = getDb()

  // ── Idempotency guard ─────────────────────────────────────────────────────
  // Stripe guarantees at-least-once delivery. Record the event ID before
  // processing; if it already exists the INSERT fails and we ack without
  // re-processing. This prevents duplicate subscription tier updates on
  // replayed deliveries.
  try {
    await sql`
      INSERT INTO processed_stripe_events (stripe_event_id, event_type)
      VALUES (${event.id}, ${event.type})
    `
  } catch {
    // INSERT failed due to PRIMARY KEY conflict — event already processed.
    // Return 200 so Stripe stops retrying.
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        if (checkoutSession.mode !== 'subscription') break

        const customerId = checkoutSession.customer as string
        const subscriptionId = checkoutSession.subscription as string

        if (!customerId || !subscriptionId) break

        // Fetch the full subscription to get price details
        const stripe = getStripe()
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id ?? ''

        // Resolve current tier so unknown priceIds don't silently demote users
        const userRows = (await sql`
          SELECT id, subscription_tier FROM users WHERE stripe_customer_id = ${customerId} LIMIT 1
        `) as { id: string; subscription_tier: string }[]
        const existingTier = userRows[0]?.subscription_tier
        const tier = resolveTier(priceId, existingTier)

        const subObj = subscription as unknown as { current_period_end: number }
        const currentPeriodEnd = new Date(subObj.current_period_end * 1000).toISOString()

        // Update user record
        await sql`
          UPDATE users
          SET subscription_tier = ${tier}, stripe_subscription_id = ${subscriptionId}
          WHERE stripe_customer_id = ${customerId}
        `

        if (userRows[0]) {
          await sql`
            INSERT INTO subscriptions (user_id, stripe_subscription_id, stripe_price_id, tier, status, current_period_end)
            VALUES (${userRows[0].id}, ${subscriptionId}, ${priceId}, ${tier}, 'active', ${currentPeriodEnd})
            ON CONFLICT (stripe_subscription_id) DO UPDATE
              SET stripe_price_id = EXCLUDED.stripe_price_id,
                  tier = EXCLUDED.tier,
                  status = EXCLUDED.status,
                  current_period_end = EXCLUDED.current_period_end,
                  updated_at = NOW()
          `
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id ?? ''
        // Fetch current tier so an unrecognized priceId preserves the user's
        // existing tier rather than silently demoting them to 'free'.
        const currentUserRows = (await sql`
          SELECT subscription_tier FROM users WHERE stripe_customer_id = ${customerId} LIMIT 1
        `) as { subscription_tier: string }[]
        const currentTier = currentUserRows[0]?.subscription_tier
        const tier = resolveTier(priceId, currentTier)
        const subStatus = subscription.status === 'active' ? 'active' : 'inactive'

        const subObj = subscription as unknown as { current_period_end: number }
        const currentPeriodEnd = new Date(subObj.current_period_end * 1000).toISOString()

        await sql`
          UPDATE users
          SET subscription_tier = ${tier}
          WHERE stripe_customer_id = ${customerId}
        `

        await sql`
          UPDATE subscriptions
          SET tier = ${tier}, status = ${subStatus}, current_period_end = ${currentPeriodEnd},
              stripe_price_id = ${priceId}, updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
        `
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        await sql`
          UPDATE users
          SET subscription_tier = 'free'
          WHERE stripe_customer_id = ${customerId}
        `

        await sql`
          UPDATE subscriptions
          SET tier = 'free', status = 'cancelled', updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
        `
        break
      }

      default:
        // Unhandled event type — acknowledge without processing
        break
    }
  } catch (err) {
    console.error(`[webhook] Error processing event ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler error.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function getWebhookPriceId(name: string): string | undefined {
  // Check non-public first (server-side only, more secure), fall back to public
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`]
}

/**
 * Resolves a Stripe price ID to an internal subscription tier.
 * If the priceId is unrecognized, returns the caller-supplied currentTier
 * unchanged (no silent demotion). Logs an error so ops can investigate
 * the unexpected price ID.
 */
function resolveTier(priceId: string, currentTier?: string): string {
  const starterMonthly = getWebhookPriceId('STRIPE_STARTER_MONTHLY_PRICE_ID')
  const starterAnnual = getWebhookPriceId('STRIPE_STARTER_ANNUAL_PRICE_ID')
  const proMonthly = getWebhookPriceId('STRIPE_PRO_MONTHLY_PRICE_ID')
  const proAnnual = getWebhookPriceId('STRIPE_PRO_ANNUAL_PRICE_ID')

  if (priceId === starterMonthly || priceId === starterAnnual) return 'starter'
  if (priceId === proMonthly || priceId === proAnnual) return 'pro'

  // Unknown price ID — do NOT silently demote the user to 'free'.
  // Return their current tier so the UPDATE is a no-op, and alert ops.
  console.error('[stripe-webhook] unrecognized priceId:', priceId)
  return currentTier ?? 'free'
}
