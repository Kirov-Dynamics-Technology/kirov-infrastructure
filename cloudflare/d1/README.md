# Cloudflare D1

## Facts (verified 2026)

| Item | Workers Free limit |
| --- | --- |
| Rows read / day | 5,000,000 |
| Rows written / day | 100,000 |
| Databases / account | 10 (Free), 50,000 (Paid) |
| Max DB size | 500 MB (Free), 10 GB (Paid) |
| Total storage / account | 5 GB (Free), 1 TB (Paid) |
| Queries per Worker invocation (read subrequests) | 50 |
| Time Travel (PITR) | 7 days (Free), 30 days (Paid) |
| Reset | daily 00:00 UTC |

Exceeding limits → API returns errors (soft-stop, **no billing**). Prototyping D1 is
free forever on the Workers Free plan.

## Design guidance

- Multi-tenant schema with `organizations` + `organization_id` on business tables
  (`architecture/database.md`).
- Module-based migrations in `database/migrations/`.
- Repositories behind interfaces so D1 → PostgreSQL is a drop-in swap
  (`standards/escape-hatches.md`).
- D1 scales to many small per-tenant/entity databases — a natural fit for
  per-organization data.

## Backups

- Scheduled export (cron or Queues consumer) → encrypted backup → separate storage
  (`architecture/disaster-recovery.md`).

## Env keys

```
DATABASE_URL / D1 binding via wrangler.toml
# see ../.env.example and worker/wrangler.toml.example
```