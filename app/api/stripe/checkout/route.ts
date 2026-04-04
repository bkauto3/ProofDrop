import { NextRequest, NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'
import { z } from 'zod'

const PRICE_ENV_KEYS = [
  'STRIPE_STARTER_MONTHLY_PRICE_ID',
  'STRIPE_STARTER_ANNUAL_PRICE_ID',
  'STRIPE_PRO_MONTHLY_PRICE_ID',
  'STRIPE_PRO_ANNUAL_PRICE_ID',
]

function getPriceId(name: string): string | undefined {
  // Check non-public first (server-side only, more secure), fall back to public
  return process.env[name] ?? process.env[`NEXT_PUBLIC_${name}`]
}

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

export async function POST(req: NextRequest) {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

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

  const allowedPriceIds = getAllowedPriceIds()
  if (allowedPriceIds.size === 0) {
    console.error('[stripe/checkout] No allowed price IDs configured')
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

    // Get or create Stripe customer
    const userRows = (await sql`
      SELECT id, stripe_customer_id FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    const user = userRows[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    let customerId = user.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await sql`
        UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${user.id}
      `
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('[stripe/checkout] error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
