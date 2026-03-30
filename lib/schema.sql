CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  "emailVerified" TIMESTAMPTZ,                     -- required by @auth/neon-adapter
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_verifications INTEGER NOT NULL DEFAULT 0, -- count of verifications in current calendar month
  verification_month TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM'), -- 'YYYY-MM' of current window
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proof_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_hash TEXT NOT NULL UNIQUE,
  raw_content JSONB NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'ERROR')),
  failure_reasons TEXT[],
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verifier_version TEXT NOT NULL DEFAULT '1.0.0'
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  bundle_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'ERROR')),
  summary JSONB,
  parties JSONB,
  timestamps JSONB,
  verifier_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(bundle_hash)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NextAuth Magic Link verification tokens.
-- NOTE: @auth/neon-adapter queries the table named "verification_token" (singular).
-- The "verification_tokens" (plural) table below is kept for reference but the
-- adapter uses the singular form created in the migration.
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Singular form used by @auth/neon-adapter
CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- OAuth account linking — required by @auth/neon-adapter
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE INDEX IF NOT EXISTS idx_receipts_bundle_hash ON receipts(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proof_bundles_bundle_hash ON proof_bundles(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_verification_results_bundle_hash ON verification_results(bundle_hash);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON subscriptions(stripe_subscription_id);

-- Migration: add monthly verification quota columns to existing databases.
-- Safe to run multiple times (ALTER COLUMN IF NOT EXISTS not available in older Postgres;
-- use DO block to guard against duplicate column errors).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'monthly_verifications'
  ) THEN
    ALTER TABLE users ADD COLUMN monthly_verifications INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'verification_month'
  ) THEN
    ALTER TABLE users ADD COLUMN verification_month TEXT NOT NULL DEFAULT TO_CHAR(NOW(), 'YYYY-MM');
  END IF;
END $$;

-- API Keys: developer API key management.
-- key_hash stores SHA-256 of the raw key; plaintext is never persisted.
-- key_prefix stores the first 8 chars for safe display (e.g. "pd_live_ab12").
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- user-given label e.g. "Production key"
  key_hash TEXT NOT NULL UNIQUE,               -- SHA-256 hash of the actual key (never store plaintext)
  key_prefix TEXT NOT NULL,                    -- first 8 chars of key for display e.g. "pd_live_ab12"
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,                      -- NULL = never expires
  revoked_at TIMESTAMPTZ,                      -- NULL = active
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);

-- Webhooks: outbound webhook endpoint configuration per user.
-- failure_count tracks consecutive delivery failures; disable endpoint at 5.
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,                        -- HMAC signing secret
  events TEXT[] NOT NULL DEFAULT '{"verification.created"}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  failure_count INTEGER NOT NULL DEFAULT 0,    -- consecutive failures; disable at 5
  last_triggered_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);
