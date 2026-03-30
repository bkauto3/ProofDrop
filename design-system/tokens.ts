/**
 * ProofDrop Design System Tokens (B4)
 * Generated: 2026-03-28
 * Source of truth: design-tokens.json
 * DO NOT edit manually — update design-tokens.json instead.
 */

/** CSS variable reference helper */
const cssVar = (name: string) => `hsl(var(${name}))` as const
const rawVar = (name: string) => `var(${name})` as const

// === Tier 2: Semantic color tokens ===
// Always use these in component code — never raw hex values.
export const colors = {
  background:             cssVar('--background'),
  foreground:             cssVar('--foreground'),
  primary:                cssVar('--primary'),
  primaryForeground:      cssVar('--primary-foreground'),
  secondary:              cssVar('--secondary'),
  secondaryForeground:    cssVar('--secondary-foreground'),
  destructive:            cssVar('--destructive'),
  destructiveForeground:  cssVar('--destructive-foreground'),
  success:                cssVar('--success'),
  successForeground:      cssVar('--success-foreground'),
  warning:                cssVar('--warning'),
  warningForeground:      cssVar('--warning-foreground'),
  muted:                  cssVar('--muted'),
  mutedForeground:        cssVar('--muted-foreground'),
  accent:                 cssVar('--accent'),
  accentForeground:       cssVar('--accent-foreground'),
  border:                 cssVar('--border'),
  input:                  cssVar('--input'),
  ring:                   cssVar('--ring'),
  card:                   cssVar('--card'),
  cardForeground:         cssVar('--card-foreground'),
  popover:                cssVar('--popover'),
  popoverForeground:      cssVar('--popover-foreground'),
} as const

// === Tier 3: ProofDrop-specific component tokens ===
export const receiptTokens = {
  bg:               cssVar('--receipt-bg'),
  border:           cssVar('--receipt-border'),
  hashBg:           cssVar('--hash-bg'),
  hashFg:           cssVar('--hash-fg'),
} as const

export const sealTokens = {
  pass:             cssVar('--proof-seal-pass'),
  fail:             cssVar('--proof-seal-fail'),
} as const

export const auditTokens = {
  dotPass:          cssVar('--audit-dot-pass'),
  dotFail:          cssVar('--audit-dot-fail'),
} as const

// === Radius tokens ===
export const radius = {
  lg: rawVar('--radius'),
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)',
} as const

// === Typography tokens ===
export const fonts = {
  sans: 'Inter, system-ui, sans-serif',
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
} as const

// === Primitive brand colors (for metadata/SEO only — use tokens in UI) ===
export const brandPrimitives = {
  primaryHex:   '#2563EB',
  primaryDark:  '#1D4ED8',
  successHex:   '#16A34A',
  errorHex:     '#DC2626',
  warningHex:   '#D97706',
  bgHex:        '#F8FAFC',
  surfaceHex:   '#FFFFFF',
  borderHex:    '#E2E8F0',
} as const

export type ColorToken = keyof typeof colors
export type RadiusToken = keyof typeof radius
export type FontToken = keyof typeof fonts
