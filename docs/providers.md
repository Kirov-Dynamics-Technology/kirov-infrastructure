# Providers Reference

Every provider Kirov uses, its role, free allowance, and escape hatch. Kept up to date
alongside `docs/free-tier-limits.md`.

| Area | Primary | Free allowance | Replacement |
| --- | --- | --- | --- |
| Web hosting | Cloudflare Pages | 500 builds/mo, unlimited bandwidth | GitHub Pages, Netlify, S3+CDN |
| API runtime | Cloudflare Workers | 100k req/day | Container/VPS (Fastify/Express), other edge platforms |
| Database | Cloudflare D1 | 5M reads/100k writes per day, 5GB | PostgreSQL (repository swap) |
| Object storage | Cloudflare R2 | 10GB, free egress | S3-compatible store |
| Background jobs | Cloudflare Queues | 10k ops/day, 24h retention | hosted broker (Kafka-lite), cron |
| Email | Resend | 3k emails/mo, 100/day | SES, SendGrid, Postmark |
| Analytics | Umami (self-host or Umami Cloud) | 100k events/mo (Hobby) or self-hosted | cookieless alt + GitHub/Grafana |
| Auth | App auth layer + D1/Supabase | within D1 / Supabase free | any OIDC provider |
| AI | Provider abstraction (`AI_PROVIDER`, `AI_MODEL`) | per provider / gated by quotas | OpenAI, Anthropic, Mistral, self-host |
| Maps | external map API (when needed) | gated by `MAPS_ENABLED` + quota | alternates behind MapService |
| DNS | Cloudflare DNS (free) | free, fast | any DNS provider |

## Rule

- Every external service has: a documented limit, a usage control, a replacement
  strategy, a shutdown strategy.
- Providers are selected by the `*_PROVIDER` env contract (`STANDARD.md`), so swapping
  never touches business logic.

## How providers are chosen

1. Free over paid (all else equal). 
2. Escape hatch exists and is cheap.
3. Usage controls built-in within the plan itself.
4. Data/egress costs low or free.
5. Only through the paid-gate when revenue justifies it.