# Escape Hatches (migration paths)

Every provider/service has a documented replacement strategy so Kirov is never trapped
by one platform.

## Database

```
Cloudflare D1
    ↓
PostgreSQL
```

Repository pattern: business logic calls `BookingRepository`, D1 and PostgreSQL are two
implementations. Replace the repo, keep the logic and APIs.

## Compute (Worker)

```
Cloudflare Worker
    ↓
Container
    ↓
Kubernetes
```

APIs are framework-agnostic (a Worker-style handler can map onto Node/Fastify/Express
behind a compatibility layer).

## Object storage

```
Cloudflare R2
    ↓
S3-compatible storage
```

R2 is S3-compatible today. Abstraction: `FileService` (upload/download/signed-URL)
with R2 and S3 backends. Clients talk to `FileService`, not to R2 directly.

## Email

```
Resend
    ↓
another email provider (e.g. SES/SendGrid/Postmark)
```

Abstraction: `EmailService.send()`. Provider chosen by `EMAIL_PROVIDER`.

## AI

```
Provider A (e.g. OpenAI/Anthropic)
    ↓
Provider B
    ↓
Self-hosted model
```

Abstraction: `AiService` + `AI_MODEL`/`AI_PROVIDER`. Always behind kill switch and quota.

## Analytics

```
Umami (self-hosted)
    ↓
Umami Cloud / another cookieless analytics
```

Umami is itself a portable app; point the snippet at whichever install you run.

## Payments

```
South African gateway A
    ↓
gateway B
```

`PaymentService` interface. See `architecture/subscriptions-and-payments.md`.

## Cloudflare (whole platform)

If the whole platform changes, the escape hatches still hold because:

- Application code lives in GitHub (portable).
- Storage/session/data sit behind repository interfaces.
- Migrations are explicit SQL files.
- Every external service has a `*_PROVIDER` abstraction.

## Rule

Every new external dependency must get an escape-hatch note added here the day it is
introduced. If you can't write a migration path, you can't add the dependency.