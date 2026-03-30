'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportAllButtonProps {
  tier: string
}

export function ExportAllButton({ tier }: ExportAllButtonProps) {
  const isPro = tier === 'pro' || tier === 'enterprise'

  if (!isPro) {
    return (
      <p className="text-xs text-muted-foreground">
        <a href="/pricing" className="text-primary hover:underline">
          Upgrade to Pro
        </a>{' '}
        to export all receipts as JSON.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => {
          window.location.href = '/api/user/receipts/export'
        }}
      >
        <Download size={14} className="mr-2" />
        Export All receipts
      </Button>
      <p className="text-xs text-muted-foreground">Downloads all receipts as JSON</p>
    </div>
  )
}
