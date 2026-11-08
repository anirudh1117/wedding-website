CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'google_integration_status') THEN
    CREATE TYPE google_integration_status AS ENUM (
      'CONNECTED',
      'DISCONNECTED',
      'RECONNECT_REQUIRED',
      'INITIALIZATION_PENDING',
      'INITIALIZATION_FAILED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS google_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(32) NOT NULL DEFAULT 'google',
  google_email VARCHAR(255),
  google_sub VARCHAR(255),
  encrypted_refresh_token TEXT,
  encryption_nonce TEXT,
  encryption_tag TEXT,
  drive_root_folder_id TEXT,
  groom_folder_id TEXT,
  bride_folder_id TEXT,
  sangeet_folder_id TEXT,
  spreadsheet_id TEXT,
  status google_integration_status NOT NULL DEFAULT 'INITIALIZATION_PENDING',
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS google_integrations_provider_unique
  ON google_integrations (provider);

CREATE UNIQUE INDEX IF NOT EXISTS google_integrations_google_sub_unique
  ON google_integrations (google_sub)
  WHERE google_sub IS NOT NULL;
