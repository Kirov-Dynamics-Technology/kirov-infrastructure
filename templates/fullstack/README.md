This is a monorepo template for a Kirov full-stack application (web + mobile + Worker API
+ D1 database). Copy this directory into a new product repo, then:

```bash
cp -r kirov-infrastructure/templates/fullstack ../kirov-logistics
cd ../kirov-logistics
npm install
cp .env.example .dev.vars.local    # fill real values locally
wrangler d1 execute migrate --local --file=database/migrations/0001  # local schema
```

## Layout

```
apps/
├── web/              # React + Vite + Tailwind (customer/admin)
└── mobile/           # Expo (driver)
worker/
├── src/              # Worker API: routes/, services/, middleware/, repositories/, index.ts
└── wrangler.toml
database/
├── migrations/       # SQL files, run in order
└── seed/
packages/
├── ui/               # @kirov/ui reusable components
└── types/            # @kirov/types shared types
tests/
.env.example
package.json
wrangler.toml.example
README.md
```

## Conventions baked in

- `/api/v1/` routes (auth, users, organizations, customers, bookings, drivers, vehicles,
  documents, analytics, ai)
- standard response envelope `{ success, data, error }`
- middleware chain: auth → rbac → feature-flag → kill-switch → quota
- repositories behind interfaces (D1 today, PostgreSQL later)
- `@kirov/*` workspace packages
- D1 multi-tenant schema (see `database/migrations/`)
- health endpoints `/health` + `/health/dependencies`

## Env contract

See `.env.example` for the exact variable names. Never commit real values.

## Deploy

```
git push → GitHub Actions lint/typecheck/test/build → Cloudflare (Pages + Worker + D1 migrations)
```

See `../../architecture/deployment.md` and the KIROV-STANDARD.md header (copy from
`standards/repository-standard.md`).