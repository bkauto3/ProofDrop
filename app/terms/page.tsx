import type { Metadata } from 'next'
import { SiteNav } from '@/components/nav/site-nav'
import { SiteFooter } from '@/components/footer/site-footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'ProofDrop Terms of Service — the agreement between you and ProofDrop.',
}

const EFFECTIVE_DATE = 'March 28, 2026'
const CONTACT_EMAIL = 'legal@proofdrop.pro'

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main role="main" className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-lg font-semibold mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ProofDrop (&ldquo;the Service&rdquo;) at{' '}
              <a href="https://proofdrop.pro" className="text-primary hover:underline">proofdrop.pro</a>,
              you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
              If you do not agree to these Terms, do not use the Service.
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProofDrop provides AIVS (AI Verifiable Signature) proof bundle verification infrastructure.
              The Service allows users to submit, store, and publicly verify AIVS-format proof bundles
              documenting AI system interactions. ProofDrop issues timestamped cryptographic receipts
              that serve as independently verifiable records of those interactions.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>ProofDrop does not provide legal advice.</strong> Receipts issued by ProofDrop are
              technical attestations of data integrity. Their admissibility, evidentiary weight, and legal
              validity in any jurisdiction or proceeding is determined by applicable law and the circumstances
              of each case. You should consult qualified legal counsel before relying on ProofDrop receipts
              for legal, regulatory, or compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To access certain features you must create an account. You may sign in using Google OAuth
              or a magic link sent to your email address. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Maintaining the security of your account credentials and session</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately at <a href="mailto:security@proofdrop.pro" className="text-primary hover:underline">security@proofdrop.pro</a> of any unauthorized access</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You must be at least 18 years old to create an account. Accounts may not be shared,
              sold, or transferred without our written consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Submit AIVS bundles containing false, fabricated, or misleading attestations</li>
              <li>Use the Service to verify AI interactions that were not conducted by your authorized systems</li>
              <li>Attempt to forge, manipulate, or circumvent the cryptographic verification mechanisms</li>
              <li>Submit bundles containing personal data without a lawful basis for processing under applicable privacy law</li>
              <li>Use the Service to facilitate fraud, deception, or evasion of legal obligations</li>
              <li>Reverse-engineer, decompile, or attempt to extract the Service&apos;s source code</li>
              <li>Use automated tools to submit bundles in excess of your plan&apos;s rate limits</li>
              <li>Resell or sublicense access to the Service without our written consent</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Subscription Plans and Billing</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Service is offered on the following tiers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Free:</strong> 50 bundle verifications per month, no charge</li>
              <li><strong>Starter:</strong> 5,000 bundle verifications per month, billed monthly or annually</li>
              <li><strong>Pro:</strong> 50,000 bundle verifications per month, billed monthly or annually</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Paid subscriptions are billed in advance on a recurring basis. Payments are processed by
              Stripe, Inc. and subject to Stripe&apos;s terms. You authorize us to charge your payment method
              on each billing cycle.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Cancellation:</strong> You may cancel your subscription at any time via the billing portal.
              Cancellation takes effect at the end of the current billing period. No refunds are issued for
              partial periods except where required by law.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>Price changes:</strong> We will provide at least 30 days&apos; notice before changing
              subscription prices. Continued use after the price change takes effect constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data Ownership and Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Your data:</strong> You retain all rights to AIVS bundles and data you submit to the Service.
              By submitting data, you grant ProofDrop a limited, non-exclusive license to store, process,
              and display that data solely as necessary to provide the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>Public receipts:</strong> By submitting a bundle for verification, you acknowledge that
              the resulting receipt (receipt ID, verification status, content hash, and operation metadata)
              will be publicly accessible. Do not submit bundles if you require the verification result
              to remain confidential.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Service IP:</strong> The Service, including its design, code, algorithms, and branding,
              is owned by ProofDrop and protected by applicable intellectual property laws.
              Nothing in these Terms grants you any right to use ProofDrop&apos;s trademarks, logos, or branding.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Confidentiality of Submitted Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for ensuring that AIVS bundles you submit do not contain
              confidential, privileged, or sensitive information that you do not intend to make
              accessible via public receipt URLs. ProofDrop is not liable for any exposure of
              information included in bundle payloads that you choose to submit.
              For bundles containing sensitive metadata, we recommend pre-hashing all sensitive fields
              before inclusion in the bundle and retaining the mapping offline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT
              VERIFICATION RESULTS WILL BE LEGALLY SUFFICIENT FOR ANY PARTICULAR PURPOSE.
              PROOFDROP RECEIPTS ARE TECHNICAL ATTESTATIONS AND DO NOT CONSTITUTE LEGAL ADVICE,
              LEGAL OPINIONS, OR ADMISSIBLE EVIDENCE IN ANY PARTICULAR JURISDICTION.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROOFDROP SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR
              USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              IN NO EVENT SHALL PROOFDROP&apos;S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM
              OR RELATED TO THE SERVICE EXCEED THE AMOUNTS YOU PAID TO PROOFDROP IN THE
              TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED US DOLLARS ($100),
              WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless ProofDrop and its officers, directors,
              employees, and agents from any claims, damages, losses, and expenses (including reasonable
              legal fees) arising from: (a) your use of the Service; (b) your violation of these Terms;
              (c) your violation of any third-party rights; or (d) any AIVS bundles you submit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account at any time for violation of these Terms,
              fraudulent use of the Service, or at our discretion with reasonable notice.
              Upon termination, your right to use the Service ceases immediately.
              Sections 6, 8, 9, 10, and 12 survive termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Governing Law and Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, United States,
              without regard to conflict of law principles.
              Any dispute arising from these Terms or your use of the Service shall be resolved by
              binding arbitration under the rules of the American Arbitration Association,
              conducted in English in Wilmington, Delaware.
              You waive any right to a jury trial or to participate in a class action.
              Notwithstanding the foregoing, either party may seek injunctive relief in court
              to prevent irreparable harm.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these Terms at any time. We will provide at least 14 days&apos; notice
              for material changes by posting the updated Terms on this page and sending an email
              to your registered address. Continued use of the Service after the effective date
              of changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">14. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>
            </p>
          </section>

        </div>
      </main>
      <SiteFooter />
    </>
  )
}
