'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReceiptRow {
  id: string
  bundle_hash: string
  status: string
  created_at: string
  summary: unknown
}

interface ReceiptHistoryTableProps {
  userId: string
}

interface FetchState {
  receipts: ReceiptRow[]
  total: number
  page: number
  pages: number
  loading: boolean
  error: string | null
}

export function ReceiptHistoryTable({ userId: _userId }: ReceiptHistoryTableProps) {
  const [state, setState] = React.useState<FetchState>({
    receipts: [],
    total: 0,
    page: 1,
    pages: 0,
    loading: true,
    error: null,
  })
  const [exportingId, setExportingId] = React.useState<string | null>(null)

  const fetchReceipts = React.useCallback(async (page: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(`/api/user/receipts?page=${page}`)
      if (!res.ok) throw new Error('Failed to fetch receipts')
      const data = await res.json() as {
        receipts: ReceiptRow[]
        total: number
        page: number
        pages: number
      }
      setState({
        receipts: data.receipts,
        total: data.total,
        page: data.page,
        pages: data.pages,
        loading: false,
        error: null,
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load receipts',
      }))
    }
  }, [])

  React.useEffect(() => {
    void fetchReceipts(1)
  }, [fetchReceipts])

  const handleExport = async (receiptId: string) => {
    setExportingId(receiptId)
    try {
      const res = await fetch(`/api/user/receipts/${receiptId}/export`)
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Export failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receipt-${receiptId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExportingId(null)
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-3" aria-label="Loading receipts" aria-busy="true">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-md bg-muted animate-shimmer"
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="text-center py-8" role="alert">
        <p className="text-sm text-destructive">{state.error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => void fetchReceipts(state.page)}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (state.receipts.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-muted-foreground text-sm">No receipts yet.</p>
        <p className="text-muted-foreground text-xs mt-1">
          Verify a bundle on the{' '}
          <Link href="/" className="text-primary hover:underline">
            homepage
          </Link>{' '}
          to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {state.receipts.map((receipt) => (
            <TableRow key={receipt.id}>
              <TableCell>
                <code className="font-mono text-xs text-muted-foreground">
                  {receipt.id.slice(0, 20)}...
                </code>
              </TableCell>
              <TableCell>
                <StatusBadge status={receipt.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(receipt.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild aria-label="View receipt">
                    <Link href={`/receipt/${receipt.id}`}>
                      <ExternalLink size={14} />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Export receipt"
                    onClick={() => void handleExport(receipt.id)}
                    disabled={exportingId === receipt.id}
                  >
                    <Download size={14} className={cn(exportingId === receipt.id && 'animate-pulse')} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {state.pages > 1 && (
        <div className="flex items-center justify-between" aria-label="Pagination">
          <p className="text-sm text-muted-foreground">
            Page {state.page} of {state.pages} ({state.total} receipts)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={state.page <= 1}
              onClick={() => void fetchReceipts(state.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={state.page >= state.pages}
              onClick={() => void fetchReceipts(state.page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PASS') return <Badge variant="success">PASS</Badge>
  if (status === 'FAIL') return <Badge variant="destructive">FAIL</Badge>
  return <Badge variant="warning">ERROR</Badge>
}
