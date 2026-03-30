# ProofDrop — Tailwind Integration Notes (A5)

Generated: 2026-03-28

## Detected/Declared Version: 3.x

Using `tailwind.config.ts` format (not v4 @theme).

---

## Tailwind v3: tailwind.config.ts Format

All color tokens map to CSS variable references using `hsl(var(--token))` pattern.

```
primary    → hsl(var(--primary))
background → hsl(var(--background))
etc.
```

## Content Paths

```
content: [
  './pages/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './app/**/*.{ts,tsx}',
  './src/**/*.{ts,tsx}',
]
```

## Safelist Requirements

No dynamic class generation in ProofDrop. All status classes are static:
- `status-pass-badge` — used in JSX as className string
- `status-fail-badge` — used in JSX as className string
- `proof-seal` / `proof-seal--fail` — used in JSX
- `receipt-card` / `receipt-hash` / `receipt-hash--highlighted` — used in JSX

Safelist = [] (all classes used statically)

## Custom Animations Required

```js
// In tailwind.config.ts extend:
animation: {
  shimmer: 'shimmer 2s linear infinite',
},
keyframes: {
  shimmer: {
    '0%, 100%': { backgroundPosition: '200% center' },
    '50%': { backgroundPosition: '0% center' },
  },
},
backgroundSize: {
  '200': '200%',
},
```

## Font Families Required

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
},
```

## Custom CSS Variables for ProofDrop

These are ProofDrop-specific tokens added to `:root` beyond base shadcn tokens:
- `--receipt-bg`
- `--receipt-border`
- `--proof-seal-pass`
- `--proof-seal-fail`
- `--hash-bg`
- `--hash-fg`
- `--audit-dot-pass`
- `--audit-dot-fail`
- `--shimmer-from`
- `--shimmer-to`
- `--success` (not in default shadcn, required for ProofDrop)
- `--success-foreground`
- `--warning`
- `--warning-foreground`

## Dark Mode Strategy

Using `darkMode: ['class']` — shadcn's `.dark` class on `<html>` element.
NextAuth theme provider wraps app; dark mode toggle not required at launch (light-mode-first).
