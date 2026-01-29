# If the drift file exists, rename it to the required plan filename
if (Test-Path "db/sql/009_travel.sql") {
  Rename-Item "db/sql/009_travel.sql" "009_campaign_travel.sql" -Force
}

# If for some reason it still doesn't exist, create it from scratch
if (-not (Test-Path "db/sql/009_campaign_travel.sql")) {
@'
-- 009_campaign_travel.sql
CREATE SCHEMA IF NOT EXISTS campaign;

CREATE TABLE IF NOT EXISTS campaign.travel_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  trip_date date NOT NULL,

  start_odometer numeric(12,2) NOT NULL,
  end_odometer numeric(12,2) NOT NULL,
  miles numeric(12,2) NOT NULL,
  rate_per_mile numeric(6,2) NOT NULL DEFAULT 0.70,
  amount numeric(12,2) NOT NULL,

  start_location text NOT NULL,
  end_location text NOT NULL,

  purpose text,
  notes text,

  status campaign.travel_status NOT NULL DEFAULT 'draft',

  committed_expense_id uuid,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_odometer_order CHECK (end_odometer >= start_odometer),
  CONSTRAINT chk_miles_nonneg CHECK (miles >= 0),
  CONSTRAINT chk_amount_nonneg CHECK (amount >= 0)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'tg_campaign_travel_trips_updated_at'
  ) THEN
    CREATE TRIGGER tg_campaign_travel_trips_updated_at
    BEFORE UPDATE ON campaign.travel_trips
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_campaign();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaign_travel_date ON campaign.travel_trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_campaign_travel_status ON campaign.travel_trips(status);
'@ | Set-Content -Encoding UTF8 "db/sql/009_campaign_travel.sql"
}
