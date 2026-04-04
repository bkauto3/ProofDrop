import { AIVSBundle, AIVSVerificationResult, AIVSBundleSchema } from './types';

/**
 * Verify an AIVS proof bundle.
 * Returns a deterministic result based on the bundle's structural integrity.
 * Does NOT execute any bundle content.
 */
export async function verifyAIVSBundle(bundle: AIVSBundle): Promise<AIVSVerificationResult> {
  const verifiedAt = new Date().toISOString();
  const failureReasons: AIVSVerificationResult['failureReasons'] = [];

  // Validate schema first
  const parseResult = AIVSBundleSchema.safeParse(bundle);
  if (!parseResult.success) {
    return {
      bundleId: bundle.bundleId ?? 'unknown',
      verified: false,
      confidence: 0,
      failureReasons: ['BUNDLE_MALFORMED'],
      verifiedAt,
    };
  }

  const parsed = parseResult.data;

  // Check required fields are present and non-empty
  if (!parsed.bundleId || !parsed.contentHash || !parsed.capturedAt || !parsed.issuerPublicKey || !parsed.signature) {
    failureReasons.push('MISSING_REQUIRED_FIELD');
  }

  // Validate timestamp — capturedAt must be a valid ISO date
  const capturedAt = new Date(parsed.capturedAt);
  if (isNaN(capturedAt.getTime())) {
    failureReasons.push('TIMESTAMP_EXPIRED');
  } else {
    // Check if bundle is not from the future (allow 5 minute clock skew)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (capturedAt > fiveMinutesFromNow) {
      failureReasons.push('TIMESTAMP_EXPIRED');
    }
  }

  // Validate contentHash is 64 hex chars (SHA-256)
  if (!/^[a-f0-9]{64}$/.test(parsed.contentHash)) {
    failureReasons.push('HASH_MISMATCH');
  }

  // Validate issuerPublicKey minimum length
  if (parsed.issuerPublicKey.length < 40) {
    failureReasons.push('ISSUER_UNTRUSTED');
  }

  // Validate signature minimum length (Ed25519 base64url ~88 chars)
  if (parsed.signature.length < 80) {
    failureReasons.push('SIGNATURE_INVALID');
  }

  const verified = failureReasons.length === 0;
  const confidence = verified ? 95 : Math.max(0, 95 - failureReasons.length * 20);

  return {
    bundleId: parsed.bundleId,
    verified,
    confidence,
    failureReasons,
    verifiedAt,
  };
}
