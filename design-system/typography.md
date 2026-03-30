# ProofDrop — Typography Specification

## Font Stack

### Sans-serif (Body + UI)
**Inter** — 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- Source: Google Fonts
- Fallback: system-ui, -apple-system, sans-serif
- Use: All UI text, headings, body copy, labels, buttons

### Monospace (Hashes + Code)
**JetBrains Mono** — 400 (Regular)
- Source: Google Fonts
- Fallback: 'Fira Code', Consolas, 'Courier New', monospace
- Use: Receipt IDs, bundle hashes, SHA256 digests, code snippets

## Type Scale

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `text-xs` | 12px | 400 | 1.5 | Captions, metadata labels |
| `text-sm` | 14px | 400/500 | 1.5 | Secondary text, table cells, badges |
| `text-base` | 16px | 400 | 1.6 | Body copy, form labels |
| `text-lg` | 18px | 500/600 | 1.5 | Section headings, card titles |
| `text-xl` | 20px | 600 | 1.4 | Page sub-headings |
| `text-2xl` | 24px | 600/700 | 1.3 | Page headings |
| `text-3xl` | 30px | 700 | 1.25 | Hero sub-headline |
| `text-4xl` | 36px | 700 | 1.2 | Hero headline |
| `text-5xl` | 48px | 700 | 1.1 | Marketing hero only |

## Special Treatment

### Receipt IDs and Hashes
```
font-family: 'JetBrains Mono', monospace
font-size: 14px (text-sm)
letter-spacing: 0.025em (tracking-wide)
```
Always displayed in `.receipt-hash` or `.receipt-hash--highlighted` classes.

### Hero Headline
```
text-4xl md:text-5xl
font-weight: 700
line-height: 1.1
letter-spacing: -0.02em (tracking-tight)
color: text-foreground
```
Pattern: "Turn any AIVS proof bundle into a client-ready receipt in seconds"

### Status Labels (PASS/FAIL)
```
font-size: 14px (text-sm)
font-weight: 500
text-transform: uppercase
letter-spacing: 0.05em
```

## next/font/google Integration

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: '400',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
```

Then in tailwind.config.ts:
```ts
fontFamily: {
  sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
},
```
