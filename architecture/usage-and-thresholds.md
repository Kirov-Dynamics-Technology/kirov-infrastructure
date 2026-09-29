# Usage, Thresholds & Quotas

Protects the free-tier from being a money pit and gives every expensive feature a
bound.

## The internal usage dashboard

Eventually (even simply) present:

```
Kirov Infrastructure
──────────────────────────
Workers  Requests today       12,430   Free allowance  100,000
D1       Reads today          80,240   Writes today      4,310
R2       Storage               1.8 GB
Queues   Operations              320
Email    Sent                    184
AI       Requests                 42
```

The point is not sophistication — it is knowing when an application is approaching a
limit **before** it becomes a problem.

## Threshold bands

| Usage | State |
| --- | --- |
| < 50% | Normal |
| 50–75% | Monitor |
| 75–90% | Warning |
| > 90% | Restrict non-essential operations |

For AI specifically:

| Percentage of monthly allowance | Action |
| --- | --- |
| 80% | Warning |
| 100% | AI disabled |

## Quotas per feature (prevent free-plan abuse)

Expensive functionality always has a quota. Example — "upload a PDF and ask AI
questions":

| Plan | Limit |
| --- | --- |
| Free | 5 documents/month, 10 MB/document |
| Business | 100 documents/month |
| Enterprise | Custom |

The exact numbers may change. The invariant: **every potentially expensive feature has
a quota**, enforced server-side.

## The usage ledger

Drive quota checks from the `usage` table (`architecture/database.md`):

```
usage(id, organization_id, feature, count, period)
# organization_id=123, feature="ai", count=18, period="2026-09"
```

The API:
1. reads current count vs the plan's allowance for that feature,
2. refuses the operation if at/over the cap,
3. increments the ledger only after a successful call.

This makes AI, email, storage-heavy features safe to expose on free plans.

## Where enforcement lives

- In the Worker/backend — **not** in the frontend (never trust the client).
- Before every expensive operation: check quota → check kill switch → check feature
  flag → execute → record usage.
- Responses honor the API envelope so the UI can render
  "This feature is temporarily unavailable." / "Monthly limit reached."

## What to build first (feature-level)

1. `usage` ledger table + increment helper.
2. Per-plan allowances config (env examples above) — one central file.
3. Middleware that checks quota/kill-switch before guarded routes.
4. A simple dashboard endpoint `/api/v1/usage/summary` for the org.
5. Warning emails/logs at 80% and 100%.