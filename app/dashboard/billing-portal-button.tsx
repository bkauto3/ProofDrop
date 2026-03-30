'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

export function BillingPortalButton() {
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Billing portal error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={() => void handleClick()} disabled={loading} variant="outline">
      {loading ? 'Loading...' : 'Manage billing'}
    </Button>
  )
}
