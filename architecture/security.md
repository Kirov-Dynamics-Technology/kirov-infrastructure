# Security Architecture

Trust chain, authentication, authorization, and secret handling for every Kirov
application. The layout of a single request:

```
Client
  → HTTPS (TLS)
  → Cloudflare (CDN, WAF, DDoS, DNS)
  → Cloudflare Worker (edge)
  → Authentication (verify session)
  → Authorization (organization → role → permission)
  → Service / Business logic
  → Repository → D1 (or configured storage)
```

**Rule: the frontend never receives database credentials.** Frontends talk only to the
Kirov API. Secrets live in Workers secrets / platform environment variables and are
never in Git.

## Authentication model (one conceptual model, not one per app)

```
User
 ├── account
 ├── organization
 └── role
```

- A **User** authenticates (email/password, OAuth, magic link).
- A user belongs to an **organization** (multi-tenant boundary).
- A user has exactly one **role** per organization.

Standard roles:

```
OWNER      all
ADMIN      users, bookings, drivers, reports
MANAGER    operations within scope
STAFF      day-to-day ops
DISPATCHER bookings, drivers, routes        (logistics)
DRIVER     assigned deliveries, POD         (logistics)
CUSTOMER   own bookings, own documents
```

Role checking is always performed **server-side**. Never trust role claims sent from
the browser (`isAdmin = true`) — they must be recomputed from the session on the server.

### Kirov Logistics RBAC example

| Role | Scope |
| --- | --- |
| OWNER | everything |
| ADMIN | users, bookings, drivers, reports |
| DISPATCHER | bookings, drivers, routes |
| DRIVER | assigned deliveries, proof of delivery |
| CUSTOMER | own bookings, own documents |

## Authorization checks (the full chain)

```
authenticated user
  → organization membership
  → role
  → permission
  → operation
```

Each step fails closed: no session → 401; no org → 403; wrong role → 403; operation
not permitted → 403. Log each denial with a request ID.

## Authentication layer options

- Application auth layer (email/password + sessions in D1) + Supabase/D1 per project.
- Never roll your own crypto. Use established libraries (Workers: `@hono/auth-js`,
  jose for signed tokens; Supabase Auth if the project uses Supabase).
- Session tokens: short-lived JWT (or opaque session IDs in D1) + refresh strategy.
  Store session hashes, not raw tokens.

## Secrets handling

- **Never commit** secrets, keys, tokens, or `.env` files.
- Repo contains `.env.example` only (names + placeholder, no values).
- Local development: `.env.local` / `.dev.vars` (git-ignored).
- Deployment: Cloudflare Worker secrets, Pages environment variables, or the platform
  secret store — `wrangler secret put`.
- Key rotation is a documented, scheduled practice for anything that outlives a trial.

## Data minimization + POPIA

- Collect only what the product needs; delete what it no longer needs.
- South African applications must consider **POPIA** obligations at design time:
  purpose limitation, storage limitation, access control, breach response.
- Do not collect TOCTOU-style extras "just in case"; every field is justified.
- See `standards/usage-controls` references for retention/analytics boundaries.

## Logging & audit

- Every backend emits a structured request log: request ID, timestamp, endpoint,
  status, duration, error, user/organization ID (where appropriate).
- Business applications write an `audit_logs` row for mutating actions (who changed
  what, when). See `architecture/database.md`.
- Logs are retained briefly; audit records longer; customer documents on a
  business-defined schedule (see `architecture/deployment.md` retention section).

## Security checklist (per application)

1. HTTPS enforced; HSTS set; no mixed content.
2. Frontend has no DB credentials; API validates every input on the server.
3. Roles + permissions checked server-side for every protected route.
4. Kill-switches (`*_ENABLED=false`) respond with "feature temporarily unavailable",
   never a crash, never a cost.
5. Pricing computed server-side; frontend only renders the result.
6. Uploads scanned/restricted by type and size; private objects in R2 have signed, short
   TTL URLs only (no public bucket except the static site itself).
7. Audit log written for all mutating business actions.
8. Sensitive requests rate-limited; auth endpoints have brute-force protection.
9. Dependencies pinned and dependency-scan run in CI.
10. A documented breach response (who to tell, what to revoke, what to rotate).