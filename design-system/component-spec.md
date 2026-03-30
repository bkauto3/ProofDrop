# ProofDrop — Component Specification

## Core Components (ProofDrop-specific)

### VerifierWidget
**Purpose**: The main proof input + verification result UI on the homepage
**Surfaces**: `/` (homepage)
**State**: idle → loading → result (PASS|FAIL|ERROR)

Props:
```tsx
interface VerifierWidgetProps {
  onReceiptCreated?: (receiptId: string) => void
}
```

Sections:
- **Input area**: Textarea (multiline, monospace font hints) + file upload drag-drop zone
- **Submit button**: "Verify & Generate Receipt" — full-width primary Button
- **Result panel**: Conditionally rendered below button on success/failure
  - PASS: proof-seal (green), status-pass-badge, confidence score, receipt URL + Copy button
  - FAIL: proof-seal (red), status-fail-badge, list of failure reasons
  - ERROR: amber warning, user-friendly error message

### ReceiptCard
**Purpose**: The permanent receipt display — used on `/receipt/[id]` and as preview elsewhere
**Surfaces**: `/receipt/[id]`, dashboard preview

Props:
```tsx
interface ReceiptCardProps {
  receiptId: string
  bundleHash: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  verifierVersion: string
  summary?: ReceiptSummary
  parties?: ReceiptParties
  timestamps?: ReceiptTimestamps
  showRawBundle?: boolean
  rawBundle?: object
}
```

Sections:
- Header row: proof-seal + "Verification Receipt" heading + status badge
- Receipt ID: receipt-hash--highlighted display + copy button
- Bundle hash: receipt-hash display
- Timestamps: captured_at, verified_at, receipt_created_at
- Verifier version badge
- Optional: Parties section (contractor/client if present in bundle)
- Optional: Raw bundle data (collapsible `<details>`)

### AuditTimeline
**Purpose**: Vertical step-by-step list of verification events
**Surfaces**: `/receipt/[id]`

Props:
```tsx
interface AuditTimelineProps {
  events: Array<{
    label: string
    status: 'pass' | 'fail' | 'info'
    timestamp?: string
    detail?: string
  }>
}
```

Uses `.audit-trail` and `.audit-trail-item` CSS classes.

### ReceiptHistoryTable
**Purpose**: Paginated list of user's receipts in dashboard
**Surfaces**: `/dashboard`

Columns: Receipt ID | Status | Date | Actions (View, Export)
Pagination: 20 per page
Loading: shimmer skeleton rows

### ProofSeal
**Purpose**: Circular PASS/FAIL badge icon used in receipt header
**Surfaces**: `/receipt/[id]`, VerifierWidget result panel

Props:
```tsx
interface ProofSealProps {
  status: 'PASS' | 'FAIL' | 'ERROR'
  size?: 'sm' | 'md' | 'lg'
}
```

Uses `.proof-seal` and `.proof-seal--fail` CSS classes.

---

## Layout Components

### SiteNav
**Purpose**: Sticky top navigation with ProofDrop branding
**Surfaces**: All pages

Elements:
- ProofDrop wordmark (logo SVG + "ProofDrop" text)
- Nav links: About, Pricing, Dashboard (if signed in)
- CTA: "Sign in" (if not signed in) or user avatar + dropdown

Style:
```
sticky top-0 z-50
border-b border-border/40
bg-background/80 backdrop-blur-md
```

### SiteFooter
**Purpose**: Standard footer with links
**Surfaces**: All pages

Sections: Brand column (wordmark + tagline) + Links (Product, Company) + Legal (Terms, Privacy)

---

## Page-Level Component Map

### `/` (Homepage)
- `<SiteNav>`
- Hero section: headline + sub + CTA
- `<VerifierWidget>` — the main interactive element
- Feature grid: 3-4 feature cards
- How it works: 3-step illustration
- Social proof / trust signals
- Pricing preview (link to /pricing)
- `<SiteFooter>`

### `/receipt/[id]`
- `<SiteNav>` (minimal)
- `<ReceiptCard>` (full width, prominent)
- `<AuditTimeline>`
- Print / download action bar
- `<SiteFooter>` (minimal)

### `/dashboard`
- `<SiteNav>`
- Account summary (avatar, email, tier badge)
- `<ReceiptHistoryTable>` with pagination
- Billing section (current tier + "Manage billing" button)
- `<SiteFooter>`

### `/pricing`
- `<SiteNav>`
- Billing toggle (monthly/annual Tabs)
- 3 pricing cards + Enterprise card
- FAQ section
- `<SiteFooter>`

### `/about`
- `<SiteNav>`
- Explainer: What is an AIVS proof bundle
- Explainer: What is a ProofDrop receipt
- How-to guide
- `<SiteFooter>`
