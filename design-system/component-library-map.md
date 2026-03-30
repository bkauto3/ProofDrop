# ProofDrop — Component Library Map

## Route: /

### Hero Section
- Button (primary, lg) — "Verify & Generate Receipt" CTA
- Badge (secondary) — "Free • No account required"

### Verifier Widget
- Textarea — JSON proof bundle input
- Button (primary, lg) — Submit
- Card — Result container
- Badge (custom: status-pass-badge / status-fail-badge) — PASS/FAIL status
- Button (outline, sm) — Copy receipt URL

### Feature Grid
- Card — Feature item container
- Badge (secondary) — Feature tag

### Pricing Preview
- Card — Pricing tier preview
- Button (outline) — "View full pricing"

---

## Route: /receipt/[id]

### Receipt Header
- ProofSeal component (proof-seal / proof-seal--fail)
- Badge (custom: status-pass-badge / status-fail-badge)

### Receipt Body
- Card (receipt-card custom class)
- Code/span (receipt-hash--highlighted) — Receipt ID
- Code/span (receipt-hash) — Bundle hash

### Audit Timeline
- Custom AuditTimeline component (.audit-trail / .audit-trail-item)

### Raw Bundle
- Collapsible details/summary
- Button (ghost, sm) — Toggle
- Textarea (read-only) — Raw JSON display

### Actions
- Button (outline) — Print
- Button (outline) — Download JSON

---

## Route: /dashboard

### Account Summary
- Avatar — User profile image
- Badge (secondary) — Subscription tier

### Receipt Table
- Table — Receipt history
- Badge (custom: status-pass-badge / status-fail-badge) — Per-row status
- Button (ghost, sm) — View receipt
- Button (ghost, sm) — Export PDF

### Pagination
- Button (outline, sm) — Previous / Next

### Billing
- Card — Billing info container
- Button (outline) — Manage billing (links to Stripe portal)

---

## Route: /pricing

### Billing Toggle
- Tabs — Monthly / Annual switcher
- Badge (secondary) — "Save 17%"

### Pricing Cards
- Card — Per-tier container
- Button (primary) — "Get started" / "Contact sales"
- Separator (horizontal) — Feature section divider
- Checkbox (read-only, checked) — Feature inclusion indicator

---

## Route: /about

### Content
- Card — Explanation containers
- Separator (horizontal) — Section dividers

---

## Shared (All Routes)

### SiteNav
- Button (ghost) — Nav links
- Button (primary, sm) — "Sign in" CTA
- Avatar (sm) — Signed-in user
- DropdownMenu — User account menu (uses Radix under shadcn)

### SiteFooter
- Separator (horizontal) — Above footer
- Button (link/ghost) — Footer nav links

### Authentication
- Dialog — Sign-in modal (if using modal auth flow)
- Button (outline) — "Continue with Google"
