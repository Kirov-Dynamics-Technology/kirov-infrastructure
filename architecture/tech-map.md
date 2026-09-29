# Technology Map

## Decision table per project type

| Project type | Default architecture |
| --- | --- |
| Corporate website | React + Cloudflare Pages |
| Marketing site | React + Cloudflare Pages |
| Calculator | React only |
| Lead form | Pages + Worker |
| Small SaaS | React + Worker + D1 |
| Logistics MVP | React + Expo + Worker + D1 + R2 |
| Verification system | Expo + Worker + D1 |
| BusinessOS | React + Worker + D1 |
| AI application | React + API + external AI |
| Data application | React + FastAPI + PostgreSQL |
| ML application | React + Python/FastAPI |
| GPU application | Python + external compute |
| Large enterprise system | Architecture based on actual workload |

## Allowed vs not-by-default

**Allowed baseline:** GitHub (source+Actions), Cloudflare (Pages/Workers/D1/R2/Queues/DNS), Umami, Resend, provider-abstraction AI, D1/Supabase auth.

**Not by default:** Kubernetes, Kafka, microservices, always-on own VPS, dedicated Redis, GraphQL, service mesh, multi-repo sprawl, paid hosting just because it exists.

**Escalation is allowed** only through the paid-gate (`architecture/overview.md`) or a
documented workload requirement.

## Default repo layout (fullstack) — "the Kirov way"

```
kirov-app/
├── apps/
│   ├── web/                 # React + Vite
│   └── mobile/              # Expo
├── worker/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   └── wrangler.toml
├── database/
│   ├── migrations/
│   └── seed/
├── packages/
│   ├── ui/
│   ├── types/
│   └── config/
├── tests/
├── .env.example
├── package.json
└── README.md
```

Enough structure to scale; simple enough to not get in the way.

## Shared packages plan

`@kirov/ui`, `@kirov/auth`, `@kirov/database`, `@kirov/api`, `@kirov/config`,
`@kirov/analytics`, `@kirov/email` — published from the shared-package repos and reused
across product repos:

```
Kirov Logistics        Sumbandila
│  @kirov/ui              @kirov/ui
│  @kirov/auth             @kirov/auth
│  @kirov/analytics        @kirov/api
```

Improvements to shared code benefit every application. See
`standards/shared-packages.md`.

## Mobile architecture

`kirov-logistics-mobile/` follows the same API the web app uses (one backend):

```
Customer Web ──┐
Driver Mobile ─┼──→ Kirov API
Admin Web ─────┘
```

Expo layout: `app/{login,dashboard,jobs,tracking,profile}/`, plus `components/`,
`services/api/`, `hooks/`, `types/`, `utils/`. Offline support: local save of actions
(e.g. "Picked up" recorded with timestamp) then sync when connectivity returns.

## Frontend provider-independence

Rather than scattering `fetch("https://api.cloudflare...")`, the app has an API layer:

```
src/
├── api/
│   ├── client.ts     # fetch wrapper, base URL, auth header
│   ├── auth.ts
│   ├── bookings.ts
│   ├── drivers.ts
│   └── users.ts
```

UI calls `bookings.create()` and never knows the network provider.

## Observability & health (see also environments.md)

- Structured request logs (request ID, timestamp, endpoint, status, duration, error,
  user/org ID where appropriate).
- `GET /health` on every backend; optionally `/health/dependencies`.

## Migration path example (never trapped)

```
CURRENT          TARGET
D1 Repository    PostgreSQL Repository
Business Logic   Business Logic        ← unchanged
Frontend         Frontend              ← unchanged
```

See `standards/escape-hatches.md` for the full matrix.