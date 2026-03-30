'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ProofSeal } from '@/components/receipt/proof-seal'
import { Loader2, Upload, Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type VerifyStatus = 'PASS' | 'FAIL' | 'ERROR'

interface VerifyResult {
  receiptId: string
  status: VerifyStatus
  bundleHash: string
  receiptUrl: string
  failureReasons?: string[]
  error?: string
}

export function VerifierWidget() {
  const [jsonInput, setJsonInput] = React.useState('')
  const [isDragging, setIsDragging] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<VerifyResult | null>(null)
  const [fetchError, setFetchError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const textareaId = React.useId()
  const errorId = React.useId()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setFetchError('Please drop a JSON file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setJsonInput(evt.target.result as string)
        setFetchError(null)
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setJsonInput(evt.target.result as string)
        setFetchError(null)
      }
    }
    reader.readAsText(file)
  }

  const handleVerify = async () => {
    setFetchError(null)
    setResult(null)

    if (!jsonInput.trim()) {
      setFetchError('Please paste a JSON bundle or upload a file.')
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonInput)
    } catch {
      setFetchError('Invalid JSON. Please check your input and try again.')
      return
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setFetchError('Bundle must be a JSON object, not an array or primitive.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      })

      const data = await res.json() as VerifyResult & { error?: string }

      if (!res.ok) {
        setFetchError(data.error ?? `Server error: ${res.status}`)
        return
      }

      setResult(data)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result?.receiptUrl) return
    try {
      await navigator.clipboard.writeText(result.receiptUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Drop zone + textarea */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        )}
      >
        <Textarea
          id={textareaId}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value)
            setFetchError(null)
          }}
          placeholder={'Paste your AIVS proof bundle JSON here...\n\nOr drag & drop a .json file onto this area.'}
          className={cn(
            'min-h-[200px] font-mono text-xs resize-y border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg',
          )}
          aria-label="AIVS proof bundle JSON input"
          aria-describedby={fetchError ? errorId : undefined}
          aria-invalid={fetchError ? true : undefined}
          disabled={isLoading}
          spellCheck={false}
        />
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg bg-primary/5">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload size={32} />
              <p className="text-sm font-medium">Drop JSON file here</p>
            </div>
          </div>
        )}
      </div>

      {/* File upload alternative */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="file-upload"
          className={cn(
            'inline-flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors',
            isLoading && 'pointer-events-none opacity-50'
          )}
        >
          <Upload size={14} />
          Upload .json file
          <input
            id="file-upload"
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </label>
        {jsonInput && (
          <button
            onClick={() => { setJsonInput(''); setResult(null); setFetchError(null) }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error message */}
      {fetchError && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {fetchError}
        </p>
      )}

      {/* Submit button */}
      <Button
        onClick={handleVerify}
        disabled={isLoading}
        size="lg"
        className="w-full"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            Verifying...
          </>
        ) : (
          'Verify & Generate Receipt'
        )}
      </Button>

      {/* Result panel */}
      {result && (
        <div className="animate-slide-up rounded-lg border bg-card p-5 space-y-4" role="status" aria-live="polite">
          <div className="flex items-start gap-4">
            <ProofSeal status={result.status} size="md" />
            <div className="flex-1 min-w-0">
              {result.status === 'PASS' && (
                <>
                  <span className="status-pass-badge mb-2 inline-flex">
                    Verified Successfully
                  </span>
                  <p className="text-sm text-muted-foreground">
                    This AIVS bundle has been verified and a permanent receipt has been generated.
                  </p>
                </>
              )}
              {result.status === 'FAIL' && (
                <>
                  <span className="status-fail-badge mb-2 inline-flex">
                    Verification Failed
                  </span>
                  <p className="text-sm text-muted-foreground mb-2">
                    This bundle did not pass verification.
                  </p>
                  {result.failureReasons && result.failureReasons.length > 0 && (
                    <ul className="space-y-1" role="list">
                      {result.failureReasons.map((reason, i) => (
                        <li key={i} className="text-xs font-mono bg-destructive/10 text-destructive px-2 py-1 rounded inline-flex mr-1">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              {result.status === 'ERROR' && (
                <div className="rounded-md bg-warning/10 border border-warning/20 p-3">
                  <p className="text-sm font-medium text-warning">Verification Error</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.error ?? 'An unexpected error occurred during verification.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Receipt URL */}
          <div className="border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Receipt URL
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted px-3 py-2 rounded-md truncate text-foreground">
                {result.receiptUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy receipt URL"
                className="shrink-0"
              >
                {copied ? (
                  <CheckCheck size={14} className="text-success" />
                ) : (
                  <Copy size={14} />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                asChild
                aria-label="Open receipt"
                className="shrink-0"
              >
                <Link href={`/receipt/${result.receiptId}`} target="_blank">
                  <ExternalLink size={14} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
