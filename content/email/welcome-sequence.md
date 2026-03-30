# ProofDrop Email Welcome Sequence
# 3-Email Series: Onboard → Value → Upsell

---

## Email 1: Welcome / Onboard (Send immediately on signup)

**Subject**: Your ProofDrop account is ready — verify your first bundle in 60 seconds

**From**: ProofDrop Team <hello@proofdrop.pro>

---

Hi {{first_name}},

Your ProofDrop account is active. Here's how to generate your first verified receipt in the next 60 seconds.

**Step 1: Get an AIVS bundle**

If you don't have one yet, paste this test bundle into the verifier:

```json
{
  "version": "1.0",
  "type": "aivs-bundle",
  "content_hash": "a3f1d2e4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2",
  "captured_at": "2026-03-28T14:23:11.042Z",
  "operations": [
    {
      "id": "op_demo_001",
      "type": "llm_call",
      "model": "gpt-4o",
      "timestamp": "2026-03-28T14:23:10.991Z"
    }
  ],
  "signatures": [],
  "metadata": {"producer": "demo"}
}
```

**Step 2: Go to proofdrop.pro/dashboard**

Paste the bundle into the verifier and click Verify. You'll get back a receipt ID and a permanent verification URL.

**Step 3: Share the URL**

Send the receipt URL to anyone who needs to verify the interaction. They check it independently — no account required.

That's it. Your AI system now produces cryptographically verifiable proof.

**What's next:**
- [Generate your API key →](https://proofdrop.pro/dashboard) — needed for programmatic bundle uploads
- [Read the integration guide →](https://proofdrop.pro/about) — Python, TypeScript, and Go examples
- [Browse your receipts →](https://proofdrop.pro/dashboard) — all verified bundles in one place

Your free tier includes 50 verifications per month. Most teams find they can start meaningful production coverage within that limit.

Welcome to the protocol.

— The ProofDrop Team

---

## Email 2: Value Delivery (Send Day 3)

**Subject**: The 3 scenarios where your ProofDrop receipts will matter most

**From**: ProofDrop Team <hello@proofdrop.pro>

---

Hi {{first_name}},

You've had a few days to explore ProofDrop. I want to share the three scenarios where customers tell us the receipts made the biggest difference.

**Scenario 1: The regulatory audit that took 4 hours instead of 3 weeks**

A fintech team using AI for credit risk assessment got an unexpected regulatory examination request. The examiner wanted to see evidence of model behavior on 200 specific decisions over a 6-month window.

Teams without AIVS receipts typically spend 2-4 weeks on this kind of reconstruction — pulling engineer time to correlate log fragments, rebuild timelines, and prepare exhibits. This team spent 4 hours. They had receipt URLs for every decision. The examiner verified them independently via the public verifier.

**Scenario 2: The contract dispute that didn't happen**

An enterprise software company deployed an AI recommendation system for a large customer. The customer claimed the system recommended Option A when the contract required it to recommend Option B under specified conditions.

The company's engineers pulled the ProofDrop receipt for the interaction in question. The receipt showed the exact inputs and outputs. The customer's team verified it independently. The dispute resolution call lasted 20 minutes instead of producing a lawsuit.

**Scenario 3: The internal investigation with an answer**

A healthcare tech team discovered their AI clinical decision support system had been behaving unexpectedly between two deployment dates. They needed to know: when did the behavior change, and which specific interactions were affected?

With AIVS receipts, they could query their ProofDrop records by date range and compare content hashes across deployments. Without receipts, this investigation would have required manual log triage across multiple systems. With receipts, it was a database query.

---

None of these teams bought ProofDrop for a specific known scenario. They instrumented their AI systems because they knew disputes, audits, and investigations happen — and they wanted to be ready when they did.

What AI workflows are you most concerned about being able to verify? Reply to this email — I read every response and will point you toward the right integration pattern.

— Ben
ProofDrop Team

---

## Email 3: Upsell (Send Day 7)

**Subject**: Are you approaching your verification limit?

**From**: ProofDrop Team <hello@proofdrop.pro>

---

Hi {{first_name}},

Quick check-in: if your free tier is running low (50 verifications/month), this is the right time to upgrade before you hit any gaps in coverage.

**ProofDrop Starter — $49/month**
- 5,000 bundle verifications/month
- Full API access for programmatic uploads
- Receipt webhooks (POST receipts to your system as they're created)
- 12-month receipt retention

**ProofDrop Pro — $149/month**
- 50,000 bundle verifications/month
- Team access (invite colleagues to the dashboard)
- Priority support with 4-hour SLA
- Custom receipt retention periods

Most engineering teams start on Starter and move to Pro when they expand beyond a single AI workflow.

**The math is simple:**

If AIVS verification prevents one regulatory inquiry requiring external counsel, you've saved 50–500× the annual cost of a Pro subscription. The ROI case writes itself.

[Upgrade to Starter →](https://proofdrop.pro/pricing)
[Upgrade to Pro →](https://proofdrop.pro/pricing)

Or if you're still evaluating: what's holding you back? Reply to this email with your specific situation and I'll give you a direct recommendation.

— Ben
ProofDrop Team

P.S. If your free tier is working fine for your current usage, no pressure. The free tier is genuinely free — not a trial. Stay on it as long as it fits.

---

## Launch Announcement Email (To existing list)

**Subject**: ProofDrop is live: AIVS proof bundle verification for AI teams

**From**: ProofDrop Team <hello@proofdrop.pro>

---

We built ProofDrop to solve one problem: AI teams can't prove what their systems actually did.

Server logs are mutable. Screenshots are inadmissible. Manual records don't survive regulatory scrutiny.

ProofDrop gives you cryptographic proof — AIVS bundle generation, storage, and public verification infrastructure that any third party can check without accessing your systems.

**Today: ProofDrop is live at proofdrop.pro**

→ Free public verifier — paste any AIVS bundle, get a verification result instantly, no account needed
→ Free tier — 50 verifications/month, permanent receipt URLs, shareable proof links
→ Starter ($49/month) — 5,000 verifications/month, full API, webhooks
→ Pro ($149/month) — 50,000 verifications/month, team access, priority support

If your AI systems have any external accountability requirements — regulatory, contractual, or operational — AIVS verification is the infrastructure layer you've been missing.

[Verify your first bundle →](https://proofdrop.pro)

— The ProofDrop Team
