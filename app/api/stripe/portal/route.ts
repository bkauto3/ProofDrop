import { NextResponse } from 'next/server'
import { requireSession } from '@/lib/auth-helpers'
import { getStripe } from '@/lib/stripe'
import { getDb } from '@/lib/db'

interface UserRow {
  stripe_customer_id: string | null
}

export async function POST() {
  const session = await requireSession()
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const email = session.user!.email!
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://proofdrop.pro'

  try {
    const sql = getDb()
    const userRows = (await sql`
      SELECT stripe_customer_id FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]

    const customerId = userRows[0]?.stripe_customer_id

    if (!customerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    // Idempotency key is bucketed to the current hour so that:
    // (a) Retries within the same minute reuse the same session (no duplicates)
    // (b) A user can get a fresh portal session after the previous one expires
    //     (~5-10 min) without hitting a stale 24h-idempotency window.
    const hourBucket = Math.floor(Date.now() / 1000 / 3600)
    const portalSession = await stripe.billingPortal.sessions.create(
      { customer: customerId, return_url: `${baseUrl}/dashboard` },
      { idempotencyKey: `portal-session-${customerId}-${hourBucket}` },
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('[stripe/portal] error:', err)
    return NextResponse.json({ error: 'Failed to create billing portal session.' }, { status: 500 })
  }
}
