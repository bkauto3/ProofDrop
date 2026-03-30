/**
 * Migration: create api_keys and webhooks tables in Neon
 * Run with: node scripts/migrate_api_keys_webhooks.mjs
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dotenv dependency needed)
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const API_KEYS_SQL = `
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const API_KEYS_IDX1 = `CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id);`;
const API_KEYS_IDX2 = `CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);`;

const WEBHOOKS_SQL = `
CREATE TABLE IF NOT EXISTS webhooks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{"verification.created"}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const WEBHOOKS_IDX1 = `CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id);`;

async function run() {
  console.log('Running migration against Neon...');

  try {
    await sql`CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      key_prefix TEXT NOT NULL,
      last_used_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    console.log('  api_keys table: OK');

    await sql`CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys(user_id)`;
    console.log('  api_keys_user_id_idx: OK');

    await sql`CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash)`;
    console.log('  api_keys_key_hash_idx: OK');

    await sql`CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      secret TEXT NOT NULL,
      events TEXT[] NOT NULL DEFAULT '{"verification.created"}',
      enabled BOOLEAN NOT NULL DEFAULT true,
      failure_count INTEGER NOT NULL DEFAULT 0,
      last_triggered_at TIMESTAMPTZ,
      last_failure_at TIMESTAMPTZ,
      last_failure_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    console.log('  webhooks table: OK');

    await sql`CREATE INDEX IF NOT EXISTS webhooks_user_id_idx ON webhooks(user_id)`;
    console.log('  webhooks_user_id_idx: OK');

    // Verify both tables exist
    const tableCheck = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('api_keys', 'webhooks')
      ORDER BY table_name
    `;

    const tableNames = tableCheck.map(r => r.table_name);
    const apiKeysCreated = tableNames.includes('api_keys');
    const webhooksCreated = tableNames.includes('webhooks');

    console.log('\nVerification:');
    console.log(`  api_keys exists: ${apiKeysCreated}`);
    console.log(`  webhooks exists: ${webhooksCreated}`);

    const result = {
      api_keys_created: apiKeysCreated,
      webhooks_created: webhooksCreated,
      schema_updated: false // will be set after schema.sql update
    };

    console.log('\nMigration complete.');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();
