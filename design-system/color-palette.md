# ProofDrop — Color Palette

## Primary Brand Color
**Hue: 220° | Saturation: 91% | Lightness: 54%**
Primary hex: `#2563EB` (blue-600)
Primary dark: `#1D4ED8` (blue-700)
CSS variable: `--primary: 220 91% 54%`
HSL: `hsl(220, 91%, 54%)`

## Full Palette

### Blue (Primary — Hue 220°)
| Token | Hex | HSL | Use |
|---|---|---|---|
| blue-50 | `#EFF6FF` | `220 91% 97%` | Hash highlight bg, primary/10 fills |
| blue-100 | `#DBEAFE` | `220 91% 94%` | Hover states on light bg |
| blue-200 | `#BFDBFE` | `220 91% 87%` | Active state fills |
| blue-500 | `#3B82F6` | `220 91% 60%` | Dark mode primary |
| blue-600 | `#2563EB` | `220 91% 54%` | **Primary** |
| blue-700 | `#1D4ED8` | `220 83% 46%` | Primary hover/dark |
| blue-800 | `#1E40AF` | `220 83% 40%` | Pressed states |

### Slate (Neutral)
| Token | Hex | HSL | Use |
|---|---|---|---|
| slate-50 | `#F8FAFC` | `210 40% 98%` | Page background |
| slate-100 | `#F1F5F9` | `215 20% 95%` | Muted fills, skeleton |
| slate-200 | `#E2E8F0` | `214 32% 91%` | Borders |
| slate-300 | `#CBD5E1` | `213 27% 84%` | Dividers |
| slate-500 | `#64748B` | `215 16% 47%` | Muted text |
| slate-700 | `#334155` | `215 25% 27%` | Secondary headings |
| slate-900 | `#0F172A` | `222 47% 11%` | Primary text |

### Green (Success / PASS)
| Token | Hex | HSL | Use |
|---|---|---|---|
| green-50 | `#F0FDF4` | `142 76% 97%` | PASS badge bg |
| green-100 | `#DCFCE7` | `142 77% 93%` | PASS seal bg |
| green-600 | `#16A34A` | `142 72% 36%` | **PASS status color** |
| green-700 | `#15803D` | `142 72% 30%` | PASS hover |

### Red (Error / FAIL)
| Token | Hex | HSL | Use |
|---|---|---|---|
| red-50 | `#FEF2F2` | `0 86% 97%` | FAIL badge bg |
| red-100 | `#FEE2E2` | `0 86% 94%` | FAIL seal bg |
| red-600 | `#DC2626` | `0 86% 50%` | **FAIL status color** |
| red-700 | `#B91C1C` | `0 78% 42%` | FAIL hover |

### Amber (Warning)
| Token | Hex | HSL | Use |
|---|---|---|---|
| amber-500 | `#F59E0B` | `38 92% 50%` | Warning state |
| amber-600 | `#D97706` | `38 92% 44%` | Warning text |

## Semantic Mapping

| Semantic Token | Light | Dark | Purpose |
|---|---|---|---|
| Background | slate-50 | slate-950 tinted | Page background |
| Surface | white | slate-900 tinted | Card backgrounds |
| Primary | blue-600 | blue-500 | CTAs, links, focus |
| Success | green-600 | green-500 | PASS verification |
| Error | red-600 | red-500 | FAIL verification |
| Warning | amber-600 | amber-500 | Partial/warning |
| Text | slate-900 | slate-50 | Primary text |
| Muted Text | slate-500 | slate-400 | Secondary text |
| Border | slate-200 | blue-950 tinted | Card/input borders |

## Color Usage Rules

1. **Never use raw hex values in component code** — always use CSS variables or Tailwind tokens
2. **PASS = green only** — never use blue for PASS status
3. **FAIL = red only** — never use orange/amber for FAIL
4. **Primary = blue-600 in light mode** — use blue-500 in dark mode for adequate contrast
5. **Receipt cards** use `--receipt-border` (blue-tinted slate-200), not plain slate-200
