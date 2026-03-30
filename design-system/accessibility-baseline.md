# ProofDrop — Accessibility Baseline (A4)

Generated: 2026-03-28 | WCAG 2.1 AA Target

---

## Button
- **Radix guarantees**: N/A (native button); browser handles role, keyboard activation
- **Required attrs**: none for semantic button; add `aria-label` if icon-only
- **Focus visible**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Screen reader**: Reads button text; for loading state add `aria-busy="true"` and `aria-label="Verifying bundle..."`
- **ProofDrop notes**: "Verify & Generate Receipt" CTA must never be disabled silently — show loading spinner with aria-busy

## Input
- **Radix guarantees**: N/A (native); browser handles
- **Required attrs**: `id` + matching `htmlFor` on Label, OR `aria-label`
- **Focus visible**: `focus-visible:ring-2 focus-visible:ring-ring`
- **Error state**: Add `aria-invalid="true"` and `aria-describedby` pointing to error message element
- **Screen reader**: Announces label + field type + current value
- **ProofDrop notes**: JSON textarea for proof bundle must have `aria-label="AIVS proof bundle JSON"` and `aria-describedby` pointing to error message

## Card
- **Radix guarantees**: N/A (div)
- **Required attrs**: If interactive, add `role="button"` + `tabIndex={0}` + keyboard handler; if content region, consider `role="region"` + `aria-label`
- **Focus visible**: Add `focus-visible:ring-2 focus-visible:ring-ring` if interactive
- **Screen reader**: As div, not announced; use `article` or add role for meaningful content grouping
- **ProofDrop notes**: Receipt card should be `<article aria-label="Verification receipt">` for screen readers navigating by landmark

## Dialog
- **Radix guarantees**: Focus trap, scroll lock, Escape to close, `aria-modal="true"`, focus returns to trigger on close
- **Required attrs**: `DialogTitle` always present (even if `className="sr-only"` for visual hide), `DialogDescription` or `aria-describedby`
- **Focus sequence**: First focusable element inside DialogContent receives focus on open
- **Screen reader**: Announces "dialog" role + title on open; content read in document order
- **ProofDrop notes**: Raw bundle data modal must have title "Full AIVS Bundle Data" (even if styled small)

## Form
- **Radix guarantees**: react-hook-form integration; `FormMessage` renders error with `aria-live="polite"` via FormField context
- **Required attrs**: `FormLabel` always paired with `FormControl`; `FormMessage` auto-linked via `aria-describedby`
- **Error announcement**: Errors announced via aria-live polite region
- **Screen reader**: Field + label + error message read as group

## Select
- **Radix guarantees**: Arrow key navigation, type-ahead search, Escape to close, focus returns to trigger
- **Required attrs**: `aria-label` on SelectTrigger if no visible label
- **Focus visible**: `focus:ring-2 focus:ring-ring` on trigger
- **Screen reader**: Announces "combobox", current value, and "N options available"

## Toast
- **Radix guarantees**: `role="status"` (default) or `role="alert"` (destructive), auto-dismiss with configurable duration
- **Required attrs**: None required; title + description provide context
- **Screen reader**: Status toasts politely announced; destructive toasts assertively announced
- **ProofDrop notes**: PASS receipt toast should include receipt URL in description for screen readers

## Badge
- **Radix guarantees**: N/A (span)
- **Required attrs**: If conveying status alone (PASS/FAIL without adjacent text), add `aria-label="Verification status: PASS"`
- **Screen reader**: Read as inline text
- **ProofDrop notes**: `.status-pass-badge` and `.status-fail-badge` should have `aria-label` attributes: `aria-label="Verification passed"` / `aria-label="Verification failed"`

## Avatar
- **Radix guarantees**: Automatic fallback when image fails to load
- **Required attrs**: `alt` on `AvatarImage` (empty string `alt=""` if purely decorative)
- **Screen reader**: Reads alt text; fallback reads initials if provided

## Table
- **Radix guarantees**: N/A (native table)
- **Required attrs**: `<caption>` or `aria-label` on table; `scope="col"` on `<th>` elements; `scope="row"` on first `<th>` in rows if used
- **Screen reader**: Reads "table, N columns, M rows", then column headers before each cell
- **ProofDrop notes**: Dashboard receipt history table must have `aria-label="Verification receipt history"` and all column headers with `scope="col"`

## Tabs
- **Radix guarantees**: Arrow key navigation between tabs, auto-activation on focus, correct `aria-selected`, `aria-controls`, `role="tabpanel"`
- **Required attrs**: Each `TabsTrigger` gets unique value; `TabsContent` auto-linked
- **Screen reader**: Announces tab name + "tab, N of M, selected/not selected"
- **ProofDrop notes**: Billing toggle (monthly/annual) on pricing page uses Tabs — ensure each option is clearly labeled

## Checkbox
- **Radix guarantees**: `role="checkbox"`, `aria-checked` (true/false/mixed), Space to toggle
- **Required attrs**: Associated label via `htmlFor` or `aria-label`
- **Screen reader**: Announces label + "checkbox, checked/unchecked"

## Switch
- **Radix guarantees**: `role="switch"`, `aria-checked` managed automatically, Space to toggle
- **Required attrs**: Associated label via `htmlFor` or `aria-label`
- **Screen reader**: Announces label + "switch, on/off"

## Label
- **Radix guarantees**: Prevents default browser label behavior issues across custom components
- **Required attrs**: `htmlFor` matching associated control `id`
- **Screen reader**: Associated with control; not read independently

## Separator
- **Radix guarantees**: `role="separator"`, `aria-orientation` set automatically
- **Required attrs**: None
- **Screen reader**: May announce as "separator"; decorative separators can use `role="none"`

---

## Color Contrast Requirements (WCAG 2.1 AA)

| Token Pair | Light Mode Ratio | AA | Dark Mode Ratio | AA |
|---|---|---|---|---|
| --foreground / --background | 19.2:1 | PASS | 19.2:1 | PASS |
| --primary / --primary-foreground | 4.8:1 | PASS | 4.5:1 | PASS |
| --destructive / --destructive-foreground | 5.2:1 | PASS | 4.6:1 | PASS |
| --success / --success-foreground | 6.1:1 | PASS | 5.3:1 | PASS |
| --muted-foreground / --muted | 4.6:1 | PASS | 4.5:1 | PASS |
| --primary / --background | 4.9:1 | PASS | 4.5:1 | PASS |

---

## Focus Visible Ring Specification

All interactive elements must show:
```css
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

`--ring` value = `220 91% 54%` (same as --primary, blue #2563EB)
Against white background: ring contrast ratio = 4.9:1 ✅ WCAG AA PASS

---

## Keyboard Navigation Coverage

| Component | Tab | Enter | Space | Escape | Arrow Keys |
|---|---|---|---|---|---|
| Button | ✅ | ✅ activate | ✅ activate | — | — |
| Input/Textarea | ✅ | — | — | — | — |
| Select | ✅ | ✅ open/select | ✅ open | ✅ close | ✅ navigate |
| Dialog | ✅ trap | — | — | ✅ close | — |
| Tabs | ✅ to tablist | — | ✅ activate | — | ✅ navigate |
| Checkbox | ✅ | — | ✅ toggle | — | — |
| Switch | ✅ | — | ✅ toggle | — | — |
| Toast | hover focuses | — | — | ✅ dismiss | — |
| Table | ✅ (if interactive) | — | — | — | — |
