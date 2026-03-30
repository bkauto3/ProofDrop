---
title: "How ProofDrop Works: From AIVS Bundle to Verified Receipt in 60 Seconds"
description: "A technical walkthrough of the ProofDrop verification pipeline — from AIVS bundle generation in your AI system to a publicly verifiable receipt URL that any third party can check."
author: ProofDrop Team
published: 2026-03-28
slug: how-proofdrop-works
tags: [aivs, how-it-works, technical, api, integration]
---

# How ProofDrop Works: From AIVS Bundle to Verified Receipt in 60 Seconds

ProofDrop is built around a single insight: AI verification should be as simple as generating a hash and as trustworthy as a public ledger. Here is exactly how the pipeline works, from your AI system's output to a verifiable receipt.

## Step 1: Your AI System Generates an AIVS Bundle

AIVS (AI Verifiable Signature) is an open protocol for AI system attestation. A bundle is a JSON document that captures the essential facts of an AI interaction in a format that can be verified without access to your infrastructure.

A minimal AIVS bundle looks like this:

```json
{
  "version": "1.0",
  "type": "aivs-bundle",
  "content_hash": "a3f1d2e4b5c6...",
  "captured_at": "2026-03-28T14:23:11.042Z",
  "operations": [
    {
      "id": "op_abc123",
      "type": "llm_call",
      "model": "gpt-4o",
      "timestamp": "2026-03-28T14:23:10.991Z",
      "input_hash": "sha256:d4e5f6...",
      "output_hash": "sha256:a1b2c3..."
    }
  ],
  "signatures": [],
  "metadata": {
    "producer": "acme-underwriting-service",
    "session_id": "sess_xyz789"
  }
}
```

The critical field is `content_hash` — a SHA-256 digest of the complete interaction payload. This ties the bundle irrevocably to the specific content it documents.

## Step 2: Upload the Bundle to ProofDrop

Once your system generates an AIVS bundle, upload it to ProofDrop via the API:

```bash
curl -X POST https://proofdrop.pro/api/verify \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bundle": "<your-aivs-bundle-json>"}'
```

ProofDrop performs immediate validation:

- Parses the bundle structure
- Verifies the `content_hash` matches the bundle payload
- Checks the `captured_at` timestamp is within acceptable bounds
- Validates all required fields are present and correctly typed

If validation passes, ProofDrop assigns a receipt ID using a deterministic algorithm:

```
receipt_id = "rcpt_" + sha256(bundle_content)[0:32]
```

The receipt ID is derived from the bundle content, not assigned randomly. The same bundle always produces the same receipt ID. This is intentional — it means any party with a copy of the original bundle can independently compute the receipt ID and verify it matches what ProofDrop recorded.

## Step 3: ProofDrop Issues a Timestamped Receipt

After validation, ProofDrop stores the bundle and returns a receipt:

```json
{
  "receipt_id": "rcpt_a3f1d2e4b5c6d7e8f9a0b1c2d3e4f5a6",
  "status": "verified",
  "verified_at": "2026-03-28T14:23:12.001Z",
  "content_hash": "a3f1d2e4b5c6...",
  "verification_url": "https://proofdrop.pro/receipt/rcpt_a3f1d2e4b5c6d7e8f9a0b1c2d3e4f5a6"
}
```

The `verification_url` is the shareable proof link. Anyone who receives this URL can verify the bundle's integrity without any credentials.

## Step 4: Independent Verification — No Account Required

The ProofDrop public verifier at `proofdrop.pro/verify` accepts any AIVS bundle submitted directly. It recomputes the content hash, checks the receipt record, and returns a verification result.

A regulator, auditor, or counterparty who receives your receipt URL sees:

- The receipt ID and timestamp
- The content hash and its verification status
- The operation record (model names, timestamps, operation count)
- A "VERIFIED" or "TAMPERED" status — computed independently of your systems

This is the key property: ProofDrop's verification infrastructure is operated by a neutral third party. When a verifier checks `proofdrop.pro/receipt/rcpt_...`, they are not accessing your systems. They are checking ProofDrop's independent record.

## The Security Model

ProofDrop's security rests on two properties:

**Hash immutability**: SHA-256 is computationally irreversible. Given a hash, you cannot construct a different input that produces the same hash. This means a PASS verification is a mathematical proof that the content matches — not a trust relationship.

**Timestamp anchoring**: ProofDrop records the server-side receipt timestamp independently of the `captured_at` field in the bundle. If there is ever a dispute about when a bundle was submitted, ProofDrop's receipt timestamp is the authoritative record.

These two properties together mean: once a bundle is uploaded and verified, no party — including ProofDrop — can alter the record of what was verified or when without detection.

## Integration Patterns

**Inline verification**: Add AIVS bundle generation directly to your LLM call wrapper. Every inference generates a bundle. Bundles are uploaded asynchronously so they don't add latency to the main request path.

**Batch verification**: Accumulate bundles over a session and upload at session end. Useful for interactive applications where generating a bundle per exchange would create overhead.

**Webhook delivery**: Configure a webhook in your ProofDrop dashboard. When a bundle is verified, ProofDrop POSTs the receipt to your endpoint. Use this to store receipt IDs in your own database alongside the application records they document.

## What ProofDrop Does Not Do

ProofDrop is not a logging system. It does not store the content of your AI interactions — only the bundle structure, which contains hashes of content, not the content itself.

ProofDrop is not a model governance platform. It does not manage model versions, deployments, or access controls. It documents what happened.

ProofDrop is not a substitute for your own audit infrastructure. Receipts complement your logging — they add a cryptographic layer on top of whatever records you already maintain.

## Getting Started

The fastest path to your first verified receipt:

1. Go to `proofdrop.pro` and paste any AIVS bundle JSON into the verifier widget
2. Click Verify — no account required
3. If you want to store receipts and share links, sign up for a free account (50 verifications/month)

For production integration, generate an API key in the dashboard and start uploading bundles from your pipeline. The Starter tier ($49/month) is sized for small to medium AI deployments. The Pro tier ($149/month) supports enterprise volumes with team access and SLA guarantees.

---

*ProofDrop is AIVS verification infrastructure for AI teams. Start verifying at [proofdrop.pro](https://proofdrop.pro).*
