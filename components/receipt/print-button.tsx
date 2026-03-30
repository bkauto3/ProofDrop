'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-4 py-2"
      type="button"
    >
      <Printer size={14} aria-hidden="true" />
      Print receipt
    </button>
  )
}
