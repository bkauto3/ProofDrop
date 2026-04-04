import { z } from "zod";

/**
 * AIVS — AI Verification Standard
 * Types for constructing and verifying AIVS proof bundles.
 */

export type AIVSFailureReason =
  | "MISSING_REQUIRED_FIELD"
  | "HASH_MISMATCH"
  | "SIGNATURE_INVALID"
  | "TIMESTAMP_EXPIRED"
  | "CRITERIA_NOT_MET"
  | "ISSUER_UNTRUSTED"
  | "BUNDLE_MALFORMED";

export interface AIVSBundle {
  bundleId: string;
  /** SHA-256 of the primary content being verified. */
  contentHash: string;
  /** ISO-8601 timestamp of capture. */
  capturedAt: string;
  /** Issuer public key (base64url Ed25519). */
  issuerPublicKey: string;
  /** Ed25519 signature over bundleId + contentHash + capturedAt. */
  signature: string;
  /** Arbitrary structured metadata. */
  metadata?: Record<string, unknown>;
  /** Optional VCAP criteria result attached to this bundle. */
  vcapResult?: unknown;
}

export interface AIVSVerificationResult {
  bundleId: string;
  verified: boolean;
  /** Confidence score 0-100. */
  confidence: number;
  failureReasons: AIVSFailureReason[];
  verifiedAt: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

export const AIVSBundleSchema = z.object({
  bundleId: z.string().min(1),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/, "Must be a 64-char hex SHA-256"),
  capturedAt: z.string().datetime(),
  issuerPublicKey: z.string().min(40),
  signature: z.string().min(80),
  metadata: z.record(z.unknown()).optional(),
  vcapResult: z.unknown().optional(),
});
