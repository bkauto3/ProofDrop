import { redirect } from 'next/navigation'
import { requireSession } from '@/lib/auth-helpers'
import { getDb } from '@/lib/db'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'
import { ReceiptHistoryTable } from '@/components/dashboard/receipt-history-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BillingPortalButton } from './billing-portal-button'
import { ExportAllButton } from '@/components/dashboard/export-all-button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your ProofDrop verification history and account settings.',
}

interface UserRow {
  id: string
  email: string
  name: string | null
  image: string | null
  subscription_tier: string
  monthly_verifications: number
  created_at: string
}

const MONTHLY_LIMITS: Record<string, number | null> = {
  free: 10,
  starter: 100,
  pro: null,
  enterprise: null,
}

export default async function DashboardPage() {
  const session = await requireSession()
  if (!session) redirect('/api/auth/signin?callbackUrl=/dashboard')

  const email = session.user!.email!

  let user: UserRow | null = null
  try {
    const sql = getDb()
    const rows = (await sql`
      SELECT id, email, name, image, subscription_tier, monthly_verifications, created_at
      FROM users WHERE email = ${email} LIMIT 1
    `) as UserRow[]
    user = rows[0] ?? null
  } catch (err) {
    console.error('[dashboard] DB error:', err)
  }

  const displayName = user?.name ?? session.user?.name ?? email
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const tier = user?.subscription_tier ?? 'free'
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1)
  const monthlyUsed = user?.monthly_verifications ?? 0
  const monthlyLimit = MONTHLY_LIMITS[tier] ?? MONTHLY_LIMITS.free
  const isUnlimited = monthlyLimit === null

  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile header */}
        <section aria-labelledby="profile-heading" className="mb-10">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={user?.image ?? session.user?.image ?? ''} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 id="profile-heading" className="text-xl font-bold text-foreground">
                {displayName}
              </h1>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={tier === 'free' ? 'secondary' : 'default'}>
                  {tierLabel} plan
                </Badge>
                {tier === 'free' && (
                  <a href="/pricing" className="text-xs text-primary hover:underline">
                    Upgrade
                  </a>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {isUnlimited
                  ? 'Verifications this month: unlimited'
                  : `Verifications this month: ${monthlyUsed} / ${monthlyLimit}`}
              </p>
            </div>
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Receipt history */}
        <section aria-labelledby="receipts-heading" className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <h2 id="receipts-heading" className="text-lg font-semibold text-foreground">
              Verification History
            </h2>
            <ExportAllButton tier={tier} />
          </div>
          <ReceiptHistoryTable userId={user?.id ?? ''} />
        </section>

        <Separator className="mb-8" />

        {/* Billing section */}
        <section aria-labelledby="billing-heading" className="mb-12">
          <h2 id="billing-heading" className="text-lg font-semibold text-foreground mb-2">
            Billing
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {tier === 'free'
              ? 'You are on the Free plan. Upgrade to unlock more verifications and features.'
              : `You are on the ${tierLabel} plan. Manage your subscription in the billing portal.`}
          </p>
          {tier === 'free' ? (
            <Button asChild>
              <a href="/pricing">Upgrade plan</a>
            </Button>
          ) : (
            <BillingPortalButton />
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
