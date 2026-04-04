import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return session
}

export async function getOptionalSession() {
  try {
    return await getServerSession(authOptions)
  } catch (err) {
    // Intentionally permissive: always returns null so callers can treat any
    // auth failure as "unauthenticated" without crashing. Log the error so
    // config issues (missing NEXTAUTH_SECRET, etc.) remain visible in prod.
    console.warn('[auth] getOptionalSession error (suppressed):', err)
    return null
  }
}
