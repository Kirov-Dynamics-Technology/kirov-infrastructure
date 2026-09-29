-- Kirov core schema (module 1) — multi-tenant foundation.
-- Run in order inside database/migrations/. SQLite dialect (D1).

CREATE TABLE IF NOT EXISTS organizations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',   -- free | business | enterprise
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- One row per (user, organization) with a role.
CREATE TABLE IF NOT EXISTS organization_members (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  role            TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MANAGER','STAFF','DISPATCHER','DRIVER','CUSTOMER')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS roles (
  id   TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);
-- Conventional roles seeded for reference (permissions can extend later).
INSERT OR IGNORE INTO roles (id, name) VALUES
  ('r-owner','OWNER'), ('r-admin','ADMIN'), ('r-manager','MANAGER'),
  ('r-staff','STAFF'), ('r-dispatcher','DISPATCHER'), ('r-driver','DRIVER'),
  ('r-customer','CUSTOMER');

CREATE TABLE IF NOT EXISTS permissions (
  id   TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       TEXT NOT NULL REFERENCES roles(id),
  permission_id TEXT NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

-- Sessions: store a hash of the token, never the raw token.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT UNIQUE NOT NULL,
  expires_at  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON organization_members(organization_id);