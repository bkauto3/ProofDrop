import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    // apiVersion must match the stripe SDK major version.
    // stripe@17.x ships with 2025-02-24.acacia as its default.
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  }
  return _stripe
}
