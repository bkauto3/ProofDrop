# ProofDrop — Phase 5 E2E run summary

| Field | Value |
|-------|--------|
| **When** | 2026-03-31 (local run, `CI=true`) |
| **Runner** | Playwright 1.58.2, Chromium |
| **Config** | `playwright.config.ts` (webServer → `next dev` on port 3001) |
| **Results** | **35 passed**, 0 failed, 0 skipped |
| **Duration** | ~69s (machine JSON `stats.duration`) |

## Artifacts

- `playwright-report.json` — full machine report (same folder)
- `html/` — HTML report (gitignored as bulky); re-run `npx playwright test` to regenerate

## Billing smoke (local)

Tests assert unauthenticated `POST /api/stripe/checkout` and `POST /api/stripe/portal` return **401** or **403** (see `tests/proofdrop.spec.ts`).

## Note

`DATABASE_URL` in Playwright webServer env is a placeholder; Neon-backed routes log connection errors but tests allow expected status codes.
