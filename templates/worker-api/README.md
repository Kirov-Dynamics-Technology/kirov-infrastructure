# Worker API template (Kirov backend)

```
worker/
├── src/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── repositories/
│   ├── api/
│   └── index.ts
└── wrangler.toml
```

## Contract (all products)

- Routes: `/api/v1/*` (auth, users, organizations, customers, bookings, drivers,
  vehicles, documents, analytics, ai).
- Response envelope: `{ success, data, error: {code, message} }`.
- Middleware chain: auth → rbac → feature-flag → kill-switch → quota.
- Repository interfaces (D1 now, PostgreSQL later).
- Timed: log request id/status/duration; `/health` + `/health/dependencies`.

## Server pricing rule

Never trust pricing from the client. Example:

```
Frontend sends origin, destination, vehicle_class (NOT a price)
Worker computes: base + distance + VAT → price stored server-side
```

Tests must cover: `R100 quote + VAT + distance + vehicle = correct final amount`.

## Secrets

- `wrangler.toml` committed with bindings; ids go in secrets / `.dev.vars.local`.
- Never commit `RESEND_API_KEY`, `AI_API_KEY`, etc.

## Deploy

```
wrangler deploy            # api
wrangler d1 migrations apply DB --remote   # schema on prod
```

Production DB is separate (`environments.md`). CI runs lint/typecheck/tests before
deploy (see `architecture/deployment.md`).