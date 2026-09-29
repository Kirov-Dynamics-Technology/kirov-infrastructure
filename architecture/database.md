# Database Architecture

## Principles

1. **Multi-tenant by design**: `organizations` is the top tenant boundary; almost every
   business table carries `organization_id`.
2. **Modular schema**: Core / Logistics / Documents / Communication / Usage — a product
   imports only the modules it needs.
3. **Migration-first**: schema lives in `database/migrations/`. Never hand-edit a live DB.
4. **Status is centralized**: status engines are lookup constants + a status history
   table, never ad-hoc string fields invented per frontend.
5. **Repositories isolate storage**: business logic talks to `BookingRepository`, not
   D1 directly, so the storage layer can be replaced (D1 → PostgreSQL) without a rewrite.
6. **D1 is a thin-data, high-read engine**: default is Cloudflare D1 (SQLite). Rich
   transactional Python workloads stay on PostgreSQL (FastAPI exception).
7. **Data minimization + retention**: never store what isn't needed; delete on schedule.

## Module layout

```
kirov-app/database/
├── migrations/
│   ├── 0001_core.sql
│   ├── 0002_logistics.sql
│   ├── 0003_documents.sql
│   ├── 0004_communication.sql
│   ├── 0005_usage.sql
│   └── ...
└── seed/
    └── roles.sql
```

## Core schema (module 1)

```
users(id, email UNIQUE, password_hash, display_name, created_at, updated_at)
organizations(id, name, slug, plan, created_at, updated_at)
organization_members(id, organization_id, user_id, role, ...)
roles / permissions (seeded constants)
sessions(id, user_id, token_hash, expires_at, ...)
```

## Logistics schema (module 2)

```
customers(id, organization_id, ...)
drivers(id, organization_id, user_id?, ...)
vehicles(id, organization_id, ...)
bookings(id, organization_id, customer_id, driver_id?, status, origin, destination,
         scheduled_pickup, quoted_price_cents, currency, created_by, created_at, ...)
quotes(id, organization_id, booking_id?, from, to, distance_km?, vehicle_class,
       base_cents, distance_cents, vat_cents, total_cents, expires_at, ...)
deliveries(id, organization_id, booking_id, driver_id, status, ...)
delivery_events(id, delivery_id, status, at, lat?, lng?, note?, actor_user_id, ...)
routes(id, organization_id, delivery_id, waypoints_json, ...)
```

Pricing is **computed server-side** (see `architecture/security.md`); the frontend only
displays the result.

## Documents schema (module 3)

```
documents(id, organization_id, object_type, object_id, r2_key, mime, size_bytes,
          checksum, retention_until, ...)
proof_of_delivery(id, delivery_id, document_id, signed_at, signer, ...)
invoices(id, organization_id, booking_id, url_or_ref, status, ...)
```

## Communication schema (module 4)

```
notifications(id, organization_id, user_id, type, payload_json, read_at, ...)
messages(id, ...)   # logged messages between parties
email_events(id, organization_id, message_id?, to, subject, provider, provider_id,
             status, sent_at, ...)
```

## Audit log (build on day one)

```
audit_logs(id, organization_id, user_id, action, resource, resource_id, timestamp, metadata)
```

Answers: who changed this booking? who assigned this driver? who deleted this document?
when was status changed? **Required for business applications.**

## Kirov Logistics status engine (centralized)

Happy path:

```
QUOTE_REQUESTED
  → QUOTE_SENT
  → BOOKING_CONFIRMED
  → DRIVER_ASSIGNED
  → DRIVER_EN_ROUTE
  → PICKED_UP
  → IN_TRANSIT
  → DELIVERED
  → COMPLETED
```

Exceptional states: `CANCELLED`, `FAILED`, `RESCHEDULED`.

Use a single `delivery_status` reference table + `delivery_events` history. Frontends
read the reference table — they never invent statuses.

## Usage ledger (powers quotas & the dashboard)

```
usage(id, organization_id, feature, count, period)
```

e.g. `organization_id = 123, feature = "ai", count = 18, period = "2026-09"`.

The API checks this ledger **before** performing an expensive operation, and writes to
it after. This is what makes AI/email/expensive features safe to offer on free plans.

## Storage choice

| Workload | Default |
| --- | --- |
| Kirov SaaS CRUD + tenant data | Cloudflare D1 (SQLite, per-tenant-friendly, free) |
| Real analytics / reporting on large sets | D1 kept lean; export to analytics store |
| Python/AI/ML/data backends | PostgreSQL (FastAPI exception) |
| Files | Cloudflare R2 (object storage), not D1 |

D1 scales out across many small (≤10 GB / 500 MB on free) databases — perfect for
per-tenant or per-entity databases. When a product genuinely outgrows D1, the
repository abstraction lets a PostgreSQL repository replace the D1 repository while
business logic stays intact (see `standards/escape-hatches.md`).

## Retention & backups

- Temporary files: delete after X days.
- Application logs: retain a limited period.
- Audit records: longer retention.
- Customer documents: business-defined retention (e.g. POPIA-aligned).
- Backups: scheduled D1 export → encrypted backup → separate storage; Kafka isn't
  required — Cloudflare Queues can handle background/producer jobs within free limits.
- Restore drills are documented in `architecture/disaster-recovery.md`.