-- Logistics module (module 2). Add after core.
-- Server computes prices; the frontend never supplies them.

CREATE TABLE IF NOT EXISTS customers (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  contact_email   TEXT,
  contact_phone   TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_customers_org ON customers(organization_id);

CREATE TABLE IF NOT EXISTS drivers (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id         TEXT REFERENCES users(id),
  name            TEXT NOT NULL,
  phone           TEXT,
  status          TEXT NOT NULL DEFAULT 'AVAILABLE',
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  plate           TEXT UNIQUE NOT NULL,
  vehicle_class   TEXT NOT NULL,     -- for pricing
  capacity_kg     INTEGER
);

CREATE TABLE IF NOT EXISTS quotes (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  booking_id      TEXT REFERENCES bookings(id),
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  distance_km     REAL,
  vehicle_class   TEXT,
  base_cents      INTEGER NOT NULL DEFAULT 0,
  distance_cents  INTEGER NOT NULL DEFAULT 0,
  vat_cents       INTEGER NOT NULL DEFAULT 0,
  total_cents     INTEGER NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'ZAR',
  status          TEXT NOT NULL DEFAULT 'PENDING',
  expires_at      TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id               TEXT PRIMARY KEY,
  organization_id  TEXT NOT NULL REFERENCES organizations(id),
  customer_id      TEXT REFERENCES customers(id),
  quote_id         TEXT REFERENCES quotes(id),
  driver_id        TEXT REFERENCES drivers(id),
  vehicle_id       TEXT REFERENCES vehicles(id),
  status           TEXT NOT NULL DEFAULT 'QUOTE_REQUESTED',
  origin           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  scheduled_pickup TEXT,
  price_cents      INTEGER,          -- set server-side only
  currency         TEXT NOT NULL DEFAULT 'ZAR',
  created_by       TEXT REFERENCES users(id),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_bookings_org   ON bookings(organization_id, status);
CREATE INDEX idx_bookings_driver ON bookings(driver_id, status);

CREATE TABLE IF NOT EXISTS deliveries (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  booking_id      TEXT NOT NULL REFERENCES bookings(id),
  driver_id       TEXT REFERENCES drivers(id),
  status          TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Status engine history (centralized, never invented by a frontend).
CREATE TABLE IF NOT EXISTS delivery_events (
  id              TEXT PRIMARY KEY,
  delivery_id     TEXT NOT NULL REFERENCES deliveries(id),
  status          TEXT NOT NULL,
  at              TEXT NOT NULL,
  lat             REAL,
  lng             REAL,
  note            TEXT,
  actor_user_id   TEXT REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX idx_dlv_events ON delivery_events(delivery_id, at);

CREATE TABLE IF NOT EXISTS routes (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  delivery_id     TEXT REFERENCES deliveries(id),
  waypoints_json  TEXT
);

-- Audit log (build from day one).
CREATE TABLE IF NOT EXISTS audit_logs (
  id              TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id         TEXT,
  action          TEXT NOT NULL,       -- e.g. 'booking.update'
  resource        TEXT,
  resource_id     TEXT,
  timestamp       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  metadata        TEXT                 -- JSON
);
CREATE INDEX idx_audit_org ON audit_logs(organization_id, timestamp);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);