# ProofDrop Design System Guide (B6)

Generated: 2026-03-28

---

## Overview

ProofDrop's design system is built on shadcn/ui primitives with a blue-slate brand identity (primary hue 220°, #2563EB). The system prioritizes legibility, trust signals, and clarity around verification status.

**Core principle**: Every UI element communicates either "professional trust" (blue tones) or "verification outcome" (green = PASS, red = FAIL). Nothing else competes for visual attention.

---

## Brand Identity

| Element | Value |
|---|---|
| Primary color | #2563EB (blue-600) |
| Primary dark | #1D4ED8 (blue-700) |
| Success/PASS | #16A34A (green-600) |
| Failure/FAIL | #DC2626 (red-600) |
| Background | #F8FAFC (slate-50) |
| Surface | #FFFFFF |
| Border | #E2E8F0 (slate-200) |
| Text primary | #0F172A (slate-900) |
| Text muted | #64748B (slate-500) |
| Sans font | Inter |
| Mono font | JetBrains Mono |

---

## Using Design Tokens

**Always import from `design-system/tokens.ts`:**

```tsx
// ✅ Correct
import { colors, receiptTokens } from '@/design-system/tokens'

// ❌ Never hardcode
style={{ color: '#2563EB' }}
```

**In Tailwind classes, use semantic color names:**
```tsx
// ✅ Correct
<div className="bg-primary text-primary-foreground">
<div className="border-border bg-card">

// ❌ Wrong
<div style={{ backgroundColor: 'hsl(220, 91%, 54%)' }}>
```

---

## Receipt Card

The receipt card is the core UI element of ProofDrop.

```tsx
// ✅ Correct receipt card structure
<article
  className="receipt-card p-6 rounded-lg"
  aria-label={`Verification receipt ${receiptId}`}
>
  {/* Header row */}
  <div className="flex items-start justify-between mb-6">
    {/* Proof seal */}
    <div className={status === 'PASS' ? 'proof-seal' : 'proof-seal proof-seal--fail'}>
      {status === 'PASS' ? <CheckIcon /> : <XIcon />}
    </div>
    <div>
      <h1 className="text-xl font-semibold text-foreground">
        Verification Receipt
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Issued by ProofDrop
      </p>
    </div>
    {/* Status badge */}
    <span
      className={status === 'PASS' ? 'status-pass-badge' : 'status-fail-badge'}
      aria-label={`Verification status: ${status}`}
    >
      {status === 'PASS' ? <CheckIcon size={12} /> : <XIcon size={12} />}
      {status}
    </span>
  </div>

  {/* Receipt ID */}
  <div className="space-y-1 mb-4">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Receipt ID</p>
    <p className="receipt-hash--highlighted" aria-label={`Receipt ID: ${receiptId}`}>
      {receiptId}
    </p>
  </div>

  {/* Bundle hash */}
  <div className="space-y-1 mb-4">
    <p className="text-xs text-muted-foreground uppercase tracking-wider">Bundle Hash</p>
    <p className="receipt-hash" aria-label={`Bundle hash: ${bundleHash}`}>
      {bundleHash}
    </p>
  </div>
</article>
```

---

## Audit Trail

```tsx
<div className="audit-trail">
  {events.map((event, i) => (
    <div key={i} className="audit-trail-item">
      {/* Dot */}
      <div
        className="w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 border-2"
        style={{
          backgroundColor: event.pass
            ? 'hsl(var(--audit-dot-pass) / 0.2)'
            : 'hsl(var(--audit-dot-fail) / 0.2)',
          borderColor: event.pass
            ? 'hsl(var(--audit-dot-pass))'
            : 'hsl(var(--audit-dot-fail))',
        }}
      />
      {/* Content */}
      <div>
        <p className="text-sm font-medium text-foreground">{event.label}</p>
        <p className="text-xs text-muted-foreground">{event.timestamp}</p>
      </div>
    </div>
  ))}
</div>
```

---

## Status Badges

```tsx
// PASS badge
<span className="status-pass-badge" aria-label="Verification passed">
  <CheckIcon size={12} />
  PASS
</span>

// FAIL badge
<span className="status-fail-badge" aria-label="Verification failed">
  <XIcon size={12} />
  FAIL
</span>
```

---

## Hash Display

```tsx
// Simple hash (body text context)
<code className="receipt-hash">{sha256Hash}</code>

// Highlighted (prominent, e.g. receipt ID at top of page)
<code className="receipt-hash--highlighted">{receiptId}</code>
```

---

## Loading State (Shimmer)

```tsx
// Card skeleton while loading receipt
<div className="receipt-card p-6 space-y-4">
  <div className="animate-shimmer h-16 w-16 rounded-full" />
  <div className="animate-shimmer h-6 w-48 rounded" />
  <div className="animate-shimmer h-4 w-full rounded" />
  <div className="animate-shimmer h-4 w-3/4 rounded" />
</div>
```

---

## Navigation

Sticky header with frosted glass effect:
```tsx
<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
  ...
</header>
```

---

## Extension Guide

### Adding new ProofDrop tokens

1. Add to `theme-light.css` `:root` block and `theme-dark.css` `.dark` block
2. Add to `token-foundation.json` under `proofdrop_custom`
3. Export from `tokens.ts`
4. Extend `tailwind.config.ts` if a Tailwind utility class is needed

### Adding new component classes

Add to the `@layer components` block in `theme-light.css`. Use `hsl(var(--token))` pattern — never hardcode hex values.

### Updating brand colors

Change `--primary` in both theme files. All derivative colors (`--ring`, component classes) automatically update via CSS variable references.

---

## Globals.css Integration Checklist

In the site's `app/globals.css`:
1. `@import '../design-system/theme-light.css'`
2. `@import '../design-system/theme-dark.css'`
3. `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap')`
4. `body { font-family: var(--font-sans); }` (or use `next/font/google`)

Preferred: Use `next/font/google` for Inter and JetBrains Mono to avoid layout shift.
