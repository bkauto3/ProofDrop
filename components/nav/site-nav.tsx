'use client'

import Link from 'next/link'
import { SiteLogo } from '@/components/brand/site-logo'
import { Button } from '@/components/ui/button'

export function SiteNav() {
  return (
    <header className="nav-frosted">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        <SiteLogo size="md" />
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
        <Button variant="default" size="sm" asChild>
          <Link href="/api/auth/signin">Sign in</Link>
        </Button>
      </div>
    </header>
  )
}
