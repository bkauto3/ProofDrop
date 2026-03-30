import { getDb } from './db'
import { hashApiKey } from './api-keys'

interface ApiUser {
  id: string
  subscription_tier: string
}

interface ApiKeyRow {
  user_id: string
  subscription_tier: string
}

/**
 * Validates a Bearer token from the Authorization header.
 * Returns the owning user (id, subscription_tier) or null if invalid/expired/revoked.
 * Also bumps last_used_at on a valid key.
 */
export async function getApiUser(req: Request): Promise<ApiUser | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const rawKey = authHeader.slice(7).trim()
  if (!rawKey.startsWith('pd_live_')) return null

  const keyHash = hashApiKey(rawKey)

  try {
    const sql = getDb()

    // Look up the key and join users in a single query
    const rows = (await sql`
      SELECT u.id, u.subscription_tier
      FROM api_keys ak
      JOIN users u ON u.id = ak.user_id
      WHERE ak.key_hash = ${keyHash}
        AND ak.revoked_at IS NULL
        AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
      LIMIT 1
    `) as ApiKeyRow[]

    if (!rows[0]) return null

    // Update last_used_at in background — don't await so we don't add latency
    sql`
      UPDATE api_keys
      SET last_used_at = NOW()
      WHERE key_hash = ${keyHash}
    `.catch((err: unknown) => {
      console.error('[api-auth] Failed to update last_used_at:', err)
    })

    return {
      id: rows[0].user_id,
      subscription_tier: rows[0].subscription_tier,
    }
  } catch (err) {
    console.error('[api-auth] DB error during key validation:', err)
    return null
  }
}
