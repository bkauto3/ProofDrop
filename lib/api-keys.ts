import crypto from 'crypto'

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Format: pd_live_<32 random hex chars>
  const raw = crypto.randomBytes(32).toString('hex')
  const key = `pd_live_${raw}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const prefix = key.slice(0, 12) // "pd_live_" + 4 chars
  return { key, hash, prefix }
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}
