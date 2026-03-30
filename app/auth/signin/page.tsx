import { Suspense } from 'react'
import { SignInForm } from './signin-form'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your ProofDrop account.',
}

export default function SignInPage() {
  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-24 max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Sign in to ProofDrop</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to access your dashboard and receipt history.
          </p>
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}
