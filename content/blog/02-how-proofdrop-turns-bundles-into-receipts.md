---
title: "How ProofDrop works — from bundle paste to permanent receipt URL"
description: "A straight-line walkthrough of verification, hashing, and the receipt page your clients actually open."
slug: "how-proofdrop-turns-bundles-into-receipts"
date: "2026-03-31"
keywords: ["ProofDrop", "AIVS verification", "receipt URL", "hash-stable ID", "NextAuth"]
---

# How ProofDrop works — from bundle paste to permanent receipt URL

ProofDrop is built around one promise: **paste an AIVS proof bundle, get a tamper-evident receipt you can share** — without asking your client to become a parser.

This walkthrough explains the pipeline in the order your team and your buyer experience it: **ingest → verify → persist → share → (optional) account.** It is written for engineers who need to explain the system to PMs, and for PMs who need to explain it to legal.

## Step 1 — Ingest

You paste JSON or upload a file. ProofDrop validates structure against an AIVS schema so garbage inputs fail fast with readable errors — not silent nonsense downstream.

Validation is the first gate because downstream verification assumes a coherent bundle. When validation fails, you get actionable messages: missing fields, wrong types, inconsistent signatures — the kind of feedback that saves hours of “why did this return 500?” debugging.

## Step 2 — Verify

The service runs deterministic verification using the shared `@protocol-factory/protocol-verifier` logic. You get a **PASS** or **FAIL** outcome plus structured reasons when something does not line up. This is not vibes-based QA; it is repeatable.

Determinism matters for disputes. If two parties run the same verifier version on the same bundle, they should reach the same **PASS/FAIL** conclusion. That is the foundation of “independent verification” — a phrase auditors actually care about.

## Step 3 — Hash and idempotency

The system derives a stable identifier from the bundle content. The same bundle always maps to the **same receipt identity**. That matters for invoices: you are not minting a new mystery URL every time someone re-uploads identical work.

Idempotency is a product feature, not just an implementation detail. It means your client can bookmark a receipt, your finance team can reference it in a PO line, and your future self can find it without searching Slack for “that one JSON file.”

## Step 4 — Receipt page

The public `/receipt/[id]` route shows what a human needs first: status, summary, timeline, verifier version. Raw bundle data stays available for technical review — but it is not the first screen your client sees.

That ordering is intentional. The first screen answers: *Did this pass? What does it mean? When was it verified?* Specialists can still drill into payload details — but the default path is human-friendly.

## Step 5 — Account value (optional)

Sign in with Google and you unlock history, exports, and higher limits — but **verification and reading a receipt do not require an account**. That keeps the tool useful in sales cycles where the buyer is not yet a user.

Account features are for **ongoing operations**: teams that verify frequently, need dashboards, or want billing and API access. The public path stays open so “try before you trust” is frictionless.

## API and webhooks (Pro-oriented)

For teams integrating ProofDrop into pipelines, the same verification semantics apply: submit a bundle, receive a receipt reference, and optionally register webhooks to push receipt events into your own systems. The exact surface area depends on your plan — see the live pricing page at [proofdrop.pro/pricing](https://proofdrop.pro/pricing).

## Why this architecture

Freelancers and agencies lose time to **re-explaining** the same bundle. A receipt link collapses that loop into one artifact: *here is the outcome, here is the trail, here is where to dig deeper.*

Security posture follows the same story: treat bundle content as untrusted input, render safely, verify signatures server-side, and never promise execution of untrusted payloads in the browser.

## What to do next

If you are evaluating ProofDrop for a team, run one real bundle through the public flow and send the receipt link to a colleague who was not in the room. If they understand the outcome without a meeting, you have proven the product thesis.

---

**CTA:** See it in action — verify your first bundle on [ProofDrop](https://proofdrop.pro) and send yourself the receipt link.
