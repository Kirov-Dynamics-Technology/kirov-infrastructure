# Free-Tier Limits (verified 2026)

Single source of truth for what the default Kirov stack gives you free, and the exact
limits. Check back seasonally — providers change these.

## Cloudflare Workers Free (verified Sep 2026)

| Item | Limit |
| --- | --- |
| Requests / day | 100,000 (across all Worker scripts) |
| CPU time / request | 10 ms |
| Memory / instance | 128 MB |
| Worker scripts / account | 100 |
| Cron triggers | 5 / account |
| Logs / day | 200,000 lines |
| Static asset files (Workers "Static Assets") | 20,000 / version, 25 MiB each |
| DV SSL / automatic HTTPS | included |
| WAF / rate limiting | basic |

## Cloudflare Pages Free (verified Sep 2026)

| Item | Limit |
| --- | --- |
| Builds / month | 500 (1 concurrent) |
| Files per site | 20,000 |
| Asset size | 25 MiB per file |
| Requests / bandwidth | unlimited |
| Custom domains | 500 |
| Headless (Functions) | Workers free limits apply |

Git push → auto build + deploy.

## Cloudflare D1 Free (database) — verified Sep 2026

| Item | Limit |
| --- | --- |
| Rows read / day | 5,000,000 (reset 00:00 UTC) |
| Rows written / day | 100,000 |
| Total storage / account | 5 GB |
| Databases / account | 10 (Free) |
| Max DB size | 500 MB (Free, SQLite) |
| Time Travel (PITR) | 7 days |
| Queries per Worker invocation (read subrequests) | 50 |
| Soft-stop on limits | yes — errors, not billing |

Structure for many small per-org/entity DBs; fits Logistics customers.

## Cloudflare R2 Free (object storage) — verified Sep 2026

| Item | Limit |
| --- | --- |
| Storage | 10 GB-month |
| Class A ops | 1,000,000 / month |
| Class B ops | 10,000,000 / month |
| Egress | Free (no egress fees) |

S3-compatible (escape hatch: any S3 store).

## Cloudflare Queues Free — verified Sep 2026

| Item | Limit |
| --- | --- |
| Operations / day | 10,000 |
| Retention | 24 hours (non-configurable on Free) |
| Consumers | yes (batch, retries, DLQ) |

## Cloudflare KV Free (if needed)

| Item | Limit |
| --- | --- |
| Reads / day | 100,000 |
| Writes / day | 1,000 |
| Storage | 1 GB |

## Resend Free — verified Sep 2026

| Item | Limit |
| --- | --- |
| Emails / month | 3,000 |
| Emails / day | 100 (hard cap, UTC day) |
| Domains | 1 (can add via Pro) |
| AI credits | 5 / month |

Escape hatch: SES/SendGrid/Postmark via `EmailService` abstraction.

## Umami Cloud Free (Hobby) — verified Sep 2026

| Item | Limit |
| --- | --- |
| Monthly cost | $0 |
| Events / month | 100,000 |
| Websites | 1 |
| Data retention | 6 months |
| Features | community support |
| Upgrade (Pro/Business) | 1M+ events, more websites, longer retention |

Self-hosted Umami on Cloudflare (Workers/R2/D1/Queues) is the escape hatch — cookie-less
analytics without relying on Umami Cloud.

## GitHub Free

| Item | Limit |
| --- | --- |
| Public/private repos | unlimited (3 collaborators on private) |
| Actions minutes | 2,000 / month (private); free on public repos |
| Pages hosting | 100 GB bandwidth / month, 1 GB site size |

## Balance sheet (typical Kirov app)

| Service | Monthly budget (free) |
| --- | --- |
| Pages + Workers + D1 + R2 + Queues | R0 |
| Umami Cloud Hobby | R0 |
| Resend | R0 |
| GitHub | R0 |
| **Total mandatory** | **R0/month** |

Anything above this is only ever entered through the paid-gate
(`architecture/overview.md`).