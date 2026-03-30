import { ProofSeal } from './proof-seal'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

interface ReceiptData {
  id: string
  bundle_hash: string
  status: string
  summary: unknown
  parties?: unknown
  timestamps?: unknown
  verifier_version: string
  created_at: string
}

interface ReceiptCardProps {
  receipt: ReceiptData
  className?: string
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export function ReceiptCard({ receipt, className }: ReceiptCardProps) {
  const status = receipt.status as 'PASS' | 'FAIL' | 'ERROR'
  const summary = isObject(receipt.summary) ? receipt.summary : {}
  const failureReasons = Array.isArray(summary.failureReasons)
    ? (summary.failureReasons as string[])
    : []

  const createdAt = new Date(receipt.created_at)
  const formattedDate = createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <div className={cn('receipt-card p-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <ProofSeal status={status} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {status === 'PASS' && (
              <span className="status-pass-badge">
                <span aria-hidden="true">&#10003;</span> Verified
              </span>
            )}
            {status === 'FAIL' && (
              <span className="status-fail-badge">
                <span aria-hidden="true">&#10007;</span> Failed
              </span>
            )}
            {status === 'ERROR' && (
              <span className="inline-flex items-center gap-1 bg-warning/10 text-warning border border-warning/20 rounded-full px-3 py-1 text-sm font-medium">
                Error
              </span>
            )}
            <span className="text-xs text-muted-foreground">v{receipt.verifier_version}</span>
          </div>

          <h2 className="mt-2 text-base font-semibold text-foreground">
            Receipt{' '}
            <span className="receipt-hash font-mono text-xs">{receipt.id}</span>
          </h2>

          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bundle Hash
              </dt>
              <dd className="mt-0.5">
                <span className="receipt-hash-highlighted receipt-hash--highlighted font-mono text-xs break-all">
                  {receipt.bundle_hash.slice(0, 32)}...
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Verified
              </dt>
              <dd className="mt-0.5 text-sm text-foreground">
                {formattedDate} at {formattedTime}
              </dd>
            </div>
          </dl>

          {status === 'FAIL' && failureReasons.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-destructive mb-1">Failure Reasons:</p>
              <ul className="space-y-1" role="list">
                {failureReasons.map((reason, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5" aria-hidden="true">&#8226;</span>
                    <span className="font-mono text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <Link
              href={`/receipt/${receipt.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              View full receipt <ExternalLink size={12} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
