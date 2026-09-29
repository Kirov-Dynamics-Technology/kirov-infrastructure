# Kirov Infrastructure

The operating standard for every Kirov application: **build for R0 first**.

This repository is the technical rulebook. It documents the free-first architecture, the
allowed Cloudflare + GitHub stack, the security posture, the database design, the
environment separation, the usage controls, and the decision rules that decide when a
service may start costing money.

Not a landing page - a reference. New Kirov repositories should import the standard
(`standards/repository-standard.md`) instead of reinventing infrastructure each time.

---

## KIROV INFRASTRUCTURE PRINCIPLE

> Build for R0 first.
>
> Use free infrastructure while validating the product.
>
> Never introduce a paid dependency merely because it is convenient.
>
> Every external service must have:
> - a documented limit
> - a usage control
> - a replacement strategy
> - a shutdown strategy
>
> When an application generates enough value to justify paid infrastructure,
> upgrade that application deliberately.
>
> Never let infrastructure become the reason Kirov cannot continue operating.

---

## The Free-First Engineering Standard (the 10 rules)

1. **Free-first infrastructure** - default to free tiers; pay only for validated value.
2. **No uncontrolled billing** - every billable path has a limit, a kill switch, and a warning threshold.
3. **No hard dependency on a single provider** - every external service is replaceable (escape hatch documented).
4. **Secrets never committed to Git** - `.env.local`/deployment env only; repos carry `.env.example`.
5. **Database access only through backend APIs** - the frontend never receives DB credentials.
6. **Every external service must be replaceable** - provider abstraction (`*_PROVIDER`), not provider scattering.
7. **AI usage must have limits** - per-plan quotas, per-organization usage ledger, hard stop at 100%.
8. **Backups for important data** - D1 scheduled exports, encrypted backup, GitHub history for source.
9. **Production and development environments separated** - dev on localhost, prod on Cloudflare.
10. **Paid infrastructure only when justified by actual usage/revenue** - the paid-gate (5 conditions).

Full wording and rationale: `standards/repository-standard.md` (also ships as the header
of every new Kirov repository).

---

## Repository map

| Path | Purpose |
| --- | --- |
| `standards/repository-standard.md` | The 10-rule header to paste into every new repo |
| `standards/feature-flags.md` | Feature-flag + kill-switch conventions (`FEATURE_*`, `*_ENABLED`) |
| `standards/escape-hatches.md` | Migration paths (D1→PostgreSQL, Worker→container, R2→S3, Resend→other) |
| `standards/shared-packages.md` | `@kirov/*` package plan and multi-repo org layout |
| `architecture/overview.md` | The three infrastructure tiers + baseline stack |
| `architecture/environments.md` | Dev/Prod separation (localhost vs Cloudflare) |
| `architecture/security.md` | Trust chain, auth, authorization, secret handling |
| `architecture/database.md` | Multi-tenant modular schema design + usage ledger |
| `architecture/usage-and-thresholds.md` | Usage dashboard + soft/hard thresholds + quotas |
| `architecture/subscriptions-and-payments.md` | SaaS tiers, payment abstraction, SA payment path |
| `architecture/tech-map.md` | Project-type → default architecture decision table |
| `architecture/deployment.md` | The `git push` → GitHub Actions → Cloudflare pipeline |
| `cloudflare/workers/` | Worker structure, routing, middleware, provider abstraction |
| `cloudflare/d1/` | D1 schema SQL, migrations, backups (`schema.sql`) |
| `cloudflare/r2/` | Object storage buckets, upload patterns, retention |
| `cloudflare/queues/` | Consumer queues, retries, dead letter handling |
| `templates/` | Skeleton projects (react-vite, expo, worker-api, fullstack) |
| `docs/free-tier-limits.md` | Verified 2026 free allowances across the stack |
| `docs/tracking-and-analytics.md` | Umami analytics activation + site event wiring |
| `tools/umami-report/` | Zero-dependency Umami growth report (trends, pages, referrers, funnel) |
| `examples/` | Small worked examples (usage enforcement, kill switch) |

---

## Default stack (new projects)

| Concern | Choice |
| --- | --- |
| Web | React + Vite + TypeScript + Tailwind |
| Mobile | Expo + React Native + TypeScript |
| API | Cloudflare Worker + TypeScript |
| Database | Cloudflare D1 (SQLite) |
| Files | Cloudflare R2 |
| Background jobs | Cloudflare Queues |
| Authentication | Application auth layer + D1/Supabase (per project) |
| Analytics | Umami (cookieless) |
| Email | Resend |
| AI | Provider abstraction (never hard-coded) |
| Source control | GitHub |
| CI/CD | GitHub Actions |
| Hosting | Cloudflare |

**One deliberate exception:** Python workloads (AI/ML/data analytics/document processing)
stay on Python + FastAPI + PostgreSQL. Workers are not a replacement for those.

Decision table for project → architecture: `architecture/tech-map.md`.

---

## The paid-gate (when can something cost money?)

A paid dependency may be introduced **only if all five** conditions hold:

1. Real users exist (not beta guests).
2. Workload is known (you can see it in the usage dashboard).
3. Free limits are genuinely insufficient (documented, not guessed).
4. There is a specific benefit to paying (not "it's easier").
5. Actual revenue justifies the cost.

Otherwise the default answer is: **stay on free.**

---

## Quick start

```bash
# New Kirov app from the shared template
cp -r templates/fullstack ../kirov-app
# Copy the standard into the new repo
cp standards/repository-standard.md ../kirov-app/KIROV-STANDARD.md
# Wire the environment contract
cp .env.example ../kirov-app/.env.example
```

See `docs/free-tier-limits.md` for today's numbers and `templates/fullstack/README.md`
for the folder layout.