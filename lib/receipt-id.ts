import { createHash } from 'crypto'

export function computeReceiptId(bundleContent: string): string {
  const hash = createHash('sha256').update(bundleContent).digest('hex')
  return `rcpt_${hash.slice(0, 32)}`
}

export function computeBundleHash(bundleContent: string): string {
  return createHash('sha256').update(bundleContent).digest('hex')
}

export function validateReceiptId(id: string): boolean {
  return /^rcpt_[a-f0-9]{32}$/.test(id)
}
