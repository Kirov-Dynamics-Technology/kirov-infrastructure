# Observability & Logging

Classic, cheap, effective observability — no expensive monitoring platform required at
Kirov scale.

## Structured request log line

Backends log, per request:

```
REQ-9a72 POST /api/v1/bookings 201 182ms
ERR-8217 POST /api/v1/bookings 500 Database unavailable
```

Fields: request ID, timestamp, method, path, status, duration, error, and user/org ID
where appropriate.

## Health endpoints

Every backend exposes:

```
GET /health              → { "status": "ok" }
GET /health/dependencies → checks database, storage, queues, external services
```

Workers orchestration: `/health` answers quickly; `/health/dependencies` is what the
pipeline calls before routing traffic to a deploy.

## Usage & infrastructure dashboard

Track against free-tier allowances (see `architecture/usage-and-thresholds.md`):

```
Workers  Requests today  12,430   / 100,000
D1       Reads / writes  80,240 / 4,310
R2       Storage          1.8 GB
Queues   Operations        320
Email    Sent              184
AI       Requests           42
```

Knowing when an app approaches a limit **before** it becomes a problem is the goal.

## Where logs live (free)

- Worker logs in Cloudflare (free retention window) for the app+API.
- GitHub Actions logs for CI/CD.
- A lightweight `/api/v1/usage/summary` for org-level usage display.
- Email: trigger a warning at 80% of a quota/allowance (usage-and-thresholds).

## Testing & monitoring priorities

Automated tests before/with anything money- or permissions-related: auth, permissions,
booking creation, booking status transitions, pricing calculations, AI usage limits,
file permissions, payment webhooks (see `architecture/subscriptions-and-payments.md`).