import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { validateReceiptId } from '@/lib/receipt-id'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import { ProofSeal } from '@/components/receipt/proof-seal'
import { AuditTimeline } from '@/components/receipt/audit-timeline'
import { PrintButton } from '@/components/receipt/print-button'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  if (!validateReceiptId(id)) {
    return { title: 'Receipt Not Found' }
  }
  return {
    title: `Receipt ${id}`,
    description: `ProofDrop AIVS verification receipt ${id}`,
  }
}

interface ReceiptRow {
  id: string
  bundle_hash: string
  status: string
  summary: unknown
  parties: unknown
  timestamps: unknown
  verifier_version: string
  created_at: string
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id } = await params

  if (!validateReceiptId(id)) {
    notFound()
  }

  let receipt: ReceiptRow | null = null
  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, bundle_hash, status, summary, parties, timestamps, verifier_version, created_at
      FROM receipts
      WHERE id = ${id}
      LIMIT 1
    `) as ReceiptRow[]
    receipt = rows[0] ?? null
  } catch (err) {
    console.error('[receipt/page] DB error:', err)
  }

  if (!receipt) {
    notFound()
  }

  const status = receipt.status as 'PASS' | 'FAIL' | 'ERROR'
  const summary = isObject(receipt.summary) ? receipt.summary : {}
  const timestamps = isObject(receipt.timestamps) ? receipt.timestamps : {}
  const failureReasons = Array.isArray(summary.failureReasons)
    ? (summary.failureReasons as string[])
    : []

  const verifiedAt =
    typeof timestamps.verifiedAt === 'string'
      ? timestamps.verifiedAt
      : receipt.created_at

  const auditEvents = [
    {
      label: 'Bundle received',
      timestamp: receipt.created_at,
      status: 'info' as const,
      detail: `Hash: ${receipt.bundle_hash.slice(0, 16)}...`,
    },
    {
      label: 'Schema validation',
      timestamp: verifiedAt,
      status: status === 'PASS' ? ('pass' as const) : ('fail' as const),
      detail: status === 'PASS' ? 'All required fields present' : 'Validation failed',
    },
    {
      label: `Verification ${status === 'PASS' ? 'passed' : 'completed'}`,
      timestamp: verifiedAt,
      status: status === 'PASS' ? ('pass' as const) : ('fail' as const),
      detail: `Verifier v${receipt.verifier_version}`,
    },
  ]

  const createdDate = new Date(receipt.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="receipt-card p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <ProofSeal status={status} size="lg" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                {status === 'PASS' && (
                  <span className="status-pass-badge">Verified</span>
                )}
                {status === 'FAIL' && (
                  <span className="status-fail-badge">Failed</span>
                )}
                {status === 'ERROR' && (
                  <span className="inline-flex items-center bg-warning/10 text-warning border border-warning/20 rounded-full px-3 py-0.5 text-sm font-medium">
                    Error
                  </span>
                )}
              </div>
              <h1 className="text-lg font-bold text-foreground">
                ProofDrop Receipt
              </h1>
              <p className="text-xs text-muted-foreground mt-1">{createdDate}</p>
            </div>
          </div>

          {/* Receipt ID */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Receipt ID
            </p>
            <code className="receipt-hash--highlighted text-xs font-mono block py-1.5 px-2 rounded">
              {receipt.id}
            </code>
          </div>

          {/* Bundle Hash */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Bundle Hash (SHA-256)
            </p>
            <code className="receipt-hash font-mono text-xs block py-1.5 px-2 rounded break-all">
              {receipt.bundle_hash}
            </code>
          </div>

          {/* Failure reasons */}
          {status !== 'PASS' && failureReasons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Failure Reasons
              </p>
              <ul className="flex flex-wrap gap-1" role="list">
                {failureReasons.map((reason, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center text-xs font-mono bg-destructive/10 text-destructive px-2 py-1 rounded"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verifier version */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Verifier:</span>{' '}
              <span className="font-mono text-xs text-foreground">v{receipt.verifier_version}</span>
            </div>
          </div>

          {/* Audit Timeline */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Audit Timeline
            </p>
            <AuditTimeline events={auditEvents} />
          </div>
        </div>

        {/* Print button */}
        <div className="mt-6 flex justify-end no-print">
          <PrintButton />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
