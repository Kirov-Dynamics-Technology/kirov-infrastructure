# Cloudflare R2

## Facts (verified 2026)

| Item | Workers Free |
| --- | --- |
| Storage | 10 GB-month |
| Class A operations | 1,000,000 / month |
| Class B operations | 10,000,000 / month |
| Egress | Free (no egress fees) |

## Design guidance

- R2 is **S3-compatible**, which is the natural escape hatch (R2 → any S3-compatible store).
- Objects are accessed via the API/Worker — never expose bare bucket URLs for private
  data; use short-TTL signed URLs.
- Public assets (static site files) can be served from Pages directly; R2 holds
  user/business files (proofs, documents, uploads).

## Usage patterns

- Proof of delivery files, invoices, uploaded documents, CSV exports.
- Lifecycle/retention: object versioning and lifecycle rules to delete stale data
  (`architecture/database.md` retention policies).
- `FileService` abstraction: upload/download/signed-URL, with R2 and S3 backends.

## Env keys

```
R2_ACCOUNT_ID / bucket binding via wrangler.toml
# see ../.env.example and worker/wrangler.toml.example
```