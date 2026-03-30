# ProofDrop — Logo Specification

## 1. Concept and Design Rationale

ProofDrop's logo communicates tamper-evidence, cryptographic trust, and instant clarity. The mark combines a shield or drop shape with a checkmark — representing the "proof sealed and dropped" moment. The blue-600 primary color (#2563EB) grounds the identity in professional trust and technical precision, echoing financial services and legal-tech visual language.

---

## 2. Primary Mark

### SVG Mark (Icon Only)
A stylized shield-drop hybrid: the top half forms a rounded shield, the bottom tapers to a point like a water drop. Inside: a bold white checkmark (representing PASS verification).

Colors:
- Fill: `#2563EB` (primary blue-600)
- Checkmark: `#FFFFFF`
- Drop shadow (optional): subtle `0 2px 4px rgba(37, 99, 235, 0.3)`

### Wordmark
- **Text**: "ProofDrop"
- Font: Inter
- "Proof": font-weight 700, color `#2563EB`
- "Drop": font-weight 400, color `#0F172A` (slate-900)
- No space between words — the color contrast creates the visual separation

### Full Logo (Mark + Wordmark)
Icon left of wordmark, baseline-aligned. 8px gap between mark and wordmark text. Used in navigation header.

---

## 3. Size Variants

| Variant | Mark Size | Wordmark Size | Usage |
|---|---|---|---|
| Full (large) | 32px × 32px | text-xl (20px) | Marketing hero |
| Full (default) | 24px × 24px | text-lg (18px) | Navigation header |
| Full (small) | 20px × 20px | text-base (16px) | Mobile nav |
| Mark only | 24px × 24px | — | Favicon, icon slots |
| Wordmark only | — | text-lg (18px) | Footer (space-constrained) |

---

## 4. Color Variants

| Variant | Background | Mark | Wordmark |
|---|---|---|---|
| Default (light bg) | White / Slate-50 | Blue-600 | Blue-600 + Slate-900 |
| Default (dark bg) | Slate-900 | Blue-500 | Blue-400 + Slate-100 |
| Monochrome | Any | Slate-900 or White | Matched foreground |
| Inverted | Blue-600 | White | White |

---

## 5. Favicon Specification

16×16 and 32×32: Just the shield-drop mark in blue-600 (#2563EB) on transparent background.
For ICO file: include 16×16, 32×32, and 48×48.
Apple touch icon (180×180): Full mark centered on white rounded background with 20px padding.

SVG favicon can be used as `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
Add PNG fallback: `<link rel="icon" href="/favicon.ico">`.

---

## 6. Implementation (React Component)

```tsx
// components/brand/site-logo.tsx
import Link from 'next/link'

interface SiteLogoProps {
  size?: 'sm' | 'md' | 'lg'
  wordmark?: boolean
  className?: string
}

export function SiteLogo({ size = 'md', wordmark = true, className }: SiteLogoProps) {
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg'

  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ''}`} aria-label="ProofDrop home">
      {/* Shield-drop SVG mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {/* Outer drop/shield shape */}
        <path
          d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
          fill="#2563EB"
        />
        {/* Inner checkmark */}
        <path
          d="M8.5 12l2.5 2.5 4.5-4.5"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {wordmark && (
        <span className={`font-sans ${textSize} leading-none select-none`}>
          <span className="font-bold text-primary">Proof</span>
          <span className="font-normal text-foreground">Drop</span>
        </span>
      )}
    </Link>
  )
}
```

---

## 7. Prohibited Uses

- Do not rotate or skew the mark
- Do not change the checkmark to an X (use proof-seal component for FAIL states)
- Do not use the mark in red or green (those colors are reserved for PASS/FAIL status indicators)
- Do not add text effects (shadows, outlines) to the wordmark
- Do not place the full logo on a patterned or low-contrast background
