'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    console.error('[app/error]', error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <main
          role="main"
          className="container mx-auto px-4 py-32 max-w-2xl text-center"
        >
          <p className="text-sm font-mono text-muted-foreground mb-4">500</p>
          <h1 className="text-3xl font-bold text-foreground mb-3">Something went wrong</h1>
          <p className="text-muted-foreground mb-2">
            An unexpected error occurred. We have been notified.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground mb-6">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="default">
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
