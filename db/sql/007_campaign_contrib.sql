-- 007_campaign_contrib.sql
-- Phase 2: Contributions schema (contributors + contributions + indexes)
-- NOTE: Keep this file deterministic. If you need to rerun, do so on a clean DB or wrap in migrations tooling.

BEGIN;

-- Contributors (optional canonical table)
CREATE TABLE IF NOT EXISTS campaign_contributor (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- If you have a contacts table, you can map this later
  contact_id         UUID NULL,

  first_name         TEXT NULL,
  last_name          TEXT NULL,
  organization_name  TEXT NULL,

  email              TEXT NULL,
  phone              TEXT NULL,

  address1           TEXT NULL,
  address2           TEXT NULL,
  city               TEXT NULL,
  state              TEXT NULL,
  zip                TEXT NULL,

  employer           TEXT NULL,
  occupation         TEXT NULL,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_contributor_contact_id
  ON campaign_contributor(contact_id);

CREATE INDEX IF NOT EXISTS idx_campaign_contributor_name
  ON campaign_contributor(last_name, first_name);

-- Contributions
CREATE TABLE IF NOT EXISTS campaign_contribution (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- external id used for SOS export + dedupe
  external_contribution_id  TEXT NOT NULL UNIQUE,

  contributor_id        UUID NULL REFERENCES campaign_contributor(id) ON DELETE SET NULL,

  -- snapshot fields (keep even if contributor changes later)
  contributor_name      TEXT NULL,
  contributor_type      TEXT NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL | ORGANIZATION
  address1              TEXT NULL,
  address2              TEXT NULL,
  city                  TEXT NULL,
  state                 TEXT NULL,
  zip                   TEXT NULL,
  employer              TEXT NULL,
  occupation            TEXT NULL,

  amount_cents          INTEGER NOT NULL CHECK (amount_cents >= 0),
  received_at           DATE NOT NULL,

  payment_method        TEXT NOT NULL DEFAULT 'UNKNOWN', -- CASH | CHECK | CARD | INKIND | OTHER | UNKNOWN
  check_number          TEXT NULL,
  in_kind_description   TEXT NULL,

  memo                  TEXT NULL,

  -- compliance flags
  is_refund             BOOLEAN NOT NULL DEFAULT FALSE,
  is_in_kind            BOOLEAN NOT NULL DEFAULT FALSE,

  -- workflow
  status                TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT | READY | EXPORTED | ERROR
  validation_errors     JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_contribution_received_at
  ON campaign_contribution(received_at);

CREATE INDEX IF NOT EXISTS idx_campaign_contribution_status
  ON campaign_contribution(status);

CREATE INDEX IF NOT EXISTS idx_campaign_contribution_contributor_id
  ON campaign_contribution(contributor_id);

COMMIT;
