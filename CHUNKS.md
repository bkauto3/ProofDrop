# Proofdrop — Ralph Wiggum Implementation Chunks

**Site:** `sites/proofdrop`
**Tech stack:** Next.js 15, Neon, NextAuth.js, Stripe, Vercel, Tailwind, shadcn/ui
**Monorepo packages:** @protocol-factory/shared-ui, @protocol-factory/shared-config, @protocol-factory/protocol-verifier

---

## Chunk 1: Foundation (Database + Auth + Layout)

**Goal:** Working app shell with auth and database connectivity.

### Tasks:
- [ ] Neon PostgreSQL schema + Prisma setup
- [ ] NextAuth.js with Google OAuth (lazy `getServerSession` pattern)
- [ ] Root layout with design system tokens from `design-system/`
- [ ] Middleware for protected routes (`/dashboard`, `/api/*`)
- [ ] Health check route: `GET /api/health → 200 OK`

### Schema (derive from spec):
```sql
  -- AIVS proof bundle verification: Accept JSON paste or file upload; validate AIVS schema with Zod; run determinist
  -- Dashboard — receipt history: Authenticated users see paginated table of all their receipts: ID, status badge,
```

### Guardrails:
- NEVER initialize NextAuth client at module level
- All DATABASE_URL from process.env only
- Import from @protocol-factory/shared-ui for UI primitives

---

## Chunk 2: Core Feature — AIVS proof bundle verification

**Goal:** Accept JSON paste or file upload; validate AIVS schema with Zod; run deterministic PASS/FAIL verification using @protocol-factory/protocol-verifier; return confidence score and failure reasons.

### Tasks:
- [ ] Database model for core feature entity
- [ ] Server action or API route for create/read
- [ ] UI component using shadcn/ui primitives
- [ ] Protected page under `/dashboard/proofdrop`
- [ ] Error states with toast notifications

### Key constraints:
- Use design-system tokens (not raw Tailwind colors)
- All `useSearchParams()` must be inside `<Suspense>` boundaries
- TypeScript only — no `any` types

---

## Chunk 3: Secondary Feature — Permanent tamper-evident receipt

**Goal:** Derive receipt ID deterministically from bundle hash (rcpt_ + first 32 hex chars of SHA-256). Same bundle always produces same receipt URL. Store receipt in Neon with status, summary, timestamps, veri

### Tasks:
- [ ] Extend database schema if needed
- [ ] Feature UI with full CRUD if applicable
- [ ] Loading and empty states
- [ ] Integration with core feature from Chunk 2

---

## Chunk 4: Stripe + Billing

**Goal:** Full billing flow with pricing page, checkout, and portal.

### Stripe Products:
  - Starter: $49.0/mo | $490.0/yr
  - Pro: $149.0/mo | $1490.0/yr

### Tasks:
- [ ] Lazy Stripe client (NEVER top-level initialization):
  ```typescript
  let _stripe: Stripe | null = null;
  export function getStripe() {
    return _stripe ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia'
    });
  }
  ```
- [ ] Stripe webhook handler at `/api/webhooks/stripe`
  - Verify signature with `stripe.webhooks.constructEvent()`
  - Handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Pricing page with all tiers
- [ ] Checkout session creation
- [ ] Billing portal link in dashboard settings

### Pricing Tiers:
  - Free: Custom — 10 verifications/month, Public receipt URLs, 30-day receipt history
  - Starter: $49/mo — 100 verifications/month, Permanent receipt history, PDF/printable export
  - Pro: $149/mo — Unlimited verifications, API access, Bulk export
  - Enterprise: Custom — Unlimited users, SSO/SAML, Custom SLA

---

## Chunk 5: Landing Page + Marketing Pages

**Goal:** Public-facing pages that convert visitors to trials.

### Pages:
- [ ] `/` — Landing page
  - Hero: `Turn any AIVS proof bundle into a shareable receipt in seconds`
  - Pain section: addresses `Clients cannot read raw AIVS proof JSON — it is low-level, dense, and meaningless to non-technical s`
  - Features section: top 3 high-priority features
  - Pricing section: all tiers from spec
  - CTA: `Verify your first bundle free — no account needed`
- [ ] `/pricing` — Standalone pricing page (same tiers)
- [ ] `/docs` or `/how-it-works` — Quick product walkthrough
- [ ] Error pages: 404, 500

### SEO:
- Meta title + description from spec.marketing
- OpenGraph tags
- `sitemap.xml` at `/sitemap.xml`
- `robots.txt` at `/robots.txt`

---

## Chunk 6: API Routes + Export + Polish

**Goal:** Complete API surface, data export, and production-ready polish.

### API Routes:
  - /api/proofdrop/google-oauth-sign-in
  - /api/proofdrop/dashboard-—-receipt-history
  - /api/proofdrop/stripe-subscription-billing
  - /api/proofdrop/rate-limiting
  - /api/proofdrop/receipt-export
  - /api/proofdrop/security-hardening
- [ ] `/api/webhooks/stripe` (already in Chunk 4)
- [ ] `GET /api/health` → `{ status: "ok", timestamp: Date.now() }`

### Export:
- [ ] CSV or JSON export of user data (GDPR compliance)
- [ ] Download artifact from dashboard

### Polish:
- [ ] Loading skeletons for all async components
- [ ] Responsive design audit (mobile-first)
- [ ] Dark mode support (design-system already provides `.dark` theme)
- [ ] Accessibility: keyboard navigation, ARIA labels, focus rings
- [ ] Error boundaries on all route segments

---

## Implementation Notes

### Shared Package Usage:
```typescript
import { Button, Card, Badge } from '@protocol-factory/shared-ui';
import config from '@protocol-factory/shared-config/tailwind.config';
import { verifyProofBundle } from '@protocol-factory/protocol-verifier';
```

### Environment Variables Required:
```
NEXTAUTH_SECRET=          # Generate: openssl rand -base64 32
NEXTAUTH_URL=             # https://proofdrop.vercel.app (prod) | http://localhost:3000 (dev)
GOOGLE_CLIENT_ID=         # From Google Cloud Console
GOOGLE_CLIENT_SECRET=     # From Google Cloud Console
DATABASE_URL=             # Neon PostgreSQL connection string
STRIPE_SECRET_KEY=        # sk_live_... (prod) | sk_test_... (dev)
STRIPE_PUBLISHABLE_KEY=   # pk_live_... (prod) | pk_test_... (dev)
STRIPE_WEBHOOK_SECRET=    # whsec_...
```

### Running Locally:
```bash
cd "C:\Users\Administrator\Desktop\Protocol Websites\monorepo"
npm install
npx turbo dev --filter=proofdrop
# App runs at http://localhost:3000
```
