# Shared Packages (@kirov/*) & Monorepo Layout

## The rule: one product, one repo — but share packages

Don't build a giant Kirov app containing every product. Use one repository per product
and share common packages.

```
GitHub Organization
├── kirov-dynamics
├── kirov-logistics
├── kirov-businessos
├── kirov-construction
├── kirov-fleet
├── kirov-secure
├── sumbandila
├── dinaledi
├── kirov-ui
├── kirov-api
├── kirov-infrastructure   ← this repo
└── kirov-docs
```

## Shared package set

```
@kirov/ui          – design system components (React)
@kirov/auth        – auth/session/RBAC helpers
@kirov/database    – D1 schema + repository interfaces
@kirov/api         – API response envelope, client, error codes
@kirov/config      – env-based config loader
@kirov/analytics   – Umami client wrapper
@kirov/email       – EmailService abstraction
```

Example consumers:

```
Kirov Logistics   → @kirov/ui, @kirov/auth, @kirov/analytics
Sumbandila        → @kirov/ui, @kirov/auth, @kirov/api
```

Improvements to shared components benefit multiple applications at once.

## Monorepo (per product) layout

A product monorepo with `apps/*` and `packages/*` using npm/pnpm/bun workspaces:

```
kirov-logistics/
├── apps/
│   ├── web/            # React (admin/customer)
│   └── mobile/         # Expo (driver)
├── worker/
│   └── src/            # Worker API
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

## Don't over-engineer today

No 20 microservices, no 15 repos for one product, no Kubernetes/Kafka/Redis/GraphQL/
service-mesh before users exist. Start with:

```
Frontend + API + Database
```

Introduce complexity only when a real requirement appears. Escape hatches exist for
when it does.

## Publishing

Packages can be local workspace references first; move to private registry / Git tags
only when multiple repos actually consume them. Rule: share when a second consumer
appears, not before.