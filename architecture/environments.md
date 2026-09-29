# Environments & Deployment

## Environment separation

```
                  KIROV
                    │
      ┌─────────────┴─────────────┐
      │                           │
 DEVELOPMENT                 PRODUCTION
      │                           │
 local machine                 Cloudflare
      │                           │
 test database                 production DB
    (D1 local)                     │
 test data                   real customer data
 test email                   real email
                                kirow domain
```

- **Development** runs locally. D1 has a local mode (`wrangler dev --local` or
  `d1 execute --local`). Etched data: test data, test email, nobody real.
- **Production** runs on Cloudflare. Separate D1 binding, real data, real email,
  backups.
- Never point a dev environment at the production database. Accidents (a destructive
  migration, a test wipe) are contained by the split.
- Environments get different variables, never shared secrets.

## Environment variable discipline

- `.env.example` is committed (names + placeholders only).
- Real values live in `.env.local` / `.dev.vars` locally (git-ignored) and in the
  platform secret store in production.
- Never commit `.env`, secrets, or real provider keys.

## The deployment pipeline (one push, no FTP)

```
Developer
  → git push
  → GitHub
  → GitHub Actions (CI)
       ├── lint
       ├── typecheck
       ├── tests
       └── build
  → Cloudflare
       ├── Pages (web)
       ├── Worker (API)
       └── D1 migrations (must run before/with deploy)
```

- No manual builds, no FTP, no "which server did I deploy to?".
- Migrations run as part of the release (pre-deploy step), never manually out of band.

## Feature flags & kill switches (see `standards/feature-flags.md`)

Deploy unfinished functionality disabled:

```
FEATURE_AI_ASSISTANT=true
FEATURE_LIVE_TRACKING=false
FEATURE_PAYMENTS=false
FEATURE_DRIVER_APP=true
```

Example: Kirov Logistics ships with Booking/Dispatch/Tracking ON, AI Assistant and
Payments OFF — without rebuilding the app to enable new things later.

Kill switches on every potentially-paid API:

```
AI_ENABLED=false
MAPS_ENABLED=false
SMS_ENABLED=false
```

When a provider starts costing money unexpectedly, turn it off. The app returns
"This feature is temporarily unavailable." gracefully — no crash, no ongoing cost.

## Health endpoints

Every backend exposes:

```
GET /health              → { "status": "ok" }
GET /health/dependencies → checks database, storage, queue, external services
```

These make deploys and troubleshooting trivial.

## Observability (see `architecture/observability.md`)

Structured logs per request: request ID, timestamp, endpoint, status, duration, error,
user/org ID. Example: `REQ-9a72 POST /api/v1/bookings 201 182ms`.
Errors: `ERR-8217 POST /api/v1/bookings 500 Database unavailable`.

## Rollout pattern

- Deploy to production only after CI + tests pass.
- Feature-flagged rollouts for larger changes (`FEATURE_*` toggles).
- Monitor `/health` and error rate after each deploy.
- Have a documented way to disable a feature flag / kill switch quickly (see kill
  switch, above).