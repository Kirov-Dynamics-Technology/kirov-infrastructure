# Cloudflare Queues

## Facts (verified 2026)

| Item | Workers Free |
| --- | --- |
| Operations / day | 10,000 |
| Retention | 24 hours (non-configurable on free) |
| Consumers | batch, retries, DLQ |

Free plan has a strict 24-hour retention — consumers must keep up. Cheap, useful for
background work; not for critical long-lived queues.

## Pattern: simple events (no Kafka required)

```
BookingCreated
DriverAssigned
DeliveryPickedUp
DeliveryDelivered
ProofUploaded
```

Producer pushes event → consumer fans out (send confirmation, update analytics, notify
dispatcher). Decoupled background work within free limits.

## Retries & DLQ

- Consumers can be configured with retry counts and a dead-letter queue bound to a
  second queue.
- Visibility: keeping the pipeline simple beats elaborate fan-out configs.

## Env keys

```
QUEUE_NAME / queue bindings via wrangler.toml
# see ../.env.example and worker/wrangler.toml.example
```

## When to graduate

When retention or throughput becomes a hard requirement, swap the transport behind an
`EventBus` interface (escape hatch: Queues → hosted queue/broker) without touching the
business logic.