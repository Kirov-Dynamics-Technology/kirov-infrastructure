# Deployment Architecture

The single-push pipeline and environment discipline.

## Pipeline

```
Developer
  git push
    → GitHub (source of truth)
    → GitHub Actions CI
         lint → typecheck → tests → build
    → Cloudflare
         Pages (web) · Worker (API) · D1 migrations
```

No FTP, no manual copying of builds, no "where did I deploy this?". Deploys are
reproducible from Git history.

## Migrations

- Schema lives in `database/migrations/` with sequential files.
- Migrations run as a pre-deploy (or first step of the release) step, before the
  worker serves traffic.
- Destructive migrations are blocked in production unless explicitly gated.

## Environment variables

- `.env.example` committed (names + placeholders).
- Real values: locally in `.env.local` / `.dev.vars`; in production as Worker secrets /
  Pages env vars.
- Never commit real keys. See `architecture/security.md`.

## Health & observation loops

- `GET /health` on every backend (status ok/dependencies).
- After each deploy: health check, error-rate watch, then feature-flag rollout if
  large change.

## Environment separation recap

| | Development | Production |
| --- | --- | --- |
| Host | localhost | Cloudflare |
| Database | D1 local / scratch | production D1 |
| Data | test data | real customer data |
| Email | test (sandbox) | real delivery |
| Secrets | `.dev.vars` | Worker secrets |

Dev never points at the production DB.