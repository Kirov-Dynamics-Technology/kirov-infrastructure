# Migration Plans

How a working Kirov app moves between infrastructure without a rewrite. Travel light:
the code in GitHub is the constant; hot-swap the providers.

## 1. Website / Pages → new host

```
Cloudflare Pages   →   GitHub Pages / Netlify
```

Static React build is portable. Move the build output dir; redeploy. Zero app change.

## 2. API runtime

```
Cloudflare Worker → Fastify/Express container → VPS/Kubernetes
```

Interfaces (`IBookingRepository`, `IEventBus`, `IFileService`) isolate runtime. Rewrite
only the adapter.

## 3. Database

```
D1 → PostgreSQL
```

Schema is SQL; migrate with a tool (e.g. `pgloader`/`d1-export` + `prisma`). Swap the
repository adapter. Business logic untouched. Escape hatch documented in `e/questions`.

## 4. Storage

```
R2 → S3-compatible storage
```

R2 is S3-compatible; `FileService` behind interface. Update endpoint + bucket + creds.

## 5. Email

```
Resend → SES/SendGrid/Postmark
```

`EmailService.send()` keeps callers stable; swap the adapter behind `EMAIL_PROVIDER`.

## 6. Analytics

```
Umami self-hosted on Railway → Umami self-hosted on Cloudflare (or Umami Cloud)
```

This is the immediate, in-progress move for the kirov-dynamics site (Phase: Analytics,
see `docs/tracking-and-analytics.md`).
- Remove the unwanted Railway deployment (project `umami-analytics` — no deployments
  started; no billing, tear down when convenient).
- Self-host Umami on Cloudflare Workers/R2/D1/Queues, *or* use Umami Cloud Hobby
  (100k events/mo free) and point the snippet at it.
- Snippet gains `data-host-url` + `data-website-id`; fire the Umami event from the site.

## 7. Whole platform

Portable everything → nothing is coupled to Cloudflare. Each provider has an exit;
migrations are documented per provider above.

### Immediate migration checklist (kirov-dynamics)

- [ ] Self-host Umami on Cloudflare, or activate Umami Cloud Hobby and bind the site.
- [ ] Point `data-host-url`/`data-website-id` snippet on all 11 pages to the real
      instance (see tracking-and-analytics.md).
- [ ] Remove Railway experimental `umami-analytics` project (no bill; dormant).
- [ ] Add `.env.example` + `wrangler.toml.example` to kirov-infrastructure (done here).
- [ ] Wire `data-domains` binding when the site goes live on its custom domain.