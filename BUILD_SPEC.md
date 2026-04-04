# ProofDrop — Build Spec (Complete Rebuild)

## 0. What You Are Building

**ProofDrop** is a professional SaaS web application where users paste or upload an AIVS proof bundle and instantly receive a permanent, tamper-evident receipt URL they can share with clients, attach to invoices, and use in compliance documents.

**Domain**: proofdrop.pro
**Stack**: Next.js 15 + React 19, Neon (PostgreSQL), NextAuth.js v4 (Google OAuth), Stripe, Tailwind CSS, shadcn/ui
**Monorepo root**: `C:\Users\Administrator\Desktop\Protocol Websites\monorepo`
**Site location**: `sites/BUILT/proofdrop` inside the monorepo
**Shared packages** (already built, use them):
- `@protocol-factory/shared-ui` — all UI components (Button, Card, Badge, Input, Textarea, Alert, Toast, Tabs, Dialog, HeroSection, PricingCard, FeatureGrid, SiteHeader, SiteFooter, ProofBadge)
- `@protocol-factory/protocol-verifier` — AIVS verification logic (`verifyAIVSBundle`, `AIVSBundle`, `AIVSBundleSchema`, `hashSHA256`)
- `@protocol-factory/shared-config` — shared TS/ESLint/Tailwind configs

---

## 1. Product Overview

### The Problem
Freelancers, agencies, and developers delivering AI-assisted work produce raw AIVS proof bundles — dense JSON documents with cryptographic hashes and signatures. These are completely unreadable to clients, finance departments, and compliance teams.

### The Solution
ProofDrop transforms any AIVS proof bundle into a clean, permanent, shareable receipt URL in seconds. No account required for verification. Sign in with Google to save your history, unlock API access, and export PDFs.

### Target ICP
- **Primary**: Freelancers and agencies who invoice for AI-assisted work
- **Secondary**: Compliance and legal teams auditing AI work products
- **Tertiary**: Developers debugging AIVS bundles and building integrations

---

## 2. Design System

### Colors
- **Primary**: `#2563EB` (blue-600) — trust, precision, professional
- **Primary dark**: `#1D4ED8` (blue-700)
- **Background**: `#F8FAFC` (slate-50)
- **Surface**: `#FFFFFF`
- **Border**: `#E2E8F0` (slate-200)
- **Text primary**: `#0F172A` (slate-900)
- **Text muted**: `#64748B` (slate-500)
- **Success**: `#16A34A` (green-600)
- **Error**: `#DC2626` (red-600)
- **Warning**: `#D97706` (amber-600)

### Typography
- **Sans**: Inter (400, 500, 600, 700)
- **Mono**: JetBrains Mono (400) — for hashes, receipt IDs, code
- **Base size**: 16px, 1.6 line-height

### Visual Identity
- Sticky top nav with frosted glass effect
- Clean white cards with subtle slate borders and `shadow-sm`
- PASS status: green badge with checkmark
- FAIL status: red badge with X
- Receipt IDs displayed in monospace font, slightly highlighted
- Proof seal: circular badge (green check / red X) in the receipt header
- Audit timeline: vertical step list with colored dots

---

## 3. Pages & Routes

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Static | No | Hero + live verifier + features |
| `/about` | Static | No | What is a receipt, how to use it |
| `/pricing` | Client | No | 3-tier pricing with billing toggle |
| `/receipt/[id]` | Dynamic | No | Public read-only receipt view |
| `/dashboard` | Dynamic | Required | Receipt history + account |
| `/api/verify` | API | No | POST bundle → receipt |
| `/api/receipts/[id]` | API | No | GET receipt JSON |
| `/api/stripe/checkout` | API | Required | POST → Stripe checkout URL |
| `/api/stripe/portal` | API | Required | POST → Billing portal URL |
| `/api/stripe/webhook` | API | No | Stripe webhook events |
| `/api/user/receipts` | API | Required | GET paginated receipt list |
| `/api/user/receipts/[id]/export` | API | Required | GET printable export |
| `/api/user/account` | API | Required | GET profile, DELETE account |
| `/api/auth/[...nextauth]` | API | No | NextAuth route handler |
| `/api/health` | API | No | Health check |

---

## 4. Database Schema (Neon PostgreSQL)

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Proof bundles (raw storage)
CREATE TABLE IF NOT EXISTS proof_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_hash TEXT NOT NULL UNIQUE,
  raw_content JSONB NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Verification results
CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'ERROR')),
  failure_reasons TEXT[],
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verifier_version TEXT NOT NULL DEFAULT '1.0.0'
);

-- Receipts (permanent, idempotent)
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  bundle_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'ERROR')),
  summary JSONB,
  parties JSONB,
  timestamps JSONB,
  verifier_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(bundle_hash)
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_receipts_bundle_hash ON receipts(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proof_bundles_bundle_hash ON proof_bundles(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_verification_results_bundle_hash ON verification_results(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);
```

---

## 5. Pricing Tiers

| Tier | Monthly | Annual | Key Features |
|------|---------|--------|--------------|
| Free | $0 | $0 | 10 verifications/mo, public receipts, 30-day history |
| Starter | $49/mo | $490/yr (save 17%) | 100 verifications/mo, permanent history, email support, PDF export |
| Pro | $149/mo | $1,490/yr (save 17%) | Unlimited verifications, API access, priority support, bulk export, team dashboard |
| Enterprise | Custom | Custom | SSO/SAML, custom SLA, dedicated support, on-premise option |

---

## 6. Key UX Flows

### Verify Flow (homepage)
1. User arrives at `/` — sees hero with clear value prop
2. Scrolls to verifier section — large textarea with drag-and-drop
3. Pastes JSON bundle or uploads .json file
4. Clicks "Verify & Generate Receipt"
5. Loading state — spinner in button
6. Result panel appears:
   - **PASS**: Green badge + confidence score + permanent receipt URL with Copy Link button
   - **FAIL**: Red badge + list of failure reasons with human-readable labels
7. User copies receipt URL, shares with client

### Receipt View Flow
1. Client receives receipt URL like `https://proofdrop.pro/receipt/rcpt_abc123...`
2. Visits URL — no login required
3. Sees: PASS/FAIL badge, bundle ID, content hash, timestamps (captured, verified, receipt created), verifier version
4. Can expand "Raw Bundle Data" section (read-only, never executed)
5. Can print/download the receipt

### Dashboard Flow
1. User signs in with Google
2. Sees receipt history table: ID, status badge, date, actions (View, Export)
3. Pagination for 20 per page
4. Shows account tier and link to billing portal

---

## 7. Security Requirements

- All bundle content treated as untrusted — no `dangerouslySetInnerHTML` with payload
- Stripe webhook signature verified with `constructEvent()` before any processing
- Stripe client NEVER initialized at module level — always lazy getter
- `getServerSession()` NEVER called at module level — always inside async functions
- `useSearchParams()` ALWAYS wrapped in `<Suspense>`
- No TypeScript `any` anywhere
- Security headers on all routes: X-Frame-Options, X-Content-Type-Options, HSTS, CSP
- Rate limiting: 10/min unauthenticated, 100/min authenticated on `/api/verify`
- Receipt IDs validated with regex before DB query

---

## 8. Environment Variables Required

```
# Database (Neon)
DATABASE_URL=postgresql://...

# Auth (NextAuth.js)
NEXTAUTH_URL=https://proofdrop.pro
NEXTAUTH_SECRET=<32-char random>
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
```
