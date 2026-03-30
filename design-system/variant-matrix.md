# ProofDrop — Variant Matrix (A3)

Generated: 2026-03-28 | Brand: ProofDrop | Primary: #2563EB (hue 220°)

---

## Button Variant Matrix

| Variant | Default | Hover | Focus-Visible | Disabled | Active |
|---|---|---|---|---|---|
| default | bg-primary text-primary-foreground | bg-primary/90 | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | bg-primary/80 |
| destructive | bg-destructive text-destructive-foreground | bg-destructive/90 | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | bg-destructive/80 |
| outline | border border-input bg-background | bg-accent text-accent-foreground | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | bg-accent |
| secondary | bg-secondary text-secondary-foreground | bg-secondary/80 | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | bg-secondary/80 |
| ghost | transparent | bg-accent text-accent-foreground | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | bg-accent/80 |
| link | text-primary underline-offset-4 | underline | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed | text-primary/80 |

## Input Variant Matrix

| Variant | Default | Hover | Focus-Visible | Disabled | Error |
|---|---|---|---|---|---|
| default | border border-input bg-background | border-primary/50 | ring-2 ring-ring ring-offset-0 border-primary | opacity-50 cursor-not-allowed bg-muted | border-destructive ring-destructive/30 |

## Card Variant Matrix

| Variant | Default | Hover | Focus (if interactive) |
|---|---|---|---|
| default | bg-card border border-border shadow-sm | (static — no hover) | outline-none ring-2 ring-ring |
| receipt | bg-[--receipt-bg] border border-[--receipt-border] shadow-sm | (static) | N/A |

## Dialog Variant Matrix

| State | Default | Open | Close |
|---|---|---|---|
| overlay | hidden | bg-black/50 backdrop-blur-sm animate-in fade-in | animate-out fade-out |
| content | hidden | animate-in slide-in-from-bottom-2 | animate-out slide-out-to-bottom-2 |

## Select Variant Matrix

| State | Default | Open | Focus | Disabled |
|---|---|---|---|---|
| trigger | border border-input bg-background | border-primary | ring-2 ring-ring ring-offset-0 | opacity-50 cursor-not-allowed |
| item | transparent | bg-accent text-accent-foreground | bg-accent | N/A |

## Toast Variant Matrix

| Variant | Default | Destructive |
|---|---|---|
| container | bg-background border border-border shadow-md | bg-destructive text-destructive-foreground border-destructive |
| action | N/A | border-destructive-foreground/30 hover:border-destructive-foreground/50 |

## Badge Variant Matrix

| Variant | Default | Secondary | Destructive | Outline |
|---|---|---|---|---|
| default | bg-primary text-primary-foreground | bg-secondary text-secondary-foreground | bg-destructive text-destructive-foreground | border border-current bg-transparent |
| status-pass (custom) | bg-success/10 text-success border border-success/20 | — | — | — |
| status-fail (custom) | bg-destructive/10 text-destructive border border-destructive/20 | — | — | — |

## Avatar Variant Matrix

| State | Default | Fallback |
|---|---|---|
| image | object-cover rounded-full | hidden |
| fallback | bg-muted text-muted-foreground rounded-full flex items-center justify-center | shown when image fails |

## Table Variant Matrix

| Element | Default | Hover Row | Selected Row |
|---|---|---|---|
| th | border-b border-border bg-muted/50 text-muted-foreground font-medium | N/A | N/A |
| td | border-b border-border | bg-muted/30 | bg-primary/5 |
| row | transparent | bg-muted/30 | bg-primary/5 |

## Tabs Variant Matrix

| State | Default (inactive) | Active | Focus-Visible | Hover |
|---|---|---|---|---|
| trigger | text-muted-foreground | bg-background text-foreground shadow-sm | ring-2 ring-ring ring-offset-1 | text-foreground |
| content | hidden | block | N/A | N/A |

## Checkbox Variant Matrix

| State | Default (unchecked) | Checked | Indeterminate | Focus | Disabled |
|---|---|---|---|---|---|
| box | border border-primary/40 bg-background | bg-primary border-primary | bg-primary/70 border-primary | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed |
| indicator | hidden | text-primary-foreground | text-primary-foreground | N/A | N/A |

## Switch Variant Matrix

| State | Default (off) | On | Focus | Disabled |
|---|---|---|---|---|
| track | bg-input | bg-primary | ring-2 ring-ring ring-offset-2 | opacity-50 cursor-not-allowed |
| thumb | bg-background shadow-sm | bg-background shadow-sm translate-x-full | N/A | N/A |

## Label Variant Matrix

| State | Default | Peer-disabled |
|---|---|---|
| default | text-sm font-medium leading-none | opacity-70 cursor-not-allowed |

## Separator Variant Matrix

| Variant | Default |
|---|---|
| horizontal | w-full h-px bg-border |
| vertical | h-full w-px bg-border |

---

## ProofDrop Custom Classes

| Class | Purpose | Key Styles |
|---|---|---|
| `.receipt-card` | Receipt display container | bg-[--receipt-bg] border border-[--receipt-border] rounded-lg shadow-sm |
| `.proof-seal` | Circular PASS/FAIL badge in header | rounded-full w-16 h-16 flex items-center justify-center bg-success/10 text-success border-2 border-success |
| `.proof-seal--fail` | FAIL variant of seal | bg-destructive/10 text-destructive border-2 border-destructive |
| `.receipt-hash` | Monospace hash/ID display | font-mono text-sm bg-[--hash-bg] text-[--hash-fg] px-2 py-0.5 rounded |
| `.receipt-hash--highlighted` | Highlighted receipt ID | font-mono font-medium bg-primary/10 text-primary px-3 py-1 rounded border border-primary/20 |
| `.audit-trail` | Vertical audit step container | flex flex-col gap-0 relative |
| `.audit-trail-item` | Single audit step | flex gap-3 pb-4 relative |
| `.status-pass-badge` | PASS status badge | inline-flex items-center gap-1 bg-success/10 text-success border border-success/20 rounded-full px-3 py-1 text-sm font-medium |
| `.status-fail-badge` | FAIL status badge | inline-flex items-center gap-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full px-3 py-1 text-sm font-medium |
| `.animate-shimmer` | Loading shimmer animation | animate-shimmer bg-gradient-to-r from-[--shimmer-from] via-[--shimmer-to] to-[--shimmer-from] bg-size-200 |
