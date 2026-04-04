import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import { VerifierWidget } from '@/components/verifier/verifier-widget'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, Clock, Link2, FileCheck, ArrowRight, CheckCircle2, Download } from 'lucide-react'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ProofDrop — AIVS Proof Bundle Verification',
  description:
    'Turn any AIVS proof bundle into a client-ready receipt in seconds. Permanent, tamper-evident receipts you can share with clients.',
}

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main role="main">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-20 pb-12 max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-medium mb-6">
            <Shield size={12} aria-hidden="true" />
            AIVS Verification Standard
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Turn any AIVS proof bundle into a{' '}
            <span className="text-primary">client-ready receipt</span>{' '}
            in seconds
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            ProofDrop verifies AIVS bundles and generates permanent, tamper-evident receipt URLs
            you can share with clients, attach to invoices, and use in compliance documents.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/api/auth/signin">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://github.com/swarmsync-ai/Conduit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Download size={16} aria-hidden="true" />
                Download Conduit
              </a>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Conduit generates AIVS bundles. ProofDrop verifies them.
          </p>
        </section>

        {/* Verifier Widget */}
        <section
          className="container mx-auto px-4 pb-20 max-w-2xl"
          aria-labelledby="verifier-heading"
        >
          <h2 id="verifier-heading" className="sr-only">
            Verify a proof bundle
          </h2>
          <Suspense fallback={null}>
            <VerifierWidget />
          </Suspense>
        </section>

        {/* Features */}
        <section
          className="bg-secondary/50 py-20"
          aria-labelledby="features-heading"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <h2
              id="features-heading"
              className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3"
            >
              Everything you need to prove AI work
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              ProofDrop handles the full verification lifecycle — from bundle intake to
              client-shareable receipts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card border rounded-lg p-5 flex flex-col gap-3"
                >
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <feature.icon size={18} aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          className="py-20 container mx-auto px-4 max-w-4xl"
          aria-labelledby="how-it-works-heading"
        >
          <h2
            id="how-it-works-heading"
            className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12"
          >
            How it works
          </h2>
          <ol className="relative space-y-0" aria-label="Steps to verify a bundle">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-6 pb-10 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-2" aria-hidden="true" />
                  )}
                </div>
                <div className="pt-1.5 pb-10 last:pb-0">
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  {'link' in step && step.link && (
                    <a
                      href={step.link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {step.link.label}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Pricing preview */}
        <section className="bg-secondary/50 py-20" aria-labelledby="pricing-preview-heading">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2
              id="pricing-preview-heading"
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            >
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground mb-8">
              Start free with 10 verifications per month. Upgrade for more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {pricingPreview.map((tier) => (
                <div
                  key={tier.name}
                  className={`rounded-lg border p-5 text-left ${
                    tier.highlighted
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{tier.price}</p>
                  <ul className="mt-3 space-y-1.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Button asChild size="lg">
              <Link href="/pricing">
                See full pricing <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to start verifying?
          </h2>
          <p className="text-muted-foreground mb-8">
            No credit card required. Verify your first bundle in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/api/auth/signin">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="https://github.com/swarmsync-ai/Conduit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Download size={16} aria-hidden="true" />
                Download Conduit
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

const features = [
  {
    icon: Shield,
    title: 'Cryptographic Verification',
    description:
      'Full AIVS schema validation including signature, hash, and timestamp integrity checks.',
  },
  {
    icon: Clock,
    title: 'Permanent Receipts',
    description:
      'Every verified bundle gets a permanent receipt URL. Same bundle, same receipt — always.',
  },
  {
    icon: Link2,
    title: 'Shareable Links',
    description:
      'Share receipt URLs with clients, include them in invoices, or attach to compliance docs.',
  },
  {
    icon: FileCheck,
    title: 'Audit Trail',
    description:
      'Full verification audit timeline showing exactly what was checked and when.',
  },
]

const steps = [
  {
    title: 'Generate a bundle with Conduit',
    description:
      'Download Conduit — our open-source headless browser — to capture and sign AI-assisted work as an AIVS proof bundle.',
    link: { href: 'https://github.com/swarmsync-ai/Conduit', label: 'Get Conduit on GitHub →' },
  },
  {
    title: 'Drop your bundle into ProofDrop',
    description:
      'Paste the AIVS proof bundle JSON directly in the verifier widget above — no account needed.',
  },
  {
    title: 'ProofDrop verifies it',
    description:
      'We run the full AIVS verification suite: schema validation, hash integrity, signature check, and timestamp validation.',
  },
  {
    title: 'Get a permanent receipt URL',
    description:
      'Receive an immutable receipt URL you can share immediately. The same bundle always produces the same receipt.',
  },
]

const pricingPreview = [
  {
    name: 'Free',
    price: '$0/mo',
    highlighted: false,
    features: ['25 verifications/mo', 'Public receipts', '30-day history'],
  },
  {
    name: 'Starter',
    price: '$12/mo',
    highlighted: true,
    features: ['100 verifications/mo', 'Permanent history', 'JSON export'],
  },
  {
    name: 'Pro',
    price: '$29/mo',
    highlighted: false,
    features: ['Unlimited verifications', 'API access', 'Bulk export'],
  },
]
