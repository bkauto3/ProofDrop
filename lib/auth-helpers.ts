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
  } catch {
    return null
  }
}
