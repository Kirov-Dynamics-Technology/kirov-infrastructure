# Deployment & Disaster Recovery

## Deployment pipeline (the only path to production)

```
Developer
  → git push
  → GitHub
  → GitHub Actions (CI)
       ├── lint
       ├── typecheck
       ├── tests
       └── build
  → Cloudflare
       ├── Pages (web)
       ├── Worker (API)
       └── D1 migrations
```

- Migrations run as part of the release, before the new Worker becomes live.
- No manual FTP, no copying builds around, no guessing which server is live.
- A failed deploy rolls back to the previous deployment (GitHub + Cloudflare keep
  history).

## Environments

- **Development:** localhost, D1 local, test data, test email.
- **Production:** production domain, production D1, real data, real email.
- See `architecture/environments.md` — dev never touches the production database.

## Disaster recovery goals

> If Cloudflare disappeared tomorrow, your code must still exist in GitHub, your
> database must have backups, configuration must be documented, and infrastructure
> must be reproducible.

That is what portable architecture means.

## Backup plan

1. **Source code** — GitHub is the durable copy.
2. **Database (D1)** — scheduled export (cron/queued job) → encrypted backup → separate
   storage (e.g. R2 private bucket with retention, or a secondary provider).
3. **Files (R2)** — object versioning/retention where relevant; destructive ops
   protected by lifecycle rules.
4. **Configuration** — `.env.example`, `wrangler.toml`, provider setup, and this repo
   document the infrastructure so it can be rebuilt.
5. **Restore drills** — a documented, occasional "restore from backup into a scratch
   environment" exercise to prove recovery works.

## Failure scenarios & responses

| Scenario | Response |
| --- | --- |
| Worker crashes after deploy | Roll back to previous deployment; check `/health` |
| Database lost / corrupt | Restore from scheduled encrypted backup |
| Provider billing spike | Kill switches (`*_ENABLED=false`) cut spend instantly |
| Free-tier limit reached | Usage dashboard shows it before it bites (see usage-and-thresholds) |
| Whole platform outage | Portable code + escaping hatch (see `standards/escape-hatches.md`) |

## Escaping the free tier without a rewrite

Replace only the repository layer:

```
CURRENT                    TARGET
D1 Repository    →         PostgreSQL Repository
Business Logic   →         Business Logic   (unchanged)
Frontend         →         Frontend         (unchanged, provider-independent API client)
```

Full matrix in `standards/escape-hatches.md`.