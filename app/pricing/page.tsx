'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingTier {
  name: string
  monthlyPrice: string
  annualPrice: string
  description: string
  features: string[]
  highlighted: boolean
  cta: string
  monthlyPriceId?: string
  annualPriceId?: string
  isCustom?: boolean
}

const TIERS: PricingTier[] = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    description: 'For individuals exploring ProofDrop.',
    features: [
      '25 verifications / month',
      'Public receipts',
      '30-day receipt history',
      'Verifier widget',
    ],
    highlighted: false,
    cta: 'Get started free',
  },
  {
    name: 'Starter',
    monthlyPrice: '$12',
    annualPrice: '$119',
    description: 'For freelancers and small teams.',
    features: [
      '100 verifications / month',
      'Permanent receipt history',
      'JSON export',
      'Dashboard',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Start Starter',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID,
  },
  {
    name: 'Pro',
    monthlyPrice: '$29',
    annualPrice: '$289',
    description: 'For agencies and production workflows.',
    features: [
      'Unlimited verifications',
      'API access',
      'Bulk export',
      'Permanent history',
      'Priority support',
      'Custom webhook',
    ],
    highlighted: false,
    cta: 'Start Pro',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    annualPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    description: 'For large organisations with custom needs.',
    features: [
      'Everything in Pro',
      'SLA guarantee',
      'Custom integration',
      'Dedicated support',
      'Audit compliance reports',
      'On-premise option',
    ],
    highlighted: false,
    cta: 'Contact us',
    isCustom: true,
  },
]

function PricingPageInner() {
  const searchParams = useSearchParams()
  const [billing, setBilling] = React.useState<'monthly' | 'annual'>('monthly')
  const [loadingTier, setLoadingTier] = React.useState<string | null>(null)
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null)

  // After sign-in redirect back to /pricing?autoCheckout=price_xxx, fire checkout immediately.
  React.useEffect(() => {
    const autoCheckoutPriceId = searchParams.get('autoCheckout')
    if (!autoCheckoutPriceId) return

    // Remove the param from the URL so a refresh doesn't re-trigger
    const url = new URL(window.location.href)
    url.searchParams.delete('autoCheckout')
    window.history.replaceState(null, '', url.toString())

    void (async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId: autoCheckoutPriceId }),
        })
        if (res.status === 401) {
          // Still not authenticated — show sign-in again
          window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/pricing?autoCheckout=${encodeURIComponent(autoCheckoutPriceId)}`)}`
          return
        }
        const data = await res.json() as { url?: string; error?: string }
        if (data.url) {
          window.location.href = data.url
        } else {
          setCheckoutError(data.error ?? 'Could not start checkout — please click your plan below.')
        }
      } catch {
        setCheckoutError('Network error — please click your plan below to try again.')
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStartPlan = async (tier: PricingTier) => {
    setCheckoutError(null)

    if (tier.isCustom) {
      window.location.href = 'mailto:hello@proofdrop.pro?subject=Enterprise%20Inquiry'
      return
    }
    if (!tier.monthlyPriceId && !tier.annualPriceId) {
      // Free tier — just sign in
      window.location.href = '/auth/signin'
      return
    }

    const priceId = billing === 'annual' ? tier.annualPriceId : tier.monthlyPriceId
    if (!priceId) {
      setCheckoutError('Plan configuration error — please refresh and try again.')
      return
    }

    setLoadingTier(tier.name)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (res.status === 401) {
        // Encode priceId in the callbackUrl so the pricing page can auto-launch
        // checkout after the user completes sign-in.
        const callbackUrl = `/pricing?autoCheckout=${encodeURIComponent(priceId)}`
        window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
        return
      }

      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError(data.error ?? 'Could not start checkout — please try again.')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError('Network error — please check your connection and try again.')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <>
      <SiteNav />
      <main role="main">
        {checkoutError && (
          <div role="alert" className="container mx-auto px-4 pt-6 max-w-6xl">
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {checkoutError}
            </div>
          </div>
        )}
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Start free. Scale when you need to.
            </p>

            <Tabs
              value={billing}
              onValueChange={(v) => setBilling(v as 'monthly' | 'annual')}
              className="inline-flex"
            >
              <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="annual">
                  Annual
                  <span className="ml-1.5 text-xs bg-success/20 text-success px-1.5 py-0.5 rounded-full font-medium">
                    Save 17%
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((tier) => {
              const price = billing === 'annual' ? tier.annualPrice : tier.monthlyPrice
              const period = billing === 'annual' ? '/yr' : '/mo'
              const isHighlighted = tier.highlighted

              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative flex flex-col rounded-xl border p-6',
                    isHighlighted
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-card'
                  )}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        <Zap size={10} aria-hidden="true" />
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">{tier.name}</h2>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">{price}</span>
                      {price !== 'Custom' && (
                        <span className="text-sm text-muted-foreground">{period}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  <ul className="flex-1 space-y-2 mb-6" role="list">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2
                          size={14}
                          className="text-success mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleStartPlan(tier)}
                    disabled={loadingTier === tier.name}
                    variant={isHighlighted ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {loadingTier === tier.name ? 'Loading...' : tier.cta}
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground">
              All plans include SSL, 99.9% uptime SLA, and GDPR-compliant data handling.{' '}
              <a href="/about" className="text-primary hover:underline">
                Learn more
              </a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

// useSearchParams requires a Suspense boundary in Next.js App Router.
// Suspense is imported from react at the top of the file.
export default function PricingPage() {
  return (
    <Suspense>
      <PricingPageInner />
    </Suspense>
  )
}
