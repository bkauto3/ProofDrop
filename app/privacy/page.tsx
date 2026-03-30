import type { Metadata } from 'next'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'ProofDrop Privacy Policy — how we collect, use, and protect your information.',
}

const EFFECTIVE_DATE = 'March 28, 2026'
const CONTACT_EMAIL = 'privacy@proofdrop.pro'

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProofDrop (&ldquo;ProofDrop,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website and services available at{' '}
              <a href="https://proofdrop.pro" className="text-primary hover:underline">proofdrop.pro</a> (the &ldquo;Service&rdquo;).
              ProofDrop provides AIVS (AI Verifiable Signature) proof bundle verification infrastructure for AI teams.
              This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>

            <h3 className="font-medium mb-2">2.1 Account Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account, we collect your email address and, if you sign in via Google OAuth,
              your Google profile name and profile photo URL. We do not receive your Google password.
              We do not collect payment card details directly — payments are processed by Stripe, Inc.
            </p>

            <h3 className="font-medium mb-2">2.2 AIVS Bundle Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you submit an AIVS proof bundle for verification, we store the bundle structure (including
              the content hash, operation metadata, and signatures) and a timestamped verification result.
              AIVS bundles are designed to contain <strong>hashes of content, not content itself</strong>.
              We strongly recommend that you do not include personally identifiable information (PII),
              confidential data, or sensitive personal data in bundle metadata fields.
              ProofDrop is not responsible for any sensitive information you choose to include in bundle payloads.
            </p>

            <h3 className="font-medium mb-2">2.3 Usage and Technical Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect standard server logs including IP addresses (truncated), browser user agent strings,
              request timestamps, and HTTP response codes. This data is retained for up to 90 days for
              security, debugging, and abuse prevention purposes. We use this data in aggregate to understand
              how the Service is used; we do not sell or share this data with third-party advertisers.
            </p>

            <h3 className="font-medium mb-2">2.4 Cookies and Session Data</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use a single authentication session cookie (&ldquo;next-auth.session-token&rdquo;) to maintain your
              logged-in state. We do not use third-party advertising cookies or tracking pixels.
              We may use a strictly necessary analytics cookie from our hosting provider (Vercel) to
              measure aggregate traffic. You may disable cookies in your browser, but this will prevent
              you from signing in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>To provide, operate, and maintain the Service</li>
              <li>To authenticate your identity and maintain your session</li>
              <li>To store and associate AIVS receipts with your account</li>
              <li>To process subscription payments through Stripe</li>
              <li>To send transactional emails (sign-in magic links, billing receipts)</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To comply with applicable law and legal process</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We do not sell your personal information. We do not use your data to train AI models.
              We do not share your data with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. AI-Specific Data Practices</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              ProofDrop is used by teams that operate AI systems. We take specific care with AI-related data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>We do not process, analyze, or read the content of your AI interactions.</strong>{' '}
                AIVS bundles are stored as structured JSON. We verify hashes; we do not interpret the
                underlying content those hashes represent.
              </li>
              <li>
                We do not use submitted AIVS bundles for model training, inference improvement,
                or any AI/ML purpose.
              </li>
              <li>
                Verification results (PASS/FAIL/ERROR) are computed deterministically from the bundle
                structure. No human reviewers inspect individual bundles except in response to a valid
                legal process or a reported security incident.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Service providers:</strong> We use Vercel (hosting), Neon (database), Stripe (payments),
                Resend (transactional email), and Google (OAuth). Each processes only the data necessary
                to provide their respective service.
              </li>
              <li>
                <strong>Public verification:</strong> Receipt IDs and verification results are publicly
                accessible via <code className="text-xs bg-muted px-1 py-0.5 rounded">/receipt/[id]</code> URLs.
                This is a core function of the Service. Do not submit bundles to ProofDrop if you do not
                wish the verification result to be publicly accessible.
              </li>
              <li>
                <strong>Legal process:</strong> We may disclose information if required by law, court order,
                or valid legal process from a government authority.
              </li>
              <li>
                <strong>Business transfers:</strong> If ProofDrop is acquired or merges with another company,
                your information may be transferred as part of that transaction. We will notify you before
                your information is transferred and becomes subject to a different privacy policy.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Account data: retained while your account is active, deleted within 30 days of account deletion request</li>
              <li>AIVS receipts (Free tier): retained for 12 months</li>
              <li>AIVS receipts (Starter tier): retained for 12 months</li>
              <li>AIVS receipts (Pro tier): retained per your configured retention period (default 36 months)</li>
              <li>Server logs: retained for 90 days</li>
              <li>Stripe payment records: retained per Stripe&apos;s data retention policy and applicable financial regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including TLS encryption in transit,
              encrypted-at-rest database storage, bcrypt-hashed session tokens, and Content Security Policy headers.
              AIVS receipt data is protected by hash verification — any tampering with stored records is
              detectable by re-running verification against the original bundle.
              No security measure is perfect. If you discover a security vulnerability in ProofDrop,
              please contact us at <a href={`mailto:security@proofdrop.pro`} className="text-primary hover:underline">security@proofdrop.pro</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProofDrop infrastructure is hosted in the United States (Vercel, Neon — US East region).
              If you access the Service from the European Economic Area, United Kingdom, or other regions
              with data transfer restrictions, your data will be processed in the United States.
              By using the Service, you consent to this transfer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated personal data</li>
              <li><strong>Portability:</strong> Request your receipt data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise these rights, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not directed to children under 16. We do not knowingly collect personal
              information from children under 16. If you believe a child has provided personal information
              to us, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the new policy on this page and updating the effective date. For significant
              changes, we will send an email notification to your registered address.
              Continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions, data requests, or concerns, contact us at:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>
      </main>
      <SiteFooter />
    </>
  )
}
