import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
// @auth/neon-adapter is a default export and requires a Pool (not the neon()
// tagged-template function). Pool uses the same @neondatabase/serverless package.
import NeonAdapter from '@auth/neon-adapter'
import { Pool } from '@neondatabase/serverless'
import { getDb } from './db'

interface DbUser {
  id: string
  subscription_tier: string
}

// Singleton Pool instance for the adapter. Created lazily at first auth
// request so it does not execute during `next build`.
let _pool: Pool | null = null
function getAdapterPool(): Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('DATABASE_URL is not set')
    _pool = new Pool({ connectionString: url })
  }
  return _pool
}

// Credentials are read lazily at request time by NextAuth — not during module evaluation.
// The provider receives empty strings during `next build` (no OAuth requests occur at build time).
export const authOptions: NextAuthOptions = {
  // NeonAdapter provides storage for EmailProvider verification_tokens and for
  // the accounts table used by OAuth account linking.
  // IMPORTANT: Even with adapter present, session strategy must be set to
  // 'jwt' explicitly — otherwise NextAuth defaults to database sessions and
  // looks for a `sessions` table that does not exist in this schema.
  adapter: NeonAdapter(getAdapterPool()) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: { params: { prompt: 'select_account' } },
      // allowDangerousEmailAccountLinking is intentionally omitted (defaults to
      // false). Enabling it allows an attacker who controls a Google account with
      // a victim's email address to silently take over an existing Magic Link
      // account without any email ownership verification.
    }),
    // EmailProvider (Magic Link) — enabled now that NeonAdapter is present
    // to store verification_tokens. Port 465 requires secure: true.
    // Gated on RESEND_API_KEY presence so build does not fail in CI when
    // the env var is absent.
    ...(process.env.RESEND_API_KEY
      ? [
          EmailProvider({
            server: {
              host: 'smtp.resend.com',
              port: 465,
              secure: true,
              auth: {
                user: 'resend',
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: 'ProofDrop <noreply@proofdrop.pro>',
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        const sql = getDb()
        await sql`
          INSERT INTO users (email, name, image)
          VALUES (${user.email}, ${user.name ?? null}, ${user.image ?? null})
          ON CONFLICT (email) DO UPDATE
            SET name  = EXCLUDED.name,
                image = EXCLUDED.image
        `
      } catch (err) {
        console.error('[auth] signIn upsert error:', err)
        // Fail closed: returning false sends the user to the error page rather
        // than creating an orphaned session with no database record.
        return false
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        try {
          const sql = getDb()
          const rows = (await sql`
            SELECT id, subscription_tier FROM users WHERE email = ${token.email as string} LIMIT 1
          `) as DbUser[]
          if (rows[0]) {
            (session.user as { id?: string; subscriptionTier?: string }).id = rows[0].id;
            (session.user as { id?: string; subscriptionTier?: string }).subscriptionTier = rows[0].subscription_tier
          }
        } catch (err) {
          console.error('[auth] session lookup error:', err)
        }
      }
      return session
    },
  },
}
