import Link from 'next/link'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-32 max-w-2xl text-center">
        <p className="text-sm font-mono text-muted-foreground mb-4">404</p>
        <h1 className="text-3xl font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </main>
      <SiteFooter />
    </>
  )
}
