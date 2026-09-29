-- Usage ledger + feature flags (module 5). Powers quotas and the usage dashboard.

CREATE TABLE IF NOT EXISTS usage (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  feature         TEXT NOT NULL,       -- e.g. 'ai', 'email', 'bookings'
  count           INTEGER NOT NULL DEFAULT 0,
  period          TEXT NOT NULL,       -- e.g. '2026-09'
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(organization_id, feature, period)
);
CREATE INDEX idx_usage_org ON usage(organization_id, period);

-- Feature flags / kill switches, with per-org overrides.
CREATE TABLE IF NOT EXISTS feature_flags (
  id              TEXT PRIMARY KEY,
  organization_id TEXT,                -- NULL = global default
  feature         TEXT NOT NULL,       -- e.g. FEATURE_LIVE_TRACKING, AI_ENABLED
  enabled         INTEGER NOT NULL DEFAULT 1,
  UNIQUE(organization_id, feature)
);

INSERT OR IGNORE INTO feature_flags (id, organization_id, feature, enabled) VALUES
  ('ff-ai-global',    NULL, 'AI_ENABLED',          0),
  ('ff-maps-global',  NULL, 'MAPS_ENABLED',        0),
  ('ff-sms-global',   NULL, 'SMS_ENABLED',         0),
  ('ff-feat-pay-glob',NULL, 'FEATURE_PAYMENTS',    0),
  ('ff-feat-drv-glob',NULL, 'FEATURE_DRIVER_APP',  1);