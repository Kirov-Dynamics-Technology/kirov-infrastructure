# Kirov Engineering Standard

> The header of every new Kirov repository. Paste verbatim at the top of the project
> README (or as `KIROV-STANDARD.md`). It is the rulebook, not a suggestion.

---

## KIROV INFRASTRUCTURE PRINCIPLE

Build for R0 first.

Use free infrastructure while validating the product.

Never introduce a paid dependency merely because it is convenient.

Every external service must have:
- a documented limit
- a usage control
- a replacement strategy
- a shutdown strategy

When an application generates enough value to justify paid infrastructure,
upgrade that application deliberately.

Never let infrastructure become the reason Kirov cannot continue operating.

The objective is not "permanently free" from any single provider. The objective is to
stay **permanently capable of operating without a mandatory paid provider**.

## Free-First Engineering Standard

1. **Free-first infrastructure** — Free tiers are the default. Pay only for validated
   value against the paid-gate conditions in `architecture/overview.md`.
2. **No uncontrolled billing** — Every path that can cost money has a documented limit,
   a kill switch, and a warning threshold. Cost is a failure mode to be engineered
   against, not an afterthought.
3. **No hard dependency on a single provider** — External services sit behind
   abstraction (`*_PROVIDER`). An escape hatch is documented for each one.
4. **Secrets never committed to Git** — `.env.local` and deployment environment
   variables only. Repositories ship `.env.example`, never real values.
5. **Database access only through backend APIs** — The frontend / client never receives
   DB credentials. All data access is via the service API.
6. **Every external service must be replaceable** — Email, storage, AI, maps, payments,
   analytics, database — each behind an interface with at least one documented
   alternative.
7. **AI usage must have limits** — Per-plan quotas, a per-organization usage ledger,
   a warning at `80%`, and a hard stop at `100%`. Expensive features get quotas.
8. **Backups for important data** — D1 scheduled exports (encrypted), R2 retention
   policy, and GitHub history for source code. Restore drills documented.
9. **Production and development environments separated** — Dev runs on localhost with
   local/test data; prod runs on Cloudflare with real data. No shared credentials.
10. **Paid infrastructure only when justified by actual usage/revenue** — The paid-gate:
    real users exist, workload is known, free limits are demonstrably insufficient, a
    specific benefit exists, and revenue justifies the cost.

## Commandments that never get relaxed

- The backend computes prices. The frontend displays them. Never trust the client.
- The backend verifies authentication, organization, role, permission, then operation.
  Never trust `isAdmin = true` sent from a browser.
- Data minimization: if a document isn't needed, don't collect it. Apply POPIA and
  privacy obligations to South African applications from day one, not as a final stage.
- Business logic is separate from infrastructure: repositories/interfaces over
  provider-specific code, so the storage layer can be replaced without a rewrite.

## Repository hygiene

- `.env.example` committed; `.env`, `.env.local`, secrets, keys never committed.
- `wrangler.toml` committed (names/ids can live in `.dev.vars`);
  secrets belong in dashboard or `wrangler secret put`.
- Standard folder layout, standard `/api/v1/` versioned routes, standard response
  envelope `{ success, data, error }`.
- Health endpoint `GET /health` (+ `/health/dependencies`) on every backend.
- Audit log from day one on business applications.