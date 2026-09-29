# Architecture Overview

The Kirov foundation is a single company-wide rule applied to every application:
**build for R0 first, and stay capable of operating without a mandatory paid provider.**

## The three infrastructure tiers

```
TIER 1 - Free development          TIER 2 - Free production             TIER 3 - Revenue-funded
┌──────────────────────┐          ┌─────────────────────────────┐      ┌──────────────────────────┐
│ GitHub               │          │ GitHub  (source + Actions)  │      │ Everything from Tier 2,  │
│ Cloudflare plan       │          │ Cloudflare Pages           │      │ plus, deliberately:      │
│ localhost + D1 local  │          │ Cloudflare Workers         │      │ PostgreSQL               │
│ test data             │          │ Cloudflare D1              │      │ paid containers / VPS    │
│ test email            │          │ Cloudflare R2          │      │ AI / GPU compute     │
└──────────────────────┘          │ Cloudflare Queues          │      │ larger R2 / D1     │
                                  │ Umami (free)               │      └──────────────────────────┘
                                  │ Resend (free)              │
                                  └─────────────────────────────┘
                                          ▲
                                          │ only after the paid-gate passes
```

- **Tier 1** — everything a developer needs, all free, no card required.
- **Tier 2** — the default production posture for new products. Real data, backups,
  separation of environments, usage monitoring — all within free allowances.
- **Tier 3** — entered **per application** and only when the paid-gate conditions
  hold. Paid infrastructure is an upgrade decision, never a habit.

## Baseline stack (the default)

| Concern | Choice | Free tier reference |
| --- | --- | --- |
| Web | React + Vite + TypeScript + Tailwind | Cloudflare Pages |
| Mobile | Expo + React Native + TypeScript | Same API; no extra infra |
| API | Cloudflare Worker + TypeScript | Workers Free |
| Database | Cloudflare D1 (SQLite) | D1 Free |
| Files | Cloudflare R2 | R2 Free |
| Background jobs | Cloudflare Queues | Queues Free |
| Analytics | Umami (cookieless, self-hosted or managed) | Umami Cloud Hobby |
| Email | Resend | Resend Free |
| AI | Provider abstraction (`AI_PROVIDER`) | kill-switch + quotas |
| Auth | Application auth layer + D1/Supabase (per project) | — |
| CI/CD | GitHub Actions | 2,000 min/mo private; free on public |
| Hosting | Cloudflare (Pages/Workers/DNS) | — |

**Deliberate exception:** Python workloads (AI/ML, data analytics, CV, document
processing, complex backends) stay on **Python + FastAPI + PostgreSQL**. Cloudflare
Workers do not replace Python ecosystems. Those projects follow the
`architecture/tech-map.md` "Data application" and "ML application" rows.

## What is deliberately *not* in the default stack

Kubernetes, Kafka, service meshes, GraphQL, microservices, an always-on "own" VPS,
multi-region Redis, and 15-mono-repo sprawl. These are added only when a concrete
requirement appears and the workload justifies them — not by default.

## GitHub organization structure

One organization (`Kirov-Dynamics-Technology`), one repository per product, shared
packages as separate repos, and the two meta-repos below.

```
Kirov-Dynamics-Technology/
├── kirov-dynamics       # company website + lead gen
├── kirov-logistics      # logistics MVP
├── kirov-businessos     # modular business OS (gated on demand)
├── kirov-fleet          # fleet intelligence
├── kirov-construction   # construction intelligence
├── kirov-secure         # security suite
├── sumbandila           # verification engine (own data model)
├── dinaledi             # education platform
├── kirov-ui             # shared UI components
├── kirov-api            # shared API packages
├── kirov-infrastructure # this repo (single source of infra knowledge)
└── kirov-docs           # company-wide documentation
```

Not every repository must be public. Keep application code that is sensitive private;
share only what is safe to share.

## The paid-gate (the only way Tier 3 is entered)

A paid dependency may be introduced **only if all five** conditions hold:

1. **Real users** exist — not beta guests, not yourself.
2. **Workload is known** — observable in the usage dashboard.
3. **Free limits are genuinely insufficient** — documented with numbers, not guessed.
4. **A specific benefit** to paying exists — not "it is easier to buy".
5. **Actual revenue** justifies the cost.

The default answer to "should we pay for X?" is **no, stay on free** until those all pass.

## Disaster recovery / portability

Kirov is not dependent on a specific free tier staying free. The protection is the
architecture: portable code in GitHub, repository abstraction, database migrations,
and provider-independent services. See `architecture/disaster-recovery.md` and
`standards/escape-hatches.md`.

## Immediate Railway decision

Railway is **not** part of the long-term architecture. The migration:

```
CURRENT                  TARGET
Kirov                    Kirov
 └── Railway             └── Cloudflare Pages
      └── Umami               ├── Cloudflare Workers
                              └── Umami (self-hosted or Umami Cloud)
                    D1 / R2 / Queues added only where actually required
```

The dormant `umami-analytics` Railway project (no deployments, no billing) is treated
as an abandoned experiment and removed when convenient. Nothing is configured around it.